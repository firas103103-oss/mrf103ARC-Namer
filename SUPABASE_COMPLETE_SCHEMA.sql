-- ============================================
-- 🚀 ARC PROJECT - COMPLETE DATABASE SCHEMA
-- ============================================
-- Version: 2.0.0
-- Date: 2026-01-14
-- Database: PostgreSQL 14+ (Supabase Compatible)
-- ============================================
-- Copy and paste this ENTIRE file into Supabase SQL Editor
-- ============================================

-- ============================================
-- PART 1: CORE BIO SENTINEL TABLES
-- ============================================

-- TABLE 1: sensor_readings
CREATE TABLE IF NOT EXISTS sensor_readings (
  id SERIAL PRIMARY KEY,
  device_id VARCHAR(50) NOT NULL,
  gas_resistance BIGINT,
  temperature REAL,
  humidity REAL,
  pressure REAL,
  iaq_score INTEGER,
  iaq_accuracy INTEGER,
  co2_equivalent INTEGER,
  voc_equivalent REAL,
  heater_temperature INTEGER,
  heater_duration INTEGER,
  mode VARCHAR(20) DEFAULT 'idle',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sensor_readings_device_id ON sensor_readings(device_id);
CREATE INDEX idx_sensor_readings_created_at ON sensor_readings(created_at DESC);
CREATE INDEX idx_sensor_readings_device_time ON sensor_readings(device_id, created_at DESC);

-- TABLE 2: smell_profiles
CREATE TABLE IF NOT EXISTS smell_profiles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(50),
  subcategory VARCHAR(50),
  label VARCHAR(100),
  feature_vector REAL[],
  embedding_vector REAL[],
  embedding_text TEXT,
  confidence REAL,
  sample_count INTEGER DEFAULT 0,
  last_matched_at TIMESTAMP,
  baseline_gas BIGINT,
  peak_gas BIGINT,
  avg_temperature REAL,
  avg_humidity REAL,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_smell_profiles_category ON smell_profiles(category);
CREATE INDEX idx_smell_profiles_tags ON smell_profiles USING GIN(tags);

-- TABLE 3: smell_captures
CREATE TABLE IF NOT EXISTS smell_captures (
  id SERIAL PRIMARY KEY,
  device_id VARCHAR(50) NOT NULL,
  profile_id INTEGER REFERENCES smell_profiles(id) ON DELETE SET NULL,
  capture_id VARCHAR(100) UNIQUE NOT NULL,
  duration_ms INTEGER NOT NULL,
  samples_count INTEGER NOT NULL,
  raw_data JSONB,
  feature_vector REAL[],
  status VARCHAR(20) DEFAULT 'completed',
  error_message TEXT,
  recognized_profile_id INTEGER REFERENCES smell_profiles(id) ON DELETE SET NULL,
  recognition_confidence REAL,
  heater_profile VARCHAR(50),
  heater_temperature INTEGER,
  room_temperature REAL,
  room_humidity REAL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_smell_captures_device_id ON smell_captures(device_id);
CREATE INDEX idx_smell_captures_created_at ON smell_captures(created_at DESC);
CREATE INDEX idx_smell_captures_raw_data ON smell_captures USING GIN(raw_data);

-- ============================================
-- PART 2: ARC SECTOR TABLES (Phase 3)
-- ============================================

-- FINANCE SECTOR
CREATE TABLE IF NOT EXISTS financial_transactions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  type VARCHAR(50) NOT NULL,
  category VARCHAR(100),
  amount NUMERIC(15, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  description TEXT,
  status VARCHAR(50) DEFAULT 'completed',
  metadata JSONB DEFAULT '{}',
  user_id VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transactions_type ON financial_transactions(type);
CREATE INDEX idx_transactions_created ON financial_transactions(created_at);

CREATE TABLE IF NOT EXISTS budgets (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  sector VARCHAR(50) NOT NULL,
  period VARCHAR(50) NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  allocated_amount NUMERIC(15, 2) NOT NULL,
  spent_amount NUMERIC(15, 2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'USD',
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- SECURITY SECTOR
CREATE TABLE IF NOT EXISTS security_events (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  event_type VARCHAR(100) NOT NULL,
  severity VARCHAR(50) NOT NULL,
  source VARCHAR(255),
  target VARCHAR(255),
  description TEXT,
  metadata JSONB DEFAULT '{}',
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP,
  resolved_by VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_security_events_type ON security_events(event_type);
CREATE INDEX idx_security_events_severity ON security_events(severity);
CREATE INDEX idx_security_events_created ON security_events(created_at);

CREATE TABLE IF NOT EXISTS firewall_rules (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name VARCHAR(255) NOT NULL,
  rule_type VARCHAR(50) NOT NULL,
  source VARCHAR(255),
  target VARCHAR(255),
  port INTEGER,
  protocol VARCHAR(50),
  priority INTEGER DEFAULT 100,
  enabled BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- LEGAL SECTOR
CREATE TABLE IF NOT EXISTS legal_documents (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title VARCHAR(500) NOT NULL,
  document_type VARCHAR(100) NOT NULL,
  category VARCHAR(100),
  status VARCHAR(50) DEFAULT 'draft',
  file_url TEXT,
  content TEXT,
  version VARCHAR(50) DEFAULT '1.0',
  effective_date TIMESTAMP,
  expiration_date TIMESTAMP,
  parties JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_by VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_legal_docs_type ON legal_documents(document_type);
CREATE INDEX idx_legal_docs_status ON legal_documents(status);
CREATE INDEX idx_legal_docs_created ON legal_documents(created_at);

CREATE TABLE IF NOT EXISTS compliance_checks (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  check_type VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  score INTEGER,
  findings JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  checked_at TIMESTAMP DEFAULT NOW(),
  next_check_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- REPORTS TABLES
CREATE TABLE IF NOT EXISTS reports (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title VARCHAR(500) NOT NULL,
  report_type VARCHAR(50) NOT NULL,
  sectors JSONB DEFAULT '[]',
  status VARCHAR(50) DEFAULT 'draft',
  summary TEXT,
  content JSONB DEFAULT '{}',
  file_url TEXT,
  generated_by VARCHAR,
  period_start TIMESTAMP,
  period_end TIMESTAMP,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX idx_reports_type ON reports(report_type);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created ON reports(created_at);

-- SETTINGS TABLES
CREATE TABLE IF NOT EXISTS system_settings (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  category VARCHAR(100) NOT NULL,
  key VARCHAR(100) NOT NULL,
  value JSONB NOT NULL,
  value_type VARCHAR(50) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  is_editable BOOLEAN DEFAULT true,
  updated_by VARCHAR,
  updated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(category, key)
);

-- ============================================
-- PART 3: SEED DATA
-- ============================================

-- Smell Profiles Seed
INSERT INTO smell_profiles (name, category, subcategory, label, description, tags, baseline_gas)
VALUES 
  ('Fresh Coffee', 'food', 'coffee', 'food/coffee', 'Freshly brewed arabica coffee', ARRAY['aromatic', 'morning'], 250000),
  ('Lavender Oil', 'floral', 'lavender', 'floral/lavender', 'Pure lavender essential oil', ARRAY['calming', 'herbal'], 320000),
  ('Natural Gas', 'chemical', 'gas', 'chemical/gas', 'Household natural gas', ARRAY['warning', 'gas'], 80000)
ON CONFLICT (name) DO NOTHING;

-- Financial Transactions Seed
INSERT INTO financial_transactions (type, category, amount, description, status)
VALUES 
  ('income', 'revenue', 45000.00, 'Client Project Payment - Q1 2026', 'completed'),
  ('expense', 'equipment', -1200.00, 'MacBook Pro M3 for Development', 'completed'),
  ('expense', 'software', -299.00, 'GitHub Enterprise Subscription', 'completed'),
  ('income', 'investment', 25000.00, 'Angel Investment Round', 'completed'),
  ('expense', 'marketing', -850.00, 'Google Ads Campaign', 'completed')
ON CONFLICT DO NOTHING;

-- Security Events Seed
INSERT INTO security_events (event_type, severity, source, description)
VALUES
  ('login_attempt', 'medium', '192.168.1.100', 'Failed login attempt detected'),
  ('firewall_block', 'low', '203.0.113.42', 'Blocked suspicious IP'),
  ('threat_detected', 'high', 'internal_scanner', 'Potential SQL injection attempt')
ON CONFLICT DO NOTHING;

-- Legal Documents Seed
INSERT INTO legal_documents (title, document_type, status, version)
VALUES
  ('Employee Handbook 2026', 'policy', 'active', '2.0'),
  ('Vendor Agreement - AWS', 'contract', 'active', '1.0'),
  ('Patent Application - AI System', 'patent', 'review', '1.0')
ON CONFLICT DO NOTHING;

-- System Settings Seed
INSERT INTO system_settings (category, key, value, value_type, description)
VALUES
  ('general', 'dark_mode', 'true', 'boolean', 'Enable dark mode by default'),
  ('notifications', 'email_enabled', 'true', 'boolean', 'Enable email notifications'),
  ('security', 'session_timeout', '3600', 'number', 'Session timeout in seconds')
ON CONFLICT (category, key) DO NOTHING;

-- Reports Seed
INSERT INTO reports (title, report_type, status, summary, period_start, period_end)
VALUES
  ('Daily Operations Report', 'daily', 'completed', 'Daily summary of all sectors', NOW() - INTERVAL '1 day', NOW()),
  ('Weekly Performance Report', 'weekly', 'completed', 'Weekly analysis of key metrics', NOW() - INTERVAL '7 days', NOW()),
  ('Monthly Financial Report', 'monthly', 'draft', 'Comprehensive financial overview', NOW() - INTERVAL '30 days', NOW())
ON CONFLICT DO NOTHING;

-- ============================================
-- PART 4: TRIGGERS & FUNCTIONS
-- ============================================

-- Update timestamp trigger for smell_profiles
CREATE OR REPLACE FUNCTION update_smell_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_smell_profiles_update
BEFORE UPDATE ON smell_profiles
FOR EACH ROW
EXECUTE FUNCTION update_smell_profile_timestamp();

-- Increment sample count on new capture
CREATE OR REPLACE FUNCTION increment_profile_sample_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.profile_id IS NOT NULL THEN
    UPDATE smell_profiles
    SET sample_count = sample_count + 1, updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.profile_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_smell_captures_insert
AFTER INSERT ON smell_captures
FOR EACH ROW
EXECUTE FUNCTION increment_profile_sample_count();

-- ============================================
-- PART 5: ANALYTICS VIEWS
-- ============================================

-- Recent sensor readings with IAQ categories
CREATE OR REPLACE VIEW v_recent_readings AS
SELECT 
  id, device_id,
  gas_resistance / 1000.0 AS gas_resistance_kohm,
  temperature, humidity, pressure,
  iaq_score,
  CASE 
    WHEN iaq_score <= 50 THEN 'Excellent'
    WHEN iaq_score <= 100 THEN 'Good'
    WHEN iaq_score <= 150 THEN 'Moderate'
    WHEN iaq_score <= 200 THEN 'Poor'
    ELSE 'Unhealthy'
  END AS iaq_category,
  co2_equivalent, voc_equivalent,
  mode, created_at
FROM sensor_readings
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- Smell library with statistics
CREATE OR REPLACE VIEW v_smell_library AS
SELECT 
  sp.id, sp.name, sp.category, sp.subcategory,
  sp.confidence, sp.sample_count, sp.tags,
  sp.baseline_gas / 1000.0 AS baseline_gas_kohm,
  sp.created_at, sp.last_matched_at,
  COUNT(sc.id) AS total_captures,
  MAX(sc.created_at) AS last_capture_at
FROM smell_profiles sp
LEFT JOIN smell_captures sc ON sc.profile_id = sp.id
GROUP BY sp.id
ORDER BY sp.created_at DESC;

-- ============================================
-- PART 6: ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on sensitive tables
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read their data
CREATE POLICY "Users can read own financial transactions"
ON financial_transactions FOR SELECT
USING (auth.uid()::text = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert financial transactions"
ON financial_transactions FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

-- Policy: Public read for system settings
CREATE POLICY "Public read for public settings"
ON system_settings FOR SELECT
USING (is_public = true);

-- Policy: Authenticated users can read private settings
CREATE POLICY "Authenticated users read all settings"
ON system_settings FOR SELECT
USING (auth.role() = 'authenticated');

-- ============================================
-- VERIFICATION
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ ARC Project Database Schema v2.0.0 created successfully!';
  RAISE NOTICE '📊 BioSentinel Tables: 3 (sensor_readings, smell_profiles, smell_captures)';
  RAISE NOTICE '🏢 ARC Sector Tables: 8 (finance, security, legal, reports, settings)';
  RAISE NOTICE '📈 Views: 2 analytics views';
  RAISE NOTICE '⚡ Functions: 2 triggers with automation';
  RAISE NOTICE '🔒 RLS Policies: Enabled on sensitive tables';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Database ready for production!';
  RAISE NOTICE '📝 Next step: Update DATABASE_URL in your environment variables';
END $$;

-- ============================================
-- END OF SCHEMA - READY TO COPY TO SUPABASE
-- ============================================
