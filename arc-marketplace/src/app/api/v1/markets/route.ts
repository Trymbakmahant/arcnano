import { NextRequest, NextResponse } from "next/server";
import { PREDICTION_MARKETS } from "@/lib/markets";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const query = searchParams.get("q")?.toLowerCase();

  let filtered = [...PREDICTION_MARKETS];

  if (category && category !== "ALL") {
    filtered = filtered.filter((m) => m.category === category);
  }

  if (query) {
    filtered = filtered.filter(
      (m) =>
        m.title.toLowerCase().includes(query) ||
        m.summary.toLowerCase().includes(query) ||
        m.oracleSource.toLowerCase().includes(query)
    );
  }

  return NextResponse.json({
    total: filtered.length,
    markets: filtered,
  });
}
