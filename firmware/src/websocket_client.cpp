#include "websocket_client.h"

BioSentinelWSClient* BioSentinelWSClient::_instance = nullptr;

BioSentinelWSClient::BioSentinelWSClient()
    : _commandCallback(nullptr)
    , _lastPing(0)
    , _lastReconnect(0)
    , _reconnectDelay(RECONNECT_INITIAL_DELAY)
    , _reconnectAttempts(0)
    , _connected(false)
    , _host(nullptr)
    , _port(443)
    , _path(nullptr)
    , _useSSL(true) {
    _instance = this;
}

void BioSentinelWSClient::begin(const char* host, uint16_t port, const char* path, bool useSSL) {
    _host = host;
    _port = port;
    _path = path;
    _useSSL = useSSL;
    
    Serial.printf("[WS] Connecting to %s://%s:%d%s\n", 
                  useSSL ? "wss" : "ws", host, port, path);
    
    if (useSSL) {
        _ws.beginSSL(host, port, path);
    } else {
        _ws.begin(host, port, path);
    }
    
    _ws.onEvent(webSocketEventHandler);
    _ws.setReconnectInterval(0);
    _ws.enableHeartbeat(HEARTBEAT_INTERVAL, 3000, 2);
    
    _lastReconnect = millis();
}

void BioSentinelWSClient::update() {
    _ws.loop();
    
    if (_connected) {
        if (millis() - _lastPing > HEARTBEAT_INTERVAL) {
            sendPing();
            _lastPing = millis();
        }
    } else {
        attemptReconnect();
    }
}

void BioSentinelWSClient::attemptReconnect() {
    if (millis() - _lastReconnect < _reconnectDelay) {
        return;
    }
    
    _reconnectAttempts++;
    _lastReconnect = millis();
    
    _reconnectDelay = RECONNECT_INITIAL_DELAY * (1 << min(_reconnectAttempts, 5));
    if (_reconnectDelay > RECONNECT_MAX_DELAY) {
        _reconnectDelay = RECONNECT_MAX_DELAY;
    }
    
    Serial.printf("[WS] Reconnecting (attempt %d, next in %lums)...\n", 
                  _reconnectAttempts, _reconnectDelay);
    
    if (_useSSL) {
        _ws.beginSSL(_host, _port, _path);
    } else {
        _ws.begin(_host, _port, _path);
    }
}

bool BioSentinelWSClient::isConnected() {
    return _connected;
}

void BioSentinelWSClient::setCommandCallback(CommandCallback callback) {
    _commandCallback = callback;
}

void BioSentinelWSClient::webSocketEventHandler(WStype_t type, uint8_t* payload, size_t length) {
    if (_instance) {
        _instance->handleWebSocketEvent(type, payload, length);
    }
}

void BioSentinelWSClient::handleWebSocketEvent(WStype_t type, uint8_t* payload, size_t length) {
    switch (type) {
        case WStype_DISCONNECTED:
            Serial.println("[WS] Disconnected");
            _connected = false;
            break;
            
        case WStype_CONNECTED:
            Serial.printf("[WS] Connected to %s\n", payload);
            _connected = true;
            _reconnectAttempts = 0;
            _reconnectDelay = RECONNECT_INITIAL_DELAY;
            break;
            
        case WStype_TEXT:
            processMessage((char*)payload);
            break;
            
        case WStype_PING:
            Serial.println("[WS] Ping received");
            break;
            
        case WStype_PONG:
            Serial.println("[WS] Pong received");
            break;
            
        case WStype_ERROR:
            Serial.printf("[WS] Error: %s\n", payload);
            break;
            
        default:
            break;
    }
}

void BioSentinelWSClient::processMessage(const char* message) {
    StaticJsonDocument<2048> doc;
    DeserializationError error = deserializeJson(doc, message);
    
    if (error) {
        Serial.printf("[WS] JSON parse error: %s\n", error.c_str());
        return;
    }
    
    const char* type = doc["type"];
    if (!type) {
        Serial.println("[WS] Message missing 'type' field");
        return;
    }
    
    Serial.printf("[WS] Received command: %s\n", type);
    
    if (_commandCallback && doc.containsKey("payload")) {
        JsonObject payload = doc["payload"];
        _commandCallback(type, payload);
    }
}

void BioSentinelWSClient::sendPing() {
    _ws.sendPing();
}

