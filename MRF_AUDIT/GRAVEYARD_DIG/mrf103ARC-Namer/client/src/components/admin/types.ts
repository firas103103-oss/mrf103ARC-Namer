/**
 * Admin Types and Constants
 * Shared types for Admin components
 */

export interface Agent {
  id: string;
  name: string;
  role: string;
  systemPrompt: string;
  specializations: string[];
  capabilities: string[];
  model: string;
  temperature: number;
  maxTokens: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  type: "individual" | "company" | "enterprise";
  status: "active" | "paused" | "completed";
  assignedAgents: string[];
  owner: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CoreAgentCapability {
  id: string;
  name: string;
  type: "communication" | "automation" | "analysis" | "integration";
  enabled: boolean;
  config: Record<string, unknown>;
}

export const DEFAULT_AGENT_FORM: Partial<Agent> = {
  name: "",
  role: "",
  systemPrompt: "",
  specializations: [],
  capabilities: [],
  model: "gpt-4",
  temperature: 0.7,
  maxTokens: 4000,
  active: true,
};

export const DEFAULT_PROJECT_FORM: Partial<Project> = {
  name: "",
  description: "",
  type: "individual",
  status: "active",
  assignedAgents: [],
  owner: "",
};

export const CORE_CAPABILITIES: CoreAgentCapability[] = [
  {
    id: "email",
    name: "Email Management",
    type: "communication",
    enabled: true,
    config: { provider: "smtp", autoRespond: true }
  },
  {
    id: "whatsapp",
    name: "WhatsApp Integration",
    type: "communication",
    enabled: true,
    config: { businessApi: true, autoReply: true }
  },
  {
    id: "calls",
    name: "Phone Calls (Twilio)",
    type: "communication",
    enabled: false,
    config: { provider: "twilio", voiceAI: true }
  },
  {
    id: "social-media",
    name: "Social Media Manager",
    type: "automation",
    enabled: true,
    config: { platforms: ["twitter", "linkedin", "instagram"], autoPost: true }
  },
  {
    id: "ad-campaigns",
    name: "Ad Campaign Manager",
    type: "automation",
    enabled: true,
    config: { platforms: ["google-ads", "facebook-ads"], budget: 5000 }
  },
  {
    id: "web-scraping",
    name: "Web Data Extraction",
    type: "integration",
    enabled: true,
    config: { respectRobots: true, rateLimit: 10 }
  },
  {
    id: "market-analysis",
    name: "Market Intelligence",
    type: "analysis",
    enabled: true,
    config: { sources: ["news", "social", "competitor"], frequency: "daily" }
  },
];

export const MODEL_OPTIONS = [
  { value: "gpt-4", label: "GPT-4" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  { value: "claude-3-opus", label: "Claude 3 Opus" },
  { value: "claude-3-sonnet", label: "Claude 3 Sonnet" },
];
