#!/bin/bash

echo "========================================"
echo "  ARC Virtual Office - Setup Script"
echo "========================================"
echo ""

# Check required environment variables
echo "Checking environment variables..."
echo ""

check_env() {
    if [ -z "${!1}" ]; then
        echo "  [MISSING] $1"
        return 1
    else
        echo "  [OK] $1"
        return 0
    fi
}

MISSING=0

check_env "DATABASE_URL" || MISSING=1
check_env "OPENAI_API_KEY" || MISSING=1
check_env "ARC_BACKEND_SECRET" || MISSING=1
check_env "SUPABASE_URL" || MISSING=1
check_env "SUPABASE_SERVICE_ROLE_KEY" || MISSING=1

echo ""

if [ $MISSING -eq 1 ]; then
    echo "Warning: Some environment variables are missing."
    echo "The app may not work correctly without them."
    echo ""
fi

# Database setup
echo "Setting up database..."
npm run db:push 2>/dev/null

if [ $? -eq 0 ]; then
    echo "  [OK] Database schema synced"
else
    echo "  [INFO] Database push skipped or already up to date"
fi

echo ""
echo "========================================"
echo "  Supabase Tables (create manually)"
echo "========================================"
echo ""
echo "Run these SQL commands in your Supabase SQL Editor:"
echo ""
echo "-- arc_feedback table"
echo "CREATE TABLE IF NOT EXISTS arc_feedback ("
echo "  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),"
echo "  command_id TEXT,"
echo "  source TEXT,"
echo "  status TEXT,"
echo "  data JSONB,"
echo "  created_at TIMESTAMP DEFAULT NOW()"
echo ");"
echo ""
echo "-- arc_command_log table"
echo "CREATE TABLE IF NOT EXISTS arc_command_log ("
echo "  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),"
echo "  command TEXT,"
echo "  payload JSONB,"
echo "  status TEXT DEFAULT 'pending',"
echo "  created_at TIMESTAMP DEFAULT NOW()"
echo ");"
echo ""
echo "-- agent_events table"
echo "CREATE TABLE IF NOT EXISTS agent_events ("
echo "  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),"
echo "  agent_name TEXT,"
echo "  event_type TEXT,"
echo "  payload JSONB,"
echo "  created_at TIMESTAMP DEFAULT NOW()"
echo ");"
echo ""
echo "========================================"
echo "  API Endpoints Ready"
echo "========================================"
echo ""
echo "Supabase Bridge Endpoints (require X-ARC-SECRET header):"
echo "  POST /api/arc/receive   -> arc_feedback"
echo "  POST /api/arc/command   -> arc_command_log"
echo "  POST /api/arc/events    -> agent_events"
echo ""
echo "Virtual Office Endpoints:"
echo "  GET  /api/agents"
echo "  GET  /api/conversations"
echo "  POST /api/chat"
echo ""
echo "========================================"
echo "  Setup Complete!"
echo "========================================"
