/**
 * Self-Healing Server Service
 * Automatically detects and recovers from common server issues
 */

/* eslint-disable no-undef */
import { Pool } from "pg";
import EventEmitter from "events";
import logger from "../utils/logger";

export interface HealthCheck {
  name: string;
  status: "healthy" | "degraded" | "unhealthy";
  latency?: number;
  error?: string;
  lastCheck: Date;
  recoveryAttempts: number;
}

export interface SystemHealth {
  overall: "healthy" | "degraded" | "unhealthy";
  uptime: number;
  checks: HealthCheck[];
  lastRecovery?: Date;
  recoveryCount: number;
}

interface RecoveryAction {
  name: string;
  check: () => Promise<boolean>;
  recover: () => Promise<boolean>;
  maxAttempts: number;
  cooldownMs: number;
}

export class SelfHealer extends EventEmitter {
  private checks: Map<string, HealthCheck> = new Map();
  private recoveryActions: RecoveryAction[] = [];
  private intervalId: NodeJS.Timeout | null = null;
  private startTime: Date = new Date();
  private recoveryCount: number = 0;
  private lastRecovery?: Date;
  private isRecovering: boolean = false;
  private pool: Pool | null = null;

  constructor() {
    super();
    this.setupDefaultRecoveryActions();
  }

  /**
   * Initialize with database pool
   */
  initialize(pool: Pool) {
    this.pool = pool;
    console.log("🔧 Self-Healer initialized");
  }

