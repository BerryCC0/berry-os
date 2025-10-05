/**
 * Neynar SDK - Webhook Utilities
 * 
 * Pure business logic for handling Farcaster webhooks.
 * No React dependencies - can be used in any context.
 * 
 * @module app/lib/neynar/utils/webhook
 */

import type {
  Webhook,
  WebhookSubscription,
} from './types';

// ============================================================================
// Validation
// ============================================================================

/**
 * Validates a webhook URL
 * 
 * @param url - Webhook URL to validate
 * @returns True if valid HTTPS URL
 * 
 * @example
 * ```typescript
 * isValidWebhookUrl('https://api.example.com/webhook') // true
 * isValidWebhookUrl('http://example.com') // false
 * ```
 */
export function isValidWebhookUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validates webhook subscription event type
 * 
 * @param eventType - Event type to validate
 * @returns True if valid
 * 
 * @example
 * ```typescript
 * isValidEventType('cast.created') // true
 * isValidEventType('invalid') // false
 * ```
 */
export function isValidEventType(eventType: string): boolean {
  const validTypes: WebhookSubscription[] = [
    'user.created',
    'user.updated',
    'cast.created',
    'reaction.created',
    'follow.created',
  ];
  return validTypes.includes(eventType as WebhookSubscription);
}

// ============================================================================
// Webhook Status
// ============================================================================

/**
 * Checks if webhook is active
 * 
 * @param webhook - Webhook object
 * @returns True if active
 * 
 * @example
 * ```typescript
 * isActive(webhook) // true
 * ```
 */
export function isActive(webhook: Webhook): boolean {
  return webhook.isActive || false;
}

/**
 * Checks if webhook is inactive
 * 
 * @param webhook - Webhook object
 * @returns True if inactive
 * 
 * @example
 * ```typescript
 * isInactive(webhook) // false
 * ```
 */
export function isInactive(webhook: Webhook): boolean {
  return !isActive(webhook);
}

// ============================================================================
// Filtering
// ============================================================================

/**
 * Filters active webhooks
 * 
 * @param webhooks - Webhooks to filter
 * @returns Active webhooks
 * 
 * @example
 * ```typescript
 * const active = filterActive(webhooks)
 * ```
 */
export function filterActive(webhooks: Webhook[]): Webhook[] {
  return webhooks.filter(w => isActive(w));
}

/**
 * Filters inactive webhooks
 * 
 * @param webhooks - Webhooks to filter
 * @returns Inactive webhooks
 * 
 * @example
 * ```typescript
 * const inactive = filterInactive(webhooks)
 * ```
 */
export function filterInactive(webhooks: Webhook[]): Webhook[] {
  return webhooks.filter(w => isInactive(w));
}

/**
 * Filters webhooks by event type
 * 
 * @param webhooks - Webhooks to filter
 * @param eventType - Event type
 * @returns Filtered webhooks
 * 
 * @example
 * ```typescript
 * const castWebhooks = filterByEventType(webhooks, 'cast.created')
 * ```
 */
export function filterByEventType(
  webhooks: Webhook[],
  eventType: WebhookSubscription
): Webhook[] {
  return webhooks.filter(w => 
    w.subscriptions?.some(s => s === eventType)
  );
}

// ============================================================================
// Subscription Utilities
// ============================================================================

/**
 * Gets all event types from webhook
 * 
 * @param webhook - Webhook object
 * @returns Array of event types
 * 
 * @example
 * ```typescript
 * getEventTypes(webhook)
 * // ['cast.created', 'user.updated']
 * ```
 */
export function getEventTypes(webhook: Webhook): WebhookSubscription[] {
  return webhook.subscriptions || [];
}

/**
 * Checks if webhook has event type
 * 
 * @param webhook - Webhook object
 * @param eventType - Event type to check
 * @returns True if subscribed
 * 
 * @example
 * ```typescript
 * hasEventType(webhook, 'cast.created') // true
 * ```
 */
