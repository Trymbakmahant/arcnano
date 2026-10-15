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
/**
 * Intelligent conversational reasoning engine for ArcNano Cubee daemon.
 * Delivers dynamic, natural, and context-aware responses across greetings,
 * architecture inquiries, playground operations, marketplace workflows, and protocol internals.
 */
export function getArcNanoContextualAnswer(query: string, pretext?: PretextContext): string {
  const rawQ = query.trim();
  const q = rawQ.toLowerCase();
  const cleanQ = q.replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  const title = (pretext?.title || "").toLowerCase();
  const hint = (pretext?.hint || "").toLowerCase();

  // 1. Natural Greetings & Friendly Openers
  const greetingWords = ["hello", "hi", "hey", "hola", "yo", "sup", "greetings", "good morning", "good afternoon", "good evening", "howdy"];
  const isGreeting = greetingWords.some((w) => cleanQ === w || cleanQ.startsWith(`${w} `) || cleanQ.endsWith(` ${w}`));
  if (isGreeting) {
    if (pretext?.title) {
      return `Hello! I'm Cubee, your ArcNano protocol companion. You're currently inspecting "${pretext.title}". ${pretext.hint ? `Tip: ${pretext.hint}` : ""} Feel free to ask me anything about this component, our zero-knowledge architecture, or test a live transaction in the Playground!`;
    }
    return `Hello! I'm Cubee, the autonomous protocol daemon and settlement companion for ArcNano. I can help you explore our zero-knowledge nanopayment architecture, explain how we hide msg.sender, guide you through the Shielded Playground, or explain how autonomous agent swarms trade on marketplace.arcnano.xyz. What would you like to explore today?`;
  }

  // 2. Identity & Capability Questions ("Who are you", "What can you do", "Help")
  if (
    cleanQ.includes("who are you") ||
    cleanQ.includes("what is your name") ||
    cleanQ.includes("what are you") ||
    cleanQ.includes("what can you do") ||
    cleanQ === "help" ||
    cleanQ === "commands"
  ) {
    return `I am Cubee, ArcNano's intelligent protocol daemon! I specialize in machine-to-machine zero-knowledge payments on the Arc Network. Here is what I can do for you:
• Explain the 4 fatal mempool traps of standard crypto payments
• Guide you through the Shielded Playground (/playground) to deposit, send, and withdraw shielded notes
• Explain our live Agent Marketplace (marketplace.arcnano.xyz) where AI agents buy inference via HTTP 402
• Walk you through our developer documentation (docs.arcnano.xyz) and SDKs
• Clarify how Circle Gas Station sponsors 100% of batch settlement fees for $0.00 gas`;
  }

  // 3. How to use / What is the Playground (/playground)
  if (
    cleanQ.includes("playground") ||
    cleanQ.includes("how to use") ||
    cleanQ.includes("how does this work") ||
    cleanQ.includes("how to test") ||
    cleanQ.includes("how do i test") ||
    cleanQ.includes("demo")
  ) {
    return `The ArcNano Playground (/playground) is a live interactive sandbox to experience shielded zero-knowledge payments:
1. Deposit: Deposit testnet USDC into the ArcNano pool. A cryptographic 256-bit note is minted and saved directly into your hardware-encrypted local vault (AES-256 GCM).
2. Send (Anonymous P2P): Generate a Groth16 zk-SNARK proof in RAM (~74ms) and transfer funds to any recipient without revealing your wallet address on-chain.
3. Withdraw: Redeem notes back into your wallet with zero gas via Circle Gas Station Paymaster sponsorship.
4. Local Vault: Click the "Vault" pill anytime to inspect your stored notes, commitments, and cryptographic proof receipts!`;
  }

  // 4. Marketplace Questions (marketplace.arcnano.xyz)
  if (
    cleanQ.includes("marketplace") ||
    cleanQ.includes("agent market") ||
    cleanQ.includes("buy api") ||
    cleanQ.includes("sell api") ||
    cleanQ.includes("inference market")
  ) {
    return `Our live Agent Marketplace (marketplace.arcnano.xyz) is built for the autonomous AI economy. AI agent swarms can discover APIs, query inference endpoints, and settle micro-transactions using the HTTP 402 (X402) standard. Because spenders deliver Groth16 proofs off-chain, AI buyer agents purchase tool calls and compute without ever exposing their msg.sender or wallet address to competitors!`;
  }

  // 5. Documentation & Developer SDK Questions (docs.arcnano.xyz)
  if (
    cleanQ.includes("doc") ||
    cleanQ.includes("documentation") ||
    cleanQ.includes("sdk") ||
    cleanQ.includes("python") ||
    cleanQ.includes("npm") ||
    cleanQ.includes("github") ||
    cleanQ.includes("code")
  ) {
    return `You can find comprehensive developer documentation at docs.arcnano.xyz and our open-source repo at github.com/Trymbakmahant/arcnano:
• Python SDK (arczk): Autonomous agent client for generating in-RAM Groth16 proofs and managing note vaults.
• Express Middleware (x402-express): Turn any Node.js API into an HTTP 402 pay-per-call endpoint.
• Smart Contracts: Foundry-tested contracts deployed on Arc Testnet (Chain ID: 5042002) featuring Incremental Poseidon Merkle Trees and ASP Privacy Pools.`;
  }

  // 6. Deposit Amounts & Batch Deposits ($10, $5, 0.01 USDC)
  if (
    cleanQ.includes("deposit") ||
    cleanQ.includes("batch deposit") ||
    cleanQ.includes("0 01") ||
    cleanQ.includes("denomination") ||
    cleanQ.includes("amount")
  ) {
    return `In zero-knowledge privacy pools, notes have a fixed base denomination (0.01 USDC) to maintain a unified anonymity set where every transaction looks identical on-chain. To deposit larger amounts (like $1.00, $5.00, or $10.00), ArcNano supports Batch Deposits: you enter your desired total amount, and our batch helper mints 100 or 1,000 shielded notes in a single on-chain transaction without prompting your wallet 100 times!`;
  }

  // 7. Arc Network & Stable Gas Fees Advantage
  if (
    cleanQ.includes("gas") ||
    cleanQ.includes("fee") ||
    cleanQ.includes("stable") ||
    cleanQ.includes("predictable") ||
    cleanQ.includes("circle") ||
    cleanQ.includes("paymaster") ||
    (cleanQ.includes("arc") && (cleanQ.includes("why") || cleanQ.includes("good") || cleanQ.includes("best") || cleanQ.includes("agent") || cleanQ.includes("benefit") || cleanQ.includes("economy")))
  ) {
    return `For the autonomous agent economy, Arc Network is the optimal foundation because its gas fees are predictable and stable:
1. Native USDC Gas: Gas is priced in stable digital dollars rather than volatile speculative tokens.
2. Circle Gas Station Sponsorship: Through our ERC-4337 native paymaster, batch settlements on Arc L1 are 100% gas-sponsored for AI agents ($0.00 in agent gas fees).
3. Sub-500ms Deterministic Finality: High-frequency agent loops never stall waiting 15 seconds for a block to confirm.`;
  }

  // 8. Privacy, Tornado Cash vs Privacy Pools & OFAC Compliance
  if (
    cleanQ.includes("mixer") ||
    cleanQ.includes("tornado") ||
    cleanQ.includes("ofac") ||
    cleanQ.includes("sanction") ||
    cleanQ.includes("compliance") ||
    cleanQ.includes("privacy pool") ||
    cleanQ.includes("asp")
  ) {
    return `Traditional mixers like Tornado Cash pool illicit and clean funds indiscriminately, leading to immediate OFAC sanctions and automated API blacklisting. ArcNano uses Association Set Provider (ASP) proofs (Vitalik's Privacy Pools model): agents prove non-membership in sanctioned or fraudulent sets mathematically inside the Groth16 circuit, providing 100% regulatory compliance without sacrificing privacy!`;
  }

  // 9. Traps & Problem Statement (msg.sender dox, mempool leakage)
  if (cleanQ.includes("trap") || cleanQ.includes("problem") || cleanQ.includes("fail") || cleanQ.includes("surveillance") || cleanQ.includes("dox")) {
    if (title.includes("public ledgers") || title.includes("trap 1") || cleanQ.includes("msg sender") || cleanQ.includes("public ledger")) {
      return `Public blockchains permanently log the payer's wallet address (msg.sender) on every transaction. For AI agents buying prompts, tool calls, or compute, this leaks trading strategies, model architectures, and supplier relationships to competitors. ArcNano eliminates this by decoupling the spender: the payer never broadcasts on-chain; the API provider batches and settles on Arc L1 instead.`;
    }
    if (title.includes("naive zk") || title.includes("trap 2") || cleanQ.includes("naive zk") || cleanQ.includes("signer")) {
      return `Even if an agent creates a Zero-Knowledge proof, broadcasting it from their own wallet still leaks their address and IP in the mempool! ArcNano solves this transport leak by sending the Groth16 proof off-chain in the HTTP X-PAYMENT header directly to the provider, completely removing the agent from the on-chain mempool.`;
    }
    if (title.includes("block time") || title.includes("trap 4") || cleanQ.includes("latency")) {
      return `Standard blockchains take 10-15s per block and charge $0.10–$2.00 in gas fees, completely breaking real-time LLM token streaming and $0.001 micropayments. ArcNano verifies Groth16 proofs in memory in under 8ms, while Arc L1 + Circle Gas Station Paymaster sponsor 100% of batch settlement fees!`;
    }
    return `Standard public crypto fails AI agents due to 4 fatal traps: 1) msg.sender surveillance, 2) mempool transport leakage, 3) mixer sanction blacklisting, and 4) slow block times and high gas fees. ArcNano's decoupled architecture and off-chain X402 proofs solve all four.`;
  }

  // 10. Cryptography & Proof Internals
  if (cleanQ.includes("zk") || cleanQ.includes("groth16") || cleanQ.includes("snark") || cleanQ.includes("proof") || cleanQ.includes("poseidon") || cleanQ.includes("merkle")) {
    return `ArcNano uses Groth16 ZK-SNARKs over the BN254 (alt_bn128) elliptic curve with an algebraic Poseidon Hash. Spend proofs are tiny (128 bytes: pi_A, pi_B, pi_C) and verify off-chain in under 8ms using bilinear pairings. Deposit notes reside in a 20-level Incremental Poseidon Merkle Tree supporting over 1 million notes, with a 64-root ring buffer to eliminate race conditions.`;
  }

  // 11. X402 Protocol Questions
  if (cleanQ.includes("x402") || cleanQ.includes("402") || cleanQ.includes("http") || cleanQ.includes("header")) {
    return `X402 resurrects the HTTP 402 "Payment Required" status code for autonomous agents. When an agent queries an API, the server issues a 402 challenge with invoice parameters. The agent generates a local Groth16 proof in RAM (~74ms) and attaches it in the "X-PAYMENT" header. The gateway verifies it in <8ms and streams the response immediately.`;
  }

  // 12. Context-specific fallback based on active component inspection
  if (pretext?.hint) {
    return `Regarding "${pretext.title || "this feature"}": ${pretext.hint} In ArcNano's architecture, this ensures autonomous AI agents can transact sub-cent amounts privately, compliantly, and with zero on-chain msg.sender footprint.`;
  }

  // 13. General friendly fallback
  return `ArcNano enables shielded, sub-cent machine payments for autonomous AI agents via the X402 protocol on Arc Network. Spenders never broadcast on-chain, eliminating msg.sender leakage, while Groth16 ZK-SNARKs and Privacy Pools ensure 100% OFAC compliance and sub-8ms verification. You can test live notes in our Playground (/playground) or explore our docs at docs.arcnano.xyz!`;
}

