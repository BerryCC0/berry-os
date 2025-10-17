/**
 * useNounSelector Hook
 * Fetches Nouns owned by wallet or treasury with SVG data from database
 */

'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_NOUNS_BY_OWNER } from '@/app/lib/Nouns/Goldsky/queries';
import type { Noun } from '@/app/lib/Nouns/Goldsky/utils/types';

export interface NounWithSVG {
  id: string;
  owner: string;
  svgData: string | null;
  seed: {
    background: number;
    body: number;
    accessory: number;
    head: number;
    glasses: number;
  };
}

interface UseNounSelectorResult {
  nouns: NounWithSVG[];
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch Nouns owned by an address with SVG data
 * 
 * @param ownerAddress - Address to fetch Nouns for (wallet or treasury)
 * @returns Nouns with SVG data, loading state, and error
 */
export function useNounSelector(ownerAddress: string | null | undefined): UseNounSelectorResult {
  const [nounsWithSVG, setNounsWithSVG] = useState<NounWithSVG[]>([]);
  const [svgLoading, setSvgLoading] = useState(false);

  // Fetch Nouns from GraphQL
  const { data, loading: graphQLLoading, error: graphQLError } = useQuery<{ nouns: Noun[] }>(
    GET_NOUNS_BY_OWNER,
    {
      variables: { 
        owner: ownerAddress?.toLowerCase(), 
        first: 1000 // Fetch up to 1000 Nouns (GraphQL max limit)
      },
      skip: !ownerAddress,
      fetchPolicy: 'cache-first',
    }
  );

  // Fetch SVG data for each Noun from database (batch)
  useEffect(() => {
    if (!data?.nouns || data.nouns.length === 0) {
      setNounsWithSVG([]);
      return;
    }

    setSvgLoading(true);

    // Extract all Noun IDs
    const nounIds = data.nouns.map(noun => parseInt(noun.id));

    // Fetch all Nouns in a single batch request
    fetch('/api/nouns/fetch-batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids: nounIds }),
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch Nouns batch');
        }
        const result = await response.json();
        
        // Map GraphQL Nouns to include SVG data from database
        const nounsWithSVGData = data.nouns.map((noun: Noun) => {
          const dbNoun = result.nouns[noun.id];
          
          return {
            id: noun.id,
            owner: noun.owner.id,
            svgData: dbNoun?.svg_data || null,
            seed: {
              background: noun.seed.background,
              body: noun.seed.body,
              accessory: noun.seed.accessory,
              head: noun.seed.head,
              glasses: noun.seed.glasses,
            },
          };
        });
        
        // Sort by ID ascending (lowest to highest)
        nounsWithSVGData.sort((a, b) => parseInt(a.id) - parseInt(b.id));
        
        setNounsWithSVG(nounsWithSVGData);
        setSvgLoading(false);
      })
      .catch(err => {
        console.error('Error fetching Nouns batch:', err);
        
        // Fallback: Return Nouns without SVG data
        const nounsWithoutSVG = data.nouns.map((noun: Noun) => ({
          id: noun.id,
          owner: noun.owner.id,
          svgData: null,
          seed: {
            background: noun.seed.background,
            body: noun.seed.body,
            accessory: noun.seed.accessory,
            head: noun.seed.head,
            glasses: noun.seed.glasses,
          },
        }));
        
        // Sort by ID ascending (lowest to highest)
        nounsWithoutSVG.sort((a, b) => parseInt(a.id) - parseInt(b.id));
        
        setNounsWithSVG(nounsWithoutSVG);
        setSvgLoading(false);
      });
  }, [data]);

  return {
    nouns: nounsWithSVG,
    loading: graphQLLoading || svgLoading,
    error: graphQLError ? new Error(graphQLError.message) : null,
  };
}

