# 5️⃣ MOVE PLAN: WEB → APK (جدول العمليات)

## Executive Summary
**الهدف:** نقل 11 ميزة IoT من Web (حيث هي محظورة/محدودة) إلى APK (حيث لديها الصلاحيات المطلوبة) + تنسيق Backend

**الإطار الزمني المقدر:** 6-8 أسابيع  
**الفريق المطلوب:** Backend (2) + Android/Capacitor (2) + Firmware (1) + DevOps (1)

---

## 🔴 الميزات المطلوبة للنقل

### مجموعة 1: Device Management (أسبوع 1-2)

#### Move #1: Device Pairing/Discovery
```
CURRENT STATE:
- client/pages/BioSentinel.tsx (300+ lines)
  - ❌ Attempts USB device enumeration (browser sandbox blocks)
  - ❌ Tries to open USB endpoints (no Web USB support on most devices)
  - ❌ No Bluetooth LE support

BLOCKER EVIDENCE:
- Browser Security Model: Web USB API requires user gesture + HTTPS
- Android BioSentinel hardware: Likely USB-Serial (FTDI/CH340)
- Current Android/ folder: NO Capacitor USB plugin detected ❌

MOVE PLAN:
┌────────────────────────────────────────────────────────┐
│ FROM: Web                                              │
├────────────────────────────────────────────────────────┤
│ Remove lines in BioSentinel.tsx:                        │
│ - USB discovery loop                                   │
│ - Device enumeration UI                                │
│ - Direct USB commands                                  │
│ Keep:                                                  │
│ - UI for "Connect" button                              │
│ - Display of connected device name                     │
│ - Real-time sensor dashboard (display only)            │
│ - Refresh/reconnect logic                              │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ TO: APK (Capacitor)                                    │
├────────────────────────────────────────────────────────┤
│ NEW FILE: android/app/src/main/java/...               │
│           /plugins/UsbDevicePlugin.kt                  │
│                                                        │
│ Implementation:                                        │
│ 1. UsbManager.getDeviceList() → enumerate attached    │
│ 2. UsbDevice.openConnection() → handle permissions    │
│ 3. Capacitor.registerPlugin(UsbDevicePlugin)          │
│ 4. Emit back to Web layer via bridge                  │
│    window.UsbDevice.onConnected({ name, id, ... })   │
│                                                        │
│ Files to create:                                       │
│ - android/app/src/main/AndroidManifest.xml             │
│   Add: <uses-permission android:name="...USB_HOST"    │
│ - android/app/build.gradle                             │
│   Add: implementation 'androidx.appcompat:appcompat'  │
│ - Capacitor bridge in web: src/lib/usb-bridge.ts      │
│                                                        │
│ API Surface (Web ← APK):                              │
│   await UsbDevice.listDevices() → [{id, name, ...}]  │
│   await UsbDevice.connect(deviceId)                   │
│   await UsbDevice.disconnect()                        │
│   UsbDevice.onConnected(handler)                      │
│   UsbDevice.onDisconnected(handler)                   │
│   UsbDevice.onDataReceived(handler)                   │
└────────────────────────────────────────────────────────┘

REFACTORED WEB CODE (BioSentinel.tsx):
  const [connected, setConnected] = useState(false);
  const [device, setDevice] = useState(null);
  
  useEffect(() => {
    // Listen for device connections from APK
    window.UsbDevice?.onConnected((dev) => {
      setDevice(dev);
      setConnected(true);
      // Notify backend
      api.post('/api/bio-sentinel/device/paired', { deviceId: dev.id });
    });
  }, []);
  
  const handleConnect = async () => {
    // APK will show native USB device picker
    const devices = await window.UsbDevice?.listDevices();
    if (devices.length > 0) {
      await window.UsbDevice?.connect(devices[0].id);
    }
  };

TASKS:
 [ ] Create UsbDevicePlugin.kt
 [ ] Add Android manifest permissions
 [ ] Test device enumeration
 [ ] Refactor BioSentinel.tsx
 [ ] Create usb-bridge.ts
 [ ] Test Capacitor bridge communication

Complexity: M | Time: 2-3 days | Owner: Android Dev
Dependencies: Capacitor 6.x, Android API 29+
```

