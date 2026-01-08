/**
 * 🔄 Sync Engine - محرك المزامنة بين الوكلاء
 * 
 * يدير المزامنة الفورية بين جميع الوكلاء في الطبقات المختلفة
 * مع دعم الحالة الموزعة والاتساق النهائي
 */

import { supabase } from '../supabase';
/* eslint-disable no-undef */
import { EventEmitter } from 'events';
import { Layer, Agent, AgentId, LayerMessage, layerManager } from './layer_manager';

// أنواع المزامنة
export enum SyncType {
  FULL = 'full',              // مزامنة كاملة
  INCREMENTAL = 'incremental', // مزامنة تزايدية
  DELTA = 'delta',            // فقط التغييرات
  SELECTIVE = 'selective',    // مزامنة انتقائية
}

// حالة المزامنة
export enum SyncStatus {
  IDLE = 'idle',
  SYNCING = 'syncing',
  CONFLICT = 'conflict',
  FAILED = 'failed',
  SUCCESS = 'success',
}

// واجهة حالة الوكيل
export interface AgentState {
  agentId: AgentId;
  layer: Layer;
  version: number;
  data: Record<string, any>;
  lastModified: Date;
  checksum: string;
}

// واجهة طلب المزامنة
export interface SyncRequest {
  id: string;
  sourceAgentId: AgentId;
  targetAgentId?: AgentId; // إذا كان null، المزامنة لجميع الوكلاء
  syncType: SyncType;
  priority: 'low' | 'medium' | 'high' | 'critical';
  data?: Record<string, any>;
  filters?: SyncFilter[];
  createdAt: Date;
}

// فلتر المزامنة
export interface SyncFilter {
  field: string;
  operator: 'equals' | 'contains' | 'in' | 'newer_than';
  value: any;
}

// نتيجة المزامنة
export interface SyncResult {
  requestId: string;
  status: SyncStatus;
  syncedAgents: AgentId[];
  conflicts: SyncConflict[];
  recordsSynced: number;
  duration: number;
  completedAt: Date;
}

// تعارض المزامنة
export interface SyncConflict {
  agentId: AgentId;
  field: string;
  localValue: any;
  remoteValue: any;
  resolution?: 'local_wins' | 'remote_wins' | 'merge' | 'manual';
  resolvedValue?: any;
}

// إحصائيات المزامنة
export interface SyncStats {
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  conflictsResolved: number;
  averageDuration: number;
  lastSyncTime?: Date;
}

// 🔄 Sync Engine Class
export class SyncEngine extends EventEmitter {
  private agentStates: Map<AgentId, AgentState> = new Map();
  private syncQueue: SyncRequest[] = [];
  private syncStats: SyncStats = {
    totalSyncs: 0,
    successfulSyncs: 0,
    failedSyncs: 0,
    conflictsResolved: 0,
    averageDuration: 0,
  };
  private isSyncing: boolean = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private conflictResolutionStrategies: Map<string, (conflict: SyncConflict) => any> = new Map();

  constructor() {
    super();
    this.initializeAgentStates();
    this.setupRealtimeSync();
    this.startSyncProcessor();
    this.registerConflictStrategies();
  }

