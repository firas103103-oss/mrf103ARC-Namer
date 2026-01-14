#!/bin/bash
# Check if all required environment variables are set for Railway deployment

echo "🔍 Checking .env.production file..."
echo "================================"
echo ""

REQUIRED_VARS=(
    "DATABASE_URL"
    "SUPABASE_URL"
    "SUPABASE_KEY"
    "SUPABASE_PUBLISHABLE_KEY"
    "SUPABASE_JWT_SECRET"
    "SESSION_SECRET"
    "ARC_BACKEND_SECRET"
    "X_ARC_SECRET"
    "ACRI_SECRET"
)

OPTIONAL_VARS=(
    "OPENAI_API_KEY"
    "OPENAI_MODEL"
    "ANTHROPIC_API_KEY"
    "GEMINI_API_KEY"
    "ELEVENLABS_API_KEY"
)

missing_required=0
missing_optional=0

# Check required variables
echo "📋 Required Variables:"
for var in "${REQUIRED_VARS[@]}"; do
    if grep -q "^${var}=" .env.production 2>/dev/null; then
        echo "   ✅ $var"
    else
        echo "   ❌ $var (MISSING - CRITICAL)"
        ((missing_required++))
    fi
done
echo ""

# Check optional variables
echo "📋 Optional Variables:"
for var in "${OPTIONAL_VARS[@]}"; do
    if grep -q "^${var}=" .env.production 2>/dev/null; then
        echo "   ✅ $var"
    else
        echo "   ⚠️  $var (missing - optional)"
        ((missing_optional++))
    fi
done
echo ""

# Summary
echo "================================"
if [ $missing_required -eq 0 ]; then
    echo "✅ All required variables are set!"
    echo ""
    echo "Next steps:"
    echo "1. Copy these variables to Railway dashboard"
    echo "2. Go to https://railway.app"
    echo "3. Select your project > Variables tab"
    echo "4. Add each variable from .env.production"
    echo "5. Railway will auto-redeploy"
else
    echo "❌ Missing $missing_required required variable(s)"
    echo ""
    echo "⚠️  Add these to .env.production before deployment!"
fi

if [ $missing_optional -gt 0 ]; then
    echo ""
    echo "ℹ️  Missing $missing_optional optional variable(s)"
    echo "   (AI features may be limited)"
fi
echo ""
