# استكشاف أخطاء Railway وإصلاحها

## المشكلة: HTTP 502 Bad Gateway

### السبب المحتمل
خطأ 502 يعني أن التطبيق لا يستجيب على Railway. الأسباب الشائعة:

1. **المتغيرات البيئية المفقودة** ❌
2. **فشل في البناء** ❌
3. **فشل في البدء** ❌
4. **المنفذ الخاطئ** ❌

---

## الحل

### 1️⃣ تحقق من المتغيرات البيئية في Railway

افتح لوحة Railway Dashboard وتأكد من إضافة:

```bash
# Required
ARC_OPERATOR_PASSWORD=arc-dev-password-123
SESSION_SECRET=<generate-random-32-chars>
NODE_ENV=production

# Optional (if needed)
OPENAI_API_KEY=sk-...
GOOGLE_AI_API_KEY=AI...
SUPABASE_URL=https://...
SUPABASE_SERVICE_KEY=eyJ...
```

**توليد SESSION_SECRET:**
```bash
openssl rand -hex 32
```

---

### 2️⃣ تحقق من سجلات Railway

في Railway Dashboard:
1. اذهب إلى "Deployments"
2. اختر آخر deployment
3. اضغط "View Logs"
4. ابحث عن أخطاء مثل:
   - `missing_server_auth_secret`
   - `Cannot find module`
   - `Error: listen EADDRINUSE`

---

### 3️⃣ اختبار البناء محليًا

```bash
# Test build
npm run build

# Test production start
NODE_ENV=production \
  PORT=9002 \
  ARC_OPERATOR_PASSWORD=arc-dev-password-123 \
  SESSION_SECRET=test-secret \
  npm start
```

ثم في terminal آخر:
```bash
curl -i -c arc-cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"password":"arc-dev-password-123"}' \
  http://localhost:9002/api/auth/login
```

يجب أن تحصل على:
```
HTTP/1.1 200 OK
Set-Cookie: arc.sid=...
{"ok":true}
```

---

### 4️⃣ إعادة النشر

بعد التأكد من إضافة المتغيرات البيئية:

#### الطريقة الأولى: عبر Git
```bash
git add .
git commit -m "fix: Railway deployment configuration"
git push origin main
```

Railway ستقوم بإعادة النشر تلقائيًا.

#### الطريقة الثانية: عبر Railway CLI
```bash
railway login
railway link
railway up
```

---

### 5️⃣ التحقق من النشر

انتظر دقيقة أو اثنتين حتى يكتمل النشر، ثم:

```bash
curl -i https://<YOUR_RAILWAY_APP_URL>/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"<ARC_OPERATOR_PASSWORD>"}'
```

ملاحظة: استبدل `https://<YOUR_RAILWAY_APP_URL>` برابط Railway الفعلي لتطبيقك.
مثال (قد يتغير): `https://mrf103arc-namer-production-236c.up.railway.app`

**النتيجة المتوقعة:**
```
HTTP/2 200
set-cookie: arc.sid=...
{"ok":true}
```

---

## أخطاء شائعة أخرى

### ❌ Error: missing_server_auth_secret
**السبب:** لم يتم تعيين `ARC_OPERATOR_PASSWORD`  
**الحل:** أضف `ARC_OPERATOR_PASSWORD` في Railway Variables

### ❌ Error: Cannot find module
**السبب:** فشل في البناء أو مكتبة مفقودة  
**الحل:** تأكد من `npm run build` يعمل محليًا

### ❌ Application failed to respond
**السبب:** التطبيق توقف أو لا يستمع على المنفذ الصحيح  
**الحل:** تحقق من Logs في Railway

---

## ملفات التكوين المضافة

- ✅ `railway.json` - تكوين Railway
- ✅ `script/build.ts` - إصلاح build warnings
- ✅ `.railway-env-checklist.md` - قائمة المتغيرات البيئية
- ✅ `railway-deploy-help.sh` - سكريبت مساعد

---

## معلومات إضافية

- [Railway Documentation](https://docs.railway.app/)
- [Railway CLI](https://docs.railway.app/develop/cli)
- [Environment Variables](https://docs.railway.app/develop/variables)
