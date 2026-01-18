# 6️⃣ PLATFORM CONTRACTS: منع اختلاف السلوك

## A) Shared Domain Model (Single Source of Truth)

**Location:** `shared/domain-types.ts` (NEW - must create)

```typescript
// Sensor Reading - used by Firmware, APK, Backend, Web
export interface SensorReading {
  id: string;
  device_id: string;
  timestamp: number;  // Unix milliseconds
  sensor_type: 'temperature' | 'humidity' | 'co2' | 'pressure';
  value: number;      // Actual measurement
  unit: string;       // 'C', '%', 'ppm', 'Pa'
  quality: 'good' | 'degraded' | 'error';
  metadata?: {
    location?: string;
    notes?: string;
  };
}

// Device State - all platforms must agree
export interface DeviceState {
  id: string;
  name: string;
  type: 'bio-sentinel' | 'xbio-sentinel' | 'custom';
  connection_status: 'disconnected' | 'connecting' | 'connected' | 'error';
  firmware_version: string;
  last_reading_at: number | null;
  battery_percent?: number;
  error?: string;
}

// Command (Web → APK → Device)
export interface DeviceCommand {
  id: string;
  device_id: string;
  type: 'start_sampling' | 'stop_sampling' | 'heater_control' | 'calibrate' | 'reboot';
  parameters: Record<string, any>;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  error?: string;
  created_at: number;
  executed_at?: number;
}

// Sync Batch - for offline queue reconciliation
export interface SyncBatch {
  batch_id: string;
  device_id: string;
  readings_count: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  created_at: number;
  completed_at?: number;
  server_response?: {
    synced_count: number;
    conflicts?: Array<{ timestamp: number; server_value: number; client_value: number }>;
  };
}

// Health Status - displayed in Web + APK
export interface SystemHealth {
  backend: { status: 'healthy' | 'degraded' | 'down'; latency: number };
  database: { status: 'healthy' | 'degraded' | 'down'; latency: number };
  cache: { status: 'healthy' | 'degraded' | 'down'; size_mb: number };
  devices: { connected: number; total: number; sync_lag_ms: number };
  timestamp: number;
}
```

---

## B) API Contracts (OpenAPI/Swagger)

**Location:** `docs/api-contracts.yaml`

Key endpoints that must have consistent behavior:

```yaml
/api/bio-sentinel/sync:
  post:
    description: "Batch upload of offline-collected readings"
    security: [Bearer]
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              device_id:
                type: string
              batch_id:
                type: string
                format: uuid
              readings:
                type: array
                items:
                  $ref: '#/components/schemas/SensorReading'
    responses:
      200:
        description: "Sync successful"
        content:
          application/json:
            schema:
              type: object
              properties:
                synced_count:
                  type: integer
                conflicts:
                  type: array
                  items:
                    type: object
                    properties:
                      timestamp:
                        type: integer
                      server_value:
                        type: number
                      client_value:
                        type: number
                next_batch_id:
                  type: string
                  format: uuid
      409:
        description: "Conflict detected - client should review"
      429:
        description: "Rate limited - backoff and retry"
      513:
        description: "Backend storage full"

/api/xbio/heater/control:
  post:
    description: "Send heater control command to device"
    security: [Bearer]
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [device_id, temperature, duration]
            properties:
              device_id:
                type: string
              temperature:
                type: number
                minimum: 20
                maximum: 100
              duration:
                type: integer
                minimum: 1
                maximum: 3600
    responses:
      202:
        description: "Command queued for device"
      404:
        description: "Device not connected"
      422:
        description: "Invalid parameters"

/api/firmware/versions:
  get:
    description: "List available firmware versions"
    responses:
      200:
        schema:
          type: array
          items:
            type: object
            properties:
              version:
                type: string
              is_stable:
                type: boolean
              size_bytes:
                type: integer
              released_at:
                type: string
                format: date-time
              changelog:
                type: string
```

---

## C) Behavior Contracts (What must be true)

### 1. **Conflict Resolution**
```
RULE: When client and server have different sensor readings for same timestamp:
  - Timestamp is primary key (device_id + timestamp = unique)
  - Server timestamp wins (server is source of truth)
  - Client is notified via /sync response
  - If client disagrees, client must explicitly confirm/reject
```

### 2. **Offline Sync**
```
RULE: APK must NOT lose data during offline period:
  - All readings must be queued locally before sending
  - Sync must be idempotent (can be retried safely)
  - Batch IDs are unique across time (used for deduplication)
  - If sync fails, readings stay in local queue
  - Retry backoff: 1s, 5s, 30s, 5min, 30min, then manual
```

