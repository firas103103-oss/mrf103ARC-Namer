-- ============================================================================
-- SUPABASE QUICK DIAGNOSTIC CHECK
-- ============================================================================
-- Run this in Supabase SQL Editor to see current database state
-- Takes 5 seconds to execute
-- ============================================================================

-- Check 1: Does session table exist?
SELECT 
  'session' as check_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'session')
    THEN '✅ EXISTS'
    ELSE '❌ MISSING - THIS IS WHY LOGIN FAILS'
  END as status;

-- Check 2: List all tables in public schema
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND columns.table_name = tables.table_name) as column_count
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check 3: If session table exists, show its structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'session'
ORDER BY ordinal_position;

-- Check 4: Count rows in session table (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'session') THEN
    RAISE NOTICE 'Session table row count: %', (SELECT COUNT(*) FROM session);
  ELSE
    RAISE NOTICE '❌ SESSION TABLE MISSING - LOGIN WILL NOT WORK';
  END IF;
END $$;

-- ============================================================================
-- INTERPRETATION:
-- ============================================================================
-- If you see "❌ MISSING" for session table:
--   → Login is broken because sessions cannot be stored
--   → RUN: supabase_compatibility_setup_PATCHED.sql (the full script)
--
-- If you see "✅ EXISTS" for session table:
--   → Database is ready
--   → Problem is in frontend/backend code (not database)
--   → Check Railway environment variables next
-- ============================================================================
