/**
 * 🌐 IoT Service - خدمة إنترنت الأشياء للويب والموبايل
 * 
 * تدير الاتصال مع أجهزة xBio Sentinel عبر MQTT و WebSocket
 * مع دعم التخزين والتحليلات والتنبيهات
 */

import { supabase } from '../supabase';
/* eslint-disable no-undef */
import { EventEmitter } from 'events';
import mqtt, { MqttClient } from 'mqtt';
import WebSocket, { WebSocketServer } from 'ws';
import type { IncomingMessage } from 'http';

// ═══════════════════════════════════════════════════════════════════════════════
// أنواع البيانات
// ═══════════════════════════════════════════════════════════════════════════════

export interface IoTDevice {
  id: string;
  deviceId: string;
  name: string;
  type: 'xbio_sentinel' | 'generic' | 'gateway';
  status: 'online' | 'offline' | 'maintenance' | 'error';
  firmware: string;
  lastSeen: Date;
  location?: {
    latitude: number;
    longitude: number;
    name: string;
  };
  config: DeviceConfig;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeviceConfig {
  mqttTopic: string;
  sampleInterval: number;
  alertThresholds: AlertThresholds;
  calibrationOffsets: CalibrationOffsets;
  features: string[];
}

export interface AlertThresholds {
  temperature: { min: number; max: number };
  humidity: { min: number; max: number };
  iaq: { max: number };
  pressure: { min: number; max: number };
}

export interface CalibrationOffsets {
  temperature: number;
  humidity: number;
  pressure: number;
}

export interface SensorReading {
  id: string;
  deviceId: string;
  temperature: number;
  humidity: number;
  pressure: number;
  gasResistance: number;
  iaq: number;
  iaqAccuracy: number;
  co2Equivalent: number;
  vocEquivalent: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface DeviceAlert {
  id: string;
  deviceId: string;
  type: string;
  severity: 'info' | 'warning' | 'critical';
  value: number;
  threshold: number;
  message: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  createdAt: Date;
}

export interface IoTStats {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  totalReadings24h: number;
  activeAlerts: number;
  averageIAQ: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// IoT Service Class
// ═══════════════════════════════════════════════════════════════════════════════

export class IoTService extends EventEmitter {
  private devices: Map<string, IoTDevice> = new Map();
  private mqttClient: MqttClient | null = null;
  private wsServer: WebSocketServer | null = null;
  private wsClients: Set<WebSocket> = new Set();
  private readingsBuffer: SensorReading[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  private config = {
    mqttBroker: process.env.MQTT_BROKER || 'mqtt://localhost:1883',
    mqttUsername: process.env.MQTT_USERNAME || '',
    mqttPassword: process.env.MQTT_PASSWORD || '',
    wsPort: parseInt(process.env.IOT_WS_PORT || '8081'),
    bufferFlushInterval: 5000,
    healthCheckInterval: 30000,
    offlineThreshold: 120000, // 2 دقائق
  };

  constructor() {
    super();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Initialization
  // ═══════════════════════════════════════════════════════════════════════════

  async initialize(): Promise<void> {
    console.log('🌐 IoTService: Initializing...');

    // تحميل الأجهزة من قاعدة البيانات
    await this.loadDevices();

    // الاتصال بـ MQTT
    await this.connectMQTT();

    // بدء خادم WebSocket
    this.startWebSocketServer();

    // بدء فحص الصحة
    this.startHealthCheck();

    // بدء تفريغ البيانات المؤقتة
    this.startBufferFlush();

    console.log('✅ IoTService: Ready');
    this.emit('ready');
  }

  // تحميل الأجهزة
  private async loadDevices(): Promise<void> {
    try {
      if (!supabase) return;
      const { data, error } = await supabase
        .from('iot_devices')
        .select('*');

      if (error) throw error;

      for (const device of data || []) {
        this.devices.set(device.device_id, this.mapDbDevice(device));
      }

      console.log(`   Loaded ${this.devices.size} devices`);
    } catch (error) {
      console.error('Failed to load devices:', error);
    }
  }

  // تحويل من قاعدة البيانات
  private mapDbDevice(db: any): IoTDevice {
    return {
      id: db.id,
      deviceId: db.device_id,
      name: db.name,
      type: db.type,
      status: db.status,
      firmware: db.firmware || '1.0.0',
      lastSeen: new Date(db.last_seen),
      location: db.location,
      config: db.config || this.getDefaultConfig(),
      metadata: db.metadata || {},
      createdAt: new Date(db.created_at),
      updatedAt: new Date(db.updated_at),
    };
  }

  // الإعدادات الافتراضية
  private getDefaultConfig(): DeviceConfig {
    return {
      mqttTopic: 'xbio/+/data',
      sampleInterval: 1000,
      alertThresholds: {
        temperature: { min: 10, max: 35 },
        humidity: { min: 20, max: 80 },
        iaq: { max: 150 },
        pressure: { min: 950, max: 1050 },
      },
      calibrationOffsets: {
        temperature: 0,
        humidity: 0,
        pressure: 0,
      },
      features: ['temperature', 'humidity', 'pressure', 'iaq', 'gas'],
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MQTT Connection
  // ═══════════════════════════════════════════════════════════════════════════

  private async connectMQTT(): Promise<void> {
    return new Promise((resolve, reject) => {
      const options: mqtt.IClientOptions = {
        clientId: `arc-iot-server-${Date.now()}`,
        clean: true,
        keepalive: 60,
      };

      if (this.config.mqttUsername) {
        options.username = this.config.mqttUsername;
        options.password = this.config.mqttPassword;
      }

      this.mqttClient = mqtt.connect(this.config.mqttBroker, options);

      this.mqttClient.on('connect', () => {
        console.log('   MQTT: Connected');
        
        // الاشتراك في مواضيع xBio
        this.mqttClient!.subscribe('xbio/+/data');
        this.mqttClient!.subscribe('xbio/+/status');
        this.mqttClient!.subscribe('xbio/+/alerts');
        
        resolve();
      });

      this.mqttClient.on('message', (topic: string, message: Buffer) => {
        this.handleMQTTMessage(topic, message);
      });

      this.mqttClient.on('error', (error: Error) => {
        console.error('MQTT Error:', error);
        reject(error);
      });

      this.mqttClient.on('offline', () => {
        console.warn('MQTT: Offline');
      });

      this.mqttClient.on('reconnect', () => {
        console.log('MQTT: Reconnecting...');
      });
    });
  }

  // معالجة رسائل MQTT
  private handleMQTTMessage(topic: string, message: Buffer): void {
    try {
      const parts = topic.split('/');
      if (parts.length < 3 || parts[0] !== 'xbio') return;

      const deviceId = parts[1];
      const messageType = parts[2];
      const payload = JSON.parse(message.toString());

      switch (messageType) {
        case 'data':
          this.handleSensorData(deviceId, payload);
          break;
        case 'status':
          this.handleDeviceStatus(deviceId, payload);
          break;
        case 'alerts':
          this.handleDeviceAlert(deviceId, payload);
          break;
      }
    } catch (error) {
      console.error('Failed to process MQTT message:', error);
    }
  }

  // معالجة بيانات المستشعر
  private async handleSensorData(deviceId: string, payload: any): Promise<void> {
    const sensors = payload.sensors || payload;
    
    const reading: SensorReading = {
      id: `reading_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      deviceId,
      temperature: sensors.temperature || 0,
      humidity: sensors.humidity || 0,
      pressure: sensors.pressure || 0,
      gasResistance: sensors.gas_resistance || 0,
      iaq: sensors.iaq || 0,
      iaqAccuracy: sensors.iaq_accuracy || 0,
      co2Equivalent: sensors.co2_equivalent || 0,
      vocEquivalent: sensors.voc_equivalent || 0,
      timestamp: new Date(),
      metadata: payload.status,
    };

    // إضافة للبيانات المؤقتة
    this.readingsBuffer.push(reading);

    // تحديث آخر ظهور للجهاز
    this.updateDeviceLastSeen(deviceId);

    // التحقق من التنبيهات
    await this.checkAlertThresholds(deviceId, reading);

    // بث للعملاء عبر WebSocket
    this.broadcastToClients({
      type: 'sensor_reading',
      deviceId,
      data: reading,
    });

    this.emit('sensor_reading', reading);
  }

  // معالجة حالة الجهاز
  private async handleDeviceStatus(deviceId: string, payload: any): Promise<void> {
    const status = payload.status === 'online' ? 'online' : 'offline';
    
    let device = this.devices.get(deviceId);
    
    if (!device) {
      // تسجيل جهاز جديد
      device = await this.registerDevice(deviceId, payload.device_name);
    }

    if (device && supabase) {
      device.status = status;
      device.lastSeen = new Date();
      this.devices.set(deviceId, device);

      // تحديث في قاعدة البيانات
      await supabase
        .from('iot_devices')
        .update({
          status,
          last_seen: new Date(),
          metadata: { ...device.metadata, ...payload },
        })
        .eq('device_id', deviceId);

      this.broadcastToClients({
        type: 'device_status',
        deviceId,
        status,
      });

      this.emit('device_status', { deviceId, status });
    }
  }

  // معالجة تنبيه الجهاز
  private async handleDeviceAlert(deviceId: string, payload: any): Promise<void> {
    const alert: DeviceAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      deviceId,
      type: payload.type,
      severity: this.determineSeverity(payload.type, payload.value),
      value: payload.value,
      threshold: payload.threshold || 0,
      message: this.formatAlertMessage(payload.type, payload.value),
      acknowledged: false,
      createdAt: new Date(),
    };

    // حفظ في قاعدة البيانات
    if (supabase) {
      await supabase.from('device_alerts').insert({
        id: alert.id,
        device_id: deviceId,
        type: alert.type,
        severity: alert.severity,
        value: alert.value,
        threshold: alert.threshold,
        message: alert.message,
        acknowledged: false,
        created_at: alert.createdAt,
      });
    }

    this.broadcastToClients({
      type: 'device_alert',
      deviceId,
      alert,
    });

    this.emit('device_alert', alert);
  }

  // التحقق من عتبات التنبيه
  private async checkAlertThresholds(deviceId: string, reading: SensorReading): Promise<void> {
    const device = this.devices.get(deviceId);
    if (!device) return;

    const thresholds = device.config.alertThresholds;

    // درجة الحرارة
    if (reading.temperature > thresholds.temperature.max) {
      await this.handleDeviceAlert(deviceId, {
        type: 'HIGH_TEMPERATURE',
        value: reading.temperature,
        threshold: thresholds.temperature.max,
      });
    } else if (reading.temperature < thresholds.temperature.min) {
      await this.handleDeviceAlert(deviceId, {
        type: 'LOW_TEMPERATURE',
        value: reading.temperature,
        threshold: thresholds.temperature.min,
      });
    }

    // الرطوبة
    if (reading.humidity > thresholds.humidity.max) {
      await this.handleDeviceAlert(deviceId, {
        type: 'HIGH_HUMIDITY',
        value: reading.humidity,
        threshold: thresholds.humidity.max,
      });
    } else if (reading.humidity < thresholds.humidity.min) {
      await this.handleDeviceAlert(deviceId, {
        type: 'LOW_HUMIDITY',
        value: reading.humidity,
        threshold: thresholds.humidity.min,
      });
    }

    // جودة الهواء
    if (reading.iaq > thresholds.iaq.max) {
      await this.handleDeviceAlert(deviceId, {
        type: 'POOR_AIR_QUALITY',
        value: reading.iaq,
        threshold: thresholds.iaq.max,
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // WebSocket Server
  // ═══════════════════════════════════════════════════════════════════════════

  private startWebSocketServer(): void {
    this.wsServer = new WebSocketServer({ port: this.config.wsPort });

    this.wsServer.on('connection', (ws: WebSocket, req: IncomingMessage) => {
      console.log(`   WS: Client connected from ${req.socket.remoteAddress}`);
      this.wsClients.add(ws);

      // إرسال الحالة الحالية
      ws.send(JSON.stringify({
        type: 'init',
        devices: Array.from(this.devices.values()),
      }));

      ws.on('message', (message: Buffer | string) => {
        this.handleWebSocketMessage(ws, message.toString());
      });

      ws.on('close', () => {
        this.wsClients.delete(ws);
        console.log('   WS: Client disconnected');
      });

      ws.on('error', (error: Error) => {
        console.error('WS Error:', error);
        this.wsClients.delete(ws);
      });
    });

    console.log(`   WebSocket: Listening on port ${this.config.wsPort}`);
  }

  // معالجة رسائل WebSocket
  private handleWebSocketMessage(ws: WebSocket, message: string): void {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case 'subscribe':
          // الاشتراك في جهاز معين
          break;
        case 'command':
          // إرسال أمر للجهاز
          this.sendDeviceCommand(data.deviceId, data.command, data.params);
          break;
        case 'get_readings':
          // جلب القراءات التاريخية
          this.sendHistoricalReadings(ws, data.deviceId, data.hours || 24);
          break;
      }
    } catch (error) {
      console.error('Failed to handle WS message:', error);
    }
  }

  // بث للعملاء
  private broadcastToClients(data: any): void {
    const message = JSON.stringify(data);
    for (const client of this.wsClients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Device Management
  // ═══════════════════════════════════════════════════════════════════════════

  // تسجيل جهاز جديد
  async registerDevice(deviceId: string, name?: string): Promise<IoTDevice> {
    const device: IoTDevice = {
      id: `device_${Date.now()}`,
      deviceId,
      name: name || `xBio-${deviceId.substring(0, 6)}`,
      type: 'xbio_sentinel',
      status: 'online',
      firmware: '1.0.0',
      lastSeen: new Date(),
      config: this.getDefaultConfig(),
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.devices.set(deviceId, device);

    // حفظ في قاعدة البيانات
    if (supabase) {
      await supabase.from('iot_devices').insert({
        id: device.id,
        device_id: deviceId,
        name: device.name,
        type: device.type,
        status: device.status,
        firmware: device.firmware,
        last_seen: device.lastSeen,
        config: device.config,
        metadata: device.metadata,
        created_at: device.createdAt,
        updated_at: device.updatedAt,
      });
    }

    this.emit('device_registered', device);
    console.log(`   New device registered: ${deviceId}`);

    return device;
  }

  // تحديث آخر ظهور
  private updateDeviceLastSeen(deviceId: string): void {
    const device = this.devices.get(deviceId);
    if (device) {
      device.lastSeen = new Date();
      device.status = 'online';
      this.devices.set(deviceId, device);
    }
  }

  // إرسال أمر للجهاز
  async sendDeviceCommand(deviceId: string, command: string, params?: any): Promise<boolean> {
    if (!this.mqttClient?.connected) return false;

    const topic = `xbio/${deviceId}/cmd`;
    const payload = JSON.stringify({ command, ...params });

    return new Promise((resolve) => {
      this.mqttClient!.publish(topic, payload, { qos: 1 }, (error) => {
        if (error) {
          console.error('Failed to send command:', error);
          resolve(false);
        } else {
          console.log(`   Command sent to ${deviceId}: ${command}`);
          resolve(true);
        }
      });
    });
  }

  // تحديث إعدادات الجهاز
  async updateDeviceConfig(deviceId: string, config: Partial<DeviceConfig>): Promise<boolean> {
    const device = this.devices.get(deviceId);
    if (!device) return false;

    device.config = { ...device.config, ...config };
    device.updatedAt = new Date();
    this.devices.set(deviceId, device);

    // تحديث في قاعدة البيانات
    if (supabase) {
      await supabase
        .from('iot_devices')
        .update({
          config: device.config,
          updated_at: device.updatedAt,
        })
        .eq('device_id', deviceId);
    }

    // إرسال الإعدادات الجديدة للجهاز
    await this.sendDeviceCommand(deviceId, 'set_config', config);

    return true;
  }

  // جلب القراءات التاريخية
  private async sendHistoricalReadings(ws: WebSocket, deviceId: string, hours: number): Promise<void> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    if (!supabase) {
      ws.send(JSON.stringify({
        type: 'historical_readings',
        deviceId,
        readings: [],
      }));
      return;
    }

    const { data } = await supabase
      .from('sensor_data_stream')
      .select('*')
      .eq('device_id', deviceId)
      .gte('recorded_at', since.toISOString())
      .order('recorded_at', { ascending: true });

    ws.send(JSON.stringify({
      type: 'historical_readings',
      deviceId,
      readings: data || [],
    }));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Background Tasks
  // ═══════════════════════════════════════════════════════════════════════════

  // فحص صحة الأجهزة
  private startHealthCheck(): void {
    this.healthCheckInterval = setInterval(async () => {
      const now = Date.now();

      for (const [deviceId, device] of this.devices) {
        const lastSeenMs = now - device.lastSeen.getTime();

        if (device.status === 'online' && lastSeenMs > this.config.offlineThreshold) {
          device.status = 'offline';
          this.devices.set(deviceId, device);

          if (supabase) {
            await supabase
              .from('iot_devices')
              .update({ status: 'offline' })
              .eq('device_id', deviceId);
          }

          this.broadcastToClients({
            type: 'device_status',
            deviceId,
            status: 'offline',
          });

          this.emit('device_offline', deviceId);
        }
      }
    }, this.config.healthCheckInterval);
  }

  // تفريغ البيانات المؤقتة
  private startBufferFlush(): void {
    this.flushInterval = setInterval(async () => {
      if (this.readingsBuffer.length === 0) return;

      const readings = [...this.readingsBuffer];
      this.readingsBuffer = [];

      try {
        if (!supabase) return;
        await supabase.from('sensor_data_stream').insert(
          readings.map(r => ({
            id: r.id,
            device_id: r.deviceId,
            temperature: r.temperature,
            humidity: r.humidity,
            pressure: r.pressure,
            gas_resistance: r.gasResistance,
            iaq: r.iaq,
            iaq_accuracy: r.iaqAccuracy,
            co2_equivalent: r.co2Equivalent,
            voc_equivalent: r.vocEquivalent,
            recorded_at: r.timestamp,
            metadata: r.metadata,
          }))
        );
      } catch (error) {
        console.error('Failed to flush readings:', error);
        // إعادة البيانات للمؤقت
        this.readingsBuffer.unshift(...readings);
      }
    }, this.config.bufferFlushInterval);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Utility Functions
  // ═══════════════════════════════════════════════════════════════════════════

  private determineSeverity(type: string, value: number): 'info' | 'warning' | 'critical' {
    if (type === 'POOR_AIR_QUALITY' && value > 300) return 'critical';
    if (type.includes('TEMPERATURE') && (value > 40 || value < 5)) return 'critical';
    if (type.includes('HUMIDITY') && (value > 90 || value < 10)) return 'critical';
    return 'warning';
  }

  private formatAlertMessage(type: string, value: number): string {
    const messages: Record<string, string> = {
      HIGH_TEMPERATURE: `درجة الحرارة مرتفعة: ${value.toFixed(1)}°C`,
      LOW_TEMPERATURE: `درجة الحرارة منخفضة: ${value.toFixed(1)}°C`,
      HIGH_HUMIDITY: `الرطوبة مرتفعة: ${value.toFixed(1)}%`,
      LOW_HUMIDITY: `الرطوبة منخفضة: ${value.toFixed(1)}%`,
      POOR_AIR_QUALITY: `جودة الهواء سيئة: IAQ ${value}`,
    };
    return messages[type] || `تنبيه: ${type} = ${value}`;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Public API
  // ═══════════════════════════════════════════════════════════════════════════

  getDevice(deviceId: string): IoTDevice | undefined {
    return this.devices.get(deviceId);
  }

  getAllDevices(): IoTDevice[] {
    return Array.from(this.devices.values());
  }

  async getStats(): Promise<IoTStats> {
    const devices = Array.from(this.devices.values());
    
    if (!supabase) {
      return {
        totalDevices: devices.length,
        onlineDevices: devices.filter(d => d.status === 'online').length,
        offlineDevices: devices.filter(d => d.status === 'offline').length,
        totalReadings24h: 0,
        activeAlerts: 0,
        averageIAQ: 0,
      };
    }
    
    // إحصائيات القراءات
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const { count: totalReadings } = await supabase
      .from('sensor_data_stream')
      .select('*', { count: 'exact', head: true })
      .gte('recorded_at', since24h.toISOString());

    // التنبيهات النشطة
    const { count: activeAlerts } = await supabase
      .from('device_alerts')
      .select('*', { count: 'exact', head: true })
      .eq('acknowledged', false);

    // متوسط IAQ
    const { data: iaqData } = await supabase
      .from('sensor_data_stream')
      .select('iaq')
      .gte('recorded_at', since24h.toISOString())
      .limit(1000);

    const avgIAQ = iaqData?.length
      ? iaqData.reduce((sum, r) => sum + r.iaq, 0) / iaqData.length
      : 0;

    return {
      totalDevices: devices.length,
      onlineDevices: devices.filter(d => d.status === 'online').length,
      offlineDevices: devices.filter(d => d.status === 'offline').length,
      totalReadings24h: totalReadings || 0,
      activeAlerts: activeAlerts || 0,
      averageIAQ: Math.round(avgIAQ),
    };
  }

  // إيقاف الخدمة
  async shutdown(): Promise<void> {
    console.log('🌐 IoTService: Shutting down...');

    if (this.flushInterval) clearInterval(this.flushInterval);
    if (this.healthCheckInterval) clearInterval(this.healthCheckInterval);

    // تفريغ البيانات المتبقية
    if (this.readingsBuffer.length > 0 && supabase) {
      await supabase.from('sensor_data_stream').insert(
        this.readingsBuffer.map(r => ({
          id: r.id,
          device_id: r.deviceId,
          temperature: r.temperature,
          humidity: r.humidity,
          pressure: r.pressure,
          gas_resistance: r.gasResistance,
          iaq: r.iaq,
          recorded_at: r.timestamp,
        }))
      );
    }

    this.mqttClient?.end();
    this.wsServer?.close();

    console.log('✅ IoTService: Shutdown complete');
  }
}

// Singleton instance
export const iotService = new IoTService();
