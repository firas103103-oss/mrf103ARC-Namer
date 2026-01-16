import { EventEmitter } from 'events';

interface EventLog<T = unknown> {
  event: string;
  data: T;
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

  subscribeWithRetry<T = unknown>(event: string, handler: (data: T) => Promise<void>, maxRetries = 3): string {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const wrappedHandler = async (data: T) => {
      let attempts = 0;
      while (attempts < maxRetries) {
        try {
          await handler(data);
          break;
        } catch (error) {
          attempts++;
          if (attempts >= maxRetries) {
            // Max retries reached - emit retry_failed event
            this.emit('retry_failed', { event, error });
          } else {
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts)));
          }
        }
      }
    };

    this.on(event, wrappedHandler);
    // Subscribed to event
    return id;
  }

  async publishWithLog<T = unknown>(event: string, data: T): Promise<void> {
    const eventLog: EventLog<T> = {
      event,
      data,
      timestamp: new Date(),
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    this.eventLog.push(eventLog as EventLog<unknown>);
    this.emit(event, data);
    // Event published
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
    // Event history cleared
  }
}

export const eventBus = new EventBus();
