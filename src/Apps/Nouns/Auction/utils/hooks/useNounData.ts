/**
 * useNounData Hook
 * Fetches Noun data from database with GraphQL fallback
 * 
 * This hook implements a hybrid approach:
 * 1. Try to fetch from database first (for cached SVG and traits)
 * 2. Fall back to GraphQL if database fails or is unavailable
 * 3. Return null if both fail
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_NOUN } from '@/app/lib/Nouns/Goldsky/queries';
import type { Noun } from '@/app/lib/Nouns/Goldsky/utils/types';
import type { CompleteNoun } from '@/app/lib/Nouns/Database/types';

interface UseNounDataResult {
  noun: Noun | null;
  svgData: string | null;
  loading: boolean;
  error: Error | null;
  source: 'database' | 'graphql' | null;
}

/**
 * Hook to fetch Noun data from database with GraphQL fallback
 * 
 * @param nounId - The Noun ID to fetch (string format)
 * @returns Noun data, SVG, loading state, error, and data source
 */
export function useNounData(nounId: string | null): UseNounDataResult {
  const [nounFromDB, setNounFromDB] = useState<CompleteNoun | null>(null);
  const [dbLoading, setDbLoading] = useState<boolean>(false);
  const [dbError, setDbError] = useState<Error | null>(null);

  // Fetch from database
  useEffect(() => {
    if (!nounId) {
      setNounFromDB(null);
      setDbError(null);
      return;
    }

    setDbLoading(true);
    setDbError(null);

    fetch(`/api/nouns/fetch?id=${nounId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Database fetch failed: ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        if (data.noun) {
          setNounFromDB(data.noun);
          setDbError(null);
        } else {
          throw new Error('No noun data in response');
        }
      })
      .catch(err => {
        console.warn('Database fetch failed, will use GraphQL fallback:', err.message);
        setDbError(err instanceof Error ? err : new Error(String(err)));
        setNounFromDB(null);
      })
      .finally(() => {
        setDbLoading(false);
      });
  }, [nounId]);

  // Fallback to GraphQL if database fails
  const shouldSkipGraphQL = !nounId || (!dbError && nounFromDB !== null) || dbLoading;

  const { 
    data: graphQLData, 
    loading: graphQLLoading, 
    error: graphQLError 
  } = useQuery<{ noun: Noun }>(GET_NOUN, {
    variables: { id: nounId },
    skip: shouldSkipGraphQL,
    fetchPolicy: 'cache-first',
  });

  // Determine result
  const result: UseNounDataResult = useMemo(() => {
    // If database has data, use it
    if (nounFromDB?.noun) {
      // Convert database Noun format to GraphQL Noun format
      const dbNoun: Noun = {
        id: String(nounFromDB.noun.noun_id),
        seed: {
          id: String(nounFromDB.noun.noun_id),
          background: nounFromDB.noun.background,
          body: nounFromDB.noun.body,
          accessory: nounFromDB.noun.accessory,
          head: nounFromDB.noun.head,
          glasses: nounFromDB.noun.glasses,
        },
        owner: {
          id: nounFromDB.noun.current_owner,
          tokenBalance: '0',
          tokenBalanceRaw: '0',
        },
      };

      return {
        noun: dbNoun,
        svgData: nounFromDB.noun.svg_data,
        loading: false,
        error: null,
        source: 'database',
      };
    }

    // If GraphQL has data, use it
    if (graphQLData?.noun) {
      return {
        noun: graphQLData.noun,
        svgData: null, // No SVG from GraphQL
        loading: false,
        error: null,
        source: 'graphql',
      };
    }

    // Still loading
    if (dbLoading || graphQLLoading) {
      return {
        noun: null,
        svgData: null,
        loading: true,
        error: null,
        source: null,
      };
    }

    // Both failed
    if (dbError && graphQLError) {
      return {
        noun: null,
        svgData: null,
        loading: false,
        error: new Error('Failed to fetch from both database and GraphQL'),
        source: null,
      };
    }

    // No data yet
    return {
      noun: null,
      svgData: null,
      loading: false,
      error: null,
      source: null,
    };
  }, [nounFromDB, graphQLData, dbLoading, graphQLLoading, dbError, graphQLError]);

  return result;
}

