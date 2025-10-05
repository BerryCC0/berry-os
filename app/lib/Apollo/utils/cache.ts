/**
 * Apollo Client - Cache Utilities
 * 
 * Pure business logic for Apollo Client cache operations
 */

import type { Reference, StoreObject } from '@apollo/client';

// ============================================================================
// Cache Key Generation
// ============================================================================

/**
 * Generates cache key for an object
 * 
 * @param typename - GraphQL typename
 * @param id - Object ID
 * @returns Cache key
 * 
 * @example
 * ```typescript
 * const key = generateCacheKey('Noun', '42')
 * // 'Noun:42'
 * ```
 */
export function generateCacheKey(typename: string, id: string | number): string {
  return `${typename}:${id}`;
}

/**
 * Parses cache key into typename and ID
 * 
 * @param cacheKey - Cache key
 * @returns Object with typename and id
 * 
 * @example
 * ```typescript
 * const { typename, id } = parseCacheKey('Noun:42')
 * // { typename: 'Noun', id: '42' }
 * ```
 */
export function parseCacheKey(cacheKey: string): { typename: string; id: string } {
  const [typename, id] = cacheKey.split(':');
  return { typename, id };
}

/**
 * Checks if cache key is valid
 * 
 * @param cacheKey - Cache key to validate
 * @returns True if valid
 * 
 * @example
 * ```typescript
 * isValidCacheKey('Noun:42') // true
 * isValidCacheKey('invalid') // false
 * ```
 */
export function isValidCacheKey(cacheKey: string): boolean {
  return cacheKey.includes(':') && cacheKey.split(':').length === 2;
}

// ============================================================================
// Cache Reference
// ============================================================================

/**
 * Creates cache reference
 * 
 * @param typename - GraphQL typename
 * @param id - Object ID
 * @returns Cache reference
 * 
 * @example
 * ```typescript
 * const ref = createCacheReference('Noun', '42')
 * ```
 */
export function createCacheReference(
  typename: string,
  id: string | number
): Reference {
  return {
    __ref: generateCacheKey(typename, id),
  };
}

/**
 * Checks if object is a cache reference
 * 
 * @param obj - Object to check
 * @returns True if is reference
 * 
 * @example
 * ```typescript
 * if (isCacheReference(obj)) {
 *   // Handle reference
 * }
 * ```
 */
export function isCacheReference(obj: any): obj is Reference {
  return obj && typeof obj === 'object' && '__ref' in obj;
}

// ============================================================================
// Cache Normalization
// ============================================================================

/**
 * Normalizes ID to string
 * 
 * @param id - ID to normalize
 * @returns String ID
 * 
 * @example
 * ```typescript
 * const normalized = normalizeId(42) // '42'
 * ```
 */
export function normalizeId(id: string | number | bigint): string {
  return String(id);
}

/**
 * Extracts ID from object
 * 
 * @param obj - Object with ID
 * @returns ID or null
 * 
 * @example
 * ```typescript
 * const id = extractId({ id: '42', name: 'Noun' }) // '42'
 * ```
 */
export function extractId(obj: StoreObject): string | null {
  if ('id' in obj && obj.id) {
    return normalizeId(obj.id as string | number);
  }
  return null;
}

// ============================================================================
// Cache Merging
// ============================================================================

/**
 * Merges arrays without duplicates
 * 
 * @param existing - Existing array
 * @param incoming - Incoming array
 * @param keyField - Field to use for uniqueness
 * @returns Merged array
 * 
 * @example
 * ```typescript
 * const merged = mergeArrays(
 *   [{ id: '1' }, { id: '2' }],
 *   [{ id: '2' }, { id: '3' }],
 *   'id'
 * )
 * ```
 */
export function mergeArrays<T extends Record<string, any>>(
  existing: T[] = [],
  incoming: T[] = [],
  keyField: keyof T = 'id' as keyof T
): T[] {
  const merged = [...existing];
  const existingKeys = new Set(existing.map(item => item[keyField]));
  
  incoming.forEach(item => {
    if (!existingKeys.has(item[keyField])) {
      merged.push(item);
    }
  });
  
  return merged;
}

/**
 * Prepends new items to array
 * 
 * @param existing - Existing array
 * @param incoming - Incoming array
 * @returns Prepended array
 * 
 * @example
 * ```typescript
 * const prepended = prependToArray([1, 2], [3, 4])
 * // [3, 4, 1, 2]
 * ```
 */
export function prependToArray<T>(
  existing: T[] = [],
  incoming: T[] = []
): T[] {
  return [...incoming, ...existing];
}

/**
 * Appends new items to array
 * 
 * @param existing - Existing array
 * @param incoming - Incoming array
 * @returns Appended array
 * 
 * @example
 * ```typescript
 * const appended = appendToArray([1, 2], [3, 4])
 * // [1, 2, 3, 4]
 * ```
 */
export function appendToArray<T>(
  existing: T[] = [],
  incoming: T[] = []
): T[] {
  return [...existing, ...incoming];
}

// ============================================================================
// Cache Invalidation
// ============================================================================

/**
 * Creates cache invalidation pattern
 * 
 * @param typename - GraphQL typename
 * @returns RegExp pattern
 * 
 * @example
 * ```typescript
 * const pattern = createInvalidationPattern('Noun')
 * // Matches 'Noun:1', 'Noun:42', etc.
 * ```
 */
export function createInvalidationPattern(typename: string): RegExp {
  return new RegExp(`^${typename}:`);
}

/**
 * Checks if cache key matches typename
 * 
 * @param cacheKey - Cache key to check
 * @param typename - Typename to match
 * @returns True if matches
 * 
 * @example
 * ```typescript
 * matchesTypename('Noun:42', 'Noun') // true
 * matchesTypename('Proposal:1', 'Noun') // false
 * ```
 */
export function matchesTypename(cacheKey: string, typename: string): boolean {
  return cacheKey.startsWith(`${typename}:`);
}

// ============================================================================
// Cache Optimization
// ============================================================================

/**
 * Calculates cache size estimate
 * 
 * @param data - Data to estimate
 * @returns Estimated size in bytes
 * 
 * @example
 * ```typescript
 * const size = estimateCacheSize({ large: 'object' })
 * ```
 */
export function estimateCacheSize(data: any): number {
  const json = JSON.stringify(data);
  return new Blob([json]).size;
}

/**
 * Checks if cache should be pruned
 * 
 * @param currentSize - Current cache size in bytes
 * @param maxSize - Maximum cache size in bytes
 * @returns True if should prune
 * 
 * @example
 * ```typescript
 * if (shouldPruneCache(5000000, 10000000)) {
 *   // Prune cache
 * }
 * ```
 */
export function shouldPruneCache(
  currentSize: number,
  maxSize: number
): boolean {
  return currentSize > maxSize * 0.8; // Prune at 80% capacity
}

