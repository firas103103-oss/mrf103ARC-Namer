/**
 * 🏗️ Layer Manager - نظام إدارة الطبقات الثلاث
 * 
 * الطبقة التنفيذية (Executive): Mr.F, Dr. Genius, Oracle
 * الطبقة الإدارية (Administrative): Sentinel, Architect, Phoenix, Guardian, Orchestrator, Monitor
 * الطبقة الإنتاجية (Productive): Neural, Quantum, Catalyst, Echo, DataMiner, DevOpsBot, Trainer
 */

/* eslint-disable no-undef, no-console */
import { EventEmitter } from 'events';
import { supabase } from '../supabase';

// تعريف الطبقات
export enum Layer {
  EXECUTIVE = 'executive',
  ADMINISTRATIVE = 'administrative',
  PRODUCTIVE = 'productive'
}

// Type aliases for backward compatibility
export type AgentId = string;

// تعريف مستويات الصلاحيات
export enum PermissionLevel {
  NONE = 0,
  READ = 1,
  WRITE = 2,
  EXECUTE = 3,
  APPROVE = 4,
  FULL = 5
}

// Agent Configuration interface
export interface AgentConfig {
  id: string;
  name: string;
  nameAr: string;
  layer: Layer;
  role: string;
  capabilities: string[];
  permissions: Record<string, PermissionLevel>;
  aiModel: string;
}

// واجهة الوكيل
export interface Agent {
  id: string;
  name: string;
  nameAr: string;
  layer: Layer;
  role: string;
  capabilities: string[];
  permissions: Record<string, PermissionLevel>;
  aiModel: string;
  status: 'active' | 'idle' | 'busy' | 'offline';
  lastActivity: Date;
}

// واجهة رسالة بين الطبقات
export interface LayerMessage {
  id: string;
  fromAgent: string;
  fromLayer: Layer;
  toAgent?: string;
  toLayer: Layer;
  type: 'command' | 'report' | 'request' | 'alert' | 'approval';
  priority: 'low' | 'medium' | 'high' | 'critical';
  payload: any;
  timestamp: Date;
  requiresApproval: boolean;
  status: 'pending' | 'delivered' | 'processed' | 'rejected';
}

// مصفوفة الصلاحيات الافتراضية
export const DEFAULT_PERMISSIONS: Record<Layer, Record<string, PermissionLevel>> = {
  [Layer.EXECUTIVE]: {
    'agents': PermissionLevel.FULL,
    'tasks': PermissionLevel.FULL,
    'governance': PermissionLevel.FULL,
    'archives': PermissionLevel.FULL,
    'settings': PermissionLevel.FULL,
    'integrations': PermissionLevel.FULL,
    'users': PermissionLevel.FULL,
    'analytics': PermissionLevel.FULL,
  },
  [Layer.ADMINISTRATIVE]: {
    'agents': PermissionLevel.EXECUTE,
    'tasks': PermissionLevel.WRITE,
    'governance': PermissionLevel.READ,
    'archives': PermissionLevel.WRITE,
    'settings': PermissionLevel.READ,
    'integrations': PermissionLevel.WRITE,
    'users': PermissionLevel.READ,
    'analytics': PermissionLevel.WRITE,
  },
  [Layer.PRODUCTIVE]: {
    'agents': PermissionLevel.READ,
    'tasks': PermissionLevel.EXECUTE,
    'governance': PermissionLevel.NONE,
    'archives': PermissionLevel.READ,
    'settings': PermissionLevel.NONE,
    'integrations': PermissionLevel.EXECUTE,
    'users': PermissionLevel.NONE,
    'analytics': PermissionLevel.READ,
  },
};

