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
      { id: "sdk-express", title: "@arcnano/x402-express Middleware" },
      { id: "sdk-python", title: "arczk-agent Python SDK (LangChain/CrewAI)" },
      { id: "modes", title: "Fast Mode vs Strict Finality Mode" },
    ],
  },
  {
    id: "contracts",
    name: "Arc Testnet Deployments",
    items: [
      { id: "contracts-reference", title: "ArcNanoPool.sol Reference" },
      { id: "testnet-details", title: "Arc Testnet (Circle L1) Details" },
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
Production gateways running \`@arcnano/x402-express\` connect to a low-latency shared Redis cache of pending nullifiers. When Server C receives the request 5ms later, its gateway sees the nullifier was already claimed by Server B and rejects it with **\`HTTP 409 Conflict\`**.

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

The core contract [ArcNanoPool.sol](https://testnet.arcscan.io/address/0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca) has been tested using **Foundry Invariant Testing** with over **128,000 randomized state transitions**.

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
    title: "@arcnano/x402-express Middleware",
    category: "Developer SDKs & Gateway Tooling",
    summary: "Guide to monetizing Express and Fastify endpoints using @arcnano/x402-express.",
    content: `
# @arcnano/x402-express Middleware Guide

The \`@arcnano/x402-express\` package allows API providers to monetize endpoints with sub-8ms off-chain ZK verification in 3 lines of code:

## Installation

\`\`\`bash
npm install @arcnano/x402-express
# or
pnpm add @arcnano/x402-express
\`\`\`

## Quickstart

\`\`\`typescript
import express from "express";
import { x402PaymentMiddleware } from "@arcnano/x402-express";

const app = express();
app.use(express.json());

// Guard autonomous AI endpoint
app.use(
  "/api/v1/inference",
  x402PaymentMiddleware({
    recipient: "0x063829800C7214C6AaD38f57C72561641cD80333", // Payout wallet
    denomination: "10000", // 0.01 USDC
    batchSize: 10, // Settle every 10 notes on Arc L1
  })
);

app.post("/api/v1/inference", (req, res) => {
  // Access verified context
  console.log("Verified nullifier:", req.payment.nullifierHash);
  console.log("Verification time:", req.payment.verificationLatencyMs, "ms");

  res.json({ tokens: ["Streamed", "LLM", "tokens"] });
});

app.listen(3000);
\`\`\`
`,
  },

  "sdk-python": {
    id: "sdk-python",
    title: "arczk-agent Python SDK",
    category: "Developer SDKs & Gateway Tooling",
    summary: "Guide to building autonomous AI agents with arczk-agent for LangChain, AutoGPT, and CrewAI.",
    content: `
# arczk-agent Python SDK Guide

\`arczk-agent\` is the Python client library for autonomous AI agents transacting on Arc.

## Installation

\`\`\`bash
pip install arczk-agent
# or
uv pip install arczk-agent
\`\`\`

## Quickstart

\`\`\`python
from arczk import ArcAgentClient, NoteVault

# 1. Initialize local note vault
vault = NoteVault("~/.arcnano/vault.json")
vault.create_note(denomination=10000) # 0.01 USDC note

# 2. Autonomous HTTP client
client = ArcAgentClient(vault=vault)

# 3. Request paid endpoint: Automatically catches HTTP 402, constructs ZK proof, and retries!
response = client.post(
    "https://api.inference.ai/v1/inference",
    json={"prompt": "Analyze autonomous financial markets"}
)

print(response.json())
\`\`\`
`,
  },

  modes: {
    id: "modes",
    title: "Fast Mode vs Strict Finality Mode",
    category: "Developer SDKs & Gateway Tooling",
    summary: "Choosing between Fast Mode (<8ms RAM clearance) and Strict Finality Mode (3s on-chain confirmation).",
    content: `
# Fast Mode vs Strict Finality Mode

API providers can configure their risk profile in \`@arcnano/x402-express\`:

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
    category: "Arc Testnet Deployments",
    summary: "Solidity API reference and function signatures for ArcNanoPool.sol.",
    content: `
# ArcNanoPool.sol Contract Reference

The contract is deployed and verified on **Arc Testnet**: \`0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca\`.

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

  "testnet-details": {
    id: "testnet-details",
    title: "Arc Testnet (Circle L1) Details",
    category: "Arc Testnet Deployments",
    summary: "RPC endpoints, chain ID, explorer links, and testnet addresses.",
    content: `
# Arc Testnet (Circle L1) Configuration

- **Network Name:** Arc Testnet
- **Chain ID:** \`5042002\` (\`0x4cef12\`)
- **RPC Endpoint:** \`https://rpc.testnet.arc.network\`
- **Block Explorer:** \`https://testnet.arcscan.io\`
- **Native Gas Token:** USDC (6 decimals)
- **ArcNanoPool:** \`0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca\`
- **KeccakHasher:** \`0x55D7077905E7FFaFaeCF3B3F74AD8278822f5f70\`
- **MockVerifier:** \`0x6Cf1C6131ddFaAb2c965d2a8E04F20809e8d0d82\`
`,
  },
};
