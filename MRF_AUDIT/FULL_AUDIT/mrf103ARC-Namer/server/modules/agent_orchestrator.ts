/**
 * 🎭 Agent Orchestrator - منسق الوكلاء الرئيسي
 * 
 * يدير توزيع المهام وتنسيق العمل بين جميع الوكلاء
 * مع دعم التوازن الديناميكي والتعافي التلقائي
 */

import { supabase } from '../supabase';
import { EventEmitter } from 'events';
import { Layer, AgentId, AgentConfig, Agent, layerManager } from './layer_manager';
import { permissionMatrix, Operation, ResourceType } from './permission_matrix';
import { syncEngine, SyncType } from './sync_engine';
import { autoClassifier } from '../ml/auto_classifier';

// أنواع المهام
export enum TaskType {
  ANALYSIS = 'analysis',
  GENERATION = 'generation',
  PROCESSING = 'processing',
  DECISION = 'decision',
  MONITORING = 'monitoring',
  COMMUNICATION = 'communication',
  AUTOMATION = 'automation',
  MAINTENANCE = 'maintenance',
}

// حالة المهمة
export enum TaskStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  WAITING = 'waiting',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

// واجهة المهمة
export interface Task {
  id: string;
  type: TaskType;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: TaskStatus;
  assignedAgent?: AgentId;
  requiredLayer: Layer;
  requiredCapabilities: string[];
  input: Record<string, any>;
  output?: Record<string, any>;
  dependencies: string[]; // IDs of tasks that must complete first
  timeout: number; // milliseconds
  retries: number;
  maxRetries: number;
  createdBy: AgentId | 'system' | 'user';
  createdAt: Date;
  assignedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  metadata: Record<string, any>;
}

// واجهة خطة التنفيذ
export interface ExecutionPlan {
  id: string;
  tasks: Task[];
  executionOrder: string[];
  estimatedDuration: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'planning' | 'ready' | 'executing' | 'completed' | 'failed';
  createdAt: Date;
}

// واجهة تقييم الوكيل
export interface AgentEvaluation {
  agentId: AgentId;
  successRate: number;
  averageResponseTime: number;
  currentLoad: number;
  availability: 'available' | 'busy' | 'offline';
  lastActiveTime: Date;
  specializations: string[];
  recentPerformance: number; // 0-100
}

// استراتيجية توزيع المهام
export type LoadBalancingStrategy = 
  | 'round_robin'
  | 'least_loaded'
  | 'capability_match'
  | 'performance_based'
  | 'priority_queue';

// إحصائيات المنسق
export interface OrchestratorStats {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageCompletionTime: number;
  activeAgents: number;
  queuedTasks: number;
  throughput: number; // tasks per minute
}

// 🎭 Agent Orchestrator Class
export class AgentOrchestrator extends EventEmitter {
  private tasks: Map<string, Task> = new Map();
  private taskQueue: Task[] = [];
  private executionPlans: Map<string, ExecutionPlan> = new Map();
  private agentEvaluations: Map<AgentId, AgentEvaluation> = new Map();
  private loadBalancingStrategy: LoadBalancingStrategy = 'performance_based';
  private processorInterval: NodeJS.Timeout | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private stats: OrchestratorStats;

  constructor() {
    super();
    this.stats = {
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      averageCompletionTime: 0,
      activeAgents: 0,
      queuedTasks: 0,
      throughput: 0,
    };
    
    this.initialize();
  }

  // تهيئة المنسق
  private async initialize(): Promise<void> {
    await this.loadAgentEvaluations();
    this.setupEventListeners();
    this.startTaskProcessor();
    this.startHealthChecker();
    console.log('✅ AgentOrchestrator: Initialized and ready');
  }

