/**
 * Comprehensive ArcNano Knowledge Base & Context Engine
 * Distilled from ARCNANO_DEEP_DIVE_BOOK.md, contracts, circuits, and protocol specs.
 */

export interface PretextContext {
  title: string;
  hint?: string;
  description?: string;
  section?: string;
  codeSnippet?: string;
}

export const ARCNANO_KNOWLEDGE_SUMMARY = `
# ArcNano Protocol: Master Technical Knowledge Base

## 1. What is ArcNano?
ArcNano is a decentralized zero-knowledge micropayment protocol designed specifically for autonomous AI agents on the Arc Network (Circle's permissioned L1 cohort). It solves the problem of privacy, compliance, and instant finality for machine-to-machine (M2M) payments using HTTP 402 (X402) and Groth16 ZK-SNARKs.

## 2. The 4 Fatal Mempool Traps of Standard Crypto Payments:
1. Trap 1 (Surveillance & msg.sender Leakage):
   Public blockchains permanently log the payer's wallet address (msg.sender) on block explorers for every prompt, tool call, or model inference. Competitors and surveillance firms can map model architectures, supplier graphs, and proprietary trading strategies.
   - ArcNano Solution: Receiver-Batched Settlement. The spender never signs or broadcasts an on-chain transaction. The payer's address (msg.sender) is mathematically decoupled and never appears on the blockchain.

2. Trap 2 (Transport Leakage in Naive ZK):
   If an agent broadcasts its own ZK-SNARK spend transaction on-chain, its IP address and wallet are still visible in the mempool.
   - ArcNano Solution: Spender delivers Groth16 proof off-chain inside the HTTP "X-PAYMENT" request header to the API provider. The provider aggregates multiple receipts and broadcasts a single batch settlement on Arc.

3. Trap 3 (Mixer Blacklisting & Sanctions):
   Traditional mixers (like Tornado Cash) pool dirty and clean funds, causing AI gateways, AWS, Cloudflare, and banks to blacklist all participants under OFAC regulations.
   - ArcNano Solution: Privacy Pools with Association Set Provider (ASP) proofs. Every spend proof includes a cryptographic proof of non-membership in sanctioned sets, proving 100% OFAC compliance without sacrificing privacy.

4. Trap 4 (Block Latency & Gas Costs):
   Waiting 10-15 seconds for blockchain consensus stalls real-time LLM token streams. Moreover, Ethereum/L2 gas costs ($0.10 to $2.00) exceed a $0.001 micropayment.
   - ArcNano Solution: Two-Stage Verification Engine.
     - Stage 1: In-memory synchronous Groth16 verification in under 8ms enables instantaneous LLM token streaming.
     - Stage 2: Asynchronous batch settlement on Arc L1 with Circle Gas Station Paymaster sponsoring 100% of gas fees in native USDC with <500ms deterministic finality.

## 3. Cryptographic Architecture:
- Proving System: Groth16 ZK-SNARK over the BN254 (alt_bn128) elliptic curve. Proof size: exactly 128 bytes (pi_A in G1, pi_B in G2, pi_C in G1).
- Hash Function: Poseidon Hash optimized for arithmetic circuits (sub-250 R1CS constraints per hash).
- Shielded Note Model: Fixed-denomination notes (e.g. 0.01 USDC, 0.10 USDC, 1.00 USDC).
  - Commitment C = Poseidon(nullifierKey, secret)
  - Nullifier N = Poseidon(nullifierKey, leafIndex)
  - Merkle Tree: 20-level Incremental Poseidon Merkle Tree (capacity: 2^20 = 1,048,576 notes).
  - Historical Root Ring Buffer: Allows spending against any of the last 64 Merkle roots to prevent race conditions during concurrent deposits.

## 4. The X402 Payment Lifecycle:
1. Probe: AI agent requests an inference API endpoint (e.g., POST /api/v1/inference) without credentials.
2. 402 Challenge: Gateway returns HTTP 402 Payment Required with WWW-Authenticate: X402 headers detailing invoice, required USDC amount, current Merkle root, and ASP root.
3. Settlement Payload: Agent generates off-chain Groth16 proof in RAM (~74ms) and resubmits request with X-PAYMENT header containing proof, nullifier, root, and recipient address.
4. Instant Service: Gateway verifies proof in <8ms in memory and immediately streams LLM output tokens.
5. Batch Settlement: Gateway batches hundreds of verified receipts and submits batchSpend() to the ArcNano contract on Arc L1 via Circle Gas Station Paymaster (gas sponsored).

## 5. Network & Infrastructure:
- Arc Network: Permissioned L1 cohort built in collaboration with Circle.
- Chain ID: 5042002 (Arc Testnet).
- Native Gas Token: USDC.
- Finality: Deterministic sub-500ms finality.
- Circle Gas Station: ERC-4337 compliant native paymaster sponsoring agent batch settlements.
- Open Source Repo: github.com/Trymbakmahant/arcnano
`;

