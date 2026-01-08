import { describe, it, expect, vi } from "vitest";
import { Request, Response, NextFunction } from "express";
import {
  validateBody,
  validateQuery,
  validateParams,
  loginSchema,
  agentSchema,
  taskSchema,
  paginationSchema,
  sensorReadingSchema,
} from "../../middleware/validation";

describe("Validation Middleware", () => {
  describe("validateBody", () => {
    it("should pass validation with valid login data", () => {
      const req = {
        body: { username: "admin", password: "securePass123" },
      } as Request;
      const res = {} as Response;
      const next = vi.fn() as NextFunction;

      const middleware = validateBody(loginSchema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(next).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it("should fail validation with missing password", () => {
      const req = {
        body: { username: "admin" },
        path: "/api/auth/login",
      } as Request;
      const res = {} as Response;
      const next = vi.fn() as NextFunction;

      const middleware = validateBody(loginSchema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should fail validation with empty username", () => {
      const req = {
        body: { username: "", password: "pass" },
        path: "/api/auth/login",
      } as Request;
      const res = {} as Response;
      const next = vi.fn() as NextFunction;

      const middleware = validateBody(loginSchema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe("agentSchema", () => {
    it("should validate complete agent data", () => {
      const validAgent = {
        name: "Test Agent",
        role: "Developer",
        systemPrompt: "You are a helpful assistant",
        specializations: ["TypeScript", "React"],
        capabilities: ["code-generation", "debugging"],
        model: "gpt-4o-mini",
        temperature: 0.7,
        maxTokens: 4000,
        active: true,
      };

      const result = agentSchema.parse(validAgent);
      expect(result.name).toBe("Test Agent");
      expect(result.temperature).toBe(0.7);
    });

    it("should apply defaults for optional fields", () => {
      const minimalAgent = {
        name: "Minimal Agent",
        role: "Tester",
        systemPrompt: "Test prompt",
      };

      const result = agentSchema.parse(minimalAgent);
      expect(result.model).toBe("gpt-4o-mini");
      expect(result.temperature).toBe(0.7);
      expect(result.maxTokens).toBe(4000);
      expect(result.active).toBe(true);
      expect(result.specializations).toEqual([]);
    });

    it("should reject temperature outside range", () => {
      const invalidAgent = {
        name: "Invalid Agent",
        role: "Test",
        systemPrompt: "Test",
        temperature: 3.0,
      };

      expect(() => agentSchema.parse(invalidAgent)).toThrow();
    });
  });

  describe("taskSchema", () => {
    it("should validate task with all fields", () => {
      const validTask = {
        title: "Implement feature X",
        description: "Add new functionality",
        assigned_agent: "agent-123",
        priority: "high",
        status: "in_progress",
        due_date: "2025-02-01",
        tags: ["feature", "urgent"],
      };

      const result = taskSchema.parse(validTask);
      expect(result.title).toBe("Implement feature X");
      expect(result.priority).toBe("high");
    });

    it("should reject invalid priority", () => {
      const invalidTask = {
        title: "Test task",
        priority: "super-urgent",
      };

      expect(() => taskSchema.parse(invalidTask)).toThrow();
    });
  });

  describe("sensorReadingSchema", () => {
    it("should validate complete sensor reading", () => {
      const validReading = {
        deviceId: "xbs-esp32-001",
        gasResistance: 250000,
        temperature: 22.5,
        humidity: 45.2,
        pressure: 1013.25,
        iaqScore: 50,
        co2Equivalent: 450,
        vocEquivalent: 0.5,
        heaterTemperature: 320,
        mode: "monitoring",
      };

      const result = sensorReadingSchema.parse(validReading);
      expect(result.deviceId).toBe("xbs-esp32-001");
      expect(result.iaqScore).toBe(50);
    });

    it("should reject humidity > 100", () => {
      const invalidReading = {
        deviceId: "test-001",
        gasResistance: 250000,
        temperature: 22,
        humidity: 105,
        pressure: 1013,
        iaqScore: 50,
      };

      expect(() => sensorReadingSchema.parse(invalidReading)).toThrow();
    });

    it("should reject negative gas resistance", () => {
      const invalidReading = {
        deviceId: "test-001",
        gasResistance: -100,
        temperature: 22,
        humidity: 50,
        pressure: 1013,
        iaqScore: 50,
      };

      expect(() => sensorReadingSchema.parse(invalidReading)).toThrow();
    });
  });

  describe("paginationSchema", () => {
    it("should transform string page to number", () => {
      const req = {
        query: { page: "5", pageSize: "20" },
      } as unknown as Request;
      const res = {} as Response;
      const next = vi.fn() as NextFunction;

      const middleware = validateQuery(paginationSchema);
      middleware(req, res, next);

      expect(req.query.page).toBe(5);
      expect(req.query.pageSize).toBe(20);
      expect(next).toHaveBeenCalledWith();
    });

    it("should cap pageSize at 100", () => {
      const result = paginationSchema.parse({ page: "1", pageSize: "500" });
      expect(result.pageSize).toBe(100);
    });

    it("should default to page 1 for invalid input", () => {
      const result = paginationSchema.parse({ page: "invalid", pageSize: "10" });
      expect(result.page).toBe(1);
    });
  });
});
