/**
 * Agent Registry
 * Phase 3: Agents Registry & Routing
 * 
 * Agents are first-class, deterministic.
 * - Load from database (agent_registry table)
 * - Fallback to static config if DB unavailable
 * - Full lifecycle logging via Event Ledger
 */

import { supabase, isSupabaseConfigured } from "../supabase";
import EventLedger, { generateTraceId } from "../services/event-ledger";
import logger from "../utils/logger";

// ============================================
// TYPES
// ============================================

export interface Agent {
  id: string;
  name: string;
  slug: string;
  role: "chat" | "voice" | "knowledge" | "automation";
  capabilities: string[];
  scopes: string[];
  model?: string;
  config: Record<string, unknown>;
  endpoint: string;
  isDefault: boolean;
  status: "active" | "beta" | "maintenance" | "disabled";
  description?: string;
}

export interface Message {
  text: string;
  agentId?: string;
  context?: Record<string, unknown>;
}

export interface AgentExecutionResult {
  success: boolean;
  output?: unknown;
  error?: string;
  durationMs: number;
}

// ============================================
// STATIC FALLBACK (if DB unavailable)
// ============================================

const STATIC_AGENTS: Record<string, Agent> = {
  mrf: {
    id: "mrf",
    name: "Mr.F",
    slug: "mrf",
    role: "chat",
    capabilities: ["chat", "voice", "reasoning", "memory"],
    scopes: ["read:messages", "write:messages", "execute:commands"],
    model: "gpt-4o-mini",
    config: { temperature: 0.7 },
    endpoint: "/agents/mrf",
    isDefault: true,
    status: "active",
    description: "Primary conversational AI agent (OpenAI GPT-4o-mini)",
  },
};

// ============================================
// AGENT CACHE
// ============================================

const agentCache: Map<string, Agent> = new Map();
let cacheLoaded = false;

/**
 * Load agents from database into cache
 */
async function loadAgentsFromDB(): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) {
    logger.warn("[AgentRegistry] Supabase not configured, using static agents");
    Object.values(STATIC_AGENTS).forEach(agent => {
      agentCache.set(agent.slug, agent);
    });
    cacheLoaded = true;
    return;
  }

  try {
    const { data, error } = await supabase
      .from("agent_registry")
      .select("*")
      .order("name");

    if (error) {
      logger.error("[AgentRegistry] Failed to load from DB:", error.message);
      // Fallback to static
      Object.values(STATIC_AGENTS).forEach(agent => {
        agentCache.set(agent.slug, agent);
      });
    } else {
      agentCache.clear();
      (data || []).forEach((row: any) => {
        const agent: Agent = {
          id: row.id,
          name: row.name,
          slug: row.slug,
          role: "chat", // Default role
          capabilities: row.capabilities || [],
          scopes: row.scopes || [],
          config: row.config || {},
          model: row.config?.model,
          endpoint: `/agents/${row.slug}`,
          isDefault: row.slug === "mrf",
          status: row.status || "active",
          description: row.config?.description,
        };
        agentCache.set(agent.slug, agent);
      });
      console.log(`✅ AgentRegistry loaded ${agentCache.size} agents from DB`);
    }
  } catch (err) {
    logger.error("[AgentRegistry] DB load error:", err);
    Object.values(STATIC_AGENTS).forEach(agent => {
      agentCache.set(agent.slug, agent);
    });
  }

  cacheLoaded = true;
}

/**
 * Ensure cache is loaded
 */
async function ensureCacheLoaded(): Promise<void> {
  if (!cacheLoaded) {
    await loadAgentsFromDB();
  }
}

/**
 * Refresh agent cache from database
 */
export async function refreshAgentCache(): Promise<void> {
  cacheLoaded = false;
  await loadAgentsFromDB();
}

// ============================================
// AGENT LOOKUP
// ============================================

/**
 * Get all registered agents
 */
export async function getAllAgents(): Promise<Agent[]> {
  await ensureCacheLoaded();
  return Array.from(agentCache.values());
}

/**
 * Get all active agents
 */
export async function getActiveAgents(): Promise<Agent[]> {
  await ensureCacheLoaded();
  return Array.from(agentCache.values()).filter(a => a.status === "active");
}

/**
 * Get agent by slug
 */
export async function getAgent(slug: string): Promise<Agent | undefined> {
  await ensureCacheLoaded();
  return agentCache.get(slug);
}

/**
 * Get agent by ID (UUID)
 */
export async function getAgentById(id: string): Promise<Agent | undefined> {
  await ensureCacheLoaded();
  return Array.from(agentCache.values()).find(a => a.id === id);
}

/**
 * Get the default agent (Mr.F)
 */
export async function getDefaultAgent(): Promise<Agent> {
  await ensureCacheLoaded();
  const defaultAgent = Array.from(agentCache.values()).find(a => a.isDefault);
  return defaultAgent || STATIC_AGENTS.mrf;
}

