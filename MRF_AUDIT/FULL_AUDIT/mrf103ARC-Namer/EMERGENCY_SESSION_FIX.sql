-- ============================================================================
-- EMERGENCY SESSION TABLE FIX
-- ============================================================================
-- Run this FIRST if login keeps refreshing
-- This creates ONLY the session table (takes 2 seconds)
-- ============================================================================

-- Create session table
CREATE TABLE IF NOT EXISTS session (
  sid VARCHAR NOT NULL COLLATE "default" PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);

-- Create expiry index
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON session ("expire");

-- Test that it works
DO $$
DECLARE
  test_sid VARCHAR := 'test_' || TO_CHAR(NOW(), 'YYYY-MM-DD-HH24-MI-SS');
  test_data JSON := '{"test": true}'::JSON;
BEGIN
  -- Try to insert
  INSERT INTO session (sid, sess, expire) 
  VALUES (test_sid, test_data, NOW() + INTERVAL '1 hour');
  
  -- Clean up
  DELETE FROM session WHERE sid = test_sid;
  
  RAISE NOTICE '✅ SESSION TABLE READY - Login should work now';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ ERROR: %', SQLERRM;
END $$;

-- ============================================================================
-- After running this:
-- 1. Try login at https://app.mrf103.com
-- 2. Should redirect to /virtual-office immediately
-- 3. If still refreshing, check Railway logs for session save errors
-- ============================================================================
