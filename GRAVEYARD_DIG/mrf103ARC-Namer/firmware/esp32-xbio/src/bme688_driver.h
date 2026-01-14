/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🌡️ BME688 Driver - Advanced Environmental Sensor Driver
 * Supports Temperature, Humidity, Pressure, Gas Resistance, and IAQ
 * ═══════════════════════════════════════════════════════════════════════════════
 */

#ifndef BME688_DRIVER_H
#define BME688_DRIVER_H

#include <Arduino.h>
#include <Wire.h>

// BSEC Library for IAQ calculations
#ifdef USE_BSEC
  #include <bsec.h>
#endif

// Default I2C Address
#ifndef BME688_I2C_ADDR
  #define BME688_I2C_ADDR 0x77
#endif

// BME688 Registers
#define BME688_REG_CHIP_ID      0xD0
#define BME688_REG_RESET        0xE0
#define BME688_REG_CTRL_HUM     0x72
#define BME688_REG_CTRL_MEAS    0x74
#define BME688_REG_CONFIG       0x75
#define BME688_REG_CTRL_GAS_0   0x70
#define BME688_REG_CTRL_GAS_1   0x71
#define BME688_REG_GAS_WAIT_0   0x64
#define BME688_REG_RES_HEAT_0   0x5A
#define BME688_REG_DATA_START   0x1D

// Chip ID
#define BME688_CHIP_ID          0x61

// Oversampling settings
#define BME688_OS_NONE          0x00
#define BME688_OS_1X            0x01
#define BME688_OS_2X            0x02
#define BME688_OS_4X            0x03
#define BME688_OS_8X            0x04
#define BME688_OS_16X           0x05

// Filter settings
#define BME688_FILTER_OFF       0x00
#define BME688_FILTER_2         0x01
#define BME688_FILTER_4         0x02
#define BME688_FILTER_8         0x03
#define BME688_FILTER_16        0x04
#define BME688_FILTER_32        0x05
#define BME688_FILTER_64        0x06
#define BME688_FILTER_128       0x07

// Mode settings
#define BME688_MODE_SLEEP       0x00
#define BME688_MODE_FORCED      0x01

// ═══════════════════════════════════════════════════════════════════════════════
// Sensor Data Structure
// ═══════════════════════════════════════════════════════════════════════════════
struct SensorData {
  float temperature;        // °C
  float humidity;           // %RH
  float pressure;           // hPa
  float gasResistance;      // Ohms
  uint16_t iaq;             // Indoor Air Quality (0-500)
  uint8_t iaqAccuracy;      // 0=stabilizing, 1=uncertain, 2=calibrating, 3=calibrated
  float co2Equivalent;      // ppm
  float vocEquivalent;      // ppm
  uint32_t timestamp;       // millis()
  bool valid;               // Data validity flag
};

// ═══════════════════════════════════════════════════════════════════════════════
// Calibration Data Structure
// ═══════════════════════════════════════════════════════════════════════════════
struct BME688CalibData {
  // Temperature calibration
  uint16_t par_t1;
  int16_t par_t2;
  int8_t par_t3;
  
  // Pressure calibration
  uint16_t par_p1;
  int16_t par_p2;
  int8_t par_p3;
  int16_t par_p4;
  int16_t par_p5;
  int8_t par_p6;
  int8_t par_p7;
  int16_t par_p8;
  int16_t par_p9;
  uint8_t par_p10;
  
  // Humidity calibration
  uint16_t par_h1;
  uint16_t par_h2;
  int8_t par_h3;
  int8_t par_h4;
  int8_t par_h5;
  uint8_t par_h6;
  int8_t par_h7;
  
  // Gas calibration
  int8_t par_g1;
  int16_t par_g2;
  int8_t par_g3;
  uint8_t res_heat_range;
  int8_t res_heat_val;
  int8_t range_sw_err;
  
  // Calculated values
  float t_fine;
};

// ═══════════════════════════════════════════════════════════════════════════════
// BME688 Driver Class
// ═══════════════════════════════════════════════════════════════════════════════
class BME688Driver {
public:
  BME688Driver();
  
