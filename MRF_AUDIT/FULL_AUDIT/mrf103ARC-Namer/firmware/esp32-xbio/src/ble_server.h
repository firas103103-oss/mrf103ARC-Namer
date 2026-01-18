/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📱 BLE Server - Bluetooth Low Energy Provisioning & Control
 * Supports WiFi provisioning, sensor data streaming, and remote commands
 * ═══════════════════════════════════════════════════════════════════════════════
 */

#ifndef BLE_SERVER_H
#define BLE_SERVER_H

#include <Arduino.h>
#include <NimBLEDevice.h>
#include "bme688_driver.h"

// ═══════════════════════════════════════════════════════════════════════════════
// BLE UUIDs
// ═══════════════════════════════════════════════════════════════════════════════
#define XBIO_SERVICE_UUID           "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define XBIO_SENSOR_CHAR_UUID       "beb5483e-36e1-4688-b7f5-ea07361b26a8"
#define XBIO_CONFIG_CHAR_UUID       "8c1b0a2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d"
#define XBIO_COMMAND_CHAR_UUID      "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d"
#define XBIO_WIFI_CHAR_UUID         "2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d"
#define XBIO_STATUS_CHAR_UUID       "3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d"

// ═══════════════════════════════════════════════════════════════════════════════
// Forward declarations
// ═══════════════════════════════════════════════════════════════════════════════
class XBioBLEServer;

// Callback types
typedef void (*BLEDataCallback)(SensorData data);
typedef void (*BLEConfigCallback)(String config);
typedef void (*BLECommandCallback)(String command);
typedef void (*BLEWiFiCallback)(String ssid, String password);

// ═══════════════════════════════════════════════════════════════════════════════
// BLE Server Callbacks Class
// ═══════════════════════════════════════════════════════════════════════════════
class XBioServerCallbacks : public NimBLEServerCallbacks {
public:
  XBioServerCallbacks(XBioBLEServer* server);
  void onConnect(NimBLEServer* pServer) override;
  void onDisconnect(NimBLEServer* pServer) override;
  
private:
  XBioBLEServer* _server;
};

// ═══════════════════════════════════════════════════════════════════════════════
// Characteristic Callbacks
// ═══════════════════════════════════════════════════════════════════════════════
class ConfigCharCallbacks : public NimBLECharacteristicCallbacks {
public:
  ConfigCharCallbacks(BLEConfigCallback callback);
  void onWrite(NimBLECharacteristic* pChar) override;
  
private:
  BLEConfigCallback _callback;
};

class CommandCharCallbacks : public NimBLECharacteristicCallbacks {
public:
  CommandCharCallbacks(BLECommandCallback callback);
  void onWrite(NimBLECharacteristic* pChar) override;
  
private:
  BLECommandCallback _callback;
};

class WiFiCharCallbacks : public NimBLECharacteristicCallbacks {
public:
  WiFiCharCallbacks(BLEWiFiCallback callback);
  void onWrite(NimBLECharacteristic* pChar) override;
  
private:
  BLEWiFiCallback _callback;
};

// ═══════════════════════════════════════════════════════════════════════════════
// XBio BLE Server Class
// ═══════════════════════════════════════════════════════════════════════════════
class XBioBLEServer {
public:
  XBioBLEServer();
  
  /**
   * Initialize BLE Server
   * @param deviceName Device name for advertising
   */
  void begin(const char* deviceName);
  
  /**
   * Main loop - call in loop()
   */
  void loop();
  
  /**
   * Stop BLE Server
   */
  void stop();
  
  /**
   * Check if client is connected
   */
  bool isConnected();
  uint8_t getConnectedCount();
  
  /**
   * Update sensor data characteristic
   */
  void updateSensorData(SensorData data);
  
  /**
   * Update status characteristic
   */
  void updateStatus(String status);
  
  /**
   * Set callbacks
   */
  void setDataCallback(BLEDataCallback callback);
  void setConfigCallback(BLEConfigCallback callback);
  void setCommandCallback(BLECommandCallback callback);
  void setWiFiCallback(BLEWiFiCallback callback);
  
  /**
   * Connection state change (called by callback)
   */
  void onClientConnect();
  void onClientDisconnect();

private:
  NimBLEServer* _server;
  NimBLEService* _service;
  NimBLECharacteristic* _sensorChar;
  NimBLECharacteristic* _configChar;
  NimBLECharacteristic* _commandChar;
  NimBLECharacteristic* _wifiChar;
  NimBLECharacteristic* _statusChar;
  NimBLEAdvertising* _advertising;
  
  char _deviceName[32];
  bool _initialized;
  uint8_t _connectedClients;
  
