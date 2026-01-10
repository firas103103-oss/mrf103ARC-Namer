# 🤖 AI Context Document - **Stellar Command OS**

> **تاريخ التحديث:** 10 يناير 2026  
> **الحالة:** Production Ready ✅  
> **النسخة:** v2.1.0 - Stellar Command Edition  
> **التصميم:** Stellar Command Design System ✨

---

## 🌟 **نظرة عامة على Stellar Command**

**Stellar Command OS** هو نظام ذكاء اصطناعي متقدم تم تحويله بالكامل من Matrix Green إلى **Stellar Command** مع:

- **33 صفحة React** بتصميم Stellar Command
- **31 وكيل AI** في هيكل هرمي متقدم  
- **Glassmorphism UI** مع تأثيرات cyberpunk
- **HUD Command Interface** مستوحى من المركبات الفضائية
- **Real-time BioSentinel** لمراقبة IoT
- **Master Agent Command** مع GPT-4

### 🎯 الهدف الأساسي
- نظام قيادة ذكي للعصر المستقبلي
- واجهة Stellar Command مع تأثيرات نيون
- إدارة Multi-Domain عبر 6 مجالات رئيسية
- تكامل حقيقي مع ESP32 و IoT
- QuantumWarRoom للعمليات التكتيكية

### 🌈 نظام الألوان الجديد
```css
--primary:      #0080FF  /* Electric Sapphire */
--secondary:    #8B4FFF  /* Cosmic Violet */
--accent:       #FF006E  /* Plasma Magenta */
--success:      #00FFAA  /* Quantum Jade */
--warning:      #FFB800  /* Solar Amber */
--destructive:  #DC143C  /* Crimson Alert */
```

---

## 📊 إحصائيات النظام الكاملة

| المقياس | القيمة |
|---------|--------|
| **صفحات React** | 34 صفحة |
| **مكونات UI** | 67+ مكون |
| **ملفات Server** | 73 ملف TypeScript |
| **API Endpoints** | 67+ endpoint |
| **جداول قاعدة البيانات** | 48 جدول |
| **أخطاء TypeScript** | 0 ✅ |
| **وكلاء AI** | 31 وكيل (هرمي) |
| **حالة الاختبارات** | All passing ✅ |

---

## 🏗️ البنية التقنية الكاملة

### Stack الأساسي
```
Frontend: React 18.3 + TypeScript 5.6 + Vite 7.3.0
Backend: Node.js 20.x + Express 4
Database: PostgreSQL (Supabase) - 48 جدول
ORM: Drizzle ORM
Session: connect-pg-simple (PostgreSQL session store)
Hosting: Railway (production)
Domain: app.mrf103.com (Cloudflare DNS + SSL)
Monitoring: Sentry (production only)
Security: Helmet + CORS configured
AI Models: OpenAI GPT-4o-mini, Anthropic Claude, Google Gemini
Voice: ElevenLabs
Mobile: Capacitor (Android/iOS)
```

