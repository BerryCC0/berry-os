/**
 * Event Bus - Simple Pub/Sub Pattern
 * Mimics Mac OS event handling with priority queue
 */

import type { EventType, EventPayload, EventHandler, EventSubscription } from '../types/events';

type EventListener = {
  handler: EventHandler;
  priority: number;
};

class EventBus {
  private listeners: Map<EventType, EventListener[]>;
  private eventQueue: Array<{ type: EventType; payload: EventPayload }>;
  private isProcessing: boolean;

  constructor() {
    this.listeners = new Map();
    this.eventQueue = [];
    this.isProcessing = false;
  }

  /**
   * Subscribe to an event
   * @param eventType - The type of event to listen for
   * @param handler - The handler function to call when event occurs
   * @param priority - Higher priority handlers are called first (default: 0)
   * @returns Subscription object with unsubscribe method
   */
  subscribe<T extends EventPayload = EventPayload>(
    eventType: EventType,
    handler: EventHandler<T>,
    priority: number = 0
  ): EventSubscription {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }

    const listeners = this.listeners.get(eventType)!;
    const listener: EventListener = {
      handler: handler as EventHandler,
      priority,
    };

    // Insert in priority order (highest first)
    const insertIndex = listeners.findIndex((l) => l.priority < priority);
    if (insertIndex === -1) {
      listeners.push(listener);
    } else {
      listeners.splice(insertIndex, 0, listener);
    }

    // Return unsubscribe function
    return {
      unsubscribe: () => {
        const index = listeners.indexOf(listener);
        if (index !== -1) {
          listeners.splice(index, 1);
        }
      },
    };
  }

  /**
   * Publish an event
   * @param eventType - The type of event to publish
   * @param payload - The event payload
   */
  publish(eventType: EventType, payload: Omit<EventPayload, 'timestamp'>): void {
    // Add timestamp to payload
    const eventPayload: EventPayload = {
      ...payload,
      timestamp: Date.now(),
    } as EventPayload;

    // Add to queue
    this.eventQueue.push({ type: eventType, payload: eventPayload });

    // Process queue if not already processing
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  /**
   * Process the event queue
   */
  private processQueue(): void {
    this.isProcessing = true;

    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      if (!event) break;

      const listeners = this.listeners.get(event.type);
      if (!listeners || listeners.length === 0) continue;

      // Call all handlers in priority order
      for (const listener of listeners) {
        try {
          listener.handler(event.payload);
        } catch (error) {
          console.error(`Error in event handler for ${event.type}:`, error);
        }
      }
    }

    this.isProcessing = false;
  }

  /**
   * Clear all listeners for an event type (or all if not specified)
   */
  clear(eventType?: EventType): void {
    if (eventType) {
      this.listeners.delete(eventType);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Get the number of listeners for an event type
   */
  listenerCount(eventType: EventType): number {
    return this.listeners.get(eventType)?.length ?? 0;
  }
}

// Singleton instance
export const eventBus = new EventBus();

// Export type for testing/mocking
export type { EventBus };

