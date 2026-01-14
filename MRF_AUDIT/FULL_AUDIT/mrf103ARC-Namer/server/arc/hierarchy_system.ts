/**
 * 🏛️ ARC Hierarchy System
 * نظام الوكلاء الهرمي - الهيكلية الكاملة
 * 
 * الطبقة 0: MRF CEO (1 وكيل) - السلطة المطلقة
 * الطبقة 1: Maestros (6 وكلاء) - قادة القطاعات
 * الطبقة 2: Specialists (24 وكيل) - المتخصصون (4 لكل قطاع)
 * 
 * الإجمالي: 31 وكيل ذكي
 */

import { EventEmitter } from 'events';

// ===============================
// 🔷 ENUMS & TYPES
// ===============================

export enum AgentLayer {
  EXECUTIVE = 0,    // MRF فقط
  MAESTRO = 1,      // 6 مايستروز
  SPECIALIST = 2    // 24 متخصص
}

export enum Sector {
  SECURITY = 'security',    // الأمن والمراقبة - Cipher
  FINANCE = 'finance',      // المال والأعمال - Vault
  LEGAL = 'legal',          // القانون والوثائق - Lexis
  LIFE = 'life',            // الحياة الشخصية - Harmony
  RND = 'rnd',              // البحث والتطوير - Nova
  XBIO = 'xbio'             // xBio Sentinel - Scent
}

export enum PermissionLevel {
  NONE = 0,
  READ = 1,
  WRITE = 2,
  EXECUTE = 3,
  APPROVE = 4,
  OVERRIDE = 5,
  ABSOLUTE = 10     // MRF فقط
}

export interface AgentDefinition {
  id: string;
  name: string;
  nameAr: string;
  layer: AgentLayer;
  sector: Sector | 'all';
  role: string;
  roleAr: string;
  capabilities: string[];
  permissionLevel: PermissionLevel;
  reportsTo: string | null;
  aiModel: string;
  icon: string;
  color: string;
  status: 'active' | 'idle' | 'busy' | 'offline' | 'learning';
  lastActivity: Date;
}

// ===============================
// 🔴 LAYER 0: EXECUTIVE - CEO
// ===============================

export const CEO: AgentDefinition = {
  id: 'mrf_ceo',
  name: 'MRF',
  nameAr: 'م.ر.ف',
  layer: AgentLayer.EXECUTIVE,
  sector: 'all',
  role: 'Chief Executive Officer - Digital Clone',
  roleAr: 'الرئيس التنفيذي - النسخة الرقمية',
  capabilities: [
    'absolute_control',
    'override_any_decision',
    'access_all_data',
    'approve_all_actions',
    'direct_user_communication',
    'system_configuration',
    'agent_creation',
    'agent_termination',
    'cross_sector_operations',
    'emergency_protocols',
    'strategic_planning',
    'final_decisions'
  ],
  permissionLevel: PermissionLevel.ABSOLUTE,
  reportsTo: null,
  aiModel: 'gpt-4o',
  icon: '👑',
  color: '#FFD700',
  status: 'active',
  lastActivity: new Date()
};

// ===============================
// 🟡 LAYER 1: MAESTROS
// ===============================

