/**
 * 🛡️ Security Center - Cipher Command
 * مركز الأمن والمراقبة
 */

import { useState, useEffect } from 'react';
import { Shield, Lock, AlertTriangle, Eye, Activity, CheckCircle, XCircle } from 'lucide-react';

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
}

export default function SecurityCenter() {
  const [agents] = useState<SecurityAgent[]>([
    { id: 'aegis', name: 'Aegis', nameAr: 'إيجيس', role: 'Firewall & Protection', status: 'active', tasksToday: 89, icon: '🔥', color: '#EF4444' },
    { id: 'phantom', name: 'Phantom', nameAr: 'فانتوم', role: 'Encryption & Keys', status: 'active', tasksToday: 45, icon: '🔐', color: '#6B7280' },
    { id: 'watchtower', name: 'Watchtower', nameAr: 'برج المراقبة', role: '24/7 Monitoring', status: 'alert', tasksToday: 156, icon: '🗼', color: '#F59E0B' },
    { id: 'ghost', name: 'Ghost', nameAr: 'الشبح', role: 'Intrusion Detection', status: 'active', tasksToday: 23, icon: '👻', color: '#1F2937' }
  ]);

  const [events, setEvents] = useState<SecurityEvent[]>([
    { id: '1', type: 'threat', message: 'Blocked suspicious IP: 192.168.1.100', agent: 'Aegis', timestamp: new Date(Date.now() - 120000), severity: 'high' },
    { id: '2', type: 'success', message: 'Encrypted 145 sensitive files', agent: 'Phantom', timestamp: new Date(Date.now() - 300000), severity: 'low' },
    { id: '3', type: 'alert', message: 'Unusual access pattern detected', agent: 'Watchtower', timestamp: new Date(Date.now() - 420000), severity: 'medium' },
    { id: '4', type: 'success', message: 'Security audit completed', agent: 'Ghost', timestamp: new Date(Date.now() - 600000), severity: 'low' },
    { id: '5', type: 'threat', message: 'DDoS attempt blocked', agent: 'Aegis', timestamp: new Date(Date.now() - 900000), severity: 'critical' }
  ]);

  const [stats] = useState({
    threatsBlocked: 23,
    filesEncrypted: 1456,
    activeMonitoring: 24,
    securityScore: 98
  });

  const getEventIcon = (type: SecurityEvent['type']) => {
    switch (type) {
      case 'threat': return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'alert': return <Eye className="w-5 h-5 text-yellow-400" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'access': return <Lock className="w-5 h-5 text-blue-400" />;
    }
  };

  const getSeverityColor = (severity: SecurityEvent['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <span className="text-5xl">🛡️</span>
          Security Center
        </h1>
        <p className="text-gray-400 text-lg">Maestro Cipher - شيفر | مركز الأمن والمراقبة</p>
      </div>

      {/* Security Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-lg p-6 border border-red-500/30">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 text-red-400" />
            <span className="text-3xl font-bold">{stats.threatsBlocked}</span>
          </div>
          <div className="text-sm text-gray-300">Threats Blocked</div>
          <div className="text-xs text-gray-500 mt-1">Last 24 hours</div>
        </div>

        <div className="bg-gradient-to-br from-gray-500/20 to-gray-600/20 rounded-lg p-6 border border-gray-500/30">
          <div className="flex items-center justify-between mb-2">
            <Lock className="w-8 h-8 text-gray-400" />
            <span className="text-3xl font-bold">{stats.filesEncrypted}</span>
          </div>
          <div className="text-sm text-gray-300">Files Encrypted</div>
          <div className="text-xs text-gray-500 mt-1">Secure storage</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg p-6 border border-orange-500/30">
          <div className="flex items-center justify-between mb-2">
            <Eye className="w-8 h-8 text-orange-400" />
            <span className="text-3xl font-bold">{stats.activeMonitoring}h</span>
          </div>
          <div className="text-sm text-gray-300">Active Monitoring</div>
          <div className="text-xs text-gray-500 mt-1">24/7 surveillance</div>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg p-6 border border-green-500/30">
          <div className="flex items-center justify-between mb-2">
            <Shield className="w-8 h-8 text-green-400" />
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
              className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-all"
              style={{ borderLeftColor: agent.color, borderLeftWidth: '3px' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{agent.icon}</span>
                <div>
                  <h3 className="font-bold">{agent.name}</h3>
                  <p className="text-xs text-gray-400">{agent.nameAr}</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-3">{agent.role}</p>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  agent.status === 'active' ? 'bg-green-500/20 text-green-400' :
                  agent.status === 'alert' ? 'bg-red-500/20 text-red-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {agent.status.toUpperCase()}
                </span>
                <span className="text-sm text-gray-400">{agent.tasksToday} tasks</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Events */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
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
                  <span className="text-xs px-2 py-1 rounded bg-gray-700/50">
                    {event.severity.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
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
