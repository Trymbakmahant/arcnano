const fs = require("fs");
const path = require("path");
const { buildPoseidon } = require("circomlibjs");

async function generateSampleInput() {
  const poseidon = await buildPoseidon();
  const F = poseidon.F;

  const denomination = 10000n; // 0.01 USDC
  const secret = 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdefn;
  const nullifierSeed = 0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321n;
  const recipient = 0x063829800C7214C6AaD38f57C72561641cD80333n;

  const commitment = poseidon([denomination, secret, nullifierSeed]);
  const nullifier = poseidon([nullifierSeed, secret]);

  const levels = 20;
  const pathElements = [];
  const pathIndices = [];
  let current = commitment;

  for (let i = 0; i < levels; i++) {
    const sibling = BigInt(i + 1);
    const direction = i % 2;
    pathElements.push(sibling.toString());
    pathIndices.push(direction);
    current = direction === 0 ? poseidon([current, sibling]) : poseidon([sibling, current]);
  }

  const aspPathElements = [];
  const aspPathIndices = [];
  let currentAsp = commitment;

  for (let i = 0; i < levels; i++) {
    const sibling = BigInt(i + 100);
    const direction = (i + 1) % 2;
    aspPathElements.push(sibling.toString());
    aspPathIndices.push(direction);
    currentAsp = direction === 0 ? poseidon([currentAsp, sibling]) : poseidon([sibling, currentAsp]);
  }

  const input = {
    root: F.toString(current),
    nullifierHash: F.toString(nullifier),
    recipient: recipient.toString(),
    aspRoot: F.toString(currentAsp),
    denomination: denomination.toString(),
    secret: secret.toString(),
    nullifierSeed: nullifierSeed.toString(),
    pathElements,
    pathIndices,
    aspPathElements,
    aspPathIndices,
  };

  const outPath = path.join(__dirname, "..", "input.json");
  fs.writeFileSync(outPath, JSON.stringify(input, null, 2));
  console.log(`Generated sample input at ${outPath}`);
}

generateSampleInput().catch(console.error);
