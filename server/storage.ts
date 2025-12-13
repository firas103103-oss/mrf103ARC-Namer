import type {
  StoredAgentEvent,
  AgentEvent,
  StoredCeoReminder,
  CeoReminder,
  StoredExecutiveSummary,
  ExecutiveSummaryResponse,
  StoredGovernanceNotification,
  GovernanceNotification,
  StoredRuleBroadcast,
  RuleBroadcast,
  StoredHighPriorityNotification,
  HighPriorityNotification,
  StoredChatMessage,
  ChatMessage,
  StoredConversation,
  Conversation,
  User,
  UpsertUser,
  AgentType,
} from "@shared/schema";
import {
  users,
  conversations,
  chatMessages,
  agentEvents,
  ceoReminders,
  executiveSummaries,
  governanceNotifications,
  ruleBroadcasts,
  highPriorityNotifications,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc } from "drizzle-orm";

export interface IStorage {
  // Agent Events
  storeAgentEvent(event: AgentEvent): Promise<StoredAgentEvent>;
  getAgentEvents(): Promise<StoredAgentEvent[]>;

  // CEO Reminders
  storeCeoReminder(reminder: CeoReminder): Promise<StoredCeoReminder>;
  getCeoReminders(): Promise<StoredCeoReminder[]>;

  // Executive Summaries
  storeExecutiveSummary(date: string, summary: ExecutiveSummaryResponse): Promise<StoredExecutiveSummary>;
  getExecutiveSummaries(): Promise<StoredExecutiveSummary[]>;

  // Governance Notifications
  storeGovernanceNotification(notification: GovernanceNotification): Promise<StoredGovernanceNotification>;
  getGovernanceNotifications(): Promise<StoredGovernanceNotification[]>;

  // Rule Broadcasts
  storeRuleBroadcast(broadcast: RuleBroadcast): Promise<StoredRuleBroadcast>;
  getRuleBroadcasts(): Promise<StoredRuleBroadcast[]>;

  // High Priority Notifications
  storeHighPriorityNotification(notification: HighPriorityNotification): Promise<StoredHighPriorityNotification>;
  getHighPriorityNotifications(): Promise<StoredHighPriorityNotification[]>;

  // Chat Conversations
  createConversation(conversation: Conversation): Promise<StoredConversation>;
  getConversation(id: string): Promise<StoredConversation | undefined>;
  getConversations(): Promise<StoredConversation[]>;
  updateConversation(id: string, updates: Partial<Conversation>): Promise<StoredConversation | undefined>;
  deleteConversation(id: string): Promise<void>;

  // Chat Messages
  addMessage(conversationId: string, message: ChatMessage): Promise<StoredChatMessage>;
  getMessages(conversationId: string): Promise<StoredChatMessage[]>;

  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  // Agent Events
  async storeAgentEvent(event: AgentEvent): Promise<StoredAgentEvent> {
    const [stored] = await db
      .insert(agentEvents)
      .values({
        eventId: event.event_id,
        agentId: event.agent_id,
        type: event.type,
        payload: event.payload,
        createdAt: event.created_at ? new Date(event.created_at) : null,
      })
      .returning();
    
    return {
      id: stored.id,
      event_id: stored.eventId,
      agent_id: stored.agentId,
      type: stored.type as "message" | "report" | "heartbeat" | "rule_update",
      payload: (stored.payload as Record<string, unknown>) || {},
      created_at: stored.createdAt?.toISOString(),
      received_at: stored.receivedAt!.toISOString(),
    };
  }

  async getAgentEvents(): Promise<StoredAgentEvent[]> {
    const rows = await db.select().from(agentEvents);
    return rows.map(row => ({
      id: row.id,
      event_id: row.eventId,
      agent_id: row.agentId,
      type: row.type as "message" | "report" | "heartbeat" | "rule_update",
      payload: (row.payload as Record<string, unknown>) || {},
      created_at: row.createdAt?.toISOString(),
      received_at: row.receivedAt!.toISOString(),
    }));
  }

  // CEO Reminders
  async storeCeoReminder(reminder: CeoReminder): Promise<StoredCeoReminder> {
    const [stored] = await db
      .insert(ceoReminders)
      .values({
        date: reminder.date,
        missingCeos: reminder.missing_ceos,
      })
      .returning();
    
    return {
      id: stored.id,
      date: stored.date,
      missing_ceos: stored.missingCeos || [],
      received_at: stored.receivedAt!.toISOString(),
    };
  }

