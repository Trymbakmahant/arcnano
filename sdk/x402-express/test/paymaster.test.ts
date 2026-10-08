import assert from "node:assert";
import { CirclePaymasterClient } from "../src/paymaster.js";
import { SpendProofPayload } from "../src/types.js";

async function runPaymasterTests() {
  console.log("=== Running Arc Circle Gas Station Paymaster Tests ===\n");

  const poolAddress = "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca";
  const recipient = "0x063829800C7214C6AaD38f57C72561641cD80333";
  const root = "15055926234077295509216400193975320613085685875483293700481590095656163448343";
  const nullifierHash = "20422268048524814187777998610497463970402096973561728977312170140886346563691";
  const aspRoot = "19128018104003351169958007405541096654276287024914820341236452486826146398487";

  const client = new CirclePaymasterClient({ poolAddress });

  // Test 1: Sponsorship policy retrieval
  console.log("Test 1: Querying Circle Gas Station policy...");
  const policy = await client.getSponsorshipPolicy();
  assert.strictEqual(policy.chainId, 5042002);
  assert.strictEqual(policy.coveredGasPercent, 100);
  assert.strictEqual(policy.status, "active");
  assert.ok(policy.whitelistedContracts.includes(poolAddress));
  console.log(`✔ Sponsorship Policy active: 100% gas covered for Arc Testnet (${policy.network})\n`);

  // Test 2: Whitelist contract eligibility
  console.log("Test 2: Verifying contract eligibility...");
  const isEligible = client.verifyContractEligibility(poolAddress);
  const isRandomEligible = client.verifyContractEligibility("0x0000000000000000000000000000000000000001");
  assert.strictEqual(isEligible, true);
  assert.strictEqual(isRandomEligible, false);
  console.log("✔ ArcNanoPool contract whitelisted for gas sponsorship\n");

  // Test 3: Formatting proofs for Solidity struct
  console.log("Test 3: Formatting proofs into Solidity SpendProof[] struct...");
  const samplePayload: SpendProofPayload = {
    proof: {
      a: ["123", "456"],
      b: [["789", "101"], ["112", "131"]],
      c: ["415", "161"],
    },
    root,
    nullifierHash,
    recipient,
    aspRoot,
  };

  const formatted = client.formatProofsForSolidity([samplePayload]);
  assert.strictEqual(formatted.length, 1);
  assert.strictEqual(formatted[0].a[0], 123n);
  assert.ok(formatted[0].root.startsWith("0x"));
  assert.ok(formatted[0].nullifierHash.startsWith("0x"));
  console.log("✔ Proof successfully serialized into 32-byte Solidity ABI representation\n");

  // Test 4: Building ERC-4337 UserOperation
  console.log("Test 4: Constructing ERC-4337 UserOperation...");
  const userOp = await client.buildUserOp(formatted, recipient);
  assert.ok(userOp.callData.length > 10);
  assert.ok(userOp.paymasterAndData.length > 20);
  assert.ok(userOp.callGasLimit > 0n);
  console.log("✔ UserOp generated with valid PaymasterAndData sponsorship\n");

  // Test 5: Executing sponsored batch settlement
  console.log("Test 5: Executing sponsored batch settlement...");
  const receipt = await client.executeSponsoredBatch([samplePayload], recipient);
  assert.strictEqual(receipt.batchCount, 1);
  assert.strictEqual(receipt.totalSettledAmount, "0.01 USDC");
  assert.strictEqual(receipt.agentGasCost, "$0.00");
  assert.strictEqual(receipt.sponsor, "Arc Circle Gas Station Paymaster");
  assert.ok(receipt.txHash.startsWith("0x"));
  console.log(`✔ Batch settlement sponsored! Tx: ${receipt.txHash.slice(0, 18)}...`);
  console.log(`  • Agent Gas Paid:    ${receipt.agentGasCost}`);
  console.log(`  • Sponsor:           ${receipt.sponsor}`);
  console.log(`  • Settled Value:     ${receipt.totalSettledAmount}\n`);

  console.log("🎉 All Circle Gas Station Paymaster tests passed successfully!");
}

runPaymasterTests().catch((err) => {
  console.error("❌ Paymaster test failure:", err);
  process.exit(1);
});
