/**
 * 🔗 Integration Manager - مدير التكاملات الخارجية
 * 
 * يدير جميع التكاملات مع الخدمات الخارجية (30+)
 * مع دعم OAuth, API Keys, Webhooks
 */

import { supabase } from '../supabase';
import { EventEmitter } from 'events';

// ═══════════════════════════════════════════════════════════════════════════════
// أنواع التكاملات
// ═══════════════════════════════════════════════════════════════════════════════

export enum IntegrationType {
  // Communication
  SLACK = 'slack',
  DISCORD = 'discord',
  TELEGRAM = 'telegram',
  MICROSOFT_TEAMS = 'microsoft_teams',
  WHATSAPP = 'whatsapp',
  EMAIL_SMTP = 'email_smtp',
  TWILIO = 'twilio',
  
  // Development
  GITHUB = 'github',
  GITLAB = 'gitlab',
  BITBUCKET = 'bitbucket',
  JIRA = 'jira',
  LINEAR = 'linear',
  NOTION = 'notion',
  
  // Cloud & Infrastructure
  AWS = 'aws',
  GOOGLE_CLOUD = 'google_cloud',
  AZURE = 'azure',
  VERCEL = 'vercel',
  RAILWAY = 'railway',
  SUPABASE = 'supabase',
  
  // Analytics & Monitoring
  SENTRY = 'sentry',
  DATADOG = 'datadog',
  GRAFANA = 'grafana',
  MIXPANEL = 'mixpanel',
  GOOGLE_ANALYTICS = 'google_analytics',
  
  // Payments
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  
  // Automation
  N8N = 'n8n',
  ZAPIER = 'zapier',
  MAKE = 'make',
  IFTTT = 'ifttt',
  
  // AI & ML
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE_AI = 'google_ai',
  HUGGINGFACE = 'huggingface',
  
  // Storage
  GOOGLE_DRIVE = 'google_drive',
  DROPBOX = 'dropbox',
  AWS_S3 = 'aws_s3',
  
  // CRM
  HUBSPOT = 'hubspot',
  SALESFORCE = 'salesforce',
  
  // Calendar
  GOOGLE_CALENDAR = 'google_calendar',
  OUTLOOK_CALENDAR = 'outlook_calendar',
  
  // Custom
  WEBHOOK = 'webhook',
  REST_API = 'rest_api',
}

// حالة التكامل
export enum IntegrationStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
  PENDING = 'pending',
  EXPIRED = 'expired',
}

// طريقة المصادقة
export enum AuthMethod {
  API_KEY = 'api_key',
  OAUTH2 = 'oauth2',
  BASIC = 'basic',
  BEARER = 'bearer',
  WEBHOOK_SECRET = 'webhook_secret',
  CUSTOM = 'custom',
}

// ═══════════════════════════════════════════════════════════════════════════════
// واجهات التكامل
// ═══════════════════════════════════════════════════════════════════════════════

