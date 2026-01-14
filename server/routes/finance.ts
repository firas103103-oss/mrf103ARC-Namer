/**
 * 💰 Finance Sector API Routes
 * APIs للقطاع المالي - Maestro Vault
 * ✅ Phase 3: Connected to Database
 */

import { Router } from 'express';
import { db } from '../db';
import { financialTransactions, budgets } from '@shared/schema';
import { desc, eq, sql } from 'drizzle-orm';
import logger from '../utils/logger';
import { arcHierarchy } from '../arc/hierarchy_system';

export const financeRouter = Router();

// ===============================
// 📊 FINANCIAL METRICS
// ===============================

// Get financial overview
financeRouter.get('/overview', async (req, res) => {
  try {
    // Calculate totals from database
    const result = await db
      .select({
        totalIncome: sql<number>`COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0)`,
        totalExpenses: sql<number>`COALESCE(SUM(CASE WHEN type = 'expense' THEN ABS(amount) ELSE 0 END), 0)`,
        totalInvestments: sql<number>`COALESCE(SUM(CASE WHEN type = 'investment' THEN amount ELSE 0 END), 0)`,
        transactionCount: sql<number>`COUNT(*)`,
      })
      .from(financialTransactions)
      .execute();

    const data = result[0];
    const totalRevenue = Number(data.totalIncome) + Number(data.totalInvestments);
    const totalExpenses = Number(data.totalExpenses);
    const netProfit = totalRevenue - totalExpenses;
    const roi = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;

    const overview = {
      totalRevenue,
      totalExpenses,
      netProfit,
      roi: Number(roi),
      monthlyBudget: 95000,
      budgetUsed: totalExpenses,
      investments: Number(data.totalInvestments),
      investmentGrowth: 12.5,
      currency: 'USD',
      lastUpdated: new Date(),
      transactionCount: Number(data.transactionCount),
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
    
    let query = db
      .select()
      .from(financialTransactions)
      .orderBy(desc(financialTransactions.createdAt))
      .limit(Number(limit))
      .offset(Number(offset));

    if (type && typeof type === 'string') {
      query = query.where(eq(financialTransactions.type, type)) as any;
    }

    const transactions = await query.execute();

    res.json({ 
      success: true, 
      data: transactions,
      pagination: {
        limit: Number(limit),
        offset: Number(offset),
        total: transactions.length
      }
    });
  } catch (error) {
    logger.error('Error fetching transactions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch transactions' });
  }
});

// Get finance team status
financeRouter.get('/team', async (req, res) => {
  try {
    const specialists = arcHierarchy.getSpecialists('finance' as any);
    
    const team = specialists.map(agent => ({
      id: agent.id,
      name: agent.name || 'Agent',
      nameAr: agent.nameAr || 'وكيل',
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
    const { type, description, amount, category, currency = 'USD' } = req.body;

    if (!type || !amount) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: type, amount' 
      });
    }

    // Insert into database
    const [transaction] = await db
      .insert(financialTransactions)
      .values({
        type,
        category: category || null,
        amount: String(amount),
        description: description || null,
        currency,
        status: 'completed',
        metadata: {},
        userId: null, // TODO: Get from auth session
      })
      .returning();

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
