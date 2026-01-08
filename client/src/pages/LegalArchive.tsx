/**
 * ⚖️ Legal Archive - Lexis Command
 * مركز القانون والوثائق
 */

import { useState } from 'react';
import { Scale, FileText, CheckCircle, Clock, Archive, Shield } from 'lucide-react';

export default function LegalArchive() {
  const [stats] = useState({
    totalDocuments: 1245,
    activeContracts: 23,
    compliance: 98,
    patents: 5
  });

  const [agents] = useState([
    { id: 'archive', name: 'Archive', nameAr: 'الأرشيف', role: 'Document Archive', icon: '📚', color: '#8B5CF6', tasks: 45 },
    { id: 'contract', name: 'Contract', nameAr: 'العقود', role: 'Contract Management', icon: '📝', color: '#A78BFA', tasks: 28 },
    { id: 'compliance', name: 'Compliance', nameAr: 'الامتثال', role: 'Compliance & Policies', icon: '✅', color: '#7C3AED', tasks: 19 },
    { id: 'patent', name: 'Patent', nameAr: 'البراءات', role: 'Intellectual Property', icon: '💡', color: '#6D28D9', tasks: 12 }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <span className="text-5xl">⚖️</span>
          Legal Archive
        </h1>
        <p className="text-gray-400 text-lg">Maestro Lexis - ليكسيس | مركز القانون والوثائق</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg p-6 border border-purple-500/30">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-8 h-8 text-purple-400" />
            <span className="text-3xl font-bold">{stats.totalDocuments}</span>
          </div>
          <div className="text-sm text-gray-300">Total Documents</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg p-6 border border-blue-500/30">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-blue-400" />
            <span className="text-3xl font-bold">{stats.activeContracts}</span>
          </div>
          <div className="text-sm text-gray-300">Active Contracts</div>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg p-6 border border-green-500/30">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <span className="text-3xl font-bold">{stats.compliance}%</span>
          </div>
          <div className="text-sm text-gray-300">Compliance Score</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg p-6 border border-yellow-500/30">
          <div className="flex items-center justify-between mb-2">
            <Shield className="w-8 h-8 text-yellow-400" />
            <span className="text-3xl font-bold">{stats.patents}</span>
          </div>
          <div className="text-sm text-gray-300">Patents Filed</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {agents.map((agent) => (
          <div 
            key={agent.id}
            className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
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
              <span className="px-2 py-1 rounded text-xs font-bold bg-purple-500/20 text-purple-400">ACTIVE</span>
              <span className="text-sm text-gray-400">{agent.tasks} tasks</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
