/**
 * 🔐 Permission Matrix - مصفوفة الصلاحيات المتقدمة
 * 
 * نظام إدارة الصلاحيات والوصول للموارد بناءً على الطبقات والأدوار
 */

import { Layer, PermissionLevel, Agent } from './layer_manager';

// تعريف أنواع الموارد
export enum ResourceType {
  // بيانات
  AGENTS = 'agents',
  USERS = 'users',
  CONVERSATIONS = 'conversations',
  TASKS = 'tasks',
  ARCHIVES = 'archives',
  
  // إعدادات
  SETTINGS = 'settings',
  INTEGRATIONS = 'integrations',
  
  // حوكمة
  GOVERNANCE = 'governance',
  APPROVALS = 'approvals',
  AUDIT_LOGS = 'audit_logs',
  
  // تحليلات
  ANALYTICS = 'analytics',
  METRICS = 'metrics',
  REPORTS = 'reports',
  
  // IoT
  IOT_DEVICES = 'iot_devices',
  SENSOR_DATA = 'sensor_data',
  
  // نظام
  SYSTEM_CONFIG = 'system_config',
  DEPLOYMENTS = 'deployments',
  BACKUPS = 'backups',
}

// تعريف العمليات
export enum Operation {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  EXECUTE = 'execute',
  APPROVE = 'approve',
  SHARE = 'share',
  EXPORT = 'export',
}

// واجهة قاعدة الصلاحيات
export interface PermissionRule {
  resource: ResourceType;
  operation: Operation;
  layers: Layer[];
  agents?: string[]; // وكلاء محددين (اختياري)
  conditions?: PermissionCondition[];
}

// شروط الصلاحيات
export interface PermissionCondition {
  type: 'time' | 'owner' | 'status' | 'priority' | 'custom';
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'in' | 'between';
  value: any;
}

// نتيجة فحص الصلاحية
export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  requiredApproval?: boolean;
  approvers?: string[];
}