#### Move #2: Sensor Readings Collection Path
```
CURRENT STATE:
- client/pages/BioSentinel.tsx: Tries to read USB directly ❌
- server/routes/bio-sentinel.ts: POST /api/bio-sentinel/readings (expects data)
- firmware/esp32-xbio/main/: Unknown if data is sent via WiFi or expects USB cable

CHALLENGE:
- Do sensors connect DIRECTLY via USB to Android device?
- OR do they connect via WiFi to backend?
- OR mix (USB for setup, WiFi for ongoing)?

ASSUMPTION (needs verification from firmware):
- Typical BioSentinel: USB device, periodic telemetry
- XBio-Sentinel: ESP32, WiFi capable

MOVE PLAN:
┌────────────────────────────────────────────────────────┐
│ Device → Data Path (after Pairing)                     │
├────────────────────────────────────────────────────────┤
│                                                        │
│ Scenario A: USB Device (e.g., Bio-Sentinel)           │
│ ──────────────────────────────────────                │
│ Device → APK (USB serial read via native) →            │
│   Parse binary protocol →                              │
│   Local buffer (SQLite) →                              │
│   Background sync service →                            │
│   Backend API /api/bio-sentinel/readings               │
│   ↓                                                     │
│ Backend stores → DB →                                  │
│   WebSocket broadcast to Web dashboard                 │
│                                                        │
│ Scenario B: WiFi Device (e.g., ESP32 with WiFi)      │
│ ──────────────────────────────────                    │
│ Device → (direct HTTP/MQTT) → Backend /api/.../readings
│                                                        │
│ APK role: Monitor status, request samples, trigger   │
│ calibration                                            │
│                                                        │
└────────────────────────────────────────────────────────┘

TASKS:
 [ ] Determine actual sensor communication method
     (inspect firmware/esp32-xbio/main/ for WiFi/USB init)
 [ ] For USB: Implement serial read in APK UsbDevicePlugin
 [ ] For USB: Define binary protocol parser (vendor-specific)
 [ ] Create APK background service for reading
 [ ] Create local SQLite queue schema
 [ ] Implement sync service (retry, batch upload)

Complexity: L | Time: 1 week | Owner: Android Dev + Firmware Dev
Dependencies: USB protocol documentation (obtain from firmware dev)
```

---

### মজgroupGreat #2: Offline Buffer & Sync (সপ্তাহ 2-3)

