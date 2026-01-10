/**
 * 🔌 ARC 2.0 API Routes
 * API endpoints للنظام الهرمي الجديد
 */

import { Router, Request, Response } from 'express';
import { arcHierarchy, CEO, MAESTROS, ALL_AGENTS } from '../arc/hierarchy_system';
import { arcReporting } from '../arc/reporting_system';
import { arcLearning } from '../arc/learning_system';
import { arcOpenAI } from '../arc/openai_service';
import type { 
  ApiResponse, 
  Agent, 
  HierarchyStats, 
  ReportingChain, 
  HierarchyTree,
  Report,
  DailyReport,
  WeeklyReport,
  SectorType,
  AgentStatus,
  AsyncOperationResult
} from '../types';

export const arcRouter = Router();

// ===============================
// 👑 CEO & HIERARCHY
// ===============================

// Get CEO info
arcRouter.get('/ceo', (req, res) => {
  res.json({ success: true, data: CEO });
});

// Get all maestros
arcRouter.get('/maestros', (req, res) => {
  res.json({ success: true, data: MAESTROS });
});

// Get all agents
arcRouter.get('/agents', (req, res) => {
  res.json({ success: true, data: ALL_AGENTS });
});

// Get agent by ID
arcRouter.get('/agents/:id', (req: Request, res: Response) => {
  const agent = arcHierarchy.getAgent(req.params.id);
  if (!agent) {
    return res.status(404).json({ success: false, error: 'Agent not found' });
  }
  res.json({ success: true, data: agent } as ApiResponse<Agent>);
});

// Get hierarchy tree
arcRouter.get('/hierarchy/tree', (req: Request, res: Response) => {
  const tree = arcHierarchy.getHierarchyTree();
  res.json({ success: true, data: tree } as ApiResponse<HierarchyTree>);
});

// Get hierarchy stats
arcRouter.get('/hierarchy/stats', (req: Request, res: Response) => {
  const stats = arcHierarchy.getStats();
  res.json({ success: true, data: stats } as ApiResponse<HierarchyStats>);
});

// Get specialists by sector
arcRouter.get('/sector/:sector/specialists', (req: Request, res: Response) => {
  const specialists = arcHierarchy.getSpecialists(req.params.sector as SectorType);
  res.json({ success: true, data: specialists } as ApiResponse<Agent[]>);
});

// Get reporting chain for agent
arcRouter.get('/agents/:id/reporting-chain', (req: Request, res: Response) => {
  const chain = arcHierarchy.getReportingChain(req.params.id);
  res.json({ success: true, data: chain } as ApiResponse<ReportingChain>);
});

// Update agent status
arcRouter.patch('/agents/:id/status', (req: Request, res: Response) => {
  const { status } = req.body as { status: unknown };
  const validStatuses: AgentStatus[] = ['active', 'idle', 'busy', 'offline', 'learning'];
  if (!status || !validStatuses.includes(status as AgentStatus)) {
    return res.status(400).json({ success: false, error: 'Invalid status' });
  }
  arcHierarchy.updateStatus(req.params.id, status as AgentStatus);
  res.json({ success: true, message: 'Status updated' });
});

// ===============================
// 📊 REPORTS
// ===============================

// Generate daily report for agent
arcRouter.post('/reports/daily/:agentId', async (req, res) => {
  try {
    const report = await arcReporting.generateDailyReport(req.params.agentId);
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, error: (error instanceof Error ? error.message : 'Unknown error') });
  }
});

// Generate weekly report for agent
arcRouter.post('/reports/weekly/:agentId', async (req, res) => {
  try {
    const report = await arcReporting.generateWeeklyReport(req.params.agentId);
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, error: (error instanceof Error ? error.message : 'Unknown error') });
  }
});

// Generate monthly report for agent
arcRouter.post('/reports/monthly/:agentId', async (req, res) => {
  try {
    const report = await arcReporting.generateMonthlyReport(req.params.agentId);
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, error: (error instanceof Error ? error.message : 'Unknown error') });
  }
});

// Generate semi-annual report for agent
arcRouter.post('/reports/semi-annual/:agentId', async (req, res) => {
  try {
    const report = await arcReporting.generateSemiAnnualReport(req.params.agentId);
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, error: (error instanceof Error ? error.message : 'Unknown error') });
  }
});

