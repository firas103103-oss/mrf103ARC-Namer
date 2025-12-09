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
}

export class MemStorage implements IStorage {
  private agentEvents: Map<string, StoredAgentEvent>;
  private ceoReminders: Map<string, StoredCeoReminder>;
  private executiveSummaries: Map<string, StoredExecutiveSummary>;
  private governanceNotifications: Map<string, StoredGovernanceNotification>;
  private ruleBroadcasts: Map<string, StoredRuleBroadcast>;
  private highPriorityNotifications: Map<string, StoredHighPriorityNotification>;

  constructor() {
    this.agentEvents = new Map();
    this.ceoReminders = new Map();
    this.executiveSummaries = new Map();
    this.governanceNotifications = new Map();
    this.ruleBroadcasts = new Map();
    this.highPriorityNotifications = new Map();
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
}

export const storage = new MemStorage();