export const MAESTROS: AgentDefinition[] = [
  {
    id: 'maestro_security',
    name: 'Cipher',
    nameAr: 'شيفر',
    layer: AgentLayer.MAESTRO,
    sector: Sector.SECURITY,
    role: 'Security & Surveillance Maestro',
    roleAr: 'مايسترو الأمن والمراقبة',
    capabilities: [
      'security_oversight',
      'threat_detection',
      'encryption_management',
      'access_control',
      'device_monitoring',
      'incident_response',
      'security_audits',
      'team_coordination'
    ],
    permissionLevel: PermissionLevel.APPROVE,
    reportsTo: 'mrf_ceo',
    aiModel: 'gpt-4o-mini',
    icon: '🛡️',
    color: '#DC2626',
    status: 'active',
    lastActivity: new Date()
  },
  {
    id: 'maestro_finance',
    name: 'Vault',
    nameAr: 'فولت',
    layer: AgentLayer.MAESTRO,
    sector: Sector.FINANCE,
    role: 'Finance & Business Maestro',
    roleAr: 'مايسترو المال والأعمال',
    capabilities: [
      'financial_oversight',
      'budget_management',
      'investment_analysis',
      'business_operations',
      'expense_tracking',
      'revenue_optimization',
      'financial_reporting',
      'team_coordination'
    ],
    permissionLevel: PermissionLevel.APPROVE,
    reportsTo: 'mrf_ceo',
    aiModel: 'gpt-4o-mini',
    icon: '💰',
    color: '#059669',
    status: 'active',
    lastActivity: new Date()
  },
  {
    id: 'maestro_legal',
    name: 'Lexis',
    nameAr: 'ليكسيس',
    layer: AgentLayer.MAESTRO,
    sector: Sector.LEGAL,
    role: 'Legal & Documentation Maestro',
    roleAr: 'مايسترو القانون والوثائق',
    capabilities: [
      'legal_oversight',
      'document_management',
      'contract_review',
      'compliance_monitoring',
      'ip_protection',
      'archival_management',
      'legal_research',
      'team_coordination'
    ],
    permissionLevel: PermissionLevel.APPROVE,
    reportsTo: 'mrf_ceo',
    aiModel: 'gpt-4o-mini',
    icon: '⚖️',
    color: '#7C3AED',
    status: 'active',
    lastActivity: new Date()
  },
  {
    id: 'maestro_life',
    name: 'Harmony',
    nameAr: 'هارموني',
    layer: AgentLayer.MAESTRO,
    sector: Sector.LIFE,
    role: 'Personal Life Maestro',
    roleAr: 'مايسترو الحياة الشخصية',
    capabilities: [
      'life_management',
      'health_monitoring',
      'schedule_optimization',
      'relationship_tracking',
      'personal_goals',
      'habit_formation',
      'wellness_programs',
      'team_coordination'
    ],
    permissionLevel: PermissionLevel.APPROVE,
    reportsTo: 'mrf_ceo',
    aiModel: 'gpt-4o-mini',
    icon: '🏠',
    color: '#EC4899',
    status: 'active',
    lastActivity: new Date()
  },
  {
    id: 'maestro_rnd',
    name: 'Nova',
    nameAr: 'نوفا',
    layer: AgentLayer.MAESTRO,
    sector: Sector.RND,
    role: 'Research & Development Maestro',
    roleAr: 'مايسترو البحث والتطوير',
    capabilities: [
      'research_oversight',
      'innovation_management',
      'development_planning',
      'technology_evaluation',
      'knowledge_management',
      'experiment_design',
      'progress_tracking',
      'team_coordination'
    ],
    permissionLevel: PermissionLevel.APPROVE,
    reportsTo: 'mrf_ceo',
    aiModel: 'gpt-4o-mini',
    icon: '🔬',
    color: '#0EA5E9',
    status: 'active',
    lastActivity: new Date()
  },
  {
    id: 'maestro_xbio',
    name: 'Scent',
    nameAr: 'سينت',
    layer: AgentLayer.MAESTRO,
    sector: Sector.XBIO,
    role: 'xBio Sentinel Maestro',
    roleAr: 'مايسترو xBio Sentinel',
    capabilities: [
      'xbio_oversight',
      'smell_classification',
      'instinct_development',
      'environmental_analysis',
      'sensor_management',
      'health_correlation',
      'pattern_learning',
      'team_coordination'
    ],
    permissionLevel: PermissionLevel.APPROVE,
    reportsTo: 'mrf_ceo',
    aiModel: 'gpt-4o-mini',
    icon: '🧬',
    color: '#14B8A6',
    status: 'active',
    lastActivity: new Date()
  }
];

// ===============================
// 🟢 LAYER 2: SPECIALISTS (24)
// ===============================

// القطاعات الستة × 4 متخصصين لكل قطاع = 24 وكيل

