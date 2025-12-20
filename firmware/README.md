# X Bio Sentinel - ESP32-S3 Firmware

Electronic nose firmware for the X Bio Sentinel system. Communicates with the web dashboard via WebSocket for real-time smell detection and profiling.

## Hardware Requirements

- **MCU**: ESP32-S3 N16R8 (16MB Flash, 8MB PSRAM)
- **Sensor**: Waveshare BME688 (Temperature, Humidity, Pressure, Gas Resistance)
- **Connection**: I2C (SDA: GPIO8, SCL: GPIO9)

## Quick Start

### 1. Install PlatformIO

Install [PlatformIO IDE](https://platformio.org/install/ide?install=vscode) for VS Code.

### 2. Configure WiFi and Server

Edit `include/config.h`:

```cpp
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"
#define WS_SERVER "x-bioai.com"  // or your server URL
```

### 3. Build and Upload

```bash
# Build
pio run

# Upload to ESP32
pio run --target upload

# Monitor serial output
pio device monitor
```

## Features

### Operating Modes

| Mode | Description |
|------|-------------|
| `idle` | Low power, minimal activity |
| `monitoring` | Real-time sensor readings (1/sec) |
| `calibrating` | Baseline calibration in clean air |
| `capturing` | Smell profile capture with feature extraction |

### Heater Profiles

| Profile | Temperature | Duration | Use Case |
|---------|-------------|----------|----------|
| `low_power` | 200°C | 100ms | Battery saving |
| `standard` | 280°C | 120ms | General use |
| `high_sensitivity` | 320°C | 150ms | Best VOC detection |
| `rapid` | 350°C | 80ms | Fast response |

### WebSocket Messages

The firmware sends these message types to the server:

- `sensor_reading` - Real-time sensor data (every 1s in monitoring mode)
- `device_status` - Device health and status (every 30s)
- `capture_complete` - Smell capture results with 128-dim feature vector
- `calibration_complete` - Calibration results

The firmware responds to these commands from the server:

- `set_mode` - Change operating mode
- `set_heater_profile` - Change heater settings
- `start_calibration` - Begin baseline calibration
- `start_capture` - Start smell capture sequence
- `stop` - Stop current operation
- `request_status` - Request immediate status
- `restart` - Restart the device

## Feature Vector

The 128-dimensional feature vector captures:

- [0-31] Gas response curve (normalized)
- [32-47] Temperature correlation
- [48-55] Humidity correction
- [56-87] Reserved for spectral features
- [88-111] Statistical features (mean, std, min, max, slope)
- [112-127] Derivative features

All vectors are L2-normalized for consistent similarity comparison.

## Troubleshooting

### Sensor not found

- Check I2C wiring (SDA → GPIO8, SCL → GPIO9)
- Verify sensor address (0x76 default, 0x77 if SDO → VCC)
- Ensure 3.3V power supply

### WebSocket connection fails

- Verify WiFi credentials
- Check server URL and port
- Ensure SSL certificate is valid for WSS connections

### High variability in readings

- Allow 15-30 minutes warm-up time
- Run calibration in clean air environment
- Check for sensor contamination

## License

MIT License - X Bio Sentinel Project
