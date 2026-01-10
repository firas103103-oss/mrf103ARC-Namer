/**
 * 📦 Self Archiver - نظام الأرشفة الذاتية التلقائي
 * 
 * يقوم بأرشفة البيانات تلقائياً بناءً على سياسات محددة
 * مع دعم التشفير والضغط والتنظيف التلقائي
 */

import { supabase } from '../supabase';
import { EventEmitter } from 'events';
import * as crypto from 'crypto';

// واجهة سياسة الأرشفة
export interface ArchivePolicy {
  id: string;
  name: string;
  entityType: string;
  tableName: string;
  retentionDays: number;
  archiveCondition: ArchiveCondition;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  priority: 'low' | 'medium' | 'high';
  schedule: ArchiveSchedule;
  enabled: boolean;
  lastRun?: Date;
  createdAt: Date;
}

// شرط الأرشفة
export interface ArchiveCondition {
  field: string;
  operator: 'older_than' | 'equals' | 'in' | 'status' | 'custom';
  value: any;
  additionalFilters?: Record<string, any>;
}

// جدولة الأرشفة
export interface ArchiveSchedule {
  type: 'daily' | 'weekly' | 'monthly' | 'manual';
  time?: string; // HH:MM
  dayOfWeek?: number; // 0-6
  dayOfMonth?: number; // 1-31
}

// واجهة الأرشيف
export interface Archive {
  id: string;
  policyId: string;
  entityType: string;
  recordsCount: number;
  originalSize: number;
  compressedSize: number;
  checksum: string;
  encryptionKeyId?: string;
  storagePath: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  metadata: Record<string, any>;
  expiresAt?: Date;
  createdAt: Date;
}

// سجل الأرشفة
export interface ArchiveLog {
  id: string;
  policyId: string;
  archiveId?: string;
  action: 'start' | 'progress' | 'complete' | 'error' | 'cleanup';
  recordsProcessed: number;
  message: string;
  duration?: number;
  createdAt: Date;
}

// السياسات الافتراضية
const DEFAULT_POLICIES: Omit<ArchivePolicy, 'id' | 'createdAt'>[] = [
  {
    name: 'Archive Old Logs',
    entityType: 'logs',
    tableName: 'action_log',
    retentionDays: 30,
    archiveCondition: {
      field: 'created_at',
      operator: 'older_than',
      value: 30,
    },
    compressionEnabled: true,
    encryptionEnabled: false,
    priority: 'medium',
    schedule: { type: 'daily', time: '02:00' },
    enabled: true,
  },
  {
    name: 'Archive Completed Tasks',
    entityType: 'tasks',
    tableName: 'team_tasks',
    retentionDays: 90,
    archiveCondition: {
      field: 'status',
      operator: 'equals',
      value: 'completed',
      additionalFilters: { created_at: { older_than: 30 } },
    },
    compressionEnabled: true,
    encryptionEnabled: false,
    priority: 'low',
    schedule: { type: 'weekly', dayOfWeek: 0, time: '03:00' },
    enabled: true,
  },
  {
    name: 'Archive Old Conversations',
    entityType: 'conversations',
    tableName: 'conversations',
    retentionDays: 180,
    archiveCondition: {
      field: 'updated_at',
      operator: 'older_than',
      value: 90,
    },
    compressionEnabled: true,
    encryptionEnabled: true,
    priority: 'high',
    schedule: { type: 'monthly', dayOfMonth: 1, time: '04:00' },
    enabled: true,
  },
  {
    name: 'Archive Sensor Data',
    entityType: 'sensor_data',
    tableName: 'sensor_data_stream',
    retentionDays: 365,
    archiveCondition: {
      field: 'recorded_at',
      operator: 'older_than',
      value: 7, // أرشفة البيانات الأقدم من أسبوع
    },
    compressionEnabled: true,
    encryptionEnabled: false,
    priority: 'high',
    schedule: { type: 'daily', time: '01:00' },
    enabled: true,
  },
  {
    name: 'Archive Agent Events',
    entityType: 'agent_events',
    tableName: 'agent_events',
    retentionDays: 60,
    archiveCondition: {
      field: 'timestamp',
      operator: 'older_than',
      value: 14,
    },
    compressionEnabled: true,
    encryptionEnabled: false,
    priority: 'medium',
    schedule: { type: 'weekly', dayOfWeek: 6, time: '02:30' },
    enabled: true,
  },
];

