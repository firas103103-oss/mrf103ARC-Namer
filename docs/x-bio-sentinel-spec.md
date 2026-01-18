# X Bio Sentinel - Integration Specification v1.0

## Overview

X Bio Sentinel is an AI-powered electronic nose system using ESP32-S3 N16R8 with Waveshare BME688 sensor for intelligent smell identification, fingerprinting, and analysis.

**System Components:**
- **ESP32-S3 N16R8** - Microcontroller with WiFi
- **Waveshare BME688** - Gas sensor with temperature, humidity, pressure, and VOC detection
- **Web Dashboard** - Real-time monitoring, AI analysis, smell database
- **Backend Server** - WebSocket relay, REST API, vector storage

---

## Hardware Configuration

### ESP32-S3 Pin Mapping
| BME688 Pin | ESP32-S3 Pin | Description |
|------------|--------------|-------------|
| SDA        | GPIO 8       | I2C Data    |
| SCL        | GPIO 9       | I2C Clock   |
| GND        | GND          | Ground      |
| VCC        | 3.3V         | Power       |

### BME688 I2C Address
- Default: `0x76` (SDO to GND)
- Alternative: `0x77` (SDO to VCC)

---

## WebSocket Protocol

### Connection
- **URL**: `wss://{server}/ws/bio-sentinel`
- **Reconnection**: Auto-reconnect with exponential backoff (1s, 2s, 4s, 8s, max 30s)
- **Heartbeat**: ESP32 sends ping every 10 seconds, server responds with pong

### Message Format
All messages are JSON with this structure:
```json
{
  "type": "message_type",
  "timestamp": 1703001234567,
  "payload": { ... }
}
```

---

## ESP32 → Server Messages

### 1. Device Registration
Sent once on connection.
```json
{
  "type": "device_register",
  "timestamp": 1703001234567,
  "payload": {
    "device_id": "xbs-esp32-001",
    "firmware_version": "1.0.0",
    "sensor_type": "BME688",
    "capabilities": ["gas", "temperature", "humidity", "pressure", "iaq"]
  }
}
```

### 2. Sensor Reading (Real-time)
Sent every 1 second during active monitoring.
```json
{
  "type": "sensor_reading",
  "timestamp": 1703001234567,
  "payload": {
    "gas_resistance": 125000,
    "gas_resistance_unit": "ohms",
    "temperature": 25.4,
    "temperature_unit": "celsius",
    "humidity": 45.2,
    "humidity_unit": "percent",
    "pressure": 1013.25,
    "pressure_unit": "hPa",
    "iaq_score": 75,
    "iaq_accuracy": 3,
    "co2_equivalent": 650,
    "co2_unit": "ppm",
    "voc_equivalent": 1.2,
    "voc_unit": "ppm",
    "heater_stable": true,
    "heater_temperature": 320,
    "heater_duration": 150
  }
}
```

### 3. Smell Profile Capture
Sent when completing a smell capture sequence.
```json
{
  "type": "smell_capture",
  "timestamp": 1703001234567,
  "payload": {
    "capture_id": "cap-uuid-here",
    "duration_ms": 30000,
    "samples_count": 30,
    "gas_readings": [125000, 128000, 131000, ...],
    "temperature_readings": [25.4, 25.5, 25.4, ...],
    "humidity_readings": [45.2, 45.1, 45.3, ...],
    "heater_profile": "high_sensitivity",
    "baseline_gas": 150000,
    "peak_gas": 95000,
    "delta_gas": -55000,
    "feature_vector": [0.12, -0.45, 0.78, 0.23, ...],
    "vector_dimension": 128
  }
}
```

### 4. Heater Status Update
Sent when heater state changes.
```json
{
  "type": "heater_status",
  "timestamp": 1703001234567,
  "payload": {
    "heater_on": true,
    "target_temperature": 320,
    "current_temperature": 315,
    "profile": "high_sensitivity",
    "stage": 2,
    "total_stages": 10,
    "time_remaining_ms": 5000
  }
}
```

### 5. Calibration Data
Sent after calibration completes.
```json
{
  "type": "calibration_complete",
  "timestamp": 1703001234567,
  "payload": {
    "baseline_gas": 180000,
    "ambient_temperature": 24.5,
    "ambient_humidity": 42.0,
    "calibration_quality": "good",
    "recommended_action": null
  }
}
```

### 6. Device Status
Sent every 30 seconds or on status change.
```json
{
  "type": "device_status",
  "timestamp": 1703001234567,
  "payload": {
    "mode": "monitoring",
    "uptime_ms": 3600000,
    "free_heap": 180000,
    "wifi_rssi": -45,
    "sensor_healthy": true,
    "last_calibration": 1703000000000,
    "errors": []
  }
}
```