// Generate sector report
arcRouter.post('/reports/sector/:sector', async (req, res) => {
  try {
    const { type } = req.body;
    if (!['daily', 'weekly', 'monthly', 'semi_annual'].includes(type)) {
      return res.status(400).json({ success: false, error: 'Invalid report type' });
    }
    const report = await arcReporting.generateSectorReport(
      req.params.sector as any,
      type as ReportType
    );
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, error: (error instanceof Error ? error.message : 'Unknown error') });
  }
});

// Generate executive report
arcRouter.post('/reports/executive', async (req, res) => {
  try {
    const { type } = req.body;
    if (!['daily', 'weekly', 'monthly', 'semi_annual'].includes(type)) {
      return res.status(400).json({ success: false, error: 'Invalid report type' });
    }
    const report = await arcReporting.generateExecutiveReport(type as ReportType);
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, error: (error instanceof Error ? error.message : 'Unknown error') });
  }
});

// Get report by ID
arcRouter.get('/reports/:reportId', (req, res) => {
  const report = arcReporting.getReport(req.params.reportId);
  if (!report) {
    return res.status(404).json({ success: false, error: 'Report not found' });
  }
  res.json({ success: true, data: report });
});

// Get all reports
arcRouter.get('/reports', (req, res) => {
  const { type } = req.query;
  let reports;
  if (type) {
    reports = arcReporting.getReportsByType(type as ReportType);
  } else {
    reports = arcReporting.getAllReports();
  }
  res.json({ success: true, data: reports });
});

// ===============================
// 🧠 LEARNING SYSTEM
// ===============================

// Record experience for agent
arcRouter.post('/learning/experience', async (req, res) => {
  try {
    const { agentId, context, action, result, metrics, feedback } = req.body;
    const experience = await arcLearning.recordExperience(
      agentId,
      context,
      action,
      result,
      metrics,
      feedback
    );
    res.json({ success: true, data: experience });
  } catch (error) {
    res.status(500).json({ success: false, error: (error instanceof Error ? error.message : 'Unknown error') });
  }
});

// Learn new skill
arcRouter.post('/learning/skills', async (req, res) => {
  try {
    const { agentId, skillName, category } = req.body;
    const skill = await arcLearning.learnNewSkill(agentId, skillName, category);
    res.json({ success: true, data: skill });
  } catch (error) {
    res.status(500).json({ success: false, error: (error instanceof Error ? error.message : 'Unknown error') });
  }
});

// Set learning goal
arcRouter.post('/learning/goals', async (req, res) => {
  try {
    const { agentId, goal, targetDate, milestones } = req.body;
    const learningGoal = await arcLearning.setLearningGoal(
      agentId,
      goal,
      new Date(targetDate),
      milestones
    );
    res.json({ success: true, data: learningGoal });
  } catch (error) {
    res.status(500).json({ success: false, error: (error instanceof Error ? error.message : 'Unknown error') });
  }
});

// Update goal progress
arcRouter.patch('/learning/goals/:goalId/milestone/:milestoneIndex', async (req, res) => {
  try {
    await arcLearning.updateGoalProgress(req.params.goalId, parseInt(req.params.milestoneIndex));
    res.json({ success: true, message: 'Goal progress updated' });
  } catch (error) {
    res.status(500).json({ success: false, error: (error instanceof Error ? error.message : 'Unknown error') });
  }
});

// Get agent learning stats
arcRouter.get('/learning/stats/:agentId', (req, res) => {
  const stats = arcLearning.getAgentLearningStats(req.params.agentId);
  if (!stats) {
    return res.status(404).json({ success: false, error: 'Agent not found' });
  }
  res.json({ success: true, data: stats });
});

// Get all learning stats
arcRouter.get('/learning/stats', (req, res) => {
  const stats = arcLearning.getAllLearningStats();
  res.json({ success: true, data: stats });
});

// Get global patterns
arcRouter.get('/learning/patterns', (req, res) => {
  const patterns = arcLearning.getGlobalPatterns();
  res.json({ success: true, data: patterns });
});

// Get knowledge base for agent
arcRouter.get('/learning/knowledge-base/:agentId', (req, res) => {
  const kb = arcLearning.getKnowledgeBase(req.params.agentId);
  if (!kb) {
    return res.status(404).json({ success: false, error: 'Knowledge base not found' });
  }
  res.json({ success: true, data: kb });
});

