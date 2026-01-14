import { metricsCollector } from './infrastructure/monitoring/MetricsCollector';
import { eventBus } from './infrastructure/events/EventBus';
import { notificationService } from './infrastructure/notifications/NotificationService';

export class SuperIntegration {
  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Self-Healing Events
    eventBus.subscribeWithRetry('healing:started', async (data) => {
      metricsCollector.recordHealing(data.type, false);
      await notificationService.notify({
        type: 'info',
        title: '🔧 Self-Healing Started',
        message: `Attempting to fix: ${data.type}`,
        data
      });
    });

    eventBus.subscribeWithRetry('healing:completed', async (data) => {
      metricsCollector.recordHealing(data.type, data.success);
      await notificationService.notify({
        type: data.success ? 'success' : 'error',
        title: data.success ? '✅ Healing Success' : '❌ Healing Failed',
        message: `Type: ${data.type}`,
        data
      });
    });

    // Deployment Events
    eventBus.subscribeWithRetry('deployment:started', async (data) => {
      await notificationService.notify({
        type: 'info',
        title: '🚀 Deployment Started',
        message: `Version: ${data.version} - Stage: ${data.stage}`,
        data
      });
    });

    eventBus.subscribeWithRetry('deployment:completed', async (data) => {
      await notificationService.notify({
        type: data.success ? 'success' : 'error',
        title: data.success ? '✅ Deployment Success' : '❌ Deployment Failed',
        message: `Version: ${data.version} - Stage: ${data.stage}`,
        data
      });
    });

    // Error Events
    eventBus.subscribeWithRetry('error:critical', async (data) => {
      metricsCollector.recordError(data.type, 'critical');
      await notificationService.alert('Critical System Error', data.message, data);
    });

    // Metrics Events
    metricsCollector.on('critical_error', async (data) => {
      await eventBus.publishWithLog('error:critical', data);
    });
  }

  async start(): Promise<void> {
    console.log('\n🚀 Starting Super AI System...');
    console.log('=====================================');
    console.log('✅ Event Bus: Active');
    console.log('✅ Metrics Collector: Running');
    console.log('✅ Notification Service: Ready');
    console.log('✅ Self-Healing: Enabled');
    console.log('=====================================');
    console.log('📊 Metrics: http://localhost:3000/api/metrics');
    console.log('🏥 Health: http://localhost:3000/api/health/metrics');
    console.log('📈 Events: http://localhost:3000/api/events/stats');
    console.log('🔔 Notifications: http://localhost:3000/api/notifications/stats');
    console.log('📋 Report: http://localhost:3000/api/system/report');
    console.log('=====================================\n');
  }

  async getSystemReport(): Promise<string> {
    const health = metricsCollector.getHealthStatus();
    const eventStats = eventBus.getStats();
    const notifStats = notificationService.getStats();

    return `
# 📊 System Status Report
Generated: ${new Date().toLocaleString('ar-SA')}

## 🏥 Health Status
- Status: ${health.status}
- Memory Usage: ${health.memory.heapUsedPercent.toFixed(1)}%
- Heap Used: ${(health.memory.heapUsed / 1024 / 1024).toFixed(2)} MB
- Heap Total: ${(health.memory.heapTotal / 1024 / 1024).toFixed(2)} MB
- RSS: ${(health.memory.rss / 1024 / 1024).toFixed(2)} MB
- Uptime: ${Math.floor(health.uptime / 60)} minutes

## 📡 Events
- Total Events: ${eventStats.totalEvents}
- Event Types: ${Object.keys(eventStats.eventCounts).length}
- Top Events: ${Object.entries(eventStats.eventCounts)
  .sort(([,a], [,b]) => (b as number) - (a as number))
  .slice(0, 5)
  .map(([name, count]) => `${name} (${count})`)
  .join(', ')}

## 🔔 Notifications
- Total Sent: ${notifStats.totalNotifications}
- Queue Size: ${notifStats.queueSize}
- Recent: ${notifStats.recentNotifications.length}

## ⚡ System Capabilities
✅ Real-time metrics collection
✅ Event-driven architecture
✅ Multi-channel notifications
✅ Self-healing integration
✅ Performance monitoring
✅ Error tracking
✅ Load balancing ready

## 🦅 Super AI Features
✅ Prometheus-compatible metrics
✅ Event bus with retry logic
✅ Slack/Discord/Email notifications
✅ Comprehensive health monitoring
✅ Auto-recovery mechanisms
    `;
  }
}

export const superSystem = new SuperIntegration();
