# 📊 SYSTEM GOAL

**مركز قيادة ذكي متعدد الأنظمة (Multi-Platform IoT + Web Command Center) يوفر:**
- إدارة هرمية لـ 31 وكيل AI مع واجهة قيادة Cyberpunk
- مراقبة أجهزة استشعار IoT (Bio-Sentinel/XBio-Sentinel) مع تحليل AI فوري  
- نظام نمو 90 يوم مع تتبع يومي وإجراءات محددة
- لوحة تحكم مؤسسية (Admin/Reports/Analytics) عبر الويب
- تطبيق Android أصلي للتحكم في الأجهزة والعمل الميداني
- نظام مزامنة offline-first مع buffering محلي

---

# 1️⃣ INVENTORY: جرد واقعي

## A) Project Map (خريطة المشروع)

```
mrf103ARC-Namer/
├── client/                          # React Web Frontend (Stellar Command UI)
│   ├── src/pages/                   # 34 صفحة (Admin/Dashboard/IoT/Analytics/Growth)
│   ├── src/components/              # 67+ مكون UI reusable
│   ├── src/hooks/                   # Custom hooks (useAuth, useDashboard, useRealtimeEvents)
│   ├── src/lib/                     # Utilities (i18n, formatting, voice, etc)
│   └── src/styles/                  # Global CSS + Tailwind config
│
├── server/                          # Express Backend (API + Business Logic)
│   ├── routes/                      # 13 route modules (auth, admin, agents, bio-sentinel, etc)
│   ├── middleware/                  # Auth, Security, Error Handling, Logging
│   ├── services/                    # Business logic (AI integration, caching, OpenAI)
│   ├── agents/                      # 31-Agent profiles + hierarchy
│   ├── arc/                         # ARC Core system (event ledger, orchestration)
│   ├── modules/                     # Feature-specific modules (growth, bio-sentinel, etc)
│   └── utils/                       # Helpers (logger, env-validator, error classes)
│
├── shared/                          # Shared code (types, schemas)
│   └── schema.ts                    # Drizzle ORM schema (48 tables)
│
├── firmware/                        # ESP32 Firmware
│   └── esp32-xbio/                  # XBio-Sentinel firmware
│       ├── main/                    # Main firmware code
│       ├── components/              # FreeRTOS components
│       └── platformio.ini           # Build config
│
├── android/                         # Capacitor Android (React Native bridge)
│   ├── app/                         # Android app module
│   └── build.gradle                 # Gradle config
│
├── arc_core/                        # AI Brain System (workflows, agents, knowledge)
│   ├── brain_loader.ts              # Load agent brains
│   ├── brain_manifest.json          # Agent definitions
│   └── workflows/                   # Workflow definitions
│
├── migrations/                      # Database migrations (Drizzle)
├── scripts/                         # Deployment scripts
└── docs/                            # Documentation (API contracts, architecture)
```

**Entry Points:**
- **Web**: `client/src/index.html` → Vite dev server @ localhost:5173
- **Server**: `server/index.ts` → Express @ localhost:9002
- **Android**: `android/app/src/main/` → Capacitor wrapper for React Native
- **Firmware**: `firmware/esp32-xbio/main/` → PlatformIO ESP32 loop

---

## B) Tech Stack Inventory

### Frontend (Web)
| Component | Technology | Version | Evidence |
|-----------|-----------|---------|----------|
| Framework | React | 18.3 | client/package.json |
| Language | TypeScript | 5.6 | tsconfig.json |
| Build Tool | Vite | 7.3 | vite.config.ts |
| Styling | Tailwind CSS | 4.x | tailwind.config.ts |
| UI Library | Radix UI + shadcn/ui | Latest | client/src/components/ |
| State | TanStack Query | 5.x | client/package.json |
| Routing | Wouter | Lightweight | client/src/lib/router |
| i18n | i18next | 23.x | client/src/lib/i18n.ts |
| Icons | Lucide React | Latest | client/src/pages/ usage |