// Enable/disable learning
arcRouter.post('/learning/toggle', (req, res) => {
  const { enabled } = req.body;
  if (enabled) {
    arcLearning.enableLearning();
  } else {
    arcLearning.disableLearning();
  }
  res.json({ success: true, enabled: arcLearning.isLearningEnabled() });
});

// ===============================
// 💬 AGENT CHAT
// ===============================

// Send message to agent
arcRouter.post('/chat/send', async (req, res) => {
  try {
    const { agentId, message, userId, context } = req.body;
    
    if (!agentId || !message || !userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: agentId, message, userId' 
      });
    }

    const agent = arcHierarchy.getAgent(agentId);
    if (!agent) {
      return res.status(404).json({ success: false, error: 'Agent not found' });
    }

    // Get AI response from OpenAI service
    const aiResponse = await arcOpenAI.chat(agent, message, userId, context);

    // Prepare response
    const response = {
      id: Date.now().toString(),
      agentId,
      agentName: agent.name,
      agentNameAr: agent.nameAr,
      message: aiResponse.message,
      reasoning: aiResponse.reasoning,
      actions: aiResponse.actions,
      confidence: aiResponse.confidence,
      timestamp: new Date(),
      usingAI: arcOpenAI.isAvailable()
    };

    res.json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ success: false, error: (error instanceof Error ? error.message : 'Unknown error') });
  }
});

// Get chat history
arcRouter.get('/chat/history/:agentId/:userId', (req, res) => {
  try {
    const { agentId, userId } = req.params;
    const history = arcOpenAI.getHistory(agentId, userId);
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: (error instanceof Error ? error.message : 'Unknown error') });
  }
});

// Clear chat history
arcRouter.delete('/chat/history/:agentId/:userId', (req, res) => {
  try {
    const { agentId, userId } = req.params;
    arcOpenAI.clearHistory(agentId, userId);
    res.json({ success: true, message: 'Chat history cleared' });
  } catch (error) {
    res.status(500).json({ success: false, error: (error instanceof Error ? error.message : 'Unknown error') });
  }
});

// Check if OpenAI is available
arcRouter.get('/chat/status', (req, res) => {
  res.json({ 
    success: true, 
    data: {
      openAiAvailable: arcOpenAI.isAvailable(),
      mode: arcOpenAI.isAvailable() ? 'ai' : 'simulated'
    }
  });
});

// ===============================
// 🎯 MASTER AGENT COMMAND
// ===============================

// Get tasks for master agent
arcRouter.get('/master-agent/tasks', (req, res) => {
  // Mock tasks data - replace with real DB query
  const tasks = [
    { id: '1', title: 'System Status Check', status: 'active', priority: 'high', assignedTo: 'system', progress: 85 },
    { id: '2', title: 'Data Backup Process', status: 'completed', priority: 'medium', assignedTo: 'cipher', progress: 100 },
    { id: '3', title: 'Security Audit', status: 'pending', priority: 'critical', assignedTo: 'aegis', progress: 0 }
  ];
  res.json({ success: true, data: tasks });
});

// Get decisions for master agent
arcRouter.get('/master-agent/decisions', (req, res) => {
  // Mock decisions data
  const decisions = [
    { id: '1', title: 'Resource Allocation', description: 'Allocate compute resources for AI training', status: 'pending', urgency: 'high' },
    { id: '2', title: 'Security Protocol Update', description: 'Update firewall rules', status: 'approved', urgency: 'critical' }
  ];
  res.json({ success: true, data: decisions });
});

// Get agents status for master agent
arcRouter.get('/master-agent/agents-status', (req, res) => {
  const agentsStatus = ALL_AGENTS.map(agent => ({
    id: agent.id,
    name: agent.name,
    status: agent.status || 'active',
    performance: Math.floor(Math.random() * 30) + 70, // 70-100%
    lastActive: new Date()
  }));
  res.json({ success: true, data: agentsStatus });
});

// Get system stats for master agent
arcRouter.get('/master-agent/stats', (req, res) => {
  const stats = {
    totalTasks: 156,
    completedTasks: 142,
    activeTasks: 12,
    pendingDecisions: 3,
    systemHealth: 94,
    uptime: '15d 4h 32m'
  };
  res.json({ success: true, data: stats });
});