// مصفوفة الصلاحيات الافتراضية
export const PERMISSION_MATRIX: PermissionRule[] = [
  // === وكلاء ===
  { resource: ResourceType.AGENTS, operation: Operation.READ, layers: [Layer.EXECUTIVE, Layer.ADMINISTRATIVE, Layer.PRODUCTIVE] },
  { resource: ResourceType.AGENTS, operation: Operation.CREATE, layers: [Layer.EXECUTIVE] },
  { resource: ResourceType.AGENTS, operation: Operation.UPDATE, layers: [Layer.EXECUTIVE, Layer.ADMINISTRATIVE] },
  { resource: ResourceType.AGENTS, operation: Operation.DELETE, layers: [Layer.EXECUTIVE] },
  { resource: ResourceType.AGENTS, operation: Operation.EXECUTE, layers: [Layer.EXECUTIVE, Layer.ADMINISTRATIVE, Layer.PRODUCTIVE] },
  
  // === مستخدمين ===
  { resource: ResourceType.USERS, operation: Operation.READ, layers: [Layer.EXECUTIVE, Layer.ADMINISTRATIVE] },
  { resource: ResourceType.USERS, operation: Operation.CREATE, layers: [Layer.EXECUTIVE] },
  { resource: ResourceType.USERS, operation: Operation.UPDATE, layers: [Layer.EXECUTIVE] },
  { resource: ResourceType.USERS, operation: Operation.DELETE, layers: [Layer.EXECUTIVE] },
  
  // === محادثات ===
  { resource: ResourceType.CONVERSATIONS, operation: Operation.READ, layers: [Layer.EXECUTIVE, Layer.ADMINISTRATIVE, Layer.PRODUCTIVE] },
  { resource: ResourceType.CONVERSATIONS, operation: Operation.CREATE, layers: [Layer.EXECUTIVE, Layer.ADMINISTRATIVE, Layer.PRODUCTIVE] },
  { resource: ResourceType.CONVERSATIONS, operation: Operation.DELETE, layers: [Layer.EXECUTIVE] },
  
  // === مهام ===
  { resource: ResourceType.TASKS, operation: Operation.READ, layers: [Layer.EXECUTIVE, Layer.ADMINISTRATIVE, Layer.PRODUCTIVE] },
  { resource: ResourceType.TASKS, operation: Operation.CREATE, layers: [Layer.EXECUTIVE, Layer.ADMINISTRATIVE] },
  { resource: ResourceType.TASKS, operation: Operation.UPDATE, layers: [Layer.EXECUTIVE, Layer.ADMINISTRATIVE, Layer.PRODUCTIVE] },
  { resource: ResourceType.TASKS, operation: Operation.EXECUTE, layers: [Layer.PRODUCTIVE] },
  { resource: ResourceType.TASKS, operation: Operation.APPROVE, layers: [Layer.EXECUTIVE] },
  
  // === أرشيف ===
  { resource: ResourceType.ARCHIVES, operation: Operation.READ, layers: [Layer.EXECUTIVE, Layer.ADMINISTRATIVE, Layer.PRODUCTIVE] },
  { resource: ResourceType.ARCHIVES, operation: Operation.CREATE, layers: [Layer.EXECUTIVE, Layer.ADMINISTRATIVE] },
  { resource: ResourceType.ARCHIVES, operation: Operation.DELETE, layers: [Layer.EXECUTIVE] },
  { resource: ResourceType.ARCHIVES, operation: Operation.EXPORT, layers: [Layer.EXECUTIVE] },
  
  // === إعدادات ===
  { resource: ResourceType.SETTINGS, operation: Operation.READ, layers: [Layer.EXECUTIVE, Layer.ADMINISTRATIVE] },
  { resource: ResourceType.SETTINGS, operation: Operation.UPDATE, layers: [Layer.EXECUTIVE] },
  
  // === تكاملات ===
  { resource: ResourceType.INTEGRATIONS, operation: Operation.READ, layers: [Layer.EXECUTIVE, Layer.ADMINISTRATIVE, Layer.PRODUCTIVE] },
  { resource: ResourceType.INTEGRATIONS, operation: Operation.CREATE, layers: [Layer.EXECUTIVE, Layer.ADMINISTRATIVE] },
  { resource: ResourceType.INTEGRATIONS, operation: Operation.UPDATE, layers: [Layer.EXECUTIVE, Layer.ADMINISTRATIVE] },
  { resource: ResourceType.INTEGRATIONS, operation: Operation.DELETE, layers: [Layer.EXECUTIVE] },
  { resource: ResourceType.INTEGRATIONS, operation: Operation.EXECUTE, layers: [Layer.EXECUTIVE, Layer.ADMINISTRATIVE, Layer.PRODUCTIVE] },
  
  // === حوكمة ===
  { resource: ResourceType.GOVERNANCE, operation: Operation.READ, layers: [Layer.EXECUTIVE, Layer.ADMINISTRATIVE] },
  { resource: ResourceType.GOVERNANCE, operation: Operation.UPDATE, layers: [Layer.EXECUTIVE] },
  { resource: ResourceType.APPROVALS, operation: Operation.CREATE, layers: [Layer.EXECUTIVE, Layer.ADMINISTRATIVE] },
  { resource: ResourceType.APPROVALS, operation: Operation.APPROVE, layers: [Layer.EXECUTIVE] },
  { resource: ResourceType.AUDIT_LOGS, operation: Operation.READ, layers: [Layer.EXECUTIVE, Layer.ADMINISTRATIVE], agents: ['sentinel', 'guardian'] },
  
  // === تحليلات ===
  { resource: ResourceType.ANALYTICS, operation: Operation.READ, layers: [Layer.EXECUTIVE, Layer.ADMINISTRATIVE, Layer.PRODUCTIVE] },
  { resource: ResourceType.METRICS, operation: Operation.READ, layers: [Layer.EXECUTIVE, Layer.ADMINISTRATIVE, Layer.PRODUCTIVE] },
  { resource: ResourceType.REPORTS, operation: Operation.CREATE, layers: [Layer.EXECUTIVE, Layer.ADMINISTRATIVE] },
  { resource: ResourceType.REPORTS, operation: Operation.EXPORT, layers: [Layer.EXECUTIVE] },
  
  // === IoT ===
  { resource: ResourceType.IOT_DEVICES, operation: Operation.READ, layers: [Layer.EXECUTIVE, Layer.ADMINISTRATIVE, Layer.PRODUCTIVE] },
  { resource: ResourceType.IOT_DEVICES, operation: Operation.CREATE, layers: [Layer.EXECUTIVE, Layer.ADMINISTRATIVE] },
  { resource: ResourceType.IOT_DEVICES, operation: Operation.UPDATE, layers: [Layer.EXECUTIVE, Layer.ADMINISTRATIVE] },
  { resource: ResourceType.SENSOR_DATA, operation: Operation.READ, layers: [Layer.EXECUTIVE, Layer.ADMINISTRATIVE, Layer.PRODUCTIVE] },
  { resource: ResourceType.SENSOR_DATA, operation: Operation.CREATE, layers: [Layer.PRODUCTIVE] },
  
  // === نظام ===
  { resource: ResourceType.SYSTEM_CONFIG, operation: Operation.READ, layers: [Layer.EXECUTIVE] },
  { resource: ResourceType.SYSTEM_CONFIG, operation: Operation.UPDATE, layers: [Layer.EXECUTIVE] },
  { resource: ResourceType.DEPLOYMENTS, operation: Operation.READ, layers: [Layer.EXECUTIVE, Layer.ADMINISTRATIVE] },
  { resource: ResourceType.DEPLOYMENTS, operation: Operation.EXECUTE, layers: [Layer.EXECUTIVE], agents: ['devopsbot'] },
  { resource: ResourceType.BACKUPS, operation: Operation.CREATE, layers: [Layer.EXECUTIVE, Layer.ADMINISTRATIVE], agents: ['phoenix'] },
  { resource: ResourceType.BACKUPS, operation: Operation.READ, layers: [Layer.EXECUTIVE] },
];

