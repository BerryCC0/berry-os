/**
 * Apollo Client - Error Utilities
 * 
 * Pure business logic for Apollo Client error handling
 */

import type { ServerError, ServerParseError } from '@apollo/client';
import type { GraphQLError } from 'graphql';
import type { ApolloErrorInfo, ErrorSeverity } from './types';

// Apollo Error interface
export interface ApolloError extends Error {
  graphQLErrors: readonly GraphQLError[];
  networkError: Error | ServerError | ServerParseError | null;
  message: string;
}

// ============================================================================
// Error Detection
// ============================================================================

/**
 * Checks if error is an Apollo error
 * 
 * @param error - Error to check
 * @returns True if Apollo error
 * 
 * @example
 * ```typescript
 * if (isApolloError(error)) {
 *   // Handle Apollo-specific error
 * }
 * ```
 */
export function isApolloError(error: unknown): error is ApolloError {
  return error instanceof Error && 'graphQLErrors' in error && 'networkError' in error;
}

/**
 * Checks if error is a network error
 * 
 * @param error - Apollo error
 * @returns True if network error
 * 
 * @example
 * ```typescript
 * if (isNetworkError(error)) {
 *   // Show network error message
 * }
 * ```
 */
export function isNetworkError(error: ApolloError): boolean {
  return error.networkError !== null && error.networkError !== undefined;
}

/**
 * Checks if error is a GraphQL error
 * 
 * @param error - Apollo error
 * @returns True if GraphQL error
 * 
 * @example
 * ```typescript
 * if (isGraphQLError(error)) {
 *   // Show GraphQL error message
 * }
 * ```
 */
export function isGraphQLError(error: ApolloError): boolean {
  return error.graphQLErrors && error.graphQLErrors.length > 0;
}

/**
 * Checks if error is a server error
 * 
 * @param error - Network error
 * @returns True if server error
 * 
 * @example
 * ```typescript
 * if (isServerError(networkError)) {
 *   console.log('Status:', networkError.statusCode)
 * }
 * ```
 */
export function isServerError(error: Error | null | undefined): error is ServerError {
  return error !== null && error !== undefined && 'statusCode' in error;
}

// ============================================================================
// Error Extraction
// ============================================================================

/**
 * Extracts error message
 * 
 * @param error - Apollo error
 * @returns Error message
 * 
 * @example
 * ```typescript
 * const message = getErrorMessage(error)
 * ```
 */
export function getErrorMessage(error: ApolloError | undefined): string {
  if (!error) return 'Unknown error';
  
  if (isGraphQLError(error) && error.graphQLErrors[0]) {
    return error.graphQLErrors[0].message;
  }
  
  if (isNetworkError(error) && error.networkError) {
    return error.networkError.message;
  }
  
  return error.message || 'Unknown error';
}

/**
 * Extracts all error messages
 * 
 * @param error - Apollo error
 * @returns Array of error messages
 * 
 * @example
 * ```typescript
 * const messages = getAllErrorMessages(error)
 * messages.forEach(msg => console.error(msg))
 * ```
 */
export function getAllErrorMessages(error: ApolloError): string[] {
  const messages: string[] = [];
  
  if (error.graphQLErrors) {
    error.graphQLErrors.forEach((err: GraphQLError) => {
      messages.push(err.message);
    });
  }
  
  if (error.networkError) {
    messages.push(error.networkError.message);
  }
  
  if (messages.length === 0 && error.message) {
    messages.push(error.message);
  }
  
  return messages;
}

/**
 * Gets error status code
 * 
 * @param error - Apollo error
 * @returns Status code or null
 * 
 * @example
 * ```typescript
 * const status = getErrorStatusCode(error)
 * if (status === 404) {
 *   // Handle not found
 * }
 * ```
 */
export function getErrorStatusCode(error: ApolloError): number | null {
  if (error.networkError && isServerError(error.networkError)) {
    return error.networkError.statusCode;
  }
  return null;
}

// ============================================================================
// Error Classification
// ============================================================================

/**
 * Gets error severity
 * 
 * @param error - Apollo error
 * @returns Error severity
 * 
 * @example
 * ```typescript
 * const severity = getErrorSeverity(error)
 * if (severity === 'error') {
 *   // Critical error
 * }
 * ```
 */
