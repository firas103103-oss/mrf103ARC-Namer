# 🔧 Hardware Guide - XBio IoT Platform

Complete guide to setting up ESP32 + BME688 hardware for the XBio IoT Platform.

---

## 📦 Required Components

### Core Components
1. **ESP32 Development Board**
   - ESP32-WROOM-32
   - ESP32-DevKitC
   - Any ESP32 with WiFi
   - ~$5-10 USD

2. **BME688 Environmental Sensor**
   - Bosch BME688 breakout board
   - I2C interface
   - ~$20-30 USD

### Optional Components
3. **Breadboard** (for prototyping)
4. **Jumper Wires** (Male-to-Female)
5. **Micro USB Cable** (for programming)
6. **Power Supply** (5V for ESP32)

---

## 🔌 Wiring Diagram

### Pin Connections

```
ESP32 Pin    →    BME688 Pin
---------          ----------
3.3V         →    VCC
GND          →    GND
GPIO 21 (SDA) →   SDA
GPIO 22 (SCL) →   SCL
```

### Visual Diagram

```
        ESP32-WROOM-32              BME688
     ┌──────────────────┐       ┌──────────┐
     │                  │       │          │
     │   3.3V  ●────────┼───────┼●  VCC    │
     │   GND   ●────────┼───────┼●  GND    │
     │   GPIO21●────────┼───────┼●  SDA    │
     │   GPIO22●────────┼───────┼●  SCL    │
     │                  │       │          │
     │   USB   ┌─┐      │       └──────────┘
     │         └─┘      │
     └──────────────────┘
```

### Important Notes
- ⚠️ **Use 3.3V**: BME688 operates at 3.3V, NOT 5V!
- ⚠️ **I2C Address**: Default is `0x76` or `0x77`
- ⚠️ **Pull-up Resistors**: Most boards have built-in pull-ups

---

## 💻 Software Requirements

### Install PlatformIO

#### Option 1: VS Code Extension
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "PlatformIO IDE"
4. Click Install
5. Reload VS Code

#### Option 2: Command Line
```bash
pip install platformio
```

### Install Arduino CLI (Alternative)
```bash
# macOS
brew install arduino-cli

# Linux
curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh

# Windows
# Download from: https://arduino.cc/en/software
```

---

## 📝 Firmware Configuration

### 1. Navigate to Firmware Directory

```bash
cd xbio-iot-platform/firmware/esp32-xbio
```

### 2. Edit Configuration

Edit `src/config_manager.h` or create `config.h`:

```cpp
// WiFi Configuration
#define WIFI_SSID "Your_WiFi_Name"
#define WIFI_PASSWORD "Your_WiFi_Password"

// Server Configuration
#define SERVER_HOST "192.168.1.100"  // Your server IP
#define SERVER_PORT 5000
#define WS_PATH "/ws/bio-sentinel"

// Device Configuration
#define DEVICE_ID "xbs-esp32-001"

// BME688 Configuration
#define BME688_I2C_ADDR 0x76  // or 0x77
#define BME688_I2C_SDA 21
#define BME688_I2C_SCL 22
```

### 3. Install Dependencies

```bash
# PlatformIO
pio lib install

# Or manually add to platformio.ini:
lib_deps =
  adafruit/Adafruit BME680 Library
  bblanchon/ArduinoJson
  Links2004/WebSockets
```

---

## 🚀 Uploading Firmware

### Method 1: PlatformIO (Recommended)

```bash
cd firmware/esp32-xbio

# Build firmware
pio run

# Upload to ESP32
pio run --target upload

# Monitor serial output
pio device monitor
```

### Method 2: Arduino IDE

1. Open `firmware/esp32-xbio/src/main.cpp`
2. Install required libraries via Library Manager
3. Select Board: "ESP32 Dev Module"
4. Select Port: (your ESP32 port)
5. Click Upload

---

## 🔍 Testing the Hardware

### 1. Check Serial Monitor

After uploading, open serial monitor (115200 baud):

```
[INFO] XBio Sentinel Starting...
[INFO] WiFi connecting...
[INFO] WiFi connected: 192.168.1.50
[INFO] Server connecting: ws://192.168.1.100:5000/ws/bio-sentinel
[INFO] WebSocket connected
[INFO] BME688 initialized
[INFO] Starting sensor readings...
```

### 2. Verify Sensor Readings

You should see periodic sensor readings:

```
[DATA] Gas: 245000 Ω, Temp: 23.5°C, Humidity: 45.2%
[DATA] IAQ: 75, CO2eq: 450 ppm, VOCeq: 0.8 ppm
```

### 3. Check Dashboard

