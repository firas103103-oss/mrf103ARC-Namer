import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

/**
 * Custom Error Classes - استراتيجية موحدة للأخطاء
 */

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, "VALIDATION_ERROR");
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, 401, "AUTH_ERROR");
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Access denied") {
    super(message, 403, "AUTHORIZATION_ERROR");
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND");
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = "Database operation failed") {
    super(message, 500, "DATABASE_ERROR");
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message?: string) {
    super(message || `${service} service error`, 502, "EXTERNAL_SERVICE_ERROR");
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

/**
 * Async Handler Wrapper - لتجنب try/catch في كل route
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Not Found Handler
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  next(new NotFoundError(`Route ${req.originalUrl}`));
}
