# 📋 دليل نظام الاستنساخ الكامل (Cloning System)

## 🎯 نظرة عامة

نظام **Cloning** هو نظام متكامل يسمح للمستخدمين بإنشاء نسخة رقمية كاملة من أنفسهم من خلال تسجيل معلوماتهم الشخصية، رفع ملفات متعددة (صوت، صور، مستندات)، واختيار أجهزة IoT والتكاملات المطلوبة.

---

## 🔑 المميزات الرئيسية

### 1. **حماية بالـ Passcode**
- رمز مرور ثابت: `passcodemrf1Q@`
- التحقق قبل الوصول لواجهة التسجيل
- حماية من الوصول غير المصرح به

### 2. **رفع ملفات متعددة**
- **عينات صوتية**: حتى 5 ملفات (mp3, wav, ogg, webm)
- **صور**: حتى 10 صور (jpg, png, gif, webp)
- **مستندات**: حتى 10 ملفات (pdf, doc, docx, txt)
- حجم أقصى لكل ملف: **50MB**

### 3. **معلومات شاملة**
- معلومات أساسية (الاسم، البريد، الهاتف)
- معلومات شخصية (المهارات، الوظيفة، النبذة)
- معلومات المشاريع (GitHub, GitLab, Portfolio)
- معلومات التواصل (LinkedIn, Twitter, Telegram)

### 4. **أجهزة IoT**
| الجهاز | الحالة |
|--------|--------|
| XBio Sentinel | ✅ متاح |
| Personal XBio | ✅ متاح |
| Auto XBio | ✅ متاح |
| Home XBio | ⏳ قريباً |
| Enterprise XBio | ⏳ قريباً |
| Medical XBio | ⏳ قريباً |
| Research XBio | ⏳ قريباً |

### 5. **التكاملات**
| التكامل | الحالة |
|---------|--------|
| Google OAuth | ✅ متاح |
| GitHub | ✅ متاح |
| OpenAI | ✅ متاح |
| Anthropic Claude | ✅ متاح |
| Google Gemini | ✅ متاح |
| Slack | ⏳ قريباً |
| Discord | ⏳ قريباً |
| Notion | ⏳ قريباً |
| Zapier | ⏳ قريباً |
| Make | ⏳ قريباً |

---

## 🗄️ هيكل قاعدة البيانات

### 1. جدول `user_profiles`
```sql
CREATE TABLE user_profiles (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR NOT NULL UNIQUE,
  email VARCHAR NOT NULL UNIQUE,
  phone_number VARCHAR,
  password VARCHAR NOT NULL, -- Hashed with bcrypt
  personal_info JSONB DEFAULT '{}',
  projects_info JSONB DEFAULT '{}',
  social_info JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_username ON user_profiles(username);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
```

### 2. جدول `user_files`
```sql
CREATE TABLE user_files (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  file_type VARCHAR NOT NULL, -- 'voice', 'photo', 'document'
  file_name VARCHAR NOT NULL,
  file_path VARCHAR NOT NULL,
  file_size INTEGER, -- in bytes
  mime_type VARCHAR,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_files_user_id ON user_files(user_id);
```

### 3. جدول `user_iot_devices`
```sql
CREATE TABLE user_iot_devices (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  device_type VARCHAR NOT NULL,
  device_name VARCHAR,
  device_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  added_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_iot_devices_user_id ON user_iot_devices(user_id);
```

---

## 🔌 API Endpoints

### 1. **POST** `/api/cloning/verify-passcode`
التحقق من رمز المرور.

**Request Body:**
```json
{
  "passcode": "passcodemrf1Q@"
}
```

**Response:**
```json
{
  "success": true,
  "message": "تم التحقق بنجاح"
}
```

---

### 2. **POST** `/api/cloning/register`
تسجيل مستخدم جديد مع رفع الملفات.

**Request:** `multipart/form-data`

**Fields:**
- `username` (string, required)
- `email` (string, required)
- `phoneNumber` (string, optional)
- `password` (string, required)
- `personalInfo` (JSON string)
- `projectsInfo` (JSON string)
- `socialInfo` (JSON string)
- `selectedDevices` (JSON array)
- `selectedIntegrations` (JSON array)
- `voiceSamples` (files[], max 5)
- `photos` (files[], max 10)
- `documents` (files[], max 10)