#### Move #3: Local Offline Queue
```
CURRENT STATE:
- No offline queuing mechanism exists ❌
- Web can't store large binary sensor data locally (quota limits)
- Backend expects continuous HTTP POSTs

REQUIREMENTS (from BioSentinel use cases):
- Device goes offline (no WiFi/USB)
- Sensor continues sampling, stores locally
- When reconnected, sync all buffered data to Backend
- Conflict resolution (duplicate/out-of-order detection)

MOVE PLAN:
┌────────────────────────────────────────────────────────┐
│ APK Local Database Schema                              │
├────────────────────────────────────────────────────────┤
│ CREATE TABLE IF NOT EXISTS sensor_readings (            │
│   id INTEGER PRIMARY KEY,                              │
│   device_id TEXT NOT NULL,                             │
│   timestamp INTEGER NOT NULL,                          │
│   sensor_type TEXT,  -- "temperature", "co2", etc     │
│   value REAL,                                          │
│   unit TEXT,                                           │
│   synced BOOLEAN DEFAULT 0,                            │
│   sync_attempts INTEGER DEFAULT 0,                     │
│   error_message TEXT,                                  │
│   created_at INTEGER,                                  │
│   updated_at INTEGER                                   │
│ );                                                     │
│                                                        │
│ CREATE INDEX idx_device_timestamp ON sensor_readings   │
│   (device_id, timestamp);                              │
│                                                        │
│ CREATE TABLE IF NOT EXISTS sync_queue (                │
│   id INTEGER PRIMARY KEY,                              │
│   batch_id TEXT UNIQUE,                                │
│   status TEXT, -- "pending", "in_progress", "done"    │
│   payload BLOB,  -- compressed JSON                    │
│   retry_count INTEGER DEFAULT 0,                       │
│   error_log TEXT,                                      │
│   created_at INTEGER,                                  │
│   last_retry_at INTEGER                                │
│ );                                                     │
│                                                        │
│ CREATE TABLE IF NOT EXISTS device_config (             │
│   device_id TEXT PRIMARY KEY,                          │
│   device_name TEXT,                                    │
│   last_sync_time INTEGER,                              │
│   firmware_version TEXT,                               │
│   local_storage_used_mb REAL,                          │
│   last_error TEXT                                      │
│ );                                                     │
└────────────────────────────────────────────────────────┘

IMPLEMENTATION (APK - Kotlin):
// File: android/app/src/main/java/.../SensorDataStore.kt

class SensorDataStore(context: Context) {
  private val db = Room.databaseBuilder(
    context, SensorDatabase::class.java, "sensors.db"
  ).build()
  
  suspend fun insertReading(reading: SensorReading) {
    db.sensorReadingDao().insert(reading)
  }
  
  suspend fun getUnsyncedReadings(): List<SensorReading> {
    return db.sensorReadingDao().getWhereSynced(false)
  }
  
  suspend fun markAsSynced(ids: List<Long>) {
    db.sensorReadingDao().updateSynced(ids, synced = true)
  }
}

STORAGE STRATEGY:
- Target: 500MB local storage (~2 months of data @ 1 sample/min)
- Rotation: Archive older data weekly to cloud (optional cold storage)
- Compression: gzip sensor readings before queuing
- Ring buffer for realtime sampling (in-memory, not on disk)

FILES TO CREATE:
- android/app/src/main/.../db/SensorReading.kt (Room entity)
- android/app/src/main/.../db/SensorDatabase.kt (Room database)
- android/app/src/main/.../db/SensorReadingDao.kt (DAO)
- android/app/src/main/.../store/SensorDataStore.kt (business logic)
- android/app/src/main/.../models/SyncQueue.kt

TASKS:
 [ ] Create Room database schema + DAOs
 [ ] Implement SensorDataStore (insert, query, cleanup)
 [ ] Add background service to collect from USB
 [ ] Implement data rotation policy (archive old data)
 [ ] Write unit tests for DB operations

Complexity: M | Time: 3-4 days | Owner: Android Dev
Dependencies: Room library, Android Architecture Components
```

