-- =============================================================================
-- ARC JOBS TEST SQL - 5 End-to-End Validation Calls
-- Run these after executing supabase_arc_jobs_setup.sql
-- =============================================================================

-- TEST 1: Create a job
SELECT arc_create_job(
  'test-user',
  'analyze_data',
  '{"target": "sales_q4", "priority": "high"}'::jsonb
) AS new_job_id;
-- Expected: Returns a UUID like 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'

-- TEST 2: Append logs to the job (use the UUID from TEST 1)
-- Replace 'YOUR_JOB_ID' with the actual UUID returned from TEST 1
SELECT arc_append_log(
  'YOUR_JOB_ID'::uuid,
  'info',
  'Job started processing',
  '{"step": 1}'::jsonb
);

SELECT arc_append_log(
  'YOUR_JOB_ID'::uuid,
  'info',
  'Data loaded successfully',
  '{"rows": 1500}'::jsonb
);

SELECT arc_append_log(
  'YOUR_JOB_ID'::uuid,
  'warn',
  'Some records had missing fields',
  '{"missing_count": 12}'::jsonb
);
-- Expected: No return (void), no error

-- TEST 3: Set job status to success
SELECT arc_set_status(
  'YOUR_JOB_ID'::uuid,
  'success',
  '{"summary": "Processed 1500 records", "insights": 5}'::jsonb,
  NULL,
  'trace-abc-123'
);
-- Expected: No return (void), no error

-- TEST 4: Get job with all logs
SELECT arc_get_job('YOUR_JOB_ID'::uuid);
-- Expected: JSONB object like:
-- {
--   "job": { "id": "...", "command": "analyze_data", "status": "success", ... },
--   "logs": [ { "level": "info", "message": "Job started...", ... }, ... ]
-- }

-- TEST 5: Get recent jobs
SELECT arc_recent_jobs(10);
-- Expected: JSONB array of job summaries with log_count:
-- [
--   { "id": "...", "command": "analyze_data", "status": "success", "log_count": 3, ... }
-- ]

-- =============================================================================
-- QUICK COMBINED TEST (creates job, logs, updates, retrieves in one go)
-- =============================================================================

DO $$
DECLARE
  v_job_id uuid;
  v_result jsonb;
BEGIN
  -- Create job
  v_job_id := arc_create_job('integration-test', 'test_command', '{"test": true}'::jsonb);
  RAISE NOTICE 'Created job: %', v_job_id;
  
  -- Add logs
  PERFORM arc_append_log(v_job_id, 'info', 'Test started', NULL);
  PERFORM arc_append_log(v_job_id, 'info', 'Test completed', '{"duration_ms": 150}'::jsonb);
  RAISE NOTICE 'Added 2 logs';
  
  -- Set status
  PERFORM arc_set_status(v_job_id, 'success', '{"passed": true}'::jsonb, NULL, NULL);
  RAISE NOTICE 'Set status to success';
  
  -- Get job
  v_result := arc_get_job(v_job_id);
  RAISE NOTICE 'Job result: %', v_result;
  
  -- Verify
  IF v_result->'job'->>'status' = 'success' AND jsonb_array_length(v_result->'logs') = 2 THEN
    RAISE NOTICE 'SUCCESS: All tests passed!';
  ELSE
    RAISE EXCEPTION 'FAILED: Unexpected result';
  END IF;
END;
$$;