// 📦 Self Archiver Class
export class SelfArchiver extends EventEmitter {
  private policies: Map<string, ArchivePolicy> = new Map();
  private archives: Map<string, Archive> = new Map();
  private schedulerInterval: NodeJS.Timeout | null = null;
  private isProcessing: boolean = false;

  constructor() {
    super();
    this.initializePolicies();
    this.startScheduler();
  }

  // تهيئة السياسات
  private async initializePolicies(): Promise<void> {
    // تحميل السياسات من قاعدة البيانات
    try {
      if (!supabase) {
        // استخدام السياسات الافتراضية
        for (const policy of DEFAULT_POLICIES) {
          const id = `policy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          this.policies.set(id, {
            ...policy,
            id,
            createdAt: new Date(),
          });
        }
        return;
      }
      const { data } = await supabase
        .from('archive_policies')
        .select('*')
        .eq('enabled', true);

      if (data && data.length > 0) {
        for (const policy of data) {
          this.policies.set(policy.id, this.mapDbPolicy(policy));
        }
      } else {
        // استخدام السياسات الافتراضية
        for (const policy of DEFAULT_POLICIES) {
          const id = `policy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          this.policies.set(id, {
            ...policy,
            id,
            createdAt: new Date(),
          });
        }
      }

      console.log(`✅ SelfArchiver: Initialized ${this.policies.size} archive policies`);
    } catch (error) {
      console.error('Failed to load archive policies:', error);
    }
  }

  // تحويل سياسة من قاعدة البيانات
  private mapDbPolicy(dbPolicy: any): ArchivePolicy {
    return {
      id: dbPolicy.id,
      name: dbPolicy.name,
      entityType: dbPolicy.entity_type,
      tableName: dbPolicy.table_name,
      retentionDays: dbPolicy.retention_days,
      archiveCondition: dbPolicy.archive_condition,
      compressionEnabled: dbPolicy.compression_enabled,
      encryptionEnabled: dbPolicy.encryption_enabled,
      priority: dbPolicy.priority,
      schedule: dbPolicy.schedule,
      enabled: dbPolicy.enabled,
      lastRun: dbPolicy.last_run ? new Date(dbPolicy.last_run) : undefined,
      createdAt: new Date(dbPolicy.created_at),
    };
  }

  // بدء الجدولة
  private startScheduler(): void {
    // فحص كل دقيقة
    this.schedulerInterval = setInterval(() => {
      this.checkScheduledArchives();
    }, 60000);

    console.log('✅ SelfArchiver: Scheduler started');
  }

  // فحص الأرشفات المجدولة
  private async checkScheduledArchives(): Promise<void> {
    if (this.isProcessing) return;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDayOfWeek = now.getDay();
    const currentDayOfMonth = now.getDate();

    for (const [id, policy] of Array.from(this.policies)) {
      if (!policy.enabled) continue;
      if (!this.shouldRunPolicy(policy, now, currentHour, currentMinute, currentDayOfWeek, currentDayOfMonth)) {
        continue;
      }

      await this.runArchivePolicy(id);
    }
  }

  // التحقق مما إذا كان يجب تشغيل السياسة
  private shouldRunPolicy(
    policy: ArchivePolicy,
    now: Date,
    hour: number,
    minute: number,
    dayOfWeek: number,
    dayOfMonth: number
  ): boolean {
    const schedule = policy.schedule;
    const [scheduleHour, scheduleMinute] = (schedule.time || '00:00').split(':').map(Number);

    // التحقق من الوقت (مع نافذة 5 دقائق)
    if (Math.abs(hour * 60 + minute - (scheduleHour * 60 + scheduleMinute)) > 5) {
      return false;
    }

    // التحقق من آخر تشغيل
    if (policy.lastRun) {
      const hoursSinceLastRun = (now.getTime() - policy.lastRun.getTime()) / (1000 * 60 * 60);
      
      switch (schedule.type) {
        case 'daily':
          if (hoursSinceLastRun < 23) return false;
          break;
        case 'weekly':
          if (hoursSinceLastRun < 167 || dayOfWeek !== schedule.dayOfWeek) return false;
          break;
        case 'monthly':
          if (hoursSinceLastRun < 719 || dayOfMonth !== schedule.dayOfMonth) return false;
          break;
        case 'manual':
          return false;
      }
    }

    return true;
  }

  // === PUBLIC API ===

