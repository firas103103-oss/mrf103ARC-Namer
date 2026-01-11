import { Router, Request, Response } from 'express';
import { supabase } from '../supabase';
import os from 'os';
import { selfHealer } from '../services/self-healer';
import logger from '../utils/logger';

const router = Router();

// Optional Redis client - will be undefined if Redis is not configured
let redisClient: any = null; // Using any since Redis is optional and may not be installed
let redisConnected = false; // Track Redis connection state

// Initialize Redis connection if configured
(async () => {
  try {
    if (process.env.REDIS_URL) {
      // Dynamic import to handle optional Redis dependency
      const redis = require('redis');
      redisClient = redis.createClient({ url: process.env.REDIS_URL });
      
      // Handle connection events
      redisClient.on('connect', () => {
        redisConnected = true;
        logger.info('✅ Redis connected successfully');
      });
      
      redisClient.on('error', (err: Error) => {
        redisConnected = false;
        logger.warn('Redis error:', err.message);
      });
      
      // Attempt connection
      await redisClient.connect();
    }
  } catch (err) {
    // Redis module not installed or failed to load
    redisClient = null;
    redisConnected = false;
    logger.warn('Redis module not available, running without Redis');
  }
})();

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  services: {
    database: ServiceStatus;
    supabase: ServiceStatus;
    memory: MemoryStatus;
    redis?: ServiceStatus;
  };
  version?: string;
  environment?: string;
}

interface ServiceStatus {
  status: 'up' | 'down' | 'unknown';
  responseTime?: number;
  message?: string;
}

interface MemoryStatus {
  status: 'up' | 'down';
  usage: {
    heapUsed: string;
    heapTotal: string;
    rss: string;
    external: string;
    percentage: number;
  };
}

/**
 * Health check endpoint
 * GET /api/health
 */
router.get('/health', async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    // Check database connection
    const dbStatus = await checkDatabase();
    
    // Check Supabase connection
    const supabaseStatus = await checkSupabase();
    
    // Check memory usage
    const memoryStatus = checkMemory();
    
    // Check Redis if available
    const redisStatus = await checkRedis();
    
    // Determine overall status - Redis is optional
    const criticalStatuses = [
      dbStatus.status,
      supabaseStatus.status,
      memoryStatus.status
    ];
    const overallStatus = determineOverallStatus(criticalStatuses);
    
    const health: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: dbStatus,
        supabase: supabaseStatus,
        memory: memoryStatus,
      },
      version: process.env.npm_package_version || '2.1.0', // Fallback version if npm_package_version not set
      environment: process.env.NODE_ENV || 'development',
    };
    
    // Add Redis status if configured
    if (redisStatus) {
      health.services.redis = redisStatus;
    }
    
    const statusCode = overallStatus === 'healthy' ? 200 : 
                       overallStatus === 'degraded' ? 200 : 503;
    
    res.status(statusCode).json(health);
    
    console.log(`Health check completed in ${Date.now() - startTime}ms - Status: ${overallStatus}`);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? (error instanceof Error ? error.message : 'Unknown error') : 'Unknown error',
    });
  }
});

/**
 * Simple liveness probe (for Kubernetes/Railway)
 * GET /api/health/live
 */
router.get('/health/live', (req: Request, res: Response) => {
  res.status(200).json({ status: 'alive' });
});

/**
 * Readiness probe
 * GET /api/health/ready
 */
router.get('/health/ready', async (req: Request, res: Response) => {
  try {
    const dbStatus = await checkDatabase();
    
    if (dbStatus.status === 'up') {
      res.status(200).json({ status: 'ready' });
    } else {
      res.status(503).json({ status: 'not_ready', reason: dbStatus.message });
    }
  } catch (error) {
    res.status(503).json({ status: 'not_ready', error: 'Database check failed' });
  }
});

// Helper functions

