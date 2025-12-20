#include "calibration_manager.h"
#include <math.h>

CalibrationManager::CalibrationManager(SensorService& sensorService)
    : _sensorService(sensorService)
    , _calibrating(false)
    , _startTime(0)
    , _durationMs(DEFAULT_CALIBRATION_DURATION_MS)
    , _readingCount(0)
    , _lastSample(0)
    , _storedBaseline(100000.0f)
    , _lastCalibrationTime(0) {
    memset(_readings, 0, sizeof(_readings));
    memset(&_result, 0, sizeof(_result));
}

void CalibrationManager::begin() {
    _prefs.begin(NVS_NAMESPACE, false);
    loadStoredValues();
    
    if (_storedBaseline > 0) {
        _sensorService.setBaselineGas(_storedBaseline);
    }
    
    Serial.printf("[Calibration] Loaded baseline: %.0f ohms, last calibration: %lu\n",
                  _storedBaseline, _lastCalibrationTime);
}

void CalibrationManager::startCalibration(uint32_t durationSeconds) {
    if (_calibrating) {
        Serial.println("[Calibration] Already calibrating...");
        return;
    }
    
    _durationMs = durationSeconds * 1000;
    _startTime = millis();
    _lastSample = 0;
    _readingCount = 0;
    _calibrating = true;
    
    memset(_readings, 0, sizeof(_readings));
    memset(&_result, 0, sizeof(_result));
    
    Serial.printf("[Calibration] Started, duration: %d seconds\n", durationSeconds);
    Serial.println("[Calibration] Please ensure sensor is in clean air...");
}

void CalibrationManager::stopCalibration() {
    if (_calibrating) {
        Serial.println("[Calibration] Stopped by request");
        _calibrating = false;
        
        strncpy(_result.error, "Calibration stopped by user", sizeof(_result.error) - 1);
        _result.success = false;
    }
}

void CalibrationManager::update() {
    if (!_calibrating) return;
    
    unsigned long elapsed = millis() - _startTime;
    
    if (elapsed >= _durationMs) {
        finishCalibration();
        return;
    }
    
    uint32_t sampleInterval = _durationMs / CAPTURE_BUFFER_SIZE;
    if (millis() - _lastSample >= sampleInterval && _readingCount < CAPTURE_BUFFER_SIZE) {
        collectReading();
        _lastSample = millis();
    }
}

bool CalibrationManager::isCalibrating() {
    return _calibrating;
}

float CalibrationManager::getProgress() {
    if (!_calibrating) return 0.0f;
    unsigned long elapsed = millis() - _startTime;
    return min(100.0f, (float)elapsed / (float)_durationMs * 100.0f);
}

CalibrationResult& CalibrationManager::getResult() {
    return _result;
}

float CalibrationManager::getStoredBaseline() {
    return _storedBaseline;
}

unsigned long CalibrationManager::getLastCalibrationTime() {
    return _lastCalibrationTime;
}

void CalibrationManager::collectReading() {
    SensorReading reading = _sensorService.getCurrentReading();
    
    _readings[_readingCount] = reading.gasResistance;
    _readingCount++;
    
    Serial.printf("[Calibration] Sample %d/%d: gas=%.0f ohms\n",
                  _readingCount, CAPTURE_BUFFER_SIZE, reading.gasResistance);
}

void CalibrationManager::finishCalibration() {
    _calibrating = false;
    
    Serial.printf("[Calibration] Complete: %d samples collected\n", _readingCount);
    
    if (_readingCount < 10) {
        _result.success = false;
        strncpy(_result.error, "Insufficient samples for calibration", sizeof(_result.error) - 1);
        _result.baselineGas = 0;
        _result.durationMs = millis() - _startTime;
        return;
    }
    
    float sum = 0.0f;
    for (int i = 0; i < _readingCount; i++) {
        sum += _readings[i];
    }
    float mean = sum / _readingCount;
    
    float sumSqDiff = 0.0f;
    for (int i = 0; i < _readingCount; i++) {
        float diff = _readings[i] - mean;
        sumSqDiff += diff * diff;
    }
    float stdDev = sqrt(sumSqDiff / _readingCount);
    
    float coeffOfVariation = stdDev / mean;
    if (coeffOfVariation > 0.2f) {
        _result.success = false;
        strncpy(_result.error, "Readings too variable - ensure clean air environment", sizeof(_result.error) - 1);
        _result.baselineGas = mean;
        _result.durationMs = millis() - _startTime;
        return;
    }
    
    _result.success = true;
    _result.baselineGas = mean;
    _result.durationMs = millis() - _startTime;
    _result.error[0] = '\0';
    
    saveBaseline(mean);
    _sensorService.setBaselineGas(mean);
    
    Serial.printf("[Calibration] Success! Baseline: %.0f ohms (CV: %.2f%%)\n",
                  mean, coeffOfVariation * 100.0f);
}

void CalibrationManager::saveBaseline(float baseline) {
    _storedBaseline = baseline;
    _lastCalibrationTime = millis();
    
    _prefs.putFloat(NVS_KEY_BASELINE, baseline);
    _prefs.putULong(NVS_KEY_LAST_CAL, _lastCalibrationTime);
    
    Serial.printf("[Calibration] Baseline saved to NVS: %.0f ohms\n", baseline);
}

void CalibrationManager::loadStoredValues() {
    _storedBaseline = _prefs.getFloat(NVS_KEY_BASELINE, 100000.0f);
    _lastCalibrationTime = _prefs.getULong(NVS_KEY_LAST_CAL, 0);
}
