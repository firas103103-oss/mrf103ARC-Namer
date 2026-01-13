# 🔒 دليل إعداد SSL و Domain Configuration
**التاريخ:** 6 يناير 2026  
**Domain:** app.mrf103.com

---

## ✅ ما تم إنجازه

### 1. CORS Configuration ✅
```typescript
// تم تحديث server/index.ts
const allowedOrigins = [
  'http://localhost:9002',           // Development
  'http://localhost:5173',           // Vite dev
  'https://app.mrf103.com',          // Production domain ✅
  'https://mrf103arc-namer-production-236c.up.railway.app',
  process.env.VITE_API_URL,
];
```

### 2. Environment Variables ✅
```bash
# .env.production
VITE_API_URL=https://app.mrf103.com
```

---

## 🚀 خطوات التكوين المتبقية

### 1️⃣ **Supabase Configuration** (مهم!)

#### أ) في لوحة Supabase:
```
1. اذهب إلى: https://supabase.com/dashboard
2. اختر مشروعك: rffpacsvwxfjhxgtsbzf
3. Settings → API → URL Configuration
4. أضف إلى "Site URL":
   - https://app.mrf103.com
   
5. أضف إلى "Redirect URLs":
   - https://app.mrf103.com
   - https://app.mrf103.com/*
   - https://app.mrf103.com/auth/callback
```

#### ب) Authentication Settings:
```
Settings → Authentication → URL Configuration
- Site URL: https://app.mrf103.com
- Redirect URLs: أضف كل URLs أعلاه
```

---

### 2️⃣ **SSL Certificate** (إلزامي للإنتاج!)

#### الطريقة 1: استخدام Cloudflare (موصى به) ⭐
```
مزايا:
✅ مجاني تماماً
✅ SSL تلقائي
✅ CDN مدمج
✅ DDoS protection
✅ إعداد سهل

الخطوات:
1. أنشئ حساب في Cloudflare
2. أضف domain: app.mrf103.com
3. غير Nameservers عند مزود النطاق
4. فعّل SSL/TLS (Full أو Full Strict)
5. أضف DNS Record:
   Type: CNAME
   Name: app
   Target: your-railway-app.up.railway.app
   Proxy: ON (البرتقالي)
```

#### الطريقة 2: Let's Encrypt (مباشرة)
```
الأدوات:
- Certbot
- acme.sh

الخطوات (على الخادم):
1. تثبيت Certbot:
   $ sudo apt-get install certbot python3-certbot-nginx

2. الحصول على شهادة:
   $ sudo certbot --nginx -d app.mrf103.com

3. التجديد التلقائي:
   $ sudo certbot renew --dry-run
```

#### الطريقة 3: Railway SSL (إذا كان Host على Railway)
```
Railway Dashboard:
1. Settings → Domains
2. أضف Custom Domain: app.mrf103.com
3. اتبع تعليمات DNS
4. انتظر SSL provisioning (5-10 دقائق)
```

---

### 3️⃣ **DNS Configuration**

#### إذا كان Host على Railway:
```
عند مزود النطاق (Namecheap/GoDaddy/etc):

A Record:
Type: A
Host: app
Value: [Railway IP address]
TTL: Automatic

أو CNAME:
Type: CNAME
Host: app
Value: mrf103arc-namer-production-236c.up.railway.app
TTL: Automatic
```

#### إذا كان Host على VPS:
```
A Record:
Type: A
Host: app
Value: [Your VPS IP]
TTL: 3600
```

---

### 4️⃣ **Nginx Configuration** (إذا كان على VPS)

```nginx
# /etc/nginx/sites-available/app.mrf103.com
server {
    listen 80;
    server_name app.mrf103.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.mrf103.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/app.mrf103.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.mrf103.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Proxy to Node.js app
    location / {
        proxy_pass http://localhost:9002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /realtime {
        proxy_pass http://localhost:9002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## ✅ قائمة التحقق النهائية

### قبل الإطلاق:
```
□ CORS origins محدثة في server/index.ts ✅
□ .env.production يحتوي على https://app.mrf103.com ✅
□ Supabase Redirect URLs محدثة
□ SSL Certificate مثبت
□ DNS records محدثة
□ Domain يشير إلى الخادم الصحيح
□ Nginx configured (إذا لزم الأمر)
□ اختبار HTTPS يعمل
□ اختبار تسجيل الدخول
□ اختبار WebSocket
```

### اختبارات الإنتاج:
```bash
# 1. اختبار SSL
$ curl -I https://app.mrf103.com

# 2. اختبار API
$ curl https://app.mrf103.com/api/health

# 3. اختبار CORS
$ curl -H "Origin: https://app.mrf103.com" \
  -H "Access-Control-Request-Method: POST" \
  -X OPTIONS https://app.mrf103.com/api/login

# 4. اختبار WebSocket
$ wscat -c wss://app.mrf103.com/realtime
```

---

## 📋 Environment Variables للإنتاج

```bash
# على الخادم أو في Railway Dashboard
NODE_ENV=production
PORT=9002

# Database
DATABASE_URL=postgresql://...

# Supabase
SUPABASE_URL=https://rffpacsvwxfjhxgtsbzf.supabase.co
SUPABASE_KEY=eyJhbGc...
VITE_SUPABASE_URL=https://rffpacsvwxfjhxgtsbzf.supabase.co
VITE_SUPABASE_KEY=eyJhbGc...

# Authentication
ARC_OPERATOR_PASSWORD=your-strong-password-here
ARC_BACKEND_SECRET=your-backend-secret
SESSION_SECRET=your-64-char-session-secret

# API Keys
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-...
ELEVENLABS_API_KEY=...

# Frontend
VITE_API_URL=https://app.mrf103.com
VITE_APP_NAME=ARC Operator
VITE_ENVIRONMENT=production
```

---

## 🔍 استكشاف الأخطاء

### مشكلة: CORS Error
```
الحل:
1. تأكد من CORS origins في server/index.ts
2. تحقق من headers في الطلب
3. راجع console logs على الخادم
```

### مشكلة: SSL Certificate Error
```
الحل:
1. تأكد من صحة الشهادة: 
   $ openssl s_client -connect app.mrf103.com:443
2. تحقق من تاريخ انتهاء الصلاحية
3. جدد الشهادة إذا لزم الأمر
```

### مشكلة: Domain لا يعمل
```
الحل:
1. تحقق من DNS propagation:
   $ dig app.mrf103.com
   $ nslookup app.mrf103.com
2. انتظر 24-48 ساعة لانتشار DNS
3. امسح DNS cache المحلي
```

---

## 📞 روابط مهمة

- **Cloudflare:** https://dash.cloudflare.com
- **Let's Encrypt:** https://letsencrypt.org
- **SSL Labs Test:** https://www.ssllabs.com/ssltest/
- **DNS Checker:** https://dnschecker.org
- **Railway:** https://railway.app/dashboard

---

**الحالة:** 🟡 في انتظار إعداد SSL وتحديث Supabase  
**آخر تحديث:** 6 يناير 2026
