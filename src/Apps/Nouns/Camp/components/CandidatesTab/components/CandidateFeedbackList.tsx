/**
 * CandidateFeedbackList Component
 * Display list of feedback signals on a candidate
 */

'use client';

import { useENS, formatAddressWithENS } from '../../../utils/hooks/useENS';
import { formatAbsoluteTime } from '../../../utils/helpers/candidateHelpers';
import styles from './CandidateFeedbackList.module.css';

interface FeedbackItemProps {
  feedback: any;
}

function FeedbackItem({ feedback }: FeedbackItemProps) {
  const voterAddress = feedback.voter?.id || feedback.voter;
  const { ensName } = useENS(voterAddress);
  const voterDisplay = formatAddressWithENS(voterAddress, ensName);
  
  const supportLabel = feedback.supportDetailed === 1 ? 'For' : 
                       feedback.supportDetailed === 0 ? 'Against' : 'Abstain';
  const supportClass = feedback.supportDetailed === 1 ? styles.supportFor : 
                       feedback.supportDetailed === 0 ? styles.supportAgainst : styles.supportAbstain;

  const timestamp = formatAbsoluteTime(parseInt(feedback.createdTimestamp));

  return (
    <div className={styles.feedbackItem}>
      <div className={styles.feedbackHeader}>
        <span className={styles.voter} title={voterAddress}>
          {voterDisplay}
        </span>
        <span className={`${styles.support} ${supportClass}`}>
          {supportLabel}
        </span>
      </div>
      
      {feedback.reason && (
        <div className={styles.reason}>
          {feedback.reason}
        </div>
      )}
      
      <div className={styles.timestamp}>
        {timestamp}
      </div>
    </div>
  );
}

interface CandidateFeedbackListProps {
  feedback: any[];
  loading?: boolean;
}

export default function CandidateFeedbackList({ 
  feedback, 
  loading = false 
}: CandidateFeedbackListProps) {
  if (loading) {
    return (
      <div className={styles.loading}>
        <p>Loading feedback...</p>
      </div>
    );
  }

  if (feedback.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No feedback yet</p>
        <p className={styles.emptyHint}>
          Be the first to provide feedback on this candidate
        </p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {feedback.map((item) => (
        <FeedbackItem key={item.id} feedback={item} />
      ))}
    </div>
  );
}

