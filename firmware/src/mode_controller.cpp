#include "mode_controller.h"
#include <WiFi.h>

ModeController::ModeController(
    SensorService& sensorService,
    CaptureManager& captureManager,
    CalibrationManager& calibrationManager,
    BioSentinelWSClient& wsClient
)
    : _sensorService(sensorService)
    , _captureManager(captureManager)
    , _calibrationManager(calibrationManager)
    , _wsClient(wsClient)
    , _currentMode(DeviceMode::IDLE)
    , _lastSensorSend(0)
    , _lastStatusSend(0) {
}

void ModeController::begin() {
    setMode(DeviceMode::MONITORING);
}

void ModeController::update() {
    unsigned long now = millis();
    
    switch (_currentMode) {
        case DeviceMode::MONITORING:
            if (now - _lastSensorSend >= SENSOR_READ_INTERVAL && _wsClient.isConnected()) {
                sendSensorReading();
                _lastSensorSend = now;
            }
            break;
            
        case DeviceMode::CALIBRATING:
            _calibrationManager.update();
            if (!_calibrationManager.isCalibrating()) {
                CalibrationResult& result = _calibrationManager.getResult();
                _wsClient.sendCalibrationComplete(
                    result.success,
                    result.baselineGas,
                    result.durationMs,
                    result.error
                );
                setMode(DeviceMode::MONITORING);
            }
            break;
            
        case DeviceMode::CAPTURING:
            _captureManager.update();
            if (!_captureManager.isCapturing()) {
                CaptureResult& result = _captureManager.getResult();
                _wsClient.sendCaptureComplete(
                    result.captureId,
                    result.durationMs,
                    result.samplesCount,
                    result.gasReadings,
                    result.tempReadings,
                    result.humidityReadings,
                    result.baselineGas,
                    result.peakGas,
                    result.deltaGas,
                    result.featureVector,
                    result.heaterProfile,
                    result.success,
                    result.error
                );
                setMode(DeviceMode::MONITORING);
            }
            break;
            
        case DeviceMode::IDLE:
        case DeviceMode::ERROR:
        default:
            break;
    }
    
    if (now - _lastStatusSend >= STATUS_REPORT_INTERVAL && _wsClient.isConnected()) {
        sendDeviceStatus();
        _lastStatusSend = now;
    }
}

DeviceMode ModeController::getCurrentMode() {
    return _currentMode;
}

void ModeController::setMode(DeviceMode mode) {
    if (mode == _currentMode) return;
    
    Serial.printf("[Mode] Changing from %s to %s\n",
                  modeToString(_currentMode), modeToString(mode));
    
    _currentMode = mode;
}

void ModeController::handleCommand(const char* type, JsonObject& payload) {
    if (strcmp(type, "set_mode") == 0) {
        handleSetMode(payload);
    } else if (strcmp(type, "set_heater_profile") == 0) {
        handleSetHeaterProfile(payload);
    } else if (strcmp(type, "start_calibration") == 0) {
        handleStartCalibration(payload);
    } else if (strcmp(type, "start_capture") == 0) {
        handleStartCapture(payload);
    } else if (strcmp(type, "stop") == 0) {
        handleStop();
    } else if (strcmp(type, "request_status") == 0) {
        handleRequestStatus();
    } else if (strcmp(type, "restart") == 0) {
        handleRestart(payload);
    } else {
        Serial.printf("[Mode] Unknown command: %s\n", type);
    }
}

void ModeController::handleSetMode(JsonObject& payload) {
    const char* modeStr = payload["mode"];
    if (modeStr) {
        DeviceMode newMode = stringToMode(modeStr);
        setMode(newMode);
    }
}

void ModeController::handleSetHeaterProfile(JsonObject& payload) {
    const char* profile = payload["profile"];
    if (profile) {
        int index = findHeaterProfileIndex(profile);
        if (index >= 0) {
            _sensorService.setHeaterProfile(index);
        }
    }
}

void ModeController::handleStartCalibration(JsonObject& payload) {
    uint32_t durationSeconds = payload["duration_seconds"] | 60;
    _calibrationManager.startCalibration(durationSeconds);
    setMode(DeviceMode::CALIBRATING);
}

void ModeController::handleStartCapture(JsonObject& payload) {
    const char* captureId = payload["capture_id"] | "capture";
    uint32_t durationSeconds = payload["duration_seconds"] | 30;
    const char* label = payload["label"];
    const char* heaterProfile = payload["heater_profile"] | "high_sensitivity";
    
    _captureManager.startCapture(captureId, durationSeconds * 1000, label, heaterProfile);
    setMode(DeviceMode::CAPTURING);
}

void ModeController::handleStop() {
    if (_currentMode == DeviceMode::CALIBRATING) {
        _calibrationManager.stopCalibration();
    } else if (_currentMode == DeviceMode::CAPTURING) {
        _captureManager.stopCapture();
    }
    setMode(DeviceMode::MONITORING);
}

void ModeController::handleRequestStatus() {
    sendDeviceStatus();
}

void ModeController::handleRestart(JsonObject& payload) {
    const char* reason = payload["reason"] | "Requested by server";
    Serial.printf("[Mode] Restarting: %s\n", reason);
    delay(1000);
    ESP.restart();
}

void ModeController::sendSensorReading() {
    SensorReading reading = _sensorService.getCurrentReading();
    const HeaterProfile& profile = _sensorService.getCurrentHeaterProfile();
    
    _wsClient.sendSensorReading(
        reading.gasResistance,
        reading.temperature,
        reading.humidity,
        reading.pressure,
        reading.iaqScore,
        reading.iaqAccuracy,
        reading.co2Equivalent,
        reading.vocEquivalent,
        profile.temperature,
        profile.duration,
        modeToString(_currentMode)
    );
}

void ModeController::sendDeviceStatus() {
    const HeaterProfile& profile = _sensorService.getCurrentHeaterProfile();
    
    _wsClient.sendDeviceStatus(
        modeToString(_currentMode),
        millis(),
        WiFi.RSSI(),
        _sensorService.isHealthy(),
        _calibrationManager.getLastCalibrationTime(),
        profile.name,
        ESP.getFreeHeap(),
        nullptr,
        0
    );
}

const char* ModeController::modeToString(DeviceMode mode) {
    switch (mode) {
        case DeviceMode::IDLE: return "idle";
        case DeviceMode::MONITORING: return "monitoring";
        case DeviceMode::CALIBRATING: return "calibrating";
        case DeviceMode::CAPTURING: return "capturing";
        case DeviceMode::ERROR: return "error";
        default: return "unknown";
    }
}

DeviceMode ModeController::stringToMode(const char* modeStr) {
    if (strcmp(modeStr, "idle") == 0) return DeviceMode::IDLE;
    if (strcmp(modeStr, "monitoring") == 0) return DeviceMode::MONITORING;
    if (strcmp(modeStr, "calibrating") == 0) return DeviceMode::CALIBRATING;
    if (strcmp(modeStr, "capturing") == 0) return DeviceMode::CAPTURING;
    return DeviceMode::ERROR;
}

int ModeController::findHeaterProfileIndex(const char* profileName) {
    for (int i = 0; i < NUM_HEATER_PROFILES; i++) {
        if (strcmp(HEATER_PROFILES[i].name, profileName) == 0) {
            return i;
        }
    }
    return -1;
}
