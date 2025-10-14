/**
 * useActivityFeed Hook
 * Fetches and combines all governance activity into a unified feed
 */

'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@apollo/client/react';
import { 
  GET_ALL_VOTES, 
  GET_ALL_PROPOSAL_FEEDBACKS,
  GET_CANDIDATE_SIGNATURES,
  GET_CANDIDATE_FEEDBACKS,
  nounsApolloClient 
} from '@/app/lib/Nouns/Goldsky';
import type { Vote } from '@/app/lib/Nouns/Goldsky/utils/types';
import type { BaseActivityItem, UIActivityItem } from '../types/camp';
import { ActivityItemType as ItemType } from '../types/camp';

interface UseActivityFeedOptions {
  first?: number;
}

interface UseActivityFeedReturn {
  activities: UIActivityItem[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => void;
}

/**
 * Transform data into unified activity items
 */
function transformToActivityItems(
  votes: Vote[],
  proposalFeedbacks: any[],
  candidateSignatures: any[],
  candidateFeedbacks: any[]
): BaseActivityItem[] {
  const items: BaseActivityItem[] = [];

  // Add proposal votes
  votes.forEach(vote => {
    items.push({
      id: vote.id,
      type: ItemType.PROPOSAL_VOTE,
      timestamp: parseInt(vote.blockTimestamp),
      voter: vote.voter.id,
      reason: vote.reason,
      supportDetailed: vote.supportDetailed,
      contextId: vote.proposal.id,
      contextTitle: vote.proposal.title,
      contextType: 'proposal',
      originalData: vote,
    });
  });

  // Add proposal feedbacks
  proposalFeedbacks.forEach(feedback => {
    items.push({
      id: feedback.id,
      type: ItemType.PROPOSAL_FEEDBACK,
      timestamp: parseInt(feedback.createdTimestamp),
      voter: feedback.voter.id,
      reason: feedback.reason,
      supportDetailed: feedback.supportDetailed,
      contextId: feedback.proposal.id,
      contextTitle: feedback.proposal.title,
      contextType: 'proposal',
      originalData: feedback,
    });
  });

  // Add candidate signatures
  candidateSignatures.forEach(signature => {
    items.push({
      id: signature.id,
      type: ItemType.CANDIDATE_SIGNATURE,
      timestamp: parseInt(signature.createdTimestamp),
      voter: signature.signer.id,
      reason: signature.reason,
      supportDetailed: 1, // Signatures are always "for"
      contextId: signature.content.id,
      contextTitle: signature.content.title,
      contextType: 'candidate',
      originalData: signature,
    });
  });

  // Add candidate feedbacks
  candidateFeedbacks.forEach(feedback => {
    items.push({
      id: feedback.id,
      type: ItemType.CANDIDATE_FEEDBACK,
      timestamp: parseInt(feedback.createdTimestamp),
      voter: feedback.voter.id,
      reason: feedback.reason,
      supportDetailed: feedback.supportDetailed,
      contextId: feedback.candidate.id,
      contextTitle: feedback.candidate.slug,
      contextType: 'candidate',
      originalData: feedback,
    });
  });

  // Sort by timestamp (newest first)
  return items.sort((a, b) => b.timestamp - a.timestamp);
}

export function useActivityFeed(options: UseActivityFeedOptions = {}): UseActivityFeedReturn {
  const { first = 20 } = options;
  
  const [currentFirst, setCurrentFirst] = useState(first);

  // Fetch all activity types
  const { data: votesData, loading: votesLoading, error: votesError } = useQuery(
    GET_ALL_VOTES,
    {
      variables: { first: currentFirst, skip: 0 },
      client: nounsApolloClient,
      fetchPolicy: 'cache-first',
    }
  );

  const { data: feedbackData, loading: feedbackLoading, error: feedbackError } = useQuery(
    GET_ALL_PROPOSAL_FEEDBACKS,
    {
      variables: { first: currentFirst, skip: 0 },
      client: nounsApolloClient,
      fetchPolicy: 'cache-first',
    }
  );

  const { data: signaturesData, loading: signaturesLoading, error: signaturesError } = useQuery(
    GET_CANDIDATE_SIGNATURES,
    {
      variables: { first: currentFirst, skip: 0 },
      client: nounsApolloClient,
      fetchPolicy: 'cache-first',
    }
  );

  const { data: candidateFeedbackData, loading: candidateFeedbackLoading, error: candidateFeedbackError } = useQuery(
    GET_CANDIDATE_FEEDBACKS,
    {
      variables: { first: currentFirst, skip: 0 },
      client: nounsApolloClient,
      fetchPolicy: 'cache-first',
    }
  );

  // Combine loading states
  const loading = votesLoading || feedbackLoading || signaturesLoading || candidateFeedbackLoading;
  const error = votesError || feedbackError || signaturesError || candidateFeedbackError;

  // Transform and combine data
  const activities: UIActivityItem[] = useMemo(() => {
    const votes = ((votesData as any)?.votes || []) as Vote[];
    const proposalFeedbacks = (feedbackData as any)?.proposalFeedbacks || [];
    const candidateSignatures = (signaturesData as any)?.proposalCandidateSignatures || [];
    const candidateFeedbacks = (candidateFeedbackData as any)?.candidateFeedbacks || [];

    const baseItems = transformToActivityItems(
      votes,
      proposalFeedbacks,
      candidateSignatures,
      candidateFeedbacks
    );

    // Take top N items from combined sorted list
    return baseItems.slice(0, currentFirst);
  }, [votesData, feedbackData, signaturesData, candidateFeedbackData, currentFirst]);

  const loadMore = useCallback(() => {
    setCurrentFirst(prev => prev + first);
  }, [first]);

  // Simple hasMore check - if we got full results from any query, there might be more
  const hasMore = useMemo(() => {
    const votes = (votesData as any)?.votes?.length || 0;
    const feedbacks = (feedbackData as any)?.proposalFeedbacks?.length || 0;
    const signatures = (signaturesData as any)?.proposalCandidateSignatures?.length || 0;
    const candidateFeedbacks = (candidateFeedbackData as any)?.candidateFeedbacks?.length || 0;
    
    return votes >= currentFirst || 
           feedbacks >= currentFirst || 
           signatures >= currentFirst || 
           candidateFeedbacks >= currentFirst;
  }, [votesData, feedbackData, signaturesData, candidateFeedbackData, currentFirst]);

  return {
    activities,
    loading,
    error: error || null,
    hasMore,
    loadMore,
  };
}

