/**
 * Neynar SDK - Notification Utilities
 * 
 * Pure business logic for handling Farcaster notifications.
 * No React dependencies - can be used in any context.
 * 
 * @module app/lib/neynar/utils/notification
 */

import type {
  Notification,
  NotificationType,
  FarcasterUser,
} from './types';

// ============================================================================
// Validation
// ============================================================================

/**
 * Validates a notification type
 * 
 * @param type - Notification type to validate
 * @returns True if valid
 * 
 * @example
 * ```typescript
 * isValidNotificationType('follows') // true
 * isValidNotificationType('invalid') // false
 * ```
 */
export function isValidNotificationType(type: string): type is NotificationType {
  const validTypes: NotificationType[] = [
    'follows',
    'likes',
    'recasts',
    'mentions',
    'replies',
  ];
  return validTypes.includes(type as NotificationType);
}

// ============================================================================
// Notification Properties
// ============================================================================

/**
 * Gets notification type label
 * 
 * @param type - Notification type
 * @returns Display label
 * 
 * @example
 * ```typescript
 * getNotificationTypeLabel('follows') // 'Follow'
 * getNotificationTypeLabel('likes') // 'Like'
 * ```
 */
export function getNotificationTypeLabel(type: NotificationType): string {
  const labels: Record<NotificationType, string> = {
    follows: 'Follow',
    likes: 'Like',
    recasts: 'Recast',
    mentions: 'Mention',
    replies: 'Reply',
  };
  return labels[type];
}

/**
 * Gets notification emoji
 * 
 * @param type - Notification type
 * @returns Emoji string
 * 
 * @example
 * ```typescript
 * getNotificationEmoji('follows') // '👤'
 * getNotificationEmoji('likes') // '❤️'
 * ```
 */
export function getNotificationEmoji(type: NotificationType): string {
  const emojis: Record<NotificationType, string> = {
    follows: '👤',
    likes: '❤️',
    recasts: '🔁',
    mentions: '💬',
    replies: '↩️',
  };
  return emojis[type];
}

/**
 * Checks if notification is read
 * 
 * Note: The Notification interface doesn't have an isRead property by default.
 * This function can be extended with your own read tracking logic.
 * 
 * @param notification - Notification object
 * @returns True if read (always false in base implementation)
 * 
 * @example
 * ```typescript
 * isRead(notification) // false
 * ```
 */
export function isRead(notification: Notification): boolean {
  // This would be tracked separately in your app (e.g., localStorage, database)
  return false;
}

/**
 * Checks if notification is unread
 * 
 * @param notification - Notification object
 * @returns True if unread
 * 
 * @example
 * ```typescript
 * isUnread(notification) // true
 * ```
 */
export function isUnread(notification: Notification): boolean {
  return !isRead(notification);
}

// ============================================================================
// Filtering
// ============================================================================

/**
 * Filters notifications by type
 * 
 * @param notifications - Notifications to filter
 * @param type - Notification type
 * @returns Filtered notifications
 * 
 * @example
 * ```typescript
 * const follows = filterByType(notifications, 'follows')
 * ```
 */
export function filterByType(
  notifications: Notification[],
  type: NotificationType
): Notification[] {
  return notifications.filter(n => n.type === type);
}

/**
 * Filters unread notifications
 * 
 * @param notifications - Notifications to filter
 * @returns Unread notifications
 * 
 * @example
 * ```typescript
 * const unread = filterUnread(notifications)
 * ```
 */
export function filterUnread(notifications: Notification[]): Notification[] {
  return notifications.filter(n => isUnread(n));
}

/**
 * Filters read notifications
 * 
 * @param notifications - Notifications to filter
 * @returns Read notifications
 * 
 * @example
 * ```typescript
 * const read = filterRead(notifications)
 * ```
 */
export function filterRead(notifications: Notification[]): Notification[] {
  return notifications.filter(n => isRead(n));
}

/**
 * Filters notifications by time range
 * 
 * @param notifications - Notifications to filter
 * @param startTime - Start timestamp (ms)
 * @param endTime - End timestamp (ms)
 * @returns Filtered notifications
 * 
 * @example
 * ```typescript
 * const recent = filterByTimeRange(
 *   notifications,
 *   Date.now() - 86400000,
 *   Date.now()
 * )
 * ```
 */
export function filterByTimeRange(
  notifications: Notification[],
  startTime: number,
  endTime: number
): Notification[] {
  return notifications.filter(n => {
    const timestamp = new Date(n.timestamp).getTime();
    return timestamp >= startTime && timestamp <= endTime;
  });
}

// ============================================================================
// Sorting
// ============================================================================

/**
 * Sorts notifications by recency (newest first)
 * 
 * @param notifications - Notifications to sort
 * @returns Sorted notifications
 * 
 * @example
 * ```typescript
 * const sorted = sortByRecent(notifications)
 * ```
 */
