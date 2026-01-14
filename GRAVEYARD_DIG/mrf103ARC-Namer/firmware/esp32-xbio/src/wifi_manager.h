/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📡 WiFi Manager - Smart WiFi Connection Handler
 * Supports Auto-reconnect, AP Mode, and Smart Config
 * ═══════════════════════════════════════════════════════════════════════════════
 */

#ifndef WIFI_MANAGER_H
#define WIFI_MANAGER_H

#include <Arduino.h>
#include <WiFi.h>
#include <Preferences.h>

// ═══════════════════════════════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════════════════════════════
#ifndef WIFI_CONNECT_TIMEOUT
  #define WIFI_CONNECT_TIMEOUT 30000
#endif

#ifndef WIFI_RETRY_INTERVAL
  #define WIFI_RETRY_INTERVAL 5000
#endif

#ifndef WIFI_AP_TIMEOUT
  #define WIFI_AP_TIMEOUT 180000 // 3 minutes
#endif

// ═══════════════════════════════════════════════════════════════════════════════
// Connection State
// ═══════════════════════════════════════════════════════════════════════════════
enum class WiFiState {
  DISCONNECTED,
  CONNECTING,
  CONNECTED,
  AP_MODE,
  ERROR
};

// ═══════════════════════════════════════════════════════════════════════════════
// XBio WiFi Manager Class
// ═══════════════════════════════════════════════════════════════════════════════
class XBioWiFiManager {
public:
  XBioWiFiManager();
  
  /**
   * Initialize WiFi Manager
   * @param hostname Device hostname
   */
  void begin(const char* hostname);
  
  /**
   * Main loop - call in loop()
   */
  void loop();
  
  /**
   * Wait for WiFi connection
   * @param timeout Timeout in milliseconds
   * @return true if connected
   */
  bool waitForConnection(uint32_t timeout = WIFI_CONNECT_TIMEOUT);
  
  /**
   * Check connection status
   */
  bool isConnected();
  WiFiState getState();
  
  /**
   * Get connection info
   */
  String getSSID();
  String getIP();
  int8_t getRSSI();
  
  /**
   * Set credentials
   */
  void setCredentials(const char* ssid, const char* password);
  void clearCredentials();
  
  /**
   * AP Mode
   */
  void startAPMode(const char* apSsid = nullptr, const char* apPassword = nullptr);
  void stopAPMode();
  bool isAPModeActive();
  
  /**
   * Reconnect
   */
  void reconnect();
  void disconnect();
  
  /**
   * Set callbacks
   */
  typedef void (*ConnectionCallback)(bool connected);
  void setConnectionCallback(ConnectionCallback callback);

private:
  char _hostname[32];
  char _ssid[64];
  char _password[64];
  char _apSsid[32];
  char _apPassword[32];
  
  WiFiState _state;
  bool _apModeActive;
  uint32_t _lastConnectionAttempt;
  uint32_t _apModeStartTime;
  uint8_t _connectionRetries;
  
  ConnectionCallback _connectionCallback;
  Preferences _prefs;
  
  void loadCredentials();
  void saveCredentials();
  void handleConnection();
  void handleAPMode();
};

// ═══════════════════════════════════════════════════════════════════════════════
// Implementation
// ═══════════════════════════════════════════════════════════════════════════════

XBioWiFiManager::XBioWiFiManager() {
  _state = WiFiState::DISCONNECTED;
  _apModeActive = false;
  _lastConnectionAttempt = 0;
  _apModeStartTime = 0;
  _connectionRetries = 0;
  _connectionCallback = nullptr;
  memset(_ssid, 0, sizeof(_ssid));
  memset(_password, 0, sizeof(_password));
}

void XBioWiFiManager::begin(const char* hostname) {
  strncpy(_hostname, hostname, sizeof(_hostname) - 1);
  
  // Set hostname
  WiFi.setHostname(_hostname);
  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  
  // Generate AP SSID
  snprintf(_apSsid, sizeof(_apSsid), "%s-Setup", _hostname);
  strcpy(_apPassword, "xbio12345");
  
  // Load saved credentials
  loadCredentials();
  
  if (strlen(_ssid) > 0) {
    Serial.printf("WiFi: Connecting to %s...\n", _ssid);
    WiFi.begin(_ssid, _password);
    _state = WiFiState::CONNECTING;
    _lastConnectionAttempt = millis();
  } else {
    Serial.println("WiFi: No credentials saved, starting AP mode");
    startAPMode();
  }
}

void XBioWiFiManager::loop() {
  if (_apModeActive) {
    handleAPMode();
  } else {
    handleConnection();
  }
}

