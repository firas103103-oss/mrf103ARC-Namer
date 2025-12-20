#include "wifi_manager.h"

WiFiManager::WiFiManager() 
    : _ssid(WIFI_SSID)
    , _password(WIFI_PASSWORD)
    , _lastAttempt(0)
    , _reconnectDelay(RECONNECT_INITIAL_DELAY)
    , _attemptCount(0)
    , _connecting(false) {
}

void WiFiManager::begin() {
    WiFi.mode(WIFI_STA);
    WiFi.setAutoReconnect(true);
    
    Serial.println("[WiFi] Initializing...");
    Serial.printf("[WiFi] SSID: %s\n", _ssid);
    
    connect();
}

void WiFiManager::update() {
    if (WiFi.status() == WL_CONNECTED) {
        if (_connecting) {
            _connecting = false;
            _attemptCount = 0;
            _reconnectDelay = RECONNECT_INITIAL_DELAY;
            Serial.println("[WiFi] Connected!");
            Serial.printf("[WiFi] IP: %s\n", WiFi.localIP().toString().c_str());
            Serial.printf("[WiFi] RSSI: %d dBm\n", WiFi.RSSI());
        }
        return;
    }
    
    if (!_connecting) {
        handleDisconnect();
    }
    
    if (_connecting && millis() - _lastAttempt > _reconnectDelay) {
        connect();
    }
}

bool WiFiManager::isConnected() {
    return WiFi.status() == WL_CONNECTED;
}

int WiFiManager::getRSSI() {
    return WiFi.RSSI();
}

String WiFiManager::getIP() {
    return WiFi.localIP().toString();
}

void WiFiManager::setCredentials(const char* ssid, const char* password) {
    _ssid = ssid;
    _password = password;
}

void WiFiManager::connect() {
    _connecting = true;
    _lastAttempt = millis();
    _attemptCount++;
    
    Serial.printf("[WiFi] Connecting (attempt %d)...\n", _attemptCount);
    
    WiFi.disconnect();
    WiFi.begin(_ssid, _password);
    
    _reconnectDelay = calculateBackoff();
}

void WiFiManager::handleDisconnect() {
    Serial.println("[WiFi] Disconnected, will reconnect...");
    _connecting = true;
    _lastAttempt = millis();
}

unsigned long WiFiManager::calculateBackoff() {
    unsigned long delay = RECONNECT_INITIAL_DELAY * (1 << min(_attemptCount, 5));
    return min(delay, (unsigned long)RECONNECT_MAX_DELAY);
}
