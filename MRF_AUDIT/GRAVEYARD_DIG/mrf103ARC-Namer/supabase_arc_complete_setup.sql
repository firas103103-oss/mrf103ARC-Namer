-- ═══════════════════════════════════════════════════════════════
-- ARC COMPLETE DATABASE SCHEMA
-- ═══════════════════════════════════════════════════════════════
-- نظام قاعدة بيانات متكامل للأرشفة والصلاحيات والمهام
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- 1. ARCHIVE SYSTEM TABLES
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS arc_archives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    archive_name VARCHAR(255) NOT NULL,
    archive_type VARCHAR(50) NOT NULL, -- logs, reports, agent_data, system_backup, full_snapshot
    file_path TEXT NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    compression_ratio NUMERIC,
    encrypted VARCHAR(10) DEFAULT 'false' NOT NULL,
    encryption_key_id VARCHAR(50),
    source_agent VARCHAR(100),
    retention_days INTEGER DEFAULT 90,
    access_level VARCHAR(50) DEFAULT 'internal', -- public, internal, confidential, restricted
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP
);

CREATE INDEX idx_arc_archives_type ON arc_archives(archive_type);
CREATE INDEX idx_arc_archives_agent ON arc_archives(source_agent);
CREATE INDEX idx_arc_archives_expires ON arc_archives(expires_at);

-- ═══════════════════════════════════════════════════════════════
-- 2. ENCRYPTION KEYS TABLE
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS archive_encryption_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_id VARCHAR(50) NOT NULL UNIQUE,
    encrypted_key TEXT NOT NULL,
    algorithm VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    last_used_at TIMESTAMP
);

CREATE INDEX idx_encryption_keys_key_id ON archive_encryption_keys(key_id);

-- ═══════════════════════════════════════════════════════════════
-- 3. ACCESS CONTROL TABLE
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS arc_access_control (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL, -- archive, agent_data, system_logs
    resource_id VARCHAR(100) NOT NULL,
    permissions TEXT[] NOT NULL, -- read, write, delete, share
    granted_by VARCHAR(100) NOT NULL,
    granted_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP
);

CREATE INDEX idx_access_control_agent ON arc_access_control(agent_id);
CREATE INDEX idx_access_control_resource ON arc_access_control(resource_type, resource_id);

-- ═══════════════════════════════════════════════════════════════
-- 4. AGENT TASKS TABLE
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS agent_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id VARCHAR(100) NOT NULL,
    task_type VARCHAR(50) NOT NULL, -- analysis, research, communication, monitoring, execution
    title TEXT NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
    status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed, failed, blocked
    progress INTEGER DEFAULT 0, -- 0-100%
    assigned_by VARCHAR(100),
    dependencies TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    estimated_duration_ms INTEGER,
    actual_duration_ms INTEGER,
    input JSONB DEFAULT '{}',
    output JSONB DEFAULT '{}',
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    created_at TIMESTAMP DEFAULT NOW(),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    due_date TIMESTAMP
);

