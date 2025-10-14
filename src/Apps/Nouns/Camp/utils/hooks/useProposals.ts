/**
 * useProposals Hook
 * Fetches proposals from Goldsky GraphQL with real-time contract state
 * 
 * Features:
 * - Automatic polling every 30 seconds when tab is active
 * - Stops polling when tab is inactive (battery efficient)
 * - Fresh data on component mount
 * - Seamless background updates
 */

'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { useReadContract } from 'wagmi';
import { GET_PROPOSALS, GET_VOTES_BY_PROPOSAL, nounsApolloClient } from '@/app/lib/Nouns/Goldsky';
import { GovernanceActions } from '@/app/lib/Nouns/Contracts';
import type { Proposal, Vote } from '@/app/lib/Nouns/Goldsky/utils/types';
import type { UIProposal } from '../types/camp';
import { ProposalFilter, ProposalSort } from '../types/camp';
import { filterProposals, sortProposals } from '../helpers/proposalHelpers';
import { useSmartPolling } from './useSmartPolling';

interface UseProposalsOptions {
  first?: number;
  skip?: number;
  filter?: ProposalFilter;
  sort?: ProposalSort;
  includeRealTimeState?: boolean;
}

interface UseProposalsReturn {
  proposals: UIProposal[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  hasMore: boolean;
  loadMore: () => void;
}

/**
 * Hook to fetch and manage proposals
 */
export function useProposals(options: UseProposalsOptions = {}): UseProposalsReturn {
  const {
    first = 20,
    skip = 0,
    filter = ProposalFilter.ALL,
    sort = ProposalSort.NEWEST,
    includeRealTimeState = false,
  } = options;

  // Fetch proposals from Goldsky with polling
  const { 
    data, 
    loading, 
    error, 
    refetch,
    startPolling,
    stopPolling,
  } = useQuery<{
    proposals: Proposal[];
  }>(GET_PROPOSALS, {
    variables: {
      first,
      skip,
      orderBy: 'createdBlock',
      orderDirection: 'desc',
    },
    client: nounsApolloClient,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  // Smart polling (30 seconds - important for voting)
  useSmartPolling({
    interval: 30000,
    startPolling,
    stopPolling,
  });

  // State for pagination
  const [currentSkip, setCurrentSkip] = useState(skip);

  // Process proposals
  const processedProposals = useMemo(() => {
    if (!data?.proposals) return [];

    let proposals = data.proposals as Proposal[];

    // Apply filter
    proposals = filterProposals(proposals, filter);

    // Apply sort
    proposals = sortProposals(proposals, sort);

    return proposals;
  }, [data, filter, sort]);

  // Convert to UI proposals
  const uiProposals: UIProposal[] = useMemo(() => {
    return processedProposals.map(proposal => ({
      ...proposal,
      isExpanded: false,
      isLoading: false,
    }));
  }, [processedProposals]);

  // Load more handler
  const loadMore = () => {
    const newSkip = currentSkip + first;
    setCurrentSkip(newSkip);
    refetch();
  };

  // Check if there are more proposals
  const hasMore = data?.proposals?.length === first;

  return {
    proposals: uiProposals,
    loading,
    error: error || null,
    refetch,
    hasMore,
    loadMore,
  };
}

/**
 * Hook to fetch a single proposal with real-time state
 */
export function useProposal(proposalId: string) {
  const { data, loading, error } = useQuery<{
    proposals: Proposal[];
  }>(GET_PROPOSALS, {
    variables: {
      first: 1,
      where: { id: proposalId },
    },
    client: nounsApolloClient,
    skip: !proposalId,
  });

  // Get real-time state from contract
  const { data: contractState } = useReadContract({
    ...GovernanceActions.state(BigInt(proposalId)),
    query: {
      enabled: !!proposalId && !loading,
    },
  });

  const proposal = useMemo(() => {
    if (!data?.proposals?.[0]) return null;

    const baseProposal = data.proposals[0] as Proposal;
    
    return {
      ...baseProposal,
      realTimeState: contractState ? Number(contractState) : undefined,
    } as UIProposal;
  }, [data, contractState]);

  return {
    proposal,
    loading,
    error: error || null,
  };
}

/**
 * Hook to check if user has voted on a proposal
 */
export function useHasVoted(proposalId: string, voterAddress?: string) {
  const { data, isLoading: loading } = useReadContract({
    ...GovernanceActions.getReceipt(BigInt(proposalId), voterAddress as `0x${string}`),
    query: {
      enabled: !!proposalId && !!voterAddress,
    },
  });

  const hasVoted = useMemo(() => {
    if (!data) return false;
    // Receipt structure: { hasVoted, support, votes }
    return (data as any)?.hasVoted || false;
  }, [data]);

  const voteSupport = useMemo(() => {
    if (!data || !hasVoted) return null;
    return (data as any)?.support;
  }, [data, hasVoted]);

  return {
    hasVoted,
    voteSupport,
    loading,
  };
}

/**
 * Hook to fetch votes for a specific proposal with polling
 */
export function useProposalVotes(proposalId: string, options: { first?: number; skip?: number } = {}) {
  const { first = 20, skip = 0 } = options;
  const [currentSkip, setCurrentSkip] = useState(skip);
  const [allVotes, setAllVotes] = useState<Vote[]>([]);

  const { 
    data, 
    loading, 
    error, 
    fetchMore,
    startPolling,
    stopPolling,
  } = useQuery<{
    votes: Vote[];
  }>(GET_VOTES_BY_PROPOSAL, {
    variables: {
      proposalId,
      first,
      skip: currentSkip,
    },
    client: nounsApolloClient,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    skip: !proposalId,
  });

  // Smart polling for proposal votes (30 seconds)
  useSmartPolling({
    interval: 30000,
    startPolling,
    stopPolling,
    enabled: !!proposalId,
  });
  
  // Update allVotes when data changes
  useEffect(() => {
    if (data?.votes) {
      if (currentSkip === 0) {
        // First load - replace all votes
        setAllVotes(data.votes as Vote[]);
      } else {
        // Pagination - append new votes
        setAllVotes(prev => [...prev, ...(data.votes as Vote[])]);
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
    return data?.votes?.length === first;
  }, [data, first]);

  const votes = useMemo(() => allVotes as Vote[], [allVotes]);

  return {
    votes,
    loading,
    error: error || null,
    hasMore,
    loadMore,
  };
}