// 🔐 Permission Matrix Manager
export class PermissionMatrix {
  private rules: PermissionRule[];
  private customRules: PermissionRule[] = [];

  constructor(rules: PermissionRule[] = PERMISSION_MATRIX) {
    this.rules = rules;
  }

  // إضافة قاعدة مخصصة
  public addRule(rule: PermissionRule): void {
    this.customRules.push(rule);
  }

  // فحص الصلاحية
  public checkPermission(
    agent: Agent,
    resource: ResourceType,
    operation: Operation,
    context?: Record<string, any>
  ): PermissionCheckResult {
    // دمج القواعد
    const allRules = [...this.rules, ...this.customRules];

    // البحث عن قاعدة مطابقة
    const matchingRule = allRules.find(
      rule => rule.resource === resource && rule.operation === operation
    );

    if (!matchingRule) {
      return { allowed: false, reason: 'No permission rule found for this operation' };
    }

    // التحقق من الطبقة
    if (!matchingRule.layers.includes(agent.layer)) {
      // التحقق مما إذا كان يتطلب موافقة
      if (agent.layer === Layer.ADMINISTRATIVE && matchingRule.layers.includes(Layer.EXECUTIVE)) {
        return {
          allowed: false,
          requiredApproval: true,
          approvers: this.getApprovers(resource),
          reason: 'Operation requires executive approval'
        };
      }
      return { allowed: false, reason: `Layer ${agent.layer} not authorized for this operation` };
    }

    // التحقق من الوكلاء المحددين
    if (matchingRule.agents && matchingRule.agents.length > 0) {
      if (!matchingRule.agents.includes(agent.id)) {
        return { allowed: false, reason: `Agent ${agent.id} not specifically authorized` };
      }
    }

    // التحقق من الشروط
    if (matchingRule.conditions && context) {
      for (const condition of matchingRule.conditions) {
        if (!this.evaluateCondition(condition, context)) {
          return { allowed: false, reason: `Condition ${condition.type} not met` };
        }
      }
    }

    return { allowed: true };
  }

