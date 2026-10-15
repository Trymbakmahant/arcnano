import { NextRequest, NextResponse } from "next/server";
import { getRelayerEngine } from "@/lib/relayerBackend";

export async function GET(req: NextRequest) {
  try {
    const engine = getRelayerEngine();
    const queuesMap = engine.getPendingQueues();
    const recipientFilter = req.nextUrl.searchParams.get("recipient")?.toLowerCase();

    let queues = Array.from(queuesMap.values());
    if (recipientFilter) {
      queues = queues.filter((q) => q.recipient.toLowerCase() === recipientFilter);
    }

    const totalPendingNotes = queues.reduce((sum, q) => sum + q.count, 0);

    return NextResponse.json({
      success: true,
      totalQueues: queues.length,
      totalPendingNotes,
      queues,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to inspect relayer queue" },
      { status: 500 }
    );
  }
}