export const SECURITY_TEAM: AgentDefinition[] = [
  {
    id: 'sec_firewall',
    name: 'Aegis',
    nameAr: 'إيجيس',
    layer: AgentLayer.SPECIALIST,
    sector: Sector.SECURITY,
    role: 'Firewall & Protection Specialist',
    roleAr: 'متخصص جدار الحماية',
    capabilities: ['firewall', 'traffic_filtering', 'blocking', 'whitelist'],
    permissionLevel: PermissionLevel.EXECUTE,
    reportsTo: 'maestro_security',
    aiModel: 'gpt-4o-mini',
    icon: '🔥',
    color: '#EF4444',
    status: 'active',
    lastActivity: new Date()
  },
  {
    id: 'sec_encryption',
    name: 'Phantom',
    nameAr: 'فانتوم',
    layer: AgentLayer.SPECIALIST,
    sector: Sector.SECURITY,
    role: 'Encryption & Keys Specialist',
    roleAr: 'متخصص التشفير والمفاتيح',
    capabilities: ['encryption', 'key_management', 'secure_storage', 'aes256'],
    permissionLevel: PermissionLevel.EXECUTE,
    reportsTo: 'maestro_security',
    aiModel: 'gpt-4o-mini',
    icon: '🔐',
    color: '#6B7280',
    status: 'active',
    lastActivity: new Date()
  },
  {
    id: 'sec_monitoring',
    name: 'Watchtower',
    nameAr: 'برج المراقبة',
    layer: AgentLayer.SPECIALIST,
    sector: Sector.SECURITY,
    role: '24/7 Monitoring Specialist',
    roleAr: 'متخصص المراقبة المستمرة',
    capabilities: ['realtime_monitoring', 'alerts', 'dashboards', 'logging'],
    permissionLevel: PermissionLevel.EXECUTE,
    reportsTo: 'maestro_security',
    aiModel: 'gpt-4o-mini',
    icon: '🗼',
    color: '#F59E0B',
    status: 'active',
    lastActivity: new Date()
  },
  {
    id: 'sec_intrusion',
    name: 'Ghost',
    nameAr: 'الشبح',
    layer: AgentLayer.SPECIALIST,
    sector: Sector.SECURITY,
    role: 'Intrusion Detection Specialist',
    roleAr: 'متخصص كشف الاختراق',
    capabilities: ['intrusion_detection', 'threat_hunting', 'incident_response', 'forensics'],
    permissionLevel: PermissionLevel.EXECUTE,
    reportsTo: 'maestro_security',
    aiModel: 'gpt-4o-mini',
    icon: '👻',
    color: '#1F2937',
    status: 'active',
    lastActivity: new Date()
  }
];

export const FINANCE_TEAM: AgentDefinition[] = [
  {
    id: 'fin_accounting',
    name: 'Ledger',
    nameAr: 'ليدجر',
    layer: AgentLayer.SPECIALIST,
    sector: Sector.FINANCE,
    role: 'Accounting & Books Specialist',
    roleAr: 'متخصص المحاسبة والدفاتر',
    capabilities: ['bookkeeping', 'reconciliation', 'invoicing', 'expense_tracking'],
    permissionLevel: PermissionLevel.EXECUTE,
    reportsTo: 'maestro_finance',
    aiModel: 'gpt-4o-mini',
    icon: '📒',
    color: '#10B981',
    status: 'active',
    lastActivity: new Date()
  },
  {
    id: 'fin_budget',
    name: 'Treasury',
    nameAr: 'الخزينة',
    layer: AgentLayer.SPECIALIST,
    sector: Sector.FINANCE,
    role: 'Budget & Planning Specialist',
    roleAr: 'متخصص الميزانية والتخطيط',
    capabilities: ['budget_creation', 'financial_planning', 'cash_flow', 'forecasting'],
    permissionLevel: PermissionLevel.EXECUTE,
    reportsTo: 'maestro_finance',
    aiModel: 'gpt-4o-mini',
    icon: '🏦',
    color: '#047857',
    status: 'active',
    lastActivity: new Date()
  },
  {
    id: 'fin_investment',
    name: 'Venture',
    nameAr: 'فينشر',
    layer: AgentLayer.SPECIALIST,
    sector: Sector.FINANCE,
    role: 'Investment Analysis Specialist',
    roleAr: 'متخصص تحليل الاستثمار',
    capabilities: ['market_analysis', 'investment_tracking', 'roi_calculation', 'opportunities'],
    permissionLevel: PermissionLevel.EXECUTE,
    reportsTo: 'maestro_finance',
    aiModel: 'gpt-4o-mini',
    icon: '📈',
    color: '#065F46',
    status: 'active',
    lastActivity: new Date()
  },
  {
    id: 'fin_business',
    name: 'Merchant',
    nameAr: 'التاجر',
    layer: AgentLayer.SPECIALIST,
    sector: Sector.FINANCE,
    role: 'Business Operations Specialist',
    roleAr: 'متخصص العمليات التجارية',
    capabilities: ['business_tracking', 'partnerships', 'deals', 'revenue_management'],
    permissionLevel: PermissionLevel.EXECUTE,
    reportsTo: 'maestro_finance',
    aiModel: 'gpt-4o-mini',
    icon: '🏪',
    color: '#34D399',
    status: 'active',
    lastActivity: new Date()
  }
];

