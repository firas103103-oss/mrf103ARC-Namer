#!/bin/bash
echo "ARC Replit Diagnostic Report - Starting Scan"
REPORT_FILE="arc_report_$(date +%Y%m%d_%H%M%S).txt"

{
  echo "=========================================="
  echo "ARC Replit Diagnostic Report"
  echo "Generated at: $(date)"
  echo "=========================================="
  echo ""
  echo "Project Directory Structure:"
  tree -L 2 || ls -R
  echo ""
  echo "=========================================="
  echo "Environment Variables (Secrets)"
  echo ""
  env | grep -E "SUPABASE|ARC|OPENAI|N8N|VITE|SESSION" || echo "No sensitive vars visible."
  echo ""
  echo "=========================================="
  echo "Checking for Core Files..."
  for f in server/index.ts server/routes.ts client/src/App.tsx setup.sh package.json; do
    if [ -f "$f" ]; then
      echo "Found: $f"
    else
      echo "Missing: $f"
    fi
  done
  echo ""
  echo "=========================================="
  echo "Active Ports & Processes:"
  netstat -tuln 2>/dev/null | grep "LISTEN" || echo "No open ports detected"
  echo ""
  echo "=========================================="
  echo "Supabase Configuration:"
  if grep -R "supabase" ./client/src >/dev/null 2>&1; then
    echo "Supabase Client Detected in ./client/src"
    grep -R "createClient" ./client/src 2>/dev/null | head -5
  else
    echo "Supabase SDK not found in ./client/src"
  fi
  echo ""
  echo "=========================================="
  echo "Node Dependencies:"
  if [ -f package.json ]; then
    cat package.json | grep '"dependencies"' -A 10
  else
    echo "No package.json found"
  fi
  echo ""
  echo "=========================================="
  echo "Server Routes:"
  if [ -f server/routes.ts ]; then
    grep -E "app\.(get|post|put|delete|patch)" server/routes.ts | head -20
  else
    echo "No routes file found"
  fi
  echo ""
  echo "=========================================="
  echo "Report Generation Complete."
} > $REPORT_FILE

echo "Report saved to: $REPORT_FILE"
echo "Tip: Use 'cat $REPORT_FILE' to view it."
