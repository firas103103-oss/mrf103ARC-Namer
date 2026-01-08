/**
 * 📡 IoT Dashboard - لوحة تحكم أجهزة إنترنت الأشياء
 * عرض بيانات xBio Sentinel والمستشعرات
 */

import React, { useState, useEffect } from 'react';
import {
  Thermometer,
  Droplets,
  Gauge,
  Wind,
  Activity,
  Wifi,
  WifiOff,
  AlertTriangle,
  Settings,
  RefreshCw,
  MapPin,
  Clock,
  Battery,
  Signal,
  Plus,
  MoreVertical,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

interface SensorData {
  temperature: number;
  humidity: number;
  pressure: number;
  gasResistance: number;
  iaq: number;
  iaqAccuracy: number;
  co2Equivalent: number;
  vocEquivalent: number;
  altitude: number;
}

interface Device {
  id: string;
  deviceId: string;
  name: string;
  type: string;
  status: 'online' | 'offline' | 'error' | 'maintenance';
  firmwareVersion: string;
  macAddress: string;
  lastSeen: Date;
  location?: {
    name: string;
    lat: number;
    lng: number;
  };
  sensorData?: SensorData;
  batteryLevel?: number;
  signalStrength?: number;
}

interface Alert {
  id: string;
  deviceId: string;
  type: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Sample Data
// ═══════════════════════════════════════════════════════════════════════════════

const devices: Device[] = [
  {
    id: '1',
    deviceId: 'xbio-001-abc123',
    name: 'xBio Sentinel - مكتب رئيسي',
    type: 'xbio-sentinel',
    status: 'online',
    firmwareVersion: '1.2.0',
    macAddress: 'AA:BB:CC:DD:EE:01',
    lastSeen: new Date(),
    location: { name: 'الرياض - المكتب الرئيسي', lat: 24.7136, lng: 46.6753 },
    sensorData: {
      temperature: 24.5,
      humidity: 45.2,
      pressure: 1013.25,
      gasResistance: 150000,
      iaq: 75,
      iaqAccuracy: 3,
      co2Equivalent: 650,
      vocEquivalent: 0.5,
      altitude: 612,
    },
    batteryLevel: 85,
    signalStrength: 92,
  },
  {
    id: '2',
    deviceId: 'xbio-002-def456',
    name: 'xBio Sentinel - غرفة الاجتماعات',
    type: 'xbio-sentinel',
    status: 'online',
    firmwareVersion: '1.2.0',
    macAddress: 'AA:BB:CC:DD:EE:02',
    lastSeen: new Date(Date.now() - 60000),
    location: { name: 'الرياض - غرفة الاجتماعات', lat: 24.7136, lng: 46.6753 },
    sensorData: {
      temperature: 22.8,
      humidity: 52.1,
      pressure: 1013.15,
      gasResistance: 180000,
      iaq: 45,
      iaqAccuracy: 3,
      co2Equivalent: 520,
      vocEquivalent: 0.3,
      altitude: 612,
    },
    batteryLevel: 92,
    signalStrength: 88,
  },
  {
    id: '3',
    deviceId: 'xbio-003-ghi789',
    name: 'xBio Sentinel - المستودع',
    type: 'xbio-sentinel',
    status: 'offline',
    firmwareVersion: '1.1.5',
    macAddress: 'AA:BB:CC:DD:EE:03',
    lastSeen: new Date(Date.now() - 3600000),
    location: { name: 'الدمام - المستودع', lat: 26.3927, lng: 49.9777 },
    batteryLevel: 12,
    signalStrength: 0,
  },
  {
    id: '4',
    deviceId: 'xbio-004-jkl012',
    name: 'xBio Sentinel - مختبر الاختبار',
    type: 'xbio-sentinel',
    status: 'maintenance',
    firmwareVersion: '1.2.0',
    macAddress: 'AA:BB:CC:DD:EE:04',
    lastSeen: new Date(Date.now() - 1800000),
    location: { name: 'جدة - المختبر', lat: 21.5433, lng: 39.1728 },
    batteryLevel: 100,
    signalStrength: 75,
  },
];

const alerts: Alert[] = [
  {
    id: 'a1',
    deviceId: 'xbio-003-ghi789',
    type: 'battery_low',
    severity: 'warning',
    message: 'مستوى البطارية منخفض (12%)',
    timestamp: new Date(Date.now() - 1800000),
    acknowledged: false,
  },
  {
    id: 'a2',
    deviceId: 'xbio-003-ghi789',
    type: 'device_offline',
    severity: 'error',
    message: 'الجهاز غير متصل منذ ساعة',
    timestamp: new Date(Date.now() - 3600000),
    acknowledged: false,
  },
  {
    id: 'a3',
    deviceId: 'xbio-001-abc123',
    type: 'high_co2',
    severity: 'info',
    message: 'مستوى CO2 مرتفع قليلاً (650 ppm)',
    timestamp: new Date(Date.now() - 7200000),
    acknowledged: true,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════════════════════

const getIAQLabel = (iaq: number): { label: string; color: string } => {
  if (iaq <= 50) return { label: 'ممتاز', color: 'text-success' };
  if (iaq <= 100) return { label: 'جيد', color: 'text-cyan' };
  if (iaq <= 150) return { label: 'متوسط', color: 'text-warning' };
  if (iaq <= 200) return { label: 'ضعيف', color: 'text-orange-500' };
  return { label: 'خطر', color: 'text-error' };
};

const getIAQProgress = (iaq: number): { width: string; gradient: string } => {
  const percentage = Math.min(100, (iaq / 300) * 100);
  let gradient = 'from-green-500 to-emerald-500';
  if (iaq > 50) gradient = 'from-cyan-500 to-teal-500';
  if (iaq > 100) gradient = 'from-yellow-500 to-amber-500';
  if (iaq > 150) gradient = 'from-orange-500 to-red-500';
  if (iaq > 200) gradient = 'from-red-500 to-red-700';
  return { width: `${percentage}%`, gradient };
};

const formatTimeAgo = (date: Date): string => {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'الآن';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  return `منذ ${Math.floor(hours / 24)} يوم`;
};

// ═══════════════════════════════════════════════════════════════════════════════
// Components
// ═══════════════════════════════════════════════════════════════════════════════

const StatusIndicator: React.FC<{ status: Device['status'] }> = ({ status }) => {
  const config = {
    online: { label: 'متصل', class: 'device-status-online', icon: Wifi },
    offline: { label: 'غير متصل', class: 'device-status-offline', icon: WifiOff },
    error: { label: 'خطأ', class: 'device-status-error', icon: AlertTriangle },
    maintenance: { label: 'صيانة', class: 'device-status-maintenance', icon: Settings },
  };

  const { label, class: statusClass, icon: Icon } = config[status];

  return (
    <div className={`device-status ${statusClass}`}>
      <span className="device-status-dot" />
      <Icon className="w-4 h-4" />
      <span className="text-sm">{label}</span>
    </div>
  );
};

const SensorGauge: React.FC<{
  icon: React.ElementType;
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  color?: string;
  trend?: 'up' | 'down' | 'stable';
}> = ({ icon: Icon, label, value, unit, min, max, color = 'primary', trend }) => {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-error' : trend === 'down' ? 'text-success' : 'text-secondary';

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${color}-500/20`}>
          <Icon className={`w-5 h-5 text-${color}-500`} />
        </div>
        {trend && (
          <TrendIcon className={`w-4 h-4 ${trendColor}`} />
        )}
      </div>
      <p className="text-2xl font-bold">
        {value.toFixed(1)}
        <span className="text-sm text-secondary ml-1">{unit}</span>
      </p>
      <p className="text-sm text-secondary mb-2">{label}</p>
      <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-full bg-${color}-500 rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const DeviceCard: React.FC<{ device: Device }> = ({ device }) => {
  const iaqInfo = device.sensorData ? getIAQLabel(device.sensorData.iaq) : null;
  const iaqProgress = device.sensorData ? getIAQProgress(device.sensorData.iaq) : null;

  return (
    <div className="card p-6 hover:border-primary-500/50 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">{device.name}</h3>
          <p className="text-sm text-tertiary">{device.deviceId}</p>
        </div>
        <StatusIndicator status={device.status} />
      </div>

      {/* Location */}
      {device.location && (
        <div className="flex items-center gap-2 text-sm text-secondary mb-4">
          <MapPin className="w-4 h-4" />
          {device.location.name}
        </div>
      )}

      {/* Sensor Data */}
      {device.sensorData && device.status === 'online' && (
        <>
          {/* IAQ Score */}
          <div className="card-glass p-4 rounded-lg mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-secondary">جودة الهواء (IAQ)</span>
              <span className={`font-bold ${iaqInfo?.color}`}>{iaqInfo?.label}</span>
            </div>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold gradient-text">{device.sensorData.iaq}</span>
              <span className="text-sm text-tertiary mb-1">/ 500</span>
            </div>
            <div className="w-full h-2 bg-secondary rounded-full mt-3 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${iaqProgress?.gradient} rounded-full transition-all`}
                style={{ width: iaqProgress?.width }}
              />
            </div>
          </div>

          {/* Sensor Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-secondary/50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-secondary mb-1">
                <Thermometer className="w-4 h-4" />
                <span className="text-xs">الحرارة</span>
              </div>
              <p className="text-xl font-bold">{device.sensorData.temperature.toFixed(1)}°C</p>
            </div>
            <div className="bg-secondary/50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-secondary mb-1">
                <Droplets className="w-4 h-4" />
                <span className="text-xs">الرطوبة</span>
              </div>
              <p className="text-xl font-bold">{device.sensorData.humidity.toFixed(1)}%</p>
            </div>
            <div className="bg-secondary/50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-secondary mb-1">
                <Gauge className="w-4 h-4" />
                <span className="text-xs">الضغط</span>
              </div>
              <p className="text-xl font-bold">{device.sensorData.pressure.toFixed(0)} hPa</p>
            </div>
            <div className="bg-secondary/50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-secondary mb-1">
                <Wind className="w-4 h-4" />
                <span className="text-xs">CO₂</span>
              </div>
              <p className="text-xl font-bold">{device.sensorData.co2Equivalent.toFixed(0)} ppm</p>
            </div>
          </div>
        </>
      )}

      {/* Device Info */}
      <div className="flex items-center justify-between text-sm pt-4 border-t border-surface-divider">
        <div className="flex items-center gap-4">
          {device.batteryLevel !== undefined && (
            <div className="flex items-center gap-1">
              <Battery className={`w-4 h-4 ${device.batteryLevel < 20 ? 'text-error' : 'text-secondary'}`} />
              <span className={device.batteryLevel < 20 ? 'text-error' : 'text-secondary'}>
                {device.batteryLevel}%
              </span>
            </div>
          )}
          {device.signalStrength !== undefined && device.signalStrength > 0 && (
            <div className="flex items-center gap-1">
              <Signal className="w-4 h-4 text-secondary" />
              <span className="text-secondary">{device.signalStrength}%</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 text-tertiary">
          <Clock className="w-4 h-4" />
          <span>{formatTimeAgo(device.lastSeen)}</span>
        </div>
      </div>
    </div>
  );
};

const AlertCard: React.FC<{ alert: Alert }> = ({ alert }) => {
  const severityConfig = {
    info: { class: 'badge-info', bgClass: 'bg-info/10 border-info/30' },
    warning: { class: 'badge-warning', bgClass: 'bg-warning/10 border-warning/30' },
    error: { class: 'badge-error', bgClass: 'bg-error/10 border-error/30' },
    critical: { class: 'badge-error', bgClass: 'bg-error/20 border-error/50' },
  };

  const config = severityConfig[alert.severity];

  return (
    <div className={`p-4 rounded-lg border ${config.bgClass} ${alert.acknowledged ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <AlertTriangle className={`w-5 h-5 mt-0.5 ${alert.severity === 'error' || alert.severity === 'critical' ? 'text-error' : 'text-warning'}`} />
          <div>
            <p className="font-medium">{alert.message}</p>
            <p className="text-sm text-tertiary">{alert.deviceId}</p>
          </div>
        </div>
        <span className="text-xs text-tertiary">{formatTimeAgo(alert.timestamp)}</span>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// Main Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

export const IoTDashboard: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onlineDevices = devices.filter(d => d.status === 'online').length;
  const offlineDevices = devices.filter(d => d.status === 'offline').length;
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged).length;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  return (
    <div className="min-h-screen bg-primary p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold gradient-text">📡 لوحة تحكم IoT</h1>
          <p className="text-secondary mt-1">مراقبة أجهزة xBio Sentinel والمستشعرات</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-secondary">
            <Plus className="w-4 h-4" />
            إضافة جهاز
          </button>
          <button
            onClick={handleRefresh}
            className="btn btn-primary"
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            تحديث
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary-500/20">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-bold">{devices.length}</p>
              <p className="text-sm text-secondary">إجمالي الأجهزة</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-success/20">
              <Wifi className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-3xl font-bold text-success">{onlineDevices}</p>
              <p className="text-sm text-secondary">متصل</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-error/20">
              <WifiOff className="w-6 h-6 text-error" />
            </div>
            <div>
              <p className="text-3xl font-bold text-error">{offlineDevices}</p>
              <p className="text-sm text-secondary">غير متصل</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-warning/20">
              <AlertTriangle className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-3xl font-bold text-warning">{unacknowledgedAlerts}</p>
              <p className="text-sm text-secondary">تنبيهات جديدة</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Devices */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            الأجهزة المتصلة
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {devices.map(device => (
              <DeviceCard key={device.id} device={device} />
            ))}
          </div>
        </div>

        {/* Alerts Sidebar */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            التنبيهات الأخيرة
          </h2>
          <div className="space-y-3">
            {alerts.map(alert => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IoTDashboard;