### هيكل الملفات الكامل
```
/workspaces/mrf103ARC-Namer/
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/            # 34 صفحة
│   │   │   ├── AdminControlPanel.tsx
│   │   │   ├── AgentChat.tsx
│   │   │   ├── AgentDashboard.tsx
│   │   │   ├── AnalyticsHub.tsx
│   │   │   ├── BioSentinel.tsx
│   │   │   ├── Cloning.tsx
│   │   │   ├── dashboard.tsx
│   │   │   ├── FinanceHub.tsx
│   │   │   ├── GrowthRoadmap.tsx
│   │   │   ├── Home.tsx
│   │   │   ├── IntegrationDashboard.tsx
│   │   │   ├── Integrations.tsx
│   │   │   ├── InvestigationLounge.tsx
│   │   │   ├── IoTDashboard.tsx
│   │   │   ├── landing.tsx
│   │   │   ├── LegalArchive.tsx
│   │   │   ├── LifeManager.tsx
│   │   │   ├── MaestrosHub.tsx
│   │   │   ├── MasterAgentCommand.tsx
│   │   │   ├── MatrixLogin.tsx
│   │   │   ├── MRFDashboard.tsx
│   │   │   ├── OperationsSimulator.tsx
│   │   │   ├── QuantumWarRoom.tsx
│   │   │   ├── ReportsCenter.tsx
│   │   │   ├── RnDLab.tsx
│   │   │   ├── SecurityCenter.tsx
│   │   │   ├── SelfCheck.tsx
│   │   │   ├── Settings.tsx
│   │   │   ├── SystemArchitecture.tsx
│   │   │   ├── TeamCommandCenter.tsx
│   │   │   ├── TemporalAnomalyLab.tsx
│   │   │   ├── virtual-office.tsx
│   │   │   └── XBioSentinel.tsx
│   │   ├── components/       # 67+ مكون UI
│   │   │   ├── admin/
│   │   │   ├── bio-sentinel/
│   │   │   ├── ui/
│   │   │   ├── app-sidebar.tsx
│   │   │   ├── ARCCommandMetrics.tsx
│   │   │   ├── ARCMonitor.tsx
│   │   │   ├── CommandConsole.tsx
│   │   │   ├── DailyCheckInForm.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── VoiceChatRealtime.tsx
│   │   │   └── ...
│   │   ├── lib/              # utilities + queryClient
│   │   └── hooks/            # React hooks
│   └── public/               # Static assets
│
├── server/                    # Express backend - 73 ملف
│   ├── index.ts              # Main server file
│   ├── routes.ts             # 67+ API endpoints
│   ├── db.ts                 # Drizzle database connection
│   ├── causal.ts             # Intent/Action logging
│   ├── supabase.ts           # Supabase client
│   ├── agents/
│   │   └── profiles.ts       # 31 Agent profiles
│   ├── arc/                  # ARC system core
│   ├── middleware/
│   │   ├── error-handler.ts
│   │   └── rate-limiter.ts
│   ├── routes/               # Route modules
│   ├── services/
│   │   ├── cache.ts          # Multi-tier caching
│   │   ├── openai_service.ts # AI integration
│   │   └── supabase-optimized.ts
│   ├── modules/              # Feature modules
│   └── utils/
│
├── shared/
│   └── schema.ts             # Database schema - 48 جدول
│
├── arc_core/                  # AI brain system
│   ├── brain_loader.ts
│   ├── brain_manifest.json
│   ├── agent_contracts.json
│   ├── actions/
│   └── workflows/
│
├── firmware/
│   └── esp32-xbio/           # ESP32 sensor firmware
│
├── android/                   # Capacitor Android
├── docs/                      # Documentation
├── migrations/                # Database migrations
└── dist/                      # Production build
```

---

## 🗄️ Database Schema (48 جدول PostgreSQL)

### الجداول الرئيسية
```sql
-- Core tables
users                    -- المستخدمين
sessions                 -- الجلسات
conversations            -- المحادثات
chat_messages            -- الرسائل

-- Agent System (31 وكيل)
agents                   -- الوكلاء الرئيسيين
agent_events             -- أحداث الوكلاء
agent_tasks              -- مهام الوكلاء
virtual_agents           -- الوكلاء الافتراضيين
team_tasks               -- مهام الفريق

-- BioSentinel (IoT)
smell_profiles           -- بروفايلات الروائح
smell_captures           -- التقاطات الروائح
sensor_readings          -- قراءات الحساسات

-- QuantumWarRoom
mission_scenarios        -- سيناريوهات المهام
workflow_simulations     -- محاكاة سير العمل
projects                 -- المشاريع
activity_feed            -- خلاصة النشاط

-- Governance & Logging
arc_command_log          -- سجل أوامر ARC
arc_archives             -- أرشيف ARC
arc_feedback             -- ملاحظات ARC
ceo_reminders            -- تذكيرات CEO
executive_summaries      -- ملخصات تنفيذية
governance_notifications -- إشعارات الحوكمة
rule_broadcasts          -- بث القواعد
high_priority_notifications -- إشعارات عالية الأولوية
```

---

## 👥 الوكلاء الـ 31 (31 AI Agents)

### 🏛️ الهيكل الهرمي الكامل

```
Tier 0: القائد الأعلى (1 وكيل)
└── Mr.F (mrf) - CEO & Strategic Commander
    الدور: القائد الاستراتيجي والمدير التنفيذي الأعلى

Tier 1: المديرون التنفيذيون (6 وكلاء)
├── Dr. Genius (genius) - Chief Innovation Officer
├── Quantum (quantum) - Chief Technology Officer
├── Oracle (oracle) - Chief Data Officer
├── Sentinel (sentinel) - Chief Security Officer
├── Architect (architect) - Chief Architecture Officer
└── Catalyst (catalyst) - Chief Growth Officer

Tier 2: المديرون (10 وكلاء)
├── Phoenix (phoenix) - Operations Manager
├── Echo (echo) - Communications Manager
├── Neural (neural) - R&D Manager
├── Vector (vector) - Product Manager
├── Prism (prism) - Design Manager
├── Nexus (nexus) - Integration Manager
├── Cipher (cipher) - Security Manager
├── Flux (flux) - DevOps Manager
├── Sage (sage) - Knowledge Manager
└── Pulse (pulse) - Analytics Manager

Tier 3: المتخصصون (14 وكيل)
├── Alpha (alpha) - Frontend Specialist
├── Beta (beta) - Backend Specialist
├── Gamma (gamma) - Database Specialist
├── Delta (delta) - API Specialist
├── Epsilon (epsilon) - Testing Specialist
├── Zeta (zeta) - Documentation Specialist
├── Eta (eta) - Performance Specialist
├── Theta (theta) - Security Analyst
├── Iota (iota) - Cloud Specialist
├── Kappa (kappa) - Mobile Specialist
├── Lambda (lambda) - AI/ML Specialist
├── Mu (mu) - IoT Specialist
├── Nu (nu) - Blockchain Specialist
└── Xi (xi) - DevOps Specialist
```

