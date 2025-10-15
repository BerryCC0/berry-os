/**
 * useVoters Hook
 * Fetches delegates/voters from Goldsky GraphQL with contract reads
 * 
 * Features:
 * - Automatic polling every 60 seconds when tab is active
 * - Stops polling when tab is inactive (battery efficient)
 * - Fresh data on component mount
 * - Seamless background updates
 */

'use client';

import { useQuery } from '@apollo/client/react';
import { useState, useMemo } from 'react';
import { useReadContract, useAccount } from 'wagmi';
import { GET_DELEGATES, GET_TOP_DELEGATES, nounsApolloClient } from '@/app/lib/Nouns/Goldsky';
import { TokenActions } from '@/app/lib/Nouns/Contracts';
import type { Delegate } from '@/app/lib/Nouns/Goldsky/utils/types';
import type { UIDelegate } from '../types/camp';
import { VoterFilter, VoterSort } from '../types/camp';
import { filterDelegates, sortDelegates } from '../helpers/voterHelpers';
import { useSmartPolling } from './useSmartPolling';

interface UseVotersOptions {
  first?: number;
  skip?: number;
  filter?: VoterFilter;
  sort?: VoterSort;
  topOnly?: boolean;
}

interface UseVotersReturn {
  voters: UIDelegate[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  hasMore: boolean;
  loadMore: () => void;
}

/**
 * Hook to fetch and manage voters/delegates
 */
export function useVoters(options: UseVotersOptions = {}): UseVotersReturn {
  const {
    first = 20,
    skip = 0,
    filter = VoterFilter.ALL,
    sort = VoterSort.MOST_POWER,
    topOnly = false,
  } = options;

  const { address: userAddress } = useAccount();

  // Choose query based on topOnly flag
  const query = topOnly ? GET_TOP_DELEGATES : GET_DELEGATES;

  // Fetch delegates from Goldsky with polling
  const { 
    data, 
    loading, 
    error, 
    refetch,
    startPolling,
    stopPolling,
  } = useQuery<{
    delegates: Delegate[];
  }>(query, {
    variables: {
      first,
      skip,
    },
    client: nounsApolloClient,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  // Smart polling (60 seconds - least volatile data)
  useSmartPolling({
    interval: 60000,
    startPolling,
    stopPolling,
  });

  // State for pagination
  const [currentSkip, setCurrentSkip] = useState(skip);

  // Process delegates
  const processedDelegates = useMemo(() => {
    if (!data?.delegates) return [];

    let delegates = data.delegates as Delegate[];

    // Filter out Nouns Treasury (nouns.eth)
    const NOUNS_TREASURY_ADDRESS = '0xb1a32FC9F9D8b2cf86C068Cae13108809547ef71';
    delegates = delegates.filter(
      delegate => delegate.id.toLowerCase() !== NOUNS_TREASURY_ADDRESS.toLowerCase()
    );

    // Apply filter
    delegates = filterDelegates(delegates, filter);

    // Apply sort
    delegates = sortDelegates(delegates, sort);

    return delegates;
  }, [data, filter, sort]);

  // Convert to UI delegates
  const uiDelegates: UIDelegate[] = useMemo(() => {
    return processedDelegates.map(delegate => ({
      ...delegate,
      isExpanded: false,
      isCurrentUser: userAddress ? delegate.id.toLowerCase() === userAddress.toLowerCase() : false,
    }));
  }, [processedDelegates, userAddress]);

  // Load more handler
  const loadMore = () => {
    const newSkip = currentSkip + first;
    setCurrentSkip(newSkip);
    refetch();
  };

  // Check if there are more delegates
  const hasMore = data?.delegates?.length === first;

  return {
    voters: uiDelegates,
    loading,
    error: error || null,
    refetch,
    hasMore,
    loadMore,
  };
}

/**
 * Hook to get current user's voting power and delegation status
 */
export function useVotingPower(address?: string) {
  const { address: connectedAddress } = useAccount();
  const targetAddress = address || connectedAddress;

  // Get current votes (voting power)
  const { data: votingPower, isLoading: votingPowerLoading } = useReadContract({
    ...(targetAddress ? TokenActions.getCurrentVotes(targetAddress as `0x${string}`) : {}),
    query: {
      enabled: !!targetAddress,
    },
  });

  // Get current delegate
  const { data: delegate, isLoading: delegateLoading } = useReadContract({
    ...(targetAddress ? TokenActions.delegates(targetAddress as `0x${string}`) : {}),
    query: {
      enabled: !!targetAddress,
    },
  });

  // Get token balance
  const { data: balance, isLoading: balanceLoading } = useReadContract({
    ...(targetAddress ? TokenActions.balanceOf(targetAddress as `0x${string}`) : {}),
    query: {
      enabled: !!targetAddress,
    },
  });

  const isSelfDelegated = useMemo(() => {
    if (!targetAddress || !delegate) return false;
    return (delegate as string).toLowerCase() === targetAddress.toLowerCase();
  }, [targetAddress, delegate]);

  const loading = votingPowerLoading || delegateLoading || balanceLoading;

  return {
    votingPower: votingPower ? Number(votingPower) : 0,
    delegate: delegate as string | undefined,
    balance: balance ? Number(balance) : 0,
    isSelfDelegated,
    hasVotingPower: votingPower ? Number(votingPower) > 0 : false,
    ownsNouns: balance ? Number(balance) > 0 : false,
    loading,
  };
}

/**
 * Hook to fetch a single delegate
 */
export function useDelegate(address: string) {
  const { data, loading, error } = useQuery<{
    delegates: Delegate[];
  }>(GET_DELEGATES, {
    variables: {
      first: 1,
      where: { id: address.toLowerCase() },
    },
    client: nounsApolloClient,
    skip: !address,
  });

  const delegate = useMemo(() => {
    if (!data?.delegates?.[0]) return null;
    return data.delegates[0] as Delegate;
  }, [data]);

  return {
    delegate,
    loading,
    error: error || null,
  };
}

