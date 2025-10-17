/**
 * useCurrentAuction Hook
 * Fetch the currently active auction Noun
 */

'use client';

import { useState, useEffect } from 'react';
import type { CompleteNoun } from '../types';

interface UseCurrentAuctionResult {
  currentNoun: CompleteNoun | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Get the currently active auction Noun
 * 
 * This fetches the latest Noun from the database (highest noun_id)
 * and assumes it's the current auction.
 * 
 * For a more robust solution, you could:
 * 1. Check the auction's endTime to verify it's still active
 * 2. Query the blockchain directly for the current auction ID
 * 3. Use a separate API endpoint that determines the current auction
 * 
 * @param pollInterval - How often to poll for updates (default: 30 seconds)
 */
export function useCurrentAuction(pollInterval: number = 30000): UseCurrentAuctionResult {
  const [currentNoun, setCurrentNoun] = useState<CompleteNoun | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCurrent = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch latest Noun (highest noun_id)
      const listResponse = await fetch('/api/nouns/list?limit=1&offset=0');
      
      if (!listResponse.ok) {
        throw new Error('Failed to fetch latest Noun');
      }
      
      const listData = await listResponse.json();
      
      if (listData.data && listData.data.length > 0) {
        const latestNounId = listData.data[0].noun_id;
        
        // Fetch full data for latest Noun
        const nounResponse = await fetch(`/api/nouns/fetch?id=${latestNounId}`);
        
        if (!nounResponse.ok) {
          throw new Error(`Failed to fetch Noun ${latestNounId}`);
        }
        
        const nounData = await nounResponse.json();
        setCurrentNoun(nounData.noun);
      } else {
        setCurrentNoun(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setCurrentNoun(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchCurrent();
    
    // Poll for updates
    if (pollInterval > 0) {
      const interval = setInterval(fetchCurrent, pollInterval);
      return () => clearInterval(interval);
    }
  }, [pollInterval]);

  return {
    currentNoun,
    isLoading,
    error,
    refetch: fetchCurrent,
  };
}

