/**
 * useCandidateSignatures Hook
 * Fetches signatures for a proposal candidate from Goldsky GraphQL
 * 
 * Features:
 * - Automatic polling every 45 seconds when tab is active
 * - Stops polling when tab is inactive
 */

'use client';

import { useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { nounsApolloClient } from '@/app/lib/Nouns/Goldsky';
import { gql } from '@apollo/client';
import type { CandidateSignature } from '../types/camp';
import { useSmartPolling } from './useSmartPolling';

const GET_CANDIDATE_SIGNATURES = gql`
  query GetCandidateSignatures(
    $candidateId: ID!
  ) {
    proposalCandidate(id: $candidateId) {
      id
      proposer
      slug
      latestVersion {
        content {
          id
          contentSignatures(
            orderBy: createdTimestamp
            orderDirection: desc
            where: { canceled: false }
          ) {
            id
            signer {
              id
            }
            sig
            expirationTimestamp
            reason
            createdTimestamp
            createdBlock
            canceled
          }
        }
      }
    }
  }
`;

interface UseCandidateSignaturesReturn {
  signatures: CandidateSignature[];
  loading: boolean;
  error: Error | null;
  hasSignatures: boolean;
  refetch: () => void;
}

/**
 * Hook to fetch signatures for a specific candidate
 * Note: candidateId is a concatenation of proposer and slug
 */
export function useCandidateSignatures(
  proposer: string,
  slug: string
): UseCandidateSignaturesReturn {
  // Construct the composite candidate ID (proposer-slug, lowercase proposer)
  const candidateId = `${proposer.toLowerCase()}-${slug}`;
  
  const { 
    data, 
    loading, 
    error,
    refetch,
    startPolling,
    stopPolling,
  } = useQuery<{
    proposalCandidate: any;
  }>(GET_CANDIDATE_SIGNATURES, {
    variables: {
      candidateId,
    },
    client: nounsApolloClient,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    skip: !proposer || !slug,
  });

  // Smart polling (45 seconds)
  useSmartPolling({
    interval: 45000,
    startPolling,
    stopPolling,
    enabled: !!proposer && !!slug,
  });

  const signatures = useMemo(() => {
    if (!data?.proposalCandidate?.latestVersion?.content?.contentSignatures) return [];

    const sigs = data.proposalCandidate.latestVersion.content.contentSignatures;
    
    return sigs.map((sig: any) => ({
      id: sig.id,
      signer: sig.signer.id,
      sig: sig.sig,
      reason: sig.reason || '',
      expirationTimestamp: parseInt(sig.expirationTimestamp),
      createdTimestamp: parseInt(sig.createdTimestamp),
    }));
  }, [data]);

  const hasSignatures = signatures.length > 0;

  return {
    signatures,
    loading,
    error: error || null,
    hasSignatures,
    refetch,
  };
}