### 3. **Command Execution**
```
RULE: Device command must reach device OR timeout reliably:
  - APK sends USB command, waits for ACK
  - Timeout = 5 seconds
  - If timeout: report "Device Not Responding"
  - If ACK received: monitor for completion
  - Command must be idempotent (resend-safe)
```

### 4. **Data Consistency**
```
RULE: A sensor reading must match this signature everywhere:
  {
    device_id: string,        // MUST match device
    timestamp: integer,       // MUST be monotonic (t[n] >= t[n-1])
    sensor_type: enum,        // MUST be one of: temp, humidity, co2, pressure
    value: float,             // MUST be within sensor's valid range
    unit: string,             // MUST match sensor_type
    quality: enum             // MUST be: good|degraded|error
  }
  
  Violation Examples:
  ❌ Reading with temp_c=150°C (unrealistic)
  ❌ Reading with timestamp > now (future)
  ❌ Reading with unit="Celsius" (must be standardized to "C")
  ❌ Reading with sensor_type="unknown"
```

### 5. **Authentication & Authorization**
```
RULE: APK must always send JWT token in headers:
  - Authorization: Bearer <token>
  - Token must be refreshed before expiry
  - If 401 Unauthorized: prompt user to re-login
  
RULE: Backend must validate token on every request:
  - Verify signature
  - Check expiry
  - Extract user_id + device permissions
  - Deny if user doesn't own device
```

### 6. **Rate Limiting**
```
RULE: Client must respect 429 Too Many Requests:
  - Retry-After header specifies backoff time
  - APK must use exponential backoff, not linear
  - Web dashboard must show "Throttled" status
  - Admin must be notified if device constantly rate-limited
```

### 7. **Error Responses**
```
RULE: All errors must follow same format:
  {
    error: {
      code: string,          // e.g., "DEVICE_NOT_FOUND"
      message: string,       // Human-readable
      details: object,       // Contextual info
      timestamp: integer     // When error occurred
    }
  }
  
  Example:
  {
    error: {
      code: "SYNC_CONFLICT",
      message: "3 readings have conflicting server values",
      details: {
        conflicts: [...]
      },
      timestamp: 1704067200000
    }
  }
```

---

## D) WebSocket Contracts (Real-time Events)

**Namespace:** `/api/realtime` (Socket.IO)

```typescript
// Events emitted by Backend → Web/APK
'device:connected'     → { device_id, device_name, firmware }
'device:disconnected'  → { device_id, reason }
'reading:received'     → { reading: SensorReading }
'reading:anomaly'      → { reading, anomaly_type, severity }
'command:executed'     → { command_id, device_id, status }
'sync:progress'        → { device_id, synced_count, total_count, percent }
'system:health'        → { SystemHealth }

// Events received by Backend ← APK
'device:status'        → { device_id, connection_status, battery, ... }
'command:ack'          → { command_id, timestamp, ... }
'reading:buffer_full'  → { device_id, usage_percent }
```

---

## E) UI/UX Contracts (Consistent User Experience)

### 1. **Loading States**
```
- Web Dashboard: Spinner + "Fetching data..."
- APK: Native ProgressBar + "Syncing..."
- Both must show same ETA if available
```

### 2. **Error Handling**
```
- Web: Toast notification + details in sidebar
- APK: Snackbar + retry button
- Both must show same error message
- Both must offer "Report Issue" option
```

### 3. **Offline Indicators**
```
- Web: Red banner "Backend disconnected" + show cached data age
- APK: Red status indicator + "Offline mode" label
- Both must prevent destructive actions when offline
```

### 4. **Confirmation Dialogs**
```
- Firmware Flash: "This will reboot device. Proceed?" (both platforms)
- Device Reset: "All local data will be cleared. Continue?" (both)
- Both must use same wording
```

---

## F) Testing Contracts (Acceptance Criteria)

### End-to-End Contract Tests

```gherkin
# Feature: Offline Sync
Scenario: APK buffers readings when offline, syncs when online
  Given: Device is collecting readings
  When: Device goes offline (WiFi disabled)
  Then: APK stores readings in local queue
  And: UI shows "Offline mode - X readings queued"
  
  When: Device comes online
  Then: APK begins syncing automatically
  And: UI shows sync progress (45/150 readings synced)
  And: All readings appear in Web dashboard
  And: No duplicate readings in Backend

# Feature: Device Command Execution
Scenario: Web sends heater command, device executes
  Given: Device is connected to APK
  When: Web dashboard sends "Heater 45°C for 2 mins"
  Then: APK receives command via WebSocket
  And: APK sends USB command to device
  And: Device firmware executes (PWM adjusted)
  And: APK polls device every 1s for temperature
  And: Web dashboard shows real-time temp chart
  And: After 2 mins, device stops automatically

# Feature: Firmware Update
Scenario: OTA firmware update without bricking device
  Given: Device has firmware v1.0.0
  When: Admin uploads firmware v1.0.1
  And: APK detects update available
  Then: APK downloads binary from Backend
  And: APK flashes device over USB
  And: Device reboots
  And: Device reports v1.0.1 to Backend
  And: If flash fails midway: device still boots v1.0.0 (rollback)
```

