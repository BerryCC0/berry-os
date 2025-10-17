/**
 * useOwnershipHistory Hook
 * Fetch ownership transfer history for a Noun
 */

'use client';

import { useState, useEffect } from 'react';
import type { OwnershipHistoryRecord } from '../types';

interface UseOwnershipHistoryResult {
  transfers: OwnershipHistoryRecord[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Fetch ownership transfer history for a specific Noun
 * This requires fetching the complete Noun data since we don't have a dedicated endpoint
 */
export function useOwnershipHistory(nounId: number | null): UseOwnershipHistoryResult {
  const [transfers, setTransfers] = useState<OwnershipHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransfers = async () => {
    if (nounId === null) {
      setTransfers([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/nouns/fetch?id=${nounId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch Noun ${nounId}`);
      }

      const data = await response.json();
      setTransfers(data.noun.transfers || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setTransfers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, [nounId]);

  return {
    transfers,
    isLoading,
    error,
    refetch: fetchTransfers,
  };
}

