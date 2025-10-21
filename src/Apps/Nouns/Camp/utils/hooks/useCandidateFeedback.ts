/**
 * useCandidateFeedback Hook
 * Fetches feedback for a proposal candidate from Goldsky GraphQL
 * 
 * Features:
 * - Automatic polling every 45 seconds when tab is active
 * - Stops polling when tab is inactive
 * - Fresh data on component mount
 */

'use client';

import { useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { nounsApolloClient } from '@/app/lib/Nouns/Goldsky';
import { gql } from '@apollo/client';
import { useSmartPolling } from './useSmartPolling';

const GET_CANDIDATE_FEEDBACKS = gql`
  query GetCandidateFeedbacks(
    $candidateId: ID!
    $first: Int = 100
    $skip: Int = 0
  ) {
    candidateFeedbacks(
      where: { 
        candidate: $candidateId
      }
      first: $first
      skip: $skip
      orderBy: createdTimestamp
      orderDirection: desc
    ) {
      id
      voter {
        id
      }
      supportDetailed
      reason
      createdTimestamp
      createdBlock
      candidate {
        id
        slug
      }
    }
  }
`;

interface UseCandidateFeedbackReturn {
  feedback: any[];
  loading: boolean;
  error: Error | null;
  hasFeedback: boolean;
  refetch: () => void;
}

/**
 * Hook to fetch feedback for a specific candidate
 * Note: candidateId is a concatenation of proposer and slug
 */
export function useCandidateFeedback(
  proposer: string,
  slug: string
): UseCandidateFeedbackReturn {
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
    candidateFeedbacks: any[];
  }>(GET_CANDIDATE_FEEDBACKS, {
    variables: {
      candidateId,
      first: 100,
      skip: 0,
    },
    client: nounsApolloClient,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    skip: !proposer || !slug,
  });

  // Smart polling (45 seconds - same as candidates)
  useSmartPolling({
    interval: 45000,
    startPolling,
    stopPolling,
    enabled: !!proposer && !!slug,
  });

  const feedback = useMemo(() => {
    return data?.candidateFeedbacks || [];
  }, [data]);

  const hasFeedback = feedback.length > 0;

  return {
    feedback,
    loading,
    error: error || null,
    hasFeedback,
    refetch,
  };
}

