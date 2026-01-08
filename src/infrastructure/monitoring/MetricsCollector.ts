import { Registry, Counter, Gauge, Histogram, collectDefaultMetrics } from 'prom-client';
import { EventEmitter } from 'events';

export class MetricsCollector extends EventEmitter {
  private register: Registry;
  private httpRequests: Counter<string>;
  private errors: Counter<string>;
  private healingAttempts: Counter<string>;
  private activeConnections: Gauge<string>;
  private memoryUsage: Gauge<string>;
  private httpDuration: Histogram<string>;
  private dbQueryDuration: Histogram<string>;

  constructor() {
    super();
    this.register = new Registry();
    collectDefaultMetrics({ register: this.register });

    this.httpRequests = new Counter({
      name: 'http_requests_total',
      help: 'Total HTTP requests',
      labelNames: ['method', 'route', 'status'],
      registers: [this.register]
    });

    this.httpDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration',
      labelNames: ['method', 'route'],
      buckets: [0.1, 0.5, 1, 2, 5],
      registers: [this.register]
    });

    this.errors = new Counter({
      name: 'errors_total',
      help: 'Total errors',
      labelNames: ['type', 'severity'],
      registers: [this.register]
    });

    this.healingAttempts = new Counter({
      name: 'healing_attempts_total',
      help: 'Self-healing attempts',
      labelNames: ['type', 'success'],
      registers: [this.register]
    });

    this.activeConnections = new Gauge({
      name: 'active_connections',
      help: 'Number of active connections',
      registers: [this.register]
    });

    this.memoryUsage = new Gauge({
      name: 'memory_usage_bytes',
      help: 'Memory usage in bytes',
      labelNames: ['type'],
      registers: [this.register]
    });

    this.dbQueryDuration = new Histogram({
      name: 'database_query_duration_seconds',
      help: 'Database query duration',
      labelNames: ['operation', 'table'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1],
      registers: [this.register]
    });

    this.startSystemMonitoring();
  }

  recordHttpRequest(method: string, route: string, status: number, duration: number): void {
    this.httpRequests.inc({ method, route, status: status.toString() });
    this.httpDuration.observe({ method, route }, duration);
  }

  recordError(type: string, severity: 'low' | 'medium' | 'high' | 'critical'): void {
    this.errors.inc({ type, severity });
    if (severity === 'critical') {
      this.emit('critical_error', { type });
    }
  }

  recordHealing(type: string, success: boolean): void {
    this.healingAttempts.inc({ type, success: success.toString() });
  }

  recordDatabaseQuery(operation: string, table: string, duration: number): void {
    this.dbQueryDuration.observe({ operation, table }, duration);
  }

  setActiveConnections(count: number): void {
    this.activeConnections.set(count);
  }

  private startSystemMonitoring(): void {
    setInterval(() => {
      const usage = process.memoryUsage();
      this.memoryUsage.set({ type: 'heap_used' }, usage.heapUsed);
      this.memoryUsage.set({ type: 'heap_total' }, usage.heapTotal);
      this.memoryUsage.set({ type: 'rss' }, usage.rss);
      this.memoryUsage.set({ type: 'external' }, usage.external);
    }, 5000);
  }

  async getMetrics(): Promise<string> {
    return this.register.metrics();
  }

  getHealthStatus() {
    const memUsage = process.memoryUsage();
    const heapPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    
    return {
      status: heapPercent > 90 ? 'unhealthy' : 'healthy',
      memory: {
        heapUsedPercent: heapPercent,
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        rss: memUsage.rss
      },
      uptime: process.uptime(),
      timestamp: new Date()
    };
  }
}

export const metricsCollector = new MetricsCollector();
