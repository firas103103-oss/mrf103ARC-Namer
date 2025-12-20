#ifndef SENSOR_SERVICE_H
#define SENSOR_SERVICE_H

#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME680.h>
#include "config.h"

struct SensorReading {
    float gasResistance;
    float temperature;
    float humidity;
    float pressure;
    int iaqScore;
    int iaqAccuracy;
    float co2Equivalent;
    float vocEquivalent;
    bool heaterStable;
    unsigned long timestamp;
};

class CircularBuffer {
public:
    CircularBuffer(size_t capacity);
    ~CircularBuffer();
    
    void push(const SensorReading& reading);
    SensorReading get(size_t index) const;
    size_t size() const;
    void clear();
    
    float* getGasReadingsArray(size_t& count);
    float* getTempReadingsArray(size_t& count);
    float* getHumidityReadingsArray(size_t& count);
    
private:
    SensorReading* _buffer;
    size_t _capacity;
    size_t _head;
    size_t _count;
};

class SensorService {
public:
    SensorService();
    
    bool begin();
    void update();
    bool isHealthy();
    
    SensorReading getCurrentReading();
    CircularBuffer& getBuffer();
    
    void setHeaterProfile(int profileIndex);
    int getHeaterProfileIndex();
    const HeaterProfile& getCurrentHeaterProfile();
    
    float getBaselineGas();
    void setBaselineGas(float baseline);
    
private:
    Adafruit_BME680 _bme;
    CircularBuffer _buffer;
    SensorReading _currentReading;
    
    int _heaterProfileIndex;
    float _baselineGas;
    bool _initialized;
    bool _healthy;
    
    unsigned long _lastRead;
    
    void readSensor();
    void calculateIAQ();
    float estimateCO2(float gasResistance, float humidity);
    float estimateVOC(float gasResistance, float humidity);
};

#endif
