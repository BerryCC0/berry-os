/**
 * Neynar SDK - Storage Utilities
 * 
 * Pure business logic for handling Farcaster storage allocations.
 * No React dependencies - can be used in any context.
 * 
 * @module app/lib/neynar/utils/storage
 */

import type {
  StorageUsage,
} from './types';

// ============================================================================
// Calculations
// ============================================================================

/**
 * Calculates storage usage percentage
 * 
 * @param used - Storage used
 * @param total - Total storage
 * @returns Percentage (0-100)
 * 
 * @example
 * ```typescript
 * getUsagePercentage(750, 1000) // 75
 * ```
 */
export function getUsagePercentage(used: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((used / total) * 100);
}

/**
 * Calculates remaining storage
 * 
 * @param used - Storage used
 * @param total - Total storage
 * @returns Remaining storage
 * 
 * @example
 * ```typescript
 * getRemainingStorage(750, 1000) // 250
 * ```
 */
export function getRemainingStorage(used: number, total: number): number {
  return Math.max(0, total - used);
}

/**
 * Checks if storage is nearly full (>90%)
 * 
 * @param used - Storage used
 * @param total - Total storage
 * @returns True if nearly full
 * 
 * @example
 * ```typescript
 * isNearlyFull(950, 1000) // true
 * ```
 */
export function isNearlyFull(used: number, total: number): boolean {
  return getUsagePercentage(used, total) >= 90;
}

/**
 * Checks if storage is full (100%)
 * 
 * @param used - Storage used
 * @param total - Total storage
 * @returns True if full
 * 
 * @example
 * ```typescript
 * isFull(1000, 1000) // true
 * ```
 */
export function isFull(used: number, total: number): boolean {
  return used >= total;
}

// ============================================================================
// Storage Levels
// ============================================================================

/**
 * Gets storage level (low, medium, high, full)
 * 
 * @param used - Storage used
 * @param total - Total storage
 * @returns Storage level
 * 
 * @example
 * ```typescript
 * getStorageLevel(250, 1000) // 'low'
 * getStorageLevel(950, 1000) // 'high'
 * ```
 */
export function getStorageLevel(
  used: number,
  total: number
): 'low' | 'medium' | 'high' | 'full' {
  const percentage = getUsagePercentage(used, total);
  
  if (percentage >= 100) return 'full';
  if (percentage >= 90) return 'high';
  if (percentage >= 50) return 'medium';
  return 'low';
}

/**
 * Gets storage level color
 * 
 * @param used - Storage used
 * @param total - Total storage
 * @returns Color string
 * 
 * @example
 * ```typescript
 * getStorageLevelColor(950, 1000) // '#ff4444' (red)
 * ```
 */
export function getStorageLevelColor(used: number, total: number): string {
  const level = getStorageLevel(used, total);
  
  const colors = {
    low: '#4ade80',     // green
    medium: '#facc15',  // yellow
    high: '#fb923c',    // orange
    full: '#ff4444',    // red
  };
  
  return colors[level];
}

// ============================================================================
// Formatting
// ============================================================================

/**
 * Formats storage size for display
 * 
 * @param bytes - Storage in bytes
 * @returns Formatted string
 * 
 * @example
 * ```typescript
 * formatStorageSize(1024) // '1 KB'
 * formatStorageSize(1048576) // '1 MB'
 * ```
 */
export function formatStorageSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${units[i]}`;
}

/**
 * Formats storage units (casts/reactions)
 * 
 * @param count - Unit count
 * @returns Formatted string
 * 
 * @example
 * ```typescript
 * formatStorageUnits(1234) // '1.2K'
 * ```
 */
export function formatStorageUnits(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

/**
 * Gets storage summary text
 * 
 * @param used - Storage used
 * @param total - Total storage
 * @returns Summary text
 * 
 * @example
 * ```typescript
 * getStorageSummary(750, 1000)
 * // '750 / 1,000 (75%)'
 * ```
 */
export function getStorageSummary(used: number, total: number): string {
  const percentage = getUsagePercentage(used, total);
  return `${formatStorageUnits(used)} / ${formatStorageUnits(total)} (${percentage}%)`;
}

// ============================================================================
// Storage Object Utilities
// ============================================================================

/**
 * Gets storage usage
 * 
 * @param storage - Storage usage object
 * @returns Object with used/total/percentage
 * 
 * @example
 * ```typescript
 * getStorageUsageStats(storage)
 * // { used: 500, total: 1000, percentage: 50 }
 * ```
 */
export function getStorageUsageStats(storage: StorageUsage): {
  used: number;
  total: number;
  percentage: number;
} {
  const used = storage.unitsUsed || 0;
  const total = storage.unitsTotal || 0;
  
  return {
    used,
    total,
    percentage: getUsagePercentage(used, total),
  };
}


/**
 * Gets overall storage health score (0-100)
 * 
 * @param storage - Storage usage object
 * @returns Health score (higher is better)
 * 
 * @example
 * ```typescript
 * getStorageHealth(storage) // 75
 * ```
 */
export function getStorageHealth(storage: StorageUsage): number {
  const stats = getStorageUsageStats(storage);
  
  // Invert percentage (lower usage = higher health)
  return Math.round(100 - stats.percentage);
}

