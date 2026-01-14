/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🔌 WebSocket Handler - Real-time Data Streaming
 * ═══════════════════════════════════════════════════════════════════════════════
 */

#ifndef WEBSOCKET_HANDLER_H
#define WEBSOCKET_HANDLER_H

#include <Arduino.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include "bme688_driver.h"

class XBioWebSocket {
public:
  XBioWebSocket() : _connected(false), _initialized(false) {}
  
  void begin(const char* host, int port = 443, const char* path = "/ws/xbio") {
    _ws.beginSSL(host, port, path);
    _ws.onEvent([this](WStype_t type, uint8_t* payload, size_t length) {
      handleEvent(type, payload, length);
    });
    _ws.setReconnectInterval(5000);
    _initialized = true;
  }
  
  void loop() { if (_initialized) _ws.loop(); }
  bool isConnected() { return _connected; }
  
  void broadcastSensorData(SensorData data) {
    if (!_connected) return;
    JsonDocument doc;
    doc["type"] = "sensor_data";
    doc["t"] = data.temperature;
    doc["h"] = data.humidity;
    doc["p"] = data.pressure;
    doc["g"] = data.gasResistance;
    doc["q"] = data.iaq;
    char buffer[256];
    serializeJson(doc, buffer);
    _ws.sendTXT(buffer);
  }
  
private:
  WebSocketsClient _ws;
  bool _connected;
  bool _initialized;
  
  void handleEvent(WStype_t type, uint8_t* payload, size_t length) {
    switch (type) {
      case WStype_CONNECTED: _connected = true; Serial.println("WS: Connected"); break;
      case WStype_DISCONNECTED: _connected = false; Serial.println("WS: Disconnected"); break;
      case WStype_TEXT: handleMessage((char*)payload); break;
      default: break;
    }
  }
  
  void handleMessage(char* payload) {
    JsonDocument doc;
    if (deserializeJson(doc, payload) == DeserializationError::Ok) {
      String type = doc["type"] | "";
      Serial.printf("WS: Received %s\n", type.c_str());
    }
  }
};

#endif
