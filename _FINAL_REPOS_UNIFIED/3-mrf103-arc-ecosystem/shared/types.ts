/**
 * Shared Types - Common types used across client and server
 */

// =============================================================================
// Agent Types
// =============================================================================

export interface Agent {
  id: string;
  name: string;
  role: string;
  title?: string;
  tier: 0 | 1 | 2 | 3;
  status: AgentStatus;
  capabilities: string[];
  reportsTo?: string;
  directReports?: string[];
  lastActive?: Date;
  metrics?: AgentMetrics;
}

export type AgentStatus = 'active' | 'idle' | 'busy' | 'offline' | 'error';

export interface AgentMetrics {
  tasksCompleted: number;
  tasksInProgress: number;
  avgResponseTime: number;
  successRate: number;
  lastTaskTime?: Date;
}

// =============================================================================
// Project Types
// =============================================================================

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  progress: number;
  startDate: Date;
  endDate?: Date;
  team: string[];
  tags: string[];
  metrics?: ProjectMetrics;
}

export type ProjectStatus = 'planning' | 'active' | 'paused' | 'completed' | 'archived';

export interface ProjectMetrics {
  tasksTotal: number;
  tasksCompleted: number;
  velocity: number;
  healthScore: number;
}

// =============================================================================
// Task Types
// =============================================================================

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string;
  projectId?: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  completedAt?: Date;
  tags: string[];
}

export type TaskStatus = 'pending' | 'in-progress' | 'review' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

// =============================================================================
// API Response Types
// =============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiMeta {
  total?: number;
  page?: number;
  pageSize?: number;
  timestamp: string;
}

// =============================================================================
// System Types
// =============================================================================

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  version: string;
  environment: string;
  services: ServiceHealth[];
  timestamp: string;
}

export interface ServiceHealth {
  name: string;
  status: 'up' | 'down' | 'degraded';
  latency?: number;
  lastCheck: string;
}

export interface SystemMetrics {
  cpu: number;
  memory: number;
  requests: number;
  activeConnections: number;
  avgResponseTime: number;
  successRate: number;
  cacheHitRate: number;
}

// =============================================================================
// WebSocket Event Types
// =============================================================================

export type WSEventType = 
  | 'agent:status'
  | 'agent:activity'
  | 'task:created'
  | 'task:updated'
  | 'task:completed'
  | 'system:alert'
  | 'system:metric';

export interface WSEvent<T = unknown> {
  type: WSEventType;
  payload: T;
  timestamp: string;
}

// =============================================================================
// User Types
// =============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  createdAt: Date;
  lastLogin?: Date;
}

export type UserRole = 'admin' | 'operator' | 'viewer';
