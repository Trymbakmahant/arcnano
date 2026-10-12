-- ==============================================================================
-- Arcnano Marketplace - Supabase PostgreSQL Schema & Seed Migration
-- Autonomous AI Agent Marketplace on Arc L1 with Shielded Machine Micropayments
-- ==============================================================================

-- 1. Create registered marketplace agents table
CREATE TABLE IF NOT EXISTS marketplace_agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  category_short TEXT NOT NULL,
  filter_key TEXT NOT NULL,
  category_badge TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  latency TEXT NOT NULL DEFAULT '8ms',
  latency_numeric INTEGER NOT NULL DEFAULT 8,
  description TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  specs JSONB NOT NULL DEFAULT '[]'::jsonb,
  price TEXT NOT NULL,
  price_unit TEXT NOT NULL DEFAULT '/ execution',
  action_text TEXT NOT NULL DEFAULT 'Call Agent',
  cost_numeric NUMERIC(12, 6) NOT NULL DEFAULT 0.000100,
  curl_snippet TEXT NOT NULL DEFAULT '',
  owner_arc_id TEXT NOT NULL,
  pool_address TEXT NOT NULL DEFAULT '0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca',
  is_user_registered BOOLEAN NOT NULL DEFAULT false,
  arcnano_verification JSONB NOT NULL DEFAULT '{
    "poolAddress": "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca",
    "zkScheme": "Groth16 BN254",
    "aspCompliant": true,
    "nullifierCache": true,
    "settlementLatency": "<8ms"
  }'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create Arc identities table (Optional registry for user & bot Arc IDs)
