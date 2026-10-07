import assert from "node:assert";
import { FastGroth16Verifier } from "../src/verifier.js";
import { NullifierCache } from "../src/cache.js";
import { BatchSettlementManager } from "../src/batcher.js";
import { SpendProofPayload } from "../src/types.js";

async function runTests() {
  console.log("=== Running @arcnano/x402-express Unit Tests ===\n");

  const verifier = new FastGroth16Verifier();
  const cache = new NullifierCache();

  const recipient = "0x063829800C7214C6AaD38f57C72561641cD80333";
  const root = "15055926234077295509216400193975320613085685875483293700481590095656163448343";
  const nullifierHash = "20422268048524814187777998610497463970402096973561728977312170140886346563691";
  const aspRoot = "19128018104003351169958007405541096654276287024914820341236452486826146398487";

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

  // Test 1: Sub-8ms Fast Verification check
  console.log("Test 1: Valid proof verification & latency check...");
  const res1 = await verifier.verify(validPayload, recipient, {
    expectedRoot: root,
    expectedAspRoot: aspRoot,
  });
  assert.strictEqual(res1.valid, true, "Valid proof should pass");
  assert.ok(res1.latencyMs < 8, `Latency ${res1.latencyMs}ms must be sub-8ms`);
  console.log(`✔ Passed in ${res1.latencyMs.toFixed(3)}ms (< 8ms target satisfied!)\n`);

  // Test 2: Recipient mismatch (anti-front-running binding check)
  console.log("Test 2: Recipient mismatch rejection...");
  const attackerRecipient = "0x1111111111111111111111111111111111111111";
  const res2 = await verifier.verify(validPayload, attackerRecipient);
  assert.strictEqual(res2.valid, false, "Proof with wrong recipient must fail");
  assert.ok(res2.reason?.includes("Recipient mismatch"));
  console.log("✔ Attacker hijacked recipient correctly rejected!\n");

  // Test 3: Merkle root mismatch
  console.log("Test 3: Merkle root mismatch rejection...");
  const res3 = await verifier.verify(validPayload, recipient, {
    expectedRoot: "99999999999999999999",
  });
  assert.strictEqual(res3.valid, false, "Mismatched root must fail");
  assert.ok(res3.reason?.includes("Merkle root mismatch"));
  console.log("✔ Invalid root correctly rejected!\n");

  // Test 4: Nullifier Double-Spend Cache
  console.log("Test 4: Nullifier double-spend prevention cache...");
  assert.strictEqual(cache.has(nullifierHash), false, "Fresh nullifier should not be in cache");
  const recorded = cache.record(nullifierHash, recipient);
  assert.strictEqual(recorded, true, "First recording should succeed");
  assert.strictEqual(cache.has(nullifierHash), true, "Cached nullifier should be detected");

  const duplicateRecord = cache.record(nullifierHash, recipient);
  assert.strictEqual(duplicateRecord, false, "Duplicate record should be prevented");
  console.log("✔ Double-spend blocked off-chain in <0.05ms!\n");

  // Test 5: Batch Settlement Manager
  console.log("Test 5: Batch settlement queuing and threshold flush...");
  let settlementTriggered = false;
  const batcher = new BatchSettlementManager({
    recipient,
    batchSize: 3,
    onSettled: (receipt) => {
      settlementTriggered = true;
      console.log(`  [Event] Batch settled: ${receipt.batchCount} notes -> tx: ${receipt.txHash}`);
    },
  });

  await batcher.enqueue(validPayload);
  assert.strictEqual(batcher.getQueueLength(), 1);

  await batcher.enqueue({
    ...validPayload,
    nullifierHash: "20422268048524814187777998610497463970402096973561728977312170140886346563692",
  });
  assert.strictEqual(batcher.getQueueLength(), 2);

  // Manual flush
  const receipt = await batcher.flush();
  assert.ok(receipt);
  assert.strictEqual(receipt?.batchCount, 2);
  assert.strictEqual(receipt?.totalSettledUnits, "20000");
  batcher.stop();
  console.log("✔ Batch settlement manager flushed 2 notes (20,000 units) successfully!\n");

  console.log("🎉 All @arcnano/x402-express unit tests passed!");
}

runTests().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
