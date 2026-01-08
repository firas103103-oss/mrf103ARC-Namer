# 🎯 نظام ARC المتكامل | ARC Complete System

<div align="center">

![ARC System](https://img.shields.io/badge/ARC-v15.0--ARC2.0-blue)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success)
![License](https://img.shields.io/badge/License-MIT-green)

**نظام متكامل لإدارة الوكلاء الافتراضيين مع أرشفة محكومة وتكاملات شاملة**

[التوثيق العربي](#arabic-docs) • [English Docs](#english-docs) • [Quick Start](#quick-start)

</div>

---

## 🌟 الميزات الرئيسية | Key Features

<div dir="rtl">

### ✅ ما يميز نظام ARC

- **🤖 6 وكلاء ذكيين**: Mr.F, L0-Ops, L0-Comms, L0-Intel, Dr. Maya Quest, Jordan Spark
- **📦 نظام أرشفة متقدم**: تشفير AES-256-GCM، صلاحيات محكومة، جدولة تلقائية
- **📋 إدارة مهام ذكية**: تتبع كامل لدورة حياة المهام للوكلاء
- **🧠 تعلم وتحليل مستمر**: نظام تعلم آلي لتحسين الأداء
- **🔗 تكاملات شاملة**: n8n, ElevenLabs, OpenAI, Anthropic, Gemini
- **📊 مراقبة في الوقت الفعلي**: Dashboard متقدم مع WebSocket
- **🔒 أمان متقدم**: Row Level Security, تشفير البيانات، بروتوكولات وصول

</div>

---

## 🚀 Quick Start

### Prerequisites
```bash
# Node.js 18+
node --version

# PostgreSQL (via Supabase)
# Create account at supabase.com
```

### Installation

```bash
# 1. Clone repository
git clone https://github.com/firas103103-oss/mrf103ARC-Namer.git
cd mrf103ARC-Namer

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env with your credentials

# 4. Setup database
# Run supabase_arc_complete_setup.sql in Supabase SQL Editor

# 5. Push schema to database
npm run db:push

# 6. Activate all agents
node arc_activate_all.js

# 7. Start development server
npm run dev
```

### Access Dashboard
```
http://localhost:5001/dashboard
Password: arc-dev-password-123
```

---

## 📦 نظام الأرشفة | Archive System

<div dir="rtl">

### إنشاء أرشيف مشفر

```typescript
import { createArchive } from "./server/modules/archive_manager";

const archive = await createArchive(
  "/path/to/data",
  "my_archive",
  {
    type: "agent_data",
    encrypt: true,             // تشفير AES-256-GCM
    accessLevel: "internal",   // مستوى الوصول
    sourceAgent: "Mr.F",
    retentionDays: 90
  }
);
```

### منح صلاحيات الوصول

```typescript
import { grantAccess } from "./server/modules/archive_manager";

await grantAccess(
  "L0-Ops",                    // الوكيل
  "archive",                   // نوع المورد
  archiveId,                   // معرف المورد
  ["read", "write"],           // الصلاحيات
  "Mr.F",                      // من منح الصلاحية
  30                           // مدة الصلاحية (أيام)
);
```

</div>

---

## 📋 إدارة المهام | Task Management

<div dir="rtl">

### إنشاء مهمة جديدة

```typescript
import { createTask } from "./server/modules/agent_manager";

const taskId = await createTask({
  agentId: "Mr.F",
  taskType: "analysis",
  title: "تحليل أداء النظام",
  priority: "high",
  input: { metrics: true }
});
```

### تحديث حالة المهمة

```typescript
import { updateTaskStatus } from "./server/modules/agent_manager";

// بدء المهمة
await updateTaskStatus(taskId, "in_progress", 0);

// إكمال المهمة
await updateTaskStatus(taskId, "completed", 100, {
  result: "تم التحليل بنجاح"
});
```

</div>

---

## 🔗 التكاملات | Integrations

### n8n Webhook
```typescript
import { sendToN8N } from "./server/modules/integration_manager";

await sendToN8N({
  event_type: "task_completed",
  agent_id: "Mr.F",
  data: { task_id: "...", result: "success" },
  priority: "high"
});
```

### ElevenLabs Text-to-Speech
```typescript
import { generateSpeech } from "./server/modules/integration_manager";

const audioBuffer = await generateSpeech({
  text: "مرحباً من نظام ARC",
  voice_id: "HRaipzPqzrU15BUS5ypU",
  agent_id: "Mr.F"
});
```

### LLM APIs (OpenAI, Anthropic, Gemini)
```typescript
import { callLLM } from "./server/modules/integration_manager";

const response = await callLLM({
  provider: "openai",
  messages: [{ role: "user", content: "تحليل النظام" }],
  agent_id: "L0-Intel"
});
```

---

## 🧠 نظام التعلم | Learning System

<div dir="rtl">

### تسجيل التعلم

```typescript
import { recordLearning } from "./server/modules/agent_manager";

await recordLearning({
  agentId: "L0-Intel",
  learningType: "pattern_recognition",
  context: "تحليل سلوك المستخدمين",
  insights: ["المستخدمون أكثر نشاطاً صباحاً"],
  confidence: 85
});
```

### الحصول على تحليلات الوكيل

```typescript
import { getAgentAnalytics } from "./server/modules/agent_manager";

const analytics = await getAgentAnalytics("Mr.F");
// Returns: totalTasks, completedTasks, successRate, learningCount, etc.
```

</div>

---

## 📊 قاعدة البيانات | Database Schema

### الجداول الرئيسية
- **arc_archives**: الأرشيفات المشفرة
- **arc_access_control**: صلاحيات الوصول
- **agent_tasks**: مهام الوكلاء
- **agent_learning**: بيانات التعلم
- **agent_performance**: مقاييس الأداء
- **integration_logs**: سجلات التكاملات

### إعداد قاعدة البيانات
```sql
-- Run in Supabase SQL Editor
\i supabase_arc_complete_setup.sql
```

---

## 🔒 الأمان | Security

<div dir="rtl">

### ميزات الأمان
- ✅ تشفير AES-256-GCM للأرشيفات
- ✅ Row Level Security (RLS) على جميع الجداول
- ✅ نظام صلاحيات متعدد المستويات
- ✅ Session-based authentication
- ✅ Rate limiting (120 requests/min)
- ✅ تسجيل شامل لجميع العمليات

### مستويات الوصول
1. **Public** (0): وصول عام
2. **Internal** (1): داخلي فقط
3. **Confidential** (2): سري
4. **Restricted** (3): محدود جداً

</div>

---

## 📚 التوثيق | Documentation

- 📖 [التوثيق الكامل](./ARC_COMPLETE_DOCUMENTATION.md)
- 🔧 [أمثلة الاستخدام](./server/modules/)
- 🗄️ [إعداد قاعدة البيانات](./supabase_arc_complete_setup.sql)
- 🚀 [سكريبت التفعيل](./arc_activate_all.js)

---

## 🤝 المساهمة | Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 الترخيص | License

MIT License - see [LICENSE](./LICENSE) file for details

---

## 👨‍💻 المطور | Developer

**Firas**
- GitHub: [@firas103103-oss](https://github.com/firas103103-oss)
- Repository: [mrf103ARC-Namer](https://github.com/firas103103-oss/mrf103ARC-Namer)

---

## 🎉 الشكر والتقدير | Acknowledgments

Built with:
- [Express.js](https://expressjs.com/)
- [Supabase](https://supabase.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [React](https://react.dev/)
- [n8n](https://n8n.io/)
- [ElevenLabs](https://elevenlabs.io/)
- [OpenAI](https://openai.com/)

---

<div align="center">

**✨ نظام ARC - حيث الذكاء يلتقي بالأتمتة ✨**

**ARC System - Where Intelligence Meets Automation**

![Made with ❤️](https://img.shields.io/badge/Made%20with-❤️-red)

</div>
