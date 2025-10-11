/**
 * VotesList Component
 * Displays list of votes with infinite scroll
 */

'use client';

import { useEffect, useRef } from 'react';
import type { Vote } from '@/app/lib/Nouns/Goldsky/utils/types';
import VoteItem from './VoteItem';
import styles from './VotesList.module.css';

interface VotesListProps {
  votes: Vote[];
  loading: boolean;
  onLoadMore: () => void;
  hasMore: boolean;
}

export default function VotesList({ votes, loading, onLoadMore, hasMore }: VotesListProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Infinite scroll with IntersectionObserver
  useEffect(() => {
    if (!sentinelRef.current || loading || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      {
        threshold: 1.0,
        rootMargin: '100px', // Start loading slightly before reaching bottom
      }
    );

    observer.observe(sentinelRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loading, onLoadMore]);

  if (votes.length === 0 && !loading) {
    return (
      <div className={styles.empty}>
        <p>No votes found</p>
        <p className={styles.emptyHint}>
          Be the first to vote on this proposal
        </p>
      </div>
    );
  }

  return (
    <div className={styles.votesList}>
      <div className={styles.votesContainer}>
        {votes.map((vote) => (
          <VoteItem key={vote.id} vote={vote} />
        ))}
      </div>

      {/* Sentinel for infinite scroll */}
      {hasMore && (
        <div ref={sentinelRef} className={styles.sentinel}>
          {loading && (
            <div className={styles.loading}>
              <p>Loading more votes...</p>
            </div>
          )}
        </div>
      )}

      {/* Fallback load more button for mobile */}
      {hasMore && !loading && (
        <button className={styles.loadMoreButton} onClick={onLoadMore}>
          Load More Votes
        </button>
      )}

      {/* Initial loading state */}
      {loading && votes.length === 0 && (
        <div className={styles.loading}>
          <p>Loading votes...</p>
        </div>
      )}
    </div>
  );
}

