/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🌡️ xBio Sentinel - Main Firmware
 * ESP32-S3 N16R8 + BME688 Environmental Monitoring System
 * MRF103 ARC - Advanced Reality Control
 * ═══════════════════════════════════════════════════════════════════════════════
 */

#include <Arduino.h>
#include <WiFi.h>
#include <Wire.h>
#include <ArduinoJson.h>
#include <PubSubClient.h>
#include <WebSocketsClient.h>
#include <Preferences.h>
#include <esp_system.h>
#include <esp_sleep.h>
#include <esp_wifi.h>

// xBio Modules
#include "bme688_driver.h"
#include "wifi_manager.h"
#include "ble_server.h"
#include "mqtt_client.h"
#include "websocket_handler.h"
#include "ota_updater.h"
#include "config_manager.h"
#include "led_controller.h"
#include "alert_manager.h"

// ═══════════════════════════════════════════════════════════════════════════════
// Configuration Defaults
// ═══════════════════════════════════════════════════════════════════════════════
#ifndef XBIO_VERSION
  #define XBIO_VERSION "1.0.0"
#endif

#ifndef SENSOR_READ_INTERVAL
  #define SENSOR_READ_INTERVAL 1000
#endif

#ifndef MQTT_PUBLISH_INTERVAL
  #define MQTT_PUBLISH_INTERVAL 5000
#endif

// ═══════════════════════════════════════════════════════════════════════════════
// Global Objects
// ═══════════════════════════════════════════════════════════════════════════════
BME688Driver sensorDriver;
XBioWiFiManager wifiManager;
XBioBLEServer bleServer;
XBioMQTTClient mqttClient;
XBioWebSocket wsHandler;
XBioOTAUpdater otaUpdater;
ConfigManager configManager;
LEDController ledController;
AlertManager alertManager;

// ═══════════════════════════════════════════════════════════════════════════════
// Global Variables
// ═══════════════════════════════════════════════════════════════════════════════
static unsigned long lastSensorRead = 0;
static unsigned long lastMqttPublish = 0;
static unsigned long lastWsUpdate = 0;
static bool systemReady = false;
static bool sensorCalibrated = false;

// Device Identity
String deviceId;
String deviceName;

// Current Sensor Data
SensorData currentData;

// ═══════════════════════════════════════════════════════════════════════════════
// Function Prototypes
// ═══════════════════════════════════════════════════════════════════════════════
void initializeSystem();
void initializePeripherals();
void initializeSensor();
void initializeConnectivity();
void readSensorData();
void publishData();
void handleAlerts();
void handleCommands(String command, JsonDocument& params);
void enterDeepSleep(uint32_t sleepTimeMs);
void printStartupBanner();
String generateDeviceId();