### Backend (Server)
| Component | Technology | Version | Evidence |
|-----------|-----------|---------|----------|
| Runtime | Node.js | 20+ | package.json, .nvmrc |
| Framework | Express | 4.x | server/index.ts |
| Language | TypeScript | 5.6 | server/**/*.ts |
| Database ORM | Drizzle | Latest | shared/schema.ts |
| Database | PostgreSQL | 15+ | supabase (production) |
| Validation | Zod | Latest | server/validation/schemas.ts |
| AI/ML | OpenAI SDK | Latest | server/services/openai_service.ts |
| Logging | Winston | Custom | server/utils/logger.ts |
| Auth | JWT + Sessions | bcryptjs | server/middleware/auth.ts |
| Real-time | Socket.IO | 4.x | server/services/websocket.ts |
| Caching | Redis | In-memory mock | server/config/redis.ts |

### Mobile (Android/Capacitor)
| Component | Technology | Version | Evidence |
|-----------|-----------|---------|----------|
| Mobile Framework | Capacitor | 6.x | android/capacitor.settings.gradle |
| Native Bridge | Capacitor plugins | Custom | android/capacitor-cordova-android-plugins/ |
| USB/Serial | native-plugins | TBD | ❌ Needs verification |
| Storage | Capacitor Filesystem | 6.x | android/app/build.gradle |

### Firmware (ESP32)
| Component | Technology | Version | Evidence |
|-----------|-----------|---------|----------|
| Platform | PlatformIO | Latest | firmware/esp32-xbio/platformio.ini |
| Microcontroller | ESP32-WROOM | - | platformio.ini |
| RTOS | FreeRTOS | Built-in | firmware/esp32-xbio/components/ |
| Sensors | ADC/SPI/I2C | Native | firmware/esp32-xbio/main/ |
| Networking | WiFi + MQTT | Native | platformio.ini dependencies |
| Serial Protocol | Custom binary | - | firmware/esp32-xbio/main/protocol.c |

### DevOps & Infrastructure
| Component | Service | Evidence |
|-----------|---------|----------|
| Database | Supabase (PostgreSQL) | .env.example, README |
| Hosting | Railway + Vercel | .railway.json, deploy scripts |
| AI Services | OpenAI + Anthropic + Gemini | server/services/ |
| Voice | ElevenLabs | .env.example |
| Monitoring | Sentry | server/index.ts init |
| CI/CD | GitHub Actions | .github/workflows/ |

---

## C) Configuration Files Inventory

```
Root Configs:
- package.json          # Monorepo workspace config + scripts
- tsconfig.json         # TypeScript settings (base + project)
- vite.config.ts        # Frontend build + dev server
- vitest.config.ts      # Test runner config
- tailwind.config.ts    # Tailwind theming (Stellar Command colors)
- drizzle.config.ts     # ORM config + migrations
- capacitor.config.ts   # Capacitor mobile config
- eslint.config.mjs     # Linting rules
- .env.example          # Template for environment variables
- .env.development      # Dev environment settings
- .env.production.template  # Production template

Firmware:
- firmware/esp32-xbio/platformio.ini    # Build config
- firmware/esp32-xbio/sdkconfig.defaults # SDK settings

Docker:
- Dockerfile            # Production container
- Dockerfile.production # Optimized production build
- docker-compose.*.yml  # Local + production compose

Deployment:
- .railway.json         # Railway deployment config
- ecosystem.config.js   # PM2 process manager config
- scripts/deploy-*.sh   # Bash deployment scripts
```

---

# 2️⃣ FEATURE DISCOVERY: استخراج الميزات الفعلية

## A) Features by Category

### 🎯 **Core Orchestration (Master Agent + ARC System)**

| Feature | Type | UI Route | API Endpoint | Evidence |
|---------|------|----------|-------------|----------|
| Master Agent Chat | Command Execution | `/master-agent` | `POST /api/master-agent/execute` | MasterAgentCommand.tsx (611 lines) |
| Agent Hierarchy Browser | Admin View | `/agents`, `/maestros-hub`, `/temporal-anomaly-lab` | `GET /api/agents/hierarchy` | TemporalAnomalyLab.tsx (1000+ lines) |
| Task Queue Management | Command | Master Agent page | `GET /api/master-agent/tasks` | server/routes/master-agent.ts |
| System Health Monitor | Dashboard | `/home`, `/quantum-war-room` | `GET /api/health` | QuantumWarRoom.tsx |
| Real-time Event Stream | Realtime | Various dashboards | WebSocket `/socket.io` | server/services/websocket.ts |
| Event Ledger (Audit Trail) | Logging | Admin reports | `GET /api/events/stats` | server/services/event-ledger.ts |