  // تقييم شرط
  private evaluateCondition(condition: PermissionCondition, context: Record<string, any>): boolean {
    const contextValue = context[condition.type];
    
    switch (condition.operator) {
      case 'eq':
        return contextValue === condition.value;
      case 'ne':
        return contextValue !== condition.value;
      case 'gt':
        return contextValue > condition.value;
      case 'lt':
        return contextValue < condition.value;
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(contextValue);
      case 'between':
        return Array.isArray(condition.value) && 
               contextValue >= condition.value[0] && 
               contextValue <= condition.value[1];
      default:
        return false;
    }
  }

  // الحصول على الموافقين للمورد
  private getApprovers(resource: ResourceType): string[] {
    // الوكلاء التنفيذيين هم الموافقون الافتراضيون
    return ['mrf', 'genius', 'oracle'];
  }

  // الحصول على جميع العمليات المسموحة لوكيل على مورد
  public getAllowedOperations(agent: Agent, resource: ResourceType): Operation[] {
    const allowed: Operation[] = [];
    const operations = Object.values(Operation);

    for (const op of operations) {
      const result = this.checkPermission(agent, resource, op);
      if (result.allowed) {
        allowed.push(op);
      }
    }

    return allowed;
  }

  // الحصول على جميع الموارد المتاحة لوكيل
  public getAccessibleResources(agent: Agent): Record<ResourceType, Operation[]> {
    const result: Partial<Record<ResourceType, Operation[]>> = {};
    const resources = Object.values(ResourceType);

    for (const resource of resources) {
      const allowedOps = this.getAllowedOperations(agent, resource);
      if (allowedOps.length > 0) {
        result[resource] = allowedOps;
      }
    }

    return result as Record<ResourceType, Operation[]>;
  }

  // إنشاء تقرير صلاحيات
  public generatePermissionReport(): {
    byLayer: Record<Layer, { resources: number; operations: number }>;
    byResource: Record<ResourceType, { layers: Layer[]; operations: Operation[] }>;
  } {
    const byLayer: Record<Layer, { resources: number; operations: number }> = {
      [Layer.EXECUTIVE]: { resources: 0, operations: 0 },
      [Layer.ADMINISTRATIVE]: { resources: 0, operations: 0 },
      [Layer.PRODUCTIVE]: { resources: 0, operations: 0 },
    };

    const byResource: Partial<Record<ResourceType, { layers: Layer[]; operations: Operation[] }>> = {};

    for (const rule of this.rules) {
      // By Layer
      for (const layer of rule.layers) {
        byLayer[layer].operations++;
      }

      // By Resource
      if (!byResource[rule.resource]) {
        byResource[rule.resource] = { layers: [], operations: [] };
      }
      
      for (const layer of rule.layers) {
        if (!byResource[rule.resource]!.layers.includes(layer)) {
          byResource[rule.resource]!.layers.push(layer);
        }
      }
      
      if (!byResource[rule.resource]!.operations.includes(rule.operation)) {
        byResource[rule.resource]!.operations.push(rule.operation);
      }
    }

    // Count unique resources per layer
    for (const layer of Object.values(Layer)) {
      const resources = new Set(
        this.rules.filter(r => r.layers.includes(layer)).map(r => r.resource)
      );
      byLayer[layer].resources = resources.size;
    }

    return {
      byLayer,
      byResource: byResource as Record<ResourceType, { layers: Layer[]; operations: Operation[] }>
    };
  }
}

// Singleton instance
export const permissionMatrix = new PermissionMatrix();
