/**
 * 🔬 R&D Lab - Nova Command
 * مركز البحث والتطوير
 * ✅ متصل بـ Backend API
 */

import { useSectorOverview, useSectorTeam, createRefreshHandler, renderLoading } from '@/lib/apiHooks';
import { Microscope, Lightbulb, Cpu, TrendingUp, Zap, Beaker, RefreshCw } from 'lucide-react';

export default function RnDLab() {
  const { data: overviewData, isLoading: overviewLoading, refetch: refetchOverview } = useSectorOverview('rnd');
  const { data: teamData, isLoading: teamLoading, refetch: refetchTeam } = useSectorTeam('rnd');

  const handleRefresh = createRefreshHandler(refetchOverview, refetchTeam);

  if (overviewLoading || teamLoading) {
    return renderLoading('Loading R&D Lab...');
  }

  const stats = overviewData?.data || { activeProjects: 0, completedProjects: 0, experiments: 0, innovationScore: 0 };
  const agents = teamData?.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background text-white p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <span className="text-5xl">🔬</span>
              R&D Lab
            </h1>
            <p className="text-muted-foreground text-lg">Maestro Nova - نوفا | مركز البحث والتطوير</p>
          </div>
          <button onClick={handleRefresh} className="p-2 rounded-lg bg-primary/20 hover:bg-primary/30 transition-colors" title="Refresh Data">
            <RefreshCw className="w-5 h-5 text-primary" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg p-6 border border-primary/30">
          <div className="flex items-center justify-between mb-2">
            <Beaker className="w-8 h-8 text-primary" />
            <span className="text-3xl font-bold">{stats.activeProjects}</span>
          </div>
          <div className="text-sm text-gray-300">Active Projects</div>
          <div className="text-xs text-gray-500 mt-1">In development</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg p-6 border border-warning/30">
          <div className="flex items-center justify-between mb-2">
            <Lightbulb className="w-8 h-8 text-warning" />
            <span className="text-3xl font-bold">{stats.innovations}</span>
          </div>
          <div className="text-sm text-gray-300">Innovations</div>
          <div className="text-xs text-gray-500 mt-1">This quarter</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg p-6 border border-secondary/30">
          <div className="flex items-center justify-between mb-2">
            <Cpu className="w-8 h-8 text-secondary" />
            <span className="text-3xl font-bold">{stats.experiments}</span>
          </div>
          <div className="text-sm text-gray-300">Experiments</div>
          <div className="text-xs text-gray-500 mt-1">Running</div>
        </div>

        <div className="bg-gradient-to-br from-success/20 to-success/20 rounded-lg p-6 border border-success/30">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-8 h-8 text-success" />
            <span className="text-3xl font-bold">{stats.evolutionIndex}</span>
          </div>
          <div className="text-sm text-gray-300">Evolution Index</div>
          <div className="text-xs text-gray-500 mt-1">Growing fast</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {agents.map((agent: any) => (
          <div 
            key={agent.id}
            className="bg-card/50 rounded-lg p-4 border border-border"
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
              <span className="px-2 py-1 rounded text-xs font-bold bg-primary/20 text-primary">ACTIVE</span>
              <span className="text-sm text-muted-foreground">{agent.tasks} tasks</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