// ============================================
// AGENT ROUTING
// ============================================

/**
 * Route message to appropriate agent
 * Deterministic routing based on:
 * 1. Explicit agent ID in message
 * 2. Command keyword matching
 * 3. Default agent (Mr.F)
 */
export async function routeToAgent(message: Message): Promise<Agent> {
  await ensureCacheLoaded();
  
  // 1. Explicit agent specified
  if (message.agentId) {
    const agent = agentCache.get(message.agentId);
    if (agent && agent.status === "active") {
      return agent;
    }
    logger.warn(`[AgentRouter] Agent ${message.agentId} not active, falling back to default`);
  }

  // 2. Keyword-based routing (deterministic)
  const text = message.text.toLowerCase();
  
  // Future: Add more agents and routing rules
  // if (text.includes("search") || text.includes("find")) return knowledgeAgent;
  // if (text.includes("schedule") || text.includes("automate")) return automationAgent;

  // 3. Default agent
  return getDefaultAgent();
}

/**
 * Route command to agent (for CLI-style commands)
 */
export async function routeCommandToAgent(command: string): Promise<Agent> {
  await ensureCacheLoaded();

  // Command-based routing map
  const commandRoutes: Record<string, string> = {
    "chat": "mrf",
    "talk": "mrf",
    "ask": "mrf",
    // Future:
    // "search": "knowledge",
    // "schedule": "automation",
    // "analyze": "analyst",
  };

  const firstWord = command.split(" ")[0].toLowerCase();
  const agentSlug = commandRoutes[firstWord];

  if (agentSlug) {
    const agent = agentCache.get(agentSlug);
    if (agent && agent.status === "active") {
      return agent;
    }
  }

  return getDefaultAgent();
}

// ============================================
// AGENT LIFECYCLE LOGGING
// ============================================

/**
 * Log agent execution start
 */
export async function logAgentStarted(
  agent: Agent,
  input: Record<string, unknown>,
  traceId?: string
): Promise<string> {
  const trace = traceId || generateTraceId();
  
  await EventLedger.agentStarted(agent.slug, trace, {
    agent_name: agent.name,
    agent_id: agent.id,
    capabilities: agent.capabilities,
    input,
  });

  return trace;
}

/**
 * Log agent execution completed
 */
export async function logAgentCompleted(
  agent: Agent,
  traceId: string,
  result: AgentExecutionResult
): Promise<void> {
  await EventLedger.agentCompleted(agent.slug, traceId, {
    agent_name: agent.name,
    success: result.success,
    duration_ms: result.durationMs,
    output_type: typeof result.output,
  });
}

/**
 * Log agent execution failed
 */
export async function logAgentFailed(
  agent: Agent,
  traceId: string,
  error: string
): Promise<void> {
  await EventLedger.agentFailed(agent.slug, traceId, error);
}

/**
 * Execute agent with full lifecycle logging
 */
export async function executeAgent(
  agent: Agent,
  input: Record<string, unknown>,
  executor: () => Promise<unknown>,
  parentTraceId?: string
): Promise<AgentExecutionResult> {
  const traceId = parentTraceId || generateTraceId();
  const startTime = Date.now();

  // Log start
  await logAgentStarted(agent, input, traceId);

  try {
    // Execute
    const output = await executor();
    const durationMs = Date.now() - startTime;

    // Log success
    const result: AgentExecutionResult = {
      success: true,
      output,
      durationMs,
    };
    await logAgentCompleted(agent, traceId, result);

    return result;
  } catch (err) {
    const durationMs = Date.now() - startTime;
    const errorMessage = err instanceof Error ? err.message : String(err);

    // Log failure
    await logAgentFailed(agent, traceId, errorMessage);

    return {
      success: false,
      error: errorMessage,
      durationMs,
    };
  }
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize the agent registry
 * Called at server startup
 */
export async function initializeAgentRegistry(): Promise<void> {
  await loadAgentsFromDB();
  const activeCount = (await getActiveAgents()).length;
  console.log(`✅ Agent Registry initialized: ${activeCount} active agents`);
}

// ============================================
// LEGACY COMPATIBILITY
// ============================================

// Keep AGENTS export for backwards compatibility
export const AGENTS = STATIC_AGENTS;

// ============================================
// EXPORTS
// ============================================

export const AgentRegistry = {
  // Lookup
  getAllAgents,
  getActiveAgents,
  getAgent,
  getAgentById,
  getDefaultAgent,
  refreshAgentCache,
  
  // Routing
  routeToAgent,
  routeCommandToAgent,
  
  // Lifecycle
  logAgentStarted,
  logAgentCompleted,
  logAgentFailed,
  executeAgent,
  
  // Init
  initializeAgentRegistry,
};

export default AgentRegistry;