#### Move #4: Sync Manager Service
```
CURRENT STATE:
- No backend sync endpoint for batch uploads ❌
- No APK background sync service ❌
- No conflict detection ❌

REQUIREMENTS:
- Every 5-10 mins, attempt sync of queued readings
- Batch upload (not 1 per request)
- Retry with exponential backoff
- Conflict resolution: server decides on timestamp conflicts
- Background service (continue even if app killed)

MOVE PLAN:
┌────────────────────────────────────────────────────────┐
│ Backend API (New Endpoint)                              │
├────────────────────────────────────────────────────────┤
│ POST /api/bio-sentinel/sync                             │
│ Headers: Authorization: Bearer <token>                 │
│          X-Batch-ID: <uuid>                             │
│ Body: {                                                │
│   "device_id": "...",                                  │
│   "readings": [                                        │
│     { ts: 1704067200, temp: 37.5, unit: "C" },        │
│     ...                                                │
│   ]                                                    │
│ }                                                      │
│                                                        │
│ Response: 200 OK {                                     │
│   "synced_count": 150,                                 │
│   "conflicts": [                                       │
│     { ts: 1704067300, server_value: 37.6, client: 37.5 }
│   ],                                                   │
│   "next_batch_id": "..."                               │
│ }                                                      │
│                                                        │
│ Errors:                                                │
│ - 409 Conflict: Client should re-request server truth  │
│ - 413 Payload Too Large: Reduce batch size              │
│ - 429 Too Many Requests: Backoff schedule              │
│ - 500 Server Error: Retry with exponential backoff     │
└────────────────────────────────────────────────────────┘

Backend Implementation (server/routes/bio-sentinel.ts):
  POST /api/bio-sentinel/sync
  ├─ Authenticate request
  ├─ Validate device_id owns readings
  ├─ Check for duplicates (device_id + timestamp)
  ├─ Detect conflicts (timestamp collision)
  │   └─ If conflict: return conflict details (client decides)
  ├─ Persist readings to DB
  ├─ Trigger anomaly detection if threshold hit
  ├─ Broadcast update via WebSocket to connected admins
  └─ Return success + conflict summary

┌────────────────────────────────────────────────────────┐
│ APK Sync Manager Service                               │
├────────────────────────────────────────────────────────┤
│ Service name: SyncService.kt                           │
│ Triggers:                                              │
│ 1. Network connectivity change → attempt sync          │
│ 2. Periodic (WorkManager) every 5 mins                 │
│ 3. Manual trigger from UI                              │
│                                                        │
│ Algorithm:                                             │
│   while (unsyncedReadings.count() > 0) {               │
│     batch = take(min(1000, unsyncedReadings.count()))  │
│     batchId = generateUUID()                           │
│     try {                                              │
│       response = api.post('/api/bio-sentinel/sync', {   │
│         batchId, device_id, readings: batch            │
│       })                                               │
│       if (response.conflicts) {                        │
│         handleConflicts(response.conflicts)            │
│       }                                                │
│       db.markAsSynced(batch.ids)                       │
│       notifyUI({ status: "synced", count: batch.count }) │
│     } catch (HttpException e) {                        │
│       if (e.code == 429) {                             │
│         backoff.wait()  // exponential                 │
│       } else if (e.code == 409) {                      │
│         refetchServerTruth()  // resolve conflict      │
│       } else {                                         │
│         retry++                                        │
│       }                                                │
│       if (retry > 3) {                                 │
│         reportError(batch)                             │
│       }                                                │
│     }                                                  │
│   }                                                    │
│                                                        │
│ WorkManager Setup (trigger every 5 mins):             │
│   PeriodicWorkRequestBuilder<SyncWorker>(               │
│     5, TimeUnit.MINUTES                                │
│   ).setConstraints(                                    │
│     Constraints.Builder()                              │
│       .setRequiredNetworkType(CONNECTED)               │
│       .build()                                         │
│   ).build()                                            │
└────────────────────────────────────────────────────────┘

FILES TO CREATE:
- android/app/src/main/.../services/SyncManager.kt
- android/app/src/main/.../workers/SyncWorker.kt (WorkManager)
- server/routes/bio-sentinel.ts - ADD /sync endpoint
- server/services/sync-conflict-resolver.ts (new)

TASKS:
 [ ] Implement /api/bio-sentinel/sync endpoint (Backend)
 [ ] Add conflict detection + logging
 [ ] Implement SyncManager in APK
 [ ] Setup WorkManager for periodic sync
 [ ] Implement retry + exponential backoff
 [ ] Add conflict resolution UI
 [ ] Write integration tests

Complexity: L | Time: 1 week | Owner: Backend (1) + Android (1)
Dependencies: WorkManager, OkHttp
```

---

### Group #3: Device Control (সপ্তাহ 3-4)