---

## G) Database Schema Contracts

**Critical fields that must be consistent:**

```sql
-- sensor_readings table
CREATE TABLE sensor_readings (
  id UUID PRIMARY KEY,
  device_id UUID NOT NULL,
  timestamp BIGINT NOT NULL,  -- Must be unique per device
  sensor_type TEXT NOT NULL,  -- Enum: temp, humidity, co2, pressure
  value NUMERIC(10,2) NOT NULL,  -- Must pass validation rules
  unit TEXT NOT NULL,  -- Standardized: C, %, ppm, Pa
  quality TEXT NOT NULL,  -- Enum: good, degraded, error
  synced_at TIMESTAMP,  -- Null until sync completes
  conflict_resolved_at TIMESTAMP,  -- If conflict occurred
  
  UNIQUE(device_id, timestamp),  -- No dups per device
  CHECK(value > -100 AND value < 500),  -- Sanity check
  CHECK(quality IN ('good', 'degraded', 'error'))
);

-- sync_batches table
CREATE TABLE sync_batches (
  batch_id UUID PRIMARY KEY,
  device_id UUID NOT NULL,
  status TEXT NOT NULL,  -- Enum: pending, in_progress, completed, failed
  readings_count INT NOT NULL,
  server_response JSONB,  -- Conflict details
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  
  CHECK(status IN ('pending', 'in_progress', 'completed', 'failed')),
  FOREIGN KEY(device_id) REFERENCES devices(id)
);

-- device_commands table
CREATE TABLE device_commands (
  id UUID PRIMARY KEY,
  device_id UUID NOT NULL,
  type TEXT NOT NULL,  -- Enum: start_sampling, heater_control, calibrate, etc
  parameters JSONB,
  status TEXT NOT NULL,
  error TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  executed_at TIMESTAMP,
  
  FOREIGN KEY(device_id) REFERENCES devices(id)
);
```

---

## H) Validation Rules (must be enforced everywhere)

```
// Frontend validation (fast feedback)
- Temperature: -20 to 120°C
- Humidity: 0 to 100%
- CO2: 0 to 5000 ppm
- Timestamp: past 24 hours to now

// Backend validation (security/sanity)
- Temperature: -20 to 120°C (MUST reject outliers)
- Timestamp: past 7 days to now (reject future)
- Device ownership: JWT user_id must own device_id
- Batch size: 1-1000 readings per sync
- Rate limit: max 1000 readings/min per device

// Firmware validation (on device)
- Heater temp: 20-100°C (hardware limits)
- Duration: 1-3600 seconds
- Sensor readings: plausible ranges before buffering
```

---

# 7️⃣ BACKLOG & TASK DECOMPOSITION

## Stream Organization

```
Stream 1: Backend Infrastructure & APIs
  Owner: Backend Dev (B1)
  
Stream 2: Android APK (Capacitor + Native)
  Owner: Android Dev (A)
  
Stream 3: Firmware (ESP32-XBIO)
  Owner: Firmware Dev (F)
  
Stream 4: Web Dashboard Refactoring
  Owner: Frontend Dev (W)
  
Stream 5: Quality Assurance & Integration
  Owner: QA/DevOps (D)
```

---

## STREAM 1: Backend Infrastructure & APIs

### Phase 1: Sync Infrastructure (Week 1-2)

#### P0-B1-001: Create /api/bio-sentinel/sync Endpoint
```
Title: Implement batch sensor reading sync endpoint
Description:
  Create POST /api/bio-sentinel/sync endpoint to handle offline-collected readings.
  Must detect duplicates, handle conflicts, and return server truth.

Acceptance Criteria:
  ✓ Endpoint accepts array of SensorReading objects
  ✓ Validates device ownership (JWT user_id)
  ✓ Detects duplicate readings (device_id + timestamp)
  ✓ Detects conflicts (server has different value for same timestamp)
  ✓ Returns conflict details for client decision
  ✓ Stores confirmed readings in DB
  ✓ Broadcasts update via WebSocket to Web dashboard
  ✓ Rate limiting: max 1000 readings per request

Files to Create:
  - server/routes/bio-sentinel-sync.ts (new route file)
  - server/services/sync-conflict-resolver.ts (conflict logic)

Files to Modify:
  - server/routes/bio-sentinel.ts (integrate sync route)
  - shared/schema.ts (add sync_batches table)

Dependencies:
  - Database schema update
  - WebSocket service (for broadcasts)

Testing:
  - Unit test: duplicate detection
  - Unit test: conflict detection
  - Integration test: full sync flow
  - Load test: 10k readings/batch

Complexity: M | Time: 2-3 days | Owner: B1
```

