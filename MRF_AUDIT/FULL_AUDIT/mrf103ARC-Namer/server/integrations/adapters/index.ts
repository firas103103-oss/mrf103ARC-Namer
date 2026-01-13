/**
 * 🔗 Integration Adapters Index - فهرس محولات التكامل
 * تجميع كافة المحولات في ملف واحد
 */

// Communication Adapters
export {
  SlackAdapter,
  DiscordAdapter,
  TelegramAdapter,
  TeamsAdapter,
  TwilioAdapter,
  communicationAdapters,
} from './communication';

// Development Adapters
export {
  GitHubAdapter,
  GitLabAdapter,
  JiraAdapter,
  NotionAdapter,
  LinearAdapter,
  developmentAdapters,
} from './development';

// Cloud Adapters
export {
  AWSS3Adapter,
  VercelAdapter,
  RailwayAdapter,
  SupabaseAdapter,
  cloudAdapters,
} from './cloud';

// Payment & AI Adapters
export {
  StripeAdapter,
  OpenAIAdapter,
  AnthropicAdapter,
  GoogleAIAdapter,
  N8nAdapter,
  WebhookAdapter,
  paymentAndAIAdapters,
} from './payment_ai';

// Re-export types
export { IntegrationAdapter, Integration, IntegrationType } from '../integration_manager';

// ═══════════════════════════════════════════════════════════════════════════════
// All Adapters Combined
// ═══════════════════════════════════════════════════════════════════════════════

import { communicationAdapters } from './communication';
import { developmentAdapters } from './development';
import { cloudAdapters } from './cloud';
import { paymentAndAIAdapters } from './payment_ai';
import { IntegrationAdapter, IntegrationType } from '../integration_manager';

export const allAdapters: IntegrationAdapter[] = [
  ...communicationAdapters,
  ...developmentAdapters,
  ...cloudAdapters,
  ...paymentAndAIAdapters,
];

// Adapter registry for quick lookup by type
export const adapterRegistry: Map<IntegrationType, IntegrationAdapter> = new Map(
  allAdapters.map(adapter => [adapter.type, adapter])
);

/**
 * Get adapter for a specific integration type
 */
export function getAdapter(type: IntegrationType): IntegrationAdapter | undefined {
  return adapterRegistry.get(type);
}

/**
 * Check if an adapter exists for the given type
 */
export function hasAdapter(type: IntegrationType): boolean {
  return adapterRegistry.has(type);
}

/**
 * Get all supported integration types
 */
export function getSupportedTypes(): IntegrationType[] {
  return Array.from(adapterRegistry.keys());
}

/**
 * Get adapters by category
 */
export function getAdaptersByCategory(category: 'communication' | 'development' | 'cloud' | 'payment_ai'): IntegrationAdapter[] {
  switch (category) {
    case 'communication':
      return communicationAdapters;
    case 'development':
      return developmentAdapters;
    case 'cloud':
      return cloudAdapters;
    case 'payment_ai':
      return paymentAndAIAdapters;
    default:
      return [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Integration Statistics
// ═══════════════════════════════════════════════════════════════════════════════

export const integrationStats = {
  totalAdapters: allAdapters.length,
  categories: {
    communication: communicationAdapters.length,
    development: developmentAdapters.length,
    cloud: cloudAdapters.length,
    paymentAndAI: paymentAndAIAdapters.length,
  },
  supportedServices: getSupportedTypes(),
};

console.log(`🔌 ARC Integrations Loaded: ${integrationStats.totalAdapters} adapters across 4 categories`);
