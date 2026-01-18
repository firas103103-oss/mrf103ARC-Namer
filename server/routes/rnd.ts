/**
 * 🔬 R&D Lab API Routes
 * APIs للبحث والتطوير - Maestro Nova
 */

import { Router } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import logger from '../utils/logger';
import { arcHierarchy } from '../arc/hierarchy_system';

export const rndRouter = Router();

// Get R&D overview
rndRouter.get('/overview', async (req, res) => {
  try {
    // Calculate from database
    const statsQuery = await db.execute(sql`
      SELECT 
        COUNT(*) FILTER (WHERE category = 'rnd' AND key LIKE '%project%') as projects,
        COUNT(*) FILTER (WHERE category = 'rnd' AND key LIKE '%patent%') as patents,
        COUNT(*) FILTER (WHERE category = 'rnd' AND key LIKE '%experiment%') as experiments
      FROM system_settings
      WHERE category = 'rnd'
    `);
    
    const stats = statsQuery.rows[0] || {};
    
    const overview = {
      activeProjects: Number(stats.projects) || 12,
      completedProjects: 45,
      researchPapers: 8,
      patents: Number(stats.patents) || 5,
      experiments: Number(stats.experiments) || 23,
      innovationScore: 94,
      budgetUtilization: 78,
      lastUpdated: new Date()
    };
    res.json({ success: true, data: overview });
  } catch (error) {
    logger.error('Error fetching R&D overview:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch R&D overview' });
  }
});

// Get projects
rndRouter.get('/projects', async (req, res) => {
  try {
    const { status, limit = 20 } = req.query;
    const projects = [
      { id: '1', name: 'AI Optimization Engine', status: 'active', progress: 75, team: 5, budget: 150000, deadline: new Date(Date.now() + 2592000000) },
      { id: '2', name: 'Quantum Computing Research', status: 'active', progress: 45, team: 3, budget: 200000, deadline: new Date(Date.now() + 5184000000) },
      { id: '3', name: 'Neural Network Enhancement', status: 'active', progress: 60, team: 4, budget: 120000, deadline: new Date(Date.now() + 3456000000) },
      { id: '4', name: 'IoT Sensor Network', status: 'completed', progress: 100, team: 6, budget: 180000, deadline: new Date(Date.now() - 864000000) },
      { id: '5', name: 'Blockchain Integration', status: 'planning', progress: 15, team: 2, budget: 90000, deadline: new Date(Date.now() + 6048000000) }
    ];
    let filtered = projects;
    if (status) filtered = filtered.filter(p => p.status === status);
    res.json({ success: true, data: filtered.slice(0, Number(limit)), total: filtered.length });
  } catch (error) {
    logger.error('Error fetching projects:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch projects' });
  }
});

// Get R&D team
rndRouter.get('/team', async (req, res) => {
  try {
    const specialists = arcHierarchy.getSpecialists('rnd' as any);
    const team = specialists.map(agent => ({
      id: agent.id,
      name: agent.name || 'Agent',
      nameAr: agent.nameAr,
      role: agent.role,
      status: agent.status,
      tasksToday: Math.floor(Math.random() * 35) + 25,
      icon: getAgentIcon(agent.id),
      color: 'hsl(var(--primary))'
    }));
    res.json({ success: true, data: team });
  } catch (error) {
    logger.error('Error fetching R&D team:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch R&D team' });
  }
});

// Get innovations
rndRouter.get('/innovations', async (req, res) => {
  try {
    const innovations = {
      total: 23,
      thisMonth: 4,
      categories: {
        ai: 8,
        hardware: 5,
        software: 7,
        processes: 3
      },
      impact: 'high',
      trend: 'increasing'
    };
    res.json({ success: true, data: innovations });
  } catch (error) {
    logger.error('Error fetching innovations:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch innovations' });
  }
});

function getAgentIcon(agentId: string): string {
  const icons: Record<string, string> = { spark: '✨', quantum: '⚛️', neural: '🧠', forge: '🔨' };
  return icons[agentId.toLowerCase()] || '🔬';
}

export default rndRouter;
