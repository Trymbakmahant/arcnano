import { NextRequest, NextResponse } from "next/server";
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
import { recordLiveTransactions } from "@/lib/demo-state";

const ARC_RPC_URL = process.env.ARC_RPC_URL || "https://rpc.testnet.arc.network";
const POOL_ADDRESS = (process.env.POOL_ADDRESS || "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca") as `0x${string}`;
const USDC_ADDRESS = (process.env.USDC_ADDRESS || "0x3600000000000000000000000000000000000000") as `0x${string}`;
const ASP_ROOT = (process.env.ASP_ROOT || "0x0000000000000000000000000000000000000000000000000000000000001337") as `0x${string}`;

const arcChain = {
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: {
    default: { http: [ARC_RPC_URL] },
  },
  blockExplorers: {
    default: { name: "Arcscan", url: "https://testnet.arcscan.app" },
  },
} as const;

const publicClient = createPublicClient({
  chain: arcChain,
  transport: http(ARC_RPC_URL),
});

function getAgentClients() {
  const pkA = process.env.AGENT_A_PRIVATE_KEY as `0x${string}` | undefined;
  const pkB = process.env.AGENT_B_PRIVATE_KEY as `0x${string}` | undefined;

  if (!pkA || !pkB) {
    throw new Error("Missing AGENT_A_PRIVATE_KEY or AGENT_B_PRIVATE_KEY in environment variables.");
  }

  const accountA = privateKeyToAccount(pkA);
  const accountB = privateKeyToAccount(pkB);

  const walletClientA = createWalletClient({
    account: accountA,
    chain: arcChain,
    transport: http(ARC_RPC_URL),
  });

  const walletClientB = createWalletClient({
    account: accountB,
    chain: arcChain,
    transport: http(ARC_RPC_URL),
  });

  return { accountA, accountB, walletClientA, walletClientB };
}

const poolAbi = parseAbi([
  "function deposit(bytes32 commitment) external",
  "function spend((uint256[2] a, uint256[2][2] b, uint256[2] c, bytes32 root, bytes32 nullifierHash, bytes32 aspRoot) proof, address recipient) external",
  "function getLastRoot() external view returns (bytes32)",
  "function isSpent(bytes32 nullifier) external view returns (bool)",
  "function denomination() external view returns (uint256)",
]);

const erc20Abi = parseAbi([
  "function balanceOf(address owner) external view returns (uint256)",
]);

// Anti-Spam & Concurrency State
let isBusy = false;
let lastExecutionTime = 0;
const ipExecutionHistory = new Map<string, number>();

export async function POST(req: NextRequest) {
  // 1. IP & Rate Limiting Spam Check
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
  const now = Date.now();

  const lastIpTime = ipExecutionHistory.get(ip) || 0;
  if (now - lastIpTime < 20000) {
    const waitSec = Math.ceil((20000 - (now - lastIpTime)) / 1000);
    return NextResponse.json(
      {
        error: `Anti-spam cooldown active. Please wait ${waitSec}s before running another transaction.`,
        retryAfter: waitSec,
      },
      { status: 429 }
    );
  }

  // 2. Global Concurrency Lock (Mutex to prevent nonce collisions)
  if (isBusy) {
    return NextResponse.json(
      { error: "Another on-chain transaction is currently confirming on Arc L1. Please retry in 5 seconds." },
      { status: 409 }
    );
  }

  if (now - lastExecutionTime < 10000) {
    return NextResponse.json(
      { error: "Global rate limit. Transactions are throttled to ensure block finality." },
      { status: 429 }
    );
  }

  isBusy = true;
  lastExecutionTime = now;
  ipExecutionHistory.set(ip, now);

  try {
    const { accountA, accountB, walletClientA, walletClientB } = getAgentClients();

    // 3. Balance Safeguard Check
    const balA = await publicClient.readContract({
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [accountA.address],
    });

    if (balA < BigInt(10000)) {
      return NextResponse.json(
        { error: "Agent A note balance is low for automatic demo deposits." },
        { status: 400 }
      );
    }

    // 4. Generate Cryptographic Note
    const secret = toHex(crypto.randomBytes(32));
    const nullifierSeed = toHex(crypto.randomBytes(32));
    const denomination = BigInt(10000); // 0.01 USDC

    const commitment = keccak256(
      encodePacked(
        ["uint256", "bytes32", "bytes32"],
        [denomination, secret as `0x${string}`, nullifierSeed as `0x${string}`]
      )
    );
    const nullifierHash = keccak256(
      encodePacked(["bytes32"], [nullifierSeed as `0x${string}`])
    );

    // 5. Broadcast Deposit Transaction from Agent A
    const depositTxHash = await walletClientA.writeContract({
      address: POOL_ADDRESS,
      abi: poolAbi,
      functionName: "deposit",
      args: [commitment],
    });

    const depositReceipt = await publicClient.waitForTransactionReceipt({
      hash: depositTxHash,
    });

    // 6. Query updated Merkle root
    const currentRoot = await publicClient.readContract({
      address: POOL_ADDRESS,
      abi: poolAbi,
      functionName: "getLastRoot",
    });

    // 7. Settle Spend Transaction from Agent B
    const spendProof = {
      a: [BigInt(1), BigInt(2)] as [bigint, bigint],
      b: [
        [BigInt(3), BigInt(4)],
        [BigInt(5), BigInt(6)],
      ] as [[bigint, bigint], [bigint, bigint]],
      c: [BigInt(7), BigInt(8)] as [bigint, bigint],
      root: currentRoot,
      nullifierHash,
      aspRoot: ASP_ROOT,
    };

    const spendTxHash = await walletClientB.writeContract({
      address: POOL_ADDRESS,
      abi: poolAbi,
      functionName: "spend",
      args: [spendProof, accountB.address],
    });

    const spendReceipt = await publicClient.waitForTransactionReceipt({
      hash: spendTxHash,
    });

    // 8. Fetch updated balances
    const newBalA = await publicClient.readContract({
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [accountA.address],
    });
    const newBalB = await publicClient.readContract({
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [accountB.address],
    });

    const depositRecord = {
      hash: depositTxHash,
      block: Number(depositReceipt.blockNumber),
      gasUsed: depositReceipt.gasUsed.toString(),
      method: "deposit(bytes32 commitment)",
      commitment,
      explorerUrl: `https://testnet.arcscan.app/tx/${depositTxHash}`,
      timestamp: Date.now(),
    };

    const spendRecord = {
      hash: spendTxHash,
      block: Number(spendReceipt.blockNumber),
      gasUsed: spendReceipt.gasUsed.toString(),
      method: "spend(SpendProof proof, address recipient)",
      nullifier: nullifierHash,
      recipient: accountB.address,
      amount: "0.01 USDC",
      explorerUrl: `https://testnet.arcscan.app/tx/${spendTxHash}`,
      timestamp: Date.now(),
    };

    recordLiveTransactions(depositRecord, spendRecord);

    return NextResponse.json({
      success: true,
      timestamp: Date.now(),
      commitment,
      nullifierHash,
      merkleRoot: currentRoot,
      depositTx: depositRecord,
      spendTx: spendRecord,
      balances: {
        agentA: (Number(newBalA) / 1e6).toFixed(4),
        agentB: (Number(newBalB) / 1e6).toFixed(4),
      },
    });
  } catch (error: unknown) {
    console.error("Live demo execution error:", error);
    const msg = error instanceof Error ? error.message : "Transaction failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  } finally {
    isBusy = false;
  }
}
