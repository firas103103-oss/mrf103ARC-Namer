#ifndef MODE_CONTROLLER_H
#define MODE_CONTROLLER_H

#include <Arduino.h>
#include <ArduinoJson.h>
#include "config.h"
#include "sensor_service.h"
#include "capture_manager.h"
#include "calibration_manager.h"
#include "websocket_client.h"

class ModeController {
public:
    ModeController(
        SensorService& sensorService,
        CaptureManager& captureManager,
        CalibrationManager& calibrationManager,
        BioSentinelWSClient& wsClient
    );
    
    void begin();
    void update();
    
    DeviceMode getCurrentMode();
    void setMode(DeviceMode mode);
    
    void handleCommand(const char* type, JsonObject& payload);
    
    void sendSensorReading();
    void sendDeviceStatus();
    
private:
    SensorService& _sensorService;
    CaptureManager& _captureManager;
    CalibrationManager& _calibrationManager;
    BioSentinelWSClient& _wsClient;
    
    DeviceMode _currentMode;
    unsigned long _lastSensorSend;
    unsigned long _lastStatusSend;
    
    void handleSetMode(JsonObject& payload);
    void handleSetHeaterProfile(JsonObject& payload);
    void handleStartCalibration(JsonObject& payload);
    void handleStartCapture(JsonObject& payload);
    void handleStop();
    void handleRequestStatus();
    void handleRestart(JsonObject& payload);
    
    const char* modeToString(DeviceMode mode);
    DeviceMode stringToMode(const char* modeStr);
    int findHeaterProfileIndex(const char* profileName);
};

#endif
