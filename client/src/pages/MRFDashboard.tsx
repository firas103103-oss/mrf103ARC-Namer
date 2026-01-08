/**
 * 👑 MRF Dashboard - CEO Command Center
 * لوحة التحكم الرئيسية لـ MRF CEO
 */

import { useState, useEffect } from 'react';
import { Activity, Users, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface SectorStatus {
  sector: string;
  maestro: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  performance: number;
  icon: string;
  color: string;
}

export default function MRFDashboard() {
  const [sectors, setSectors] = useState<SectorStatus[]>([
    { sector: 'Security', maestro: 'Cipher', status: 'excellent', performance: 98, icon: '🛡️', color: '#DC2626' },
    { sector: 'Finance', maestro: 'Vault', status: 'good', performance: 92, icon: '💰', color: '#059669' },
    { sector: 'Legal', maestro: 'Lexis', status: 'good', performance: 89, icon: '⚖️', color: '#7C3AED' },
    { sector: 'Life', maestro: 'Harmony', status: 'excellent', performance: 95, icon: '🏠', color: '#EC4899' },
    { sector: 'R&D', maestro: 'Nova', status: 'good', performance: 91, icon: '🔬', color: '#0EA5E9' },
    { sector: 'xBio', maestro: 'Scent', status: 'excellent', performance: 97, icon: '🧬', color: '#14B8A6' }
  ]);

  const [systemHealth, setSystemHealth] = useState({
    overall: 94,
    activeAgents: 31,
    totalAgents: 31,
    tasksToday: 1247,
    successRate: 96.5
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <span className="text-5xl">👑</span>
              MRF Command Center
            </h1>
            <p className="text-gray-400 text-lg">الرئيس التنفيذي - النسخة الرقمية</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">System Status</div>
            <div className="text-3xl font-bold text-green-400">{systemHealth.overall}%</div>
            <div className="text-xs text-gray-500">All Systems Operational</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg p-6 border border-blue-500/30">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-blue-400" />
            <span className="text-2xl font-bold">{systemHealth.activeAgents}/{systemHealth.totalAgents}</span>
          </div>
          <div className="text-sm text-gray-300">Active Agents</div>
          <div className="text-xs text-gray-500 mt-1">All agents online</div>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg p-6 border border-green-500/30">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-8 h-8 text-green-400" />
            <span className="text-2xl font-bold">{systemHealth.tasksToday}</span>
          </div>
          <div className="text-sm text-gray-300">Tasks Today</div>
          <div className="text-xs text-gray-500 mt-1">+15% from yesterday</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg p-6 border border-purple-500/30">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-purple-400" />
            <span className="text-2xl font-bold">{systemHealth.successRate}%</span>
          </div>
          <div className="text-sm text-gray-300">Success Rate</div>
          <div className="text-xs text-gray-500 mt-1">Above target (95%)</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg p-6 border border-orange-500/30">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-orange-400" />
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
              className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-all cursor-pointer hover:scale-105"
              style={{ borderLeftColor: sector.color, borderLeftWidth: '4px' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{sector.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold">{sector.sector}</h3>
                    <p className="text-sm text-gray-400">Maestro: {sector.maestro}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  sector.status === 'excellent' ? 'bg-green-500/20 text-green-400' :
                  sector.status === 'good' ? 'bg-blue-500/20 text-blue-400' :
                  sector.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {sector.status.toUpperCase()}
                </div>
              </div>

              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Performance</span>
                  <span className="font-bold">{sector.performance}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
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
                <div className="bg-gray-700/50 rounded p-2">
                  <div className="text-gray-400">Specialists</div>
                  <div className="font-bold">4 Active</div>
                </div>
                <div className="bg-gray-700/50 rounded p-2">
                  <div className="text-gray-400">Tasks Today</div>
                  <div className="font-bold">~208</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Activities
          </h3>
          <div className="space-y-3">
            {[
              { agent: 'Cipher', action: 'Detected and blocked threat', time: '2m ago', color: '#DC2626' },
              { agent: 'Vault', action: 'Processed financial report', time: '5m ago', color: '#059669' },
              { agent: 'Nova', action: 'Completed research analysis', time: '8m ago', color: '#0EA5E9' },
              { agent: 'Scent', action: 'Classified new smell pattern', time: '12m ago', color: '#14B8A6' },
              { agent: 'Harmony', action: 'Updated daily schedule', time: '15m ago', color: '#EC4899' }
            ].map((activity, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: activity.color }} />
                <div className="flex-1">
                  <div className="font-semibold">{activity.agent}</div>
                  <div className="text-sm text-gray-400">{activity.action}</div>
                </div>
                <div className="text-xs text-gray-500">{activity.time}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            Alerts & Notifications
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="font-semibold text-green-400">System Update Complete</span>
              </div>
              <div className="text-sm text-gray-400">All agents updated to v2.1.0</div>
            </div>

            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-blue-400" />
                <span className="font-semibold text-blue-400">Performance Milestone</span>
              </div>
              <div className="text-sm text-gray-400">Achieved 96.5% success rate</div>
            </div>

            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span className="font-semibold text-purple-400">Learning Progress</span>
              </div>
              <div className="text-sm text-gray-400">Darwin learned 3 new patterns</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
