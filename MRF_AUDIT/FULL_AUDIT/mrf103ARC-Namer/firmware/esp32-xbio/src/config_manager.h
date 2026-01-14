/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ⚙️ Config Manager - Persistent Configuration Storage
 * ═══════════════════════════════════════════════════════════════════════════════
 */

#ifndef CONFIG_MANAGER_H
#define CONFIG_MANAGER_H

#include <Arduino.h>
#include <Preferences.h>

class ConfigManager {
public:
  void begin() { _prefs.begin("xbio", false); }
  void end() { _prefs.end(); }
  void saveState() { /* Save current state to NVS */ }
  
  // Device Identity
  String getDeviceId() { return _prefs.getString("device_id", ""); }
  void setDeviceId(String id) { _prefs.putString("device_id", id); }
  String getDeviceName() { return _prefs.getString("device_name", ""); }
  void setDeviceName(String name) { _prefs.putString("device_name", name); }
  
  // Sensor Offsets
  float getTempOffset() { return _prefs.getFloat("temp_off", 0.0); }
  void setTempOffset(float offset) { _prefs.putFloat("temp_off", offset); }
  float getHumidityOffset() { return _prefs.getFloat("hum_off", 0.0); }
  void setHumidityOffset(float offset) { _prefs.putFloat("hum_off", offset); }
  
  // Thresholds
  float getMaxTemperature() { return _prefs.getFloat("max_temp", 35.0); }
  float getMinTemperature() { return _prefs.getFloat("min_temp", 10.0); }
  float getMaxHumidity() { return _prefs.getFloat("max_hum", 80.0); }
  float getMinHumidity() { return _prefs.getFloat("min_hum", 20.0); }
  int getMaxIAQ() { return _prefs.getInt("max_iaq", 150); }
  
  // MQTT Configuration
  String getMqttServer() { return _prefs.getString("mqtt_srv", ""); }
  int getMqttPort() { return _prefs.getInt("mqtt_port", 1883); }
  void setMqttServer(String server, int port) {
    _prefs.putString("mqtt_srv", server);
    _prefs.putInt("mqtt_port", port);
  }
  
  // WebSocket Configuration
  String getWsServer() { return _prefs.getString("ws_srv", ""); }
  int getWsPort() { return _prefs.getInt("ws_port", 443); }
  
private:
  Preferences _prefs;
};

#endif
