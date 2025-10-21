/**
 * Mini Apps - useMiniAppCatalog Hook
 * Custom hook for fetching and managing Mini Apps catalog
 */

import { useState, useEffect, useCallback } from 'react';
import type {
  MiniAppCatalogItem,
  MiniAppFilters,
  CatalogResponse,
} from '../types/miniAppTypes';
import { applyFilters } from '../helpers/filterHelpers';

interface UseMiniAppCatalogResult {
  items: MiniAppCatalogItem[];
  allItems: MiniAppCatalogItem[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useMiniAppCatalog(
  filters: MiniAppFilters
): UseMiniAppCatalogResult {
  const [allItems, setAllItems] = useState<MiniAppCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Fetch catalog from API
  const fetchCatalog = useCallback(
    async (nextCursor?: string, append: boolean = false) => {
      try {
        setLoading(true);
        setError(null);

        // Build query parameters
        const params = new URLSearchParams({
          limit: '50',
          time_window: filters.timeWindow,
        });

        if (nextCursor) {
          params.set('cursor', nextCursor);
        }

        // Add categories if selected
        if (filters.categories.length > 0) {
          params.set('categories', filters.categories.join(','));
        }

        // Add networks if selected
        if (filters.networks.length > 0) {
          params.set('networks', filters.networks.join(','));
        }

        const response = await fetch(`/api/miniapps/catalog?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch Mini Apps catalog');
        }

        const data: CatalogResponse = await response.json();

        if (append) {
          setAllItems((prev) => [...prev, ...(data.frames || [])]);
        } else {
          setAllItems(data.frames || []);
        }

        setCursor(data.next?.cursor || null);
        setHasMore(!!data.next?.cursor);
      } catch (err) {
        console.error('Error fetching Mini Apps catalog:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    },
    [filters.timeWindow, filters.categories, filters.networks]
  );

  // Initial fetch
  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  // Load more items (pagination)
  const loadMore = useCallback(async () => {
    if (!cursor || loading || !hasMore) return;
    await fetchCatalog(cursor, true);
  }, [cursor, loading, hasMore, fetchCatalog]);

  // Refresh catalog
  const refresh = useCallback(async () => {
    await fetchCatalog();
  }, [fetchCatalog]);

  // Apply client-side filters (search query)
  const filteredItems = applyFilters(allItems, filters);

  return {
    items: filteredItems,
    allItems,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}

