/**
 * 🔴 Redis Configuration
 * Enterprise caching, sessions, and rate limiting
 */

import { createClient, RedisClientType } from 'redis';
import logger, { logStructuredError, ErrorCategory, performanceMonitor } from '../utils/logger';

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  
  // Retry strategy
  socket: {
    reconnectStrategy: (retries: number) => {
      if (retries > 10) {
        logger.error('Redis max retries reached, giving up');
        return new Error('Redis max retries reached');
      }
      return Math.min(retries * 100, 3000);
    },
    connectTimeout: 10000
  },
  
  // Command timeout
  commandsQueueMaxLength: 1000
};

// Create Redis client
export const redis: RedisClientType = createClient(redisConfig as any);

// Connection handlers
redis.on('connect', () => {
  logger.info('Redis client connected');
});

redis.on('ready', () => {
  logger.info('Redis client ready');
});

redis.on('error', (err) => {
  logStructuredError({
    category: ErrorCategory.EXTERNAL_API,
    code: 'REDIS_ERROR',
    message: 'Redis client error',
    stack: err.stack,
    metadata: { error: err.message }
  });
});

redis.on('reconnecting', () => {
  logger.warn('Redis client reconnecting');
});

redis.on('end', () => {
  logger.warn('Redis client connection closed');
});

// Connect to Redis
let isConnected = false;

export async function connectRedis(): Promise<void> {
  if (isConnected) return;

  try {
    await redis.connect();
    isConnected = true;
    logger.info('✅ Redis connected successfully');
  } catch (error) {
    logStructuredError({
      category: ErrorCategory.EXTERNAL_API,
      code: 'REDIS_CONNECTION_FAILED',
      message: 'Failed to connect to Redis',
      stack: error instanceof Error ? error.stack : undefined,
      metadata: {
        error: error instanceof Error ? (error instanceof Error ? error.message : 'Unknown error') : 'Unknown error',
        host: redisConfig.host,
        port: redisConfig.port
      }
    });
    throw error;
  }
}

// Health check
export async function checkRedisHealth(): Promise<boolean> {
  try {
    const response = await redis.ping();
    return response === 'PONG';
  } catch (error) {
    logger.error('Redis health check failed:', error);
    return false;
  }
}

/**
 * Cache wrapper functions with monitoring
 */

// Get from cache
export async function getCache<T = any>(key: string): Promise<T | null> {
  const timerId = performanceMonitor.startTimer('redis_get');
  
  try {
    const value = await redis.get(key);
    
    performanceMonitor.endTimer(timerId, 'redis_get', {
      key,
      hit: value !== null
    });

    if (!value) return null;
    
    try {
      return JSON.parse(value);
    } catch {
      return value as any;
    }
  } catch (error) {
    performanceMonitor.endTimer(timerId, 'redis_get', {
      key,
      error: error instanceof Error ? (error instanceof Error ? error.message : 'Unknown error') : 'Unknown error'
    });
    
    logger.error('Redis GET error:', { key, error });
    return null;
  }
}

// Set to cache
export async function setCache(
  key: string,
  value: any,
  ttl?: number
): Promise<boolean> {
  const timerId = performanceMonitor.startTimer('redis_set');
  
  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    
    if (ttl) {
      await redis.setEx(key, ttl, stringValue);
    } else {
      await redis.set(key, stringValue);
    }
    
    performanceMonitor.endTimer(timerId, 'redis_set', {
      key,
      ttl,
      size: stringValue.length
    });

    return true;
  } catch (error) {
    performanceMonitor.endTimer(timerId, 'redis_set', {
      key,
      error: error instanceof Error ? (error instanceof Error ? error.message : 'Unknown error') : 'Unknown error'
    });
    
    logger.error('Redis SET error:', { key, error });
    return false;
  }
}

// Delete from cache
export async function deleteCache(key: string): Promise<boolean> {
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    logger.error('Redis DELETE error:', { key, error });
    return false;
  }
}

// Delete pattern
export async function deleteCachePattern(pattern: string): Promise<number> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length === 0) return 0;
    
    await redis.del(keys);
    return keys.length;
  } catch (error) {
    logger.error('Redis DELETE PATTERN error:', { pattern, error });
    return 0;
  }
}