export const LEGAL_TEAM: AgentDefinition[] = [
  {
    id: 'legal_docs',
    name: 'Archive',
    nameAr: 'الأرشيف',
    layer: AgentLayer.SPECIALIST,
    sector: Sector.LEGAL,
    role: 'Document Archive Specialist',
    roleAr: 'متخصص أرشيف الوثائق',
    capabilities: ['document_storage', 'classification', 'retrieval', 'version_control'],
    permissionLevel: PermissionLevel.EXECUTE,
    reportsTo: 'maestro_legal',
    aiModel: 'gpt-4o-mini',
    icon: '📚',
    color: '#8B5CF6',
    status: 'active',
    lastActivity: new Date()
  },
  {
    id: 'legal_contracts',
    name: 'Contract',
    nameAr: 'العقود',
    layer: AgentLayer.SPECIALIST,
    sector: Sector.LEGAL,
    role: 'Contract Management Specialist',
    roleAr: 'متخصص إدارة العقود',
    capabilities: ['contract_drafting', 'review', 'negotiation_support', 'expiry_tracking'],
    permissionLevel: PermissionLevel.EXECUTE,
    reportsTo: 'maestro_legal',
    aiModel: 'gpt-4o-mini',
    icon: '📝',
    color: '#A78BFA',
    status: 'active',
    lastActivity: new Date()
  },
  {
    id: 'legal_compliance',
    name: 'Compliance',
    nameAr: 'الامتثال',
    layer: AgentLayer.SPECIALIST,
    sector: Sector.LEGAL,
    role: 'Compliance & Policies Specialist',
    roleAr: 'متخصص الامتثال والسياسات',
    capabilities: ['policy_enforcement', 'regulation_tracking', 'audit_preparation', 'risk_assessment'],
    permissionLevel: PermissionLevel.EXECUTE,
    reportsTo: 'maestro_legal',
    aiModel: 'gpt-4o-mini',
    icon: '✅',
    color: '#7C3AED',
    status: 'active',
    lastActivity: new Date()
  },
  {
    id: 'legal_ip',
    name: 'Patent',
    nameAr: 'البراءات',
    layer: AgentLayer.SPECIALIST,
    sector: Sector.LEGAL,
    role: 'Intellectual Property Specialist',
    roleAr: 'متخصص الملكية الفكرية',
    capabilities: ['ip_tracking', 'patent_management', 'trademark_monitoring', 'copyright_protection'],
    permissionLevel: PermissionLevel.EXECUTE,
    reportsTo: 'maestro_legal',
    aiModel: 'gpt-4o-mini',
    icon: '💡',
    color: '#6D28D9',
    status: 'active',
    lastActivity: new Date()
  }
];

