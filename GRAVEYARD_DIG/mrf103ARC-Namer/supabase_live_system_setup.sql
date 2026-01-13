-- ==========================================
-- Live System Setup: Create Missing Tables
-- ==========================================
-- Execute this SQL in your Supabase SQL Editor

-- 1. Anomalies Table - Track system anomalies and performance issues
CREATE TABLE IF NOT EXISTS anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('performance_drop', 'pattern_change', 'error_spike', 'latency_increase', 'unusual_activity')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT,
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Mission Scenarios Table - Store strategic scenarios
CREATE TABLE IF NOT EXISTS mission_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'Intelligence' CHECK (category IN ('Intelligence', 'Operations', 'Security', 'Research', 'Training')),
  risk_level INTEGER DEFAULT 50 CHECK (risk_level >= 0 AND risk_level <= 100),
  objectives TEXT[] DEFAULT '{}',
  assigned_agents TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 3. Team Tasks Table - Task management
CREATE TABLE IF NOT EXISTS team_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  assigned_agent TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  tags TEXT[] DEFAULT '{}',
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  estimated_duration INTEGER, -- in minutes
  actual_duration INTEGER -- in minutes
);

-- 4. Agent Performance Metrics Table
CREATE TABLE IF NOT EXISTS agent_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT, -- 'ms', '%', 'count', etc
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 5. Agent Interactions Table (if not exists)
CREATE TABLE IF NOT EXISTS agent_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT NOT NULL,
  interaction_type TEXT, -- 'chat', 'command', 'api_call'
  success BOOLEAN DEFAULT TRUE,
  duration_ms INTEGER,
  input_text TEXT,
  output_text TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ==========================================
-- Indexes for Performance Optimization
-- ==========================================

-- Anomalies indexes
CREATE INDEX IF NOT EXISTS idx_anomalies_agent ON anomalies(agent_id);
CREATE INDEX IF NOT EXISTS idx_anomalies_detected ON anomalies(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_anomalies_severity ON anomalies(severity) WHERE NOT resolved;
CREATE INDEX IF NOT EXISTS idx_anomalies_type ON anomalies(type);

-- Mission scenarios indexes
CREATE INDEX IF NOT EXISTS idx_scenarios_status ON mission_scenarios(status);
CREATE INDEX IF NOT EXISTS idx_scenarios_created ON mission_scenarios(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scenarios_priority ON mission_scenarios(priority);

-- Team tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_status ON team_tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_agent ON team_tasks(assigned_agent);
CREATE INDEX IF NOT EXISTS idx_tasks_created ON team_tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON team_tasks(due_date);

-- Agent performance indexes
CREATE INDEX IF NOT EXISTS idx_performance_agent ON agent_performance(agent_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_performance_metric ON agent_performance(metric_name, timestamp DESC);

-- Agent interactions indexes
CREATE INDEX IF NOT EXISTS idx_interactions_agent ON agent_interactions(agent_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interactions_created ON agent_interactions(created_at DESC);

-- ==========================================
-- Row Level Security (RLS) - Optional
-- ==========================================

-- Enable RLS on tables (uncomment if needed)
-- ALTER TABLE anomalies ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE mission_scenarios ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE team_tasks ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE agent_performance ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (uncomment if needed)
-- CREATE POLICY "Allow authenticated users to read anomalies" 
--   ON anomalies FOR SELECT 
--   TO authenticated 
--   USING (true);

-- ==========================================
-- Triggers for updated_at
-- ==========================================

-- Update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
DROP TRIGGER IF EXISTS update_mission_scenarios_updated_at ON mission_scenarios;
CREATE TRIGGER update_mission_scenarios_updated_at
  BEFORE UPDATE ON mission_scenarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_team_tasks_updated_at ON team_tasks;
CREATE TRIGGER update_team_tasks_updated_at
  BEFORE UPDATE ON team_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- Sample Data for Testing (Optional)
-- ==========================================

-- Insert sample anomaly
INSERT INTO anomalies (agent_id, type, severity, description) 
VALUES ('mrf', 'performance_drop', 'medium', 'Response time increased by 40%')
ON CONFLICT DO NOTHING;

-- Insert sample scenario
INSERT INTO mission_scenarios (title, description, category, risk_level, objectives, assigned_agents)
VALUES (
  'Intelligence Gathering Mission',
  'Collect and analyze market intelligence data',
  'Intelligence',
  65,
  ARRAY['Identify key competitors', 'Analyze market trends', 'Generate strategic report'],
  ARRAY['l0-intel', 'researcher']
)
ON CONFLICT DO NOTHING;

-- Insert sample task
INSERT INTO team_tasks (title, description, assigned_agent, priority, status)
VALUES (
  'Complete quarterly report',
  'Compile Q1 performance metrics and insights',
  'l0-ops',
  'high',
  'in_progress'
)
ON CONFLICT DO NOTHING;

-- ==========================================
-- Success Message
-- ==========================================
DO $$
BEGIN
  RAISE NOTICE '✅ Live System Tables Created Successfully!';
  RAISE NOTICE '📊 Tables: anomalies, mission_scenarios, team_tasks, agent_performance, agent_interactions';
  RAISE NOTICE '🔍 Indexes: Created for optimal query performance';
  RAISE NOTICE '⏰ Triggers: Auto-update timestamps enabled';
  RAISE NOTICE '🎯 Next Steps: Execute the API endpoints code in server/routes.ts';
END $$;
