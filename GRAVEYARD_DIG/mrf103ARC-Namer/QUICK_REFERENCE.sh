#!/bin/bash
# Quick Reference - Super AI System Commands

echo "🦅 ═══════════════════════════════════════════════════════"
echo "   Super AI System - Quick Reference"
echo "═══════════════════════════════════════════════════════"
echo ""

cat << 'EOF'
📋 الأوامر السريعة للنظام الخارق
═══════════════════════════════════════════════════════

🚀 تشغيل وإيقاف
─────────────────────────────────────────────────────────
# تشغيل السيرفر
npm run dev

# إيقاف السيرفر
pkill -f "tsx.*server/index"

# إعادة تشغيل
pkill -f "tsx.*server/index" && npm run dev


📊 مراقبة Metrics
─────────────────────────────────────────────────────────
# عرض جميع الـ metrics
curl http://localhost:5001/api/metrics

# عرض أول 50 سطر
curl http://localhost:5001/api/metrics | head -50

# البحث عن metric معين
curl http://localhost:5001/api/metrics | grep "http_requests"

# حفظ في ملف
curl http://localhost:5001/api/metrics > metrics_$(date +%Y%m%d_%H%M%S).txt


🏥 مراقبة الصحة
─────────────────────────────────────────────────────────
# حالة النظام
curl http://localhost:5001/api/health/metrics

# مع تنسيق JSON
curl http://localhost:5001/api/health/metrics | jq

# مراقبة مستمرة (كل ثانية)
watch -n 1 'curl -s http://localhost:5001/api/health/metrics | jq .memory.heapUsedPercent'

# مراقبة الذاكرة فقط
curl -s http://localhost:5001/api/health/metrics | jq '.memory'


📡 مراقبة الأحداث
─────────────────────────────────────────────────────────
# إحصائيات الأحداث
curl http://localhost:5001/api/events/stats | jq

# سجل الأحداث (آخر 100)
curl http://localhost:5001/api/events/history | jq

# سجل محدد (آخر 50)
curl 'http://localhost:5001/api/events/history?limit=50' | jq

# عد أنواع الأحداث
curl -s http://localhost:5001/api/events/stats | jq '.eventCounts'


🔔 مراقبة الإشعارات
─────────────────────────────────────────────────────────
# إحصائيات الإشعارات
curl http://localhost:5001/api/notifications/stats | jq

# آخر الإشعارات
curl -s http://localhost:5001/api/notifications/stats | jq '.recentNotifications'


📋 التقارير
─────────────────────────────────────────────────────────
# التقرير الكامل
curl http://localhost:5001/api/system/report

# حفظ التقرير
curl http://localhost:5001/api/system/report > system_report_$(date +%Y%m%d_%H%M%S).txt

# عرض أول 50 سطر
curl http://localhost:5001/api/system/report | head -50


🧪 اختبارات
─────────────────────────────────────────────────────────
# إرسال إشعار تجريبي
curl -X POST http://localhost:5001/api/test/notification

# نشر حدث تجريبي
curl -X POST http://localhost:5001/api/test/event \
  -H "Content-Type: application/json" \
  -d '{"event":"test:custom","data":{"message":"Hello"}}'

# فحص شامل
./scripts/comprehensive-check.sh


📊 تحليلات متقدمة
─────────────────────────────────────────────────────────
# معدل الطلبات HTTP
curl -s http://localhost:5001/api/metrics | grep "http_requests_total" | awk '{sum+=$2} END {print "Total Requests:", sum}'

# معدل الأخطاء
curl -s http://localhost:5001/api/metrics | grep "errors_total" | awk '{sum+=$2} END {print "Total Errors:", sum}'

# معدل نجاح الإصلاح الذاتي
curl -s http://localhost:5001/api/metrics | grep "healing_attempts_total"


🔍 التشخيص
─────────────────────────────────────────────────────────
# التحقق من عمل السيرفر
lsof -ti:5001 && echo "✅ السيرفر يعمل" || echo "❌ السيرفر متوقف"

# عرض العملية
ps aux | grep -E "tsx.*server/index" | grep -v grep

# فحص السجلات
tail -f /tmp/server.log