// Increment counter
export async function incrementCounter(
  key: string,
  ttl?: number
): Promise<number> {
  try {
    const value = await redis.incr(key);
    
    if (ttl && value === 1) {
      await redis.expire(key, ttl);
    }
    
    return value;
  } catch (error) {
    logger.error('Redis INCR error:', { key, error });
    return 0;
  }
}

// Get counter
export async function getCounter(key: string): Promise<number> {
  try {
    const value = await redis.get(key);
    return value ? parseInt(value) : 0;
  } catch (error) {
    logger.error('Redis GET COUNTER error:', { key, error });
    return 0;
  }
}

// Hash operations
export async function setHash(
  key: string,
  field: string,
  value: any
): Promise<boolean> {
  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    await redis.hSet(key, field, stringValue);
    return true;
  } catch (error) {
    logger.error('Redis HSET error:', { key, field, error });
    return false;
  }
}

export async function getHash<T = any>(
  key: string,
  field: string
): Promise<T | null> {
  try {
    const value = await redis.hGet(key, field);
    if (!value) return null;
    
    try {
      return JSON.parse(value);
    } catch {
      return value as any;
    }
  } catch (error) {
    logger.error('Redis HGET error:', { key, field, error });
    return null;
  }
}

export async function getAllHash<T = Record<string, any>>(
  key: string
): Promise<T | null> {
  try {
    const data = await redis.hGetAll(key);
    if (!data || Object.keys(data).length === 0) return null;
    
    const parsed: any = {};
    for (const [field, value] of Object.entries(data)) {
      try {
        parsed[field] = JSON.parse(value);
      } catch {
        parsed[field] = value;
      }
    }
    
    return parsed;
  } catch (error) {
    logger.error('Redis HGETALL error:', { key, error });
    return null;
  }
}

// List operations
export async function pushToList(
  key: string,
  value: any,
  maxLength?: number
): Promise<boolean> {
  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    await redis.lPush(key, stringValue);
    
    if (maxLength) {
      await redis.lTrim(key, 0, maxLength - 1);
    }
    
    return true;
  } catch (error) {
    logger.error('Redis LPUSH error:', { key, error });
    return false;
  }
}

export async function getList<T = any>(
  key: string,
  start: number = 0,
  end: number = -1
): Promise<T[]> {
  try {
    const values = await redis.lRange(key, start, end);
    return values.map(v => {
      try {
        return JSON.parse(v);
      } catch {
        return v as any;
      }
    });
  } catch (error) {
    logger.error('Redis LRANGE error:', { key, error });
    return [];
  }
}

// Pub/Sub operations
export async function publish(channel: string, message: any): Promise<boolean> {
  try {
    const stringMessage = typeof message === 'string' ? message : JSON.stringify(message);
    await redis.publish(channel, stringMessage);
    return true;
  } catch (error) {
    logger.error('Redis PUBLISH error:', { channel, error });
    return false;
  }
}

// Get Redis info
export async function getRedisInfo(): Promise<any> {
  try {
    const info = await redis.info();
    return parseRedisInfo(info);
  } catch (error) {
    logger.error('Redis INFO error:', error);
    return null;
  }
}

function parseRedisInfo(info: string): Record<string, any> {
  const lines = info.split('\r\n');
  const result: Record<string, any> = {};
  
  for (const line of lines) {
    if (line.includes(':')) {
      const [key, value] = line.split(':');
      result[key.trim()] = value.trim();
    }
  }
  
  return result;
}

// Graceful shutdown
export async function disconnectRedis(): Promise<void> {
  try {
    if (isConnected) {
      await redis.quit();
      isConnected = false;
      logger.info('Redis connection closed');
    }
  } catch (error) {
    logger.error('Error closing Redis connection:', error);
  }
}

// Register health check
import { healthMonitor } from '../utils/logger';

healthMonitor.registerCheck('redis', async () => {
  return await checkRedisHealth();
});

// Register shutdown handlers
process.on('SIGTERM', disconnectRedis);
process.on('SIGINT', disconnectRedis);

export default {
  redis,
  connectRedis,
  disconnectRedis,
  checkRedisHealth,
  getCache,
  setCache,
  deleteCache,
  deleteCachePattern,
  incrementCounter,
  getCounter,
  setHash,
  getHash,
  getAllHash,
  pushToList,
  getList,
  publish,
  getRedisInfo
};