  // تشغيل سياسة أرشفة
  public async runArchivePolicy(policyId: string): Promise<Archive | null> {
    const policy = this.policies.get(policyId);
    if (!policy) {
      console.error(`Policy ${policyId} not found`);
      return null;
    }

    this.isProcessing = true;
    const startTime = Date.now();

    const archive: Archive = {
      id: `archive_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      policyId,
      entityType: policy.entityType,
      recordsCount: 0,
      originalSize: 0,
      compressedSize: 0,
      checksum: '',
      storagePath: '',
      status: 'pending',
      metadata: {},
      expiresAt: new Date(Date.now() + policy.retentionDays * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    };

    this.archives.set(archive.id, archive);
    this.emit('archive_started', { policy, archive });
    await this.logArchiveAction(policyId, archive.id, 'start', 0, 'Archive process started');

    try {
      archive.status = 'processing';

      // 1. جلب البيانات المطلوب أرشفتها
      const records = await this.fetchRecordsToArchive(policy);
      archive.recordsCount = records.length;

      if (records.length === 0) {
        archive.status = 'completed';
        archive.metadata.message = 'No records to archive';
        await this.logArchiveAction(policyId, archive.id, 'complete', 0, 'No records to archive');
        this.isProcessing = false;
        return archive;
      }

      // 2. حساب الحجم الأصلي
      const dataString = JSON.stringify(records);
      archive.originalSize = Buffer.byteLength(dataString, 'utf8');

      // 3. ضغط البيانات (اختياري)
      let processedData = dataString;
      if (policy.compressionEnabled) {
        const zlib = await import('zlib');
        processedData = zlib.gzipSync(dataString).toString('base64');
        archive.compressedSize = Buffer.byteLength(processedData, 'utf8');
      } else {
        archive.compressedSize = archive.originalSize;
      }

      // 4. تشفير البيانات (اختياري)
      if (policy.encryptionEnabled) {
        const { encrypted, keyId } = this.encryptData(processedData);
        processedData = encrypted;
        archive.encryptionKeyId = keyId;
      }

      // 5. حساب checksum
      archive.checksum = crypto.createHash('sha256').update(processedData).digest('hex');

      // 6. حفظ الأرشيف
      archive.storagePath = `archives/${policy.entityType}/${archive.id}.arc`;
      await this.saveArchive(archive, processedData);

      // 7. حذف البيانات الأصلية (نقلها للأرشيف)
      await this.deleteArchivedRecords(policy, records);

      // 8. تحديث الحالة
      archive.status = 'completed';
      policy.lastRun = new Date();

      const duration = Date.now() - startTime;
      await this.logArchiveAction(policyId, archive.id, 'complete', records.length, 
        `Archived ${records.length} records in ${duration}ms`, duration);

      this.emit('archive_completed', { policy, archive, duration });

    } catch (error) {
      archive.status = 'failed';
      archive.metadata.error = error instanceof Error ? (error instanceof Error ? error.message : 'Unknown error') : 'Unknown error';
      await this.logArchiveAction(policyId, archive.id, 'error', 0, `Archive failed: ${archive.metadata.error}`);
      this.emit('archive_failed', { policy, archive, error });
    }

    this.isProcessing = false;
    return archive;
  }

  // جلب السجلات للأرشفة
  private async fetchRecordsToArchive(policy: ArchivePolicy): Promise<any[]> {
    if (!supabase) return [];
    const condition = policy.archiveCondition;
    let query = supabase.from(policy.tableName).select('*');

    switch (condition.operator) {
      case 'older_than':
        const cutoffDate = new Date(Date.now() - condition.value * 24 * 60 * 60 * 1000);
        query = query.lt(condition.field, cutoffDate.toISOString());
        break;
      case 'equals':
        query = query.eq(condition.field, condition.value);
        break;
      case 'in':
        query = query.in(condition.field, condition.value);
        break;
      case 'status':
        query = query.eq('status', condition.value);
        break;
    }

    // تطبيق الفلاتر الإضافية
    if (condition.additionalFilters) {
      for (const [field, filter] of Object.entries(condition.additionalFilters)) {
        if (typeof filter === 'object' && filter.older_than) {
          const date = new Date(Date.now() - filter.older_than * 24 * 60 * 60 * 1000);
          query = query.lt(field, date.toISOString());
        }
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  // تشفير البيانات
  private encryptData(data: string): { encrypted: string; keyId: string } {
    const keyId = `key_${Date.now()}`;
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    const authTag = cipher.getAuthTag();
    
    // في الإنتاج، يجب تخزين المفتاح بشكل آمن (Vault, KMS, etc.)
    // هنا نخزنه في قاعدة البيانات للتوضيح
    if (supabase) {
      supabase.from('archive_encryption_keys').insert({
        id: keyId,
        key: key.toString('base64'),
        iv: iv.toString('base64'),
        auth_tag: authTag.toString('base64'),
        created_at: new Date(),
      });
    }

    return { 
      encrypted: `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`,
      keyId 
    };
  }

  // حفظ الأرشيف
  private async saveArchive(archive: Archive, data: string): Promise<void> {
    if (!supabase) return;
    // حفظ metadata في قاعدة البيانات
    await supabase.from('arc_archives').insert({
      id: archive.id,
      policy_id: archive.policyId,
      entity_type: archive.entityType,
      records_count: archive.recordsCount,
      original_size: archive.originalSize,
      compressed_size: archive.compressedSize,
      checksum: archive.checksum,
      encryption_key_id: archive.encryptionKeyId,
      storage_path: archive.storagePath,
      status: archive.status,
      metadata: archive.metadata,
      expires_at: archive.expiresAt,
      created_at: archive.createdAt,
    });

    // حفظ البيانات الفعلية (يمكن استخدام Supabase Storage أو S3)
    await supabase.storage
      .from('archives')
      .upload(archive.storagePath, data, {
        contentType: 'application/octet-stream',
        upsert: true,
      });
  }

  // حذف السجلات المؤرشفة
  private async deleteArchivedRecords(policy: ArchivePolicy, records: any[]): Promise<void> {
    const ids = records.map(r => r.id);
    
    if (!supabase) return;
    // حذف على دفعات
    const batchSize = 100;
    for (let i = 0; i < ids.length; i += batchSize) {
      const batch = ids.slice(i, i + batchSize);
      await supabase
        .from(policy.tableName)
        .delete()
        .in('id', batch);
    }
  }

  // تسجيل إجراء الأرشفة
  private async logArchiveAction(
    policyId: string,
    archiveId: string | undefined,
    action: ArchiveLog['action'],
    recordsProcessed: number,
    message: string,
    duration?: number
  ): Promise<void> {
    try {
      if (!supabase) return;
      await supabase.from('archive_logs').insert({
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        policy_id: policyId,
        archive_id: archiveId,
        action,
        records_processed: recordsProcessed,
        message,
        duration,
        created_at: new Date(),
      });
    } catch (error) {
      console.error('Failed to log archive action:', error);
    }
  }

  // تنظيف الأرشيفات منتهية الصلاحية
  public async cleanupExpiredArchives(): Promise<number> {
    if (!supabase) return 0;
    const { data, error } = await supabase
      .from('arc_archives')
      .select('id, storage_path')
      .lt('expires_at', new Date().toISOString());

    if (error || !data) return 0;

    let deletedCount = 0;
    for (const archive of data) {
      try {
        // حذف الملف
        await supabase.storage.from('archives').remove([archive.storage_path]);
        
        // حذف السجل
        await supabase.from('arc_archives').delete().eq('id', archive.id);
        
        deletedCount++;
      } catch (err) {
        console.error(`Failed to cleanup archive ${archive.id}:`, err);
      }
    }

    if (deletedCount > 0) {
      this.emit('cleanup_completed', { deletedCount });
      console.log(`✅ SelfArchiver: Cleaned up ${deletedCount} expired archives`);
    }

    return deletedCount;
  }

  // إضافة سياسة جديدة
  public addPolicy(policy: Omit<ArchivePolicy, 'id' | 'createdAt'>): ArchivePolicy {
    const id = `policy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullPolicy: ArchivePolicy = {
      ...policy,
      id,
      createdAt: new Date(),
    };
    this.policies.set(id, fullPolicy);
    this.emit('policy_added', fullPolicy);
    return fullPolicy;
  }

  // الحصول على جميع السياسات
  public getPolicies(): ArchivePolicy[] {
    return Array.from(this.policies.values());
  }

  // الحصول على جميع الأرشيفات
  public getArchives(): Archive[] {
    return Array.from(this.archives.values());
  }

  // إيقاف الجدولة
  public stop(): void {
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }
  }
}

// Singleton instance
export const selfArchiver = new SelfArchiver();
