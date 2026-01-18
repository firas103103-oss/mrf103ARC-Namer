-- ============================================
-- X Bio Sentinel Database Schema
-- ============================================
-- Version: 1.0.0
-- Last Updated: 2026-01-06
-- Database: PostgreSQL 14+
-- ============================================

-- ============================================
-- TABLE 1: sensor_readings
-- ============================================
-- Purpose: Store all sensor readings from BME688 devices
-- Retention: Keep last 30 days, then archive
-- Frequency: ~1 reading per second per device
-- Expected rows: ~2.5M per device per month

CREATE TABLE IF NOT EXISTS sensor_readings (
  id SERIAL PRIMARY KEY,
  
  -- Device identification
  device_id VARCHAR(50) NOT NULL,
  
  -- BME688 Core Readings
  gas_resistance BIGINT,              -- Ohms (0 to 500,000)
  temperature REAL,                   -- Celsius (-40 to 85)
  humidity REAL,                      -- Percentage (0 to 100)
  pressure REAL,                      -- hPa (300 to 1100)
  
  -- BSEC Calculated Values
  iaq_score INTEGER,                  -- Indoor Air Quality (0-500)
  iaq_accuracy INTEGER,               -- Accuracy level (0-3)
  co2_equivalent INTEGER,             -- ppm
  voc_equivalent REAL,                -- ppm (parts per million)
  
  -- Heater Configuration
  heater_temperature INTEGER,         -- Celsius
  heater_duration INTEGER,            -- milliseconds
  
  -- Operation Mode
  mode VARCHAR(20) DEFAULT 'idle',    -- idle|monitoring|capturing|calibrating
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes for performance
  CONSTRAINT sensor_readings_device_id_idx_key UNIQUE (device_id, created_at)
);

-- Performance indexes
CREATE INDEX idx_sensor_readings_device_id ON sensor_readings(device_id);
CREATE INDEX idx_sensor_readings_created_at ON sensor_readings(created_at DESC);
CREATE INDEX idx_sensor_readings_device_time ON sensor_readings(device_id, created_at DESC);
CREATE INDEX idx_sensor_readings_iaq ON sensor_readings(iaq_score) WHERE iaq_score IS NOT NULL;

-- Comments
COMMENT ON TABLE sensor_readings IS 'Real-time sensor data from BME688 devices';
COMMENT ON COLUMN sensor_readings.gas_resistance IS 'Gas sensor resistance in Ohms - higher values indicate cleaner air';
COMMENT ON COLUMN sensor_readings.iaq_score IS 'Bosch BSEC IAQ score: 0-50 excellent, 51-100 good, 101-150 moderate, 151-200 poor, 201+ unhealthy';
COMMENT ON COLUMN sensor_readings.iaq_accuracy IS '0=stabilizing, 1=low, 2=medium, 3=high accuracy';


-- ============================================
-- TABLE 2: smell_profiles
-- ============================================
-- Purpose: Store learned smell "fingerprints" for pattern recognition
-- Retention: Permanent (user-created knowledge base)
-- Expected rows: ~100-1000 per user

CREATE TABLE IF NOT EXISTS smell_profiles (
  id SERIAL PRIMARY KEY,
  
  -- Profile Information
  name VARCHAR(100) NOT NULL,                    -- User-friendly name
  description TEXT,                              -- Optional detailed description
  
  -- Classification
  category VARCHAR(50),                          -- food, floral, chemical, etc.
  subcategory VARCHAR(50),                       -- coffee, lavender, gasoline, etc.
  label VARCHAR(100),                            -- Combined category/subcategory
  
  -- Feature Vector (ML)
  feature_vector REAL[],                         -- Statistical features (10 dimensions)
  embedding_vector REAL[],                       -- OpenAI embedding (1536 dimensions)
  embedding_text TEXT,                           -- Text used to generate embedding
  
  -- Confidence & Metadata
  confidence REAL,                               -- 0.0 to 1.0
  sample_count INTEGER DEFAULT 0,                -- Number of captures used
  last_matched_at TIMESTAMP,                     -- Last time this profile was matched
  
  -- Statistical Baselines
  baseline_gas BIGINT,                           -- Typical gas resistance
  peak_gas BIGINT,                               -- Peak gas resistance value
  avg_temperature REAL,                          -- Average temperature
  avg_humidity REAL,                             -- Average humidity
  
  -- Tags & Search
  tags TEXT[],                                   -- User-defined tags
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CONSTRAINT smell_profiles_name_unique UNIQUE (name)
);

