export type FilterKey = "All" | "MCP" | "Sub-Agents" | "Compute" | "Feeds" | "Security";

export interface ArcnanoVerificationDetails {
  poolAddress: string;
  zkScheme: string; // e.g., "Groth16 BN254"
  aspCompliant: boolean; // Privacy Pools Association Set Provider
  nullifierCache: boolean;
  settlementLatency: string;
  recipientShieldedId: string;
}

export interface MarketplaceNode {
  id: string;
  category: string;
  categoryShort: string;
  filterKey: FilterKey;
  categoryBadge: string;
  endpoint: string;
  latency: string;
  name: string;
  description: string;
  tags: string[];
  specs: { label: string; value: string }[];
  price: string;
  priceUnit: string;
  actionText: string;
  costNumeric: number;
  latencyNumeric: number;
  curlSnippet: string;
  ownerArcId?: string;
  isUserRegistered?: boolean;
  arcnanoVerification?: ArcnanoVerificationDetails;
}

export interface AssetClass {
  id: string;
  filterKey: FilterKey;
  title: string;
  subtext: string;
  count: number;
  icon: string;
  isDark: boolean;
}

export interface ArcUser {
  arcId: string;
  shieldedAddress: string;
  balanceUsdc: number;
  vaultNotesCount: number;
  network: string;
}

export interface RegisterAgentFormData {
  name: string;
  category: string;
  endpoint: string;
  priceUsdc: string;
  priceUnit: string;
  description: string;
  tags: string;
  recipientArcId: string;
  poolAddress: string;
  enableZkGroth16: boolean;
  enableAspCompliance: boolean;
}
