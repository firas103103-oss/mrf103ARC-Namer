-- Migration: Add Sector Tables (Finance, Security, Legal, Reports, Settings)
-- Date: 2026-01-14
-- Purpose: Phase 3 Database Integration

-- ============================================
-- FINANCE SECTOR TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS financial_transactions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL,
  category VARCHAR(100),
  amount NUMERIC(15, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  description TEXT,
  status VARCHAR(50) DEFAULT 'completed',
  metadata JSONB DEFAULT '{}',
  user_id VARCHAR REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transactions_type ON financial_transactions(type);
CREATE INDEX idx_transactions_created ON financial_transactions(created_at);
CREATE INDEX idx_transactions_user ON financial_transactions(user_id);

CREATE TABLE IF NOT EXISTS budgets (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- ============================================
-- SECURITY SECTOR TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS security_events (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
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
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- ============================================
-- LEGAL SECTOR TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS legal_documents (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
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
  created_by VARCHAR REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_legal_docs_type ON legal_documents(document_type);
CREATE INDEX idx_legal_docs_status ON legal_documents(status);
CREATE INDEX idx_legal_docs_created ON legal_documents(created_at);

CREATE TABLE IF NOT EXISTS compliance_checks (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  check_type VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  score INTEGER,
  findings JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  checked_at TIMESTAMP DEFAULT NOW(),
  next_check_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- REPORTS TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS reports (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- ============================================
-- SETTINGS TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS system_settings (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(100) NOT NULL,
  key VARCHAR(100) NOT NULL,
  value JSONB NOT NULL,
  value_type VARCHAR(50) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  is_editable BOOLEAN DEFAULT true,
  tenant_id VARCHAR REFERENCES tenants(id),
  updated_by VARCHAR REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- SEED DATA (Sample Transactions)
-- ============================================

INSERT INTO financial_transactions (type, category, amount, description, status)
VALUES 
  ('income', 'revenue', 45000.00, 'Client Project Payment - Q1 2026', 'completed'),
  ('expense', 'equipment', -1200.00, 'MacBook Pro M3 for Development Team', 'completed'),
  ('expense', 'software', -299.00, 'GitHub Enterprise Subscription', 'completed'),
  ('income', 'investment', 25000.00, 'Angel Investment Round', 'completed'),
  ('expense', 'marketing', -850.00, 'Google Ads Campaign', 'completed');

-- Seed Security Events
INSERT INTO security_events (event_type, severity, source, description)
VALUES
  ('login_attempt', 'medium', '192.168.1.100', 'Failed login attempt detected'),
  ('firewall_block', 'low', '203.0.113.42', 'Blocked suspicious IP from accessing API'),
  ('threat_detected', 'high', 'internal_scanner', 'Potential SQL injection attempt detected');

-- Seed Legal Documents
INSERT INTO legal_documents (title, document_type, status, version)
VALUES
  ('Employee Handbook 2026', 'policy', 'active', '2.0'),
  ('Vendor Agreement - AWS', 'contract', 'active', '1.0'),
  ('Patent Application - AI System', 'patent', 'review', '1.0');

-- Seed System Settings
INSERT INTO system_settings (category, key, value, value_type, description)
VALUES
  ('general', 'dark_mode', 'true', 'boolean', 'Enable dark mode by default'),
  ('notifications', 'email_enabled', 'true', 'boolean', 'Enable email notifications'),
  ('security', 'session_timeout', '3600', 'number', 'Session timeout in seconds');
