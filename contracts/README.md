# ArcNano Smart Contracts

> **Shielded Nanopayments on the Arc Network**  
> Built with **Foundry** • **Solidity 0.8.20+** • **OpenZeppelin Contracts v5**

---

## 🏛️ Architecture Overview

The `contracts/` directory contains the on-chain settlement infrastructure for the ArcNano protocol:

1. **`ArcNanoPool.sol` (Core Protocol)**:
   - Fixed-denomination shielded note deposits (e.g. 0.01 USDC).
   - 20-level on-chain incremental Merkle tree ($2^{20} = 1,048,576$ commitments) with historical root ring buffer.
   - Dual-mode spend settlement:
     - `spend()`: Single note spend.
     - `batchSpend()`: Receiver-batched settlement amortizing gas across 50–100 agent payments into a single Arc transaction.
   - Nullifier registry preventing double-spending without ever exposing the depositor's wallet identity.
   - Association Set Provider (ASP) root registry enforcing Privacy Pools compliance.

2. **`IncrementalMerkleTree.sol`**:
   - Gas-optimized incremental Merkle tree with $O(\log N)$ updates.
   - Ring buffer of 100 historical roots to ensure client-side proof generation remains valid while new deposits arrive.

3. **`IVerifier.sol` & `IHasher.sol`**:
   - Clean interfaces for Groth16 pairing check and 2-to-1 node hashing.

---

## 🚀 Quickstart & Testing

### 1. Build Contracts
```bash
forge build
```

### 2. Run Test Suite
```bash
forge test -v
```

### 3. Test Coverage & Results
The test suite in `test/ArcNanoPool.t.sol` covers:
- [x] Initial state and denomination configuration
- [x] Note deposits and Merkle tree root progression
- [x] Single note spend with Groth16 validation
- [x] Multi-note `batchSpend()` with aggregated recipient payout
- [x] Double-spending protection (strict revert on spent nullifier)
- [x] Historical root verification (revert on unknown/tampered roots)
- [x] ASP non-membership compliance enforcement (revert on unauthorized ASP root)
- [x] Zero-knowledge proof invalidation check
- [x] Empty batch rejection
- [x] ASP governance administration (owner permissions)

---

## 📡 Deployment to Arc Testnet

Set the following environment variables:
```bash
export RPC_URL="<ARC_TESTNET_RPC_URL>"
export PRIVATE_KEY="<YOUR_DEPLOYER_PRIVATE_KEY>"
export USDC_ADDRESS="<ARC_TESTNET_USDC_ADDRESS>"
export VERIFIER_ADDRESS="<GROTH16_VERIFIER_ADDRESS>"
export DENOMINATION="10000" # 0.01 USDC (6 decimals)
```

Run the deployment script:
```bash
forge script script/Deploy.s.sol:DeployArcNano --rpc-url $RPC_URL --broadcast --verify
```
