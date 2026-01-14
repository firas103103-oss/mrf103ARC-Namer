-- 1. جدول الشذوذات (Anomalies)
CREATE TABLE anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT NOT NULL,
  type TEXT NOT NULL, -- 'performance_drop', 'pattern_change', etc
  severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
  description TEXT,
  detected_at TIMESTAMP DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 2. جدول السيناريوهات (Mission Scenarios)
CREATE TABLE mission_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'Intelligence',
  risk_level INTEGER DEFAULT 50,
  objectives TEXT[] DEFAULT '{}',
  assigned_agents TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. جدول المهام (Team Tasks)
CREATE TABLE team_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  assigned_agent TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  tags TEXT[] DEFAULT '{}',
  due_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- 4. جدول أداء العملاء (Agent Performance)
CREATE TABLE agent_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  value NUMERIC NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 5. الفهارس لتحسين الأداء
CREATE INDEX idx_anomalies_agent ON anomalies(agent_id);
CREATE INDEX idx_anomalies_detected ON anomalies(detected_at DESC);
CREATE INDEX idx_tasks_status ON team_tasks(status);
CREATE INDEX idx_performance_agent ON agent_performance(agent_id, timestamp DESC);