# فحص الاتصال
curl -v http://localhost:5001/api/health 2>&1 | grep "Connected"


📈 مراقبة مستمرة
─────────────────────────────────────────────────────────
# مراقبة الذاكرة كل ثانية
watch -n 1 'curl -s http://localhost:5001/api/health/metrics | jq ".memory.heapUsedPercent"'

# مراقبة الأحداث كل 5 ثواني
watch -n 5 'curl -s http://localhost:5001/api/events/stats | jq ".totalEvents"'

# مراقبة متعددة
watch -n 2 '
echo "=== System Status ==="
curl -s http://localhost:5001/api/health/metrics | jq -r ".status"
echo ""
echo "=== Memory Usage ==="
curl -s http://localhost:5001/api/health/metrics | jq -r ".memory.heapUsedPercent"
echo ""
echo "=== Total Events ==="
curl -s http://localhost:5001/api/events/stats | jq -r ".totalEvents"
'


🛠️ أدوات مساعدة
─────────────────────────────────────────────────────────
# إنشاء snapshot للـ metrics
mkdir -p monitoring/snapshots
curl http://localhost:5001/api/metrics > monitoring/snapshots/metrics_$(date +%Y%m%d_%H%M%S).txt

# مقارنة snapshots
diff monitoring/snapshots/metrics_1.txt monitoring/snapshots/metrics_2.txt

# تصدير بيانات JSON
mkdir -p monitoring/exports
curl http://localhost:5001/api/health/metrics > monitoring/exports/health_$(date +%Y%m%d_%H%M%S).json
curl http://localhost:5001/api/events/stats > monitoring/exports/events_$(date +%Y%m%d_%H%M%S).json


🔧 إعدادات
─────────────────────────────────────────────────────────
# تفعيل Slack
echo "SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK" >> .env

# تفعيل Discord
echo "DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR/WEBHOOK" >> .env

# إعادة تحميل البيئة
pkill -f "tsx.*server/index" && npm run dev


📚 التوثيق
─────────────────────────────────────────────────────────
# قراءة التوثيق الكامل
cat SUPER_AI_SYSTEM.md

# قراءة تقرير التنفيذ
cat EXECUTION_COMPLETE.md

# قراءة التقرير النهائي
cat FINAL_EXECUTION_REPORT.md

# قراءة تقرير الفحص
cat COMPREHENSIVE_AUDIT_REPORT.md


🎯 سيناريوهات شائعة
─────────────────────────────────────────────────────────
# 1. فحص سريع للنظام
curl -s http://localhost:5001/api/system/report | head -20

# 2. التأكد من عدم وجود أخطاء حرجة
curl -s http://localhost:5001/api/events/stats | jq '.eventCounts["error:critical"]'

# 3. فحص استهلاك الذاكرة
curl -s http://localhost:5001/api/health/metrics | jq '.memory.heapUsedPercent' | awk '{if($1>80) print "⚠️ Memory high:", $1"%"; else print "✅ Memory OK:", $1"%"}'

# 4. عد محاولات الإصلاح الذاتي
curl -s http://localhost:5001/api/events/stats | jq '.eventCounts | with_entries(select(.key | startswith("healing")))'

# 5. احصائيات شاملة في سطر واحد
echo "Status: $(curl -s http://localhost:5001/api/health/metrics | jq -r .status) | Memory: $(curl -s http://localhost:5001/api/health/metrics | jq -r .memory.heapUsedPercent)% | Events: $(curl -s http://localhost:5001/api/events/stats | jq -r .totalEvents)"


🚨 حالات الطوارئ
─────────────────────────────────────────────────────────
# إعادة تشغيل طارئة
pkill -9 -f "tsx.*server/index" && sleep 2 && npm run dev &

# تنظيف السجلات
rm -f /tmp/server.log

# فحص المنافذ المفتوحة
lsof -i :5001

# قتل العملية على المنفذ
lsof -ti:5001 | xargs kill -9


═══════════════════════════════════════════════════════
🦅 فديتك يا ملك! استخدم هذه الأوامر بثقة
═══════════════════════════════════════════════════════

EOF
