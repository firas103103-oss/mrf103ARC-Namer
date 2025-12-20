#include "capture_manager.h"
#include <math.h>

CaptureManager::CaptureManager(SensorService& sensorService)
    : _sensorService(sensorService)
    , _capturing(false)
    , _startTime(0)
    , _durationMs(DEFAULT_CAPTURE_DURATION_MS)
    , _lastSample(0)
    , _sampleIndex(0) {
    memset(_captureId, 0, sizeof(_captureId));
    memset(_label, 0, sizeof(_label));
    memset(_heaterProfile, 0, sizeof(_heaterProfile));
    memset(&_result, 0, sizeof(_result));
}

void CaptureManager::startCapture(const char* captureId, uint32_t durationMs, const char* label, const char* heaterProfile) {
    if (_capturing) {
        Serial.println("[Capture] Already capturing, stopping previous...");
        stopCapture();
    }
    
    strncpy(_captureId, captureId, sizeof(_captureId) - 1);
    strncpy(_label, label ? label : "", sizeof(_label) - 1);
    strncpy(_heaterProfile, heaterProfile ? heaterProfile : "high_sensitivity", sizeof(_heaterProfile) - 1);
    
    _durationMs = durationMs > 0 ? durationMs : DEFAULT_CAPTURE_DURATION_MS;
    _startTime = millis();
    _lastSample = 0;
    _sampleIndex = 0;
    _capturing = true;
    
    memset(_gasReadings, 0, sizeof(_gasReadings));
    memset(_tempReadings, 0, sizeof(_tempReadings));
    memset(_humidityReadings, 0, sizeof(_humidityReadings));
    memset(&_result, 0, sizeof(_result));
    
    Serial.printf("[Capture] Started: %s, duration: %dms\n", _captureId, _durationMs);
}

void CaptureManager::stopCapture() {
    if (_capturing) {
        Serial.println("[Capture] Stopped by request");
        _capturing = false;
        
        strncpy(_result.error, "Capture stopped by user", sizeof(_result.error) - 1);
        _result.success = false;
    }
}

void CaptureManager::update() {
    if (!_capturing) return;
    
    unsigned long elapsed = millis() - _startTime;
    
    if (elapsed >= _durationMs) {
        finishCapture();
        return;
    }
    
    uint32_t sampleInterval = _durationMs / CAPTURE_BUFFER_SIZE;
    if (millis() - _lastSample >= sampleInterval && _sampleIndex < CAPTURE_BUFFER_SIZE) {
        collectSample();
        _lastSample = millis();
    }
}

bool CaptureManager::isCapturing() {
    return _capturing;
}

float CaptureManager::getProgress() {
    if (!_capturing) return 0.0f;
    unsigned long elapsed = millis() - _startTime;
    return min(100.0f, (float)elapsed / (float)_durationMs * 100.0f);
}

CaptureResult& CaptureManager::getResult() {
    return _result;
}

void CaptureManager::collectSample() {
    SensorReading reading = _sensorService.getCurrentReading();
    
    _gasReadings[_sampleIndex] = reading.gasResistance;
    _tempReadings[_sampleIndex] = reading.temperature;
    _humidityReadings[_sampleIndex] = reading.humidity;
    
    _sampleIndex++;
    
    Serial.printf("[Capture] Sample %d/%d: gas=%.0f, temp=%.1f, hum=%.1f\n",
                  _sampleIndex, CAPTURE_BUFFER_SIZE,
                  reading.gasResistance, reading.temperature, reading.humidity);
}

void CaptureManager::finishCapture() {
    _capturing = false;
    
    Serial.printf("[Capture] Complete: %d samples collected\n", _sampleIndex);
    
    strncpy(_result.captureId, _captureId, sizeof(_result.captureId) - 1);
    _result.durationMs = millis() - _startTime;
    _result.samplesCount = _sampleIndex;
    strncpy(_result.heaterProfile, _heaterProfile, sizeof(_result.heaterProfile) - 1);
    
    memcpy(_result.gasReadings, _gasReadings, sizeof(_gasReadings));
    memcpy(_result.tempReadings, _tempReadings, sizeof(_tempReadings));
    memcpy(_result.humidityReadings, _humidityReadings, sizeof(_humidityReadings));
    
    float minGas = _gasReadings[0];
    float maxGas = _gasReadings[0];
    float sumGas = 0;
    
    for (int i = 0; i < _sampleIndex; i++) {
        sumGas += _gasReadings[i];
        if (_gasReadings[i] < minGas) minGas = _gasReadings[i];
        if (_gasReadings[i] > maxGas) maxGas = _gasReadings[i];
    }
    
    _result.baselineGas = _gasReadings[0];
    _result.peakGas = minGas;
    _result.deltaGas = minGas - _result.baselineGas;
    
    generateFeatureVector();
    
    if (_sampleIndex >= 10) {
        _result.success = true;
        _result.error[0] = '\0';
    } else {
        _result.success = false;
        strncpy(_result.error, "Insufficient samples collected", sizeof(_result.error) - 1);
    }
}

