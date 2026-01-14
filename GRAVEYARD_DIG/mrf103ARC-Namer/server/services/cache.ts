import NodeCache from 'node-cache';

interface CacheOptions {
  stdTTL?: number; // Standard time to live in seconds
  checkperiod?: number; // Check for expired keys every X seconds
  useClones?: boolean; // Clone objects before returning
  deleteOnExpire?: boolean;
  maxKeys?: number;
}

/**
 * Simple in-memory cache service
 */
class CacheService {
  private cache: NodeCache;
  private hitCount = 0;
  private missCount = 0;

  constructor(options: CacheOptions = {}) {
    this.cache = new NodeCache({
      stdTTL: options.stdTTL || 300, // 5 minutes default
      checkperiod: options.checkperiod || 60, // Check every minute
      useClones: options.useClones !== false,
      deleteOnExpire: options.deleteOnExpire !== false,
      maxKeys: options.maxKeys || 1000,
    });

    // Log cache statistics periodically
    setInterval(() => this.logStats(), 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | undefined {
    const value = this.cache.get<T>(key);
    
    if (value !== undefined) {
      this.hitCount++;
      console.log(`Cache HIT: ${key}`);
    } else {
      this.missCount++;
      console.log(`Cache MISS: ${key}`);
    }
    
    return value;
  }

  /**
   * Set value in cache
   */
  set<T>(key: string, value: T, ttl?: number): boolean {
    const success = this.cache.set(key, value, ttl || 0);
    if (success) {
      console.log(`Cache SET: ${key} (TTL: ${ttl || 'default'}s)`);
    }
    return success;
  }

  /**
   * Delete value from cache
   */
  delete(key: string): number {
    return this.cache.del(key);
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Get or set pattern - common caching pattern
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    
    if (cached !== undefined) {
      return cached;
    }

    console.log(`Cache FETCH: ${key}`);
    const value = await fetcher();
    this.set(key, value, ttl);
    
    return value;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.flushAll();
    console.log('Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const keys = this.cache.keys();
    const hitRate = this.hitCount + this.missCount > 0
      ? (this.hitCount / (this.hitCount + this.missCount) * 100).toFixed(2)
      : '0.00';

    return {
      keys: keys.length,
      hits: this.hitCount,
      misses: this.missCount,
      hitRate: `${hitRate}%`,
      memoryUsage: process.memoryUsage(),
    };
  }

  /**
   * Log cache statistics
   */
  private logStats(): void {
    const stats = this.getStats();
    console.log('📊 Cache Statistics:', stats);
  }

  /**
   * Invalidate cache by pattern
   */
  invalidatePattern(pattern: string): number {
    const keys = this.cache.keys();
    const regex = new RegExp(pattern);
    let deleted = 0;

    for (const key of keys) {
      if (regex.test(key)) {
        this.delete(key);
        deleted++;
      }
    }

    if (deleted > 0) {
      console.log(`Invalidated ${deleted} cache entries matching pattern: ${pattern}`);
    }

    return deleted;
  }
}

// Create cache instances for different purposes

/**
 * General purpose cache (5 minutes TTL)
 */
export const cache = new CacheService({
  stdTTL: 300,
  checkperiod: 60,
});

/**
 * Short-lived cache for API responses (1 minute TTL)
 */
export const apiCache = new CacheService({
  stdTTL: 60,
  checkperiod: 30,
});

/**
 * Long-lived cache for static data (1 hour TTL)
 */
export const staticCache = new CacheService({
  stdTTL: 3600,
  checkperiod: 300,
});

/**
 * Cache for AI responses (10 minutes TTL)
 */
export const aiCache = new CacheService({
  stdTTL: 600,
  checkperiod: 120,
  maxKeys: 500, // Limit AI cache size
});

// Helper functions for common cache keys

export function createCacheKey(prefix: string, ...parts: (string | number)[]): string {
  return `${prefix}:${parts.join(':')}`;
}

export function createUserCacheKey(userId: string, resource: string): string {
  return createCacheKey('user', userId, resource);
}

export function createAgentCacheKey(agentId: string, action: string): string {
  return createCacheKey('agent', agentId, action);
}

/**
 * Middleware to cache API responses
 */
export function cacheMiddleware(ttl: number = 300) {
  return (req: any, res: any, next: any) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = createCacheKey('api', req.path, JSON.stringify(req.query));
    const cached = apiCache.get(key);

    if (cached) {
      console.log(`Serving from cache: ${req.path}`);
      return res.json(cached);
    }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to cache response
    res.json = (data: any) => {
      if (res.statusCode === 200) {
        apiCache.set(key, data, ttl);
      }
      return originalJson(data);
    };

    next();
  };
}

export default cache;
