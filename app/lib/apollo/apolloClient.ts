/**
 * Apollo Client Configuration
 * GraphQL client for Nouns subgraph queries
 */

import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

// Nouns DAO Subgraph endpoints
const NOUNS_SUBGRAPH_URL = 'https://api.goldsky.com/api/public/project_cldf2o9pqagp43svvbk5u3kmo/subgraphs/nouns/prod/gn';

// Create Apollo Client for Nouns data
export const nounsClient = new ApolloClient({
  link: new HttpLink({
    uri: NOUNS_SUBGRAPH_URL,
  }),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
    query: {
      fetchPolicy: 'network-only',
    },
  },
});

// Optional: Create client for other subgraphs (ENS, etc.)
export const createGraphQLClient = (uri: string) => {
  return new ApolloClient({
    link: new HttpLink({ uri }),
    cache: new InMemoryCache(),
  });
};

