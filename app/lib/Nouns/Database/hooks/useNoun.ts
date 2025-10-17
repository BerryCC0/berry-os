/**
 * useNoun Hook
 * Fetch a single Noun from the database
 */

'use client';

import { useState, useEffect } from 'react';
import type { CompleteNoun } from '../types';

interface UseNounResult {
  noun: CompleteNoun | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Fetch a single Noun by ID from the database
 */
export function useNoun(nounId: number | null): UseNounResult {
  const [noun, setNoun] = useState<CompleteNoun | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchNoun = async () => {
    if (nounId === null) {
      setNoun(null);
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
      setNoun(data.noun);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setNoun(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNoun();
  }, [nounId]);

  return {
    noun,
    isLoading,
    error,
    refetch: fetchNoun,
  };
}

