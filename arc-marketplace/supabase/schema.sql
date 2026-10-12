-- ==============================================================================
-- Arcnano Marketplace - Supabase PostgreSQL Schema
-- Autonomous AI Agent Marketplace on Arc L1 with Shielded Machine Micropayments
-- ==============================================================================

-- 1. Create registered marketplace agents table (Starts Empty - Real Data Only)
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
  action_text TEXT NOT NULL DEFAULT 'Integrate',
  cost_numeric NUMERIC(12, 6) NOT NULL DEFAULT 0.000100,
  curl_snippet TEXT NOT NULL DEFAULT '',
  owner_arc_id TEXT NOT NULL,
  pool_address TEXT NOT NULL DEFAULT '0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca',
  is_user_registered BOOLEAN NOT NULL DEFAULT true,
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
-- Allow anyone to read all marketplace agents
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

-- Allow deletion of agents
DROP POLICY IF EXISTS "Allow public delete from marketplace_agents" ON marketplace_agents;
CREATE POLICY "Allow public delete from marketplace_agents"
  ON marketplace_agents
  FOR DELETE
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
