/**
 * Apollo Client Factory
 * 
 * Generic Apollo Client configuration that can be used for any GraphQL endpoint
 */

import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';

/**
 * Apollo Client configuration options
 */
export interface ApolloClientConfig {
  uri: string;
  name?: string;
  enableRetry?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
  cacheConfig?: any;
}

/**
 * Creates a configured Apollo Client instance
 * 
 * @param config - Client configuration
 * @returns Configured Apollo Client
 * 
 * @example
 * ```typescript
 * const client = createApolloClient({
 *   uri: 'https://api.example.com/graphql',
 *   name: 'Example Subgraph',
 * });
 * ```
 */
export function createApolloClient(config: ApolloClientConfig): ApolloClient {
  const {
    uri,
    name = 'GraphQL API',
    enableRetry = true,
    retryAttempts = 3,
    retryDelay = 300,
    cacheConfig = {},
  } = config;

  // Error handling link
  const errorLink = onError(({ error }) => {
    console.error(`[${name} Error]: ${error.message}`, error);
  });

  // HTTP link
  const httpLink = new HttpLink({ uri });

  // Conditionally add retry link
  const links = [errorLink];
  
  if (enableRetry) {
    const retryLink = new RetryLink({
      delay: {
        initial: retryDelay,
        max: Infinity,
        jitter: true,
      },
      attempts: {
        max: retryAttempts,
        retryIf: (error) => !!error,
      },
    });
    links.push(retryLink);
  }
  
  links.push(httpLink);

  // Create Apollo Client
  return new ApolloClient({
    link: from(links),
    cache: new InMemoryCache(cacheConfig),
    devtools: {
      name,
    },
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
        errorPolicy: 'all',
      },
      query: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      },
      mutate: {
        errorPolicy: 'all',
      },
    },
  });
}

/**
 * Creates cache configuration for paginated queries
 * 
 * @param typePolicies - Additional type policies
 * @returns Cache configuration
 * 
 * @example
 * ```typescript
 * const cacheConfig = createPaginatedCacheConfig({
 *   Query: {
 *     fields: {
 *       customField: { ... }
 *     }
 *   }
 * });
 * ```
 */
export function createPaginatedCacheConfig(typePolicies?: any) {
  return {
    typePolicies: {
      Query: {
        fields: {
          // Generic pagination merge function
          ...typePolicies?.Query?.fields,
        },
      },
      ...typePolicies,
    },
  };
}

