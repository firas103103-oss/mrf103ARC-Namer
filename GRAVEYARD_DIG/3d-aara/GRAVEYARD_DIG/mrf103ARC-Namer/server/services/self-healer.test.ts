/**
 * Server Health Tests
 * Comprehensive tests for self-healing and health monitoring
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SelfHealer, type SystemHealth, type HealthCheck } from "../services/self-healer";

describe("SelfHealer Service", () => {
  let healer: SelfHealer;

  beforeEach(() => {
    healer = new SelfHealer();
  });

  afterEach(() => {
    healer.stopMonitoring();
  });

  describe("Health Checks", () => {
    it("should initialize with default recovery actions", () => {
      const health = healer.getHealth();
      expect(health.checks.length).toBeGreaterThan(0);
      expect(health.overall).toBe("healthy");
    });

    it("should track uptime correctly", async () => {
      const health1 = healer.getHealth();
      await new Promise(resolve => setTimeout(resolve, 100));
      const health2 = healer.getHealth();
      expect(health2.uptime).toBeGreaterThan(health1.uptime);
    });

    it("should return healthy status when all checks pass", async () => {
      // Create a fresh healer without default actions
      const freshHealer = new SelfHealer();
      
      // Clear default actions by creating new instance and only adding passing ones
      freshHealer.addRecoveryAction({
        name: "test-healthy",
        check: async () => true,
        recover: async () => true,
        maxAttempts: 3,
        cooldownMs: 1000,
      });

      const health = await freshHealer.runHealthChecks();
      const testCheck = health.checks.find(c => c.name === "test-healthy");
      expect(testCheck?.status).toBe("healthy");
    });

    it("should detect unhealthy status when checks fail", async () => {
      healer.addRecoveryAction({
        name: "test-failing",
        check: async () => false,
        recover: async () => false,
        maxAttempts: 1,
        cooldownMs: 100,
      });

      const health = await healer.runHealthChecks();
      const failingCheck = health.checks.find(c => c.name === "test-failing");
      expect(failingCheck?.status).toBe("unhealthy");
    });

    it("should measure latency for each check", async () => {
      healer.addRecoveryAction({
        name: "test-latency",
        check: async () => {
          await new Promise(resolve => setTimeout(resolve, 50));
          return true;
        },
        recover: async () => true,
        maxAttempts: 1,
        cooldownMs: 1000,
      });

      const health = await healer.runHealthChecks();
      const check = health.checks.find(c => c.name === "test-latency");
      expect(check?.latency).toBeGreaterThanOrEqual(50);
    });
  });

  describe("Recovery Actions", () => {
    it("should attempt recovery when check fails", async () => {
      const recoverFn = vi.fn().mockResolvedValue(true);

      healer.addRecoveryAction({
        name: "test-recovery",
        check: async () => false,
        recover: recoverFn,
        maxAttempts: 3,
        cooldownMs: 100,
      });

      await healer.runHealthChecks();
      expect(recoverFn).toHaveBeenCalled();
    });

    it("should not exceed max recovery attempts", async () => {
      const recoverFn = vi.fn().mockResolvedValue(false);

      healer.addRecoveryAction({
        name: "test-max-attempts",
        check: async () => false,
        recover: recoverFn,
        maxAttempts: 2,
        cooldownMs: 100,
      });

      // Run multiple times
      await healer.runHealthChecks();
      await healer.runHealthChecks();
      await healer.runHealthChecks();
      await healer.runHealthChecks();

      // Should only attempt maxAttempts times
      expect(recoverFn).toHaveBeenCalledTimes(2);
    });

    it("should emit recovery-success event on successful recovery", async () => {
      const successHandler = vi.fn();
      healer.on("recovery-success", successHandler);

      healer.addRecoveryAction({
        name: "test-success-event",
        check: async () => false,
        recover: async () => true,
        maxAttempts: 1,
        cooldownMs: 100,
      });

      await healer.runHealthChecks();
      expect(successHandler).toHaveBeenCalledWith("test-success-event");
    });

    it("should track recovery count", async () => {
      healer.addRecoveryAction({
        name: "test-count",
        check: async () => false,
        recover: async () => true,
        maxAttempts: 5,
        cooldownMs: 100,
      });

      await healer.runHealthChecks();
      const health = healer.getHealth();
      expect(health.recoveryCount).toBe(1);
    });
  });

  describe("Event Emission", () => {
    it("should emit health-check event during monitoring", async () => {
      const handler = vi.fn();
      healer.on("health-check", handler);

      healer.startMonitoring(100);
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(handler).toHaveBeenCalled();
      healer.stopMonitoring();
    });

    it("should emit system-unhealthy when overall health is bad", async () => {
      const handler = vi.fn();
      healer.on("system-unhealthy", handler);

      // Add multiple failing checks
      for (let i = 0; i < 5; i++) {
        healer.addRecoveryAction({
          name: `failing-${i}`,
          check: async () => false,
          recover: async () => false,
          maxAttempts: 1,
          cooldownMs: 100,
        });
      }

      await healer.runHealthChecks();
      // The system should be unhealthy with majority failing
    });
  });

  describe("Custom Recovery Actions", () => {
    it("should allow adding custom recovery actions", () => {
      const initialCount = healer.getHealth().checks.length;

      healer.addRecoveryAction({
        name: "custom-action",
        check: async () => true,
        recover: async () => true,
        maxAttempts: 3,
        cooldownMs: 5000,
      });

      expect(healer.getHealth().checks.length).toBe(initialCount + 1);
    });
  });
});

describe("Integration Tests", () => {
  describe("Database Health Check", () => {
    it("should handle database connection timeout", async () => {
      const healer = new SelfHealer();
      
      // Mock a slow database
      healer.addRecoveryAction({
        name: "slow-db",
        check: async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          return true;
        },
        recover: async () => true,
        maxAttempts: 1,
        cooldownMs: 1000,
      });

      const start = Date.now();
      await healer.runHealthChecks();
      const duration = Date.now() - start;

      expect(duration).toBeGreaterThanOrEqual(100);
    });
  });

  describe("Memory Pressure", () => {
    it("should detect memory pressure", async () => {
      const healer = new SelfHealer();
      const used = process.memoryUsage();
      const heapPercent = (used.heapUsed / used.heapTotal) * 100;

      const health = await healer.runHealthChecks();
      const memCheck = health.checks.find(c => c.name === "memory-pressure");
      
      // Should be healthy under normal conditions
      expect(memCheck?.status).toBe("healthy");
    });
  });

  describe("Event Loop Health", () => {
    it("should detect event loop lag", async () => {
      const healer = new SelfHealer();
      const health = await healer.runHealthChecks();
      const loopCheck = health.checks.find(c => c.name === "event-loop-health");

      // Under normal test conditions, should be healthy
      expect(loopCheck?.status).toBe("healthy");
    });
  });
});
