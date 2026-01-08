import fs from "fs";
import path from "path";
import type { Request, Response, NextFunction } from "express";
import logger from "./utils/logger";

export interface RateLimits {
  chat_per_minute: number;
  tts_per_minute: number;
  execute_per_minute: number;
}

export interface CostLimits {
  daily_usd: number;
  monthly_usd: number;
}

export interface GlobalContract {
  rate_limits: RateLimits;
  cost_limits: CostLimits;
  allowed_models: string[];
  max_token_output: number;
  require_auth: boolean;
}

export interface AgentContract {
  name: string;
  role: string;
  permissions: string[];
  restrictions: string[];
  priority: number;
  escalation_target: string | null;
  cost_multiplier: number;
}

export interface ActionContract {
  description: string;
  requires_auth: boolean;
  log_level: string;
  cost_per_call_usd: number;
}

export interface Contracts {
  global: GlobalContract;
  agents: Record<string, AgentContract>;
  actions: Record<string, ActionContract>;
  policies: {
    content_filtering: {
      enabled: boolean;
      block_patterns: string[];
    };
    audit_logging: {
      enabled: boolean;
      retention_days: number;
    };
    cost_tracking: {
      enabled: boolean;
      alert_threshold_usd: number;
    };
  };
}

export interface ContractsFile {
  version: string;
  updated_at: string;
  description: string;
  contracts: Contracts;
}

let cachedContracts: ContractsFile | null = null;
let lastLoadTime = 0;
const CACHE_TTL_MS = 60000;

const requestCounts: Map<string, { count: number; resetAt: number }> = new Map();

export function loadContracts(): ContractsFile {
  const now = Date.now();
  if (cachedContracts && now - lastLoadTime < CACHE_TTL_MS) {
    return cachedContracts;
  }

  const contractsPath = path.join(process.cwd(), "arc_core", "agent_contracts.json");

  try {
    const content = fs.readFileSync(contractsPath, "utf-8");
    cachedContracts = JSON.parse(content) as ContractsFile;
    lastLoadTime = now;
    return cachedContracts;
  } catch (e) {
    logger.error("[contracts] Failed to load contracts:", e);
    return getDefaultContracts();
  }
}

function getDefaultContracts(): ContractsFile {
  return {
    version: "1.0.0",
    updated_at: new Date().toISOString(),
    description: "Default contracts",
    contracts: {
      global: {
        rate_limits: { chat_per_minute: 30, tts_per_minute: 10, execute_per_minute: 60 },
        cost_limits: { daily_usd: 50, monthly_usd: 500 },
        allowed_models: ["gpt-4o", "gpt-4o-mini"],
        max_token_output: 4096,
        require_auth: true,
      },
      agents: {},
      actions: {},
      policies: {
        content_filtering: { enabled: false, block_patterns: [] },
        audit_logging: { enabled: true, retention_days: 90 },
        cost_tracking: { enabled: true, alert_threshold_usd: 10 },
      },
    },
  };
}

export function getAgentContract(agentId: string): AgentContract | null {
  const contracts = loadContracts();
  return contracts.contracts.agents[agentId] || null;
}

export function getActionContract(actionType: string): ActionContract | null {
  const contracts = loadContracts();
  return contracts.contracts.actions[actionType] || null;
}

export function checkPermission(agentId: string, action: string): boolean {
  const agentContract = getAgentContract(agentId);
  if (!agentContract) return true;
  if (agentContract.restrictions.includes(action)) return false;
  if (agentContract.permissions.length === 0) return true;
  return agentContract.permissions.includes(action);
}

export function checkRateLimit(key: string, limitType: keyof RateLimits): boolean {
  const contracts = loadContracts();
  const limit = contracts.contracts.global.rate_limits[limitType];
  const now = Date.now();
  const windowMs = 60000;

  const entry = requestCounts.get(key);
  if (!entry || now > entry.resetAt) {
    requestCounts.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count++;
  return true;
}

export function getContentFilterPatterns(): string[] {
  const contracts = loadContracts();
  if (!contracts.contracts.policies.content_filtering.enabled) return [];
  return contracts.contracts.policies.content_filtering.block_patterns;
}

export function filterContent(text: string): { filtered: boolean; reason?: string } {
  const patterns = getContentFilterPatterns();
  if (patterns.length === 0) return { filtered: false };

  const lowerText = text.toLowerCase();
  for (const pattern of patterns) {
    if (lowerText.includes(pattern.toLowerCase())) {
      return { filtered: true, reason: `Content contains blocked pattern: ${pattern}` };
    }
  }

  return { filtered: false };
}

export function contractsMiddleware(action: string, limitType: keyof RateLimits) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.claims?.sub || "anonymous";
    const agentId = req.body?.agent_id || req.body?.agentId || "system";
    const rateLimitKey = `${userId}:${limitType}`;

    if (!checkRateLimit(rateLimitKey, limitType)) {
      return res.status(429).json({
        success: false,
        error: "Rate limit exceeded",
        limit_type: limitType,
      });
    }

    if (!checkPermission(agentId, action)) {
      return res.status(403).json({
        success: false,
        error: `Agent ${agentId} does not have permission for action: ${action}`,
      });
    }

    const message = req.body?.message || req.body?.text || "";
    if (message) {
      const filterResult = filterContent(message);
      if (filterResult.filtered) {
        return res.status(400).json({
          success: false,
          error: filterResult.reason,
        });
      }
    }

    next();
  };
}

export function getContractsSummary(): {
  version: string;
  agent_count: number;
  action_count: number;
  policies_enabled: string[];
} {
  const contracts = loadContracts();
  const policiesEnabled: string[] = [];

  if (contracts.contracts.policies.content_filtering.enabled) {
    policiesEnabled.push("content_filtering");
  }
  if (contracts.contracts.policies.audit_logging.enabled) {
    policiesEnabled.push("audit_logging");
  }
  if (contracts.contracts.policies.cost_tracking.enabled) {
    policiesEnabled.push("cost_tracking");
  }

  return {
    version: contracts.version,
    agent_count: Object.keys(contracts.contracts.agents).length,
    action_count: Object.keys(contracts.contracts.actions).length,
    policies_enabled: policiesEnabled,
  };
}
