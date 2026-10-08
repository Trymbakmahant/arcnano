import express from "express";
import http from "node:http";
import { x402PaymentMiddleware } from "../../sdk/x402-express/dist/index.js";

const app = express();
app.use(express.json());

const RECIPIENT = "0x063829800C7214C6AaD38f57C72561641cD80333";
const POOL = "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca";
const ROOT = "15055926234077295509216400193975320613085685875483293700481590095656163448343";
const ASP_ROOT = "19128018104003351169958007405541096654276287024914820341236452486826146398487";
const RELAYER_URL = process.env.RELAYER_URL || "http://localhost:4040/v1/submit-proof";

// Forward verified proofs to Relayer Daemon
async function forwardProofToRelayer(payload: any, recipient: string) {
  try {
    const postData = JSON.stringify({ payload, recipient });
    const u = new URL(RELAYER_URL);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    });
    req.on("error", (err) => {
      console.warn(`[InferenceService] Note forwarding to relayer warning: ${err.message}`);
    });
    req.write(postData);
    req.end();
  } catch (err: any) {
    console.warn(`[InferenceService] Relayer submission failed: ${err.message}`);
  }
}

// Attach X402 payment protection
app.use(
  "/api/v1/inference",
  x402PaymentMiddleware({
    recipient: RECIPIENT,
    poolAddress: POOL,
    currentRoot: ROOT,
    aspRoot: ASP_ROOT,
    denomination: "10000",
    autoBatchSettlement: false, // Relayer daemon handles settlement
  })
);

app.post("/api/v1/inference", async (req, res) => {
  const payment = req.payment;
  const prompt = req.body.prompt || "Default AI inference";

  console.log(`[InferenceService] 💳 Note verified in ${payment?.verificationLatencyMs.toFixed(3)}ms`);
  console.log(`[InferenceService] 🔒 Shielded Nullifier: ${payment?.nullifierHash.slice(0, 18)}...`);

  // Forward verified proof to Relayer Daemon for batch aggregation
  if (payment) {
    forwardProofToRelayer(
      {
        proof: payment.proof,
        root: payment.root,
        nullifierHash: payment.nullifierHash,
        recipient: payment.recipient,
        aspRoot: payment.aspRoot,
      },
      RECIPIENT
    );
  }

  // Generate simulated streaming intelligence tokens
  const sampleResponses: Record<string, string[]> = {
    market: [
      "Analyzing", "on-chain", "liquidity", "depth", "on", "Arc", "L1...",
      "Detected", "14.2M", "USDC", "in", "active", "AMM", "pools.",
      "Volatility", "index:", "LOW", "(0.42).", "Recommendation:", "EXECUTE."
    ],
    risk: [
      "Evaluating", "sanctions", "compliance", "against", "OFAC", "ASP", "registry...",
      "Cryptographic", "exclusion", "proof", "verified.",
      "Risk", "score:", "0.00", "(Clean).", "Machine", "trust:", "MAXIMUM."
    ],
    synthesis: [
      "Synthesizing", "multi-agent", "consensus...",
      "Nanopayment", "settled", "with", "zero", "on-chain", "gas.",
      "Autonomous", "loop", "complete.", "Status:", "OPTIMAL."
    ]
  };

  let tokens = sampleResponses.synthesis;
  if (prompt.toLowerCase().includes("market")) tokens = sampleResponses.market;
  if (prompt.toLowerCase().includes("risk")) tokens = sampleResponses.risk;

  res.json({
    status: "completed",
    model: "arc-llama-3-70b-autonomous",
    prompt,
    tokens,
    metrics: {
      tokensGenerated: tokens.length,
      gatewayLatencyMs: payment?.verificationLatencyMs,
      gasPaidByAgent: "$0.00",
      payerSignerLeaked: "0%",
    },
    verifiedAt: payment?.verifiedAt,
  });
});

const PORT = parseInt(process.env.PORT || "4030", 10);
app.listen(PORT, () => {
  console.log(`[InferenceService] ⚡ Protected AI Inference Provider active on http://localhost:${PORT}`);
});