void BioSentinelWSClient::sendSensorReading(
    float gasResistance,
    float temperature,
    float humidity,
    float pressure,
    int iaqScore,
    int iaqAccuracy,
    float co2Equivalent,
    float vocEquivalent,
    int heaterTemp,
    int heaterDuration,
    const char* mode
) {
    StaticJsonDocument<512> doc;
    doc["type"] = "sensor_reading";
    doc["timestamp"] = millis();
    
    JsonObject payload = doc.createNestedObject("payload");
    payload["device_id"] = DEVICE_ID;
    payload["gas_resistance"] = gasResistance;
    payload["temperature"] = temperature;
    payload["humidity"] = humidity;
    payload["pressure"] = pressure;
    payload["iaq_score"] = iaqScore;
    payload["iaq_accuracy"] = iaqAccuracy;
    payload["co2_equivalent"] = co2Equivalent;
    payload["voc_equivalent"] = vocEquivalent;
    payload["heater_temp"] = heaterTemp;
    payload["heater_duration"] = heaterDuration;
    payload["mode"] = mode;
    
    String output;
    serializeJson(doc, output);
    _ws.sendTXT(output);
}

void BioSentinelWSClient::sendDeviceStatus(
    const char* mode,
    unsigned long uptimeMs,
    int wifiRssi,
    bool sensorHealthy,
    unsigned long lastCalibration,
    const char* heaterProfile,
    uint32_t freeHeap,
    const char** errors,
    int errorCount
) {
    StaticJsonDocument<1024> doc;
    doc["type"] = "device_status";
    doc["timestamp"] = millis();
    
    JsonObject payload = doc.createNestedObject("payload");
    payload["mode"] = mode;
    payload["uptime_ms"] = uptimeMs;
    payload["wifi_rssi"] = wifiRssi;
    payload["sensor_healthy"] = sensorHealthy;
    payload["last_calibration"] = lastCalibration;
    payload["heater_profile"] = heaterProfile;
    payload["firmware_version"] = FIRMWARE_VERSION;
    payload["free_heap"] = freeHeap;
    
    JsonArray errorsArray = payload.createNestedArray("errors");
    for (int i = 0; i < errorCount; i++) {
        errorsArray.add(errors[i]);
    }
    
    String output;
    serializeJson(doc, output);
    _ws.sendTXT(output);
}

void BioSentinelWSClient::sendCaptureComplete(
    const char* captureId,
    uint32_t durationMs,
    int samplesCount,
    float* gasReadings,
    float* tempReadings,
    float* humidityReadings,
    float baselineGas,
    float peakGas,
    float deltaGas,
    float* featureVector,
    const char* heaterProfile,
    bool success,
    const char* error
) {
    DynamicJsonDocument doc(8192);
    doc["type"] = "capture_complete";
    doc["timestamp"] = millis();
    
    JsonObject payload = doc.createNestedObject("payload");
    payload["capture_id"] = captureId;
    payload["device_id"] = DEVICE_ID;
    payload["duration_ms"] = durationMs;
    payload["samples_count"] = samplesCount;
    
    JsonArray gasArray = payload.createNestedArray("gas_readings");
    JsonArray tempArray = payload.createNestedArray("temperature_readings");
    JsonArray humArray = payload.createNestedArray("humidity_readings");
    
    for (int i = 0; i < samplesCount; i++) {
        gasArray.add(gasReadings[i]);
        tempArray.add(tempReadings[i]);
        humArray.add(humidityReadings[i]);
    }
    
    payload["baseline_gas"] = baselineGas;
    payload["peak_gas"] = peakGas;
    payload["delta_gas"] = deltaGas;
    
    JsonArray vectorArray = payload.createNestedArray("feature_vector");
    for (int i = 0; i < FEATURE_VECTOR_SIZE; i++) {
        vectorArray.add(featureVector[i]);
    }
    
    payload["heater_profile"] = heaterProfile;
    payload["success"] = success;
    if (error && strlen(error) > 0) {
        payload["error"] = error;
    }
    
    String output;
    serializeJson(doc, output);
    _ws.sendTXT(output);
}

void BioSentinelWSClient::sendCalibrationComplete(
    bool success,
    float baselineGas,
    uint32_t durationMs,
    const char* error
) {
    StaticJsonDocument<512> doc;
    doc["type"] = "calibration_complete";
    doc["timestamp"] = millis();
    
    JsonObject payload = doc.createNestedObject("payload");
    payload["device_id"] = DEVICE_ID;
    payload["success"] = success;
    payload["baseline_gas"] = baselineGas;
    payload["duration_ms"] = durationMs;
    if (error && strlen(error) > 0) {
        payload["error"] = error;
    }
    
    String output;
    serializeJson(doc, output);
    _ws.sendTXT(output);
}

void BioSentinelWSClient::sendError(const char* errorCode, const char* message, const char* severity, bool recoverable) {
    StaticJsonDocument<512> doc;
    doc["type"] = "error";
    doc["timestamp"] = millis();
    
    JsonObject payload = doc.createNestedObject("payload");
    payload["error_code"] = errorCode;
    payload["message"] = message;
    payload["severity"] = severity;
    payload["recoverable"] = recoverable;
    
    String output;
    serializeJson(doc, output);
    _ws.sendTXT(output);
}
