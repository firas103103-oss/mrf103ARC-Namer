# نظام ARC المتكامل - التوثيق الشامل
## ARC Complete System Documentation

═══════════════════════════════════════════════════════════════
**تاريخ الإصدار:** 4 يناير 2026
**الإصدار:** v15.0-ARC2.0
**الحالة:** ✅ جميع الأنظمة نشطة ومتكاملة
═══════════════════════════════════════════════════════════════

## 📋 جدول المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [البنية التحتية](#البنية-التحتية)
3. [نظام الأرشفة](#نظام-الأرشفة)
4. [إدارة المهام](#إدارة-المهام)
5. [التكاملات](#التكاملات)
6. [الصلاحيات والأمان](#الصلاحيات-والأمان)
7. [التشغيل والاختبار](#التشغيل-والاختبار)

---

## 🌟 نظرة عامة

نظام ARC هو منصة متكاملة لإدارة الوكلاء الافتراضيين (Virtual Agents) مع:
- ✅ **6 وكلاء نشطين** (Mr.F, L0-Ops, L0-Comms, L0-Intel, Dr. Maya Quest, Jordan Spark)
- ✅ **11 وحدة نظام** (Supabase, n8n, ElevenLabs, AI APIs, إلخ)
- ✅ **نظام أرشفة متقدم** مع تشفير وصلاحيات
- ✅ **إدارة مهام ذكية** للوكلاء
- ✅ **تعلم وتحليل مستمر** للأداء

---

## 🏗️ البنية التحتية

### الملفات الأساسية

```
server/modules/
├── archive_manager.ts      # نظام الأرشفة الكامل
├── integration_manager.ts  # إدارة التكاملات (n8n, ElevenLabs, LLMs)
├── agent_manager.ts         # إدارة المهام والتعلم للوكلاء
├── agent_events.ts          # تسجيل أحداث الوكلاء
├── ceo_reminders.ts         # نظام التذكيرات
├── executive_summaries.ts   # الملخصات التنفيذية
└── logs_archiver.ts         # أرشفة السجلات القديمة
```

### قاعدة البيانات (Supabase)

**الجداول الجديدة:**
- `arc_archives` - الأرشيفات المشفرة
- `archive_encryption_keys` - مفاتيح التشفير
- `arc_access_control` - صلاحيات الوصول
- `agent_tasks` - مهام الوكلاء
- `agent_learning` - بيانات التعلم والتحليل
- `agent_performance` - مقاييس الأداء
- `integration_logs` - سجلات التكاملات

**إعداد قاعدة البيانات:**
```bash
# تشغيل السكريبت في Supabase SQL Editor
cat supabase_arc_complete_setup.sql
```

---

## 📦 نظام الأرشفة

### الميزات الرئيسية

#### 1. إنشاء أرشيف مشفر
```typescript
import { createArchive } from "./server/modules/archive_manager";

const archive = await createArchive(
  "/path/to/source",
  "archive_name",
  {
    type: "agent_data",      // logs, reports, agent_data, system_backup, full_snapshot
    encrypt: true,           // تفعيل التشفير AES-256-GCM
    accessLevel: "internal", // public, internal, confidential, restricted
    sourceAgent: "Mr.F",
    retentionDays: 90,
    metadata: { version: "v1.0" }
  }
);
```

#### 2. إدارة الصلاحيات
```typescript
import { grantAccess, checkAccess } from "./server/modules/archive_manager";

// منح صلاحيات
await grantAccess(
  "L0-Ops",                   // معرف الوكيل
  "archive",                  // نوع المورد
  archiveId,                  // معرف المورد
  ["read", "write", "share"], // الصلاحيات
  "Mr.F",                     // من منح الصلاحية
  30                          // صلاحية لمدة 30 يوم
);

// التحقق من الصلاحيات
const hasAccess = await checkAccess("L0-Ops", "archive", archiveId, "read");
```

#### 3. جدولة الأرشفة التلقائية
```typescript
import { scheduledArchiving, cleanupExpiredArchives } from "./server/modules/archive_manager";

// أرشفة تلقائية أسبوعية
await scheduledArchiving();

// تنظيف الأرشيفات منتهية الصلاحية
const deletedCount = await cleanupExpiredArchives();
```

### مستويات الأمان
- **public**: الوصول العام (مستوى 0)
- **internal**: داخلي فقط (مستوى 1)
- **confidential**: سري (مستوى 2)
- **restricted**: محدود جداً (مستوى 3)

---

## 📋 إدارة المهام

### إنشاء مهمة جديدة
```typescript
import { createTask } from "./server/modules/agent_manager";

const taskId = await createTask({
  agentId: "Mr.F",
  taskType: "analysis",           // analysis, research, communication, monitoring, execution
  title: "تحليل أداء النظام",
  description: "تحليل شامل لأداء جميع الوكلاء",
  priority: "high",                // low, medium, high, critical
  input: { metrics: true },
  dueDate: "2026-01-10T00:00:00Z",
  estimatedDurationMs: 3600000     // ساعة واحدة
});
```

### تحديث حالة المهمة
```typescript
import { updateTaskStatus } from "./server/modules/agent_manager";

// بدء المهمة
await updateTaskStatus(taskId, "in_progress", 0);

// تحديث التقدم
await updateTaskStatus(taskId, "in_progress", 50);

// إكمال المهمة
await updateTaskStatus(
  taskId,
  "completed",
  100,
  { result: "Analysis complete", findings: [...] }
);
```

### استرجاع مهام الوكيل
```typescript
import { getAgentTasks } from "./server/modules/agent_manager";

const tasks = await getAgentTasks("Mr.F", {
  status: "pending",
  priority: "high",
  limit: 10
});
```

---

## 🧠 نظام التعلم والتحليل

### تسجيل التعلم
```typescript
import { recordLearning } from "./server/modules/agent_manager";

await recordLearning({
  agentId: "L0-Intel",
  learningType: "pattern_recognition", // pattern_recognition, performance_optimization, user_preference, error_correction
  context: "User behavior analysis",
  inputData: { queries: 100 },
  analysis: { pattern: "morning_peak" },
  insights: ["Users most active 9-11 AM"],
  confidence: 85
});
```

### تطبيق التعلم
```typescript
import { applyLearning } from "./server/modules/agent_manager";

// بعد التحقق من صحة التعلم
await applyLearning(learningId, "Mr.F");
```

### تسجيل الأداء
```typescript
import { recordPerformance } from "./server/modules/agent_manager";

await recordPerformance({
  agentId: "L0-Ops",
  metricType: "response_time",    // response_time, success_rate, task_completion, quality_score
  value: 1.25,
  unit: "seconds",
  context: { task_type: "monitoring" }
});
```

### تحليلات الوكيل
```typescript
import { getAgentAnalytics } from "./server/modules/agent_manager";

const analytics = await getAgentAnalytics("Mr.F");
// Returns:
// {
//   totalTasks: 150,
//   completedTasks: 142,
//   failedTasks: 3,
//   averageCompletionTime: 2450,
//   successRate: 94.67,
//   learningCount: 25,
//   appliedLearnings: 20,
//   learningApplicationRate: 80
// }
```

---

## 🔗 التكاملات

### n8n Automation
```typescript
import { sendToN8N } from "./server/modules/integration_manager";

await sendToN8N({
  event_type: "task_completed",
  agent_id: "Mr.F",
  data: {
    task_id: "...",
    result: "success"
  },
  priority: "high"
});
```

### ElevenLabs Text-to-Speech
```typescript
import { generateSpeech } from "./server/modules/integration_manager";

const audioBuffer = await generateSpeech({
  text: "مرحباً، أنا السيد إف",
  voice_id: "HRaipzPqzrU15BUS5ypU", // Mr.F voice
  agent_id: "Mr.F",
  voice_settings: {
    stability: 0.5,
    similarity_boost: 0.75
  }
});
```

### LLM APIs (OpenAI, Anthropic, Gemini)
```typescript
import { callLLM } from "./server/modules/integration_manager";

const response = await callLLM({
  provider: "openai",              // openai, anthropic, gemini
  model: "gpt-4o-mini",
  messages: [
    { role: "user", content: "تحليل النظام" }
  ],
  temperature: 0.7,
  max_tokens: 1000,
  agent_id: "L0-Intel"
});
```

### فحص صحة التكاملات
```typescript
import { checkIntegrationsHealth } from "./server/modules/integration_manager";

const health = await checkIntegrationsHealth();
// Returns:
// {
//   n8n: true,
//   elevenlabs: true,
//   openai: true,
//   anthropic: true,
//   gemini: false,
//   supabase: true
// }
```

---

## 🔒 الصلاحيات والأمان

### التشفير
- **خوارزمية:** AES-256-GCM
- **مفاتيح التشفير:** مخزنة بشكل آمن في Supabase
- **IV (Initialization Vector):** عشوائي لكل ملف
- **Auth Tag:** للتحقق من سلامة البيانات

### Row Level Security (RLS)
جميع الجداول محمية بـ RLS:
- **Service Role**: وصول كامل
- **Anon/Authenticated**: حسب السياسات المخصصة

### بروتوكولات الوصول
1. **طلب الوصول** → يجب أن يكون مصرح به
2. **التحقق من الصلاحيات** → قبل كل عملية
3. **تسجيل الأحداث** → كل عملية مسجلة
4. **انتهاء الصلاحية** → تنظيف تلقائي

---

## 🚀 التشغيل والاختبار

### تفعيل جميع الأنظمة
```bash
# تفعيل كامل لجميع الوكلاء والوحدات
node arc_activate_all.js
```

### اختبار شامل
```bash
# اختبار جميع الأنظمة
node arc_test_all_systems.js
```

### تشغيل الخادم
```bash
# Development
npm run dev

# Production
npm start
```

### دفع التغييرات إلى قاعدة البيانات
```bash
npm run db:push
```

---

## 📊 مراقبة النظام

### الأحداث التلقائية
- **كل 6 ساعات:** Heartbeat + فحص صحة التكاملات
- **كل ساعة:** مزامنة n8n
- **يومياً (3:00 ص):** تذكيرات + تنظيف الأرشيف
- **يومياً (6:00 ص):** تحليل أداء الوكلاء
- **أسبوعياً (الإثنين 2:00 ص):** أرشفة السجلات
- **أسبوعياً (الأحد 5:00 ص):** ملخص تنفيذي

### لوحة التحكم
```
http://localhost:5001/dashboard
```

---

## 🌐 متغيرات البيئة المطلوبة

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# n8n
N8N_WEBHOOK_URL=https://your-n8n.app/webhook/arc-events

# ElevenLabs
ELEVENLABS_API_KEY=your-elevenlabs-key

# OpenAI
OPENAI_API_KEY=your-openai-key
OPENAI_MODEL=gpt-4o-mini

# Anthropic
ANTHROPIC_API_KEY=your-anthropic-key

# Gemini
GEMINI_API_KEY=your-gemini-key

# ARC Security
ARC_BACKEND_SECRET=your-secret-key
X_ARC_SECRET=your-secret-key
ARC_OPERATOR_PASSWORD=your-password
```

---

## 📞 الدعم والمساعدة

للمزيد من المساعدة:
- 📖 راجع الكود المصدري في `server/modules/`
- 🔍 تحقق من السجلات في Console
- 📊 راجع Dashboard للحالة الفورية

═══════════════════════════════════════════════════════════════
**تم بنجاح! جميع الأنظمة جاهزة ومتكاملة! ✅**
═══════════════════════════════════════════════════════════════
