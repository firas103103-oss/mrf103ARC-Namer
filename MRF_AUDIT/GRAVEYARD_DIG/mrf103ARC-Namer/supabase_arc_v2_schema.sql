-- ═══════════════════════════════════════════════════════════════════════════════
-- 🏗️ ARC Complete Database Schema - مخطط قاعدة البيانات الكامل
-- Version: 2.0.0
-- يتضمن جداول النظام متعدد الطبقات، IoT، والتكاملات
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- 🤖 Agent System Tables - جداول نظام الوكلاء
-- ═══════════════════════════════════════════════════════════════════════════════

-- جدول تعريف الوكلاء
CREATE TABLE IF NOT EXISTS arc_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    layer VARCHAR(20) NOT NULL CHECK (layer IN ('executive', 'administrative', 'productive')),
    layer_level INTEGER NOT NULL CHECK (layer_level BETWEEN 1 AND 3),
    specialization VARCHAR(100) NOT NULL,
    model VARCHAR(50) NOT NULL DEFAULT 'gpt-4o-mini',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'suspended')),
    capabilities JSONB DEFAULT '[]',
    performance_score DECIMAL(5,2) DEFAULT 100.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول رسائل الطبقات
CREATE TABLE IF NOT EXISTS layer_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_layer VARCHAR(20) NOT NULL,
    to_layer VARCHAR(20) NOT NULL,
    from_agent_id VARCHAR(50),
    to_agent_id VARCHAR(50),
    message_type VARCHAR(50) NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent', 'critical')),
    content JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'processed', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- جدول مصفوفة الصلاحيات
CREATE TABLE IF NOT EXISTS permission_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id VARCHAR(50) UNIQUE NOT NULL,
    source_layer VARCHAR(20) NOT NULL,
    target_layer VARCHAR(20) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    allowed BOOLEAN DEFAULT true,
    conditions JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 🎯 Task Orchestration Tables - جداول تنسيق المهام
-- ═══════════════════════════════════════════════════════════════════════════════

-- جدول المهام
CREATE TABLE IF NOT EXISTS orchestrator_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id VARCHAR(50) UNIQUE NOT NULL,
    task_type VARCHAR(50) NOT NULL,
    priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'queued', 'assigned', 'in_progress', 'completed', 'failed', 'cancelled')),
    assigned_agent_id VARCHAR(50),
    payload JSONB NOT NULL,
    result JSONB,
    dependencies JSONB DEFAULT '[]',
    estimated_duration INTEGER, -- بالثواني
    actual_duration INTEGER,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT
);

-- جدول تقييم أداء الوكلاء
CREATE TABLE IF NOT EXISTS agent_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id VARCHAR(50) NOT NULL,
    task_id VARCHAR(50),
    evaluation_type VARCHAR(50) NOT NULL,
    score DECIMAL(5,2) NOT NULL,
    metrics JSONB NOT NULL,
    feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 🔄 Sync Engine Tables - جداول محرك المزامنة
-- ═══════════════════════════════════════════════════════════════════════════════

-- جدول حالات مزامنة الوكلاء
CREATE TABLE IF NOT EXISTS agent_sync_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id VARCHAR(50) NOT NULL,
    state_key VARCHAR(100) NOT NULL,
    state_value JSONB NOT NULL,
    version INTEGER DEFAULT 1,
    last_synced_at TIMESTAMPTZ DEFAULT NOW(),
    is_dirty BOOLEAN DEFAULT false,
    UNIQUE(agent_id, state_key)
);

-- جدول سجلات المزامنة
CREATE TABLE IF NOT EXISTS sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sync_id VARCHAR(50) NOT NULL,
    sync_type VARCHAR(20) NOT NULL,
    agents_involved JSONB NOT NULL,
    changes_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'completed',
    duration_ms INTEGER,
    conflicts JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 📁 Classification & Archival Tables - جداول التصنيف والأرشفة
-- ═══════════════════════════════════════════════════════════════════════════════

