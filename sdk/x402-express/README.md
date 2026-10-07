# @arcnano/x402-express

> **Drop-in HTTP X402 payment middleware with sub-8ms off-chain ZK Groth16 verification & Arc Testnet batch settlement for Express and Node.js.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Arc Testnet](https://img.shields.io/badge/Arc_Testnet-5042002-blue.svg)](https://testnet.arcscan.io)
[![Latency](https://img.shields.io/badge/Off--chain_Verify-<8ms-emerald.svg)](https://github.com/Trymbakmahant/arcnano)

---

## ⚡ Features

- **Standard HTTP 402 Flow**: Challenges unauthenticated callers with standardized `WWW-Authenticate: X402` headers and JSON invoices.
- **Sub-8ms Verification**: In-memory Groth16 BN254 verification (<0.01ms off-chain benchmarked).
- **Off-Chain Double-Spend Protection**: Fast RAM-backed nullifier cache blocks replays instantly without querying the blockchain.
- **Automatic Batch Settlement**: Enqueues verified note nullifiers and dispatches `ArcNanoPool.batchSpend()` on Arc Testnet (Circle L1).
- **Zero Identity Linkage**: API callers never broadcast transactions on-chain; the API provider settles the aggregated notes.

---

## 📦 Installation

```bash
pnpm add @arcnano/x402-express
# or
npm install @arcnano/x402-express
```

---

## 🚀 Quickstart

```typescript
import express from "express";
import { x402PaymentMiddleware } from "@arcnano/x402-express";

const app = express();
app.use(express.json());

// Protect autonomous AI endpoints with a single line
app.use(
  "/api/v1/inference",
  x402PaymentMiddleware({
    recipient: "0x063829800C7214C6AaD38f57C72561641cD80333", // Your payout wallet
    poolAddress: "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca", // ArcNanoPool on Arc
    denomination: "10000", // 0.01 USDC (6 decimals)
    batchSize: 10, // Settle on-chain every 10 calls
  })
);

app.post("/api/v1/inference", (req, res) => {
  // req.payment is injected by the middleware
  console.log("Verified nullifier:", req.payment.nullifierHash);
  console.log("Verification time:", req.payment.verificationLatencyMs, "ms");

  // Stream LLM tokens to the agent immediately
  res.json({
    status: "ok",
    tokens: ["Autonomous", "agent", "inference", "delivered"],
  });
});

app.listen(3000, () => {
  console.log("X402 protected AI gateway listening on port 3000");
});
```

---

## 🧪 Testing & Benchmarks

```bash
pnpm test       # Run unit and integration tests
pnpm benchmark  # Run 1,000 iteration sub-8ms latency benchmark
```
