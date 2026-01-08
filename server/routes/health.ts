import { Router, Request, Response } from 'express';
import { supabase } from '../supabase';
import os from 'os';
import { selfHealer } from '../services/self-healer';
import logger from '../utils/logger';

const router = Router();

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  services: {
    database: ServiceStatus;
    supabase: ServiceStatus;
    memory: MemoryStatus;
  };
  version?: string;
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
    
    // Determine overall status
    const overallStatus = determineOverallStatus([
      dbStatus.status,
      supabaseStatus.status,
      memoryStatus.status
    ]);
    
    const health: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: dbStatus,
        supabase: supabaseStatus,
        memory: memoryStatus,
      },
      version: process.env.npm_package_version || '1.0.0',
    };
    
    const statusCode = overallStatus === 'healthy' ? 200 : 
                       overallStatus === 'degraded' ? 200 : 503;
    
    res.status(statusCode).json(health);
    
    console.log(`Health check completed in ${Date.now() - startTime}ms - Status: ${overallStatus}`);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
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
        message: error.message,
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
      message: error instanceof Error ? error.message : 'Unknown error',
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
        message: error.message,
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
      message: error instanceof Error ? error.message : 'Unknown error',
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
      error: error instanceof Error ? error.message : 'Self-heal check failed',
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
      error: error instanceof Error ? error.message : 'Recovery failed',
    });
  }
});

export default router;