-- جدول سجلات التصنيف
CREATE TABLE IF NOT EXISTS classification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type VARCHAR(50) NOT NULL,
    content_id UUID NOT NULL,
    original_content TEXT,
    detected_category VARCHAR(100),
    confidence DECIMAL(5,4) NOT NULL,
    features JSONB,
    model_version VARCHAR(20) DEFAULT 'v1.0',
    processing_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول سياسات الأرشفة
CREATE TABLE IF NOT EXISTS archive_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    retention_days INTEGER NOT NULL,
    conditions JSONB DEFAULT '{}',
    compression BOOLEAN DEFAULT true,
    encryption BOOLEAN DEFAULT true,
    storage_class VARCHAR(20) DEFAULT 'cold',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول الأرشيفات
CREATE TABLE IF NOT EXISTS arc_archives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    archive_id VARCHAR(50) UNIQUE NOT NULL,
    policy_id VARCHAR(50) NOT NULL,
    original_table VARCHAR(100) NOT NULL,
    records_count INTEGER NOT NULL,
    storage_path TEXT NOT NULL,
    size_bytes BIGINT,
    compressed BOOLEAN DEFAULT false,
    encrypted BOOLEAN DEFAULT false,
    checksum VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 📡 IoT & xBio Sentinel Tables - جداول إنترنت الأشياء و xBio
-- ═══════════════════════════════════════════════════════════════════════════════

-- جدول الأجهزة IoT
CREATE TABLE IF NOT EXISTS iot_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR(100) UNIQUE NOT NULL,
    device_type VARCHAR(50) NOT NULL DEFAULT 'xbio-sentinel',
    mac_address VARCHAR(17),
    firmware_version VARCHAR(20),
    hardware_version VARCHAR(20),
    status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'error', 'maintenance')),
    last_seen_at TIMESTAMPTZ,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    owner_id UUID,
    location JSONB,
    config JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}'
);

-- جدول تدفق بيانات المستشعرات
CREATE TABLE IF NOT EXISTS sensor_data_stream (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR(100) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    temperature DECIMAL(5,2),
    humidity DECIMAL(5,2),
    pressure DECIMAL(7,2),
    gas_resistance DECIMAL(10,2),
    iaq INTEGER,
    iaq_accuracy INTEGER,
    co2_equivalent DECIMAL(7,2),
    voc_equivalent DECIMAL(7,4),
    altitude DECIMAL(7,2),
    raw_data JSONB,
    quality_score INTEGER DEFAULT 100
);

-- جدول إعدادات الأجهزة
CREATE TABLE IF NOT EXISTS device_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR(100) NOT NULL,
    config_key VARCHAR(100) NOT NULL,
    config_value JSONB NOT NULL,
    version INTEGER DEFAULT 1,
    applied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(device_id, config_key)
);

-- جدول تنبيهات الأجهزة
CREATE TABLE IF NOT EXISTS device_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR(100) NOT NULL,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    message TEXT NOT NULL,
    data JSONB,
    acknowledged BOOLEAN DEFAULT false,
    acknowledged_by UUID,
    acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول أوامر الأجهزة
CREATE TABLE IF NOT EXISTS device_commands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR(100) NOT NULL,
    command VARCHAR(100) NOT NULL,
    payload JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'acknowledged', 'completed', 'failed')),
    response JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 🔌 Integration Tables - جداول التكاملات
-- ═══════════════════════════════════════════════════════════════════════════════

-- جدول التكاملات
CREATE TABLE IF NOT EXISTS integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error', 'pending')),
    credentials JSONB NOT NULL DEFAULT '{}', -- مشفر
    config JSONB DEFAULT '{}',
    last_used_at TIMESTAMPTZ,
    last_error TEXT,
    usage_count INTEGER DEFAULT 0,
    owner_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول سجلات التكاملات
CREATE TABLE IF NOT EXISTS integration_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL,
    request JSONB,
    response JSONB,
    error TEXT,
    duration_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول webhooks
