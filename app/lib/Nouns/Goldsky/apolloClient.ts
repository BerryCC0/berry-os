/**
 * Nouns DAO - Apollo Client Instance
 * 
 * Configured Apollo Client for the Nouns DAO Subgraph on Goldsky
 */

import { createApolloClient, createPaginatedCacheConfig } from '../../Apollo/client';

// Nouns DAO Subgraph endpoint (Goldsky)
const NOUNS_SUBGRAPH_URL = 'https://api.goldsky.com/api/public/project_cldf2o9pqagp43svvbk5u3kmo/subgraphs/nouns/prod/gn';

/**
 * Cache configuration for Nouns entities
 * Note: Simplified for SSR compatibility
 */
const nounsCacheConfig = {};

/**
 * Nouns DAO Apollo Client
 * 
 * Use this client for all Nouns DAO subgraph queries
 * 
 * @example
 * ```typescript
 * import { nounsApolloClient } from '@/app/lib/Nouns/apolloClient';
 * 
 * const { data } = await nounsApolloClient.query({
 *   query: GET_NOUNS,
 *   variables: { first: 10 }
 * });
 * ```
 */
export const nounsApolloClient = createApolloClient({
  uri: NOUNS_SUBGRAPH_URL,
  name: 'Nouns DAO Subgraph',
  enableRetry: true,
  retryAttempts: 3,
  retryDelay: 300,
  cacheConfig: nounsCacheConfig,
});

export default nounsApolloClient;