#### P1-B1-002: Add Sync Conflict Resolution Service
```
Title: Implement conflict detection and resolution strategy

Description:
  Create service to detect conflicts when syncing sensor readings.
  Conflict = same device_id + timestamp, different value.
  
Acceptance Criteria:
  ✓ Conflicts detected correctly (server value always wins)
  ✓ Conflict report includes: timestamp, server_value, client_value
  ✓ Client can request server truth for review
  ✓ Logging of all conflicts for audit
  
Complexity: S | Time: 1 day | Owner: B1
```

### Phase 2: Device Control APIs (Week 2-3)

#### P0-B1-003: Create /api/xbio/heater/control Endpoint
```
Title: Implement heater control command endpoint

Description:
  Create POST /api/xbio/heater/control to send heater commands to device via APK.
  
Acceptance Criteria:
  ✓ Validates temperature (20-100°C) and duration (1-3600s)
  ✓ Stores command in device_commands table
  ✓ Broadcasts command via WebSocket to connected APK
  ✓ Returns 202 Accepted (async execution)
  ✓ APK can query status of command
  
Complexity: S | Time: 1-2 days | Owner: B1
```

#### P1-B1-004: Create /api/xbio/heater/status Endpoint
```
Title: Query real-time heater status from device

Description:
  GET /api/xbio/heater/status to fetch current temperature, remaining time, etc.
  
Complexity: S | Time: 1 day | Owner: B1
```

### Phase 3: Firmware Management (Week 3-4)

#### P0-B1-005: Create Firmware Management API
```
Title: Implement firmware version management endpoints

Description:
  Create POST /api/firmware/upload, GET /api/firmware/versions, etc.

Endpoints:
  POST /api/firmware/upload (Admin only)
    - Upload new firmware binary
    - Compute SHA256 checksum
    - Store in server/firmware/ or S3
    - Mark as "pending approval"
  
  GET /api/firmware/versions
    - List all firmware versions (stable + beta)
    - Include changelog, release date
  
  GET /api/firmware/:version/download
    - Serve binary with checksum
    - Log download for audit

Acceptance Criteria:
  ✓ Admin can upload firmware binaries
  ✓ Binaries are checksummed and verified
  ✓ Version history is maintained
  ✓ Can compare versions (diff)
  ✓ Automatic cleanup of old binaries (keep last 5)

Files to Create:
  - server/routes/firmware.ts
  - server/services/firmware-manager.ts
  - shared/schema.ts (firmware_versions table)

Complexity: M | Time: 2-3 days | Owner: B1
```

#### P1-B1-006: Firmware Rollback Mechanism
```
Title: Implement firmware rollback for failed OTA

Description:
  If device fails to boot new firmware, automatically revert to previous version.
  
Acceptance Criteria:
  ✓ Device stores previous firmware binary
  ✓ Bootloader has fallback logic
  ✓ Backend tracks rollback events
  ✓ Alerts admin when rollback occurs

Complexity: M | Time: 2-3 days | Owner: B1 + F (firmware)
```

### Phase 4: Analytics & Reporting Offload (Week 4-5)

#### P0-B1-007: Create Analytics Service
```
Title: Move heavy computation from Web to Backend

Description:
  Current: client/pages/AnalyticsHub.tsx has 400+ lines computing percentiles, aggregates
  Problem: Slow UI rendering, no caching, recomputed on every refresh
  
Solution: Backend service that pre-computes analytics and caches results

Endpoints:
  GET /api/analytics/summary (last 24h)
    - Returns: total_readings, anomaly_count, avg_temp, min/max
    - Cached for 5 minutes
  
  GET /api/analytics/device/:id/trends (last 7 days)
    - Returns: hourly aggregates (avg, min, max for each hour)
    - Used for charting

Acceptance Criteria:
  ✓ Analytics computed in Backend
  ✓ Results cached in Redis (5-15 min TTL)
  ✓ Web UI fetches precomputed data
  ✓ Response time < 200ms

Files to Create:
  - server/services/analytics-service.ts

Files to Modify:
  - client/pages/AnalyticsHub.tsx (fetch from API instead of computing)

Complexity: M | Time: 2-3 days | Owner: B1
```

---

## STREAM 2: Android APK (Capacitor + Native)

