# ArcNano Architectural Research: Arbitrary-Amount Deposits & Streaming Micropayments

> **Objective:** Eliminate fixed-denomination note explosion, enable arbitrary deposits (e.g. deposit $5.00, $10.00, or $50.00 in a single transaction), and enable continuous token-by-token micropayment streaming ($0.0001 per LLM token) with zero `msg.sender` leakage and optimal gas efficiency on Arc Network.

---

## 1. Executive Problem Statement: Why Fixed-Denomination Pools Break

Currently, ArcNano v1 uses a **fixed-denomination note model** inspired by Tornado Cash Classic:
- Every note is locked to an exact amount (e.g., $0.01\text{ USDC}$ or $1.00\text{ USDC}$).
- Depositing funds creates one leaf commitment in an on-chain incremental Poseidon Merkle tree:
  $$\text{Commitment} = \text{Poseidon}(\text{denomination}, \text{secret}, \text{nullifierSeed})$$
- Spending nullifies that exact leaf and transfers the entire fixed denomination to the receiver.

### The Breakdown Points

| Friction Point | What Happens in Practice | Root Cause |
| :--- | :--- | :--- |
| **1. Note Explosion on Deposit** | A user depositing **$5.00** into the $0.01 pool must generate, hash, and insert **500 individual notes**. | 1 note = exactly $0.01. $5.00 / 0.01 = 500$ notes. |
| **2. Block Gas Limit Rejection** | In `ArcNanoBatchDeposit.sol`, inserting 1 leaf costs $\sim 65,000$ gas. Inserting 500 notes would cost **$32,500,000$ gas**, exceeding the EVM block gas limit ($30\text{M}$). | On-chain Merkle tree updates scale linearly ($O(N)$) with note count. |
| **3. Client Memory & Storage Bloat** | Storing 500 secrets, nullifiers, and Merkle proofs in `localStorage`/`IndexedDB` causes significant lag and high risk of state desynchronization. | Every single cent requires private key material and sibling proof paths. |
| **4. Inability to Pay Fractional Cents** | AI agents query LLMs and web scrapers at **$0.0005 per token** or **$0.002 per query**. If the user deposits $1.00 notes, they cannot pay fractional amounts without forfeiting the remaining $0.998! | No change-note mechanism or partial spend circuit exists. |

---

## 2. Comparative Analysis: How State-of-the-Art Privacy Protocols Handle This

To design the optimal solution for ArcNano, we analyzed four industry-proven paradigms:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               ARCHITECTURAL PARADIGM COMPARISON                                 │
├──────────────────────────┬──────────────────────┬───────────────────────┬───────────────────────┤
│ Paradigm                 │ Primary Pioneers     │ Strengths             │ Weaknesses            │
├──────────────────────────┼──────────────────────┼───────────────────────┼───────────────────────┤
│ 1. Join-Split UTXO       │ Zcash, Tornado Nova, │ Single $5 deposit;    │ Heavy ZK prover on    │
│    (Value-in-Leaf)       │ Aztec Connect        │ dynamic change notes  │ every single call;    │
│                          │                      │ ($0.05 spend, $4.95   │ cannot stream at      │
│                          │                      │ change).              │ 50 tokens/sec.        │
├──────────────────────────┼──────────────────────┼───────────────────────┼───────────────────────┤
│ 2. ZK Payment Channels   │ BOLT, zkChannels,    │ Instant streaming     │ Requires 2-party      │
│    (Stream Vouchers)     │ MPP, Raiden ZK       │ (1,000+ msgs/sec);    │ channel open/close;   │
│                          │                      │ 0 gas during stream;  │ capital locked during │
│                          │                      │ 1 ZK proof at close.  │ session.              │
├──────────────────────────┼──────────────────────┼───────────────────────┼───────────────────────┤
│ 3. Probabilistic ZK      │ Orchid VPN,          │ 99.9% reduction in    │ Variance in payout;   │
│    Micro-Lotteries       │ Rivest Pay-to-Win    │ proofs; no state      │ merchants must accept │
│                          │                      │ channels needed.      │ statistical payouts.  │
├──────────────────────────┼──────────────────────┼───────────────────────┼───────────────────────┤
│ 4. Shielded Virtual      │ Privacy Pools v2,    │ Simple UX; arbitrary  │ Requires on-chain     │
│    Account / Balance     │ StarkEx private      │ deposits & balance    │ sequencer or roll-up  │
│                          │ credit balances      │ management.           │ operator.             │
└──────────────────────────┴──────────────────────┴───────────────────────┴───────────────────────┘
```

---

## 3. Deep Dive into the Two Best Options for ArcNano

For ArcNano on the Arc Network, the two viable, production-grade solutions are:
1. **Option A: The Value-Committed Shielded UTXO Model (Tornado Nova Style)** — Best for discrete, arbitrary API payments ($0.02, $0.17, $5.00).
2. **Option B: The ZK-Streaming Session Channel (BOLT / MPP Hybrid)** — Best for continuous, real-time token-by-token LLM inference streams.

---

### Option A: The Value-Committed Shielded UTXO Model (Join-Split)

Instead of hardcoding `denomination` inside the smart contract, the note value is stored **privately inside the commitment leaf**:

$$\text{Commitment} = \text{Poseidon}(\text{value}, \text{ownerPublicKey}, \text{secret}, \text{nullifierSeed})$$

```
[User Wallet]
      │
      │ 1. Deposit $5.00 (Single tx, 1 Merkle leaf)
      ▼
