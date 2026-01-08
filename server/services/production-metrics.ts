/**
 * ARC Production Metrics Service
 * 
 * Collects and exposes:
 * - Request counts and error rates
 * - Response latency percentiles
 * - System health indicators
 * - Feature flag states
 * 
 * Phase 5: Production Hardening
 */

import { supabase } from "../supabase";
import { TenantService } from "./tenant-service.js";

// ============================================================================
// TYPES
// ============================================================================

export interface HealthCheck {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database: HealthComponent;
    session: HealthComponent;
    eventLedger: HealthComponent;
    agentRegistry: HealthComponent;
  };
  metrics: MetricsSummary;
  features: Record<string, boolean>;
}

export interface HealthComponent {
  status: "up" | "down" | "degraded";
  latency?: number;
  error?: string;
  lastChecked: string;
}

export interface MetricsSummary {
  requests: {
    total: number;
    success: number;
    errors: number;
    errorRate: string;
  };
  latency: {
    p50: number;
    p95: number;
    p99: number;
    avg: number;
  };
  uptime: {
    startTime: string;
    seconds: number;
    formatted: string;
  };
}

// ============================================================================
// IN-MEMORY METRICS COLLECTOR
// ============================================================================

interface RequestRecord {
  timestamp: number;
  latency: number;
  status: number;
  path: string;
}

const METRICS_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_RECORDS = 10000;

class MetricsCollector {
  private records: RequestRecord[] = [];
  private startTime: Date;

  constructor() {
    this.startTime = new Date();
  }

  record(path: string, latency: number, status: number): void {
    const now = Date.now();
    
    // Add new record
    this.records.push({
      timestamp: now,
      latency,
      status,
      path,
    });

    // Prune old records
    if (this.records.length > MAX_RECORDS) {
      const cutoff = now - METRICS_WINDOW_MS;
      this.records = this.records.filter(r => r.timestamp > cutoff);
    }
  }

  getSummary(): MetricsSummary {
    const now = Date.now();
    const cutoff = now - METRICS_WINDOW_MS;
    
    // Filter to recent records
    const recent = this.records.filter(r => r.timestamp > cutoff);
    
    const total = recent.length;
    const errors = recent.filter(r => r.status >= 400).length;
    const success = total - errors;
    
    // Calculate latency percentiles
    const latencies = recent.map(r => r.latency).sort((a, b) => a - b);
    
    const uptimeSeconds = Math.floor((now - this.startTime.getTime()) / 1000);

    return {
      requests: {
        total,
        success,
        errors,
        errorRate: total > 0 ? `${((errors / total) * 100).toFixed(2)}%` : "0.00%",
      },
      latency: {
        p50: percentile(latencies, 50),
        p95: percentile(latencies, 95),
        p99: percentile(latencies, 99),
        avg: latencies.length > 0 ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0,
      },
      uptime: {
        startTime: this.startTime.toISOString(),
        seconds: uptimeSeconds,
        formatted: formatUptime(uptimeSeconds),
      },
    };
  }

  getStartTime(): Date {
    return this.startTime;
  }
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (mins > 0) parts.push(`${mins}m`);
  parts.push(`${secs}s`);

  return parts.join(" ");
}

// Singleton instance
export const metricsCollector = new MetricsCollector();

// ============================================================================
// HEALTH CHECK SERVICE
// ============================================================================

export async function performHealthCheck(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  // Run all checks in parallel
  const [dbCheck, sessionCheck, ledgerCheck, registryCheck, features] = await Promise.all([
    checkDatabase(),
    checkSessions(),
    checkEventLedger(),
    checkAgentRegistry(),
    getFeatureFlagStates(),
  ]);

  // Determine overall status
  const allChecks = [dbCheck, sessionCheck, ledgerCheck, registryCheck];
  const downCount = allChecks.filter(c => c.status === "down").length;
  const degradedCount = allChecks.filter(c => c.status === "degraded").length;

  let status: "healthy" | "degraded" | "unhealthy";
  if (downCount > 0) {
    status = "unhealthy";
  } else if (degradedCount > 0) {
    status = "degraded";
  } else {
    status = "healthy";
  }

  const uptimeSeconds = Math.floor((Date.now() - metricsCollector.getStartTime().getTime()) / 1000);

  return {
    status,
    timestamp: new Date().toISOString(),
    uptime: uptimeSeconds,
    version: process.env.npm_package_version || "2.1.0",
    checks: {
      database: dbCheck,
      session: sessionCheck,
      eventLedger: ledgerCheck,
      agentRegistry: registryCheck,
    },
    metrics: metricsCollector.getSummary(),
    features,
  };
}

async function checkDatabase(): Promise<HealthComponent> {
  const start = Date.now();
  const checked = new Date().toISOString();

  if (!supabase) {
    return { status: "down", error: "Supabase not configured", lastChecked: checked };
  }

  try {
    const { error } = await supabase
      .from("tenants")
      .select("id")
      .limit(1);

    const latency = Date.now() - start;

    if (error) {
      return { status: "down", latency, error: error.message, lastChecked: checked };
    }

    // Degraded if latency > 500ms
    const status = latency > 500 ? "degraded" : "up";
    return { status, latency, lastChecked: checked };
  } catch (err: any) {
    return { status: "down", latency: Date.now() - start, error: err.message, lastChecked: checked };
  }
}

