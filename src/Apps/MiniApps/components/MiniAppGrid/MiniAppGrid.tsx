/**
 * MiniAppGrid Component
 * Grid layout for displaying Mini Apps with infinite scroll
 */

'use client';

import type { MiniAppCatalogItem } from '../../utils/types/miniAppTypes';
import MiniAppCard from '../MiniAppCard/MiniAppCard';
import styles from './MiniAppGrid.module.css';

interface MiniAppGridProps {
  items: MiniAppCatalogItem[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  onLaunch: (miniApp: MiniAppCatalogItem) => void;
  onLoadMore: () => void;
}

export default function MiniAppGrid({
  items,
  loading,
  error,
  hasMore,
  onLaunch,
  onLoadMore,
}: MiniAppGridProps) {
  // Error state
  if (error && items.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>⚠️</div>
        <h3 className={styles.emptyTitle}>Error Loading Mini Apps</h3>
        <p className={styles.emptyMessage}>{error}</p>
      </div>
    );
  }

  // Loading state (initial)
  if (loading && items.length === 0) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className={styles.skeleton}>
            <div className={styles.skeletonIcon} />
            <div className={styles.skeletonText} />
            <div className={styles.skeletonTextShort} />
            <div className={styles.skeletonButton} />
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>🔍</div>
        <h3 className={styles.emptyTitle}>No Mini Apps Found</h3>
        <p className={styles.emptyMessage}>
          Try adjusting your filters or search query.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Grid */}
      <div className={styles.grid}>
        {items.map((miniApp) => (
          <MiniAppCard
            key={`${miniApp.author.fid}-${miniApp.frames_url}`}
            miniApp={miniApp}
            onLaunch={onLaunch}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className={styles.loadMore}>
          <button
            className={styles.loadMoreButton}
            onClick={onLoadMore}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {/* Loading indicator for pagination */}
      {loading && items.length > 0 && (
        <div className={styles.loadingMore}>
          <span className={styles.loadingText}>Loading more...</span>
        </div>
      )}
    </div>
  );
}