export function getErrorSeverity(error: ApolloError): ErrorSeverity {
  const statusCode = getErrorStatusCode(error);
  
  if (statusCode && statusCode >= 500) return 'error';
  if (statusCode && statusCode >= 400) return 'warning';
  if (isNetworkError(error)) return 'error';
  if (isGraphQLError(error)) return 'warning';
  
  return 'info';
}

/**
 * Checks if error is retryable
 * 
 * @param error - Apollo error
 * @returns True if should retry
 * 
 * @example
 * ```typescript
 * if (isRetryableError(error)) {
 *   // Retry the request
 * }
 * ```
 */
export function isRetryableError(error: ApolloError): boolean {
  const statusCode = getErrorStatusCode(error);
  
  // Retry on network errors
  if (isNetworkError(error) && !statusCode) return true;
  
  // Retry on 5xx server errors
  if (statusCode && statusCode >= 500) return true;
  
  // Retry on specific 4xx errors
  if (statusCode && [408, 429].includes(statusCode)) return true;
  
  return false;
}

/**
 * Checks if error is authentication related
 * 
 * @param error - Apollo error
 * @returns True if auth error
 * 
 * @example
 * ```typescript
 * if (isAuthError(error)) {
 *   // Redirect to login
 * }
 * ```
 */
export function isAuthError(error: ApolloError): boolean {
  const statusCode = getErrorStatusCode(error);
  return statusCode === 401 || statusCode === 403;
}

/**
 * Checks if error is not found
 * 
 * @param error - Apollo error
 * @returns True if 404 error
 * 
 * @example
 * ```typescript
 * if (isNotFoundError(error)) {
 *   // Show not found message
 * }
 * ```
 */
export function isNotFoundError(error: ApolloError): boolean {
  return getErrorStatusCode(error) === 404;
}

// ============================================================================
// Error Formatting
// ============================================================================

/**
 * Formats error for display
 * 
 * @param error - Apollo error
 * @returns Formatted error message
 * 
 * @example
 * ```typescript
 * const formatted = formatError(error)
 * toast.error(formatted)
 * ```
 */
export function formatError(error: ApolloError): string {
  const message = getErrorMessage(error);
  const statusCode = getErrorStatusCode(error);
  
  if (statusCode) {
    return `Error ${statusCode}: ${message}`;
  }
  
  return message;
}

/**
 * Creates error info object
 * 
 * @param error - Apollo error
 * @returns Error info
 * 
 * @example
 * ```typescript
 * const info = createErrorInfo(error)
 * logger.error(info)
 * ```
 */
export function createErrorInfo(error: ApolloError): ApolloErrorInfo {
  return {
    message: getErrorMessage(error),
    severity: getErrorSeverity(error),
    graphQLErrors: error.graphQLErrors,
    networkError: error.networkError,
    timestamp: Date.now(),
  };
}

/**
 * Gets user-friendly error message
 * 
 * @param error - Apollo error
 * @returns User-friendly message
 * 
 * @example
 * ```typescript
 * const message = getUserFriendlyErrorMessage(error)
 * // 'Unable to connect. Please check your internet connection.'
 * ```
 */
export function getUserFriendlyErrorMessage(error: ApolloError): string {
  if (isNetworkError(error)) {
    return 'Unable to connect. Please check your internet connection.';
  }
  
  const statusCode = getErrorStatusCode(error);
  
  if (statusCode === 404) {
    return 'The requested resource was not found.';
  }
  
  if (statusCode === 401 || statusCode === 403) {
    return 'You are not authorized to access this resource.';
  }
  
  if (statusCode && statusCode >= 500) {
    return 'Server error. Please try again later.';
  }
  
  if (isGraphQLError(error)) {
    return getErrorMessage(error);
  }
  
  return 'An unexpected error occurred. Please try again.';
}

// ============================================================================
// Error Logging
// ============================================================================

/**
 * Logs error to console with formatting
 * 
 * @param error - Apollo error
 * @param context - Additional context
 * 
 * @example
 * ```typescript
 * logError(error, 'Failed to fetch nouns')
 * ```
 */
export function logError(error: ApolloError, context?: string): void {
  const info = createErrorInfo(error);
  const prefix = context ? `[${context}]` : '[Apollo Error]';
  
  console.error(`${prefix} ${info.message}`, {
    severity: info.severity,
    graphQLErrors: info.graphQLErrors,
    networkError: info.networkError,
    timestamp: new Date(info.timestamp).toISOString(),
  });
}

