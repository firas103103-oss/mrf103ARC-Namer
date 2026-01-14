/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📤 MQTT Client - Cloud Communication Handler
 * Supports auto-reconnect, QoS, and secure connections
 * ═══════════════════════════════════════════════════════════════════════════════
 */

#ifndef MQTT_CLIENT_H
#define MQTT_CLIENT_H

#include <Arduino.h>
#include <WiFiClient.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// ═══════════════════════════════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════════════════════════════
#ifndef MQTT_RECONNECT_INTERVAL
  #define MQTT_RECONNECT_INTERVAL 5000
#endif

#ifndef MQTT_KEEPALIVE
  #define MQTT_KEEPALIVE 60
#endif

#ifndef MQTT_BUFFER_SIZE
  #define MQTT_BUFFER_SIZE 1024
#endif

// ═══════════════════════════════════════════════════════════════════════════════
// Callback Type
// ═══════════════════════════════════════════════════════════════════════════════
typedef void (*MQTTMessageCallback)(String topic, JsonDocument& payload);

// ═══════════════════════════════════════════════════════════════════════════════
// XBio MQTT Client Class
// ═══════════════════════════════════════════════════════════════════════════════
class XBioMQTTClient {
public:
  XBioMQTTClient();
  
  /**
   * Initialize MQTT Client
   * @param server MQTT broker address
   * @param port MQTT broker port
   * @param deviceId Device identifier
   * @param useTLS Use secure connection
   */
  void begin(const char* server, int port, const char* deviceId, bool useTLS = false);
  
  /**
   * Set authentication
   */
  void setAuth(const char* username, const char* password);
  
  /**
   * Main loop - call in loop()
   */
  void loop();
  
  /**
   * Connection management
   */
  bool connect();
  void disconnect();
  bool isConnected();
  void reconnect();
  
  /**
   * Publish messages
   */
  bool publish(const char* topic, const char* payload, bool retained = false);
  bool publish(const char* topic, JsonDocument& doc, bool retained = false);
  bool publishSensor(float temp, float humidity, float pressure, int iaq, float gasRes);
  
  /**
   * Subscribe to topics
   */
  bool subscribe(const char* topic, uint8_t qos = 0);
  bool unsubscribe(const char* topic);
  
  /**
   * Set callbacks
   */
  void setCallback(MQTTMessageCallback callback);
  
  /**
   * Get connection info
   */
  String getServer();
  int getPort();
  bool isSecure();

private:
  WiFiClient _wifiClient;
  WiFiClientSecure _wifiClientSecure;
  PubSubClient _mqtt;
  
  char _server[64];
  int _port;
  char _deviceId[32];
  char _username[64];
  char _password[64];
  bool _useTLS;
  bool _initialized;
  uint32_t _lastReconnectAttempt;
  
  MQTTMessageCallback _messageCallback;
  
  String _baseTopic;
  String _cmdTopic;
  String _statusTopic;
  String _dataTopic;
  
  static void mqttCallback(char* topic, byte* payload, unsigned int length);
  static XBioMQTTClient* _instance;
  
  void setupTopics();
  void publishStatus(const char* status);
};

// Static instance pointer for callback
XBioMQTTClient* XBioMQTTClient::_instance = nullptr;

// ═══════════════════════════════════════════════════════════════════════════════
// Implementation
// ═══════════════════════════════════════════════════════════════════════════════

XBioMQTTClient::XBioMQTTClient() : _mqtt(_wifiClient) {
  _port = 1883;
  _useTLS = false;
  _initialized = false;
  _lastReconnectAttempt = 0;
  _messageCallback = nullptr;
  memset(_server, 0, sizeof(_server));
  memset(_deviceId, 0, sizeof(_deviceId));
  memset(_username, 0, sizeof(_username));
  memset(_password, 0, sizeof(_password));
  _instance = this;
}

void XBioMQTTClient::begin(const char* server, int port, const char* deviceId, bool useTLS) {
  strncpy(_server, server, sizeof(_server) - 1);
  _port = port;
  strncpy(_deviceId, deviceId, sizeof(_deviceId) - 1);
  _useTLS = useTLS;
  
  // Setup client based on TLS
  if (_useTLS) {
    _wifiClientSecure.setInsecure(); // Skip certificate validation (for testing)
    _mqtt.setClient(_wifiClientSecure);
  } else {
    _mqtt.setClient(_wifiClient);
  }
  
  _mqtt.setServer(_server, _port);
  _mqtt.setBufferSize(MQTT_BUFFER_SIZE);
  _mqtt.setKeepAlive(MQTT_KEEPALIVE);
  _mqtt.setCallback(mqttCallback);
  
  setupTopics();
  
  _initialized = true;
  Serial.printf("MQTT: Initialized - %s:%d (TLS: %s)\n", _server, _port, _useTLS ? "yes" : "no");
}