// ═══════════════════════════════════════════════════════════════════════════════
// Setup
// ═══════════════════════════════════════════════════════════════════════════════
void setup() {
  // Initialize Serial
  Serial.begin(115200);
  delay(1000);
  
  printStartupBanner();
  
  // Initialize LED Controller first for status indication
  ledController.begin();
  ledController.setStatus(LEDStatus::INITIALIZING);
  
  // Initialize System
  initializeSystem();
  
  // Initialize Peripherals
  initializePeripherals();
  
  // Initialize BME688 Sensor
  initializeSensor();
  
  // Initialize Connectivity
  initializeConnectivity();
  
  // System Ready
  systemReady = true;
  ledController.setStatus(LEDStatus::READY);
  
  Serial.println("═══════════════════════════════════════════════════════════════");
  Serial.println("✅ xBio Sentinel System Ready!");
  Serial.printf("📱 Device ID: %s\n", deviceId.c_str());
  Serial.printf("📡 IP Address: %s\n", WiFi.localIP().toString().c_str());
  Serial.println("═══════════════════════════════════════════════════════════════");
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Loop
// ═══════════════════════════════════════════════════════════════════════════════
void loop() {
  unsigned long currentMillis = millis();
  
  // Handle WiFi Connection
  wifiManager.loop();
  
  // Handle BLE
  #ifdef ENABLE_BLE_PROVISIONING
    bleServer.loop();
  #endif
  
  // Handle MQTT
  if (mqttClient.isConnected()) {
    mqttClient.loop();
  } else if (wifiManager.isConnected()) {
    mqttClient.reconnect();
  }
  
  // Handle WebSocket
  if (wsHandler.isConnected()) {
    wsHandler.loop();
  }
  
  // Handle OTA Updates
  #ifdef ENABLE_OTA_UPDATES
    otaUpdater.loop();
  #endif
  
  // Read Sensor Data
  if (currentMillis - lastSensorRead >= SENSOR_READ_INTERVAL) {
    lastSensorRead = currentMillis;
    readSensorData();
    handleAlerts();
  }
  
  // Publish to MQTT
  if (currentMillis - lastMqttPublish >= MQTT_PUBLISH_INTERVAL) {
    lastMqttPublish = currentMillis;
    publishData();
  }
  
  // Update WebSocket Clients
  if (currentMillis - lastWsUpdate >= 1000) {
    lastWsUpdate = currentMillis;
    wsHandler.broadcastSensorData(currentData);
  }
  
  // Update LED Status
  ledController.loop();
  
  // Yield to prevent WDT reset
  yield();
}

// ═══════════════════════════════════════════════════════════════════════════════
// Initialization Functions
// ═══════════════════════════════════════════════════════════════════════════════

void printStartupBanner() {
  Serial.println();
  Serial.println("═══════════════════════════════════════════════════════════════");
  Serial.println("    ██╗  ██╗██████╗ ██╗ ██████╗     ███████╗███████╗███╗   ██╗");
  Serial.println("    ╚██╗██╔╝██╔══██╗██║██╔═══██╗    ██╔════╝██╔════╝████╗  ██║");
  Serial.println("     ╚███╔╝ ██████╔╝██║██║   ██║    ███████╗█████╗  ██╔██╗ ██║");
  Serial.println("     ██╔██╗ ██╔══██╗██║██║   ██║    ╚════██║██╔══╝  ██║╚██╗██║");
  Serial.println("    ██╔╝ ██╗██████╔╝██║╚██████╔╝    ███████║███████╗██║ ╚████║");
  Serial.println("    ╚═╝  ╚═╝╚═════╝ ╚═╝ ╚═════╝     ╚══════╝╚══════╝╚═╝  ╚═══╝");
  Serial.println("═══════════════════════════════════════════════════════════════");
  Serial.printf("    MRF103 ARC - Environmental Monitoring System v%s\n", XBIO_VERSION);
  Serial.println("    ESP32-S3 N16R8 + BME688 Sensor Platform");
  Serial.println("═══════════════════════════════════════════════════════════════");
  Serial.println();
}

void initializeSystem() {
  Serial.println("🔧 Initializing System Configuration...");
  
  // Initialize Preferences for persistent storage
  configManager.begin();
  
  // Generate or retrieve Device ID
  deviceId = configManager.getDeviceId();
  if (deviceId.isEmpty()) {
    deviceId = generateDeviceId();
    configManager.setDeviceId(deviceId);
  }
  
  deviceName = configManager.getDeviceName();
  if (deviceName.isEmpty()) {
    deviceName = "xBio-" + deviceId.substring(0, 6);
    configManager.setDeviceName(deviceName);
  }
  
  Serial.printf("   Device ID: %s\n", deviceId.c_str());
  Serial.printf("   Device Name: %s\n", deviceName.c_str());
}

void initializePeripherals() {
  Serial.println("🔧 Initializing Peripherals...");
  
  // Initialize I2C for BME688
  Wire.begin(BME688_SDA, BME688_SCL);
  Wire.setClock(400000); // 400kHz Fast Mode
  
  Serial.printf("   I2C: SDA=%d, SCL=%d @ 400kHz\n", BME688_SDA, BME688_SCL);
  
  // Initialize Alert Manager
  alertManager.begin(&configManager);
  Serial.println("   Alert Manager: Initialized");
}

void initializeSensor() {
  Serial.println("🌡️ Initializing BME688 Sensor...");
  
  if (!sensorDriver.begin()) {
    Serial.println("❌ BME688 initialization failed!");
    ledController.setStatus(LEDStatus::ERROR);
    
    // Try alternate address
    Serial.println("   Trying alternate I2C address (0x76)...");
    if (!sensorDriver.begin(0x76)) {
      Serial.println("❌ BME688 not found on any address!");
      // Continue without sensor (for testing)
    } else {
      Serial.println("✅ BME688 found on alternate address");
    }
  } else {
    Serial.println("✅ BME688 initialized successfully");
  }
  
  // Configure sensor parameters
  sensorDriver.setTemperatureOffset(configManager.getTempOffset());
  sensorDriver.setHumidityOffset(configManager.getHumidityOffset());
  
  Serial.printf("   Temperature Offset: %.2f°C\n", configManager.getTempOffset());
  Serial.printf("   Humidity Offset: %.2f%%\n", configManager.getHumidityOffset());
  
  // Start calibration
  Serial.println("   Starting sensor calibration (5 minutes for optimal IAQ)...");
  ledController.setStatus(LEDStatus::CALIBRATING);
}

void initializeConnectivity() {
  Serial.println("📡 Initializing Connectivity...");
  
  // Initialize WiFi Manager
  wifiManager.begin(deviceName.c_str());
  
  // Wait for WiFi connection
  if (wifiManager.waitForConnection(30000)) {
    Serial.printf("✅ WiFi Connected: %s\n", WiFi.localIP().toString().c_str());
    
    // Initialize MQTT
    String mqttServer = configManager.getMqttServer();
    int mqttPort = configManager.getMqttPort();
    
    if (!mqttServer.isEmpty()) {
      mqttClient.begin(mqttServer.c_str(), mqttPort, deviceId.c_str());
      mqttClient.setCallback([](String topic, JsonDocument& payload) {
        handleCommands(topic, payload);
      });
      Serial.printf("   MQTT: %s:%d\n", mqttServer.c_str(), mqttPort);
    }
    
    // Initialize WebSocket
    String wsServer = configManager.getWsServer();
    if (!wsServer.isEmpty()) {
      wsHandler.begin(wsServer.c_str(), configManager.getWsPort());
      Serial.printf("   WebSocket: %s\n", wsServer.c_str());
    }
    
    // Initialize OTA
    #ifdef ENABLE_OTA_UPDATES
      otaUpdater.begin(deviceName.c_str());
      Serial.println("   OTA Updates: Enabled");
    #endif
    
  } else {
    Serial.println("⚠️ WiFi not connected - starting BLE provisioning");
  }
  
  // Initialize BLE Server (always available for local control)
  #ifdef ENABLE_BLE_PROVISIONING
    bleServer.begin(deviceName.c_str());
    bleServer.setDataCallback([](SensorData data) {
      // Handle BLE data requests
    });
    Serial.println("   BLE Server: Active");
  #endif
}

// ═══════════════════════════════════════════════════════════════════════════════
// Core Functions
// ═══════════════════════════════════════════════════════════════════════════════

void readSensorData() {
  if (!sensorDriver.isReady()) return;
  
  currentData = sensorDriver.read();
  
  // Check calibration status
  if (!sensorCalibrated && sensorDriver.isCalibrated()) {
    sensorCalibrated = true;
    ledController.setStatus(LEDStatus::READY);
    Serial.println("✅ Sensor calibration complete!");
  }
  
  #ifdef XBIO_DEBUG
    Serial.printf("📊 T:%.1f°C H:%.1f%% P:%.1fhPa IAQ:%d Gas:%.0fΩ\n",
      currentData.temperature,
      currentData.humidity,
      currentData.pressure,
      currentData.iaq,
      currentData.gasResistance
    );
  #endif
}

void publishData() {
  if (!mqttClient.isConnected()) return;
  
  // Create JSON payload
  JsonDocument doc;
  doc["device_id"] = deviceId;
  doc["device_name"] = deviceName;
  doc["timestamp"] = millis();
  doc["calibrated"] = sensorCalibrated;
  
  JsonObject sensors = doc["sensors"].to<JsonObject>();
  sensors["temperature"] = currentData.temperature;
  sensors["humidity"] = currentData.humidity;
  sensors["pressure"] = currentData.pressure;
  sensors["iaq"] = currentData.iaq;
  sensors["iaq_accuracy"] = currentData.iaqAccuracy;
  sensors["gas_resistance"] = currentData.gasResistance;
  sensors["co2_equivalent"] = currentData.co2Equivalent;
  sensors["voc_equivalent"] = currentData.vocEquivalent;
  
  JsonObject status = doc["status"].to<JsonObject>();
  status["wifi_rssi"] = WiFi.RSSI();
  status["uptime"] = millis() / 1000;
  status["free_heap"] = ESP.getFreeHeap();
  status["battery"] = 100; // Future: Add battery monitoring
  
  // Publish to MQTT
  String topic = "xbio/" + deviceId + "/data";
  mqttClient.publish(topic.c_str(), doc);
}

void handleAlerts() {
  // Check temperature thresholds
  if (currentData.temperature > configManager.getMaxTemperature()) {
    alertManager.trigger("HIGH_TEMPERATURE", currentData.temperature);
  }
  if (currentData.temperature < configManager.getMinTemperature()) {
    alertManager.trigger("LOW_TEMPERATURE", currentData.temperature);
  }
  
  // Check humidity thresholds
  if (currentData.humidity > configManager.getMaxHumidity()) {
    alertManager.trigger("HIGH_HUMIDITY", currentData.humidity);
  }
  if (currentData.humidity < configManager.getMinHumidity()) {
    alertManager.trigger("LOW_HUMIDITY", currentData.humidity);
  }
  
  // Check IAQ thresholds
  if (currentData.iaq > configManager.getMaxIAQ()) {
    alertManager.trigger("POOR_AIR_QUALITY", currentData.iaq);
    ledController.setStatus(LEDStatus::WARNING);
  }
}

void handleCommands(String topic, JsonDocument& params) {
  Serial.printf("📥 Command received: %s\n", topic.c_str());
  
  String command = params["command"].as<String>();
  
  if (command == "restart") {
    Serial.println("🔄 Restarting device...");
    delay(1000);
    ESP.restart();
  }
  else if (command == "set_config") {
    if (params.containsKey("temp_offset")) {
      configManager.setTempOffset(params["temp_offset"].as<float>());
      sensorDriver.setTemperatureOffset(params["temp_offset"].as<float>());
    }
    if (params.containsKey("humidity_offset")) {
      configManager.setHumidityOffset(params["humidity_offset"].as<float>());
      sensorDriver.setHumidityOffset(params["humidity_offset"].as<float>());
    }
    if (params.containsKey("device_name")) {
      configManager.setDeviceName(params["device_name"].as<String>());
      deviceName = params["device_name"].as<String>();
    }
  }
  else if (command == "get_status") {
    // Force publish current status
    publishData();
  }
  else if (command == "calibrate") {
    sensorDriver.forceCalibration();
    sensorCalibrated = false;
    ledController.setStatus(LEDStatus::CALIBRATING);
  }
  else if (command == "sleep") {
    uint32_t sleepTime = params["duration_ms"] | 60000;
    enterDeepSleep(sleepTime);
  }
  else if (command == "ota_update") {
    String url = params["url"].as<String>();
    otaUpdater.startUpdate(url);
  }
}

void enterDeepSleep(uint32_t sleepTimeMs) {
  Serial.printf("😴 Entering deep sleep for %d ms...\n", sleepTimeMs);
  
  // Save state
  configManager.saveState();
  
  // Disconnect
  mqttClient.disconnect();
  WiFi.disconnect(true);
  
  // Configure wakeup
  esp_sleep_enable_timer_wakeup(sleepTimeMs * 1000);
  
  // Enter deep sleep
  esp_deep_sleep_start();
}

String generateDeviceId() {
  uint8_t mac[6];
  esp_efuse_mac_get_default(mac);
  
  char deviceId[18];
  snprintf(deviceId, sizeof(deviceId), "%02X%02X%02X%02X%02X%02X",
           mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
  
  return String(deviceId);
}
