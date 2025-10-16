/**
 * useActivityFeed Hook
 * Fetches and combines all governance activity into a unified feed
 * 
 * Features:
 * - Automatic polling every 15 seconds when tab is active
 * - Stops polling when tab is inactive (battery efficient)
 * - Fresh data on component mount
 * - Seamless background updates (no loading states)
 */

'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { useSmartPolling } from './useSmartPolling';
import { 
  GET_ALL_VOTES, 
  GET_ALL_PROPOSAL_FEEDBACKS,
  GET_CANDIDATE_SIGNATURES,
  GET_CANDIDATE_FEEDBACKS,
  GET_RECENT_PROPOSALS,
  GET_RECENT_PROPOSAL_VERSIONS,
  GET_PROPOSAL_CANDIDATES,
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
 * Consolidate events that occur within a time window
 */
function consolidateEvents(items: BaseActivityItem[]): BaseActivityItem[] {
  const CONSOLIDATION_WINDOW = 5 * 60; // 5 minutes in seconds
  
  // Group by contextId (proposal/candidate ID) and type
  const grouped = new Map<string, BaseActivityItem[]>();
  
  items.forEach(item => {
    // Only consolidate update events
    if (item.type === ItemType.PROPOSAL_UPDATED || item.type === ItemType.CANDIDATE_UPDATED) {
      const key = `${item.contextType}-${item.contextId}-${item.type}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(item);
    }
  });
  
  // Create consolidated items
  const consolidated: BaseActivityItem[] = [];
  const consolidatedIds = new Set<string>();
  
  grouped.forEach(events => {
    // Sort by timestamp
    events.sort((a, b) => a.timestamp - b.timestamp);
    
    let currentGroup: BaseActivityItem[] = [events[0]];
    
    for (let i = 1; i < events.length; i++) {
      const timeDiff = events[i].timestamp - currentGroup[currentGroup.length - 1].timestamp;
      
      if (timeDiff <= CONSOLIDATION_WINDOW) {
        // Within window - add to current group
        currentGroup.push(events[i]);
        consolidatedIds.add(events[i].id);
      } else {
        // Outside window - create consolidated item and start new group
        if (currentGroup.length > 1) {
          consolidated.push(createConsolidatedItem(currentGroup));
          currentGroup.forEach(e => consolidatedIds.add(e.id));
        }
        currentGroup = [events[i]];
      }
    }
    
    // Add final group
    if (currentGroup.length > 1) {
      consolidated.push(createConsolidatedItem(currentGroup));
      currentGroup.forEach(e => consolidatedIds.add(e.id));
    }
  });
  
  // Add non-consolidated items and consolidated items
  const result = items.filter(item => !consolidatedIds.has(item.id));
  result.push(...consolidated);
  
  return result.sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Create a consolidated item from multiple events
 */
function createConsolidatedItem(events: BaseActivityItem[]): BaseActivityItem {
  // Take most recent event as base
  const latest = events[events.length - 1];
  
  return {
    ...latest,
    consolidatedEvents: events,
    consolidatedCount: events.length,
  };
}

/**
 * Transform data into unified activity items
 */
function transformToActivityItems(
  votes: Vote[],
  proposalFeedbacks: any[],
  candidateSignatures: any[],
  candidateFeedbacks: any[],
  proposals: any[],
  proposalVersions: any[],
  candidates: any[]
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

  // Add proposal lifecycle events
  proposals.forEach(proposal => {
    // Add proposal creation
    items.push({
      id: `proposal-created-${proposal.id}`,
      type: ItemType.PROPOSAL_CREATED,
      timestamp: parseInt(proposal.createdTimestamp),
      voter: proposal.proposer.id,
      supportDetailed: 1, // Neutral/informational
      contextId: proposal.id,
      contextTitle: proposal.title,
      contextType: 'proposal',
      originalData: proposal,
    });

    // Add proposal status changes
    if (proposal.status === 'SUCCEEDED' || proposal.status === 'DEFEATED') {
      // Use end block timestamp or fallback to created timestamp
      const endTimestamp = proposal.endBlock ? parseInt(proposal.endBlock) : parseInt(proposal.createdTimestamp);
      items.push({
        id: `proposal-ended-${proposal.id}`,
        type: ItemType.PROPOSAL_ENDED,
        timestamp: endTimestamp,
        voter: proposal.proposer.id,
        supportDetailed: proposal.status === 'SUCCEEDED' ? 1 : 0,
        contextId: proposal.id,
        contextTitle: proposal.title,
        contextType: 'proposal',
        originalData: proposal,
        statusInfo: proposal.status,
      });
    }

    if (proposal.status === 'QUEUED' && proposal.queuedTimestamp) {
      items.push({
        id: `proposal-queued-${proposal.id}`,
        type: ItemType.PROPOSAL_QUEUED,
        timestamp: parseInt(proposal.queuedTimestamp),
        voter: proposal.proposer.id,
        supportDetailed: 1,
        contextId: proposal.id,
        contextTitle: proposal.title,
        contextType: 'proposal',
        originalData: proposal,
      });
    }

    if (proposal.status === 'EXECUTED' && proposal.executedTimestamp) {
      items.push({
        id: `proposal-executed-${proposal.id}`,
        type: ItemType.PROPOSAL_EXECUTED,
        timestamp: parseInt(proposal.executedTimestamp),
        voter: proposal.proposer.id,
        supportDetailed: 1,
        contextId: proposal.id,
        contextTitle: proposal.title,
        contextType: 'proposal',
        originalData: proposal,
      });
    }
  });

  // Add proposal updates
  proposalVersions.forEach(version => {
    items.push({
      id: version.id,
      type: ItemType.PROPOSAL_UPDATED,
      timestamp: parseInt(version.createdAt),
      voter: version.proposal.proposer.id,
      supportDetailed: 1,
      contextId: version.proposal.id,
      contextTitle: version.title,
      contextType: 'proposal',
      originalData: version,
      updateMessage: version.updateMessage,
    });
  });

  // Add candidate lifecycle events
  candidates.forEach(candidate => {
    // Add candidate creation
    items.push({
      id: `candidate-created-${candidate.id}`,
      type: ItemType.CANDIDATE_CREATED,
      timestamp: parseInt(candidate.createdTimestamp),
      voter: candidate.proposer, // proposer is a Bytes! (address string)
      supportDetailed: 1, // Neutral/informational
      contextId: candidate.id,
      contextTitle: candidate.slug,
      contextType: 'candidate',
      originalData: candidate,
    });

    // Add candidate updates if there are versions
    if (candidate.versions && candidate.versions.length > 0) {
      candidate.versions.forEach((version: any, index: number) => {
        // Skip the first version as it's the creation
        if (index > 0) {
          items.push({
            id: `candidate-updated-${candidate.id}-v${index + 1}`,
            type: ItemType.CANDIDATE_UPDATED,
            timestamp: parseInt(version.createdAt || version.createdTimestamp),
            voter: candidate.proposer, // proposer is a Bytes! (address string)
            supportDetailed: 1,
            contextId: candidate.id,
            contextTitle: version.title || candidate.slug,
            contextType: 'candidate',
            originalData: { ...candidate, currentVersion: version },
            updateMessage: version.updateMessage,
          });
        }
      });
    }
  });

  // Consolidate events within time windows
  return consolidateEvents(items);
}

export function useActivityFeed(options: UseActivityFeedOptions = {}): UseActivityFeedReturn {
  const { first = 20 } = options;
  
  const [currentFirst, setCurrentFirst] = useState(first);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Fetch all activity types with cache-and-network + polling
  const { 
    data: votesData, 
    loading: votesLoading, 
    error: votesError,
    startPolling: startVotesPolling,
    stopPolling: stopVotesPolling,
  } = useQuery(
    GET_ALL_VOTES,
    {
      variables: { first: currentFirst, skip: 0 },
      client: nounsApolloClient,
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first',
    }
  );

  const { 
    data: feedbackData, 
    loading: feedbackLoading, 
    error: feedbackError,
    startPolling: startFeedbackPolling,
    stopPolling: stopFeedbackPolling,
  } = useQuery(
    GET_ALL_PROPOSAL_FEEDBACKS,
    {
      variables: { first: currentFirst, skip: 0 },
      client: nounsApolloClient,
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first',
    }
  );

  const { 
    data: signaturesData, 
    loading: signaturesLoading, 
    error: signaturesError,
    startPolling: startSignaturesPolling,
    stopPolling: stopSignaturesPolling,
  } = useQuery(
    GET_CANDIDATE_SIGNATURES,
    {
      variables: { first: currentFirst, skip: 0 },
      client: nounsApolloClient,
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first',
    }
  );

  const { 
    data: candidateFeedbackData, 
    loading: candidateFeedbackLoading, 
    error: candidateFeedbackError,
    startPolling: startCandidateFeedbackPolling,
    stopPolling: stopCandidateFeedbackPolling,
  } = useQuery(
    GET_CANDIDATE_FEEDBACKS,
    {
      variables: { first: currentFirst, skip: 0 },
      client: nounsApolloClient,
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first',
    }
  );

  const { 
    data: proposalsData, 
    loading: proposalsLoading, 
    error: proposalsError,
    startPolling: startProposalsPolling,
    stopPolling: stopProposalsPolling,
  } = useQuery(
    GET_RECENT_PROPOSALS,
    {
      variables: { first: currentFirst, skip: 0 },
      client: nounsApolloClient,
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first',
    }
  );

  const { 
    data: proposalVersionsData, 
    loading: proposalVersionsLoading, 
    error: proposalVersionsError,
    startPolling: startProposalVersionsPolling,
    stopPolling: stopProposalVersionsPolling,
  } = useQuery(
    GET_RECENT_PROPOSAL_VERSIONS,
    {
      variables: { first: currentFirst, skip: 0 },
      client: nounsApolloClient,
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first',
    }
  );

  const { 
    data: candidatesData, 
    loading: candidatesLoading, 
    error: candidatesError,
    startPolling: startCandidatesPolling,
    stopPolling: stopCandidatesPolling,
  } = useQuery(
    GET_PROPOSAL_CANDIDATES,
    {
      variables: { first: currentFirst, skip: 0 },
      client: nounsApolloClient,
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first',
    }
  );

  // Smart polling for all queries (15 seconds - most volatile data)
  useSmartPolling({
    interval: 15000,
    startPolling: (interval) => {
      startVotesPolling(interval);
      startFeedbackPolling(interval);
      startSignaturesPolling(interval);
      startCandidateFeedbackPolling(interval);
      startProposalsPolling(interval);
      startProposalVersionsPolling(interval);
      startCandidatesPolling(interval);
    },
    stopPolling: () => {
      stopVotesPolling();
      stopFeedbackPolling();
      stopSignaturesPolling();
      stopCandidateFeedbackPolling();
      stopProposalsPolling();
      stopProposalVersionsPolling();
      stopCandidatesPolling();
    },
  });

  // Combine loading states - only show loading on initial load, not when loading more
  const loading = isInitialLoad && (votesLoading || feedbackLoading || signaturesLoading || candidateFeedbackLoading || proposalsLoading || proposalVersionsLoading || candidatesLoading);
  const error = votesError || feedbackError || signaturesError || candidateFeedbackError || proposalsError || proposalVersionsError || candidatesError;
  
  // Mark initial load as complete once we have any data
  useEffect(() => {
    if (isInitialLoad && (votesData || feedbackData || signaturesData || candidateFeedbackData || proposalsData || proposalVersionsData || candidatesData)) {
      setIsInitialLoad(false);
    }
  }, [isInitialLoad, votesData, feedbackData, signaturesData, candidateFeedbackData, proposalsData, proposalVersionsData, candidatesData]);

  // Transform and combine data
  const activities: UIActivityItem[] = useMemo(() => {
    const votes = ((votesData as any)?.votes || []) as Vote[];
    const proposalFeedbacks = (feedbackData as any)?.proposalFeedbacks || [];
    const candidateSignatures = (signaturesData as any)?.proposalCandidateSignatures || [];
    const candidateFeedbacks = (candidateFeedbackData as any)?.candidateFeedbacks || [];
    const proposals = (proposalsData as any)?.proposals || [];
    const proposalVersions = (proposalVersionsData as any)?.proposalVersions || [];
    const candidates = (candidatesData as any)?.proposalCandidates || [];

    const baseItems = transformToActivityItems(
      votes,
      proposalFeedbacks,
      candidateSignatures,
      candidateFeedbacks,
      proposals,
      proposalVersions,
      candidates
    );

    // Take top N items from combined sorted list
    return baseItems.slice(0, currentFirst);
  }, [votesData, feedbackData, signaturesData, candidateFeedbackData, proposalsData, proposalVersionsData, candidatesData, currentFirst]);

  const loadMore = useCallback(() => {
    setCurrentFirst(prev => prev + first);
  }, [first]);

  // Simple hasMore check - if we got full results from any query, there might be more
  const hasMore = useMemo(() => {
    const votes = (votesData as any)?.votes?.length || 0;
    const feedbacks = (feedbackData as any)?.proposalFeedbacks?.length || 0;
    const signatures = (signaturesData as any)?.proposalCandidateSignatures?.length || 0;
    const candidateFeedbacks = (candidateFeedbackData as any)?.candidateFeedbacks?.length || 0;
    const proposals = (proposalsData as any)?.proposals?.length || 0;
    const proposalVersions = (proposalVersionsData as any)?.proposalVersions?.length || 0;
    const candidates = (candidatesData as any)?.proposalCandidates?.length || 0;
    
    return votes >= currentFirst || 
           feedbacks >= currentFirst || 
           signatures >= currentFirst || 
           candidateFeedbacks >= currentFirst ||
           proposals >= currentFirst ||
           proposalVersions >= currentFirst ||
           candidates >= currentFirst;
  }, [votesData, feedbackData, signaturesData, candidateFeedbackData, proposalsData, proposalVersionsData, candidatesData, currentFirst]);

  return {
    activities,
    loading,
    error: error || null,
    hasMore,
    loadMore,
  };
}

