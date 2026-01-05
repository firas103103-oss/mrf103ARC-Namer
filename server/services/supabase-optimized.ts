/**
 * Optimized Supabase Service Layer
 * Provides caching, batching, and connection pooling for database operations
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { cache, createCacheKey } from "./cache";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: false,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'x-application-name': 'mrf103ARC-Namer',
      },
    },
  });
  console.log("✅ Supabase client initialized with optimizations");
} else {
  console.warn("⚠️ Supabase not configured: Missing SUPABASE_URL or SUPABASE_KEY");
}

export { supabase };

export function isSupabaseConfigured(): boolean {
  return supabase !== null;
}

// ==================== CACHED DATABASE OPERATIONS ====================

/**
 * Cached select query - Use for frequently accessed, rarely changing data
 */
export async function cachedSelect<T = any>(
  table: string,
  options: {
    select?: string;
    filters?: Record<string, any>;
    cacheTTL?: number;
    cacheKey?: string;
  } = {}
): Promise<T[] | null> {
  if (!supabase) {
    console.error('Supabase not configured');
    return null;
  }

  const {
    select = '*',
    filters = {},
    cacheTTL = 300, // 5 minutes default
    cacheKey: customCacheKey
  } = options;

  const cacheKey = customCacheKey || createCacheKey('db', table, select, JSON.stringify(filters));

  try {
    const result = await cache.getOrSet(
      cacheKey,
      async () => {
        let query = supabase!.from(table).select(select);
        
        // Apply filters
        for (const [key, value] of Object.entries(filters)) {
          query = query.eq(key, value);
        }

        const { data, error } = await query;
        
        if (error) {
          console.error(`Supabase query error on ${table}:`, error);
          return null;
        }
        
        return data;
      },
      cacheTTL
    );
    
    return result as T[] | null;
  } catch (error) {
    console.error(`cachedSelect error on ${table}:`, error);
    return null;
  }
}

/**
 * Insert with cache invalidation
 */
export async function insertWithInvalidation<T = any>(
  table: string,
  data: any | any[],
  options: {
    invalidatePattern?: string;
    returning?: boolean;
  } = {}
): Promise<{ data: T[] | null; error: any }> {
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  try {
    const query = supabase.from(table).insert(data);
    const result = options.returning !== false ? await query.select() : await query;

    // Invalidate related caches
    if (options.invalidatePattern) {
      cache.invalidatePattern(options.invalidatePattern);
    } else {
      // Default: invalidate all caches for this table
      cache.invalidatePattern(`db:${table}`);
    }

    return result;
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Update with cache invalidation
 */
export async function updateWithInvalidation<T = any>(
  table: string,
  filters: Record<string, any>,
  data: any,
  options: {
    invalidatePattern?: string;
    returning?: boolean;
  } = {}
): Promise<{ data: T[] | null; error: any }> {
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  try {
    let query = supabase.from(table).update(data);
    
    // Apply filters
    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value);
    }

    const result = options.returning !== false ? await query.select() : await query;

    // Invalidate related caches
    if (options.invalidatePattern) {
      cache.invalidatePattern(options.invalidatePattern);
    } else {
      cache.invalidatePattern(`db:${table}`);
    }

    return result;
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Batch insert with optimized transaction
 */
export async function batchInsert<T = any>(
  table: string,
  data: any[],
  options: {
    batchSize?: number;
    invalidatePattern?: string;
  } = {}
): Promise<{ data: T[] | null; error: any; inserted: number }> {
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured'), inserted: 0 };
  }

  const batchSize = options.batchSize || 100;
  const results: any[] = [];
  let inserted = 0;

  try {
    // Split into batches
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const { data: batchData, error } = await supabase
        .from(table)
        .insert(batch)
        .select();

      if (error) {
        console.error(`Batch insert error at index ${i}:`, error);
        continue;
      }

      if (batchData) {
        results.push(...batchData);
        inserted += batch.length;
      }
    }

    // Invalidate caches
    if (options.invalidatePattern) {
      cache.invalidatePattern(options.invalidatePattern);
    } else {
      cache.invalidatePattern(`db:${table}`);
    }

    return { data: results, error: null, inserted };
  } catch (error) {
    return { data: results, error, inserted };
  }
}

