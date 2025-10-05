/**
 * Apollo Client - Main Export
 * 
 * Generic Apollo Client utilities for GraphQL integration
 */

// Client factory
export { createApolloClient, createPaginatedCacheConfig } from './client';
export type { ApolloClientConfig } from './client';

// Provider
export { ApolloProvider } from './ApolloProvider';

// Utilities
export * from './utils';

