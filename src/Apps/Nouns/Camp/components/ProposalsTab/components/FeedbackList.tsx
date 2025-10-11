/**
 * FeedbackList Component
 * Displays proposal feedback signals (V3 governance)
 */

'use client';

import { memo } from 'react';
import type { ProposalFeedback } from '@/app/lib/Nouns/Goldsky/utils/types';
import FeedbackItem from './FeedbackItem';
import styles from './FeedbackList.module.css';

interface FeedbackListProps {
  feedback: ProposalFeedback[];
  isCollapsed: boolean;
  onToggle: () => void;
}

function FeedbackList({ feedback, isCollapsed, onToggle }: FeedbackListProps) {
  if (feedback.length === 0) {
    return null;
  }

  const displayCount = isCollapsed ? 3 : feedback.length;
  const displayFeedback = feedback.slice(0, displayCount);
  const hasMore = feedback.length > displayCount;

  return (
    <div className={styles.feedbackList}>
      <div className={styles.header}>
        <h4 className={styles.title}>
          Proposal Signals
          <span className={styles.count}>({feedback.length})</span>
        </h4>
        <button
          className={styles.toggleButton}
          onClick={onToggle}
        >
          {isCollapsed ? 'Show all' : 'Show less'}
        </button>
      </div>

      <div className={styles.items}>
        {displayFeedback.map((item) => (
          <FeedbackItem key={item.id} feedback={item} />
        ))}
      </div>

      {hasMore && isCollapsed && (
        <div className={styles.moreHint}>
          +{feedback.length - displayCount} more signals
        </div>
      )}
    </div>
  );
}

export default memo(FeedbackList);