[ArcNano Pool] ──► Leaf: Commitment(value = $5.00, ...)
      │
      │ 2. Agent wants to spend $0.05 on API
      ▼
[Join-Split Circuit (Circom)]
      ├── Input Note:  $5.00 (reveals nullifier to spend)
      ├── Output Note 1: $0.05 (recipient's new note or direct withdrawal)
      └── Output Note 2: $4.95 (change note inserted back into tree for sender)
      │
      ▼
  Enforced Circuit Constraint:
  Input_Value ($5.00) === Output_1 ($0.05) + Output_2 ($4.95) + Relayer_Fee ($0.00)
```

#### How It Solves the User's Problem:
1. **1 Single Deposit Transaction:** User deposits $5.00 or $20.00. Exactly **one** leaf is inserted into the Merkle tree ($\sim 65,000$ gas instead of $32.5\text{M}$ gas!).
2. **Zero Note Bloat:** User wallet holds 1 note with balance $5.00.
3. **Change Returned Privately:** When spending $0.03, the circuit generates a change note for $4.97 with a new secret and nullifier.

#### Limitations for Continuous Streaming:
- Each spend produces a new Groth16 proof (takes $\sim 180\text{ms}$ in browser) and inserts a new change leaf on-chain.
- Ideal for **discrete request-response APIs** (e.g., query a vector database, run a Python script, fetch a weather feed), but **too slow for per-token streaming** where an LLM emits 30 tokens/sec.

---

### Option B: The ZK-Streaming Session Channel (BOLT / MPP Hybrid)

This is the **state-of-the-art solution** for token-by-token LLM streaming. It combines ArcNano’s shielded pool with off-chain **ephemeral streaming vouchers**.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│               ARCNANO SHIELDED STREAMING SESSION ARCHITECTURE                          │
└────────────────────────────────────────────────────────────────────────────────────────┘

  [1. USER DEPOSIT]
  User deposits $5.00 once ──► Creates 1 Shielded Vault Note ($5.00)

  [2. AGENT STARTS STREAMING SESSION]
  Agent requests LLM stream:
  POST /v1/chat/completions (with X-STREAM-INIT header)
  Gateway returns HTTP 402 with Stream-Channel Session ID.

  [3. ULTRA-FAST OFF-CHAIN STREAMING (ZERO GAS, ZERO MERKLE OVERHEAD)]
  LLM emits token 1  ──► Agent signs Voucher #1 ($0.00005) ──► Latency: 0.8ms (Ed25519/BabyJubjub)
  LLM emits token 2  ──► Agent signs Voucher #2 ($0.00010)
  ...
  LLM emits token 500 ──► Agent signs Cumulative Voucher #500 ($0.02500)
  (Total inference time: 4 seconds. Total on-chain txs during stream: 0.)

  [4. BATCH SESSION SETTLEMENT]
  API Provider submits final settlement voucher to ArcNano:
  ├── Provider receives: $0.02500 (transferred via Circle Gas Station)
  ├── User receives Change Note: $4.97500 (inserted into Merkle tree)
  └── Single Groth16 Proof validates the transition.
```

#### Detailed Cryptographic Mechanism of Option B:

1. **Pre-funding the Session (Off-Chain Locking):**
   The agent has a shielded note of value $V_{\text{initial}} = \$5.00$.
   The agent generates an ephemeral session keypair:
   $$(sk_{\text{session}}, pk_{\text{session}})$$
   The agent creates a **Session Authorization Ticket** binding its $5 note to the provider's address and $pk_{\text{session}}$.

2. **Micro-Vouchers (Sub-Millisecond Signing):**
   As tokens stream over Server-Sent Events (SSE) or WebSockets, the agent sends micro-receipts inside HTTP headers:
   $$\text{Voucher}_k = \text{Sign}_{sk_{\text{session}}}(\text{session\_id}, \text{cumulative\_amount}_k, \text{nonce}_k)$$
   - Signing BabyJubjub or Ed25519 takes **$0.4\text{ms}$** in WebAssembly.
   - The API provider verifies the signature in **$0.2\text{ms}$** in memory.
   - If the user disconnects at token 120, the provider holds valid vouchers up to token 120 and stops streaming immediately. Neither party can cheat!

3. **Cumulative Batch Settlement:**
   When the session terminates (or after a period like 1 hour), the provider generates **one single Groth16 proof** (`stream_settle.circom`):
   - **Public Inputs:**
     - Deposit Merkle Root
     - Initial Note Nullifier
     - Payout Address & Payout Amount (e.g. $0.025)
     - New Change Commitment Leaf
   - **Circuit Verification:**
     - Proves the $5 note existed in the tree.
     - Proves the provider's voucher signature is valid.
     - Proves $\text{Change Amount} = \$5.00 - \$0.025 = \$4.975$.
     - Proves the new change commitment is formatted correctly for the user's viewing key.
   - **On-chain Settlement:**
     - Provider calls `ArcNanoPool.settleStream(...)`.
     - Arc L1 Circle Gas Station pays the gas.
     - Provider receives $0.025 USDC.
     - User's wallet detects the new $4.975 change note.
     - Total on-chain footprint: **1 transaction, 1 nullifier, 1 new leaf!**

---

## 4. Architectural Comparison Table

| Metric | ArcNano v1 (Current) | Option A: Join-Split UTXO | Option B: ZK-Stream Channel (Recommended) |
| :--- | :--- | :--- | :--- |
| **Deposit $5.00 (Gas Cost)** | $32.5\text{M}$ gas (Fails block limit) | $\sim 72,000$ gas (1 tx) | $\sim 72,000$ gas (1 tx) |
| **Deposit $5.00 (Leaf Count)** | 500 leaves | **1 leaf** | **1 leaf** |
| **Wallet Note Storage** | 500 individual notes | 1 note | 1 note |
| **Spend Any Fractional Amount** | ❌ Impossible (fixed 0.01 / 1.00) | ✅ Yes (generates change note) | ✅ Yes (continuous micro-vouchers) |
| **Streaming Speed** | ❌ Cannot stream | ⚠️ 1 call per 200ms (ZK bottleneck) | ⚡ **1,000+ tokens/sec (sub-ms)** |
| **Zero msg.sender Anonymity** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Settlement Efficiency** | 1 on-chain tx per note | 1 on-chain tx per API call | **1 on-chain tx per entire session** |

---

## 5. Proposed Implementation Blueprint for ArcNano

To deliver this capability cleanly without breaking existing components, we recommend a **two-phase phased rollout**:

### Phase 1: Dynamic Denomination & Note Split Engine (Fastest Path)
Modify the Circom circuit and Solidity contract to support variable denominations:
1. **Update `spend.circom`:**
   - Make `denomination` a private witness input that is checked against a range ($0 < \text{amount} \le 100\text{ USDC}$) and balance equation:
     $$\text{inputAmount} = \text{spendAmount} + \text{changeAmount}$$
   - Output both a nullifier for the input note and a new commitment for the change note.
2. **Update `ArcNanoPool.sol`:**
   - Allow `deposit(bytes32 commitment, uint256 amount)` where `amount` can be any arbitrary value (e.g. $5.00, $20.00).
   - In `spend(...)`, payout `spendAmount` to recipient and insert `changeCommitment` into the Merkle tree for the user.

### Phase 2: Native X402 Streaming Channel Protocol (State of the Art)
Introduce an ephemeral streaming layer into the ArcNano SDK and Marketplace:
1. **SDK Client (`@arcnano/sdk`):**
   - Add `ArcNanoStreamSession`: Manages local BabyJubjub signing of per-token vouchers over SSE.
2. **Server Facilitator Middleware (`@arcnano/stream-gateway`):**
   - Intercepts LLM streaming chunks, receives cumulative vouchers via `X-STREAM-VOUCHER` headers, and accumulates balances in memory.
   - Automatically submits cumulative settlement to ArcNanoPool on session close via Circle Gas Station Paymaster.
3. **Playground UI Upgrade:**
   - In `ShieldedPlayground.tsx`, user enters any arbitrary deposit amount (e.g., "$5.00 USDC").
   - UI creates a single note with balance $5.00.
   - A live "Stream Token Demo" shows tokens ticking in real-time ($0.0001, $0.0002...) with the balance decreasing smoothly in RAM, settling cleanly with 1 proof at the end.

---

## 6. Summary: The Direct Answer to the User's Vision

> *"Can you do a research on how people can pay any amount without that much of note problem and limit, like I can deposit $5 and stream tokens when needed?"*

**Yes, absolutely.** The root problem in ArcNano today is treating money like physical fixed-denomination coins ($0.01 coins) rather than a **fluid balance with cryptographic change**.

By implementing the **ZK-Streaming Session Channel (BOLT/MPP Model)**:
1. You deposit **$5.00 in a single transaction** (creates exactly **1 leaf** in the tree, uses only **72,000 gas**, and avoids all block limits).
2. Your AI agent opens an **X402 streaming session** with the provider.
3. As the LLM streams tokens, the agent signs lightweight cryptographic vouchers **token-by-token in under 1 millisecond** with zero gas and zero blockchain traffic.
4. When the session finishes, a **single Groth16 proof** settles the provider's earnings and returns your exact change (e.g. $4.87) as a fresh shielded note in your vault.
