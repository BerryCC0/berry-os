/**
 * Apollo Provider Component
 * 
 * Generic Apollo Provider wrapper - can be used with any Apollo Client
 */

'use client';

import { ApolloProvider as BaseProvider } from '@apollo/client/react';
import type { ApolloClient } from '@apollo/client';
import type { ReactNode } from 'react';

interface ApolloProviderProps {
  client: ApolloClient;
  children: ReactNode;
}

/**
 * Generic Apollo Provider
 * 
 * @example
 * ```typescript
 * import { ApolloProvider } from '@/app/lib/Apollo/ApolloProvider';
 * import { nounsApolloClient } from '@/app/lib/Nouns/apolloClient';
 * 
 * <ApolloProvider client={nounsApolloClient}>
 *   <YourApp />
 * </ApolloProvider>
 * ```
 */
export function ApolloProvider({ client, children }: ApolloProviderProps) {
  return (
    <BaseProvider client={client}>
      {children}
    </BaseProvider>
  );
}