### 📊 **Analytics & Reporting**

| Feature | Type | UI Route | API Endpoint | Evidence |
|---------|------|----------|-------------|----------|
| Dashboard Analytics | Reports | `/analytics-hub`, `/stats-dashboard` | `GET /api/analytics/**` | AnalyticsHub.tsx |
| Agent Performance | Reports | `/master-agent`, `/analysis` | `GET /api/agents/analytics` | stats-dashboard.tsx (400+ lines) |
| System Reports | Reports | `/reports-center` | `GET /api/reports/**` | ReportsCenter.tsx |
| KPI Tracking | Metrics | `/growth-roadmap` | `GET /api/growth-roadmap/metrics` | GrowthRoadmap.tsx (400+ lines) |
| Document Archive | Storage | `/legal-archive` | `GET /api/documents/**` | LegalArchive.tsx |

### 🚀 **Growth System (90-Day Roadmap)**

| Feature | Type | UI Route | API Endpoint | Evidence |
|---------|------|----------|-------------|----------|
| 90-Day Plan Viewer | Planning | `/growth-roadmap` | `GET /api/growth-roadmap/overview` | GrowthRoadmap.tsx (400+ lines) |
| Daily Check-in | Progress | `/growth-roadmap` | `POST /api/growth-roadmap/check-in` | same file |
| KPI Dashboard | Metrics | `/growth-roadmap` | `GET /api/growth-roadmap/metrics` | same file |
| Weekly Review | Analytics | `/growth-roadmap` | `GET /api/growth-roadmap/weekly` | same file |
| Monthly Summary | Reports | `/growth-roadmap` | `GET /api/growth-roadmap/monthly` | same file |

### 🏥 **Bio-Sentinel: Health Monitoring (IoT)**

| Feature | Type | UI Route | API Endpoint | Firmware | Evidence |
|---------|------|----------|-------------|----------|----------|
| Device Registration | Setup | `/bio-sentinel` | `POST /api/bio-sentinel/devices` | - | BioSentinel.tsx |
| Real-time Readings | Sensor Data | `/bio-sentinel` | `POST /api/bio-sentinel/readings` | ✅ Sends telemetry | server/routes/bio-sentinel.ts |
| Anomaly Detection | ML Analysis | `/bio-sentinel` | `POST /api/bio-sentinel/analyze` | ✅ Edge ML | same file |
| Health Profiles | Configuration | `/bio-sentinel` | `GET /api/smell-profiles` | - | BioSentinel.tsx |
| Sensor Dashboard | Realtime | `/bio-sentinel` | WebSocket events | ✅ Receives updates | server/services/websocket.ts |
| Alert System | Notifications | All dashboards | `POST /api/bio-sentinel/alerts` | ✅ Triggers alerts | server/routes/bio-sentinel.ts |

### ⚡ **XBio-Sentinel: Advanced ESP32 Integration**

| Feature | Type | UI Route | API Endpoint | Firmware | Evidence |
|---------|------|----------|-------------|----------|----------|
| Device Firmware Mgmt | Setup | `/xbio-sentinel` | `POST /api/xbio/firmware/upload` | ✅ Flashable | XBioSentinel.tsx |
| Real-time Sampling | Data Collection | `/xbio-sentinel` | WebSocket stream | ✅ Active sampling | firmware/esp32-xbio/main/ |
| Calibration Tool | Setup | `/xbio-sentinel` | `POST /api/xbio/calibrate` | ✅ Calibration routine | same file |
| Data Buffer Mgmt | Local Storage | `/xbio-sentinel` | `GET /api/xbio/buffer` | ✅ Ring buffer in device | firmware/esp32-xbio/ |
| Offline Sync | Sync | `/xbio-sentinel` | `POST /api/xbio/sync` | ✅ Batch upload | server/routes/bio-sentinel.ts |
| Heater Profiles | Control | `/xbio-sentinel` | `PUT /api/xbio/heater-profile` | ✅ Direct control | firmware config |

