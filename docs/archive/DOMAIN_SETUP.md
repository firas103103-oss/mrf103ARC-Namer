# 🌐 إعداد الدومين: app.mrf103.com

## ✅ الإعدادات الحالية

**الدومين:** `app.mrf103.com` (subdomain)  
**Root Domain:** `mrf103.com`  
**المزود:** Squarespace Domains  
**DNS Manager:** Squarespace (مع Google Workspace)  
**الاستضافة:** Railway

---

## 📋 خطوات الربط

### 1️⃣ في Railway Dashboard

```
https://railway.app/dashboard
```

1. اختر مشروع: **mrf103ARC-Namer**
2. اذهب إلى: **Settings → Domains**
3. اضغط: **"+ Add Domain"**
4. أدخل: `mr.f103.com`
5. انسخ الـ**CNAME Value** (مثل: `your-app.up.railway.app`)

---Squarespace DNS Settings

```
https://account.squarespace.com/domains
→ اختر mrf103.com
→ DNS Settings
→ Custom records
```

#### إضافة CNAME للـSubdomain:

**اضغط "Add record" تحت "Custom records":**

```
Host: app
Type: CNAME
Priority: N/A
TTL: 4 hrs
Data: [القيمة من Railway].up.railway.app
```

**مثال:**
```
Host: app
Type: CNAME
Data: mrf103arc-production.up.railway.app
TTL: 4 hrs
```

**⚠️ مهم:** 
- لا تضع النقطة في نهاية Data في Squarespace
- Root domain (@) يبقى A record للموقع الحالي
- Subdomain (app) يروح لـRailway

**⚠️ ملاحظة:** أضف نقطة (.) في نهاية الـData إذا طلب Google Domains

---

## ⏰ وقت التفعيل

- **DNS Propagation:** 5-30 دقيقة
- **SSL Certificate:** تلقائي من Railway (مجاناً)
- **تحقق:** `https://mr.f103.com`

---

## 🔍 التحقق من التفعيل

```bash
# Test DNS
nslookup mr.f103.com

# Test HTTPS
curl -I https://mr.f103.com

# Test في المتصفح
https://mr.f103.com
https://mr.f103.com/api/docs
```

---

## 📊 الـEndpoints المتاحة

بعد التفعيل:

- **🏠 Homepage:** `https://mr.f103.com`
- **📚 API Docs:** `https://mr.f103.com/api/docs`
- **🔐 Login:** `https://mr.f103.com/api/auth/login`
- **🤖 Agents:** `https://mr.f103.com/api/agents`

---

## 🛡️ أمان إضافي (اختياري)

### في Google Domains - DNSSEC:

1. اذهب إلى: **DNSSEC**
2. فعّل: **Turn on DNSSEC**
3. انتظر 24 ساعة للتفعيل

### في Railway - Environment Variables:

```bash
# أضف في Railway Dashboard → Variables
ALLOWED_ORIGINS=https://mr.f103.com
DOMAIN=mr.f103.com
NODE_ENV=production
```

---

## 🔄 Redirect (اختياري)

### www → non-www

في Google Domains أضف:

```
Type: CNAME
Name: www
Data: mr.f103.com.
TTL: 3600
```

في Railway، فعّل: **"Redirect www to apex domain"**

---

## 📧 Email Setup (اختياري)

إذا بدك email مثل `info@mr.f103.com`:

### خيارات:

1. **Google Workspace** ($6/شهر)
   - `admin@mr.f103.com`
   - `support@mr.f103.com`

2. **Cloudflare Email Routing** (مجاني)
   - Forward إلى Gmail الشخصي

3. **Zoho Mail** (مجاني حتى 5 users)

---

## ✅ Checklist

- [ ] أضف الدومين في Railway
- [ ] انسخ CNAME Value من Railway
- [ ] أضف CNAME في Google Domains
- [ ] انتظر 10-30 دقيقة
- [ ] تحقق من `https://mr.f103.com`
- [ ] جرب `/api/docs`
- [ ] فعّل DNSSEC (اختياري)
- [ ] إعداد Email (اختياري)

---

## 🆘 حل المشاكل

### المشكلة: "DNS_PROBE_FINISHED_NXDOMAIN"

**الحل:**
- انتظر 30 دقيقة للـDNS propagation
- تحقق من CNAME في Google Domains
- امسح DNS cache: `ipconfig /flushdns` (Windows) أو `sudo dscacheutil -flushcache` (Mac)

### المشكلة: "SSL Certificate Error"

**الحل:**
- Railway يولد SSL تلقائياً
- انتظر 5-10 دقائق بعد تفعيل DNS
- تأكد من استخدام `https://` وليس `http://`

### المشكلة: "502 Bad Gateway"

**الحل:**
- تحقق من Railway Logs
- تأكد من Environment Variables
- تحقق من أن التطبيق يشتغل على Railway

---

## 📞 الدعم

- Railway Docs: https://docs.railway.app/deploy/deployments
- Google Domains Help: https://support.google.com/domains

---

**تم التحديث:** 2026-01-04  
**الدومين:** mr.f103.com  
**الحالة:** ⏳ في انتظار الإعداد
