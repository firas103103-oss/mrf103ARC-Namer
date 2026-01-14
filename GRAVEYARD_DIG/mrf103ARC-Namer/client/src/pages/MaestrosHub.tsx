/**
 * 🏛️ Maestros Hub - القيادة الاستراتيجية
 * مركز المايستروز الستة
 */

import { useState } from 'react';
import { Shield, DollarSign, Scale, Home, Microscope, Dna, ChevronRight, TrendingUp, Users } from 'lucide-react';

interface Maestro {
  id: string;
  name: string;
  nameAr: string;
  sector: string;
  icon: any;
  color: string;
  performance: number;
  specialists: number;
  tasksToday: number;
  aiModel: string;
  status: 'active' | 'busy' | 'idle';
  recentActions: string[];
}

export default function MaestrosHub() {
  const [maestros] = useState<Maestro[]>([
    {
      id: 'cipher',
      name: 'Cipher',
      nameAr: 'شيفر',
      sector: 'Security & Surveillance',
      icon: Shield,
      color: 'hsl(var(--destructive))',
      performance: 98,
      specialists: 4,
      tasksToday: 215,
      aiModel: 'GPT-4o-mini',
      status: 'active',
      recentActions: [
        'Blocked 3 threat attempts',
        'Updated firewall rules',
        'Completed security audit',
        'Trained Aegis on new patterns'
      ]
    },
    {
      id: 'vault',
      name: 'Vault',
      nameAr: 'فولت',
      sector: 'Finance & Business',
      icon: DollarSign,
      color: 'hsl(var(--success))',
      performance: 92,
      specialists: 4,
      tasksToday: 189,
      aiModel: 'GPT-4o-mini',
      status: 'busy',
      recentActions: [
        'Processed monthly report',
        'Analyzed investment opportunities',
        'Updated budget forecasts',
        'Reconciled accounts'
      ]
    },
    {
      id: 'lexis',
      name: 'Lexis',
      nameAr: 'ليكسيس',
      sector: 'Legal & Documentation',
      icon: Scale,
      color: 'hsl(var(--secondary))',
      performance: 89,
      specialists: 4,
      tasksToday: 142,
      aiModel: 'GPT-4o-mini',
      status: 'active',
      recentActions: [
        'Reviewed 5 contracts',
        'Updated compliance policies',
        'Archived 28 documents',
        'Patent filing in progress'
      ]
    },
    {
      id: 'harmony',
      name: 'Harmony',
      nameAr: 'هارموني',
      sector: 'Personal Life',
      icon: Home,
      color: 'hsl(var(--accent))',
      performance: 95,
      specialists: 4,
      tasksToday: 178,
      aiModel: 'GPT-4o-mini',
      status: 'active',
      recentActions: [
        'Optimized daily schedule',
        'Health check completed',
        'Social calendar updated',
        'Personal goals tracked'
      ]
    },
    {
      id: 'nova',
      name: 'Nova',
      nameAr: 'نوفا',
      sector: 'Research & Development',
      icon: Microscope,
      color: 'hsl(var(--primary))',
      performance: 91,
      specialists: 4,
      tasksToday: 203,
      aiModel: 'GPT-4o-mini',
      status: 'busy',
      recentActions: [
        'Completed 2 research papers',
        'Prototyped new feature',
        '3 innovations in progress',
        'Darwin evolved 2 patterns'
      ]
    },
    {
      id: 'scent',
      name: 'Scent',
      nameAr: 'سينت',
      sector: 'xBio Sentinel',
      icon: Dna,
      color: 'hsl(var(--success))',
      performance: 97,
      specialists: 4,
      tasksToday: 320,
      aiModel: 'GPT-4o-mini',
      status: 'active',
      recentActions: [
        'Classified 12 new smells',
        'Environmental analysis done',
        'Instinct pattern detected',
        'Sensor calibration complete'
      ]
    }
  ]);

  const [selectedMaestro, setSelectedMaestro] = useState<Maestro | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background text-white p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <span className="text-5xl">🏛️</span>
          Maestros Hub
        </h1>
        <p className="text-muted-foreground text-lg">القادة الستة للقطاعات الاستراتيجية</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg p-6 border border-primary/30">
          <div className="text-3xl font-bold mb-2">6</div>
          <div className="text-sm text-gray-300">Active Maestros</div>
        </div>
        <div className="bg-gradient-to-br from-success/20 to-success/20 rounded-lg p-6 border border-success/30">
          <div className="text-3xl font-bold mb-2">24</div>
          <div className="text-sm text-gray-300">Total Specialists</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg p-6 border border-secondary/30">
          <div className="text-3xl font-bold mb-2">1,247</div>
          <div className="text-sm text-gray-300">Tasks Today</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg p-6 border border-warning/30">
          <div className="text-3xl font-bold mb-2">93.5%</div>
          <div className="text-sm text-gray-300">Avg Performance</div>
        </div>
      </div>

      {/* Maestros Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {maestros.map((maestro) => {
          const Icon = maestro.icon;
          return (
            <div
              key={maestro.id}
              className="bg-card/50 rounded-lg p-6 border border-border hover:border-gray-600 transition-all cursor-pointer hover:scale-[1.02]"
              onClick={() => setSelectedMaestro(maestro)}
              style={{ borderLeftColor: maestro.color, borderLeftWidth: '4px' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-16 h-16 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${maestro.color}20` }}
                  >
                    <Icon className="w-8 h-8" style={{ color: maestro.color }} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{maestro.name}</h3>
                    <p className="text-muted-foreground">{maestro.nameAr}</p>
                    <p className="text-sm text-gray-500">{maestro.sector}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    maestro.status === 'active' ? 'bg-success/20 text-success' :
                    maestro.status === 'busy' ? 'bg-warning/20 text-warning' :
                    'bg-muted/20 text-muted-foreground'
                  }`}>
                    {maestro.status.toUpperCase()}
                  </div>
                  <div className="text-xs text-gray-500">{maestro.aiModel}</div>
                </div>
              </div>

              {/* Performance Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Performance</span>
                  <span className="font-bold">{maestro.performance}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all"
                    style={{ 
                      width: `${maestro.performance}%`,
                      background: `linear-gradient(90deg, ${maestro.color}, ${maestro.color}dd)`
                    }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Team</span>
                  </div>
                  <div className="text-lg font-bold">{maestro.specialists} Specialists</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Today</span>
                  </div>
                  <div className="text-lg font-bold">{maestro.tasksToday} Tasks</div>
                </div>
              </div>

              {/* Recent Actions */}
              <div>
                <div className="text-sm font-semibold mb-2 text-muted-foreground">Recent Actions:</div>
                <div className="space-y-1">
                  {maestro.recentActions.slice(0, 3).map((action, idx) => (
                    <div key={idx} className="text-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: maestro.color }} />
                      <span className="text-gray-300">{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* View Details */}
              <button 
                className="mt-4 w-full py-2 rounded-lg flex items-center justify-center gap-2 font-semibold transition-all hover:scale-105"
                style={{ 
                  backgroundColor: `${maestro.color}20`,
                  color: maestro.color,
                  border: `1px solid ${maestro.color}40`
                }}
              >
                View Details
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal for Selected Maestro */}
      {selectedMaestro && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedMaestro(null)}
        >
          <div 
            className="bg-card rounded-lg p-8 max-w-2xl w-full border border-border"
            onClick={(e) => e.stopPropagation()}
            style={{ borderTopColor: selectedMaestro.color, borderTopWidth: '4px' }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div 
                className="w-20 h-20 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${selectedMaestro.color}20` }}
              >
                {(() => {
                  const Icon = selectedMaestro.icon;
                  return <Icon className="w-10 h-10" style={{ color: selectedMaestro.color }} />;
                })()}
              </div>
              <div>
                <h2 className="text-3xl font-bold">{selectedMaestro.name}</h2>
                <p className="text-xl text-muted-foreground">{selectedMaestro.nameAr}</p>
                <p className="text-gray-500">{selectedMaestro.sector}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">All Recent Actions:</h3>
                <div className="space-y-2">
                  {selectedMaestro.recentActions.map((action, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedMaestro.color }} />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                className="w-full py-3 rounded-lg font-semibold hover:opacity-80 transition-opacity"
                style={{ backgroundColor: selectedMaestro.color }}
                onClick={() => setSelectedMaestro(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
