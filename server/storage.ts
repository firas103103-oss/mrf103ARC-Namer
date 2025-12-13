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
  AnalyticsData,
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
import { eq, desc, asc, sql, count, gte } from "drizzle-orm";
import { VIRTUAL_AGENTS } from "@shared/schema";

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
  createConversation(conversation: Conversation, userId?: string): Promise<StoredConversation>;
  getConversation(id: string): Promise<StoredConversation | undefined>;
  getConversations(): Promise<StoredConversation[]>;
  getConversationsByUser(userId: string): Promise<StoredConversation[]>;
  updateConversation(id: string, updates: Partial<Conversation>): Promise<StoredConversation | undefined>;
  deleteConversation(id: string): Promise<void>;

  // Chat Messages
  addMessage(conversationId: string, message: ChatMessage): Promise<StoredChatMessage>;
  getMessages(conversationId: string): Promise<StoredChatMessage[]>;

  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Analytics
  getAnalytics(userId: string): Promise<AnalyticsData>;
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
  async createConversation(conversation: Conversation, userId?: string): Promise<StoredConversation> {
    const [stored] = await db
      .insert(conversations)
      .values({
        title: conversation.title,
        activeAgents: conversation.activeAgents,
        userId: userId || null,
      })
      .returning();
    
    return {
      id: stored.id,
      title: stored.title,
      activeAgents: (stored.activeAgents || []) as AgentType[],
      createdAt: stored.createdAt!.toISOString(),
      updatedAt: stored.updatedAt!.toISOString(),
      userId: stored.userId || undefined,
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
      userId: row.userId || undefined,
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
      userId: row.userId || undefined,
    }));
  }

  async getConversationsByUser(userId: string): Promise<StoredConversation[]> {
    const rows = await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.updatedAt));
    return rows.map(row => ({
      id: row.id,
      title: row.title,
      activeAgents: (row.activeAgents || []) as AgentType[],
      createdAt: row.createdAt!.toISOString(),
      updatedAt: row.updatedAt!.toISOString(),
      userId: row.userId || undefined,
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
      userId: updated.userId || undefined,
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

  // Analytics
  async getAnalytics(userId: string): Promise<AnalyticsData> {
    // Get total conversations count
    const conversationCountResult = await db
      .select({ count: count() })
      .from(conversations)
      .where(eq(conversations.userId, userId));
    const totalConversations = conversationCountResult[0]?.count || 0;

    // Get user's conversations for message counting
    const userConversations = await db
      .select({ id: conversations.id })
      .from(conversations)
      .where(eq(conversations.userId, userId));
    const conversationIds = userConversations.map(c => c.id);

    // Get total messages count across user's conversations
    let totalMessages = 0;
    if (conversationIds.length > 0) {
      const messageCountResult = await db
        .select({ count: count() })
        .from(chatMessages)
        .where(sql`${chatMessages.conversationId} IN (${sql.join(conversationIds.map(id => sql`${id}`), sql`, `)})`);
      totalMessages = messageCountResult[0]?.count || 0;
    }

    // Get agent usage (group messages by agentId)
    let agentUsage: Array<{ agentId: string; agentName: string; messageCount: number }> = [];
    if (conversationIds.length > 0) {
      const agentUsageResult = await db
        .select({
          agentId: chatMessages.agentId,
          messageCount: count(),
        })
        .from(chatMessages)
        .where(sql`${chatMessages.conversationId} IN (${sql.join(conversationIds.map(id => sql`${id}`), sql`, `)}) AND ${chatMessages.agentId} IS NOT NULL`)
        .groupBy(chatMessages.agentId);

      agentUsage = agentUsageResult
        .filter(row => row.agentId)
        .map(row => {
          const agent = VIRTUAL_AGENTS.find(a => a.id === row.agentId);
          return {
            agentId: row.agentId!,
            agentName: agent?.name || row.agentId!,
            messageCount: row.messageCount,
          };
        })
        .sort((a, b) => b.messageCount - a.messageCount);
    }

    // Get daily activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    let dailyActivity: Array<{ date: string; messageCount: number }> = [];
    if (conversationIds.length > 0) {
      const dailyActivityResult = await db
        .select({
          date: sql<string>`DATE(${chatMessages.timestamp})`,
          messageCount: count(),
        })
        .from(chatMessages)
        .where(sql`${chatMessages.conversationId} IN (${sql.join(conversationIds.map(id => sql`${id}`), sql`, `)}) AND ${chatMessages.timestamp} >= ${thirtyDaysAgo}`)
        .groupBy(sql`DATE(${chatMessages.timestamp})`)
        .orderBy(sql`DATE(${chatMessages.timestamp})`);

      dailyActivity = dailyActivityResult.map(row => ({
        date: row.date,
        messageCount: row.messageCount,
      }));
    }

    // Get 10 most recent conversations with message counts
    const recentConversationsData = await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.updatedAt))
      .limit(10);

    const recentConversations = await Promise.all(
      recentConversationsData.map(async (conv) => {
        const messageCountResult = await db
          .select({ count: count() })
          .from(chatMessages)
          .where(eq(chatMessages.conversationId, conv.id));
        
        return {
          id: conv.id,
          title: conv.title,
          messageCount: messageCountResult[0]?.count || 0,
          lastActivity: conv.updatedAt?.toISOString() || new Date().toISOString(),
          agents: (conv.activeAgents || []) as string[],
        };
      })
    );

    return {
      totalConversations,
      totalMessages,
      agentUsage,
      dailyActivity,
      recentConversations,
    };
  }
}

export const storage = new DatabaseStorage();
