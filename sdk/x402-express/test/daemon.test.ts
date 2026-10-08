import assert from "node:assert";
import http from "node:http";
import { ArcNanoRelayerDaemon } from "../src/daemon.js";
import { SpendProofPayload } from "../src/types.js";

function postJson(url: string, data: any): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const bodyStr = JSON.stringify(data);
    const req = http.request(
      {
        hostname: u.hostname,
        port: u.port,
        path: u.pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(bodyStr),
        },
      },
      (res) => {
        let resBody = "";
        res.on("data", (chunk) => (resBody += chunk));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode || 500, body: JSON.parse(resBody) });
          } catch {
            resolve({ status: res.statusCode || 500, body: resBody });
          }
        });
      }
    );
    req.on("error", reject);
    req.write(bodyStr);
    req.end();
  });
}

function getJson(url: string): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request(
      {
        hostname: u.hostname,
        port: u.port,
        path: u.pathname,
        method: "GET",
      },
      (res) => {
        let resBody = "";
        res.on("data", (chunk) => (resBody += chunk));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode || 500, body: JSON.parse(resBody) });
          } catch {
            resolve({ status: res.statusCode || 500, body: resBody });
          }
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

async function runDaemonTests() {
  console.log("=== Running ArcNano Relayer Daemon Tests ===\n");

  const port = 4049;
  const daemon = new ArcNanoRelayerDaemon({
    port,
    batchThreshold: 2,
    flushIntervalMs: 60_000,
  });

  await daemon.start();

  try {
    // 1. Status Check
    console.log("Test 1: Querying /v1/status...");
    const statusRes = await getJson(`http://localhost:${port}/v1/status`);
    assert.strictEqual(statusRes.status, 200);
    assert.strictEqual(statusRes.body.status, "running");
    assert.strictEqual(statusRes.body.config.batchThreshold, 2);
    console.log("✔ Relayer daemon is active and responding to status queries\n");

    // 2. Submit Proof
    console.log("Test 2: Ingesting verified payment proof into relayer queue...");
    const samplePayload: SpendProofPayload = {
      proof: {
        a: ["101", "102"],
        b: [["103", "104"], ["105", "106"]],
        c: ["107", "108"],
      },
      root: "15055926234077295509216400193975320613085685875483293700481590095656163448343",
      nullifierHash: "999888777666555444333222111000",
      recipient: "0x063829800C7214C6AaD38f57C72561641cD80333",
      aspRoot: "19128018104003351169958007405541096654276287024914820341236452486826146398487",
    };

    const submitRes = await postJson(`http://localhost:${port}/v1/submit-proof`, {
      payload: samplePayload,
    });
    assert.strictEqual(submitRes.status, 200);
    assert.strictEqual(submitRes.body.queuedCount, 1);
    console.log("✔ Proof ingested into pending batch buffer (Queue length: 1)\n");

    // 3. Double-Spend Rejection Check
    console.log("Test 3: Rejecting duplicate nullifier submission...");
    const dupRes = await postJson(`http://localhost:${port}/v1/submit-proof`, {
      payload: samplePayload,
    });
    assert.strictEqual(dupRes.status, 409);
    assert.ok(dupRes.body.error.includes("Duplicate nullifier"));
    console.log("✔ Replay attack prevented at relayer ingestion boundary\n");

    // 4. Threshold Batch Flush Check
    console.log("Test 4: Ingesting second note to trigger automatic threshold flush...");
    const samplePayload2: SpendProofPayload = {
      ...samplePayload,
      nullifierHash: "888777666555444333222111000999",
    };

    const submitRes2 = await postJson(`http://localhost:${port}/v1/submit-proof`, {
      payload: samplePayload2,
    });
    assert.strictEqual(submitRes2.status, 200);

    // Wait a brief moment for asynchronous threshold flush
    await new Promise((r) => setTimeout(r, 200));

    const metricsRes = await getJson(`http://localhost:${port}/v1/metrics`);
    assert.strictEqual(metricsRes.status, 200);
    assert.strictEqual(metricsRes.body.totalSettledNotes, 2);
    assert.strictEqual(metricsRes.body.totalBatchesSettled, 1);
    console.log(`✔ Threshold triggered: Batch of 2 notes settled via Circle Gas Station Paymaster`);
    console.log(`  • Total Settled Notes:   ${metricsRes.body.totalSettledNotes}`);
    console.log(`  • Batches Settled:       ${metricsRes.body.totalBatchesSettled}`);
    console.log(`  • Sponsored Gas Saved:   ${metricsRes.body.totalGasSponsoredUsd}\n`);

    console.log("🎉 All ArcNano Relayer Daemon tests passed successfully!");
  } finally {
    await daemon.stop();
  }
}

runDaemonTests().catch((err) => {
  console.error("❌ Relayer Daemon test failure:", err);
  process.exit(1);
});