export function hasEventType(webhook: Webhook, eventType: WebhookSubscription): boolean {
  return getEventTypes(webhook).includes(eventType);
}

/**
 * Gets subscription count
 * 
 * @param webhook - Webhook object
 * @returns Number of subscriptions
 * 
 * @example
 * ```typescript
 * getSubscriptionCount(webhook) // 3
 * ```
 */
export function getSubscriptionCount(webhook: Webhook): number {
  return webhook.subscriptions?.length || 0;
}

// ============================================================================
// Sorting
// ============================================================================

/**
 * Sorts webhooks by name (alphabetically)
 * 
 * @param webhooks - Webhooks to sort
 * @returns Sorted webhooks
 * 
 * @example
 * ```typescript
 * const sorted = sortByName(webhooks)
 * ```
 */
export function sortByName(webhooks: Webhook[]): Webhook[] {
  return [...webhooks].sort((a, b) => 
    a.name.localeCompare(b.name)
  );
}

// ============================================================================
// Lookup
// ============================================================================

/**
 * Finds webhook by ID
 * 
 * @param webhooks - Webhooks to search
 * @param webhookId - Webhook ID
 * @returns Webhook or null
 * 
 * @example
 * ```typescript
 * const webhook = findById(webhooks, 'webhook-123')
 * ```
 */
export function findById(webhooks: Webhook[], webhookId: string): Webhook | null {
  return webhooks.find(w => w.webhookId === webhookId) || null;
}

/**
 * Finds webhook by URL
 * 
 * @param webhooks - Webhooks to search
 * @param url - Webhook URL
 * @returns Webhook or null
 * 
 * @example
 * ```typescript
 * const webhook = findByUrl(webhooks, 'https://api.example.com/webhook')
 * ```
 */
export function findByUrl(webhooks: Webhook[], url: string): Webhook | null {
  return webhooks.find(w => w.url === url) || null;
}

// ============================================================================
// Formatting
// ============================================================================

/**
 * Formats webhook URL for display (truncated)
 * 
 * @param url - Webhook URL
 * @param maxLength - Maximum length
 * @returns Formatted string
 * 
 * @example
 * ```typescript
 * formatWebhookUrl('https://api.example.com/webhook/very/long/path', 30)
 * // 'api.example.com/webhook/...'
 * ```
 */
export function formatWebhookUrl(url: string, maxLength: number = 40): string {
  try {
    const parsed = new URL(url);
    const display = `${parsed.hostname}${parsed.pathname}`;
    
    if (display.length <= maxLength) {
      return display;
    }
    
    return `${display.slice(0, maxLength - 3)}...`;
  } catch {
    return url;
  }
}

/**
 * Gets webhook summary text
 * 
 * @param webhook - Webhook object
 * @returns Summary text
 * 
 * @example
 * ```typescript
 * getWebhookSummary(webhook)
 * // 'Active • 3 subscriptions • api.example.com/webhook'
 * ```
 */
export function getWebhookSummary(webhook: Webhook): string {
  const status = isActive(webhook) ? 'Active' : 'Inactive';
  const count = getSubscriptionCount(webhook);
  const url = formatWebhookUrl(webhook.url);
  
  return `${status} • ${count} ${count === 1 ? 'subscription' : 'subscriptions'} • ${url}`;
}

/**
 * Gets event type label
 * 
 * @param eventType - Event type
 * @returns Display label
 * 
 * @example
 * ```typescript
 * getEventTypeLabel('cast.created') // 'Cast Created'
 * ```
 */
export function getEventTypeLabel(eventType: string): string {
  const labels: Record<string, string> = {
    'cast.created': 'Cast Created',
    'cast.deleted': 'Cast Deleted',
    'user.created': 'User Created',
    'user.updated': 'User Updated',
    'reaction.created': 'Reaction Created',
    'reaction.deleted': 'Reaction Deleted',
    'follow.created': 'Follow Created',
    'follow.deleted': 'Follow Deleted',
  };
  
  return labels[eventType] || eventType;
}

