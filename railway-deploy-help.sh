#!/bin/bash

# Railway Deployment Helper Script
# هذا السكريبت يساعد في نشر التطبيق على Railway

echo "🚀 Railway Deployment Helper"
echo "============================"
echo ""

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "⚠️  Railway CLI is not installed."
    echo "Install it with: npm install -g @railway/cli"
    echo "Or follow: https://docs.railway.app/develop/cli"
    echo ""
fi

echo "📋 Pre-deployment Checklist:"
echo ""
echo "1. ✅ Build test completed successfully"
echo "   Run: npm run build"
echo ""
echo "2. 🔐 Required Environment Variables in Railway Dashboard:"
echo "   - ARC_OPERATOR_PASSWORD (e.g., arc-dev-password-123)"
echo "   - SESSION_SECRET (generate with: openssl rand -hex 32)"
echo "   - NODE_ENV=production"
echo ""
echo "3. 🔧 Optional Environment Variables:"
echo "   - OPENAI_API_KEY (if using OpenAI)"
echo "   - GOOGLE_AI_API_KEY (if using Google AI)"
echo "   - SUPABASE_URL and SUPABASE_SERVICE_KEY (if using Supabase)"
echo ""
echo "4. 📄 Files created:"
echo "   - railway.json (Railway configuration)"
echo "   - .railway-env-checklist.md (Environment variables guide)"
echo ""
echo "🔗 Next Steps:"
echo ""
echo "If you have Railway CLI installed:"
echo "  railway login"
echo "  railway link"
echo "  railway up"
echo ""
echo "Or push to GitHub and let Railway auto-deploy:"
echo "  git add ."
echo "  git commit -m 'fix: Railway deployment configuration'"
echo "  git push origin main"
echo ""
echo "After deployment, test with:"
echo "  curl -i -c arc-cookies.txt \\"
echo "    -H \"Content-Type: application/json\" \\"
echo "    -d '{\"password\":\"YOUR_PASSWORD\"}' \\"
echo "    https://YOUR_APP.up.railway.app/api/auth/login"
echo ""
