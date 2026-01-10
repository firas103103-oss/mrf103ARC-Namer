/**
 * ARC JARVIS Workflows
 * Phase 4: Private JARVIS Operating System
 * 
 * Personal workflows for the owner:
 * 1. Daily Brief - Morning summary of key information
 * 2. Projects & Companies - Track business activities
 * 3. Home / IoT Ingestion - Process sensor data
 * 
 * Rules:
 * - Uses same SaaS flows as Phase 1-3
 * - Everything logged to Event Ledger
 * - No shortcuts
 */

import { supabase, isSupabaseConfigured } from "../supabase";
import EventLedger, { generateTraceId } from "../services/event-ledger";
import { AgentRegistry, executeAgent } from "../agents/registry";
import logger from "../utils/logger";

// ============================================
// TYPES
// ============================================

export interface DailyBriefData {
  date: string;
  summary: string;
  tasks: TaskSummary[];
  events: EventSummary[];
  metrics: MetricsSummary;
  weather?: WeatherData;
  iot?: IoTSummary;
}

export interface TaskSummary {
  id: string;
  title: string;
  priority: string;
  status: string;
  dueDate?: string;
}

export interface EventSummary {
  type: string;
  count: number;
  latest?: string;
}

export interface MetricsSummary {
  agentInteractions: number;
  commandsExecuted: number;
  errorsLogged: number;
}

export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
}

export interface IoTSummary {
  devicesOnline: number;
  alerts: IoTAlert[];
  latestReadings: Record<string, unknown>;
}

export interface IoTAlert {
  deviceId: string;
  type: string;
  message: string;
  timestamp: string;
}

export interface Project {
  id: string;
  name: string;
  status: string;
  priority: string;
  progress: number;
  nextMilestone?: string;
  lastUpdated: string;
}

export interface Company {
  id: string;
  name: string;
  relationship: "client" | "partner" | "prospect" | "vendor";
  status: string;
  lastContact?: string;
  notes?: string;
}

// ============================================
// WORKFLOW 1: DAILY BRIEF
// ============================================

/**
 * Generate daily brief for the owner
 * Aggregates tasks, events, metrics, and IoT status
 */
export async function generateDailyBrief(): Promise<DailyBriefData> {
  const traceId = generateTraceId();
  const today = new Date().toISOString().split("T")[0];

  await EventLedger.log({
    type: "workflow.started",
    actor: "system",
    traceId,
    payload: { workflow: "daily_brief", date: today },
  });

  try {
    // Fetch data in parallel
    const [tasks, eventCounts, metrics, iotData] = await Promise.all([
      fetchPendingTasks(),
      fetchEventCounts(today),
      fetchDailyMetrics(today),
      fetchIoTSummary(),
    ]);

    // Generate summary text
    const summary = buildDailyBriefSummary(tasks, eventCounts, metrics, iotData);

    const brief: DailyBriefData = {
      date: today,
      summary,
      tasks,
      events: eventCounts,
      metrics,
      iot: iotData,
    };

    // Store the brief
    if (isSupabaseConfigured() && supabase) {
      await supabase.from("executive_summaries").insert({
        summary_text: summary,
        generated_at: new Date().toISOString(),
        sentiment: "neutral",
        metrics: { type: "daily_brief", data: brief },
      });
    }

    await EventLedger.log({
      type: "workflow.completed",
      actor: "system",
      traceId,
      payload: { workflow: "daily_brief", tasks_count: tasks.length },
    });

    return brief;
  } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? error.message : 'Unknown error') : String(error);
    
    await EventLedger.log({
      type: "workflow.failed",
      actor: "system",
      traceId,
      payload: { workflow: "daily_brief", error: errorMessage },
      severity: "error",
    });

    throw error;
  }
}

async function fetchPendingTasks(): Promise<TaskSummary[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  const { data } = await supabase
    .from("team_tasks")
    .select("id, title, priority, status, due_date")
    .in("status", ["pending", "in_progress"])
    .order("priority", { ascending: true })
    .limit(10);

  return (data || []).map((t: any) => ({
    id: t.id,
    title: t.title,
    priority: t.priority,
    status: t.status,
    dueDate: t.due_date,
  }));
}

