/**
 * 💰 Finance Sector API Routes
 * APIs للقطاع المالي - Maestro Vault
 */

import { Router } from 'express';
import { db } from '../db';
import logger from '../utils/logger';
import { arcHierarchy } from '../arc/hierarchy_system';

export const financeRouter = Router();

// ===============================
// 📊 FINANCIAL METRICS
// ===============================

// Get financial overview
financeRouter.get('/overview', async (req, res) => {
  try {
    // TODO: استبدل هذا ببيانات حقيقية من قاعدة البيانات
    const overview = {
      totalRevenue: 125340,
      totalExpenses: 78920,
      netProfit: 46420,
      roi: 37.0,
      monthlyBudget: 95000,
      budgetUsed: 78920,
      investments: 45000,
      investmentGrowth: 12.5,
      currency: 'USD',
      lastUpdated: new Date()
    };

    res.json({ success: true, data: overview });
  } catch (error) {
    logger.error('Error fetching financial overview:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch financial overview' });
  }
});

// Get recent transactions
financeRouter.get('/transactions', async (req, res) => {
  try {
    const { limit = 10, offset = 0, type } = req.query;
    
    // TODO: استبدل هذا ببيانات حقيقية من قاعدة البيانات
    const transactions = [
      { 
        id: '1', 
        type: 'income', 
        description: 'Client Payment - Project Alpha', 
        amount: 15000, 
        date: new Date(Date.now() - 3600000),
        category: 'revenue',
        status: 'completed'
      },
      { 
        id: '2', 
        type: 'expense', 
        description: 'Cloud Services - AWS', 
        amount: -850, 
        date: new Date(Date.now() - 7200000),
        category: 'infrastructure',
        status: 'completed'
      },
      { 
        id: '3', 
        type: 'income', 
        description: 'Subscription Revenue', 
        amount: 2400, 
        date: new Date(Date.now() - 10800000),
        category: 'recurring',
        status: 'completed'
      },
      { 
        id: '4', 
        type: 'expense', 
        description: 'Office Supplies', 
        amount: -320, 
        date: new Date(Date.now() - 14400000),
        category: 'operations',
        status: 'completed'
      },
      { 
        id: '5', 
        type: 'investment', 
        description: 'Stock Purchase - TECH', 
        amount: -5000, 
        date: new Date(Date.now() - 18000000),
        category: 'investment',
        status: 'completed'
      }
    ];

    // Filter by type if provided
    const filtered = type ? transactions.filter(t => t.type === type) : transactions;
    const paginated = filtered.slice(Number(offset), Number(offset) + Number(limit));

    res.json({ 
      success: true, 
      data: paginated,
      total: filtered.length,
      limit: Number(limit),
      offset: Number(offset)
    });
  } catch (error) {
    logger.error('Error fetching transactions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch transactions' });
  }
});

// Get finance team status
financeRouter.get('/team', async (req, res) => {
  try {
    const specialists = arcHierarchy.getSpecialists('finance');
    
    const team = specialists.map(agent => ({
      id: agent.id,
      name: agent.nameEn,
      nameAr: agent.nameAr,
      role: agent.role,
      status: agent.status,
      tasksToday: Math.floor(Math.random() * 50) + 30, // TODO: Get from real metrics
      performance: Math.floor(Math.random() * 20) + 80,
      icon: getAgentIcon(agent.id),
      color: 'hsl(var(--success))'
    }));

    res.json({ success: true, data: team });
  } catch (error) {
    logger.error('Error fetching finance team:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch finance team' });
  }
});

// Get budget analysis
financeRouter.get('/budget', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    // TODO: استبدل هذا ببيانات حقيقية
    const budget = {
      total: 95000,
      used: 78920,
      remaining: 16080,
      percentage: 83.1,
      categories: [
        { name: 'Infrastructure', allocated: 25000, used: 22500, percentage: 90 },
        { name: 'Salaries', allocated: 40000, used: 40000, percentage: 100 },
        { name: 'Marketing', allocated: 15000, used: 8420, percentage: 56 },
        { name: 'Operations', allocated: 10000, used: 6000, percentage: 60 },
        { name: 'Research', allocated: 5000, used: 2000, percentage: 40 }
      ],
      period,
      lastUpdated: new Date()
    };

    res.json({ success: true, data: budget });
  } catch (error) {
    logger.error('Error fetching budget:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch budget' });
  }
});

// Create new transaction
financeRouter.post('/transactions', async (req, res) => {
  try {
    const { type, description, amount, category } = req.body;

    if (!type || !description || !amount) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: type, description, amount' 
      });
    }

    // TODO: حفظ في قاعدة البيانات
    const transaction = {
      id: Date.now().toString(),
      type,
      description,
      amount: Number(amount),
      category: category || 'other',
      date: new Date(),
      status: 'completed'
    };

    logger.info(`New transaction created: ${transaction.id}`, transaction);
    res.json({ success: true, data: transaction });
  } catch (error) {
    logger.error('Error creating transaction:', error);
    res.status(500).json({ success: false, error: 'Failed to create transaction' });
  }
});

// Helper function
function getAgentIcon(agentId: string): string {
  const icons: Record<string, string> = {
    ledger: '📒',
    treasury: '🏦',
    venture: '📈',
    merchant: '🏪'
  };
  return icons[agentId.toLowerCase()] || '💰';
}

export default financeRouter;
