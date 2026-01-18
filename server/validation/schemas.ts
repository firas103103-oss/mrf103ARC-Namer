/**
 * 🔧 Validation Schemas with Zod
 * Type-safe request validation for Stellar Command OS
 */

import { z } from 'zod';

// User validation schemas
export const registerUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain uppercase, lowercase, number and special character'
    ),
  role: z.enum(['admin', 'operator', 'maestro', 'agent', 'user']).optional(),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional()
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'New password must contain uppercase, lowercase, number and special character'
    )
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

// Agent validation schemas
export const createAgentSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  type: z.enum(['assistant', 'worker', 'analyzer', 'coordinator']),
  capabilities: z.array(z.string()).optional(),
  configuration: z.record(z.any()).optional(),
  isActive: z.boolean().default(true)
});

export const updateAgentSchema = createAgentSchema.partial();

export const agentIdSchema = z.object({
  id: z.string().uuid('Invalid agent ID format')
});

// Task validation schemas
export const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: z.enum(['pending', 'in_progress', 'completed', 'failed']).default('pending'),
  assignedTo: z.string().uuid().optional(),
  dueDate: z.string().datetime().optional(),
  metadata: z.record(z.any()).optional()
});

export const updateTaskSchema = createTaskSchema.partial();

export const taskIdSchema = z.object({
  id: z.string().uuid('Invalid task ID format')
});

// Workflow validation schemas
export const createWorkflowSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  steps: z.array(z.object({
    name: z.string(),
    type: z.string(),
    config: z.record(z.any())
  })),
  isActive: z.boolean().default(true),
  trigger: z.object({
    type: z.enum(['manual', 'scheduled', 'event']),
    config: z.record(z.any()).optional()
  })
});

export const updateWorkflowSchema = createWorkflowSchema.partial();

export const workflowIdSchema = z.object({
  id: z.string().uuid('Invalid workflow ID format')
});

// Chat/Message validation schemas
export const sendMessageSchema = z.object({
  content: z.string().min(1).max(10000),
  agentId: z.string().uuid().optional(),
  conversationId: z.string().uuid().optional(),
  metadata: z.record(z.any()).optional()
});

export const conversationIdSchema = z.object({
  id: z.string().uuid('Invalid conversation ID format')
});

// File upload validation schemas
export const uploadFileSchema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.string(),
  size: z.number().max(10485760), // 10MB max
  purpose: z.enum(['avatar', 'document', 'image', 'attachment'])
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Search schema
export const searchSchema = z.object({
  query: z.string().min(1).max(200),
  filters: z.record(z.any()).optional(),
  ...paginationSchema.shape
});

// System configuration schemas
export const updateSystemConfigSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.any(),
  category: z.string().max(50).optional(),
  description: z.string().max(500).optional()
});

// Analytics schemas
export const analyticsQuerySchema = z.object({
  metric: z.enum(['users', 'tasks', 'messages', 'agents', 'system']),
  period: z.enum(['hour', 'day', 'week', 'month', 'year']),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  groupBy: z.string().optional()
});

// Notification schemas
export const createNotificationSchema = z.object({
  title: z.string().min(1).max(200),
  message: z.string().max(1000),
  type: z.enum(['info', 'success', 'warning', 'error']),
  userId: z.string().uuid().optional(),
  metadata: z.record(z.any()).optional()
});

// Export all types
export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

export type CreateAgentInput = z.infer<typeof createAgentSchema>;
export type UpdateAgentInput = z.infer<typeof updateAgentSchema>;
export type AgentIdInput = z.infer<typeof agentIdSchema>;

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskIdInput = z.infer<typeof taskIdSchema>;

export type CreateWorkflowInput = z.infer<typeof createWorkflowSchema>;
export type UpdateWorkflowInput = z.infer<typeof updateWorkflowSchema>;
export type WorkflowIdInput = z.infer<typeof workflowIdSchema>;

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type ConversationIdInput = z.infer<typeof conversationIdSchema>;

export type UploadFileInput = z.infer<typeof uploadFileSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type UpdateSystemConfigInput = z.infer<typeof updateSystemConfigSchema>;
export type AnalyticsQueryInput = z.infer<typeof analyticsQuerySchema>;
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;

// Validation middleware factory
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../middleware/error-handler';

export function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate body, query, and params
      const data = {
        ...req.body,
        ...req.query,
        ...req.params
      };

      const validated = schema.parse(data);
      
      // Attach validated data to request
      (req as any).validated = validated;
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(
          'Validation failed',
          {
            errors: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code
            }))
          }
        );
      }
      next(error);
    }
  };
}

export default {
  // User schemas
  registerUserSchema,
  loginSchema,
  changePasswordSchema,
  refreshTokenSchema,
  
  // Agent schemas
  createAgentSchema,
  updateAgentSchema,
  agentIdSchema,
  
  // Task schemas
  createTaskSchema,
  updateTaskSchema,
  taskIdSchema,
  
  // Workflow schemas
  createWorkflowSchema,
  updateWorkflowSchema,
  workflowIdSchema,
  
  // Message schemas
  sendMessageSchema,
  conversationIdSchema,
  
  // Other schemas
  uploadFileSchema,
  paginationSchema,
  searchSchema,
  updateSystemConfigSchema,
  analyticsQuerySchema,
  createNotificationSchema,
  
  // Validation middleware
  validate
};