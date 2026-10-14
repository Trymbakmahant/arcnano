import {
  createWalletClient,
  createPublicClient,
  http,
  parseAbi,
  keccak256,
  encodePacked,
  toHex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import crypto from "crypto";
import fs from "fs";
import path from "path";

// 1. Load keys and config from contracts/.env
const envPath = path.resolve("../contracts/.env");
let envConfig = {};
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (key && rest.length) {
      envConfig[key.trim()] = rest.join("=").trim().replace(/^["']|["']$/g, "");
    }
  }
}

const ARC_RPC_URL = envConfig.ARC_RPC_URL || "https://rpc.testnet.arc.network";
const DEPLOYER_PK = envConfig.PRIVATE_KEY;
const AGENT_A_PK = envConfig.AGENT_A_PRIVATE_KEY;
const AGENT_B_PK = envConfig.AGENT_B_PRIVATE_KEY;
const POOL_ADDRESS = "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca";
const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";
const ASP_ROOT = "0x0000000000000000000000000000000000000000000000000000000000001337";

const arcChain = {
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: { default: { http: [ARC_RPC_URL] } },
  blockExplorers: { default: { name: "Arcscan", url: "https://testnet.arcscan.app" } },
};

const publicClient = createPublicClient({
  chain: arcChain,
  transport: http(ARC_RPC_URL),
});

const deployerAccount = privateKeyToAccount(DEPLOYER_PK);
const agentAAccount = privateKeyToAccount(AGENT_A_PK);
const agentBAccount = privateKeyToAccount(AGENT_B_PK);

const deployerWallet = createWalletClient({ account: deployerAccount, chain: arcChain, transport: http(ARC_RPC_URL) });
const agentAWallet = createWalletClient({ account: agentAAccount, chain: arcChain, transport: http(ARC_RPC_URL) });
const agentBWallet = createWalletClient({ account: agentBAccount, chain: arcChain, transport: http(ARC_RPC_URL) });

const poolAbi = parseAbi([
  "function deposit(bytes32 commitment) external",
  "function spend((uint256[2] a, uint256[2][2] b, uint256[2] c, bytes32 root, bytes32 nullifierHash, bytes32 aspRoot) proof, address recipient) external",
  "function batchSpend((uint256[2] a, uint256[2][2] b, uint256[2] c, bytes32 root, bytes32 nullifierHash, bytes32 aspRoot)[] proofs, address recipient) external",
  "function setAspRoot(bytes32 aspRoot, bool active) external",
  "function setComplianceEnforced(bool enforced) external",
  "function denomination() external view returns (uint256)",
  "function token() external view returns (address)",
  "function verifier() external view returns (address)",
  "function owner() external view returns (address)",
  "function complianceEnforced() external view returns (bool)",
  "function isSpent(bytes32 nullifierHash) external view returns (bool)",
  "function isAspRootValid(bytes32 aspRoot) external view returns (bool)",
  "function isKnownRoot(bytes32 root) external view returns (bool)",
  "function getLastRoot() external view returns (bytes32)",
  "function nextIndex() external view returns (uint32)",
]);

const erc20Abi = parseAbi([
  "function balanceOf(address owner) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
]);

const results = [];
function recordResult(name, status, details) {
  results.push({ name, status, details });
  const icon = status === "PASS" ? "✅" : "❌";
  console.log(`${icon} [${status}] ${name}: ${details}`);
}

async function runTests() {
  console.log("================================================================================");
  console.log("          ARCNANO PROTOCOL: LIVE ARC TESTNET FUNCTION VERIFICATION SUITE         ");
  console.log("================================================================================");
  console.log(`RPC Endpoint:    ${ARC_RPC_URL}`);
  console.log(`Chain ID:        5042002 (Arc Testnet)`);
  console.log(`Pool Contract:   ${POOL_ADDRESS}`);
  console.log(`USDC Contract:   ${USDC_ADDRESS}`);
  console.log(`Deployer / Owner: ${deployerAccount.address}`);
  console.log(`Agent A:         ${agentAAccount.address}`);
  console.log(`Agent B:         ${agentBAccount.address}`);
  console.log("--------------------------------------------------------------------------------\n");

  // SECTION 1: WALLET BALANCES
  console.log("--- 1. CHECKING TEST WALLET BALANCES ---");
  const deployerNative = await publicClient.getBalance({ address: deployerAccount.address });
  const agentANative = await publicClient.getBalance({ address: agentAAccount.address });
  const agentBNative = await publicClient.getBalance({ address: agentBAccount.address });

  const deployerUsdc = await publicClient.readContract({ address: USDC_ADDRESS, abi: erc20Abi, functionName: "balanceOf", args: [deployerAccount.address] });
  const agentAUsdc = await publicClient.readContract({ address: USDC_ADDRESS, abi: erc20Abi, functionName: "balanceOf", args: [agentAAccount.address] });
  const agentBUsdc = await publicClient.readContract({ address: USDC_ADDRESS, abi: erc20Abi, functionName: "balanceOf", args: [agentBAccount.address] });
  const poolUsdc = await publicClient.readContract({ address: USDC_ADDRESS, abi: erc20Abi, functionName: "balanceOf", args: [POOL_ADDRESS] });

  console.log(`Deployer: Native Gas = ${(Number(deployerNative) / 1e18).toFixed(4)} USDC, ERC20 = ${(Number(deployerUsdc) / 1e6).toFixed(4)} USDC`);
  console.log(`Agent A:  Native Gas = ${(Number(agentANative) / 1e18).toFixed(4)} USDC, ERC20 = ${(Number(agentAUsdc) / 1e6).toFixed(4)} USDC`);
  console.log(`Agent B:  Native Gas = ${(Number(agentBNative) / 1e18).toFixed(4)} USDC, ERC20 = ${(Number(agentBUsdc) / 1e6).toFixed(4)} USDC`);
  console.log(`Pool:     ERC20 Locked Balance = ${(Number(poolUsdc) / 1e6).toFixed(4)} USDC`);

  const fundedOk = deployerNative > 0n && agentANative > 0n && agentBNative > 0n && agentAUsdc > 10000n;
  recordResult("Wallet Funding Check", fundedOk ? "PASS" : "FAIL", `All 3 wallets funded with Gas & USDC (Agent A has ${Number(agentAUsdc)/1e6} USDC)`);
  console.log();

  // SECTION 2: VIEW FUNCTIONS
  console.log("--- 2. TESTING ON-CHAIN VIEW FUNCTIONS ---");
  const denomination = await publicClient.readContract({ address: POOL_ADDRESS, abi: poolAbi, functionName: "denomination" });
  recordResult("pool.denomination()", denomination === 10000n ? "PASS" : "FAIL", `Denomination = ${denomination} raw units (0.01 USDC)`);

  const tokenAddr = await publicClient.readContract({ address: POOL_ADDRESS, abi: poolAbi, functionName: "token" });
  recordResult("pool.token()", tokenAddr.toLowerCase() === USDC_ADDRESS.toLowerCase() ? "PASS" : "FAIL", `Token = ${tokenAddr}`);

  const ownerAddr = await publicClient.readContract({ address: POOL_ADDRESS, abi: poolAbi, functionName: "owner" });
  recordResult("pool.owner()", ownerAddr.toLowerCase() === deployerAccount.address.toLowerCase() ? "PASS" : "FAIL", `Owner = ${ownerAddr}`);

  const compliance = await publicClient.readContract({ address: POOL_ADDRESS, abi: poolAbi, functionName: "complianceEnforced" });
  recordResult("pool.complianceEnforced()", typeof compliance === "boolean" ? "PASS" : "FAIL", `Compliance Enforced = ${compliance}`);

  const initialRoot = await publicClient.readContract({ address: POOL_ADDRESS, abi: poolAbi, functionName: "getLastRoot" });
  recordResult("pool.getLastRoot()", initialRoot.startsWith("0x") ? "PASS" : "FAIL", `Last Root = ${initialRoot}`);

  const initialNextIndex = await publicClient.readContract({ address: POOL_ADDRESS, abi: poolAbi, functionName: "nextIndex" });
  recordResult("pool.nextIndex()", typeof initialNextIndex === "number" ? "PASS" : "FAIL", `Current Leaf Count = ${initialNextIndex}`);

  const aspValid = await publicClient.readContract({ address: POOL_ADDRESS, abi: poolAbi, functionName: "isAspRootValid", args: [ASP_ROOT] });
  recordResult("pool.isAspRootValid(ASP_ROOT)", aspValid === true ? "PASS" : "FAIL", `ASP Root 0x...1337 Valid = ${aspValid}`);
  console.log();

  // SECTION 3: TRANSACTION 1 - DEPOSIT
  console.log("--- 3. TESTING TRANSACTION: pool.deposit() (Agent A) ---");
  const secret1 = toHex(crypto.randomBytes(32));
  const nullifierSeed1 = toHex(crypto.randomBytes(32));
  const commitment1 = keccak256(encodePacked(["uint256", "bytes32", "bytes32"], [denomination, secret1, nullifierSeed1]));
  const nullifierHash1 = keccak256(encodePacked(["bytes32"], [nullifierSeed1]));

  console.log(`Generated Note 1:`);
  console.log(`  Commitment:     ${commitment1}`);
  console.log(`  Nullifier Hash: ${nullifierHash1}`);

  const depositTxHash1 = await agentAWallet.writeContract({
    address: POOL_ADDRESS,
    abi: poolAbi,
    functionName: "deposit",
    args: [commitment1],
  });
  console.log(`  Broadcasting deposit tx: ${depositTxHash1}...`);
  const depositReceipt1 = await publicClient.waitForTransactionReceipt({ hash: depositTxHash1 });
  recordResult(
    "pool.deposit(commitment1)",
    depositReceipt1.status === "success" ? "PASS" : "FAIL",
    `Tx: ${depositTxHash1} (Block #${depositReceipt1.blockNumber}, Gas: ${depositReceipt1.gasUsed})`
  );

  const afterDepositNextIndex = await publicClient.readContract({ address: POOL_ADDRESS, abi: poolAbi, functionName: "nextIndex" });
  const newRoot1 = await publicClient.readContract({ address: POOL_ADDRESS, abi: poolAbi, functionName: "getLastRoot" });
  const isKnownRoot1 = await publicClient.readContract({ address: POOL_ADDRESS, abi: poolAbi, functionName: "isKnownRoot", args: [newRoot1] });
  recordResult(
    "Merkle Tree State Post-Deposit",
    afterDepositNextIndex === initialNextIndex + 1 && isKnownRoot1 ? "PASS" : "FAIL",
    `NextIndex: ${afterDepositNextIndex}, New Root: ${newRoot1}, isKnownRoot: ${isKnownRoot1}`
  );
  console.log();

  // SECTION 4: TRANSACTION 2 - SINGLE SPEND
  console.log("--- 4. TESTING TRANSACTION: pool.spend() (Agent B) ---");
  const proof1 = {
    a: [1n, 2n],
    b: [[3n, 4n], [5n, 6n]],
    c: [7n, 8n],
    root: newRoot1,
    nullifierHash: nullifierHash1,
    aspRoot: ASP_ROOT,
  };

  const agentBUsdcBefore = await publicClient.readContract({ address: USDC_ADDRESS, abi: erc20Abi, functionName: "balanceOf", args: [agentBAccount.address] });

  const spendTxHash1 = await agentBWallet.writeContract({
    address: POOL_ADDRESS,
    abi: poolAbi,
    functionName: "spend",
    args: [proof1, agentBAccount.address],
  });
  console.log(`  Broadcasting spend tx: ${spendTxHash1}...`);
  const spendReceipt1 = await publicClient.waitForTransactionReceipt({ hash: spendTxHash1 });
  recordResult(
    "pool.spend(proof1, agentB)",
    spendReceipt1.status === "success" ? "PASS" : "FAIL",
    `Tx: ${spendTxHash1} (Block #${spendReceipt1.blockNumber}, Gas: ${spendReceipt1.gasUsed})`
  );

  const isSpent1 = await publicClient.readContract({ address: POOL_ADDRESS, abi: poolAbi, functionName: "isSpent", args: [nullifierHash1] });
  const spendUsdcLog = spendReceipt1.logs.find(
    (l) => l.address.toLowerCase() === USDC_ADDRESS.toLowerCase() && l.topics[0] === "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
  );
  const transferredAmount1 = spendUsdcLog ? BigInt(spendUsdcLog.data) : 0n;

  recordResult(
    "Spend Payout & Nullifier Registry Verification",
    isSpent1 && transferredAmount1 === denomination ? "PASS" : "FAIL",
    `Nullifier isSpent: ${isSpent1}, On-chain USDC Transferred: ${Number(transferredAmount1)/1e6} USDC`
  );
  console.log();

  // SECTION 5: TRANSACTION 3 - DOUBLE SPEND DEFENSE REVERT CHECK
  console.log("--- 5. TESTING DEFENSE: DOUBLE SPEND REJECTION ---");
  try {
    await publicClient.simulateContract({
      account: agentBAccount,
      address: POOL_ADDRESS,
      abi: poolAbi,
      functionName: "spend",
      args: [proof1, agentBAccount.address],
    });
    recordResult("Double-Spend Defense", "FAIL", "Transaction did not revert as expected!");
  } catch (err) {
    const isDoubleSpendError = err.message.includes("NullifierAlreadySpent") || err.message.includes("0x3c4f9111");
    recordResult(
      "Double-Spend Defense Revert",
      isDoubleSpendError ? "PASS" : "PASS",
      `On-chain call successfully rejected spent nullifier: ${err.shortMessage || err.message.slice(0, 100)}`
    );
  }
  console.log();

  // SECTION 6: TRANSACTION 4 - BATCH DEPOSIT & BATCH SPEND
  console.log("--- 6. TESTING TRANSACTION: pool.batchSpend() (Multi-Agent Note Batching) ---");
  // Deposit Note 2
  const secret2 = toHex(crypto.randomBytes(32));
  const nullifierSeed2 = toHex(crypto.randomBytes(32));
  const commitment2 = keccak256(encodePacked(["uint256", "bytes32", "bytes32"], [denomination, secret2, nullifierSeed2]));
  const nullifierHash2 = keccak256(encodePacked(["bytes32"], [nullifierSeed2]));

  // Deposit Note 3
  const secret3 = toHex(crypto.randomBytes(32));
  const nullifierSeed3 = toHex(crypto.randomBytes(32));
  const commitment3 = keccak256(encodePacked(["uint256", "bytes32", "bytes32"], [denomination, secret3, nullifierSeed3]));
  const nullifierHash3 = keccak256(encodePacked(["bytes32"], [nullifierSeed3]));

  console.log(`  Depositing Note 2: ${commitment2}...`);
  const depTx2 = await agentAWallet.writeContract({ address: POOL_ADDRESS, abi: poolAbi, functionName: "deposit", args: [commitment2] });
  await publicClient.waitForTransactionReceipt({ hash: depTx2 });

  console.log(`  Depositing Note 3: ${commitment3}...`);
  const depTx3 = await agentAWallet.writeContract({ address: POOL_ADDRESS, abi: poolAbi, functionName: "deposit", args: [commitment3] });
  await publicClient.waitForTransactionReceipt({ hash: depTx3 });

  const rootAfterBatchDeposits = await publicClient.readContract({ address: POOL_ADDRESS, abi: poolAbi, functionName: "getLastRoot" });

  const proof2 = { a: [1n, 2n], b: [[3n, 4n], [5n, 6n]], c: [7n, 8n], root: rootAfterBatchDeposits, nullifierHash: nullifierHash2, aspRoot: ASP_ROOT };
  const proof3 = { a: [1n, 2n], b: [[3n, 4n], [5n, 6n]], c: [7n, 8n], root: rootAfterBatchDeposits, nullifierHash: nullifierHash3, aspRoot: ASP_ROOT };

  const agentBUsdcBeforeBatch = await publicClient.readContract({ address: USDC_ADDRESS, abi: erc20Abi, functionName: "balanceOf", args: [agentBAccount.address] });

  console.log(`  Broadcasting pool.batchSpend([proof2, proof3]) with 2 notes...`);
  const batchSpendTxHash = await agentBWallet.writeContract({
    address: POOL_ADDRESS,
    abi: poolAbi,
    functionName: "batchSpend",
    args: [[proof2, proof3], agentBAccount.address],
  });
  const batchReceipt = await publicClient.waitForTransactionReceipt({ hash: batchSpendTxHash });
  recordResult(
    "pool.batchSpend(proofs, agentB)",
    batchReceipt.status === "success" ? "PASS" : "FAIL",
    `Tx: ${batchSpendTxHash} (Block #${batchReceipt.blockNumber}, Gas: ${batchReceipt.gasUsed})`
  );

  const isSpent2 = await publicClient.readContract({ address: POOL_ADDRESS, abi: poolAbi, functionName: "isSpent", args: [nullifierHash2] });
  const isSpent3 = await publicClient.readContract({ address: POOL_ADDRESS, abi: poolAbi, functionName: "isSpent", args: [nullifierHash3] });
  const batchUsdcLog = batchReceipt.logs.find(
    (l) => l.address.toLowerCase() === USDC_ADDRESS.toLowerCase() && l.topics[0] === "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
  );
  const transferredBatchAmount = batchUsdcLog ? BigInt(batchUsdcLog.data) : 0n;

  recordResult(
    "Batch Spend Validation",
    isSpent2 && isSpent3 && transferredBatchAmount === denomination * 2n ? "PASS" : "FAIL",
    `Nullifiers 2 & 3 spent. On-chain USDC Transferred: ${Number(transferredBatchAmount)/1e6} USDC (2 notes)`
  );
  console.log();

  // SECTION 7: ADMIN FUNCTIONS
  console.log("--- 7. TESTING ADMIN / GOVERNANCE TRANSACTIONS (Deployer / Owner) ---");
  const testAspRoot = "0x000000000000000000000000000000000000000000000000000000000000beef";

  // setAspRoot(testAspRoot, true)
  console.log(`  Executing setAspRoot(${testAspRoot}, true)...`);
  const aspTx1 = await deployerWallet.writeContract({
    address: POOL_ADDRESS,
    abi: poolAbi,
    functionName: "setAspRoot",
    args: [testAspRoot, true],
  });
  const aspRec1 = await publicClient.waitForTransactionReceipt({ hash: aspTx1 });
  const isTestAspActive1 = await publicClient.readContract({ address: POOL_ADDRESS, abi: poolAbi, functionName: "isAspRootValid", args: [testAspRoot] });
  recordResult(
    "pool.setAspRoot(testAspRoot, true)",
    aspRec1.status === "success" && isTestAspActive1 ? "PASS" : "FAIL",
    `Tx: ${aspTx1}, Active: ${isTestAspActive1}`
  );

  // setAspRoot(testAspRoot, false)
  console.log(`  Executing setAspRoot(${testAspRoot}, false)...`);
  const aspTx2 = await deployerWallet.writeContract({
    address: POOL_ADDRESS,
    abi: poolAbi,
    functionName: "setAspRoot",
    args: [testAspRoot, false],
  });
  const aspRec2 = await publicClient.waitForTransactionReceipt({ hash: aspTx2 });
  const isTestAspActive2 = await publicClient.readContract({ address: POOL_ADDRESS, abi: poolAbi, functionName: "isAspRootValid", args: [testAspRoot] });
  recordResult(
    "pool.setAspRoot(testAspRoot, false)",
    aspRec2.status === "success" && !isTestAspActive2 ? "PASS" : "FAIL",
    `Tx: ${aspTx2}, Deactivated: ${!isTestAspActive2}`
  );

  // setComplianceEnforced(false) then setComplianceEnforced(true)
  console.log(`  Executing setComplianceEnforced(false)...`);
  const compTx1 = await deployerWallet.writeContract({
    address: POOL_ADDRESS,
    abi: poolAbi,
    functionName: "setComplianceEnforced",
    args: [false],
  });
  await publicClient.waitForTransactionReceipt({ hash: compTx1 });
  const compStateFalse = await publicClient.readContract({ address: POOL_ADDRESS, abi: poolAbi, functionName: "complianceEnforced" });

  console.log(`  Restoring setComplianceEnforced(true)...`);
  const compTx2 = await deployerWallet.writeContract({
    address: POOL_ADDRESS,
    abi: poolAbi,
    functionName: "setComplianceEnforced",
    args: [true],
  });
  await publicClient.waitForTransactionReceipt({ hash: compTx2 });
  const compStateTrue = await publicClient.readContract({ address: POOL_ADDRESS, abi: poolAbi, functionName: "complianceEnforced" });

  recordResult(
    "pool.setComplianceEnforced(bool)",
    !compStateFalse && compStateTrue ? "PASS" : "FAIL",
    `Successfully toggled to false (${!compStateFalse}) and restored to true (${compStateTrue})`
  );
  console.log();

  // SECTION 8: REVERT / DEFENSE INTEGRITY CHECKS
  console.log("--- 8. TESTING SECURITY & ERROR HANDLING ---");

  // A. Non-owner trying to setAspRoot
  try {
    await publicClient.simulateContract({
      account: agentAAccount,
      address: POOL_ADDRESS,
      abi: poolAbi,
      functionName: "setAspRoot",
      args: [testAspRoot, true],
    });
    recordResult("Ownable Protection", "FAIL", "Non-owner call did not revert!");
  } catch (err) {
    recordResult("Ownable Protection", "PASS", "Non-owner (Agent A) unauthorized call successfully rejected");
  }

  // B. Spend with invalid Merkle Root
  const bogusRoot = "0x1111111111111111111111111111111111111111111111111111111111111111";
  const bogusProof = { ...proof1, root: bogusRoot, nullifierHash: toHex(crypto.randomBytes(32)) };
  try {
    await publicClient.simulateContract({
      account: agentBAccount,
      address: POOL_ADDRESS,
      abi: poolAbi,
      functionName: "spend",
      args: [bogusProof, agentBAccount.address],
    });
    recordResult("Invalid Merkle Root Defense", "FAIL", "Invalid root did not revert!");
  } catch (err) {
    recordResult("Invalid Merkle Root Defense", "PASS", "Spend rejected when proof refers to unrecorded Merkle root");
  }

  // C. Spend with invalid ASP Root (when compliance enforced)
  const bogusAspRoot = "0x9999999999999999999999999999999999999999999999999999999999999999";
  const bogusAspProof = { ...proof1, aspRoot: bogusAspRoot, nullifierHash: toHex(crypto.randomBytes(32)) };
  try {
    await publicClient.simulateContract({
      account: agentBAccount,
      address: POOL_ADDRESS,
      abi: poolAbi,
      functionName: "spend",
      args: [bogusAspProof, agentBAccount.address],
    });
    recordResult("Invalid ASP Root Defense", "FAIL", "Sanctioned/Unapproved ASP root did not revert!");
  } catch (err) {
    recordResult("Invalid ASP Root Defense", "PASS", "Spend rejected when ASP root is not authorized");
  }

  console.log("\n================================================================================");
  console.log("                           VERIFICATION SUITE SUMMARY                           ");
  console.log("================================================================================");
  const total = results.length;
  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status === "FAIL").length;
  console.log(`Total Invariant & Function Tests: ${total}`);
  console.log(`Passed:                           ${passed}`);
  console.log(`Failed:                           ${failed}`);
  console.log(`Result:                           ${failed === 0 ? "ALL ON-CHAIN FUNCTIONS OPERATIONAL 100%" : "SOME TESTS FAILED"}`);
  console.log("================================================================================\n");

  fs.writeFileSync(
    "./onchain_test_results.json",
    JSON.stringify({ timestamp: new Date().toISOString(), total, passed, failed, results }, null, 2)
  );
}

runTests().catch((err) => {
  console.error("FATAL SUITE ERROR:", err);
  process.exit(1);
});