#### Move #5: Heater Profile Control (XBio-Sentinel)
```
CURRENT STATE:
- client/pages/XBioSentinel.tsx: UI for heater control (400+ lines)
- firmware/esp32-xbio/: Heater hardware PWM control
- No APK native USB command layer ❌

REQUIREMENTS:
- User adjusts heater temp/time in Web UI
- Command goes to APK (via WebSocket or API)
- APK sends USB/Serial command to device
- Device executes on embedded system
- Feedback returned to Web

MOVE PLAN:
┌────────────────────────────────────────────────────────┐
│ Command Flow                                            │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Web UI XBioSentinel.tsx                               │
│  ├─ User selects: Temp=45°C, Duration=120s             │
│  ├─ POST /api/xbio/heater/control {                    │
│  │   temperature: 45, duration: 120                    │
│  │ }                                                   │
│  └─> Backend validates + stores in DB                 │
│      ├─> Emit via WebSocket to connected APK:         │
│      │   { type: "heater.command", temp: 45, ... }     │
│      └─> Or APK polls /api/xbio/commands/pending       │
│                                                        │
│  APK Receives Command                                  │
│  ├─ SyncManager listens to WebSocket                   │
│  ├─ Extracts command parameters                        │
│  ├─ Sends USB-Serial command:                          │
│  │   [0x48, 0x54] (binary protocol)                    │
│  │   + 45 (temp LSB, MSB)                              │
│  │   + 120 (duration LSB, MSB)                         │
│  ├─ Waits for device ACK                               │
│  ├─ Polls device for status every 1s                   │
│  │   -> reads current temp from device                 │
│  └─> Reports back to Backend:                          │
│      POST /api/xbio/heater/status {                    │
│        status: "running",                              │
│        current_temp: 44,                               │
│        elapsed: 5,                                     │
│        error: null                                     │
│      }                                                 │
│                                                        │
│  Backend Receives Status                               │
│  └─> Broadcast to all Web dashboards via WebSocket     │
│      -> XBioSentinel.tsx re-renders with live data     │
│                                                        │
│ Repeat every 1s while heating active                   │
│                                                        │
└────────────────────────────────────────────────────────┘

REQUIRED KNOWLEDGE:
- Device USB protocol (CRITICAL - need firmware dev input)
  Example: Heater command format?
  - Is it a standard vendor-specific protocol?
  - Or custom binary format?
  
FILES/CHANGES:
Backend:
  - server/routes/bio-sentinel.ts
    ADD: POST /api/xbio/heater/control (validation + storage)
    ADD: GET /api/xbio/heater/status (query last status)
    ADD: POST /api/xbio/heater/stop (emergency stop)
  - server/services/xbio-controller.ts (NEW)
    Manage command queue, timeouts, error handling

APK:
  - android/app/src/main/.../protocols/HeaterProtocol.kt
    Binary command encoding/decoding
  - android/app/src/main/.../services/XbioCommandService.kt
    Listen → send → poll → report

Web:
  - client/pages/XBioSentinel.tsx
    REFACTOR: Remove direct USB commands
    KEEP: UI form + real-time status display
  - client/hooks/useXbioHeater.ts (NEW)
    Manage heater command submission + polling

TASKS:
 [ ] Define heater command protocol (Firmware Dev)
 [ ] Implement HeaterProtocol encoder/decoder (APK)
 [ ] Implement XbioCommandService (APK)
 [ ] Add /api/xbio/heater/* endpoints (Backend)
 [ ] Refactor XBioSentinel.tsx (Web)
 [ ] Test end-to-end command flow
 [ ] Add error handling + timeout logic

Complexity: L | Time: 4-5 days | Owner: Firmware + Android + Backend
Dependencies: USB protocol documentation
```

