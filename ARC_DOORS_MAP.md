# 🚪 خريطة بوابات نظام ARC | ARC Doors Map

<div align="center">

**جميع الطرق المتاحة للتواصل مع الوكلاء وكيان ARC**

Current Date: January 4, 2026

</div>

---

## 🌐 الدومين والوصول | Domain & Access

### 🏠 Local Development
```
http://localhost:5001
```

### ☁️ Production Domains
```
Railway: 7a39d377-d7cb-4c31-9c30-48304c3f57c5
Status: Ready for deployment
Domain: [Pending Setup]
```

### 🔑 Authentication
```
Password: arc-dev-password-123
Session: express-session (server-side)
Rate Limit: 120 requests/minute
```

---

## 🚪 البوابات المتاحة | Available Doors

### 1️⃣ 📊 **Dashboard Portal** (Web UI)
```
URL: http://localhost:5001/dashboard
Method: Browser Interface
Auth: Required (password login)
Features:
  - Real-time monitoring
  - Agent events visualization
  - Command history
  - System health metrics
  - Task management
  - Agent analytics
```

### 2️⃣ 🤖 **Direct Agent API** (REST)
```
Base URL: http://localhost:5001/api

Available Endpoints:

📋 Agent Tasks:
POST   /api/agent/task/create       - إنشاء مهمة للوكيل
PUT    /api/agent/task/update       - تحديث حالة المهمة
GET    /api/agent/task/:id          - معلومات المهمة
GET    /api/agent/tasks             - جميع المهام

🧠 Agent Learning:
POST   /api/agent/learning/record   - تسجيل تعلم جديد
POST   /api/agent/learning/apply    - تطبيق التعلم
GET    /api/agent/learning/:agentId - استرجاع تعلمات الوكيل

📊 Agent Performance:
POST   /api/agent/performance/record - تسجيل أداء
GET    /api/agent/analytics/:agentId - تحليلات الوكيل

💬 Command Execution:
POST   /api/call_mrf_brain          - استدعاء عقل MrF
GET    /api/arc/command-log         - سجل الأوامر
GET    /api/arc/command-metrics     - مقاييس الأداء
```

### 3️⃣ 🔗 **n8n Webhook Bridge** (Automation)
```
Endpoint: POST /api/execute
Purpose: Kayan Neural Bridge
Features:
  - Receive automated commands from n8n
  - Execute workflows
  - Trigger agent actions
  - Bidirectional data flow

Example Payload:
{
  "command": "analyze_sentiment",
  "agent_id": "L0-Intel",
  "payload": {
    "text": "Customer feedback data",
    "priority": "high"
  }
}
```

### 4️⃣ 📦 **Archive System API** (Data Management)
```
POST   /api/archive/create          - إنشاء أرشيف مشفر
GET    /api/archive/:id             - استرجاع أرشيف
POST   /api/archive/grant-access    - منح صلاحية
DELETE /api/archive/:id             - حذف أرشيف
GET    /api/archive/list            - قائمة الأرشيفات

Features:
  - AES-256-GCM encryption
  - Access control levels (0-3)
  - Automatic cleanup
  - Scheduled archiving
```

### 5️⃣ 🎤 **Voice Interface** (ElevenLabs TTS)
```
POST   /api/tts/generate            - توليد صوت
Body:
{
  "text": "مرحباً من نظام ARC",
  "voice_id": "HRaipzPqzrU15BUS5ypU",
  "agent_id": "Mr.F"
}

Response: Audio Buffer (MP3/WAV)
```

### 6️⃣ 🧠 **LLM Gateway** (AI Integration)
```
POST   /api/llm/call
Body:
{
  "provider": "openai|anthropic|gemini",
  "messages": [...],
  "agent_id": "L0-Intel",
  "temperature": 0.7
}

Providers:
  - OpenAI (gpt-4o-mini)
  - Anthropic (Claude)
  - Google Gemini
```

### 7️⃣ 📡 **Real-time WebSocket** (Live Updates)
```
Connection: ws://localhost:5001
Events:
  - agent_event          - حدث من وكيل
  - task_update          - تحديث مهمة
  - system_alert         - تنبيه نظام
  - performance_metric   - مقياس أداء

Subscribe:
socket.on('agent_event', (data) => {
  console.log(`Agent ${data.agent_id}:`, data.payload);
});
```