CREATE INDEX idx_agent_tasks_agent ON agent_tasks(agent_id);
CREATE INDEX idx_agent_tasks_status ON agent_tasks(status);
CREATE INDEX idx_agent_tasks_priority ON agent_tasks(priority);
CREATE INDEX idx_agent_tasks_created ON agent_tasks(created_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- 5. AGENT LEARNING TABLE
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS agent_learning (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id VARCHAR(100) NOT NULL,
    learning_type VARCHAR(50) NOT NULL, -- pattern_recognition, performance_optimization, user_preference, error_correction
    context TEXT,
    input_data JSONB DEFAULT '{}',
    analysis JSONB DEFAULT '{}',
    insights TEXT[] DEFAULT '{}',
    confidence INTEGER DEFAULT 50, -- 0-100%
    applied VARCHAR(10) DEFAULT 'false',
    applied_at TIMESTAMP,
    validated_by VARCHAR(100),
    validated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_agent_learning_agent ON agent_learning(agent_id);
CREATE INDEX idx_agent_learning_type ON agent_learning(learning_type);
CREATE INDEX idx_agent_learning_applied ON agent_learning(applied);

-- ═══════════════════════════════════════════════════════════════
-- 6. AGENT PERFORMANCE TABLE
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS agent_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id VARCHAR(100) NOT NULL,
    metric_type VARCHAR(50) NOT NULL, -- response_time, success_rate, task_completion, quality_score
    value NUMERIC NOT NULL,
    unit VARCHAR(50),
    context JSONB DEFAULT '{}',
    period_start TIMESTAMP,
    period_end TIMESTAMP,
    recorded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_agent_performance_agent ON agent_performance(agent_id);
CREATE INDEX idx_agent_performance_type ON agent_performance(metric_type);
CREATE INDEX idx_agent_performance_recorded ON agent_performance(recorded_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- 7. INTEGRATION LOGS TABLE
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS integration_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_name VARCHAR(100) NOT NULL, -- n8n, elevenlabs, openai, anthropic, gemini
    event_type VARCHAR(50) NOT NULL, -- webhook_sent, webhook_received, api_call, tts_generated
    direction VARCHAR(20) NOT NULL, -- inbound, outbound
    request_payload JSONB DEFAULT '{}',
    response_payload JSONB DEFAULT '{}',
    status_code INTEGER,
    success VARCHAR(10) DEFAULT 'true',
    error_message TEXT,
    latency_ms INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_integration_logs_name ON integration_logs(integration_name);
CREATE INDEX idx_integration_logs_type ON integration_logs(event_type);
CREATE INDEX idx_integration_logs_created ON integration_logs(created_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ═══════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE arc_archives ENABLE ROW LEVEL SECURITY;
ALTER TABLE archive_encryption_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE arc_access_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_learning ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_logs ENABLE ROW LEVEL SECURITY;

-- Service role has full access
CREATE POLICY "Service role full access on arc_archives" ON arc_archives FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on archive_encryption_keys" ON archive_encryption_keys FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on arc_access_control" ON arc_access_control FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on agent_tasks" ON agent_tasks FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on agent_learning" ON agent_learning FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on agent_performance" ON agent_performance FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on integration_logs" ON integration_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════
-- 9. HELPER FUNCTIONS
-- ═══════════════════════════════════════════════════════════════

-- Function to cleanup expired archives
CREATE OR REPLACE FUNCTION cleanup_expired_archives()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM arc_archives
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate agent success rate
CREATE OR REPLACE FUNCTION get_agent_success_rate(p_agent_id VARCHAR)
RETURNS NUMERIC AS $$
DECLARE
    total_tasks INTEGER;
    completed_tasks INTEGER;
    success_rate NUMERIC;
BEGIN
    SELECT COUNT(*) INTO total_tasks
    FROM agent_tasks
    WHERE agent_id = p_agent_id;
    
    SELECT COUNT(*) INTO completed_tasks
    FROM agent_tasks
    WHERE agent_id = p_agent_id AND status = 'completed';
    
    IF total_tasks > 0 THEN
        success_rate := (completed_tasks::NUMERIC / total_tasks::NUMERIC) * 100;
    ELSE
        success_rate := 0;
    END IF;
    
    RETURN ROUND(success_rate, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════
-- 10. TRIGGERS
-- ═══════════════════════════════════════════════════════════════

-- Auto-update encryption key last_used_at
CREATE OR REPLACE FUNCTION update_encryption_key_last_used()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE archive_encryption_keys
    SET last_used_at = NOW()
    WHERE key_id = NEW.encryption_key_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_encryption_key_last_used
AFTER INSERT ON arc_archives
FOR EACH ROW
WHEN (NEW.encryption_key_id IS NOT NULL)
EXECUTE FUNCTION update_encryption_key_last_used();

-- ═══════════════════════════════════════════════════════════════
-- SETUP COMPLETE
-- ═══════════════════════════════════════════════════════════════

-- Insert initial data
INSERT INTO arc_archives (archive_name, archive_type, file_path, file_size_bytes, source_agent, access_level, metadata)
VALUES 
    ('system_initialization', 'system_backup', '/archives/init.zip', 1024000, 'ARC-System', 'internal', '{"version": "v15.0-ARC2.0", "init_time": "2026-01-04"}')
ON CONFLICT DO NOTHING;

-- Verify setup
SELECT 
    'arc_archives' as table_name, COUNT(*) as row_count FROM arc_archives
UNION ALL
SELECT 'archive_encryption_keys', COUNT(*) FROM archive_encryption_keys
UNION ALL
SELECT 'arc_access_control', COUNT(*) FROM arc_access_control
UNION ALL
SELECT 'agent_tasks', COUNT(*) FROM agent_tasks
UNION ALL
SELECT 'agent_learning', COUNT(*) FROM agent_learning
UNION ALL
SELECT 'agent_performance', COUNT(*) FROM agent_performance
UNION ALL
SELECT 'integration_logs', COUNT(*) FROM integration_logs;