  /**
   * Initialize the sensor
   * @param address I2C address (default 0x77)
   * @return true if successful
   */
  bool begin(uint8_t address = BME688_I2C_ADDR);
  
  /**
   * Check if sensor is ready for reading
   */
  bool isReady();
  
  /**
   * Check if sensor is calibrated for IAQ
   */
  bool isCalibrated();
  
  /**
   * Read all sensor data
   * @return SensorData structure with all readings
   */
  SensorData read();
  
  /**
   * Read individual values
   */
  float readTemperature();
  float readHumidity();
  float readPressure();
  float readGasResistance();
  uint16_t readIAQ();
  
  /**
   * Set calibration offsets
   */
  void setTemperatureOffset(float offset);
  void setHumidityOffset(float offset);
  void setPressureOffset(float offset);
  
  /**
   * Force recalibration
   */
  void forceCalibration();
  
  /**
   * Configure sensor parameters
   */
  void setOversampling(uint8_t temp, uint8_t humidity, uint8_t pressure);
  void setFilter(uint8_t filter);
  void setGasHeater(uint16_t targetTemp, uint16_t duration);
  
  /**
   * Power management
   */
  void sleep();
  void wake();
  
  /**
   * Get calibration state for BSEC
   */
  uint8_t* getBsecState(size_t* length);
  void setBsecState(uint8_t* state, size_t length);

private:
  uint8_t _address;
  bool _initialized;
  bool _calibrated;
  uint32_t _calibrationStartTime;
  
  // Calibration data
  BME688CalibData _calibData;
  
  // Offsets
  float _tempOffset;
  float _humidityOffset;
  float _pressureOffset;
  
  // Last readings
  SensorData _lastData;
  
  // Gas heater settings
  uint16_t _gasHeaterTemp;
  uint16_t _gasHeaterDuration;
  
  // BSEC instance (if available)
  #ifdef USE_BSEC
    Bsec _bsec;
  #endif
  
  // I2C helpers
  bool writeRegister(uint8_t reg, uint8_t value);
  uint8_t readRegister(uint8_t reg);
  bool readRegisters(uint8_t reg, uint8_t* buffer, size_t length);
  
  // Calibration
  void readCalibrationData();
  
  // Compensation calculations
  float compensateTemperature(uint32_t raw);
  float compensateHumidity(uint32_t raw);
  float compensatePressure(uint32_t raw);
  float compensateGas(uint32_t raw, uint8_t gasRange);
  
  // Gas heater calculations
  uint8_t calculateHeaterResistance(uint16_t targetTemp);
  uint8_t calculateHeaterDuration(uint16_t duration);
  
  // IAQ calculation (simplified, without BSEC)
  uint16_t calculateIAQ(float gasResistance, float humidity);
};

// ═══════════════════════════════════════════════════════════════════════════════
// Implementation
// ═══════════════════════════════════════════════════════════════════════════════

BME688Driver::BME688Driver() {
  _address = BME688_I2C_ADDR;
  _initialized = false;
  _calibrated = false;
  _calibrationStartTime = 0;
  _tempOffset = 0.0;
  _humidityOffset = 0.0;
  _pressureOffset = 0.0;
  _gasHeaterTemp = 320;
  _gasHeaterDuration = 150;
}

