/**
 * ActivityItem Component
 * Displays a single activity feed item (vote, feedback, or signature)
 * Reuses VoteItem styling pattern
 */

'use client';

import { memo } from 'react';
import type { UIActivityItem } from '../../../utils/types/camp';
import { ActivityItemType } from '../../../utils/types/camp';
import {
  formatVotingPower,
  getSupportColor,
  getSupportIcon,
  getSupportLabel,
  formatRelativeTime,
} from '../../../utils/helpers/voterHelpers';
import { getNounThumbnails } from '../../../utils/helpers/nounImageHelper';
import { useENS, formatAddressWithENS } from '../../../utils/hooks/useENS';
import ScrollBar from '@/src/OS/components/UI/ScrollBar/ScrollBar';
import styles from './ActivityItem.module.css';

interface ActivityItemProps {
  activity: UIActivityItem;
  isExpanded?: boolean;
  onClick?: () => void;
}

function ActivityItem({ activity, isExpanded = false, onClick }: ActivityItemProps) {
  const { ensName, ensAvatar, isLoading: ensLoading } = useENS(activity.voter);
  const displayName = formatAddressWithENS(activity.voter, ensName);
  
  // Determine avatar to show
  const avatarUrl = ensAvatar || '/icons/apps/berry.svg';
  
  const supportColor = getSupportColor(activity.supportDetailed);
  const supportIcon = getSupportIcon(activity.supportDetailed);
  const supportLabel = getSupportLabel(activity.supportDetailed);
  const timestamp = formatRelativeTime(activity.timestamp.toString());

  // Get all Noun thumbnails if available (only for votes with Nouns data)
  const allThumbnails = activity.type === ActivityItemType.PROPOSAL_VOTE && activity.originalData.nouns
    ? getNounThumbnails(activity.originalData, activity.originalData.nouns.length).thumbnails
    : [];

  // Type-specific label
  const getActivityTypeLabel = () => {
    switch (activity.type) {
      case ActivityItemType.PROPOSAL_VOTE:
        return 'voted on';
      case ActivityItemType.PROPOSAL_FEEDBACK:
        return 'signaled on';
      case ActivityItemType.CANDIDATE_SIGNATURE:
        return 'signed';
      case ActivityItemType.CANDIDATE_FEEDBACK:
        return 'gave feedback on';
      default:
        return 'interacted with';
    }
  };

  const activityTypeLabel = getActivityTypeLabel();
  
  // Format context label with title for proposals
  const contextLabel = activity.contextType === 'proposal' 
    ? `Proposal ${activity.contextId}${activity.contextTitle ? `: ${activity.contextTitle}` : ''}` 
    : `Candidate: ${activity.contextTitle}`;
  
  // Shorter version for display (full title in tooltip)
  const contextDisplay = activity.contextType === 'proposal'
    ? `Proposal ${activity.contextId}`
    : `Candidate: ${activity.contextTitle}`;

  const isClickable = onClick && activity.contextType === 'proposal';

  return (
    <div 
      className={`${styles.activityItem} ${isClickable ? styles.clickable : ''} ${isExpanded ? styles.expanded : ''}`}
      onClick={() => {
        if (isClickable) {
          onClick();
        }
      }}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Left: Noun Thumbnails (if available) - Fixed width container */}
      <div className={styles.nounsContainer}>
        {allThumbnails.length > 0 && (
          <ScrollBar 
            direction="vertical" 
            showArrows={false}
            className={styles.nounsScrollWrapper}
          >
            <div className={styles.nounsScroll}>
              {allThumbnails.map((thumbnail) => (
                <div
                  key={thumbnail.id}
                  className={styles.nounThumbnail}
                  title={`Noun ${thumbnail.id}`}
                >
                  <img
                    src={thumbnail.dataURL}
                    alt={`Noun ${thumbnail.id}`}
                    className={styles.nounImage}
                  />
                </div>
              ))}
            </div>
          </ScrollBar>
        )}
      </div>

      {/* Center: Activity Info */}
      <div className={styles.info}>
        <div className={styles.header}>
          {/* Avatar */}
          <img 
            src={avatarUrl} 
            alt={displayName}
            className={styles.avatar}
            onError={(e) => {
              // Fallback if ENS avatar fails to load
              e.currentTarget.src = '/icons/apps/berry.svg';
            }}
          />
          
          <span 
            className={`${styles.voter} ${ensLoading ? styles.loading : ''}`} 
            title={activity.voter}
          >
            {displayName}
          </span>
          {activity.type === ActivityItemType.PROPOSAL_VOTE && activity.originalData.votes && (
            <span className={styles.votingPower}>
              {formatVotingPower(activity.originalData.votes)} votes
            </span>
          )}
          <span className={styles.action}>{activityTypeLabel}</span>
          <span className={styles.context} title={contextLabel}>
            {contextDisplay}
          </span>
          {activity.contextType === 'proposal' && activity.contextTitle && (
            <span className={styles.proposalTitle} title={activity.contextTitle}>
              {activity.contextTitle}
            </span>
          )}
          <span className={styles.timestamp}>
            {timestamp}
          </span>
        </div>

        {activity.reason && (
          <div className={styles.reason}>
            <p className={styles.reasonText}>
              {activity.reason}
            </p>
          </div>
        )}
      </div>

      {/* Right: Support Badge */}
      <div className={styles.activityDetails}>
        <div
          className={styles.supportBadge}
          style={{ backgroundColor: supportColor }}
        >
          <span className={styles.supportIcon}>{supportIcon}</span>
          <span className={styles.supportLabel}>{supportLabel}</span>
        </div>
      </div>
    </div>
  );
}

export default memo(ActivityItem);

