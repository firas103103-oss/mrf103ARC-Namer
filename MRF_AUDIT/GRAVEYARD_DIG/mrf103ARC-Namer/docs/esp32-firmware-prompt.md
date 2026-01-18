# ESP32 Firmware Build Prompt for X Bio Sentinel

## Instructions for AI Builder

You are building firmware for the **X Bio Sentinel** electronic nose system. This firmware runs on an ESP32-S3 N16R8 with a Waveshare BME688 gas sensor. It must communicate with a web dashboard via WebSocket using the exact protocol specified below.

---

## Project Setup

### Development Environment
- **IDE**: PlatformIO in VS Code (NOT Arduino IDE)
- **Framework**: Arduino framework for ESP32
- **Board**: ESP32-S3 DevKitC-1 N16R8

### platformio.ini
```ini
[env:esp32s3]
platform = espressif32
board = esp32-s3-devkitc-1
framework = arduino
monitor_speed = 115200
board_build.flash_mode = qio
board_build.flash_size = 16MB
board_build.psram = enabled

lib_deps =
    bblanchon/ArduinoJson@^6.21.0
    links2004/WebSockets@^2.4.0
    boschsensortec/BSEC Software Library@^1.6.1480
    adafruit/Adafruit BME680 Library@^2.0.4

build_flags =
    -DBOARD_HAS_PSRAM
    -DARDUINO_USB_CDC_ON_BOOT=1
```

---

## Hardware Configuration

### Pin Definitions
```cpp
#define I2C_SDA 8
#define I2C_SCL 9
#define BME688_ADDRESS 0x76  // or 0x77 if SDO connected to VCC
```

### BME688 Setup
- Use Bosch BSEC library for advanced IAQ calculations
- Configure for 3.3V operation
- Default I2C address 0x76

---

## Core Requirements

### 1. WiFi Connection
- Connect to WiFi using credentials stored in config
- Implement reconnection with exponential backoff
- Report WiFi RSSI in status messages

### 2. WebSocket Connection
- Connect to: `wss://{SERVER_URL}/ws/bio-sentinel`
- Auto-reconnect on disconnect (exponential backoff: 1s, 2s, 4s, 8s, max 30s)
- Send heartbeat ping every 10 seconds
- Handle incoming commands from server

### 3. Sensor Reading
- Read BME688 at configurable interval (default 1 second)
- Calculate IAQ score, CO2 equivalent, VOC equivalent using BSEC
- Track heater stability status
- Store readings in circular buffer for averaging

### 4. Operating Modes
Implement these modes (controlled by server commands):

| Mode | Description | Behavior |
|------|-------------|----------|
| `idle` | Power saving | Sensor off, minimal activity |
| `monitoring` | Real-time readings | Send readings every 1s |
| `profiling` | Smell capture | Collect samples for 30s, compute feature vector |
| `calibration` | Baseline calibration | Run in clean air, store baseline |
| `discovery` | Continuous discovery | Aggressive sampling, look for new smells |

### 5. Heater Profiles
Implement these BME688 heater configurations:

| Profile | Temperature | Duration | Use Case |
|---------|-------------|----------|----------|
| `low_power` | 200°C | 100ms | Battery saving |
| `balanced` | 280°C | 120ms | General use |
| `high_sensitivity` | 320°C | 150ms | Best VOC detection |
| `rapid` | 350°C | 80ms | Fast response |

### 6. Feature Vector Generation
When capturing a smell profile, generate a 128-dimensional feature vector:

```cpp
struct FeatureVector {
    float data[128];
    
    // Components:
    // [0-31]   Gas response curve (normalized over capture duration)
    // [32-47]  Temperature correlation
    // [48-55]  Humidity correction factors
    // [56-87]  Spectral features (simplified FFT)
    // [88-111] Statistical features (mean, std, min, max, percentiles, slope)
    // [112-127] Derivative features (rate of change)
};
```

Normalize the vector to unit length (L2 normalization).

---

## WebSocket Message Protocol

### Messages ESP32 Sends to Server

#### 1. Device Registration (on connect)
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