async function fetchEventCounts(date: string): Promise<EventSummary[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  const startOfDay = `${date}T00:00:00Z`;
  const endOfDay = `${date}T23:59:59Z`;

  const { data } = await supabase
    .from("arc_events")
    .select("type")
    .gte("created_at", startOfDay)
    .lte("created_at", endOfDay);

  // Group by type
  const counts = new Map<string, number>();
  (data || []).forEach((e: any) => {
    const baseType = e.type.split(".")[0];
    counts.set(baseType, (counts.get(baseType) || 0) + 1);
  });

  return Array.from(counts.entries()).map(([type, count]) => ({
    type,
    count,
  }));
}

async function fetchDailyMetrics(date: string): Promise<MetricsSummary> {
  if (!isSupabaseConfigured() || !supabase) {
    return { agentInteractions: 0, commandsExecuted: 0, errorsLogged: 0 };
  }

  const startOfDay = `${date}T00:00:00Z`;
  const endOfDay = `${date}T23:59:59Z`;

  const { data } = await supabase
    .from("arc_events")
    .select("type, severity")
    .gte("created_at", startOfDay)
    .lte("created_at", endOfDay);

  const events = data || [];
  
  return {
    agentInteractions: events.filter((e: any) => e.type.startsWith("agent.")).length,
    commandsExecuted: events.filter((e: any) => e.type.startsWith("command.")).length,
    errorsLogged: events.filter((e: any) => e.severity === "error" || e.severity === "critical").length,
  };
}

