/**
 * useProposalFeedback Hook
 * Fetches proposal feedback/signals from Goldsky GraphQL (V3 governance)
 */

'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_PROPOSAL_FEEDBACK, nounsApolloClient } from '@/app/lib/Nouns/Goldsky';
import type { ProposalFeedback } from '@/app/lib/Nouns/Goldsky/utils/types';

interface UseProposalFeedbackOptions {
  first?: number;
  skip?: number;
}

interface UseProposalFeedbackReturn {
  feedback: ProposalFeedback[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  hasFeedback: boolean;
}

/**
 * Hook to fetch feedback signals for a specific proposal
 */
export function useProposalFeedback(
  proposalId: string,
  options: UseProposalFeedbackOptions = {}
): UseProposalFeedbackReturn {
  const { first = 100, skip = 0 } = options;
  const [currentSkip, setCurrentSkip] = useState(skip);
  const [allFeedback, setAllFeedback] = useState<ProposalFeedback[]>([]);

  const { data, loading, error, fetchMore } = useQuery<{
    proposalFeedbacks: ProposalFeedback[];
  }>(GET_PROPOSAL_FEEDBACK, {
    variables: {
      proposalId,
      first,
      skip: currentSkip,
    },
    client: nounsApolloClient,
    skip: !proposalId,
  });
  
  // Update allFeedback when data changes
  useEffect(() => {
    if (data?.proposalFeedbacks) {
      if (currentSkip === 0) {
        // First load - replace all feedback
        setAllFeedback(data.proposalFeedbacks as ProposalFeedback[]);
      } else {
        // Pagination - append new feedback
        setAllFeedback(prev => [...prev, ...(data.proposalFeedbacks as ProposalFeedback[])]);
      }
    }
  }, [data, currentSkip]);

  const loadMore = async () => {
    const newSkip = currentSkip + first;
    setCurrentSkip(newSkip);
    
    await fetchMore({
      variables: {
        proposalId,
        first,
        skip: newSkip,
      },
    });
  };

  const hasMore = useMemo(() => {
    return data?.proposalFeedbacks?.length === first;
  }, [data, first]);

  const feedback = useMemo(() => allFeedback as ProposalFeedback[], [allFeedback]);

  const hasFeedback = useMemo(() => feedback.length > 0, [feedback]);

  return {
    feedback,
    loading,
    error: error || null,
    hasMore,
    loadMore,
    hasFeedback,
  };
}

