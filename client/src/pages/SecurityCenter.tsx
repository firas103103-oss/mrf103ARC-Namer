/**
 * 🛡️ Security Center - Cipher Command
 * مركز الأمن والمراقبة
 * ✅ متصل بـ Backend API
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Shield, Lock, AlertTriangle, Eye, Activity, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface SecurityAgent {
  id: string;
  name: string;
  nameAr: string;
  role: string;
  status: 'active' | 'alert' | 'idle';
  tasksToday: number;
  icon: string;
  color: string;
}

interface SecurityEvent {
  id: string;
  type: 'threat' | 'access' | 'alert' | 'success';
  message: string;
  agent: string;
  timestamp: Date;
  severity: 'critical' | 'high' | 'medium' | 'low';
  details?: string;
}

export default function SecurityCenter() {
  // Fetch security overview from Backend
  const { data: overviewData, isLoading: overviewLoading, refetch: refetchOverview } = useQuery({
    queryKey: ['security-overview'],
    queryFn: () => apiRequest('GET', '/api/security/overview'),
    refetchInterval: 15000, // More frequent for security
  });

  // Fetch security events from Backend
  const { data: eventsData, isLoading: eventsLoading, refetch: refetchEvents } = useQuery({
    queryKey: ['security-events'],
    queryFn: () => apiRequest('GET', '/api/security/events?limit=10'),
    refetchInterval: 15000,
  });

  // Fetch security team from Backend
  const { data: teamData, isLoading: teamLoading, refetch: refetchTeam } = useQuery({
    queryKey: ['security-team'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/security/team');
      return (response as any).data || response;
    },
    refetchInterval: 30000,
  });

  const agents: SecurityAgent[] = (teamData as any)?.data || teamData || [];
  const events: SecurityEvent[] = (eventsData as any)?.data || eventsData || [];
  const stats = (overviewData as any)?.data || overviewData || {
    threatsBlocked: 0,
    filesEncrypted: 0,
    activeMonitoring: 0,
    securityScore: 0
  };

  const handleRefresh = () => {
    refetchOverview();
    refetchEvents();
    refetchTeam();
  };

  if (overviewLoading || eventsLoading || teamLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-destructive mx-auto mb-4" />
          <p className="text-muted-foreground">Loading Security Center...</p>
        </div>
      </div>
    );
  }

  const getEventIcon = (type: SecurityEvent['type']) => {
    switch (type) {
      case 'threat': return <AlertTriangle className="w-5 h-5 text-destructive" />;
      case 'alert': return <Eye className="w-5 h-5 text-warning" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-success" />;
      case 'access': return <Lock className="w-5 h-5 text-primary" />;
    }
  };

  const getSeverityColor = (severity: SecurityEvent['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'high': return 'bg-warning/20 text-warning border-warning/30';
      case 'medium': return 'bg-warning/20 text-warning border-warning/30';
      case 'low': return 'bg-success/20 text-success border-success/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <span className="text-5xl">🛡️</span>
              Security Center
            </h1>
            <p className="text-muted-foreground text-lg">Maestro Cipher - شيفر | مركز الأمن والمراقبة</p>
          </div>
          <button 
            onClick={handleRefresh}
            className="p-2 rounded-lg bg-destructive/20 hover:bg-destructive/30 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-5 h-5 text-destructive" />
          </button>
        </div>
      </div>

      {/* Security Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-lg p-6 border border-destructive/30">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 text-destructive" />
            <span className="text-3xl font-bold">{stats.threatsBlocked}</span>
          </div>
          <div className="text-sm text-gray-300">Threats Blocked</div>
          <div className="text-xs text-gray-500 mt-1">Last 24 hours</div>
        </div>

        <div className="bg-gradient-to-br from-gray-500/20 to-gray-600/20 rounded-lg p-6 border border-muted/30">
          <div className="flex items-center justify-between mb-2">
            <Lock className="w-8 h-8 text-muted-foreground" />
            <span className="text-3xl font-bold">{stats.filesEncrypted}</span>
          </div>
          <div className="text-sm text-gray-300">Files Encrypted</div>
          <div className="text-xs text-gray-500 mt-1">Secure storage</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg p-6 border border-warning/30">
          <div className="flex items-center justify-between mb-2">
            <Eye className="w-8 h-8 text-warning" />
            <span className="text-3xl font-bold">{stats.activeMonitoring}h</span>
          </div>
          <div className="text-sm text-gray-300">Active Monitoring</div>
          <div className="text-xs text-gray-500 mt-1">24/7 surveillance</div>
        </div>

        <div className="bg-gradient-to-br from-success/20 to-success/30 rounded-lg p-6 border border-success/30">
          <div className="flex items-center justify-between mb-2">
            <Shield className="w-8 h-8 text-success" />
            <span className="text-3xl font-bold">{stats.securityScore}%</span>
          </div>
          <div className="text-sm text-gray-300">Security Score</div>
          <div className="text-xs text-gray-500 mt-1">Excellent status</div>
        </div>
      </div>

      {/* Security Team */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Security Team
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
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  agent.status === 'active' ? 'bg-success/20 text-success' :
                  agent.status === 'alert' ? 'bg-destructive/20 text-destructive' :
                  'bg-muted/20 text-muted-foreground'
                }`}>
                  {agent.status.toUpperCase()}
                </span>
                <span className="text-sm text-muted-foreground">{agent.tasksToday} tasks</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Events */}
      <div className="bg-card/50 rounded-lg p-6 border border-border">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Activity className="w-6 h-6" />
          Live Security Events
        </h2>
        <div className="space-y-3">
          {events.map((event) => (
            <div 
              key={event.id}
              className={`p-4 rounded-lg border ${getSeverityColor(event.severity)} flex items-start gap-4`}
            >
              <div className="mt-1">
                {getEventIcon(event.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold">{event.message}</span>
                  <span className="text-xs px-2 py-1 rounded bg-muted/50">
                    {event.severity.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Agent: {event.agent}</span>
                  <span>•</span>
                  <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