bool BME688Driver::begin(uint8_t address) {
  _address = address;
  
  // Check chip ID
  uint8_t chipId = readRegister(BME688_REG_CHIP_ID);
  if (chipId != BME688_CHIP_ID) {
    Serial.printf("BME688: Invalid chip ID 0x%02X (expected 0x%02X)\n", chipId, BME688_CHIP_ID);
    return false;
  }
  
  // Soft reset
  writeRegister(BME688_REG_RESET, 0xB6);
  delay(10);
  
  // Read calibration data
  readCalibrationData();
  
  // Configure oversampling (2x for all)
  setOversampling(BME688_OS_2X, BME688_OS_2X, BME688_OS_2X);
  
  // Configure filter (coefficient 4)
  setFilter(BME688_FILTER_4);
  
  // Configure gas heater
  setGasHeater(_gasHeaterTemp, _gasHeaterDuration);
  
  // Enable gas measurement
  writeRegister(BME688_REG_CTRL_GAS_1, 0x10);
  
  _initialized = true;
  _calibrationStartTime = millis();
  
  #ifdef USE_BSEC
    // Initialize BSEC library
    _bsec.begin(BME68X_I2C_INTF, Wire);
    
    // Configure BSEC subscriptions
    bsec_virtual_sensor_t sensorList[] = {
      BSEC_OUTPUT_IAQ,
      BSEC_OUTPUT_STATIC_IAQ,
      BSEC_OUTPUT_CO2_EQUIVALENT,
      BSEC_OUTPUT_BREATH_VOC_EQUIVALENT,
      BSEC_OUTPUT_SENSOR_HEAT_COMPENSATED_TEMPERATURE,
      BSEC_OUTPUT_SENSOR_HEAT_COMPENSATED_HUMIDITY
    };
    
    _bsec.updateSubscription(sensorList, sizeof(sensorList) / sizeof(sensorList[0]), BSEC_SAMPLE_RATE_LP);
  #endif
  
  Serial.printf("BME688: Initialized at address 0x%02X\n", _address);
  return true;
}

bool BME688Driver::isReady() {
  return _initialized;
}

bool BME688Driver::isCalibrated() {
  if (_calibrated) return true;
  
  // Check if calibration time has passed (5 minutes for BSEC)
  if (millis() - _calibrationStartTime > 300000) {
    _calibrated = true;
    return true;
  }
  
  #ifdef USE_BSEC
    // Check BSEC accuracy
    if (_bsec.iaqAccuracy >= 3) {
      _calibrated = true;
      return true;
    }
  #endif
  
  return false;
}

SensorData BME688Driver::read() {
  SensorData data;
  data.timestamp = millis();
  data.valid = false;
  
  if (!_initialized) return data;
  
  #ifdef USE_BSEC
    // Use BSEC for enhanced readings
    if (_bsec.run()) {
      data.temperature = _bsec.temperature + _tempOffset;
      data.humidity = _bsec.humidity + _humidityOffset;
      data.pressure = _bsec.pressure / 100.0 + _pressureOffset;
      data.gasResistance = _bsec.gasResistance;
      data.iaq = _bsec.staticIaq;
      data.iaqAccuracy = _bsec.staticIaqAccuracy;
      data.co2Equivalent = _bsec.co2Equivalent;
      data.vocEquivalent = _bsec.breathVocEquivalent;
      data.valid = true;
    }
  #else
    // Manual reading without BSEC
    
    // Trigger measurement
    uint8_t ctrlMeas = readRegister(BME688_REG_CTRL_MEAS);
    writeRegister(BME688_REG_CTRL_MEAS, (ctrlMeas & 0xFC) | BME688_MODE_FORCED);
    
    // Wait for measurement completion
    delay(100);
    
    // Read raw data
    uint8_t rawData[15];
    readRegisters(BME688_REG_DATA_START, rawData, 15);
    
    // Extract and compensate values
    uint32_t rawPressure = ((uint32_t)rawData[2] << 12) | ((uint32_t)rawData[3] << 4) | (rawData[4] >> 4);
    uint32_t rawTemp = ((uint32_t)rawData[5] << 12) | ((uint32_t)rawData[6] << 4) | (rawData[7] >> 4);
    uint32_t rawHumidity = ((uint32_t)rawData[8] << 8) | rawData[9];
    uint32_t rawGas = ((uint32_t)rawData[13] << 2) | (rawData[14] >> 6);
    uint8_t gasRange = rawData[14] & 0x0F;
    
    data.temperature = compensateTemperature(rawTemp) + _tempOffset;
    data.humidity = compensateHumidity(rawHumidity) + _humidityOffset;
    data.pressure = compensatePressure(rawPressure) + _pressureOffset;
    data.gasResistance = compensateGas(rawGas, gasRange);
    data.iaq = calculateIAQ(data.gasResistance, data.humidity);
    data.iaqAccuracy = _calibrated ? 3 : 1;
    data.co2Equivalent = 400 + (data.iaq * 4); // Simplified estimation
    data.vocEquivalent = data.iaq * 0.01;
    data.valid = true;
  #endif
  
  _lastData = data;
  return data;
}

