/**
 * 🗄️ PostgreSQL Database Configuration
 * Enterprise-grade connection pooling and transaction management
 */

import { Pool, PoolConfig, PoolClient } from 'pg';
import logger, { logStructuredError, ErrorCategory, performanceMonitor } from '../utils/logger';

// Connection configuration
const poolConfig: PoolConfig = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME || 'stellar_command',
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD,
  
  // Connection pool settings
  min: parseInt(process.env.DATABASE_POOL_MIN || '2'),
  max: parseInt(process.env.DATABASE_POOL_MAX || '20'),
  
  // Connection behavior
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  
  // Statement timeout (30 seconds)
  statement_timeout: 30000,
  
  // Query timeout
  query_timeout: 30000,
  
  // Keep alive
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  
  // SSL configuration (enable in production)
  ssl: process.env.NODE_ENV === 'production' && process.env.DATABASE_SSL === 'true'
    ? { rejectUnauthorized: false }
    : false
};

// Create connection pool
export const pool = new Pool(poolConfig);

// Pool event handlers
pool.on('connect', (client: PoolClient) => {
  logger.debug('New database connection established');
});

pool.on('acquire', (client: PoolClient) => {
  logger.debug('Client acquired from pool');
});

pool.on('error', (err: Error, client: PoolClient) => {
  logStructuredError({
    category: ErrorCategory.DATABASE,
    code: 'DB_POOL_ERROR',
    message: 'Unexpected database pool error',
    stack: err.stack,
    metadata: { error: err.message }
  });
});

pool.on('remove', (client: PoolClient) => {
  logger.debug('Client removed from pool');
});

// Health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    logger.error('Database health check failed:', error);
    return false;
  }
}

// Get connection status
export function getPoolStatus() {
  return {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount
  };
}

/**
 * Query wrapper with monitoring
 */
export async function query<T = any>(
  text: string,
  params?: any[],
  clientOverride?: PoolClient
): Promise<{ rows: T[]; rowCount: number }> {
  const timerId = performanceMonitor.startTimer('database_query');
  const client = clientOverride || pool;

  try {
    const result = await client.query(text, params);
    
    const duration = performanceMonitor.endTimer(timerId, 'database_query', {
      query: text.substring(0, 100),
      rowCount: result.rowCount
    });

    return {
      rows: result.rows,
      rowCount: result.rowCount || 0
    };
  } catch (error) {
    performanceMonitor.endTimer(timerId, 'database_query', {
      query: text.substring(0, 100),
      error: error instanceof Error ? (error instanceof Error ? error.message : 'Unknown error') : 'Unknown error'
    });

    logStructuredError({
      category: ErrorCategory.DATABASE,
      code: 'DB_QUERY_ERROR',
      message: 'Database query failed',
      stack: error instanceof Error ? error.stack : undefined,
      metadata: {
        query: text,
        params,
        error: error instanceof Error ? (error instanceof Error ? error.message : 'Unknown error') : 'Unknown error'
      }
    });

    throw error;
  }
}

/**
 * Transaction wrapper
 */
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const timerId = performanceMonitor.startTimer('database_transaction');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    
    performanceMonitor.endTimer(timerId, 'database_transaction', {
      status: 'committed'
    });

    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    
    performanceMonitor.endTimer(timerId, 'database_transaction', {
      status: 'rolled_back',
      error: error instanceof Error ? (error instanceof Error ? error.message : 'Unknown error') : 'Unknown error'
    });

    logStructuredError({
      category: ErrorCategory.DATABASE,
      code: 'DB_TRANSACTION_ERROR',
      message: 'Database transaction failed',
      stack: error instanceof Error ? error.stack : undefined,
      metadata: {
        error: error instanceof Error ? (error instanceof Error ? error.message : 'Unknown error') : 'Unknown error'
      }
    });

    throw error;
  } finally {
    client.release();
  }
}

/**
 * Batch insert helper
 */
export async function batchInsert(
  table: string,
  columns: string[],
  values: any[][],
  client?: PoolClient
): Promise<number> {
  if (values.length === 0) return 0;

  const placeholders = values
    .map((_, rowIndex) =>
      `(${columns.map((_, colIndex) => `$${rowIndex * columns.length + colIndex + 1}`).join(', ')})`
    )
    .join(', ');

  const flatValues = values.flat();
  const queryText = `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${placeholders}`;

  const result = await query(queryText, flatValues, client);
  return result.rowCount;
}

/**
 * Graceful shutdown
 */
export async function closePool(): Promise<void> {
  try {
    await pool.end();
    logger.info('Database connection pool closed');
  } catch (error) {
    logger.error('Error closing database pool:', error);
  }
}

// Register pool status with health monitor
import { healthMonitor } from '../utils/logger';

healthMonitor.registerCheck('database', async () => {
  return await checkDatabaseHealth();
});

healthMonitor.registerCheck('database-pool', async () => {
  const status = getPoolStatus();
  return status.total > 0 && status.waiting < 10;
});

// Register shutdown handler
process.on('SIGTERM', closePool);
process.on('SIGINT', closePool);

export default {
  pool,
  query,
  transaction,
  batchInsert,
  checkDatabaseHealth,
  getPoolStatus,
  closePool
};