Open the web dashboard at `http://localhost:3000` and verify:
- Connection status shows "Connected"
- Real sensor readings appear
- Charts update in real-time

---

## 🛠️ Troubleshooting

### WiFi Not Connecting

**Symptoms**: Device stuck at "WiFi connecting..."

**Solutions**:
1. Verify WiFi credentials in `config.h`
2. Check WiFi signal strength
3. Ensure 2.4GHz network (ESP32 doesn't support 5GHz)
4. Restart router
5. Check for special characters in password

```cpp
// Debug WiFi
Serial.println(WiFi.status());
// 3 = Connected
// 6 = Disconnected
```

### WebSocket Not Connecting

**Symptoms**: "WebSocket connection failed"

**Solutions**:
1. Verify server is running: `http://SERVER_IP:5000/health`
2. Check firewall settings
3. Verify SERVER_HOST and SERVER_PORT in config
4. Check network connectivity: `ping SERVER_IP`

### BME688 Not Found

**Symptoms**: "BME688 initialization failed"

**Solutions**:
1. Check wiring connections
2. Verify I2C address (0x76 or 0x77)
3. Check pull-up resistors
4. Try I2C scanner sketch:

```cpp
#include <Wire.h>

void setup() {
  Wire.begin(21, 22);  // SDA, SCL
  Serial.begin(115200);
  
  for(byte addr = 1; addr < 127; addr++) {
    Wire.beginTransmission(addr);
    if(Wire.endTransmission() == 0) {
      Serial.printf("Found device at 0x%02X\n", addr);
    }
  }
}
```

### Erratic Readings

**Symptoms**: Unstable or incorrect values

**Solutions**:
1. Allow 5-10 minutes for sensor warm-up
2. Calibrate sensor in clean air
3. Check power supply stability (use 5V, 1A minimum)
4. Verify sensor is not exposed to direct heat
5. Run calibration routine

### Upload Failed

**Symptoms**: "Failed to connect to ESP32"

**Solutions**:
1. Hold BOOT button while connecting USB
2. Try different USB cable
3. Check USB drivers
4. Select correct COM port
5. Reduce upload speed in platformio.ini:

```ini
[env:esp32dev]
upload_speed = 115200
```

---

## 🔧 Advanced Configuration

### Heater Profiles

BME688 has multiple heater profiles for different scenarios:

```cpp
// Low Power Mode
heater_temp = 200;
heater_duration = 100;

// Balanced Mode (Default)
heater_temp = 280;
heater_duration = 120;

// High Sensitivity Mode
heater_temp = 320;
heater_duration = 150;

// Rapid Response Mode
heater_temp = 350;
heater_duration = 80;
```

### Calibration

Run calibration in clean air for 60 seconds:

```cpp
void calibrate() {
  Serial.println("Starting calibration...");
  // Collect baseline readings
  // Store baseline values
  // Calculate offsets
}
```

### Power Management

For battery operation:

```cpp
// Deep sleep between readings
esp_sleep_enable_timer_wakeup(60 * 1000000); // 60 seconds
esp_deep_sleep_start();

// Wake on sensor interrupt
gpio_wakeup_enable(GPIO_NUM_4, GPIO_INTR_LOW_LEVEL);
esp_sleep_enable_gpio_wakeup();
```

---

## 📊 Performance Optimization

### Update Rates
- **Continuous**: 1-2 seconds (high power)
- **Normal**: 5 seconds (balanced)
- **Low Power**: 30 seconds (battery)

### Memory Usage
- **Heap**: ~100KB free required
- **Flash**: ~1MB firmware size
- **Optimize**: Use smaller JSON buffers if needed

---

## 🧪 Testing Checklist

- [ ] WiFi connection established
- [ ] WebSocket connected to server
- [ ] BME688 sensor detected
- [ ] Sensor readings appear on serial
- [ ] Dashboard shows real-time data
- [ ] Calibration completes successfully
- [ ] Capture session works
- [ ] Device survives power cycle
- [ ] Automatic reconnection works

---

## 📚 Resources

### Datasheets
- [ESP32 Datasheet](https://www.espressif.com/sites/default/files/documentation/esp32_datasheet_en.pdf)
- [BME688 Datasheet](https://www.bosch-sensortec.com/media/boschsensortec/downloads/datasheets/bst-bme688-ds000.pdf)

### Libraries
- [Adafruit BME680 Library](https://github.com/adafruit/Adafruit_BME680)
- [ArduinoWebsockets](https://github.com/gilmaimon/ArduinoWebsockets)

### Community
- [ESP32 Forum](https://www.esp32.com/)
- [Adafruit Forums](https://forums.adafruit.com/)

---

**Ready to deploy? See [DEPLOYMENT.md](DEPLOYMENT.md)**
