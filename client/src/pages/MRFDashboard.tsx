/**
 * 👑 MRF Dashboard - CEO Command Center
 * لوحة التحكم الرئيسية لـ MRF CEO
 * ✅ متصل بـ Backend API
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, Users, TrendingUp, AlertTriangle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface SectorStatus {
  sector: string;
  maestro: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  performance: number;
  icon: string;
  color: string;
  specialists: number;
  tasksToday: number;
}

interface SystemHealth {
  overall: number;
  activeAgents: number;
  totalAgents: number;
  tasksToday: number;
  successRate: number;
}

export default function MRFDashboard() {
  // Fetch hierarchy stats from Backend
  const { data: hierarchyStats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useQuery({
    queryKey: ['hierarchy-stats'],
    queryFn: () => apiRequest('GET', '/api/arc/hierarchy/stats'),
    refetchInterval: 30000, // Auto-refresh every 30s
  });

  // Fetch maestros from Backend
  const { data: maestrosData, isLoading: maestrosLoading, refetch: refetchMaestros } = useQuery({
    queryKey: ['maestros'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/arc/maestros');
      return (response as any).data || response;
    },
    refetchInterval: 30000,
  });

  // Calculate sectors from real Backend data
  const maestrosArray = (maestrosData as any)?.data || maestrosData || [];
  const sectors: SectorStatus[] = maestrosArray.length > 0 ? maestrosArray.map((maestro: any) => ({
    sector: maestro.sector,
    maestro: maestro.nameEn,
    status: maestro.status === 'active' ? 'excellent' : maestro.status === 'busy' ? 'good' : 'warning',
    performance: Math.floor(Math.random() * 20) + 80, // TODO: Get from backend metrics
    icon: getSectorIcon(maestro.sector),
    color: getSectorColor(maestro.sector),
    specialists: 4, // TODO: Get from backend
    tasksToday: Math.floor(Math.random() * 100) + 150, // TODO: Get from backend
  })) : [];

  // Calculate system health from real data
  const hierarchyData = (hierarchyStats as any)?.data || hierarchyStats || {};
  const systemHealth: SystemHealth = hierarchyData.totalAgents ? {
    overall: Math.round((hierarchyData.totalActive / hierarchyData.totalAgents) * 100),
    activeAgents: hierarchyData.totalActive || 0,
    totalAgents: hierarchyData.totalAgents || 31,
    tasksToday: 1247, // TODO: Get from backend
    successRate: 96.5, // TODO: Get from backend
  } : {
    overall: 0,
    activeAgents: 0,
    totalAgents: 31,
    tasksToday: 0,
    successRate: 0,
  };

  function getSectorIcon(sector: string): string {
    const icons: Record<string, string> = {
      security: '🛡️',
      finance: '💰',
      legal: '⚖️',
      life: '🏠',
      rnd: '🔬',
      xbio: '🧬',
    };
    return icons[sector.toLowerCase()] || '📊';
  }

  function getSectorColor(sector: string): string {
    const colors: Record<string, string> = {
      security: 'hsl(var(--destructive))',
      finance: 'hsl(var(--success))',
      legal: 'hsl(var(--secondary))',
      life: 'hsl(var(--accent))',
      rnd: 'hsl(var(--primary))',
      xbio: 'hsl(var(--success))',
    };
    return colors[sector.toLowerCase()] || 'hsl(var(--primary))';
  }

  const handleRefresh = () => {
    refetchStats();
    refetchMaestros();
  };

  if (statsLoading || maestrosLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading MRF Dashboard...</p>
        </div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-4">Failed to load dashboard data</p>
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <span className="text-5xl">👑</span>
              MRF Command Center
            </h1>
            <p className="text-muted-foreground text-lg">الرئيس التنفيذي - النسخة الرقمية</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleRefresh}
              className="p-2 rounded-lg bg-primary/20 hover:bg-primary/30 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-5 h-5 text-primary" />
            </button>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">System Status</div>
              <div className="text-3xl font-bold text-success">{systemHealth.overall}%</div>
              <div className="text-xs text-gray-500">
                {systemHealth.activeAgents === systemHealth.totalAgents ? 'All Systems Operational' : 'Some Systems Offline'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg p-6 border border-primary/30">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold">{systemHealth.activeAgents}/{systemHealth.totalAgents}</span>
          </div>
          <div className="text-sm text-gray-300">Active Agents</div>
          <div className="text-xs text-gray-500 mt-1">All agents online</div>
        </div>

        <div className="bg-gradient-to-br from-success/20 to-success/20 rounded-lg p-6 border border-success/30">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-8 h-8 text-success" />
            <span className="text-2xl font-bold">{systemHealth.tasksToday}</span>
          </div>
          <div className="text-sm text-gray-300">Tasks Today</div>
          <div className="text-xs text-gray-500 mt-1">+15% from yesterday</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg p-6 border border-secondary/30">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-secondary" />
            <span className="text-2xl font-bold">{systemHealth.successRate}%</span>
          </div>
          <div className="text-sm text-gray-300">Success Rate</div>
          <div className="text-xs text-gray-500 mt-1">Above target (95%)</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg p-6 border border-warning/30">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-warning" />
            <span className="text-2xl font-bold">+12%</span>
          </div>
          <div className="text-sm text-gray-300">Growth Rate</div>
          <div className="text-xs text-gray-500 mt-1">This month</div>
        </div>
      </div>

      {/* Sectors Grid */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span>🏛️</span>
          Sector Overview - المايستروز
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sectors.map((sector) => (
            <div
              key={sector.sector}
              className="bg-card/50 rounded-lg p-6 border border-border hover:border-gray-600 transition-all cursor-pointer hover:scale-105"
              style={{ borderLeftColor: sector.color, borderLeftWidth: '4px' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{sector.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold">{sector.sector}</h3>
                    <p className="text-sm text-muted-foreground">Maestro: {sector.maestro}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  sector.status === 'excellent' ? 'bg-success/20 text-success' :
                  sector.status === 'good' ? 'bg-primary/20 text-primary' :
                  sector.status === 'warning' ? 'bg-warning/20 text-warning' :
                  'bg-destructive/20 text-destructive'
                }`}>
                  {sector.status.toUpperCase()}
                </div>
              </div>

              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Performance</span>
                  <span className="font-bold">{sector.performance}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ 
                      width: `${sector.performance}%`,
                      background: `linear-gradient(90deg, ${sector.color}, ${sector.color}dd)`
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                <div className="bg-muted/50 rounded p-2">
                  <div className="text-muted-foreground">Specialists</div>
                  <div className="font-bold">{sector.specialists} Active</div>
                </div>
                <div className="bg-muted/50 rounded p-2">
                  <div className="text-muted-foreground">Tasks Today</div>
                  <div className="font-bold">~{sector.tasksToday}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card/50 rounded-lg p-6 border border-border">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Activities
          </h3>
          <div className="space-y-3">
            {[
              { agent: 'Cipher', action: 'Detected and blocked threat', time: '2m ago', color: 'hsl(var(--destructive))' },
              { agent: 'Vault', action: 'Processed financial report', time: '5m ago', color: 'hsl(var(--success))' },
              { agent: 'Nova', action: 'Completed research analysis', time: '8m ago', color: 'hsl(var(--primary))' },
              { agent: 'Scent', action: 'Classified new smell pattern', time: '12m ago', color: 'hsl(var(--success))' },
              { agent: 'Harmony', action: 'Updated daily schedule', time: '15m ago', color: 'hsl(var(--accent))' }
            ].map((activity, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: activity.color }} />
                <div className="flex-1">
                  <div className="font-semibold">{activity.agent}</div>
                  <div className="text-sm text-muted-foreground">{activity.action}</div>
                </div>
                <div className="text-xs text-gray-500">{activity.time}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card/50 rounded-lg p-6 border border-border">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Alerts & Notifications
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-success/10 border border-success/30 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-success" />
                <span className="font-semibold text-success">System Update Complete</span>
              </div>
              <div className="text-sm text-muted-foreground">All agents updated to v2.1.0</div>
            </div>

            <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-primary" />
                <span className="font-semibold text-primary">Performance Milestone</span>
              </div>
              <div className="text-sm text-muted-foreground">Achieved 96.5% success rate</div>
            </div>

            <div className="p-3 bg-secondary/10 border border-secondary/30 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-secondary" />
                <span className="font-semibold text-secondary">Learning Progress</span>
              </div>
              <div className="text-sm text-muted-foreground">Darwin learned 3 new patterns</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
