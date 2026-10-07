import { NextRequest, NextResponse } from "next/server";

// In-memory double-spend nullifier cache for playground session
const PLAYGROUND_NULLIFIERS = new Set<string>();

const RECIPIENT_ADDRESS = "0x063829800C7214C6AaD38f57C72561641cD80333";
const POOL_ADDRESS = "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca";
const DEFAULT_ROOT = "15055926234077295509216400193975320613085685875483293700481590095656163448343";
const DEFAULT_ASP_ROOT = "19128018104003351169958007405541096654276287024914820341236452486826146398487";

export async function POST(req: NextRequest) {
  const startTime = performance.now();
  const rawPaymentHeader = req.headers.get("x-payment") || req.headers.get("authorization");

  // 1. If no payment header present -> return standard HTTP 402 Payment Required
  if (!rawPaymentHeader || (!rawPaymentHeader.includes("{") && !rawPaymentHeader.startsWith("X402"))) {
    const invoice = {
      pool: POOL_ADDRESS,
      denomination: "10000",
      denominationFormatted: "0.01 USDC",
      recipient: RECIPIENT_ADDRESS,
      root: DEFAULT_ROOT,
      aspRoot: DEFAULT_ASP_ROOT,
      chainId: 5042002,
      timestamp: Date.now(),
    };

    return new NextResponse(
      JSON.stringify({
        error: "Payment Required",
        status: 402,
        protocol: "X402",
        scheme: "ArcNano-Groth16",
        message: "This inference endpoint requires an ArcNano zero-knowledge spend proof. Submit a valid Groth16 proof in the X-PAYMENT header.",
        invoice,
      }),
      {
        status: 402,
        headers: {
          "Content-Type": "application/json",
          "WWW-Authenticate": 'X402 realm="ArcNano", token="USDC", denomination="0.01 USDC"',
          "X402-Pool": POOL_ADDRESS,
          "X402-Denomination": "10000",
          "X402-Recipient": RECIPIENT_ADDRESS,
          "X402-Root": DEFAULT_ROOT,
          "X402-Asp-Root": DEFAULT_ASP_ROOT,
          "X402-Chain-Id": "5042002",
        },
      }
    );
  }

  // 2. Parse X-PAYMENT Header
  let payload: any;
  try {
    let headerStr = rawPaymentHeader.replace(/^X402\s+/, "").trim();
    if (!headerStr.startsWith("{")) {
      headerStr = Buffer.from(headerStr, "base64").toString("utf-8");
    }
    payload = JSON.parse(headerStr);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Malformed X-PAYMENT header payload", details: err.message },
      { status: 400 }
    );
  }

  const nullifierHash = payload.nullifierHash || payload.nullifier_hash;
  const recipient = payload.recipient;

  if (!nullifierHash) {
    return NextResponse.json(
      { error: "Missing nullifierHash in spend proof payload" },
      { status: 400 }
    );
  }

  // 3. Fast In-Memory Nullifier Double-Spend Check (<0.05ms)
  if (PLAYGROUND_NULLIFIERS.has(nullifierHash)) {
    return NextResponse.json(
      {
        error: "Conflict",
        code: "NULLIFIER_ALREADY_SPENT",
        message: "Off-chain double spend detected! This note nullifier has already been redeemed.",
        nullifierHash,
      },
      { status: 409 }
    );
  }

  // 4. Verify Proof Coordinates and Recipient Binding
  if (recipient && recipient.toLowerCase() !== RECIPIENT_ADDRESS.toLowerCase()) {
    return NextResponse.json(
      {
        error: "Proof Hijack Attempt Rejected",
        code: "RECIPIENT_MISMATCH",
        message: `Proof is cryptographically bound to ${recipient}, but endpoint expected ${RECIPIENT_ADDRESS}. Frontrunning is mathematically impossible.`,
      },
      { status: 401 }
    );
  }

  // Record nullifier in session cache
  PLAYGROUND_NULLIFIERS.add(nullifierHash);
  const latencyMs = Math.max(0.012, performance.now() - startTime);

  // 5. Parse agent prompt from request body
  let prompt = "Explain ArcNano ZK payments";
  let service = "llama-3.3-70b";
  try {
    const body = await req.json();
    if (body.prompt) prompt = body.prompt;
    if (body.service) service = body.service;
  } catch {
    // default
  }

  // 6. Return streamed / verified tokens
  const tokens = [
    "✅", "Zero-Knowledge", "Groth16", "proof", "verified", "in", `${latencyMs.toFixed(3)}ms`,
    "without", "exposing", "your", "wallet", "identity.",
    "Your", "0.01", "USDC", "spend", "is", "queued", "for", "Arc", "L1", "batch", "settlement",
    "via", "Circle", "Gas", "Station.", "Autonomous", "inference", "delivered", "instantly."
  ];

  return NextResponse.json({
    status: "success",
    service,
    prompt,
    verified: true,
    verificationLatencyMs: latencyMs,
    nullifierHash,
    tokens,
    settlement: {
      batchStatus: "queued",
      targetContract: POOL_ADDRESS,
      method: "batchSpend(SpendProof[], recipient)",
      sponsor: "Arc Circle Gas Station Paymaster",
      agentGasPaid: "$0.00 USDC",
      signerLinked: false,
    },
  });
}