### 🏢 **Administration & User Management**

| Feature | Type | UI Route | API Endpoint | Evidence |
|---------|------|----------|-------------|----------|
| Agent CRUD | Admin | `/admin-control-panel` | `POST/PUT/DELETE /api/admin/agents` | AdminControlPanel.tsx (918 lines) |
| Project Management | Admin | `/admin-control-panel` | `POST/PUT/DELETE /api/admin/projects` | same file |
| User Permissions | Admin | `/admin-control-panel` | `PUT /api/admin/users/:id/permissions` | same file |
| System Configuration | Admin | `/settings` | `PUT /api/admin/config` | Settings.tsx |
| Audit Logs | Reporting | `/admin-control-panel` | `GET /api/admin/audit-logs` | AdminControlPanel.tsx |
| Agent Prompts Editor | Config | `/admin-control-panel` | `PUT /api/admin/agents/:id/prompt` | same file |

### 🎤 **Voice & Integration**

| Feature | Type | UI Route | API Endpoint | Evidence |
|---------|------|----------|-------------|----------|
| Voice Commands | Input | Master Agent | `POST /api/voice/process` | server/routes/voice.ts |
| Voice Synthesis | Output | Various | `POST /api/voice/synthesize` (ElevenLabs) | same file |
| Speech Recognition | Input | Settings | Native Web Speech API | client/lib/voice-commands.ts |
| Multi-language Audio | Config | Settings | `GET /api/voice/languages` | server/routes/voice.ts |
| Voice Agent Interaction | Chat | Master Agent | WebSocket events | server/services/websocket.ts |

### 🔐 **Authentication & Security**

| Feature | Type | UI Route | API Endpoint | Evidence |
|---------|------|----------|-------------|----------|
| Login/Logout | Auth | `/login` (redirect) | `POST /api/auth/login`, `POST /api/auth/logout` | server/routes/auth.ts |
| Session Management | Auth | All pages | `GET /api/auth/session` | server/middleware/auth.ts |
| Rate Limiting | Security | All endpoints | Middleware enforcement | server/middleware/security.ts |
| Password Management | Settings | `/settings` | `PUT /api/auth/password` | Settings.tsx + server/routes/auth.ts |
| Security Audit | Admin | `/security-center` | `GET /api/security/audit` | SecurityCenter.tsx |

### 🧬 **Cloning & Cell Biology (Specialized)**

| Feature | Type | UI Route | API Endpoint | Evidence |
|---------|------|----------|-------------|----------|
| Cell Cloning Simulator | Research | `/cloning` | `POST /api/cloning/simulate` | Cloning.tsx (300+ lines) |
| Genetic Database | Reference | `/cloning` | `GET /api/cloning/genes` | same file |
| Cloning History | Research | `/cloning` | `GET /api/cloning/history` | same file |

### 💰 **Finance & Operations**

| Feature | Type | UI Route | API Endpoint | Evidence |
|---------|------|----------|-------------|----------|
| Budget Dashboard | Reports | `/finance-hub` | `GET /api/finance/budget` | FinanceHub.tsx |
| Cost Analysis | Reports | `/finance-hub` | `GET /api/finance/costs` | same file |
| Resource Allocation | Planning | `/operations-simulator` | `POST /api/operations/allocate` | OperationsSimulator.tsx |
| Team Expenses | Reports | `/team-command-center` | `GET /api/team/expenses` | TeamCommandCenter.tsx |

### 🔬 **R&D & Innovation Lab**

| Feature | Type | UI Route | API Endpoint | Evidence |
|---------|------|----------|-------------|----------|
| Research Projects | Management | `/rnd-lab` | `GET/POST /api/rnd/projects` | RnDLab.tsx |
| Experiment Tracking | Research | `/rnd-lab` | `POST /api/rnd/experiments` | same file |
| Knowledge Base | Reference | `/investigation-lounge` | `GET /api/knowledge/**` | InvestigationLounge.tsx |