CREATE TABLE IF NOT EXISTS webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id VARCHAR(50) UNIQUE NOT NULL,
    integration_id VARCHAR(50),
    url TEXT NOT NULL,
    secret VARCHAR(100),
    events JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    last_triggered_at TIMESTAMPTZ,
    failure_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 📊 Analytics Tables - جداول التحليلات
-- ═══════════════════════════════════════════════════════════════════════════════

-- جدول مقاييس النظام
CREATE TABLE IF NOT EXISTS system_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    metric_unit VARCHAR(20),
    tags JSONB DEFAULT '{}',
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول أحداث التدقيق
CREATE TABLE IF NOT EXISTS audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    actor_type VARCHAR(20) NOT NULL, -- 'user', 'agent', 'system'
    actor_id VARCHAR(100),
    resource_type VARCHAR(100),
    resource_id VARCHAR(100),
    action VARCHAR(100) NOT NULL,
    old_value JSONB,
    new_value JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 🔐 Indexes for Performance - فهارس الأداء
-- ═══════════════════════════════════════════════════════════════════════════════

-- Agent indexes
CREATE INDEX IF NOT EXISTS idx_arc_agents_layer ON arc_agents(layer);
CREATE INDEX IF NOT EXISTS idx_arc_agents_status ON arc_agents(status);
CREATE INDEX IF NOT EXISTS idx_layer_messages_from_to ON layer_messages(from_layer, to_layer);
CREATE INDEX IF NOT EXISTS idx_layer_messages_status ON layer_messages(status);

