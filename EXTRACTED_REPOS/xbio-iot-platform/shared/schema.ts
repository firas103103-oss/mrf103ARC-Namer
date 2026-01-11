import { z } from "zod";
import { sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

// ============================================
// IOT & SENSORS (Bio Sentinel)
// ============================================

export const sensorReadings = pgTable(
  "sensor_readings",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    deviceId: varchar("device_id", { length: 100 }).notNull(),
    gasResistance: integer("gas_resistance"),
    temperature: integer("temperature"),
    humidity: integer("humidity"),
    pressure: integer("pressure"),
    iaqScore: integer("iaq_score"),
    co2Equivalent: integer("co2_equivalent"),
    vocEquivalent: integer("voc_equivalent"),
    heaterTemperature: integer("heater_temperature"),
    mode: varchar("mode", { length: 50 }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("idx_sensor_data").on(table.deviceId, table.createdAt),
  ],
);

export const smellProfiles = pgTable("smell_profiles", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }),
  subcategory: varchar("subcategory", { length: 100 }),
  description: text("description"),
  label: varchar("label", { length: 255 }),
  featureVector: jsonb("feature_vector"),
  embeddingText: text("embedding_text"),
  confidence: integer("confidence"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const smellCaptures = pgTable("smell_captures", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  deviceId: varchar("device_id", { length: 100 }).notNull(),
  profileId: varchar("profile_id").references(() => smellProfiles.id),
  durationMs: integer("duration_ms"),
  samplesCount: integer("samples_count"),
  rawData: jsonb("raw_data"),
  featureVector: jsonb("feature_vector"),
  status: varchar("status", { length: 50 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Type exports
export type SensorReading = typeof sensorReadings.$inferSelect;
export type SmellProfile = typeof smellProfiles.$inferSelect;
export type SmellCapture = typeof smellCaptures.$inferSelect;

// Constants
export const SMELL_CATEGORIES = {
  human: ["Body odor", "Breath", "Skin", "Sweat"],
  food: ["Fruits", "Vegetables", "Meat", "Dairy", "Beverages", "Spices"],
  chemical: ["Solvents", "Alcohols", "Acids", "Gases", "Fuels"],
  environmental: ["Smoke", "Mold", "Plants", "Soil", "Water"],
  medical: ["Infections", "Metabolic", "Medications"],
  industrial: ["Manufacturing", "Automotive", "Construction"],
  household: ["Cleaning", "Cooking", "Personal care"],
} as const;

// WebSocket message types
export interface WsDeviceStatus {
  type: "device_status";
  connected: boolean;
  deviceId: string;
  timestamp: number;
  payload: {
    mode: string;
    uptime_ms: number;
    wifi_rssi: number;
    free_heap?: number;
    heater_profile?: string;
    firmware_version?: string;
    last_calibration?: number;
    errors?: string[];
  };
}

export interface WsSensorReading {
  type: "sensor_reading";
  payload: {
    deviceId?: string;
    gas_resistance: number;
    temperature: number;
    humidity: number;
    pressure?: number;
    iaq_score?: number;
    iaq_accuracy?: number;
    co2_equivalent?: number;
    voc_equivalent?: number;
    heater_temp?: number;
    heater_duration?: number;
    mode?: string;
  };
  timestamp: number;
}

export interface WsCaptureComplete {
  type: "capture_complete";
  payload: {
    capture_id: string;
    samples_count: number;
    success: boolean;
    error?: string;
  };
  timestamp: number;
}

export interface WsCalibrationComplete {
  type: "calibration_complete";
  payload: {
    success: boolean;
    baseline_gas?: number;
    error?: string;
  };
  timestamp: number;
}

// Zod validation schemas
export const sensorReadingSchema = z.object({
  deviceId: z.string(),
  gasResistance: z.number(),
  temperature: z.number(),
  humidity: z.number(),
  pressure: z.number().optional(),
  iaqScore: z.number().optional(),
  co2Equivalent: z.number().optional(),
  vocEquivalent: z.number().optional(),
  heaterTemperature: z.number().optional(),
  mode: z.string().optional(),
});

export const smellProfileSchema = z.object({
  name: z.string().min(1),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  description: z.string().optional(),
  label: z.string().optional(),
  featureVector: z.array(z.number()).optional(),
  embeddingText: z.string().optional(),
  confidence: z.number().optional(),
});