### Phase 1: USB Device Management (Week 1-2)

#### P0-A-001: Create UsbDevicePlugin (Capacitor)
```
Title: Implement USB device discovery and connection

Description:
  Native Android plugin (Kotlin) to enumerate USB devices and open connections.
  Wrapped via Capacitor bridge for Web layer to trigger.

Files to Create:
  - android/app/src/main/java/com/example/arc_namer/plugins/UsbDevicePlugin.kt
  - android/app/src/main/java/com/example/arc_namer/plugins/UsbDeviceManager.kt

Implementation:
  1. UsbManager.getDeviceList() → get attached devices
  2. Filter for BioSentinel (VID/PID match - need from firmware dev)
  3. Request user permission (UsbManager.requestPermission)
  4. Open connection (device.openConnection())
  5. Expose via Capacitor:
     window.UsbDevice.listDevices() → Promise<Device[]>
     window.UsbDevice.connect(deviceId) → Promise<void>
     window.UsbDevice.onConnected(handler)

Acceptance Criteria:
  ✓ Detects connected USB devices
  ✓ Shows permission dialog to user
  ✓ Maintains connection across app backgrounding
  ✓ Handles disconnection gracefully
  ✓ Exposes data to Web layer via Capacitor bridge

Files to Modify:
  - android/app/build.gradle (add dependencies)
  - android/AndroidManifest.xml (add USB_HOST permission)

Dependencies:
  - Capacitor 6.x
  - Android USB API
  - VID/PID of BioSentinel device (FROM FIRMWARE DEV)

Complexity: L | Time: 3-4 days | Owner: A
```

#### P0-A-002: Implement USB Serial Communication
```
Title: Handle USB serial protocol for BioSentinel readings

Description:
  Once connected, APK must read binary sensor data from device.
  Requires understanding of device's serial protocol.

Files to Create:
  - android/app/src/main/java/.../protocols/BioSentinelProtocol.kt
  - android/app/src/main/java/.../services/UsbSerialReader.kt

Implementation:
  1. Open USB bulk endpoints (IN for reading, OUT for writing)
  2. Parse binary protocol (format from firmware dev)
  3. Convert to SensorReading objects
  4. Store in local SQLite queue

Acceptance Criteria:
  ✓ Reads data from USB endpoint
  ✓ Parses binary protocol correctly
  ✓ Converts to SensorReading format
  ✓ Handles read timeouts gracefully
  ✓ Continues reading in background service

Complexity: L | Time: 3-4 days | Owner: A + F
Dependencies:
  - Binary protocol documentation (FROM F)
  - UsbDevicePlugin working
  - Room database (next task)
```

### Phase 2: Local Storage & Sync (Week 2-3)

#### P0-A-003: Create Local Sensor Database (Room)
```
Title: Implement offline storage using Android Room

Description:
  Local SQLite database to buffer sensor readings when offline.

Files to Create:
  - android/app/src/main/java/.../db/AppDatabase.kt (Room database)
  - android/app/src/main/java/.../db/SensorReading.kt (Room entity)
  - android/app/src/main/java/.../db/SensorReadingDao.kt (Data access)
  - android/app/src/main/java/.../db/SyncBatch.kt (Entity)
  - android/app/src/main/java/.../db/SyncBatchDao.kt (DAO)

Acceptance Criteria:
  ✓ Creates/migrates database on app startup
  ✓ Stores readings with all fields (device_id, timestamp, sensor_type, value)
  ✓ Creates sync batches for transaction tracking
  ✓ Can query unsync'd readings
  ✓ Handles database full condition (cleanup old data)
  ✓ Encryption at rest (SQLCipher optional)

Complexity: M | Time: 2-3 days | Owner: A
Dependencies:
  - Room architecture component
  - Domain types (shared/domain-types.ts must be mirrored in APK)
```

#### P0-A-004: Implement Sync Manager Service
```
Title: Background sync of buffered readings to Backend

Description:
  Periodic background service to upload queued readings to Backend.
  Must handle retries, conflicts, and offline detection.

Files to Create:
  - android/app/src/main/java/.../services/SyncManager.kt
  - android/app/src/main/java/.../workers/SyncWorker.kt (WorkManager)

Implementation:
  1. WorkManager periodic task (every 5 minutes)
  2. Check network connectivity
  3. Query unsync'd readings from local DB
  4. Batch readings (max 1000 per request)
  5. POST to /api/bio-sentinel/sync with batch_id
  6. Handle 3xx/4xx/5xx responses:
     - 200/201: Mark readings as synced
     - 409: Handle conflicts (user decision or server wins)
     - 429: Exponential backoff (1s, 5s, 30s, ...)
     - 500+: Retry later
  7. Broadcast sync status to UI (progress, errors)

Acceptance Criteria:
  ✓ Syncs automatically every 5-10 minutes
  ✓ Continues sync even if app backgrounded (WorkManager)
  ✓ Handles network disconnection gracefully
  ✓ Retry with exponential backoff
  ✓ Conflict detection + user notification
  ✓ UI shows sync progress (X/Y readings synced)
  ✓ Logs all sync events for debugging

Complexity: L | Time: 3-4 days | Owner: A
Dependencies:
  - WorkManager (Android Jetpack)
  - Room database
  - Network connectivity detection
  - Backend /api/bio-sentinel/sync endpoint (P0-B1-001)
```

