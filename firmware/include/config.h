#ifndef CONFIG_H
#define CONFIG_H

// =============================================================================
// X Bio Sentinel - Configuration Header
// =============================================================================

// WiFi Configuration - UPDATE THESE WITH YOUR CREDENTIALS
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

// WebSocket Server Configuration
#define WS_SERVER "x-bioai.com"
#define WS_PORT 443
#define WS_PATH "/ws/bio-sentinel"
#define WS_USE_SSL true

// Device Configuration
#define DEVICE_ID "xbs-esp32-001"
#define FIRMWARE_VERSION "1.0.0"

// I2C Pin Configuration (ESP32-S3)
#define I2C_SDA 8
#define I2C_SCL 9
#define BME688_ADDRESS 0x76

// Timing Configuration (milliseconds)
#define SENSOR_READ_INTERVAL 1000
#define STATUS_REPORT_INTERVAL 30000
#define HEARTBEAT_INTERVAL 10000
#define RECONNECT_MAX_DELAY 30000
#define RECONNECT_INITIAL_DELAY 1000

// Capture Configuration
#define DEFAULT_CAPTURE_DURATION_MS 30000
#define DEFAULT_SAMPLE_INTERVAL_MS 1000
#define CAPTURE_BUFFER_SIZE 60
#define FEATURE_VECTOR_SIZE 128

// Calibration Configuration
#define DEFAULT_CALIBRATION_DURATION_MS 60000

// Heater Profile Definitions
struct HeaterProfile {
    const char* name;
    uint16_t temperature;
    uint16_t duration;
};

const HeaterProfile HEATER_PROFILES[] = {
    {"low_power", 200, 100},
    {"standard", 280, 120},
    {"high_sensitivity", 320, 150},
    {"rapid", 350, 80}
};

#define NUM_HEATER_PROFILES 4
#define DEFAULT_HEATER_PROFILE 2

// Operating Modes
enum class DeviceMode {
    IDLE,
    MONITORING,
    CALIBRATING,
    CAPTURING,
    ERROR
};

// NVS Keys for persistent storage
#define NVS_NAMESPACE "biosent"
#define NVS_KEY_BASELINE "baseline"
#define NVS_KEY_LAST_CAL "last_cal"
#define NVS_KEY_HEATER_PROFILE "heater_prof"

#endif
