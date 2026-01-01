/**
 * Agent Registry
 * ADR-003: Multi-Agent Routing Core (v0.2)
 * 
 * Defines all available agents and their capabilities.
 * Server-side only, no client exposure.
 */

export interface Agent {
  id: string;
  name: string;
  role: "chat" | "voice" | "knowledge" | "automation";
  capabilities: string[];
  model?: string;
  endpoint: string;
  isDefault: boolean;
  status: "active" | "beta" | "maintenance";
  description?: string;
}

export interface Message {
  text: string;
  agentId?: string;
  context?: Record<string, unknown>;
}

/**
 * Agent Registry
 * Add agents here as they are developed (v0.2.1+)
 */
export const AGENTS: Record<string, Agent> = {
  mrf: {
    id: "mrf",
    name: "Mr.F",
    role: "chat",
    capabilities: ["openai", "memory", "reasoning"],
    model: "gpt-4o-mini",
    endpoint: "/agents/mrf",
    isDefault: true,
    status: "active",
    description: "Primary conversational AI agent (OpenAI GPT-4o-mini)",
  },
  // Future agents:
  // knowledge: {
  //   id: "knowledge",
  //   name: "Knowledge Agent",
  //   role: "knowledge",
  //   capabilities: ["supabase", "embedding", "retrieval"],
  //   endpoint: "/agents/knowledge",
  //   isDefault: false,
  //   status: "beta"
  // },
  // automation: {
  //   id: "automation",
  //   name: "Automation Agent",
  //   role: "automation",
  //   capabilities: ["n8n", "webhooks", "scheduling"],
  //   endpoint: "/agents/automation",
  //   isDefault: false,
  //   status: "beta"
  // }
};

/**
 * Route message to appropriate agent
 * 
 * v0.2: Basic routing (defaults to Mr.F)
 * v0.2.1+: Intelligent routing based on message content
 */
export function routeToAgent(message: Message): Agent {
  // If agent explicitly specified, use it
  if (message.agentId && AGENTS[message.agentId]) {
    const agent = AGENTS[message.agentId];
    if (agent.status === "active") {
      return agent;
    }
    // If specified agent is not active, fall back to default
    console.warn(`[Agent Routing] Agent ${message.agentId} not active, falling back to default`);
  }

  // Future: Intelligent routing
  // if (message.text.includes("know")) return AGENTS["knowledge"];
  // if (message.text.includes("automate")) return AGENTS["automation"];

  // Default: Mr.F
  return AGENTS["mrf"];
}

/**
 * Get all active agents
 */
export function getActiveAgents(): Agent[] {
  return Object.values(AGENTS).filter((agent) => agent.status === "active");
}

/**
 * Get agent by ID
 */
export function getAgent(id: string): Agent | undefined {
  return AGENTS[id];
}
