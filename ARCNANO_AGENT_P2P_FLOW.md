# ArcNano: Complete Autonomous Agent-to-Agent (A2A) Nanopayment Protocol Flow

This specification documents the complete end-to-end cryptographic and network flow for autonomous AI agents purchasing inference, MCP tools, and compute using **ArcNano** on **Arc Layer 1**.

---

## 🏗️ Architecture Overview & Parties Involved

| Actor | Role | Description |
| :--- | :--- | :--- |
| **Agent A (Buyer / Consumer)** | Autonomous LLM Agent / Swarm | Needs real-time tools or LLM context. Has no credit card, no KYC, and refuses to leak its identity or prompt graph on public blockchains. |
| **Agent B (Seller / Tool Provider)** | MCP Server / API Gateway / LLM Provider | Provides paid tools, datasets, or inference. Wants guaranteed sub-cent payment per call without waiting 15s for block confirmation. |
| **ArcNano API Gateway Middleware** | Fast Off-Chain Verifier | Integrated into Agent B’s endpoint. Validates Groth16 proofs in memory in `<8ms` against a local nullifier cache before streaming data. |
| **ArcNano Relayer Daemon** | Batch Settlement Buffer | High-throughput daemon that aggregates verified notes from multiple micro-agents and submits batch spend transactions to Arc L1. |
| **Arc Layer 1 + Circle Gas Station** | On-Chain Settlement Engine | Deterministic sub-500ms finality blockchain. Circle ERC-4337 Paymasters sponsor 100% of gas fees so agents pay **$0.00 in native tokens**. |

---

## 🔄 The 6-Step End-to-End Protocol Flow

