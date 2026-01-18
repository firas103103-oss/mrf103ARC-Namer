/**
 * ⚖️ Legal Archive - Lexis Command
 * مركز القانون والوثائق
 * ✅ متصل بـ Backend API
 */

import { useSectorOverview, useSectorTeam, createRefreshHandler, renderLoading } from '@/lib/apiHooks';
import { Scale, FileText, CheckCircle, Clock, Archive, Shield, RefreshCw } from 'lucide-react';

export default function LegalArchive() {
  const { data: overviewData, isLoading: overviewLoading, refetch: refetchOverview } = useSectorOverview('legal');
  const { data: teamData, isLoading: teamLoading, refetch: refetchTeam } = useSectorTeam('legal');

  const handleRefresh = createRefreshHandler(refetchOverview, refetchTeam);

  if (overviewLoading || teamLoading) {
    return renderLoading('Loading Legal Archive...');
  }

  const stats = overviewData?.data || { activeContracts: 0, pendingReviews: 0, completedThisMonth: 0, complianceScore: 0 };
  const agents = teamData?.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background text-white p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <span className="text-5xl">⚖️</span>
              Legal Archive
            </h1>
            <p className="text-muted-foreground text-lg">Maestro Lexis - ليكسيس | مركز القانون والوثائق</p>
          </div>
          <button onClick={handleRefresh} className="p-2 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors" title="Refresh Data">
            <RefreshCw className="w-5 h-5 text-secondary" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg p-6 border border-secondary/30">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-8 h-8 text-secondary" />
            <span className="text-3xl font-bold">{stats.totalDocuments}</span>
          </div>
          <div className="text-sm text-gray-300">Total Documents</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg p-6 border border-primary/30">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-primary" />
            <span className="text-3xl font-bold">{stats.activeContracts}</span>
          </div>
          <div className="text-sm text-gray-300">Active Contracts</div>
        </div>

        <div className="bg-gradient-to-br from-success/20 to-success/20 rounded-lg p-6 border border-success/30">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-success" />
            <span className="text-3xl font-bold">{stats.compliance}%</span>
          </div>
          <div className="text-sm text-gray-300">Compliance Score</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg p-6 border border-warning/30">
          <div className="flex items-center justify-between mb-2">
            <Shield className="w-8 h-8 text-warning" />
            <span className="text-3xl font-bold">{stats.patents}</span>
          </div>
          <div className="text-sm text-gray-300">Patents Filed</div>
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
              <span className="px-2 py-1 rounded text-xs font-bold bg-secondary/20 text-secondary">ACTIVE</span>
              <span className="text-sm text-muted-foreground">{agent.tasks} tasks</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
