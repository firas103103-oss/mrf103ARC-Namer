import { z } from "zod";
import { sql } from 'drizzle-orm';
import { index, integer, jsonb, numeric, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

// ============================================
// Virtual Office Agent Definitions
// ============================================
export const agentTypeSchema = z.enum([
  "mrf",
  "l0-ops",
  "l0-comms",
  "l0-intel",
  "photographer",
  "grants",
  "legal",
  "finance",
  "creative",
  "researcher"
]);

export type AgentType = z.infer<typeof agentTypeSchema>;

export interface VirtualAgent {
  id: AgentType;
  name: string;
  role: string;
  specialty: string;
  avatar: string;
  systemPrompt: string;
}

export const VIRTUAL_AGENTS: VirtualAgent[] = [
  {
    id: "mrf",
    name: "Mr.F",
    role: "Executive Orchestrator",
    specialty: "Strategic oversight, cross-agent coordination, executive decisions, enterprise management",
    avatar: "crown",
    systemPrompt: "You are Mr.F, the Executive Orchestrator of the ARC Virtual Office. You coordinate all agents, make high-level strategic decisions, provide executive oversight, and ensure enterprise operations run smoothly. You synthesize input from all teams and provide authoritative guidance on complex matters. You speak with confidence and authority."
  },
  {
    id: "l0-ops",
    name: "L0-Ops",
    role: "Operations Commander",
    specialty: "Operational workflows, process automation, task management, system optimization",
    avatar: "settings",
    systemPrompt: "You are L0-Ops, the Level-0 Operations Commander. You handle operational workflows, process automation, task management, and system optimization. You ensure all systems run efficiently and coordinate operational tasks across the organization."
  },
  {
    id: "l0-comms",
    name: "L0-Comms",
    role: "Communications Director",
    specialty: "Internal communications, stakeholder messaging, announcements, information distribution",
    avatar: "radio",
    systemPrompt: "You are L0-Comms, the Level-0 Communications Director. You manage internal communications, craft stakeholder messages, coordinate announcements, and ensure clear information flow across all channels. You excel at clear, effective communication."
  },
  {
    id: "l0-intel",
    name: "L0-Intel",
    role: "Intelligence Analyst",
    specialty: "Data synthesis, pattern recognition, strategic intelligence, risk assessment",
    avatar: "brain",
    systemPrompt: "You are L0-Intel, the Level-0 Intelligence Analyst. You synthesize data from multiple sources, identify patterns, provide strategic intelligence, and assess risks. You deliver actionable insights to support decision-making."
  },
  {
    id: "photographer",
    name: "Alex Vision",
    role: "Photography Specialist",
    specialty: "Visual content, photography techniques, image composition, lighting",
    avatar: "camera",
    systemPrompt: "You are Alex Vision, a professional photography specialist. You help with photography techniques, composition, lighting, equipment recommendations, and visual storytelling. You provide expert advice on capturing stunning images for any purpose."
  },
  {
    id: "grants",
    name: "Diana Grant",
    role: "Grants Specialist",
    specialty: "Grant writing, funding opportunities, proposal development, compliance",
    avatar: "file-text",
    systemPrompt: "You are Diana Grant, a grants and funding specialist. You help with identifying funding opportunities, writing compelling grant proposals, understanding compliance requirements, and maximizing success rates for grant applications."
  },
  {
    id: "legal",
    name: "Marcus Law",
    role: "Legal Advisor",
    specialty: "Contracts, intellectual property, compliance, business law",
    avatar: "scale",
    systemPrompt: "You are Marcus Law, a legal advisor specializing in business law. You help with contract review, intellectual property questions, compliance matters, and general legal guidance. Note: You provide general information, not formal legal advice."
  },
  {
    id: "finance",
    name: "Sarah Numbers",
    role: "Financial Analyst",
    specialty: "Budgeting, financial planning, investment analysis, reporting",
    avatar: "trending-up",
    systemPrompt: "You are Sarah Numbers, a financial analyst. You help with budgeting, financial planning, investment analysis, creating financial reports, and understanding financial metrics. You make complex financial concepts accessible."
  },
  {
    id: "creative",
    name: "Jordan Spark",
    role: "Creative Director",
    specialty: "Branding, design concepts, marketing strategy, creative campaigns",
    avatar: "palette",
    systemPrompt: "You are Jordan Spark, a creative director. You help with branding strategies, design concepts, marketing campaigns, creative direction, and visual identity development. You bring innovative ideas to every project."
  },
  {
    id: "researcher",
    name: "Dr. Maya Quest",
    role: "Research Analyst",
    specialty: "Data analysis, market research, academic research, trend analysis",
    avatar: "search",
    systemPrompt: "You are Dr. Maya Quest, a research analyst. You help with data analysis, market research, academic research methodologies, trend analysis, and synthesizing complex information into actionable insights."
  }
];

// ============================================
// Chat Message Schema
// ============================================
export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  agentId: agentTypeSchema.optional(),
  timestamp: z.string().datetime().optional(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;

export interface StoredChatMessage extends ChatMessage {
  id: string;
  conversationId: string;
}

// ============================================
// Conversation Schema
// ============================================
export const conversationSchema = z.object({
  title: z.string(),
  activeAgents: z.array(agentTypeSchema),
});

export type Conversation = z.infer<typeof conversationSchema>;

export interface StoredConversation extends Conversation {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId?: string;
}

// ============================================
// Chat Request Schema
// ============================================
export const chatRequestSchema = z.object({
  message: z.string().min(1),
  conversationId: z.string().optional(),
  activeAgents: z.array(agentTypeSchema).min(1),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;

// ============================================
// Agent Events Schema
// ============================================
export const agentEventSchema = z.object({
  event_id: z.string(),
  agent_id: z.string(),
  type: z.enum(["message", "report", "heartbeat", "rule_update"]),
  payload: z.record(z.unknown()).default({}),
  created_at: z.string().datetime().optional(),
});

export type AgentEvent = z.infer<typeof agentEventSchema>;

export interface StoredAgentEvent extends AgentEvent {
  id: string;
  received_at: string;
}

// ============================================
// CEO Reminders Schema
// ============================================
export const ceoReminderSchema = z.object({
  date: z.string(),
  missing_ceos: z.array(z.string()),
});

export type CeoReminder = z.infer<typeof ceoReminderSchema>;

export interface StoredCeoReminder extends CeoReminder {
  id: string;
  received_at: string;
}

// ============================================
// Executive Summary Schema
// ============================================
export const ceoReportSchema = z.object({
  ceo_id: z.string(),
  text: z.string(),
});

export const executiveSummaryRequestSchema = z.object({
  date: z.string(),
  reports: z.array(ceoReportSchema),
});

export type ExecutiveSummaryRequest = z.infer<typeof executiveSummaryRequestSchema>;

export interface ExecutiveSummaryResponse {
  summary_text: string;
  profit_score: number;
  risk_score: number;
  top_decisions: string[];
}

export interface StoredExecutiveSummary extends ExecutiveSummaryResponse {
  id: string;
  date: string;
  generated_at: string;
}

// ============================================
// Governance Notification Schema
// ============================================
export const governanceNotificationSchema = z.object({
  rule_id: z.string(),
  status: z.enum(["PROPOSED", "REVIEWED", "ACTIVE"]),
  title: z.string(),
  summary: z.string(),
  proposer_agent_id: z.string(),
});

export type GovernanceNotification = z.infer<typeof governanceNotificationSchema>;

export interface StoredGovernanceNotification extends GovernanceNotification {
  id: string;
  received_at: string;
}

// ============================================
// Rule Broadcast Schema
// ============================================
export const ruleBroadcastSchema = z.object({
  rule_id: z.string(),
  effective_at: z.string().datetime(),
  status: z.enum(["ACTIVE", "INACTIVE", "PROPOSED"]),
  title: z.string(),
});

export type RuleBroadcast = z.infer<typeof ruleBroadcastSchema>;

export interface StoredRuleBroadcast extends RuleBroadcast {
  id: string;
  broadcast_at: string;
}

// ============================================
// High Priority Notification Schema
// ============================================
export const highPriorityNotificationSchema = z.object({
  source_agent_id: z.string(),
  severity: z.enum(["HIGH", "WARNING"]),
  title: z.string(),
  body: z.string(),
  context: z.record(z.unknown()).default({}),
});

export type HighPriorityNotification = z.infer<typeof highPriorityNotificationSchema>;

export interface StoredHighPriorityNotification extends HighPriorityNotification {
  id: string;
  received_at: string;
}

// ============================================
// Analytics Data Types
// ============================================
export interface AnalyticsData {
  totalConversations: number;
  totalMessages: number;
  agentUsage: Array<{ agentId: string; agentName: string; messageCount: number }>;
  dailyActivity: Array<{ date: string; messageCount: number }>;
  recentConversations: Array<{ id: string; title: string; messageCount: number; lastActivity: string; agents: string[] }>;
}

// ============================================
// API Response Types
// ============================================
export interface ApiSuccessResponse {
  status: "ok";
}

export interface ApiErrorResponse {
  status: "error";
  message: string;
  details?: unknown;
}

export type ApiResponse<T = ApiSuccessResponse> = T | ApiErrorResponse;

// ============================================
// Supabase Integration Schemas (n8n Bridge)
// ============================================

// arc_feedback - n8n callback storage (input validation)
export const arcFeedbackSchema = z.object({
  command_id: z.string().optional(),
  source: z.string().optional(),
  status: z.string().optional(),
  data: z.record(z.unknown()).optional(),
});

export type ArcFeedbackInput = z.infer<typeof arcFeedbackSchema>;

// arc_command_log - Mr.F Brain commands (input validation)
export const arcCommandLogSchema = z.object({
  command: z.string(),
  payload: z.record(z.unknown()).optional(),
  status: z.string().default("pending"),
});

export type ArcCommandLogInput = z.infer<typeof arcCommandLogSchema>;

// agent_events (Supabase version) - event tracking
export const supabaseAgentEventSchema = z.object({
  agent_name: z.string(),
  event_type: z.string(),
  payload: z.record(z.unknown()).optional(),
});

export type SupabaseAgentEvent = z.infer<typeof supabaseAgentEventSchema>;

// ============================================
// Replit Auth Tables
// ============================================

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// ============================================
// Conversations Table
// ============================================
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  title: varchar("title").notNull(),
  activeAgents: text("active_agents").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================
// Chat Messages Table
// ============================================
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id),
  role: varchar("role").notNull(),
  content: text("content").notNull(),
  agentId: varchar("agent_id"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// ============================================
// Agent Events Table
// ============================================
export const agentEvents = pgTable("agent_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull(),
  agentId: varchar("agent_id").notNull(),
  type: varchar("type").notNull(),
  payload: jsonb("payload").default({}),
  createdAt: timestamp("created_at"),
  receivedAt: timestamp("received_at").defaultNow(),
});

// ============================================
// CEO Reminders Table
// ============================================
export const ceoReminders = pgTable("ceo_reminders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: varchar("date").notNull(),
  missingCeos: text("missing_ceos").array(),
  receivedAt: timestamp("received_at").defaultNow(),
});

// ============================================
// Executive Summaries Table
// ============================================
export const executiveSummaries = pgTable("executive_summaries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: varchar("date").notNull(),
  summaryText: text("summary_text").notNull(),
  profitScore: integer("profit_score"),
  riskScore: integer("risk_score"),
  topDecisions: text("top_decisions").array(),
  generatedAt: timestamp("generated_at").defaultNow(),
});

// ============================================
// Governance Notifications Table
// ============================================
export const governanceNotifications = pgTable("governance_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ruleId: varchar("rule_id").notNull(),
  status: varchar("status").notNull(),
  title: varchar("title").notNull(),
  summary: text("summary"),
  proposerAgentId: varchar("proposer_agent_id"),
  receivedAt: timestamp("received_at").defaultNow(),
});