### Phase 3: Device Control (Week 3-4)

#### P0-A-005: Implement Heater Control Service
```
Title: Send heater commands to device via USB

Description:
  Listen for heater commands from Web dashboard, send to device.

Files to Create:
  - android/app/src/main/java/.../services/HeaterControlService.kt
  - android/app/src/main/java/.../protocols/HeaterProtocol.kt

Implementation:
  1. WebSocket listener for heater commands from Backend
     (or periodic polling of /api/xbio/commands/pending)
  2. Encode command to binary format (device protocol)
  3. Send via USB bulk OUT endpoint
  4. Poll device for status (current temp, remaining time)
  5. Report status back to Backend
  6. Handle device errors (temp sensor failure, PWM stuck)

Acceptance Criteria:
  ✓ Sends heater command to device
  ✓ Device receives and executes
  ✓ APK polls for temperature every 1 second
  ✓ Reports status back to Backend
  ✓ Web dashboard shows live temperature chart
  ✓ Handles device timeouts (no response)

Complexity: L | Time: 3-4 days | Owner: A + F
Dependencies:
  - Heater control protocol (FROM F)
  - UsbSerialReader working
  - WebSocket or API polling
```

#### P0-A-006: Implement Firmware Update Service
```
Title: Download and flash firmware updates OTA

Description:
  Major feature: APK downloads firmware binary from Backend and flashes device.
  HIGH RISK of bricking device if protocol wrong.

Files to Create:
  - android/app/src/main/java/.../services/FirmwareUpdater.kt
  - android/app/src/main/java/.../protocols/EsptoolProtocol.kt (or wrapper)

Implementation:
  1. Check for updates (GET /api/firmware/versions)
  2. Download binary (GET /api/firmware/{version}/download)
  3. Verify SHA256 checksum
  4. Put device into bootloader mode (device protocol)
  5. Send binary in chunks via USB
  6. Wait for device bootloader ACK
  7. Verify CRC after flash
  8. Reboot device
  9. Wait for device to report new version
  10. If timeout: attempt rollback to previous version

Acceptance Criteria:
  ✓ Downloads firmware without errors
  ✓ Checksum verified before flashing
  ✓ Device enters bootloader successfully
  ✓ Binary chunks sent at correct speed
  ✓ Device reboots after flash
  ✓ Reports new firmware version to Backend
  ✓ Handles flash failure + automatic rollback
  ✓ NO device bricking (or recovery procedure exists)

RISK MITIGATION:
  - Test on non-production device first
  - Have rollback binary pre-loaded on device
  - Add force-rollback APK button for emergencies
  - Extensive logging of all steps

Complexity: XL | Time: 1-2 weeks | Owner: A + F
Dependencies:
  - esptool protocol understanding (FROM F)
  - Device bootloader documentation
  - Rollback mechanism (P1-B1-006)
```

---

## STREAM 3: Firmware (ESP32-XBio)

### Phase 1: Protocol Definition & Bootloader (Week 1-3)

#### P0-F-001: Document Binary Protocol (Device ↔ APK)
```
Title: Define and document device communication protocol

Description:
  Firmware dev must document exact protocol used for:
  - Device discovery (VID/PID)
  - Sensor reading format (binary layout)
  - Command protocol (heater, calibrate, etc.)
  - Bootloader entry sequence (for firmware flashing)

Deliverables:
  - protocol.md file in firmware/esp32-xbio/docs/
  - Binary message formats (with hex examples)
  - Timing requirements (delays, timeouts)
  - Error codes and meanings

Acceptance Criteria:
  ✓ All message formats documented
  ✓ Example hex dumps for each command
  ✓ Timing/delay requirements specified
  ✓ Error codes listed
  ✓ Bootloader entry procedure explained
  ✓ Rollback procedure documented

Complexity: M | Time: 2-3 days | Owner: F
```