**Response:**
```json
{
  "success": true,
  "message": "تم التسجيل بنجاح",
  "data": {
    "user": {
      "id": "uuid",
      "username": "user123",
      "email": "user@example.com"
    },
    "filesCount": 8,
    "devicesCount": 3
  }
}
```

---

### 3. **GET** `/api/cloning/profile/:userId`
الحصول على معلومات المستخدم الكاملة.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "user123",
      "email": "user@example.com",
      "phoneNumber": "+1234567890",
      "personalInfo": { "skills": "JS, Python", "jobTitle": "Developer" },
      "projectsInfo": { "github": "https://github.com/user" },
      "socialInfo": { "linkedin": "https://linkedin.com/in/user" },
      "createdAt": "2026-01-06T..."
    },
    "files": [
      {
        "id": "uuid",
        "fileType": "voice",
        "fileName": "sample.mp3",
        "filePath": "/uploads/cloning/...",
        "fileSize": 1048576,
        "mimeType": "audio/mpeg"
      }
    ],
    "devices": [
      {
        "id": "uuid",
        "deviceType": "xbio_sentinel",
        "deviceName": "XBio Sentinel",
        "isActive": true
      }
    ]
  }
}
```

---

### 4. **PUT** `/api/cloning/profile/:userId`
تحديث معلومات المستخدم وإضافة ملفات جديدة.

**Request:** `multipart/form-data`

**Fields:**
- `personalInfo` (JSON string, optional)
- `projectsInfo` (JSON string, optional)
- `socialInfo` (JSON string, optional)
- `voiceSamples` (files[], optional)
- `photos` (files[], optional)
- `documents` (files[], optional)

**Response:**
```json
{
  "success": true,
  "message": "تم تحديث المعلومات بنجاح",
  "data": {
    "newFilesCount": 3
  }
}
```

---

## 📁 هيكل الملفات

```
/workspaces/mrf103ARC-Namer/
├── server/
│   └── routes/
│       └── cloning.ts          # API endpoints
├── client/
│   └── src/
│       └── pages/
│           └── Cloning.tsx     # واجهة المستخدم
├── shared/
│   └── schema.ts               # Database schema (added tables)
└── uploads/
    └── cloning/                # مجلد تخزين الملفات المرفوعة
```

---

## 🎨 واجهة المستخدم

### **المرحلة 1: التحقق من الـ Passcode**
- شاشة تسجيل دخول بسيطة
- إدخال رمز المرور
- تصميم جرادينت من البنفسجي إلى الأزرق

### **المرحلة 2: نموذج التسجيل**
يحتوي على 6 أقسام رئيسية:

1. **معلومات أساسية**
   - اسم المستخدم، البريد، الهاتف
   - كلمة المرور + تأكيد
   - المهارات، الوظيفة، النبذة

2. **رفع الملفات**
   - عينات صوتية (مع أيقونة FileAudio)
   - صور (مع معاينة)
   - مستندات (مع أيقونة FileText)

3. **معلومات المشاريع**
   - روابط GitHub, GitLab, Portfolio

4. **التواصل الاجتماعي**
   - LinkedIn, Twitter, Telegram

5. **أجهزة IoT**
   - اختيار متعدد مع أيقونات
   - تمييز الأجهزة المتاحة/قريباً

6. **التكاملات**
   - اختيار متعدد
   - تمييز التكاملات النشطة/قريباً

---

## 🔒 الأمان

### 1. **تشفير كلمة المرور**
```typescript
import bcrypt from "bcrypt";

// عند التسجيل
const hashedPassword = await bcrypt.hash(password, 10);

