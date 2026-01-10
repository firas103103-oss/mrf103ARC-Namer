/**
 * 📊 Enterprise Monitoring & Logging System
 * Production-grade observability for Stellar Command OS
 */

import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Create logs directory
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom log levels
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
  }
};

// Winston color configuration
winston.addColors(customLevels.colors);

// Custom format for structured logging
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    return JSON.stringify({
      timestamp,
      level,
      message,
      service: 'stellar-command',
      environment: process.env.NODE_ENV || 'development',
      ...meta
    });
  })
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  levels: customLevels.levels,
  format: logFormat,
  defaultMeta: { service: 'stellar-command' },
  transports: [
    // Error log file
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Combined log file
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    }),
    
    // Security events
    new winston.transports.File({
      filename: path.join(logsDir, 'security.log'),
      level: 'warn',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.printf((info) => {
          if (info.security || info.suspicious) {
            return JSON.stringify({
              timestamp: info.timestamp,
              level: info.level,
              message: info.message,
              type: 'SECURITY_EVENT',
              ...info
            });
          }
          return null;
        }),
        winston.format((info) => info !== null ? info : false)()
      ),
      maxsize: 5242880,
      maxFiles: 20,
    })
  ],
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Performance monitoring utilities
interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: Date;
  metadata?: any;
}

class PerformanceMonitor {
  private metrics: Map<string, number> = new Map();

  startTimer(operation: string): string {
    const timerId = `${operation}-${Date.now()}-${Math.random()}`;
    this.metrics.set(timerId, Date.now());
    return timerId;
  }

  endTimer(timerId: string, operation: string, metadata?: any): number {
    const startTime = this.metrics.get(timerId);
    if (!startTime) {
      logger.warn('Timer not found', { timerId, operation });
      return 0;
    }

    const duration = Date.now() - startTime;
    this.metrics.delete(timerId);

    const metric: PerformanceMetric = {
      operation,
      duration,
      timestamp: new Date(),
      metadata
    };

    // Log slow operations
    if (duration > 1000) {
      logger.warn('Slow operation detected', metric);
    } else {
      logger.debug('Operation completed', metric);
    }

    return duration;
  }

  logMetric(operation: string, duration: number, metadata?: any) {
    const metric: PerformanceMetric = {
      operation,
      duration,
      timestamp: new Date(),
      metadata
    };

    logger.info('Performance metric', metric);
  }
}

// System health monitoring
class HealthMonitor {
  private healthChecks: Map<string, () => Promise<boolean>> = new Map();
  private lastHealthStatus: Map<string, boolean> = new Map();

  registerCheck(name: string, checkFn: () => Promise<boolean>) {
    this.healthChecks.set(name, checkFn);
  }

  async runHealthChecks(): Promise<{ [key: string]: boolean }> {
    const results: { [key: string]: boolean } = {};
    
    for (const [name, checkFn] of this.healthChecks) {
      try {
        const isHealthy = await checkFn();
        results[name] = isHealthy;

        // Log health status changes
        const previousStatus = this.lastHealthStatus.get(name);
        if (previousStatus !== undefined && previousStatus !== isHealthy) {
          logger.warn('Health status changed', {
            check: name,
            previousStatus,
            currentStatus: isHealthy,
            timestamp: new Date().toISOString()
          });
        }

        this.lastHealthStatus.set(name, isHealthy);
      } catch (error) {
        results[name] = false;
        logger.error('Health check failed', {
          check: name,
          error: error instanceof Error ? (error instanceof Error ? error.message : 'Unknown error') : 'Unknown error'
        });
      }
    }

    return results;
  }

  getOverallHealth(): boolean {
    for (const status of this.lastHealthStatus.values()) {
      if (!status) return false;
    }
    return true;
  }
}

// Error classification
export enum ErrorCategory {
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  DATABASE = 'DATABASE',
  EXTERNAL_API = 'EXTERNAL_API',
  INTERNAL_SERVER = 'INTERNAL_SERVER',
  RATE_LIMIT = 'RATE_LIMIT',
  SECURITY = 'SECURITY'
}

export interface StructuredError {
  category: ErrorCategory;
  code: string;
  message: string;
  stack?: string;
  metadata?: any;
  timestamp: Date;
  requestId?: string;
}

// Structured error logging
export const logStructuredError = (error: Partial<StructuredError>, context?: any) => {
  const structuredError: StructuredError = {
    category: error.category || ErrorCategory.INTERNAL_SERVER,
    code: error.code || 'UNKNOWN_ERROR',
    message: (error instanceof Error ? error.message : 'Unknown error') || 'An unknown error occurred',
    stack: error.stack,
    metadata: { ...error.metadata, ...context },
    timestamp: new Date(),
    requestId: context?.requestId
  };

  logger.error('Structured error', structuredError);
  return structuredError;
};

// Security event logging
export const logSecurityEvent = (event: string, details: any, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') => {
  logger.warn('Security event', {
    security: true,
    event,
    severity,
    timestamp: new Date().toISOString(),
    ...details
  });
};

// Audit logging
export const logAudit = (action: string, user: string, resource: string, metadata?: any) => {
  logger.info('Audit log', {
    audit: true,
    action,
    user,
    resource,
    timestamp: new Date().toISOString(),
    ...metadata
  });
};

// Create singleton instances
export const performanceMonitor = new PerformanceMonitor();
export const healthMonitor = new HealthMonitor();

// Register basic health checks
healthMonitor.registerCheck('memory', async () => {
  const memUsage = process.memoryUsage();
  const memUsedMB = memUsage.heapUsed / 1024 / 1024;
  return memUsedMB < 512; // 512MB threshold
});

healthMonitor.registerCheck('uptime', async () => {
  return process.uptime() > 0;
});

// Express middleware for request logging
export const requestLogger = (req: any, res: any, next: any) => {
  const startTime = Date.now();
  const timerId = performanceMonitor.startTimer(`${req.method} ${req.path}`);

  res.on('finish', () => {
    const duration = performanceMonitor.endTimer(timerId, `${req.method} ${req.path}`, {
      statusCode: res.statusCode,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.http('HTTP Request', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      requestId: req.id
    });
  });

  next();
};

// Backward compatibility
export const httpLogger = requestLogger;

// Export logger and utilities
export default logger;
export {
  logger,
  PerformanceMonitor,
  HealthMonitor
};
