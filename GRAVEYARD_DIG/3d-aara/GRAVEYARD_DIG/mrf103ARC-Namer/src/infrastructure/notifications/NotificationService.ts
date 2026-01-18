import axios from 'axios';

type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'critical';

interface Notification {
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  timestamp?: Date;
}

export class NotificationService {
  private queue: Notification[] = [];
  private notificationHistory: Array<Notification & { timestamp: Date }> = [];

  async notify(notification: Notification): Promise<void> {
    const fullNotification = {
      ...notification,
      timestamp: notification.timestamp || new Date()
    };
    
    this.queue.push(fullNotification);
    this.notificationHistory.push(fullNotification);
    
    await this.process(fullNotification);
  }

  async alert(title: string, message: string, data?: any): Promise<void> {
    await this.notify({
      type: 'critical',
      title: `🚨 ${title}`,
      message,
      data
    });
  }

  private async process(notification: Notification): Promise<void> {
    // Always send to console
    this.sendConsole(notification);

    // Send to Slack if configured
    if (process.env.SLACK_WEBHOOK_URL) {
      try {
        await this.sendSlack(notification);
      } catch (error) {
        console.error('Failed to send Slack notification:', error);
      }
    }

    // Send to Discord if configured
    if (process.env.DISCORD_WEBHOOK_URL) {
      try {
        await this.sendDiscord(notification);
      } catch (error) {
        console.error('Failed to send Discord notification:', error);
      }
    }
  }

  private sendConsole(notification: Notification): void {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      critical: '🚨'
    };
    
    console.log(`\n${icons[notification.type]} ${notification.title}`);
    console.log(`   ${notification.message}`);
    if (notification.data) {
      console.log(`   Data:`, notification.data);
    }
    console.log();
  }

  private async sendSlack(notification: Notification): Promise<void> {
    const colors = {
      info: '#36a64f',
      success: '#2eb886',
      warning: '#daa038',
      error: '#a30200',
      critical: '#ff0000'
    };

    await axios.post(process.env.SLACK_WEBHOOK_URL!, {
      attachments: [{
        color: colors[notification.type],
        title: notification.title,
        text: notification.message,
        fields: notification.data ? Object.entries(notification.data).map(([key, value]) => ({
          title: key,
          value: String(value),
          short: true
        })) : [],
        footer: 'mrf103ARC-Namer',
        ts: Math.floor(Date.now() / 1000)
      }]
    });
  }

  private async sendDiscord(notification: Notification): Promise<void> {
    const colors = {
      info: 3581519,
      success: 3066246,
      warning: 14327864,
      error: 10682880,
      critical: 16711680
    };

    await axios.post(process.env.DISCORD_WEBHOOK_URL!, {
      embeds: [{
        title: notification.title,
        description: notification.message,
        color: colors[notification.type],
        fields: notification.data ? Object.entries(notification.data).map(([key, value]) => ({
          name: key,
          value: String(value),
          inline: true
        })) : [],
        footer: {
          text: 'mrf103ARC-Namer'
        },
        timestamp: new Date().toISOString()
      }]
    });
  }

  getStats() {
    return {
      queueSize: this.queue.length,
      totalNotifications: this.notificationHistory.length,
      recentNotifications: this.notificationHistory.slice(-10)
    };
  }
}

export const notificationService = new NotificationService();
