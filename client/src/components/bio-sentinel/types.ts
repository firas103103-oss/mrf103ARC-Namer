/**
 * BioSentinel Types and Constants
 * Shared types for all BioSentinel components
 */

export type ConnectionState = "disconnected" | "connecting" | "connected" | "error" | "reconnecting";

export interface SensorReading {
  gasResistance: number;
  temperature: number;
  humidity: number;
  pressure: number;
  iaqScore: number;
  iaqAccuracy: number;
  co2Equivalent: number;
  vocEquivalent: number;
  heaterTemperature: number;
  heaterDuration: number;
  mode: string;
  timestamp: number;
}

export interface DeviceStatus {
  connectionState: ConnectionState;
  mode: "idle" | "monitoring" | "calibrating" | "capturing" | "error";
  deviceId: string;
  firmwareVersion: string;
  uptime: number;
  wifiRssi: number;
  freeHeap: number;
  heaterProfile: string;
  lastCalibration: number | null;
  errors: string[];
}

export interface CaptureState {
  active: boolean;
  captureId: string | null;
  progress: number;
  samplesCollected: number;
  totalSamples: number;
  startTime: number | null;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface HeaterProfile {
  id: string;
  name: string;
  temp: number;
  duration: number;
  description: string;
}

export interface IaqLevel {
  min: number;
  max: number;
  label: string;
  color: string;
  bg: string;
}

// Constants
export const HEATER_PROFILES: HeaterProfile[] = [
  { id: "low_power", name: "Low Power", temp: 200, duration: 100, description: "Battery saving mode" },
  { id: "balanced", name: "Balanced", temp: 280, duration: 120, description: "General use" },
  { id: "high_sensitivity", name: "High Sensitivity", temp: 320, duration: 150, description: "Best VOC detection" },
  { id: "rapid", name: "Rapid", temp: 350, duration: 80, description: "Fast response" },
];

export const IAQ_LEVELS: IaqLevel[] = [
  { min: 0, max: 50, label: "Excellent", color: "text-green-500", bg: "bg-green-500/20" },
  { min: 51, max: 100, label: "Good", color: "text-emerald-500", bg: "bg-emerald-500/20" },
  { min: 101, max: 150, label: "Moderate", color: "text-yellow-500", bg: "bg-yellow-500/20" },
  { min: 151, max: 200, label: "Poor", color: "text-orange-500", bg: "bg-orange-500/20" },
  { min: 201, max: 300, label: "Unhealthy", color: "text-red-500", bg: "bg-red-500/20" },
  { min: 301, max: 500, label: "Hazardous", color: "text-purple-500", bg: "bg-purple-500/20" },
];

export function getIaqLevel(score: number): IaqLevel {
  return IAQ_LEVELS.find((l) => score >= l.min && score <= l.max) || IAQ_LEVELS[0];
}

export const DEFAULT_DEVICE_STATUS: DeviceStatus = {
  connectionState: "disconnected",
  mode: "idle",
  deviceId: "xbs-esp32-001",
  firmwareVersion: "1.0.0",
  uptime: 0,
  wifiRssi: -50,
  freeHeap: 0,
  heaterProfile: "standard",
  lastCalibration: null,
  errors: [],
};

export const DEFAULT_CAPTURE_STATE: CaptureState = {
  active: false,
  captureId: null,
  progress: 0,
  samplesCollected: 0,
  totalSamples: 30,
  startTime: null,
};
