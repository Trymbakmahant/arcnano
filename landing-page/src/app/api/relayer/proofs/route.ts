import { NextRequest, NextResponse } from "next/server";
import { getRelayerEngine, ProofStatus } from "@/lib/relayerBackend";

export async function GET(req: NextRequest) {
  try {
    const engine = getRelayerEngine();
    const { searchParams } = req.nextUrl;

    const idOrNullifier = searchParams.get("id") || searchParams.get("nullifier");
    if (idOrNullifier) {
      const proof = engine.getProof(idOrNullifier);
      if (!proof) {
        return NextResponse.json({ error: "Proof not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, proof });
    }

    const recipient = searchParams.get("recipient") || undefined;
    const status = (searchParams.get("status") as ProofStatus) || undefined;
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const result = engine.listProofs({ recipient, status, limit, offset });
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to list proofs" },
      { status: 500 }
    );
  }
}