/**
 * Intelligent local fallback responder for when GLM API key is pending or offline.
 */
export function getArcNanoContextualAnswer(query: string, pretext?: PretextContext): string {
  const q = query.toLowerCase();
  const title = (pretext?.title || "").toLowerCase();
  const hint = (pretext?.hint || "").toLowerCase();

  // 1. Trap / Problem questions
  if (q.includes("trap") || q.includes("problem") || q.includes("fail") || q.includes("surveillance") || q.includes("dox")) {
    if (title.includes("public ledgers") || title.includes("trap 1") || q.includes("msg.sender") || q.includes("public ledger")) {
      return `Public blockchains permanently log the payer's wallet address (msg.sender) on every transaction. For AI agents buying prompts, tool calls, or compute, this leaks trading strategies, model architectures, and supplier relationships to competitors. ArcNano eliminates this by decoupling the spender: the payer never broadcasts on-chain; the API provider batches and settles on Arc L1 instead.`;
    }
    if (title.includes("naive zk") || title.includes("trap 2") || q.includes("naive zk") || q.includes("signer")) {
      return `Even if an agent creates a Zero-Knowledge proof, broadcasting it from their own wallet still leaks their address and IP in the mempool! ArcNano solves this transport leak by sending the Groth16 proof off-chain in the HTTP X-PAYMENT header directly to the provider, completely removing the agent from the on-chain mempool.`;
    }
    if (title.includes("mixer") || title.includes("trap 3") || q.includes("mixer") || q.includes("ofac") || q.includes("sanction")) {
      return `Traditional mixers like Tornado Cash pool dirty and clean funds together into one anonymity set, leading to swift OFAC sanctions and automated API blacklisting. ArcNano uses Association Set Provider (ASP) proofs (Vitalik's Privacy Pools model) where agents mathematically prove non-membership in illicit sets without disclosing their identity!`;
    }
    if (title.includes("block time") || title.includes("trap 4") || q.includes("gas") || q.includes("latency")) {
      return `Standard blockchains take 10-15s per block and charge $0.10–$2.00 in gas fees, completely breaking real-time LLM token streaming and $0.001 micropayments. ArcNano verifies Groth16 proofs in memory in under 8ms, while Arc L1 + Circle Gas Station Paymaster sponsor 100% of batch settlement fees!`;
    }
    return `Standard public crypto fails AI agents due to 4 fatal traps: 1) msg.sender surveillance, 2) mempool transport leakage, 3) mixer sanction blacklisting, and 4) slow block times and high gas fees. ArcNano's decoupled architecture and off-chain X402 proofs solve all four.`;
  }

  // 2. Settlement / Arc / Circle questions
  if (q.includes("gas") || q.includes("circle") || q.includes("paymaster") || q.includes("arc") || q.includes("settlement")) {
    return `Arc Network is a permissioned L1 co-engineered with Circle offering sub-500ms deterministic finality and native USDC gas. Through Circle's Gas Station (ERC-4337 Paymaster), batch settlements on Arc L1 are 100% gas-sponsored for AI agents, allowing 100+ micro-receipts to be settled in a single compressed transaction for $0.00 in agent gas fees!`;
  }

  // 3. Cryptography / ZK / Proof questions
  if (q.includes("zk") || q.includes("groth16") || q.includes("snark") || q.includes("proof") || q.includes("poseidon") || q.includes("merkle")) {
    return `ArcNano uses Groth16 ZK-SNARKs over the BN254 elliptic curve with an algebraic Poseidon Hash. Spend proofs are tiny (128 bytes: pi_A, pi_B, pi_C) and verify off-chain in under 8ms using bilinear pairings. Deposit notes reside in a 20-level Incremental Poseidon Merkle Tree supporting over 1 million notes, with a 64-root ring buffer to eliminate race conditions.`;
  }

  // 4. X402 / HTTP 402 questions
  if (q.includes("x402") || q.includes("402") || q.includes("http") || q.includes("header")) {
    return `X402 resurrects the HTTP 402 "Payment Required" status code for autonomous agents. When an agent queries an API, the server issues a 402 challenge with invoice parameters. The agent generates a local Groth16 proof in RAM (~74ms) and attaches it in the "X-PAYMENT" header. The gateway verifies it in <8ms and streams the response immediately.`;
  }

  // 5. Context-specific fallback based on active card pretext
  if (pretext?.hint) {
    return `Regarding "${pretext.title || "this feature"}": ${pretext.hint} In ArcNano's architecture, this ensures autonomous AI agents can transact sub-cent amounts privately, compliantly, and with zero on-chain msg.sender footprint.`;
  }

  return `ArcNano enables shielded, sub-cent machine payments for autonomous AI agents via the X402 protocol on Arc Network. Spenders never broadcast on-chain, eliminating msg.sender leakage, while Groth16 ZK-SNARKs and Privacy Pools ensure 100% OFAC compliance and sub-8ms verification.`;
}
