# arcnano-x402

> **Drop-in HTTP 402 payment middleware with sub-8ms off-chain ZK Groth16 verification, Circle Gas Station sponsorship, and Arc Testnet batch settlement for Express and Node.js.**

[![npm version](https://img.shields.io/npm/v/arcnano-x402.svg?color=emerald)](https://www.npmjs.com/package/arcnano-x402)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Arc Testnet](https://img.shields.io/badge/Arc_Testnet-5042002-blue.svg)](https://testnet.arcscan.io)
[![Latency](https://img.shields.io/badge/Off--chain_Verify-<8ms-brightgreen.svg)](https://github.com/Trymbakmahant/arcnano)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)

---

## Overview

**arcnano-x402** allows AI agent developers, API providers, and SaaS platforms to monetize APIs using standard **HTTP 402 Payment Required** flows backed by **Zero-Knowledge proofs** on the [Arc Network](https://arc.network).

### Why arcnano-x402?

- **Sub-8ms Verification**: Verifies BN254 Groth16 zero-knowledge proofs entirely in memory before serving requests, introducing zero perceptible latency to streaming LLM tokens.
- **Privacy Preserving & Zero Identity Linkage**: API consumers spend private shielded notes. The API provider never learns the caller's on-chain wallet address or balances.
- **Instant Double-Spend Defense**: An in-memory nullifier cache prevents note replays in under 0.1ms without waiting for on-chain block mining.
- **Zero Gas for Agents & Circle Paymaster**: API callers never broadcast blockchain transactions. API gateways aggregate verified notes and batch-settle on-chain using **Circle Gas Station (ERC-4337)** sponsorship.
- **1-Line Express Integration**: Wrap any route with `x402PaymentMiddleware()` and access verified cryptographic payment context on `req.payment`.

---

## How the HTTP 402 Flow Works

```
 Client Agent                          API Provider (Express Gateway)             Arc L1 (Pool)
     |                                               |                                  |
     |  1. POST /v1/inference (no payment)           |                                  |
     |---------------------------------------------->|                                  |
     |                                               |                                  |
     |  2. 402 Payment Required (Invoice + Challenge)|                                  |
     |     WWW-Authenticate: X402                    |                                  |
     |<----------------------------------------------|                                  |
     |                                               |                                  |
     |  3. POST /v1/inference                        |                                  |
     |     Authorization: X402 proof=... nullifier=..|                                  |
     |---------------------------------------------->|                                  |
     |                                               |-- Sub-8ms ZK Verify              |
     |                                               |-- RAM Nullifier Cache Check      |
     |                                               |-- Enqueue into Batch Queue       |
     |  4. 200 OK (Stream LLM tokens / response)     |                                  |
     |<----------------------------------------------|                                  |
     |                                               |                                  |
     |                                               |  5. batchSpend(proofs, recipient)|
     |                                               |--------------------------------->|
     |                                               |     (Sponsored via Paymaster)    |
```

---

## Installation

```bash
# npm
npm install arcnano-x402

# pnpm
pnpm add arcnano-x402

# yarn
yarn add arcnano-x402
```

---

## Quickstart (Server / API Gateway)

Protect any Express endpoint with a single middleware declaration:

```typescript
import express from "express";
import { x402PaymentMiddleware } from "arcnano-x402";

const app = express();
app.use(express.json());

// Protect autonomous AI endpoints
app.use(
  "/api/v1/inference",
  x402PaymentMiddleware({
    // Your payout address receiving USDC upon batch settlement
    recipient: "0x063829800C7214C6AaD38f57C72561641cD80333",

    // ArcNanoPool contract deployed on Arc Testnet
    poolAddress: "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca",

    // Micropayment denomination in atomic USDC units (6 decimals)
    // "10000" = 0.01 USDC, "1000" = 0.001 USDC
    denomination: "10000",
    denominationFormatted: "0.01 USDC",

    // Settle on-chain every 10 calls (or periodic timer flush)
    batchSize: 10,
    flushIntervalMs: 30_000,

    // Optional: On-chain Relayer wallet for automated batch settlements
    rpcUrl: "https://rpc.testnet.arc.network",
    relayerPrivateKey: process.env.RELAYER_PRIVATE_KEY,
  })
);

app.post("/api/v1/inference", (req, res) => {
  // Access verified cryptographic payment context injected by the middleware
  const payment = req.payment!;
  console.log("Verified Nullifier:", payment.nullifierHash);
  console.log("Verification Latency:", payment.verificationLatencyMs, "ms");
  console.log("Paid Amount:", payment.denominationFormatted);

  // Stream LLM tokens to the client agent immediately
  res.json({
    status: "ok",
    model: "claude-3-5-sonnet",
    output: "Zero-knowledge autonomous agent response delivered.",
    payment: {
      nullifier: payment.nullifierHash,
      settlement: "queued_for_batch",
    },
  });
});

app.listen(3000, () => {
  console.log("X402 AI gateway listening on port 3000");
});
```

---

## Client Usage

When an AI agent calls the protected route without credentials:

### 1. HTTP 402 Challenge Received

```http
HTTP/1.1 402 Payment Required
WWW-Authenticate: X402 realm="ArcNano Shielded Gateway", pool="0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca", denomination="10000"
Content-Type: application/json

{
  "status": "payment_required",
  "pool": "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca",
  "denomination": "10000",
  "denominationFormatted": "0.01 USDC",
  "recipient": "0x063829800C7214C6AaD38f57C72561641cD80333",
  "chainId": 5042002,
  "network": "Arc Testnet (Circle L1)",
  "instructions": "Generate a Groth16 spend proof with the recipient bound to this address and provide in Authorization header."
}
```

### 2. Submit ZK Proof in Request Header

Clients fulfill the invoice by passing their Groth16 proof in the `Authorization` or `X-Payment` header:

```bash
# Authorization header format
curl -X POST https://your-api.com/api/v1/inference \
  -H "Content-Type: application/json" \
  -H 'Authorization: X402 {"proof":{"pi_a":["0x...","0x..."],"pi_b":[["0x...","0x..."],["0x...","0x..."]],"pi_c":["0x...","0x..."]},"root":"0x...","nullifierHash":"0x42f7...","recipient":"0x063829800C7214C6AaD38f57C72561641cD80333"}' \
  -d '{"prompt": "Analyze market trends"}'
```

Alternatively, pass a Base64-encoded payload or set the `X-Payment` header with the JSON payload.

---

## Core SDK Components

The package exports modular building blocks for custom architectures:

```typescript
import {
  x402PaymentMiddleware,
  FastGroth16Verifier,
  NullifierCache,
  BatchSettlementManager,
  CirclePaymasterClient,
  ArcNanoRelayerDaemon,
} from "arcnano-x402";
```

### 1. `FastGroth16Verifier`
In-memory Groth16 BN254 verification engine:
- Anti-frontrunning recipient validation (`payload.recipient === expectedRecipient`)
- Scalar field prime checks (`BN254_SCALAR_FIELD`)
- Merkle root consistency verification
- Sub-8ms execution time

```typescript
const verifier = new FastGroth16Verifier();
const result = await verifier.verify(proofPayload, recipientAddress);
// { valid: true, latencyMs: 0.008, publicInputs: [...] }
```

### 2. `NullifierCache`
Thread-safe, RAM-backed LRU double-spend cache:
```typescript
const cache = new NullifierCache();
if (cache.has(nullifierHash)) {
  throw new Error("Double-spend detected: note nullifier already consumed");
}
cache.add(nullifierHash);
```

### 3. `BatchSettlementManager`
Aggregates spent notes and submits batched on-chain transactions to the `ArcNanoPool` contract:
```typescript
const batcher = new BatchSettlementManager({
  recipient: "0x063829800C7214C6AaD38f57C72561641cD80333",
  poolAddress: "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca",
  batchSize: 10,
  flushIntervalMs: 30000,
  onSettled: (receipt) => {
    console.log(`Settled batch: ${receipt.txHash} (${receipt.batchCount} notes)`);
  },
});

await batcher.enqueue(proofPayload);
```

### 4. `CirclePaymasterClient`
Integrates with Circle Gas Station (ERC-4337 / EIP-7677) on Arc Testnet, sponsoring 100% of the gas required to settle batches on-chain:
```typescript
const paymaster = new CirclePaymasterClient({
  network: "Arc Testnet (Circle L1)",
  chainId: 5042002,
  coveredGasPercent: 100,
});

const receipt = await paymaster.sponsorBatchSpend(proofs, recipientAddress);
console.log("Gas sponsored:", receipt.gasSponsoredEstimatedValueUsd);
```

### 5. `ArcNanoRelayerDaemon`
An autonomous background relayer worker with HTTP status endpoints:
```typescript
const daemon = new ArcNanoRelayerDaemon({
  port: 4040,
  batchThreshold: 5,
  flushIntervalMs: 15_000,
  defaultRecipient: "0x063829800C7214C6AaD38f57C72561641cD80333",
  poolAddress: "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca",
  rpcUrl: "https://rpc.testnet.arc.network",
  relayerPrivateKey: process.env.RELAYER_PRIVATE_KEY,
});

await daemon.start();
```

---

## CLI Standalone Relayer

You can run the bundled relayer directly using `npx`:

```bash
RELAYER_PRIVATE_KEY=0x... \
POOL_ADDRESS=0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca \
ARC_RPC_URL=https://rpc.testnet.arc.network \
npx arcnano-x402 relayer
```

---

## Network & Contract Reference

| Parameter | Value |
| :--- | :--- |
| **Network** | Arc Testnet (Circle L1) |
| **Chain ID** | `5042002` |
| **Gas & Settlement Asset** | USDC (Native Gas & Denomination) |
| **RPC Endpoint** | `https://rpc.testnet.arc.network` |
| **Block Explorer** | [https://testnet.arcscan.io](https://testnet.arcscan.io) |
| **ArcNanoPool Contract** | [`0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca`](https://testnet.arcscan.io/address/0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca) |
| **Standard Denominations** | 0.001 USDC (`1000`), 0.01 USDC (`10000`), 0.1 USDC (`100000`) |

---

## Testing & Benchmarks

```bash
# Run full unit and integration test suite
pnpm test

# Run 1,000-iteration sub-8ms latency benchmark
pnpm benchmark
```

---

## License

MIT © [Trymbak Mahant](https://github.com/Trymbakmahant)