### مميزات كل وكيل
كل وكيل لديه:
- System prompt مخصص
- Personality محددة
- Capabilities & Specialties
- Voice ID (ElevenLabs)
- Communication style
- Reporting hierarchy
- Task capabilities

---

## 🔐 Environment Variables الحالية

### متغيرات البيئة المطلوبة
```bash
# Database (Required)
DATABASE_URL=postgresql://...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Authentication (Required)
ARC_OPERATOR_PASSWORD=your-secure-password
SESSION_SECRET=your-random-session-secret-min-32-chars

# AI APIs (Required)
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o-mini

# AI APIs (Optional)
ANTHROPIC_API_KEY=sk-ant-api03-...
GEMINI_API_KEY=AIzaSyBP-...
ELEVENLABS_API_KEY=...

# Server
PORT=9002
NODE_ENV=development

# Production
VITE_API_URL=https://app.mrf103.com
VITE_APP_VERSION=2.1.0
```

---

## 🌐 URLs & Deployments

### Production URLs
- **Main App:** https://app.mrf103.com (✅ LIVE)
- **Railway:** https://mrf103arc-namer-production.up.railway.app (✅ LIVE)
- **Supabase Dashboard:** https://supabase.com/dashboard

### DNS Configuration (Cloudflare)
- **Domain:** mrf103.com
- **SSL:** Cloudflare Free SSL (Active, HTTP/2)
- **CDN:** Enabled
- **A Record:** app.mrf103.com → Railway

---

## 🔄 الحالة الحالية (Real-time Status)

### ✅ ما يعمل بالكامل
1. **TypeScript:** 0 errors - نظيف تماماً
2. **Build:** ✅ Success (Client + Server)
3. **Tests:** All passed
4. **Production:** ✅ Deployed on Railway
5. **Domain:** ✅ app.mrf103.com LIVE (HTTP/2 200)
6. **SSL:** ✅ Cloudflare Free SSL Active
7. **Authentication:** ✅ Working (session-based)
8. **Database:** ✅ Supabase connected (48 جدول)
9. **Sessions:** ✅ PostgreSQL store
10. **API Endpoints:** 67+ endpoints working
11. **CORS:** ✅ Configured for all domains
12. **Security:** ✅ Helmet + CSP + HSTS
13. **Monitoring:** ✅ Sentry integrated
14. **Caching:** ✅ Multi-tier cache working
15. **Rate Limiting:** ✅ Active
16. **AI Integration:** ✅ OpenAI + Claude + Gemini
17. **Voice:** ✅ ElevenLabs integrated
18. **31 Agents:** ✅ Hierarchy system complete

### 📊 Port Configuration (Unified)
- Development: 9002
- Production: 9002
- All .env files: PORT=9002 (consistent)

### 📦 Build Output
```
Client: 34 pages, 67+ components
Server: 1.4MB (dist/index.cjs)
Total Build Time: ~10s
Gzip Compression: Enabled
```

---

## 🚦 API Endpoints (67+ routes)

### Authentication
```
POST /api/auth/login    - تسجيل دخول بكلمة مرور
POST /api/auth/logout   - تسجيل خروج
GET  /api/auth/session  - التحقق من الجلسة
GET  /api/auth/user     - معلومات المستخدم
```

### Agents (31-Agent System)
```
GET  /api/agents             - قائمة الوكلاء (31)
GET  /api/agents/:id         - معلومات وكيل محدد
POST /api/agents/:id/chat    - محادثة مع وكيل
GET  /api/agents/analytics   - تحليلات الوكلاء
GET  /api/agents/performance - أداء الوكلاء
GET  /api/agents/hierarchy   - الهيكل الهرمي
POST /api/agents/task        - إسناد مهمة
```

