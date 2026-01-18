import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  statusCode?: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitInfo {
  resetAt: number;
  count: number;
  firstRequest: number;
}

/**
 * Advanced Rate Limiter with sliding window
 */
export class RateLimiter {
  private hits = new Map<string, RateLimitInfo>();
  private options: Required<RateLimitOptions>;

  constructor(options: RateLimitOptions) {
    this.options = {
      windowMs: options.windowMs,
      max: options.max,
      message: options.message || 'Too many requests, please try again later.',
      statusCode: options.statusCode || 429,
      skipSuccessfulRequests: options.skipSuccessfulRequests || false,
      skipFailedRequests: options.skipFailedRequests || false,
    };

    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  middleware = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
      const key = this.generateKey(req);
      const now = Date.now();
      
      let info = this.hits.get(key);

      // Initialize or reset if window expired
      if (!info || info.resetAt <= now) {
        info = {
          resetAt: now + this.options.windowMs,
          count: 0,
          firstRequest: now,
        };
        this.hits.set(key, info);
      }

      // Increment count
      info.count += 1;

      // Set rate limit headers
      const remaining = Math.max(0, this.options.max - info.count);
      const resetTime = Math.ceil(info.resetAt / 1000);

      res.setHeader('X-RateLimit-Limit', this.options.max);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', resetTime);

      // Check if limit exceeded
      if (info.count > this.options.max) {
        const retryAfter = Math.ceil((info.resetAt - now) / 1000);
        res.setHeader('Retry-After', retryAfter);
        
        logger.warn(`Rate limit exceeded for ${key}: ${info.count}/${this.options.max}`);
        
        return res.status(this.options.statusCode).json({
          error: 'rate_limit_exceeded',
          message: this.options.message,
          retryAfter,
        });
      }

      // Handle response tracking
      if (this.options.skipSuccessfulRequests || this.options.skipFailedRequests) {
        const limiterOptions = this.options;
        const originalSend = res.json;
        res.json = function (this: any, data: any) {
          const statusCode = res.statusCode;
          
          if (
            (statusCode >= 200 && statusCode < 300 && limiterOptions.skipSuccessfulRequests) ||
            (statusCode >= 400 && limiterOptions.skipFailedRequests)
          ) {
            if (info) {
              info.count -= 1;
            }
          }
          
          return originalSend.call(this, data);
        };
      }

      next();
    };
  };

  private generateKey(req: Request): string {
    const ip = this.getClientIp(req);
    const path = req.path;
    const user = (req as any).session?.userId || 'anonymous';
    return `${path}:${ip}:${user}`;
  }

  private getClientIp(req: Request): string {
    const xff = req.headers['x-forwarded-for'];
    if (typeof xff === 'string' && xff.length > 0) {
      return xff.split(',')[0].trim();
    }
    return req.ip || req.socket.remoteAddress || 'unknown';
  }

  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    // Convert entries to array to avoid iterator issues
    const entries = Array.from(this.hits.entries());
    for (const [key, info] of entries) {
      if (info.resetAt <= now) {
        this.hits.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`Rate limiter cleanup: removed ${cleaned} expired entries`);
    }
  }

  // Public method to check current status
  getStatus(req: Request): { count: number; remaining: number; resetAt: number } | null {
    const key = this.generateKey(req);
    const info = this.hits.get(key);

    if (!info) {
      return null;
    }

    return {
      count: info.count,
      remaining: Math.max(0, this.options.max - info.count),
      resetAt: info.resetAt,
    };
  }
}

// Pre-configured rate limiters for different use cases

/**
 * General API rate limiter: 100 requests per minute
 */
export const apiLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: 'Too many API requests, please try again later.',
});

/**
 * AI endpoint rate limiter: 20 requests per minute (more expensive)
 */
export const aiLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: 'Too many AI requests, please try again later.',
});

/**
 * Authentication rate limiter: 5 attempts per 15 minutes
 */
export const authLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true, // Don't count successful logins
});

/**
 * Strict rate limiter: 10 requests per minute
 */
export const strictLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: 'Rate limit exceeded for this sensitive operation.',
});
