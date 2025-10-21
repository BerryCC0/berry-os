/**
 * InfiniteScroll Component
 * Automatically loads more content when user scrolls near the bottom
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import styles from './InfiniteScroll.module.css';

interface InfiniteScrollProps {
  children: React.ReactNode;
  onLoadMore: () => void;
  hasMore: boolean;
  loading?: boolean;
  threshold?: number; // Distance from bottom (in pixels) to trigger load
  className?: string;
}

export default function InfiniteScroll({
  children,
  onLoadMore,
  hasMore,
  loading = false,
  threshold = 500,
  className = '',
}: InfiniteScrollProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      
      // If the sentinel is visible and we have more items and not currently loading
      if (entry.isIntersecting && hasMore && !loading) {
        onLoadMore();
      }
    },
    [hasMore, loading, onLoadMore]
  );

  useEffect(() => {
    // Create intersection observer
    observerRef.current = new IntersectionObserver(handleIntersection, {
      root: null, // viewport
      rootMargin: `${threshold}px`, // Trigger before reaching the sentinel
      threshold: 0,
    });

    const sentinel = sentinelRef.current;
    if (sentinel) {
      observerRef.current.observe(sentinel);
    }

    // Cleanup
    return () => {
      if (observerRef.current && sentinel) {
        observerRef.current.unobserve(sentinel);
      }
    };
  }, [handleIntersection, threshold]);

  return (
    <div className={`${styles.container} ${className}`}>
      {children}
      
      {/* Sentinel element that triggers loading when visible */}
      {hasMore && (
        <div ref={sentinelRef} className={styles.sentinel}>
          {loading && (
            <div className={styles.loading}>
              <p>Loading more...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

