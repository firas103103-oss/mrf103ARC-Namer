/**
 * 🏠 Life Manager - Harmony Command
 * مركز الحياة الشخصية
 * ✅ متصل بـ Backend API
 */

import { useSectorOverview, useSectorTeam, createRefreshHandler, renderLoading } from '@/lib/apiHooks';
import { Home, Heart, Users, Calendar, TrendingUp, Activity, RefreshCw } from 'lucide-react';

export default function LifeManager() {
  const { data: overviewData, isLoading: overviewLoading, refetch: refetchOverview } = useSectorOverview('life');
  const { data: teamData, isLoading: teamLoading, refetch: refetchTeam } = useSectorTeam('life');

  const handleRefresh = createRefreshHandler(refetchOverview, refetchTeam);

  if (overviewLoading || teamLoading) {
    return renderLoading('Loading Life Manager...');
  }

  const stats = overviewData?.data || { healthScore: 0, productivityScore: 0, tasksCompleted: 0, upcomingEvents: 0 };
  const agents = teamData?.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background text-white p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <span className="text-5xl">🏠</span>
              Life Manager
            </h1>
            <p className="text-muted-foreground text-lg">Maestro Harmony - هارموني | مركز الحياة الشخصية</p>
          </div>
          <button onClick={handleRefresh} className="p-2 rounded-lg bg-accent/20 hover:bg-accent/30 transition-colors" title="Refresh Data">
            <RefreshCw className="w-5 h-5 text-accent" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 rounded-lg p-6 border border-accent/30">
          <div className="flex items-center justify-between mb-2">
            <Heart className="w-8 h-8 text-accent" />
            <span className="text-3xl font-bold">{stats.healthScore}%</span>
          </div>
          <div className="text-sm text-gray-300">Health Score</div>
          <div className="text-xs text-gray-500 mt-1">Excellent condition</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg p-6 border border-secondary/30">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-8 h-8 text-secondary" />
            <span className="text-3xl font-bold">{stats.dailyTasks}</span>
          </div>
          <div className="text-sm text-gray-300">Tasks Today</div>
          <div className="text-xs text-gray-500 mt-1">8 completed</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg p-6 border border-primary/30">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-primary" />
            <span className="text-3xl font-bold">{stats.upcomingEvents}</span>
          </div>
          <div className="text-sm text-gray-300">Upcoming Events</div>
          <div className="text-xs text-gray-500 mt-1">This week</div>
        </div>

        <div className="bg-gradient-to-br from-success/20 to-success/20 rounded-lg p-6 border border-success/30">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-success" />
            <span className="text-3xl font-bold">{stats.habitStreak}</span>
          </div>
          <div className="text-sm text-gray-300">Day Streak</div>
          <div className="text-xs text-gray-500 mt-1">Keep it up!</div>
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
              <span className="px-2 py-1 rounded text-xs font-bold bg-accent/20 text-accent">ACTIVE</span>
              <span className="text-sm text-muted-foreground">{agent.tasks} tasks</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
