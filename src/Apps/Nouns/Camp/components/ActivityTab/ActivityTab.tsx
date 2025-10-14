/**
 * ActivityTab Component
 * Unified feed of all governance activity with infinite scroll
 */

'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { useActivityFeed } from '../../utils/hooks/useActivityFeed';
import ActivityItem from './components/ActivityItem';
import ProposalDetailsWrapper from './components/ProposalDetailsWrapper';
import styles from './ActivityTab.module.css';

interface ActivityTabProps {
  onVote?: (proposalId: string, support: number, reason?: string) => void;
}

export default function ActivityTab({ onVote }: ActivityTabProps) {
  const { activities, loading, error, hasMore, loadMore } = useActivityFeed({
    first: 30,
  });
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const prevActivitiesLengthRef = useRef(activities.length);

  // Preserve scroll position when new items load
  useEffect(() => {
    if (activities.length > prevActivitiesLengthRef.current && feedRef.current) {
      // New items were loaded - do nothing, browser should maintain scroll
      prevActivitiesLengthRef.current = activities.length;
    }
  }, [activities.length]);

  // Memoize activity items to prevent unnecessary re-renders
  const activityItems = useMemo(() => {
    return activities.map(activity => (
      <div key={activity.id}>
        <ActivityItem 
          activity={activity}
          isExpanded={expandedActivityId === activity.id}
          onClick={() => setExpandedActivityId(
            expandedActivityId === activity.id ? null : activity.id
          )}
        />
        {expandedActivityId === activity.id && activity.contextType === 'proposal' && (
          <ProposalDetailsWrapper 
            proposalId={activity.contextId}
            onClose={() => setExpandedActivityId(null)}
            onVote={(support, reason) => onVote?.(activity.contextId, support, reason)}
          />
        )}
      </div>
    ));
  }, [activities, expandedActivityId, onVote]);

  // Infinite scroll with IntersectionObserver
  useEffect(() => {
    if (!sentinelRef.current || loading || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
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
  }, [hasMore, loading, loadMore]);

  if (error) {
    return (
      <div className={styles.error}>
        <p>Error loading activity:</p>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Activity Feed */}
      <div className={styles.feed} ref={feedRef}>
        {activities.length === 0 && !loading ? (
          <div className={styles.empty}>
            <p>No activity found</p>
            <p className={styles.emptyHint}>
              Recent votes and signals will appear here
            </p>
          </div>
        ) : (
          <>
            {activityItems}

            {/* Sentinel for infinite scroll */}
            {hasMore && <div ref={sentinelRef} className={styles.sentinel} />}
          </>
        )}
      </div>
    </div>
  );
}

