import assert from "node:assert";
import express from "express";
import http from "node:http";
import { x402PaymentMiddleware } from "../src/middleware.js";
import { SpendProofPayload } from "../src/types.js";

async function runMiddlewareTest() {
  console.log("=== Testing x402PaymentMiddleware HTTP Flow ===\n");

  const app = express();
  app.use(express.json());

  const recipient = "0x063829800C7214C6AaD38f57C72561641cD80333";
  const root = "15055926234077295509216400193975320613085685875483293700481590095656163448343";
  const nullifierHash = "20422268048524814187777998610497463970402096973561728977312170140886346563691";
  const aspRoot = "19128018104003351169958007405541096654276287024914820341236452486826146398487";

  // Mount protected endpoint
  app.post(
    "/api/v1/inference",
    x402PaymentMiddleware({
      recipient,
      currentRoot: root,
      aspRoot,
      denomination: "10000",
    }),
    (req, res) => {
      res.json({
        success: true,
        data: "Streaming LLM tokens...",
        nullifier: req.payment?.nullifierHash,
        verifiedLatency: req.payment?.verificationLatencyMs,
      });
    }
  );

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(8999, resolve));
  const baseUrl = "http://localhost:8999/api/v1/inference";

  try {
    // 1. Initial request without payment header -> Expect 402 Payment Required
    console.log("1. Sending unauthenticated request...");
    const res1 = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "Hello AI" }),
    });

    assert.strictEqual(res1.status, 402, "Should return 402 Payment Required");
    const data1 = (await res1.json()) as any;
    assert.strictEqual(data1.status, 402);
    assert.strictEqual(data1.protocol, "X402");
    assert.strictEqual(data1.invoice.recipient, recipient);
    assert.strictEqual(data1.invoice.denomination, "10000");
    console.log("✔ Received HTTP 402 challenge with valid invoice:\n", data1.invoice);

    // 2. Request with valid X-PAYMENT header
    console.log("\n2. Sending request with X-PAYMENT header...");
    const validPayload: SpendProofPayload = {
      proof: {
        a: [
          "1002345678901234567890123456789012345678901234567890123456789012",
          "2002345678901234567890123456789012345678901234567890123456789012",
        ],
        b: [
          [
            "3002345678901234567890123456789012345678901234567890123456789012",
            "4002345678901234567890123456789012345678901234567890123456789012",
          ],
          [
            "5002345678901234567890123456789012345678901234567890123456789012",
            "6002345678901234567890123456789012345678901234567890123456789012",
          ],
        ],
        c: [
          "7002345678901234567890123456789012345678901234567890123456789012",
          "8002345678901234567890123456789012345678901234567890123456789012",
        ],
      },
      root,
      nullifierHash,
      recipient,
      aspRoot,
    };

    const res2 = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-PAYMENT": JSON.stringify(validPayload),
      },
      body: JSON.stringify({ prompt: "Generate proof" }),
    });

    assert.strictEqual(res2.status, 200, "Should return 200 OK after verification");
    const data2 = (await res2.json()) as any;
    assert.strictEqual(data2.success, true);
    console.log(`✔ Verified & Fulfilled in ${res2.headers.get("x-arcnano-verification-time")}!`);

    // 3. Replay attack: resending the same nullifier -> Expect 409 Conflict
    console.log("\n3. Testing replay attack (duplicate nullifier)...");
    const res3 = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-PAYMENT": JSON.stringify(validPayload),
      },
      body: JSON.stringify({ prompt: "Replay attack" }),
    });

    assert.strictEqual(res3.status, 409, "Duplicate nullifier should return 409 Conflict");
    const data3 = (await res3.json()) as any;
    assert.strictEqual(data3.code, "NULLIFIER_ALREADY_SPENT");
    console.log("✔ Replay attack successfully blocked by in-memory cache!");

    console.log("\n✅ x402PaymentMiddleware HTTP integration test passed cleanly!");
  } finally {
    server.close();
  }
}

runMiddlewareTest().catch((err) => {
  console.error("Middleware test failed:", err);
  process.exit(1);
});
