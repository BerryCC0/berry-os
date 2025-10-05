'use client';

/**
 * Nouns Apollo Wrapper
 * Client-side wrapper that instantiates Apollo Client
 * This prevents SSR issues with Apollo Client instantiation
 */

import { type ReactNode, useMemo } from 'react';
import { ApolloProvider } from '../../Apollo/ApolloProvider';
import { createApolloClient } from '../../Apollo/client';

const NOUNS_SUBGRAPH_URL = 'https://api.goldsky.com/api/public/project_cldf2o9pqagp43svvbk5u3kmo/subgraphs/nouns/prod/gn';

interface NounsApolloWrapperProps {
  children: ReactNode;
}

export function NounsApolloWrapper({ children }: NounsApolloWrapperProps) {
  // Create Apollo client only on client side
  const client = useMemo(() => createApolloClient({
    uri: NOUNS_SUBGRAPH_URL,
    name: 'Nouns DAO Subgraph',
    enableRetry: true,
    retryAttempts: 3,
    retryDelay: 300,
    cacheConfig: {},
  }), []);

  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
}