export function sortByRecent(notifications: Notification[]): Notification[] {
  return [...notifications].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

/**
 * Sorts notifications (unread first, then by recency)
 * 
 * @param notifications - Notifications to sort
 * @returns Sorted notifications
 * 
 * @example
 * ```typescript
 * const sorted = sortByUnreadFirst(notifications)
 * ```
 */
export function sortByUnreadFirst(notifications: Notification[]): Notification[] {
  return [...notifications].sort((a, b) => {
    if (isUnread(a) && isRead(b)) return -1;
    if (isRead(a) && isUnread(b)) return 1;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
}

// ============================================================================
// Grouping
// ============================================================================

/**
 * Groups notifications by type
 * 
 * @param notifications - Notifications to group
 * @returns Map of type to notifications
 * 
 * @example
 * ```typescript
 * const grouped = groupByType(notifications)
 * // { 'follows': [...], 'likes': [...] }
 * ```
 */
export function groupByType(
  notifications: Notification[]
): Record<NotificationType, Notification[]> {
  const grouped = {} as Record<NotificationType, Notification[]>;
  
  notifications.forEach(notification => {
    if (!grouped[notification.type]) {
      grouped[notification.type] = [];
    }
    grouped[notification.type].push(notification);
  });
  
  return grouped;
}

/**
 * Groups notifications by date (YYYY-MM-DD)
 * 
 * @param notifications - Notifications to group
 * @returns Map of date to notifications
 * 
 * @example
 * ```typescript
 * const grouped = groupByDate(notifications)
 * // { '2025-10-04': [...], '2025-10-03': [...] }
 * ```
 */
export function groupByDate(
  notifications: Notification[]
): Record<string, Notification[]> {
  const grouped: Record<string, Notification[]> = {};
  
  notifications.forEach(notification => {
    const date = new Date(notification.timestamp).toISOString().split('T')[0];
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(notification);
  });
  
  return grouped;
}

// ============================================================================
// Statistics
// ============================================================================

/**
 * Gets unread notification count
 * 
 * @param notifications - Notifications to count
 * @returns Unread count
 * 
 * @example
 * ```typescript
 * getUnreadCount(notifications) // 5
 * ```
 */
export function getUnreadCount(notifications: Notification[]): number {
  return filterUnread(notifications).length;
}

/**
 * Gets notification counts by type
 * 
 * @param notifications - Notifications to count
 * @returns Object with counts by type
 * 
 * @example
 * ```typescript
 * getNotificationCounts(notifications)
 * // { follows: 3, likes: 10, recasts: 5, ... }
 * ```
 */
export function getNotificationCounts(
  notifications: Notification[]
): Record<NotificationType, number> {
  const counts = {
    follows: 0,
    likes: 0,
    recasts: 0,
    mentions: 0,
    replies: 0,
  } as Record<NotificationType, number>;
  
  notifications.forEach(n => {
    counts[n.type]++;
  });
  
  return counts;
}

/**
 * Checks if there are unread notifications
 * 
 * @param notifications - Notifications to check
 * @returns True if has unread
 * 
 * @example
 * ```typescript
 * hasUnread(notifications) // true
 * ```
 */
export function hasUnread(notifications: Notification[]): boolean {
  return getUnreadCount(notifications) > 0;
}

// ============================================================================
// Formatting
// ============================================================================

/**
 * Formats notification count for display
 * 
 * @param count - Notification count
 * @returns Formatted string
 * 
 * @example
 * ```typescript
 * formatNotificationCount(1234) // '1.2K'
 * formatNotificationCount(5) // '5'
 * ```
 */
export function formatNotificationCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  if (count > 99) {
    return '99+';
  }
  return count.toString();
}

/**
 * Gets notification summary text
 * 
 * @param notification - Notification object
 * @returns Summary text
 * 
 * @example
 * ```typescript
 * getNotificationSummary(notification)
 * // 'alice followed you'
 * ```
 */
export function getNotificationSummary(notification: Notification): string {
  const type = notification.type;
  const actor = notification.actor?.username || 'Someone';
  
  const templates: Record<NotificationType, string> = {
    follows: `${actor} followed you`,
    likes: `${actor} liked your cast`,
    recasts: `${actor} recasted your cast`,
    mentions: `${actor} mentioned you`,
    replies: `${actor} replied to your cast`,
  };
  
  return templates[type];
}

/**
 * Gets relative time string
 * 
 * @param timestamp - ISO timestamp
 * @returns Relative time string
 * 
 * @example
 * ```typescript
 * getRelativeTime('2025-10-04T12:00:00Z')
 * // '2h ago'
 * ```
 */
export function getRelativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diff = now - then;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}

// ============================================================================
// Deduplication
// ============================================================================

/**
 * Deduplicates notifications by ID
 * 
 * @param notifications - Notifications with potential duplicates
 * @returns Unique notifications
 * 
 * @example
 * ```typescript
 * const unique = deduplicateNotifications(notifications)
 * ```
 */
export function deduplicateNotifications(
  notifications: Notification[]
): Notification[] {
  const seen = new Set<string>();
  return notifications.filter(notification => {
    if (seen.has(notification.id)) {
      return false;
    }
    seen.add(notification.id);
    return true;
  });
}