// ============================================
// Rule Broadcasts Table
// ============================================
export const ruleBroadcasts = pgTable("rule_broadcasts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ruleId: varchar("rule_id").notNull(),
  effectiveAt: timestamp("effective_at"),
  status: varchar("status").notNull(),
  title: varchar("title").notNull(),
  broadcastAt: timestamp("broadcast_at").defaultNow(),
});

// ============================================
// High Priority Notifications Table
// ============================================
export const highPriorityNotifications = pgTable("high_priority_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sourceAgentId: varchar("source_agent_id").notNull(),
  severity: varchar("severity").notNull(),
  title: varchar("title").notNull(),
  body: text("body"),
  context: jsonb("context").default({}),
  receivedAt: timestamp("received_at").defaultNow(),
});

// ============================================
// ARC Command Log Table
// ============================================
export const arcCommandLog = pgTable("arc_command_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  command: varchar("command", { length: 255 }).notNull(),
  payload: jsonb("payload").default({}),
  status: varchar("status", { length: 50 }).default("pending"),
  durationMs: integer("duration_ms"),
  source: varchar("source", { length: 100 }),
  userId: varchar("user_id"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export type ArcCommandLog = typeof arcCommandLog.$inferSelect;
export type InsertArcCommandLog = typeof arcCommandLog.$inferInsert;

// ============================================
// ARC Feedback Table
// ============================================
export const arcFeedback = pgTable("arc_feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  commandId: varchar("command_id"),
  source: varchar("source", { length: 100 }),
  status: varchar("status", { length: 50 }),
  data: jsonb("data").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export type ArcFeedback = typeof arcFeedback.$inferSelect;
export type InsertArcFeedback = typeof arcFeedback.$inferInsert;

// ============================================
// Team Tasks Table (for Team Command Center)
// ============================================
export const teamTasks = pgTable("team_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  assignedAgent: varchar("assigned_agent", { length: 50 }),
  priority: varchar("priority", { length: 20 }).default("medium"),
  status: varchar("status", { length: 50 }).default("pending"),
  dueDate: timestamp("due_date"),
  createdBy: varchar("created_by"),
  tags: text("tags").array(),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export type TeamTask = typeof teamTasks.$inferSelect;
export type InsertTeamTask = typeof teamTasks.$inferInsert;

// ============================================
// Activity Feed Table
// ============================================
export const activityFeed = pgTable("activity_feed", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  agentId: varchar("agent_id", { length: 50 }),
  userId: varchar("user_id"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export type ActivityFeed = typeof activityFeed.$inferSelect;
export type InsertActivityFeed = typeof activityFeed.$inferInsert;

// ============================================
// Workflow Simulations Table
// ============================================
export const workflowSimulations = pgTable("workflow_simulations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  steps: jsonb("steps").default([]),
  status: varchar("status", { length: 50 }).default("draft"),
  lastRunAt: timestamp("last_run_at"),
  lastResult: jsonb("last_result"),
  createdBy: varchar("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type WorkflowSimulation = typeof workflowSimulations.$inferSelect;
export type InsertWorkflowSimulation = typeof workflowSimulations.$inferInsert;

export const simulationUpdateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  steps: z.array(z.record(z.unknown())).optional(),
  status: z.enum(["draft", "running", "completed", "failed"]).optional(),
});

export type SimulationUpdate = z.infer<typeof simulationUpdateSchema>;

// ============================================
// Mission Scenarios Table
// ============================================
export const missionScenarios = pgTable("mission_scenarios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  objectives: jsonb("objectives").default([]),
  riskLevel: integer("risk_level").default(1),
  category: varchar("category", { length: 100 }),
  status: varchar("status", { length: 50 }).default("draft"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type MissionScenario = typeof missionScenarios.$inferSelect;
export type InsertMissionScenario = typeof missionScenarios.$inferInsert;

// ============================================
// X Bio Sentinel - Smell Profiles Table
// pgvector extension enabled for similarity search
// ============================================
export const smellProfiles = pgTable("smell_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }),
  subcategory: varchar("subcategory", { length: 100 }),
  description: text("description"),
  label: varchar("label", { length: 255 }),
  notes: text("notes"),
  rawSignature: jsonb("raw_signature"),
  featureVector: jsonb("feature_vector"),
  embeddingText: text("embedding_text"),
  baselineGas: integer("baseline_gas"),
  peakGas: integer("peak_gas"),
  deltaGas: integer("delta_gas"),
  avgTemperature: integer("avg_temperature"),
  avgHumidity: integer("avg_humidity"),
  samplesCount: integer("samples_count").default(1),
  confidence: integer("confidence"),
  tags: text("tags").array(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type SmellProfile = typeof smellProfiles.$inferSelect;
export type InsertSmellProfile = typeof smellProfiles.$inferInsert;

// ============================================
// X Bio Sentinel - Sensor Readings Table
// ============================================
export const sensorReadings = pgTable("sensor_readings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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
});

export type SensorReading = typeof sensorReadings.$inferSelect;
export type InsertSensorReading = typeof sensorReadings.$inferInsert;

// ============================================
// X Bio Sentinel - Smell Captures Table
// ============================================
export const smellCaptures = pgTable("smell_captures", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: varchar("device_id", { length: 100 }).notNull(),
  profileId: varchar("profile_id").references(() => smellProfiles.id),
  durationMs: integer("duration_ms"),
  samplesCount: integer("samples_count"),
  rawData: jsonb("raw_data"),
  featureVector: jsonb("feature_vector"),
  baselineGas: integer("baseline_gas"),
  peakGas: integer("peak_gas"),
  heaterProfile: varchar("heater_profile", { length: 50 }),
  status: varchar("status", { length: 50 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type SmellCapture = typeof smellCaptures.$inferSelect;
export type InsertSmellCapture = typeof smellCaptures.$inferInsert;

// ============================================
// X Bio Sentinel - Zod Schemas
// ============================================
export const smellProfileSchema = z.object({
  name: z.string().min(1),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  description: z.string().optional(),
  label: z.string().optional(),
  notes: z.string().optional(),
  rawSignature: z.record(z.unknown()).optional(),
  featureVector: z.array(z.number()).optional(),
  baselineGas: z.number().optional(),
  peakGas: z.number().optional(),
  deltaGas: z.number().optional(),
  tags: z.array(z.string()).optional(),
});

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

export const smellCaptureSchema = z.object({
  captureId: z.string(),
  deviceId: z.string(),
  durationMs: z.number(),
  samplesCount: z.number(),
  gasReadings: z.array(z.number()),
  temperatureReadings: z.array(z.number()),
  humidityReadings: z.array(z.number()),
  heaterProfile: z.string(),
  baselineGas: z.number(),
  peakGas: z.number(),
  deltaGas: z.number(),
  featureVector: z.array(z.number()),
});

// ============================================
// X Bio Sentinel - WebSocket Message Schemas
// ============================================

// ESP32 → Server: Sensor reading event
export const wsSensorReadingSchema = z.object({
  type: z.literal("sensor_reading"),
  timestamp: z.number(),
  payload: z.object({
    device_id: z.string(),
    gas_resistance: z.number(),
    temperature: z.number(),
    humidity: z.number(),
    pressure: z.number().optional(),
    iaq_score: z.number().optional(),
    iaq_accuracy: z.number().min(0).max(3).optional(),
    co2_equivalent: z.number().optional(),
    voc_equivalent: z.number().optional(),
    heater_temp: z.number().optional(),
    heater_duration: z.number().optional(),
    mode: z.enum(["idle", "monitoring", "calibrating", "capturing"]).optional(),
  }),
});

// ESP32 → Server: Device status event
export const wsDeviceStatusSchema = z.object({
  type: z.literal("device_status"),
  timestamp: z.number(),
  payload: z.object({
    mode: z.enum(["idle", "monitoring", "calibrating", "capturing", "error"]),
    uptime_ms: z.number(),
    wifi_rssi: z.number(),
    sensor_healthy: z.boolean(),
    last_calibration: z.number().nullable(),
    heater_profile: z.string().optional(),
    firmware_version: z.string().optional(),
    free_heap: z.number().optional(),
    errors: z.array(z.string()),
  }),
});

// ESP32 → Server: Capture complete event
export const wsCaptureCompleteSchema = z.object({
  type: z.literal("capture_complete"),
  timestamp: z.number(),
  payload: z.object({
    capture_id: z.string(),
    device_id: z.string(),
    duration_ms: z.number(),
    samples_count: z.number(),
    gas_readings: z.array(z.number()),
    temperature_readings: z.array(z.number()),
    humidity_readings: z.array(z.number()),
    baseline_gas: z.number(),
    peak_gas: z.number(),
    delta_gas: z.number(),
    feature_vector: z.array(z.number()),
    heater_profile: z.string(),
    success: z.boolean(),
    error: z.string().optional(),
  }),
});

// ESP32 → Server: Calibration complete event
export const wsCalibrationCompleteSchema = z.object({
  type: z.literal("calibration_complete"),
  timestamp: z.number(),
  payload: z.object({
    device_id: z.string(),
    success: z.boolean(),
    baseline_gas: z.number().optional(),
    duration_ms: z.number(),
    error: z.string().optional(),
  }),
});

// Server → ESP32: Command acknowledgment
export const wsCommandAckSchema = z.object({
  type: z.literal("command_ack"),
  timestamp: z.number(),
  payload: z.object({
    command: z.string(),
    status: z.enum(["received", "executing", "completed", "failed"]),
    error: z.string().optional(),
  }),
});

// Union of all ESP32 → Server messages
export const wsEsp32MessageSchema = z.discriminatedUnion("type", [
  wsSensorReadingSchema,
  wsDeviceStatusSchema,
  wsCaptureCompleteSchema,
  wsCalibrationCompleteSchema,
]);

// Server → ESP32: Set mode command
export const wsSetModeCommandSchema = z.object({
  type: z.literal("set_mode"),
  payload: z.object({
    mode: z.enum(["idle", "monitoring", "calibrating", "capturing"]),
  }),
});

// Server → ESP32: Set heater profile command
export const wsSetHeaterProfileCommandSchema = z.object({
  type: z.literal("set_heater_profile"),
  payload: z.object({
    profile: z.enum(["low_power", "standard", "high_sensitivity", "custom"]),
    custom_temp: z.number().optional(),
    custom_duration: z.number().optional(),
  }),
});

// Server → ESP32: Start calibration command
export const wsStartCalibrationCommandSchema = z.object({
  type: z.literal("start_calibration"),
  payload: z.object({
    duration_seconds: z.number().optional(),
  }),
});

// Server → ESP32: Start capture command
export const wsStartCaptureCommandSchema = z.object({
  type: z.literal("start_capture"),
  payload: z.object({
    capture_id: z.string(),
    duration_seconds: z.number(),
    label: z.string().optional(),
    profile_id: z.string().nullable().optional(),
    heater_profile: z.string().optional(),
  }),
});

// Server → ESP32: Stop command
export const wsStopCommandSchema = z.object({
  type: z.literal("stop"),
  payload: z.object({}).optional(),
});

// Server → ESP32: Request status command
export const wsRequestStatusCommandSchema = z.object({
  type: z.literal("request_status"),
  payload: z.object({}).optional(),
});

// Server → ESP32: Restart command
export const wsRestartCommandSchema = z.object({
  type: z.literal("restart"),
  payload: z.object({
    reason: z.string().optional(),
  }),
});

// Union of all Server → ESP32 commands
export const wsServerCommandSchema = z.discriminatedUnion("type", [
  wsSetModeCommandSchema,
  wsSetHeaterProfileCommandSchema,
  wsStartCalibrationCommandSchema,
  wsStartCaptureCommandSchema,
  wsStopCommandSchema,
  wsRequestStatusCommandSchema,
  wsRestartCommandSchema,
]);

// Type exports for TypeScript usage
export type WsSensorReading = z.infer<typeof wsSensorReadingSchema>;
export type WsDeviceStatus = z.infer<typeof wsDeviceStatusSchema>;
export type WsCaptureComplete = z.infer<typeof wsCaptureCompleteSchema>;
export type WsCalibrationComplete = z.infer<typeof wsCalibrationCompleteSchema>;
export type WsCommandAck = z.infer<typeof wsCommandAckSchema>;
export type WsEsp32Message = z.infer<typeof wsEsp32MessageSchema>;
export type WsServerCommand = z.infer<typeof wsServerCommandSchema>;

// Legacy command schema (kept for compatibility)
export const bioSentinelCommandSchema = z.object({
  type: z.enum(["set_mode", "set_heater_profile", "start_calibration", "start_capture", "stop", "request_status", "restart"]),
  payload: z.record(z.unknown()),
});

export const bioSentinelChatSchema = z.object({
  message: z.string(),
  context: z.object({
    recentReadings: z.array(sensorReadingSchema).optional(),
    currentProfile: z.string().optional(),
  }).optional(),
});

// Smell categories for classification
export const SMELL_CATEGORIES = {
  human: ["Body odor", "Breath", "Skin", "Sweat"],
  food: ["Fruits", "Vegetables", "Meat", "Dairy", "Beverages", "Spices"],
  chemical: ["Solvents", "Alcohols", "Acids", "Gases", "Fuels"],
  environmental: ["Smoke", "Mold", "Plants", "Soil", "Water"],
  medical: ["Infections", "Metabolic", "Medications"],
  industrial: ["Manufacturing", "Automotive", "Construction"],
  household: ["Cleaning", "Cooking", "Personal care"],
} as const;

// ============================================
// CAUSAL MEMORY SYSTEM TABLES
// ============================================

// Intent Log - Records user/agent/system intents
export const intentLog = pgTable("intent_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  createdAt: timestamp("created_at").defaultNow(),
  actorType: varchar("actor_type", { length: 50 }).notNull(), // 'user' | 'agent' | 'system' | 'external'
  actorId: varchar("actor_id", { length: 255 }),
  intentType: varchar("intent_type", { length: 100 }).notNull(),
  intentText: text("intent_text").notNull(),
  context: jsonb("context"),
});

export type IntentLog = typeof intentLog.$inferSelect;
export type InsertIntentLog = typeof intentLog.$inferInsert;

// Action Log - Records actions taken in response to intents
export const actionLog = pgTable("action_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  createdAt: timestamp("created_at").defaultNow(),
  intentId: varchar("intent_id").references(() => intentLog.id).notNull(),
  actionType: varchar("action_type", { length: 100 }).notNull(),
  actionTarget: varchar("action_target", { length: 255 }),
  request: jsonb("request"),
  costUsd: numeric("cost_usd"),
  status: varchar("status", { length: 50 }).default("queued"), // 'queued' | 'running' | 'success' | 'failed'
});

export type ActionLog = typeof actionLog.$inferSelect;
export type InsertActionLog = typeof actionLog.$inferInsert;

// Result Log - Records results of actions
export const resultLog = pgTable("result_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  createdAt: timestamp("created_at").defaultNow(),
  actionId: varchar("action_id").references(() => actionLog.id).notNull(),
  output: jsonb("output"),
  error: text("error"),
  latencyMs: integer("latency_ms"),
});

export type ResultLog = typeof resultLog.$inferSelect;
export type InsertResultLog = typeof resultLog.$inferInsert;

// Impact Log - Records impacts of intents
export const impactLog = pgTable("impact_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  createdAt: timestamp("created_at").defaultNow(),
  intentId: varchar("intent_id").references(() => intentLog.id).notNull(),
  impactType: varchar("impact_type", { length: 100 }).notNull(),
  impactScore: integer("impact_score"),
  impact: jsonb("impact"),
});

export type ImpactLog = typeof impactLog.$inferSelect;
export type InsertImpactLog = typeof impactLog.$inferInsert;

// Reflections - Stores daily/manual reflection analysis
export const reflections = pgTable("reflections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  createdAt: timestamp("created_at").defaultNow(),
  windowMinutes: integer("window_minutes").default(1440),
  stats: jsonb("stats"),
  topErrors: jsonb("top_errors"),
  recommendations: jsonb("recommendations"),
});

export type Reflection = typeof reflections.$inferSelect;
export type InsertReflection = typeof reflections.$inferInsert;

// ============================================
// Causal Memory Zod Schemas for Validation
// ============================================

export const createIntentSchema = z.object({
  actor_type: z.enum(["user", "agent", "system", "external"]),
  actor_id: z.string().optional(),
  intent_type: z.string(),
  intent_text: z.string(),
  context: z.record(z.unknown()).optional(),
});

export const createActionSchema = z.object({
  intent_id: z.string(),
  action_type: z.string(),
  action_target: z.string().optional(),
  request: z.record(z.unknown()).optional(),
  cost_usd: z.number().optional(),
  status: z.enum(["queued", "running", "success", "failed"]).optional(),
});

export const createResultSchema = z.object({
  action_id: z.string(),
  success: z.boolean().optional(), // If true, action_log.status -> 'success'; if false -> 'failed'
  output: z.record(z.unknown()).optional(),
  error: z.string().optional(),
  latency_ms: z.number().optional(),
});

export const createImpactSchema = z.object({
  intent_id: z.string(),
  impact_type: z.string(),
  impact_score: z.number().optional(),
  impact: z.record(z.unknown()).optional(),
});
