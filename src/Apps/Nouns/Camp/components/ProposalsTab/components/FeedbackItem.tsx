/**
 * FeedbackItem Component
 * Individual feedback signal display with ENS resolution
 */

'use client';

import { memo } from 'react';
import type { ProposalFeedback } from '@/app/lib/Nouns/Goldsky/utils/types';
import { formatRelativeTime, getSupportLabel } from '../../../utils/helpers/voterHelpers';
import { useENS, formatAddressWithENS } from '../../../utils/hooks/useENS';
import styles from './FeedbackList.module.css';

interface FeedbackItemProps {
  feedback: ProposalFeedback;
}

function FeedbackItem({ feedback }: FeedbackItemProps) {
  const voterAddress = feedback.voter.id;
  const { ensName } = useENS(voterAddress);
  const displayName = formatAddressWithENS(voterAddress, ensName);

  return (
    <div className={styles.feedbackItem}>
      <div className={styles.itemHeader}>
        <span className={styles.voter} title={voterAddress}>
          {displayName}
        </span>
        <span className={styles.timestamp}>
          {formatRelativeTime(feedback.createdTimestamp)}
        </span>
      </div>

      <div className={styles.itemContent}>
        <div className={styles.support}>
          Support: <strong>{getSupportLabel(feedback.supportDetailed)}</strong>
        </div>
        {feedback.reason && (
          <div className={styles.reason}>
            {feedback.reason}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(FeedbackItem);

