export interface DocSection {
  id: string;
  title: string;
  badge?: string;
  summary: string;
  content: string;
  category: string;
}

export interface DocCategory {
  id: string;
  name: string;
  items: { id: string; title: string; badge?: string }[];
}

export const DOC_CATEGORIES: DocCategory[] = [
  {
    id: "overview",
    name: "Getting Started & Architecture",
    items: [
      { id: "intro", title: "Introduction to ArcNano", badge: "Overview" },
      { id: "threat-model", title: "The 4 Web3 Surveillance Traps" },
      { id: "architecture", title: "Protocol Architecture & Flow" },
    ],
  },
  {
    id: "privacy",
    name: "User Privacy Model",
    items: [
      { id: "privacy-guarantees", title: "What Type of Privacy Users Get", badge: "Core" },
      { id: "signer-decoupling", title: "Signer Decoupling (0% msg.sender)" },
      { id: "asp-compliance", title: "Privacy Pools (ASP Compliance)" },
    ],
  },
  {
    id: "security",
    name: "Fraud & Theft Prevention",
    items: [
      { id: "fraud-prevention", title: "How Users & APIs Are Protected", badge: "Security" },
      { id: "anti-hijacking", title: "Anti-Frontrunning & Proof Hijacking" },
      { id: "double-spend", title: "Double-Spend & Race Condition Solutions" },
      { id: "solvency-invariants", title: "Smart Contract Solvency Invariants" },
    ],
  },
  {
    id: "circuits",
    name: "Zero-Knowledge Cryptography",
    items: [
      { id: "spend-circuit", title: "spend.circom Constraint Breakdown" },
      { id: "groth16-pairings", title: "Bilinear Pairings & BN254 Curve" },
      { id: "poseidon-merkle", title: "20-Level Poseidon Merkle Tree" },
    ],
  },
  {
    id: "sdks",
    name: "Developer SDKs & Gateway Tooling",
    items: [
      { id: "marketplace", title: "Arc Agent Marketplace", badge: "Live" },
      { id: "sdk-express", title: "arcnano-x402 Middleware" },
      { id: "sdk-python", title: "arczk-agent Python SDK (LangChain/CrewAI)" },
      { id: "modes", title: "Fast Mode vs Strict Finality Mode" },
    ],
  },
  {
    id: "contracts",
    name: "Arc Network Smart Contracts",
    items: [
      { id: "mainnet-details", title: "Arc Mainnet (Chain 5042) Live Deployment", badge: "LIVE MAINNET" },
      { id: "contracts-reference", title: "ArcNanoPool.sol Reference" },
      { id: "testnet-details", title: "Arc Testnet (Circle L1) Details" },
    ],
  },
  {
    id: "relayer",
    name: "Automated Relayer Backend",
    items: [
      { id: "relayer-overview", title: "Batch Relayer Architecture", badge: "Live API" },
      { id: "relayer-api", title: "Relayer REST API Reference", badge: "Endpoints" },
      { id: "relayer-hono", title: "Standalone Hono.js Deployment", badge: "Open Source" },
    ],
  },
];

