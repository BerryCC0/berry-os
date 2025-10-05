/**
 * Apollo Client - Query Utilities
 * 
 * Pure business logic for Apollo Client query operations
 */

import type {
  DocumentNode,
  ApolloQueryResult,
  OperationVariables,
} from '@apollo/client';
import type { QueryOptions, PaginationOptions } from './types';

// ============================================================================
// Query Building
// ============================================================================

/**
 * Builds pagination variables
 * 
 * @param options - Pagination options
 * @returns GraphQL variables object
 * 
 * @example
 * ```typescript
 * const vars = buildPaginationVariables({ first: 10, skip: 20 })
 * // { first: 10, skip: 20 }
 * ```
 */
export function buildPaginationVariables(
  options: PaginationOptions
): Record<string, any> {
  const variables: Record<string, any> = {};
  
  if (options.first !== undefined) variables.first = options.first;
  if (options.skip !== undefined) variables.skip = options.skip;
  if (options.after) variables.after = options.after;
  if (options.before) variables.before = options.before;
  
  return variables;
}

/**
 * Builds ordering variables
 * 
 * @param orderBy - Field to order by
 * @param orderDirection - Direction ('asc' or 'desc')
 * @returns GraphQL variables object
 * 
 * @example
 * ```typescript
 * const vars = buildOrderingVariables('createdAt', 'desc')
 * // { orderBy: 'createdAt', orderDirection: 'desc' }
 * ```
 */
export function buildOrderingVariables(
  orderBy: string,
  orderDirection: 'asc' | 'desc' = 'desc'
): Record<string, any> {
  return {
    orderBy,
    orderDirection,
  };
}

/**
 * Merges multiple variable objects
 * 
 * @param variableObjects - Array of variable objects
 * @returns Merged variables object
 * 
 * @example
 * ```typescript
 * const vars = mergeVariables(
 *   { first: 10 },
 *   { orderBy: 'createdAt' },
 *   { where: { id: '1' } }
 * )
 * ```
 */
export function mergeVariables(
  ...variableObjects: Record<string, any>[]
): Record<string, any> {
  return Object.assign({}, ...variableObjects);
}

// ============================================================================
// Result Processing
// ============================================================================

/**
 * Extracts data from query result
 * 
 * @param result - Apollo query result
 * @returns Data or null
 * 
 * @example
 * ```typescript
 * const data = extractData(queryResult)
 * ```
 */
export function extractData<T>(
  result: ApolloQueryResult<T> | undefined
): T | null {
  if (!result || !result.data) return null;
  return result.data as T;
}

/**
 * Checks if query has data
 * 
 * @param result - Apollo query result
 * @returns True if has data
 * 
 * @example
 * ```typescript
 * if (hasData(result)) {
 *   // Process data
 * }
 * ```
 */
export function hasData<T>(
  result: ApolloQueryResult<T> | undefined
): boolean {
  return Boolean(result?.data);
}

/**
 * Checks if query is loading
 * 
 * @param loading - Loading state
 * @param networkStatus - Network status
 * @returns True if loading
 * 
 * @example
 * ```typescript
 * if (isLoading(loading, networkStatus)) {
 *   return <Spinner />
 * }
 * ```
 */
export function isLoading(
  loading: boolean,
  networkStatus?: number
): boolean {
  // NetworkStatus 1 = loading, 2 = setVariables, 3 = fetchMore, 4 = refetch
  return loading || (networkStatus !== undefined && networkStatus < 7);
}

/**
 * Checks if query is refetching
 * 
 * @param networkStatus - Network status
 * @returns True if refetching
 * 
 * @example
 * ```typescript
 * if (isRefetching(networkStatus)) {
 *   // Show subtle loading indicator
 * }
 * ```
 */
export function isRefetching(networkStatus?: number): boolean {
  // NetworkStatus 4 = refetch
  return networkStatus === 4;
}

/**
 * Checks if query is fetching more
 * 
 * @param networkStatus - Network status
 * @returns True if fetching more
 * 
 * @example
 * ```typescript
 * if (isFetchingMore(networkStatus)) {
 *   // Show pagination loading
 * }
 * ```
 */
export function isFetchingMore(networkStatus?: number): boolean {
  // NetworkStatus 3 = fetchMore
  return networkStatus === 3;
}

// ============================================================================
// Pagination
// ============================================================================

/**
 * Calculates total pages
 * 
 * @param totalCount - Total item count
 * @param pageSize - Items per page
 * @returns Number of pages
 * 
 * @example
 * ```typescript
 * const pages = getTotalPages(100, 10) // 10
 * ```
 */
export function getTotalPages(totalCount: number, pageSize: number): number {
  if (pageSize <= 0) return 0;
  return Math.ceil(totalCount / pageSize);
}

/**
 * Checks if has next page
 * 
 * @param currentPage - Current page number (0-indexed)
 * @param totalCount - Total item count
 * @param pageSize - Items per page
 * @returns True if has next page
 * 
 * @example
 * ```typescript
 * if (hasNextPage(0, 100, 10)) {
 *   // Show next button
 * }
 * ```
 */
export function hasNextPage(
  currentPage: number,
  totalCount: number,
  pageSize: number
): boolean {
  return (currentPage + 1) * pageSize < totalCount;
}

/**
 * Checks if has previous page
 * 
 * @param currentPage - Current page number (0-indexed)
 * @returns True if has previous page
 * 
 * @example
 * ```typescript
 * if (hasPreviousPage(2)) {
 *   // Show previous button
 * }
 * ```
 */
export function hasPreviousPage(currentPage: number): boolean {
  return currentPage > 0;
}

/**
 * Calculates skip value for pagination
 * 
 * @param page - Page number (0-indexed)
 * @param pageSize - Items per page
 * @returns Skip value
 * 
 * @example
 * ```typescript
 * const skip = calculateSkip(2, 10) // 20
 * ```
 */
export function calculateSkip(page: number, pageSize: number): number {
  return page * pageSize;
}

// ============================================================================
// Query Options
// ============================================================================

/**
 * Creates default query options
 * 
 * @param overrides - Options to override defaults
 * @returns Query options
 * 
 * @example
 * ```typescript
 * const options = createQueryOptions({ fetchPolicy: 'cache-first' })
 * ```
 */
export function createQueryOptions(
  overrides?: Partial<QueryOptions>
): QueryOptions {
  return {
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
    ...overrides,
  };
}

/**
 * Creates polling query options
 * 
 * @param pollInterval - Poll interval in milliseconds
 * @param overrides - Additional options
 * @returns Query options with polling
 * 
 * @example
 * ```typescript
 * const options = createPollingOptions(5000) // Poll every 5 seconds
 * ```
 */
export function createPollingOptions(
  pollInterval: number,
  overrides?: Partial<QueryOptions>
): QueryOptions {
  return {
    ...createQueryOptions(overrides),
    pollInterval,
  };
}

