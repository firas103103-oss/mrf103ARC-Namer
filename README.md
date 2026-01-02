
# mrf103ARC-Namer

ARC Operator UI + backend (Express) مع مصادقة session-cookie وRealtime عبر WebSocket.

## تشغيل محليًا

### المتطلبات
- Node.js (يفضّل 20+)

### الإعداد
1) تثبيت الحزم:

```bash
npm install
```

2) إنشاء ملف `.env` (أو ضبط env vars) — أقل حد مطلوب لتسجيل الدخول:

```bash
ARC_OPERATOR_PASSWORD=change-me
SESSION_SECRET=change-me-too
```

ملاحظات:
- تسجيل الدخول يقارن كلمة المرور مع `ARC_OPERATOR_PASSWORD` (أو `ARC_BACKEND_SECRET` كـ fallback).
- لا يوجد token في المتصفح: المصادقة تتم عبر session cookie (`arc.sid`).

3) التشغيل:

```bash
npm run dev
```

ثم افتح:
- `http://localhost:5001`

## Production

### Build
```bash
npm run build
```

### Start
```bash
npm run start
```

## نقاط النهاية (مختصر)

### Auth (cookie/session)
- `POST /api/auth/login` body: `{ "password": "..." }`
- `GET /api/auth/user`
- `POST /api/auth/logout`

### Realtime
- WebSocket: `GET /realtime`
	- يرسل رسائل مثل: `{ "type": "new_activity", "payload": { ... } }`

### Master-Agent Bridge
- `POST /api/call_mrf_brain` (يتطلب جلسة Operator)

## ملاحظات Supabase

بعض لوحات البيانات وRealtime تعتمد على Supabase (في السيرفر فقط). عند غياب الإعدادات ستعمل المنظومة بوضوح في وضع degraded بدل الانهيار.

المتغيرات الشائعة:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