// 🏗️ Layer Manager Class
export class LayerManager extends EventEmitter {
  private agents: Map<string, Agent> = new Map();
  private messageQueue: LayerMessage[] = [];
  private processingInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.initializeAgents();
    this.startMessageProcessor();
  }

  // تهيئة الوكلاء الـ 16
  private async initializeAgents(): Promise<void> {
    const agentDefinitions: Omit<Agent, 'status' | 'lastActivity'>[] = [
      // 🔷 الطبقة التنفيذية (3 وكلاء)
      {
        id: 'mrf',
        name: 'Mr.F',
        nameAr: 'السيد ف',
        layer: Layer.EXECUTIVE,
        role: 'CEO & Strategic Commander',
        capabilities: ['strategic_planning', 'decision_making', 'crisis_management', 'approval'],
        permissions: DEFAULT_PERMISSIONS[Layer.EXECUTIVE],
        aiModel: 'gpt-4'
      },
      {
        id: 'genius',
        name: 'Dr. Genius',
        nameAr: 'دكتور جينيوس',
        layer: Layer.EXECUTIVE,
        role: 'Chief Innovation Officer',
        capabilities: ['innovation', 'research', 'product_design', 'strategy'],
        permissions: DEFAULT_PERMISSIONS[Layer.EXECUTIVE],
        aiModel: 'claude-opus'
      },
      {
        id: 'oracle',
        name: 'Oracle',
        nameAr: 'أوراكل',
        layer: Layer.EXECUTIVE,
        role: 'Data Prophet & Predictive Analyst',
        capabilities: ['prediction', 'trend_analysis', 'forecasting', 'insights'],
        permissions: DEFAULT_PERMISSIONS[Layer.EXECUTIVE],
        aiModel: 'claude-sonnet'
      },

      // 🔶 الطبقة الإدارية (6 وكلاء)
      {
        id: 'sentinel',
        name: 'Sentinel',
        nameAr: 'سنتينل',
        layer: Layer.ADMINISTRATIVE,
        role: 'Security Guardian',
        capabilities: ['security_monitoring', 'threat_detection', 'access_control', 'audit'],
        permissions: { ...DEFAULT_PERMISSIONS[Layer.ADMINISTRATIVE], security: PermissionLevel.FULL },
        aiModel: 'gpt-4'
      },
      {
        id: 'architect',
        name: 'Architect',
        nameAr: 'أركيتكت',
        layer: Layer.ADMINISTRATIVE,
        role: 'System Designer',
        capabilities: ['system_design', 'architecture', 'planning', 'optimization'],
        permissions: DEFAULT_PERMISSIONS[Layer.ADMINISTRATIVE],
        aiModel: 'claude-opus'
      },
      {
        id: 'phoenix',
        name: 'Phoenix',
        nameAr: 'فينيكس',
        layer: Layer.ADMINISTRATIVE,
        role: 'Recovery & Resilience Manager',
        capabilities: ['disaster_recovery', 'backup', 'restoration', 'resilience'],
        permissions: DEFAULT_PERMISSIONS[Layer.ADMINISTRATIVE],
        aiModel: 'gpt-4'
      },
      {
        id: 'guardian',
        name: 'Guardian',
        nameAr: 'جارديان',
        layer: Layer.ADMINISTRATIVE,
        role: 'Compliance Officer',
        capabilities: ['compliance', 'gdpr', 'privacy', 'legal_audit'],
        permissions: DEFAULT_PERMISSIONS[Layer.ADMINISTRATIVE],
        aiModel: 'gpt-4'
      },
      {
        id: 'orchestrator',
        name: 'Orchestrator',
        nameAr: 'أوركستريتور',
        layer: Layer.ADMINISTRATIVE,
        role: 'Task Coordinator',
        capabilities: ['task_scheduling', 'load_balancing', 'priority_management', 'coordination'],
        permissions: DEFAULT_PERMISSIONS[Layer.ADMINISTRATIVE],
        aiModel: 'claude-sonnet'
      },
      {
        id: 'monitor',
        name: 'Monitor',
        nameAr: 'مونيتور',
        layer: Layer.ADMINISTRATIVE,
        role: 'Performance Monitor',
        capabilities: ['performance_monitoring', 'alerting', 'metrics', 'health_check'],
        permissions: DEFAULT_PERMISSIONS[Layer.ADMINISTRATIVE],
        aiModel: 'gemini-flash'
      },

      // 🔹 الطبقة الإنتاجية (7 وكلاء)
      {
        id: 'neural',
        name: 'Neural',
        nameAr: 'نورال',
        layer: Layer.PRODUCTIVE,
        role: 'Neural Network Specialist',
        capabilities: ['ml_training', 'model_optimization', 'neural_networks', 'deep_learning'],
        permissions: DEFAULT_PERMISSIONS[Layer.PRODUCTIVE],
        aiModel: 'gpt-4o-mini'
      },
      {
        id: 'quantum',
        name: 'Quantum',
        nameAr: 'كوانتوم',
        layer: Layer.PRODUCTIVE,
        role: 'Quantum Computing Specialist',
        capabilities: ['complex_calculations', 'simulation', 'optimization_algorithms'],
        permissions: DEFAULT_PERMISSIONS[Layer.PRODUCTIVE],
        aiModel: 'gemini-pro'
      },
      {
        id: 'catalyst',
        name: 'Catalyst',
        nameAr: 'كاتاليست',
        layer: Layer.PRODUCTIVE,
        role: 'Growth Accelerator',
        capabilities: ['performance_optimization', 'acceleration', 'efficiency'],
        permissions: DEFAULT_PERMISSIONS[Layer.PRODUCTIVE],
        aiModel: 'gemini-flash'
      },
      {
        id: 'echo',
        name: 'Echo',
        nameAr: 'إيكو',
        layer: Layer.PRODUCTIVE,
        role: 'Communication Hub',
        capabilities: ['messaging', 'api_integration', 'websocket', 'routing'],
        permissions: DEFAULT_PERMISSIONS[Layer.PRODUCTIVE],
        aiModel: 'gpt-4o-mini'
      },
      {
        id: 'dataminer',
        name: 'DataMiner',
        nameAr: 'داتا ماينر',
        layer: Layer.PRODUCTIVE,
        role: 'Data Analyst',
        capabilities: ['data_extraction', 'analytics', 'sql', 'visualization'],
        permissions: DEFAULT_PERMISSIONS[Layer.PRODUCTIVE],
        aiModel: 'claude-sonnet'
      },
      {
        id: 'devopsbot',
        name: 'DevOpsBot',
        nameAr: 'ديف أوبس بوت',
        layer: Layer.PRODUCTIVE,
        role: 'DevOps Automation',
        capabilities: ['cicd', 'deployment', 'infrastructure', 'automation'],
        permissions: DEFAULT_PERMISSIONS[Layer.PRODUCTIVE],
        aiModel: 'gemini-flash'
      },
      {
        id: 'trainer',
        name: 'Trainer',
        nameAr: 'تراينر',
        layer: Layer.PRODUCTIVE,
        role: 'Learning System',
        capabilities: ['training', 'feedback_loop', 'model_improvement', 'evaluation'],
        permissions: DEFAULT_PERMISSIONS[Layer.PRODUCTIVE],
        aiModel: 'gpt-4'
      },
    ];

    // تهيئة الوكلاء
    for (const def of agentDefinitions) {
      const agent: Agent = {
        ...def,
        status: 'idle',
        lastActivity: new Date()
      };
      this.agents.set(agent.id, agent);
    }

    console.log(`✅ LayerManager: Initialized ${this.agents.size} agents across 3 layers`);
    this.emit('agents_initialized', { count: this.agents.size });
  }

  // بدء معالج الرسائل
  private startMessageProcessor(): void {
    this.processingInterval = setInterval(() => {
      this.processMessageQueue();
    }, 100); // كل 100ms
  }

  // معالجة قائمة الرسائل
  private async processMessageQueue(): Promise<void> {
    const pendingMessages = this.messageQueue.filter(m => m.status === 'pending');
    
    for (const message of pendingMessages) {
      try {
        await this.processMessage(message);
        message.status = 'processed';
        this.emit('message_processed', message);
      } catch (error) {
        message.status = 'rejected';
        this.emit('message_rejected', { message, error });
      }
    }

    // تنظيف الرسائل القديمة المعالجة
    this.messageQueue = this.messageQueue.filter(
      m => m.status === 'pending' || 
      (Date.now() - m.timestamp.getTime()) < 3600000 // احتفظ بالرسائل لمدة ساعة
    );
  }

  // معالجة رسالة واحدة
  private async processMessage(message: LayerMessage): Promise<void> {
    // التحقق من الصلاحيات
    const fromAgent = this.agents.get(message.fromAgent);
    if (!fromAgent) {
      throw new Error(`Agent ${message.fromAgent} not found`);
    }

    // التحقق من بروتوكول الاتصال بين الطبقات
    if (!this.validateLayerCommunication(message.fromLayer, message.toLayer, message.type)) {
      throw new Error('Invalid layer communication');
    }

    // إذا كانت الرسالة تتطلب موافقة من الطبقة التنفيذية
    if (message.requiresApproval && message.fromLayer !== Layer.EXECUTIVE) {
      await this.requestApproval(message);
      return;
    }

    // توصيل الرسالة
    if (message.toAgent) {
      const targetAgent = this.agents.get(message.toAgent);
      if (targetAgent) {
        this.emit('message_delivered', { message, targetAgent });
      }
    } else {
      // بث للطبقة كاملة
      const layerAgents = this.getAgentsByLayer(message.toLayer);
      for (const agent of layerAgents) {
        this.emit('message_delivered', { message, targetAgent: agent });
      }
    }

    // تسجيل في قاعدة البيانات
    await this.logMessage(message);
  }

  // التحقق من صلاحية الاتصال بين الطبقات
  private validateLayerCommunication(from: Layer, to: Layer, type: string): boolean {
    // القواعد:
    // 1. التنفيذية يمكنها التواصل مع الجميع
    // 2. الإدارية يمكنها التواصل مع التنفيذية (للتقارير) والإنتاجية (للأوامر)
    // 3. الإنتاجية يمكنها التواصل مع الإدارية فقط (للتقارير والطلبات)

    if (from === Layer.EXECUTIVE) return true;
    
    if (from === Layer.ADMINISTRATIVE) {
      if (to === Layer.EXECUTIVE && (type === 'report' || type === 'request' || type === 'alert')) return true;
      if (to === Layer.PRODUCTIVE && (type === 'command' || type === 'request')) return true;
      if (to === Layer.ADMINISTRATIVE) return true;
    }
    
    if (from === Layer.PRODUCTIVE) {
      if (to === Layer.ADMINISTRATIVE && (type === 'report' || type === 'request' || type === 'alert')) return true;
      if (to === Layer.PRODUCTIVE) return true;
    }

    return false;
  }

  // طلب موافقة من الطبقة التنفيذية
  private async requestApproval(message: LayerMessage): Promise<void> {
    const approvalRequest: LayerMessage = {
      id: `approval_${message.id}`,
      fromAgent: 'system',
      fromLayer: message.fromLayer,
      toLayer: Layer.EXECUTIVE,
      type: 'approval',
      priority: message.priority,
      payload: {
        originalMessage: message,
        reason: 'Requires executive approval'
      },
      timestamp: new Date(),
      requiresApproval: false,
      status: 'pending'
    };

    this.messageQueue.push(approvalRequest);
    this.emit('approval_requested', { originalMessage: message, approvalRequest });
  }

  // تسجيل الرسالة في قاعدة البيانات
  private async logMessage(message: LayerMessage): Promise<void> {
    if (!supabase) return;
    try {
      await supabase.from('layer_messages').insert({
        message_id: message.id,
        from_agent: message.fromAgent,
        from_layer: message.fromLayer,
        to_agent: message.toAgent,
        to_layer: message.toLayer,
        type: message.type,
        priority: message.priority,
        payload: message.payload,
        requires_approval: message.requiresApproval,
        status: message.status,
        created_at: message.timestamp
      });
    } catch (error) {
      console.error('Failed to log message:', error);
    }
  }

  // === PUBLIC API ===

  // إرسال رسالة بين الطبقات
  public sendMessage(message: Omit<LayerMessage, 'id' | 'timestamp' | 'status'>): string {
    const fullMessage: LayerMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      status: 'pending'
    };

    this.messageQueue.push(fullMessage);
    this.emit('message_queued', fullMessage);
    return fullMessage.id;
  }

  // الحصول على وكيل بالمعرف
  public getAgent(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  // الحصول على جميع الوكلاء بطبقة معينة
  public getAgentsByLayer(layer: Layer): Agent[] {
    return Array.from(this.agents.values()).filter(a => a.layer === layer);
  }

  // الحصول على جميع الوكلاء
  public getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  // تحديث حالة الوكيل
  public updateAgentStatus(id: string, status: Agent['status']): void {
    const agent = this.agents.get(id);
    if (agent) {
      agent.status = status;
      agent.lastActivity = new Date();
      this.emit('agent_status_changed', { id, status });
    }
  }

  // التحقق من صلاحية وكيل على مورد
  public checkPermission(agentId: string, resource: string, requiredLevel: PermissionLevel): boolean {
    const agent = this.agents.get(agentId);
    if (!agent) return false;
    
    const agentLevel = agent.permissions[resource] ?? PermissionLevel.NONE;
    return agentLevel >= requiredLevel;
  }

  // الحصول على إحصائيات الطبقات
  public getLayerStats(): Record<Layer, { total: number; active: number; busy: number }> {
    const stats: Record<Layer, { total: number; active: number; busy: number }> = {
      [Layer.EXECUTIVE]: { total: 0, active: 0, busy: 0 },
      [Layer.ADMINISTRATIVE]: { total: 0, active: 0, busy: 0 },
      [Layer.PRODUCTIVE]: { total: 0, active: 0, busy: 0 },
    };

    for (const agent of Array.from(this.agents.values())) {
      const layer = agent.layer as Layer;
      stats[layer].total++;
      if (agent.status === 'active' || agent.status === 'idle') stats[layer].active++;
      if (agent.status === 'busy') stats[layer].busy++;
    }

    return stats;
  }

  // الحصول على تهيئة وكيل
  public getAgentConfig(id: AgentId): AgentConfig | undefined {
    const agent = this.agents.get(id);
    if (!agent) return undefined;
    return {
      id: agent.id,
      name: agent.name,
      nameAr: agent.nameAr,
      layer: agent.layer,
      role: agent.role,
      capabilities: agent.capabilities,
      permissions: agent.permissions,
      aiModel: agent.aiModel
    };
  }

  // إيقاف المعالج
  public stop(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }
}

// Singleton instance
export const layerManager = new LayerManager();
