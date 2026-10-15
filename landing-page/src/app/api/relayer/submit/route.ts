import { NextRequest, NextResponse } from "next/server";
import { getRelayerEngine } from "@/lib/relayerBackend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const payload = body.payload || body;

    if (!payload || !payload.proof || !payload.nullifierHash) {
      return NextResponse.json(
        { error: "Missing required payload: Groth16 proof coordinates and nullifierHash are required." },
        { status: 400 }
      );
    }

    const recipient = body.recipient || payload.recipient;
    if (!recipient || !recipient.startsWith("0x") || recipient.length !== 42) {
      return NextResponse.json(
        { error: "Missing or invalid recipient address. Please provide a valid 42-character 0x Arc address." },
        { status: 400 }
      );
    }

    const engine = getRelayerEngine();
    const storedProof = engine.saveProof({
      payload,
      recipient,
      poolAddress: body.poolAddress,
      chainId: body.chainId ? Number(body.chainId) : 5042002,
      denomination: body.denomination,
      amountFormatted: body.amountFormatted,
    });

    const queues = engine.getPendingQueues();
    const queueKey = `${storedProof.chainId}:${engine.normalizeAddress(storedProof.poolAddress)}:${engine.normalizeAddress(recipient)}`;
    const currentQueue = queues.get(queueKey);
    const queuedCount = currentQueue ? currentQueue.proofs.length : 1;

    // Check if threshold reached (default 5 notes for auto-batch)
    const batchThreshold = parseInt(process.env.BATCH_THRESHOLD || "5", 10);
    let autoFlushedBatch = null;

    if (queuedCount >= batchThreshold) {
      try {
        autoFlushedBatch = await engine.executeBatchWithdrawal({ queueKey });
      } catch (flushErr: any) {
        console.warn("[RelayerSubmit] Auto-batch threshold execution warning:", flushErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: autoFlushedBatch
        ? `Batch threshold reached (${queuedCount}/${batchThreshold})! Automatically settled ${autoFlushedBatch.proofCount} notes on-chain.`
        : `Proof securely stored and queued for batch withdrawal (${queuedCount}/${batchThreshold} notes).`,
      proofId: storedProof.id,
      queuedCount,
      batchThreshold,
      autoFlushed: !!autoFlushedBatch,
      batch: autoFlushedBatch,
      proof: storedProof,
    });
  } catch (err: any) {
    const isConflict =
      err.message?.includes("Double-spend") ||
      err.message?.includes("already exists") ||
      err.message?.includes("already been submitted");

    return NextResponse.json(
      { error: err.message || "Failed to submit spend proof" },
      { status: isConflict ? 409 : 500 }
    );
  }
}
