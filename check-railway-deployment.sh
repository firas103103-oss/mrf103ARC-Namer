#!/bin/bash
# Railway Redeploy Script

echo "🚂 Railway Deployment Status Check"
echo "===================================="
echo ""

# Project URLs (Update these with your actual Railway URLs)
ECOSYSTEM_URL="https://mrf103-arc-ecosystem.up.railway.app"
LANDING_URL="https://mrf103-landing.up.railway.app"

echo "📍 Deployment URLs:"
echo "   Ecosystem: $ECOSYSTEM_URL"
echo "   Landing:   $LANDING_URL"
echo ""

echo "🔄 To trigger redeploy:"
echo ""
echo "Option 1: Railway Dashboard (Recommended)"
echo "  1. Go to: https://railway.app/dashboard"
echo "  2. Select project: mrf103-arc-ecosystem"
echo "  3. Click 'Deployments' tab"
echo "  4. Click 'Redeploy' button"
echo "  5. Repeat for mrf103-landing"
echo ""

echo "Option 2: Git Push (Auto-deploy)"
echo "  Any push to main branch will trigger deployment"
echo ""

echo "🧪 Testing deployments..."
echo ""

# Test Ecosystem
echo -n "Testing Ecosystem... "
if curl -s --head --max-time 10 "$ECOSYSTEM_URL" | grep "200\|301\|302" > /dev/null; then
    echo "✅ Online"
else
    echo "⏳ Deploying or ❌ Offline"
fi

# Test Landing
echo -n "Testing Landing...   "
if curl -s --head --max-time 10 "$LANDING_URL" | grep "200\|301\|302" > /dev/null; then
    echo "✅ Online"
else
    echo "⏳ Deploying or ❌ Offline"
fi

echo ""
echo "📊 Next Steps:"
echo "  1. Check Railway dashboard for deployment logs"
echo "  2. Verify custom domain is working"
echo "  3. Test all API endpoints"
echo "  4. Monitor for errors"
echo ""
echo "Dashboard: https://railway.app/dashboard"
