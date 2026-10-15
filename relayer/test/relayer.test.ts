import assert from "node:assert";
import fs from "node:fs";
import { createRelayerApp } from "../src/app.js";
import { SpendProofPayload } from "../src/types.js";

async function runTests() {
  console.log("==================================================================");
  console.log("🧪 Running ArcNano Hono.js TypeScript Relayer Test Suite");
  console.log("==================================================================\n");

  const testStorePath = `./data/test_relayer_store_${Date.now()}.json`;
  const { app, storage } = createRelayerApp({
    batchThreshold: 2,
    storagePath: testStorePath,
  });

  try {
    // 1. Root / Dashboard check
    console.log("Test 1: GET / (Dashboard Index)...");
    const rootRes = await app.request("http://localhost/");
    assert.strictEqual(rootRes.status, 200);
    const rootData = await rootRes.json();
    assert.strictEqual(rootData.name, "ArcNano Automated Batch Relayer Backend");
    assert.strictEqual(rootData.framework, "Hono.js (TypeScript)");
    console.log("✔ Root endpoint responding with Hono info and endpoints guide\n");

    // 2. Health & Status check
    console.log("Test 2: GET /v1/status...");
    const statusRes = await app.request("http://localhost/v1/status");
    assert.strictEqual(statusRes.status, 200);
    const statusData = await statusRes.json();
    assert.strictEqual(statusData.status, "operational");
    assert.strictEqual(statusData.batchThreshold, 2);
    console.log("✔ Status operational, networks configured\n");

    // 3. Validation checks
    console.log("Test 3: POST /v1/proofs/submit (Validation errors)...");
    const invalidRes1 = await app.request("http://localhost/v1/proofs/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    assert.strictEqual(invalidRes1.status, 400);

    const invalidRes2 = await app.request("http://localhost/v1/proofs/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        payload: { proof: { a: ["1", "2"], b: [["3", "4"], ["5", "6"]], c: ["7", "8"] }, nullifierHash: "0x123" },
        recipient: "not-an-address",
      }),
    });
    assert.strictEqual(invalidRes2.status, 400);
    console.log("✔ Malformed requests correctly rejected with 400 Bad Request\n");

    // 4. Ingest first valid proof
    console.log("Test 4: Ingesting verified spend proof into persistent store...");
    const samplePayload1: SpendProofPayload = {
      proof: {
        a: ["101", "102"],
        b: [["103", "104"], ["105", "106"]],
        c: ["107", "108"],
      },
      root: "15055926234077295509216400193975320613085685875483293700481590095656163448343",
      nullifierHash: "0x1111111111111111111111111111111111111111111111111111111111111111",
      recipient: "0x063829800C7214C6AaD38f57C72561641cD80333",
      aspRoot: "0x0000000000000000000000000000000000000000000000000000000000001337",
    };

    const submitRes1 = await app.request("http://localhost/v1/proofs/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        payload: samplePayload1,
        recipient: "0x063829800C7214C6AaD38f57C72561641cD80333",
      }),
    });
    assert.strictEqual(submitRes1.status, 200);
    const submitData1 = await submitRes1.json();
    assert.strictEqual(submitData1.success, true);
    assert.strictEqual(submitData1.queuedCount, 1);
    assert.strictEqual(submitData1.autoFlushed, false);
    const proofId1 = submitData1.proofId;
    console.log(`✔ Proof stored and queued (ID: ${proofId1})\n`);

    // 5. Double-Spend Rejection Check
    console.log("Test 5: Replaying same nullifier to test double-spend protection...");
    const dupRes = await app.request("http://localhost/v1/proofs/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        payload: samplePayload1,
        recipient: "0x063829800C7214C6AaD38f57C72561641cD80333",
      }),
    });
    assert.strictEqual(dupRes.status, 409);
    const dupData = await dupRes.json();
    assert.ok(dupData.error.includes("Double-spend"));
    console.log("✔ Duplicate nullifier rejected with 409 Conflict\n");

    // 6. Ingest second note to hit batchThreshold = 2 and trigger auto-flush
    console.log("Test 6: Ingesting second proof to trigger automatic threshold batch settlement...");
    const samplePayload2: SpendProofPayload = {
      ...samplePayload1,
      nullifierHash: "0x2222222222222222222222222222222222222222222222222222222222222222",
    };

    const submitRes2 = await app.request("http://localhost/v1/proofs/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        payload: samplePayload2,
        recipient: "0x063829800C7214C6AaD38f57C72561641cD80333",
      }),
    });
    assert.strictEqual(submitRes2.status, 200);
    const submitData2 = await submitRes2.json();
    assert.strictEqual(submitData2.autoFlushed, true);
    assert.strictEqual(submitData2.batch.proofCount, 2);
    assert.ok(submitData2.batch.txHash);
    console.log(`✔ Auto-batch triggered! Settled 2 notes in batch ${submitData2.batch.id}`);
    console.log(`  • Tx Hash:   ${submitData2.batch.txHash}`);
    console.log(`  • Explorer:  ${submitData2.batch.explorerUrl}\n`);

    // 7. Verify Proof Status Query
    console.log("Test 7: Querying settled proof status (/v1/proofs/:id)...");
    const queryProofRes = await app.request(`http://localhost/v1/proofs/${proofId1}`);
    assert.strictEqual(queryProofRes.status, 200);
    const queryProofData = await queryProofRes.json();
    assert.strictEqual(queryProofData.proof.status, "settled");
    assert.strictEqual(queryProofData.proof.txHash, submitData2.batch.txHash);
    console.log(`✔ Proof status updated to 'settled' with txHash attached\n`);

    // 8. Multi-Recipient Partitioning
    console.log("Test 8: Partitioning multi-recipient queues (Alice & Bob)...");
    const alice = "0x1111111111111111111111111111111111111111";
    const bob = "0x2222222222222222222222222222222222222222";

    await app.request("http://localhost/v1/proofs/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        payload: { ...samplePayload1, nullifierHash: "0x3333333333333333333333333333333333333333333333333333333333333333" },
        recipient: alice,
      }),
    });

    await app.request("http://localhost/v1/proofs/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        payload: { ...samplePayload1, nullifierHash: "0x4444444444444444444444444444444444444444444444444444444444444444" },
        recipient: bob,
      }),
    });

    const queueRes = await app.request("http://localhost/v1/queue");
    assert.strictEqual(queueRes.status, 200);
    const queueData = await queueRes.json();
    assert.strictEqual(queueData.totalQueues, 2);
    console.log("✔ Queues partitioned by recipient:");
    for (const q of queueData.queues) {
      console.log(`  • Recipient ${q.recipient}: ${q.count} note(s) queued (${q.totalUsdc})`);
    }
    console.log();

    // 9. On-Demand Batch Withdrawal Execution
    console.log("Test 9: Triggering on-demand batch withdrawal (/v1/batch/withdraw)...");
    const withdrawRes = await app.request("http://localhost/v1/batch/withdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipient: alice }),
    });
    assert.strictEqual(withdrawRes.status, 200);
    const withdrawData = await withdrawRes.json();
    assert.strictEqual(withdrawData.success, true);
    assert.strictEqual(withdrawData.batch.recipient, alice);
    console.log(`✔ On-demand batch withdrawal completed for Alice (Tx: ${withdrawData.batch.txHash.slice(0, 18)}...)\n`);

    // 10. Batches History Query
    console.log("Test 10: Querying batch transaction history (/v1/batches)...");
    const batchesRes = await app.request("http://localhost/v1/batches");
    assert.strictEqual(batchesRes.status, 200);
    const batchesData = await batchesRes.json();
    assert.ok(batchesData.batches.length >= 2);
    console.log(`✔ Found ${batchesData.batches.length} historical settled batches\n`);

    console.log("==================================================================");
    console.log("🎉 ALL 10 HONO.JS RELAYER BACKEND TESTS PASSED CLEANLY!");
    console.log("==================================================================");
  } finally {
    try {
      if (fs.existsSync(testStorePath)) fs.unlinkSync(testStorePath);
    } catch {
      // ignore
    }
  }
}

runTests().catch((err) => {
  console.error("❌ Hono Relayer Test Suite Failed:", err);
  process.exit(1);
});
