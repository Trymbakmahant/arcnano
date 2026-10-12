import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { MarketplaceNode, FilterKey } from "@/components/types";
import { MARKETPLACE_ITEMS, DEFAULT_ARCNANO_POOL } from "@/components/data";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

let clientInstance: SupabaseClient | null = null;
let serverInstance: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
    supabaseUrl.startsWith("http") &&
    (supabaseAnonKey || supabaseServiceKey)
  );
}

// Client-side or default Supabase client
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!clientInstance) {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey || supabaseServiceKey);
  }
  return clientInstance;
}

// Server-side privileged client (if service role key provided)
export function getSupabaseServer(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!serverInstance) {
    const key = supabaseServiceKey || supabaseAnonKey;
    serverInstance = createClient(supabaseUrl, key);
  }
  return serverInstance;
}

// Database row interface matching marketplace_agents table
export interface MarketplaceAgentRow {
  id: string;
  name: string;
  category: string;
  category_short: string;
  filter_key: string;
  category_badge: string;
  endpoint: string;
  latency: string;
  latency_numeric: number;
  description: string;
  tags: string[];
  specs: { label: string; value: string }[];
  price: string;
  price_unit: string;
  action_text: string;
  cost_numeric: number;
  curl_snippet: string;
  owner_arc_id: string;
  pool_address: string;
  is_user_registered: boolean;
  arcnano_verification: {
    poolAddress: string;
    zkScheme: string;
    aspCompliant: boolean;
    nullifierCache: boolean;
    settlementLatency: string;
    recipientShieldedId?: string;
  };
  created_at?: string;
  updated_at?: string;
}

// Map Database Row -> Frontend TypeScript Model
export function mapRowToNode(row: MarketplaceAgentRow): MarketplaceNode {
  return {
    id: row.id,
    category: row.category,
    categoryShort: row.category_short,
    filterKey: row.filter_key as FilterKey,
    categoryBadge: row.category_badge,
    endpoint: row.endpoint,
    latency: row.latency,
    name: row.name,
    description: row.description,
    tags: Array.isArray(row.tags) ? row.tags : [],
    specs: Array.isArray(row.specs) ? row.specs : [],
    price: row.price,
    priceUnit: row.price_unit,
    actionText: row.action_text,
    costNumeric: Number(row.cost_numeric),
    latencyNumeric: Number(row.latency_numeric),
    curlSnippet: row.curl_snippet,
    ownerArcId: row.owner_arc_id,
    isUserRegistered: row.is_user_registered,
    arcnanoVerification: row.arcnano_verification
      ? {
          poolAddress: row.arcnano_verification.poolAddress || DEFAULT_ARCNANO_POOL,
          zkScheme: row.arcnano_verification.zkScheme || "Groth16 BN254",
          aspCompliant: row.arcnano_verification.aspCompliant ?? true,
          nullifierCache: row.arcnano_verification.nullifierCache ?? true,
          settlementLatency: row.arcnano_verification.settlementLatency || "<8ms",
          recipientShieldedId: row.arcnano_verification.recipientShieldedId || row.owner_arc_id,
        }
      : undefined,
  };
}

