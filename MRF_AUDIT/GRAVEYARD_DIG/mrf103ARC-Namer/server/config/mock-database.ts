import { logger } from '../utils/logger.js';

/**
 * Mock Database Service for Development
 * Provides in-memory database functionality when PostgreSQL is not available
 */
class MockDatabaseService {
  private isConnected = false;
  private data: Map<string, any> = new Map();

  async connect(): Promise<void> {
    try {
      this.isConnected = true;
      logger.info('Mock Database connected successfully');
    } catch (error) {
      logger.error('Mock Database connection failed', { error });
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    this.data.clear();
    logger.info('Mock Database disconnected');
  }

  async query(sql: string, params: any[] = []): Promise<{ rows: any[]; rowCount: number }> {
    logger.debug('Mock Database Query', { sql, params });
    
    // Mock responses for common queries
    if (sql.includes('SELECT version()')) {
      return {
        rows: [{ version: 'Mock PostgreSQL 15.0 (Development Mode)' }],
        rowCount: 1
      };
    }

    if (sql.includes('SELECT 1')) {
      return {
        rows: [{ '?column?': 1 }],
        rowCount: 1
      };
    }

    if (sql.includes('users')) {
      return {
        rows: [
          {
            id: '1',
            email: 'admin@arc.dev',
            username: 'admin',
            role: 'admin',
            created_at: new Date().toISOString()
          }
        ],
        rowCount: 1
      };
    }

    // Default empty response
    return {
      rows: [],
      rowCount: 0
    };
  }

  async healthCheck(): Promise<{ status: string; latency: number }> {
    const start = Date.now();
    
    if (!this.isConnected) {
      throw new Error('Mock Database not connected');
    }

    const latency = Date.now() - start;
    
    return {
      status: 'healthy',
      latency
    };
  }

  isHealthy(): boolean {
    return this.isConnected;
  }

  getStats() {
    return {
      connected: this.isConnected,
      dataSize: this.data.size,
      type: 'mock'
    };
  }
}

// Create singleton instance
export const mockDb = new MockDatabaseService();

// Export database interface that matches the real one
export const db = {
  query: mockDb.query.bind(mockDb),
  connect: mockDb.connect.bind(mockDb),
  disconnect: mockDb.disconnect.bind(mockDb),
  healthCheck: mockDb.healthCheck.bind(mockDb),
  isHealthy: mockDb.isHealthy.bind(mockDb),
  getStats: mockDb.getStats.bind(mockDb)
};

export default db;