#### Move #6: Firmware Flashing (Over-The-Air)
```
CURRENT STATE:
- client/pages/XBioSentinel.tsx: "Upload Firmware" button (likely non-functional ❌)
- No Backend endpoint for firmware binary serving
- No APK native USB flashing logic

REQUIREMENTS (Complex):
- Admin uploads new firmware binary to Backend
- APK downloads binary from Backend
- APK flashes binary to ESP32 via USB/Serial
- Device reboots, new firmware active
- Rollback mechanism (fallback to previous)

MOVE PLAN:
┌────────────────────────────────────────────────────────┐
│ Phase 1: Backend Firmware Management                   │
├────────────────────────────────────────────────────────┤
│ Files/Endpoints:                                       │
│ - server/routes/firmware.ts (NEW)                      │
│   POST /api/firmware/upload (Admin only)               │
│   GET /api/firmware/versions                           │
│   GET /api/firmware/:version/download                  │
│   PUT /api/firmware/:version/rollback                  │
│                                                        │
│ - server/services/firmware-manager.ts (NEW)            │
│   Manage version history, checksums, rollback          │
│                                                        │
│ Database Schema:                                       │
│   firmware_versions (                                  │
│     id, version, binary_hash, size, uploaded_at,       │
│     upload_by_user, is_stable, is_rollback,            │
│     notes, signed                                      │
│   )                                                    │
│                                                        │
│ Storage:                                               │
│   - Files in `server/firmware/` (or S3)                │
│   - Checksums (SHA256) for verification                │
│   - Signature verification (security)                  │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ Phase 2: APK Firmware Flashing Service                 │
├────────────────────────────────────────────────────────┤
│ Implementation:                                        │
│   FirmwareUpdater.kt (APK service)                     │
│                                                        │
│   1. checkForUpdates()                                 │
│      GET /api/firmware/versions                        │
│      Compare with device firmware version              │
│   2. downloadFirmware(version)                         │
│      GET /api/firmware/{version}/download              │
│      SHA256 verification                               │
│      Save to local cache                               │
│   3. flashDevice(binary)  ⚠️ COMPLEX                   │
│      a) Put device in bootloader mode                  │
│         USB command: 0xE0 (vendor-specific)            │
│      b) Use esptool protocol (or UART direct)          │
│      c) Send binary in chunks                          │
│      d) Verify checksum                                │
│      e) Trigger device reboot                          │
│      f) Poll for new firmware version                  │
│                                                        │
│ Dependencies:                                          │
│   - esptool.py (flash protocol) OR                     │
│   - Custom Kotlin wrapper around esp_tool              │
│   - USB bulk/serial libraries                          │
│                                                        │
│ Error Handling:                                        │
│   - Connection lost → resume from last chunk           │
│   - Bad checksum → retry or rollback                   │
│   - Timeout → automatic rollback                       │
│                                                        │
│ Progress Reporting:                                    │
│   POST /api/xbio/flash/progress {                      │
│     status: "flashing",                                │
│     percent: 45,                                       │
│     error: null                                        │
│   }                                                    │
└────────────────────────────────────────────────────────┘

⚠️ MAJOR BLOCKER:
   Need to determine:
   - Device bootloader protocol (likely esptool)
   - Exact USB command sequence
   - Whether Capacitor + Native Android USB can handle binary
     chunks fast enough
   
   ACTION: Firmware dev must provide:
   - Bootloader protocol doc
   - Sample binary for testing
   - Rollback procedure

Web UI Changes (XBioSentinel.tsx):
  OLD:
  - <input type="file" accept=".bin" onChange={uploadFirmware} />
  - uploadFirmware() sends file to backend directly ❌
  
  NEW:
  - Show "Check for Updates" button
  - Display current version
  - Show available versions (from Backend)
  - If update available: "Update Now"
    -> APK receives notification
    -> APK handles download + flash
    -> APK reports progress back to Web via WebSocket

TASKS:
 [ ] Create firmware.ts route + manager service (Backend)
 [ ] Add database schema for firmware versions (Backend)
 [ ] Implement FirmwareUpdater.kt (APK) - HIGH EFFORT
 [ ] Integrate esptool or equivalent (APK)
 [ ] Add rollback mechanism (APK + Backend)
 [ ] Create WebSocket channel for flashing progress
 [ ] Refactor Web UI to show auto-update flow
 [ ] Extensive testing (brick recovery plan needed!)

Complexity: XL | Time: 2 weeks | Owner: Firmware (1) + Android (2) + Backend (1)
Dependencies: esp-idf tools, esptool knowledge, USB protocol
RISK: HIGH - Device bricking if flash fails
```

