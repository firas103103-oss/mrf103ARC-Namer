/**
 * 💳 Payment & AI Adapters - محولات الدفع والذكاء الاصطناعي
 */

import { IntegrationAdapter, Integration, IntegrationType } from '../integration_manager';

// ═══════════════════════════════════════════════════════════════════════════════
// Stripe Adapter
// ═══════════════════════════════════════════════════════════════════════════════

export class StripeAdapter implements IntegrationAdapter {
  type = IntegrationType.STRIPE;

  async testConnection(integration: Integration): Promise<boolean> {
    try {
      const response = await fetch('https://api.stripe.com/v1/balance', {
        headers: {
          'Authorization': `Bearer ${integration.credentials.secretKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async send(integration: Integration, data: any): Promise<void> {
    // Stripe operations depend on the action type
    const { action, ...params } = data;
    
    let endpoint = 'https://api.stripe.com/v1/';
    switch (action) {
      case 'create_customer':
        endpoint += 'customers';
        break;
      case 'create_payment_intent':
        endpoint += 'payment_intents';
        break;
      case 'create_subscription':
        endpoint += 'subscriptions';
        break;
      default:
        throw new Error(`Unknown Stripe action: ${action}`);
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${integration.credentials.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(params).toString(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Stripe error: ${error.error?.message}`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// OpenAI Adapter
// ═══════════════════════════════════════════════════════════════════════════════

export class OpenAIAdapter implements IntegrationAdapter {
  type = IntegrationType.OPENAI;

  async testConnection(integration: Integration): Promise<boolean> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${integration.credentials.apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async send(integration: Integration, data: {
    action: 'chat' | 'completion' | 'embedding' | 'image';
    messages?: any[];
    prompt?: string;
    model?: string;
    input?: string;
  }): Promise<any> {
    const model = data.model || integration.config.model || 'gpt-4o-mini';
    let endpoint = 'https://api.openai.com/v1/';
    let body: any = {};

    switch (data.action) {
      case 'chat':
        endpoint += 'chat/completions';
        body = { model, messages: data.messages };
        break;
      case 'completion':
        endpoint += 'completions';
        body = { model, prompt: data.prompt, max_tokens: 1000 };
        break;
      case 'embedding':
        endpoint += 'embeddings';
        body = { model: 'text-embedding-3-small', input: data.input };
        break;
      case 'image':
        endpoint += 'images/generations';
        body = { model: 'dall-e-3', prompt: data.prompt, n: 1, size: '1024x1024' };
        break;
    }

    const headers: any = {
      'Authorization': `Bearer ${integration.credentials.apiKey}`,
      'Content-Type': 'application/json',
    };
    
    if (integration.credentials.organization) {
      headers['OpenAI-Organization'] = integration.credentials.organization;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(`OpenAI error: ${result.error?.message}`);
    }
    
    return result;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Anthropic Adapter
// ═══════════════════════════════════════════════════════════════════════════════

export class AnthropicAdapter implements IntegrationAdapter {
  type = IntegrationType.ANTHROPIC;

  async testConnection(integration: Integration): Promise<boolean> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': integration.credentials.apiKey || '',
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'test' }],
        }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async send(integration: Integration, data: {
    messages: { role: string; content: string }[];
    model?: string;
    maxTokens?: number;
    system?: string;
  }): Promise<any> {
    const model = data.model || integration.config.model || 'claude-sonnet-4-20250514';
    
    const body: any = {
      model,
      max_tokens: data.maxTokens || 4096,
      messages: data.messages,
    };

    if (data.system) {
      body.system = data.system;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': integration.credentials.apiKey || '',
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(`Anthropic error: ${result.error?.message}`);
    }
    
    return result;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Google AI Adapter
// ═══════════════════════════════════════════════════════════════════════════════

export class GoogleAIAdapter implements IntegrationAdapter {
  type = IntegrationType.GOOGLE_AI;

  async testConnection(integration: Integration): Promise<boolean> {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models?key=${integration.credentials.apiKey}`
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  async send(integration: Integration, data: {
    contents: any[];
    model?: string;
  }): Promise<any> {
    const model = data.model || integration.config.model || 'gemini-1.5-flash';
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${integration.credentials.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: data.contents }),
      }
    );

    const result = await response.json();
    if (!response.ok) {
      throw new Error(`Google AI error: ${result.error?.message}`);
    }
    
    return result;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// n8n Adapter
// ═══════════════════════════════════════════════════════════════════════════════

export class N8nAdapter implements IntegrationAdapter {
  type = IntegrationType.N8N;

  async testConnection(integration: Integration): Promise<boolean> {
    try {
      const response = await fetch(`${integration.credentials.url}/api/v1/workflows`, {
        headers: {
          'X-N8N-API-KEY': integration.credentials.apiKey || '',
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async send(integration: Integration, data: {
    webhookPath: string;
    payload: any;
  }): Promise<void> {
    const url = `${integration.credentials.url}/webhook/${data.webhookPath}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data.payload),
    });

    if (!response.ok) {
      throw new Error(`n8n error: ${response.statusText}`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Generic Webhook Adapter
// ═══════════════════════════════════════════════════════════════════════════════

export class WebhookAdapter implements IntegrationAdapter {
  type = IntegrationType.WEBHOOK;

  async testConnection(integration: Integration): Promise<boolean> {
    // Webhooks are assumed to be connected
    return true;
  }

  async send(integration: Integration, data: any): Promise<void> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...integration.credentials.customHeaders,
    };

    if (integration.credentials.webhookSecret) {
      const crypto = await import('crypto');
      const signature = crypto
        .createHmac('sha256', integration.credentials.webhookSecret)
        .update(JSON.stringify(data))
        .digest('hex');
      headers['X-Webhook-Signature'] = signature;
    }

    const response = await fetch(integration.credentials.url!, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Webhook error: ${response.statusText}`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Export all adapters
// ═══════════════════════════════════════════════════════════════════════════════

export const paymentAndAIAdapters = [
  new StripeAdapter(),
  new OpenAIAdapter(),
  new AnthropicAdapter(),
  new GoogleAIAdapter(),
  new N8nAdapter(),
  new WebhookAdapter(),
];