async function fetchIoTSummary(): Promise<IoTSummary | undefined> {
  if (!isSupabaseConfigured() || !supabase) return undefined;

  // Check for IoT devices
  const { data: devices } = await supabase
    .from("user_iot_devices")
    .select("id, device_type, is_active")
    .eq("is_active", true);

  if (!devices || devices.length === 0) return undefined;

  // Get latest sensor readings
  const { data: readings } = await supabase
    .from("sensor_readings")
    .select("device_id, temperature, humidity, iaq_score, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  // Check for anomalies (alerts)
  const { data: anomalies } = await supabase
    .from("anomalies")
    .select("*")
    .eq("resolved", false)
    .order("detected_at", { ascending: false })
    .limit(5);

  return {
    devicesOnline: devices.length,
    alerts: (anomalies || []).map((a: any) => ({
      deviceId: a.agent_id,
      type: a.type,
      message: a.description,
      timestamp: a.detected_at,
    })),
    latestReadings: readings?.[0] || {},
  };
}

function buildDailyBriefSummary(
  tasks: TaskSummary[],
  events: EventSummary[],
  metrics: MetricsSummary,
  iot?: IoTSummary
): string {
  const lines: string[] = [];
  
  lines.push(`📅 Daily Brief - ${new Date().toLocaleDateString()}`);
  lines.push("");
  
  // Tasks
  const urgentTasks = tasks.filter(t => t.priority === "high" || t.priority === "urgent");
  lines.push(`📋 Tasks: ${tasks.length} pending (${urgentTasks.length} urgent)`);
  
  // Metrics
  lines.push(`📊 Today: ${metrics.agentInteractions} agent interactions, ${metrics.commandsExecuted} commands`);
  
  if (metrics.errorsLogged > 0) {
    lines.push(`⚠️ ${metrics.errorsLogged} errors logged`);
  }
  
  // IoT
  if (iot) {
    lines.push(`🏠 IoT: ${iot.devicesOnline} devices online`);
    if (iot.alerts.length > 0) {
      lines.push(`🚨 ${iot.alerts.length} active alerts`);
    }
  }
  
  return lines.join("\n");
}

// ============================================
// WORKFLOW 2: PROJECTS & COMPANIES TRACKING
// ============================================

/**
 * Get all active projects
 */
export async function getActiveProjects(): Promise<Project[]> {
  const traceId = generateTraceId();
  
  await EventLedger.log({
    type: "command.received",
    actor: "operator",
    traceId,
    payload: { command: "get_projects" },
  });

  if (!isSupabaseConfigured() || !supabase) {
    return [];
  }

  // Check if projects table exists, otherwise use mission_scenarios
  const { data, error } = await supabase
    .from("mission_scenarios")
    .select("*")
    .in("status", ["pending", "active", "in_progress"])
    .order("created_at", { ascending: false });

  if (error) {
    logger.error("[Workflows] Projects query error:", (error instanceof Error ? error.message : 'Unknown error'));
    return [];
  }

  await EventLedger.log({
    type: "command.completed",
    actor: "operator",
    traceId,
    payload: { command: "get_projects", count: data?.length || 0 },
  });

  return (data || []).map((p: any) => ({
    id: p.id,
    name: p.title,
    status: p.status,
    priority: p.priority || "medium",
    progress: p.risk_level || 0, // Repurposing risk_level as progress
    nextMilestone: p.objectives?.[0],
    lastUpdated: p.updated_at,
  }));
}

/**
 * Track a new project
 */
export async function createProject(project: Partial<Project>): Promise<Project | null> {
  const traceId = generateTraceId();

  await EventLedger.log({
    type: "command.received",
    actor: "operator",
    traceId,
    payload: { command: "create_project", name: project.name },
  });

  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("mission_scenarios")
    .insert({
      title: project.name,
      status: project.status || "pending",
      priority: project.priority || "medium",
      risk_level: project.progress || 0,
      objectives: project.nextMilestone ? [project.nextMilestone] : [],
    })
    .select()
    .single();

  if (error) {
    await EventLedger.log({
      type: "command.failed",
      actor: "operator",
      traceId,
      payload: { command: "create_project", error: (error instanceof Error ? error.message : 'Unknown error') },
      severity: "error",
    });
    return null;
  }

  await EventLedger.log({
    type: "command.completed",
    actor: "operator",
    traceId,
    payload: { command: "create_project", id: data.id },
  });

  return {
    id: data.id,
    name: data.title,
    status: data.status,
    priority: data.priority || "medium",
    progress: data.risk_level || 0,
    nextMilestone: data.objectives?.[0],
    lastUpdated: data.updated_at,
  };
}

/**
 * Update project status
 */
export async function updateProjectStatus(
  projectId: string,
  status: string,
  progress?: number
): Promise<boolean> {
  const traceId = generateTraceId();

  await EventLedger.log({
    type: "command.received",
    actor: "operator",
    traceId,
    payload: { command: "update_project", projectId, status, progress },
  });

  if (!isSupabaseConfigured() || !supabase) {
    return false;
  }

  const updates: any = { status, updated_at: new Date().toISOString() };
  if (progress !== undefined) {
    updates.risk_level = progress;
  }

  const { error } = await supabase
    .from("mission_scenarios")
    .update(updates)
    .eq("id", projectId);

  if (error) {
    await EventLedger.log({
      type: "command.failed",
      actor: "operator",
      traceId,
      payload: { command: "update_project", error: (error instanceof Error ? error.message : 'Unknown error') },
      severity: "error",
    });
    return false;
  }

  await EventLedger.log({
    type: "command.completed",
    actor: "operator",
    traceId,
    payload: { command: "update_project", projectId, status },
  });

  return true;
}

// ============================================
// WORKFLOW 3: HOME / IOT INGESTION
// ============================================

/**
 * Ingest sensor reading from IoT device
 */
export async function ingestSensorReading(reading: {
  deviceId: string;
  temperature?: number;
  humidity?: number;
  pressure?: number;
  iaqScore?: number;
  gasResistance?: number;
  co2Equivalent?: number;
  vocEquivalent?: number;
}): Promise<boolean> {
  const traceId = generateTraceId();

  await EventLedger.log({
    type: "command.received",
    actor: "system",
    traceId,
    payload: { command: "ingest_sensor", deviceId: reading.deviceId },
  });

  if (!isSupabaseConfigured() || !supabase) {
    return false;
  }

  const { error } = await supabase.from("sensor_readings").insert({
    device_id: reading.deviceId,
    temperature: reading.temperature,
    humidity: reading.humidity,
    pressure: reading.pressure,
    iaq_score: reading.iaqScore,
    gas_resistance: reading.gasResistance,
    co2_equivalent: reading.co2Equivalent,
    voc_equivalent: reading.vocEquivalent,
    mode: "monitoring",
    created_at: new Date().toISOString(),
  });

  if (error) {
    await EventLedger.log({
      type: "command.failed",
      actor: "system",
      traceId,
      payload: { command: "ingest_sensor", error: (error instanceof Error ? error.message : 'Unknown error') },
      severity: "error",
    });
    return false;
  }

  // Check for anomalies
  await checkSensorAnomalies(reading, traceId);

  await EventLedger.log({
    type: "command.completed",
    actor: "system",
    traceId,
    payload: { command: "ingest_sensor", deviceId: reading.deviceId },
  });

  return true;
}

/**
 * Check for anomalies in sensor reading
 */
async function checkSensorAnomalies(
  reading: { deviceId: string; temperature?: number; iaqScore?: number },
  traceId: string
): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) return;

  const anomalies: { type: string; description: string; severity: string }[] = [];

  // Temperature anomaly
  if (reading.temperature !== undefined) {
    if (reading.temperature > 35) {
      anomalies.push({
        type: "high_temperature",
        description: `Temperature ${reading.temperature}°C exceeds threshold`,
        severity: "high",
      });
    } else if (reading.temperature < 10) {
      anomalies.push({
        type: "low_temperature",
        description: `Temperature ${reading.temperature}°C below threshold`,
        severity: "medium",
      });
    }
  }

  // Air quality anomaly
  if (reading.iaqScore !== undefined && reading.iaqScore > 150) {
    anomalies.push({
      type: "poor_air_quality",
      description: `IAQ score ${reading.iaqScore} indicates poor air quality`,
      severity: reading.iaqScore > 200 ? "high" : "medium",
    });
  }

  // Insert anomalies
  for (const anomaly of anomalies) {
    await supabase.from("anomalies").insert({
      agent_id: reading.deviceId,
      type: anomaly.type,
      severity: anomaly.severity,
      description: anomaly.description,
      resolved: false,
    });

    await EventLedger.log({
      type: "system.error",
      actor: "iot",
      traceId,
      payload: {
        deviceId: reading.deviceId,
        anomaly: anomaly.type,
        description: anomaly.description,
      },
      severity: anomaly.severity === "high" ? "error" : "warn",
    });
  }
}

