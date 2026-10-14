import { AssetClass, FilterKey, MarketplaceNode } from "./types";

export const DEFAULT_ARCNANO_POOL = "0x8D49FE6B8EfA2C10486374CaE243243e18D1b5Dd";

export const ASSET_CLASSES: AssetClass[] = [
  {
    id: "mcp",
    filterKey: "MCP",
    title: "MCP Servers",
    subtext: "Standard API",
    count: 1,
    icon: "layers",
    isDark: false,
  },
  {
    id: "subagents",
    filterKey: "Sub-Agents",
    title: "Sub-Agents",
    subtext: "Workforce",
    count: 1,
    icon: "bot",
    isDark: false,
  },
  {
    id: "compute",
    filterKey: "Compute",
    title: "Compute & Quotas",
    subtext: "Hardware",
    count: 1,
    icon: "cpu",
    isDark: false,
  },
  {
    id: "feeds",
    filterKey: "Feeds",
    title: "Real-Time Feeds",
    subtext: "Streaming",
    count: 1,
    icon: "database",
    isDark: false,
  },
  {
    id: "trust",
    filterKey: "Security",
    title: "Trust & Governance",
    subtext: "Verification",
    count: 1,
    icon: "shield",
    isDark: true,
  },
];

export const FILTER_CHIPS: { label: string; key: FilterKey }[] = [
  { label: "All", key: "All" },
  { label: "MCP", key: "MCP" },
  { label: "Sub-Agents", key: "Sub-Agents" },
  { label: "Compute", key: "Compute" },
  { label: "Feeds", key: "Feeds" },
  { label: "Security", key: "Security" },
];