#### P0-F-002: Ensure Bootloader Supports OTA
```
Title: Verify bootloader can handle firmware flashing

Description:
  Bootloader must support:
  - USB entry sequence (from normal mode → bootloader mode)
  - Binary reception and flashing (via USB)
  - CRC verification
  - Automatic rollback on bad CRC

Acceptance Criteria:
  ✓ Bootloader responds to entry command
  ✓ Can receive binary chunks
  ✓ Flashes to correct address
  ✓ Verifies CRC
  ✓ Reboots device if good, rollback if bad
  ✓ Previous firmware binary stored (for rollback)

Complexity: L | Time: 3-4 days | Owner: F
```

### Phase 2: Sampling & Buffering (Week 2-3)

#### P1-F-003: Implement Ring Buffer for Offline
```
Title: Add local buffering for offline sampling

Description:
  Device must buffer sensor readings locally if WiFi/USB unavailable.
  When connection restored, batch upload to Backend.

Acceptance Criteria:
  ✓ Ring buffer stores last 1000 readings (est. 1 hour @ 1Hz)
  ✓ Older readings pushed out when full
  ✓ Buffer survives device reboot (EEPROM backup)
  ✓ Status reported to APK (buffer usage %)

Complexity: M | Time: 2-3 days | Owner: F
```

#### P1-F-004: Optimize WiFi/MQTT for Telemetry
```
Title: Configure WiFi or MQTT for continuous data upload

Description:
  Device should upload readings periodically (not require APK USB connection).

Acceptance Criteria:
  ✓ WiFi connection to network
  ✓ MQTT publishing to Backend broker (or HTTP POST)
  ✓ Handles WiFi dropout + reconnect
  ✓ Fallback to USB if WiFi unavailable

Complexity: M | Time: 2-3 days | Owner: F
```

### Phase 3: Calibration & Control (Week 4)

#### P1-F-005: Implement Calibration Routine
```
Title: Add calibration command handling

Description:
  Device firmware must support calibration sequence:
  1. Stabilize sensors (wait 30s)
  2. Take baseline readings
  3. Apply adjustment factors
  4. Store calibration data in EEPROM

Acceptance Criteria:
  ✓ Calibration sequence completes in < 2 minutes
  ✓ Calibration data persists across reboot
  ✓ Reports calibration status to APK
  ✓ Can report calibration age (when last done)

Complexity: S | Time: 1-2 days | Owner: F
```

---

## STREAM 4: Web Dashboard Refactoring

### Phase 1: Removal of Browser-Blocked Features (Week 1-2)

#### P0-W-001: Refactor BioSentinel.tsx
```
Title: Remove USB/Bluetooth logic from Web, keep dashboard

Description:
  Current state: BioSentinel.tsx tries to directly access USB (blocked by browser)
  Target state: Show "Connect Device" button that triggers APK action
               Display real-time data from Backend (via WebSocket)

Changes:
  - Remove: USB enumeration loop
  - Remove: Direct device.open() calls
  - Keep: Dashboard visualization
  - Add: "Connect Device" button (APK handles)
  - Add: WebSocket listener for real-time updates
  - Add: Offline queue indicator

Acceptance Criteria:
  ✓ No browser warnings about USB access
  ✓ Connect button works (APK receives trigger)
  ✓ Real-time data displays (via WebSocket)
  ✓ Shows sync progress when APK syncing
  ✓ Shows device status (connected/disconnected/syncing)

Complexity: S | Time: 1-2 days | Owner: W
```

#### P0-W-002: Refactor XBioSentinel.tsx
```
Title: Remove direct device control, use API

Description:
  Similar to BioSentinel.tsx: remove USB commands, use Backend API.

Changes:
  - Remove: Direct heater command via USB
  - Remove: Direct firmware flash via USB
  - Add: "Send Heater Command" form → POST /api/xbio/heater/control
  - Add: "Upload Firmware" button → triggers Backend upload, APK handles flash
  - Add: Real-time status display (from WebSocket)

Acceptance Criteria:
  ✓ No USB access violations
  ✓ Commands sent to API
  ✓ APK receives commands and executes
  ✓ Status updates display in real-time
  ✓ No "Waiting for device..." freezes

Complexity: S | Time: 1-2 days | Owner: W
```

### Phase 2: Analytics Offload (Week 2-3)

#### P1-W-003: Refactor AnalyticsHub.tsx
```
Title: Fetch precomputed analytics from Backend

Description:
  Move heavy computation to Backend, Web fetches cached results.

Changes:
  - Remove: 400+ lines of percentile/aggregation calculations
  - Add: Fetch from GET /api/analytics/summary
  - Add: Fetch from GET /api/analytics/device/:id/trends
  - Keep: Charting + visualization

Acceptance Criteria:
  ✓ Page loads instantly (< 500ms)
  ✓ Charts display correctly
  ✓ Data refreshes every 5-10 seconds
  ✓ No CPU spike on render
  ✓ Mobile-friendly (responsive charts)

Complexity: M | Time: 1-2 days | Owner: W
```