// Map Frontend TypeScript Model -> Database Row
export function mapNodeToRow(node: MarketplaceNode): MarketplaceAgentRow {
  return {
    id: node.id,
    name: node.name,
    category: node.category,
    category_short: node.categoryShort,
    filter_key: node.filterKey,
    category_badge: node.categoryBadge,
    endpoint: node.endpoint,
    latency: node.latency,
    latency_numeric: node.latencyNumeric,
    description: node.description,
    tags: node.tags,
    specs: node.specs,
    price: node.price,
    price_unit: node.priceUnit,
    action_text: node.actionText,
    cost_numeric: node.costNumeric,
    curl_snippet: node.curlSnippet,
    owner_arc_id: node.ownerArcId || "agent.arc",
    pool_address: node.arcnanoVerification?.poolAddress || DEFAULT_ARCNANO_POOL,
    is_user_registered: node.isUserRegistered ?? false,
    arcnano_verification: {
      poolAddress: node.arcnanoVerification?.poolAddress || DEFAULT_ARCNANO_POOL,
      zkScheme: node.arcnanoVerification?.zkScheme || "Groth16 BN254",
      aspCompliant: node.arcnanoVerification?.aspCompliant ?? true,
      nullifierCache: node.arcnanoVerification?.nullifierCache ?? true,
      settlementLatency: node.arcnanoVerification?.settlementLatency || "<8ms",
      recipientShieldedId: node.arcnanoVerification?.recipientShieldedId || node.ownerArcId,
    },
  };
}

// In-memory fallback cache when Supabase is not configured yet
let inMemoryAgents: MarketplaceNode[] = [...MARKETPLACE_ITEMS];

/**
 * Fetch marketplace agents with optional category filtering
 */
export async function getMarketplaceAgents(options?: {
  category?: string;
  query?: string;
}): Promise<{ nodes: MarketplaceNode[]; source: "supabase" | "fallback" }> {
  const supabase = getSupabaseServer() || getSupabase();

  if (supabase) {
    try {
      let query = supabase
        .from("marketplace_agents")
        .select("*")
        .order("created_at", { ascending: false });

      if (options?.category && options.category !== "All") {
        query = query.or(
          `filter_key.eq.${options.category},category_short.ilike.%${options.category}%,category.ilike.%${options.category}%`
        );
      }

      if (options?.query && options.query.trim()) {
        const q = options.query.trim();
        query = query.or(
          `name.ilike.%${q}%,description.ilike.%${q}%,endpoint.ilike.%${q}%,owner_arc_id.ilike.%${q}%`
        );
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        return {
          nodes: (data as MarketplaceAgentRow[]).map(mapRowToNode),
          source: "supabase",
        };
      }

      if (error) {
        console.warn("[Supabase] Query returned error, falling back to in-memory:", error.message);
      }
    } catch (err) {
      console.warn("[Supabase] Connection error, falling back to in-memory:", err);
    }
  }

  // In-memory fallback
  let results = [...inMemoryAgents];

  if (options?.category && options.category !== "All") {
    results = results.filter(
      (item) =>
        item.category.toLowerCase().includes(options.category!.toLowerCase()) ||
        item.categoryShort.toLowerCase() === options.category!.toLowerCase() ||
        item.filterKey.toLowerCase() === options.category!.toLowerCase()
    );
  }

  if (options?.query && options.query.trim()) {
    const q = options.query.toLowerCase().trim();
    results = results.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.endpoint.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  return { nodes: results, source: "fallback" };
}

/**
 * Register a new agent into Supabase (or in-memory cache)
 */
export async function insertMarketplaceAgent(
  node: MarketplaceNode
): Promise<{ success: boolean; data: MarketplaceNode; source: "supabase" | "fallback"; error?: string }> {
  // Always update in-memory as optimistic copy
  inMemoryAgents.unshift(node);

  const supabase = getSupabaseServer() || getSupabase();

  if (supabase) {
    try {
      const row = mapNodeToRow(node);
      const { data, error } = await supabase
        .from("marketplace_agents")
        .upsert(row, { onConflict: "id" })
        .select()
        .single();

      if (!error && data) {
        return {
          success: true,
          data: mapRowToNode(data as MarketplaceAgentRow),
          source: "supabase",
        };
      }

      if (error) {
        console.warn("[Supabase] Failed to insert agent, saved in-memory:", error.message);
        return {
          success: true,
          data: node,
          source: "fallback",
          error: error.message,
        };
      }
    } catch (err) {
      console.warn("[Supabase] Exception inserting agent:", err);
    }
  }

  return {
    success: true,
    data: node,
    source: "fallback",
  };
}