#### 2. Sensor Reading (every 1s in monitoring mode)
```json
{
  "type": "sensor_reading",
  "timestamp": 1703001234567,
  "payload": {
    "device_id": "xbs-esp32-001",
    "gas_resistance": 125000,
    "temperature": 25.4,
    "humidity": 45.2,
    "pressure": 1013.25,
    "iaq_score": 75,
    "iaq_accuracy": 3,
    "co2_equivalent": 650,
    "voc_equivalent": 1.2,
    "heater_temp": 320,
    "heater_duration": 150,
    "mode": "monitoring"
  }
}
```

**Note:** All readings use standard units:
- gas_resistance: ohms
- temperature: Celsius
- humidity: percentage (0-100)
- pressure: hPa
- iaq_score: 0-500 (BSEC scale)
- iaq_accuracy: 0-3 (0=unreliable, 3=calibrated)
- co2_equivalent/voc_equivalent: ppm

#### 3. Capture Complete
```json
{
  "type": "capture_complete",
  "timestamp": 1703001234567,
  "payload": {
    "capture_id": "cap-uuid-here",
    "device_id": "xbs-esp32-001",
    "duration_ms": 30000,
    "samples_count": 30,
    "gas_readings": [125000, 128000, ...],
    "temperature_readings": [25.4, 25.5, ...],
    "humidity_readings": [45.2, 45.1, ...],
    "baseline_gas": 150000,
    "peak_gas": 95000,
    "delta_gas": -55000,
    "feature_vector": [0.12, -0.45, 0.78, ...],
    "heater_profile": "high_sensitivity",
    "success": true,
    "error": null
  }
}
```

**Note:** On capture failure, set `success: false` and include an error message in `error` field.

#### 4. Heater Status
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

#### 5. Calibration Complete
```json
{
  "type": "calibration_complete",
  "timestamp": 1703001234567,
  "payload": {
    "device_id": "xbs-esp32-001",
    "success": true,
    "baseline_gas": 180000,
    "duration_ms": 60000,
    "error": null
  }
}
```

**Note:** On calibration failure, set `success: false` and include error message.

#### 6. Device Status (every 30s)
```json
{
  "type": "device_status",
  "timestamp": 1703001234567,
  "payload": {
    "mode": "monitoring",
    "uptime_ms": 3600000,
    "wifi_rssi": -45,
    "sensor_healthy": true,
    "last_calibration": 1703000000000,
    "heater_profile": "high_sensitivity",
    "firmware_version": "1.0.0",
    "free_heap": 180000,
    "errors": []
  }
}
```

**Mode values:** `idle`, `monitoring`, `calibrating`, `capturing`, `error`

#### 7. Error Report
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

### Commands ESP32 Receives from Server

#### 1. Set Mode
```json
{"type": "set_mode", "payload": {"mode": "monitoring"}}
```
**Modes:** `idle`, `monitoring`, `calibrating`, `capturing`

#### 2. Set Heater Profile
```json
{
  "type": "set_heater_profile",
  "payload": {
    "profile": "high_sensitivity",
    "custom_temp": null,
    "custom_duration": null
  }
}
```
**Profiles:** `low_power`, `standard`, `high_sensitivity`, `custom`

#### 3. Start Calibration
```json
{
  "type": "start_calibration",
  "payload": {"duration_seconds": 60}
}
```

#### 4. Start Smell Capture
```json
{
  "type": "start_capture",
  "payload": {
    "capture_id": "cap-uuid-here",
    "duration_seconds": 30,
    "label": "Coffee sample",
    "profile_id": null
  }
}
```

#### 5. Stop Operation
```json
{"type": "stop", "payload": {}}
```

#### 6. Request Status
```json
{"type": "request_status", "payload": {}}
```

#### 7. Restart Device
```json
{"type": "restart", "payload": {"reason": "User requested restart"}}
```

#### 8. Command Acknowledgment (Server to Client)
When the server receives a command, it sends back:
```json
{
  "type": "command_ack",
  "timestamp": 1703001234567,
  "payload": {
    "command": "set_mode",
    "status": "received",
    "error": null
  }
}
```
**Status values:** `received`, `executing`, `completed`, `failed`