### Admin Panel
```
GET    /api/admin/agents    - قائمة الوكلاء (admin)
POST   /api/admin/agents    - إنشاء وكيل
PUT    /api/admin/agents    - تحديث وكيل
DELETE /api/admin/agents    - حذف وكيل
GET    /api/admin/projects  - قائمة المشاريع
POST   /api/admin/projects  - إنشاء مشروع
```

### Master Agent
```
POST /api/master-agent/execute        - تنفيذ أمر
GET  /api/master-agent/tasks          - قائمة المهام
GET  /api/master-agent/stats          - إحصائيات النظام
GET  /api/master-agent/growth-status  - حالة النمو
```

### BioSentinel (WebSocket + REST)
```
GET  /api/smell-profiles      - قائمة البروفايلات
POST /api/smell-profiles      - إضافة بروفايل
DELETE /api/smell-profiles/:id - حذف بروفايل
POST /api/sensor-readings     - إضافة قراءة حساس
GET  /api/sensor-readings     - قائمة القراءات
WS   /ws                      - WebSocket connection
```

### QuantumWarRoom
```
GET  /api/missions     - قائمة المهام
POST /api/missions     - إنشاء مهمة
PUT  /api/missions/:id - تحديث مهمة
DELETE /api/missions/:id - حذف مهمة
```

### Growth Roadmap (20 endpoints)
```
GET  /api/growth-roadmap/overview   - خطة 90 يوم
GET  /api/growth-roadmap/today      - مهام اليوم
POST /api/growth-roadmap/check-in   - تسجيل التقدم
GET  /api/growth-roadmap/metrics    - مؤشرات الأداء
GET  /api/growth-roadmap/phases     - المراحل
```

### Health & Monitoring
```
GET /api/health       - فحص الصحة الكامل
GET /api/health/live  - Kubernetes liveness
GET /api/health/ready - Kubernetes readiness
GET /api/cache/stats  - إحصائيات الـ cache
```

---

## 🔒 Security Configuration

### CORS
```typescript
allowedOrigins = [
  'http://localhost:9002',
  'http://localhost:5173',
  'https://app.mrf103.com',
  'https://mrf103arc-namer-production.up.railway.app'
]
credentials: true
methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
```

### Helmet Security Headers
```typescript
CSP: {
  defaultSrc: ["'self'"],
  styleSrc: ["'self'", "'unsafe-inline'", "https:"],
  scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
  imgSrc: ["'self'", "data:", "https:"],
  connectSrc: ["'self'", "https:", "wss:"]
}
HSTS: maxAge 31536000 (1 year)
```

### Session Configuration
```typescript
cookie: {
  httpOnly: true,
  sameSite: "lax",
  secure: production only,
  maxAge: 30 days
}
store: PostgreSQL (connect-pg-simple)
secret: 256-bit SESSION_SECRET
```

### Rate Limiting
```typescript
GENERAL_API: 100 requests/minute
AI_ENDPOINTS: 20 requests/minute
AUTHENTICATION: 5 attempts/15 minutes
```

---

## 📈 Performance Metrics

### Cache Statistics
```typescript
API_CACHE: 60 seconds TTL
DATABASE_CACHE: 300 seconds (5 min) TTL
STATIC_CACHE: 3600 seconds (1 hour) TTL
AI_CACHE: 600 seconds (10 min) TTL

Expected:
- 60-80% cache hit rate
- 70% reduction in database queries
- 50% reduction in AI API costs
```

### Response Times
```
API: <300ms average
Database queries: <150ms
WebSocket: Real-time (<10ms)
Build time: ~10 seconds
```

### Bundle Sizes
```
Client: 956 KB (260 KB gzipped)
Server: 1.4 MB
```

---

## 📦 Dependencies (Key Packages)

