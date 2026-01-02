# إصلاح خطأ Railway 502

## التغييرات المطبقة ✅

### 1. إصلاح مشكلة `import.meta.dirname` في البناء
**الملف:** [script/build.ts](script/build.ts)
- أضيف `"import.meta.dirname": "__dirname"` في `define` لـ esbuild

### 2. إصلاح مشكلة استيراد Vite في الإنتاج
**الملف:** [server/index.ts](server/index.ts)
- تم تغيير استيراد `setupVite` من استيراد ثابت إلى استيراد ديناميكي شرطي
- الآن يتم تحميل `vite` فقط في وضع التطوير، ليس في الإنتاج

### 3. إضافة تكوين Railway
**الملف:** `railway.json` (جديد)
- تكوين البناء والنشر لـ Railway

### 4. توثيق شامل
**الملفات الجديدة:**
- [.railway-env-checklist.md](.railway-env-checklist.md) - قائمة المتغيرات البيئية المطلوبة
- [RAILWAY_TROUBLESHOOTING.md](RAILWAY_TROUBLESHOOTING.md) - دليل استكشاف الأخطاء
- [railway-deploy-help.sh](railway-deploy-help.sh) - سكريبت مساعد للنشر

---

## الاختبار المحلي ✅

تم اختبار التطبيق محليًا في وضع الإنتاج:

```bash
# البناء نجح
npm run build
# ✅ Done in 240ms

# التشغيل نجح
NODE_ENV=production PORT=9003 ARC_OPERATOR_PASSWORD=arc-dev-password-123 npm start
# ✅ Server is live and listening on port 9003

# تسجيل الدخول نجح
curl -i -c /tmp/test-cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"password":"arc-dev-password-123"}' \
  http://localhost:9003/api/auth/login
# HTTP/1.1 200 OK
# Set-Cookie: arc.sid=...
# {"ok":true}
```

---

## الخطوات التالية للنشر على Railway 🚀

### 1. تأكد من إضافة المتغيرات البيئية

في Railway Dashboard → Variables:
```
ARC_OPERATOR_PASSWORD=arc-dev-password-123
SESSION_SECRET=<generate with: openssl rand -hex 32>
NODE_ENV=production
```

### 2. ادفع التغييرات إلى Git

```bash
git add .
git commit -m "fix: Railway deployment - fix Vite import and build config"
git push origin main
```

Railway ستقوم بإعادة البناء والنشر تلقائيًا.

### 3. انتظر اكتمال النشر

- افتح Railway Dashboard
- اذهب إلى "Deployments"
- انتظر حتى يكتمل البناء (عادة 2-3 دقائق)
- تحقق من Logs للتأكد من عدم وجود أخطاء

### 4. اختبر التطبيق

```bash
curl -i -c arc-cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"password":"<ARC_OPERATOR_PASSWORD>"}' \
  https://<YOUR_RAILWAY_APP_URL>/api/auth/login
```

ملاحظة: رابط Railway يتغير أحيانًا. مثال (قد يتغير): `https://mrf103arc-namer-production-236c.up.railway.app`

يجب أن تحصل على:
```
HTTP/2 200
set-cookie: arc.sid=...
{"ok":true}
```

---

## ملخص المشكلة والحل

### المشكلة الأصلية
```
HTTP/2 502 Bad Gateway
{"status":"error","code":502,"message":"Application failed to respond"}
```

### السبب الجذري
1. ❌ `vite` كان يتم استيراده في وضع الإنتاج
2. ❌ `vite` في قائمة `external` في esbuild
3. ❌ عند التشغيل: `Error: Cannot find module './vite'`

### الحل
✅ تحويل استيراد `vite` إلى استيراد ديناميكي شرطي:
```typescript
// قبل:
import { setupVite } from "./vite";
if (app.get("env") === "development") {
  await setupVite(httpServer, app);
}

// بعد:
if (app.get("env") === "development") {
  const { setupVite } = await import("./vite");
  await setupVite(httpServer, app);
}
```

---

## ملاحظات إضافية

### تحذيرات غير حرجة (يمكن تجاهلها)
- ⚠️ Supabase not configured - عادي إذا لم تكن تستخدم Supabase
- ⚠️ MemoryStore warning - عادي للتطبيقات الصغيرة

### إذا استمر خطأ 502
1. تحقق من Logs في Railway Dashboard
2. تأكد من إضافة `ARC_OPERATOR_PASSWORD` في Variables
3. تأكد من أن `NODE_ENV=production`
4. راجع [RAILWAY_TROUBLESHOOTING.md](RAILWAY_TROUBLESHOOTING.md)

---

تم الإصلاح بنجاح! 🎉