  // تهيئة حالات الوكلاء
  private async initializeAgentStates(): Promise<void> {
    const agents = layerManager.getAllAgents();
    
    for (const agent of agents) {
      this.agentStates.set(agent.id, {
        agentId: agent.id,
        layer: agent.layer,
        version: 1,
        data: {
          capabilities: agent.capabilities,
          status: agent.status,
          lastActive: agent.lastActivity,
        },
        lastModified: new Date(),
        checksum: this.calculateChecksum(agent),
      });
    }

    // تحميل الحالات المحفوظة
    try {
      if (!supabase) return;
      const { data } = await supabase
        .from('agent_sync_states')
        .select('*');

      if (data) {
        for (const state of data) {
          const agentId = state.agent_id as AgentId;
          if (this.agentStates.has(agentId)) {
            const existing = this.agentStates.get(agentId)!;
            if (state.version > existing.version) {
              this.agentStates.set(agentId, {
                agentId,
                layer: state.layer,
                version: state.version,
                data: state.data,
                lastModified: new Date(state.last_modified),
                checksum: state.checksum,
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to load agent states:', error);
    }

    console.log(`✅ SyncEngine: Initialized ${this.agentStates.size} agent states`);
  }

  // إعداد المزامنة الفورية
  private setupRealtimeSync(): void {
    if (!supabase) return;
    // الاستماع لتغييرات الوكلاء في الوقت الفعلي
    supabase
      .channel('agent_sync')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'agent_events',
      }, (payload) => {
        this.handleRealtimeChange(payload);
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'layer_messages',
      }, (payload) => {
        this.handleLayerMessage(payload);
      })
      .subscribe();

    // الاستماع لأحداث مدير الطبقات
    layerManager.on('message_processed', (message: LayerMessage) => {
      this.queueSync({
        id: `sync_${Date.now()}`,
        sourceAgentId: message.fromAgent,
        targetAgentId: message.toAgent || undefined,
        syncType: SyncType.DELTA,
        priority: 'medium',
        data: { message },
        createdAt: new Date(),
      });
    });

    console.log('✅ SyncEngine: Realtime sync enabled');
  }

  // معالجة التغييرات الفورية
  private async handleRealtimeChange(payload: any): Promise<void> {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    this.emit('realtime_change', { eventType, newRecord, oldRecord });

    // تحديث حالة الوكيل إذا كان التغيير متعلقاً بوكيل
    if (newRecord?.agent_id) {
      const agentId = newRecord.agent_id as AgentId;
      await this.updateAgentState(agentId, {
        lastEvent: newRecord,
        eventType,
      });
    }
  }

  // معالجة رسائل الطبقات
  private async handleLayerMessage(payload: any): Promise<void> {
    const { new: message } = payload;
    if (!message) return;

    // مزامنة سريعة للرسائل عالية الأولوية
    if (message.priority === 'critical') {
      await this.processSyncNow({
        id: `sync_critical_${Date.now()}`,
        sourceAgentId: message.from_agent,
        targetAgentId: message.to_agent,
        syncType: SyncType.DELTA,
        priority: 'critical',
        data: message,
        createdAt: new Date(),
      });
    }
  }

  // بدء معالج المزامنة
  private startSyncProcessor(): void {
    this.syncInterval = setInterval(async () => {
      if (this.isSyncing || this.syncQueue.length === 0) return;
      await this.processSyncQueue();
    }, 1000); // كل ثانية

    console.log('✅ SyncEngine: Sync processor started');
  }

  // تسجيل استراتيجيات حل التعارضات
  private registerConflictStrategies(): void {
    // استراتيجية: الأحدث يفوز
    this.conflictResolutionStrategies.set('newest_wins', (conflict) => {
      return conflict.localValue > conflict.remoteValue ? conflict.localValue : conflict.remoteValue;
    });

    // استراتيجية: الدمج
    this.conflictResolutionStrategies.set('merge', (conflict) => {
      if (typeof conflict.localValue === 'object' && typeof conflict.remoteValue === 'object') {
        return { ...conflict.remoteValue, ...conflict.localValue };
      }
      return conflict.localValue; // الافتراضي: المحلي يفوز
    });

    // استراتيجية: المحلي يفوز
    this.conflictResolutionStrategies.set('local_wins', (conflict) => conflict.localValue);

    // استراتيجية: البعيد يفوز
    this.conflictResolutionStrategies.set('remote_wins', (conflict) => conflict.remoteValue);
  }

  // === PUBLIC API ===

  // إضافة طلب مزامنة للقائمة
  public queueSync(request: SyncRequest): void {
    // ترتيب حسب الأولوية
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const insertIndex = this.syncQueue.findIndex(
      r => priorityOrder[r.priority] > priorityOrder[request.priority]
    );

    if (insertIndex === -1) {
      this.syncQueue.push(request);
    } else {
      this.syncQueue.splice(insertIndex, 0, request);
    }

    this.emit('sync_queued', request);
  }

  // معالجة قائمة المزامنة
  public async processSyncQueue(): Promise<SyncResult[]> {
    if (this.isSyncing) return [];
    
    this.isSyncing = true;
    const results: SyncResult[] = [];

    while (this.syncQueue.length > 0) {
      const request = this.syncQueue.shift()!;
      const result = await this.processSyncNow(request);
      results.push(result);
    }

    this.isSyncing = false;
    return results;
  }

  // معالجة مزامنة فورية
  public async processSyncNow(request: SyncRequest): Promise<SyncResult> {
    const startTime = Date.now();
    this.syncStats.totalSyncs++;

    const result: SyncResult = {
      requestId: request.id,
      status: SyncStatus.SYNCING,
      syncedAgents: [],
      conflicts: [],
      recordsSynced: 0,
      duration: 0,
      completedAt: new Date(),
    };

    this.emit('sync_started', request);

    try {
      // تحديد الوكلاء المستهدفين
      const targetAgents = request.targetAgentId
        ? [request.targetAgentId]
        : Array.from(this.agentStates.keys()).filter(id => id !== request.sourceAgentId);

      // الحصول على حالة المصدر
      const sourceState = this.agentStates.get(request.sourceAgentId);
      if (!sourceState) {
        throw new Error(`Source agent ${request.sourceAgentId} not found`);
      }

      // مزامنة كل وكيل مستهدف
      for (const targetId of targetAgents) {
        const targetState = this.agentStates.get(targetId);
        if (!targetState) continue;

        // التحقق من الطبقة (المزامنة مسموحة فقط بين طبقات معينة)
        if (!this.canSync(sourceState.layer, targetState.layer)) {
          continue;
        }

        // تطبيق المزامنة
        const syncResult = await this.syncAgentPair(sourceState, targetState, request);
        
        if (syncResult.success) {
          result.syncedAgents.push(targetId);
          result.recordsSynced += syncResult.recordsSynced;
        }
        
        if (syncResult.conflicts.length > 0) {
          result.conflicts.push(...syncResult.conflicts);
        }
      }

      // حل التعارضات
      if (result.conflicts.length > 0) {
        await this.resolveConflicts(result.conflicts);
        this.syncStats.conflictsResolved += result.conflicts.length;
      }

      result.status = result.conflicts.some(c => !c.resolution) 
        ? SyncStatus.CONFLICT 
        : SyncStatus.SUCCESS;

      this.syncStats.successfulSyncs++;

    } catch (error) {
      result.status = SyncStatus.FAILED;
      this.syncStats.failedSyncs++;
      this.emit('sync_failed', { request, error });
    }

    result.duration = Date.now() - startTime;
    result.completedAt = new Date();
    this.syncStats.lastSyncTime = new Date();
    this.updateAverageDuration(result.duration);

    // تسجيل في قاعدة البيانات
    await this.logSyncResult(result);

    this.emit('sync_completed', result);
    return result;
  }

  // مزامنة زوج من الوكلاء
  private async syncAgentPair(
    source: AgentState,
    target: AgentState,
    request: SyncRequest
  ): Promise<{ success: boolean; recordsSynced: number; conflicts: SyncConflict[] }> {
    const conflicts: SyncConflict[] = [];
    let recordsSynced = 0;

    switch (request.syncType) {
      case SyncType.FULL:
        // مزامنة كاملة - نسخ كل البيانات
        const mergedData = { ...target.data, ...source.data };
        await this.updateAgentState(target.agentId, mergedData);
        recordsSynced = Object.keys(source.data).length;
        break;

      case SyncType.DELTA:
        // مزامنة التغييرات فقط
        for (const [key, value] of Object.entries(request.data || {})) {
          if (target.data[key] !== value) {
            if (target.data[key] !== undefined && source.lastModified <= target.lastModified) {
              // تعارض محتمل
              conflicts.push({
                agentId: target.agentId,
                field: key,
                localValue: target.data[key],
                remoteValue: value,
              });
            } else {
              await this.updateAgentState(target.agentId, { [key]: value });
              recordsSynced++;
            }
          }
        }
        break;

      case SyncType.INCREMENTAL:
        // مزامنة تزايدية - فقط البيانات الجديدة
        if (source.version > target.version) {
          const diff = this.calculateDiff(target.data, source.data);
          await this.updateAgentState(target.agentId, diff);
          recordsSynced = Object.keys(diff).length;
        }
        break;

      case SyncType.SELECTIVE:
        // مزامنة انتقائية بناءً على الفلاتر
        if (request.filters) {
          const filteredData = this.applyFilters(source.data, request.filters);
          await this.updateAgentState(target.agentId, filteredData);
          recordsSynced = Object.keys(filteredData).length;
        }
        break;
    }

    return { success: true, recordsSynced, conflicts };
  }

  // التحقق من إمكانية المزامنة بين الطبقات
  private canSync(sourceLayer: Layer, targetLayer: Layer): boolean {
    // قواعد المزامنة بين الطبقات
    const syncRules: Record<Layer, Layer[]> = {
      [Layer.EXECUTIVE]: [Layer.EXECUTIVE, Layer.ADMINISTRATIVE],
      [Layer.ADMINISTRATIVE]: [Layer.EXECUTIVE, Layer.ADMINISTRATIVE, Layer.PRODUCTIVE],
      [Layer.PRODUCTIVE]: [Layer.ADMINISTRATIVE, Layer.PRODUCTIVE],
    };

    return syncRules[sourceLayer]?.includes(targetLayer) || false;
  }

  // تحديث حالة وكيل
  public async updateAgentState(agentId: AgentId, updates: Record<string, any>): Promise<void> {
    const state = this.agentStates.get(agentId);
    if (!state) return;

    state.data = { ...state.data, ...updates };
    state.version++;
    state.lastModified = new Date();
    state.checksum = this.calculateChecksum(state);

    this.agentStates.set(agentId, state);

    // حفظ في قاعدة البيانات
    try {
      if (!supabase) return;
      await supabase.from('agent_sync_states').upsert({
        agent_id: agentId,
        layer: state.layer,
        version: state.version,
        data: state.data,
        checksum: state.checksum,
        last_modified: state.lastModified,
        updated_at: new Date(),
      }, { onConflict: 'agent_id' });
    } catch (error) {
      console.error(`Failed to save agent state for ${agentId}:`, error);
    }

    this.emit('state_updated', { agentId, state });
  }

  // حل التعارضات
  private async resolveConflicts(conflicts: SyncConflict[]): Promise<void> {
    for (const conflict of conflicts) {
      // استخدام الاستراتيجية الافتراضية (الأحدث يفوز)
      const strategy = this.conflictResolutionStrategies.get('newest_wins')!;
      conflict.resolvedValue = strategy(conflict);
      conflict.resolution = 'merge';

      // تطبيق الحل
      await this.updateAgentState(conflict.agentId, {
        [conflict.field]: conflict.resolvedValue,
      });
    }
  }

  // تطبيق الفلاتر
  private applyFilters(data: Record<string, any>, filters: SyncFilter[]): Record<string, any> {
    const filtered = { ...data };

    for (const filter of filters) {
      switch (filter.operator) {
        case 'equals':
          if (data[filter.field] !== filter.value) {
            delete filtered[filter.field];
          }
          break;
        case 'contains':
          if (!String(data[filter.field]).includes(filter.value)) {
            delete filtered[filter.field];
          }
          break;
        case 'in':
          if (!filter.value.includes(data[filter.field])) {
            delete filtered[filter.field];
          }
          break;
      }
    }

    return filtered;
  }

  // حساب الفرق بين حالتين
  private calculateDiff(oldData: Record<string, any>, newData: Record<string, any>): Record<string, any> {
    const diff: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(newData)) {
      if (JSON.stringify(oldData[key]) !== JSON.stringify(value)) {
        diff[key] = value;
      }
    }

    return diff;
  }

  // حساب checksum
  private calculateChecksum(data: any): string {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
  }

  // تحديث متوسط المدة
  private updateAverageDuration(newDuration: number): void {
    const total = this.syncStats.averageDuration * (this.syncStats.totalSyncs - 1);
    this.syncStats.averageDuration = (total + newDuration) / this.syncStats.totalSyncs;
  }

  // تسجيل نتيجة المزامنة
  private async logSyncResult(result: SyncResult): Promise<void> {
    try {
      if (!supabase) return;
      await supabase.from('sync_logs').insert({
        request_id: result.requestId,
        status: result.status,
        synced_agents: result.syncedAgents,
        conflicts_count: result.conflicts.length,
        records_synced: result.recordsSynced,
        duration: result.duration,
        completed_at: result.completedAt,
      });
    } catch (error) {
      console.error('Failed to log sync result:', error);
    }
  }

  // مزامنة فورية لجميع الوكلاء
  public async syncAll(): Promise<SyncResult> {
    const request: SyncRequest = {
      id: `sync_all_${Date.now()}`,
      sourceAgentId: 'orchestrator' as AgentId,
      syncType: SyncType.FULL,
      priority: 'high',
      createdAt: new Date(),
    };

    return this.processSyncNow(request);
  }

  // الحصول على حالة وكيل
  public getAgentState(agentId: AgentId): AgentState | undefined {
    return this.agentStates.get(agentId);
  }

  // الحصول على جميع الحالات
  public getAllStates(): AgentState[] {
    return Array.from(this.agentStates.values());
  }

  // الحصول على الإحصائيات
  public getStats(): SyncStats {
    return { ...this.syncStats };
  }

  // الحصول على طول القائمة
  public getQueueLength(): number {
    return this.syncQueue.length;
  }

  // إيقاف المحرك
  public stop(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}

// Singleton instance
export const syncEngine = new SyncEngine();