// ==================== AI AGENT SPECIFIC OPERATIONS ====================

/**
 * Store AI agent interaction with caching optimization
 */
export async function storeAgentInteraction(data: {
  agent_id: string;
  user_message: string;
  agent_response: string;
  metadata?: Record<string, any>;
}): Promise<{ success: boolean; id?: string; error?: any }> {
  try {
    const { data: result, error } = await insertWithInvalidation(
      'agent_interactions',
      {
        ...data,
        created_at: new Date().toISOString(),
      },
      {
        invalidatePattern: `agent:${data.agent_id}`,
        returning: true,
      }
    );

    if (error) {
      return { success: false, error };
    }

    return { success: true, id: result?.[0]?.id };
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * Get agent history with caching
 */
export async function getAgentHistory(
  agentId: string,
  options: {
    limit?: number;
    offset?: number;
    cacheTTL?: number;
  } = {}
): Promise<{ data: any[] | null; error: any }> {
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  const { limit = 50, offset = 0, cacheTTL = 60 } = options;
  const cacheKey = createCacheKey('agent-history', agentId, limit, offset);

  try {
    return await cache.getOrSet(
      cacheKey,
      async () => {
        const { data, error } = await supabase!
          .from('agent_interactions')
          .select('*')
          .eq('agent_id', agentId)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        return { data, error };
      },
      cacheTTL
    );
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Update agent analytics (aggregated, no immediate caching needed)
 */
export async function updateAgentAnalytics(
  agentId: string,
  metrics: {
    total_interactions?: number;
    success_rate?: number;
    avg_response_time?: number;
    last_active?: string;
  }
): Promise<{ success: boolean; error?: any }> {
  try {
    const { error } = await supabase!
      .from('agent_analytics')
      .upsert({
        agent_id: agentId,
        ...metrics,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      return { success: false, error };
    }

    // Invalidate analytics cache
    cache.invalidatePattern(`analytics:${agentId}`);

    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

// ==================== CONNECTION HEALTH ====================

/**
 * Test database connection
 */
export async function testConnection(): Promise<{ healthy: boolean; latency?: number; error?: any }> {
  if (!supabase) {
    return { healthy: false, error: 'Supabase not configured' };
  }

  const start = Date.now();
  
  try {
    const { error } = await supabase
      .from('agents')
      .select('id')
      .limit(1);

    const latency = Date.now() - start;

    if (error) {
      return { healthy: false, latency, error };
    }

    return { healthy: true, latency };
  } catch (error) {
    return { healthy: false, latency: Date.now() - start, error };
  }
}

/**
 * Get database statistics
 */
export async function getDatabaseStats(): Promise<{
  tables: Record<string, number>;
  cacheHitRate: string;
  error?: any;
}> {
  if (!supabase) {
    return { tables: {}, cacheHitRate: '0%', error: 'Supabase not configured' };
  }

  const tables = ['agents', 'agent_interactions', 'agent_tasks', 'agent_analytics'];
  const counts: Record<string, number> = {};

  try {
    await Promise.all(
      tables.map(async (table) => {
        const { count, error } = await supabase!
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (!error && count !== null) {
          counts[table] = count;
        }
      })
    );

    const cacheStats = cache.getStats();

    return {
      tables: counts,
      cacheHitRate: cacheStats.hitRate,
    };
  } catch (error) {
    return { tables: counts, cacheHitRate: '0%', error };
  }
}

export default {
  cachedSelect,
  insertWithInvalidation,
  updateWithInvalidation,
  batchInsert,
  storeAgentInteraction,
  getAgentHistory,
  updateAgentAnalytics,
  testConnection,
  getDatabaseStats,
};
