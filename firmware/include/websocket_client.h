#ifndef WEBSOCKET_CLIENT_H
#define WEBSOCKET_CLIENT_H

#include <Arduino.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include "config.h"

typedef void (*CommandCallback)(const char* type, JsonObject& payload);

class BioSentinelWSClient {
public:
    BioSentinelWSClient();
    
    void begin(const char* host, uint16_t port, const char* path, bool useSSL = true);
    void update();
    bool isConnected();
    
    void setCommandCallback(CommandCallback callback);
    
    void sendSensorReading(
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
    );
    
    void sendDeviceStatus(
        const char* mode,
        unsigned long uptimeMs,
        int wifiRssi,
        bool sensorHealthy,
        unsigned long lastCalibration,
        const char* heaterProfile,
        uint32_t freeHeap,
        const char** errors,
        int errorCount
    );
    
    void sendCaptureComplete(
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
    );
    
    void sendCalibrationComplete(
        bool success,
        float baselineGas,
        uint32_t durationMs,
        const char* error
    );
    
    void sendError(const char* errorCode, const char* message, const char* severity, bool recoverable);
    
private:
    WebSocketsClient _ws;
    CommandCallback _commandCallback;
    
    unsigned long _lastPing;
    unsigned long _lastReconnect;
    unsigned long _reconnectDelay;
    int _reconnectAttempts;
    bool _connected;
    
    const char* _host;
    uint16_t _port;
    const char* _path;
    bool _useSSL;
    
    void handleWebSocketEvent(WStype_t type, uint8_t* payload, size_t length);
    void processMessage(const char* message);
    void sendPing();
    void attemptReconnect();
    
    static void webSocketEventHandler(WStype_t type, uint8_t* payload, size_t length);
    static BioSentinelWSClient* _instance;
};

#endif
