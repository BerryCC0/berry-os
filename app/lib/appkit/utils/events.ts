/**
 * Reown AppKit - Events Business Logic
 * Pure functions for event handling (no React dependencies)
 */

import type { AppKitEvent, EventCallback } from './types';

/**
 * Event listener storage type
 */
type EventListeners = {
  [K in AppKitEvent]?: Set<EventCallback>;
};

/**
 * Simple event bus implementation
 */
class EventBus {
  private listeners: EventListeners = {};
  
  /**
   * Subscribe to an event
   */
  on<T = unknown>(event: AppKitEvent, callback: EventCallback<T>): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set();
    }
    
    this.listeners[event]!.add(callback as EventCallback);
    
    // Return unsubscribe function
    return () => this.off(event, callback as EventCallback);
  }
  
  /**
   * Unsubscribe from an event
   */
  off(event: AppKitEvent, callback: EventCallback): void {
    if (this.listeners[event]) {
      this.listeners[event]!.delete(callback);
    }
  }
  
  /**
   * Emit an event
   */
  emit<T = unknown>(event: AppKitEvent, data: T): void {
    if (this.listeners[event]) {
      this.listeners[event]!.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }
  
  /**
   * Subscribe to an event once
   */
  once<T = unknown>(event: AppKitEvent, callback: EventCallback<T>): void {
    const onceCallback: EventCallback<T> = (data: T) => {
      callback(data);
      this.off(event, onceCallback as EventCallback);
    };
    
    this.on(event, onceCallback);
  }
  
  /**
   * Clear all listeners for an event
   */
  clear(event: AppKitEvent): void {
    delete this.listeners[event];
  }
  
  /**
   * Clear all listeners
   */
  clearAll(): void {
    this.listeners = {};
  }
  
  /**
   * Get listener count for an event
   */
  listenerCount(event: AppKitEvent): number {
    return this.listeners[event]?.size || 0;
  }
  
  /**
   * Check if event has listeners
   */
  hasListeners(event: AppKitEvent): boolean {
    return this.listenerCount(event) > 0;
  }
}

/**
 * Global event bus instance
 */
export const eventBus = new EventBus();

/**
 * Event name validation
 */
export function isValidEventName(name: string): name is AppKitEvent {
  const validEvents: AppKitEvent[] = [
    'modal_open',
    'modal_close',
    'connect',
    'disconnect',
    'account_changed',
    'network_changed',
    'transaction_sent',
    'transaction_confirmed',
    'transaction_failed',
  ];
  
  return validEvents.includes(name as AppKitEvent);
}

/**
 * Create event data object
 */
export function createEventData<T>(
  event: AppKitEvent,
  data: T,
  timestamp?: number
): {
  event: AppKitEvent;
  data: T;
  timestamp: number;
} {
  return {
    event,
    data,
    timestamp: timestamp || Date.now(),
  };
}

/**
 * Format event for logging
 */
