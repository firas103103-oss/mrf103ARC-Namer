-- =============================================================================
-- ARC JOBS & LOGS SETUP SCRIPT
-- Safe to run multiple times (uses IF NOT EXISTS where possible)
-- =============================================================================

-- 1. CREATE TABLES
-- -----------------------------------------------------------------------------

-- arc_jobs table
CREATE TABLE IF NOT EXISTS arc_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by text NULL,
  command text NOT NULL,
  payload jsonb NOT NULL,
  status text NOT NULL CHECK (status IN ('accepted', 'running', 'success', 'failed')),
  result jsonb NULL,
  error text NULL,
  external_trace text NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- arc_logs table
CREATE TABLE IF NOT EXISTS arc_logs (
  id bigserial PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  job_id uuid NOT NULL REFERENCES arc_jobs(id) ON DELETE CASCADE,
  level text NOT NULL CHECK (level IN ('info', 'warn', 'error')),
  message text NOT NULL,
  data jsonb NULL
);

-- 2. CREATE INDEXES (safe: will error if exists, but won't break anything)
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_arc_jobs_created_at ON arc_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_arc_jobs_status ON arc_jobs(status);
CREATE INDEX IF NOT EXISTS idx_arc_logs_job_id_created_at ON arc_logs(job_id, created_at DESC);

-- 3. RPC FUNCTIONS
-- -----------------------------------------------------------------------------

-- arc_create_job: Create a new job, returns job UUID
CREATE OR REPLACE FUNCTION arc_create_job(
  p_created_by text,
  p_command text,
  p_payload jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_job_id uuid;
BEGIN
  INSERT INTO arc_jobs (created_by, command, payload, status)
  VALUES (p_created_by, p_command, p_payload, 'accepted')
  RETURNING id INTO v_job_id;
  
  RETURN v_job_id;
END;
$$;

-- arc_append_log: Append a log entry to a job
CREATE OR REPLACE FUNCTION arc_append_log(
  p_job_id uuid,
  p_level text,
  p_message text,
  p_data jsonb DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO arc_logs (job_id, level, message, data)
  VALUES (p_job_id, p_level, p_message, p_data);
END;
$$;

-- arc_set_status: Update job status and optional result/error
CREATE OR REPLACE FUNCTION arc_set_status(
  p_job_id uuid,
  p_status text,
  p_result jsonb DEFAULT NULL,
  p_error text DEFAULT NULL,
  p_external_trace text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE arc_jobs
  SET 
    status = p_status,
    result = COALESCE(p_result, result),
    error = COALESCE(p_error, error),
    external_trace = COALESCE(p_external_trace, external_trace),
    updated_at = now()
  WHERE id = p_job_id;
END;
$$;

-- arc_get_job: Get job with all its logs as JSONB
CREATE OR REPLACE FUNCTION arc_get_job(p_job_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_job jsonb;
  v_logs jsonb;
BEGIN
  SELECT to_jsonb(j.*) INTO v_job
  FROM arc_jobs j
  WHERE j.id = p_job_id;
  
  SELECT COALESCE(jsonb_agg(to_jsonb(l.*) ORDER BY l.created_at), '[]'::jsonb) INTO v_logs
  FROM arc_logs l
  WHERE l.job_id = p_job_id;
  
  RETURN jsonb_build_object('job', v_job, 'logs', v_logs);
END;
$$;

-- arc_recent_jobs: Get recent jobs with summary
CREATE OR REPLACE FUNCTION arc_recent_jobs(p_limit int DEFAULT 20)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_jobs jsonb;
BEGIN
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', j.id,
      'created_at', j.created_at,
      'created_by', j.created_by,
      'command', j.command,
      'status', j.status,
      'updated_at', j.updated_at,
      'log_count', (SELECT COUNT(*) FROM arc_logs l WHERE l.job_id = j.id)
    ) ORDER BY j.created_at DESC
  ), '[]'::jsonb) INTO v_jobs
  FROM arc_jobs j
  LIMIT p_limit;
  
  RETURN v_jobs;
END;
$$;

-- 4. ENABLE RLS
-- -----------------------------------------------------------------------------

ALTER TABLE arc_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE arc_logs ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES (service role full access)
-- -----------------------------------------------------------------------------

-- Drop existing policies if they exist (safe recreation)
DROP POLICY IF EXISTS "Service role full access on arc_jobs" ON arc_jobs;
DROP POLICY IF EXISTS "Service role full access on arc_logs" ON arc_logs;

-- Create service role policies
CREATE POLICY "Service role full access on arc_jobs"
  ON arc_jobs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on arc_logs"
  ON arc_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- END OF SETUP
-- =============================================================================
