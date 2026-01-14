import { z } from "zod";
import { sql, relations } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  varchar,
  boolean,
} from "drizzle-orm/pg-core";

// ============================================
// SECTION 1: AUTH & USERS
// ============================================

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [
    // فهرس لسرعة تنظيف الجلسات المنتهية
    index("idx_sessions_expiry").on(table.expire),
  ],
);

// ============================================
// SECTION 2: VIRTUAL OFFICE CORE (Agents & Chat)
// ============================================

// تعريف المحادثات
export const conversations = pgTable("conversations", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  title: varchar("title").notNull(),
  activeAgents: text("active_agents").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// تعريف الرسائل مع الفهرس الجديد
export const chatMessages = pgTable(
  "chat_messages",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    conversationId: varchar("conversation_id")
      .notNull()
      .references(() => conversations.id),
    role: varchar("role").notNull(), // 'user' | 'assistant'
    content: text("content").notNull(),
    agentId: varchar("agent_id"),
    timestamp: timestamp("timestamp").defaultNow(),
  },
  (table) => [
    // فهرس لاسترجاع تاريخ المحادثة بسرعة
    index("idx_chat_history").on(table.conversationId, table.timestamp),
  ],
);

// سجل أوامر النظام مع الفهرس
export const arcCommandLog = pgTable(
  "arc_command_log",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    command: varchar("command", { length: 255 }).notNull(),
    payload: jsonb("payload").default({}),
    status: varchar("status", { length: 50 }).default("pending"),
    durationMs: integer("duration_ms"),
    source: varchar("source", { length: 100 }),
    userId: varchar("user_id"),
    createdAt: timestamp("created_at").defaultNow(),
    completedAt: timestamp("completed_at"),
  },
  (table) => [
    // فهرس للبحث السريع عن الأوامر المعلقة
    index("idx_arc_cmd_queue").on(table.status, table.createdAt),
  ],
);

// أحداث العملاء (Events) مع الفهرس
export const agentEvents = pgTable(
  "agent_events",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    eventId: varchar("event_id").notNull(),
    agentId: varchar("agent_id").notNull(),
    type: varchar("type").notNull(), // 'message' | 'report' | 'heartbeat'
    payload: jsonb("payload").default({}),
    createdAt: timestamp("created_at"),
    receivedAt: timestamp("received_at").defaultNow(),
  },
  (table) => [
    // الفهرس الأهم لحل مشكلة الـ Full Scans
    index("idx_agent_events_lookup").on(table.agentId, table.receivedAt),
  ],
);

// ============================================
// SECTION 3: IOT & SENSORS (Bio Sentinel)
// ============================================

// قراءات الحساسات مع الفهرس
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
    // فهرس للرسوم البيانية واسترجاع البيانات التاريخية
    index("idx_sensor_data").on(table.deviceId, table.createdAt),
  ],
);

// بروفايلات الروائح (مجهزة للمستقبل)
export const smellProfiles = pgTable("smell_profiles", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }),
  subcategory: varchar("subcategory", { length: 100 }),
  description: text("description"),
  label: varchar("label", { length: 255 }),
  featureVector: jsonb("feature_vector"), // مكان لتخزين الـ Embeddings
  embeddingText: text("embedding_text"),
  confidence: integer("confidence"), // Confidence percentage (0-100)
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

// 👇👇👇 تابع القسم الثاني في الرد التالي 👇👇👇
// 👆👆👆 تابع للقسم الأول 👆👆👆

// ============================================
// SECTION 4: OPERATIONS & WORKFLOWS
// ============================================