---

## Code Structure

```
src/
├── main.cpp              # Entry point, setup/loop
├── config.h              # WiFi credentials, server URL, pins
├── wifi_manager.cpp/h    # WiFi connection handling
├── websocket_client.cpp/h # WebSocket connection and messaging
├── bme688_sensor.cpp/h   # Sensor reading and BSEC integration
├── smell_capture.cpp/h   # Capture sequences and feature extraction
├── heater_control.cpp/h  # Heater profile management
├── calibration.cpp/h     # Calibration routines
├── feature_vector.cpp/h  # Feature vector calculation
└── utils.cpp/h           # JSON helpers, timing, buffers
```

---

## Critical Implementation Details

### 1. Timestamp Format
Use milliseconds since Unix epoch:
```cpp
unsigned long long getTimestamp() {
    return (unsigned long long)time(nullptr) * 1000ULL + millis() % 1000;
}
```

### 2. JSON Message Building
Use ArduinoJson for all message construction:
```cpp
StaticJsonDocument<1024> doc;
doc["type"] = "sensor_reading";
doc["timestamp"] = getTimestamp();
JsonObject payload = doc.createNestedObject("payload");
payload["gas_resistance"] = gasResistance;
// ... etc
```

### 3. Feature Vector Normalization
L2 normalize before sending:
```cpp
void normalizeVector(float* vec, int size) {
    float sum = 0;
    for (int i = 0; i < size; i++) sum += vec[i] * vec[i];
    float mag = sqrt(sum);
    if (mag > 0) for (int i = 0; i < size; i++) vec[i] /= mag;
}
```

### 4. Circular Buffer for Readings
Store last 60 readings for averaging/analysis:
```cpp
struct SensorReading {
    unsigned long timestamp;
    float gas_resistance;
    float temperature;
    float humidity;
    float pressure;
    int iaq_score;
};

CircularBuffer<SensorReading, 60> readingBuffer;
```

### 5. Error Handling
- Retry sensor reads 3 times before reporting error
- Auto-reconnect WiFi and WebSocket
- Report all errors to server
- Implement watchdog timer (30 second timeout)

---

## Configuration Variables

```cpp
// config.h
#define WIFI_SSID "your-wifi"
#define WIFI_PASSWORD "your-password"
#define WS_SERVER "wss://your-server.com/ws/bio-sentinel"
#define DEVICE_ID "xbs-esp32-001"
#define DEVICE_SECRET "your-device-secret"
#define FIRMWARE_VERSION "1.0.0"

#define READING_INTERVAL_MS 1000
#define STATUS_INTERVAL_MS 30000
#define HEARTBEAT_INTERVAL_MS 10000
#define CAPTURE_DURATION_DEFAULT_MS 30000
```

---

## Testing Checklist

- [ ] WiFi connects and reconnects automatically
- [ ] WebSocket connects and reconnects automatically
- [ ] Device registration sent on connect
- [ ] Sensor readings sent every 1s in monitoring mode
- [ ] Mode changes work correctly
- [ ] Heater profiles change correctly
- [ ] Calibration routine completes and sends data
- [ ] Smell capture collects samples and generates feature vector
- [ ] Status updates sent every 30s
- [ ] Errors reported correctly
- [ ] Heartbeat keeps connection alive

---

## Notes for AI Builder

1. **Use PlatformIO, NOT Arduino IDE** - Better library management and ESP32-S3 support
2. **BSEC Library** - Required for accurate IAQ calculations, follow Bosch licensing
3. **Memory Management** - ESP32-S3 has PSRAM, use it for large buffers
4. **SSL/TLS** - WebSocket should use WSS (secure), include root CA if needed
5. **NTP Time** - Sync time on boot for accurate timestamps
6. **Non-blocking** - Never use delay(), use millis()-based timing
7. **JSON Size** - Keep messages under 4KB for WebSocket frames

The web dashboard expects EXACTLY this message format. Any deviation will cause parsing errors. Test thoroughly with the actual server before deployment.
