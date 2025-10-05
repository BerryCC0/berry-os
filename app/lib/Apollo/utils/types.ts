/**
 * Apollo Client - Type Definitions
 * 
 * TypeScript interfaces for Apollo Client utilities
 */

import type {
  ApolloQueryResult,
  FetchPolicy,
  WatchQueryFetchPolicy,
  ErrorPolicy,
} from '@apollo/client';

/**
 * Query options
 */
export interface QueryOptions {
  fetchPolicy?: FetchPolicy;
  errorPolicy?: ErrorPolicy;
  pollInterval?: number;
  notifyOnNetworkStatusChange?: boolean;
}

/**
 * Watch query options
 */
export interface WatchQueryOptions {
  fetchPolicy?: WatchQueryFetchPolicy;
  errorPolicy?: ErrorPolicy;
  pollInterval?: number;
  notifyOnNetworkStatusChange?: boolean;
}

/**
 * Pagination info
 */
export interface PaginationInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
  totalCount?: number;
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  first?: number;
  skip?: number;
  after?: string;
  before?: string;
}

/**
 * Query result with pagination
 */
export interface PaginatedQueryResult<T> {
  data: T;
  loading: boolean;
  error?: any;
  networkStatus: number;
  pageInfo?: PaginationInfo;
  fetchMore: () => Promise<void>;
}

/**
 * Cache operations
 */
export type CacheOperation = 'read' | 'write' | 'update' | 'evict';

/**
 * Cache policy
 */
export type CachePolicy = 'cache-first' | 'cache-only' | 'network-only' | 'no-cache' | 'cache-and-network';

/**
 * Error severity
 */
export type ErrorSeverity = 'error' | 'warning' | 'info';

/**
 * Apollo error info
 */
export interface ApolloErrorInfo {
  message: string;
  severity: ErrorSeverity;
  graphQLErrors?: readonly any[];
  networkError?: Error | null;
  timestamp: number;
}

/**
 * Query state
 */
export interface QueryState {
  loading: boolean;
  error: any;
  called: boolean;
  data: any;
}

/**
 * Optimistic response options
 */
export interface OptimisticResponseOptions<T> {
  typename: string;
  data: T;
  id?: string;
}