export const teamTasks = pgTable("team_tasks", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  assignedAgent: text("assigned_agent"),
  priority: text("priority").default("medium"),
  status: text("status").default("pending"),
  tags: text("tags")
    .array()
    .default(sql`'{}'`),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const workflowSimulations = pgTable("workflow_simulations", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
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

export const missionScenarios = pgTable("mission_scenarios", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").default("Intelligence"),
  riskLevel: integer("risk_level").default(50),
  objectives: text("objectives")
    .array()
    .default(sql`'{}'`),
  assignedAgents: text("assigned_agents")
    .array()
    .default(sql`'{}'`),
  status: text("status").default("pending"),
  priority: text("priority").default("medium"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const activityFeed = pgTable("activity_feed", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  agentId: varchar("agent_id", { length: 50 }),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================
// SECTION 5: MANAGEMENT & ARCHIVES
// ============================================

export const ceoReminders = pgTable("ceo_reminders", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  date: varchar("date").notNull(),
  missingCeos: text("missing_ceos").array(),
  receivedAt: timestamp("received_at").defaultNow(),
});

export const executiveSummaries = pgTable("executive_summaries", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  date: varchar("date").notNull(),
  summaryText: text("summary_text").notNull(),
  profitScore: integer("profit_score"),
  riskScore: integer("risk_score"),
  topDecisions: text("top_decisions").array(),
  generatedAt: timestamp("generated_at").defaultNow(),
});

export const arcArchives = pgTable("arc_archives", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  archiveName: varchar("archive_name", { length: 255 }).notNull(),
  archiveType: varchar("archive_type", { length: 50 }).notNull(),
  filePath: text("file_path").notNull(),
  fileSizeBytes: integer("file_size_bytes").notNull(),
  accessLevel: varchar("access_level", { length: 50 }).default("internal"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

// ============================================
// SECTION 6: LEGACY / EXTRA TABLES (Part A)
// ============================================

export const governanceNotifications = pgTable("governance_notifications", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  ruleId: varchar("rule_id").notNull(),
  status: varchar("status").notNull(),
  title: varchar("title").notNull(),
  summary: text("summary"),
  proposerAgentId: varchar("proposer_agent_id"),
  receivedAt: timestamp("received_at").defaultNow(),
});

export const ruleBroadcasts = pgTable("rule_broadcasts", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  ruleId: varchar("rule_id").notNull(),
  effectiveAt: timestamp("effective_at"),
  status: varchar("status").notNull(),
  title: varchar("title").notNull(),
  broadcastAt: timestamp("broadcast_at").defaultNow(),
});

export const highPriorityNotifications = pgTable(
  "high_priority_notifications",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    sourceAgentId: varchar("source_agent_id").notNull(),
    severity: varchar("severity").notNull(),
    title: varchar("title").notNull(),
    body: text("body"),
    context: jsonb("context").default({}),
    receivedAt: timestamp("received_at").defaultNow(),
  },
);

export const arcFeedback = pgTable("arc_feedback", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  commandId: varchar("command_id"),
  source: varchar("source", { length: 100 }),
  status: varchar("status", { length: 50 }),
  data: jsonb("data").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

// 👇👇👇 تابع القسم 2-ب في الرد التالي 👇👇👇
// 👆👆👆 تابع للقسم 2-أ 👆👆👆

// ============================================
// SECTION 6: LEGACY / EXTRA TABLES (Part B)
// ============================================

export const agentTasks = pgTable("agent_tasks", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id", { length: 100 }).notNull(),
  taskType: varchar("task_type", { length: 50 }).notNull(),
  title: text("title").notNull(),
  status: varchar("status", { length: 50 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  input: jsonb("input").default({}),
  output: jsonb("output").default({}),
});

export const agentLearning = pgTable("agent_learning", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id", { length: 100 }).notNull(),
  learningType: varchar("learning_type", { length: 50 }).notNull(),
  inputData: jsonb("input_data").default({}),
  analysis: jsonb("analysis").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export const agentPerformance = pgTable("agent_performance", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id", { length: 100 }).notNull(),
  metricType: varchar("metric_type", { length: 50 }).notNull(),
  value: numeric("value").notNull(),
  recordedAt: timestamp("recorded_at").defaultNow(),
});

export const integrationLogs = pgTable("integration_logs", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  integrationName: varchar("integration_name", { length: 100 }).notNull(),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  direction: varchar("direction", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const intentLog = pgTable("intent_log", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  createdAt: timestamp("created_at").defaultNow(),
  actorType: varchar("actor_type", { length: 50 }).notNull(),
  intentType: varchar("intent_type", { length: 100 }).notNull(),
  intentText: text("intent_text").notNull(),
  context: jsonb("context"),
});

export const actionLog = pgTable("action_log", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  createdAt: timestamp("created_at").defaultNow(),
  intentId: varchar("intent_id").references(() => intentLog.id),
  actionType: varchar("action_type", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).default("queued"),
});

export const resultLog = pgTable("result_log", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  createdAt: timestamp("created_at").defaultNow(),
  actionId: varchar("action_id").references(() => actionLog.id),
  output: jsonb("output"),
});

export const impactLog = pgTable("impact_log", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  createdAt: timestamp("created_at").defaultNow(),
  intentId: varchar("intent_id").references(() => intentLog.id),
  impactType: varchar("impact_type", { length: 100 }).notNull(),
  impact: jsonb("impact"),
});

export const reflections = pgTable("reflections", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  createdAt: timestamp("created_at").defaultNow(),
  stats: jsonb("stats"),
  topErrors: jsonb("top_errors"),
});

export const arcAccessControl = pgTable("arc_access_control", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id", { length: 100 }).notNull(),
  resourceType: varchar("resource_type", { length: 50 }).notNull(),
  resourceId: varchar("resource_id", { length: 100 }).notNull(),
  permissions: text("permissions").array().notNull(),
  grantedAt: timestamp("granted_at").defaultNow(),
});