void CaptureManager::generateFeatureVector() {
    memset(_result.featureVector, 0, sizeof(_result.featureVector));
    
    float maxGas = 1.0f;
    for (int i = 0; i < _sampleIndex; i++) {
        if (_gasReadings[i] > maxGas) maxGas = _gasReadings[i];
    }
    for (int i = 0; i < min(_sampleIndex, 32); i++) {
        _result.featureVector[i] = _gasReadings[i * _sampleIndex / 32] / maxGas;
    }
    
    float maxTemp = 1.0f;
    for (int i = 0; i < _sampleIndex; i++) {
        if (_tempReadings[i] > maxTemp) maxTemp = _tempReadings[i];
    }
    for (int i = 0; i < min(_sampleIndex, 16); i++) {
        _result.featureVector[32 + i] = _tempReadings[i * _sampleIndex / 16] / maxTemp;
    }
    
    float maxHum = 1.0f;
    for (int i = 0; i < _sampleIndex; i++) {
        if (_humidityReadings[i] > maxHum) maxHum = _humidityReadings[i];
    }
    for (int i = 0; i < min(_sampleIndex, 8); i++) {
        _result.featureVector[48 + i] = _humidityReadings[i * _sampleIndex / 8] / maxHum;
    }
    
    for (int i = 56; i < 88; i++) {
        _result.featureVector[i] = 0.0f;
    }
    
    float mean, stdDev, minVal, maxVal;
    computeStatistics(_gasReadings, _sampleIndex, mean, stdDev, minVal, maxVal);
    
    _result.featureVector[88] = mean / maxGas;
    _result.featureVector[89] = stdDev / maxGas;
    _result.featureVector[90] = minVal / maxGas;
    _result.featureVector[91] = maxVal / maxGas;
    
    computeStatistics(_tempReadings, _sampleIndex, mean, stdDev, minVal, maxVal);
    _result.featureVector[92] = mean / 100.0f;
    _result.featureVector[93] = stdDev / 100.0f;
    _result.featureVector[94] = minVal / 100.0f;
    _result.featureVector[95] = maxVal / 100.0f;
    
    computeStatistics(_humidityReadings, _sampleIndex, mean, stdDev, minVal, maxVal);
    _result.featureVector[96] = mean / 100.0f;
    _result.featureVector[97] = stdDev / 100.0f;
    _result.featureVector[98] = minVal / 100.0f;
    _result.featureVector[99] = maxVal / 100.0f;
    
    if (_sampleIndex > 1) {
        float slope = (_gasReadings[_sampleIndex-1] - _gasReadings[0]) / _sampleIndex;
        _result.featureVector[100] = slope / maxGas;
    }
    
    float derivatives[CAPTURE_BUFFER_SIZE];
    computeDerivatives(_gasReadings, _sampleIndex, derivatives);
    for (int i = 0; i < min(_sampleIndex - 1, 16); i++) {
        _result.featureVector[112 + i] = derivatives[i] / maxGas;
    }
    
    normalizeVector(_result.featureVector, FEATURE_VECTOR_SIZE);
}

void CaptureManager::normalizeVector(float* vec, int size) {
    float sumSq = 0.0f;
    for (int i = 0; i < size; i++) {
        sumSq += vec[i] * vec[i];
    }
    
    float magnitude = sqrt(sumSq);
    if (magnitude > 0.0001f) {
        for (int i = 0; i < size; i++) {
            vec[i] /= magnitude;
        }
    }
}

void CaptureManager::computeStatistics(float* data, int count, float& mean, float& stdDev, float& minVal, float& maxVal) {
    if (count == 0) {
        mean = stdDev = minVal = maxVal = 0.0f;
        return;
    }
    
    minVal = maxVal = data[0];
    float sum = 0.0f;
    
    for (int i = 0; i < count; i++) {
        sum += data[i];
        if (data[i] < minVal) minVal = data[i];
        if (data[i] > maxVal) maxVal = data[i];
    }
    
    mean = sum / count;
    
    float sumSqDiff = 0.0f;
    for (int i = 0; i < count; i++) {
        float diff = data[i] - mean;
        sumSqDiff += diff * diff;
    }
    
    stdDev = sqrt(sumSqDiff / count);
}

void CaptureManager::computeDerivatives(float* data, int count, float* derivatives) {
    for (int i = 0; i < count - 1; i++) {
        derivatives[i] = data[i + 1] - data[i];
    }
    if (count > 0) {
        derivatives[count - 1] = 0.0f;
    }
}