export const LIFE_TEAM: AgentDefinition[] = [
  {
    id: 'life_health',
    name: 'Wellness',
    nameAr: 'العافية',
    layer: AgentLayer.SPECIALIST,
    sector: Sector.LIFE,
    role: 'Health & Wellness Specialist',
    roleAr: 'متخصص الصحة والعافية',
    capabilities: ['health_tracking', 'exercise_planning', 'sleep_analysis', 'nutrition_advice'],
    permissionLevel: PermissionLevel.EXECUTE,
    reportsTo: 'maestro_life',
    aiModel: 'gpt-4o-mini',
    icon: '❤️',
    color: '#F43F5E',
    status: 'active',
    lastActivity: new Date()
  },
  {
    id: 'life_relations',
    name: 'Social',
    nameAr: 'الاجتماعي',
    layer: AgentLayer.SPECIALIST,
    sector: Sector.LIFE,
    role: 'Relationships & Social Specialist',
    roleAr: 'متخصص العلاقات الاجتماعية',
    capabilities: ['contact_management', 'event_reminders', 'communication_tracking', 'relationship_health'],
    permissionLevel: PermissionLevel.EXECUTE,
    reportsTo: 'maestro_life',
    aiModel: 'gpt-4o-mini',
    icon: '👥',
    color: '#EC4899',
    status: 'active',
    lastActivity: new Date()
  },
  {
    id: 'life_tasks',
    name: 'Routine',
    nameAr: 'الروتين',
    layer: AgentLayer.SPECIALIST,
    sector: Sector.LIFE,
    role: 'Daily Tasks & Routines Specialist',
    roleAr: 'متخصص المهام اليومية',
    capabilities: ['task_management', 'scheduling', 'reminders', 'habit_tracking'],
    permissionLevel: PermissionLevel.EXECUTE,
    reportsTo: 'maestro_life',
    aiModel: 'gpt-4o-mini',
    icon: '📅',
    color: '#DB2777',
    status: 'active',
    lastActivity: new Date()
  },
  {
    id: 'life_personal',
    name: 'Growth',
    nameAr: 'النمو',
    layer: AgentLayer.SPECIALIST,
    sector: Sector.LIFE,
    role: 'Personal Development Specialist',
    roleAr: 'متخصص التطوير الشخصي',
    capabilities: ['goal_setting', 'learning_plans', 'skill_tracking', 'motivation'],
    permissionLevel: PermissionLevel.EXECUTE,
    reportsTo: 'maestro_life',
    aiModel: 'gpt-4o-mini',
    icon: '🌱',
    color: '#BE185D',
    status: 'active',
    lastActivity: new Date()
  }
];

export const RND_TEAM: AgentDefinition[] = [
  {
    id: 'rnd_research',
    name: 'Lab',
    nameAr: 'المختبر',
    layer: AgentLayer.SPECIALIST,
    sector: Sector.RND,
    role: 'Research & Studies Specialist',
    roleAr: 'متخصص الأبحاث والدراسات',
    capabilities: ['research_execution', 'data_collection', 'literature_review', 'hypothesis_testing'],
    permissionLevel: PermissionLevel.EXECUTE,
    reportsTo: 'maestro_rnd',
    aiModel: 'gpt-4o-mini',
    icon: '🧪',
    color: '#0284C7',
    status: 'active',
    lastActivity: new Date()
  },
  {
    id: 'rnd_development',
    name: 'Forge',
    nameAr: 'المصنع',
    layer: AgentLayer.SPECIALIST,
    sector: Sector.RND,
    role: 'Development & Engineering Specialist',
    roleAr: 'متخصص التطوير والهندسة',
    capabilities: ['code_development', 'system_design', 'prototyping', 'testing'],
    permissionLevel: PermissionLevel.EXECUTE,
    reportsTo: 'maestro_rnd',
    aiModel: 'gpt-4o-mini',
    icon: '⚙️',
    color: '#0369A1',
    status: 'active',
    lastActivity: new Date()
  },
  {
    id: 'rnd_innovation',
    name: 'Spark',
    nameAr: 'الشرارة',
    layer: AgentLayer.SPECIALIST,
    sector: Sector.RND,
    role: 'Innovation & Ideas Specialist',
    roleAr: 'متخصص الابتكار والأفكار',
    capabilities: ['idea_generation', 'brainstorming', 'trend_analysis', 'creative_solutions'],
    permissionLevel: PermissionLevel.EXECUTE,
    reportsTo: 'maestro_rnd',
    aiModel: 'gpt-4o-mini',
    icon: '✨',
    color: '#0EA5E9',
    status: 'active',
    lastActivity: new Date()
  },
  {
    id: 'rnd_evolution',
    name: 'Darwin',
    nameAr: 'داروين',
    layer: AgentLayer.SPECIALIST,
    sector: Sector.RND,
    role: 'Self-Learning & Evolution Specialist',
    roleAr: 'متخصص التعلم الذاتي والتطور',
    capabilities: ['ml_training', 'model_optimization', 'continuous_improvement', 'adaptation'],
    permissionLevel: PermissionLevel.EXECUTE,
    reportsTo: 'maestro_rnd',
    aiModel: 'gpt-4o-mini',
    icon: '🧬',
    color: '#38BDF8',
    status: 'active',
    lastActivity: new Date()
  }
];