export const archiveEncryptionKeys = pgTable("archive_encryption_keys", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  keyId: varchar("key_id", { length: 50 }).notNull().unique(),
  encryptedKey: text("encrypted_key").notNull(),
  algorithm: varchar("algorithm", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================
// SECTION 7: ADMIN CONTROL - AGENTS & PROJECTS
// ============================================

export const agents = pgTable("agents", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 255 }).notNull(),
  systemPrompt: text("system_prompt").notNull(),
  specializations: text("specializations").array().default(sql`'{}'`),
  capabilities: text("capabilities").array().default(sql`'{}'`),
  model: varchar("model", { length: 100 }).default("gpt-4"),
  temperature: numeric("temperature").default("0.7"),
  maxTokens: integer("max_tokens").default(4000),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'individual' | 'company' | 'enterprise'
  status: varchar("status", { length: 50 }).default("active"), // 'active' | 'paused' | 'completed'
  assignedAgents: text("assigned_agents").array().default(sql`'{}'`),
  owner: varchar("owner", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================
// SHARED TYPES & ZOD SCHEMAS
// ============================================

export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type AgentEvent = typeof agentEvents.$inferSelect;
export type SensorReading = typeof sensorReadings.$inferSelect;
export type SmellProfile = typeof smellProfiles.$inferSelect;
export type TeamTask = typeof teamTasks.$inferSelect;
export type InsertTeamTask = typeof teamTasks.$inferInsert;
export type InsertSensorReading = typeof sensorReadings.$inferInsert;
export type InsertAgentEvent = typeof agentEvents.$inferInsert;
export type InsertChatMessage = typeof chatMessages.$inferInsert;
export type InsertConversation = typeof conversations.$inferInsert;
export type InsertArcCommandLog = typeof arcCommandLog.$inferInsert;
export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;
export type MissionScenario = typeof missionScenarios.$inferSelect;
export type InsertMissionScenario = typeof missionScenarios.$inferInsert;
export type InsertIntentLog = typeof intentLog.$inferInsert;
export type InsertActionLog = typeof actionLog.$inferInsert;
export type InsertResultLog = typeof resultLog.$inferInsert;
export type InsertImpactLog = typeof impactLog.$inferInsert;

// Agent Definitions
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
  "researcher",
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
    specialty:
      "Strategic oversight, cross-agent coordination, executive decisions",
    avatar: "crown",
    systemPrompt: `You are Mr.F, the Executive Orchestrator of the ARC Virtual Office.
    YOUR MISSION: oversee all operations, coordinate between agents (L0-Ops, L0-Intel, etc.), and ensure the user's strategic goals are met.
    PERSONALITY: Authoritative yet supportive, highly strategic, decisive, and forward-thinking.
    CAPABILITIES: You have access to all system logs, agent reports, and the Bio-Sentinel stream.
    COMMANDS: You can issue commands to other agents using the @AgentName syntax.`,
  },
  {
    id: "l0-ops",
    name: "L0-Ops",
    role: "Operations Commander",
    specialty: "Operational workflows, process automation, task management",
    avatar: "settings",
    systemPrompt: `You are L0-Ops, the Level-0 Operations Commander.
    YOUR MISSION: Execute daily tasks, manage system workflows, and ensure operational efficiency.
    PERSONALITY: Robotic, precise, efficiency-obsessed, and detail-oriented.
    CAPABILITIES: You track tasks in the 'team_tasks' table and monitor system health.`,
  },
  {
    id: "l0-comms",
    name: "L0-Comms",
    role: "Communications Director",
    specialty: "Internal communications, stakeholder messaging, drafting",
    avatar: "radio",
    systemPrompt: `You are L0-Comms, the Communications Director.
    YOUR MISSION: Handle all internal and external messaging, draft announcements, and summarize meetings.
    PERSONALITY: Articulate, diplomatic, and clear.`,
  },
  {
    id: "l0-intel",
    name: "L0-Intel",
    role: "Intelligence Analyst",
    specialty: "Data synthesis, pattern recognition, market research",
    avatar: "brain",
    systemPrompt: `You are L0-Intel, the Intelligence Analyst.
    YOUR MISSION: Analyze data streams, research topics, and provide actionable intelligence reports.
    PERSONALITY: Analytical, observant, and fact-focused.`,
  },
  {
    id: "photographer",
    name: "Alex Vision",
    role: "Photography Specialist",
    specialty: "Visual content, photography techniques, image analysis",
    avatar: "camera",
    systemPrompt:
      "You are Alex Vision. You specialize in photography, visual composition, and image editing advice.",
  },
  {
    id: "grants",
    name: "Diana Grant",
    role: "Grants Specialist",
    specialty: "Grant writing, funding opportunities, proposal structuring",
    avatar: "file-text",
    systemPrompt:
      "You are Diana Grant. You specialize in finding funding opportunities and writing winning grant proposals.",
  },
  {
    id: "legal",
    name: "Marcus Law",
    role: "Legal Advisor",
    specialty: "Contracts, intellectual property, compliance",
    avatar: "scale",
    systemPrompt:
      "You are Marcus Law. You provide general legal guidance regarding contracts and IP. Disclaimer: You are an AI, not a lawyer.",
  },
  {
    id: "finance",
    name: "Sarah Numbers",
    role: "Financial Analyst",
    specialty: "Budgeting, financial planning, investment analysis",
    avatar: "trending-up",
    systemPrompt:
      "You are Sarah Numbers. You focus on financial health, budgeting, and profit maximization strategies.",
  },
  {
    id: "creative",
    name: "Jordan Spark",
    role: "Creative Director",
    specialty: "Branding, design concepts, marketing strategy",
    avatar: "palette",
    systemPrompt:
      "You are Jordan Spark. You generate creative ideas for branding, marketing campaigns, and design.",
  },
  {
    id: "researcher",
    name: "Dr. Maya Quest",
    role: "Research Analyst",
    specialty: "Deep dive research, academic analysis, fact-checking",
    avatar: "search",
    systemPrompt:
      "You are Dr. Maya Quest. You conduct deep research, verify facts, and synthesize complex information.",
  },
];