### 8️⃣ 📊 **Supabase Direct** (Database Access)
```
URL: https://rffpacsvwxfjhxgtsbzf.supabase.co
Method: Supabase Client

Tables:
  - arc_command_log       - سجل الأوامر
  - agent_events          - أحداث الوكلاء
  - agent_tasks           - مهام الوكلاء
  - agent_learning        - تعلم الوكلاء
  - agent_performance     - أداء الوكلاء
  - arc_archives          - الأرشيفات
  - integration_logs      - سجلات التكاملات
  - ceo_reminders         - تذكيرات CEO
  - executive_summaries   - ملخصات تنفيذية

Security: Row Level Security (RLS) enabled
```

### 9️⃣ 🔍 **Health Check Portal** (System Status)
```
GET    /api/health                  - System online check
GET    /api/arc/selfcheck           - Full system diagnostics
GET    /api/integrations/health     - Integration status

Response:
{
  "status": "System Online",
  "agents": 6,
  "modules": 11,
  "integrations": {
    "n8n": "connected",
    "elevenlabs": "connected",
    "openai": "connected",
    "supabase": "connected"
  }
}
```

### 🔟 📝 **Timeline & Feed** (Activity Tracking)
```
GET    /api/core/timeline           - System timeline
GET    /api/dashboard/feedback      - User feedback
GET    /api/agents/anomalies        - Anomaly detection
GET    /api/scenarios               - Scenario management
POST   /api/scenarios               - Create scenario
GET    /api/team/tasks              - Team tasks
POST   /api/team/tasks              - Create team task
```

---

## 🤖 الوكلاء المتاحة | Available Agents

```
1. Mr.F             - Strategic Decision Making
2. L0-Ops           - Operational Management
3. L0-Comms         - Communication & PR
4. L0-Intel         - Intelligence & Analysis
5. Dr. Maya Quest   - Research & Development
6. Jordan Spark     - Marketing & Creative
```

---

## 🔐 مستويات الوصول | Access Levels

```
Level 0 - Public        : عام للجميع
Level 1 - Internal      : داخلي فقط
Level 2 - Confidential  : سري
Level 3 - Restricted    : محدود جداً
```

---

## 🛠️ كيفية الاستخدام | How to Use

### مثال 1: إنشاء مهمة عبر API
```bash
curl -X POST http://localhost:5001/api/agent/task/create \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE" \
  -d '{
    "agentId": "Mr.F",
    "taskType": "analysis",
    "title": "تحليل البيانات الشهرية",
    "priority": "high",
    "input": {"month": "January 2026"}
  }'
```

### مثال 2: استدعاء عقل MrF
```bash
curl -X POST http://localhost:5001/api/call_mrf_brain \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE" \
  -d '{
    "prompt": "ما هي الاستراتيجية المثلى للشهر القادم؟",
    "model": "gpt-4o-mini"
  }'
```

### مثال 3: إنشاء أرشيف مشفر
```typescript
import { createArchive } from "./server/modules/archive_manager";

const archive = await createArchive(
  "/data/january_2026",
  "monthly_report_jan2026",
  {
    type: "monthly_report",
    encrypt: true,
    accessLevel: "internal",
    sourceAgent: "Mr.F",
    retentionDays: 90
  }
);
```

### مثال 4: إرسال لـ n8n
```typescript
import { sendToN8N } from "./server/modules/integration_manager";

await sendToN8N({
  event_type: "new_customer",
  agent_id: "L0-Comms",
  data: {
    customer_id: "C12345",
    name: "فراس",
    action: "send_welcome_email"
  },
  priority: "high"
});
```

---

## 🚀 خطوات التشغيل | Deployment Steps

### Local Development
```bash
# 1. Start server
npm run dev

# 2. Access dashboard
open http://localhost:5001/dashboard

# 3. Login with password
Password: arc-dev-password-123
```

