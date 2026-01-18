/**
 * 🤖 Agent Dashboard - لوحة تحكم الوكلاء
 * عرض الطبقات الثلاث و 31 وكيل مع حالتهم
 * ✅ متصل بـ Backend API
 */

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { renderLoading } from '@/lib/apiHooks';
import { 
  Brain, 
  Shield, 
  Target, 
  Users, 
  Activity, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Cpu,
  Zap,
  TrendingUp,
  BarChart3,
  Layers,
  Settings,
  PlayCircle,
  PauseCircle,
  RefreshCw
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

interface Agent {
  id: string;
  name: string;
  nameAr: string;
  layer: 'executive' | 'administrative' | 'productive';
  layerLevel: number;
  specialization: string;
  model: string;
  status: 'active' | 'inactive' | 'maintenance' | 'busy';
  capabilities: string[];
  performanceScore: number;
  tasksCompleted: number;
  tasksInProgress: number;
  lastActive: Date;
}

interface LayerStats {
  layer: string;
  agents: number;
  activeAgents: number;
  tasksToday: number;
  avgPerformance: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Sample Data
// ═══════════════════════════════════════════════════════════════════════════════

const agents: Agent[] = [
  // Executive Layer
  { id: 'arc_master', name: 'ARC Master', nameAr: 'القائد الأعلى', layer: 'executive', layerLevel: 1, specialization: 'Strategic Planning & Oversight', model: 'gpt-4o', status: 'active', capabilities: ['strategic_planning', 'system_oversight', 'policy_enforcement'], performanceScore: 98.5, tasksCompleted: 1250, tasksInProgress: 3, lastActive: new Date() },
  { id: 'arc_strategist', name: 'Strategic Planner', nameAr: 'المخطط الاستراتيجي', layer: 'executive', layerLevel: 1, specialization: 'Long-term Planning', model: 'gpt-4o', status: 'active', capabilities: ['long_term_planning', 'goal_setting', 'resource_allocation'], performanceScore: 97.2, tasksCompleted: 890, tasksInProgress: 2, lastActive: new Date() },
  { id: 'arc_guardian', name: 'Security Guardian', nameAr: 'حارس الأمان', layer: 'executive', layerLevel: 1, specialization: 'Security & Compliance', model: 'gpt-4o', status: 'active', capabilities: ['security_audit', 'compliance_check', 'threat_detection'], performanceScore: 99.1, tasksCompleted: 2100, tasksInProgress: 5, lastActive: new Date() },
  
  // Administrative Layer
  { id: 'arc_coordinator', name: 'Task Coordinator', nameAr: 'منسق المهام', layer: 'administrative', layerLevel: 2, specialization: 'Task Distribution', model: 'gpt-4o-mini', status: 'busy', capabilities: ['task_assignment', 'load_balancing', 'priority_management'], performanceScore: 95.8, tasksCompleted: 3500, tasksInProgress: 12, lastActive: new Date() },
  { id: 'arc_monitor', name: 'Performance Monitor', nameAr: 'مراقب الأداء', layer: 'administrative', layerLevel: 2, specialization: 'System Monitoring', model: 'gpt-4o-mini', status: 'active', capabilities: ['performance_tracking', 'anomaly_detection', 'reporting'], performanceScore: 96.4, tasksCompleted: 4200, tasksInProgress: 8, lastActive: new Date() },
  { id: 'arc_quality', name: 'Quality Controller', nameAr: 'مراقب الجودة', layer: 'administrative', layerLevel: 2, specialization: 'Quality Assurance', model: 'gpt-4o-mini', status: 'active', capabilities: ['quality_check', 'validation', 'feedback_collection'], performanceScore: 97.9, tasksCompleted: 2800, tasksInProgress: 4, lastActive: new Date() },
  { id: 'arc_scheduler', name: 'Schedule Manager', nameAr: 'مدير الجدولة', layer: 'administrative', layerLevel: 2, specialization: 'Scheduling', model: 'gpt-4o-mini', status: 'active', capabilities: ['scheduling', 'deadline_management', 'calendar_sync'], performanceScore: 94.5, tasksCompleted: 1900, tasksInProgress: 6, lastActive: new Date() },
  { id: 'arc_communicator', name: 'Communication Hub', nameAr: 'مركز الاتصالات', layer: 'administrative', layerLevel: 2, specialization: 'Inter-layer Communication', model: 'gpt-4o-mini', status: 'active', capabilities: ['message_routing', 'notification', 'escalation'], performanceScore: 98.2, tasksCompleted: 8500, tasksInProgress: 15, lastActive: new Date() },
  
  // Productive Layer
  { id: 'arc_analyst', name: 'Data Analyst', nameAr: 'محلل البيانات', layer: 'productive', layerLevel: 3, specialization: 'Data Analysis', model: 'gpt-4o-mini', status: 'busy', capabilities: ['data_analysis', 'pattern_recognition', 'insights_generation'], performanceScore: 96.7, tasksCompleted: 5600, tasksInProgress: 20, lastActive: new Date() },
  { id: 'arc_coder', name: 'Code Generator', nameAr: 'مولد الكود', layer: 'productive', layerLevel: 3, specialization: 'Code Generation', model: 'gpt-4o-mini', status: 'active', capabilities: ['code_generation', 'code_review', 'refactoring'], performanceScore: 95.3, tasksCompleted: 4200, tasksInProgress: 8, lastActive: new Date() },
  { id: 'arc_writer', name: 'Content Writer', nameAr: 'كاتب المحتوى', layer: 'productive', layerLevel: 3, specialization: 'Content Creation', model: 'gpt-4o-mini', status: 'active', capabilities: ['content_writing', 'translation', 'summarization'], performanceScore: 97.1, tasksCompleted: 3800, tasksInProgress: 6, lastActive: new Date() },
  { id: 'arc_researcher', name: 'Knowledge Researcher', nameAr: 'الباحث المعرفي', layer: 'productive', layerLevel: 3, specialization: 'Research & Knowledge', model: 'gpt-4o-mini', status: 'active', capabilities: ['research', 'knowledge_retrieval', 'fact_checking'], performanceScore: 96.9, tasksCompleted: 2900, tasksInProgress: 4, lastActive: new Date() },
  { id: 'arc_iot_handler', name: 'IoT Handler', nameAr: 'معالج IoT', layer: 'productive', layerLevel: 3, specialization: 'IoT Data Processing', model: 'gpt-4o-mini', status: 'busy', capabilities: ['sensor_processing', 'device_management', 'alert_handling'], performanceScore: 98.4, tasksCompleted: 12000, tasksInProgress: 45, lastActive: new Date() },
  { id: 'arc_integrator', name: 'Integration Specialist', nameAr: 'أخصائي التكامل', layer: 'productive', layerLevel: 3, specialization: 'External Integrations', model: 'gpt-4o-mini', status: 'active', capabilities: ['api_integration', 'data_sync', 'webhook_management'], performanceScore: 95.8, tasksCompleted: 3100, tasksInProgress: 7, lastActive: new Date() },
  { id: 'arc_classifier', name: 'Content Classifier', nameAr: 'مصنف المحتوى', layer: 'productive', layerLevel: 3, specialization: 'Classification', model: 'gpt-4o-mini', status: 'active', capabilities: ['text_classification', 'sentiment_analysis', 'entity_extraction'], performanceScore: 97.6, tasksCompleted: 8900, tasksInProgress: 18, lastActive: new Date() },
  { id: 'arc_archivist', name: 'Data Archivist', nameAr: 'أمين الأرشيف', layer: 'productive', layerLevel: 3, specialization: 'Data Archival', model: 'gpt-4o-mini', status: 'maintenance', capabilities: ['data_archival', 'backup_management', 'data_lifecycle'], performanceScore: 94.2, tasksCompleted: 1500, tasksInProgress: 0, lastActive: new Date(Date.now() - 3600000) },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Components
// ═══════════════════════════════════════════════════════════════════════════════

const LayerIcon: React.FC<{ layer: string }> = ({ layer }) => {
  switch (layer) {
    case 'executive':
      return <Shield className="w-5 h-5" />;
    case 'administrative':
      return <Users className="w-5 h-5" />;
    case 'productive':
      return <Cpu className="w-5 h-5" />;
    default:
      return <Brain className="w-5 h-5" />;
  }
};

const StatusBadge: React.FC<{ status: Agent['status'] }> = ({ status }) => {
  const statusConfig = {
    active: { label: 'نشط', class: 'badge-success', icon: CheckCircle2 },
    busy: { label: 'مشغول', class: 'badge-warning', icon: Activity },
    inactive: { label: 'غير نشط', class: 'badge-default', icon: PauseCircle },
    maintenance: { label: 'صيانة', class: 'badge-info', icon: Settings },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={`badge ${config.class} flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

const AgentCard: React.FC<{ agent: Agent }> = ({ agent }) => {
  const layerColors = {
    executive: 'layer-executive',
    administrative: 'layer-administrative',
    productive: 'layer-productive',
  };

  return (
    <div className="card p-4 hover:border-primary-500/50 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${layerColors[agent.layer]} bg-opacity-20`}>
            <LayerIcon layer={agent.layer} />
          </div>
          <div>
            <h3 className="font-semibold text-primary">{agent.nameAr}</h3>
            <p className="text-sm text-secondary">{agent.name}</p>
          </div>
        </div>
        <StatusBadge status={agent.status} />
      </div>

      <p className="text-sm text-tertiary mb-4">{agent.specialization}</p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-2 bg-secondary rounded-lg">
          <p className="text-2xl font-bold text-primary">{agent.tasksCompleted.toLocaleString()}</p>
          <p className="text-xs text-tertiary">مهام مكتملة</p>
        </div>
        <div className="text-center p-2 bg-secondary rounded-lg">
          <p className="text-2xl font-bold text-accent">{agent.tasksInProgress}</p>
          <p className="text-xs text-tertiary">قيد التنفيذ</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-secondary">الأداء</span>
          <span className="font-semibold text-success">{agent.performanceScore}%</span>
        </div>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all"
            style={{ width: `${agent.performanceScore}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-tertiary">
          نموذج: <span className="text-secondary">{agent.model}</span>
        </span>
        <span className={`layer-badge ${layerColors[agent.layer]}`}>
          L{agent.layerLevel}
        </span>
      </div>
    </div>
  );
};

const LayerSection: React.FC<{ 
  title: string; 
  titleAr: string;
  layer: 'executive' | 'administrative' | 'productive';
  agents: Agent[];
}> = ({ title, titleAr, layer, agents }) => {
  const layerConfig = {
    executive: { color: 'layer-executive', gradient: 'from-yellow-500 to-amber-500' },
    administrative: { color: 'layer-administrative', gradient: 'from-primary to-secondary' },
    productive: { color: 'layer-productive', gradient: 'from-success to-success' },
  };

  const config = layerConfig[layer];
  const activeCount = agents.filter(a => a.status === 'active' || a.status === 'busy').length;
  const totalTasks = agents.reduce((sum, a) => sum + a.tasksInProgress, 0);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${config.gradient} shadow-lg`}>
            <LayerIcon layer={layer} />
          </div>
          <div>
            <h2 className="text-xl font-bold gradient-text">{titleAr}</h2>
            <p className="text-sm text-secondary">{title}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{activeCount}/{agents.length}</p>
            <p className="text-xs text-tertiary">نشط</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-accent">{totalTasks}</p>
            <p className="text-xs text-tertiary">مهام</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {agents.map(agent => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
};

const StatsCard: React.FC<{ 
  icon: React.ElementType; 
  label: string; 
  value: string | number;
  trend?: number;
  color?: string;
}> = ({ icon: Icon, label, value, trend, color = 'primary' }) => (
  <div className="card p-4">
    <div className="flex items-center justify-between">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${color}-500/20`}>
        <Icon className={`w-5 h-5 text-${color}-500`} />
      </div>
      {trend !== undefined && (
        <span className={`flex items-center gap-1 text-sm ${trend >= 0 ? 'text-success' : 'text-error'}`}>
          <TrendingUp className={`w-4 h-4 ${trend < 0 ? 'rotate-180' : ''}`} />
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-3xl font-bold mt-3">{value}</p>
    <p className="text-sm text-secondary">{label}</p>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// Main Dashboard
// ═══════════════════════════════════════════════════════════════════════════════

export const AgentDashboard: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch all agents from backend
  const { data: agentsData, isLoading, refetch } = useQuery({
    queryKey: ['all-agents'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/arc/agents/all');
      return (response as any).data || response;
    },
    refetchInterval: 30000
  });

  const agents = Array.isArray(agentsData) ? agentsData : (agentsData?.data || []);
  
  if (isLoading) {
    return renderLoading('Loading Agent Dashboard...');
  }

  const executiveAgents = agents.filter((a: any) => a.layer === 'executive' || a.layer === 'CEO');
  const administrativeAgents = agents.filter((a: any) => a.layer === 'administrative' || a.layer === 'Maestro');
  const productiveAgents = agents.filter((a: any) => a.layer === 'productive' || a.layer === 'Specialist');

  const totalTasks = agents.reduce((sum: number, a: any) => sum + (a.tasksCompleted || 0), 0);
  const activeTasks = agents.reduce((sum: number, a: any) => sum + (a.tasksInProgress || 0), 0);
  const activeAgents = agents.filter((a: any) => a.status === 'active' || a.status === 'busy').length;
  const avgPerformance = agents.length > 0 ? agents.reduce((sum: number, a: any) => sum + (a.performanceScore || 95), 0) / agents.length : 95;

  const handleRefresh = () => {
    setIsRefreshing(true);
    refetch();
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  return (
    <div className="min-h-screen bg-primary p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold gradient-text">🤖 لوحة تحكم الوكلاء</h1>
          <p className="text-secondary mt-1">نظام ARC متعدد الطبقات - {agents.length} وكيل ذكي</p>
        </div>
        <button 
          onClick={handleRefresh}
          className="btn btn-secondary flex items-center gap-2"
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          تحديث
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard 
          icon={Brain} 
          label="إجمالي الوكلاء" 
          value={agents.length}
          color="primary"
        />
        <StatsCard 
          icon={Activity} 
          label="الوكلاء النشطين" 
          value={activeAgents}
          trend={5.2}
          color="success"
        />
        <StatsCard 
          icon={BarChart3} 
          label="المهام قيد التنفيذ" 
          value={activeTasks}
          color="accent"
        />
        <StatsCard 
          icon={Zap} 
          label="متوسط الأداء" 
          value={`${avgPerformance.toFixed(1)}%`}
          trend={2.8}
          color="warning"
        />
      </div>

      {/* Total Tasks Banner */}
      <div className="card card-glass p-6 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-50" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-lg text-secondary mb-2">إجمالي المهام المكتملة</p>
            <p className="text-5xl font-bold gradient-text">{totalTasks.toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center layer-executive bg-opacity-20 mb-2">
                <Shield className="w-8 h-8" />
              </div>
              <p className="text-sm text-secondary">تنفيذية</p>
              <p className="font-bold">{executiveAgents.length}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center layer-administrative bg-opacity-20 mb-2">
                <Users className="w-8 h-8" />
              </div>
              <p className="text-sm text-secondary">إدارية</p>
              <p className="font-bold">{administrativeAgents.length}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center layer-productive bg-opacity-20 mb-2">
                <Cpu className="w-8 h-8" />
              </div>
              <p className="text-sm text-secondary">إنتاجية</p>
              <p className="font-bold">{productiveAgents.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Layer Sections */}
      <LayerSection 
        title="Executive Layer" 
        titleAr="الطبقة التنفيذية" 
        layer="executive"
        agents={executiveAgents}
      />

      <LayerSection 
        title="Administrative Layer" 
        titleAr="الطبقة الإدارية" 
        layer="administrative"
        agents={administrativeAgents}
      />

      <LayerSection 
        title="Productive Layer" 
        titleAr="الطبقة الإنتاجية" 
        layer="productive"
        agents={productiveAgents}
      />
    </div>
  );
};

export default AgentDashboard;
