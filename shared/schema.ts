import { z } from "zod";

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
