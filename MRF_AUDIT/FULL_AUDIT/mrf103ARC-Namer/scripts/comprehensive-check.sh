#!/bin/bash

echo "🦅 ═══════════════════════════════════════════════════════"
echo "   فحص شامل للنظام الخارق - Super AI System"
echo "═══════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

check_mark="${GREEN}✅${NC}"
cross_mark="${RED}❌${NC}"
info_mark="${BLUE}ℹ️${NC}"

# Counter
total_checks=0
passed_checks=0

check_test() {
    ((total_checks++))
    if [ $1 -eq 0 ]; then
        echo -e "   $check_mark $2"
        ((passed_checks++))
    else
        echo -e "   $cross_mark $2"
    fi
}

# ═══════════════════════════════════════════════════════════
echo "📦 1. فحص الملفات والبنية"
echo "───────────────────────────────────────────────────────"

# Check files
[ -f "src/infrastructure/monitoring/MetricsCollector.ts" ]
check_test $? "MetricsCollector.ts موجود"

[ -f "src/infrastructure/events/EventBus.ts" ]
check_test $? "EventBus.ts موجود"

[ -f "src/infrastructure/notifications/NotificationService.ts" ]
check_test $? "NotificationService.ts موجود"

[ -f "src/SuperIntegration.ts" ]
check_test $? "SuperIntegration.ts موجود"

[ -f "src/routes/metrics.routes.ts" ]
check_test $? "metrics.routes.ts موجود"

[ -f "SUPER_AI_SYSTEM.md" ]
check_test $? "SUPER_AI_SYSTEM.md موجود"

[ -f "EXECUTION_COMPLETE.md" ]
check_test $? "EXECUTION_COMPLETE.md موجود"

[ -f "FINAL_EXECUTION_REPORT.md" ]
check_test $? "FINAL_EXECUTION_REPORT.md موجود"

echo ""

# ═══════════════════════════════════════════════════════════
echo "📚 2. فحص التبعيات"
echo "───────────────────────────────────────────────────────"

grep -q "prom-client" package.json
check_test $? "prom-client مثبت في package.json"

grep -q "axios" package.json
check_test $? "axios مثبت في package.json"

[ -d "node_modules/prom-client" ]
check_test $? "prom-client موجود في node_modules"

[ -d "node_modules/axios" ]
check_test $? "axios موجود في node_modules"

echo ""

# ═══════════════════════════════════════════════════════════
echo "🔗 3. فحص التكامل مع السيرفر"
echo "───────────────────────────────────────────────────────"

grep -q "metricsRoutes" server/index.ts
check_test $? "metricsRoutes مستورد في server/index.ts"

grep -q "superSystem" server/index.ts
check_test $? "superSystem مستورد في server/index.ts"

grep -q "metricsCollector" server/index.ts
check_test $? "metricsCollector مستورد في server/index.ts"

grep -q "app.use.*metricsRoutes" server/index.ts
check_test $? "metricsRoutes مُسجل في التطبيق"

grep -q "superSystem.start" server/index.ts
check_test $? "superSystem.start() موجود"

echo ""

# ═══════════════════════════════════════════════════════════
echo "🖥️  4. فحص حالة السيرفر"
echo "───────────────────────────────────────────────────────"

# Check if server is running
if lsof -ti:5001 >/dev/null 2>&1; then
    echo -e "   $check_mark السيرفر يعمل على المنفذ 5001"
    ((total_checks++))
    ((passed_checks++))
    SERVER_RUNNING=true
else
    echo -e "   $cross_mark السيرفر لا يعمل على المنفذ 5001"
    ((total_checks++))
    SERVER_RUNNING=false
fi

echo ""

