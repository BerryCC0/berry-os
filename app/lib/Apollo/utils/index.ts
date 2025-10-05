/**
 * Apollo Client - Business Logic Utilities Index
 * 
 * Central export point for all Apollo utilities
 */

// Type exports
export type {
  QueryOptions,
  WatchQueryOptions,
  PaginationInfo,
  PaginationOptions,
  PaginatedQueryResult,
  CacheOperation,
  CachePolicy,
  ErrorSeverity,
  ApolloErrorInfo,
  QueryState,
  OptimisticResponseOptions,
} from './types';

// Query utilities
export {
  buildPaginationVariables,
  buildOrderingVariables,
  mergeVariables,
  extractData,
  hasData,
  isLoading,
  isRefetching,
  isFetchingMore,
  getTotalPages,
  hasNextPage,
  hasPreviousPage,
  calculateSkip,
  createQueryOptions,
  createPollingOptions,
} from './query';

// Cache utilities
export {
  generateCacheKey,
  parseCacheKey,
  isValidCacheKey,
  createCacheReference,
  isCacheReference,
  normalizeId,
  extractId,
  mergeArrays,
  prependToArray,
  appendToArray,
  createInvalidationPattern,
  matchesTypename,
  estimateCacheSize,
  shouldPruneCache,
} from './cache';

// Error utilities
export {
  isApolloError,
  isNetworkError,
  isGraphQLError,
  isServerError,
  getErrorMessage,
  getAllErrorMessages,
  getErrorStatusCode,
  getErrorSeverity,
  isRetryableError,
  isAuthError,
  isNotFoundError,
  formatError,
  createErrorInfo,
  getUserFriendlyErrorMessage,
  logError,
} from './error';