void XBioWiFiManager::handleConnection() {
  uint32_t now = millis();
  
  switch (_state) {
    case WiFiState::DISCONNECTED:
      if (strlen(_ssid) > 0 && now - _lastConnectionAttempt >= WIFI_RETRY_INTERVAL) {
        Serial.printf("WiFi: Attempting to connect to %s...\n", _ssid);
        WiFi.begin(_ssid, _password);
        _state = WiFiState::CONNECTING;
        _lastConnectionAttempt = now;
        _connectionRetries++;
      }
      break;
      
    case WiFiState::CONNECTING:
      if (WiFi.status() == WL_CONNECTED) {
        _state = WiFiState::CONNECTED;
        _connectionRetries = 0;
        Serial.printf("WiFi: Connected! IP: %s\n", WiFi.localIP().toString().c_str());
        if (_connectionCallback) _connectionCallback(true);
      } else if (now - _lastConnectionAttempt >= WIFI_CONNECT_TIMEOUT) {
        _state = WiFiState::DISCONNECTED;
        Serial.println("WiFi: Connection timeout");
        
        // Start AP mode after multiple failures
        if (_connectionRetries >= 3) {
          Serial.println("WiFi: Multiple failures, starting AP mode");
          startAPMode();
        }
      }
      break;
      
    case WiFiState::CONNECTED:
      if (WiFi.status() != WL_CONNECTED) {
        _state = WiFiState::DISCONNECTED;
        Serial.println("WiFi: Connection lost");
        if (_connectionCallback) _connectionCallback(false);
      }
      break;
      
    default:
      break;
  }
}

void XBioWiFiManager::handleAPMode() {
  // Check for AP timeout
  if (millis() - _apModeStartTime >= WIFI_AP_TIMEOUT) {
    Serial.println("WiFi: AP mode timeout, retrying connection");
    stopAPMode();
    _state = WiFiState::DISCONNECTED;
  }
}

bool XBioWiFiManager::waitForConnection(uint32_t timeout) {
  uint32_t start = millis();
  
  while (millis() - start < timeout) {
    loop();
    if (_state == WiFiState::CONNECTED) {
      return true;
    }
    delay(100);
  }
  
  return false;
}

bool XBioWiFiManager::isConnected() {
  return _state == WiFiState::CONNECTED && WiFi.status() == WL_CONNECTED;
}

WiFiState XBioWiFiManager::getState() {
  return _state;
}

String XBioWiFiManager::getSSID() {
  return String(_ssid);
}

String XBioWiFiManager::getIP() {
  return WiFi.localIP().toString();
}

int8_t XBioWiFiManager::getRSSI() {
  return WiFi.RSSI();
}

void XBioWiFiManager::setCredentials(const char* ssid, const char* password) {
  strncpy(_ssid, ssid, sizeof(_ssid) - 1);
  strncpy(_password, password, sizeof(_password) - 1);
  saveCredentials();
  
  // Reconnect with new credentials
  WiFi.disconnect();
  _state = WiFiState::DISCONNECTED;
  _connectionRetries = 0;
  
  if (_apModeActive) {
    stopAPMode();
  }
}

void XBioWiFiManager::clearCredentials() {
  memset(_ssid, 0, sizeof(_ssid));
  memset(_password, 0, sizeof(_password));
  
  _prefs.begin("wifi", false);
  _prefs.clear();
  _prefs.end();
}

void XBioWiFiManager::startAPMode(const char* apSsid, const char* apPassword) {
  if (apSsid) strncpy(_apSsid, apSsid, sizeof(_apSsid) - 1);
  if (apPassword) strncpy(_apPassword, apPassword, sizeof(_apPassword) - 1);
  
  WiFi.mode(WIFI_AP_STA);
  WiFi.softAP(_apSsid, _apPassword);
  
  _apModeActive = true;
  _apModeStartTime = millis();
  _state = WiFiState::AP_MODE;
  
  Serial.printf("WiFi: AP Mode started\n");
  Serial.printf("   SSID: %s\n", _apSsid);
  Serial.printf("   Password: %s\n", _apPassword);
  Serial.printf("   IP: %s\n", WiFi.softAPIP().toString().c_str());
}

void XBioWiFiManager::stopAPMode() {
  WiFi.softAPdisconnect(true);
  WiFi.mode(WIFI_STA);
  _apModeActive = false;
  Serial.println("WiFi: AP Mode stopped");
}

bool XBioWiFiManager::isAPModeActive() {
  return _apModeActive;
}

void XBioWiFiManager::reconnect() {
  WiFi.disconnect();
  _state = WiFiState::DISCONNECTED;
  _lastConnectionAttempt = 0;
}

void XBioWiFiManager::disconnect() {
  WiFi.disconnect();
  _state = WiFiState::DISCONNECTED;
}

void XBioWiFiManager::setConnectionCallback(ConnectionCallback callback) {
  _connectionCallback = callback;
}

void XBioWiFiManager::loadCredentials() {
  _prefs.begin("wifi", true);
  String ssid = _prefs.getString("ssid", "");
  String password = _prefs.getString("password", "");
  _prefs.end();
  
  if (ssid.length() > 0) {
    strncpy(_ssid, ssid.c_str(), sizeof(_ssid) - 1);
    strncpy(_password, password.c_str(), sizeof(_password) - 1);
    Serial.printf("WiFi: Loaded saved credentials for %s\n", _ssid);
  }
}

void XBioWiFiManager::saveCredentials() {
  _prefs.begin("wifi", false);
  _prefs.putString("ssid", _ssid);
  _prefs.putString("password", _password);
  _prefs.end();
  Serial.printf("WiFi: Saved credentials for %s\n", _ssid);
}

#endif // WIFI_MANAGER_H