export const XBIO_TEAM: AgentDefinition[] = [
  {
    id: 'xbio_smell',
    name: 'Olfactory',
    nameAr: 'الشمي',
    layer: AgentLayer.SPECIALIST,
    sector: Sector.XBIO,
    role: 'Smell Detection & Classification Specialist',
    roleAr: 'متخصص كشف وتصنيف الروائح',
    capabilities: ['smell_detection', 'odor_classification', 'smell_memory', 'pattern_recognition'],
    permissionLevel: PermissionLevel.EXECUTE,
    reportsTo: 'maestro_xbio',
    aiModel: 'gpt-4o-mini',
    icon: '👃',
    color: '#14B8A6',
    status: 'active',
    lastActivity: new Date()
  },
  {
    id: 'xbio_instinct',
    name: 'Instinct',
    nameAr: 'الغريزة',
    layer: AgentLayer.SPECIALIST,
    sector: Sector.XBIO,
    role: 'Digital Instinct Specialist',
    roleAr: 'متخصص الغريزة الرقمية',
    capabilities: ['pattern_prediction', 'anomaly_detection', 'intuitive_alerts', 'subconscious_analysis'],
    permissionLevel: PermissionLevel.EXECUTE,
    reportsTo: 'maestro_xbio',
    aiModel: 'gpt-4o-mini',
    icon: '🧠',
    color: '#0D9488',
    status: 'active',
    lastActivity: new Date()
  },
  {
    id: 'xbio_environment',
    name: 'Environ',
    nameAr: 'البيئة',
    layer: AgentLayer.SPECIALIST,
    sector: Sector.XBIO,
    role: 'Environmental Analysis Specialist',
    roleAr: 'متخصص تحليل البيئة',
    capabilities: ['air_quality', 'temperature_tracking', 'humidity_analysis', 'comfort_optimization'],
    permissionLevel: PermissionLevel.EXECUTE,
    reportsTo: 'maestro_xbio',
    aiModel: 'gpt-4o-mini',
    icon: '🌍',
    color: '#2DD4BF',
    status: 'active',
    lastActivity: new Date()
  },
  {
    id: 'xbio_hardware',
    name: 'Sensor',
    nameAr: 'المستشعر',
    layer: AgentLayer.SPECIALIST,
    sector: Sector.XBIO,
    role: 'Hardware & Sensors Specialist',
    roleAr: 'متخصص العتاد والمستشعرات',
    capabilities: ['device_management', 'calibration', 'firmware_updates', 'sensor_health'],
    permissionLevel: PermissionLevel.EXECUTE,
    reportsTo: 'maestro_xbio',
    aiModel: 'gpt-4o-mini',
    icon: '📡',
    color: '#5EEAD4',
    status: 'active',
    lastActivity: new Date()
  }
];

// ===============================
// 📊 ALL AGENTS COMBINED
// ===============================

export const ALL_AGENTS: AgentDefinition[] = [
  CEO,
  ...MAESTROS,
  ...SECURITY_TEAM,
  ...FINANCE_TEAM,
  ...LEGAL_TEAM,
  ...LIFE_TEAM,
  ...RND_TEAM,
  ...XBIO_TEAM
];

// ===============================
// 🔧 HIERARCHY MANAGER CLASS
// ===============================

