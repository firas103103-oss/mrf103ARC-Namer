/**
 * 💰 Finance Hub - Vault Command
 * مركز المال والأعمال
 */

import { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, PieChart, CreditCard, Receipt, Wallet, Target } from 'lucide-react';

interface FinanceAgent {
  id: string;
  name: string;
  nameAr: string;
  role: string;
  icon: string;
  color: string;
  tasksToday: number;
}

export default function FinanceHub() {
  const [agents] = useState<FinanceAgent[]>([
    { id: 'ledger', name: 'Ledger', nameAr: 'ليدجر', role: 'Accounting & Books', icon: '📒', color: 'hsl(var(--success))', tasksToday: 67 },
    { id: 'treasury', name: 'Treasury', nameAr: 'الخزينة', role: 'Budget & Planning', icon: '🏦', color: 'hsl(var(--success))', tasksToday: 42 },
    { id: 'venture', name: 'Venture', nameAr: 'فينشر', role: 'Investment Analysis', icon: '📈', color: 'hsl(var(--success))', tasksToday: 38 },
    { id: 'merchant', name: 'Merchant', nameAr: 'التاجر', role: 'Business Operations', icon: '🏪', color: 'hsl(var(--success))', tasksToday: 51 }
  ]);

  const [financialData] = useState({
    totalRevenue: 125340,
    totalExpenses: 78920,
    netProfit: 46420,
    roi: 37.0,
    monthlyBudget: 95000,
    budgetUsed: 78920,
    investments: 45000,
    investmentGrowth: 12.5
  });

  const [recentTransactions] = useState([
    { id: '1', type: 'income', description: 'Client Payment - Project Alpha', amount: 15000, date: new Date(Date.now() - 3600000) },
    { id: '2', type: 'expense', description: 'Cloud Services - AWS', amount: -850, date: new Date(Date.now() - 7200000) },
    { id: '3', type: 'income', description: 'Subscription Revenue', amount: 2400, date: new Date(Date.now() - 10800000) },
    { id: '4', type: 'expense', description: 'Office Supplies', amount: -320, date: new Date(Date.now() - 14400000) },
    { id: '5', type: 'investment', description: 'Stock Purchase - TECH', amount: -5000, date: new Date(Date.now() - 18000000) }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <span className="text-5xl">💰</span>
          Finance Hub
        </h1>
        <p className="text-muted-foreground text-lg">Maestro Vault - فولت | مركز المال والأعمال</p>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-success/20 to-success/30 rounded-lg p-6 border border-success/30">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-success" />
            <span className="text-xs text-success font-bold">+15.2%</span>
          </div>
          <div className="text-3xl font-bold mb-1">${(financialData.totalRevenue / 1000).toFixed(1)}K</div>
          <div className="text-sm text-gray-300">Total Revenue</div>
          <div className="text-xs text-gray-500 mt-1">This month</div>
        </div>

        <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-lg p-6 border border-destructive/30">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-8 h-8 text-destructive" />
            <span className="text-xs text-destructive font-bold">-8.3%</span>
          </div>
          <div className="text-3xl font-bold mb-1">${(financialData.totalExpenses / 1000).toFixed(1)}K</div>
          <div className="text-sm text-gray-300">Total Expenses</div>
          <div className="text-xs text-gray-500 mt-1">Under budget</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg p-6 border border-primary/30">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-primary" />
            <span className="text-xs text-primary font-bold">+37%</span>
          </div>
          <div className="text-3xl font-bold mb-1">${(financialData.netProfit / 1000).toFixed(1)}K</div>
          <div className="text-sm text-gray-300">Net Profit</div>
          <div className="text-xs text-gray-500 mt-1">Excellent growth</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg p-6 border border-secondary/30">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8 text-secondary" />
            <span className="text-xs text-secondary font-bold">+{financialData.roi}%</span>
          </div>
          <div className="text-3xl font-bold mb-1">{financialData.roi}%</div>
          <div className="text-sm text-gray-300">ROI</div>
          <div className="text-xs text-gray-500 mt-1">Above target</div>
        </div>
      </div>

      {/* Finance Team */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Wallet className="w-6 h-6" />
          Finance Team
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {agents.map((agent) => (
            <div 
              key={agent.id}
              className="bg-card/50 rounded-lg p-4 border border-border hover:border-gray-600 transition-all"
              style={{ borderLeftColor: agent.color, borderLeftWidth: '3px' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{agent.icon}</span>
                <div>
                  <h3 className="font-bold">{agent.name}</h3>
                  <p className="text-xs text-muted-foreground">{agent.nameAr}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{agent.role}</p>
              <div className="flex items-center justify-between">
                <span className="px-2 py-1 rounded text-xs font-bold bg-success/20 text-success">
                  ACTIVE
                </span>
                <span className="text-sm text-muted-foreground">{agent.tasksToday} tasks</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Tracker */}
        <div className="bg-card/50 rounded-lg p-6 border border-border">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Monthly Budget
          </h3>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Budget Used</span>
              <span className="font-bold">${(financialData.budgetUsed / 1000).toFixed(1)}K / ${(financialData.monthlyBudget / 1000).toFixed(1)}K</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-success to-success"
                style={{ width: `${(financialData.budgetUsed / financialData.monthlyBudget * 100)}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {((financialData.monthlyBudget - financialData.budgetUsed) / 1000).toFixed(1)}K remaining
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded">
              <span className="text-sm">Operations</span>
              <span className="font-bold">$42K</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded">
              <span className="text-sm">Marketing</span>
              <span className="font-bold">$18K</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded">
              <span className="text-sm">Development</span>
              <span className="font-bold">$12K</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded">
              <span className="text-sm">Infrastructure</span>
              <span className="font-bold">$6.9K</span>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-card/50 rounded-lg p-6 border border-border">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Recent Transactions
          </h3>
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  {transaction.type === 'income' ? (
                    <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-success" />
                    </div>
                  ) : transaction.type === 'expense' ? (
                    <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                      <TrendingDown className="w-5 h-5 text-destructive" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Target className="w-5 h-5 text-primary" />
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-sm">{transaction.description}</div>
                    <div className="text-xs text-gray-500">
                      {transaction.date.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                <div className={`font-bold ${transaction.amount > 0 ? 'text-success' : 'text-destructive'}`}>
                  {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
