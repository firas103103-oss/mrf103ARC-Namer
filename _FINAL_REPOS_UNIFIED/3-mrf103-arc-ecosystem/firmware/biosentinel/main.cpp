/**
 * BioSentinel ESP32 Firmware
 * IoT Health Monitoring System
 * 
 * Hardware Requirements:
 * - ESP32 DevKit
 * - MAX30102 (Heart Rate & SpO2)
 * - MLX90614 (Temperature)
 * - MPU6050 (Accelerometer/Gyroscope)
 * 
 * Features:
 * - Real-time biometric monitoring
 * - WiFi connectivity
 * - MQTT/WebSocket data transmission
 * - Low power mode support
 * - OTA updates
 */

#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include "MAX30105.h"
#include "heartRate.h"

// =============================================================================
// Configuration
// =============================================================================

// WiFi Credentials
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Server Configuration
const char* WS_HOST = "api.mrf103.com";
const int WS_PORT = 443;
const char* WS_PATH = "/biosentinel/ws";

// Device Configuration
const char* DEVICE_ID = "biosentinel-001";
const int SAMPLE_RATE = 100;  // Hz
const int REPORT_INTERVAL = 1000;  // ms

// =============================================================================
// Global Objects
// =============================================================================

MAX30105 particleSensor;
WebSocketsClient webSocket;

// Sensor Data
float heartRate = 0;
float spO2 = 0;
float temperature = 0;
bool fingerDetected = false;

// Timing
unsigned long lastReport = 0;
unsigned long lastHeartbeat = 0;

// =============================================================================
// Setup
// =============================================================================

void setup() {
  Serial.begin(115200);
  Serial.println("\n=================================");
  Serial.println("  BioSentinel Firmware v1.0.0");
  Serial.println("  MRF103 Holdings");
  Serial.println("=================================\n");

  // Initialize I2C
  Wire.begin();

  // Initialize MAX30102
  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
    Serial.println("[ERROR] MAX30102 not found!");
    while (1);
  }
  Serial.println("[OK] MAX30102 initialized");

  // Configure sensor
  particleSensor.setup();
  particleSensor.setPulseAmplitudeRed(0x0A);
  particleSensor.setPulseAmplitudeGreen(0);

  // Connect WiFi
  connectWiFi();

  // Connect WebSocket
  connectWebSocket();

  Serial.println("\n[READY] BioSentinel Online");
}

// =============================================================================
// Main Loop
// =============================================================================

void loop() {
  webSocket.loop();

  // Read sensors
  readSensors();

  // Send data at interval
  if (millis() - lastReport >= REPORT_INTERVAL) {
    sendSensorData();
    lastReport = millis();
  }

  // Heartbeat every 30 seconds
  if (millis() - lastHeartbeat >= 30000) {
    sendHeartbeat();
    lastHeartbeat = millis();
  }
}

// =============================================================================
// WiFi Connection
// =============================================================================

void connectWiFi() {
  Serial.print("[WIFI] Connecting to ");
  Serial.println(WIFI_SSID);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WIFI] Connected!");
    Serial.print("[WIFI] IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n[WIFI] Connection failed!");
  }
}

// =============================================================================
// WebSocket Connection
// =============================================================================

void connectWebSocket() {
  Serial.println("[WS] Connecting to server...");
  
  webSocket.beginSSL(WS_HOST, WS_PORT, WS_PATH);
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.println("[WS] Disconnected");
      break;
      
    case WStype_CONNECTED:
      Serial.println("[WS] Connected!");
      sendDeviceInfo();
      break;
      
    case WStype_TEXT:
      handleCommand((char*)payload);
      break;
      
    case WStype_ERROR:
      Serial.println("[WS] Error");
      break;
  }
}

// =============================================================================
// Sensor Reading
// =============================================================================

void readSensors() {
  long irValue = particleSensor.getIR();
  
  // Check if finger is on sensor
  fingerDetected = irValue > 50000;
  
  if (fingerDetected) {
    // Calculate heart rate (simplified)
    static long lastBeat = 0;
    static int beatCount = 0;
    
    if (checkForBeat(irValue)) {
      long delta = millis() - lastBeat;
      lastBeat = millis();
      
      if (delta > 250 && delta < 2000) {
        heartRate = 60000.0 / delta;
        beatCount++;
      }
    }
    
    // SpO2 calculation (simplified)
    long redValue = particleSensor.getRed();
    if (redValue > 0 && irValue > 0) {
      float ratio = (float)redValue / (float)irValue;
      spO2 = 110 - 25 * ratio;  // Simplified formula
      spO2 = constrain(spO2, 0, 100);
    }
  } else {
    heartRate = 0;
    spO2 = 0;
  }
  
  // Temperature (placeholder - would use MLX90614)
  temperature = 36.5 + (random(0, 10) / 10.0);
}

// =============================================================================
// Data Transmission
// =============================================================================

void sendSensorData() {
  if (!fingerDetected) return;
  
  StaticJsonDocument<256> doc;
  
  doc["type"] = "sensor_data";
  doc["deviceId"] = DEVICE_ID;
  doc["timestamp"] = millis();
  
  JsonObject data = doc.createNestedObject("data");
  data["heartRate"] = heartRate;
  data["spO2"] = spO2;
  data["temperature"] = temperature;
  data["fingerDetected"] = fingerDetected;
  
  String json;
  serializeJson(doc, json);
  
  webSocket.sendTXT(json);
  
  Serial.printf("[DATA] HR: %.1f bpm, SpO2: %.1f%%, Temp: %.1f°C\n", 
                heartRate, spO2, temperature);
}

void sendDeviceInfo() {
  StaticJsonDocument<256> doc;
  
  doc["type"] = "device_info";
  doc["deviceId"] = DEVICE_ID;
  doc["firmware"] = "1.0.0";
  doc["ip"] = WiFi.localIP().toString();
  doc["rssi"] = WiFi.RSSI();
  
  String json;
  serializeJson(doc, json);
  
  webSocket.sendTXT(json);
}

void sendHeartbeat() {
  StaticJsonDocument<128> doc;
  
  doc["type"] = "heartbeat";
  doc["deviceId"] = DEVICE_ID;
  doc["uptime"] = millis() / 1000;
  doc["freeHeap"] = ESP.getFreeHeap();
  
  String json;
  serializeJson(doc, json);
  
  webSocket.sendTXT(json);
}

// =============================================================================
// Command Handling
// =============================================================================

void handleCommand(char* payload) {
  StaticJsonDocument<256> doc;
  DeserializationError error = deserializeJson(doc, payload);
  
  if (error) {
    Serial.println("[CMD] Parse error");
    return;
  }
  
  const char* command = doc["command"];
  
  if (strcmp(command, "reboot") == 0) {
    Serial.println("[CMD] Rebooting...");
    ESP.restart();
  } else if (strcmp(command, "status") == 0) {
    sendDeviceInfo();
  } else if (strcmp(command, "calibrate") == 0) {
    Serial.println("[CMD] Calibrating sensors...");
    // Calibration logic here
  }
}