### 7. Error Report
Sent when errors occur.
```json
{
  "type": "error",
  "timestamp": 1703001234567,
  "payload": {
    "error_code": "SENSOR_READ_FAILED",
    "message": "I2C communication timeout",
    "severity": "warning",
    "recoverable": true
  }
}
```

---

## Server → ESP32 Commands

### 1. Set Operating Mode
```json
{
  "type": "set_mode",
  "payload": {
    "mode": "monitoring"
  }
}
```
Valid modes:
- `idle` - Sensor off, minimal power
- `monitoring` - Real-time readings every 1s
- `profiling` - Capture smell profile (30s sequence)
- `calibration` - Run calibration routine
- `discovery` - Continuous capture for new smell detection

### 2. Set Heater Profile
```json
{
  "type": "set_heater_profile",
  "payload": {
    "profile": "high_sensitivity"
  }
}
```
Valid profiles:
- `low_power` - 200°C, 100ms - Battery saving
- `balanced` - 280°C, 120ms - General use
- `high_sensitivity` - 320°C, 150ms - Best VOC detection
- `rapid` - 350°C, 80ms - Fast response
- `custom` - User-defined (include `temperature` and `duration_ms`)

### 3. Start Calibration
```json
{
  "type": "start_calibration",
  "payload": {
    "type": "clean_air"
  }
}
```
Calibration types:
- `clean_air` - Baseline in clean environment
- `reference` - Using reference gas

### 4. Start Smell Capture
```json
{
  "type": "start_capture",
  "payload": {
    "capture_id": "cap-uuid-here",
    "duration_ms": 30000,
    "sample_interval_ms": 1000,
    "heater_profile": "high_sensitivity"
  }
}
```

### 5. Stop Current Operation
```json
{
  "type": "stop",
  "payload": {}
}
```

### 6. Request Status
```json
{
  "type": "request_status",
  "payload": {}
}
```

### 7. Restart Device
```json
{
  "type": "restart",
  "payload": {
    "delay_ms": 1000
  }
}
```

### 8. Update Configuration
```json
{
  "type": "update_config",
  "payload": {
    "reading_interval_ms": 1000,
    "auto_calibration": true,
    "power_save_enabled": false
  }
}
```

---

## REST API Endpoints

### Smell Profiles

#### GET /api/bio-sentinel/profiles
List all stored smell profiles.
```json
{
  "profiles": [
    {
      "id": "prof-uuid",
      "name": "Coffee Arabica",
      "category": "food",
      "subcategory": "beverages",
      "created_at": "2024-01-01T12:00:00Z",
      "samples_count": 15,
      "confidence": 0.92,
      "tags": ["coffee", "arabica", "roasted"]
    }
  ],
  "total": 45,
  "page": 1,
  "per_page": 20
}
```

#### POST /api/bio-sentinel/profiles
Create new smell profile from capture.
```json
{
  "name": "Coffee Arabica",
  "category": "food",
  "subcategory": "beverages",
  "capture_id": "cap-uuid",
  "tags": ["coffee", "arabica"],
  "notes": "Fresh ground, medium roast"
}
```

#### GET /api/bio-sentinel/profiles/:id
Get full profile with vector data.

#### PUT /api/bio-sentinel/profiles/:id
Update profile metadata.

#### DELETE /api/bio-sentinel/profiles/:id
Delete profile.

#### POST /api/bio-sentinel/profiles/:id/train
Add additional sample to existing profile.

### Readings

#### GET /api/bio-sentinel/readings
Get historical readings with filters.
Query params: `from`, `to`, `limit`, `device_id`

#### GET /api/bio-sentinel/readings/live
SSE endpoint for real-time readings.

### Analysis

#### POST /api/bio-sentinel/analyze
Analyze a capture against stored profiles.
```json
{
  "capture_id": "cap-uuid"
}
```
Response:
```json
{
  "matches": [
    {
      "profile_id": "prof-uuid",
      "name": "Coffee Arabica",
      "similarity": 0.94,
      "confidence": "high"
    },
    {
      "profile_id": "prof-uuid-2",
      "name": "Coffee Robusta",
      "similarity": 0.78,
      "confidence": "medium"
    }
  ],
  "is_new_smell": false,
  "recommendation": "This appears to be Coffee Arabica with 94% confidence."
}
```

#### POST /api/bio-sentinel/chat
AI chat for smell analysis.
```json
{
  "message": "What could cause a sudden spike in VOC readings?",
  "context": {
    "recent_readings": [...],
    "current_profile": "..."
  }
}
```

### Device

#### GET /api/bio-sentinel/device/status
Current device status.

#### POST /api/bio-sentinel/device/command
Send command to device (proxied to WebSocket).

### Export/Import

#### GET /api/bio-sentinel/export
Export all profiles as JSON.

#### POST /api/bio-sentinel/import
Import profiles from JSON.

---

## Database Schema