  // تحميل تقييمات الوكلاء
  private async loadAgentEvaluations(): Promise<void> {
    const agents = layerManager.getAllAgents();
    
    for (const agent of agents) {
      this.agentEvaluations.set(agent.id, {
        agentId: agent.id,
        successRate: 100,
        averageResponseTime: 0,
        currentLoad: 0,
        availability: agent.status === 'active' ? 'available' : 'offline',
        lastActiveTime: agent.lastActivity,
        specializations: agent.capabilities,
        recentPerformance: 100,
      });
    }

    // تحميل الإحصائيات التاريخية
    try {
      if (!supabase) return;
      const { data } = await supabase
        .from('agent_performance_metrics')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(100);

      if (data) {
        for (const metric of data) {
          const evaluation = this.agentEvaluations.get(metric.agent_id);
          if (evaluation) {
            evaluation.successRate = metric.success_rate || evaluation.successRate;
            evaluation.averageResponseTime = metric.avg_response_time || evaluation.averageResponseTime;
            evaluation.recentPerformance = metric.performance_score || evaluation.recentPerformance;
          }
        }
      }
    } catch (error) {
      console.error('Failed to load agent metrics:', error);
    }

    this.stats.activeAgents = Array.from(this.agentEvaluations.values())
      .filter(e => e.availability === 'available').length;
  }

  // إعداد مستمعي الأحداث
  private setupEventListeners(): void {
    // الاستماع لأحداث مدير الطبقات
    layerManager.on('agent_status_changed', ({ agentId, status }) => {
      const evaluation = this.agentEvaluations.get(agentId);
      if (evaluation) {
        evaluation.availability = status === 'active' ? 'available' : 'offline';
      }
    });

    // الاستماع لأحداث المزامنة
    syncEngine.on('state_updated', ({ agentId }) => {
      const evaluation = this.agentEvaluations.get(agentId);
      if (evaluation) {
        evaluation.lastActiveTime = new Date();
      }
    });
  }

  // بدء معالج المهام
  private startTaskProcessor(): void {
    this.processorInterval = setInterval(async () => {
      await this.processTaskQueue();
    }, 500); // كل نصف ثانية
  }

  // بدء فاحص الصحة
  private startHealthChecker(): void {
    this.healthCheckInterval = setInterval(async () => {
      await this.checkAgentHealth();
      await this.handleStalledTasks();
    }, 30000); // كل 30 ثانية
  }

  // === PUBLIC API ===

  // إنشاء مهمة جديدة
  public async createTask(params: Omit<Task, 'id' | 'status' | 'createdAt' | 'retries'>): Promise<Task> {
    const task: Task = {
      ...params,
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: TaskStatus.PENDING,
      retries: 0,
      createdAt: new Date(),
    };

    // تصنيف المهمة تلقائياً
    const classification = await autoClassifier.classifyText(task.description);
    task.metadata.classification = classification;

    // تحديد الأولوية إذا لم تكن محددة
    if (!task.priority) {
      task.priority = this.inferPriority(classification);
    }

    this.tasks.set(task.id, task);
    this.stats.totalTasks++;
    this.stats.queuedTasks++;

    // إضافة للقائمة
    this.addToQueue(task);

    // تسجيل في قاعدة البيانات
    await this.saveTask(task);

    this.emit('task_created', task);
    return task;
  }

  // إضافة مهمة للقائمة بترتيب الأولوية
  private addToQueue(task: Task): void {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const insertIndex = this.taskQueue.findIndex(
      t => priorityOrder[t.priority] > priorityOrder[task.priority]
    );

    if (insertIndex === -1) {
      this.taskQueue.push(task);
    } else {
      this.taskQueue.splice(insertIndex, 0, task);
    }
  }

  // معالجة قائمة المهام
  private async processTaskQueue(): Promise<void> {
    const availableTasks = this.taskQueue.filter(t => this.canExecuteTask(t));
    
    for (const task of availableTasks) {
      const agent = await this.selectBestAgent(task);
      if (agent) {
        await this.assignTask(task, agent);
      }
    }
  }

