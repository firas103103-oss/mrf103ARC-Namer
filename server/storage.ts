import { randomUUID } from "crypto";
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
} from "@shared/schema";

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

  // Chat Messages
  addMessage(conversationId: string, message: ChatMessage): Promise<StoredChatMessage>;
  getMessages(conversationId: string): Promise<StoredChatMessage[]>;
}

export class MemStorage implements IStorage {
  private agentEvents: Map<string, StoredAgentEvent>;
  private ceoReminders: Map<string, StoredCeoReminder>;
  private executiveSummaries: Map<string, StoredExecutiveSummary>;
  private governanceNotifications: Map<string, StoredGovernanceNotification>;
  private ruleBroadcasts: Map<string, StoredRuleBroadcast>;
  private highPriorityNotifications: Map<string, StoredHighPriorityNotification>;
  private conversations: Map<string, StoredConversation>;
  private chatMessages: Map<string, StoredChatMessage>;

  constructor() {
    this.agentEvents = new Map();
    this.ceoReminders = new Map();
    this.executiveSummaries = new Map();
    this.governanceNotifications = new Map();
    this.ruleBroadcasts = new Map();
    this.highPriorityNotifications = new Map();
    this.conversations = new Map();
    this.chatMessages = new Map();
  }

  // Agent Events
  async storeAgentEvent(event: AgentEvent): Promise<StoredAgentEvent> {
    const id = randomUUID();
    const stored: StoredAgentEvent = {
      ...event,
      id,
      received_at: new Date().toISOString(),
    };
    this.agentEvents.set(id, stored);
    return stored;
  }

  async getAgentEvents(): Promise<StoredAgentEvent[]> {
    return Array.from(this.agentEvents.values());
  }

  // CEO Reminders
  async storeCeoReminder(reminder: CeoReminder): Promise<StoredCeoReminder> {
    const id = randomUUID();
    const stored: StoredCeoReminder = {
      ...reminder,
      id,
      received_at: new Date().toISOString(),
    };
    this.ceoReminders.set(id, stored);
    return stored;
  }

  async getCeoReminders(): Promise<StoredCeoReminder[]> {
    return Array.from(this.ceoReminders.values());
  }

  // Executive Summaries
  async storeExecutiveSummary(date: string, summary: ExecutiveSummaryResponse): Promise<StoredExecutiveSummary> {
    const id = randomUUID();
    const stored: StoredExecutiveSummary = {
      ...summary,
      id,
      date,
      generated_at: new Date().toISOString(),
    };
    this.executiveSummaries.set(id, stored);
    return stored;
  }

  async getExecutiveSummaries(): Promise<StoredExecutiveSummary[]> {
    return Array.from(this.executiveSummaries.values());
  }

  // Governance Notifications
  async storeGovernanceNotification(notification: GovernanceNotification): Promise<StoredGovernanceNotification> {
    const id = randomUUID();
    const stored: StoredGovernanceNotification = {
      ...notification,
      id,
      received_at: new Date().toISOString(),
    };
    this.governanceNotifications.set(id, stored);
    return stored;
  }

  async getGovernanceNotifications(): Promise<StoredGovernanceNotification[]> {
    return Array.from(this.governanceNotifications.values());
  }

  // Rule Broadcasts
  async storeRuleBroadcast(broadcast: RuleBroadcast): Promise<StoredRuleBroadcast> {
    const id = randomUUID();
    const stored: StoredRuleBroadcast = {
      ...broadcast,
      id,
      broadcast_at: new Date().toISOString(),
    };
    this.ruleBroadcasts.set(id, stored);
    return stored;
  }

  async getRuleBroadcasts(): Promise<StoredRuleBroadcast[]> {
    return Array.from(this.ruleBroadcasts.values());
  }

  // High Priority Notifications
  async storeHighPriorityNotification(notification: HighPriorityNotification): Promise<StoredHighPriorityNotification> {
    const id = randomUUID();
    const stored: StoredHighPriorityNotification = {
      ...notification,
      id,
      received_at: new Date().toISOString(),
    };
    this.highPriorityNotifications.set(id, stored);
    return stored;
  }

  async getHighPriorityNotifications(): Promise<StoredHighPriorityNotification[]> {
    return Array.from(this.highPriorityNotifications.values());
  }

  // Chat Conversations
  async createConversation(conversation: Conversation): Promise<StoredConversation> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const stored: StoredConversation = {
      ...conversation,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.conversations.set(id, stored);
    return stored;
  }

  async getConversation(id: string): Promise<StoredConversation | undefined> {
    return this.conversations.get(id);
  }

  async getConversations(): Promise<StoredConversation[]> {
    return Array.from(this.conversations.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<StoredConversation | undefined> {
    const existing = this.conversations.get(id);
    if (!existing) return undefined;
    
    const updated: StoredConversation = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.conversations.set(id, updated);
    return updated;
  }

  // Chat Messages
  async addMessage(conversationId: string, message: ChatMessage): Promise<StoredChatMessage> {
    const id = randomUUID();
    const stored: StoredChatMessage = {
      ...message,
      id,
      conversationId,
      timestamp: message.timestamp || new Date().toISOString(),
    };
    this.chatMessages.set(id, stored);
    
    // Update conversation's updatedAt
    await this.updateConversation(conversationId, {});
    
    return stored;
  }

  async getMessages(conversationId: string): Promise<StoredChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime());
  }
}

export const storage = new MemStorage();
