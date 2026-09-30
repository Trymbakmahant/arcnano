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

### Network Parameters
- **Network Name:** Arc Testnet (Circle Layer 1)
- **Chain ID:** `5042002`
- **RPC Endpoint:** `https://rpc.testnet.arc.network`
- **Native Gas Currency:** `USDC`
- **Official USDC Contract:** `0x3600000000000000000000000000000000000000`
- **Block Explorer:** [https://testnet.arcscan.app](https://testnet.arcscan.app)
- **Faucet:** [Circle Faucet](https://faucet.circle.com) (select "Arc Testnet")

### 1. Setup Environment
Copy the example environment file and add your deployer private key:
```bash
cp .env.example .env
# Edit .env and supply PRIVATE_KEY
```

### 2. Dry-Run Simulation
Simulate deployment against the live Arc Testnet:
```bash
forge script script/Deploy.s.sol:DeployArcNano --rpc-url arc_testnet
```

### 3. Broadcast Deployment On-Chain
When your wallet is funded with testnet USDC from the faucet:
```bash
forge script script/Deploy.s.sol:DeployArcNano \
  --rpc-url arc_testnet \
  --broadcast \
  --legacy
```
*(Note: `--legacy` is recommended for standard EVM gas estimation on Arc Testnet).*

---

## 🌐 Deployed Contracts (Arc Testnet - Chain ID `5042002`)

| Contract | Address | Explorer |
| :--- | :--- | :--- |
| **ArcNanoPool** | `0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca` | [View on Arcscan](https://testnet.arcscan.app/address/0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca) |
| **KeccakHasher** | `0x55D7077905E7FFaFaeCF3B3F74AD8278822f5f70` | [View on Arcscan](https://testnet.arcscan.app/address/0x55D7077905E7FFaFaeCF3B3F74AD8278822f5f70) |
| **MockVerifier** | `0x6Cf1C6131ddFaAb2c965d2a8E04F20809e8d0d82` | [View on Arcscan](https://testnet.arcscan.app/address/0x6Cf1C6131ddFaAb2c965d2a8E04F20809e8d0d82) |
| **Native USDC Token** | `0x3600000000000000000000000000000000000000` | [View on Arcscan](https://testnet.arcscan.app/address/0x3600000000000000000000000000000000000000) |
| **Deployer Wallet** | `0x063829800C7214C6AaD38f57C72561641cD80333` | [View on Arcscan](https://testnet.arcscan.app/address/0x063829800C7214C6AaD38f57C72561641cD80333) |

- **Deployment Block:** `64733045`
- **Fixed Denomination:** `10,000` raw units (0.01 USDC, 6 decimals)
- **Deployment Status:** ✅ Live and verified on-chain