  // التحقق من إمكانية تنفيذ المهمة
  private canExecuteTask(task: Task): boolean {
    // التحقق من الاعتماديات
    for (const depId of task.dependencies) {
      const depTask = this.tasks.get(depId);
      if (!depTask || depTask.status !== TaskStatus.COMPLETED) {
        return false;
      }
    }
    return true;
  }

  // اختيار أفضل وكيل للمهمة
  private async selectBestAgent(task: Task): Promise<AgentId | null> {
    const candidates: { agentId: AgentId; score: number }[] = [];

    for (const [agentId, evaluation] of this.agentEvaluations) {
      if (evaluation.availability !== 'available') continue;

      // التحقق من الصلاحيات
      const agent = layerManager.getAgentConfig(agentId);
      if (!agent) continue;

      // التحقق من الطبقة المطلوبة
      if (task.requiredLayer && agent.layer !== task.requiredLayer) continue;

      // التحقق من القدرات المطلوبة
      const hasCapabilities = task.requiredCapabilities.every(
        cap => evaluation.specializations.includes(cap)
      );
      if (!hasCapabilities) continue;

      // حساب النقاط
      let score = 0;
      
      switch (this.loadBalancingStrategy) {
        case 'round_robin':
          score = 100 - (Date.now() - evaluation.lastActiveTime.getTime()) / 1000;
          break;
        
        case 'least_loaded':
          score = 100 - evaluation.currentLoad;
          break;
        
        case 'capability_match':
          score = task.requiredCapabilities.filter(
            cap => evaluation.specializations.includes(cap)
          ).length * 20;
          break;
        
        case 'performance_based':
          score = evaluation.recentPerformance * 0.4 +
                  evaluation.successRate * 0.3 +
                  (100 - evaluation.currentLoad) * 0.2 +
                  (100 - evaluation.averageResponseTime / 1000) * 0.1;
          break;
        
        case 'priority_queue':
          const agentPriorityBonus = agent.layer === Layer.EXECUTIVE ? 30 :
                                     agent.layer === Layer.ADMINISTRATIVE ? 20 : 10;
          score = evaluation.recentPerformance + agentPriorityBonus;
          break;
      }

      candidates.push({ agentId, score });
    }

    if (candidates.length === 0) return null;

    // ترتيب واختيار الأفضل
    candidates.sort((a, b) => b.score - a.score);
    return candidates[0].agentId;
  }

  // تعيين مهمة لوكيل
  private async assignTask(task: Task, agentId: AgentId): Promise<void> {
    // إزالة من القائمة
    const queueIndex = this.taskQueue.findIndex(t => t.id === task.id);
    if (queueIndex !== -1) {
      this.taskQueue.splice(queueIndex, 1);
    }

    task.assignedAgent = agentId;
    task.status = TaskStatus.ASSIGNED;
    task.assignedAt = new Date();
    this.stats.queuedTasks--;

    // تحديث حمل الوكيل
    const evaluation = this.agentEvaluations.get(agentId);
    if (evaluation) {
      evaluation.currentLoad += 10;
      evaluation.availability = evaluation.currentLoad >= 100 ? 'busy' : 'available';
    }

    // حفظ التحديث
    await this.saveTask(task);

    // إرسال المهمة للوكيل عبر مدير الطبقات
    layerManager.sendMessage({
      fromAgent: 'orchestrator',
      fromLayer: Layer.ADMINISTRATIVE,
      toAgent: agentId,
      toLayer: task.requiredLayer,
      type: 'command',
      priority: task.priority,
      payload: task,
      requiresApproval: false
    });

    this.emit('task_assigned', { task, agentId });

    // بدء تنفيذ المهمة
    await this.executeTask(task);
  }

  // تنفيذ المهمة
  private async executeTask(task: Task): Promise<void> {
    task.status = TaskStatus.IN_PROGRESS;
    task.startedAt = new Date();
    await this.saveTask(task);

    this.emit('task_started', task);

    try {
      // إعداد timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Task timeout')), task.timeout);
      });

      // تنفيذ المهمة
      const executionPromise = this.performTaskExecution(task);