-- Performance indexes
CREATE INDEX idx_smell_profiles_category ON smell_profiles(category);
CREATE INDEX idx_smell_profiles_label ON smell_profiles(label);
CREATE INDEX idx_smell_profiles_tags ON smell_profiles USING GIN(tags);
CREATE INDEX idx_smell_profiles_created_at ON smell_profiles(created_at DESC);

-- Full-text search
CREATE INDEX idx_smell_profiles_search ON smell_profiles USING GIN(
  to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(array_to_string(tags, ' '), ''))
);

-- Comments
COMMENT ON TABLE smell_profiles IS 'Learned smell patterns for recognition and classification';
COMMENT ON COLUMN smell_profiles.feature_vector IS 'Statistical features: avg, stddev, min, max for gas, temp, humidity';
COMMENT ON COLUMN smell_profiles.embedding_vector IS 'OpenAI text-embedding-3-small vector for semantic search';
COMMENT ON COLUMN smell_profiles.confidence IS 'Overall confidence in this profile (0-1), increases with more captures';


-- ============================================
-- TABLE 3: smell_captures
-- ============================================
-- Purpose: Store individual smell capture sessions
-- Retention: Keep for 90 days, then optional archive
-- Expected rows: ~10-50 per day per active user

CREATE TABLE IF NOT EXISTS smell_captures (
  id SERIAL PRIMARY KEY,
  
  -- References
  device_id VARCHAR(50) NOT NULL,
  profile_id INTEGER REFERENCES smell_profiles(id) ON DELETE SET NULL,
  
  -- Capture Session Info
  capture_id VARCHAR(100) UNIQUE NOT NULL,       -- Client-generated UUID
  duration_ms INTEGER NOT NULL,                  -- Capture duration in milliseconds
  samples_count INTEGER NOT NULL,                -- Number of readings collected
  
  -- Raw Data
  raw_data JSONB,                                -- All sensor readings as JSON array
  
  -- Extracted Features
  feature_vector REAL[],                         -- Statistical features
  
  -- Capture Status
  status VARCHAR(20) DEFAULT 'completed',        -- pending|completed|failed
  error_message TEXT,                            -- Error details if failed
  
  -- Recognition Results (if auto-matched)
  recognized_profile_id INTEGER REFERENCES smell_profiles(id) ON DELETE SET NULL,
  recognition_confidence REAL,                   -- 0.0 to 1.0
  
  -- Heater Settings Used
  heater_profile VARCHAR(50),                    -- low_power|balanced|high_sensitivity|rapid
  heater_temperature INTEGER,
  
  -- Environment Context
  room_temperature REAL,
  room_humidity REAL,
  
  -- Metadata
  notes TEXT,                                    -- User notes
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CHECK (samples_count > 0),
  CHECK (duration_ms > 0)
);

-- Performance indexes
CREATE INDEX idx_smell_captures_device_id ON smell_captures(device_id);
CREATE INDEX idx_smell_captures_profile_id ON smell_captures(profile_id);
CREATE INDEX idx_smell_captures_capture_id ON smell_captures(capture_id);
CREATE INDEX idx_smell_captures_created_at ON smell_captures(created_at DESC);
CREATE INDEX idx_smell_captures_status ON smell_captures(status);

-- JSONB index for raw_data queries
CREATE INDEX idx_smell_captures_raw_data ON smell_captures USING GIN(raw_data);

-- Comments
COMMENT ON TABLE smell_captures IS 'Individual smell capture sessions with raw sensor data';
COMMENT ON COLUMN smell_captures.raw_data IS 'Array of sensor readings: [{gas, temp, humidity, timestamp}, ...]';
COMMENT ON COLUMN smell_captures.feature_vector IS 'Extracted statistical features for ML comparison';
COMMENT ON COLUMN smell_captures.recognition_confidence IS 'Confidence of auto-match to recognized_profile_id';


-- ============================================
-- VIEWS FOR ANALYTICS
-- ============================================

-- View 1: Recent sensor data with IAQ categorization
CREATE OR REPLACE VIEW v_recent_readings AS
SELECT 
  id,
  device_id,
  gas_resistance / 1000.0 AS gas_resistance_kohm,
  temperature,
  humidity,
  pressure,
  iaq_score,
  CASE 
    WHEN iaq_score <= 50 THEN 'Excellent'
    WHEN iaq_score <= 100 THEN 'Good'
    WHEN iaq_score <= 150 THEN 'Moderate'
    WHEN iaq_score <= 200 THEN 'Poor'
    WHEN iaq_score <= 300 THEN 'Unhealthy'
    ELSE 'Hazardous'
  END AS iaq_category,
  co2_equivalent,
  voc_equivalent,
  mode,
  created_at