// Execute command
arcRouter.post('/master-agent/execute', async (req, res) => {
  try {
    const { command, params } = req.body;
    
    if (!command) {
      return res.status(400).json({ success: false, error: 'Command is required' });
    }

    // Mock execution - replace with real command execution
    const result = {
      commandId: Date.now().toString(),
      command,
      status: 'executed',
      result: `Command "${command}" executed successfully`,
      timestamp: new Date()
    };

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: (error instanceof Error ? error.message : 'Unknown error') });
  }
});

// Approve decision
arcRouter.post('/master-agent/approve-decision', async (req, res) => {
  try {
    const { decisionId, approved } = req.body;
    
    if (!decisionId) {
      return res.status(400).json({ success: false, error: 'Decision ID is required' });
    }

    // Mock approval - replace with real DB update
    const result = {
      decisionId,
      status: approved ? 'approved' : 'rejected',
      timestamp: new Date()
    };

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: (error instanceof Error ? error.message : 'Unknown error') });
  }
});

// ===============================
// ⚔️ QUANTUM WAR ROOM
// ===============================

// Get scenarios
arcRouter.get('/scenarios', (req, res) => {
  const scenarios = [
    { id: '1', name: 'Data Breach Response', description: 'Simulated cyber attack response', objectives: ['Contain breach', 'Identify threat', 'Restore systems'], riskLevel: 'high', category: 'Security' },
    { id: '2', name: 'System Overload', description: 'High traffic load management', objectives: ['Scale resources', 'Load balance', 'Monitor performance'], riskLevel: 'medium', category: 'Operations' }
  ];
  res.json({ success: true, data: scenarios });
});

// Create scenario
arcRouter.post('/scenarios', async (req, res) => {
  try {
    const { name, description, objectives, riskLevel, category } = req.body;
    
    const newScenario = {
      id: Date.now().toString(),
      name,
      description,
      objectives,
      riskLevel,
      category,
      createdAt: new Date()
    };
    
    res.json({ success: true, data: newScenario });
  } catch (error) {
    res.status(500).json({ success: false, error: (error instanceof Error ? error.message : 'Unknown error') });
  }
});

// Get agents (alias for backwards compatibility)
arcRouter.get('/agents', (req, res) => {
  const agents = ALL_AGENTS.map(agent => ({
    ...agent,
    status: agent.status || 'active',
    performance: Math.floor(Math.random() * 30) + 70
  }));
  res.json({ success: true, data: agents });
});

// ===============================
// 🔍 INVESTIGATION LOUNGE  
// ===============================

// Get investigation activity
arcRouter.get('/investigation/activity', (req, res) => {
  const activity = [
    { id: '1', type: 'data_analysis', message: 'Analyzing security logs...', timestamp: new Date(), agent: 'Aegis' },
    { id: '2', type: 'threat_detection', message: 'Scanning network for anomalies', timestamp: new Date(), agent: 'Phantom' }
  ];
  res.json({ success: true, data: activity });
});

// ===============================
// � ANALYTICS & DASHBOARD
// ===============================

// Get dashboard metrics
arcRouter.get('/dashboard/metrics', (req, res) => {
  const metrics = {
    totalAgents: ALL_AGENTS.length,
    activeAgents: ALL_AGENTS.filter(a => (a.status || 'active') === 'active').length,
    tasksCompleted: 847,
    systemUptime: 99.7,
    performance: 94.2
  };
  res.json({ success: true, data: metrics });
});

// Get agent analytics
arcRouter.get('/agents/analytics', (req, res) => {
  const analytics = ALL_AGENTS.map(agent => ({
    id: agent.id,
    name: agent.name,
    performance: Math.floor(Math.random() * 30) + 70,
    tasksCompleted: Math.floor(Math.random() * 50) + 10,
    efficiency: Math.floor(Math.random() * 25) + 75,
    uptime: Math.floor(Math.random() * 20) + 80
  }));
  res.json({ success: true, data: analytics });
});

// ===============================
// �📊 SYSTEM OVERVIEW
// ===============================

// Get complete system overview
arcRouter.get('/overview', async (req, res) => {
  try {
    const overview = {
      hierarchy: arcHierarchy.getStats(),
      ceo: CEO,
      maestros: MAESTROS,
      totalAgents: ALL_AGENTS.length,
      learningEnabled: arcLearning.isLearningEnabled(),
      timestamp: new Date()
    };
    res.json({ success: true, data: overview });
  } catch (error) {
    res.status(500).json({ success: false, error: (error instanceof Error ? error.message : 'Unknown error') });
  }
});

export default arcRouter;
