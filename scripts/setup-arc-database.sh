#!/bin/bash

# ARC 2.0 Database Setup Script
# Executes schema using psql with Supabase connection

echo "🚀 ARC 2.0 Database Setup"
echo "================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
  echo "❌ .env file not found!"
  exit 1
fi

# Load environment variables
source .env

# Check for required variables
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "❌ Missing Supabase credentials in .env"
  echo "Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
  exit 1
fi

# Extract database connection details from Supabase URL
PROJECT_ID=$(echo $SUPABASE_URL | sed 's|https://\(.*\)\.supabase\.co|\1|')
DB_HOST="db.${PROJECT_ID}.supabase.co"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres"

echo "📊 Database: $DB_HOST"
echo "📁 SQL File: supabase_arc_database_setup.sql"
echo ""

# Check if SQL file exists
if [ ! -f supabase_arc_database_setup.sql ]; then
  echo "❌ SQL file not found: supabase_arc_database_setup.sql"
  exit 1
fi

echo "⚠️  NOTE: You'll need the Supabase database password"
echo "You can find it in: Supabase Dashboard → Settings → Database → Connection string"
echo ""
echo "Executing SQL schema..."
echo ""

# Execute SQL file using psql
PGPASSWORD="$DB_PASSWORD" psql \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  -f supabase_arc_database_setup.sql \
  2>&1

if [ $? -eq 0 ]; then
  echo ""
  echo "================================"
  echo "✅ Database setup completed successfully!"
  echo "================================"
  echo ""
  echo "📋 Created tables:"
  echo "  - agent_experiences"
  echo "  - agent_skills"
  echo "  - agent_reports"
  echo "  - learning_goals"
  echo "  - agent_patterns"
  echo "  - agent_chat_messages"
  echo "  - agent_status (31 agents initialized)"
  echo ""
  echo "🔒 RLS policies enabled"
  echo "⚡ Triggers and functions created"
  echo ""
else
  echo ""
  echo "❌ Database setup failed!"
  echo "Check the error messages above"
  exit 1
fi