export const DEFAULT_MARKETPLACE_NODES: MarketplaceNode[] = [
  {
    id: "agent-deepseek-r1",
    name: "DeepSeek-R1 CoT Inference",
    category: "Sub-Agents & Autonomous Workers",
    categoryShort: "Sub-Agents",
    filterKey: "Sub-Agents",
    categoryBadge: "REASONING API",
    endpoint: "POST https://marketplace.arcnano.xyz/api/v1/x402/deepseek-r1",
    latency: "18ms",
    latencyNumeric: 18,
    description: "Chain-of-thought streaming reasoning engine for complex math, code synthesis, and logical proofs with zero identity tracking.",
    tags: ["DEEPSEEK-R1", "COT", "ARC-L1", "REASONING"],
    specs: [
      { label: "Arcnano Pool", value: "Verified (Mainnet)" },
      { label: "Privacy Scheme", value: "Groth16 BN254" },
      { label: "Denomination", value: "0.01 USDC" }
    ],
    price: "$0.01000",
    priceUnit: "/ query",
    actionText: "Query Model",
    costNumeric: 0.01,
    curlSnippet: `curl -i -X POST https://marketplace.arcnano.xyz/api/v1/x402/deepseek-r1 \\
  -H "Content-Type: application/json" \\
  -H "Authorization: X402 <GROTH16_PROOF_JSON>" \\
  -d '{"prompt": "Solve 24 game with (4, 4, 4, 4)"}'`,
    ownerArcId: "deepseek.arc",
    isUserRegistered: true,
    arcnanoVerification: {
      poolAddress: DEFAULT_ARCNANO_POOL,
      zkScheme: "Groth16 BN254",
      aspCompliant: true,
      nullifierCache: true,
      settlementLatency: "18ms",
      recipientShieldedId: "0x0e3616146024A81aA6C31FdA02458a01Bc903315"
    }
  },
  {
    id: "agent-web-scraper",
    name: "Stealth Web Search & Extractor",
    category: "MCP Servers & Connectors",
    categoryShort: "MCP Servers",
    filterKey: "MCP",
    categoryBadge: "SEARCH & SCRAPE",
    endpoint: "POST https://marketplace.arcnano.xyz/api/v1/x402/web-scraper",
    latency: "22ms",
    latencyNumeric: 22,
    description: "Anti-bot bypassing headless browser scraper extracting clean structured markdown and citation links from protected domains.",
    tags: ["MCP", "SCRAPER", "HEADLESS", "ARC-L1"],
    specs: [
      { label: "Arcnano Pool", value: "Verified (Mainnet)" },
      { label: "Privacy Scheme", value: "Groth16 BN254" },
      { label: "Bypass Guard", value: "Cloudflare/Datadome" }
    ],
    price: "$0.01000",
    priceUnit: "/ page",
    actionText: "Extract Page",
    costNumeric: 0.01,
    curlSnippet: `curl -i -X POST https://marketplace.arcnano.xyz/api/v1/x402/web-scraper \\
  -H "Content-Type: application/json" \\
  -H "Authorization: X402 <GROTH16_PROOF_JSON>" \\
  -d '{"url": "https://arc.network"}'`,
    ownerArcId: "scraper-bot.arc",
    isUserRegistered: true,
    arcnanoVerification: {
      poolAddress: DEFAULT_ARCNANO_POOL,
      zkScheme: "Groth16 BN254",
      aspCompliant: true,
      nullifierCache: true,
      settlementLatency: "22ms",
      recipientShieldedId: "0x0e3616146024A81aA6C31FdA02458a01Bc903315"
    }
  },
  {
    id: "agent-contract-audit",
    name: "Solidity ZK Vulnerability Auditor",
    category: "Security & Guardrails",
    categoryShort: "Security",
    filterKey: "Security",
    categoryBadge: "SECURITY SCAN",
    endpoint: "POST https://marketplace.arcnano.xyz/api/v1/x402/contract-audit",
    latency: "14ms",
    latencyNumeric: 14,
    description: "Static analysis and formal invariant verification engine scanning Solidity smart contracts for reentrancy, integer overflows, and pairing leaks.",
    tags: ["SECURITY", "AUDIT", "FORMAL-VERIFICATION", "SOLIDITY"],
    specs: [
      { label: "Arcnano Pool", value: "Verified (Mainnet)" },
      { label: "Solvency Invariant", value: "128k State Runs" },
      { label: "Precompiles", value: "alt_bn128" }
    ],
    price: "$0.01000",
    priceUnit: "/ scan",
    actionText: "Audit Contract",
    costNumeric: 0.01,
    curlSnippet: `curl -i -X POST https://marketplace.arcnano.xyz/api/v1/x402/contract-audit \\
  -H "Content-Type: application/json" \\
  -H "Authorization: X402 <GROTH16_PROOF_JSON>" \\
  -d '{"contract_address": "0x8D49FE6B8EfA2C10486374CaE243243e18D1b5Dd"}'`,
    ownerArcId: "sentinel-zk.arc",
    isUserRegistered: true,
    arcnanoVerification: {
      poolAddress: DEFAULT_ARCNANO_POOL,
      zkScheme: "Groth16 BN254",
      aspCompliant: true,
      nullifierCache: true,
      settlementLatency: "14ms",
      recipientShieldedId: "0x0e3616146024A81aA6C31FdA02458a01Bc903315"
    }
  },
  {
    id: "agent-crypto-sentiment",
    name: "Real-Time Crypto Alpha Sentiment",
    category: "Real-Time Feeds",
    categoryShort: "Feeds",
    filterKey: "Feeds",
    categoryBadge: "ALPHA STREAM",
    endpoint: "GET https://marketplace.arcnano.xyz/api/v1/x402/crypto-sentiment",
    latency: "9ms",
    latencyNumeric: 9,
    description: "Sub-second streaming market sentiment analysis indexing institutional order book depth, whale wallet delta, and mempool conditions.",
    tags: ["FEEDS", "SENTIMENT", "WHALE-FLOW", "ALPHA"],
    specs: [
      { label: "Arcnano Pool", value: "Verified (Mainnet)" },
      { label: "Streaming Rate", value: "100 updates/sec" },
      { label: "Pairs Indexed", value: "50+ Pairs" }
    ],
    price: "$0.01000",
    priceUnit: "/ pulse",
    actionText: "Stream Sentiment",
    costNumeric: 0.01,
    curlSnippet: `curl -i https://marketplace.arcnano.xyz/api/v1/x402/crypto-sentiment?pair=USDC/ETH \\
  -H "Authorization: X402 <GROTH16_PROOF_JSON>"`,
    ownerArcId: "alpha-pulse.arc",
    isUserRegistered: true,
    arcnanoVerification: {
      poolAddress: DEFAULT_ARCNANO_POOL,
      zkScheme: "Groth16 BN254",
      aspCompliant: true,
      nullifierCache: true,
      settlementLatency: "9ms",
      recipientShieldedId: "0x0e3616146024A81aA6C31FdA02458a01Bc903315"
    }
  },
  {
    id: "agent-code-sandbox",
    name: "Ephemeral WASM Code Sandbox",
    category: "Compute & Quotas",
    categoryShort: "Compute",
    filterKey: "Compute",
    categoryBadge: "WASM RUNTIME",
    endpoint: "POST https://marketplace.arcnano.xyz/api/v1/x402/code-sandbox",
    latency: "11ms",
    latencyNumeric: 11,
    description: "Isolated, zero-trust WASM runtime allowing autonomous agents to execute dynamic Python and JavaScript snippets securely.",
    tags: ["COMPUTE", "WASM", "SANDBOX", "PYTHON"],
    specs: [
      { label: "Arcnano Pool", value: "Verified (Mainnet)" },
      { label: "Isolation", value: "MicroVM / WASM" },
      { label: "Execution Cap", value: "30s / 128MB" }
    ],
    price: "$0.01000",
    priceUnit: "/ execution",
    actionText: "Run Script",
    costNumeric: 0.01,
    curlSnippet: `curl -i -X POST https://marketplace.arcnano.xyz/api/v1/x402/code-sandbox \\
  -H "Content-Type: application/json" \\
  -H "Authorization: X402 <GROTH16_PROOF_JSON>" \\
  -d '{"language": "python3", "code": "print(2 + 2)"}'`,
    ownerArcId: "wasm-runtime.arc",
    isUserRegistered: true,
    arcnanoVerification: {
      poolAddress: DEFAULT_ARCNANO_POOL,
      zkScheme: "Groth16 BN254",
      aspCompliant: true,
      nullifierCache: true,
      settlementLatency: "11ms",
      recipientShieldedId: "0x0e3616146024A81aA6C31FdA02458a01Bc903315"
    }
  }
];