FROM sensor_readings
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

COMMENT ON VIEW v_recent_readings IS 'Last 24 hours of readings with human-readable IAQ categories';


-- View 2: Smell profile library with statistics
CREATE OR REPLACE VIEW v_smell_library AS
SELECT 
  sp.id,
  sp.name,
  sp.category,
  sp.subcategory,
  sp.label,
  sp.confidence,
  sp.sample_count,
  sp.tags,
  sp.baseline_gas / 1000.0 AS baseline_gas_kohm,
  sp.created_at,
  sp.last_matched_at,
  COUNT(sc.id) AS total_captures,
  MAX(sc.created_at) AS last_capture_at
FROM smell_profiles sp
LEFT JOIN smell_captures sc ON sc.profile_id = sp.id
GROUP BY sp.id
ORDER BY sp.created_at DESC;

COMMENT ON VIEW v_smell_library IS 'Smell profiles with capture statistics';


-- View 3: Device statistics (last 24h)
CREATE OR REPLACE VIEW v_device_stats_24h AS
SELECT 
  device_id,
  COUNT(*) AS total_readings,
  AVG(gas_resistance) AS avg_gas_resistance,
  AVG(temperature) AS avg_temperature,
  AVG(humidity) AS avg_humidity,
  AVG(iaq_score) AS avg_iaq_score,
  MAX(iaq_score) AS max_iaq_score,
  MIN(iaq_score) AS min_iaq_score,
  COUNT(*) FILTER (WHERE iaq_score > 150) AS poor_air_quality_count,
  MIN(created_at) AS first_reading,
  MAX(created_at) AS last_reading
FROM sensor_readings
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY device_id;

COMMENT ON VIEW v_device_stats_24h IS '24-hour statistics per device';


-- ============================================
-- FUNCTIONS FOR DATA ANALYSIS
-- ============================================

