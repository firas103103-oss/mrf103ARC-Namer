/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🚨 Alert Manager - Threshold Monitoring & Notifications
 * ═══════════════════════════════════════════════════════════════════════════════
 */

#ifndef ALERT_MANAGER_H
#define ALERT_MANAGER_H

#include <Arduino.h>
#include "config_manager.h"

struct Alert {
  String type;
  float value;
  uint32_t timestamp;
  bool acknowledged;
};

class AlertManager {
public:
  AlertManager() : _config(nullptr), _alertCount(0), _cooldownTime(60000) {}
  
  void begin(ConfigManager* config) { _config = config; }
  
  void trigger(const char* type, float value) {
    uint32_t now = millis();
    
    // Check cooldown
    for (int i = 0; i < _alertCount; i++) {
      if (_alerts[i].type == type && now - _alerts[i].timestamp < _cooldownTime) {
        return; // Still in cooldown
      }
    }
    
    // Add new alert
    if (_alertCount < 10) {
      _alerts[_alertCount].type = type;
      _alerts[_alertCount].value = value;
      _alerts[_alertCount].timestamp = now;
      _alerts[_alertCount].acknowledged = false;
      _alertCount++;
      
      Serial.printf("⚠️ ALERT: %s = %.2f\n", type, value);
    }
  }
  
  void acknowledge(const char* type) {
    for (int i = 0; i < _alertCount; i++) {
      if (_alerts[i].type == type) {
        _alerts[i].acknowledged = true;
      }
    }
  }
  
  int getActiveCount() {
    int count = 0;
    for (int i = 0; i < _alertCount; i++) {
      if (!_alerts[i].acknowledged) count++;
    }
    return count;
  }
  
  void setCooldown(uint32_t ms) { _cooldownTime = ms; }
  
private:
  ConfigManager* _config;
  Alert _alerts[10];
  int _alertCount;
  uint32_t _cooldownTime;
};

#endif
