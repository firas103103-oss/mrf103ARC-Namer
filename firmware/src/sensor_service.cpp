#include "sensor_service.h"
#include <math.h>

CircularBuffer::CircularBuffer(size_t capacity)
    : _capacity(capacity)
    , _head(0)
    , _count(0) {
    _buffer = new SensorReading[capacity];
}

CircularBuffer::~CircularBuffer() {
    delete[] _buffer;
}

void CircularBuffer::push(const SensorReading& reading) {
    _buffer[_head] = reading;
    _head = (_head + 1) % _capacity;
    if (_count < _capacity) _count++;
}

SensorReading CircularBuffer::get(size_t index) const {
    if (index >= _count) {
        return SensorReading{};
    }
    size_t actualIndex = (_head - _count + index + _capacity) % _capacity;
    return _buffer[actualIndex];
}

size_t CircularBuffer::size() const {
    return _count;
}

void CircularBuffer::clear() {
    _head = 0;
    _count = 0;
}

float* CircularBuffer::getGasReadingsArray(size_t& count) {
    count = _count;
    float* arr = new float[_count];
    for (size_t i = 0; i < _count; i++) {
        arr[i] = get(i).gasResistance;
    }
    return arr;
}

float* CircularBuffer::getTempReadingsArray(size_t& count) {
    count = _count;
    float* arr = new float[_count];
    for (size_t i = 0; i < _count; i++) {
        arr[i] = get(i).temperature;
    }
    return arr;
}

float* CircularBuffer::getHumidityReadingsArray(size_t& count) {
    count = _count;
    float* arr = new float[_count];
    for (size_t i = 0; i < _count; i++) {
        arr[i] = get(i).humidity;
    }
    return arr;
}

SensorService::SensorService()
    : _buffer(CAPTURE_BUFFER_SIZE)
    , _heaterProfileIndex(DEFAULT_HEATER_PROFILE)
    , _baselineGas(100000.0f)
    , _initialized(false)
    , _healthy(false)
    , _lastRead(0) {
    memset(&_currentReading, 0, sizeof(SensorReading));
}

bool SensorService::begin() {
    Serial.println("[Sensor] Initializing BME688...");
    
    Wire.begin(I2C_SDA, I2C_SCL);
    
    if (!_bme.begin(BME688_ADDRESS)) {
        Serial.println("[Sensor] BME688 not found!");
        _healthy = false;
        return false;
    }
    
    const HeaterProfile& profile = HEATER_PROFILES[_heaterProfileIndex];
    _bme.setTemperatureOversampling(BME680_OS_8X);
    _bme.setHumidityOversampling(BME680_OS_2X);
    _bme.setPressureOversampling(BME680_OS_4X);
    _bme.setIIRFilterSize(BME680_FILTER_SIZE_3);
    _bme.setGasHeater(profile.temperature, profile.duration);
    
    Serial.printf("[Sensor] BME688 initialized with heater profile: %s (%d°C, %dms)\n",
                  profile.name, profile.temperature, profile.duration);
    
    _initialized = true;
    _healthy = true;
    
    readSensor();
    
    return true;
}

void SensorService::update() {
    if (!_initialized) return;
    
    if (millis() - _lastRead >= SENSOR_READ_INTERVAL) {
        readSensor();
        _lastRead = millis();
    }
}

bool SensorService::isHealthy() {
    return _healthy;
}

SensorReading SensorService::getCurrentReading() {
    return _currentReading;
}

CircularBuffer& SensorService::getBuffer() {
    return _buffer;
}

void SensorService::setHeaterProfile(int profileIndex) {
    if (profileIndex >= 0 && profileIndex < NUM_HEATER_PROFILES) {
        _heaterProfileIndex = profileIndex;
        const HeaterProfile& profile = HEATER_PROFILES[profileIndex];
        _bme.setGasHeater(profile.temperature, profile.duration);
        Serial.printf("[Sensor] Heater profile changed to: %s\n", profile.name);
    }
}

int SensorService::getHeaterProfileIndex() {
    return _heaterProfileIndex;
}

const HeaterProfile& SensorService::getCurrentHeaterProfile() {
    return HEATER_PROFILES[_heaterProfileIndex];
}

float SensorService::getBaselineGas() {
    return _baselineGas;
}

void SensorService::setBaselineGas(float baseline) {
    _baselineGas = baseline;
    Serial.printf("[Sensor] Baseline gas set to: %.0f ohms\n", baseline);
}

void SensorService::readSensor() {
    unsigned long endTime = _bme.beginReading();
    if (endTime == 0) {
        Serial.println("[Sensor] Failed to begin reading");
        _healthy = false;
        return;
    }
    
    if (!_bme.endReading()) {
        Serial.println("[Sensor] Failed to complete reading");
        _healthy = false;
        return;
    }
    
    _healthy = true;
    
    _currentReading.gasResistance = _bme.gas_resistance;
    _currentReading.temperature = _bme.temperature;
    _currentReading.humidity = _bme.humidity;
    _currentReading.pressure = _bme.pressure / 100.0f;
    _currentReading.heaterStable = (_bme.gas_resistance > 0);
    _currentReading.timestamp = millis();
    
    calculateIAQ();
    
    _buffer.push(_currentReading);
}

void SensorService::calculateIAQ() {
    float gasResistance = _currentReading.gasResistance;
    float humidity = _currentReading.humidity;
    
    float gasScore;
    if (gasResistance >= _baselineGas) {
        gasScore = 100.0f;
    } else if (gasResistance <= 0) {
        gasScore = 0.0f;
    } else {
        gasScore = (gasResistance / _baselineGas) * 100.0f;
    }
    
    float humidityScore;
    float optimalHumidity = 40.0f;
    if (humidity >= 38.0f && humidity <= 42.0f) {
        humidityScore = 100.0f;
    } else if (humidity < 38.0f) {
        humidityScore = (humidity / 38.0f) * 100.0f;
    } else {
        humidityScore = 100.0f - ((humidity - 42.0f) / 58.0f) * 100.0f;
    }
    
    float iaq = (gasScore * 0.75f) + (humidityScore * 0.25f);
    iaq = constrain(iaq, 0.0f, 500.0f);
    
    _currentReading.iaqScore = (int)(500.0f - (iaq * 5.0f));
    _currentReading.iaqScore = constrain(_currentReading.iaqScore, 0, 500);
    
    if (_buffer.size() >= 30) {
        _currentReading.iaqAccuracy = 3;
    } else if (_buffer.size() >= 15) {
        _currentReading.iaqAccuracy = 2;
    } else if (_buffer.size() >= 5) {
        _currentReading.iaqAccuracy = 1;
    } else {
        _currentReading.iaqAccuracy = 0;
    }
    
    _currentReading.co2Equivalent = estimateCO2(gasResistance, humidity);
    _currentReading.vocEquivalent = estimateVOC(gasResistance, humidity);
}

float SensorService::estimateCO2(float gasResistance, float humidity) {
    float co2 = 400.0f;
    
    if (gasResistance < _baselineGas) {
        float ratio = gasResistance / _baselineGas;
        co2 = 400.0f + (1.0f - ratio) * 4600.0f;
    }
    
    return constrain(co2, 400.0f, 5000.0f);
}

float SensorService::estimateVOC(float gasResistance, float humidity) {
    float voc = 0.0f;
    
    if (gasResistance < _baselineGas) {
        float ratio = gasResistance / _baselineGas;
        voc = (1.0f - ratio) * 25.0f;
    }
    
    return constrain(voc, 0.0f, 25.0f);
}