-- Function 1: Calculate hourly averages
CREATE OR REPLACE FUNCTION get_hourly_averages(
  p_device_id VARCHAR,
  p_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
  hour_timestamp TIMESTAMP,
  avg_gas_resistance NUMERIC,
  avg_temperature NUMERIC,
  avg_humidity NUMERIC,
  avg_iaq_score NUMERIC,
  reading_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    date_trunc('hour', created_at) AS hour_timestamp,
    AVG(gas_resistance)::NUMERIC(10,2) AS avg_gas_resistance,
    AVG(temperature)::NUMERIC(5,2) AS avg_temperature,
    AVG(humidity)::NUMERIC(5,2) AS avg_humidity,
    AVG(iaq_score)::NUMERIC(6,2) AS avg_iaq_score,
    COUNT(*) AS reading_count
  FROM sensor_readings
  WHERE device_id = p_device_id
    AND created_at > NOW() - (p_hours || ' hours')::INTERVAL
  GROUP BY date_trunc('hour', created_at)
  ORDER BY hour_timestamp DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_hourly_averages IS 'Calculate hourly average sensor readings for a device';


-- Function 2: Find similar smell profiles using cosine similarity
CREATE OR REPLACE FUNCTION find_similar_smells(
  p_feature_vector REAL[],
  p_threshold REAL DEFAULT 0.6,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  profile_id INTEGER,
  profile_name VARCHAR,
  similarity REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.id,
    sp.name,
    -- Simple dot product similarity (would use pgvector in production)
    (
      SELECT SUM(a * b) 
      FROM unnest(p_feature_vector) WITH ORDINALITY AS t1(a, ord)
      JOIN unnest(sp.feature_vector) WITH ORDINALITY AS t2(b, ord2) 
        ON t1.ord = t2.ord2
    ) / (
      SQRT(
        (SELECT SUM(v * v) FROM unnest(p_feature_vector) v)
      ) * 
      SQRT(
        (SELECT SUM(v * v) FROM unnest(sp.feature_vector) v)
      )
    ) AS similarity
  FROM smell_profiles sp
  WHERE sp.feature_vector IS NOT NULL
  HAVING (
    (
      SELECT SUM(a * b) 
      FROM unnest(p_feature_vector) WITH ORDINALITY AS t1(a, ord)
      JOIN unnest(sp.feature_vector) WITH ORDINALITY AS t2(b, ord2) 
        ON t1.ord = t2.ord2
    ) / (
      SQRT(
        (SELECT SUM(v * v) FROM unnest(p_feature_vector) v)
      ) * 
      SQRT(
        (SELECT SUM(v * v) FROM unnest(sp.feature_vector) v)
      )
    )
  ) >= p_threshold
  ORDER BY similarity DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION find_similar_smells IS 'Find smell profiles similar to given feature vector using cosine similarity';


-- ============================================
-- TRIGGERS FOR AUTOMATION
-- ============================================

-- Trigger 1: Update smell_profiles.updated_at on modification
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


-- Trigger 2: Increment sample_count when new capture is added
CREATE OR REPLACE FUNCTION increment_profile_sample_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.profile_id IS NOT NULL THEN
    UPDATE smell_profiles
    SET 
      sample_count = sample_count + 1,
      updated_at = CURRENT_TIMESTAMP
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
-- DATA RETENTION POLICIES
-- ============================================

-- Function: Archive old sensor readings
CREATE OR REPLACE FUNCTION archive_old_readings(p_days INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- In production, you'd move to archive table instead of DELETE
  DELETE FROM sensor_readings
  WHERE created_at < NOW() - (p_days || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION archive_old_readings IS 'Delete (or archive) sensor readings older than specified days';


-- ============================================
-- INITIAL DATA / SEED
-- ============================================

-- Insert sample smell categories (optional)
INSERT INTO smell_profiles (name, category, subcategory, label, description, tags, baseline_gas)
VALUES 
  ('Fresh Coffee', 'food', 'coffee', 'food/coffee', 'Freshly brewed arabica coffee', ARRAY['aromatic', 'morning', 'caffeine'], 250000),
  ('Lavender Essential Oil', 'floral', 'lavender', 'floral/lavender', 'Pure lavender essential oil', ARRAY['calming', 'herbal', 'essential oil'], 320000),
  ('Natural Gas', 'chemical', 'gas', 'chemical/gas', 'Household natural gas (safety)', ARRAY['warning', 'gas', 'methane'], 80000)
ON CONFLICT (name) DO NOTHING;


-- ============================================
-- PERFORMANCE TUNING RECOMMENDATIONS
-- ============================================

-- For high-frequency inserts, consider:
-- 1. Partitioning sensor_readings by date
-- 2. Using TimescaleDB extension for time-series optimization
-- 3. Batch inserts instead of single rows

-- Example partition setup (commented out):
/*
CREATE TABLE sensor_readings_2026_01 PARTITION OF sensor_readings
FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
*/

-- ============================================
-- GRANT PERMISSIONS (adjust as needed)
-- ============================================

-- For application user:
/*
GRANT SELECT, INSERT, UPDATE ON sensor_readings TO biosentinel_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON smell_profiles TO biosentinel_app;
GRANT SELECT, INSERT, UPDATE ON smell_captures TO biosentinel_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO biosentinel_app;
*/

-- For read-only analytics user:
/*
GRANT SELECT ON ALL TABLES IN SCHEMA public TO biosentinel_readonly;
GRANT SELECT ON ALL VIEWS IN SCHEMA public TO biosentinel_readonly;
*/


-- ============================================
-- USEFUL QUERIES FOR MONITORING
-- ============================================

-- Query 1: Check table sizes
/*
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE tablename IN ('sensor_readings', 'smell_profiles', 'smell_captures')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
*/

-- Query 2: Recent activity
/*
SELECT 
  'sensor_readings' AS table_name,
  COUNT(*) AS total_rows,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour') AS last_hour,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 day') AS last_day
FROM sensor_readings
UNION ALL
SELECT 
  'smell_captures',
  COUNT(*),
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour'),
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 day')
FROM smell_captures;
*/

-- ============================================
-- SCHEMA VERSION HISTORY
-- ============================================

CREATE TABLE IF NOT EXISTS schema_versions (
  version VARCHAR(20) PRIMARY KEY,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  description TEXT
);

INSERT INTO schema_versions (version, description) VALUES 
  ('1.0.0', 'Initial BioSentinel schema with 3 core tables')
ON CONFLICT (version) DO NOTHING;


-- ============================================
-- END OF SCHEMA
-- ============================================

-- Verification queries
DO $$
BEGIN
  RAISE NOTICE '✅ BioSentinel Schema v1.0.0 created successfully';
  RAISE NOTICE '📊 Tables: sensor_readings, smell_profiles, smell_captures';
  RAISE NOTICE '📈 Views: 3 analytical views';
  RAISE NOTICE '⚡ Functions: 3 helper functions';
  RAISE NOTICE '🔔 Triggers: 2 automation triggers';
END $$;
