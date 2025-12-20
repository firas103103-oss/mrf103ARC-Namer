#ifndef CAPTURE_MANAGER_H
#define CAPTURE_MANAGER_H

#include <Arduino.h>
#include "config.h"
#include "sensor_service.h"

struct CaptureResult {
    char captureId[64];
    uint32_t durationMs;
    int samplesCount;
    float gasReadings[CAPTURE_BUFFER_SIZE];
    float tempReadings[CAPTURE_BUFFER_SIZE];
    float humidityReadings[CAPTURE_BUFFER_SIZE];
    float baselineGas;
    float peakGas;
    float deltaGas;
    float featureVector[FEATURE_VECTOR_SIZE];
    char heaterProfile[32];
    bool success;
    char error[128];
};

class CaptureManager {
public:
    CaptureManager(SensorService& sensorService);
    
    void startCapture(const char* captureId, uint32_t durationMs, const char* label, const char* heaterProfile);
    void stopCapture();
    void update();
    
    bool isCapturing();
    float getProgress();
    CaptureResult& getResult();
    
private:
    SensorService& _sensorService;
    
    bool _capturing;
    char _captureId[64];
    char _label[64];
    char _heaterProfile[32];
    
    uint32_t _startTime;
    uint32_t _durationMs;
    uint32_t _lastSample;
    int _sampleIndex;
    
    float _gasReadings[CAPTURE_BUFFER_SIZE];
    float _tempReadings[CAPTURE_BUFFER_SIZE];
    float _humidityReadings[CAPTURE_BUFFER_SIZE];
    
    CaptureResult _result;
    
    void collectSample();
    void finishCapture();
    void generateFeatureVector();
    void normalizeVector(float* vec, int size);
    void computeStatistics(float* data, int count, float& mean, float& stdDev, float& minVal, float& maxVal);
    void computeDerivatives(float* data, int count, float* derivatives);
};

#endif