// Smell Categories for Bio Sentinel
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
}

export interface WsSensorReading {
  type: "sensor_reading";
  data: {
    deviceId: string;
    gasResistance: number;
    temperature: number;
    humidity: number;
    pressure?: number;
    iaqScore?: number;
    co2Equivalent?: number;
    vocEquivalent?: number;
    heaterTemperature?: number;
    mode?: string;
  };
  timestamp: number;
}

export interface WsCaptureComplete {
  type: "capture_complete";
  id: string;
  timestamp: number;
}

export interface WsCalibrationComplete {
  type: "calibration_complete";
  success: boolean;
  message: string;
  timestamp: number;
}

// Zod Schemas for API
export const chatRequestSchema = z.object({
  message: z.string().min(1),
  conversationId: z.string().optional(),
  activeAgents: z.array(agentTypeSchema).min(1),
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

export const agentTaskSchema = z.object({
  agentId: z.string(),
  taskType: z.enum([
    "analysis",
    "research",
    "communication",
    "monitoring",
    "execution",
  ]),
  title: z.string(),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  input: z.record(z.unknown()).optional(),
  dueDate: z.string().datetime().optional(),
});

// ============================================
// SECTION 8: GROWTH ROADMAP (90-Day Plan)
// ============================================

// جدول المراحل الرئيسية
export const growthPhases = pgTable("growth_phases", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  phaseNumber: integer("phase_number").notNull(), // 1, 2, 3
  name: varchar("name").notNull(), // "Foundation", "Traction", "Polish"
  description: text("description"),
  startWeek: integer("start_week").notNull(), // 1
  endWeek: integer("end_week").notNull(), // 3
  targetScore: integer("target_score").notNull(), // 85
  budget: numeric("budget", { precision: 10, scale: 2 }), // 15000.00
  status: varchar("status").default("not-started"), // not-started, in-progress, completed
  actualScore: integer("actual_score"), // النتيجة الفعلية
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// جدول الأسابيع التفصيلية
export const growthWeeks = pgTable("growth_weeks", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  phaseId: varchar("phase_id")
    .notNull()
    .references(() => growthPhases.id, { onDelete: "cascade" }),
  weekNumber: integer("week_number").notNull(), // 1-13
  name: varchar("name").notNull(), // "Business Foundation"
  description: text("description"),
  goals: text("goals"), // JSON string of goals array
  status: varchar("status").default("not-started"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// جدول المهام اليومية
export const growthTasks = pgTable("growth_tasks", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  weekId: varchar("week_id")
    .notNull()
    .references(() => growthWeeks.id, { onDelete: "cascade" }),
  phaseId: varchar("phase_id")
    .notNull()
    .references(() => growthPhases.id),
  dayNumber: integer("day_number").notNull(), // 1-90
  title: varchar("title").notNull(),
  description: text("description"),
  category: varchar("category"), // "business", "legal", "marketing", "technical", "product"
  estimatedHours: numeric("estimated_hours", { precision: 4, scale: 1 }), // 8.0
  deliverables: text("deliverables"), // JSON string of deliverables array
  resources: text("resources"), // JSON string of resources/tools
  cost: numeric("cost", { precision: 10, scale: 2 }), // 500.00
  priority: varchar("priority").default("medium"), // low, medium, high, critical
  status: varchar("status").default("not-started"), // not-started, in-progress, completed, blocked
  progress: integer("progress").default(0), // 0-100
  actualHours: numeric("actual_hours", { precision: 4, scale: 1 }),
  actualCost: numeric("actual_cost", { precision: 10, scale: 2 }),
  notes: text("notes"),
  blockers: text("blockers"), // ما يمنع التقدم
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// جدول الإنجازات اليومية
export const dailyCheckIns = pgTable("daily_check_ins", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull(),
  tasksCompleted: integer("tasks_completed").default(0),
  hoursWorked: numeric("hours_worked", { precision: 4, scale: 1 }),
  moneySpent: numeric("money_spent", { precision: 10, scale: 2 }),
  wins: text("wins"), // JSON array of today's wins
  challenges: text("challenges"), // JSON array of challenges
  tomorrow: text("tomorrow"), // JSON array of tomorrow's priorities
  mood: varchar("mood"), // great, good, okay, bad
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// جدول المقاييس (KPIs)
export const growthMetrics = pgTable("growth_metrics", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull(),
  weekNumber: integer("week_number"),
  
  // User metrics
  totalUsers: integer("total_users").default(0),
  activeUsers: integer("active_users").default(0),
  newSignups: integer("new_signups").default(0),
  
  // Revenue metrics
  mrr: numeric("mrr", { precision: 10, scale: 2 }).default("0"),
  arr: numeric("arr", { precision: 10, scale: 2 }).default("0"),
  payingCustomers: integer("paying_customers").default(0),
  
  // Marketing metrics
  websiteVisitors: integer("website_visitors").default(0),
  emailSubscribers: integer("email_subscribers").default(0),
  blogPosts: integer("blog_posts").default(0),
  socialFollowers: integer("social_followers").default(0),
  
  // Product metrics
  featureCount: integer("feature_count").default(0),
  bugCount: integer("bug_count").default(0),
  uptime: numeric("uptime", { precision: 5, scale: 2 }).default("0"), // 99.90
  
  // Investment readiness score
  technicalScore: integer("technical_score").default(0),
  businessScore: integer("business_score").default(0),
  operationalScore: integer("operational_score").default(0),
  polishScore: integer("polish_score").default(0),
  totalScore: integer("total_score").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// جدول المعالم الرئيسية
export const growthMilestones = pgTable("growth_milestones", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  category: varchar("category"), // "users", "revenue", "product", "marketing"
  targetValue: numeric("target_value", { precision: 10, scale: 2 }),
  currentValue: numeric("current_value", { precision: 10, scale: 2 }).default("0"),
  targetDate: timestamp("target_date"),
  status: varchar("status").default("not-started"), // not-started, in-progress, completed
  importance: varchar("importance").default("medium"), // low, medium, high, critical
  achievedAt: timestamp("achieved_at"),
  celebrationMessage: text("celebration_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const growthPhasesRelations = relations(growthPhases, ({ many }) => ({
  weeks: many(growthWeeks),
  tasks: many(growthTasks),
}));

export const growthWeeksRelations = relations(growthWeeks, ({ one, many }) => ({
  phase: one(growthPhases, {
    fields: [growthWeeks.phaseId],
    references: [growthPhases.id],
  }),
  tasks: many(growthTasks),
}));

export const growthTasksRelations = relations(growthTasks, ({ one }) => ({
  phase: one(growthPhases, {
    fields: [growthTasks.phaseId],
    references: [growthPhases.id],
  }),
  week: one(growthWeeks, {
    fields: [growthTasks.weekId],
    references: [growthWeeks.id],
  }),
}));

// ============================================
// SECTION 9: CLONING SYSTEM
// ============================================

// جدول ملفات المستخدمين (User Profiles)
export const userProfiles = pgTable("user_profiles", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: varchar("username").notNull().unique(),
  email: varchar("email").notNull().unique(),
  phoneNumber: varchar("phone_number"),
  password: varchar("password").notNull(), // Hashed with bcrypt
  
  // معلومات شخصية
  personalInfo: jsonb("personal_info").default({}), // { skills, jobTitle, bio, etc }
  
  // معلومات المشاريع
  projectsInfo: jsonb("projects_info").default({}), // { github, gitlab, portfolio, etc }
  
  // معلومات التواصل الاجتماعي
  socialInfo: jsonb("social_info").default({}), // { linkedin, twitter, etc }
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_user_profiles_username").on(table.username),
  index("idx_user_profiles_email").on(table.email),
]);

// جدول ملفات المستخدمين (Files)
export const userFiles = pgTable("user_files", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => userProfiles.id, { onDelete: "cascade" }),
  fileType: varchar("file_type").notNull(), // 'voice', 'photo', 'document'
  fileName: varchar("file_name").notNull(),
  filePath: varchar("file_path").notNull(),
  fileSize: integer("file_size"), // in bytes
  mimeType: varchar("mime_type"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
}, (table) => [
  index("idx_user_files_user_id").on(table.userId),
]);

// جدول أجهزة IoT للمستخدمين
export const userIotDevices = pgTable("user_iot_devices", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => userProfiles.id, { onDelete: "cascade" }),
  deviceType: varchar("device_type").notNull(), // 'xbio_sentinel', 'personal_xbio', etc
  deviceName: varchar("device_name"),
  deviceConfig: jsonb("device_config").default({}), // Configuration specific to device
  isActive: boolean("is_active").default(true),
  addedAt: timestamp("added_at").defaultNow(),
}, (table) => [
  index("idx_user_iot_devices_user_id").on(table.userId),
]);

// Relations للنظام الجديد
export const userProfilesRelations = relations(userProfiles, ({ many }) => ({
  files: many(userFiles),
  iotDevices: many(userIotDevices),
}));

export const userFilesRelations = relations(userFiles, ({ one }) => ({
  user: one(userProfiles, {
    fields: [userFiles.userId],
    references: [userProfiles.id],
  }),
}));

export const userIotDevicesRelations = relations(userIotDevices, ({ one }) => ({
  user: one(userProfiles, {
    fields: [userIotDevices.userId],
    references: [userProfiles.id],
  }),
}));

// ============================================
// SECTION: ARC CORE LEDGER (Phase 1)
// ============================================
// Unified event logging for all system actions
// Every action = structured event in the ledger

export const arcEvents = pgTable(
  "arc_events",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    type: varchar("type", { length: 100 }).notNull(), // auth.login, command.received, agent.started, etc.
    actor: varchar("actor", { length: 100 }).notNull(), // operator, system, agent_id
    tenantId: varchar("tenant_id", { length: 100 }).notNull().default("mrf-primary"),
    payload: jsonb("payload").default({}),
    traceId: varchar("trace_id", { length: 100 }), // Correlation ID for request tracing
    severity: varchar("severity", { length: 20 }).default("info"), // info, warn, error, critical
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    // Index for fetching recent events by type
    index("idx_arc_events_type_created").on(table.type, table.createdAt),
    // Index for tenant-scoped queries
    index("idx_arc_events_tenant").on(table.tenantId, table.createdAt),
    // Index for trace correlation
    index("idx_arc_events_trace").on(table.traceId),
  ],
);

// Zod validation schema for events
export const arcEventSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.string().min(1).max(100),
  actor: z.string().min(1).max(100),
  tenantId: z.string().default("mrf-primary"),
  payload: z.record(z.any()).default({}),
  traceId: z.string().optional(),
  severity: z.enum(["info", "warn", "error", "critical"]).default("info"),
  createdAt: z.date().optional(),
});

