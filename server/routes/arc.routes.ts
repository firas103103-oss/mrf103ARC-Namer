/**
 * 🔌 ARC 2.0 API Routes
 * API endpoints للنظام الهرمي الجديد
 */

import { Router } from 'express';
import { arcHierarchy, CEO, MAESTROS, ALL_AGENTS } from '../arc/hierarchy_system';
import { arcReporting, ReportType } from '../arc/reporting_system';
import { arcLearning } from '../arc/learning_system';import { arcOpenAI } from '../arc/openai_service';
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
arcRouter.get('/agents/:id', (req, res) => {
  const agent = arcHierarchy.getAgent(req.params.id);
  if (!agent) {
    return res.status(404).json({ success: false, error: 'Agent not found' });
  }
  res.json({ success: true, data: agent });
});

// Get hierarchy tree
arcRouter.get('/hierarchy/tree', (req, res) => {
  const tree = arcHierarchy.getHierarchyTree();
  res.json({ success: true, data: tree });
});

// Get hierarchy stats
arcRouter.get('/hierarchy/stats', (req, res) => {
  const stats = arcHierarchy.getStats();
  res.json({ success: true, data: stats });
});

// Get specialists by sector
arcRouter.get('/sector/:sector/specialists', (req, res) => {
  const specialists = arcHierarchy.getSpecialists(req.params.sector as any);
  res.json({ success: true, data: specialists });
});

// Get reporting chain for agent
arcRouter.get('/agents/:id/reporting-chain', (req, res) => {
  const chain = arcHierarchy.getReportingChain(req.params.id);
  res.json({ success: true, data: chain });
});

// Update agent status
arcRouter.patch('/agents/:id/status', (req, res) => {
  const { status } = req.body;
  if (!['active', 'idle', 'busy', 'offline', 'learning'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status' });
  }
  arcHierarchy.updateStatus(req.params.id, status);
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
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate weekly report for agent
arcRouter.post('/reports/weekly/:agentId', async (req, res) => {
  try {
    const report = await arcReporting.generateWeeklyReport(req.params.agentId);
    res.json({ success: true, data: report });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate monthly report for agent
arcRouter.post('/reports/monthly/:agentId', async (req, res) => {
  try {
    const report = await arcReporting.generateMonthlyReport(req.params.agentId);
    res.json({ success: true, data: report });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate semi-annual report for agent
arcRouter.post('/reports/semi-annual/:agentId', async (req, res) => {
  try {
    const report = await arcReporting.generateSemiAnnualReport(req.params.agentId);
    res.json({ success: true, data: report });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
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
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
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
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
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
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Learn new skill
arcRouter.post('/learning/skills', async (req, res) => {
  try {
    const { agentId, skillName, category } = req.body;
    const skill = await arcLearning.learnNewSkill(agentId, skillName, category);
    res.json({ success: true, data: skill });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
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
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update goal progress
arcRouter.patch('/learning/goals/:goalId/milestone/:milestoneIndex', async (req, res) => {
  try {
    await arcLearning.updateGoalProgress(req.params.goalId, parseInt(req.params.milestoneIndex));
    res.json({ success: true, message: 'Goal progress updated' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
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
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get chat history
arcRouter.get('/chat/history/:agentId/:userId', (req, res) => {
  try {
    const { agentId, userId } = req.params;
    const history = arcOpenAI.getHistory(agentId, userId);
    res.json({ success: true, data: history });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Clear chat history
arcRouter.delete('/chat/history/:agentId/:userId', (req, res) => {
  try {
    const { agentId, userId } = req.params;
    arcOpenAI.clearHistory(agentId, userId);
    res.json({ success: true, message: 'Chat history cleared' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
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
// 📊 SYSTEM OVERVIEW
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
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default arcRouter;