CREATE TABLE IF NOT EXISTS arc_identities (
  arc_id TEXT PRIMARY KEY,
  shielded_address TEXT NOT NULL,
  network TEXT NOT NULL DEFAULT 'Arc Testnet (5042002)',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Indexes for fast category filtering, text search, and chronological sorting
CREATE INDEX IF NOT EXISTS idx_marketplace_agents_filter_key ON marketplace_agents(filter_key);
CREATE INDEX IF NOT EXISTS idx_marketplace_agents_owner_arc_id ON marketplace_agents(owner_arc_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_agents_created_at ON marketplace_agents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_agents_cost_numeric ON marketplace_agents(cost_numeric);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE marketplace_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE arc_identities ENABLE ROW LEVEL SECURITY;

-- 5. Define RLS Policies for marketplace_agents
-- Allow anyone (public / autonomous agent runtimes) to read all marketplace agents
DROP POLICY IF EXISTS "Allow public read access to marketplace_agents" ON marketplace_agents;
CREATE POLICY "Allow public read access to marketplace_agents"
  ON marketplace_agents
  FOR SELECT
  TO public
  USING (true);

-- Allow anyone to register a new agent into the marketplace
DROP POLICY IF EXISTS "Allow public insert to marketplace_agents" ON marketplace_agents;
CREATE POLICY "Allow public insert to marketplace_agents"
  ON marketplace_agents
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow updates (e.g. agent owners or service role)
DROP POLICY IF EXISTS "Allow public update to marketplace_agents" ON marketplace_agents;
CREATE POLICY "Allow public update to marketplace_agents"
  ON marketplace_agents
  FOR UPDATE
  TO public
  USING (true);

-- 6. Define RLS Policies for arc_identities
DROP POLICY IF EXISTS "Allow public read to arc_identities" ON arc_identities;
CREATE POLICY "Allow public read to arc_identities"
  ON arc_identities
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Allow public insert to arc_identities" ON arc_identities;
CREATE POLICY "Allow public insert to arc_identities"
  ON arc_identities
  FOR INSERT
  TO public
  WITH CHECK (true);

-- ==============================================================================
-- 7. Seed Data: Default Demo Identities
-- ==============================================================================
INSERT INTO arc_identities (arc_id, shielded_address, network)
VALUES
  ('agent-master.arc', '0xarc7f9b821a3e...402c', 'Arc Testnet (5042002)'),
  ('alphabot-pro.arc', '0xarc3c8812ff90...11a0', 'Arc Testnet (5042002)'),
  ('zk-arbitrageur.arc', '0xarc9f1cd04a67...99e1', 'Arc Testnet (5042002)')
ON CONFLICT (arc_id) DO NOTHING;

-- ==============================================================================
-- 8. Seed Data: The 11 Core Autonomous Marketplace Nodes
-- ==============================================================================
INSERT INTO marketplace_agents (
  id,
  name,
  category,
  category_short,
  filter_key,
  category_badge,
  endpoint,
  latency,
  latency_numeric,
  description,
  tags,
  specs,
  price,
  price_unit,
  action_text,
  cost_numeric,
  curl_snippet,
  owner_arc_id,
  pool_address,
  is_user_registered,
  arcnano_verification
)
VALUES
  (
    'mcp-compose',
    'Compose.io Enterprise MCP Server',
    'MCP Servers & Connectors',
    'MCP Servers',
    'MCP',
    'MCP SERVER',
    'POST /v1/mcp/compose-suite',
    '8ms',
    8,
    'Pre-built integration server letting autonomous agents securely plug into Gmail, Slack, Salesforce, Postgres, and S3 file systems with granular OAuth scoping and sub-10ms tool calling.',
    ARRAY['MCP SERVER', 'SLACK & GMAIL', 'ENTERPRISE DB', 'COMPOSE.IO'],
    '[{"label": "Protocol", "value": "MCP v1.2 Standard"}, {"label": "Isolation", "value": "Ephemeral MicroVM"}]'::jsonb,
    '$0.00015',
    '/ tool call',
    'Connect MCP',
    0.000150,
    'curl -i -X POST https://api.x402.org/v1/mcp/compose-suite \
  -H "Authorization: X402 proof=0x89ab... nullifier=0x42f7..." \
  -H "Content-Type: application/json" \
  -d ''{"connector": "slack-workspace", "action": "channel.broadcast", "params": {"channel": "#leads"}}''',
    'compose-enterprise.arc',
    '0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca',
    false,
    '{"poolAddress": "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca", "zkScheme": "Groth16 BN254", "aspCompliant": true, "nullifierCache": true, "settlementLatency": "4.8ms", "recipientShieldedId": "compose-enterprise.arc"}'::jsonb
  ),
  (
    'mcp-devops',
    'DevOps & Repo Sync MCP Connector',
    'MCP Servers & Connectors',
    'MCP Servers',
    'MCP',
    'MCP CONNECTOR',
    'POST /v1/mcp/github-linear-sync',
    '12ms',
    12,
    'Autonomous Model Context Protocol bridge for GitHub, GitLab, and Linear. Enables agentic pull-request creation, issue triage, and automated branch commits without sharing human credentials.',
    ARRAY['MCP CONNECTOR', 'GITHUB API', 'LINEAR TICKETS', 'DEVOPS'],
    '[{"label": "Rate Limit", "value": "600 req/min"}, {"label": "Auth Scope", "value": "Zero-Leak Proxy"}]'::jsonb,
    '$0.00025',
    '/ sync operation',
    'Attach Connector',
    0.000250,
    'curl -i -X POST https://api.x402.org/v1/mcp/github-linear-sync \
  -H "Authorization: X402 proof=0x89ab... nullifier=0x42f7..." \
  -H "Content-Type: application/json" \
  -d ''{"repo": "org/core", "task": "triage_pr", "pr_id": 402}''',
    'gitops-bot.arc',
    '0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca',
    false,
    '{"poolAddress": "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca", "zkScheme": "Groth16 BN254", "aspCompliant": true, "nullifierCache": true, "settlementLatency": "6.2ms", "recipientShieldedId": "gitops-bot.arc"}'::jsonb
  ),
  (
    'subagent-lexguard',
    'LexGuard Legal & Compliance Sub-Agent',
    'Specialized Sub-Agents & Micro-Workers',
    'Sub-Agents',
    'Sub-Agents',
    'SUB-AGENT',
    'RPC /subagent/lexguard-audit',
    '92ms',
    92,
    'Autonomous functional legal worker that primary AI agents hire or chain to audit counterparty contracts, cross-border SLA liabilities, GDPR mandates, and NDA disclosures before signing transactions.',
    ARRAY['SUB-AGENT', 'LEGAL AUDIT', 'COMPLIANCE CHECK', 'CHAIN-OF-THOUGHT'],
    '[{"label": "Context Window", "value": "128k CoT Verification"}, {"label": "Worker Model", "value": "ClauseCheck-V3"}]'::jsonb,
    '$0.0080',
    '/ delegated audit',
    'Hire Sub-Agent',
    0.008000,
    'curl -i -X POST https://api.x402.org/subagent/lexguard-audit \
  -H "Authorization: X402 proof=0x89ab... nullifier=0x42f7..." \
  -H "Content-Type: application/json" \
  -d ''{"contract_hash": "0x89fe2...", "checklist": ["GDPR_Art28", "IndemnityCap"]}''',
    'lexguard-labs.arc',
    '0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca',
    false,
    '{"poolAddress": "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca", "zkScheme": "Groth16 BN254", "aspCompliant": true, "nullifierCache": true, "settlementLatency": "5.1ms", "recipientShieldedId": "lexguard-labs.arc"}'::jsonb
  ),
  (
    'subagent-swarmparse',
    'SwarmParse Multi-Document Triage Worker',
    'Specialized Sub-Agents & Micro-Workers',
    'Sub-Agents',
    'Sub-Agents',
    'MICRO-WORKER',
    'RPC /subagent/doc-triage',
    '64ms',
    64,
    'Specialized parsing worker agent that parallel-unpacks nested PDF contracts, multi-column financial statements, and scanned invoices into machine-actionable, validated Pydantic JSON schemas.',
    ARRAY['MICRO-WORKER', 'MULTI-AGENT SWARM', 'OCR RESOLVER', 'STRUCTURED JSON'],
    '[{"label": "Throughput", "value": "85 pages / sec"}, {"label": "Target Schema", "value": "Pydantic Strict V2"}]'::jsonb,
    '$0.0035',
    '/ parsed document',
    'Lease Worker',
    0.003500,
    'curl -i -X POST https://api.x402.org/subagent/doc-triage \
  -H "Authorization: X402 proof=0x89ab... nullifier=0x42f7..." \
  -H "Content-Type: application/json" \
  -d ''{"doc_uri": "s3://contracts/v4-enterprise.pdf", "output_format": "json_schema"}''',
    'swarmparse-ai.arc',
    '0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca',
    false,
    '{"poolAddress": "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca", "zkScheme": "Groth16 BN254", "aspCompliant": true, "nullifierCache": true, "settlementLatency": "4.4ms", "recipientShieldedId": "swarmparse-ai.arc"}'::jsonb
  ),
  (
    'compute-h100',
    'H100 GPU Burst & Reasoning Token Quota',
    'Compute, Token Quotas, & API Credits',
    'Compute',
    'Compute',
    'COMPUTE QUOTA',
    'POST /compute/h100-tensor-burst',
    '14ms',
    14,
    'Scalable processing power and Nvidia H100 SXM5 compute slices. Lets primary agents offload heavy multi-modal reasoning and large code synthesis without long-term cloud contracts.',
    ARRAY['GPU COMPUTE', 'H100 SXM5', 'REASONING QUOTA', 'TENSOR PARALLEL'],
    '[{"label": "Memory Bandwidth", "value": "3.35 TB/s HBM3"}, {"label": "Settlement Unit", "value": "Per 10k Reasoning Tokens"}]'::jsonb,
    '$0.00008',
    '/ reasoning k-token',
    'Acquire Quota',
    0.000080,
    'curl -i -X POST https://api.x402.org/compute/h100-tensor-burst \
  -H "Authorization: X402 proof=0x89ab... nullifier=0x42f7..." \
  -H "Content-Type: application/json" \
  -d ''{"compute_tier": "h100-sxm5-80gb", "max_tokens": 50000, "temperature": 0.2}''',
    'compute-node-01.arc',
    '0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca',
    false,
    '{"poolAddress": "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca", "zkScheme": "Groth16 BN254", "aspCompliant": true, "nullifierCache": true, "settlementLatency": "3.9ms", "recipientShieldedId": "compute-node-01.arc"}'::jsonb
  ),
  (
    'compute-wasm',
    'AlphaCode Sandbox WASM Isolation API',
    'Compute, Token Quotas, & API Credits',
    'Compute',
    'Compute',
    'WASM RUNTIME',
    'POST /v1/wasm/execute',
    '18ms',
    18,
    'Execute untrusted synthetic agent code in secure WASM multi-tenant containers with micro-gas settlement, strict memory boundaries, and sub-millisecond cold starts.',
    ARRAY['TOOL API', 'WASM CONTAINER', '99.98% SUCCESS', 'ZERO ESCAPE'],
    '[{"label": "SLA Success", "value": "99.98%"}, {"label": "Memory Limit", "value": "64MB Isolated Heap"}]'::jsonb,
    '$0.00012',
    '/ execution',
    'Execute WASM',
    0.000120,
    'curl -i -X POST https://api.x402.org/v1/wasm/execute \
  -H "Authorization: X402 proof=0x89ab... nullifier=0x42f7..." \
  -H "Content-Type: application/json" \
  -d ''{"bytecode": "AGFzbQEAAA...", "fuel": 50000}''',
    'alphacode.arc',
    '0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca',
    false,
    '{"poolAddress": "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca", "zkScheme": "Groth16 BN254", "aspCompliant": true, "nullifierCache": true, "settlementLatency": "4.1ms", "recipientShieldedId": "alphacode.arc"}'::jsonb
  ),
  (
    'data-orderbook',
    'Realtime L2 Orderbook & Mempool Feed',
    'Structured Real-Time Datasets & Feeds',
    'Real-Time Feeds',
    'Feeds',
    'REAL-TIME FEED',
    'WSS /v2/stream/mempool',
    '4ms',
    4,
    'Streaming WebSocket L2 crypto & equities feed. Micro-metered byte frames streamed over continuous HTTP 402 payment channels for algorithmic market making and autonomous settlement.',
    ARRAY['WEBSOCKET', 'FINANCIAL DATA', '4MS TICK RATE', 'ARC L1'],
    '[{"label": "Backpressure", "value": "0% Drop Guarantee"}, {"label": "Wire Protocol", "value": "FlatBuffers / Protobuf"}]'::jsonb,
    '$0.000004',
    '/ message frame',
    'Stream Open',
    0.000004,
    'wscat -c "wss://api.x402.org/v2/stream/mempool" \
  -H "Authorization: X402 proof=0x89ab... nullifier=0x42f7..." \
  -H "X-402-Stream-Budget: 1.00-USDC"',
    'mempool-node.arc',
    '0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca',
    false,
    '{"poolAddress": "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca", "zkScheme": "Groth16 BN254", "aspCompliant": true, "nullifierCache": true, "settlementLatency": "2.8ms", "recipientShieldedId": "mempool-node.arc"}'::jsonb
  ),
  (
    'data-edgar',
    'SEC 10-K & Live Filing Vector Feed',
    'Structured Real-Time Datasets & Feeds',
    'Real-Time Feeds',
    'Feeds',
    'EDGAR STREAM',
    'GET /v1/edgar/parse-chunk',
    '32ms',
    32,
    'Machine-readable financial disclosure dataset for analyst swarms. Automatically decomposes 10-K, 10-Q, and breaking 8-K tables into pre-calculated 1536-dim semantic embeddings.',
    ARRAY['EDGAR STREAM', 'SEMANTIC VECTORS', 'FINANCIAL AGENT', '10-K PARSER'],
    '[{"label": "Coverage", "value": "100% US Public Equities"}, {"label": "Embedding Dims", "value": "1536 Cosine Vector"}]'::jsonb,
    '$0.0050',
    '/ document chunk',
    'Pay & Query',
    0.005000,
    'curl -i -X GET "https://api.x402.org/v1/edgar/parse-chunk?ticker=NVDA&section=Item7" \
  -H "Authorization: X402 proof=0x89ab... nullifier=0x42f7..."',
    'sec-vectors.arc',
    '0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca',
    false,
    '{"poolAddress": "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca", "zkScheme": "Groth16 BN254", "aspCompliant": true, "nullifierCache": true, "settlementLatency": "6.9ms", "recipientShieldedId": "sec-vectors.arc"}'::jsonb
  ),
  (
    'data-radar',
    'Global Weather & Satellite SAR Telemetry',
    'Structured Real-Time Datasets & Feeds',
    'Real-Time Feeds',
    'Feeds',
    'GEO-SPATIAL',
    'GET /v1/radar/sar-telemetry',
    '12ms',
    12,
    'Hyper-local synthetic aperture radar and orbital weather sets downsampled into machine-readable matrices for autonomous supply chain routing, freight agents, and drone operations.',
    ARRAY['GEO-SPATIAL', 'SATELLITE SAR', 'RAW HDF5 / JSON', 'METEOROLOGY'],
    '[{"label": "Resolution", "value": "10m / Pixel"}, {"label": "Orbital Refresh", "value": "5-min Constellation"}]'::jsonb,
    '$0.00030',
    '/ coordinate query',
    'Acquire Data',
    0.000300,
    'curl -i -X GET "https://api.x402.org/v1/radar/sar-telemetry?lat=37.77&lon=-122.41" \
  -H "Authorization: X402 proof=0x89ab... nullifier=0x42f7..."',
    'sar-satellite.arc',
    '0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca',
    false,
    '{"poolAddress": "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca", "zkScheme": "Groth16 BN254", "aspCompliant": true, "nullifierCache": true, "settlementLatency": "4.7ms", "recipientShieldedId": "sar-satellite.arc"}'::jsonb
  ),
  (
    'sec-zkproof',
    'ArcShield ZK-Proof & Privacy Pools ASP Verifier',
    'Security, Governance, & Verification Modules',
    'Security & Trust',
    'Security',
    'ZK VERIFIER',
    'POST /v1/zk/verify-asp',
    '6ms',
    6,
    'Zero-Knowledge Association Set Provider (ASP) verifier proving cryptographic non-sanctioned provenance and clean funds compliance without compromising agent wallet confidentiality.',
    ARRAY['ZK VERIFIER', 'PRIVACY POOLS', 'ASP COMPLIANCE', 'GROTH16'],
    '[{"label": "Proving Scheme", "value": "Groth16 / Circom SNARK"}, {"label": "Verification SLA", "value": "3.2ms Off-Chain"}]'::jsonb,
    '$0.00045',
    '/ proof verification',
    'Verify ZK Proof',
    0.000450,
    'curl -i -X POST https://api.x402.org/v1/zk/verify-asp \
  -H "Authorization: X402 proof=0x89ab... nullifier=0x42f7..." \
  -H "Content-Type: application/json" \
  -d ''{"proof": "0x12ab...", "publicInputs": ["0x99aa...", "0x402c..."]}''',
    'arcshield-core.arc',
    '0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca',
    false,
    '{"poolAddress": "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca", "zkScheme": "Groth16 BN254", "aspCompliant": true, "nullifierCache": true, "settlementLatency": "3.2ms", "recipientShieldedId": "arcshield-core.arc"}'::jsonb
  ),
  (
    'sec-trustlayer',
    'TrustLayer Injection & Guardrail Firewall',
    'Security, Governance, & Verification Modules',
    'Security & Trust',
    'Security',
    'TRUST LAYER',
    'POST /v1/trust/guardrail-enforce',
    '15ms',
    15,
    'Enterprise trust-layer extension compatible with Salesforce Einstein Trust Layer & Llama-Guard 3. Filters indirect prompt injections, data exfiltration, and toxic tool calls before execution.',
    ARRAY['TRUST LAYER', 'PROMPT FIREWALL', 'EINSTEIN COMPLIANT', 'GUARDRAILS'],
    '[{"label": "Inspection Type", "value": "Bi-directional In/Out"}, {"label": "False Positive Rate", "value": "< 0.01% Benchmarked"}]'::jsonb,
    '$0.00020',
    '/ guardrail check',
    'Enforce Trust',
    0.000200,
    'curl -i -X POST https://api.x402.org/v1/trust/guardrail-enforce \
  -H "Authorization: X402 proof=0x89ab... nullifier=0x42f7..." \
  -H "Content-Type: application/json" \
  -d ''{"payload": "Execute transfer...", "policy": "einstein-strict-v2"}''',
    'trustlayer.arc',
    '0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca',
    false,
    '{"poolAddress": "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca", "zkScheme": "Groth16 BN254", "aspCompliant": true, "nullifierCache": true, "settlementLatency": "5.8ms", "recipientShieldedId": "trustlayer.arc"}'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  category_short = EXCLUDED.category_short,
  filter_key = EXCLUDED.filter_key,
  category_badge = EXCLUDED.category_badge,
  endpoint = EXCLUDED.endpoint,
  latency = EXCLUDED.latency,
  latency_numeric = EXCLUDED.latency_numeric,
  description = EXCLUDED.description,
  tags = EXCLUDED.tags,
  specs = EXCLUDED.specs,
  price = EXCLUDED.price,
  price_unit = EXCLUDED.price_unit,
  action_text = EXCLUDED.action_text,
  cost_numeric = EXCLUDED.cost_numeric,
  curl_snippet = EXCLUDED.curl_snippet,
  owner_arc_id = EXCLUDED.owner_arc_id,
  pool_address = EXCLUDED.pool_address,
  arcnano_verification = EXCLUDED.arcnano_verification,
  updated_at = NOW();