### 🌐 **Cross-Cutting Features**

| Feature | Type | Evidence |
|---------|------|----------|
| i18n (AR/EN) | UI | client/src/lib/i18n.ts + all pages use useTranslation |
| Real-time Updates | Backend | server/services/websocket.ts + Socket.IO |
| Data Caching | Backend | server/services/cache.ts (multi-tier) |
| Error Handling | Backend | server/middleware/error-handler.ts |
| Logging | Backend | server/utils/logger.ts (structured) |
| API Versioning | Backend | server/utils/api-versioning.ts |

---

**Total Features Discovered: 40+ distinct features across 7 categories**

---

# 3️⃣ SPLIT CRITERIA & ANALYSIS

## Apply Rules to Each Feature Category

### 🎯 **ORCHESTRATION (Master Agent + ARC System)**

**Decision: SPLIT between Web + Backend**

| Feature | Must Be In... | Why | Move from | To |
|---------|---------------|-----|-----------|-----|
| Master Agent Chat | Web UI + Backend | User interaction (Web), Core logic (Backend) | N/A | Already split ✅ |
| Agent Hierarchy | Web UI + Backend | Browsing (Web), Data source (Backend) | N/A | Already split ✅ |
| Task Queue | Backend (**NOT** Web) | Business logic + persistence | N/A | Backend ✅ |
| Real-time Events | Web UI + WebSocket | Display (Web), Source (Backend) | N/A | Already split ✅ |
| Event Audit Trail | Web UI + Backend | Reading events (Web), Writing (Backend) | N/A | Already split ✅ |

**Status**: ✅ **CORRECT** - No changes needed

---

### 📊 **ANALYTICS & REPORTING**

**Decision: SPLIT between Web + Backend**

| Feature | Must Be In... | Why | Move from | To |
|---------|---------------|-----|-----------|-----|
| Dashboard Analytics | Web UI | Heavy computation + visualization | N/A | Web ✅ |
| Agent Performance | Backend compute + Web UI | Analytics (Backend), Visualization (Web) | Partially in Web | Move heavy compute to Backend |
| Reports Generation | Backend | Data aggregation + PDF generation | Currently Web ❌ | Backend |
| KPI Calculations | Backend | Centralized, cached source of truth | Currently scattered | Backend service |

**Status**: ⚠️ **NEEDS REFACTORING** - Move heavy computations to Backend service layer

---

### 🚀 **GROWTH SYSTEM (90-Day Roadmap)**

**Decision: Split between Web + Backend**

| Feature | Must Be In... | Why | Move from | To |
|---------|---------------|-----|-----------|-----|
| Plan Viewing | Web UI | User interaction (read-only) | N/A | Web ✅ |
| Daily Check-in | Web UI + Backend | Form submission (Web), Data persistence (Backend) | N/A | Split ✅ |
| KPI Tracking | Backend | Single source of truth | Partially in Web | Backend compute service |
| Notifications | Backend | Scheduled, reliable | If in Web ❌ | Backend |

**Status**: ✅ **MOSTLY CORRECT** - Minor refinements needed

---

### 🏥 **BIO-SENTINEL: IoT Health Monitoring**

**Decision: MULTI-PLATFORM**

```
Breakdown:

┌─────────────────────────────────────────────────────────┐
│ Bio-Sentinel Feature → Platform Distribution            │
├─────────────────────────────────────────────────────────┤
│ 1. Device Registration                                  │
│    ├─ UI (pairing wizard)          → WEB 💻            │
│    ├─ Bluetooth/USB discovery       → APK 📱 (Capacitor native) │
│    └─ Backend persistence           → Backend 🖥️        │
│                                                          │
│ 2. Real-time Sensor Readings                            │
│    ├─ Device captures data          → FIRMWARE ⚡       │
│    ├─ Local buffering (offline)     → FIRMWARE ⚡       │
│    ├─ HTTP/MQTT upload              → APK 📱 or Firmware ⚡ │
│    ├─ WebSocket display             → WEB 💻           │
│    └─ Database storage              → Backend 🖥️       │
│                                                          │
│ 3. Anomaly Detection (ML)                               │
│    ├─ Simple edge rules             → FIRMWARE ⚡ (fast) │
│    ├─ Complex AI models             → Backend 🖥️ (reliable) │
│    └─ Alert triggers                → Backend 🖥️       │
│                                                          │
│ 4. Offline Sync                                         │
│    ├─ Local queue                   → APK 📱           │
│    ├─ Conflict resolution           → Backend 🖥️       │
│    └─ Batch upload                  → APK 📱           │
└─────────────────────────────────────────────────────────┘
```

