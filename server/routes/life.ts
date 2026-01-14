/**
 * 🏠 Life Management API Routes
 * APIs لإدارة الحياة الشخصية - Maestro Harmony
 */

import { Router } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import logger from '../utils/logger';
import { arcHierarchy } from '../arc/hierarchy_system';

export const lifeRouter = Router();

// Get life overview
lifeRouter.get('/overview', async (req, res) => {
  try {
    // Calculate metrics from database
    const metricsQuery = await db.execute(sql`
      SELECT 
        COUNT(*) FILTER (WHERE category = 'health') as health_records,
        COUNT(*) FILTER (WHERE category = 'productivity') as productivity_records,
        COUNT(*) FILTER (WHERE key LIKE '%goal%') as goals_count
      FROM system_settings
      WHERE category IN ('health', 'productivity', 'wellbeing')
    `);
    
    const metrics = metricsQuery.rows[0] || {};
    
    const overview = {
      healthScore: 92,
      productivityScore: 88,
      wellbeingScore: 94,
      tasksCompleted: Number(metrics.productivity_records) || 156,
      upcomingEvents: 8,
      goalsProgress: 76,
      socialConnections: 45,
      lastUpdated: new Date()
    };
    res.json({ success: true, data: overview });
  } catch (error) {
    logger.error('Error fetching life overview:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch life overview' });
  }
});

// Get daily schedule
lifeRouter.get('/schedule', async (req, res) => {
  try {
    const { date } = req.query;
    const schedule = [
      { id: '1', time: '08:00', title: 'Morning Routine', type: 'health', duration: 60, status: 'completed' },
      { id: '2', time: '09:00', title: 'Team Meeting', type: 'work', duration: 45, status: 'upcoming' },
      { id: '3', time: '10:00', title: 'Focus Time - Development', type: 'work', duration: 120, status: 'upcoming' },
      { id: '4', time: '12:30', title: 'Lunch Break', type: 'health', duration: 60, status: 'upcoming' },
      { id: '5', time: '14:00', title: 'Client Call', type: 'work', duration: 30, status: 'upcoming' },
      { id: '6', time: '18:00', title: 'Gym Session', type: 'health', duration: 90, status: 'upcoming' },
      { id: '7', time: '20:00', title: 'Family Time', type: 'social', duration: 120, status: 'upcoming' }
    ];
    res.json({ success: true, data: schedule });
  } catch (error) {
    logger.error('Error fetching schedule:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch schedule' });
  }
});

// Get life team
lifeRouter.get('/team', async (req, res) => {
  try {
    const specialists = arcHierarchy.getSpecialists('life' as any);
    const team = specialists.map(agent => ({
      id: agent.id,
      name: agent.name || 'Agent',
      nameAr: agent.nameAr,
      role: agent.role,
      status: agent.status,
      tasksToday: Math.floor(Math.random() * 50) + 30,
      icon: getAgentIcon(agent.id),
      color: 'hsl(var(--accent))'
    }));
    res.json({ success: true, data: team });
  } catch (error) {
    logger.error('Error fetching life team:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch life team' });
  }
});

// Get health metrics
lifeRouter.get('/health', async (req, res) => {
  try {
    const health = {
      overall: 92,
      sleep: { hours: 7.5, quality: 85 },
      exercise: { minutes: 45, consistency: 90 },
      nutrition: { score: 88, meals: 3 },
      stress: { level: 35, trend: 'decreasing' },
      lastUpdated: new Date()
    };
    res.json({ success: true, data: health });
  } catch (error) {
    logger.error('Error fetching health metrics:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch health metrics' });
  }
});

function getAgentIcon(agentId: string): string {
  const icons: Record<string, string> = { health: '💊', social: '👥', finance: '💰', growth: '🌱' };
  return icons[agentId.toLowerCase()] || '🏠';
}

export default lifeRouter;
