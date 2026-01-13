-- ================================================
-- ARC 2.0 Database Schema
-- Complete schema for 31-agent hierarchy system
-- ================================================

-- Agent Experiences Table
-- Records all agent experiences for learning
CREATE TABLE IF NOT EXISTS agent_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id VARCHAR(50) NOT NULL,
  context TEXT NOT NULL,
  action TEXT NOT NULL,
  result VARCHAR(20) NOT NULL CHECK (result IN ('success', 'failure', 'partial')),
  metrics JSONB NOT NULL DEFAULT '{}',
  learnings TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for performance
  CONSTRAINT valid_result CHECK (result IN ('success', 'failure', 'partial'))
);

CREATE INDEX IF NOT EXISTS idx_agent_experiences_agent_id ON agent_experiences(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_experiences_result ON agent_experiences(result);
CREATE INDEX IF NOT EXISTS idx_agent_experiences_created_at ON agent_experiences(created_at DESC);

COMMENT ON TABLE agent_experiences IS 'Records all agent learning experiences';
COMMENT ON COLUMN agent_experiences.agent_id IS 'Agent identifier (e.g., mrf_ceo, cipher, aegis)';
COMMENT ON COLUMN agent_experiences.metrics IS 'Performance metrics as JSON (e.g., {"duration": 120, "quality": 95})';

-- Agent Skills Table
-- Tracks all skills acquired by agents
CREATE TABLE IF NOT EXISTS agent_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id VARCHAR(50) NOT NULL,
  skill_name VARCHAR(100) NOT NULL,
  skill_name_ar VARCHAR(100),
  category VARCHAR(50) NOT NULL,
  level INTEGER NOT NULL DEFAULT 50 CHECK (level >= 0 AND level <= 100),
  usage_count INTEGER DEFAULT 0 CHECK (usage_count >= 0),
  success_rate DECIMAL(5,2) DEFAULT 100.0 CHECK (success_rate >= 0 AND success_rate <= 100),
  acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint: one skill per agent
  UNIQUE(agent_id, skill_name)
);

CREATE INDEX IF NOT EXISTS idx_agent_skills_agent_id ON agent_skills(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_skills_category ON agent_skills(category);
CREATE INDEX IF NOT EXISTS idx_agent_skills_level ON agent_skills(level DESC);

COMMENT ON TABLE agent_skills IS 'Tracks all skills learned by agents';
COMMENT ON COLUMN agent_skills.level IS 'Skill proficiency level (0-100)';
COMMENT ON COLUMN agent_skills.usage_count IS 'Number of times skill has been used';
COMMENT ON COLUMN agent_skills.success_rate IS 'Percentage of successful skill applications';

-- Agent Reports Table
-- Stores all generated reports
CREATE TABLE IF NOT EXISTS agent_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type VARCHAR(20) NOT NULL CHECK (report_type IN ('daily', 'weekly', 'monthly', 'semi-annual', 'sector', 'executive')),
  agent_id VARCHAR(50),
  sector VARCHAR(20),
  data JSONB NOT NULL DEFAULT '{}',
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CHECK (
    (report_type IN ('daily', 'weekly', 'monthly', 'semi-annual') AND agent_id IS NOT NULL) OR
    (report_type = 'sector' AND sector IS NOT NULL) OR
    (report_type = 'executive')
  )
);

CREATE INDEX IF NOT EXISTS idx_agent_reports_type ON agent_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_agent_reports_agent_id ON agent_reports(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_reports_sector ON agent_reports(sector);
CREATE INDEX IF NOT EXISTS idx_agent_reports_generated_at ON agent_reports(generated_at DESC);

COMMENT ON TABLE agent_reports IS 'Stores all types of agent reports';
COMMENT ON COLUMN agent_reports.report_type IS 'Type: daily, weekly, monthly, semi-annual, sector, executive';
COMMENT ON COLUMN agent_reports.data IS 'Complete report data as JSON';

-- Learning Goals Table
-- Tracks agent learning goals and progress
CREATE TABLE IF NOT EXISTS learning_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id VARCHAR(50) NOT NULL,
  goal TEXT NOT NULL,
  target_date DATE NOT NULL,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  milestones JSONB NOT NULL DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CHECK (
    (status = 'completed' AND progress = 100) OR
    (status != 'completed')
  )
);

CREATE INDEX IF NOT EXISTS idx_learning_goals_agent_id ON learning_goals(agent_id);
CREATE INDEX IF NOT EXISTS idx_learning_goals_status ON learning_goals(status);
CREATE INDEX IF NOT EXISTS idx_learning_goals_target_date ON learning_goals(target_date);

COMMENT ON TABLE learning_goals IS 'Tracks agent learning goals and milestones';
COMMENT ON COLUMN learning_goals.milestones IS 'Array of milestone objects: [{"title": "...", "completed": false}]';

-- Agent Patterns Table
-- Stores recognized behavioral patterns
CREATE TABLE IF NOT EXISTS agent_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id VARCHAR(50) NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  frequency INTEGER DEFAULT 1 CHECK (frequency >= 1),
  confidence INTEGER DEFAULT 60 CHECK (confidence >= 0 AND confidence <= 100),
  examples JSONB NOT NULL DEFAULT '[]',
  first_detected TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique pattern per agent
  UNIQUE(agent_id, name)
);

