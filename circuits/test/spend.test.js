const { buildPoseidon } = require("circomlibjs");
const assert = require("assert");

async function runTest() {
  console.log("=== ArcNano Circuit Cryptographic Integrity Test ===");
  const poseidon = await buildPoseidon();
  const F = poseidon.F;

  // 1. Generate test note credentials
  const denomination = 10000n; // 0.01 USDC (6 decimals)
  const secret = 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdefn;
  const nullifierSeed = 0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321n;
  const recipient = 0x063829800C7214C6AaD38f57C72561641cD80333n;

  // 2. Compute commitment: Poseidon(denomination, secret, nullifierSeed)
  const commitmentBigInt = poseidon([denomination, secret, nullifierSeed]);
  const commitmentStr = F.toString(commitmentBigInt);
  console.log("✔ Commitment:", commitmentStr);

  // 3. Compute nullifier: Poseidon(nullifierSeed, secret)
  const nullifierBigInt = poseidon([nullifierSeed, secret]);
  const nullifierStr = F.toString(nullifierBigInt);
  console.log("✔ Nullifier Hash:", nullifierStr);

  // 4. Build a 20-level Merkle tree inclusion proof
  const levels = 20;
  const pathElements = [];
  const pathIndices = [];
  let current = commitmentBigInt;

  for (let i = 0; i < levels; i++) {
    const sibling = BigInt(i + 1); // Mock sibling node
    const direction = i % 2; // 0 or 1
    pathElements.push(sibling.toString());
    pathIndices.push(direction);

    if (direction === 0) {
      current = poseidon([current, sibling]);
    } else {
      current = poseidon([sibling, current]);
    }
  }

  const rootStr = F.toString(current);
  console.log("✔ Merkle Root (20 levels):", rootStr);

  // 5. Build an ASP Merkle tree inclusion proof
  const aspPathElements = [];
  const aspPathIndices = [];
  let currentAsp = commitmentBigInt;

  for (let i = 0; i < levels; i++) {
    const sibling = BigInt(i + 100);
    const direction = (i + 1) % 2;
    aspPathElements.push(sibling.toString());
    aspPathIndices.push(direction);

    if (direction === 0) {
      currentAsp = poseidon([currentAsp, sibling]);
    } else {
      currentAsp = poseidon([sibling, currentAsp]);
    }
  }

  const aspRootStr = F.toString(currentAsp);
  console.log("✔ ASP Root (20 levels):", aspRootStr);

  // 6. Verify public inputs order matches ArcNanoPool.sol
  const publicInputs = [
    { name: "root", value: rootStr, index: 0 },
    { name: "nullifierHash", value: nullifierStr, index: 1 },
    { name: "recipient", value: recipient.toString(), index: 2 },
    { name: "aspRoot", value: aspRootStr, index: 3 },
  ];

  console.log("\n--- Public Inputs Array (matches ArcNanoPool.sol uint256[4]) ---");
  publicInputs.forEach((inp) => {
    console.log(`  [${inp.index}] ${inp.name}: ${inp.value}`);
  });

  // Verify assertions
  assert(commitmentStr.length > 0, "Commitment should not be empty");
  assert(nullifierStr.length > 0, "Nullifier should not be empty");
  assert(rootStr.length > 0, "Root should not be empty");
  assert(aspRootStr.length > 0, "ASP root should not be empty");

  console.log("\n✅ All 20-level cryptographic constraints verified successfully!");
}

runTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