### Table: smell_profiles
```sql
CREATE TABLE smell_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  subcategory VARCHAR(100),
  description TEXT,
  feature_vector vector(128),
  baseline_gas FLOAT,
  peak_gas FLOAT,
  delta_gas FLOAT,
  avg_temperature FLOAT,
  avg_humidity FLOAT,
  samples_count INTEGER DEFAULT 1,
  confidence FLOAT,
  tags TEXT[],
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX ON smell_profiles USING ivfflat (feature_vector vector_cosine_ops);
```

### Table: sensor_readings
```sql
CREATE TABLE sensor_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id VARCHAR(100) NOT NULL,
  gas_resistance FLOAT,
  temperature FLOAT,
  humidity FLOAT,
  pressure FLOAT,
  iaq_score INTEGER,
  co2_equivalent FLOAT,
  voc_equivalent FLOAT,
  heater_temperature INTEGER,
  mode VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX ON sensor_readings (device_id, created_at DESC);
```

### Table: smell_captures
```sql
CREATE TABLE smell_captures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id VARCHAR(100) NOT NULL,
  profile_id UUID REFERENCES smell_profiles(id),
  duration_ms INTEGER,
  samples_count INTEGER,
  raw_data JSONB,
  feature_vector vector(128),
  baseline_gas FLOAT,
  peak_gas FLOAT,
  heater_profile VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Feature Vector Generation

The 128-dimensional feature vector is generated from smell capture data:

### Vector Components (128 dimensions)
1. **Gas Response Curve (32 dims)**: Normalized gas resistance over time
2. **Temperature Correlation (16 dims)**: How gas changes with heater temperature
3. **Humidity Correction (8 dims)**: Humidity-adjusted readings
4. **Spectral Features (32 dims)**: FFT of gas readings for pattern detection
5. **Statistical Features (24 dims)**: Mean, std, min, max, percentiles, slope
6. **Derivative Features (16 dims)**: Rate of change patterns

### Normalization
- All vectors are L2-normalized before storage
- Similarity is computed using cosine distance
- Threshold for "same smell": similarity > 0.85
- Threshold for "similar smell": similarity > 0.70

---

## Smell Categories

### Predefined Categories
| Category | Subcategories |
|----------|---------------|
| Human | Body odor, Breath, Skin, Sweat |
| Food | Fruits, Vegetables, Meat, Dairy, Beverages, Spices |
| Chemical | Solvents, Alcohols, Acids, Gases, Fuels |
| Environmental | Smoke, Mold, Plants, Soil, Water |
| Medical | Infections, Metabolic, Medications |
| Industrial | Manufacturing, Automotive, Construction |
| Household | Cleaning, Cooking, Personal care |

---

## UI Components

### Dashboard Layout
```
+--------------------------------------------------+
| [Status Bar: Device Status | Mode | Connection]  |
+------------------+-------------------------------+
|                  |                               |
|  Control Panel   |    Main Visualization         |
|  - Mode Select   |    - Real-time Charts         |
|  - Heater Ctrl   |    - Gas Resistance Graph     |
|  - Calibration   |    - Environmental Readings   |
|                  |                               |
+------------------+-------------------------------+
|                  |                               |
|  Smell Library   |    AI Analysis Panel          |
|  - Profiles List |    - Chat Interface           |
|  - Search/Filter |    - Match Results            |
|  - Quick Actions |    - Recommendations          |
|                  |                               |
+------------------+-------------------------------+
```

### Widgets
1. **Connection Status** - Online/Offline with signal strength
2. **Gas Resistance Gauge** - Current reading with trend arrow
3. **Environment Card** - Temp, Humidity, Pressure
4. **IAQ Score** - Air quality with color coding
5. **Heater Status** - On/Off, temperature, profile
6. **Mode Indicator** - Current operating mode
7. **Real-time Graph** - Last 60 seconds of readings
8. **Capture Progress** - Progress bar during smell capture
9. **Match Results** - Top matches with confidence bars
10. **Profile Card** - Smell profile preview

---

## Error Codes

| Code | Description | Recovery |
|------|-------------|----------|
| SENSOR_INIT_FAILED | BME688 not detected | Check I2C wiring |
| SENSOR_READ_FAILED | I2C communication error | Auto-retry 3x |
| WIFI_DISCONNECTED | Lost WiFi connection | Auto-reconnect |
| WS_DISCONNECTED | WebSocket closed | Auto-reconnect |
| HEATER_TIMEOUT | Heater not reaching temp | Check sensor |
| CALIBRATION_FAILED | Bad calibration data | Retry in clean air |
| MEMORY_LOW | Free heap < 50KB | Restart device |
| CAPTURE_INTERRUPTED | Capture stopped early | Restart capture |

---

## Security

- Device authentication via unique device_id + secret token
- WebSocket connections require valid auth header
- All REST endpoints require session authentication
- Sensitive operations logged for audit

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-12-20 | Initial specification |
