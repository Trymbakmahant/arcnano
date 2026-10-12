import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_ARCNANO_POOL } from "@/components/data";
import { MarketplaceNode } from "@/components/types";
import {
  getMarketplaceAgents,
  insertMarketplaceAgent,
} from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const query = searchParams.get("query") || undefined;

    const { nodes } = await getMarketplaceAgents({ category, query });

    return NextResponse.json({
      total: nodes.length,
      agents: nodes,
    });
  } catch (error) {
    console.error("[GET /api/v1/agents] Error fetching agents:", error);
    return NextResponse.json(
      { error: "Internal server error fetching agents" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name || !body.endpoint || !body.ownerArcId) {
      return NextResponse.json(
        { error: "Missing required fields: name, endpoint, ownerArcId" },
        { status: 400 }
      );
    }

    const priceNumeric = parseFloat(body.priceUsdc) || 0.0002;
    const latencyRandom = Math.floor(Math.random() * 8) + 6;
    const cleanEndpoint = body.endpoint.replace(/^(GET|POST|RPC|WSS)\s+/, "").trim();
    if (!cleanEndpoint.startsWith("https://")) {
      return NextResponse.json(
        { error: "Agent endpoint must be a valid secure HTTPS URL starting with https://" },
        { status: 400 }
      );
    }
    const method = body.endpoint.startsWith("GET") ? "GET" : "POST";

    const newNode: MarketplaceNode = {
      id: body.id || `agent-${Date.now().toString(36)}`,
      category: body.category || "MCP Servers & Connectors",
      categoryShort: body.categoryShort || "MCP Servers",
      filterKey: body.filterKey || "MCP",
      categoryBadge: body.categoryBadge || "AGENT API",
      endpoint: body.endpoint,
      latency: `${latencyRandom}ms`,
      latencyNumeric: latencyRandom,
      name: body.name,
      description:
        body.description?.trim() ||
        "Arcnano verified autonomous capability registered on Arc L1.",
      tags: Array.isArray(body.tags)
        ? body.tags
        : typeof body.tags === "string"
        ? body.tags.split(",").map((t: string) => t.trim().toUpperCase()).filter(Boolean)
        : ["ARC-L1", "AGENT"],
      specs: Array.isArray(body.specs)
        ? body.specs
        : [
            { label: "Arcnano Pool", value: "Verified (Testnet)" },
            { label: "Privacy Scheme", value: "Groth16 BN254" },
          ],
      price: `$${priceNumeric.toFixed(5)}`,
      priceUnit: body.priceUnit || "/ execution",
      actionText: body.actionText || "Connect Agent",
      costNumeric: priceNumeric,
      curlSnippet: `curl -i -X ${method} https://api.arcnano.xyz${cleanEndpoint} \\
  -H "Authorization: X402 proof=0x89ab... nullifier=0x42f7..." \\
  -H "X-Arcnano-Recipient: ${body.ownerArcId}"`,
      ownerArcId: body.ownerArcId,
      isUserRegistered: true,
      arcnanoVerification: {
        poolAddress: body.poolAddress || DEFAULT_ARCNANO_POOL,
        zkScheme: "Groth16 BN254",
        aspCompliant: body.enableAspCompliance ?? true,
        nullifierCache: true,
        settlementLatency: `${latencyRandom}ms`,
        recipientShieldedId: body.ownerArcId,
      },
    };

    const result = await insertMarketplaceAgent(newNode);

    return NextResponse.json(
      {
        status: "registered",
        message: "Agent successfully registered.",
        agent: result.data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/v1/agents] Error registering agent:", error);
    return NextResponse.json(
      { error: "Invalid JSON or server error processing registration" },
      { status: 400 }
    );
  }
}
