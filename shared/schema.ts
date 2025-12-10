import { z } from "zod";

// ============================================
// Virtual Office Agent Definitions
// ============================================
export const agentTypeSchema = z.enum([
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
