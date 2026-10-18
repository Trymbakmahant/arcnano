import { NextRequest, NextResponse } from "next/server";
import { getRelayerEngine } from "@/lib/relayerBackend";
import { createPublicClient, http, formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";

export async function GET(req: NextRequest) {
  try {
    const engine = getRelayerEngine();
    const stats = engine.getStats();

    const relayerKey = process.env.AGENT_B_PRIVATE_KEY || process.env.ARC_RELAYER_KEY;
    let relayerAddress: string | null = null;
    let relayerBalanceArc: string | null = null;

    if (relayerKey) {
      try {
        const account = privateKeyToAccount(relayerKey as `0x${string}`);
        relayerAddress = account.address;

        const publicClient = createPublicClient({
          transport: http(process.env.ARC_RPC_URL || "https://rpc.testnet.arc.io"),
        });
        const balance = await publicClient.getBalance({ address: account.address });
        relayerBalanceArc = `${parseFloat(formatEther(balance)).toFixed(4)} ARC`;
      } catch (balErr: any) {
        console.warn("[RelayerStatus] Balance check warning:", balErr.message);
      }
    }

    return NextResponse.json({
      status: "operational",
      role: "ArcNano Automated Batch Relayer Backend",
      supportedNetworks: [
        { name: "Arc Testnet", chainId: 5042002, rpc: "https://rpc.testnet.arc.io", explorer: "https://explorer.testnet.arc.io" },
        { name: "Arc Mainnet", chainId: 5042, rpc: "https://rpc.mainnet.arc.io", explorer: "https://explorer.arc.io" },
      ],
      relayerWallet: {
        address: relayerAddress,
        balance: relayerBalanceArc,
        configured: !!relayerKey,
      },
      stats,
      gasSponsor: "Arc Circle Gas Station Paymaster & Relayer EOA (100% Free for Agents)",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to retrieve relayer status" },
      { status: 500 }
    );
  }
}
