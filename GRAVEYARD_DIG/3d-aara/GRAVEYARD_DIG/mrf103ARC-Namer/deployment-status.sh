#!/bin/bash

echo "╔════════════════════════════════════════════════════════╗"
echo "║        🚀 MRF103 ARC Deployment Status Check         ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Railway URLs
echo -e "${BLUE}📍 Railway Platform URLs:${NC}"
echo "   • Ecosystem: https://mrf103-arc-ecosystem.up.railway.app"
echo "   • Landing:   https://mrf103-landing.up.railway.app"
echo ""

# Custom Domains
echo -e "${BLUE}🌐 Custom Domains:${NC}"
DOMAINS=("cli.mrf103.com" "core.mrf103.com" "ecosystem.mrf103.com" "vscode.mrf103.com")

for domain in "${DOMAINS[@]}"; do
    # Test HTTPS
    https_status=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "https://$domain" 2>/dev/null)
    
    if [ "$https_status" -eq "200" ] || [ "$https_status" -eq "301" ] || [ "$https_status" -eq "302" ]; then
        echo -e "   ${GREEN}✅${NC} $domain → HTTPS: $https_status"
    elif [ "$https_status" -eq "502" ] || [ "$https_status" -eq "503" ]; then
        echo -e "   ${YELLOW}⚠️${NC}  $domain → Server starting: $https_status"
    elif [ "$https_status" -eq "000" ]; then
        # Check HTTP fallback
        http_status=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "http://$domain" 2>/dev/null)
        if [ "$http_status" -eq "301" ]; then
            echo -e "   ${YELLOW}🔓${NC} $domain → HTTP: $http_status (SSL pending)"
        else
            echo -e "   ${RED}❌${NC} $domain → Not accessible"
        fi
    else
        echo -e "   ${RED}❌${NC} $domain → Status: $https_status"
    fi
done

echo ""
echo -e "${BLUE}📊 Next Steps:${NC}"
echo ""
echo "1️⃣  ${YELLOW}Enable SSL Certificates${NC} (if pending):"
echo "   • Go to: https://railway.app/dashboard"
echo "   • For each service → Settings → Domains"
echo "   • Enable 'Generate SSL Certificate'"
echo "   • Wait 5-10 minutes for activation"
echo ""
echo "2️⃣  ${YELLOW}Add Environment Variables${NC} (if not done):"
echo "   • Check: ENVIRONMENT_VARIABLES_GUIDE.md"
echo "   • Required: OPENAI_API_KEY, SUPABASE_URL, DATABASE_URL"
echo "   • Generated secrets in guide"
echo ""
echo "3️⃣  ${YELLOW}Monitor Deployments:${NC}"
echo "   • Railway Dashboard → Deployments tab"
echo "   • Check build logs for errors"
echo "   • Verify all services are 'Active'"
echo ""
echo "4️⃣  ${YELLOW}Test Endpoints:${NC}"
echo "   • Health checks: /health, /api/health"
echo "   • API functionality"
echo "   • Database connections"
echo ""

# Railway Services Status
echo -e "${BLUE}🔍 Testing Railway Services...${NC}"
echo ""

# Test Ecosystem
eco_status=$(curl -s -o /dev/null -w "%{http_code}" https://mrf103-arc-ecosystem.up.railway.app 2>/dev/null)
if [ "$eco_status" -eq "200" ]; then
    echo -e "   ${GREEN}✅ Ecosystem:${NC} Running ($eco_status)"
elif [ "$eco_status" -eq "404" ]; then
    echo -e "   ${YELLOW}⚠️  Ecosystem:${NC} Active but needs routes ($eco_status)"
elif [ "$eco_status" -eq "502" ] || [ "$eco_status" -eq "503" ]; then
    echo -e "   ${YELLOW}🔄 Ecosystem:${NC} Deploying/Starting ($eco_status)"
else
    echo -e "   ${RED}❌ Ecosystem:${NC} Issue detected ($eco_status)"
fi

# Test Landing
land_status=$(curl -s -o /dev/null -w "%{http_code}" https://mrf103-landing.up.railway.app 2>/dev/null)
if [ "$land_status" -eq "200" ]; then
    echo -e "   ${GREEN}✅ Landing:${NC} Running ($land_status)"
elif [ "$land_status" -eq "404" ]; then
    echo -e "   ${YELLOW}⚠️  Landing:${NC} Active but needs routes ($land_status)"
elif [ "$land_status" -eq "502" ] || [ "$land_status" -eq "503" ]; then
    echo -e "   ${YELLOW}🔄 Landing:${NC} Deploying/Starting ($land_status)"
else
    echo -e "   ${RED}❌ Landing:${NC} Issue detected ($land_status)"
fi

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Deployment executed! Check Railway Dashboard for details${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
