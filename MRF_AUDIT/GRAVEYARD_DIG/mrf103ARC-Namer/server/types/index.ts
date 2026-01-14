/**
 * 📦 Server Type Definitions
 * Centralized type system to eliminate 'any' types
 */

import { Request, Response, NextFunction } from 'express';

// ===============================
// API RESPONSE TYPES
// ===============================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: number;
}

export interface ApiError {
  success: false;
  error: string;
  message?: string;
  statusCode: number;
}

// ===============================
// MIDDLEWARE & REQUEST TYPES
// ===============================

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    permissions: string[];
  };
  requestId?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

// ===============================
// ARC HIERARCHY TYPES
// ===============================

export type AgentStatus = 'active' | 'idle' | 'busy' | 'offline' | 'learning';
export type SectorType = string;

export interface Agent {
  id: string;
  name: string;
  role: string;
  sector?: SectorType;
  status: AgentStatus;
  level?: number;
  parentId?: string;
  specializations?: string[];
  createdAt?: number;
  updatedAt?: number;
}

export interface HierarchyStats {
  totalAgents: number;
  activeAgents: number;
  sectors: Record<SectorType, number>;
  levels: Record<number, number>;
}

export interface ReportingChain {
  agentId: string;
  agentName: string;
  parentId?: string;
  parentName?: string;
  chain: Agent[];
}

export interface HierarchyTree {
  root: Agent;
  children: HierarchyTree[];
}

// ===============================
// REPORTING TYPES
// ===============================

export type ReportType = 'daily' | 'weekly' | 'monthly' | 'quarterly';

export interface Report {
  id: string;
  agentId: string;
  agentName: string;
  type: ReportType;
  period: {
    startDate: number;
    endDate: number;
  };
  metrics: {
    tasksCompleted: number;
    tasksInProgress: number;
    averageTime: number;
    successRate: number;
  };
  summary: string;
  createdAt: number;
  updatedAt: number;
}

export interface DailyReport extends Report {
  type: 'daily';
  timeline: {
    hour: number;
    status: AgentStatus;
    activity: string;
  }[];
}

export interface WeeklyReport extends Report {
  type: 'weekly';
  dailyBreakdown: Record<string, DailyReport>;
  trends: {
    productivity: number;
    efficiency: number;
    learning: number;
  };
}

// ===============================
// LEARNING SYSTEM TYPES
// ===============================

export interface LearningData {
  agentId: string;
  skillId: string;
  proficiency: number; // 0-100
  lastPracticed?: number;
  exercises?: ExerciseResult[];
}

export interface ExerciseResult {
  id: string;
  timestamp: number;
  score: number;
  feedback: string;
}

export interface KnowledgeBase {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

// ===============================
// OPENAI SERVICE TYPES
// ===============================

export interface AIPrompt {
  agentId: string;
  message: string;
  context?: Record<string, unknown>;
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse {
  agentId: string;
  response: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  timestamp: number;
}

// ===============================
// CACHE TYPES
// ===============================

export interface CacheEntry<T = unknown> {
  key: string;
  value: T;
  ttl: number;
  createdAt: number;
  expiresAt: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  keys: string[];
}

// ===============================
// ERROR TYPES
// ===============================

export class ValidationError extends Error {
  constructor(
    public fields: ValidationError[],
    public statusCode: number = 400
  ) {
    super('Validation failed');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(public resource: string, public resourceId?: string) {
    super(`${resource} not found${resourceId ? `: ${resourceId}` : ''}`);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

// ===============================
// MIDDLEWARE HANDLER TYPES
// ===============================

export type ExpressHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

export type AsyncExpressHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export type ErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => void;

// ===============================
// UTILITY TYPES
// ===============================

export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  filter?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AsyncOperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    duration: number;
    timestamp: number;
  };
}
