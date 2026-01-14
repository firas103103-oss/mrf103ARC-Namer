# ARC Execution Baseline Report

التاريخ: 2026-01-01

> مصدر الحقيقة للواجهة: `client/`
> 
> ملاحظة: لم يتم تعديل أي نسخة “read-only” خارج `client/` (لا يوجد دمج لواجهات تجريبية).

---

## ملخص الحالة

- **PHASE_1_STATUS = PASS**
- **PHASE_2_STATUS = PASS**
- **PHASE_3_STATUS = PASS**
- **PHASE_4_STATUS = PASS**

---

## Phase 1 — Stabilize Runtime (Foundation)

### ما تم التحقق منه
- تشغيل النظام في وضع التطوير عبر `npm run dev` (الخلفية + Vite middleware).
- التحقق من استجابة الخلفية:
  - `GET /api/health` يعيد JSON بنجاح.
- التحقق من تشغيل الواجهة:
  - `GET /` يعيد `200 OK` و`Content-Type: text/html`.

### النتيجة
- PASS (لا توجد أخطاء قاتلة تمنع التشغيل end-to-end؛ توجد تحذيرات غير قاتلة في السجلات).

---

## Phase 2 — Security Hardening (Critical)

### الهدف
إزالة أي وصول مباشر إلى Supabase من المتصفح، وإجبار جميع الوصوليات عبر الخلفية فقط.

### ما تم تنفيذه
- **تعطيل إنشاء Supabase client داخل المتصفح** (لا `createClient()` ولا REST مباشر).
- إضافة واجهات خلفية مؤمنة بالجلسة (Session) مع:
  - **Session validation** عبر cookie `arc.sid` (httpOnly)
  - **Rate limiting** داخل الذاكرة
  - **Field whitelisting** (إرجاع حقول محددة فقط للعميل)

### الواجهات المؤمنة
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/user`
- `GET /api/arc/command-log`
- `GET /api/arc/agent-events`
- `GET /api/arc/command-metrics`
- `GET /api/arc/selfcheck`

### تأكيدات أمنية
- لا يوجد استدعاء Supabase SDK/REST من داخل `client/`.
- مفاتيح Supabase ذات الصلاحيات (Service Role) مطلوبة **فقط** على السيرفر (متغير بيئة `SUPABASE_SERVICE_ROLE_KEY`).

---

## Phase 3 — Live Chat (Realtime MVP)

### النطاق (مطبق حرفياً)
- نص فقط
- وكيل واحد: **Mr.F**
- غرفة واحدة
- لا صوت
- لا توجيه متعدد الوكلاء

### ما تم تنفيذه
- قناة WebSocket واحدة على:
  - `GET ws(s)://<host>/realtime`
- القناة تتطلب جلسة مصادق عليها (Session)؛ اتصال بدون جلسة يفشل.
- Round-trip messaging:
  - يستقبل رسالة نصية
  - يعيد رد نصي من “Mr.F”
  - مع تسجيل best-effort للتفاعل (بدون كسر التشغيل إذا لم تتوفر Supabase)

### ملاحظة تشغيلية
- إذا لم يكن `OPENAI_API_KEY` مضبوطاً، يرد السيرفر برد “offline” (لتبقى الدردشة تعمل بدون انهيار).

---

## Phase 4 — Verification & Lock

### إعادة التحقق
- الواجهة `GET /` تعمل.
- الخلفية `GET /api/health` تعمل.
- القناة `WebSocket /realtime`:
  - ترفض الاتصالات غير المصادقة.
  - تقبل الاتصالات المصادقة وتعيد رد نصي.

### Baseline / Git
- **Base commit (HEAD):** 44dac5bee90fe4374fd69e7a568c16d63ea237b4
- **Working tree:** DIRTY (تغييرات غير مُلتزمة بعد)

---

## المتطلبات البيئية (لتشغيل كامل)

- `ARC_OPERATOR_PASSWORD` (مطلوب لتسجيل الدخول للجلسة)
- `SUPABASE_URL` و `SUPABASE_SERVICE_ROLE_KEY` (اختياريان حسب استخدام لوحات البيانات؛ بدونها ستظهر `503 supabase_not_configured` على واجهات البيانات)
- `OPENAI_API_KEY` (اختياري لتفعيل ردود الذكاء؛ بدونه الدردشة تعمل بوضع offline)

---

## Known Limitations

- لا توجد واجهة UI لتسجيل الدخول داخل المتصفح (تسجيل الدخول يتم عبر `POST /api/auth/login` حالياً).
- في حال عدم ضبط Supabase، واجهات لوحات البيانات سترجع `503` (وهذا متعمد لتفادي أي وصول غير آمن).

---

## ما هو غير مُنفذ (Explicitly NOT Implemented)

- Voice chat أو تحويل صوت
- Multi-agent routing
- وصول Supabase من المتصفح (SDK أو REST)
- أي مزايا جديدة خارج نطاق phases 1–4

---

## تأكيد قابلية الاستخدام

- النظام **قابل للاستخدام لمشغّل واحد (Mr.F)** عبر:
  - تشغيل السيرفر/الواجهة
  - تسجيل الدخول للجلسة
  - استخدام دردشة realtime النصية
