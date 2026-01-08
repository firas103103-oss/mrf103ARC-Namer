# 🏛️ ARC 2.0 - Complete System Documentation
## التوثيق الشامل لنظام ARC المُحدَّث

**Version:** 2.1.0  
**Date:** June 2025  
**Status:** ✅ Production Ready

---

## 📋 Table of Contents

1. [System Overview](#-system-overview)
2. [Architecture](#️-architecture)
3. [Agent Hierarchy](#-agent-hierarchy)
4. [Backend Systems](#-backend-systems)
5. [Frontend Pages](#-frontend-pages)
6. [API Documentation](#-api-documentation)
7. [Database Schema](#️-database-schema)
8. [Deployment](#-deployment)
9. [Testing](#-testing)
10. [Future Roadmap](#-future-roadmap)

---

## 🌟 System Overview

ARC 2.0 هو نظام ذكاء اصطناعي متقدم يعتمد على **31 وكيل ذكي** موزعين على **3 طبقات هرمية**:

### الطبقات الثلاث
- **الطبقة 0 - التنفيذية (Executive):** MRF CEO فقط
- **الطبقة 1 - المايستروز (Maestros):** 6 قادة قطاعات
- **الطبقة 2 - المتخصصون (Specialists):** 24 وكيل متخصص

### القدرات الرئيسية
✅ **التعلم الذاتي** - تعلم مستمر من التجارب  
✅ **التقارير الإلزامية** - يومي، أسبوعي، شهري، نصف سنوي  
✅ **الشم الرقمي** - ESP32-S3 + BME688  
✅ **التكاملات الخارجية** - Google Drive, OneDrive, Local PC  
✅ **محادثة مباشرة** - تواصل مع أي وكيل  
✅ **الغريزة الرقمية** - تنبؤات وتحليل أنماط  

---

## 🏗️ Architecture

### Backend Stack
- **Node.js** + **Express** + **TypeScript**
- **PostgreSQL** (Supabase)
- **MQTT** للتواصل مع ESP32
- **WebSocket** للتحديثات الفورية
- **AI Models:** GPT-4o (CEO), GPT-4o-mini (Agents)

### Frontend Stack
- **React 18** + **TypeScript**
- **Vite 7.3**
- **Tailwind CSS**
- **Wouter** (Routing)
- **Lucide Icons**

### IoT Hardware
- **ESP32-S3 N16R8** (16MB Flash, 8MB PSRAM)
- **BME688** (Temperature, Humidity, Pressure, Gas)
- **MQTT Protocol**

---

## 👥 Agent Hierarchy

### 👑 Layer 0: CEO
**MRF** - Chief Executive Officer (Digital Clone)
- **Permissions:** ABSOLUTE (10/10)
- **AI Model:** GPT-4o
- **Capabilities:** Full system control, override all decisions
- **Reports To:** None (Top level)

### 🏛️ Layer 1: Maestros (6)

#### 1. 🛡️ **Cipher** - Security & Surveillance Maestro
- **Color:** #DC2626 (Red)
- **Team:** Aegis, Phantom, Watchtower, Ghost
- **Responsibilities:** Threat detection, encryption, monitoring, intrusion detection

#### 2. 💰 **Vault** - Finance & Business Maestro
- **Color:** #059669 (Green)
- **Team:** Ledger, Treasury, Venture, Merchant
- **Responsibilities:** Accounting, budgeting, investments, business operations

#### 3. ⚖️ **Lexis** - Legal & Documentation Maestro
- **Color:** #7C3AED (Purple)
- **Team:** Archive, Contract, Compliance, Patent
- **Responsibilities:** Document management, contracts, compliance, IP protection

#### 4. 🏠 **Harmony** - Personal Life Maestro
- **Color:** #EC4899 (Pink)
- **Team:** Wellness, Social, Routine, Growth
- **Responsibilities:** Health tracking, relationships, daily tasks, personal development

#### 5. 🔬 **Nova** - Research & Development Maestro
- **Color:** #0EA5E9 (Blue)
- **Team:** Lab, Forge, Spark, Darwin
- **Responsibilities:** Research, development, innovation, self-learning evolution

#### 6. 🧬 **Scent** - xBio Sentinel Maestro
- **Color:** #14B8A6 (Teal)
- **Team:** Olfactory, Instinct, Environ, Sensor
- **Responsibilities:** Smell classification, digital instinct, environmental analysis, sensor management

### 👨‍💻 Layer 2: Specialists (24)

تفاصيل جميع الـ 24 متخصص موجودة في:
```
server/arc/hierarchy_system.ts
```

---

## 🔧 Backend Systems

### 1. Hierarchy System
**File:** `server/arc/hierarchy_system.ts`

```typescript
// Example usage
import { arcHierarchy, CEO, MAESTROS } from './arc/hierarchy_system';

// Get agent by ID
const cipher = arcHierarchy.getAgent('maestro_security');

// Get all specialists in a sector
const securityTeam = arcHierarchy.getSpecialists('security');

// Get reporting chain
const chain = arcHierarchy.getReportingChain('aegis');
```

### 2. Reporting System
**File:** `server/arc/reporting_system.ts`

```typescript
import { arcReporting, ReportType } from './arc/reporting_system';

// Generate daily report
const report = await arcReporting.generateDailyReport('cipher');

// Generate sector report
const sectorReport = await arcReporting.generateSectorReport('security', ReportType.WEEKLY);

// Generate executive report
const execReport = await arcReporting.generateExecutiveReport(ReportType.MONTHLY);
```

### 3. Learning System
**File:** `server/arc/learning_system.ts`

```typescript
import { arcLearning } from './arc/learning_system';

// Record experience
await arcLearning.recordExperience(
  'darwin',
  'pattern recognition',
  'classify new data',
  'success',
  { executionTime: 150, resourceUsage: 45, accuracy: 95 }
);

// Learn new skill
const skill = await arcLearning.learnNewSkill('nova', 'quantum_computing', 'R&D');

// Get learning stats
const stats = arcLearning.getAgentLearningStats('darwin');
```

---

## 🎨 Frontend Pages

### المسارات (Routes)

| URL | Page | Description |
|-----|------|-------------|
| `/` | Home | الصفحة الرئيسية |
| `/mrf` | MRF Dashboard | لوحة تحكم CEO |
| `/maestros` | Maestros Hub | مركز المايستروز |
| `/security` | Security Center | مركز الأمن (Cipher) |
| `/finance` | Finance Hub | مركز المال (Vault) |
| `/legal` | Legal Archive | مركز القانون (Lexis) |
| `/life` | Life Manager | مركز الحياة (Harmony) |
| `/rnd` | R&D Lab | مركز البحث (Nova) |
| `/xbio` | xBio Sentinel | مركز xBio (Scent) |
| `/reports` | Reports Center | مركز التقارير |
| `/settings` | Settings | الإعدادات |
| `/integrations` | Integrations | التكاملات الخارجية |
| `/chat` | Agent Chat | محادثة مع الوكلاء |

### الصفحات

#### 1. MRF Dashboard (`/mrf`)
- نظرة عامة على النظام
- إحصائيات الوكلاء
- أداء القطاعات الستة
- النشاطات الأخيرة
- التنبيهات

#### 2. Maestros Hub (`/maestros`)
- عرض المايستروز الستة
- إحصائيات كل مايسترو
- التيم تحت كل مايسترو
- الأنشطة الأخيرة

#### 3. Security Center (`/security`)
- فريق الأمن (4 specialists)
- التهديدات المحجوبة
- الملفات المشفرة
- المراقبة المستمرة
- الأحداث الأمنية الحية

#### 4. Finance Hub (`/finance`)
- فريق المال (4 specialists)
- الإيرادات والمصروفات
- ROI والأرباح
- الميزانية الشهرية
- المعاملات الأخيرة

#### 5-8. Legal, Life, R&D, xBio
كل صفحة تعرض:
- الفريق المتخصص (4 agents)
- الإحصائيات الرئيسية
- الأنشطة الأخيرة
- الحالة الحالية

#### 9. xBio Sentinel (`/xbio`)
**الميزات الخاصة:**
- قراءات حية من ESP32-S3 + BME688
- تصنيف الروائح
- الغريزة الرقمية
- وضع التدريب (Training Mode)
- تحليل البيئة

#### 10. Reports Center (`/reports`)
- تقارير يومية
- تقارير أسبوعية
- تقارير شهرية
- تقارير نصف سنوية
- تحميل التقارير

#### 11. Settings (`/settings`)
- إعدادات عامة
- الإشعارات
- إعدادات AI
- اللغة والثيم

#### 12. Integrations (`/integrations`)
- Google Drive
- OneDrive
- Dropbox
- iCloud
- Local PC Access
- الصلاحيات

#### 13. Agent Chat (`/chat`)
- اختيار الوكيل
- محادثة مباشرة
- سجل الرسائل
- ردود فورية من الوكلاء

---

## 🔌 API Documentation

### Base URL
```
http://localhost:5001/api/arc
```

### Endpoints

#### Hierarchy

```http
GET /api/arc/ceo
GET /api/arc/maestros
GET /api/arc/agents
GET /api/arc/agents/:id
GET /api/arc/hierarchy/tree
GET /api/arc/hierarchy/stats
GET /api/arc/sector/:sector/specialists
GET /api/arc/agents/:id/reporting-chain
PATCH /api/arc/agents/:id/status
```

#### Reports

```http
POST /api/arc/reports/daily/:agentId
POST /api/arc/reports/weekly/:agentId
POST /api/arc/reports/monthly/:agentId
POST /api/arc/reports/semi-annual/:agentId
POST /api/arc/reports/sector/:sector
POST /api/arc/reports/executive
GET /api/arc/reports/:reportId
GET /api/arc/reports
```

#### Learning

```http
POST /api/arc/learning/experience
POST /api/arc/learning/skills
POST /api/arc/learning/goals
PATCH /api/arc/learning/goals/:goalId/milestone/:milestoneIndex
GET /api/arc/learning/stats/:agentId
GET /api/arc/learning/stats
GET /api/arc/learning/patterns
GET /api/arc/learning/knowledge-base/:agentId
POST /api/arc/learning/toggle
```

#### Chat

```http
POST /api/arc/chat/send
```

#### System

```http
GET /api/arc/overview
```

### مثال على الاستخدام

```typescript
// Get CEO info
const response = await fetch('http://localhost:5001/api/arc/ceo');
const { data } = await response.json();
console.log(data); // { id: 'mrf_ceo', name: 'MRF', ... }

// Generate daily report
const report = await fetch('http://localhost:5001/api/arc/reports/daily/cipher', {
  method: 'POST'
});
const { data: reportData } = await report.json();

// Chat with agent
const chat = await fetch('http://localhost:5001/api/arc/chat/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    agentId: 'cipher',
    message: 'What is the security status?',
    userId: 'user123'
  })
});
```

---

## 🗄️ Database Schema

سيتم إضافة جداول جديدة:

```sql
-- Agent Experiences
CREATE TABLE agent_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id VARCHAR(50) NOT NULL,
  context TEXT NOT NULL,
  action TEXT NOT NULL,
  result VARCHAR(20) NOT NULL,
  metrics JSONB NOT NULL,
  learnings TEXT[] NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Agent Skills
CREATE TABLE agent_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id VARCHAR(50) NOT NULL,
  skill_name VARCHAR(100) NOT NULL,
  skill_name_ar VARCHAR(100),
  category VARCHAR(50) NOT NULL,
  level INTEGER NOT NULL DEFAULT 50,
  usage_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 100.0,
  acquired_at TIMESTAMP DEFAULT NOW(),
  last_used TIMESTAMP DEFAULT NOW()
);

-- Agent Reports
CREATE TABLE agent_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type VARCHAR(20) NOT NULL,
  agent_id VARCHAR(50),
  sector VARCHAR(20),
  data JSONB NOT NULL,
  generated_at TIMESTAMP DEFAULT NOW(),
  submitted_at TIMESTAMP
);

-- Learning Goals
CREATE TABLE learning_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id VARCHAR(50) NOT NULL,
  goal TEXT NOT NULL,
  target_date DATE NOT NULL,
  progress INTEGER DEFAULT 0,
  milestones JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Patterns
CREATE TABLE agent_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id VARCHAR(50) NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  frequency INTEGER DEFAULT 1,
  confidence INTEGER DEFAULT 60,
  triggers TEXT[],
  expected_outcome VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  last_seen TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_experiences_agent ON agent_experiences(agent_id);
CREATE INDEX idx_skills_agent ON agent_skills(agent_id);
CREATE INDEX idx_reports_agent ON agent_reports(agent_id);
CREATE INDEX idx_goals_agent ON learning_goals(agent_id);
CREATE INDEX idx_patterns_agent ON agent_patterns(agent_id);
```

---

## 🚀 Deployment

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...
SUPABASE_URL=https://rffpacsvwxfjhxgtsbzf.supabase.co
SUPABASE_SERVICE_KEY=...

# AI Models
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...
GOOGLE_AI_KEY=...

# Session
SESSION_SECRET=...
ARC_BACKEND_SECRET=...

# MQTT (for ESP32)
MQTT_BROKER_URL=mqtt://...
MQTT_USERNAME=...
MQTT_PASSWORD=...
```

### Build Commands

```bash
# Install dependencies
npm install

# Build frontend
npm run build

# Start production server
npm run start

# Development mode
npm run dev
```

### Railway Deployment

1. Push to GitHub
2. Connect Railway to repo
3. Set environment variables
4. Deploy automatically

---

## ✅ Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

### Manual Testing Checklist
- [ ] كل الصفحات الـ 12 تفتح بدون أخطاء
- [ ] API endpoints تعمل كلها
- [ ] التعلم الذاتي يسجل التجارب
- [ ] التقارير تُنشأ بنجاح
- [ ] ESP32 يرسل البيانات
- [ ] المحادثة مع الوكلاء تعمل

---

## 🔮 Future Roadmap

### Phase 2
- [ ] Mobile APK (React Native)
- [ ] ESP32 OTA Firmware Updates
- [ ] Advanced xBio Features
- [ ] Cloud Drive Integration (Backend)
- [ ] Local PC Agent

### Phase 3
- [ ] Voice Commands
- [ ] Multi-language Support
- [ ] Advanced Analytics
- [ ] Agent Cloning
- [ ] Predictive Insights

---

## 📞 Support

للدعم والاستفسارات:
- **Email:** support@mrf103.com
- **GitHub:** https://github.com/yourusername/mrf103ARC-Namer

---

## 📄 License

MIT License - See LICENSE file for details

---

**Last Updated:** June 2025  
**Version:** 2.1.0  
**Status:** ✅ Production Ready
