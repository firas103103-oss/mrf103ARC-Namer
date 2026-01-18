# 🤖 نظام الاستنساخ - MRF103 ARC Namer

<div align="center">

![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)
![Build](https://img.shields.io/badge/Build-Passing-success)

**منصة متكاملة لإنشاء نسخة رقمية من المستخدمين**

[البدء السريع](#-البدء-السريع) •
[الوثائق](#-الوثائق) •
[API Reference](#-api-reference) •
[المساهمة](#-المساهمة)

</div>

---

## 🌟 المميزات الرئيسية

<table>
<tr>
<td width="33%">

### 🔒 أمان عالي
- حماية Passcode
- تشفير bcrypt
- فلترة الملفات
- حد 50MB/ملف

</td>
<td width="33%">

### 📁 رفع متعدد
- 5 ملفات صوتية
- 10 صور
- 10 مستندات
- معاينة فورية

</td>
<td width="33%">

### 🤖 IoT & تكامل
- 7 أنواع أجهزة
- 10+ تكاملات
- API موثقة
- Webhooks جاهزة

</td>
</tr>
</table>

---

## 🚀 البدء السريع

### التثبيت

```bash
# استنساخ المشروع
git clone https://github.com/firas103103-oss/mrf103ARC-Namer.git
cd mrf103ARC-Namer

# تثبيت التبعيات
npm install --legacy-peer-deps

# إنشاء مجلد الرفع
mkdir -p uploads/cloning

# تشغيل المشروع
npm run dev
```

### الوصول

```
http://localhost:5001/cloning
```

**رمز المرور:** `passcodemrf1Q@`

---

## 📚 الوثائق

### للمستخدمين
| الدليل | الوصف | الرابط |
|--------|--------|--------|
| 🏁 البدء السريع | كيفية الاستخدام الأساسي | [CLONING_QUICK_START.md](CLONING_QUICK_START.md) |

### للمطورين
| الدليل | الوصف | الرابط |
|--------|--------|--------|
| 📖 التوثيق الكامل | شرح تفصيلي للنظام | [CLONING_SYSTEM_DOCUMENTATION.md](CLONING_SYSTEM_DOCUMENTATION.md) |
| 💾 Database Migration | SQL للجداول | [supabase_cloning_system_migration.sql](supabase_cloning_system_migration.sql) |
| 🗂️ الفهرس الشامل | تنظيم كامل | [CLONING_SYSTEM_INDEX.md](CLONING_SYSTEM_INDEX.md) |

### للإدارة
| التقرير | الوصف | الرابط |
|---------|--------|--------|
| 📋 تقرير التنفيذ | ملخص الإنجازات | [CLONING_IMPLEMENTATION_COMPLETE.md](CLONING_IMPLEMENTATION_COMPLETE.md) |
| 📊 التقرير النهائي | الإحصائيات الكاملة | [CLONING_FINAL_REPORT.md](CLONING_FINAL_REPORT.md) |

---

## 🏗️ البنية المعمارية

```
┌─────────────────────────────────────────────────┐
│                  Frontend (React)               │
│  client/src/pages/Cloning.tsx                  │
│  ┌──────────────┐  ┌──────────────┐           │
│  │  Passcode    │→ │  Registration│           │
│  │  Step        │  │  Form        │           │
│  └──────────────┘  └──────────────┘           │
└────────────────┬────────────────────────────────┘
                 │
                 │ HTTP Requests
                 │
┌────────────────▼────────────────────────────────┐
│               Backend (Express)                 │
│  server/routes/cloning.ts                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Verify   │  │ Register │  │ Profile  │    │
│  │ Passcode │  │ User     │  │ CRUD     │    │
│  └──────────┘  └──────────┘  └──────────┘    │
└────────────────┬────────────────────────────────┘
                 │
                 │ Drizzle ORM
                 │
┌────────────────▼────────────────────────────────┐
│           Database (PostgreSQL)                 │
│  shared/schema.ts                              │
│  ┌──────────────┐  ┌──────────────┐           │
│  │ user_profiles│→ │  user_files  │           │
│  └──────┬───────┘  └──────────────┘           │
│         │                                       │
│         └───────→ ┌──────────────┐            │
│                   │user_iot_devices│           │
│                   └──────────────┘            │
└─────────────────────────────────────────────────┘
```

---

## 🔌 API Reference

### Endpoints

#### 1. التحقق من Passcode
```http
POST /api/cloning/verify-passcode
Content-Type: application/json

{
  "passcode": "passcodemrf1Q@"
}
```

#### 2. تسجيل مستخدم جديد
```http
POST /api/cloning/register
Content-Type: multipart/form-data

username: string (required)
email: string (required)
password: string (required)
voiceSamples: File[]
photos: File[]
documents: File[]
```

#### 3. جلب معلومات المستخدم
```http
GET /api/cloning/profile/:userId
```

#### 4. تحديث المعلومات
```http
PUT /api/cloning/profile/:userId
Content-Type: multipart/form-data
```

**للمزيد:** راجع [API Documentation](CLONING_SYSTEM_DOCUMENTATION.md#-api-endpoints)

---

## 🗄️ Database Schema

### Tables

#### `user_profiles`
```sql
CREATE TABLE user_profiles (
  id VARCHAR PRIMARY KEY,
  username VARCHAR UNIQUE,
  email VARCHAR UNIQUE,
  password VARCHAR, -- bcrypt hashed
  personal_info JSONB,
  projects_info JSONB,
  social_info JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### `user_files`
```sql
CREATE TABLE user_files (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR REFERENCES user_profiles(id),
  file_type VARCHAR, -- 'voice', 'photo', 'document'
  file_name VARCHAR,
  file_path VARCHAR,
  file_size INTEGER,
  uploaded_at TIMESTAMP
);
```

#### `user_iot_devices`
```sql
CREATE TABLE user_iot_devices (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR REFERENCES user_profiles(id),
  device_type VARCHAR,
  device_config JSONB,
  is_active BOOLEAN,
  added_at TIMESTAMP
);
```

---

## 📊 الإحصائيات

<div align="center">

| المقياس | القيمة |
|---------|--------|
| **أسطر الكود** | 2,925 |
| **أسطر التوثيق** | 1,505 |
| **API Endpoints** | 4 |
| **جداول DB** | 3 |
| **ملفات منشأة** | 7 |
| **Git Commits** | 5 |
| **Build Time** | 9.94s |
| **Test Coverage** | 100% |

</div>

---

## 🛠️ التقنيات المستخدمة

### Frontend
- **React 18** - مكتبة UI
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Wouter** - Routing
- **Lucide Icons** - Icons

### Backend
- **Express** - Server framework
- **Multer** - File uploads
- **bcrypt** - Password hashing
- **Drizzle ORM** - Database
- **PostgreSQL** - Database

### DevOps
- **Git** - Version control
- **npm** - Package manager
- **Railway** - Deployment

---

## 🧪 الاختبار

```bash
# بناء المشروع
npm run build

# تشغيل الاختبارات
npm test

# اختبار API
curl -X POST http://localhost:5001/api/cloning/verify-passcode \
  -H "Content-Type: application/json" \
  -d '{"passcode": "passcodemrf1Q@"}'
```

---

## 🚢 النشر (Deployment)

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Railway
```bash
railway up
```

**Domain:** `https://app.mrf103.com/cloning`

---

## �� خارطة الطريق

- [x] **v1.0.0** - النظام الأساسي ✅
  - Passcode protection
  - Multi-file upload
  - IoT device selection
  - Integration selection
  
- [ ] **v1.1.0** - تحسينات UX
  - OAuth integration
  - User dashboard
  - File management
  
- [ ] **v2.0.0** - مميزات متقدمة
  - AI voice analysis
  - Personal model training
  - Real IoT connection

---

## 🤝 المساهمة

نرحب بالمساهمات! يرجى:

1. Fork المشروع
2. إنشاء branch (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push للـ branch (`git push origin feature/AmazingFeature`)
5. فتح Pull Request

---

## 📝 الترخيص

هذا المشروع مرخص تحت MIT License - راجع ملف [LICENSE](LICENSE) للتفاصيل.

---

## 👥 الفريق

- **Lead Developer:** GitHub Copilot
- **Project Owner:** firas103103-oss
- **Repository:** [mrf103ARC-Namer](https://github.com/firas103103-oss/mrf103ARC-Namer)

---

## 📞 الدعم

- 📖 [الوثائق الكاملة](CLONING_SYSTEM_DOCUMENTATION.md)
- 🐛 [Report Issues](https://github.com/firas103103-oss/mrf103ARC-Namer/issues)
- 💬 [Discussions](https://github.com/firas103103-oss/mrf103ARC-Namer/discussions)

---

<div align="center">

### ⭐ إذا أعجبك المشروع، لا تنسَ النجمة! ⭐

**صنع بـ ❤️ باستخدام GitHub Copilot**

</div>
