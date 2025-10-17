/**
 * useNouns Hook
 * Fetch paginated list of Nouns from the database
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { NounRecord, PaginatedResponse, NounQueryFilters } from '../types';

interface UseNounsOptions {
  limit?: number;
  filters?: NounQueryFilters;
  autoFetch?: boolean;
}

interface UseNounsResult {
  nouns: NounRecord[];
  isLoading: boolean;
  error: Error | null;
  pagination: {
    total: number;
    offset: number;
    hasMore: boolean;
  };
  fetchMore: () => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Fetch paginated list of Nouns from database
 */
export function useNouns(options: UseNounsOptions = {}): UseNounsResult {
  const {
    limit = 20,
    filters = {},
    autoFetch = true,
  } = options;

  const [nouns, setNouns] = useState<NounRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [offset, setOffset] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(false);

  const buildQueryString = useCallback((currentOffset: number) => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: currentOffset.toString(),
    });

    if (filters.owner) params.append('owner', filters.owner);
    if (filters.delegate) params.append('delegate', filters.delegate);
    if (filters.minId !== undefined) params.append('minId', filters.minId.toString());
    if (filters.maxId !== undefined) params.append('maxId', filters.maxId.toString());
    if (filters.createdAfter) params.append('createdAfter', filters.createdAfter);
    if (filters.createdBefore) params.append('createdBefore', filters.createdBefore);

    return params.toString();
  }, [limit, filters]);

  const fetchNouns = async (currentOffset: number, append: boolean = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const queryString = buildQueryString(currentOffset);
      const response = await fetch(`/api/nouns/list?${queryString}`);

      if (!response.ok) {
        throw new Error('Failed to fetch Nouns');
      }

      const data: PaginatedResponse<NounRecord> = await response.json();

      if (append) {
        setNouns(prev => [...prev, ...data.data]);
      } else {
        setNouns(data.data);
      }

      setTotal(data.pagination.total);
      setOffset(currentOffset);
      setHasMore(data.pagination.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMore = async () => {
    if (!hasMore || isLoading) return;
    await fetchNouns(offset + limit, true);
  };

  const refetch = async () => {
    setOffset(0);
    await fetchNouns(0, false);
  };

  useEffect(() => {
    if (autoFetch) {
      fetchNouns(0, false);
    }
  }, [autoFetch, buildQueryString]);

  return {
    nouns,
    isLoading,
    error,
    pagination: {
      total,
      offset,
      hasMore,
    },
    fetchMore,
    refetch,
  };
}