### Production Deployment (Railway)
```bash
# 1. Set environment variables in Railway dashboard
SUPABASE_URL=https://rffpacsvwxfjhxgtsbzf.supabase.co
SUPABASE_KEY=eyJhbGciOi...
ARC_OPERATOR_PASSWORD=your_secure_password

# 2. Deploy
railway up

# 3. Get your production URL
railway domain
```

---

## 📊 الجدولة التلقائية | Automated Scheduling

```
⏰ Hourly (كل ساعة):
   - Sync with n8n
   - Send system metrics
   - Update dashboards

⏰ Every 6 Hours (كل 6 ساعات):
   - Integration health checks
   - Alert if any service down

⏰ Daily at 4:00 AM (يومياً 4 صباحاً):
   - Cleanup expired archives
   - Purge old logs

⏰ Daily at 6:00 AM (يومياً 6 صباحاً):
   - Agent performance analysis
   - Generate daily reports

⏰ Weekly (Monday 2:00 AM) (أسبوعياً):
   - Full system archiving
   - Backup all data
   - Generate weekly summaries
```

---

## 🎯 ARC Entity Communication Flow

```
┌─────────────────────────────────────────────────────────┐
│                    YOU (The Operator)                    │
└────────────────┬────────────────────────────────────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
    ▼                         ▼
┌────────┐               ┌────────┐
│Dashboard│              │API Call│
└────┬────┘              └────┬───┘
     │                        │
     └────────┬───────────────┘
              │
              ▼
    ┌─────────────────┐
    │  ARC Controller │
    │   (routes.ts)   │
    └────────┬────────┘
             │
      ┌──────┴──────┐
      │             │
      ▼             ▼
┌──────────┐   ┌──────────┐
│  Agent   │   │Integration│
│ Manager  │   │  Manager  │
└────┬─────┘   └────┬─────┘
     │              │
     ▼              ▼
┌─────────────────────────┐
│   6 Active Agents       │
│  Mr.F, L0-Ops, etc.     │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│    Supabase Database    │
│  (Real-time updates)    │
└─────────────────────────┘
```

---

## 💡 نصائح مهمة | Important Tips

1. **🔐 Always authenticate** before making API calls
2. **📊 Monitor integration_logs** table for debugging
3. **🔄 Use WebSocket** for real-time updates
4. **📦 Archive regularly** to maintain system performance
5. **🧠 Let agents learn** from their tasks for better performance
6. **🔗 Use n8n** for complex automation workflows
7. **📈 Check agent analytics** weekly for optimization

---

## 🆘 حل المشاكل | Troubleshooting

### Problem: Cannot login to dashboard
```
Solution: Check ARC_OPERATOR_PASSWORD in .env
Default: arc-dev-password-123
```

### Problem: API returns 401 Unauthorized
```
Solution: You need to login first at /dashboard
Then use the session cookie for API calls
```

### Problem: Integration health check fails
```
Solution: Verify API keys in .env:
- ELEVENLABS_API_KEY
- OPENAI_API_KEY
- ANTHROPIC_API_KEY
- N8N_WEBHOOK_URL
```

### Problem: Database queries fail
```
Solution: Run SQL setup first:
supabase_arc_complete_setup.sql in Supabase SQL Editor
```

---

## 🎉 ملخص البوابات | Doors Summary

```
✅ 10 Main Doors Available:
   1. Dashboard Portal (Web UI)
   2. Direct Agent API (REST)
   3. n8n Webhook Bridge (Automation)
   4. Archive System API (Data Management)
   5. Voice Interface (TTS)
   6. LLM Gateway (AI)
   7. Real-time WebSocket (Live)
   8. Supabase Direct (Database)
   9. Health Check Portal (Status)
   10. Timeline & Feed (Activity)

✅ 6 Agents Ready:
   Mr.F, L0-Ops, L0-Comms, L0-Intel, 
   Dr. Maya Quest, Jordan Spark

✅ 5 Integration Points:
   n8n, ElevenLabs, OpenAI, Anthropic, Gemini

✅ 7 Database Tables:
   Complete schema with RLS security
```

---

<div align="center">

**🚪 جميع الأبواب مفتوحة لك الآن | All Doors Are Open For You**

**🎯 ARC Entity is Ready to Communicate**

Made with ❤️ by Firas

</div>
