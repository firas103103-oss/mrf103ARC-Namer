#!/bin/bash
# Railway Redeploy Script
# This script helps verify and trigger Railway deployment

echo "🚀 Railway Deployment Helper"
echo "================================"
echo ""

# Check current Railway status
echo "1️⃣ Checking Railway deployment status..."
curl -I https://app.mrf103.com 2>&1 | head -15
echo ""

# Check if Railway CLI is installed
if command -v railway &> /dev/null; then
    echo "2️⃣ Railway CLI detected. You can run:"
    echo "   railway up"
    echo ""
else
    echo "2️⃣ Railway CLI not installed. Install with:"
    echo "   npm i -g @railway/cli"
    echo "   railway login"
    echo "   railway up"
    echo ""
fi

# Git-based deployment
echo "3️⃣ To trigger Railway deployment via Git:"
echo "   git add ."
echo "   git commit -m 'fix: update production deployment'"
echo "   git push origin main"
echo ""

# Environment variables checklist
echo "4️⃣ Required Railway Environment Variables:"
echo "   ✓ DATABASE_URL"
echo "   ✓ SUPABASE_URL"
echo "   ✓ SUPABASE_KEY"
echo "   ✓ SUPABASE_PUBLISHABLE_KEY"
echo "   ✓ SUPABASE_JWT_SECRET"
echo "   ✓ SESSION_SECRET"
echo "   ✓ ARC_BACKEND_SECRET"
echo "   ✓ X_ARC_SECRET"
echo "   ✓ ACRI_SECRET"
echo "   ✓ OPENAI_API_KEY (optional)"
echo ""

echo "5️⃣ After deployment, verify:"
echo "   curl https://app.mrf103.com/api/health"
echo "   curl -X POST https://app.mrf103.com/api/acri/probe/issue"
echo ""

echo "📋 Full deployment guide: PRODUCTION_STATUS_REPORT.md"