async function checkSessions(): Promise<HealthComponent> {
  const start = Date.now();
  const checked = new Date().toISOString();

  // Check if session store table exists
  if (!supabase) {
    return { status: "down", error: "Supabase not configured", lastChecked: checked };
  }

  try {
    const { error } = await supabase
      .from("user_sessions")
      .select("sid")
      .limit(1);

    const latency = Date.now() - start;

    // 42P01 = table doesn't exist, which is OK for first run
    if (error && !error.message.includes("42P01")) {
      return { status: "degraded", latency, error: error.message, lastChecked: checked };
    }

    return { status: "up", latency, lastChecked: checked };
  } catch (err: any) {
    return { status: "down", latency: Date.now() - start, error: err.message, lastChecked: checked };
  }
}

async function checkEventLedger(): Promise<HealthComponent> {
  const start = Date.now();
  const checked = new Date().toISOString();

  if (!supabase) {
    return { status: "down", error: "Supabase not configured", lastChecked: checked };
  }

  try {
    const { error } = await supabase
      .from("arc_events")
      .select("id")
      .limit(1);

    const latency = Date.now() - start;

    if (error) {
      return { status: "degraded", latency, error: error.message, lastChecked: checked };
    }

    return { status: "up", latency, lastChecked: checked };
  } catch (err: any) {
    return { status: "down", latency: Date.now() - start, error: err.message, lastChecked: checked };
  }
}

async function checkAgentRegistry(): Promise<HealthComponent> {
  const start = Date.now();
  const checked = new Date().toISOString();

  if (!supabase) {
    return { status: "down", error: "Supabase not configured", lastChecked: checked };
  }

  try {
    const { data, error } = await supabase
      .from("agent_registry")
      .select("id, status")
      .limit(10);

    const latency = Date.now() - start;

    if (error) {
      return { status: "degraded", latency, error: error.message, lastChecked: checked };
    }

    // Check if any agents are unhealthy
    const unhealthyAgents = data?.filter(a => a.status === "error") || [];
    if (unhealthyAgents.length > 0) {
      return { status: "degraded", latency, error: `${unhealthyAgents.length} agents in error state`, lastChecked: checked };
    }

    return { status: "up", latency, lastChecked: checked };
  } catch (err: any) {
    return { status: "down", latency: Date.now() - start, error: err.message, lastChecked: checked };
  }
}

async function getFeatureFlagStates(): Promise<Record<string, boolean>> {
  try {
    const flags = [
      "billing",
      "onboarding",
      "multi_tenant_ui",
      "public_api",
      "agent_marketplace",
    ];

    const results: Record<string, boolean> = {};
    
    for (const flag of flags) {
      results[flag] = await TenantService.isFeatureEnabled(flag);
    }

    return results;
  } catch {
    return {
      billing: false,
      onboarding: false,
      multi_tenant_ui: false,
      public_api: false,
      agent_marketplace: false,
    };
  }
}

// ============================================================================
// EXPRESS MIDDLEWARE
// ============================================================================

import { Request, Response, NextFunction } from "express";

/**
 * Middleware to collect request metrics
 */
export function metricsMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    // Hook into response finish
    res.on("finish", () => {
      const latency = Date.now() - start;
      const path = req.route?.path || req.path;
      metricsCollector.record(path, latency, res.statusCode);
    });

    next();
  };
}

// ============================================================================
// PRODUCTION READINESS CHECK
// ============================================================================

export interface ReadinessCheck {
  ready: boolean;
  gates: {
    phase0_health: boolean;
    phase1_ledger: boolean;
    phase2_tenant: boolean;
    phase3_agents: boolean;
    phase4_workflows: boolean;
    phase5_hardening: boolean;
  };
  blockers: string[];
}

export async function checkProductionReadiness(): Promise<ReadinessCheck> {
  const blockers: string[] = [];

  // Phase 0: Health
  const health = await performHealthCheck();
  const phase0 = health.status !== "unhealthy";
  if (!phase0) blockers.push("System health check failed");

  // Phase 1: Event Ledger
  const phase1 = health.checks.eventLedger.status !== "down";
  if (!phase1) blockers.push("Event ledger not operational");

  // Phase 2: Tenant
  let phase2 = false;
  try {
    const tenant = await TenantService.getCurrentTenant();
    phase2 = tenant !== null;
  } catch {
    phase2 = false;
  }
  if (!phase2) blockers.push("Tenant not configured");

  // Phase 3: Agent Registry
  const phase3 = health.checks.agentRegistry.status !== "down";
  if (!phase3) blockers.push("Agent registry not operational");

  // Phase 4: Workflows (check if file exists by trying import)
  let phase4 = false;
  try {
    await import("../workflows/jarvis.js");
    phase4 = true;
  } catch {
    phase4 = false;
  }
  if (!phase4) blockers.push("Jarvis workflows not loaded");

  // Phase 5: Feature flags OFF
  const phase5 = 
    !health.features.billing &&
    !health.features.onboarding &&
    !health.features.multi_tenant_ui;
  if (!phase5) blockers.push("Production feature flags not properly configured");

  return {
    ready: blockers.length === 0,
    gates: {
      phase0_health: phase0,
      phase1_ledger: phase1,
      phase2_tenant: phase2,
      phase3_agents: phase3,
      phase4_workflows: phase4,
      phase5_hardening: phase5,
    },
    blockers,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const ProductionMetrics = {
  record: metricsCollector.record.bind(metricsCollector),
  getSummary: metricsCollector.getSummary.bind(metricsCollector),
  healthCheck: performHealthCheck,
  readinessCheck: checkProductionReadiness,
  middleware: metricsMiddleware,
};

export default ProductionMetrics;
