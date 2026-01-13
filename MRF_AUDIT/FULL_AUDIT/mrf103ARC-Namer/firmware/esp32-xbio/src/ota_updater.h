/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📲 OTA Updater - Over-The-Air Firmware Updates
 * ═══════════════════════════════════════════════════════════════════════════════
 */

#ifndef OTA_UPDATER_H
#define OTA_UPDATER_H

#include <Arduino.h>
#include <ArduinoOTA.h>
#include <HTTPUpdate.h>

class XBioOTAUpdater {
public:
  XBioOTAUpdater() : _initialized(false), _updating(false) {}
  
  void begin(const char* hostname) {
    ArduinoOTA.setHostname(hostname);
    ArduinoOTA.setPassword("xbio_ota_2024");
    
    ArduinoOTA.onStart([this]() { 
      _updating = true; 
      Serial.println("OTA: Update started"); 
    });
    ArduinoOTA.onEnd([this]() { 
      _updating = false; 
      Serial.println("OTA: Update complete"); 
    });
    ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
      Serial.printf("OTA: %u%%\r", (progress / (total / 100)));
    });
    ArduinoOTA.onError([this](ota_error_t error) {
      _updating = false;
      Serial.printf("OTA: Error[%u]\n", error);
    });
    
    ArduinoOTA.begin();
    _initialized = true;
  }
  
  void loop() { if (_initialized && !_updating) ArduinoOTA.handle(); }
  
  void startUpdate(String url) {
    if (url.isEmpty()) return;
    Serial.printf("OTA: Starting HTTP update from %s\n", url.c_str());
    
    WiFiClient client;
    t_httpUpdate_return ret = httpUpdate.update(client, url);
    
    switch (ret) {
      case HTTP_UPDATE_FAILED:
        Serial.printf("OTA: HTTP Update failed (%d): %s\n", 
          httpUpdate.getLastError(), httpUpdate.getLastErrorString().c_str());
        break;
      case HTTP_UPDATE_NO_UPDATES:
        Serial.println("OTA: No updates available");
        break;
      case HTTP_UPDATE_OK:
        Serial.println("OTA: Update successful, rebooting...");
        ESP.restart();
        break;
    }
  }
  
  bool isUpdating() { return _updating; }
  
private:
  bool _initialized;
  bool _updating;
};

#endif
