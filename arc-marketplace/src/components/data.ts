import { MarketplaceNode, AssetClass, FilterKey } from "./types";

export const DEFAULT_ARCNANO_POOL = "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca";

export const ASSET_CLASSES: AssetClass[] = [
  {
    id: "mcp",
    filterKey: "MCP",
    title: "MCP Servers",
    subtext: "Standard API",
    count: 2,
    icon: "layers",
    isDark: false,
  },
  {
    id: "subagents",
    filterKey: "Sub-Agents",
    title: "Sub-Agents",
    subtext: "Workforce",
    count: 2,
    icon: "bot",
    isDark: false,
  },
  {
    id: "compute",
    filterKey: "Compute",
    title: "Compute & Quotas",
    subtext: "Hardware",
    count: 2,
    icon: "cpu",
    isDark: false,
  },
  {
    id: "feeds",
    filterKey: "Feeds",
    title: "Real-Time Feeds",
    subtext: "Streaming",
    count: 3,
    icon: "database",
    isDark: false,
  },
  {
    id: "trust",
    filterKey: "Security",
    title: "Trust & Governance",
    subtext: "Verification",
    count: 2,
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

export const MARKETPLACE_ITEMS: MarketplaceNode[] = [
  // 1. Model Context Protocol (MCP) Servers & Connectors
  {
    id: "mcp-compose",
    category: "MCP Servers & Connectors",
    categoryShort: "MCP Servers",
    filterKey: "MCP",
    categoryBadge: "MCP SERVER",
    endpoint: "POST /v1/mcp/compose-suite",
    latency: "8ms",
    name: "Compose.io Enterprise MCP Server",
    description:
      "Pre-built integration server letting autonomous agents securely plug into Gmail, Slack, Salesforce, Postgres, and S3 file systems with granular OAuth scoping and sub-10ms tool calling.",
    tags: ["MCP SERVER", "SLACK & GMAIL", "ENTERPRISE DB", "COMPOSE.IO"],
    specs: [
      { label: "Protocol", value: "MCP v1.2 Standard" },
      { label: "Isolation", value: "Ephemeral MicroVM" },
    ],
    price: "$0.00015",
    priceUnit: "/ tool call",
    actionText: "Connect MCP",
    costNumeric: 0.00015,
    latencyNumeric: 8,
    curlSnippet: `curl -i -X POST https://api.x402.org/v1/mcp/compose-suite \\
  -H "Authorization: X402 proof=0x89ab... nullifier=0x42f7..." \\
  -H "Content-Type: application/json" \\
  -d '{"connector": "slack-workspace", "action": "channel.broadcast", "params": {"channel": "#leads"}}'`,
    ownerArcId: "compose-enterprise.arc",
    arcnanoVerification: {
      poolAddress: DEFAULT_ARCNANO_POOL,
      zkScheme: "Groth16 BN254",
      aspCompliant: true,
      nullifierCache: true,
      settlementLatency: "4.8ms",
      recipientShieldedId: "compose-enterprise.arc",
    },
  },
  {
    id: "mcp-devops",
    category: "MCP Servers & Connectors",
    categoryShort: "MCP Servers",
    filterKey: "MCP",
    categoryBadge: "MCP CONNECTOR",
    endpoint: "POST /v1/mcp/github-linear-sync",
    latency: "12ms",
    name: "DevOps & Repo Sync MCP Connector",
    description:
      "Autonomous Model Context Protocol bridge for GitHub, GitLab, and Linear. Enables agentic pull-request creation, issue triage, and automated branch commits without sharing human credentials.",
    tags: ["MCP CONNECTOR", "GITHUB API", "LINEAR TICKETS", "DEVOPS"],
    specs: [
      { label: "Rate Limit", value: "600 req/min" },
      { label: "Auth Scope", value: "Zero-Leak Proxy" },
    ],
    price: "$0.00025",
    priceUnit: "/ sync operation",
    actionText: "Attach Connector",
    costNumeric: 0.00025,
    latencyNumeric: 12,
    curlSnippet: `curl -i -X POST https://api.x402.org/v1/mcp/github-linear-sync \\
  -H "Authorization: X402 proof=0x89ab... nullifier=0x42f7..." \\
  -H "Content-Type: application/json" \\
  -d '{"repo": "org/core", "task": "triage_pr", "pr_id": 402}'`,
    ownerArcId: "gitops-bot.arc",
    arcnanoVerification: {
      poolAddress: DEFAULT_ARCNANO_POOL,
      zkScheme: "Groth16 BN254",
      aspCompliant: true,
      nullifierCache: true,
      settlementLatency: "6.2ms",
      recipientShieldedId: "gitops-bot.arc",
    },
  },

  // 2. Specialized Sub-Agents & Micro-Workers
  {
    id: "subagent-lexguard",
    category: "Specialized Sub-Agents & Micro-Workers",
    categoryShort: "Sub-Agents",
    filterKey: "Sub-Agents",
    categoryBadge: "SUB-AGENT",
    endpoint: "RPC /subagent/lexguard-audit",
    latency: "92ms",
    name: "LexGuard Legal & Compliance Sub-Agent",
    description:
      "Autonomous functional legal worker that primary AI agents hire or chain to audit counterparty contracts, cross-border SLA liabilities, GDPR mandates, and NDA disclosures before signing transactions.",
    tags: ["SUB-AGENT", "LEGAL AUDIT", "COMPLIANCE CHECK", "CHAIN-OF-THOUGHT"],
    specs: [
      { label: "Context Window", value: "128k CoT Verification" },
      { label: "Worker Model", value: "ClauseCheck-V3" },
    ],
    price: "$0.0080",
    priceUnit: "/ delegated audit",
    actionText: "Hire Sub-Agent",
    costNumeric: 0.008,
    latencyNumeric: 92,
    curlSnippet: `curl -i -X POST https://api.x402.org/subagent/lexguard-audit \\
  -H "Authorization: X402 proof=0x89ab... nullifier=0x42f7..." \\
  -H "Content-Type: application/json" \\
  -d '{"contract_hash": "0x89fe2...", "checklist": ["GDPR_Art28", "IndemnityCap"]}'`,
    ownerArcId: "lexguard-labs.arc",
    arcnanoVerification: {
      poolAddress: DEFAULT_ARCNANO_POOL,
      zkScheme: "Groth16 BN254",
      aspCompliant: true,
      nullifierCache: true,
      settlementLatency: "5.1ms",
      recipientShieldedId: "lexguard-labs.arc",
    },
  },
  {
    id: "subagent-swarmparse",
    category: "Specialized Sub-Agents & Micro-Workers",
    categoryShort: "Sub-Agents",
    filterKey: "Sub-Agents",
    categoryBadge: "MICRO-WORKER",
    endpoint: "RPC /subagent/doc-triage",
    latency: "64ms",
    name: "SwarmParse Multi-Document Triage Worker",
    description:
      "Specialized parsing worker agent that parallel-unpacks nested PDF contracts, multi-column financial statements, and scanned invoices into machine-actionable, validated Pydantic JSON schemas.",
    tags: ["MICRO-WORKER", "MULTI-AGENT SWARM", "OCR RESOLVER", "STRUCTURED JSON"],
    specs: [
      { label: "Throughput", value: "85 pages / sec" },
      { label: "Target Schema", value: "Pydantic Strict V2" },
    ],
    price: "$0.0035",
    priceUnit: "/ parsed document",
    actionText: "Lease Worker",
    costNumeric: 0.0035,
    latencyNumeric: 64,
    curlSnippet: `curl -i -X POST https://api.x402.org/subagent/doc-triage \\
  -H "Authorization: X402 proof=0x89ab... nullifier=0x42f7..." \\
  -H "Content-Type: application/json" \\
  -d '{"doc_uri": "s3://contracts/v4-enterprise.pdf", "output_format": "json_schema"}'`,
    ownerArcId: "swarmparse-ai.arc",
    arcnanoVerification: {
      poolAddress: DEFAULT_ARCNANO_POOL,
      zkScheme: "Groth16 BN254",
      aspCompliant: true,
      nullifierCache: true,
      settlementLatency: "4.4ms",
      recipientShieldedId: "swarmparse-ai.arc",
    },
  },

  // 3. Compute, Token Quotas, & API Credits
  {
    id: "compute-h100",
    category: "Compute, Token Quotas, & API Credits",
    categoryShort: "Compute",
    filterKey: "Compute",
    categoryBadge: "COMPUTE QUOTA",
    endpoint: "POST /compute/h100-tensor-burst",
    latency: "14ms",
    name: "H100 GPU Burst & Reasoning Token Quota",
    description:
      "Scalable processing power and Nvidia H100 SXM5 compute slices. Lets primary agents offload heavy multi-modal reasoning and large code synthesis without long-term cloud contracts.",
    tags: ["GPU COMPUTE", "H100 SXM5", "REASONING QUOTA", "TENSOR PARALLEL"],
    specs: [
      { label: "Memory Bandwidth", value: "3.35 TB/s HBM3" },
      { label: "Settlement Unit", value: "Per 10k Reasoning Tokens" },
    ],
    price: "$0.00008",
    priceUnit: "/ reasoning k-token",
    actionText: "Acquire Quota",
    costNumeric: 0.00008,
    latencyNumeric: 14,
    curlSnippet: `curl -i -X POST https://api.x402.org/compute/h100-tensor-burst \\
  -H "Authorization: X402 proof=0x89ab... nullifier=0x42f7..." \\
  -H "Content-Type: application/json" \\
  -d '{"compute_tier": "h100-sxm5-80gb", "max_tokens": 50000, "temperature": 0.2}'`,
    ownerArcId: "compute-node-01.arc",
    arcnanoVerification: {
      poolAddress: DEFAULT_ARCNANO_POOL,
      zkScheme: "Groth16 BN254",
      aspCompliant: true,
      nullifierCache: true,
      settlementLatency: "3.9ms",
      recipientShieldedId: "compute-node-01.arc",
    },
  },
  {
    id: "compute-wasm",
    category: "Compute, Token Quotas, & API Credits",
    categoryShort: "Compute",
    filterKey: "Compute",
    categoryBadge: "WASM RUNTIME",
    endpoint: "POST /v1/wasm/execute",
    latency: "18ms",
    name: "AlphaCode Sandbox WASM Isolation API",
    description:
      "Execute untrusted synthetic agent code in secure WASM multi-tenant containers with micro-gas settlement, strict memory boundaries, and sub-millisecond cold starts.",
    tags: ["TOOL API", "WASM CONTAINER", "99.98% SUCCESS", "ZERO ESCAPE"],
    specs: [
      { label: "SLA Success", value: "99.98%" },
      { label: "Memory Limit", value: "64MB Isolated Heap" },
    ],
    price: "$0.00012",
    priceUnit: "/ execution",
    actionText: "Execute WASM",
    costNumeric: 0.00012,
    latencyNumeric: 18,
    curlSnippet: `curl -i -X POST https://api.x402.org/v1/wasm/execute \\
  -H "Authorization: X402 proof=0x89ab... nullifier=0x42f7..." \\
  -H "Content-Type: application/json" \\
  -d '{"bytecode": "AGFzbQEAAA...", "fuel": 50000}'`,
    ownerArcId: "alphacode.arc",
    arcnanoVerification: {
      poolAddress: DEFAULT_ARCNANO_POOL,
      zkScheme: "Groth16 BN254",
      aspCompliant: true,
      nullifierCache: true,
      settlementLatency: "4.1ms",
      recipientShieldedId: "alphacode.arc",
    },
  },

  // 4. Structured Real-Time Datasets & Feeds
  {
    id: "data-orderbook",
    category: "Structured Real-Time Datasets & Feeds",
    categoryShort: "Real-Time Feeds",
    filterKey: "Feeds",
    categoryBadge: "REAL-TIME FEED",
    endpoint: "WSS /v2/stream/mempool",
    latency: "4ms",
    name: "Realtime L2 Orderbook & Mempool Feed",
    description:
      "Streaming WebSocket L2 crypto & equities feed. Micro-metered byte frames streamed over continuous HTTP 402 payment channels for algorithmic market making and autonomous settlement.",
    tags: ["WEBSOCKET", "FINANCIAL DATA", "4MS TICK RATE", "ARC L1"],
    specs: [
      { label: "Backpressure", value: "0% Drop Guarantee" },
      { label: "Wire Protocol", value: "FlatBuffers / Protobuf" },
    ],
    price: "$0.000004",
    priceUnit: "/ message frame",
    actionText: "Stream Open",
    costNumeric: 0.000004,
    latencyNumeric: 4,
    curlSnippet: `wscat -c "wss://api.x402.org/v2/stream/mempool" \\
  -H "Authorization: X402 proof=0x89ab... nullifier=0x42f7..." \\
  -H "X-402-Stream-Budget: 1.00-USDC"`,
    ownerArcId: "mempool-node.arc",
    arcnanoVerification: {
      poolAddress: DEFAULT_ARCNANO_POOL,
      zkScheme: "Groth16 BN254",
      aspCompliant: true,
      nullifierCache: true,
      settlementLatency: "2.8ms",
      recipientShieldedId: "mempool-node.arc",
    },
  },
  {
    id: "data-edgar",
    category: "Structured Real-Time Datasets & Feeds",
    categoryShort: "Real-Time Feeds",
    filterKey: "Feeds",
    categoryBadge: "EDGAR STREAM",
    endpoint: "GET /v1/edgar/parse-chunk",
    latency: "32ms",
    name: "SEC 10-K & Live Filing Vector Feed",
    description:
      "Machine-readable financial disclosure dataset for analyst swarms. Automatically decomposes 10-K, 10-Q, and breaking 8-K tables into pre-calculated 1536-dim semantic embeddings.",
    tags: ["EDGAR STREAM", "SEMANTIC VECTORS", "FINANCIAL AGENT", "10-K PARSER"],
    specs: [
      { label: "Coverage", value: "100% US Public Equities" },
      { label: "Embedding Dims", value: "1536 Cosine Vector" },
    ],
    price: "$0.0050",
    priceUnit: "/ document chunk",
    actionText: "Pay & Query",
    costNumeric: 0.005,
    latencyNumeric: 32,
    curlSnippet: `curl -i -X GET "https://api.x402.org/v1/edgar/parse-chunk?ticker=NVDA&section=Item7" \\
  -H "Authorization: X402 proof=0x89ab... nullifier=0x42f7..."`,
    ownerArcId: "sec-vectors.arc",
    arcnanoVerification: {
      poolAddress: DEFAULT_ARCNANO_POOL,
      zkScheme: "Groth16 BN254",
      aspCompliant: true,
      nullifierCache: true,
      settlementLatency: "6.9ms",
      recipientShieldedId: "sec-vectors.arc",
    },
  },
  {
    id: "data-radar",
    category: "Structured Real-Time Datasets & Feeds",
    categoryShort: "Real-Time Feeds",
    filterKey: "Feeds",
    categoryBadge: "GEO-SPATIAL",
    endpoint: "GET /v1/radar/sar-telemetry",
    latency: "12ms",
    name: "Global Weather & Satellite SAR Telemetry",
    description:
      "Hyper-local synthetic aperture radar and orbital weather sets downsampled into machine-readable matrices for autonomous supply chain routing, freight agents, and drone operations.",
    tags: ["GEO-SPATIAL", "SATELLITE SAR", "RAW HDF5 / JSON", "METEOROLOGY"],
    specs: [
      { label: "Resolution", value: "10m / Pixel" },
      { label: "Orbital Refresh", value: "5-min Constellation" },
    ],
    price: "$0.00030",
    priceUnit: "/ coordinate query",
    actionText: "Acquire Data",
    costNumeric: 0.0003,
    latencyNumeric: 12,
    curlSnippet: `curl -i -X GET "https://api.x402.org/v1/radar/sar-telemetry?lat=37.77&lon=-122.41" \\
  -H "Authorization: X402 proof=0x89ab... nullifier=0x42f7..."`,
    ownerArcId: "sar-satellite.arc",
    arcnanoVerification: {
      poolAddress: DEFAULT_ARCNANO_POOL,
      zkScheme: "Groth16 BN254",
      aspCompliant: true,
      nullifierCache: true,
      settlementLatency: "4.7ms",
      recipientShieldedId: "sar-satellite.arc",
    },
  },

  // 5. Security, Governance, & Verification Modules
  {
    id: "sec-zkproof",
    category: "Security, Governance, & Verification Modules",
    categoryShort: "Security & Trust",
    filterKey: "Security",
    categoryBadge: "ZK VERIFIER",
    endpoint: "POST /v1/zk/verify-asp",
    latency: "6ms",
    name: "ArcShield ZK-Proof & Privacy Pools ASP Verifier",
    description:
      "Zero-Knowledge Association Set Provider (ASP) verifier proving cryptographic non-sanctioned provenance and clean funds compliance without compromising agent wallet confidentiality.",
    tags: ["ZK VERIFIER", "PRIVACY POOLS", "ASP COMPLIANCE", "GROTH16"],
    specs: [
      { label: "Proving Scheme", value: "Groth16 / Circom SNARK" },
      { label: "Verification SLA", value: "3.2ms Off-Chain" },
    ],
    price: "$0.00045",
    priceUnit: "/ proof verification",
    actionText: "Verify ZK Proof",
    costNumeric: 0.00045,
    latencyNumeric: 6,
    curlSnippet: `curl -i -X POST https://api.x402.org/v1/zk/verify-asp \\
  -H "Authorization: X402 proof=0x89ab... nullifier=0x42f7..." \\
  -H "Content-Type: application/json" \\
  -d '{"proof": "0x12ab...", "publicInputs": ["0x99aa...", "0x402c..."]}'`,
    ownerArcId: "arcshield-core.arc",
    arcnanoVerification: {
      poolAddress: DEFAULT_ARCNANO_POOL,
      zkScheme: "Groth16 BN254",
      aspCompliant: true,
      nullifierCache: true,
      settlementLatency: "3.2ms",
      recipientShieldedId: "arcshield-core.arc",
    },
  },
  {
    id: "sec-trustlayer",
    category: "Security, Governance, & Verification Modules",
    categoryShort: "Security & Trust",
    filterKey: "Security",
    categoryBadge: "TRUST LAYER",
    endpoint: "POST /v1/trust/guardrail-enforce",
    latency: "15ms",
    name: "TrustLayer Injection & Guardrail Firewall",
    description:
      "Enterprise trust-layer extension compatible with Salesforce Einstein Trust Layer & Llama-Guard 3. Filters indirect prompt injections, data exfiltration, and toxic tool calls before execution.",
    tags: ["TRUST LAYER", "PROMPT FIREWALL", "EINSTEIN COMPLIANT", "GUARDRAILS"],
    specs: [
      { label: "Inspection Type", value: "Bi-directional In/Out" },
      { label: "False Positive Rate", value: "< 0.01% Benchmarked" },
    ],
    price: "$0.00020",
    priceUnit: "/ guardrail check",
    actionText: "Enforce Trust",
    costNumeric: 0.0002,
    latencyNumeric: 15,
    curlSnippet: `curl -i -X POST https://api.x402.org/v1/trust/guardrail-enforce \\
  -H "Authorization: X402 proof=0x89ab... nullifier=0x42f7..." \\
  -H "Content-Type: application/json" \\
  -d '{"payload": "Execute transfer...", "policy": "einstein-strict-v2"}'`,
    ownerArcId: "trustlayer.arc",
    arcnanoVerification: {
      poolAddress: DEFAULT_ARCNANO_POOL,
      zkScheme: "Groth16 BN254",
      aspCompliant: true,
      nullifierCache: true,
      settlementLatency: "5.8ms",
      recipientShieldedId: "trustlayer.arc",
    },
  },
];
