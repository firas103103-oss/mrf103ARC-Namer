/**
 * 🔬 R&D Lab - Nova Command
 * مركز البحث والتطوير
 */

import { useState } from 'react';
import { Microscope, Lightbulb, Cpu, TrendingUp, Zap, Beaker } from 'lucide-react';

export default function RnDLab() {
  const [stats] = useState({
    activeProjects: 8,
    innovations: 15,
    experiments: 23,
    evolutionIndex: 42
  });

  const [agents] = useState([
    { id: 'lab', name: 'Lab', nameAr: 'المختبر', role: 'Research & Studies', icon: '🧪', color: '#0284C7', tasks: 52 },
    { id: 'forge', name: 'Forge', nameAr: 'المصنع', role: 'Development & Engineering', icon: '⚙️', color: '#0369A1', tasks: 67 },
    { id: 'spark', name: 'Spark', nameAr: 'الشرارة', role: 'Innovation & Ideas', icon: '✨', color: '#0EA5E9', tasks: 41 },
    { id: 'darwin', name: 'Darwin', nameAr: 'داروين', role: 'Self-Learning & Evolution', icon: '🧬', color: '#38BDF8', tasks: 38 }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <span className="text-5xl">🔬</span>
          R&D Lab
        </h1>
        <p className="text-gray-400 text-lg">Maestro Nova - نوفا | مركز البحث والتطوير</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg p-6 border border-blue-500/30">
          <div className="flex items-center justify-between mb-2">
            <Beaker className="w-8 h-8 text-blue-400" />
            <span className="text-3xl font-bold">{stats.activeProjects}</span>
          </div>
          <div className="text-sm text-gray-300">Active Projects</div>
          <div className="text-xs text-gray-500 mt-1">In development</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg p-6 border border-yellow-500/30">
          <div className="flex items-center justify-between mb-2">
            <Lightbulb className="w-8 h-8 text-yellow-400" />
            <span className="text-3xl font-bold">{stats.innovations}</span>
          </div>
          <div className="text-sm text-gray-300">Innovations</div>
          <div className="text-xs text-gray-500 mt-1">This quarter</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg p-6 border border-purple-500/30">
          <div className="flex items-center justify-between mb-2">
            <Cpu className="w-8 h-8 text-purple-400" />
            <span className="text-3xl font-bold">{stats.experiments}</span>
          </div>
          <div className="text-sm text-gray-300">Experiments</div>
          <div className="text-xs text-gray-500 mt-1">Running</div>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg p-6 border border-green-500/30">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-8 h-8 text-green-400" />
            <span className="text-3xl font-bold">{stats.evolutionIndex}</span>
          </div>
          <div className="text-sm text-gray-300">Evolution Index</div>
          <div className="text-xs text-gray-500 mt-1">Growing fast</div>
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
              <span className="px-2 py-1 rounded text-xs font-bold bg-blue-500/20 text-blue-400">ACTIVE</span>
              <span className="text-sm text-gray-400">{agent.tasks} tasks</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
