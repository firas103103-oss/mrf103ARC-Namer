import { Request, Response, NextFunction } from "express";
import { z, ZodError, ZodSchema } from "zod";
import { ValidationError } from "./error-handler";
import logger from "../utils/logger";

/**
 * Zod Validation Middleware Factory
 * Validates request body, query, or params against a Zod schema
 */

export function validateBody<T extends ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated; // Replace with validated data
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        logger.warn('Validation error (body):', { errors: error.errors, path: req.path });
        return next(new ValidationError(`Validation failed: ${message}`));
      }
      next(error);
    }
  };
}

export function validateQuery<T extends ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.query);
      req.query = validated as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        logger.warn('Validation error (query):', { errors: error.errors, path: req.path });
        return next(new ValidationError(`Validation failed: ${message}`));
      }
      next(error);
    }
  };
}

export function validateParams<T extends ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.params);
      req.params = validated as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        logger.warn('Validation error (params):', { errors: error.errors, path: req.path });
        return next(new ValidationError(`Validation failed: ${message}`));
      }
      next(error);
    }
  };
}

/**
 * Example Schemas for Common Routes
 */

// Login Schema
export const loginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

// Agent Creation Schema
export const agentSchema = z.object({
  name: z.string().min(1, "Agent name is required"),
  role: z.string().min(1, "Role is required"),
  systemPrompt: z.string().min(1, "System prompt is required"),
  specializations: z.array(z.string()).optional().default([]),
  capabilities: z.array(z.string()).optional().default([]),
  model: z.string().default("gpt-4o-mini"),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).max(32000).default(4000),
  active: z.boolean().default(true),
});

// Task Creation Schema
export const taskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  assigned_agent: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  status: z.enum(["pending", "in_progress", "completed", "blocked"]).default("pending"),
  due_date: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// Pagination Schema
export const paginationSchema = z.object({
  page: z.string().transform(val => parseInt(val) || 1),
  pageSize: z.string().transform(val => {
    const size = parseInt(val) || 10;
    return Math.min(size, 100); // Max 100 items per page
  }),
});

// Sensor Reading Schema (Bio Sentinel)
export const sensorReadingSchema = z.object({
  deviceId: z.string().min(1, "Device ID is required"),
  gasResistance: z.number().min(0),
  temperature: z.number(),
  humidity: z.number().min(0).max(100),
  pressure: z.number().min(0),
  iaqScore: z.number().min(0).max(500),
  co2Equivalent: z.number().optional(),
  vocEquivalent: z.number().optional(),
  heaterTemperature: z.number().optional(),
  mode: z.string().optional(),
});

// Master Agent Command Schema
export const masterAgentCommandSchema = z.object({
  command: z.string().min(1, "Command is required"),
  priority: z.enum(["low", "medium", "high", "critical"]).optional().default("medium"),
  context: z.record(z.any()).optional(),
});

// Growth Roadmap Task Schema
export const growthTaskSchema = z.object({
  phaseId: z.string().uuid("Invalid phase ID"),
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  target: z.number().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

export default {
  validateBody,
  validateQuery,
  validateParams,
  loginSchema,
  agentSchema,
  taskSchema,
  paginationSchema,
  sensorReadingSchema,
  masterAgentCommandSchema,
  growthTaskSchema,
};
