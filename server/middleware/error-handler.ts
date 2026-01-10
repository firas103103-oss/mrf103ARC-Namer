/**
 * 🚨 Enterprise Error Handling System
 * Comprehensive error management for Stellar Command OS
 */

import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import logger, { logStructuredError, ErrorCategory } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

// Custom error types
export class AppError extends Error {
  public statusCode: number;
  public category: ErrorCategory;
  public code: string;
  public isOperational: boolean;
  public metadata?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    category: ErrorCategory = ErrorCategory.INTERNAL_SERVER,
    code: string = 'INTERNAL_ERROR',
    metadata?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.category = category;
    this.code = code;
    this.isOperational = true;
    this.metadata = metadata;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, metadata?: any) {
    super(message, 400, ErrorCategory.VALIDATION, 'VALIDATION_ERROR', metadata);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, 401, ErrorCategory.AUTHENTICATION, 'AUTH_REQUIRED');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Access denied") {
    super(message, 403, ErrorCategory.AUTHORIZATION, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, 404, ErrorCategory.VALIDATION, 'NOT_FOUND', { resource });
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, ErrorCategory.RATE_LIMIT, 'RATE_LIMITED');
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = "Database operation failed", operation?: string) {
    super(message, 500, ErrorCategory.DATABASE, 'DATABASE_ERROR', { operation });
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message?: string, statusCode?: number) {
    super(message || `${service} service error`, statusCode || 502, ErrorCategory.EXTERNAL_API, 'EXTERNAL_SERVICE_ERROR', { service });
  }
}

export class ExternalAPIError extends AppError {
  constructor(service: string, message: string, statusCode?: number) {
    super(`External service error: ${service} - ${message}`, statusCode || 502, ErrorCategory.EXTERNAL_API, 'EXTERNAL_API_ERROR', { service });
  }
}

/**
 * Global Error Handler Middleware
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Default values
  let statusCode = 500;
  let message = "Internal server error";
  let code = "INTERNAL_ERROR";
  let isOperational = false;

  // Handle AppError instances
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code || "APP_ERROR";
    isOperational = err.isOperational;
  }

  // Log error
  logger.error("Error occurred:", {
    message: err.message,
    stack: err.stack,
    code,
    statusCode,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: (req as any).userId,
  });

  // Send response
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message: isOperational ? message : "An unexpected error occurred",
      ...(process.env.NODE_ENV === "development" && {
        stack: err.stack,
        details: err.message,
      }),
    },
  });
}

// Request ID middleware
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = require('uuid').v4();
  (req as any).requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};

// Global error handler
export const globalErrorHandler: ErrorRequestHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestId = (req as any).requestId;
  
  // Handle known application errors
  if (error instanceof AppError) {
    const structuredError = logStructuredError({
      category: error.category,
      code: error.code,
      message: (error instanceof Error ? error.message : 'Unknown error'),
      stack: error.stack,
      metadata: {
        ...error.metadata,
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      },
      requestId
    });

    const errorResponse: ErrorResponse = {
      error: {
        code: error.code,
        message: (error instanceof Error ? error.message : 'Unknown error'),
        category: error.category,
        timestamp: new Date().toISOString(),
        requestId,
        details: process.env.NODE_ENV === 'development' ? error.metadata : undefined
      }
    };

    return res.status(error.statusCode).json(errorResponse);
  }

  // Handle unexpected errors
  const unexpectedError = logStructuredError({
    category: ErrorCategory.INTERNAL_SERVER,
    code: 'UNEXPECTED_ERROR',
    message: (error instanceof Error ? error.message : 'Unknown error') || 'An unexpected error occurred',
    stack: error.stack,
    metadata: {
      path: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      body: req.body,
      query: req.query,
      params: req.params
    },
    requestId
  });

  // In production, don't expose internal error details
  const errorResponse: ErrorResponse = {
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? 'An internal server error occurred' 
        : (error instanceof Error ? error.message : 'Unknown error'),
      category: ErrorCategory.INTERNAL_SERVER,
      timestamp: new Date().toISOString(),
      requestId,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }
  };

  res.status(500).json(errorResponse);
};

// 404 handler for unmatched routes
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new NotFoundError(`Route ${req.originalUrl}`);
  next(error);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Unhandled rejection handler
export const unhandledRejectionHandler = (reason: any, promise: Promise<any>) => {
  logger.error('Unhandled Promise Rejection', {
    reason: reason?.message || reason,
    stack: reason?.stack,
    promise: promise.toString()
  });
  
  // Don't crash in production, log and continue
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
};

// Uncaught exception handler
export const uncaughtExceptionHandler = (error: Error) => {
  logger.error('Uncaught Exception', {
    message: (error instanceof Error ? error.message : 'Unknown error'),
    stack: error.stack
  });
  
  // Always exit on uncaught exceptions
  process.exit(1);
};


