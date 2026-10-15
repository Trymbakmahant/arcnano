import { NextRequest, NextResponse } from "next/server";
import { getRelayerEngine } from "@/lib/relayerBackend";

export async function GET(req: NextRequest) {
  try {
    const engine = getRelayerEngine();
    const recipient = req.nextUrl.searchParams.get("recipient") || undefined;
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50", 10);
    const offset = parseInt(req.nextUrl.searchParams.get("offset") || "0", 10);

    const result = engine.listBatches({ recipient, limit, offset });
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to list batches" },
      { status: 500 }
    );
  }
}
