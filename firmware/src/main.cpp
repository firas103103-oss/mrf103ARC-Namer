// =============================================================================
// X Bio Sentinel - ESP32-S3 Electronic Nose Firmware
// =============================================================================
// Hardware: ESP32-S3 N16R8 + Waveshare BME688
// Communication: WiFi + WebSocket (WSS)
// Protocol Version: 1.0.0
// =============================================================================

#include <Arduino.h>
#include <ArduinoJson.h>
#include <WiFi.h>
#include "config.h"
#include "wifi_manager.h"
#include "websocket_client.h"
#include "sensor_service.h"
#include "capture_manager.h"
#include "calibration_manager.h"
#include "mode_controller.h"

WiFiManager wifiManager;
BioSentinelWSClient wsClient;
SensorService sensorService;
CaptureManager captureManager(sensorService);
CalibrationManager calibrationManager(sensorService);
ModeController modeController(sensorService, captureManager, calibrationManager, wsClient);

bool wsConnected = false;

void onCommand(const char* type, JsonObject& payload) {
    modeController.handleCommand(type, payload);
}

void setup() {
    Serial.begin(115200);
    delay(1000);
    
    Serial.println();
    Serial.println("==============================================");
    Serial.println("   X Bio Sentinel - Electronic Nose System");
    Serial.println("==============================================");
    Serial.printf("   Device ID: %s\n", DEVICE_ID);
    Serial.printf("   Firmware:  %s\n", FIRMWARE_VERSION);
    Serial.printf("   Server:    %s:%d%s\n", WS_SERVER, WS_PORT, WS_PATH);
    Serial.println("==============================================");
    Serial.println();
    
    Serial.println("[Init] Starting WiFi manager...");
    wifiManager.begin();
    
    Serial.println("[Init] Waiting for WiFi connection...");
    unsigned long wifiStart = millis();
    while (!wifiManager.isConnected() && millis() - wifiStart < 30000) {
        wifiManager.update();
        delay(100);
    }
    
    if (!wifiManager.isConnected()) {
        Serial.println("[Init] WiFi connection timeout - continuing anyway");
    }
    
    Serial.println("[Init] Starting sensor service...");
    if (!sensorService.begin()) {
        Serial.println("[Init] FATAL: Sensor initialization failed!");
        while (1) {
            delay(1000);
            Serial.println("[Error] Sensor not found. Check wiring and restart.");
        }
    }
    
    Serial.println("[Init] Starting calibration manager...");
    calibrationManager.begin();
    
    Serial.println("[Init] Connecting to WebSocket server...");
    wsClient.begin(WS_SERVER, WS_PORT, WS_PATH, WS_USE_SSL);
    wsClient.setCommandCallback(onCommand);
    
    Serial.println("[Init] Starting mode controller...");
    modeController.begin();
    
    Serial.println();
    Serial.println("==============================================");
    Serial.println("   Initialization Complete - Running");
    Serial.println("==============================================");
    Serial.println();
}

void loop() {
    wifiManager.update();
    
    sensorService.update();
    
    if (wifiManager.isConnected()) {
        wsClient.update();
        
        if (wsClient.isConnected()) {
            if (!wsConnected) {
                Serial.println("[Main] WebSocket connected - sending initial status");
                modeController.sendDeviceStatus();
                wsConnected = true;
            }
            
            modeController.update();
        } else {
            if (wsConnected) {
                Serial.println("[Main] WebSocket disconnected");
                wsConnected = false;
            }
        }
    }
    
    static unsigned long lastHeapLog = 0;
    if (millis() - lastHeapLog > 60000) {
        Serial.printf("[Main] Free heap: %d bytes, RSSI: %d dBm\n",
                      ESP.getFreeHeap(), WiFi.RSSI());
        lastHeapLog = millis();
    }
    
    delay(10);
}