  /**
   * Setup default recovery actions for common issues
   */
  private setupDefaultRecoveryActions() {
    // Database connection recovery
    this.addRecoveryAction({
      name: "database-connection",
      check: async () => {
        if (!this.pool) return false;
        try {
          const result = await Promise.race([
            this.pool.query("SELECT 1"),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error("timeout")), 5000)
            )
          ]);
          return !!result;
        } catch {
          return false;
        }
      },
      recover: async () => {
        if (!this.pool) return false;
        try {
          // Attempt to recreate connection
          await this.pool.query("SELECT 1");
          console.log("✅ Database connection recovered");
          return true;
        } catch (error) {
          logger.error("❌ Database recovery failed:", error);
          return false;
        }
      },
      maxAttempts: 3,
      cooldownMs: 5000,
    });

    // Memory pressure recovery
    this.addRecoveryAction({
      name: "memory-pressure",
      check: async () => {
        const used = process.memoryUsage();
        const heapUsedPercent = (used.heapUsed / used.heapTotal) * 100;
        return heapUsedPercent < 90; // Healthy if under 90%
      },
      recover: async () => {
        try {
          // Force garbage collection if available
          if (global.gc) {
            global.gc();
            console.log("✅ Garbage collection triggered");
          }
          return true;
        } catch {
          return false;
        }
      },
      maxAttempts: 2,
      cooldownMs: 30000,
    });

    // Event loop lag detection
    this.addRecoveryAction({
      name: "event-loop-health",
      check: async () => {
        return new Promise((resolve) => {
          const start = Date.now();
          setImmediate(() => {
            const lag = Date.now() - start;
            resolve(lag < 100); // Healthy if lag under 100ms
          });
        });
      },
      recover: async () => {
        // Log warning - not much we can do automatically
        logger.warn("⚠️ Event loop lag detected - consider scaling");
        return true;
      },
      maxAttempts: 1,
      cooldownMs: 60000,
    });
  }

  /**
   * Add a custom recovery action
   */
  addRecoveryAction(action: RecoveryAction) {
    this.recoveryActions.push(action);
    this.checks.set(action.name, {
      name: action.name,
      status: "healthy",
      lastCheck: new Date(),
      recoveryAttempts: 0,
    });
  }

  /**
   * Run all health checks
   */
  async runHealthChecks(): Promise<SystemHealth> {
    const results: HealthCheck[] = [];

    for (const action of this.recoveryActions) {
      const start = Date.now();
      let status: "healthy" | "degraded" | "unhealthy" = "healthy";
      let error: string | undefined;

      try {
        const isHealthy = await action.check();
        if (!isHealthy) {
          status = "unhealthy";
          await this.attemptRecovery(action);
        }
      } catch (e) {
        status = "unhealthy";
        error = e instanceof Error ? e.message : "Unknown error";
        await this.attemptRecovery(action);
      }

      const check: HealthCheck = {
        name: action.name,
        status,
        latency: Date.now() - start,
        error,
        lastCheck: new Date(),
        recoveryAttempts: this.checks.get(action.name)?.recoveryAttempts || 0,
      };

      this.checks.set(action.name, check);
      results.push(check);
    }

    // Calculate overall health
    const unhealthyCount = results.filter(r => r.status === "unhealthy").length;
    const degradedCount = results.filter(r => r.status === "degraded").length;

    let overall: "healthy" | "degraded" | "unhealthy" = "healthy";
    if (unhealthyCount > 0) {
      overall = unhealthyCount > results.length / 2 ? "unhealthy" : "degraded";
    } else if (degradedCount > 0) {
      overall = "degraded";
    }

    return {
      overall,
      uptime: Date.now() - this.startTime.getTime(),
      checks: results,
      lastRecovery: this.lastRecovery,
      recoveryCount: this.recoveryCount,
    };
  }

  /**
   * Attempt to recover from an issue
   */
  private async attemptRecovery(action: RecoveryAction): Promise<boolean> {
    if (this.isRecovering) return false;

    const check = this.checks.get(action.name);
    if (!check) return false;

    if (check.recoveryAttempts >= action.maxAttempts) {
      logger.error(`❌ Max recovery attempts reached for ${action.name}`);
      this.emit("recovery-failed", action.name);
      return false;
    }

    this.isRecovering = true;
    check.recoveryAttempts++;

    console.log(`🔄 Attempting recovery for ${action.name} (attempt ${check.recoveryAttempts}/${action.maxAttempts})`);

    try {
      const success = await action.recover();
      if (success) {
        this.recoveryCount++;
        this.lastRecovery = new Date();
        check.status = "healthy";
        check.recoveryAttempts = 0;
        this.emit("recovery-success", action.name);
        console.log(`✅ Recovery successful for ${action.name}`);
      }
      return success;
    } catch (error) {
      logger.error(`❌ Recovery failed for ${action.name}:`, error);
      this.emit("recovery-error", { action: action.name, error });
      return false;
    } finally {
      this.isRecovering = false;
    }
  }

  /**
   * Start automatic health monitoring
   */
  startMonitoring(intervalMs: number = 30000) {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    console.log(`🔍 Starting health monitoring (interval: ${intervalMs}ms)`);

    // Run initial check
    this.runHealthChecks().then(health => {
      this.emit("health-check", health);
    });

    this.intervalId = setInterval(async () => {
      const health = await this.runHealthChecks();
      this.emit("health-check", health);

      if (health.overall === "unhealthy") {
        console.error("🚨 System health is UNHEALTHY");
        this.emit("system-unhealthy", health);
      }
    }, intervalMs);
  }

  /**
   * Stop health monitoring
   */
  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("⏹️ Health monitoring stopped");
    }
  }

  /**
   * Get current system health
   */
  getHealth(): SystemHealth {
    return {
      overall: this.calculateOverallHealth(),
      uptime: Date.now() - this.startTime.getTime(),
      checks: Array.from(this.checks.values()),
      lastRecovery: this.lastRecovery,
      recoveryCount: this.recoveryCount,
    };
  }

  private calculateOverallHealth(): "healthy" | "degraded" | "unhealthy" {
    const checks = Array.from(this.checks.values());
    const unhealthyCount = checks.filter(c => c.status === "unhealthy").length;
    const degradedCount = checks.filter(c => c.status === "degraded").length;

    if (unhealthyCount > 0) {
      return unhealthyCount > checks.length / 2 ? "unhealthy" : "degraded";
    }
    return degradedCount > 0 ? "degraded" : "healthy";
  }
}

// Singleton instance
export const selfHealer = new SelfHealer();
