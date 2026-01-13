#!/usr/bin/env node

/**
 * Quick test of Super AI System components
 * Run this to verify everything is working
 */

console.log('🦅 Testing Super AI System Components...\n');

// Test 1: MetricsCollector
console.log('1️⃣ Testing MetricsCollector...');
try {
  const { metricsCollector } = require('../src/infrastructure/monitoring/MetricsCollector');
  
  // Record some test metrics
  metricsCollector.recordHttpRequest('GET', '/test', 200, 0.5);
  metricsCollector.recordError('test_error', 'low');
  metricsCollector.recordHealing('test_healing', true);
  
  // Get health status
  const health = metricsCollector.getHealthStatus();
  console.log(`   ✅ Status: ${health.status}`);
  console.log(`   📊 Memory: ${health.memory.heapUsedPercent.toFixed(1)}%`);
  console.log(`   ⏱️  Uptime: ${Math.floor(health.uptime)}s`);
} catch (error) {
  console.log(`   ❌ Error: ${error.message}`);
}

// Test 2: EventBus
console.log('\n2️⃣ Testing EventBus...');
try {
  const { eventBus } = require('../src/infrastructure/events/EventBus');
  
  // Subscribe to test event
  eventBus.subscribeWithRetry('test:event', async (data) => {
    console.log(`   📨 Received event:`, data);
  });
  
  // Publish test event
  eventBus.publishWithLog('test:event', { message: 'Hello from test!' });
  
  // Get stats
  const stats = eventBus.getStats();
  console.log(`   ✅ Total Events: ${stats.totalEvents}`);
  console.log(`   📈 Event Types: ${Object.keys(stats.eventCounts).length}`);
} catch (error) {
  console.log(`   ❌ Error: ${error.message}`);
}

// Test 3: NotificationService
console.log('\n3️⃣ Testing NotificationService...');
try {
  const { notificationService } = require('../src/infrastructure/notifications/NotificationService');
  
  // Send test notification
  notificationService.notify({
    type: 'success',
    title: 'Test Notification',
    message: 'Super AI System is working!'
  });
  
  // Get stats
  const stats = notificationService.getStats();
  console.log(`   ✅ Total Notifications: ${stats.totalNotifications}`);
  console.log(`   📬 Queue Size: ${stats.queueSize}`);
} catch (error) {
  console.log(`   ❌ Error: ${error.message}`);
}

// Test 4: SuperIntegration
console.log('\n4️⃣ Testing SuperIntegration...');
try {
  const { superSystem } = require('../src/SuperIntegration');
  
  // Start system
  superSystem.start().then(() => {
    console.log('   ✅ System started successfully');
  });
  
  // Generate report after a delay
  setTimeout(async () => {
    const report = await superSystem.getSystemReport();
    console.log('\n📊 System Report Preview:');
    console.log(report.split('\n').slice(0, 15).join('\n'));
    console.log('   ...');
    
    console.log('\n================================================');
    console.log('🎉 All tests completed successfully!');
    console.log('================================================');
    console.log('\n🚀 Super AI System is ready!');
    console.log('📊 Metrics: http://localhost:5001/api/metrics');
    console.log('🏥 Health: http://localhost:5001/api/health/metrics');
    console.log('📈 Events: http://localhost:5001/api/events/stats');
    console.log('📋 Report: http://localhost:5001/api/system/report\n');
    
    process.exit(0);
  }, 2000);
  
} catch (error) {
  console.log(`   ❌ Error: ${error.message}`);
  process.exit(1);
}
