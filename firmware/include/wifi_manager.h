#ifndef WIFI_MANAGER_H
#define WIFI_MANAGER_H

#include <Arduino.h>
#include <WiFi.h>
#include "config.h"

class WiFiManager {
public:
    WiFiManager();
    
    void begin();
    void update();
    bool isConnected();
    int getRSSI();
    String getIP();
    
    void setCredentials(const char* ssid, const char* password);
    
private:
    const char* _ssid;
    const char* _password;
    
    unsigned long _lastAttempt;
    unsigned long _reconnectDelay;
    int _attemptCount;
    bool _connecting;
    
    void connect();
    void handleDisconnect();
    unsigned long calculateBackoff();
};

#endif