  BLEDataCallback _dataCallback;
  BLEConfigCallback _configCallback;
  BLECommandCallback _commandCallback;
  BLEWiFiCallback _wifiCallback;
  
  XBioServerCallbacks* _serverCallbacks;
  ConfigCharCallbacks* _configCharCallbacks;
  CommandCharCallbacks* _commandCharCallbacks;
  WiFiCharCallbacks* _wifiCharCallbacks;
  
  void createService();
  void startAdvertising();
  String sensorDataToJson(SensorData data);
};

// ═══════════════════════════════════════════════════════════════════════════════
// Implementation - Server Callbacks
// ═══════════════════════════════════════════════════════════════════════════════

XBioServerCallbacks::XBioServerCallbacks(XBioBLEServer* server) : _server(server) {}

void XBioServerCallbacks::onConnect(NimBLEServer* pServer) {
  _server->onClientConnect();
}

void XBioServerCallbacks::onDisconnect(NimBLEServer* pServer) {
  _server->onClientDisconnect();
}

// ═══════════════════════════════════════════════════════════════════════════════
// Implementation - Characteristic Callbacks
// ═══════════════════════════════════════════════════════════════════════════════

ConfigCharCallbacks::ConfigCharCallbacks(BLEConfigCallback callback) : _callback(callback) {}

void ConfigCharCallbacks::onWrite(NimBLECharacteristic* pChar) {
  if (_callback) {
    _callback(pChar->getValue().c_str());
  }
}

CommandCharCallbacks::CommandCharCallbacks(BLECommandCallback callback) : _callback(callback) {}

void CommandCharCallbacks::onWrite(NimBLECharacteristic* pChar) {
  if (_callback) {
    _callback(pChar->getValue().c_str());
  }
}

WiFiCharCallbacks::WiFiCharCallbacks(BLEWiFiCallback callback) : _callback(callback) {}

