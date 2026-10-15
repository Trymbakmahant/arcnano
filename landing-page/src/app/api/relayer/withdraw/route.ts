import { NextRequest, NextResponse } from "next/server";
import { getRelayerEngine } from "@/lib/relayerBackend";

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // empty body allowed
    }

    const engine = getRelayerEngine();
    const batch = await engine.executeBatchWithdrawal({
      queueKey: body.queueKey,
      recipient: body.recipient,
      poolAddress: body.poolAddress,
      chainId: body.chainId ? Number(body.chainId) : undefined,
    });

    if (!batch) {
      return NextResponse.json(
        {
          success: false,
          message: "No pending proofs found in queue matching the requested criteria.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully executed batch withdrawal for ${batch.proofCount} notes (${batch.totalAmountFormatted}) to ${batch.recipient}!`,
      batch,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to execute batch withdrawal" },
      { status: 500 }
    );
  }
}
