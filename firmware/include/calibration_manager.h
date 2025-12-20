#ifndef CALIBRATION_MANAGER_H
#define CALIBRATION_MANAGER_H

#include <Arduino.h>
#include <Preferences.h>
#include "config.h"
#include "sensor_service.h"

struct CalibrationResult {
    bool success;
    float baselineGas;
    uint32_t durationMs;
    char error[128];
};

class CalibrationManager {
public:
    CalibrationManager(SensorService& sensorService);
    
    void begin();
    void startCalibration(uint32_t durationSeconds);
    void stopCalibration();
    void update();
    
    bool isCalibrating();
    float getProgress();
    CalibrationResult& getResult();
    
    float getStoredBaseline();
    unsigned long getLastCalibrationTime();
    
private:
    SensorService& _sensorService;
    Preferences _prefs;
    
    bool _calibrating;
    uint32_t _startTime;
    uint32_t _durationMs;
    
    float _readings[CAPTURE_BUFFER_SIZE];
    int _readingCount;
    unsigned long _lastSample;
    
    CalibrationResult _result;
    float _storedBaseline;
    unsigned long _lastCalibrationTime;
    
    void collectReading();
    void finishCalibration();
    void saveBaseline(float baseline);
    void loadStoredValues();
};

#endif
