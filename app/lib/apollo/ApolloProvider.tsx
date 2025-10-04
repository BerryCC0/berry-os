/**
 * Apollo Provider Component
 * Wraps app with Apollo Client for GraphQL queries
 */

'use client';

import { ApolloProvider as BaseProvider } from '@apollo/client/react';
import { nounsClient } from './apolloClient';
import type { ReactNode } from 'react';

interface ApolloProviderProps {
  children: ReactNode;
}

export function ApolloProvider({ children }: ApolloProviderProps) {
  return (
    <BaseProvider client={nounsClient}>
      {children}
    </BaseProvider>
  );
}

