CREATE TABLE IF NOT EXISTS agent_memory(
  agent_id TEXT,
  key TEXT,
  value TEXT,
  updated INTEGER,
  PRIMARY KEY(agent_id, key)
);