float BME688Driver::compensateTemperature(uint32_t raw) {
  float var1 = ((float)raw / 16384.0 - (float)_calibData.par_t1 / 1024.0) * (float)_calibData.par_t2;
  float var2 = (((float)raw / 131072.0 - (float)_calibData.par_t1 / 8192.0) *
                ((float)raw / 131072.0 - (float)_calibData.par_t1 / 8192.0)) * 
               ((float)_calibData.par_t3 * 16.0);
  _calibData.t_fine = var1 + var2;
  return _calibData.t_fine / 5120.0;
}

float BME688Driver::compensateHumidity(uint32_t raw) {
  float temp_scaled = _calibData.t_fine / 5120.0;
  
  float var1 = raw - ((float)_calibData.par_h1 * 16.0) - 
               (((float)_calibData.par_h3 / 2.0) * temp_scaled);
  float var2 = var1 * ((float)_calibData.par_h2 / 262144.0) *
               (1.0 + (((float)_calibData.par_h4 / 16384.0) * temp_scaled) +
                (((float)_calibData.par_h5 / 1048576.0) * temp_scaled * temp_scaled));
  float var3 = (float)_calibData.par_h6 / 16384.0;
  float var4 = (float)_calibData.par_h7 / 2097152.0;
  float humidity = var2 + ((var3 + (var4 * temp_scaled)) * var2 * var2);
  
  if (humidity > 100.0) humidity = 100.0;
  if (humidity < 0.0) humidity = 0.0;
  
  return humidity;
}

float BME688Driver::compensatePressure(uint32_t raw) {
  float var1 = (_calibData.t_fine / 2.0) - 64000.0;
  float var2 = var1 * var1 * ((float)_calibData.par_p6 / 131072.0);
  var2 = var2 + (var1 * (float)_calibData.par_p5 * 2.0);
  var2 = (var2 / 4.0) + ((float)_calibData.par_p4 * 65536.0);
  var1 = ((((float)_calibData.par_p3 * var1 * var1) / 16384.0) +
          ((float)_calibData.par_p2 * var1)) / 524288.0;
  var1 = (1.0 + (var1 / 32768.0)) * (float)_calibData.par_p1;
  
  float pressure = 1048576.0 - (float)raw;
  pressure = (pressure - (var2 / 4096.0)) * 6250.0 / var1;
  var1 = ((float)_calibData.par_p9 * pressure * pressure) / 2147483648.0;
  var2 = pressure * ((float)_calibData.par_p8 / 32768.0);
  float var3 = (pressure / 256.0) * (pressure / 256.0) * (pressure / 256.0) *
               (_calibData.par_p10 / 131072.0);
  pressure = pressure + (var1 + var2 + var3 + ((float)_calibData.par_p7 * 128.0)) / 16.0;
  
  return pressure / 100.0; // Convert to hPa
}

float BME688Driver::compensateGas(uint32_t raw, uint8_t gasRange) {
  static const float lookupTable1[16] = {
    1.0, 1.0, 1.0, 1.0, 1.0, 0.99, 1.0, 0.992,
    1.0, 1.0, 0.998, 0.995, 1.0, 0.99, 1.0, 1.0
  };
  static const float lookupTable2[16] = {
    8000000.0, 4000000.0, 2000000.0, 1000000.0,
    499500.4688, 248262.1563, 125000.0, 63004.03906,
    31281.28125, 15625.0, 7812.5, 3906.25,
    1953.125, 976.5625, 488.28125, 244.140625
  };
  
  float var1 = (1340.0 + (5.0 * _calibData.range_sw_err)) * lookupTable1[gasRange];
  float gas_res = var1 * lookupTable2[gasRange] / (raw - 512.0 + var1);
  
  return gas_res;
}