// عند التحقق
const isValid = await bcrypt.compare(inputPassword, hashedPassword);
```

### 2. **فلترة الملفات**
- أنواع مسموحة فقط (audio, image, pdf, doc, txt)
- حجم أقصى 50MB لكل ملف
- التحقق من MIME type

### 3. **حماية الـ API**
- التحقق من البيانات المطلوبة
- رسائل خطأ واضحة
- معالجة استثناءات شاملة

---

## 🚀 كيفية الاستخدام

### 1. **الوصول للصفحة**
```
http://localhost:5001/cloning
```
أو في Production:
```
https://app.mrf103.com/cloning
```

### 2. **إدخال الـ Passcode**
```
passcodemrf1Q@
```

### 3. **ملء النموذج**
- أدخل جميع المعلومات المطلوبة (*)
- ارفع الملفات (اختياري)
- اختر الأجهزة والتكاملات

### 4. **الإرسال**
- انقر "إنشاء الملف التعريفي"
- انتظر حتى يتم الرفع
- ستظهر رسالة نجاح مع عدد الملفات

---

## 🧪 اختبار النظام

### 1. **اختبار الـ Passcode**
```bash
curl -X POST http://localhost:5001/api/cloning/verify-passcode \
  -H "Content-Type: application/json" \
  -d '{"passcode": "passcodemrf1Q@"}'
```

### 2. **اختبار التسجيل**
```bash
curl -X POST http://localhost:5001/api/cloning/register \
  -F "username=testuser" \
  -F "email=test@example.com" \
  -F "password=Test123!" \
  -F "voiceSamples=@/path/to/audio.mp3" \
  -F "photos=@/path/to/image.jpg"
```

### 3. **اختبار جلب المعلومات**
```bash
curl -X GET http://localhost:5001/api/cloning/profile/{userId}
```

---

## 📊 إحصائيات النظام

| المكون | الحالة |
|--------|--------|
| API Endpoints | 4 ✅ |
| Database Tables | 3 ✅ |
| File Types Supported | 3 (voice, photo, document) ✅ |
| IoT Devices | 7 (3 active, 4 coming soon) ✅ |
| Integrations | 10 (5 active, 5 coming soon) ✅ |
| Max File Size | 50MB ✅ |
| Password Security | bcrypt ✅ |

---

## 🔄 خطوات التشغيل

### 1. **تثبيت التبعيات**
```bash
npm install multer bcrypt
```

### 2. **تشغيل Migration**
```bash
# في Supabase SQL Editor
-- أضف الجداول الثلاثة من schema.ts
```

### 3. **إنشاء مجلد الرفع**
```bash
mkdir -p uploads/cloning
```

### 4. **تشغيل السيرفر**
```bash
npm run dev
```

### 5. **الوصول للصفحة**
```
http://localhost:5001/cloning
```

---

## 🎯 المراحل المستقبلية

### Phase 1 (الحالية) ✅
- ✅ نظام Passcode
- ✅ رفع ملفات متعددة
- ✅ اختيار أجهزة IoT
- ✅ اختيار التكاملات
- ✅ قاعدة بيانات كاملة

### Phase 2 (قريباً)
- OAuth للتكاملات
- لوحة تحكم للمستخدم
- تعديل/حذف الملفات
- معاينة الملفات المرفوعة
- إحصائيات الاستخدام

### Phase 3 (مستقبلاً)
- نظام AI للتحليل الصوتي
- تدريب نموذج شخصي
- ربط مع أجهزة IoT الحقيقية
- API للمطورين
- نظام Webhooks

---

## 💡 نصائح للاستخدام

1. **للمطورين:**
   - استخدم Postman لاختبار الـ API
   - تحقق من logs السيرفر عند حدوث أخطاء
   - استخدم DevTools لمراقبة الـ Network requests

2. **للمستخدمين:**
   - استخدم ملفات عالية الجودة
   - تأكد من صحة البريد الإلكتروني
   - اختر كلمة مرور قوية

3. **للإدارة:**
   - راقب حجم مجلد uploads
   - نظف الملفات القديمة دورياً
   - تحقق من أداء قاعدة البيانات

---

## 📞 الدعم

في حال واجهت أي مشاكل:
1. تحقق من console logs
2. تحقق من Network tab
3. تحقق من server logs
4. راجع هذا الدليل

---

## 📝 الخلاصة

نظام **Cloning** هو حل متكامل لإنشاء نسخة رقمية من المستخدمين مع:
- ✅ أمان عالي (Passcode + bcrypt)
- ✅ رفع ملفات متعددة (50MB/file)
- ✅ قاعدة بيانات محسّنة
- ✅ واجهة مستخدم حديثة
- ✅ API موثقة بالكامل
- ✅ جاهز للإنتاج

---

**تم إنشاء هذا النظام بواسطة:** GitHub Copilot  
**التاريخ:** 6 يناير 2026  
**الإصدار:** 1.0.0
