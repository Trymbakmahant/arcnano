import { NextRequest, NextResponse } from "next/server";
import { MARKETPLACE_ITEMS, DEFAULT_ARCNANO_POOL } from "@/components/data";
import { MarketplaceNode } from "@/components/types";

// In-memory registry storage for registered agents during runtime
let registeredAgents: MarketplaceNode[] = [...MARKETPLACE_ITEMS];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const query = searchParams.get("query")?.toLowerCase();

  let results = [...registeredAgents];

  if (category && category !== "All") {
    results = results.filter(
      (item) =>
        item.category.toLowerCase().includes(category.toLowerCase()) ||
        item.categoryShort.toLowerCase() === category.toLowerCase() ||
        item.filterKey.toLowerCase() === category.toLowerCase()
    );
  }

  if (query) {
    results = results.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.endpoint.toLowerCase().includes(query) ||
        item.tags.some((t) => t.toLowerCase().includes(query))
    );
  }

  return NextResponse.json({
    status: "ok",
    registry_version: "arcnano-x402-v1.4",
    network: "Arc L1 (Chain ID: 5042002)",
    pool_contract: DEFAULT_ARCNANO_POOL,
    privacy_protocol: "Arcnano Shielded Zero-Knowledge Groth16",
    total_nodes: results.length,
    agents: results.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      endpoint: item.endpoint,
      pricing: {
        amount_usdc: item.costNumeric,
        unit: item.priceUnit,
        scheme: "X402-Shielded",
      },
      arcnano_verification: item.arcnanoVerification || {
        pool_address: DEFAULT_ARCNANO_POOL,
        zk_scheme: "Groth16 BN254",
        asp_compliance: true,
        nullifier_cache: true,
      },
      owner_arc_id: item.ownerArcId || "arcnano-core.arc",
      latency_sla: item.latency,
      tags: item.tags,
    })),
  });
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
    const newNode: MarketplaceNode = {
      id: `agent-${Date.now().toString(36)}`,
      category: body.category || "MCP Servers & Connectors",
      categoryShort: body.categoryShort || "MCP Servers",
      filterKey: body.filterKey || "MCP",
      categoryBadge: "CUSTOM AGENT",
      endpoint: body.endpoint,
      latency: "8ms",
      name: body.name,
      description: body.description || "Arcnano verified agent capability on Arc L1.",
      tags: Array.isArray(body.tags) ? body.tags : ["ARC-L1", "AGENT"],
      specs: [
        { label: "Arcnano Pool", value: "Verified (Testnet)" },
        { label: "Privacy Scheme", value: "Groth16 BN254" },
      ],
      price: `$${priceNumeric.toFixed(5)}`,
      priceUnit: body.priceUnit || "/ execution (x402)",
      actionText: "Call Agent (x402)",
      costNumeric: priceNumeric,
      latencyNumeric: 8,
      curlSnippet: `curl -i -X POST https://api.arcnano.xyz${body.endpoint.replace(
        /^(GET|POST|RPC|WSS)\s+/,
        ""
      )} -H "Authorization: X402 proof=0x... nullifier=0x..."`,
      ownerArcId: body.ownerArcId,
      isUserRegistered: true,
      arcnanoVerification: {
        poolAddress: body.poolAddress || DEFAULT_ARCNANO_POOL,
        zkScheme: "Groth16 BN254",
        aspCompliant: body.enableAspCompliance ?? true,
        nullifierCache: true,
        settlementLatency: "<8ms",
        recipientShieldedId: body.ownerArcId,
      },
    };

    registeredAgents.unshift(newNode);

    return NextResponse.json(
      {
        status: "registered",
        message: "Agent successfully registered with Arcnano shielded x402 payment verification.",
        agent: newNode,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }
}
