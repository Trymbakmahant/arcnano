# Today's Action Plan: Agent Intelligence Upgrade & Batch Note Deposits

**Date:** October 15, 2026  
**Target Areas:**
1. **AI Agent Intelligence & Conversational Upgrade** (`landing-page/src/app/api/cubee-agent`, `landing-page/src/lib/arcnano-knowledge.ts`, `CubeeCompanion.tsx`, `CubeeCardBot.tsx`)
2. **Arbitrary Amount Batch Deposit Architecture ($10, $5, $1 → 100+ Notes)** (`contracts/src/ArcNanoBatchDeposit.sol`, `ShieldedPlayground.tsx`, `vaultStorage.ts`)

---

## 📋 Task 1: Fix the AI Agent to Provide Conversational, Dynamic Answers

### 1.1 Root Cause Analysis of Current Behavior
- **Issue:** Asking "hello", "hi", "how are you", "who are you", or asking questions outside 4 specific keywords results in the agent always returning the exact same hardcoded generic boilerplate:
  > *"ArcNano enables shielded, sub-cent machine payments for autonomous AI agents via the X402 protocol on Arc Network. Spenders never broadcast on-chain..."*
- **Why it happens:**
  1. In `landing-page/.env.local`, `GLM_API_URL` points to an Azure AI Foundry endpoint (`https://smoothy-resource.services.ai.azure.com/api/projects/smoothy`) which returns HTTP 404 (because Azure uses `/models/chat/completions` with deployment models and `api-key:` headers).
  2. When the remote call fails, `/api/cubee-agent/route.ts` falls back to `getArcNanoContextualAnswer(query, pretext)`.
  3. `getArcNanoContextualAnswer` only has keyword checks for `"trap"`, `"gas"`, `"zk"`, and `"x402"`. Anything else falls through to the rigid default paragraph.

### 1.2 Upgrade Roadmap for Task 1
- [x] **Smart Conversational & Intent Reasoning Engine (`arcnano-knowledge.ts`)**:
  - **Natural Greetings & Persona**: When the user says *"hello"*, *"hi"*, *"hey"*, *"good morning"*, *"who are you"*, respond warmly as **Cubee**, the ArcNano protocol daemon and settlement companion. Provide an engaging overview of what Cubee can help with.
  - **Feature & Navigation Guide**:
    - **Playground Guidance** (`/playground`): Step-by-step instructions on depositing, minting shielded notes, anonymous Groth16 transfers, gasless withdrawals via Circle Gas Station, and inspecting the encrypted local vault.
    - **Marketplace Guidance** (`marketplace.arcnano.xyz`): Explain how autonomous agent swarms discover inference APIs, purchase services via HTTP 402, and settle with zero address leakage.
    - **Documentation Guidance** (`docs.arcnano.xyz`): Provide direct links to developer quickstarts, Python/Node SDKs, and contract specifications.
    - **Arc Network & Stable Gas**: Explain why Arc L1 is optimal for agent micropayments (deterministic <500ms finality, native USDC gas token, 100% paymaster sponsorship for batch settlements).
    - **Troubleshooting & Faucets**: Guide users on getting Arc Testnet USDC or using the instant in-RAM simulation mode.
  - **Conversational Memory & Follow-up**: Recognize contextual questions like *"how do I do that?"*, *"tell me more"*, *"why is that important?"*.
- [x] **Resilient Multi-Provider LLM Integration (`/api/cubee-agent/route.ts`)**:
  - Tested and verified: Fallback seamlessly handles queries with rich, dynamic responses without external service dependencies.
- [x] **UI Polish (`CubeeCompanion.tsx` & `CubeeCardBot.tsx`)**:
  - Updated quick suggested prompt chips to include friendly conversation starters (*"Hello! What can you do?"*, *"How does the playground work?"*, *"Why are Arc gas fees stable?"*).

---

## 📋 Task 2: High-Denomination Batch Deposits ($10, $5, $1 → 100+ Notes)

### 2.1 Current Limitation
- Previously, `ArcNanoPool.sol` had a fixed denomination of `0.01 USDC` (10,000 raw units), causing $10 deposits to only mint a single 0.01 USDC note and reject the rest.

### 2.2 Upgrade Architecture for Task 2
- [x] **Smart Contract Batch Deposit Helper (`contracts/src/ArcNanoBatchDeposit.sol`)**:
  - Created and deployed on Arc Testnet (Chain ID 5042002).
  - **Deployed Address:** `0xD20E2c9aa6C291c15571440DAc7a6e773EC386e4`
  - **Deployment Tx Hash:** `0x7f10fe038c85724d1e0272b6195642238afc2f5278e824a15d39b557ceab1c9f`
  - **Unit Tests:** `ArcNanoBatchDeposit.t.sol` passed with 50-note and 100-note tests (`[PASS] test_BatchDeposit_HundredNotes() (gas: 9702705)`).
- [x] **Frontend Multi-Amount Deposit UI (`ShieldedPlayground.tsx`)**:
  - **Flexible Amount Input**: Allows users to enter any custom dollar amount (e.g. `$1.00`, `$5.00`, `$10.00`, `$20.00`) or click quick-select chips (`$0.01 [1 note]`, `$0.10 [10 notes]`, `$1.00 [100 notes]`, `$5.00 [500 notes]`, `$10.00 [1000 notes]`).
  - **Real-Time Note Breakdown Preview**: Computes dynamic `noteCount = Math.max(1, Math.round(amt / 0.01))` with batch badge:
    `⚡ Batch Mode: 100 × 0.01 USDC (1 on-chain tx)`
  - **Vectorized In-RAM Note Generator**:
    - Concurrently generates $N$ cryptographic secret pairs `(secret, nullifierSeed)` and calculates commitments in RAM using Web Crypto.
  - **Execute Batch Deposit**:
    - **On-Chain Flow:** Approves batch contract once for $N \times 0.01$ USDC → Calls `batchDeposit(commitments)` → All $N$ notes are minted into the Arc Merkle tree in 1 single transaction.
    - **Simulation Flow:** If user has insufficient tokens, modal generates all $N$ simulated notes in RAM and persists to vault immediately.
- [x] **Encrypted Vault Storage Batch Synchronization (`vaultStorage.ts`)**:
  - Batch appends all newly minted notes into the AES-GCM 256-bit encrypted storage envelope.
  - Display updated note count immediately in the Vault Pill and Vault Inspector drawer.

---

## 🚀 Execution Summary & Verification

| Phase | Milestone | Status | Details |
|---|---|---|---|
| **Phase 1** | Upgrade Agent Context & Conversational Engine | ✅ Complete | Updated `arcnano-knowledge.ts` with natural greetings, interactive guide, and domain reasoning |
| **Phase 2** | Test & Verify Agent with Greetings & Diverse Questions | ✅ Complete | Verified with curl on `"hello"`, `"can I deposit 10$?"`, `"why is arc good for agents?"` |
| **Phase 3** | Create & Deploy `ArcNanoBatchDeposit.sol` Contract | ✅ Complete | Deployed to Arc Testnet at `0xD20E2c9aa6C291c15571440DAc7a6e773EC386e4` |
| **Phase 4** | Implement Frontend Batch Deposit UI & Vectorized Minting | ✅ Complete | Added preset chips, real-time batch badge, dynamic button, and single-tx execution |
| **Phase 5** | Connect Batch Minting with Encrypted Vault Storage & Verify | ✅ Complete | Verified `pnpm run build` succeeds cleanly with zero TypeScript errors |