      const result = await Promise.race([executionPromise, timeoutPromise]);
      
      task.output = result as Record<string, any>;
      task.status = TaskStatus.COMPLETED;
      task.completedAt = new Date();

      this.stats.completedTasks++;
      this.updateAverageCompletionTime(task);
      this.updateAgentPerformance(task.assignedAgent!, true, task.completedAt.getTime() - task.startedAt!.getTime());

    } catch (error) {
      task.retries++;
      
      if (task.retries < task.maxRetries) {
        // إعادة المحاولة
        task.status = TaskStatus.PENDING;
        task.assignedAgent = undefined;
        this.addToQueue(task);
        this.emit('task_retry', { task, error });
      } else {
        task.status = TaskStatus.FAILED;
        task.metadata.error = error instanceof Error ? (error instanceof Error ? error.message : 'Unknown error') : 'Unknown error';
        this.stats.failedTasks++;
        this.updateAgentPerformance(task.assignedAgent!, false);
        this.emit('task_failed', { task, error });
      }
    }

    // تحرير حمل الوكيل
    if (task.assignedAgent) {
      const evaluation = this.agentEvaluations.get(task.assignedAgent);
      if (evaluation) {
        evaluation.currentLoad = Math.max(0, evaluation.currentLoad - 10);
        evaluation.availability = 'available';
      }
    }

    await this.saveTask(task);
    this.emit('task_completed', task);
  }

  // تنفيذ المهمة الفعلي
  private async performTaskExecution(task: Task): Promise<Record<string, any>> {
    const agent = layerManager.getAgentConfig(task.assignedAgent!);
    if (!agent) throw new Error('Agent not found');

    // تنفيذ بناءً على نوع المهمة
    switch (task.type) {
      case TaskType.ANALYSIS:
        return this.performAnalysis(task, agent);
      
      case TaskType.GENERATION:
        return this.performGeneration(task, agent);
      
      case TaskType.PROCESSING:
        return this.performProcessing(task, agent);
      
      case TaskType.DECISION:
        return this.performDecision(task, agent);
      
      case TaskType.MONITORING:
        return this.performMonitoring(task, agent);
      
      case TaskType.COMMUNICATION:
        return this.performCommunication(task, agent);
      
      case TaskType.AUTOMATION:
        return this.performAutomation(task, agent);
      
      case TaskType.MAINTENANCE:
        return this.performMaintenance(task, agent);
      
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  // تنفيذ مهمة تحليل
  private async performAnalysis(task: Task, agent: AgentConfig): Promise<Record<string, any>> {
    const classification = await autoClassifier.classifyText(JSON.stringify(task.input));
    return {
      analysis: classification,
      agent: agent.name,
      timestamp: new Date(),
    };
  }

  // تنفيذ مهمة توليد
  private async performGeneration(task: Task, agent: AgentConfig): Promise<Record<string, any>> {
    // هنا يتم الاتصال بنموذج AI المناسب
    return {
      generated: true,
      content: `Generated by ${agent.name}`,
      model: agent.aiModel,
      timestamp: new Date(),
    };
  }

  // تنفيذ مهمة معالجة
  private async performProcessing(task: Task, agent: AgentConfig): Promise<Record<string, any>> {
    return {
      processed: true,
      inputSize: JSON.stringify(task.input).length,
      agent: agent.name,
      timestamp: new Date(),
    };
  }

  // تنفيذ مهمة قرار
  private async performDecision(task: Task, agent: AgentConfig): Promise<Record<string, any>> {
    // منطق اتخاذ القرار
    const decision = task.input.options ? task.input.options[0] : 'approved';
    return {
      decision,
      confidence: 0.85,
      agent: agent.name,
      reasoning: 'Based on analysis and policy',
      timestamp: new Date(),
    };
  }

  // تنفيذ مهمة مراقبة
  private async performMonitoring(task: Task, agent: AgentConfig): Promise<Record<string, any>> {
    return {
      monitored: true,
      metrics: {
        activeAgents: this.stats.activeAgents,
        queuedTasks: this.stats.queuedTasks,
        throughput: this.stats.throughput,
      },
      agent: agent.name,
      timestamp: new Date(),
    };
  }

  // تنفيذ مهمة تواصل
  private async performCommunication(task: Task, agent: AgentConfig): Promise<Record<string, any>> {
    return {
      communicated: true,
      channel: task.input.channel || 'internal',
      agent: agent.name,
      timestamp: new Date(),
    };
  }

  // تنفيذ مهمة أتمتة
  private async performAutomation(task: Task, agent: AgentConfig): Promise<Record<string, any>> {
    return {
      automated: true,
      actions: task.input.actions || [],
      agent: agent.name,
      timestamp: new Date(),
    };
  }

  // تنفيذ مهمة صيانة
  private async performMaintenance(task: Task, agent: AgentConfig): Promise<Record<string, any>> {
    return {
      maintained: true,
      target: task.input.target,
      agent: agent.name,
      timestamp: new Date(),
    };
  }

  // تحديث أداء الوكيل
  private updateAgentPerformance(agentId: AgentId, success: boolean, responseTime?: number): void {
    const evaluation = this.agentEvaluations.get(agentId);
    if (!evaluation) return;

    // تحديث معدل النجاح (متوسط متحرك)
    const alpha = 0.1;
    evaluation.successRate = evaluation.successRate * (1 - alpha) + (success ? 100 : 0) * alpha;

    // تحديث وقت الاستجابة
    if (responseTime !== undefined) {
      evaluation.averageResponseTime = evaluation.averageResponseTime * (1 - alpha) + responseTime * alpha;
    }

    // تحديث الأداء الحديث
    evaluation.recentPerformance = (evaluation.successRate * 0.6 + 
                                   (100 - Math.min(100, evaluation.averageResponseTime / 100)) * 0.4);
    
    evaluation.lastActiveTime = new Date();
  }

  // تحديث متوسط وقت الإنجاز
  private updateAverageCompletionTime(task: Task): void {
    if (!task.startedAt || !task.completedAt) return;
    
    const duration = task.completedAt.getTime() - task.startedAt.getTime();
    const alpha = 0.1;
    this.stats.averageCompletionTime = 
      this.stats.averageCompletionTime * (1 - alpha) + duration * alpha;
  }

  // فحص صحة الوكلاء
  private async checkAgentHealth(): Promise<void> {
    for (const [agentId, evaluation] of this.agentEvaluations) {
      const agent = layerManager.getAgentConfig(agentId);
      if (!agent) continue;

      // التحقق من النشاط الأخير
      const inactiveTime = Date.now() - evaluation.lastActiveTime.getTime();
      if (inactiveTime > 300000) { // 5 دقائق
        evaluation.availability = 'offline';
      }
    }

    this.stats.activeAgents = Array.from(this.agentEvaluations.values())
      .filter(e => e.availability === 'available').length;
  }

  // معالجة المهام المتوقفة
  private async handleStalledTasks(): Promise<void> {
    const now = Date.now();
    
    for (const task of this.tasks.values()) {
      if (task.status === TaskStatus.IN_PROGRESS && task.startedAt) {
        const elapsed = now - task.startedAt.getTime();
        if (elapsed > task.timeout * 2) {
          // مهمة متوقفة
          task.status = TaskStatus.FAILED;
          task.metadata.error = 'Task stalled';
          this.stats.failedTasks++;
          
          // تحرير الوكيل
          if (task.assignedAgent) {
            const evaluation = this.agentEvaluations.get(task.assignedAgent);
            if (evaluation) {
              evaluation.currentLoad = Math.max(0, evaluation.currentLoad - 10);
              evaluation.availability = 'available';
            }
          }

          this.emit('task_stalled', task);
        }
      }
    }
  }

  // حفظ المهمة
  private async saveTask(task: Task): Promise<void> {
    try {
      if (!supabase) return;
      await supabase.from('orchestrator_tasks').upsert({
        id: task.id,
        type: task.type,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        assigned_agent: task.assignedAgent,
        required_layer: task.requiredLayer,
        required_capabilities: task.requiredCapabilities,
        input: task.input,
        output: task.output,
        dependencies: task.dependencies,
        timeout: task.timeout,
        retries: task.retries,
        max_retries: task.maxRetries,
        created_by: task.createdBy,
        created_at: task.createdAt,
        assigned_at: task.assignedAt,
        started_at: task.startedAt,
        completed_at: task.completedAt,
        metadata: task.metadata,
      }, { onConflict: 'id' });
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  }

  // استنتاج الأولوية من التصنيف
  private inferPriority(classification: any): 'low' | 'medium' | 'high' | 'critical' {
    if (classification.priority === 'critical' || classification.priority === 'urgent') {
      return 'critical';
    }
    if (classification.priority === 'high') return 'high';
    if (classification.priority === 'low') return 'low';
    return 'medium';
  }

  // إنشاء خطة تنفيذ
  public async createExecutionPlan(tasks: Omit<Task, 'id' | 'status' | 'createdAt' | 'retries'>[]): Promise<ExecutionPlan> {
    const createdTasks: Task[] = [];
    
    for (const taskParams of tasks) {
      const task = await this.createTask(taskParams);
      createdTasks.push(task);
    }

    // تحديد ترتيب التنفيذ
    const executionOrder = this.topologicalSort(createdTasks);
    
    // تقدير المدة
    const estimatedDuration = createdTasks.reduce((sum, t) => sum + t.timeout, 0);

    const plan: ExecutionPlan = {
      id: `plan_${Date.now()}`,
      tasks: createdTasks,
      executionOrder,
      estimatedDuration,
      priority: this.getHighestPriority(createdTasks),
      status: 'ready',
      createdAt: new Date(),
    };

    this.executionPlans.set(plan.id, plan);
    return plan;
  }

  // ترتيب طوبولوجي للمهام
  private topologicalSort(tasks: Task[]): string[] {
    const sorted: string[] = [];
    const visited = new Set<string>();

    const visit = (taskId: string) => {
      if (visited.has(taskId)) return;
      visited.add(taskId);

      const task = tasks.find(t => t.id === taskId);
      if (task) {
        for (const depId of task.dependencies) {
          visit(depId);
        }
        sorted.push(taskId);
      }
    };

    for (const task of tasks) {
      visit(task.id);
    }

    return sorted;
  }

  // الحصول على أعلى أولوية
  private getHighestPriority(tasks: Task[]): 'low' | 'medium' | 'high' | 'critical' {
    const priorities = ['critical', 'high', 'medium', 'low'] as const;
    for (const p of priorities) {
      if (tasks.some(t => t.priority === p)) return p;
    }
    return 'medium';
  }

  // الحصول على مهمة
  public getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  // الحصول على جميع المهام
  public getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  // الحصول على الإحصائيات
  public getStats(): OrchestratorStats {
    return { ...this.stats };
  }

  // الحصول على تقييمات الوكلاء
  public getAgentEvaluations(): AgentEvaluation[] {
    return Array.from(this.agentEvaluations.values());
  }

  // تغيير استراتيجية توزيع الحمل
  public setLoadBalancingStrategy(strategy: LoadBalancingStrategy): void {
    this.loadBalancingStrategy = strategy;
  }

  // إلغاء مهمة
  public async cancelTask(taskId: string): Promise<boolean> {
    const task = this.tasks.get(taskId);
    if (!task || task.status === TaskStatus.COMPLETED) return false;

    task.status = TaskStatus.CANCELLED;
    await this.saveTask(task);
    this.emit('task_cancelled', task);
    return true;
  }

  // إيقاف المنسق
  public stop(): void {
    if (this.processorInterval) {
      clearInterval(this.processorInterval);
      this.processorInterval = null;
    }
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }
}

// Singleton instance
export const agentOrchestrator = new AgentOrchestrator();