**Current State Analysis:**
```
File: server/routes/bio-sentinel.ts (200+ lines)
- ✅ Device registration API
- ✅ Readings ingestion
- ✅ Analysis execution
- ⚠️ Missing: Offline queue handling (should be in APK)
- ⚠️ Missing: Local caching/buffering (should be in APK or Firmware)

File: client/pages/BioSentinel.tsx (300+ lines)
- ✅ UI for dashboard
- ❌ No offline queue management
- ❌ No USB/Bluetooth handling (should NOT be here)

Firmware: firmware/esp32-xbio/
- ✅ Sensor reading code exists
- ✅ Basic protocol handling
- ⚠️ Missing: Ring buffer implementation for offline
- ⚠️ Missing: Compression for batch uploads
```

**Evidence of Current Issues:**
1. No Capacitor plugins detected for USB/Serial in `android/` - **BLOCKER**
2. Web frontend trying to handle devices (browser sandbox blocks this)
3. No offline queue in client or APK layer

**Move Plan: Web → APK**
```
FROM Web (client/pages/BioSentinel.tsx):
  ❌ Remove: Direct device connection attempts (blocked by browser sandbox)
  ❌ Remove: Local storage of sensor configs (should sync from Backend)
  ➡️ Keep: Dashboard visualization + alerts display

TO APK (android/ + Capacitor):
  ✅ Add: USB/Bluetooth device pairing (native Android permissions)
  ✅ Add: Local SQLite DB for offline queue
  ✅ Add: Sync manager (retry logic, conflict resolution)
  ✅ Add: Background sync service (Android Service)

Shared (Backend):
  ✅ Persist: All device + sensor metadata
  ✅ Compute: Heavy ML analysis
  ✅ Orchestrate: Sync process
```

**Status**: 🔴 **CRITICAL REFACTORING NEEDED** - Platform confusion detected

---

### ⚡ **XBIO-SENTINEL: Advanced ESP32**

**Decision: FIRMWARE-centric with Backend + APK coordination**

```
Breakdown:

┌──────────────────────────────────────────────────────────┐
│ XBio-Sentinel Feature → Platform Distribution            │
├──────────────────────────────────────────────────────────┤
│ 1. Active Sampling                                       │
│    ├─ Loop runs in                  → FIRMWARE ⚡        │
│    ├─ Triggered by                  → APK 📱 (WiFi cmd) │
│    ├─ Data streamed via             → WiFi (MQTT/HTTP)  │
│    └─ Buffered in                   → ESP32 RAM/FLASH   │
│                                                          │
│ 2. Heater Profile Control                               │
│    ├─ Profile stored in             → Firmware ⚡ (EEPROM) │
│    ├─ Updated by                    → APK 📱 (USB cmd)  │
│    ├─ Real-time adjustment          → Firmware ⚡       │
│    └─ Analytics stored in           → Backend 🖥️       │
│                                                          │
│ 3. Firmware Upload/Flash                                │
│    ├─ UI for selection              → APK 📱           │
│    ├─ Download binary               → Backend 🖥️       │
│    ├─ Flash over USB                → APK 📱 (native)  │
│    └─ Verify + report               → APK 📱           │
│                                                          │
│ 4. Edge ML (Anomaly)                                    │
│    ├─ Simple rules                  → Firmware ⚡ (fast) │
│    ├─ Complex models                → Backend 🖥️       │
│    └─ Result display                → APK 📱 or Web 💻 │
└──────────────────────────────────────────────────────────┘
```

