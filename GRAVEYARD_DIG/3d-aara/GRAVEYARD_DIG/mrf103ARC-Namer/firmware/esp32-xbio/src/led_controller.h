/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 💡 LED Controller - Status LED Management
 * ═══════════════════════════════════════════════════════════════════════════════
 */

#ifndef LED_CONTROLLER_H
#define LED_CONTROLLER_H

#include <Arduino.h>

enum class LEDStatus {
  OFF,
  INITIALIZING,
  CALIBRATING,
  READY,
  BUSY,
  WARNING,
  ERROR
};

class LEDController {
public:
  LEDController() : _status(LEDStatus::OFF), _lastBlink(0), _blinkState(false) {}
  
  void begin() {
    pinMode(LED_STATUS_PIN, OUTPUT);
    pinMode(LED_ERROR_PIN, OUTPUT);
    setStatus(LEDStatus::OFF);
  }
  
  void loop() {
    uint32_t now = millis();
    uint32_t interval = getBlinkInterval();
    
    if (interval > 0 && now - _lastBlink >= interval) {
      _lastBlink = now;
      _blinkState = !_blinkState;
      updateLEDs();
    }
  }
  
  void setStatus(LEDStatus status) {
    _status = status;
    updateLEDs();
  }
  
private:
  LEDStatus _status;
  uint32_t _lastBlink;
  bool _blinkState;
  
  uint32_t getBlinkInterval() {
    switch (_status) {
      case LEDStatus::INITIALIZING: return 500;
      case LEDStatus::CALIBRATING: return 250;
      case LEDStatus::BUSY: return 100;
      case LEDStatus::WARNING: return 300;
      case LEDStatus::ERROR: return 150;
      default: return 0;
    }
  }
  
  void updateLEDs() {
    bool statusLED = false, errorLED = false;
    
    switch (_status) {
      case LEDStatus::READY: statusLED = true; break;
      case LEDStatus::ERROR: errorLED = _blinkState; break;
      case LEDStatus::WARNING: errorLED = _blinkState; statusLED = true; break;
      case LEDStatus::INITIALIZING:
      case LEDStatus::CALIBRATING:
      case LEDStatus::BUSY: statusLED = _blinkState; break;
      default: break;
    }
    
    digitalWrite(LED_STATUS_PIN, statusLED);
    digitalWrite(LED_ERROR_PIN, errorLED);
  }
};

#endif