-- Task indexes
CREATE INDEX IF NOT EXISTS idx_orchestrator_tasks_status ON orchestrator_tasks(status);
CREATE INDEX IF NOT EXISTS idx_orchestrator_tasks_agent ON orchestrator_tasks(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_orchestrator_tasks_priority ON orchestrator_tasks(priority DESC, created_at ASC);

-- Sync indexes
CREATE INDEX IF NOT EXISTS idx_agent_sync_states_agent ON agent_sync_states(agent_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_created ON sync_logs(created_at DESC);

-- IoT indexes
CREATE INDEX IF NOT EXISTS idx_sensor_data_device ON sensor_data_stream(device_id);
CREATE INDEX IF NOT EXISTS idx_sensor_data_timestamp ON sensor_data_stream(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_iot_devices_status ON iot_devices(status);
CREATE INDEX IF NOT EXISTS idx_device_alerts_device ON device_alerts(device_id);
CREATE INDEX IF NOT EXISTS idx_device_alerts_unack ON device_alerts(acknowledged) WHERE acknowledged = false;

-- Integration indexes
CREATE INDEX IF NOT EXISTS idx_integrations_type ON integrations(type);
CREATE INDEX IF NOT EXISTS idx_integrations_status ON integrations(status);
CREATE INDEX IF NOT EXISTS idx_integration_logs_integration ON integration_logs(integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_logs_created ON integration_logs(created_at DESC);

-- Audit indexes
CREATE INDEX IF NOT EXISTS idx_audit_events_type ON audit_events(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_events_actor ON audit_events(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_created ON audit_events(created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 🔒 Row Level Security Policies - سياسات أمان الصفوف
-- ═══════════════════════════════════════════════════════════════════════════════

-- تفعيل RLS على الجداول الحساسة
ALTER TABLE iot_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_data_stream ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_alerts ENABLE ROW LEVEL SECURITY;

-- سياسة الأجهزة - المالك فقط يمكنه الوصول
CREATE POLICY device_owner_policy ON iot_devices
    FOR ALL USING (owner_id = auth.uid() OR owner_id IS NULL);

-- سياسة بيانات المستشعرات
CREATE POLICY sensor_data_policy ON sensor_data_stream
    FOR SELECT USING (
        device_id IN (
            SELECT device_id FROM iot_devices 
            WHERE owner_id = auth.uid() OR owner_id IS NULL
        )
    );

-- سياسة التكاملات
CREATE POLICY integration_owner_policy ON integrations
    FOR ALL USING (owner_id = auth.uid() OR owner_id IS NULL);

-- سياسة التنبيهات
CREATE POLICY alert_owner_policy ON device_alerts
    FOR ALL USING (
        device_id IN (
            SELECT device_id FROM iot_devices 
            WHERE owner_id = auth.uid() OR owner_id IS NULL
        )
    );

-- ═══════════════════════════════════════════════════════════════════════════════
-- ⚡ Triggers - المحفزات
-- ═══════════════════════════════════════════════════════════════════════════════

-- دالة تحديث updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- محفزات تحديث التوقيت
CREATE TRIGGER update_arc_agents_updated_at
    BEFORE UPDATE ON arc_agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_archive_policies_updated_at
    BEFORE UPDATE ON archive_policies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at
    BEFORE UPDATE ON integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- دالة تسجيل أحداث التدقيق
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_events (
        event_type,
        actor_type,
        resource_type,
        resource_id,
        action,
        old_value,
        new_value
    ) VALUES (
        TG_TABLE_NAME || '_' || TG_OP,
        'system',
        TG_TABLE_NAME,
        COALESCE(NEW.id::text, OLD.id::text),
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- ═══════════════════════════════════════════════════════════════════════════════
-- 📦 Initial Data - البيانات الأولية
-- ═══════════════════════════════════════════════════════════════════════════════

-- إدراج الوكلاء الـ 16
INSERT INTO arc_agents (agent_id, name, name_ar, layer, layer_level, specialization, model, capabilities) VALUES
-- Executive Layer (3 agents)
('arc_master', 'ARC Master', 'القائد الأعلى', 'executive', 1, 'Strategic Planning & Oversight', 'gpt-4o', '["strategic_planning", "system_oversight", "policy_enforcement"]'),
('arc_strategist', 'Strategic Planner', 'المخطط الاستراتيجي', 'executive', 1, 'Long-term Planning', 'gpt-4o', '["long_term_planning", "goal_setting", "resource_allocation"]'),
('arc_guardian', 'Security Guardian', 'حارس الأمان', 'executive', 1, 'Security & Compliance', 'gpt-4o', '["security_audit", "compliance_check", "threat_detection"]'),

-- Administrative Layer (5 agents)
('arc_coordinator', 'Task Coordinator', 'منسق المهام', 'administrative', 2, 'Task Distribution', 'gpt-4o-mini', '["task_assignment", "load_balancing", "priority_management"]'),
('arc_monitor', 'Performance Monitor', 'مراقب الأداء', 'administrative', 2, 'System Monitoring', 'gpt-4o-mini', '["performance_tracking", "anomaly_detection", "reporting"]'),
('arc_quality', 'Quality Controller', 'مراقب الجودة', 'administrative', 2, 'Quality Assurance', 'gpt-4o-mini', '["quality_check", "validation", "feedback_collection"]'),
('arc_scheduler', 'Schedule Manager', 'مدير الجدولة', 'administrative', 2, 'Scheduling', 'gpt-4o-mini', '["scheduling", "deadline_management", "calendar_sync"]'),
('arc_communicator', 'Communication Hub', 'مركز الاتصالات', 'administrative', 2, 'Inter-layer Communication', 'gpt-4o-mini', '["message_routing", "notification", "escalation"]'),

-- Productive Layer (8 agents)
('arc_analyst', 'Data Analyst', 'محلل البيانات', 'productive', 3, 'Data Analysis', 'gpt-4o-mini', '["data_analysis", "pattern_recognition", "insights_generation"]'),
('arc_coder', 'Code Generator', 'مولد الكود', 'productive', 3, 'Code Generation', 'gpt-4o-mini', '["code_generation", "code_review", "refactoring"]'),
('arc_writer', 'Content Writer', 'كاتب المحتوى', 'productive', 3, 'Content Creation', 'gpt-4o-mini', '["content_writing", "translation", "summarization"]'),
('arc_researcher', 'Knowledge Researcher', 'الباحث المعرفي', 'productive', 3, 'Research & Knowledge', 'gpt-4o-mini', '["research", "knowledge_retrieval", "fact_checking"]'),
('arc_iot_handler', 'IoT Handler', 'معالج IoT', 'productive', 3, 'IoT Data Processing', 'gpt-4o-mini', '["sensor_processing", "device_management", "alert_handling"]'),
('arc_integrator', 'Integration Specialist', 'أخصائي التكامل', 'productive', 3, 'External Integrations', 'gpt-4o-mini', '["api_integration", "data_sync", "webhook_management"]'),
('arc_classifier', 'Content Classifier', 'مصنف المحتوى', 'productive', 3, 'Classification', 'gpt-4o-mini', '["text_classification", "sentiment_analysis", "entity_extraction"]'),
('arc_archivist', 'Data Archivist', 'أمين الأرشيف', 'productive', 3, 'Data Archival', 'gpt-4o-mini', '["data_archival", "backup_management", "data_lifecycle"]')
ON CONFLICT (agent_id) DO NOTHING;

-- إدراج سياسات الأرشفة الافتراضية
INSERT INTO archive_policies (policy_id, name, target_type, retention_days, conditions, compression, encryption) VALUES
('policy_logs', 'System Logs Archive', 'logs', 30, '{"severity": ["info", "debug"]}', true, false),
('policy_tasks', 'Completed Tasks Archive', 'tasks', 90, '{"status": "completed"}', true, true),
('policy_conversations', 'Old Conversations Archive', 'conversations', 180, '{}', true, true),
('policy_sensor_data', 'Sensor Data Archive', 'sensor_data', 365, '{}', true, false),
('policy_agent_events', 'Agent Events Archive', 'agent_events', 60, '{}', true, false)
ON CONFLICT (policy_id) DO NOTHING;

-- إدراج قواعد الصلاحيات
INSERT INTO permission_rules (rule_id, source_layer, target_layer, action, resource, allowed) VALUES
('exec_to_admin_command', 'executive', 'administrative', 'command', '*', true),
('exec_to_prod_command', 'executive', 'productive', 'command', '*', true),
('admin_to_prod_assign', 'administrative', 'productive', 'assign_task', '*', true),
('admin_to_exec_report', 'administrative', 'executive', 'report', '*', true),
('prod_to_admin_update', 'productive', 'administrative', 'status_update', '*', true),
('prod_to_exec_escalate', 'productive', 'executive', 'escalate', 'critical_issues', true),
('prod_to_prod_collaborate', 'productive', 'productive', 'collaborate', '*', true)
ON CONFLICT (rule_id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- ✅ Schema Complete
-- ═══════════════════════════════════════════════════════════════════════════════

-- إنشاء دالة للتحقق من صحة المخطط
CREATE OR REPLACE FUNCTION verify_arc_schema()
RETURNS TABLE(table_name text, row_count bigint) AS $$
DECLARE
    tbl text;
    cnt bigint;
BEGIN
    FOR tbl IN 
        SELECT t.table_name::text 
        FROM information_schema.tables t
        WHERE t.table_schema = 'public' 
        AND t.table_name LIKE 'arc_%' OR t.table_name IN (
            'iot_devices', 'sensor_data_stream', 'device_configs', 
            'device_alerts', 'device_commands', 'integrations',
            'integration_logs', 'webhooks', 'system_metrics', 
            'audit_events', 'layer_messages', 'permission_rules',
            'orchestrator_tasks', 'agent_evaluations', 'agent_sync_states',
            'sync_logs', 'classification_logs', 'archive_policies'
        )
    LOOP
        EXECUTE format('SELECT count(*) FROM %I', tbl) INTO cnt;
        table_name := tbl;
        row_count := cnt;
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- عرض ملخص المخطط
SELECT 'ARC Database Schema v2.0.0 - Installation Complete!' as message;
SELECT * FROM verify_arc_schema();