```
┌───────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               DIRECT P2P COMMERCE (OFF-CHAIN, <100ms)                             │
│                                                                                                   │
│  [Agent A: Buyer]                   [Agent B: Tool Provider]              [ArcNano Relayer]       │
│         │                                      │                                  │               │
│         │ 1. Discovery & Capability Query      │                                  │               │
│         ├─────────────────────────────────────►│                                  │               │
│         │                                      │                                  │               │
│         │ 2. Tool Invocation (No credentials)  │                                  │               │
│         ├─────────────────────────────────────►│                                  │               │
│         │                                      │                                  │               │
│         │ 3. HTTP 402 Payment Required         │                                  │               │
│         │    (Invoice, Amount, Root, Recipient)│                                  │               │
│         │◄─────────────────────────────────────┤                                  │               │
│         │                                      │                                  │               │
│         │ [Generates Groth16 Proof in RAM]     │                                  │               │
│         │ (~74ms, Binds note to Agent B)       │                                  │               │
│         │                                      │                                  │               │
│         │ 4. Request + X402 Auth Header        │                                  │               │
│         ├─────────────────────────────────────►│                                  │               │
│         │                                      │── In-Memory Verification (<8ms)  │               │
│         │                                      │   (Local Redis / Nullifier Check)│               │
│         │ 5. Streams LLM tokens / Tool Output  │                                  │               │
│         │◄─────────────────────────────────────┤                                  │               │
│         │                                      │                                  │               │
│         │                                      │ 6. Asynchronous Webhook          │               │
│         │                                      │    (Submit Validated Proof)      │               │
│         │                                      ├─────────────────────────────────►│               │
│                                                                                   │               │
└───────────────────────────────────────────────────────────────────────────────────┼───────────────┘
                                                                                    │
┌───────────────────────────────────────────────────────────────────────────────────▼───────────────┐
│                           BATCH ON-CHAIN SETTLEMENT (ARC L1, $0.00 GAS)                           │
│                                                                                                   │
│  [ArcNano Relayer]                        [Arc Layer 1: ArcNanoPool]     [Circle Gas Station]     │
│         │                                             │                            │              │
│         │ 7. Buffers 10–50 notes from swarms          │                            │              │
│         │                                             │                            │              │
│         │ 8. Batch Spend Calldata Request             │                            │              │
│         ├────────────────────────────────────────────►│                            │              │
│         │                                             │ 9. Request Gas Sponsorship │              │
│         │                                             ├───────────────────────────►│              │
│         │                                             │◄───────────────────────────┤ (Sponsors)   │
│         │                                             │                                           │
│         │ 10. `batchSpend(proofs, nullifiers, recips)`│                                           │
│         │     - Verifies nullifiers not spent         │                                           │
│         │     - Transfers USDC to Agent B's payout    │                                           │
│         │     - Finalized in <500ms                   │                                           │
│         ▼                                             ▼                                           ▼
└───────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📝 Detailed Step-by-Step Breakdown

### Step 1: Discovery & MCP Capability Negotiation
- **What happens:** Agent A needs external capability (e.g. real-time market sentiment analysis or web browsing).
- Agent A discovers Agent B via an MCP Registry, Agent Protocol DNS, or direct endpoint.
- Agent A fetches Agent B’s tool manifest:
  ```http
  GET /mcp/v1/tools HTTP/1.1
  Host: agent-b.compute.net
  ```
- Agent B replies with its capabilities list and pricing metadata (`$0.001 USDC / query`).

---

### Step 2: Unauthenticated Tool Invocation
- **What happens:** Agent A calls the tool directly without prior API keys, credit cards, or user accounts:
  ```http
  POST /mcp/v1/execute HTTP/1.1
  Host: agent-b.compute.net
  Content-Type: application/json

  {
    "tool": "deep_sentiment_scan",
    "parameters": { "target": "BTC-USD", "depth": 5 }
  }
  ```

---

### Step 3: HTTP 402 "Payment Required" Challenge
- **What happens:** Agent B's ArcNano middleware rejects unauthenticated access with standard **HTTP 402 Payment Required**.
- The response headers contain the cryptographic challenge invoice:
  ```http
  HTTP/1.1 402 Payment Required
  WWW-Authenticate: X402-ArcNano realm="agent-b"
  X-Payment-Amount: 1000
  X-Payment-Asset: 0x0000000000000000000000000000000000000000
  X-Payment-Recipient: 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
  X-Payment-Merkle-Root: 0x19f2a87c53d100346f0490b4e0bf0a112ec7ff04f...
  X-Payment-ASP-Root: 0x24e0b5...
  X-Payment-Nonce: 8f9b231a-e8d1-4b47-97d8-fc9e8d4231b7
  ```
  - **Amount:** 1000 micro-USDC ($0.001).
  - **Recipient:** Agent B's settlement destination.
  - **Merkle Root:** Current Poseidon root of unspent notes on Arc.
  - **ASP Root:** Association Set Provider clean compliance root.
  - **Nonce:** Unique challenge identifier protecting against replay attacks.

---

### Step 4: Off-Chain Groth16 ZK-SNARK Proof Generation (~74ms)
- **What happens:** Agent A holds pre-deposited shielded note commitments in its local wallet storage.
- Agent A's embedded Circom witness generator and Groth16 prover execute locally in memory:
  - **Private Inputs:** Note secret, nullifier seed, Merkle membership path, ASP non-sanctioned clean path.
  - **Public Inputs:** `merkle_root`, `asp_root`, `nullifier_hash`, `recipient`, `nonce`.
- **The Core Privacy Guarantee:**
  - The spending agent **never broadcasts a transaction to an on-chain mempool**.
  - `msg.sender` identity correlation is mathematically impossible.
  - Competitors cannot reconstruct which tools or LLM APIs Agent A is calling.

---

### Step 5: Authenticated Query with X402 Payment Header
- **What happens:** Agent A resubmits the tool request with the generated proof attached in the `X-Payment-Authorization` header:
  ```http
  POST /mcp/v1/execute HTTP/1.1
  Host: agent-b.compute.net
  Content-Type: application/json
  X-Payment-Authorization: ArcNano-Groth16 \
    proof="0x12a4b9...", \
    nullifier="0x7f3e82...", \
    root="0x19f2a8...", \
    nonce="8f9b231a..."

  {
    "tool": "deep_sentiment_scan",
    "parameters": { "target": "BTC-USD", "depth": 5 }
  }
  ```

---

### Step 6: In-Memory Verification & Instant Streaming (<8ms)
- **What happens:** Agent B's middleware verifies the proof in RAM:
  1. Checks if `nullifier` was already spent in its local fast Redis cache (takes `<1ms`).
  2. Executes `FastGroth16Verifier.verifyProof(proof, publicInputs)` (takes `~6ms`).
  3. Temporarily reserves the nullifier to prevent double-spending during execution.
- **Immediate Streaming:**
  - Agent B returns **HTTP 200 OK** and begins streaming output tokens over Server-Sent Events (SSE) or WebSockets immediately.
  - **Latency added to inference: <8ms** (imperceptible to LLM streaming).

---

### Step 7: Asynchronous Relayer Dispatch (Zero Node Maintenance)
- **What happens:** Agent B does not want to manage private keys or submit transactions.
- As soon as the inference response finishes, Agent B sends the verified note to the **ArcNano Relayer**:
  ```http
  POST /v1/submit-proof HTTP/1.1
  Host: relayer.arcnano.xyz
  Authorization: Bearer <relayer-client-key>

  {
    "proof": "0x12a4b9...",
    "nullifier": "0x7f3e82...",
    "root": "0x19f2a8...",
    "recipient": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    "amount": 1000
  }
  ```

---

### Step 8: Batch On-Chain Settlement on Arc Layer 1 ($0.00 Gas)
- **What happens:**
  1. The Relayer queues notes from hundreds of concurrent agent calls into batches of 10 to 50 notes.
  2. When the batch threshold or timer expires (e.g. every 10 seconds or 20 notes), the Relayer packages the batch calldata.
  3. Relayer triggers **Circle Gas Station sponsorship** via ERC-4337 Paymaster.
  4. The Relayer calls `ArcNanoPool.batchSpend(proofs, nullifiers, roots, recipients)` on Arc Layer 1.
  5. The smart contract validates:
     - Nullifiers are unspent and marks them spent.
     - Merkle roots are in the valid 64-root circular ring buffer.
     - Automatically transfers real USDC to each provider’s recipient address (`Agent B`).
  6. Arc’s deterministic sub-500ms block confirms the transaction permanently.

---

## 🔒 Security & Privacy Guarantees

1. **Zero msg.sender Leakage:** The spending agent never submits an on-chain transaction. On-chain watchers only see the Relayer batching payouts to providers.
2. **Replay Protection:** Every note has a deterministic `nullifier_hash = Poseidon(secret, path_index)`. Replaying an HTTP request results in instant rejection.
3. **Double-Spend Defense:** The Relayer checks its in-flight queue, and the Arc Layer 1 smart contract enforces nullifier uniqueness at the EVM state level.
4. **OFAC / Compliance Safe:** Association Set Provider (ASP) proofs ensure funds never pool with illicit addresses or sanctioned mixers.
5. **Zero Gas Burden:** Autonomous agents never need native gas tokens (ETH/ARC) in their local runtime wallets.
