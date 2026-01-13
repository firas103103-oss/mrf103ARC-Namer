-- ============================================
-- ARC PHASE 1-3 DATABASE MIGRATION (FIXED)
-- ============================================
-- Run this in Supabase SQL Editor
-- Date: 2026-01-07 (Revised)
-- Fixes: RLS policies, tenant_id consistency, updated_at triggers
-- ============================================

-- ============================================
-- HELPER: Updated_at trigger function
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PHASE 1: ARC EVENT LEDGER
-- ============================================
-- Core event logging table for all system actions
-- Uses tenant slug (VARCHAR) for flexibility in logging

CREATE TABLE IF NOT EXISTS arc_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(100) NOT NULL,
  actor VARCHAR(100) NOT NULL,
  tenant_id VARCHAR(100) NOT NULL DEFAULT 'mrf-primary',
  payload JSONB DEFAULT '{}',
  trace_id VARCHAR(100),
  severity VARCHAR(20) DEFAULT 'info',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_arc_events_type_created ON arc_events(type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_arc_events_tenant ON arc_events(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_arc_events_trace ON arc_events(trace_id) WHERE trace_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_arc_events_severity ON arc_events(severity) WHERE severity IN ('error', 'critical');

-- Enable Row Level Security
ALTER TABLE arc_events ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow all operations (private single-tenant system)
DROP POLICY IF EXISTS "Service role can manage arc_events" ON arc_events;
CREATE POLICY "Allow all arc_events access" ON arc_events
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- PHASE 2: TENANTS & RBAC
-- ============================================

CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS tenants_updated_at ON tenants;
CREATE TRIGGER tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow all (private single-tenant)
DROP POLICY IF EXISTS "Allow all tenants access" ON tenants;
CREATE POLICY "Allow all tenants access" ON tenants
  FOR ALL USING (true) WITH CHECK (true);

-- Insert default tenant (owner only)
INSERT INTO tenants (id, name, slug, status, config) 
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'MRF Primary',
  'mrf-primary',
  'active',
  '{"owner": true, "public_signup": false}'
) ON CONFLICT (slug) DO NOTHING;

-- tenant_users: Link users to tenants with roles
-- Note: user_id is VARCHAR to match existing users table
CREATE TABLE IF NOT EXISTS tenant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,  -- VARCHAR to match users.id type
  role VARCHAR(50) NOT NULL DEFAULT 'AGENT',
  permissions JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant ON tenant_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_user ON tenant_users(user_id);

-- Enable RLS
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow all (private single-tenant)
DROP POLICY IF EXISTS "Allow all tenant_users access" ON tenant_users;
CREATE POLICY "Allow all tenant_users access" ON tenant_users
  FOR ALL USING (true) WITH CHECK (true);

-- Feature flags table
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT false,
  tenant_id UUID REFERENCES tenants(id),
  config JSONB DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS feature_flags_updated_at ON feature_flags;
CREATE TRIGGER feature_flags_updated_at
  BEFORE UPDATE ON feature_flags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow all (private single-tenant)
DROP POLICY IF EXISTS "Allow all feature_flags access" ON feature_flags;
CREATE POLICY "Allow all feature_flags access" ON feature_flags
  FOR ALL USING (true) WITH CHECK (true);

-- Insert default feature flags (billing/onboarding OFF for private mode)
INSERT INTO feature_flags (key, enabled, description) VALUES
  ('billing', false, 'Enable billing and payment features'),
  ('public_onboarding', false, 'Allow public user registration'),
  ('multi_tenant_ui', false, 'Show multi-tenant management UI'),
  ('voice_chat', true, 'Enable voice chat with agents'),
  ('agent_automation', true, 'Enable agent automation workflows')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- PHASE 3: AGENT REGISTRY (DB-backed)
-- ============================================

CREATE TABLE IF NOT EXISTS agent_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  capabilities JSONB DEFAULT '[]',
  scopes JSONB DEFAULT '[]',
  config JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'active',
  tenant_id UUID REFERENCES tenants(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS agent_registry_updated_at ON agent_registry;
CREATE TRIGGER agent_registry_updated_at
  BEFORE UPDATE ON agent_registry
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_agent_registry_status ON agent_registry(status);
CREATE INDEX IF NOT EXISTS idx_agent_registry_tenant ON agent_registry(tenant_id) WHERE tenant_id IS NOT NULL;

-- Enable RLS
ALTER TABLE agent_registry ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow all (private single-tenant)
DROP POLICY IF EXISTS "Allow all agent_registry access" ON agent_registry;
CREATE POLICY "Allow all agent_registry access" ON agent_registry
  FOR ALL USING (true) WITH CHECK (true);

-- Insert default agent (Mr.F)
INSERT INTO agent_registry (name, slug, capabilities, scopes, config, status) VALUES
  ('Mr.F', 'mrf', 
   '["chat", "voice", "reasoning", "memory"]',
   '["read:messages", "write:messages", "execute:commands"]',
   '{"model": "gpt-4o-mini", "temperature": 0.7}',
   'active')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- REALTIME (Optional - may fail if publication doesn't exist)
-- ============================================
-- Uncomment and run separately if needed:
-- ALTER PUBLICATION supabase_realtime ADD TABLE arc_events;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these after migration to verify:

SELECT 'arc_events' as table_name, count(*) as rows FROM arc_events
UNION ALL
SELECT 'tenants', count(*) FROM tenants
UNION ALL
SELECT 'feature_flags', count(*) FROM feature_flags
UNION ALL
SELECT 'agent_registry', count(*) FROM agent_registry;

-- ============================================
-- CLEANUP (if needed to re-run)
-- ============================================
-- DROP TABLE IF EXISTS arc_events CASCADE;
-- DROP TABLE IF EXISTS tenant_users CASCADE;
-- DROP TABLE IF EXISTS feature_flags CASCADE;
-- DROP TABLE IF EXISTS agent_registry CASCADE;
-- DROP TABLE IF EXISTS tenants CASCADE;
-- DROP FUNCTION IF EXISTS update_updated_at_column();