export type ArcEvent = z.infer<typeof arcEventSchema>;
export type InsertArcEvent = typeof arcEvents.$inferInsert;
export type SelectArcEvent = typeof arcEvents.$inferSelect;

// ============================================
// SECTION: TENANTS & RBAC (Phase 2 Prep)
// ============================================
// SaaS-grade tenant isolation - single tenant for now

export const tenants = pgTable("tenants", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  status: varchar("status", { length: 50 }).default("active"), // active, suspended, deleted
  config: jsonb("config").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tenantUsers = pgTable(
  "tenant_users",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    tenantId: varchar("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 50 }).notNull().default("AGENT"), // OWNER, ADMIN, AGENT
    permissions: jsonb("permissions").default([]),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("idx_tenant_users_tenant").on(table.tenantId),
    index("idx_tenant_users_user").on(table.userId),
  ],
);

export const featureFlags = pgTable("feature_flags", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  key: varchar("key", { length: 100 }).unique().notNull(),
  enabled: boolean("enabled").default(false),
  tenantId: varchar("tenant_id").references(() => tenants.id), // null = global
  config: jsonb("config").default({}),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================
// SECTION: AGENTS REGISTRY (Phase 3 Prep)
// ============================================
// First-class agent definitions in database

export const agentRegistry = pgTable("agent_registry", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  capabilities: jsonb("capabilities").default([]), // ["chat", "voice", "automation"]
  scopes: jsonb("scopes").default([]), // ["read:messages", "write:tasks"]
  config: jsonb("config").default({}), // model, temperature, etc.
  status: varchar("status", { length: 50 }).default("active"), // active, beta, maintenance, disabled
  tenantId: varchar("tenant_id").references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