export function formatEventLog(event: AppKitEvent, data: unknown): string {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] ${event}: ${JSON.stringify(data)}`;
}

/**
 * Check if event is modal-related
 */
export function isModalEvent(event: AppKitEvent): boolean {
  return event === 'modal_open' || event === 'modal_close';
}

/**
 * Check if event is connection-related
 */
export function isConnectionEvent(event: AppKitEvent): boolean {
  return event === 'connect' || event === 'disconnect';
}

/**
 * Check if event is account-related
 */
export function isAccountEvent(event: AppKitEvent): boolean {
  return event === 'account_changed';
}

/**
 * Check if event is network-related
 */
export function isNetworkEvent(event: AppKitEvent): boolean {
  return event === 'network_changed';
}

/**
 * Check if event is transaction-related
 */
export function isTransactionEvent(event: AppKitEvent): boolean {
  return event.startsWith('transaction_');
}

/**
 * Get event category
 */
export function getEventCategory(event: AppKitEvent): 
  'modal' | 'connection' | 'account' | 'network' | 'transaction' | 'unknown' {
  if (isModalEvent(event)) return 'modal';
  if (isConnectionEvent(event)) return 'connection';
  if (isAccountEvent(event)) return 'account';
  if (isNetworkEvent(event)) return 'network';
  if (isTransactionEvent(event)) return 'transaction';
  return 'unknown';
}

/**
 * Event history tracker
 */
class EventHistory {
  private history: Array<{
    event: AppKitEvent;
    data: unknown;
    timestamp: number;
  }> = [];
  
  private maxSize = 100;
  
  add(event: AppKitEvent, data: unknown): void {
    this.history.push({
      event,
      data,
      timestamp: Date.now(),
    });
    
    // Keep only recent events
    if (this.history.length > this.maxSize) {
      this.history.shift();
    }
  }
  
  getRecent(count: number = 10): typeof this.history {
    return this.history.slice(-count);
  }
  
  getByEvent(event: AppKitEvent): typeof this.history {
    return this.history.filter(item => item.event === event);
  }
  
  clear(): void {
    this.history = [];
  }
  
  get length(): number {
    return this.history.length;
  }
}

/**
 * Global event history instance
 */
export const eventHistory = new EventHistory();

/**
 * Event listener with error boundary
 */
export function safeEventListener<T = unknown>(
  callback: EventCallback<T>,
  errorHandler?: (error: Error) => void
): EventCallback<T> {
  return (data: T) => {
    try {
      callback(data);
    } catch (error) {
      if (errorHandler) {
        errorHandler(error as Error);
      } else {
        console.error('Event listener error:', error);
      }
    }
  };
}

/**
 * Throttle event listener
 */
export function throttleEventListener<T = unknown>(
  callback: EventCallback<T>,
  delay: number
): EventCallback<T> {
  let lastCall = 0;
  
  return (data: T) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      callback(data);
    }
  };
}

/**
 * Debounce event listener
 */
export function debounceEventListener<T = unknown>(
  callback: EventCallback<T>,
  delay: number
): EventCallback<T> {
  let timeoutId: NodeJS.Timeout;
  
  return (data: T) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(data), delay);
  };
}

/**
 * Create event listener with logging
 */
export function loggedEventListener<T = unknown>(
  event: AppKitEvent,
  callback: EventCallback<T>
): EventCallback<T> {
  return (data: T) => {
    console.log(formatEventLog(event, data));
    callback(data);
  };
}

/**
 * Combine multiple event listeners
 */
export function combineEventListeners<T = unknown>(
  ...callbacks: EventCallback<T>[]
): EventCallback<T> {
  return (data: T) => {
    callbacks.forEach(callback => callback(data));
  };
}

/**
 * Filter event data
 */
export function filterEventData<T = unknown>(
  predicate: (data: T) => boolean,
  callback: EventCallback<T>
): EventCallback<T> {
  return (data: T) => {
    if (predicate(data)) {
      callback(data);
    }
  };
}

/**
 * Map event data
 */
export function mapEventData<T = unknown, U = unknown>(
  mapper: (data: T) => U,
  callback: EventCallback<U>
): EventCallback<T> {
  return (data: T) => {
    const mapped = mapper(data);
    callback(mapped);
  };
}

/**
 * Event listener priority queue
 */
export class PriorityEventBus extends EventBus {
  private priorities: Map<EventCallback, number> = new Map();
  
  onWithPriority<T = unknown>(
    event: AppKitEvent,
    callback: EventCallback<T>,
    priority: number = 0
  ): () => void {
    this.priorities.set(callback as EventCallback, priority);
    return this.on(event, callback);
  }
  
  emit<T = unknown>(event: AppKitEvent, data: T): void {
    // Access private listeners via type assertion
    const listenerSet = (this as unknown as { listeners: EventListeners }).listeners[event];
    const listeners = Array.from(listenerSet || []) as EventCallback[];
    
    // Sort by priority (higher first)
    listeners.sort((a, b) => {
      const priorityA = this.priorities.get(a) || 0;
      const priorityB = this.priorities.get(b) || 0;
      return priorityB - priorityA;
    });
    
    listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }
}

/**
 * Get event statistics
 */
export function getEventStats(): {
  totalEvents: number;
  byCategory: Record<string, number>;
  recentEvents: number;
} {
  const history = eventHistory.getRecent(100);
  const byCategory: Record<string, number> = {};
  
  history.forEach(item => {
    const category = getEventCategory(item.event);
    byCategory[category] = (byCategory[category] || 0) + 1;
  });
  
  return {
    totalEvents: eventHistory.length,
    byCategory,
    recentEvents: history.length,
  };
}

