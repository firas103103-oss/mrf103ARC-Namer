#!/bin/bash

# 🚀 Railway Multi-Service Deployment Script
# Deploy all repositories as separate services on Railway

set -e

echo "🚀 Railway Multi-Service Deployment"
echo "===================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI is not installed${NC}"
    echo ""
    echo "Install it with:"
    echo "  npm install -g @railway/cli"
    echo ""
    echo "Or visit: https://docs.railway.app/develop/cli"
    exit 1
fi

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Railway${NC}"
    echo ""
    echo "Login with:"
    echo "  railway login"
    exit 1
fi

echo -e "${GREEN}✅ Railway CLI ready${NC}"
echo ""

# Service configurations
declare -A SERVICES=(
    ["2-xbook-engine"]="FORGE - XBook Engine API"
    ["3-mrf103-arc-ecosystem"]="COMMAND + PULSE Ecosystem"
    ["4-arc-namer-core"]="Core Naming Library (Build Only)"
    ["5-arc-namer-cli"]="CLI Tool (Build Only)"
    ["6-arc-namer-vscode"]="VS Code Extension (Build Only)"
)

# Deployment order (services with APIs first)
DEPLOY_ORDER=(
    "2-xbook-engine"
    "3-mrf103-arc-ecosystem"
    "4-arc-namer-core"
    "5-arc-namer-cli"
    "6-arc-namer-vscode"
)

echo "📋 Services to deploy:"
echo ""
for service in "${DEPLOY_ORDER[@]}"; do
    echo "  • ${SERVICES[$service]}"
done
echo ""

read -p "Continue with deployment? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 0
fi

echo ""
echo "🚀 Starting deployment..."
echo ""

# Deploy each service
for service in "${DEPLOY_ORDER[@]}"; do
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${BLUE}📦 Deploying: ${SERVICES[$service]}${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    cd "$service" || exit 1
    
    # Check if railway.json exists
    if [ ! -f "railway.json" ]; then
        echo -e "${RED}❌ railway.json not found in $service${NC}"
        cd ..
        continue
    fi
    
    # Initialize Railway project if not linked
    if [ ! -f ".railway" ]; then
        echo -e "${YELLOW}⚠️  Service not linked to Railway${NC}"
        echo "Run manually:"
        echo "  cd $service"
        echo "  railway init"
        echo "  railway up"
        echo ""
        cd ..
        continue
    fi
    
    # Deploy
    echo -e "${BLUE}Deploying...${NC}"
    if railway up; then
        echo -e "${GREEN}✅ ${SERVICES[$service]} deployed successfully${NC}"
        echo ""
        
        # Get deployment URL
        URL=$(railway domain 2>/dev/null || echo "No domain configured")
        if [ "$URL" != "No domain configured" ]; then
            echo -e "${GREEN}🌐 URL: $URL${NC}"
        fi
    else
        echo -e "${RED}❌ Deployment failed for ${SERVICES[$service]}${NC}"
        echo ""
    fi
    
    cd ..
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Deployment process complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📊 Next steps:"
echo ""
echo "1. Verify deployments in Railway dashboard:"
echo "   https://railway.app/dashboard"
echo ""
echo "2. Set environment variables for each service:"
echo "   • FORGE: OPENAI_API_KEY, ANTHROPIC_API_KEY"
echo "   • COMMAND: DATABASE_URL, SUPABASE_*, ARC_OPERATOR_PASSWORD"
echo ""
echo "3. Configure custom domains (optional):"
echo "   railway domain"
echo ""
echo "4. Monitor logs:"
echo "   railway logs --follow"
echo ""

echo -e "${GREEN}🎉 All done!${NC}"
