/**
 * 🛡️ Enterprise Security Middleware Suite
 * Comprehensive security layer for Stellar Command OS
 */

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { body, query, param, validationResult } from 'express-validator';
import logger from '../utils/logger';
import type { Request, Response, NextFunction } from 'express';

/**
 * 🔒 Helmet Security Headers
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com", "data:"],
      scriptSrc: ["'self'", "'unsafe-eval'"], // Vite dev needs unsafe-eval
      connectSrc: ["'self'", "wss:", "ws:", "https://api.openai.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
});

/**
 * 🚦 Advanced Rate Limiting
 */
// API Rate Limiter - General
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per windowMs
  message: {
    error: 'too_many_requests',
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Authentication Rate Limiter - Strict
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes  
  max: 10, // 10 login attempts per windowMs
  message: {
    error: 'auth_rate_limited',
    message: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  skipSuccessfulRequests: true,
});

// AI Endpoints Rate Limiter - Conservative
export const aiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 AI requests per minute
  message: {
    error: 'ai_rate_limited', 
    message: 'AI request limit reached, please wait before trying again.',
    retryAfter: '1 minute'
  },
});

/**
 * 🧹 Input Sanitization & Validation
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Remove potential XSS characters from strings
  const sanitizeString = (str: string): string => {
    return str
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  };

  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    return obj;
  };

  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
};

/**
 * ✅ Validation Error Handler
 */
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    logger.warn('Validation failed:', {
      path: req.path,
      method: req.method,
      errors: errors.array(),
      ip: req.ip
    });
    
    return res.status(400).json({
      error: 'validation_failed',
      message: 'Request validation failed',
      details: errors.array().map((err: any) => ({
        field: err.param || 'unknown',
        message: err.msg,
        value: err.value
      }))
    });
  }
  
  next();
};

/**
 * 🔐 CSRF Protection
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for API endpoints (using JWT)
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  // For form submissions, check CSRF token
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
    const token = req.headers['x-csrf-token'] || req.body._csrf;
    const sessionToken = (req.session as any)?.csrfToken;
    
    if (!token || token !== sessionToken) {
      logger.warn('CSRF token validation failed:', {
        path: req.path,
        method: req.method,
        ip: req.ip
      });
      
      return res.status(403).json({
        error: 'csrf_token_invalid',
        message: 'CSRF token validation failed'
      });
    }
  }
  
  next();
};

/**
 * 📝 Security Logging Middleware
 */
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  // Log suspicious activities
  const suspiciousPatterns = [
    /\.\.\//,         // Path traversal
    /union.*select/i, // SQL injection
    /<script/i,       // XSS attempts
    /eval\(/i,        // Code injection
    /cmd=/i,          // Command injection
    /\|/,             // Pipe commands
  ];
  
  const requestData = JSON.stringify(req.body || {}) + JSON.stringify(req.query || {}) + req.path;
  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(requestData));
  
  if (isSuspicious) {
    logger.error('🚨 Suspicious request detected:', {
      ip: req.ip,
      method: req.method,
      path: req.path,
      userAgent: req.get('User-Agent'),
      body: req.body,
      query: req.query,
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

/**
 * 🛡️ Complete Security Suite
 */
export const securitySuite = [
  securityHeaders,
  apiRateLimit,
  sanitizeInput,
  securityLogger,
];

export default {
  securityHeaders,
  apiRateLimit,
  authRateLimit,
  aiRateLimit,
  sanitizeInput,
  handleValidationErrors,
  csrfProtection,
  securityLogger,
  securitySuite
};