---

### Group #4: Calibration & Control (Week 4-5)

#### Move #7: Calibration Tool
```
CURRENT STATE:
- client/pages/XBioSentinel.tsx: Calibration UI (roughly 100 lines)
- No APK native calibration sequence

REQUIREMENTS:
- User selects "Calibrate" in Web
- APK device connects and runs calibration routine
- Reports progress/results back
- Stores calibration data locally + Backend

SIMPLIFIED APPROACH (given time constraints):
- Web UI: Just a "Start Calibration" button
- APK: Sends calibration command to device
- Device firmware: Runs pre-defined routine
- APK polls device for status
- Backend stores calibration metadata (timestamp, who, device)

TASKS:
 [ ] Define calibration command protocol (Firmware)
 [ ] Add calibration status polling in SyncManager (APK)
 [ ] Add /api/xbio/calibration/log endpoint (Backend)
 [ ] Refactor Calibration UI in XBioSentinel.tsx (Web)

Complexity: S | Time: 1 day | Owner: Android + Firmware
Dependencies: Device protocol
```

---

## 📋 Consolidated Move Plan Timeline

```
WEEK 1-2: Device Pairing + Readings Path
├─ Create UsbDevicePlugin.kt (Android)
├─ Add Capacitor USB bridge
├─ Refactor BioSentinel.tsx
├─ Define sensor reading protocol
└─ Test USB enumeration + connection

WEEK 2-3: Offline Storage + Sync
├─ Create Room database schema (Android)
├─ Implement SensorDataStore
├─ Add /api/bio-sentinel/sync endpoint (Backend)
├─ Implement SyncManager service (Android)
└─ Test offline → online sync flow

WEEK 3-4: Device Control (Heater)
├─ Define heater control protocol (Firmware)
├─ Add /api/xbio/heater/* endpoints (Backend)
├─ Implement XbioCommandService (Android)
├─ Refactor XBioSentinel.tsx (Web)
└─ Test end-to-end heater command

WEEK 4-5: Firmware Management (OTA)
├─ Create firmware.ts route (Backend)
├─ Implement FirmwareUpdater.kt (Android) - HEAVY
├─ Add rollback logic
├─ Test flashing (NON-PRODUCTION device first!)
└─ Refactor firmware upload UI

WEEK 5-6: Calibration + Polish
├─ Implement calibration command (Android)
├─ Add /api/xbio/calibration endpoints (Backend)
├─ Refactor calibration UI (Web)
├─ Integration testing + bug fixes
└─ Documentation

WEEK 6-8: Testing, QA, Deployment
├─ Comprehensive testing (all platforms)
├─ Security audit (APK + Backend APIs)
├─ Performance testing (offline buffer, sync speed)
├─ Deployment to staging
├─ UAT + bug fixes
└─ Production deployment
```

---

## Teams & Ownership

| Stream | Role | Person | Responsibilities |
|--------|------|--------|------------------|
| **Android/APK** | Lead | Android Dev (A) | USB plugin, data store, sync manager, firmware updater |
| **Firmware** | Lead | Firmware Dev (F) | Protocol definitions, bootloader, calibration routine |
| **Backend** | Lead | Backend Dev (B1) | API endpoints, sync logic, firmware management |
| **Backend** | Support | Backend Dev (B2) | Database schema, conflict resolution, testing |
| **Web** | Lead | Frontend Dev (W) | UI refactoring, removing USB logic |
| **DevOps** | Lead | DevOps (D) | Staging, testing infra, deployment |

---

