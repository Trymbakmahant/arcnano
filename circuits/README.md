# ArcNano Zero-Knowledge Circuits

> **20-Level Poseidon Shielded Note Circuits & Groth16 Proving Engine**  
> Built with **Circom 2.1+** • **SnarkJS** • **BN254 (alt_bn128)**

---

## 📐 Circuit Architecture

The `circuits/` package contains the off-chain zero-knowledge circuits for ArcNano nanopayments:

### 1. `spend.circom` (Core Note Inclusion & Spend Circuit)
- **Merkle Depth:** 20 levels ($2^{20} = 1,048,576$ commitments).
- **Commitment Scheme:** $C = \text{Poseidon}(denomination, secret, nullifierSeed)$.
- **Nullifier Derivation:** $N = \text{Poseidon}(nullifierSeed, secret)$.
- **Recipient Binding:** Binds payout recipient address to the proof ($x_I = recipient^2$) to mathematically prevent front-running, proof theft, and payout diversion by relayers.
- **Public Inputs (Ordered for `ArcNanoPool.sol`):**
  1. `root` ($x_0$): Merkle root of the deposit pool.
  2. `nullifierHash` ($x_1$): Unique spend nullifier preventing double spending.
  3. `recipient` ($x_2$): Payout recipient address.
  4. `aspRoot` ($x_3$): Association Set Provider compliance root.

### 2. `merkle.circom` (Binary Merkle Proof)
- Verifies binary Merkle path using `Poseidon(2)` and `Switcher`.
- Validates membership in the historical root ring buffer.

### 3. `asp_check.circom` (Privacy Pools Compliance)
- Proves inclusion of the note commitment within authorized Association Set Provider (ASP) trees.
- Proves clean provenance and non-membership in sanctioned / tainted clusters without revealing the depositor's wallet identity.

---

## 🛠️ Testing & Input Generation

### 1. Run Cryptographic Integrity Test
```bash
node test/spend.test.js
```
Validates commitment generation, nullifier derivation, and 20-level Merkle path resolution.

### 2. Generate Sample Witness Input
```bash
node scripts/generate_input.js
```
Outputs `input.json` ready for Groth16 witness calculation.

---

## 📜 On-Chain Solidity Verifier

The matching Solidity verifier is located at:
- [`contracts/src/verifiers/Groth16Verifier.sol`](../contracts/src/verifiers/Groth16Verifier.sol)
Implements `IVerifier` and validates proofs with EVM pairing precompiles (`0x06`, `0x07`, `0x08`).