  async getCeoReminders(): Promise<StoredCeoReminder[]> {
    const rows = await db.select().from(ceoReminders);
    return rows.map(row => ({
      id: row.id,
      date: row.date,
      missing_ceos: row.missingCeos || [],
      received_at: row.receivedAt!.toISOString(),
    }));
  }

  // Executive Summaries
  async storeExecutiveSummary(date: string, summary: ExecutiveSummaryResponse): Promise<StoredExecutiveSummary> {
    const [stored] = await db
      .insert(executiveSummaries)
      .values({
        date,
        summaryText: summary.summary_text,
        profitScore: summary.profit_score,
        riskScore: summary.risk_score,
        topDecisions: summary.top_decisions,
      })
      .returning();
    
    return {
      id: stored.id,
      date: stored.date,
      summary_text: stored.summaryText,
      profit_score: stored.profitScore || 0,
      risk_score: stored.riskScore || 0,
      top_decisions: stored.topDecisions || [],
      generated_at: stored.generatedAt!.toISOString(),
    };
  }

  async getExecutiveSummaries(): Promise<StoredExecutiveSummary[]> {
    const rows = await db.select().from(executiveSummaries);
    return rows.map(row => ({
      id: row.id,
      date: row.date,
      summary_text: row.summaryText,
      profit_score: row.profitScore || 0,
      risk_score: row.riskScore || 0,
      top_decisions: row.topDecisions || [],
      generated_at: row.generatedAt!.toISOString(),
    }));
  }

  // Governance Notifications
  async storeGovernanceNotification(notification: GovernanceNotification): Promise<StoredGovernanceNotification> {
    const [stored] = await db
      .insert(governanceNotifications)
      .values({
        ruleId: notification.rule_id,
        status: notification.status,
        title: notification.title,
        summary: notification.summary,
        proposerAgentId: notification.proposer_agent_id,
      })
      .returning();
    
    return {
      id: stored.id,
      rule_id: stored.ruleId,
      status: stored.status as "PROPOSED" | "REVIEWED" | "ACTIVE",
      title: stored.title,
      summary: stored.summary || "",
      proposer_agent_id: stored.proposerAgentId || "",
      received_at: stored.receivedAt!.toISOString(),
    };
  }

  async getGovernanceNotifications(): Promise<StoredGovernanceNotification[]> {
    const rows = await db.select().from(governanceNotifications);
    return rows.map(row => ({
      id: row.id,
      rule_id: row.ruleId,
      status: row.status as "PROPOSED" | "REVIEWED" | "ACTIVE",
      title: row.title,
      summary: row.summary || "",
      proposer_agent_id: row.proposerAgentId || "",
      received_at: row.receivedAt!.toISOString(),
    }));
  }

  // Rule Broadcasts
  async storeRuleBroadcast(broadcast: RuleBroadcast): Promise<StoredRuleBroadcast> {
    const [stored] = await db
      .insert(ruleBroadcasts)
      .values({
        ruleId: broadcast.rule_id,
        effectiveAt: new Date(broadcast.effective_at),
        status: broadcast.status,
        title: broadcast.title,
      })
      .returning();
    
    return {
      id: stored.id,
      rule_id: stored.ruleId,
      effective_at: stored.effectiveAt!.toISOString(),
      status: stored.status as "ACTIVE" | "INACTIVE" | "PROPOSED",
      title: stored.title,
      broadcast_at: stored.broadcastAt!.toISOString(),
    };
  }

  async getRuleBroadcasts(): Promise<StoredRuleBroadcast[]> {
    const rows = await db.select().from(ruleBroadcasts);
    return rows.map(row => ({
      id: row.id,
      rule_id: row.ruleId,
      effective_at: row.effectiveAt?.toISOString() || "",
      status: row.status as "ACTIVE" | "INACTIVE" | "PROPOSED",
      title: row.title,
      broadcast_at: row.broadcastAt!.toISOString(),
    }));
  }