# ═══════════════════════════════════════════════════════════
if [ "$SERVER_RUNNING" = true ]; then
    echo "🌐 5. فحص Endpoints"
    echo "───────────────────────────────────────────────────────"

    # Test /api/metrics
    if timeout 3 curl -s http://localhost:5001/api/metrics | grep -q "# HELP" 2>/dev/null; then
        echo -e "   $check_mark GET /api/metrics يعمل"
        ((total_checks++))
        ((passed_checks++))
    else
        echo -e "   $cross_mark GET /api/metrics لا يعمل"
        ((total_checks++))
    fi

    # Test /api/health/metrics
    if timeout 3 curl -s http://localhost:5001/api/health/metrics | grep -q "status" 2>/dev/null; then
        echo -e "   $check_mark GET /api/health/metrics يعمل"
        ((total_checks++))
        ((passed_checks++))
    else
        echo -e "   $cross_mark GET /api/health/metrics لا يعمل"
        ((total_checks++))
    fi

    # Test /api/events/stats
    if timeout 3 curl -s http://localhost:5001/api/events/stats | grep -q "totalEvents" 2>/dev/null; then
        echo -e "   $check_mark GET /api/events/stats يعمل"
        ((total_checks++))
        ((passed_checks++))
    else
        echo -e "   $cross_mark GET /api/events/stats لا يعمل"
        ((total_checks++))
    fi

    # Test /api/system/report
    if timeout 3 curl -s http://localhost:5001/api/system/report | grep -q "System Status Report" 2>/dev/null; then
        echo -e "   $check_mark GET /api/system/report يعمل"
        ((total_checks++))
        ((passed_checks++))
    else
        echo -e "   $cross_mark GET /api/system/report لا يعمل"
        ((total_checks++))
    fi

    echo ""

    # ═══════════════════════════════════════════════════════════
    echo "📊 6. عينات من البيانات"
    echo "───────────────────────────────────────────────────────"

    echo ""
    echo "   📈 Metrics Sample:"
    timeout 3 curl -s http://localhost:5001/api/metrics 2>/dev/null | grep -E "^(http_requests_total|memory_usage_bytes|errors_total)" | head -3 || echo "   ⚠️  لا توجد metrics متاحة"

    echo ""
    echo "   🏥 Health Status:"
    timeout 3 curl -s http://localhost:5001/api/health/metrics 2>/dev/null | python3 -c "import sys, json; d=json.load(sys.stdin); print(f\"      Status: {d.get('status', 'N/A')}\"); print(f\"      Memory: {d.get('memory', {}).get('heapUsedPercent', 0):.1f}%\"); print(f\"      Uptime: {int(d.get('uptime', 0))}s\")" 2>/dev/null || echo "   ⚠️  البيانات غير متاحة"

    echo ""
    echo "   📡 Events:"
    timeout 3 curl -s http://localhost:5001/api/events/stats 2>/dev/null | python3 -c "import sys, json; d=json.load(sys.stdin); print(f\"      Total Events: {d.get('totalEvents', 0)}\"); print(f\"      Event Types: {len(d.get('eventCounts', {}))}\"); counts=d.get('eventCounts', {}); [print(f\"      - {k}: {v}\") for k,v in list(counts.items())[:3]]" 2>/dev/null || echo "   ⚠️  البيانات غير متاحة"

    echo ""
fi

# ═══════════════════════════════════════════════════════════
echo ""
echo "═══════════════════════════════════════════════════════"
echo "📊 النتيجة النهائية"
echo "═══════════════════════════════════════════════════════"
echo ""

percentage=$((passed_checks * 100 / total_checks))

if [ $percentage -ge 90 ]; then
    status="${GREEN}ممتاز!${NC}"
    emoji="🎉"
elif [ $percentage -ge 70 ]; then
    status="${YELLOW}جيد${NC}"
    emoji="👍"
else
    status="${RED}يحتاج تحسين${NC}"
    emoji="⚠️"
fi

echo -e "   $emoji الاختبارات: ${GREEN}${passed_checks}${NC}/${total_checks} (${percentage}%)"
echo -e "   الحالة: $status"
echo ""

if [ "$SERVER_RUNNING" = false ]; then
    echo -e "   ${YELLOW}⚠️  ملاحظة: السيرفر غير مُشغّل${NC}"
    echo "   لتشغيل السيرفر: npm run dev"
    echo ""
fi

# ═══════════════════════════════════════════════════════════
echo "📝 ملخص المكونات"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "   🏗️  Infrastructure Layer:"
echo "      • MetricsCollector - Prometheus monitoring"
echo "      • EventBus - Event-driven architecture"
echo "      • NotificationService - Multi-channel alerts"
echo ""
echo "   🔗 Integration Layer:"
echo "      • SuperIntegration - Central orchestration"
echo ""
echo "   🌐 API Layer:"
echo "      • metrics.routes.ts - 8 REST endpoints"
echo ""
echo "   📚 Documentation:"
echo "      • SUPER_AI_SYSTEM.md - Complete guide"
echo "      • EXECUTION_COMPLETE.md - Implementation details"
echo "      • FINAL_EXECUTION_REPORT.md - Final report"
echo ""

# ═══════════════════════════════════════════════════════════
echo "🎯 الأوامر السريعة"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "   # مراقبة النظام"
echo "   curl http://localhost:5001/api/metrics"
echo ""
echo "   # حالة الصحة"
echo "   curl http://localhost:5001/api/health/metrics | jq"
echo ""
echo "   # إحصائيات الأحداث"
echo "   curl http://localhost:5001/api/events/stats | jq"
echo ""
echo "   # التقرير الكامل"
echo "   curl http://localhost:5001/api/system/report"
echo ""

echo "═══════════════════════════════════════════════════════"
echo "🦅 فديتك يا ملك! الفحص اكتمل"
echo "═══════════════════════════════════════════════════════"
echo ""