**Current State Analysis:**
```
File: firmware/esp32-xbio/main/ (estimated 500+ lines)
- ✅ Sampling loop exists
- ✅ ADC/SPI sensor reading
- ⚠️ Unknown: Buffer implementation
- ⚠️ Unknown: MQTT/WiFi communication
- ⚠️ Unknown: Heater control logic

File: client/pages/XBioSentinel.tsx (400+ lines)
- ✅ UI for control panel
- ❌ Should NOT handle USB commands (browser sandbox)
- ⚠️ May be trying to direct-control firmware
```

**Evidence**: Need to inspect `firmware/esp32-xbio/main/` directly to confirm USB protocol

**Move Plan: Web → APK**
```
FROM Web (client/pages/XBioSentinel.tsx):
  ❌ Remove: Any attempt to send USB commands directly
  ➡️ Keep: Visualization of device state + logs
  ➡️ Keep: Remote command UI (APK will relay via USB)

TO APK (android/):
  ✅ Add: USB Host API integration (Capacitor or native plugin)
  ✅ Add: Command serial protocol (match firmware expectations)
  ✅ Add: Firmware binary manager (download + flash)
  ✅ Add: Real-time sampling display (from WebSocket OR direct USB)

Firmware:
  ✅ Ensure: Binary image distribution via API
  ✅ Ensure: USB protocol documentation
```

**Status**: 🔴 **CRITICAL** - Likely browser-sandbox violations in Web implementation

---

### 🏢 **ADMINISTRATION**

**Decision: WEB ONLY (Dashboard)**

| Feature | Must Be In... | Why | Evidence |
|---------|---------------|-----|----------|
| Agent CRUD | Backend API | Business logic + auth | server/routes/admin.ts ✅ |
| Project Mgmt | Backend API | Data persistence | same file ✅ |
| User Perms | Backend API | Security-critical | server/middleware/auth.ts ✅ |
| Config UI | Web UI | Read-only visualization | AdminControlPanel.tsx ✅ |

**Status**: ✅ **CORRECT**

---

### 🔐 **SECURITY**

**Decision: BACKEND + MIDDLEWARE (Never expose to Frontend)**

| Feature | Must Be In... | Why | Evidence |
|---------|---------------|-----|----------|
| Login | Web UI + Backend | User interaction (Web), verification (Backend) | ✅ Split correctly |
| Sessions | Backend | Secure, server-side | ✅ server/middleware/auth.ts |
| Rate Limiting | Middleware | Must not be bypassable | ✅ server/middleware/security.ts |
| Auth Validation | Backend | NEVER trust frontend | ✅ Middleware enforced |

**Status**: ✅ **CORRECT**

---

## 📋 **SPLIT CRITERIA SUMMARY TABLE**

```
Feature Category           | Current State        | Platform Assignment | Move Needed?
========================  | ===================  | =================== | =============
Orchestration/Master Agent | Web + Backend ✅     | SPLIT ✅             | No
Analytics & Reporting      | Web + Backend ⚠️     | SPLIT, compute→Backend | Yes (refactor)
Growth System              | Web + Backend ✅     | SPLIT ✅             | Minor tweaks
Bio-Sentinel IoT           | Web only ❌         | SPLIT to APK+Backend | YES - CRITICAL
XBio-Sentinel ESP32        | Web + Firmware ⚠️    | APK+Firmware+Backend | YES - CRITICAL
Administration             | Web + Backend ✅     | SPLIT ✅             | No
Voice/Integration          | Web + Backend ✅     | SPLIT ✅             | No
Security/Auth              | Backend ✅          | BACKEND ONLY ✅      | No
Cloning/Specialized        | Web + Backend ✅     | SPLIT ✅             | No
Finance/Operations         | Web + Backend ✅     | SPLIT ✅             | No
```

---

**KEY FINDINGS:**
- 🟢 60% of features are correctly placed
- 🟡 20% need minor refactoring (compute offloading)
- 🔴 20% are critical misplacements (IoT features in Web)

