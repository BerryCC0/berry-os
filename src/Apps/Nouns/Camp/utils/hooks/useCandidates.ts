/**
 * useCandidates Hook
 * Fetches proposal candidates from Goldsky GraphQL
 * 
 * Features:
 * - Automatic polling every 45 seconds when tab is active
 * - Stops polling when tab is inactive (battery efficient)
 * - Fresh data on component mount
 * - Seamless background updates
 */

'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { nounsApolloClient } from '@/app/lib/Nouns/Goldsky';
import { gql } from '@apollo/client';
import type { Candidate } from '../types/camp';
import { CandidateFilter, CandidateSort } from '../types/camp';
import { filterCandidates, sortCandidates } from '../helpers/candidateHelpers';
import { useSmartPolling } from './useSmartPolling';

const GET_PROPOSAL_CANDIDATES = gql`
  query GetProposalCandidates(
    $first: Int = 20
    $skip: Int = 0
    $where: ProposalCandidate_filter
  ) {
    proposalCandidates(
      first: $first
      skip: $skip
      orderBy: createdTimestamp
      orderDirection: desc
      where: $where
    ) {
      id
      proposer
      slug
      number
      createdTimestamp
      lastUpdatedTimestamp
      canceled
      canceledTimestamp
      latestVersion {
        id
        content {
          title
          description
          targets
          values
          signatures
          calldatas
          proposalIdToUpdate
        }
      }
      versions {
        id
      }
    }
  }
`;

interface UseCandidatesOptions {
  filter?: CandidateFilter;
  sort?: CandidateSort;
}

interface UseCandidatesReturn {
  candidates: Candidate[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to fetch and manage candidates with polling
 */
export function useCandidates(options: UseCandidatesOptions = {}): UseCandidatesReturn {
  const { filter = CandidateFilter.ALL, sort = CandidateSort.NEWEST } = options;

  // Fetch candidates from Goldsky with polling
  const { 
    data, 
    loading, 
    error, 
    refetch,
    startPolling,
    stopPolling,
  } = useQuery<{
    proposalCandidates: any[];
  }>(GET_PROPOSAL_CANDIDATES, {
    variables: {
      first: 100,
      skip: 0,
    },
    client: nounsApolloClient,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  // Smart polling (45 seconds - moderate updates)
  useSmartPolling({
    interval: 45000,
    startPolling,
    stopPolling,
  });

  // Transform GraphQL data to Candidate type
  const candidates = useMemo(() => {
    if (!data?.proposalCandidates) return [];
    
    return data.proposalCandidates.map((candidate: any) => {
      const content = candidate.latestVersion?.content;
      
      return {
        proposer: candidate.proposer,
        slug: candidate.slug,
        description: content?.description || '',
        createdTimestamp: parseInt(candidate.createdTimestamp),
        lastUpdatedTimestamp: parseInt(candidate.lastUpdatedTimestamp),
        canceled: candidate.canceled,
        feedbackCount: candidate.versions?.length || 0,
        // Get from latestVersion.content
        targets: content?.targets || [],
        values: content?.values?.map((v: string) => v.toString()) || [],
        signatures: content?.signatures || [],
        calldatas: content?.calldatas || [],
        proposalIdToUpdate: content?.proposalIdToUpdate?.toString() || '0',
        requiredSignatures: 0, // Not in schema, default to 0
      };
    });
  }, [data]);

  // Apply filters and sorting
  const processedCandidates = useMemo(() => {
    let filtered = filterCandidates(candidates, filter);
    return sortCandidates(filtered, sort);
  }, [candidates, filter, sort]);

  return {
    candidates: processedCandidates,
    loading,
    error: error || null,
    refetch,
  };
}

/**
 * Hook to fetch a single candidate
 */
export function useCandidate(proposer: string, slug: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Placeholder - would fetch specific candidate
  const candidate: Candidate | null = null;

  return {
    candidate,
    loading,
    error,
  };
}

/**
 * Hook to check if user can create candidates (owns Nouns or has paid fee)
 */
export function useCanCreateCandidate(address?: string) {
  // Placeholder - would check:
  // 1. If user owns Nouns (free)
  // 2. Or if user has paid the creation fee
  
  const canCreate = false;
  const requiresFee = true;
  const fee = '0.01'; // ETH

  return {
    canCreate,
    requiresFee,
    fee,
  };
}