CREATE INDEX IF NOT EXISTS idx_agent_patterns_agent_id ON agent_patterns(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_patterns_confidence ON agent_patterns(confidence DESC);
CREATE INDEX IF NOT EXISTS idx_agent_patterns_frequency ON agent_patterns(frequency DESC);

COMMENT ON TABLE agent_patterns IS 'Recognized behavioral patterns from agent experiences';
COMMENT ON COLUMN agent_patterns.frequency IS 'Number of times pattern was observed';
COMMENT ON COLUMN agent_patterns.confidence IS 'Confidence level in pattern recognition (0-100)';
COMMENT ON COLUMN agent_patterns.examples IS 'Array of experience IDs where pattern was observed';

-- Agent Chat Messages Table
-- Stores all chat history between users and agents
CREATE TABLE IF NOT EXISTS agent_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id VARCHAR(50) NOT NULL,
  user_id VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  is_agent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_chat_agent_id ON agent_chat_messages(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_chat_user_id ON agent_chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_chat_created_at ON agent_chat_messages(created_at DESC);

COMMENT ON TABLE agent_chat_messages IS 'Complete chat history between users and agents';

-- Agent Status Table
-- Real-time status tracking for all agents
CREATE TABLE IF NOT EXISTS agent_status (
  agent_id VARCHAR(50) PRIMARY KEY,
  status VARCHAR(20) NOT NULL DEFAULT 'idle' CHECK (status IN ('active', 'idle', 'busy', 'offline', 'learning')),
  current_task TEXT,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

COMMENT ON TABLE agent_status IS 'Real-time status tracking for all 31 agents';

-- Initialize all 31 agents with idle status
INSERT INTO agent_status (agent_id, status) VALUES
-- CEO
('mrf_ceo', 'active'),

-- Security Maestro & Team
('maestro_security', 'active'),
('aegis', 'idle'),
('phantom', 'idle'),
('watchtower', 'idle'),
('ghost', 'idle'),

-- Finance Maestro & Team
('maestro_finance', 'active'),
('ledger', 'idle'),
('treasury', 'idle'),
('venture', 'idle'),
('merchant', 'idle'),

-- Legal Maestro & Team
('maestro_legal', 'active'),
('archive', 'idle'),
('contract', 'idle'),
('compliance', 'idle'),
('patent', 'idle'),

-- Life Maestro & Team
('maestro_life', 'active'),
('wellness', 'idle'),
('social', 'idle'),
('routine', 'idle'),
('growth', 'idle'),

-- R&D Maestro & Team
('maestro_rnd', 'active'),
('lab', 'idle'),
('forge', 'idle'),
('spark', 'idle'),
('darwin', 'idle'),

-- xBio Maestro & Team
('maestro_xbio', 'active'),
('olfactory', 'idle'),
('instinct', 'idle'),
('environ', 'idle'),
('sensor', 'idle')
ON CONFLICT (agent_id) DO NOTHING;

-- ================================================
-- Row Level Security (RLS) Policies
-- ================================================

-- Enable RLS on all tables
ALTER TABLE agent_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_status ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all data
CREATE POLICY "Allow authenticated read access" ON agent_experiences FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON agent_skills FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON agent_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON learning_goals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON agent_patterns FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON agent_chat_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access" ON agent_status FOR SELECT TO authenticated USING (true);

-- Allow service_role to do everything (for backend API)
CREATE POLICY "Allow service_role full access" ON agent_experiences FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service_role full access" ON agent_skills FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service_role full access" ON agent_reports FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service_role full access" ON learning_goals FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service_role full access" ON agent_patterns FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service_role full access" ON agent_chat_messages FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service_role full access" ON agent_status FOR ALL TO service_role USING (true);

-- ================================================
-- Useful Functions
-- ================================================

-- Function to update agent last activity
CREATE OR REPLACE FUNCTION update_agent_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE agent_status 
  SET last_activity = NOW() 
  WHERE agent_id = NEW.agent_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on experiences to update agent activity
CREATE TRIGGER trigger_update_agent_activity_on_experience
AFTER INSERT ON agent_experiences
FOR EACH ROW
EXECUTE FUNCTION update_agent_activity();

-- Function to calculate agent experience count
CREATE OR REPLACE FUNCTION get_agent_experience_count(p_agent_id VARCHAR)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM agent_experiences WHERE agent_id = p_agent_id);
END;
$$ LANGUAGE plpgsql;

-- Function to get agent success rate
CREATE OR REPLACE FUNCTION get_agent_success_rate(p_agent_id VARCHAR)
RETURNS DECIMAL AS $$
BEGIN
  RETURN (
    SELECT 
      CASE 
        WHEN COUNT(*) = 0 THEN 0
        ELSE ROUND((COUNT(*) FILTER (WHERE result = 'success')::DECIMAL / COUNT(*)) * 100, 2)
      END
    FROM agent_experiences 
    WHERE agent_id = p_agent_id
  );
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- Verification Queries
-- ================================================

-- Check all tables exist
SELECT 
  table_name, 
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name LIKE 'agent_%' OR table_name LIKE 'learning_%'
ORDER BY table_name;

-- Check all 31 agents initialized
SELECT agent_id, status, last_activity 
FROM agent_status 
ORDER BY agent_id;

-- ================================================
-- END OF SCHEMA
-- ================================================

-- Summary
DO $$
BEGIN
  RAISE NOTICE '✅ ARC 2.0 Database Schema Created Successfully!';
  RAISE NOTICE '📊 Tables: 7 created';
  RAISE NOTICE '👥 Agents: 31 initialized';
  RAISE NOTICE '🔒 RLS: Enabled on all tables';
  RAISE NOTICE '⚡ Functions: 3 utility functions';
  RAISE NOTICE '🎯 Triggers: 1 activity tracker';
END $$;
