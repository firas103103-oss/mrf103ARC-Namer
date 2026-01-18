#!/bin/bash
echo "🚀 ARC Replit Diagnostic Report – Starting Scan"
REPORT_FILE="arc_report_$(date +%Y%m%d_%H%M%S).txt"

# Start writing report
{
  echo "=========================================="
  echo "🧠 ARC Replit Diagnostic Report"
  echo "Generated at: $(date)"
  echo "=========================================="
  echo ""
  echo "📁 Project Directory Structure:"
  tree -L 2 || ls -R
  echo ""
  echo "=========================================="
  echo "⚙️ Environment Variables (Secrets)"
  echo ""
  env | grep -E "SUPABASE|ARC|OPENAI|N8N|VITE|SESSION" || echo "No sensitive vars visible."
  echo ""
  echo "=========================================="
  echo "🧱 Checking for Core Files..."
  for f in server.js index.ts index.js main.py setup.sh package.json; do
    if [ -f "$f" ]; then
      echo "✅ Found: $f"
    else
      echo "❌ Missing: $f"
    fi
  done
  echo ""
  echo "=========================================="
  echo "🔌 Active Ports & Processes:"
  netstat -tuln 2>/dev/null | grep "LISTEN" || echo "No open ports detected"
  echo ""
  echo "=========================================="
  echo "🧩 Supabase Configuration:"
  if grep -R "supabase" ./src >/dev/null 2>&1; then
    echo "✅ Supabase Client Detected in ./src"
    grep -R "createClient" ./src | head -5
  else
    echo "❌ Supabase SDK not found in ./src"
  fi
  echo ""
  echo "=========================================="
  echo "📦 Node Dependencies:"
  if [ -f package.json ]; then
    cat package.json | grep '"dependencies"' -A 10
  else
    echo "No package.json found"
  fi
  echo ""
  echo "=========================================="
  echo "📡 Git / Project Metadata:"
  git status 2>/dev/null || echo "No git repo detected"
  echo ""
  echo "=========================================="
  echo "✅ Report Generation Complete."
} > $REPORT_FILE

echo "📄 Report saved to: $REPORT_FILE"
echo "🧠 Tip: Use 'cat $REPORT_FILE' to view it."