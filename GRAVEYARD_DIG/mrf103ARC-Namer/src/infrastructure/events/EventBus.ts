import { EventEmitter } from 'events';

interface EventLog {
  event: string;
  data: any;
  timestamp: Date;
  id: string;
}

export class EventBus extends EventEmitter {
  private eventLog: EventLog[] = [];
  private retryQueue = new Map<string, any>();

  constructor() {
    super();
    this.setMaxListeners(100);
  }

  subscribeWithRetry(event: string, handler: (data: any) => Promise<void>, maxRetries = 3): string {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const wrappedHandler = async (data: any) => {
      let attempts = 0;
      while (attempts < maxRetries) {
        try {
          await handler(data);
          break;
        } catch (error) {
          attempts++;
          if (attempts >= maxRetries) {
            console.error(`❌ Max retries for ${event}:`, error);
            this.emit('retry_failed', { event, error });
          } else {
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts)));
          }
        }
      }
    };

    this.on(event, wrappedHandler);
    console.log(`📡 Subscribed: ${event} (ID: ${id})`);
    return id;
  }

  async publishWithLog(event: string, data: any): Promise<void> {
    const eventLog: EventLog = {
      event,
      data,
      timestamp: new Date(),
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    this.eventLog.push(eventLog);
    this.emit(event, data);
    console.log(`📤 Published: ${event}`);
  }

  getStats() {
    const counts: Record<string, number> = {};
    this.eventLog.forEach(log => {
      counts[log.event] = (counts[log.event] || 0) + 1;
    });

    return {
      totalEvents: this.eventLog.length,
      eventCounts: counts,
      recentEvents: this.eventLog.slice(-10)
    };
  }

  getHistory(limit = 100): EventLog[] {
    return this.eventLog.slice(-limit);
  }

  clearHistory(): void {
    this.eventLog = [];
    console.log('🗑️ Event history cleared');
  }
}

export const eventBus = new EventBus();