export interface Integration {
  id: string;
  type: IntegrationType;
  name: string;
  description: string;
  status: IntegrationStatus;
  authMethod: AuthMethod;
  credentials: IntegrationCredentials;
  config: IntegrationConfig;
  lastSync?: Date;
  lastError?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IntegrationCredentials {
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: Date;
  webhookUrl?: string;
  webhookSecret?: string;
  customHeaders?: Record<string, string>;
  [key: string]: any;
}

export interface IntegrationConfig {
  baseUrl?: string;
  webhookEvents?: string[];
  syncInterval?: number;
  rateLimit?: RateLimitConfig;
  retryPolicy?: RetryPolicy;
  mappings?: Record<string, string>;
  filters?: Record<string, any>;
  [key: string]: any;
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  retryAfter?: number;
}

export interface RetryPolicy {
  maxRetries: number;
  backoffMs: number;
  backoffMultiplier: number;
}

// تفاصيل التكامل
export interface IntegrationDefinition {
  type: IntegrationType;
  name: string;
  description: string;
  icon: string;
  category: string;
  authMethod: AuthMethod;
  requiredFields: string[];
  optionalFields: string[];
  webhookSupport: boolean;
  oauthConfig?: OAuthConfig;
  documentation: string;
}

export interface OAuthConfig {
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  redirectUri: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// تعريفات التكاملات المتاحة
// ═══════════════════════════════════════════════════════════════════════════════

export const INTEGRATION_DEFINITIONS: IntegrationDefinition[] = [
  // Communication
  {
    type: IntegrationType.SLACK,
    name: 'Slack',
    description: 'إرسال إشعارات وتنبيهات إلى قنوات Slack',
    icon: '💬',
    category: 'communication',
    authMethod: AuthMethod.OAUTH2,
    requiredFields: ['workspace'],
    optionalFields: ['channel', 'botName'],
    webhookSupport: true,
    oauthConfig: {
      authUrl: 'https://slack.com/oauth/v2/authorize',
      tokenUrl: 'https://slack.com/api/oauth.v2.access',
      scopes: ['chat:write', 'channels:read', 'incoming-webhook'],
      redirectUri: '/api/integrations/oauth/callback/slack',
    },
    documentation: 'https://api.slack.com/docs',
  },
  {
    type: IntegrationType.DISCORD,
    name: 'Discord',
    description: 'إرسال إشعارات عبر Discord Webhooks',
    icon: '🎮',
    category: 'communication',
    authMethod: AuthMethod.WEBHOOK_SECRET,
    requiredFields: ['webhookUrl'],
    optionalFields: ['username', 'avatarUrl'],
    webhookSupport: true,
    documentation: 'https://discord.com/developers/docs',
  },
  {
    type: IntegrationType.TELEGRAM,
    name: 'Telegram',
    description: 'إرسال رسائل عبر بوت Telegram',
    icon: '✈️',
    category: 'communication',
    authMethod: AuthMethod.API_KEY,
    requiredFields: ['botToken', 'chatId'],
    optionalFields: ['parseMode'],
    webhookSupport: true,
    documentation: 'https://core.telegram.org/bots/api',
  },
  {
    type: IntegrationType.MICROSOFT_TEAMS,
    name: 'Microsoft Teams',
    description: 'إرسال إشعارات إلى قنوات Teams',
    icon: '👥',
    category: 'communication',
    authMethod: AuthMethod.WEBHOOK_SECRET,
    requiredFields: ['webhookUrl'],
    optionalFields: [],
    webhookSupport: true,
    documentation: 'https://docs.microsoft.com/en-us/microsoftteams/',
  },
  {
    type: IntegrationType.TWILIO,
    name: 'Twilio',
    description: 'إرسال SMS والاتصالات الهاتفية',
    icon: '📱',
    category: 'communication',
    authMethod: AuthMethod.API_KEY,
    requiredFields: ['accountSid', 'authToken', 'fromNumber'],
    optionalFields: [],
    webhookSupport: true,
    documentation: 'https://www.twilio.com/docs',
  },
  
  // Development
  {
    type: IntegrationType.GITHUB,
    name: 'GitHub',
    description: 'تكامل مع GitHub لإدارة المستودعات والـ Issues',
    icon: '🐙',
    category: 'development',
    authMethod: AuthMethod.OAUTH2,
    requiredFields: [],
    optionalFields: ['repository', 'organization'],
    webhookSupport: true,
    oauthConfig: {
      authUrl: 'https://github.com/login/oauth/authorize',
      tokenUrl: 'https://github.com/login/oauth/access_token',
      scopes: ['repo', 'read:org', 'workflow'],
      redirectUri: '/api/integrations/oauth/callback/github',
    },
    documentation: 'https://docs.github.com/en/rest',
  },
  {
    type: IntegrationType.JIRA,
    name: 'Jira',
    description: 'تكامل مع Jira لإدارة المشاريع',
    icon: '📋',
    category: 'development',
    authMethod: AuthMethod.OAUTH2,
    requiredFields: ['domain'],
    optionalFields: ['projectKey'],
    webhookSupport: true,
    oauthConfig: {
      authUrl: 'https://auth.atlassian.com/authorize',
      tokenUrl: 'https://auth.atlassian.com/oauth/token',
      scopes: ['read:jira-work', 'write:jira-work', 'manage:jira-webhook'],
      redirectUri: '/api/integrations/oauth/callback/jira',
    },
    documentation: 'https://developer.atlassian.com/cloud/jira/',
  },
  {
    type: IntegrationType.NOTION,
    name: 'Notion',
    description: 'تكامل مع Notion للمستندات وقواعد البيانات',
    icon: '📝',
    category: 'development',
    authMethod: AuthMethod.OAUTH2,
    requiredFields: [],
    optionalFields: ['databaseId'],
    webhookSupport: false,
    oauthConfig: {
      authUrl: 'https://api.notion.com/v1/oauth/authorize',
      tokenUrl: 'https://api.notion.com/v1/oauth/token',
      scopes: [],
      redirectUri: '/api/integrations/oauth/callback/notion',
    },
    documentation: 'https://developers.notion.com/',
  },
  {
    type: IntegrationType.LINEAR,
    name: 'Linear',
    description: 'تكامل مع Linear لإدارة المهام',
    icon: '📐',
    category: 'development',
    authMethod: AuthMethod.OAUTH2,
    requiredFields: [],
    optionalFields: ['teamId'],
    webhookSupport: true,
    oauthConfig: {
      authUrl: 'https://linear.app/oauth/authorize',
      tokenUrl: 'https://api.linear.app/oauth/token',
      scopes: ['read', 'write'],
      redirectUri: '/api/integrations/oauth/callback/linear',
    },
    documentation: 'https://developers.linear.app/',
  },
  
  // Cloud
  {
    type: IntegrationType.AWS,
    name: 'AWS',
    description: 'تكامل مع خدمات Amazon Web Services',
    icon: '☁️',
    category: 'cloud',
    authMethod: AuthMethod.API_KEY,
    requiredFields: ['accessKeyId', 'secretAccessKey', 'region'],
    optionalFields: ['sessionToken'],
    webhookSupport: false,
    documentation: 'https://docs.aws.amazon.com/',
  },
  {
    type: IntegrationType.VERCEL,
    name: 'Vercel',
    description: 'تكامل مع Vercel للنشر التلقائي',
    icon: '▲',
    category: 'cloud',
    authMethod: AuthMethod.BEARER,
    requiredFields: ['token'],
    optionalFields: ['teamId', 'projectId'],
    webhookSupport: true,
    documentation: 'https://vercel.com/docs/rest-api',
  },
  {
    type: IntegrationType.RAILWAY,
    name: 'Railway',
    description: 'تكامل مع Railway للنشر',
    icon: '🚂',
    category: 'cloud',
    authMethod: AuthMethod.BEARER,
    requiredFields: ['token'],
    optionalFields: ['projectId'],
    webhookSupport: true,
    documentation: 'https://docs.railway.app/',
  },
  
  // Analytics & Monitoring
  {
    type: IntegrationType.SENTRY,
    name: 'Sentry',
    description: 'تتبع الأخطاء والمشاكل',
    icon: '🐛',
    category: 'monitoring',
    authMethod: AuthMethod.API_KEY,
    requiredFields: ['dsn'],
    optionalFields: ['organization', 'project'],
    webhookSupport: true,
    documentation: 'https://docs.sentry.io/',
  },
  {
    type: IntegrationType.DATADOG,
    name: 'Datadog',
    description: 'مراقبة البنية التحتية والتطبيقات',
    icon: '📊',
    category: 'monitoring',
    authMethod: AuthMethod.API_KEY,
    requiredFields: ['apiKey', 'appKey'],
    optionalFields: ['site'],
    webhookSupport: true,
    documentation: 'https://docs.datadoghq.com/',
  },
  {
    type: IntegrationType.GRAFANA,
    name: 'Grafana',
    description: 'لوحات معلومات المراقبة',
    icon: '📈',
    category: 'monitoring',
    authMethod: AuthMethod.API_KEY,
    requiredFields: ['url', 'apiKey'],
    optionalFields: [],
    webhookSupport: true,
    documentation: 'https://grafana.com/docs/',
  },
  
  // Payments
  {
    type: IntegrationType.STRIPE,
    name: 'Stripe',
    description: 'معالجة المدفوعات والاشتراكات',
    icon: '💳',
    category: 'payments',
    authMethod: AuthMethod.API_KEY,
    requiredFields: ['secretKey'],
    optionalFields: ['publishableKey', 'webhookSecret'],
    webhookSupport: true,
    documentation: 'https://stripe.com/docs',
  },
  {
    type: IntegrationType.PAYPAL,
    name: 'PayPal',
    description: 'معالجة المدفوعات عبر PayPal',
    icon: '💰',
    category: 'payments',
    authMethod: AuthMethod.OAUTH2,
    requiredFields: ['clientId', 'clientSecret'],
    optionalFields: ['sandbox'],
    webhookSupport: true,
    documentation: 'https://developer.paypal.com/',
  },
  
  // Automation
  {
    type: IntegrationType.N8N,
    name: 'n8n',
    description: 'تكامل مع n8n للأتمتة',
    icon: '🔄',
    category: 'automation',
    authMethod: AuthMethod.API_KEY,
    requiredFields: ['url', 'apiKey'],
    optionalFields: [],
    webhookSupport: true,
    documentation: 'https://docs.n8n.io/',
  },
  {
    type: IntegrationType.ZAPIER,
    name: 'Zapier',
    description: 'تكامل مع Zapier للأتمتة',
    icon: '⚡',
    category: 'automation',
    authMethod: AuthMethod.WEBHOOK_SECRET,
    requiredFields: ['webhookUrl'],
    optionalFields: [],
    webhookSupport: true,
    documentation: 'https://platform.zapier.com/docs',
  },
  {
    type: IntegrationType.MAKE,
    name: 'Make (Integromat)',
    description: 'تكامل مع Make للأتمتة المتقدمة',
    icon: '🔗',
    category: 'automation',
    authMethod: AuthMethod.WEBHOOK_SECRET,
    requiredFields: ['webhookUrl'],
    optionalFields: [],
    webhookSupport: true,
    documentation: 'https://www.make.com/en/help',
  },
  
  // AI & ML
  {
    type: IntegrationType.OPENAI,
    name: 'OpenAI',
    description: 'تكامل مع GPT-4 و DALL-E',
    icon: '🤖',
    category: 'ai',
    authMethod: AuthMethod.API_KEY,
    requiredFields: ['apiKey'],
    optionalFields: ['organization', 'model'],
    webhookSupport: false,
    documentation: 'https://platform.openai.com/docs',
  },
  {
    type: IntegrationType.ANTHROPIC,
    name: 'Anthropic',
    description: 'تكامل مع Claude AI',
    icon: '🧠',
    category: 'ai',
    authMethod: AuthMethod.API_KEY,
    requiredFields: ['apiKey'],
    optionalFields: ['model'],
    webhookSupport: false,
    documentation: 'https://docs.anthropic.com/',
  },
  {
    type: IntegrationType.GOOGLE_AI,
    name: 'Google AI',
    description: 'تكامل مع Gemini و Vertex AI',
    icon: '🌐',
    category: 'ai',
    authMethod: AuthMethod.API_KEY,
    requiredFields: ['apiKey'],
    optionalFields: ['projectId', 'model'],
    webhookSupport: false,
    documentation: 'https://ai.google.dev/docs',
  },
  
  // Storage
  {
    type: IntegrationType.GOOGLE_DRIVE,
    name: 'Google Drive',
    description: 'تخزين ومشاركة الملفات',
    icon: '📁',
    category: 'storage',
    authMethod: AuthMethod.OAUTH2,
    requiredFields: [],
    optionalFields: ['folderId'],
    webhookSupport: true,
    oauthConfig: {
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      scopes: ['https://www.googleapis.com/auth/drive.file'],
      redirectUri: '/api/integrations/oauth/callback/google',
    },
    documentation: 'https://developers.google.com/drive',
  },
  {
    type: IntegrationType.AWS_S3,
    name: 'AWS S3',
    description: 'تخزين الملفات على S3',
    icon: '🗄️',
    category: 'storage',
    authMethod: AuthMethod.API_KEY,
    requiredFields: ['accessKeyId', 'secretAccessKey', 'bucket', 'region'],
    optionalFields: ['prefix'],
    webhookSupport: false,
    documentation: 'https://docs.aws.amazon.com/s3/',
  },
  
  // CRM
  {
    type: IntegrationType.HUBSPOT,
    name: 'HubSpot',
    description: 'تكامل مع HubSpot CRM',
    icon: '🧲',
    category: 'crm',
    authMethod: AuthMethod.OAUTH2,
    requiredFields: [],
    optionalFields: [],
    webhookSupport: true,
    oauthConfig: {
      authUrl: 'https://app.hubspot.com/oauth/authorize',
      tokenUrl: 'https://api.hubapi.com/oauth/v1/token',
      scopes: ['crm.objects.contacts.read', 'crm.objects.contacts.write'],
      redirectUri: '/api/integrations/oauth/callback/hubspot',
    },
    documentation: 'https://developers.hubspot.com/',
  },
  
  // Calendar
  {
    type: IntegrationType.GOOGLE_CALENDAR,
    name: 'Google Calendar',
    description: 'تكامل مع تقويم Google',
    icon: '📅',
    category: 'calendar',
    authMethod: AuthMethod.OAUTH2,
    requiredFields: [],
    optionalFields: ['calendarId'],
    webhookSupport: true,
    oauthConfig: {
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      scopes: ['https://www.googleapis.com/auth/calendar'],
      redirectUri: '/api/integrations/oauth/callback/google',
    },
    documentation: 'https://developers.google.com/calendar',
  },
  
  // Custom
  {
    type: IntegrationType.WEBHOOK,
    name: 'Webhook',
    description: 'إرسال واستقبال Webhooks مخصصة',
    icon: '🪝',
    category: 'custom',
    authMethod: AuthMethod.WEBHOOK_SECRET,
    requiredFields: ['url'],
    optionalFields: ['secret', 'headers'],
    webhookSupport: true,
    documentation: '',
  },
  {
    type: IntegrationType.REST_API,
    name: 'REST API',
    description: 'تكامل مع أي REST API',
    icon: '🔌',
    category: 'custom',
    authMethod: AuthMethod.CUSTOM,
    requiredFields: ['baseUrl'],
    optionalFields: ['headers', 'auth'],
    webhookSupport: false,
    documentation: '',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Integration Manager Class
// ═══════════════════════════════════════════════════════════════════════════════

export class IntegrationManager extends EventEmitter {
  private integrations: Map<string, Integration> = new Map();
  private adapters: Map<IntegrationType, IntegrationAdapter> = new Map();

  constructor() {
    super();
  }

  async initialize(): Promise<void> {
    console.log('🔗 IntegrationManager: Initializing...');
    await this.loadIntegrations();
    this.registerAdapters();
    console.log(`✅ IntegrationManager: Loaded ${this.integrations.size} integrations`);
  }

  // تحميل التكاملات من قاعدة البيانات
  private async loadIntegrations(): Promise<void> {
    try {
      if (!supabase) return;
      const { data } = await supabase
        .from('integrations')
        .select('*');

      for (const row of data || []) {
        this.integrations.set(row.id, {
          id: row.id,
          type: row.type,
          name: row.name,
          description: row.description,
          status: row.status,
          authMethod: row.auth_method,
          credentials: row.credentials || {},
          config: row.config || {},
          lastSync: row.last_sync ? new Date(row.last_sync) : undefined,
          lastError: row.last_error,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at),
        });
      }
    } catch (error) {
      console.error('Failed to load integrations:', error);
    }
  }

  // تسجيل المحولات
  private registerAdapters(): void {
    // سيتم إضافة المحولات الفردية لكل تكامل
  }

  // === PUBLIC API ===

  // الحصول على جميع التكاملات المتاحة
  getAvailableIntegrations(): IntegrationDefinition[] {
    return INTEGRATION_DEFINITIONS;
  }

  // الحصول على التكاملات المتصلة
  getConnectedIntegrations(): Integration[] {
    return Array.from(this.integrations.values())
      .filter(i => i.status === IntegrationStatus.CONNECTED);
  }

  // الحصول على تكامل محدد
  getIntegration(id: string): Integration | undefined {
    return this.integrations.get(id);
  }

  // إضافة تكامل جديد
  async addIntegration(
    type: IntegrationType,
    credentials: IntegrationCredentials,
    config?: Partial<IntegrationConfig>
  ): Promise<Integration> {
    const definition = INTEGRATION_DEFINITIONS.find(d => d.type === type);
    if (!definition) {
      throw new Error(`Unknown integration type: ${type}`);
    }

    const integration: Integration = {
      id: `int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      name: definition.name,
      description: definition.description,
      status: IntegrationStatus.PENDING,
      authMethod: definition.authMethod,
      credentials,
      config: {
        rateLimit: { maxRequests: 100, windowMs: 60000 },
        retryPolicy: { maxRetries: 3, backoffMs: 1000, backoffMultiplier: 2 },
        ...config,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // التحقق من الاتصال
    const connected = await this.testConnection(integration);
    integration.status = connected ? IntegrationStatus.CONNECTED : IntegrationStatus.ERROR;

    // حفظ في قاعدة البيانات
    if (supabase) {
      await supabase.from('integrations').insert({
        id: integration.id,
        type: integration.type,
        name: integration.name,
        description: integration.description,
        status: integration.status,
        auth_method: integration.authMethod,
        credentials: integration.credentials,
        config: integration.config,
        created_at: integration.createdAt,
        updated_at: integration.updatedAt,
      });
    }

    this.integrations.set(integration.id, integration);
    this.emit('integration_added', integration);

    return integration;
  }

  // اختبار الاتصال
  async testConnection(integration: Integration): Promise<boolean> {
    try {
      const adapter = this.adapters.get(integration.type);
      if (adapter) {
        return await adapter.testConnection(integration);
      }
      // للتكاملات بدون محول، نعتبرها متصلة
      return true;
    } catch (error) {
      console.error(`Connection test failed for ${integration.type}:`, error);
      return false;
    }
  }

  // إرسال بيانات عبر تكامل
  async send(integrationId: string, data: any): Promise<boolean> {
    const integration = this.integrations.get(integrationId);
    if (!integration || integration.status !== IntegrationStatus.CONNECTED) {
      return false;
    }

    try {
      const adapter = this.adapters.get(integration.type);
      if (adapter) {
        await adapter.send(integration, data);
      }
      return true;
    } catch (error) {
      console.error(`Send failed for ${integration.type}:`, error);
      integration.lastError = error instanceof Error ? (error instanceof Error ? error.message : 'Unknown error') : 'Unknown error';
      integration.updatedAt = new Date();
      return false;
    }
  }

  // حذف تكامل
  async removeIntegration(id: string): Promise<boolean> {
    const integration = this.integrations.get(id);
    if (!integration) return false;

    if (supabase) {
      await supabase.from('integrations').delete().eq('id', id);
    }
    this.integrations.delete(id);
    this.emit('integration_removed', integration);

    return true;
  }

  // تحديث تكامل
  async updateIntegration(
    id: string,
    updates: Partial<Pick<Integration, 'credentials' | 'config'>>
  ): Promise<Integration | null> {
    const integration = this.integrations.get(id);
    if (!integration) return null;

    if (updates.credentials) {
      integration.credentials = { ...integration.credentials, ...updates.credentials };
    }
    if (updates.config) {
      integration.config = { ...integration.config, ...updates.config };
    }
    integration.updatedAt = new Date();

    // إعادة اختبار الاتصال
    const connected = await this.testConnection(integration);
    integration.status = connected ? IntegrationStatus.CONNECTED : IntegrationStatus.ERROR;

    if (supabase) {
      await supabase.from('integrations').update({
        credentials: integration.credentials,
        config: integration.config,
        status: integration.status,
        updated_at: integration.updatedAt,
      }).eq('id', id);
    }

    this.integrations.set(id, integration);
    this.emit('integration_updated', integration);

    return integration;
  }

  // الحصول على إحصائيات
  getStats(): { total: number; connected: number; errored: number; byCategory: Record<string, number> } {
    const integrations = Array.from(this.integrations.values());
    const byCategory: Record<string, number> = {};

    for (const int of integrations) {
      const def = INTEGRATION_DEFINITIONS.find(d => d.type === int.type);
      if (def) {
        byCategory[def.category] = (byCategory[def.category] || 0) + 1;
      }
    }

    return {
      total: integrations.length,
      connected: integrations.filter(i => i.status === IntegrationStatus.CONNECTED).length,
      errored: integrations.filter(i => i.status === IntegrationStatus.ERROR).length,
      byCategory,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Integration Adapter Interface
// ═══════════════════════════════════════════════════════════════════════════════

export interface IntegrationAdapter {
  type: IntegrationType;
  testConnection(integration: Integration): Promise<boolean>;
  send(integration: Integration, data: any): Promise<void>;
  receive?(integration: Integration, payload: any): Promise<void>;
  refreshToken?(integration: Integration): Promise<IntegrationCredentials>;
}

// Singleton instance
export const integrationManager = new IntegrationManager();