void WiFiCharCallbacks::onWrite(NimBLECharacteristic* pChar) {
  if (_callback) {
    String value = pChar->getValue().c_str();
    // Expected format: "ssid|password"
    int separatorIndex = value.indexOf('|');
    if (separatorIndex > 0) {
      String ssid = value.substring(0, separatorIndex);
      String password = value.substring(separatorIndex + 1);
      _callback(ssid, password);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Implementation - XBio BLE Server
// ═══════════════════════════════════════════════════════════════════════════════

XBioBLEServer::XBioBLEServer() {
  _server = nullptr;
  _service = nullptr;
  _sensorChar = nullptr;
  _configChar = nullptr;
  _commandChar = nullptr;
  _wifiChar = nullptr;
  _statusChar = nullptr;
  _advertising = nullptr;
  _initialized = false;
  _connectedClients = 0;
  _dataCallback = nullptr;
  _configCallback = nullptr;
  _commandCallback = nullptr;
  _wifiCallback = nullptr;
  _serverCallbacks = nullptr;
  _configCharCallbacks = nullptr;
  _commandCharCallbacks = nullptr;
  _wifiCharCallbacks = nullptr;
}

void XBioBLEServer::begin(const char* deviceName) {
  strncpy(_deviceName, deviceName, sizeof(_deviceName) - 1);
  
  Serial.printf("BLE: Initializing as %s\n", _deviceName);
  
  // Initialize BLE Device
  NimBLEDevice::init(_deviceName);
  
  // Set power level
  NimBLEDevice::setPower(ESP_PWR_LVL_P9); // +9dBm
  
  // Create server
  _server = NimBLEDevice::createServer();
  _serverCallbacks = new XBioServerCallbacks(this);
  _server->setCallbacks(_serverCallbacks);
  
  // Create service and characteristics
  createService();
  
  // Start advertising
  startAdvertising();
  
  _initialized = true;
  Serial.println("BLE: Server started");
}

void XBioBLEServer::createService() {
  // Create service
  _service = _server->createService(XBIO_SERVICE_UUID);
  
  // Sensor Data Characteristic (Read, Notify)
  _sensorChar = _service->createCharacteristic(
    XBIO_SENSOR_CHAR_UUID,
    NIMBLE_PROPERTY::READ | NIMBLE_PROPERTY::NOTIFY
  );
  _sensorChar->setValue("{}");
  
  // Config Characteristic (Read, Write)
  _configChar = _service->createCharacteristic(
    XBIO_CONFIG_CHAR_UUID,
    NIMBLE_PROPERTY::READ | NIMBLE_PROPERTY::WRITE
  );
  _configCharCallbacks = new ConfigCharCallbacks(_configCallback);
  _configChar->setCallbacks(_configCharCallbacks);
  
  // Command Characteristic (Write)
  _commandChar = _service->createCharacteristic(
    XBIO_COMMAND_CHAR_UUID,
    NIMBLE_PROPERTY::WRITE
  );
  _commandCharCallbacks = new CommandCharCallbacks(_commandCallback);
  _commandChar->setCallbacks(_commandCharCallbacks);
  
  // WiFi Characteristic (Write)
  _wifiChar = _service->createCharacteristic(
    XBIO_WIFI_CHAR_UUID,
    NIMBLE_PROPERTY::WRITE
  );
  _wifiCharCallbacks = new WiFiCharCallbacks(_wifiCallback);
  _wifiChar->setCallbacks(_wifiCharCallbacks);
  
  // Status Characteristic (Read, Notify)
  _statusChar = _service->createCharacteristic(
    XBIO_STATUS_CHAR_UUID,
    NIMBLE_PROPERTY::READ | NIMBLE_PROPERTY::NOTIFY
  );
  _statusChar->setValue("ready");
  
  // Start service
  _service->start();
}

void XBioBLEServer::startAdvertising() {
  _advertising = NimBLEDevice::getAdvertising();
  _advertising->addServiceUUID(XBIO_SERVICE_UUID);
  _advertising->setScanResponse(true);
  _advertising->setMinPreferred(0x06);
  _advertising->setMinPreferred(0x12);
  _advertising->start();
}

void XBioBLEServer::loop() {
  // Handle any pending BLE operations
  // NimBLE handles most things internally
}

void XBioBLEServer::stop() {
  if (_advertising) {
    _advertising->stop();
  }
  NimBLEDevice::deinit(true);
  _initialized = false;
}

bool XBioBLEServer::isConnected() {
  return _connectedClients > 0;
}

uint8_t XBioBLEServer::getConnectedCount() {
  return _connectedClients;
}

void XBioBLEServer::updateSensorData(SensorData data) {
  if (!_sensorChar) return;
  
  String json = sensorDataToJson(data);
  _sensorChar->setValue(json);
  
  if (_connectedClients > 0) {
    _sensorChar->notify();
  }
}

void XBioBLEServer::updateStatus(String status) {
  if (!_statusChar) return;
  
  _statusChar->setValue(status);
  
  if (_connectedClients > 0) {
    _statusChar->notify();
  }
}

String XBioBLEServer::sensorDataToJson(SensorData data) {
  // Compact JSON for BLE
  char buffer[256];
  snprintf(buffer, sizeof(buffer),
    "{\"t\":%.1f,\"h\":%.1f,\"p\":%.1f,\"g\":%.0f,\"q\":%d,\"a\":%d,\"c\":%.0f,\"v\":%.2f}",
    data.temperature,
    data.humidity,
    data.pressure,
    data.gasResistance,
    data.iaq,
    data.iaqAccuracy,
    data.co2Equivalent,
    data.vocEquivalent
  );
  return String(buffer);
}

void XBioBLEServer::setDataCallback(BLEDataCallback callback) {
  _dataCallback = callback;
}

void XBioBLEServer::setConfigCallback(BLEConfigCallback callback) {
  _configCallback = callback;
  if (_configCharCallbacks) {
    delete _configCharCallbacks;
  }
  _configCharCallbacks = new ConfigCharCallbacks(callback);
  if (_configChar) {
    _configChar->setCallbacks(_configCharCallbacks);
  }
}

void XBioBLEServer::setCommandCallback(BLECommandCallback callback) {
  _commandCallback = callback;
  if (_commandCharCallbacks) {
    delete _commandCharCallbacks;
  }
  _commandCharCallbacks = new CommandCharCallbacks(callback);
  if (_commandChar) {
    _commandChar->setCallbacks(_commandCharCallbacks);
  }
}

void XBioBLEServer::setWiFiCallback(BLEWiFiCallback callback) {
  _wifiCallback = callback;
  if (_wifiCharCallbacks) {
    delete _wifiCharCallbacks;
  }
  _wifiCharCallbacks = new WiFiCharCallbacks(callback);
  if (_wifiChar) {
    _wifiChar->setCallbacks(_wifiCharCallbacks);
  }
}

void XBioBLEServer::onClientConnect() {
  _connectedClients++;
  Serial.printf("BLE: Client connected (total: %d)\n", _connectedClients);
  
  // Allow more connections
  _advertising->start();
}

void XBioBLEServer::onClientDisconnect() {
  if (_connectedClients > 0) {
    _connectedClients--;
  }
  Serial.printf("BLE: Client disconnected (total: %d)\n", _connectedClients);
  
  // Restart advertising
  _advertising->start();
}

#endif // BLE_SERVER_H
