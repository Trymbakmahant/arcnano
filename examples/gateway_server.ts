import express from "express";
import { x402PaymentMiddleware } from "../sdk/x402-express/dist/index.js";

const app = express();
app.use(express.json());

const RECIPIENT = "0x063829800C7214C6AaD38f57C72561641cD80333";
const POOL = "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca";
const ROOT = "15055926234077295509216400193975320613085685875483293700481590095656163448343";
const ASP_ROOT = "19128018104003351169958007405541096654276287024914820341236452486826146398487";

// Protect autonomous agent inference endpoint
app.use(
  "/api/v1/inference",
  x402PaymentMiddleware({
    recipient: RECIPIENT,
    poolAddress: POOL,
    currentRoot: ROOT,
    aspRoot: ASP_ROOT,
    denomination: "10000",
    batchSize: 5,
  })
);

app.post("/api/v1/inference", (req, res) => {
  const payment = req.payment;
  console.log(`[Gateway] ✅ Payment Verified in ${payment?.verificationLatencyMs.toFixed(3)}ms`);
  console.log(`[Gateway] 🔒 Nullifier: ${payment?.nullifierHash.slice(0, 18)}...`);

  res.json({
    model: "claude-3-5-sonnet-autonomous-agent",
    status: "completed",
    tokens: [
      "Zero-Knowledge",
      "proof",
      "verified",
      "off-chain",
      "sub-8ms.",
      "Settlement",
      "batched",
      "on",
      "Arc",
      "L1",
      "Testnet.",
    ],
    verifiedAt: payment?.verifiedAt,
    latencyMs: payment?.verificationLatencyMs,
  });
});

const PORT = 4020;
app.listen(PORT, () => {
  console.log(`[Gateway] X402 AI Inference Server listening at http://localhost:${PORT}`);
});
