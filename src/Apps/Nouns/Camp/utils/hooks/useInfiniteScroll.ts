/**
 * useInfiniteScroll Hook
 * Detects when user scrolls near the bottom of a container and triggers a callback
 * Used for automatic pagination
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  onLoadMore: () => void | Promise<void>;
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number; // How close to bottom (in pixels) before triggering
}

/**
 * Hook to implement infinite scroll behavior
 * 
 * @param options - Configuration for infinite scroll
 * @returns Ref to attach to the scrollable container
 * 
 * @example
 * const scrollRef = useInfiniteScroll({
 *   onLoadMore: loadMoreVotes,
 *   hasMore: hasMoreVotes,
 *   isLoading: isLoadingMoreVotes,
 *   threshold: 200,
 * });
 * 
 * <div ref={scrollRef}>...</div>
 */
export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  threshold = 300,
}: UseInfiniteScrollOptions) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      
      if (entry.isIntersecting && hasMore && !isLoading) {
        onLoadMore();
      }
    },
    [hasMore, isLoading, onLoadMore]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    
    if (!sentinel) return;

    // Create intersection observer
    observerRef.current = new IntersectionObserver(handleIntersection, {
      root: scrollRef.current,
      rootMargin: `${threshold}px`,
      threshold: 0,
    });

    observerRef.current.observe(sentinel);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection, threshold]);

  return {
    scrollRef,
    sentinelRef,
  };
}