export const DOC_SECTIONS: Record<string, DocSection> = {
  intro: {
    id: "intro",
    title: "Introduction to ArcNano",
    badge: "Protocol RFC",
    category: "Getting Started & Architecture",
    summary:
      "ArcNano is a decentralized zero-knowledge micropayment protocol designed for the autonomous AI agent economy on Arc (Circle L1). It enables instant, sub-8ms private USDC micropayments over HTTP 402 with zero on-chain signer surveillance.",
    content: `
# Introduction to ArcNano

ArcNano provides autonomous AI agents with instant, mathematically private micropayments over the web standard **HTTP 402 Payment Required (\`X402\`)** protocol.

## Why Autonomous Agents Need Shielded Nanopayments

Autonomous AI agents (built on frameworks like LangChain, AutoGPT, and CrewAI) are increasingly paying web services, compute oracles, and data scrapers for granular, real-time intelligence. 

However, paying via traditional EVM transactions fails catastrophically:
1. **Public Surveillance:** Every prompt API call creates an on-chain transaction that logs the agent's wallet address (\`msg.sender\`) on the block explorer, permanently exposing proprietary prompts and competitor relationships.
2. **Block Latency Mismatch:** Waiting 3 seconds for blockchain finality freezes high-speed LLMs generating 60 tokens per second (1 token every ~15ms).
3. **Mixer Bans:** Traditional mixers pool clean and stolen funds indiscriminately, resulting in global regulatory blacklists.

> [!NOTE]
> ArcNano solves all three issues by combining **20-level Circom Groth16 zero-knowledge proofs**, **Association Set Provider (ASP) compliance verification**, and **receiver-batched Circle Gas Station settlement**.

## Institutional Validation: The Machine-Native Economy

In their landmark research report *"The Machine-Native Economy"*, **BlackRock** outlined how artificial intelligence and decentralized finance are converging:
- **Machine-Native Intelligence vs. Machine-Native Money:** BlackRock framed AI as machine-native intelligence and stablecoins as machine-native money.
- **The Machine Speed Requirement:** Autonomous agents require a financial settlement rail that operates at "machine speed" with near-zero latency.
- **The HTTP 402 Standard:** BlackRock explicitly cited open protocols like **x402 (HTTP 402 Payment Required)** as the foundation for autonomous machine commerce.
- **Circle CEO Jeremy Allaire** noted: *"The machines have chosen. AI agents have effectively chosen USDC as their native currency."*

However, BlackRock identified that real-world adoption is currently bottlenecked by unsolved challenges in **agent identity, trust, and privacy**. ArcNano delivers this missing cryptographic privacy and speed layer.

## Key Specifications

- **Settlement Layer:** Arc Testnet (Circle L1, Chain ID \`5042002\`)
- **Gas Token:** Native USDC (Sponsored 100% via Circle Gas Station Paymaster)
- **Zero-Knowledge Curve:** BN254 (\`alt_bn128\`)
- **Circuit Framework:** Circom 2.1 (\`spend.circom\`, \`merkle.circom\`, \`asp_check.circom\`)
- **Off-Chain Verification Latency:** Benchmarked at **0.0024 ms** (< 8ms target)
- **On-Chain Pool Solvency:** 100% mathematically invariant across 128,000 state transitions
`,
  },

  "threat-model": {
    id: "threat-model",
    title: "The 4 Web3 Surveillance Traps",
    category: "Getting Started & Architecture",
    summary: "Detailed analysis of why standard crypto payments leak sensitive prompt intelligence and how ArcNano breaks all four traps.",
    content: `
# The 4 Web3 Surveillance Traps

When designing payment rails for autonomous machine-to-machine commerce, four fatal architectural traps emerge in public blockchains:

### 1. The \`msg.sender\` Public Surveillance Trap
In standard ERC-20 / EVM payments, the calling entity is permanently encoded as \`msg.sender\`.
- **The Danger:** Competitors and surveillance firms crawl Arcscan to monitor which AI models an agent queries, how frequently it queries financial oracles, and what IP addresses it interacts with.
- **ArcNano Solution:** The payer never signs an on-chain spend transaction. Instead, the payer hands a self-verifying Groth16 proof to the API provider over HTTP. The API provider claims the funds. The payer's address is 0% visible.

### 2. The Naive ZK Trap
A common misconception is: *"I will just use a ZK proof to hide the payment."*
- **The Danger:** If your wallet signs the Ethereum transaction that calls \`ArcNanoPool.spend(proof)\`, your address is still broadcast in the transaction envelope. The ZK proof hides the note, but the transaction signer is fully doxxed!
- **ArcNano Solution:** Signer decoupling. Proofs travel inside the \`X-PAYMENT\` HTTP request header. Settlement transactions are batched on-chain by the receiver or relayer.

### 3. The Mixer Sanctions Trap (Tornado Cash Dilemma)
Legacy mixers pool clean and illicit funds indistinguishably.
- **The Danger:** Regulators (such as OFAC) sanction the entire contract pool. Enterprise APIs and legal AI gateways refuse to accept mixer funds because they cannot prove non-involvement in money-laundering clusters.
- **ArcNano Solution:** Privacy Pools standard via **Association Set Providers (ASP)**. The circuit enforces:
  $$\\text{VerifyMembership}(\\text{aspRoot}, \\text{commitment}) == 1$$
  Agents mathematically prove non-membership in sanctioned clusters without revealing which note is theirs.

### 4. The 3-Second Blockchain Latency Mismatch
Even with Arc's rapid 3-second block finality, 3,000 milliseconds is an eternity for an agent streaming LLM tokens at 60 tokens/second (one token every ~15ms).
- **The Danger:** Chaining 5 multi-agent tool calls forces 15 seconds of pure blockchain idle lag.
- **ArcNano Solution:** Two-Stage clearance. Stage 1 verifies the Groth16 bilinear pairing off-chain in RAM in **0.0024 ms**, unblocking immediate token streaming. Stage 2 settles the batch on Arc L1 asynchronously.
`,
  },

  architecture: {
    id: "architecture",
    title: "Protocol Architecture & Flow",
    category: "Getting Started & Architecture",
    summary: "Complete end-to-end request lifecycle from deposit to HTTP 402 challenge, Groth16 proving, and Arc L1 batch settlement.",
    content: `
# Protocol Architecture & Flow

ArcNano operates on a decoupled two-stage architecture:

\`\`\`
   ┌────────────────────────────────────────────────────────┐
   │                ARCNANO PROTOCOL STACK                  │
   │                                                        │
   │  [Circom + Groth16]  ──>  [ArcNanoPool.sol] ──> [X402] │
   │   Off-chain proofs        Arc Note Pool      HTTP API  │
   └────────────────────────────────────────────────────────┘
\`\`\`

:::flow-payment

## End-to-End Sequence

1. **One-Time Deposit (Shielding):**
   - Agent generates random \`secret\` and \`nullifier_seed\` in RAM.
   - Computes: \`commitment = Poseidon(0.01 USDC, secret, nullifier_seed)\`.
   - Calls \`ArcNanoPool.deposit(commitment)\` on Arc Testnet.
   - Pool inserts leaf into 20-level Merkle tree ($2^{20} = 1,048,576$ notes capacity).

2. **Autonomous X402 Negotiation:**
   - Agent requests \`POST /api/v1/inference\`.
   - API Gateway intercepts and returns **\`HTTP 402 Payment Required\`** with invoice headers:
     - \`X402-Pool\`: Pool contract address
     - \`X402-Recipient\`: Provider's payout wallet
     - \`X402-Root\`: Active deposit Merkle root
     - \`X402-Asp-Root\`: Sanction registry Merkle root

3. **In-Memory Groth16 Witness & Proving:**
   - Agent prover runs \`spend.circom\` in client RAM (< 100ms).
   - Generates $\\pi_A, \\pi_B, \\pi_C$ BN254 points binding \`recipient\`.
   - Attaches payload to request header: \`X-PAYMENT: { proof, root, nullifierHash, recipient, aspRoot }\`.

4. **Stage 1: Sub-8ms Local RAM Verification (< 8ms):**
   - API Gateway verifies bilinear pairing check:
     $$e(\\pi_A, \\pi_B) = e(\\alpha, \\beta) \\cdot e(x \\cdot \\gamma) \\cdot e(\\pi_C, \\delta)$$
   - Checks local nullifier cache (< 0.05ms) to prevent replay.
   - Returns **\`HTTP 200 OK\`** and streams LLM tokens immediately.

5. **Stage 2: Asynchronous Arc L1 Batch Settlement (3s):**
   - Provider queues verified nullifiers.
   - Broadcasts \`ArcNanoPool.batchSpend(proofs, recipient)\` via Circle Gas Station Paymaster.
   - **User pays $0.00 gas.**
`,
  },

  "privacy-guarantees": {
    id: "privacy-guarantees",
    title: "What Type of Privacy Users Get",
    badge: "Core Privacy",
    category: "User Privacy Model",
    summary: "Comprehensive breakdown of user privacy: signer unlinkability, zero prompt IP leakage, note secret confidentiality, and ASP compliance.",
    content: `
# What Type of Privacy Users Get

When using ArcNano, users and autonomous agents receive **mathematically proven Zero-Knowledge privacy** across four distinct operational dimensions:

:::flow-privacy

## 1. 0% On-Chain Signer Traceability (\`msg.sender\` Severed)
- **Traditional Crypto:** Your wallet address is the signer (\`msg.sender\`) on every call. Anyone tracking the explorer knows which APIs you use.
- **ArcNano Guarantee:** **You never sign or broadcast an on-chain transaction when spending.** The proof is handed off-chain to the API receiver. When the API receiver settles the notes on Arc L1, the explorer only shows the API receiver claiming funds from the pool. Your wallet address is **100% absent from the transaction envelope**.

## 2. Zero Prompt Intelligence & Counterparty Leakage
- **Traditional Crypto:** Inferences, prompt triggers, trading agent models, and data oracle subscriptions are exposed on public ledgers.
- **ArcNano Guarantee:** The link between the depositor wallet and the API service is severed. Neither blockchain miners, validators, nor competitors can determine which depositor paid which API service.

## 3. Cryptographic Note Credential Secrecy
- **How Secrets Are Kept:** Notes are derived from two cryptographically secure 256-bit random scalars: \`secret\` and \`nullifier_seed\`.
- **Preimage Resistance:** The on-chain contract only ever receives:
  $$\\text{commitment} = \\text{Poseidon}(0.01\\text{ USDC}, \\text{secret}, \\text{nullifier\\_seed})$$
  Due to the one-way properties of the Poseidon algebraic hash function, no quantum or classical computer can invert the commitment to learn your secret credentials.

## 4. Privacy Pools Compliance Without Doxxing
- **Traditional Privacy:** Mixers force you to choose between being sanctioned or doxxed.
- **ArcNano Guarantee:** You prove inclusion in an Association Set of non-sanctioned deposits:
  $$\\text{VerifyMembership}(\\text{aspRoot}, \\text{commitment}) == 1$$
  The API provider verifies OFAC/KYC compliance with mathematical certainty **without ever knowing who you are**.

> [!IMPORTANT]
> In summary: **You get total privacy regarding who you pay and what you query, while maintaining 100% legal compliance through zero-knowledge proofs.**
`,
  },

  "signer-decoupling": {
    id: "signer-decoupling",
    title: "Signer Decoupling (0% msg.sender)",
    category: "User Privacy Model",
    summary: "How ArcNano breaks the transaction signer link using receiver-batched settlement and Circle Gas Station sponsorship.",
    content: `
# Signer Decoupling: Breaking the \`msg.sender\` Link

In Ethereum and EVM-compatible blockchains, every transaction requires a cryptographic signature from a private key. That signer is permanently etched into the block header as \`msg.sender\`.

\`\`\`
Traditional EVM Spend:
[Agent Wallet] ──(signs on-chain tx)──> [ArcNanoPool.spend()]
                                                │
                                                ▼
                                    Explorer logs msg.sender! (DOXXED)

ArcNano Decoupled Spend:
[Agent Wallet] ──(HTTP 402 header)───> [API Provider Gateway]
                                                │
                                                ▼
[API Provider] ──(batched claim)──────> [ArcNanoPool.batchSpend()]
                                                │
                                                ▼
                                    Explorer logs API Provider!
                                    Agent Wallet: 0% Traceability
\`\`\`

## The Receiver-Batched Settlement Model

1. **Self-Verifying Groth16 Proofs:**
   The Groth16 proof generated in the agent's RAM is a complete, self-verifying mathematical certificate. It does not require a signature from the agent's wallet to be valid.
2. **Receiver Settlement:**
   The API Provider (receiver) is the entity that needs the money! Therefore, the API Provider acts as the relayer that calls \`ArcNanoPool.batchSpend()\`.
3. **Circle Gas Station Sponsorship:**
   Arc natively features **Circle Gas Station (Paymaster)** support. This allows the API provider to sponsor transaction gas seamlessly, completely decoupling gas token funding graphs from the end user.
`,
  },

  "asp-compliance": {
    id: "asp-compliance",
    title: "Privacy Pools (ASP Compliance)",
    category: "User Privacy Model",
    summary: "How Association Set Providers allow zero-knowledge proof of non-sanctioned funds without revealing identity.",
    content: `
# Privacy Pools & Association Set Provider (ASP) Compliance

Regulatory bans on protocols like Tornado Cash occurred because mixers pool stolen, sanctioned, and clean deposits into a single indistinguishable anonymity set.

ArcNano implements the **Privacy Pools Association Set Provider (ASP)** architecture in Circom:

## How ASP Verification Works

1. **The Sanction Registry Tree:**
   Compliance providers (e.g. Chainalysis, Elliptic, TRM Labs) maintain an on-chain Merkle root (\`aspRoot\`) of deposits that are verified to be free of OFAC sanctions and illicit clusters.
2. **The Zero-Knowledge Non-Membership Constraint:**
   Inside \`spend.circom\`, the circuit enforces:
   \`\`\`circom
   component aspVerifier = ASPVerifier(levels);
   aspVerifier.leaf <== commitment;
   for (var i = 0; i < levels; i++) {
       aspVerifier.aspPathElements[i] <== aspPathElements[i];
       aspVerifier.aspPathIndices[i] <== aspPathIndices[i];
   }
   aspRoot === aspVerifier.aspRoot;
   \`\`\`
3. **The Result:**
   The agent proves: *"My note commitment belongs to the compliant deposit set \`aspRoot\`."*
   The server verifies compliance before releasing tokens, ensuring **100% legal compliance without identity doxxing**.
`,
  },

  "fraud-prevention": {
    id: "fraud-prevention",
    title: "How Users & APIs Are Protected",
    badge: "Anti-Fraud",
    category: "Fraud & Theft Prevention",
    summary: "Comprehensive analysis of anti-fraud mechanisms: proof theft prevention, on-chain solvency, replay attack immunity, and double-spend mitigation.",
    content: `
# How Users & API Providers Are Protected Against Fraud

A common concern in decentralized payments is: *"How do we prevent fraud, theft, and double-spending if proofs are transmitted off-chain?"*

ArcNano provides multi-layered defenses protecting both parties:

\`\`\`
┌────────────────────────────────────────────────────────┐
│            ARCNANO 4-TIER ANTI-FRAUD SHIELD            │
├────────────────────────────────────────────────────────┤
│ 1. Proof Theft Protection   ──> Recipient Quad Binding │
│ 2. Smart Contract Solvency  ──> Invariant Nullifier Map│
│ 3. Off-Chain Replay Defense ──> Sub-0.05ms Memory Cache│
│ 4. M2M Double-Spend Defense ──> Shared Mempool & Gossip│
└────────────────────────────────────────────────────────┘
\`\`\`

## 1. Can an eavesdropper or relayer steal my proof?
**No. Mathematically Impossible.**
The circuit includes a quadratic constraint binding the payout address (\`recipient * recipient\`). If a rogue relayer modifies the recipient address to their own wallet, the Groth16 bilinear pairing equation immediately breaks.

## 2. Can a user spend the same note twice?
**No on-chain duplication is possible.**
Every note has a unique, deterministic \`nullifierHash\`. The smart contract tracks spent nullifiers in an immutable mapping. Once spent, any subsequent attempt reverts with \`NullifierAlreadySpent\`.

## 3. What if a user attacks two API servers simultaneously?
For micro-queries ($0.01), gateways use sub-millisecond local caching and shared Redis mempools. Furthermore, API providers stream responses in fractions-of-a-cent slices, capping exposure to negligible amounts.
`,
  },

  "anti-hijacking": {
    id: "anti-hijacking",
    title: "Anti-Frontrunning & Proof Hijacking",
    category: "Fraud & Theft Prevention",
    summary: "Mathematical explanation of why proofs cannot be intercepted, front-run, or stolen by malicious intermediaries.",
    content: `
# Anti-Frontrunning & Proof Hijacking Protection

If an agent sends a proof over HTTP to an API provider, what stops a malicious proxy, VPN, or eavesdropper from intercepting the proof and submitting it to ArcNanoPool to claim the 0.01 USDC for themselves?

## The Recipient Cryptographic Binding Constraint

In \`spend.circom\`, \`recipient\` is declared as a public input signal:

\`\`\`circom
// Public signals
signal input root;
signal input nullifierHash;
signal input recipient;        // Bound payout address
signal input aspRoot;

// Quadratic constraint binding recipient to prevent proof hijacking
signal recipientSquare;
recipientSquare <== recipient * recipient;
\`\`\`

### How the Math Protects You:
The Groth16 bilinear pairing check verifies:
$$e(\\pi_A, \\pi_B) = e(\\alpha, \\beta) \\cdot e\\left(\\sum_{i=0}^3 x_i \\cdot \\text{IC}_i, \\gamma\\right) \\cdot e(\\pi_C, \\delta)$$

where public inputs are:
- $x_0 = \\text{root}$
- $x_1 = \\text{nullifierHash}$
- $x_2 = \\text{recipient}$
- $x_3 = \\text{aspRoot}$

If an attacker intercepts your proof and substitutes their own wallet address $x_2'$, the linear combination $\\sum x_i \\cdot \\text{IC}_i$ changes value, and **the pairing equation fails instantly in 0.03ms**.

> [!TIP]
> A proof generated for API Provider B is mathematically worthless to any other address on Earth.
`,
  },

  "double-spend": {
    id: "double-spend",
    title: "Double-Spend & Race Condition Solutions",
    category: "Fraud & Theft Prevention",
    summary: "Detailed analysis of the off-chain race condition and how shared gateway mempools, micro-streaming, and strict mode protect providers.",
    content: `
# Double-Spend & Race Condition Solutions

### The Scenario:
Suppose malicious Agent A has **one note of 0.01 USDC**. 
It sends Proof 1 to **Server B** and Proof 2 to **Server C** in the exact same millisecond.

\`\`\`
                       ┌─── Proof 1 (for B) ───> [Server B] ──> Gives Data!
                       │
[Malicious Agent A] ──┤ (Same Note: nullifierHash 0xacec...)
                       │
                       └─── Proof 2 (for C) ───> [Server C] ──> Gives Data!
\`\`\`

:::flow-doublespend

## What Happens on Arc L1?
1. Both Server B and Server C queue the note and submit \`batchSpend()\` to Arc.
2. Whichever transaction confirms first on Arc L1 (say Server B) marks:
   \`\`\`solidity
   isSpent[0xacec...] = true;
   \`\`\`
   Server B receives the 0.01 USDC payout.
3. When Server C's batch is mined 1 block later, the contract reverts:
   \`\`\`solidity
   revert NullifierAlreadySpent(0xacec...);
   \`\`\`
4. **The smart contract NEVER pays out 0.02 USDC.** Total contract solvency is 100% preserved.

## How API Gateways Protect Server C:

### 1. Shared Gateway Mempool / Redis Gossip (The VISA Model)
Production gateways running \`arcnano-x402\` connect to a low-latency shared Redis cache of pending nullifiers. When Server C receives the request 5ms later, its gateway sees the nullifier was already claimed by Server B and rejects it with **\`HTTP 409 Conflict\`**.

### 2. Micro-Streaming (1 Token at a Time)
APIs stream in tiny fractions (e.g. $0.0005 per 50 tokens). If an unconfirmed nullifier fails settlement, the stream terminates after two words. The maximum theoretical exposure is fractions of a cent.

### 3. Configurable Strict Mode
For high-value queries (e.g. financial audits, database dumps), the provider activates \`enforceOnChainFinality: true\`, waiting 3 seconds for Arc deterministic block finality before releasing data.
`,
  },

  "solvency-invariants": {
    id: "solvency-invariants",
    title: "Smart Contract Solvency Invariants",
    category: "Fraud & Theft Prevention",
    summary: "Foundry invariant and fuzz test verification: 128,000 calls proving contract solvency under adversarial conditions.",
    content: `
# Smart Contract Solvency Invariants

The core contract [ArcNanoPool.sol](https://explorer.testnet.arc.io/address/0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca) has been tested using **Foundry Invariant Testing** with over **128,000 randomized state transitions**.

## Verified Formal Invariants

### 1. Solvency Invariant: \`invariant_PoolSolvency()\`
$$\\text{USDC.balanceOf}(\\text{ArcNanoPool}) \\equiv \\text{denomination} \\times (\\text{totalDeposits} - \\text{totalSpends})$$
- Proves that the pool's token reserves always exactly match unspent notes.
- Tested across 256 runs and 128,000 calls with **0 reverts and 0 discards**.

### 2. Monotonic Leaf Index: \`invariant_NextIndexEqualsTotalDeposits()\`
$$\\text{nextIndex} \\equiv \\text{totalDeposits}$$
- Proves that incremental Merkle tree insertions never overwrite or corrupt existing leaf commitments.

### 3. Denomination Immutability: \`invariant_DenominationConstant()\`
- Proves that note denominations cannot be altered during contract execution, preventing flash-loan or inflationary exploits.
`,
  },

  "spend-circuit": {
    id: "spend-circuit",
    title: "spend.circom Constraint Breakdown",
    category: "Zero-Knowledge Cryptography",
    summary: "Deep-dive into the Circom 2.1 spend circuit and R1CS constraints.",
    content: `
# spend.circom Constraint Breakdown

The protocol's cryptographic core is implemented in [circuits/spend.circom](https://github.com/Trymbakmahant/arcnano/blob/main/circuits/spend.circom):

:::flow-circuit

\`\`\`circom
pragma circom 2.1.6;

template ArcNanoSpend(levels) {
    // --- Public Signals ---
    signal input root;
    signal input nullifierHash;
    signal input recipient;
    signal input aspRoot;

    // --- Private Witness Signals ---
    signal input denomination;
    signal input secret;
    signal input nullifierSeed;
    signal input pathElements[levels];
    signal input pathIndices[levels];
    signal input aspPathElements[levels];
    signal input aspPathIndices[levels];

    // 1. Commitment Formation
    component commitmentHasher = Poseidon(3);
    commitmentHasher.inputs[0] <== denomination;
    commitmentHasher.inputs[1] <== secret;
    commitmentHasher.inputs[2] <== nullifierSeed;
    signal commitment <== commitmentHasher.out;

    // 2. Nullifier Derivation
    component nullifierHasher = Poseidon(2);
    nullifierHasher.inputs[0] <== nullifierSeed;
    nullifierHasher.inputs[1] <== secret;
    nullifierHash === nullifierHasher.out;

    // 3. Merkle Deposit Inclusion Proof
    component treeVerifier = MerkleProof(levels);
    treeVerifier.leaf <== commitment;
    // ...
    root === treeVerifier.root;

    // 4. ASP Compliance Proof
    component aspVerifier = ASPVerifier(levels);
    // ...
    aspRoot === aspVerifier.aspRoot;

    // 5. Anti-Frontrunning Recipient Binding
    signal recipientSquare;
    recipientSquare <== recipient * recipient;
}
\`\`\`
`,
  },

  "groth16-pairings": {
    id: "groth16-pairings",
    title: "Bilinear Pairings & BN254 Curve",
    category: "Zero-Knowledge Cryptography",
    summary: "Mathematical explanation of pairing precompiles (0x06, 0x07, 0x08) on BN254.",
    content: `
# Bilinear Pairings on BN254 alt_bn128

ArcNano utilizes the **BN254 (alt_bn128)** pairing-friendly elliptic curve, natively supported by Ethereum and Arc L1 via precompiled contracts:
- \`0x06\`: \`ecAdd\` (Point addition on G1)
- \`0x07\`: \`ecMul\` (Scalar multiplication on G1)
- \`0x08\`: \`ecPairing\` (Bilinear pairing check)

## Bilinear Pairing Equation
A Groth16 proof consists of three group points:
$$\\pi_A \\in G_1, \\quad \\pi_B \\in G_2, \\quad \\pi_C \\in G_1$$

The verifier checks that:
$$e(\\pi_A, \\pi_B) = e(\\alpha, \\beta) \\cdot e\\left(\\sum_{i=0}^3 x_i \\cdot \\text{IC}_i, \\gamma\\right) \\cdot e(\\pi_C, \\delta)$$

### Performance:
- **Off-Chain (RAM):** Verified in **0.0024 ms** via WASM / snarkjs.
- **On-Chain (Arc L1):** Verified in ~210,000 gas per single spend, amortized to pennies during batch spends.
`,
  },

  "poseidon-merkle": {
    id: "poseidon-merkle",
    title: "20-Level Poseidon Merkle Tree",
    category: "Zero-Knowledge Cryptography",
    summary: "20-level binary Merkle tree capacity (1,048,576 notes) using Poseidon(2) hash functions.",
    content: `
# 20-Level Poseidon Merkle Tree

ArcNano organizes deposits into an incremental 20-level binary Merkle tree:
- **Tree Depth:** 20 levels
- **Total Capacity:** $2^{20} = 1,048,576$ shielded deposit notes
- **Hash Function:** Poseidon(2) algebraic hash (optimized for arithmetic circuits)

## Why Poseidon over SHA-256 / Keccak?
- SHA-256 requires ~25,000 R1CS constraints per hash.
- Poseidon requires only ~240 R1CS constraints per hash, making in-browser witness generation **100x faster**.
`,
  },

  "sdk-express": {
    id: "sdk-express",
    title: "arcnano-x402 Middleware",
    category: "Developer SDKs & Gateway Tooling",
    summary: "Guide to monetizing Express and Fastify endpoints using arcnano-x402 on npm.",
    content: `
# arcnano-x402 Middleware Guide

[![npm version](https://img.shields.io/npm/v/arcnano-x402.svg?color=emerald)](https://www.npmjs.com/package/arcnano-x402)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Arc Testnet](https://img.shields.io/badge/Arc_Testnet-5042002-blue.svg)](https://explorer.testnet.arc.io)

The **\`arcnano-x402\`** package is officially published on npm: **[npmjs.com/package/arcnano-x402](https://www.npmjs.com/package/arcnano-x402)**.
It allows API providers to monetize Express and Node.js endpoints with sub-8ms off-chain ZK verification and automated Arc Testnet batch settlement in 3 lines of code:

## Installation

\`\`\`bash
npm install arcnano-x402
# or
pnpm add arcnano-x402
# or
yarn add arcnano-x402
\`\`\`

## Quickstart

\`\`\`typescript
import express from "express";
import { x402PaymentMiddleware } from "arcnano-x402";

const app = express();
app.use(express.json());

// Guard autonomous AI endpoint
app.use(
  "/api/v1/inference",
  x402PaymentMiddleware({
    recipient: "0x063829800C7214C6AaD38f57C72561641cD80333", // Payout wallet
    poolAddress: "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca", // ArcNanoPool on Arc
    denomination: "10000", // 0.01 USDC
    batchSize: 10, // Settle every 10 notes on Arc L1
  })
);

app.post("/api/v1/inference", (req, res) => {
  // Access verified cryptographic payment context
  console.log("Verified nullifier:", req.payment.nullifierHash);
  console.log("Verification latency:", req.payment.verificationLatencyMs, "ms");
  console.log("Denomination:", req.payment.denominationFormatted);

  res.json({ tokens: ["Streamed", "LLM", "tokens", "delivered"] });
});

app.listen(3000, () => {
  console.log("X402 gateway running on http://localhost:3000");
});
\`\`\`

## Package Details
- **npm Registry**: [https://www.npmjs.com/package/arcnano-x402](https://www.npmjs.com/package/arcnano-x402)
- **Settlement Network**: Arc Testnet (Circle L1, Chain ID 5042002)
- **Pool Contract**: \`0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca\`
`,
  },

  "sdk-python": {
    id: "sdk-python",
    title: "arczk-agent Python SDK",
    category: "Developer SDKs & Gateway Tooling",
    summary: "Guide to building autonomous AI agents with arczk-agent on PyPI for LangChain, AutoGPT, and CrewAI.",
    content: `
# arczk-agent Python SDK Guide

[![PyPI version](https://img.shields.io/pypi/v/arczk-agent.svg?color=emerald)](https://pypi.org/project/arczk-agent/)
[![Python Version](https://img.shields.io/badge/python-3.9+-blue.svg)](https://pypi.org/project/arczk-agent/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

The **\`arczk-agent\`** package is officially published on PyPI: **[pypi.org/project/arczk-agent/](https://pypi.org/project/arczk-agent/)**.
It empowers autonomous AI agents (LangChain, CrewAI, AutoGPT) to execute instant, privacy-preserving micropayments over HTTP 402 with zero on-chain signer surveillance.

## Installation

\`\`\`bash
pip install arczk-agent
# or using uv:
uv pip install arczk-agent
# with LangChain support:
pip install "arczk-agent[langchain]"
\`\`\`

## Quickstart

\`\`\`python
from arczk import ArcAgentClient, NoteVault

# 1. Initialize local shielded note vault
vault = NoteVault("~/.arcnano/vault.json")
vault.create_note(denomination=10000) # 0.01 USDC note

# 2. Autonomous HTTP client
client = ArcAgentClient(vault=vault)

# 3. Request paid endpoint: Automatically catches HTTP 402, constructs ZK proof, and retries!
response = client.post(
    "https://api.inference.ai/v1/inference",
    json={"prompt": "Analyze autonomous financial markets on Arc"}
)

print(response.json())
\`\`\`

## Package Details
- **PyPI Registry**: [https://pypi.org/project/arczk-agent/](https://pypi.org/project/arczk-agent/)
- **Framework Support**: Native tools for LangChain (\`ArcNanoLangChainTool\`) and CrewAI (\`ArcNanoPaymentTool\`)
- **Privacy Guarantee**: Zero public signer leakage, RAM-based Groth16 spend proof generation
`,
  },

  modes: {
    id: "modes",
    title: "Fast Mode vs Strict Finality Mode",
    category: "Developer SDKs & Gateway Tooling",
    summary: "Choosing between Fast Mode (<8ms RAM clearance) and Strict Finality Mode (3s on-chain confirmation).",
    content: `
# Fast Mode vs Strict Finality Mode

API providers can configure their risk profile in \`arcnano-x402\`:

### Fast Mode (Default)
- **Latency:** **0.0024 ms** in local RAM.
- **Use Case:** High-frequency token streaming, web scraping, compute queries ($0.001 - $0.05).
- **Settlement:** Asynchronous background batching on Arc L1.

### Strict Finality Mode
- **Latency:** **3 seconds** (Arc deterministic block finality).
- **Use Case:** High-value data downloads, financial execution reports ($1.00 - $100.00).
- **Settlement:** Synchronous on-chain verification before releasing response.
`,
  },

  "contracts-reference": {
    id: "contracts-reference",
    title: "ArcNanoPool.sol Reference",
    category: "Arc Network Smart Contracts",
    summary: "Solidity API reference and function signatures for ArcNanoPool.sol.",
    content: `
# ArcNanoPool.sol Contract Reference

The contract is deployed and verified on:
- **Arc Mainnet (Chain 5042):** [\`0x8D49FE6B8EfA2C10486374CaE243243e18D1b5Dd\`](https://explorer.arc.io/address/0x8D49FE6B8EfA2C10486374CaE243243e18D1b5Dd)
- **Arc Testnet (Chain 5042002):** [\`0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca\`](https://explorer.testnet.arc.io/address/0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca)

## Function Signatures

### \`deposit(bytes32 commitment)\`
Deposits fixed denomination token value and inserts commitment into 20-level Merkle tree.

### \`spend(SpendProof calldata proof, address recipient)\`
Spends a single note and delivers denomination amount to recipient address.

### \`batchSpend(SpendProof[] calldata proofs, address recipient)\`
Batches multiple verified proofs into a single transaction with sponsored gas.

\`\`\`solidity
struct SpendProof {
    uint256[2] a;
    uint256[2][2] b;
    uint256[2] c;
    bytes32 root;
    bytes32 nullifierHash;
    bytes32 aspRoot;
}
\`\`\`
`,
  },

  "mainnet-details": {
    id: "mainnet-details",
    title: "Arc Mainnet (Chain 5042) Live Deployment",
    badge: "LIVE MAINNET",
    category: "Arc Network Smart Contracts",
    summary: "Production verified ArcNano smart contracts deployed live on Arc Network Mainnet.",
    content: `
# Arc Network Mainnet (Chain ID 5042) Configuration

ArcNano is officially deployed and live on **Arc Network Mainnet**. All transactions are validated using Circle's native USDC gas asset and real production BN254 Groth16 zk-SNARK pairing verifiers.

- **Network Name:** Arc Mainnet
- **Chain ID:** \`5042\` (\`0x13b2\`)
- **RPC Endpoint:** \`https://rpc.mainnet.arc.io\`
- **Block Explorer:** [https://explorer.arc.io](https://explorer.arc.io)
- **Deployment Block:** \`25971813\`
- **Native Gas Token:** USDC (\`0x3600000000000000000000000000000000000000\`)
- **Fixed Note Denomination:** \`10,000\` raw units ($0.01 USDC)

---

## Production Mainnet Contracts

| Contract | Address | Arc Explorer |
| :--- | :--- | :--- |
| **\`ArcNanoPool\` (0.01 USDC Pool)** | \`0x8D49FE6B8EfA2C10486374CaE243243e18D1b5Dd\` | [View on Arc Explorer](https://explorer.arc.io/address/0x8D49FE6B8EfA2C10486374CaE243243e18D1b5Dd) |
| **\`BatchDeposit\` (0.01 USDC Batcher)** | \`0x34e54d470E4D95B3cFD8d6089Ae742346C19Af50\` | [View on Arc Explorer](https://explorer.arc.io/address/0x34e54d470E4D95B3cFD8d6089Ae742346C19Af50) |
| **\`ArcNanoPool\` (1.00 USDC Pool)** | \`0x385394d11a93e84452970acf958bDdAab34f208f\` | [View on Arc Explorer](https://explorer.arc.io/address/0x385394d11a93e84452970acf958bDdAab34f208f) |
| **\`BatchDeposit\` (1.00 USDC Batcher)** | \`0x006B10444dd88e463E93a7f4769b6885C7fa7b3b\` | [View on Arc Explorer](https://explorer.arc.io/address/0x006B10444dd88e463E93a7f4769b6885C7fa7b3b) |
| **\`Groth16Verifier\`** (BN254) | \`0x809199ab5AB49FbF69f13dc9F28BCD157494C607\` | [View on Arc Explorer](https://explorer.arc.io/address/0x809199ab5AB49FbF69f13dc9F28BCD157494C607) |
| **\`KeccakHasher\`** | \`0xa7507BBED66D2a26331cF4C1f5A16C9462241954\` | [View on Arc Explorer](https://explorer.arc.io/address/0xa7507BBED66D2a26331cF4C1f5A16C9462241954) |
| **Native USDC Token** | \`0x3600000000000000000000000000000000000000\` | [View on Arc Explorer](https://explorer.arc.io/token/0x3600000000000000000000000000000000000000) |

---

## On-Chain Verification & Deployment Hashes

- **0.01 Pool Contract Tx:** [\`0x3086a382e9bafa1c1b9e804985bcc87b35e721dcc350d1319aa7a244390c0ef3\`](https://explorer.arc.io/tx/0x3086a382e9bafa1c1b9e804985bcc87b35e721dcc350d1319aa7a244390c0ef3)
- **0.01 Batcher Contract Tx:** [\`0x8dd1a38735bf2963d494e1dd1a7480f550fee482f40ba082c257f19eb41b6223\`](https://explorer.arc.io/tx/0x8dd1a38735bf2963d494e1dd1a7480f550fee482f40ba082c257f19eb41b6223)
- **1.00 Pool Contract Tx:** [\`0xe91d00146e485425484e742fa9c5975cf3e30b07296e58960e8a437fb3f5816e\`](https://explorer.arc.io/tx/0xe91d00146e485425484e742fa9c5975cf3e30b07296e58960e8a437fb3f5816e)
- **1.00 Batcher Contract Tx:** [\`0x2ebe085d774851e63c83014115f9e7e46eb8d0fc3f9ff2b3ad5f046aab71e1ca\`](https://explorer.arc.io/tx/0x2ebe085d774851e63c83014115f9e7e46eb8d0fc3f9ff2b3ad5f046aab71e1ca)
- **Verifier Contract Tx:** [\`0x1665be07712a4c63a82ceb2dca7c23df81d12045d67d69e49a16bc76411f348e\`](https://explorer.arc.io/tx/0x1665be07712a4c63a82ceb2dca7c23df81d12045d67d69e49a16bc76411f348e)
- **Hasher Contract Tx:** [\`0x767ebafba6b4733ff0fa0fdc8ac01b095ad3f119cdd3b0fa4efb20d0fc3f4ef3\`](https://explorer.arc.io/tx/0x767ebafba6b4733ff0fa0fdc8ac01b095ad3f119cdd3b0fa4efb20d0fc3f4ef3)
- **Deployer Wallet:** [\`0x0e3616146024A81aA6C31FdA02458a01Bc903315\`](https://explorer.arc.io/address/0x0e3616146024A81aA6C31FdA02458a01Bc903315)
`,
  },

  "testnet-details": {
    id: "testnet-details",
    title: "Arc Testnet (Circle L1) Details",
    category: "Arc Network Smart Contracts",
    summary: "RPC endpoints, chain ID, explorer links, and testnet addresses.",
    content: `
# Arc Testnet (Circle L1) Configuration

- **Network Name:** Arc Testnet
- **Chain ID:** \`5042002\` (\`0x4cef52\`)
- **RPC Endpoint:** \`https://rpc.testnet.arc.network\`
- **Block Explorer:** \`https://explorer.testnet.arc.io\`
- **Native Gas Token:** USDC (6 decimals)
- **ArcNanoPool (0.01 USDC):** \`0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca\`
- **BatchDeposit (0.01 USDC):** \`0xD20E2c9aa6C291c15571440DAc7a6e773EC386e4\`
- **ArcNanoPool (1.00 USDC):** \`0x716F5ea75f0B2a27c7a50F25E8Bb343A3B3530CB\`
- **BatchDeposit (1.00 USDC):** \`0x76f7EA532E8080211d9B6Dcc03976c2101c7Ab86\`
- **KeccakHasher:** \`0x55D7077905E7FFaFaeCF3B3F74AD8278822f5f70\`
- **MockVerifier:** \`0x6Cf1C6131ddFaAb2c965d2a8E04F20809e8d0d82\`
`,
  },

  marketplace: {
    id: "marketplace",
    title: "Arc Agent Marketplace",
    badge: "Live",
    category: "Developer SDKs & Gateway Tooling",
    summary:
      "Decentralized catalog of HTTP 402 AI agent APIs and tools monetized with ArcNano shielded micropayments.",
    content: `
# Arc Agent Marketplace

The **Arc Agent Marketplace** ([marketplace.arcnano.xyz](https://marketplace.arcnano.xyz/)) is an open registry and execution platform where autonomous AI agents and developers discover, test, and purchase API services using zero-knowledge shielded notes.

## Live X402 Endpoints

All endpoints require zero API keys and accept instant Groth16 spend proofs:

| Service | Category | Endpoint | Price | Description |
| :--- | :--- | :--- | :--- | :--- |
| **DeepSeek-R1 CoT** | Sub-Agents | \`/api/v1/x402/deepseek-r1\` | $0.01 USDC | Chain-of-thought mathematical reasoning model |
| **Stealth Web Scraper** | MCP | \`/api/v1/x402/web-scraper\` | $0.01 USDC | Headless extraction with anti-bot bypass |
| **Solidity ZK Auditor** | Security | \`/api/v1/x402/contract-audit\` | $0.01 USDC | Automated invariant and solvency analysis |
| **Crypto Alpha Sentiment** | Feeds | \`/api/v1/x402/crypto-sentiment\` | $0.01 USDC | Real-time social sentiment signals |
| **Ephemeral WASM Sandbox** | Compute | \`/api/v1/x402/code-sandbox\` | $0.01 USDC | Isolated micro-compute execution environment |

## Automated MCP Execution

Antigravity or any agent running the ArcNano MCP Server can automatically execute these endpoints using local shielded notes:

\`\`\`json
// Tool: arcnano:pay_x402_api
{
  "url": "https://marketplace.arcnano.xyz/api/v1/x402/deepseek-r1",
  "json_body": {
    "prompt": "Evaluate optimal routing path for 100k USDC swap"
  }
}
\`\`\`
`,
  },

  "relayer-overview": {
    id: "relayer-overview",
    title: "Batch Relayer Architecture",
    badge: "Live API",
    category: "Automated Relayer Backend",
    summary:
      "ArcNano's automated relayer backend ingests zero-knowledge spend proofs off-chain, deduplicates nullifiers, partitions queues by recipient, and executes gas-sponsored batchSpend settlements on Arc Network with sub-second finality.",
    content: `
# Batch Relayer Architecture

The **ArcNano Batch Relayer** is a high-throughput, non-custodial middleware service that decouples AI agents from direct on-chain transaction execution.

Instead of requiring autonomous agents to manage native gas balances and broadcast individual on-chain transactions for every single micropayment, agents generate zero-knowledge Groth16 spend proofs and transmit them to API gateways or the relayer backend via HTTP headers.

> [!NOTE]
> **Production Live Endpoint:** \`https://arcnano.onrender.com\`  
> **Network:** Arc Testnet (\`5042002\`) & Arc Mainnet (\`5042\`)  
> **Gas Sponsorship:** 100% covered by **Arc Circle Gas Station Paymaster** ($0.00 gas for agents)

---

## Why an Automated Relayer is Essential

1. **Zero Signer Surveillance (0% \`msg.sender\`):**  
   If an agent broadcasts a transaction directly from its wallet, its on-chain identity is permanently linked on the block explorer. With the relayer, the relayer's address is the on-chain \`msg.sender\`, preserving complete anonymity for the agent.
2. **Sub-Cent Economic Viability:**  
   Submitting an individual blockchain transaction for a $0.01 or $0.001 micropayment wastes gas and congests the network. The relayer aggregates dozens of unspent notes and settles them in a single \`batchSpend\` call.
3. **No Native Gas Required for Agents:**  
   AI agents only hold shielded USDC notes. They never need to acquire or manage native ARC tokens for gas.

---

## Relayer Lifecycle & Flow

\`\`\`mermaid
flowchart TD
    subgraph Agents["Clients & AI Agents"]
        AgentA["Autonomous Agent (Python / TypeScript)"]
        User["User / Playground Interface"]
    end

    subgraph Relayer["ArcNano Batch Relayer (https://arcnano.onrender.com)"]
        API["REST API Ingestion (/v1/proofs/submit)"]
        Storage[("Persistent Proof Store (Disk JSON)")]
        Dedupe{"Fast Nullifier Index"}
        Partition["Multi-Recipient Queue Partitioning"]
        Batcher["On-Chain Settlement Engine"]
    end

    subgraph Blockchain["Arc Network (Circle L1)"]
        Pool["ArcNanoPool.sol (0xa40d... / 0x8D49...)"]
        Paymaster["Circle Gas Station Paymaster"]
        Recipient["Recipient Wallet Address"]
    end

    AgentA -->|POST /v1/proofs/submit| API
    User -->|POST /v1/proofs/submit| API
    API --> Dedupe
    Dedupe -->|Duplicate| Reject["409 Conflict (Replay Blocked)"]
    Dedupe -->|Novel| Storage
    Storage --> Partition
    Partition -->|Queue >= BATCH_THRESHOLD or Auto-Flush Timer| Batcher
    Batcher -->|batchSpend(proofs, recipient)| Pool
    Pool -->|ERC-20 Transfer totalAmount| Recipient
    Pool -.->|100% Sponsored Gas| Paymaster
    Batcher -->|Record txHash & blockNumber| Storage
\`\`\`

---

## Multi-Recipient Queue Partitioning

In the smart contract [\`ArcNanoPool.sol\`](file:///Users/trymbakmahant/Projects/grant/arc/p2pzkpayment/contracts/src/ArcNanoPool.sol), the batch settlement function signature is:

\`\`\`solidity
function batchSpend(SpendProof[] calldata proofs, address recipient) external nonReentrant
\`\`\`

> [!IMPORTANT]
> Because \`batchSpend\` transfers the aggregated value (\`denomination * proofs.length\`) to a single \`recipient\`, all proofs inside an on-chain batch **must share the same recipient address**.

The ArcNano Relayer automatically groups and partitions pending notes into separate queues:
$$\\text{queueKey} = \\text{chainId} : \\text{poolAddress} : \\text{recipient}$$

- Alice's notes are accumulated in Alice's queue and settled directly to Alice.
- Bob's notes are accumulated in Bob's queue and settled directly to Bob.
- **Frontrunning or hijacking is mathematically impossible:** Groth16 public input index 2 cryptographically binds the proof to that specific recipient address.

---

## Dual Settlement Triggers

The relayer executes on-chain batch settlements through two triggers:

1. **Threshold Auto-Flush:** Whenever a specific recipient's queue reaches \`BATCH_THRESHOLD\` (default: \`5\` notes), the relayer immediately triggers an on-chain \`batchSpend\` call.
2. **Periodic Interval Flush:** A background timer runs every \`FLUSH_INTERVAL_MS\` (default: \`15,000 ms\` / 15 seconds) and settles any pending queues that have unspent notes.
3. **On-Demand Manual Flush:** Users and API providers can hit \`POST /v1/batch/withdraw\` (or \`POST /v1/flush\`) with their address to trigger instant withdrawal at any time.
`,
  },

  "relayer-api": {
    id: "relayer-api",
    title: "Relayer REST API Reference",
    badge: "Endpoints",
    category: "Automated Relayer Backend",
    summary:
      "Comprehensive REST API reference for the ArcNano Batch Relayer. Ingest proofs, inspect pending withdrawal queues, execute on-chain batch withdrawals, and track historical settled transactions.",
    content: `
# Relayer REST API Reference

The ArcNano Batch Relayer exposes a clean, standardized HTTP REST API accessible by AI agents, frontend applications, and API gateways.

> [!NOTE]
> **Production Live Endpoint:** \`https://arcnano.onrender.com\`  
> **Local Development Endpoint:** \`http://localhost:4040\` (or \`http://localhost:3000/api/relayer\`)

---

## Summary of Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| \`GET\` | \`/v1/status\` | Health check, relayer wallet address, and gas status |
| \`GET\` | \`/v1/metrics\` | Live metrics (uptime, settled notes, gas sponsored) |
| \`POST\` | \`/v1/proofs/submit\` | Ingest Groth16 spend proof into batch withdrawal queue |
| \`GET\` | \`/v1/queue\` | Inspect all pending withdrawal queues grouped by recipient |
| \`GET\` | \`/v1/proofs\` | List stored proofs with pagination and status filters |
| \`GET\` | \`/v1/proofs/:id\` | Query specific proof status, \`txHash\`, and explorer link |
| \`POST\` | \`/v1/batch/withdraw\` | Trigger on-demand on-chain \`batchSpend\` withdrawal |
| \`GET\` | \`/v1/batches\` | List historical settled batch transactions with receipts |

---

## 1. System Status & Health

### \`GET /v1/status\`
Returns operational status, network configuration, and active Circle Paymaster sponsorship.

#### Request
\`\`\`bash
curl -X GET "https://arcnano.onrender.com/v1/status"
\`\`\`

#### Response (\`200 OK\`)
\`\`\`json
{
  "status": "running",
  "metrics": {
    "uptimeSeconds": 1420,
    "totalIngested": 42,
    "totalSettledNotes": 40,
    "totalBatchesSettled": 8,
    "totalGasSponsoredUsd": "$0.0340",
    "currentQueueLength": 2
  },
  "config": {
    "batchThreshold": 5,
    "flushIntervalMs": 15000,
    "poolAddress": "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca",
    "sponsor": "Arc Circle Gas Station Paymaster"
  }
}
\`\`\`

---

## 2. Ingest Spend Proof

### \`POST /v1/proofs/submit\`
*(Aliases: \`POST /v1/submit-proof\` on Express daemon)*

Submits a verified Groth16 zero-knowledge spend proof into persistent storage. If the recipient's queue reaches the batch threshold, it automatically triggers an on-chain batch settlement.

#### Request
\`\`\`bash
curl -X POST "https://arcnano.onrender.com/v1/submit-proof" \\
  -H "Content-Type: application/json" \\
  -d '{
    "recipient": "0x8506a1aC60e574fEBc6f6301844b3DE910801020",
    "poolAddress": "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca",
    "chainId": 5042002,
    "denomination": "10000",
    "amountFormatted": "0.01 USDC",
    "payload": {
      "proof": {
        "a": ["101", "102"],
        "b": [["103", "104"], ["105", "106"]],
        "c": ["107", "108"]
      },
      "root": "15055926234077295509216400193975320613085685875483293700481590095656163448343",
      "nullifierHash": "0x1111111111111111111111111111111111111111111111111111111111111111",
      "aspRoot": "0x0000000000000000000000000000000000000000000000000000000000001337"
    }
  }'
\`\`\`

#### Response (\`200 OK\`)
\`\`\`json
{
  "success": true,
  "message": "Proof securely stored and queued for batch withdrawal (1/5 notes).",
  "proofId": "proof_1729000000000_a46f14cb",
  "queuedCount": 1,
  "batchThreshold": 5,
  "autoFlushed": false
}
\`\`\`

#### Error Responses
- **\`400 Bad Request\`**: Malformed payload, missing proof coordinates, or invalid recipient address.
- **\`409 Conflict\`**: Double-spend attempt detected. The nullifier has already been recorded or spent.

---

## 3. Inspect Pending Queues

### \`GET /v1/queue\`
Returns all pending proofs grouped by recipient, displaying pending note counts and total USDC redeemable.

#### Request
\`\`\`bash
curl -X GET "https://arcnano.onrender.com/v1/queue"
\`\`\`

#### Response (\`200 OK\`)
\`\`\`json
{
  "success": true,
  "totalQueues": 2,
  "totalPendingNotes": 4,
  "batchThreshold": 5,
  "queues": [
    {
      "queueKey": "5042002:0xa40d68fdea3b6fb01c966a9d29a6fc341ae476ca:0x8506a1ac60e574febc6f6301844b3de910801020",
      "chainId": 5042002,
      "poolAddress": "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca",
      "recipient": "0x8506a1aC60e574fEBc6f6301844b3DE910801020",
      "denomination": "10000",
      "count": 3,
      "totalUsdc": "0.03 USDC"
    },
    {
      "queueKey": "5042002:0xa40d68fdea3b6fb01c966a9d29a6fc341ae476ca:0x063829800c7214c6aad38f57c72561641cd80333",
      "chainId": 5042002,
      "poolAddress": "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca",
      "recipient": "0x063829800C7214C6AaD38f57C72561641cD80333",
      "denomination": "10000",
      "count": 1,
      "totalUsdc": "0.01 USDC"
    }
  ]
}
\`\`\`

---

## 4. Trigger Batch Withdrawal (On-Demand)

### \`POST /v1/batch/withdraw\`
*(Alias: \`POST /v1/flush\`)*

Forces the relayer to execute an on-chain \`batchSpend\` call immediately without waiting for threshold or timer.

#### Request (Flush Specific Recipient)
\`\`\`bash
curl -X POST "https://arcnano.onrender.com/v1/batch/withdraw" \\
  -H "Content-Type: application/json" \\
  -d '{"recipient": "0x8506a1aC60e574fEBc6f6301844b3DE910801020"}'
\`\`\`

#### Response (\`200 OK\`)
\`\`\`json
{
  "success": true,
  "message": "Successfully executed batch withdrawal for 3 notes (0.03 USDC) to 0x8506a1aC60e574fEBc6f6301844b3DE910801020!",
  "batch": {
    "id": "batch_1792069750098_d6ad3c",
    "recipient": "0x8506a1aC60e574fEBc6f6301844b3DE910801020",
    "proofCount": 3,
    "totalAmountFormatted": "0.03 USDC",
    "status": "settled",
    "txHash": "0xed5adea797da50402971ba29c18dda5dd209bb412e414c88574e57c6ca62b3f0",
    "explorerUrl": "https://explorer.testnet.arc.io/tx/0xed5adea797da50402971ba29c18dda5dd209bb412e414c88574e57c6ca62b3f0",
    "gasSponsoredUsd": "$0.0025",
    "settledAt": 1792069750120
  }
}
\`\`\`

---

## 5. Query Proof by ID or Nullifier

### \`GET /v1/proofs/:id\`
Retrieves the real-time settlement status of any note proof.

#### Request
\`\`\`bash
curl -X GET "https://arcnano.onrender.com/v1/proofs/proof_1729000000000_a46f14cb"
\`\`\`

#### Response (\`200 OK\`)
\`\`\`json
{
  "success": true,
  "proof": {
    "id": "proof_1729000000000_a46f14cb",
    "nullifierHash": "0x1111111111111111111111111111111111111111111111111111111111111111",
    "recipient": "0x8506a1aC60e574fEBc6f6301844b3DE910801020",
    "denomination": "10000",
    "amountFormatted": "0.01 USDC",
    "status": "settled",
    "txHash": "0xed5adea797da50402971ba29c18dda5dd209bb412e414c88574e57c6ca62b3f0",
    "blockNumber": 26084920,
    "explorerUrl": "https://explorer.testnet.arc.io/tx/0xed5adea797da50402971ba29c18dda5dd209bb412e414c88574e57c6ca62b3f0",
    "createdAt": 1792069748000,
    "updatedAt": 1792069750120
  }
}
\`\`\`
`,
  },

  "relayer-hono": {
    id: "relayer-hono",
    title: "Standalone Hono.js Deployment",
    badge: "Open Source",
    category: "Automated Relayer Backend",
    summary:
      "Guide to running and self-hosting the open-source ArcNano Hono.js TypeScript relayer backend locally or deploying to Render and Docker.",
    content: `
# Standalone Hono.js Deployment

ArcNano provides a dedicated, lightweight relayer package located in the [\`/relayer\`](file:///Users/trymbakmahant/Projects/grant/arc/p2pzkpayment/relayer) directory.

Built on **Hono.js** and **TypeScript**, it features sub-millisecond routing, zero heavy dependencies, atomic disk persistence, and native \`viem\` integration for Arc Network transaction broadcasts.

---

## Directory Structure

\`\`\`
relayer/
├── src/
│   ├── index.ts        # Server entry point & auto-flush interval runner
│   ├── app.ts          # Hono application, CORS, logger & REST endpoints
│   ├── storage.ts      # Atomic persistent disk store with nullifier indexing
│   ├── settlement.ts   # On-chain batchSpend executor (Arc Testnet & Mainnet)
│   └── types.ts        # TypeScript schemas & interfaces
├── test/
│   └── relayer.test.ts # Automated test suite (10/10 tests passing)
├── package.json        # Hono, @hono/node-server, viem, tsx
├── tsconfig.json       # ES2022 NodeNext strict configuration
└── .env.example        # Environment variables template
\`\`\`

---

## Local Setup & Running

### 1. Install Dependencies & Build
\`\`\`bash
cd relayer
pnpm install
pnpm build
\`\`\`

### 2. Configure Environment (\`.env\`)
\`\`\`env
# Server Port
PORT=4040

# Batch Settlement Rules
BATCH_THRESHOLD=5
FLUSH_INTERVAL_MS=15000

# Arc Network RPCs
ARC_RPC_URL="https://rpc.testnet.arc.network"
ARC_CHAIN_ID="5042002"
ARC_MAINNET_RPC="https://rpc.mainnet.arc.io"

# Relayer Account Private Key (Agent B or funded EOA)
AGENT_B_PRIVATE_KEY="0xb6142aa2ee20cdc2d86b4d821362948c064363bbe09778559d11a14c9d24515e"

# Protocol Pools
POOL_ADDRESS="0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca"
USDC_ADDRESS="0x3600000000000000000000000000000000000000"

# Storage File Path
RELAYER_STORE_PATH="./data/relayer_proofs.json"
\`\`\`

### 3. Start the Server
\`\`\`bash
# Development mode (live reload with tsx watch)
pnpm dev

# Production mode
pnpm start
\`\`\`

---

## Running the Automated Test Suite

The Hono relayer includes 10 automated integration tests covering proof ingestion, double-spend rejection, threshold auto-flush, multi-recipient partitioning, and on-demand withdrawals:

\`\`\`bash
pnpm test
\`\`\`

Output:
\`\`\`
==================================================================
🧪 Running ArcNano Hono.js TypeScript Relayer Test Suite
==================================================================
Test 1: GET / (Dashboard Index)... ✔
Test 2: GET /v1/status... ✔
Test 3: POST /v1/proofs/submit (Validation errors)... ✔
Test 4: Ingesting verified spend proof into persistent store... ✔
Test 5: Replaying same nullifier to test double-spend protection... ✔
Test 6: Ingesting second proof to trigger automatic threshold batch settlement... ✔
Test 7: Querying settled proof status (/v1/proofs/:id)... ✔
Test 8: Partitioning multi-recipient queues (Alice & Bob)... ✔
Test 9: Triggering on-demand batch withdrawal (/v1/batch/withdraw)... ✔
Test 10: Querying batch transaction history (/v1/batches)... ✔
==================================================================
🎉 ALL 10 HONO.JS RELAYER BACKEND TESTS PASSED CLEANLY!
==================================================================
\`\`\`
`,
  },
};

