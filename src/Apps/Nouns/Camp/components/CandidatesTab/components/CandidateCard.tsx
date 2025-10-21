/**
 * CandidateCard Component
 * Compact candidate display with feedback visualization
 */

'use client';

import { useMemo } from 'react';
import type { Candidate } from '../../../utils/types/camp';
import {
  getCandidateTitle,
  getCandidateStatus,
  getStatusColor,
  formatStatus,
  formatAddress,
  formatRelativeTime,
  getActionsCount,
  formatActionsCount,
} from '../../../utils/helpers/candidateHelpers';
import { useENS, formatAddressWithENS } from '../../../utils/hooks/useENS';
import { useCandidateFeedback } from '../../../utils/hooks/useCandidateFeedback';
import styles from './CandidateCard.module.css';

interface CandidateCardProps {
  candidate: Candidate;
  isExpanded?: boolean;
  onClick?: () => void;
}

export default function CandidateCard({ 
  candidate, 
  isExpanded = false, 
  onClick,
}: CandidateCardProps) {
  // Fetch feedback for this candidate
  const { feedback: feedbackList } = useCandidateFeedback(candidate.proposer, candidate.slug);
  const title = getCandidateTitle(candidate);
  const status = getCandidateStatus(candidate);
  const statusColor = getStatusColor(status);
  const statusLabel = formatStatus(status);
  const { ensName: proposerENS } = useENS(candidate.proposer);
  const proposer = formatAddressWithENS(candidate.proposer, proposerENS);
  const actionsCount = getActionsCount(candidate);
  const actionsLabel = formatActionsCount(actionsCount);
  const createdTime = formatRelativeTime(candidate.createdTimestamp);

  // Calculate feedback bar widths
  const totalFeedback = feedbackList.length;
  const forCount = feedbackList.filter(f => f.supportDetailed === 1).length;
  const againstCount = feedbackList.filter(f => f.supportDetailed === 0).length;
  const abstainCount = feedbackList.filter(f => f.supportDetailed === 2).length;

  const forWidth = totalFeedback > 0 ? (forCount / totalFeedback) * 100 : 0;
  const againstWidth = totalFeedback > 0 ? (againstCount / totalFeedback) * 100 : 0;
  const abstainWidth = totalFeedback > 0 ? (abstainCount / totalFeedback) * 100 : 0;

  return (
    <div 
      className={`${styles.card} ${isExpanded ? styles.expanded : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {/* Header */}
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        <div 
          className={styles.status}
          style={{ 
            backgroundColor: statusColor,
            color: '#FFFFFF',
          }}
        >
          {statusLabel}
        </div>
      </div>

      {/* Feedback Bars (if any feedback exists) */}
      {totalFeedback > 0 && (
        <div className={styles.feedbackBars}>
          {forWidth > 0 && (
            <div 
              className={styles.feedbackBar}
              style={{
                width: `${forWidth}%`,
                backgroundColor: '#00AA00',
              }}
              title={`For: ${forCount}`}
            />
          )}
          {againstWidth > 0 && (
            <div 
              className={styles.feedbackBar}
              style={{
                width: `${againstWidth}%`,
                backgroundColor: '#AA0000',
              }}
              title={`Against: ${againstCount}`}
            />
          )}
          {abstainWidth > 0 && (
            <div 
              className={styles.feedbackBar}
              style={{
                width: `${abstainWidth}%`,
                backgroundColor: '#888888',
              }}
              title={`Abstain: ${abstainCount}`}
            />
          )}
        </div>
      )}

      {/* Feedback Counts */}
      {totalFeedback > 0 && (
        <div className={styles.feedbackCounts}>
          <span className={styles.feedbackFor}>
            ✓ {forCount}
          </span>
          <span className={styles.feedbackAgainst}>
            ✗ {againstCount}
          </span>
          <span className={styles.feedbackAbstain}>
            – {abstainCount}
          </span>
        </div>
      )}

      {/* Footer */}
      <div className={styles.footer}>
        <span className={styles.proposer}>
          By {proposer}
        </span>
        <span className={styles.meta}>
          {actionsLabel} • {createdTime}
        </span>
      </div>
    </div>
  );
}