  // High Priority Notifications
  async storeHighPriorityNotification(notification: HighPriorityNotification): Promise<StoredHighPriorityNotification> {
    const [stored] = await db
      .insert(highPriorityNotifications)
      .values({
        sourceAgentId: notification.source_agent_id,
        severity: notification.severity,
        title: notification.title,
        body: notification.body,
        context: notification.context,
      })
      .returning();
    
    return {
      id: stored.id,
      source_agent_id: stored.sourceAgentId,
      severity: stored.severity as "HIGH" | "WARNING",
      title: stored.title,
      body: stored.body || "",
      context: (stored.context as Record<string, unknown>) || {},
      received_at: stored.receivedAt!.toISOString(),
    };
  }

  async getHighPriorityNotifications(): Promise<StoredHighPriorityNotification[]> {
    const rows = await db.select().from(highPriorityNotifications);
    return rows.map(row => ({
      id: row.id,
      source_agent_id: row.sourceAgentId,
      severity: row.severity as "HIGH" | "WARNING",
      title: row.title,
      body: row.body || "",
      context: (row.context as Record<string, unknown>) || {},
      received_at: row.receivedAt!.toISOString(),
    }));
  }

  // Chat Conversations
  async createConversation(conversation: Conversation): Promise<StoredConversation> {
    const [stored] = await db
      .insert(conversations)
      .values({
        title: conversation.title,
        activeAgents: conversation.activeAgents,
      })
      .returning();
    
    return {
      id: stored.id,
      title: stored.title,
      activeAgents: (stored.activeAgents || []) as AgentType[],
      createdAt: stored.createdAt!.toISOString(),
      updatedAt: stored.updatedAt!.toISOString(),
    };
  }

  async getConversation(id: string): Promise<StoredConversation | undefined> {
    const [row] = await db.select().from(conversations).where(eq(conversations.id, id));
    if (!row) return undefined;
    
    return {
      id: row.id,
      title: row.title,
      activeAgents: (row.activeAgents || []) as AgentType[],
      createdAt: row.createdAt!.toISOString(),
      updatedAt: row.updatedAt!.toISOString(),
    };
  }

  async getConversations(): Promise<StoredConversation[]> {
    const rows = await db.select().from(conversations).orderBy(desc(conversations.updatedAt));
    return rows.map(row => ({
      id: row.id,
      title: row.title,
      activeAgents: (row.activeAgents || []) as AgentType[],
      createdAt: row.createdAt!.toISOString(),
      updatedAt: row.updatedAt!.toISOString(),
    }));
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<StoredConversation | undefined> {
    const updateValues: Record<string, unknown> = { updatedAt: new Date() };
    if (updates.title !== undefined) updateValues.title = updates.title;
    if (updates.activeAgents !== undefined) updateValues.activeAgents = updates.activeAgents;
    
    const [updated] = await db
      .update(conversations)
      .set(updateValues)
      .where(eq(conversations.id, id))
      .returning();
    
    if (!updated) return undefined;
    
    return {
      id: updated.id,
      title: updated.title,
      activeAgents: (updated.activeAgents || []) as AgentType[],
      createdAt: updated.createdAt!.toISOString(),
      updatedAt: updated.updatedAt!.toISOString(),
    };
  }

  async deleteConversation(id: string): Promise<void> {
    await db.delete(chatMessages).where(eq(chatMessages.conversationId, id));
    await db.delete(conversations).where(eq(conversations.id, id));
  }

  // Chat Messages
  async addMessage(conversationId: string, message: ChatMessage): Promise<StoredChatMessage> {
    const [stored] = await db
      .insert(chatMessages)
      .values({
        conversationId,
        role: message.role,
        content: message.content,
        agentId: message.agentId,
        timestamp: message.timestamp ? new Date(message.timestamp) : new Date(),
      })
      .returning();
    
    await this.updateConversation(conversationId, {});
    
    return {
      id: stored.id,
      conversationId: stored.conversationId,
      role: stored.role as "user" | "assistant",
      content: stored.content,
      agentId: stored.agentId as AgentType | undefined,
      timestamp: stored.timestamp!.toISOString(),
    };
  }

  async getMessages(conversationId: string): Promise<StoredChatMessage[]> {
    const rows = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.conversationId, conversationId))
      .orderBy(asc(chatMessages.timestamp));
    
    return rows.map(row => ({
      id: row.id,
      conversationId: row.conversationId,
      role: row.role as "user" | "assistant",
      content: row.content,
      agentId: row.agentId as AgentType | undefined,
      timestamp: row.timestamp!.toISOString(),
    }));
  }

  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
}

export const storage = new DatabaseStorage();