---

## STREAM 5: Quality Assurance & Integration

### Phase 1: Testing Infrastructure (Week 1-5)

#### P0-D-001: End-to-End Test Suite
```
Title: Write E2E tests for critical flows

Description:
  Using Cypress (or Playwright):
  - Device pairing flow
  - Offline sync flow
  - Heater command flow
  - Firmware update flow

Acceptance Criteria:
  ✓ Tests cover happy path + error paths
  ✓ Tests verify data consistency (Web ↔ Backend ↔ Device)
  ✓ Tests run in CI/CD pipeline
  ✓ Tests take < 10 minutes to execute

Complexity: M | Time: 3-4 days | Owner: D
```

#### P0-D-002: Load Testing (Offline Sync)
```
Title: Load test sync with 10k readings

Description:
  Simulate APK uploading 10k buffered readings to Backend.
  Measure: throughput, latency, database load, memory usage.

Acceptance Criteria:
  ✓ Backend can handle 10k readings/batch
  ✓ Sync completes in < 10 seconds
  ✓ No database connection pool exhaustion
  ✓ No memory leaks during sync
  ✓ Web dashboard remains responsive

Complexity: M | Time: 2-3 days | Owner: D
```

### Phase 2: Staging & UAT (Week 5-6)

#### P0-D-003: Staging Deployment
```
Title: Deploy to staging environment with test data

Description:
  - Fresh database with sample data
  - Test all flows in staging
  - Verify APK works with staging Backend
  - Verify Web dashboards render correctly

Acceptance Criteria:
  ✓ Staging environment mirrors production
  ✓ APK/Web can connect to staging Backend
  ✓ All flows work end-to-end
  ✓ Performance is acceptable

Complexity: M | Time: 2-3 days | Owner: D
```

---

## CONSOLIDATED BACKLOG SUMMARY

| ID | Stream | Task | Complexity | Time | Priority | Owner |
|----|--------|------|-----------|------|----------|-------|
| P0-B1-001 | Backend | /api/bio-sentinel/sync endpoint | M | 2-3d | P0 | B1 |
| P1-B1-002 | Backend | Conflict resolver service | S | 1d | P1 | B1 |
| P0-B1-003 | Backend | /api/xbio/heater/control endpoint | S | 1-2d | P0 | B1 |
| P1-B1-004 | Backend | /api/xbio/heater/status endpoint | S | 1d | P1 | B1 |
| P0-B1-005 | Backend | Firmware management APIs | M | 2-3d | P0 | B1 |
| P1-B1-006 | Backend | Firmware rollback mechanism | M | 2-3d | P1 | B1 |
| P0-B1-007 | Backend | Analytics computation service | M | 2-3d | P0 | B1 |
| P0-A-001 | Android | UsbDevicePlugin (Capacitor) | L | 3-4d | P0 | A |
| P0-A-002 | Android | USB serial communication | L | 3-4d | P0 | A |
| P0-A-003 | Android | Local database (Room) | M | 2-3d | P0 | A |
| P0-A-004 | Android | Sync manager service | L | 3-4d | P0 | A |
| P0-A-005 | Android | Heater control service | L | 3-4d | P0 | A |
| P0-A-006 | Android | Firmware updater (OTA) | XL | 1-2w | P0 | A |
| P0-F-001 | Firmware | Protocol documentation | M | 2-3d | P0 | F |
| P0-F-002 | Firmware | Bootloader OTA support | L | 3-4d | P0 | F |
| P1-F-003 | Firmware | Ring buffer for offline | M | 2-3d | P1 | F |
| P1-F-004 | Firmware | WiFi/MQTT optimization | M | 2-3d | P1 | F |
| P1-F-005 | Firmware | Calibration routine | S | 1-2d | P1 | F |
| P0-W-001 | Web | Refactor BioSentinel.tsx | S | 1-2d | P0 | W |
| P0-W-002 | Web | Refactor XBioSentinel.tsx | S | 1-2d | P0 | W |
| P1-W-003 | Web | Refactor AnalyticsHub.tsx | M | 1-2d | P1 | W |
| P0-D-001 | QA | E2E test suite | M | 3-4d | P0 | D |
| P0-D-002 | QA | Load testing | M | 2-3d | P0 | D |
| P0-D-003 | QA | Staging deployment | M | 2-3d | P0 | D |

**Total Time Estimate: 12-16 weeks** (all streams in parallel)

---