/**
 * Get IoT device status
 */
export async function getIoTDeviceStatus(deviceId?: string): Promise<IoTSummary> {
  const traceId = generateTraceId();

  await EventLedger.log({
    type: "command.received",
    actor: "operator",
    traceId,
    payload: { command: "get_iot_status", deviceId },
  });

  const summary = await fetchIoTSummary();

  await EventLedger.log({
    type: "command.completed",
    actor: "operator",
    traceId,
    payload: { command: "get_iot_status", devicesOnline: summary?.devicesOnline || 0 },
  });

  return summary || {
    devicesOnline: 0,
    alerts: [],
    latestReadings: {},
  };
}

/**
 * Resolve IoT anomaly/alert
 */
export async function resolveIoTAlert(anomalyId: string): Promise<boolean> {
  const traceId = generateTraceId();

  await EventLedger.log({
    type: "command.received",
    actor: "operator",
    traceId,
    payload: { command: "resolve_alert", anomalyId },
  });

  if (!isSupabaseConfigured() || !supabase) {
    return false;
  }

  const { error } = await supabase
    .from("anomalies")
    .update({ resolved: true })
    .eq("id", anomalyId);

  if (error) {
    await EventLedger.log({
      type: "command.failed",
      actor: "operator",
      traceId,
      payload: { command: "resolve_alert", error: (error instanceof Error ? error.message : 'Unknown error') },
      severity: "error",
    });
    return false;
  }

  await EventLedger.log({
    type: "command.completed",
    actor: "operator",
    traceId,
    payload: { command: "resolve_alert", anomalyId },
  });

  return true;
}

// ============================================
// EXPORTS
// ============================================

export const JarvisWorkflows = {
  // Daily Brief
  generateDailyBrief,
  
  // Projects
  getActiveProjects,
  createProject,
  updateProjectStatus,
  
  // IoT
  ingestSensorReading,
  getIoTDeviceStatus,
  resolveIoTAlert,
};

export default JarvisWorkflows;