### Frontend
- react@18.3.1
- react-router-dom@7.5.0
- @tanstack/react-query@5.90.16
- lucide-react@0.468.0
- tailwindcss@3.4.17
- vite@7.3.0
- @radix-ui/* (complete UI kit)

### Backend
- express@4.21.2
- drizzle-orm@0.38.3
- @supabase/supabase-js@2.89.0
- express-session@1.18.1
- connect-pg-simple@10.0.0
- pg@8.13.1
- @sentry/node@10.32.1
- helmet@8.1.0
- ws@8.18.0 (WebSocket)
- node-cache (caching)

### AI/ML
- openai@4.77.3
- @anthropic-ai/sdk@0.36.1
- @google/generative-ai@0.21.0

### Mobile
- @capacitor/android@8.0.0
- @capacitor/core@8.0.0

### Total: 850+ packages

---

## 🛠️ Development Commands

```bash
# Development
npm run dev              # Start dev server (port 9002)
npm run build            # Build for production
npm run start            # Start production server
npm run check            # TypeScript type check
npm test                 # Run tests with Vitest
npm run db:push          # Push schema to database
npm run db:studio        # Open Drizzle Studio
npm run lint             # ESLint check
npm run lint:fix         # Fix linting issues
npm run format           # Prettier format

# Git
git status               # Check status
git add -A              # Stage all changes
git commit -m "..."     # Commit with message
git push origin main    # Push to GitHub
```

---

## 🚀 Deployment Process (Railway)

### Auto-Deploy من GitHub
```bash
git push origin main
  ↓
Railway detects push
  ↓
Build starts (npm run build)
  ↓
Deploy to europe-west4
  ↓
Health check (/api/health/ready)
  ↓
Live on app.mrf103.com
```

### Build Commands
```json
"build": "tsx script/build.ts",
"start": "node dist/index.cjs",
"dev": "tsx watch server/index.ts"
```

---

## 📝 Documentation Files الموجودة

| الملف | الوصف |
|-------|-------|
| README.md | نظرة عامة على المشروع |
| AI_CONTEXT.md | سياق AI للوكلاء |
| LICENSE | رخصة MIT |
| CHANGELOG.md | تاريخ الإصدارات |
| ARC_2.0_COMPLETE_DOCUMENTATION.md | توثيق ARC 2.0 الكامل |
| DATABASE_SETUP_GUIDE.md | دليل إعداد قاعدة البيانات |
| DEPLOYMENT_CHECKLIST.md | قائمة التحقق للنشر |
| BUSINESS_PLAN.md | خطة العمل |
| GDPR_COMPLIANCE.md | التوافق مع GDPR |
| PRIVACY_POLICY.md | سياسة الخصوصية |
| TERMS_OF_SERVICE.md | شروط الخدمة |

---

## 🎨 UI/UX Features

### Design System
- **Framework:** Tailwind CSS + shadcn/ui + Radix UI
- **Theme:** Dark mode with cyan/blue accents
- **Typography:** Modern sans-serif
- **Icons:** Lucide React (468 icons)
- **Animations:** Tailwind animations + custom keyframes
- **Responsive:** Mobile-first design
- **RTL:** Full Arabic support

### Key Components
- Dashboard with agent cards (31 agents)
- Real-time chat interface
- WebSocket status indicators
- Toast notifications
- Loading states
- Error boundaries
- Skeleton loaders
- Hierarchical tree views

---

## 🔄 Git History (آخر التحديثات)

```
92b4242 docs: Update README badges and version info
00997cd docs: Update DATABASE_SETUP_GUIDE.md
9fa75e4 fix: Resolve ESLint and TypeScript type errors
34529aa fix: Correct AgentDefinition type in openai_service
ca8f428 feat: Add OpenAI integration + Database schema + Setup guides
e5ec33a 🏛️ ARC 2.0 - Complete 31-Agent Hierarchy System
2148552 🔧 Fix all 73 TypeScript errors - Complete system modernization
90693cf feat: Fix React hooks error, add self-healing server system
```

---

## ✅ Final Checklist

- [x] TypeScript: 0 errors
- [x] Tests: All passing
- [x] Build: Successful
- [x] Production: Deployed
- [x] SSL: Active
- [x] DNS: Configured
- [x] Sessions: Working
- [x] Authentication: Working
- [x] Database: 48 tables connected
- [x] APIs: 67+ endpoints functional
- [x] Security: Configured
- [x] Monitoring: Active
- [x] 31 Agents: Hierarchy complete
- [x] Voice: ElevenLabs integrated
- [x] AI: OpenAI + Claude + Gemini
- [x] Documentation: Complete

---

## 🎉 Project Status: PRODUCTION READY ✅

| المقياس | القيمة |
|---------|--------|
| **Last Updated** | 9 يناير 2026 |
| **Version** | 2.1.0 |
| **Status** | Fully operational |
| **Health** | 100% 💚 |
| **Agents** | 31 (4-tier hierarchy) |
| **Pages** | 34 |
| **API Endpoints** | 67+ |
| **Database Tables** | 48 |
| **TypeScript Errors** | 0 |

---

*هذا المستند يحتوي على السياق الكامل لوكلاء AI للفهم والعمل مع هذا المشروع.*

---

<div align="center">

**MRF103 ARC Namer - Enterprise AI Command Center**

**v2.1.0** | **January 2026** | **Production Ready**

</div>
