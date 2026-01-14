/**
 * 🛡️ Security Sector API Routes
 * APIs للقطاع الأمني - Maestro Cipher
 */

import { Router } from 'express';
import { db } from '../db';
import logger from '../utils/logger';
import { arcHierarchy } from '../arc/hierarchy_system';

export const securityRouter = Router();

// ===============================
// 🔒 SECURITY MONITORING
// ===============================

// Get security overview
securityRouter.get('/overview', async (req, res) => {
  try {
    const overview = {
      securityScore: 98,
      threatsBlocked: 23,
      filesEncrypted: 1456,
      activeMonitoring: 24,
      vulnerabilities: 2,
      lastScan: new Date(Date.now() - 3600000),
      status: 'excellent',
      lastUpdated: new Date()
    };

    res.json({ success: true, data: overview });
  } catch (error) {
    logger.error('Error fetching security overview:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch security overview' });
  }
});

// Get security events
securityRouter.get('/events', async (req, res) => {
  try {
    const { limit = 20, severity, type } = req.query;
    
    const events = [
      { 
        id: '1', 
        type: 'threat', 
        message: 'Blocked suspicious IP: 192.168.1.100', 
        agent: 'Aegis', 
        timestamp: new Date(Date.now() - 120000), 
        severity: 'high',
        details: 'Multiple failed login attempts detected'
      },
      { 
        id: '2', 
        type: 'success', 
        message: 'Encrypted 145 sensitive files', 
        agent: 'Phantom', 
        timestamp: new Date(Date.now() - 300000), 
        severity: 'low',
        details: 'Routine encryption completed'
      },
      { 
        id: '3', 
        type: 'alert', 
        message: 'Unusual access pattern detected', 
        agent: 'Watchtower', 
        timestamp: new Date(Date.now() - 420000), 
        severity: 'medium',
        details: 'User accessing system outside normal hours'
      },
      { 
        id: '4', 
        type: 'success', 
        message: 'Security audit completed', 
        agent: 'Ghost', 
        timestamp: new Date(Date.now() - 600000), 
        severity: 'low',
        details: 'All systems passed security audit'
      },
      { 
        id: '5', 
        type: 'threat', 
        message: 'DDoS attempt blocked', 
        agent: 'Aegis', 
        timestamp: new Date(Date.now() - 900000), 
        severity: 'critical',
        details: 'Incoming traffic spike detected and mitigated'
      }
    ];

    let filtered = events;
    if (severity) filtered = filtered.filter(e => e.severity === severity);
    if (type) filtered = filtered.filter(e => e.type === type);
    
    const paginated = filtered.slice(0, Number(limit));

    res.json({ 
      success: true, 
      data: paginated,
      total: filtered.length,
      limit: Number(limit)
    });
  } catch (error) {
    logger.error('Error fetching security events:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch security events' });
  }
});

// Get security team status
securityRouter.get('/team', async (req, res) => {
  try {
    const specialists = arcHierarchy.getSpecialists('security');
    
    const team = specialists.map(agent => ({
      id: agent.id,
      name: agent.nameEn,
      nameAr: agent.nameAr,
      role: agent.role,
      status: agent.status === 'active' ? 'active' : agent.status === 'busy' ? 'alert' : 'idle',
      tasksToday: Math.floor(Math.random() * 100) + 50,
      icon: getAgentIcon(agent.id),
      color: getAgentColor(agent.id)
    }));

    res.json({ success: true, data: team });
  } catch (error) {
    logger.error('Error fetching security team:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch security team' });
  }
});

// Get threat analysis
securityRouter.get('/threats', async (req, res) => {
  try {
    const { period = '24h' } = req.query;
    
    const analysis = {
      total: 23,
      blocked: 23,
      critical: 2,
      high: 5,
      medium: 8,
      low: 8,
      types: {
        ddos: 3,
        bruteforce: 8,
        malware: 2,
        phishing: 4,
        unauthorized: 6
      },
      trend: 'decreasing',
      period,
      lastUpdated: new Date()
    };

    res.json({ success: true, data: analysis });
  } catch (error) {
    logger.error('Error fetching threat analysis:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch threat analysis' });
  }
});

// Get firewall status
securityRouter.get('/firewall', async (req, res) => {
  try {
    const status = {
      enabled: true,
      rules: 156,
      blockedIPs: 234,
      allowedIPs: 45,
      activeConnections: 1234,
      bandwidth: {
        inbound: 125.5,  // MB/s
        outbound: 87.3   // MB/s
      },
      lastUpdated: new Date()
    };

    res.json({ success: true, data: status });
  } catch (error) {
    logger.error('Error fetching firewall status:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch firewall status' });
  }
});

// Create security incident
securityRouter.post('/incidents', async (req, res) => {
  try {
    const { type, severity, message, details } = req.body;

    if (!type || !severity || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: type, severity, message' 
      });
    }

    const incident = {
      id: Date.now().toString(),
      type,
      severity,
      message,
      details: details || '',
      timestamp: new Date(),
      status: 'new',
      assignedAgent: 'Watchtower'
    };

    logger.warn(`New security incident: ${incident.id}`, incident);
    res.json({ success: true, data: incident });
  } catch (error) {
    logger.error('Error creating security incident:', error);
    res.status(500).json({ success: false, error: 'Failed to create security incident' });
  }
});

// Helper functions
function getAgentIcon(agentId: string): string {
  const icons: Record<string, string> = {
    aegis: '🔥',
    phantom: '🔐',
    watchtower: '🗼',
    ghost: '👻'
  };
  return icons[agentId.toLowerCase()] || '🛡️';
}

function getAgentColor(agentId: string): string {
  const colors: Record<string, string> = {
    aegis: 'hsl(var(--destructive))',
    phantom: 'hsl(var(--muted-foreground))',
    watchtower: 'hsl(var(--warning))',
    ghost: 'hsl(var(--muted))'
  };
  return colors[agentId.toLowerCase()] || 'hsl(var(--destructive))';
}

export default securityRouter;