async function checkDatabase(): Promise<ServiceStatus> {
  const start = Date.now();
  
  if (!supabase) {
    return {
      status: 'down',
      responseTime: 0,
      message: 'Database not configured',
    };
  }
  
  try {
    // Simple query to check database connectivity
    const { data, error } = await supabase
      .from('agents')
      .select('id')
      .limit(1);
    
    const responseTime = Date.now() - start;
    
    if (error) {
      return {
        status: 'down',
        responseTime,
        message: (error instanceof Error ? error.message : 'Unknown error'),
      };
    }
    
    return {
      status: 'up',
      responseTime,
    };
  } catch (error) {
    return {
      status: 'down',
      responseTime: Date.now() - start,
      message: error instanceof Error ? (error instanceof Error ? error.message : 'Unknown error') : 'Unknown error',
    };
  }
}

async function checkSupabase(): Promise<ServiceStatus> {
  const start = Date.now();
  
  if (!supabase) {
    return {
      status: 'down',
      responseTime: 0,
      message: 'Supabase not configured',
    };
  }
  
  try {
    // Check Supabase connection
    const { error } = await supabase.from('agents').select('count', { count: 'exact', head: true });
    
    const responseTime = Date.now() - start;
    
    if (error) {
      return {
        status: 'down',
        responseTime,
        message: (error instanceof Error ? error.message : 'Unknown error'),
      };
    }
    
    return {
      status: 'up',
      responseTime,
    };
  } catch (error) {
    return {
      status: 'down',
      responseTime: Date.now() - start,
      message: error instanceof Error ? (error instanceof Error ? error.message : 'Unknown error') : 'Unknown error',
    };
  }
}

function checkMemory(): MemoryStatus {
  const usage = process.memoryUsage();
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  const memoryPercentage = (usedMemory / totalMemory) * 100;
  
  return {
    status: memoryPercentage < 90 ? 'up' : 'down',
    usage: {
      heapUsed: formatBytes(usage.heapUsed),
      heapTotal: formatBytes(usage.heapTotal),
      rss: formatBytes(usage.rss),
      external: formatBytes(usage.external),
      percentage: Math.round(memoryPercentage),
    },
  };
}

function determineOverallStatus(statuses: Array<'up' | 'down' | 'unknown'>): 'healthy' | 'degraded' | 'unhealthy' {
  const downCount = statuses.filter(s => s === 'down').length;
  const unknownCount = statuses.filter(s => s === 'unknown').length;
  
  if (downCount === 0 && unknownCount === 0) {
    return 'healthy';
  } else if (downCount > 0 && downCount < statuses.length) {
    return 'degraded';
  } else {
    return 'unhealthy';
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

async function checkRedis(): Promise<ServiceStatus | null> {
  // If Redis is not configured, return null (optional service)
  if (!redisClient || !redisConnected) {
    return null;
  }
  
  const start = Date.now();
  
  try {
    // Simple ping to check Redis connectivity
    await redisClient.ping();
    
    const responseTime = Date.now() - start;
    
    return {
      status: 'up',
      responseTime,
    };
  } catch (error) {
    redisConnected = false; // Update connection state on error
    return {
      status: 'down',
      responseTime: Date.now() - start,
      message: error instanceof Error ? error.message : 'Redis check failed',
    };
  }
}

/**
 * Self-healing status endpoint
 * GET /api/health/self-heal
 */
router.get('/health/self-heal', async (req: Request, res: Response) => {
  try {
    const health = await selfHealer.runHealthChecks();
    
    res.json({
      status: health.overall,
      uptime: health.uptime,
      recoveryCount: health.recoveryCount,
      lastRecovery: health.lastRecovery?.toISOString(),
      checks: health.checks.map(c => ({
        name: c.name,
        status: c.status,
        latency: c.latency,
        recoveryAttempts: c.recoveryAttempts,
        lastCheck: c.lastCheck.toISOString(),
      })),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? (error instanceof Error ? error.message : 'Unknown error') : 'Self-heal check failed',
    });
  }
});

/**
 * Trigger manual recovery
 * POST /api/health/recover
 */
router.post('/health/recover', async (req: Request, res: Response) => {
  try {
    const health = await selfHealer.runHealthChecks();
    
    res.json({
      success: true,
      status: health.overall,
      recoveryCount: health.recoveryCount,
      message: 'Recovery checks completed',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? (error instanceof Error ? error.message : 'Unknown error') : 'Recovery failed',
    });
  }
});

export default router;
