/**
 * ARC Event Ledger Service
 * Phase 1: Core Ledger Implementation
 * 
 * Every action = structured event
 * - Persists to Supabase (arc_events table)
 * - Broadcasts via WebSocket
 * - Same event object everywhere
 */

import { supabase, isSupabaseConfigured } from "../supabase";
import { v4 as uuidv4 } from "uuid";
import logger from "../utils/logger";

// ============================================
// EVENT TYPES
// ============================================

export type EventType =
  // Auth events
  | "auth.login"
  | "auth.logout"
  | "auth.failed"
  // Command events
  | "command.received"
  | "command.processing"
  | "command.completed"
  | "command.failed"
  // Agent events
  | "agent.started"
  | "agent.completed"
  | "agent.failed"
  | "agent.message"
  // System events
  | "system.startup"
  | "system.shutdown"
  | "system.health"
  | "system.error"
  // Workflow events
  | "workflow.started"
  | "workflow.completed"
  | "workflow.failed";

export type EventSeverity = "info" | "warn" | "error" | "critical";

export interface ArcEvent {
  id: string;
  type: EventType;
  actor: string;
  tenant_id: string;
  payload: Record<string, unknown>;
  trace_id: string | null;
  severity: EventSeverity;
  created_at: string;
}

export interface CreateEventParams {
  type: EventType;
  actor: string;
  payload?: Record<string, unknown>;
  traceId?: string;
  severity?: EventSeverity;
  tenantId?: string;
}

// ============================================
// EVENT SUBSCRIBERS (for realtime broadcast)
// ============================================

type EventSubscriber = (event: ArcEvent) => void;
const subscribers: EventSubscriber[] = [];

/**
 * Subscribe to all events (used by realtime.ts)
 */
export function subscribeToEvents(callback: EventSubscriber): () => void {
  subscribers.push(callback);
  return () => {
    const index = subscribers.indexOf(callback);
    if (index > -1) subscribers.splice(index, 1);
  };
}

/**
 * Notify all subscribers of a new event
 */
function notifySubscribers(event: ArcEvent): void {
  subscribers.forEach((callback) => {
    try {
      callback(event);
    } catch (err) {
      console.error("[EventLedger] Subscriber error:", err);
    }
  });
}

// ============================================
// CORE FUNCTIONS
// ============================================

/**
 * Log an event to the ledger
 * - Persists to Supabase
 * - Broadcasts to WebSocket subscribers
 */
export async function logEvent(params: CreateEventParams): Promise<ArcEvent | null> {
  const event: ArcEvent = {
    id: uuidv4(),
    type: params.type,
    actor: params.actor,
    tenant_id: params.tenantId || "mrf-primary",
    payload: params.payload || {},
    trace_id: params.traceId || null,
    severity: params.severity || "info",
    created_at: new Date().toISOString(),
  };

  // Log to console for visibility
  const icon = getSeverityIcon(event.severity);
  console.log(`${icon} [Event] ${event.type} | actor=${event.actor} | trace=${event.trace_id || "none"}`);

  // Persist to Supabase
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from("arc_events").insert({
        id: event.id,
        type: event.type,
        actor: event.actor,
        tenant_id: event.tenant_id,
        payload: event.payload,
        trace_id: event.trace_id,
        severity: event.severity,
        created_at: event.created_at,
      });

      if (error) {
        console.error("[EventLedger] Supabase insert error:", (error instanceof Error ? error.message : 'Unknown error'));
      }
    } catch (err) {
      console.error("[EventLedger] Supabase error:", err);
    }
  }

  // Notify WebSocket subscribers
  notifySubscribers(event);

  return event;
}

/**
 * Log event synchronously (fire-and-forget)
 * Use when you don't need to await the result
 */
export function logEventAsync(params: CreateEventParams): void {
  logEvent(params).catch((err) => {
    console.error("[EventLedger] Async log error:", err);
  });
}

/**
 * Generate a trace ID for request correlation
 */
export function generateTraceId(): string {
  return `trace-${uuidv4().slice(0, 8)}-${Date.now()}`;
}

/**
 * Get recent events from the ledger
 */
export async function getRecentEvents(options: {
  limit?: number;
  type?: EventType;
  tenantId?: string;
  traceId?: string;
}): Promise<ArcEvent[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return [];
  }

  let query = supabase
    .from("arc_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(options.limit || 50);

  if (options.type) {
    query = query.eq("type", options.type);
  }

  if (options.tenantId) {
    query = query.eq("tenant_id", options.tenantId);
  }

  if (options.traceId) {
    query = query.eq("trace_id", options.traceId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[EventLedger] Query error:", (error instanceof Error ? error.message : 'Unknown error'));
    return [];
  }

  return (data || []) as ArcEvent[];
}

/**
 * Get events by trace ID (for debugging request flow)
 */
export async function getEventsByTrace(traceId: string): Promise<ArcEvent[]> {
  return getRecentEvents({ traceId, limit: 100 });
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getSeverityIcon(severity: EventSeverity): string {
  switch (severity) {
    case "info":
      return "📋";
    case "warn":
      return "⚠️";
    case "error":
      return "❌";
    case "critical":
      return "🚨";
    default:
      return "📋";
  }
}

// ============================================
// CONVENIENCE METHODS
// ============================================

export const EventLedger = {
  log: logEvent,
  logAsync: logEventAsync,
  subscribe: subscribeToEvents,
  generateTraceId,
  getRecent: getRecentEvents,
  getByTrace: getEventsByTrace,

  // Shorthand methods
  async loginSuccess(actor: string, metadata?: Record<string, unknown>) {
    return logEvent({ type: "auth.login", actor, payload: metadata });
  },

  async loginFailed(actor: string, reason: string) {
    return logEvent({
      type: "auth.failed",
      actor,
      payload: { reason },
      severity: "warn",
    });
  },

  async logout(actor: string) {
    return logEvent({ type: "auth.logout", actor });
  },

  async commandReceived(command: string, traceId: string, payload?: Record<string, unknown>) {
    return logEvent({
      type: "command.received",
      actor: "system",
      traceId,
      payload: { command, ...payload },
    });
  },

  async commandCompleted(command: string, traceId: string, result?: Record<string, unknown>) {
    return logEvent({
      type: "command.completed",
      actor: "system",
      traceId,
      payload: { command, result },
    });
  },

  async commandFailed(command: string, traceId: string, error: string) {
    return logEvent({
      type: "command.failed",
      actor: "system",
      traceId,
      payload: { command, error },
      severity: "error",
    });
  },

  async agentStarted(agentId: string, traceId: string, input?: Record<string, unknown>) {
    return logEvent({
      type: "agent.started",
      actor: agentId,
      traceId,
      payload: { input },
    });
  },

  async agentCompleted(agentId: string, traceId: string, output?: Record<string, unknown>) {
    return logEvent({
      type: "agent.completed",
      actor: agentId,
      traceId,
      payload: { output },
    });
  },

  async agentFailed(agentId: string, traceId: string, error: string) {
    return logEvent({
      type: "agent.failed",
      actor: agentId,
      traceId,
      payload: { error },
      severity: "error",
    });
  },

  async systemError(error: string, context?: Record<string, unknown>) {
    return logEvent({
      type: "system.error",
      actor: "system",
      payload: { error, ...context },
      severity: "error",
    });
  },
};

export default EventLedger;
