/**
 * 🗄️ Development Database Configuration
 * Simplified database setup with mock fallback for development
 */

import { logger } from '../utils/logger.js';

/**
 * Simple Mock Database for Development
 */
class DevDatabase {
  private connected = false;
  private mockData = new Map();

  async connect() {
    this.connected = true;
    logger.info('Development database connected (mock mode)');
  }

  async disconnect() {
    this.connected = false;
    logger.info('Development database disconnected');
  }

  async query(sql: string, params: any[] = []) {
    logger.debug('Mock Query:', { sql, params });
    
    // Mock common queries
    if (sql.includes('SELECT version()')) {
      return {
        rows: [{ version: 'Mock PostgreSQL 15.0 (Development)' }],
        rowCount: 1
      };
    }

    if (sql.includes('SELECT 1')) {
      return {
        rows: [{ '?column?': 1 }],
        rowCount: 1
      };
    }

    return { rows: [], rowCount: 0 };
  }

  async healthCheck() {
    return {
      status: this.connected ? 'healthy' : 'disconnected',
      latency: 1
    };
  }

  isHealthy() {
    return this.connected;
  }

  getStats() {
    return {
      connected: this.connected,
      type: 'mock-development'
    };
  }
}

// Export database instance
export const db = new DevDatabase();
export default db;

// Export functions for compatibility
export const query = db.query.bind(db);
export const checkDatabaseHealth = async () => {
  const health = await db.healthCheck();
  return health.status === 'healthy';
};

export const getPoolStatus = () => ({
  total: 1,
  idle: 1,
  waiting: 0
});

// Initialize connection
db.connect().catch(error => {
  logger.error('Failed to initialize development database:', error);
});