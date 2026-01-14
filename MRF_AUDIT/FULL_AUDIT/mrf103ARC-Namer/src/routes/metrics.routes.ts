import { Router, Request, Response } from 'express';
import { metricsCollector } from '../infrastructure/monitoring/MetricsCollector';
import { eventBus } from '../infrastructure/events/EventBus';
import { notificationService } from '../infrastructure/notifications/NotificationService';
import { superSystem } from '../SuperIntegration';

const router = Router();

// Prometheus metrics endpoint
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    res.set('Content-Type', 'text/plain');
    const metrics = await metricsCollector.getMetrics();
    res.send(metrics);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ error: 'Failed to get metrics' });
  }
});

// Health metrics endpoint
router.get('/health/metrics', (req: Request, res: Response) => {
  try {
    const health = metricsCollector.getHealthStatus();
    res.json(health);
  } catch (error) {
    console.error('Error fetching health:', error);
    res.status(500).json({ error: 'Failed to get health status' });
  }
});

// Event statistics endpoint
router.get('/events/stats', (req: Request, res: Response) => {
  try {
    const stats = eventBus.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching event stats:', error);
    res.status(500).json({ error: 'Failed to get event stats' });
  }
});

// Event history endpoint
router.get('/events/history', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const history = eventBus.getHistory(limit);
    res.json(history);
  } catch (error) {
    console.error('Error fetching event history:', error);
    res.status(500).json({ error: 'Failed to get event history' });
  }
});

// Notification statistics endpoint
router.get('/notifications/stats', (req: Request, res: Response) => {
  try {
    const stats = notificationService.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({ error: 'Failed to get notification stats' });
  }
});

// System report endpoint
router.get('/system/report', async (req: Request, res: Response) => {
  try {
    res.set('Content-Type', 'text/plain; charset=utf-8');
    const report = await superSystem.getSystemReport();
    res.send(report);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate system report' });
  }
});

// Test notification endpoint
router.post('/test/notification', async (req: Request, res: Response) => {
  try {
    await notificationService.notify({
      type: 'info',
      title: 'Test Notification',
      message: 'This is a test notification from the Super AI System',
      data: { timestamp: new Date(), source: 'API' }
    });
    res.json({ message: 'Test notification sent successfully' });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ error: 'Failed to send test notification' });
  }
});

// Trigger test event endpoint
router.post('/test/event', async (req: Request, res: Response) => {
  try {
    const { event, data } = req.body;
    await eventBus.publishWithLog(event || 'test:event', data || { test: true });
    res.json({ message: 'Test event published successfully' });
  } catch (error) {
    console.error('Error publishing test event:', error);
    res.status(500).json({ error: 'Failed to publish test event' });
  }
});

export default router;