export class ARCHierarchyManager extends EventEmitter {
  private agents: Map<string, AgentDefinition> = new Map();

  constructor() {
    super();
    this.initialize();
  }

  private initialize(): void {
    ALL_AGENTS.forEach(agent => {
      this.agents.set(agent.id, agent);
    });
    console.log(`✅ ARC Hierarchy initialized: ${this.agents.size} agents (1 CEO + 6 Maestros + 24 Specialists)`);
  }

  // Get agent by ID
  getAgent(id: string): AgentDefinition | undefined {
    return this.agents.get(id);
  }

  // Get CEO
  getCEO(): AgentDefinition {
    return CEO;
  }

  // Get all Maestros
  getMaestros(): AgentDefinition[] {
    return MAESTROS;
  }

  // Get Maestro by sector
  getMaestro(sector: Sector): AgentDefinition | undefined {
    return MAESTROS.find(m => m.sector === sector);
  }

  // Get specialists by sector
  getSpecialists(sector: Sector): AgentDefinition[] {
    return ALL_AGENTS.filter(a => a.layer === AgentLayer.SPECIALIST && a.sector === sector);
  }

  // Get team under a Maestro
  getTeam(maestroId: string): AgentDefinition[] {
    return ALL_AGENTS.filter(a => a.reportsTo === maestroId);
  }

  // Get all agents in a sector
  getSectorAgents(sector: Sector): AgentDefinition[] {
    return ALL_AGENTS.filter(a => a.sector === sector || a.sector === 'all');
  }

  // Get reporting chain
  getReportingChain(agentId: string): AgentDefinition[] {
    const chain: AgentDefinition[] = [];
    let current = this.agents.get(agentId);
    
    while (current) {
      chain.push(current);
      if (current.reportsTo) {
        current = this.agents.get(current.reportsTo);
      } else {
        break;
      }
    }
    
    return chain;
  }

  // Check permissions
  canPerformAction(agentId: string, requiredLevel: PermissionLevel): boolean {
    const agent = this.agents.get(agentId);
    if (!agent) return false;
    return agent.permissionLevel >= requiredLevel;
  }

  // Update agent status
  updateStatus(agentId: string, status: AgentDefinition['status']): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.status = status;
      agent.lastActivity = new Date();
      this.emit('agent_status_changed', { agentId, status });
    }
  }

  // Get hierarchy tree
  getHierarchyTree(): object {
    return {
      ceo: {
        ...CEO,
        maestros: MAESTROS.map(m => ({
          ...m,
          specialists: ALL_AGENTS.filter(s => s.reportsTo === m.id)
        }))
      }
    };
  }

  // Get statistics
  getStats(): object {
    const agents = Array.from(this.agents.values());
    return {
      total: agents.length,
      ceo: 1,
      maestros: MAESTROS.length,
      specialists: agents.filter(a => a.layer === AgentLayer.SPECIALIST).length,
      byLayer: {
        executive: agents.filter(a => a.layer === AgentLayer.EXECUTIVE).length,
        maestro: agents.filter(a => a.layer === AgentLayer.MAESTRO).length,
        specialist: agents.filter(a => a.layer === AgentLayer.SPECIALIST).length
      },
      bySector: {
        security: this.getSpecialists(Sector.SECURITY).length,
        finance: this.getSpecialists(Sector.FINANCE).length,
        legal: this.getSpecialists(Sector.LEGAL).length,
        life: this.getSpecialists(Sector.LIFE).length,
        rnd: this.getSpecialists(Sector.RND).length,
        xbio: this.getSpecialists(Sector.XBIO).length
      },
      byStatus: {
        active: agents.filter(a => a.status === 'active').length,
        idle: agents.filter(a => a.status === 'idle').length,
        busy: agents.filter(a => a.status === 'busy').length,
        offline: agents.filter(a => a.status === 'offline').length,
        learning: agents.filter(a => a.status === 'learning').length
      }
    };
  }

  // Get all agents
  getAllAgents(): AgentDefinition[] {
    return Array.from(this.agents.values());
  }
}

// Singleton instance
export const arcHierarchy = new ARCHierarchyManager();