void XBioMQTTClient::setAuth(const char* username, const char* password) {
  strncpy(_username, username, sizeof(_username) - 1);
  strncpy(_password, password, sizeof(_password) - 1);
}

void XBioMQTTClient::setupTopics() {
  _baseTopic = "xbio/" + String(_deviceId);
  _cmdTopic = _baseTopic + "/cmd";
  _statusTopic = _baseTopic + "/status";
  _dataTopic = _baseTopic + "/data";
}

void XBioMQTTClient::loop() {
  if (!_initialized) return;
  
  if (!_mqtt.connected()) {
    uint32_t now = millis();
    if (now - _lastReconnectAttempt >= MQTT_RECONNECT_INTERVAL) {
      _lastReconnectAttempt = now;
      reconnect();
    }
  } else {
    _mqtt.loop();
  }
}

bool XBioMQTTClient::connect() {
  if (_mqtt.connected()) return true;
  
  Serial.printf("MQTT: Connecting to %s:%d...\n", _server, _port);
  
  // Build last will message
  String willTopic = _statusTopic;
  String willMessage = "{\"status\":\"offline\",\"device_id\":\"" + String(_deviceId) + "\"}";
  
  bool connected;
  if (strlen(_username) > 0) {
    connected = _mqtt.connect(_deviceId, _username, _password, 
                              willTopic.c_str(), 1, true, willMessage.c_str());
  } else {
    connected = _mqtt.connect(_deviceId, willTopic.c_str(), 1, true, willMessage.c_str());
  }
  
  if (connected) {
    Serial.println("MQTT: Connected!");
    
    // Subscribe to command topic
    _mqtt.subscribe(_cmdTopic.c_str(), 1);
    Serial.printf("MQTT: Subscribed to %s\n", _cmdTopic.c_str());
    
    // Publish online status
    publishStatus("online");
    
    return true;
  } else {
    Serial.printf("MQTT: Connection failed, rc=%d\n", _mqtt.state());
    return false;
  }
}

void XBioMQTTClient::disconnect() {
  if (_mqtt.connected()) {
    publishStatus("offline");
    _mqtt.disconnect();
  }
}

bool XBioMQTTClient::isConnected() {
  return _mqtt.connected();
}

void XBioMQTTClient::reconnect() {
  connect();
}

bool XBioMQTTClient::publish(const char* topic, const char* payload, bool retained) {
  if (!_mqtt.connected()) return false;
  return _mqtt.publish(topic, payload, retained);
}

bool XBioMQTTClient::publish(const char* topic, JsonDocument& doc, bool retained) {
  if (!_mqtt.connected()) return false;
  
  char buffer[MQTT_BUFFER_SIZE];
  size_t len = serializeJson(doc, buffer, sizeof(buffer));
  
  return _mqtt.publish(topic, buffer, retained);
}

bool XBioMQTTClient::publishSensor(float temp, float humidity, float pressure, int iaq, float gasRes) {
  if (!_mqtt.connected()) return false;
  
  JsonDocument doc;
  doc["device_id"] = _deviceId;
  doc["timestamp"] = millis();
  
  JsonObject sensors = doc["sensors"].to<JsonObject>();
  sensors["temperature"] = temp;
  sensors["humidity"] = humidity;
  sensors["pressure"] = pressure;
  sensors["iaq"] = iaq;
  sensors["gas_resistance"] = gasRes;
  
  return publish(_dataTopic.c_str(), doc, false);
}

void XBioMQTTClient::publishStatus(const char* status) {
  JsonDocument doc;
  doc["status"] = status;
  doc["device_id"] = _deviceId;
  doc["timestamp"] = millis();
  doc["uptime"] = millis() / 1000;
  doc["free_heap"] = ESP.getFreeHeap();
  
  publish(_statusTopic.c_str(), doc, true);
}

bool XBioMQTTClient::subscribe(const char* topic, uint8_t qos) {
  if (!_mqtt.connected()) return false;
  return _mqtt.subscribe(topic, qos);
}

bool XBioMQTTClient::unsubscribe(const char* topic) {
  if (!_mqtt.connected()) return false;
  return _mqtt.unsubscribe(topic);
}

void XBioMQTTClient::setCallback(MQTTMessageCallback callback) {
  _messageCallback = callback;
}

void XBioMQTTClient::mqttCallback(char* topic, byte* payload, unsigned int length) {
  if (!_instance || !_instance->_messageCallback) return;
  
  // Parse payload as JSON
  JsonDocument doc;
  DeserializationError error = deserializeJson(doc, payload, length);
  
  if (error) {
    Serial.printf("MQTT: JSON parse error - %s\n", error.c_str());
    return;
  }
  
  _instance->_messageCallback(String(topic), doc);
}

String XBioMQTTClient::getServer() {
  return String(_server);
}

int XBioMQTTClient::getPort() {
  return _port;
}

bool XBioMQTTClient::isSecure() {
  return _useTLS;
}

#endif // MQTT_CLIENT_H
