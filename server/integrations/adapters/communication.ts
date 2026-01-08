/**
 * 💬 Communication Adapters - محولات التواصل
 * Slack, Discord, Telegram, Teams, Twilio
 */

import { IntegrationAdapter, Integration, IntegrationType } from '../integration_manager';

// ═══════════════════════════════════════════════════════════════════════════════
// Slack Adapter
// ═══════════════════════════════════════════════════════════════════════════════

export class SlackAdapter implements IntegrationAdapter {
  type = IntegrationType.SLACK;

  async testConnection(integration: Integration): Promise<boolean> {
    try {
      const response = await fetch('https://slack.com/api/auth.test', {
        headers: {
          'Authorization': `Bearer ${integration.credentials.accessToken}`,
        },
      });
      const data = await response.json();
      return data.ok === true;
    } catch {
      return false;
    }
  }

  async send(integration: Integration, data: { channel: string; text: string; blocks?: any[] }): Promise<void> {
    const response = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${integration.credentials.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: data.channel,
        text: data.text,
        blocks: data.blocks,
      }),
    });

    const result = await response.json();
    if (!result.ok) {
      throw new Error(`Slack error: ${result.error}`);
    }
  }

  async refreshToken(integration: Integration): Promise<any> {
    // Slack tokens don't expire unless revoked
    return integration.credentials;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Discord Adapter
// ═══════════════════════════════════════════════════════════════════════════════

export class DiscordAdapter implements IntegrationAdapter {
  type = IntegrationType.DISCORD;

  async testConnection(integration: Integration): Promise<boolean> {
    try {
      const response = await fetch(integration.credentials.webhookUrl!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: '🔗 ARC Integration Test - Connection Successful!',
        }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async send(integration: Integration, data: { content?: string; embeds?: any[] }): Promise<void> {
    const payload: any = {
      username: integration.config.username || 'ARC System',
      avatar_url: integration.config.avatarUrl,
    };

    if (data.content) payload.content = data.content;
    if (data.embeds) payload.embeds = data.embeds;

    const response = await fetch(integration.credentials.webhookUrl!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Discord error: ${response.statusText}`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Telegram Adapter
// ═══════════════════════════════════════════════════════════════════════════════

export class TelegramAdapter implements IntegrationAdapter {
  type = IntegrationType.TELEGRAM;

  async testConnection(integration: Integration): Promise<boolean> {
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${integration.credentials.botToken}/getMe`
      );
      const data = await response.json();
      return data.ok === true;
    } catch {
      return false;
    }
  }

  async send(integration: Integration, data: { text: string; parseMode?: string }): Promise<void> {
    const response = await fetch(
      `https://api.telegram.org/bot${integration.credentials.botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: integration.credentials.chatId,
          text: data.text,
          parse_mode: data.parseMode || integration.config.parseMode || 'HTML',
        }),
      }
    );

    const result = await response.json();
    if (!result.ok) {
      throw new Error(`Telegram error: ${result.description}`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Microsoft Teams Adapter
// ═══════════════════════════════════════════════════════════════════════════════

export class TeamsAdapter implements IntegrationAdapter {
  type = IntegrationType.MICROSOFT_TEAMS;

  async testConnection(integration: Integration): Promise<boolean> {
    try {
      const response = await fetch(integration.credentials.webhookUrl!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          '@type': 'MessageCard',
          '@context': 'http://schema.org/extensions',
          summary: 'ARC Test',
          text: '🔗 ARC Integration Test - Connection Successful!',
        }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async send(integration: Integration, data: { title?: string; text: string; sections?: any[] }): Promise<void> {
    const card: any = {
      '@type': 'MessageCard',
      '@context': 'http://schema.org/extensions',
      summary: data.title || 'ARC Notification',
      themeColor: '0076D7',
      title: data.title,
      text: data.text,
    };

    if (data.sections) {
      card.sections = data.sections;
    }

    const response = await fetch(integration.credentials.webhookUrl!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(card),
    });

    if (!response.ok) {
      throw new Error(`Teams error: ${response.statusText}`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Twilio Adapter
// ═══════════════════════════════════════════════════════════════════════════════

export class TwilioAdapter implements IntegrationAdapter {
  type = IntegrationType.TWILIO;

  async testConnection(integration: Integration): Promise<boolean> {
    try {
      const auth = Buffer.from(
        `${integration.credentials.accountSid}:${integration.credentials.authToken}`
      ).toString('base64');

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${integration.credentials.accountSid}.json`,
        {
          headers: { 'Authorization': `Basic ${auth}` },
        }
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  async send(integration: Integration, data: { to: string; body: string }): Promise<void> {
    const auth = Buffer.from(
      `${integration.credentials.accountSid}:${integration.credentials.authToken}`
    ).toString('base64');

    const params = new URLSearchParams({
      To: data.to,
      From: integration.credentials.fromNumber,
      Body: data.body,
    });

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${integration.credentials.accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Twilio error: ${error.message}`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Export all adapters
// ═══════════════════════════════════════════════════════════════════════════════

export const communicationAdapters = [
  new SlackAdapter(),
  new DiscordAdapter(),
  new TelegramAdapter(),
  new TeamsAdapter(),
  new TwilioAdapter(),
];