uint16_t BME688Driver::calculateIAQ(float gasResistance, float humidity) {
  // Simplified IAQ calculation without BSEC
  // Gas resistance typically ranges from ~10kΩ (bad air) to ~500kΩ (clean air)
  
  float gasScore;
  float humidityScore;
  
  // Gas resistance score (0-75)
  if (gasResistance > 400000) {
    gasScore = 75;
  } else if (gasResistance < 10000) {
    gasScore = 0;
  } else {
    gasScore = 75 * (log10(gasResistance) - 4.0) / (log10(400000) - 4.0);
  }
  
  // Humidity score (0-25) - optimal is 40% RH
  if (humidity >= 38 && humidity <= 42) {
    humidityScore = 25;
  } else if (humidity < 38) {
    humidityScore = 25 * humidity / 38.0;
  } else {
    humidityScore = 25 * (1 - (humidity - 42) / 58.0);
    if (humidityScore < 0) humidityScore = 0;
  }
  
  // Combined score (0-100), then scale to IAQ (0-500 where lower is better)
  float score = gasScore + humidityScore;
  uint16_t iaq = (uint16_t)((100 - score) * 5);
  
  if (iaq > 500) iaq = 500;
  return iaq;
}

void BME688Driver::readCalibrationData() {
  uint8_t coeff1[25], coeff2[16];
  
  readRegisters(0x8A, coeff1, 25);
  readRegisters(0xE1, coeff2, 16);
  
  // Temperature calibration
  _calibData.par_t1 = (uint16_t)(coeff2[9] << 8 | coeff2[8]);
  _calibData.par_t2 = (int16_t)(coeff1[2] << 8 | coeff1[1]);
  _calibData.par_t3 = (int8_t)coeff1[3];
  
  // Pressure calibration
  _calibData.par_p1 = (uint16_t)(coeff1[6] << 8 | coeff1[5]);
  _calibData.par_p2 = (int16_t)(coeff1[8] << 8 | coeff1[7]);
  _calibData.par_p3 = (int8_t)coeff1[9];
  _calibData.par_p4 = (int16_t)(coeff1[12] << 8 | coeff1[11]);
  _calibData.par_p5 = (int16_t)(coeff1[14] << 8 | coeff1[13]);
  _calibData.par_p6 = (int8_t)coeff1[16];
  _calibData.par_p7 = (int8_t)coeff1[15];
  _calibData.par_p8 = (int16_t)(coeff1[20] << 8 | coeff1[19]);
  _calibData.par_p9 = (int16_t)(coeff1[22] << 8 | coeff1[21]);
  _calibData.par_p10 = coeff1[23];
  
  // Humidity calibration
  _calibData.par_h1 = (uint16_t)((coeff2[2] << 4) | (coeff2[1] & 0x0F));
  _calibData.par_h2 = (uint16_t)((coeff2[0] << 4) | (coeff2[1] >> 4));
  _calibData.par_h3 = (int8_t)coeff2[3];
  _calibData.par_h4 = (int8_t)coeff2[4];
  _calibData.par_h5 = (int8_t)coeff2[5];
  _calibData.par_h6 = coeff2[6];
  _calibData.par_h7 = (int8_t)coeff2[7];
  
  // Gas calibration
  _calibData.par_g1 = (int8_t)coeff2[14];
  _calibData.par_g2 = (int16_t)(coeff2[13] << 8 | coeff2[12]);
  _calibData.par_g3 = (int8_t)coeff2[15];
  
  // Additional gas calibration data
  uint8_t temp;
  temp = readRegister(0x02);
  _calibData.res_heat_range = (temp >> 4) & 0x03;
  temp = readRegister(0x00);
  _calibData.res_heat_val = (int8_t)temp;
  temp = readRegister(0x04);
  _calibData.range_sw_err = ((int8_t)(temp << 4)) >> 4;
}

