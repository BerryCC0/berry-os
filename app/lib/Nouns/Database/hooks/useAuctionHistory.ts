/**
 * useAuctionHistory Hook
 * Fetch auction history for a Noun
 */

'use client';

import { useState, useEffect } from 'react';
import type { AuctionHistoryRecord } from '../types';

interface UseAuctionHistoryResult {
  auction: AuctionHistoryRecord | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Fetch auction history for a specific Noun
 */
export function useAuctionHistory(nounId: number | null): UseAuctionHistoryResult {
  const [auction, setAuction] = useState<AuctionHistoryRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAuction = async () => {
    if (nounId === null) {
      setAuction(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/nouns/settler?nounId=${nounId}`);

      if (!response.ok) {
        if (response.status === 404) {
          setAuction(null);
          return;
        }
        throw new Error(`Failed to fetch auction for Noun ${nounId}`);
      }

      const data = await response.json();
      
      // Convert the API response to AuctionHistoryRecord format
      const auctionRecord: AuctionHistoryRecord = {
        id: 0, // Not provided by API
        noun_id: data.nounId,
        winner_address: data.winnerAddress,
        winning_bid_eth: data.winningBid,
        settler_address: data.settlerAddress,
        start_time: '0', // Not provided by API
        end_time: '0', // Not provided by API
        settled_timestamp: data.settledTimestamp,
        tx_hash: data.txHash,
        block_number: '0', // Not provided by API
        client_id: null,
        created_at: new Date(),
      };
      
      setAuction(auctionRecord);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setAuction(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuction();
  }, [nounId]);

  return {
    auction,
    isLoading,
    error,
    refetch: fetchAuction,
  };
}

