/**
 * useAuction Hook
 * React hook for managing auction data fetching
 */

import { useQuery } from '@apollo/client/react';
import { useMemo } from 'react';
import { GET_CURRENT_AUCTION, GET_AUCTION } from '@/app/lib/Nouns/Goldsky/queries';
import type { Auction } from '@/app/lib/Nouns/Goldsky/utils/types';

interface AuctionQueryResult {
  auctions: Auction[];
}

interface UseAuctionResult {
  auction: Auction | null;
  loading: boolean;
  error: Error | undefined;
  refetch: () => void;
  isPolling: boolean; // True when background polling is happening
}

/**
 * Fetch current auction with polling
 * Uses Apollo cache to make polling invisible to users
 */
export function useCurrentAuction(pollInterval: number = 5000): UseAuctionResult {
  const { data, loading, error, refetch, networkStatus } = useQuery<AuctionQueryResult>(
    GET_CURRENT_AUCTION,
    {
      pollInterval,
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first',
      notifyOnNetworkStatusChange: true,
    }
  );

  const auction = useMemo(() => {
    return data?.auctions?.[0] || null;
  }, [data]);

  // Only show loading on initial load, not during background polling
  // NetworkStatus: 1 = loading, 6 = poll, 7 = ready
  const isInitialLoad = networkStatus === 1 && !data;
  const isPolling = networkStatus === 6;

  return {
    auction,
    loading: isInitialLoad,
    error,
    refetch,
    isPolling,
  };
}

/**
 * Fetch specific auction by ID
 * Uses Apollo cache for seamless updates
 */
export function useAuctionById(auctionId: string | null): UseAuctionResult {
  const { data, loading, error, refetch, networkStatus } = useQuery<{ auction: Auction }>(
    GET_AUCTION,
    {
      variables: { id: auctionId },
      skip: !auctionId,
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first',
      notifyOnNetworkStatusChange: true,
    }
  );

  const auction = useMemo(() => {
    return data?.auction || null;
  }, [data]);

  // Only show loading on initial load
  const isInitialLoad = networkStatus === 1 && !data;
  const isPolling = networkStatus === 6;

  return {
    auction,
    loading: isInitialLoad,
    error,
    refetch,
    isPolling,
  };
}