void BME688Driver::setOversampling(uint8_t temp, uint8_t humidity, uint8_t pressure) {
  // Set humidity oversampling
  writeRegister(BME688_REG_CTRL_HUM, humidity & 0x07);
  
  // Set temperature and pressure oversampling
  uint8_t ctrlMeas = ((temp & 0x07) << 5) | ((pressure & 0x07) << 2);
  writeRegister(BME688_REG_CTRL_MEAS, ctrlMeas);
}

void BME688Driver::setFilter(uint8_t filter) {
  uint8_t config = readRegister(BME688_REG_CONFIG);
  config = (config & 0xE3) | ((filter & 0x07) << 2);
  writeRegister(BME688_REG_CONFIG, config);
}

void BME688Driver::setGasHeater(uint16_t targetTemp, uint16_t duration) {
  _gasHeaterTemp = targetTemp;
  _gasHeaterDuration = duration;
  
  writeRegister(BME688_REG_RES_HEAT_0, calculateHeaterResistance(targetTemp));
  writeRegister(BME688_REG_GAS_WAIT_0, calculateHeaterDuration(duration));
}

uint8_t BME688Driver::calculateHeaterResistance(uint16_t targetTemp) {
  float var1 = ((_calibData.par_g1 / 16.0) + 49.0);
  float var2 = (((_calibData.par_g2 / 32768.0) * 0.0005) + 0.00235);
  float var3 = (_calibData.par_g3 / 1024.0);
  float var4 = var1 * (1.0 + (var2 * (float)targetTemp));
  float var5 = var4 + (var3 * 25.0);
  uint8_t res_heat = (uint8_t)(3.4 * ((var5 * (4.0 / (4.0 + _calibData.res_heat_range)) *
                     (1.0 / (1.0 + (_calibData.res_heat_val * 0.002)))) - 25));
  return res_heat;
}

uint8_t BME688Driver::calculateHeaterDuration(uint16_t duration) {
  uint8_t factor = 0;
  uint8_t durval;
  
  if (duration >= 0xFC0) {
    durval = 0xFF;
  } else {
    while (duration > 0x3F) {
      duration /= 4;
      factor++;
    }
    durval = duration + (factor * 64);
  }
  return durval;
}

void BME688Driver::setTemperatureOffset(float offset) {
  _tempOffset = offset;
}

void BME688Driver::setHumidityOffset(float offset) {
  _humidityOffset = offset;
}

void BME688Driver::setPressureOffset(float offset) {
  _pressureOffset = offset;
}

void BME688Driver::forceCalibration() {
  _calibrated = false;
  _calibrationStartTime = millis();
}

void BME688Driver::sleep() {
  uint8_t ctrlMeas = readRegister(BME688_REG_CTRL_MEAS);
  writeRegister(BME688_REG_CTRL_MEAS, ctrlMeas & 0xFC); // Set mode to sleep
}

void BME688Driver::wake() {
  // Sensor wakes automatically on forced measurement
}

bool BME688Driver::writeRegister(uint8_t reg, uint8_t value) {
  Wire.beginTransmission(_address);
  Wire.write(reg);
  Wire.write(value);
  return Wire.endTransmission() == 0;
}

uint8_t BME688Driver::readRegister(uint8_t reg) {
  Wire.beginTransmission(_address);
  Wire.write(reg);
  Wire.endTransmission();
  Wire.requestFrom(_address, (uint8_t)1);
  return Wire.read();
}

bool BME688Driver::readRegisters(uint8_t reg, uint8_t* buffer, size_t length) {
  Wire.beginTransmission(_address);
  Wire.write(reg);
  if (Wire.endTransmission() != 0) return false;
  
  Wire.requestFrom(_address, (uint8_t)length);
  for (size_t i = 0; i < length && Wire.available(); i++) {
    buffer[i] = Wire.read();
  }
  return true;
}

#endif // BME688_DRIVER_H
