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

/**
 * Detect if a reason is a repost or reply with quoted content
 */
function detectRepostOrReply(reason?: string): { 
  isRepost: boolean; 
  isReply: boolean;
  replyTo?: string;
  quotedContent?: string; 
  replyContent?: string;
} {
  if (!reason) return { isRepost: false, isReply: false };
  
  const lines = reason.split('\n');
  
  // Check for reply pattern: starts with @0x...
  // Example: @0x2117...E42a
  const replyPattern = /^@(0x[a-zA-Z0-9]{4}(?:\.){3}[a-zA-Z0-9]{4})$/;
  const firstLineMatch = lines[0]?.trim().match(replyPattern);
  
  if (firstLineMatch) {
    // This is a reply
    const replyTo = firstLineMatch[1];
    
    // Find the blockquote (lines starting with '>')
    let blockquoteStart = -1;
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim().startsWith('>')) {
        blockquoteStart = i;
        break;
      }
    }
    
    if (blockquoteStart === -1) {
      // No blockquote found, just show as normal
      return { isRepost: false, isReply: false };
    }
    
    // Extract reply content (between @address and blockquote)
    const replyContentLines = lines.slice(1, blockquoteStart);
    const replyContent = replyContentLines
      .map(line => line.trim())
      .filter(line => line !== '')
      .join('\n');
    
    // Extract blockquote lines
    const blockquoteLines: string[] = [];
    for (let i = blockquoteStart; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('>')) {
        blockquoteLines.push(line.slice(1).trim());
      } else if (line === '') {
        // Empty lines within blockquote are ok
        continue;
      } else {
        // Non-blockquote line after quote, include it in reply content
        break;
      }
    }
    
    const quotedContent = blockquoteLines.join('\n');
    
    return {
      isRepost: false,
      isReply: true,
      replyTo,
      quotedContent,
      replyContent,
    };
  }
  
  // Check for repost pattern: "+1" followed by blockquote
  // Can appear anywhere in the text (pure repost or mixed with other content)
  // Find "+1" line
  let plusOneIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed === '+1') {
      plusOneIndex = i;
      break;
    }
  }
  
  if (plusOneIndex !== -1) {
    // Found "+1", now look for blockquote after it
    let blockquoteStart = -1;
    for (let i = plusOneIndex + 1; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (trimmed.startsWith('>')) {
        blockquoteStart = i;
        break;
      } else if (trimmed !== '') {
        // Non-empty, non-blockquote line means no repost after +1
        break;
      }
    }
    
    if (blockquoteStart !== -1) {
      // Extract blockquote lines
      const blockquoteLines: string[] = [];
      let lastWasBlockquote = false;
      
      for (let i = blockquoteStart; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.startsWith('>')) {
          const content = line.slice(1).trim();
          blockquoteLines.push(content);
          lastWasBlockquote = true;
        } else if (line === '' && lastWasBlockquote) {
          blockquoteLines.push('');
        } else if (line !== '') {
          break;
        }
      }
      
      if (blockquoteLines.length > 0) {
        const quotedContent = blockquoteLines.join('\n').trim();
        
        // Check if there's content before +1 (mixed) or if it's pure repost
        const contentBeforePlusOne = lines.slice(0, plusOneIndex)
          .map(line => line.trim())
          .filter(line => line !== '')
          .join('\n');
        
        if (contentBeforePlusOne) {
          // Mixed: content + repost
          return {
            isRepost: true,
            isReply: false,
            quotedContent,
            replyContent: contentBeforePlusOne, // Use replyContent for the content before +1
          };
        } else {
          // Pure repost
          return {
            isRepost: true,
            isReply: false,
            quotedContent,
          };
        }
      }
    }
  }
  
  return { isRepost: false, isReply: false };
}

function ActivityItem({ activity, isExpanded = false, onClick }: ActivityItemProps) {
  const { ensName, ensAvatar, isLoading: ensLoading } = useENS(activity.voter);
  const displayName = formatAddressWithENS(activity.voter, ensName);
  
  // Determine avatar to show
  const avatarUrl = ensAvatar || '/icons/apps/berry.svg';
  
  // Check if this is a repost or reply
  const messageInfo = detectRepostOrReply(activity.reason);
  
  // Get support color/icon/label based on activity type
  const getSupportColorForActivity = () => {
    if (activity.type === ActivityItemType.PROPOSAL_ENDED) {
      return activity.statusInfo === 'SUCCEEDED' ? '#00AA00' : '#CC0000';
    }
    if (activity.type === ActivityItemType.PROPOSAL_QUEUED || 
        activity.type === ActivityItemType.PROPOSAL_EXECUTED) {
      return '#0066CC'; // Blue for queued/executed
    }
    if (activity.type === ActivityItemType.PROPOSAL_CREATED ||
        activity.type === ActivityItemType.CANDIDATE_CREATED) {
      return '#666666'; // Gray for creation
    }
    if (activity.type === ActivityItemType.PROPOSAL_UPDATED ||
        activity.type === ActivityItemType.CANDIDATE_UPDATED) {
      return '#8B4513'; // Brown for updates
    }
    return getSupportColor(activity.supportDetailed);
  };

  const getSupportLabelForActivity = () => {
    switch (activity.type) {
      case ActivityItemType.PROPOSAL_ENDED:
        return activity.statusInfo === 'SUCCEEDED' ? 'Succeeded' : 'Defeated';
      case ActivityItemType.PROPOSAL_QUEUED:
        return 'Queued';
      case ActivityItemType.PROPOSAL_EXECUTED:
        return 'Executed';
      case ActivityItemType.PROPOSAL_CREATED:
        return 'Created';
      case ActivityItemType.PROPOSAL_UPDATED:
        return activity.consolidatedCount && activity.consolidatedCount > 1 
          ? `Updated (${activity.consolidatedCount}x)` 
          : 'Updated';
      case ActivityItemType.CANDIDATE_CREATED:
        return 'New Candidate';
      case ActivityItemType.CANDIDATE_UPDATED:
        return 'Updated';
      default:
        return getSupportLabel(activity.supportDetailed);
    }
  };

  const getSupportIconForActivity = () => {
    switch (activity.type) {
      case ActivityItemType.PROPOSAL_ENDED:
        return activity.statusInfo === 'SUCCEEDED' ? '✓' : '✗';
      case ActivityItemType.PROPOSAL_QUEUED:
      case ActivityItemType.PROPOSAL_EXECUTED:
        return '→';
      case ActivityItemType.PROPOSAL_CREATED:
      case ActivityItemType.CANDIDATE_CREATED:
        return '+';
      case ActivityItemType.PROPOSAL_UPDATED:
      case ActivityItemType.CANDIDATE_UPDATED:
        return '↻';
      default:
        return getSupportIcon(activity.supportDetailed);
    }
  };
  
  const supportColor = getSupportColorForActivity();
  const supportIcon = getSupportIconForActivity();
  const supportLabel = getSupportLabelForActivity();
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
      case ActivityItemType.PROPOSAL_CREATED:
        return 'created';
      case ActivityItemType.PROPOSAL_UPDATED:
        return activity.consolidatedCount && activity.consolidatedCount > 1 
          ? `updated (${activity.consolidatedCount}x)` 
          : 'updated';
      case ActivityItemType.PROPOSAL_ENDED:
        return activity.statusInfo === 'SUCCEEDED' ? 'succeeded' : 'was defeated';
      case ActivityItemType.PROPOSAL_QUEUED:
        return 'was queued';
      case ActivityItemType.PROPOSAL_EXECUTED:
        return 'was executed';
      case ActivityItemType.CANDIDATE_CREATED:
        return 'created candidate';
      case ActivityItemType.CANDIDATE_UPDATED:
        return 'updated candidate';
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

  const isClickable = onClick && (activity.contextType === 'proposal' || activity.contextType === 'candidate');

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
            {messageInfo.isReply ? (
              <>
                {/* Reply indicator with target address */}
                <div className={styles.replyIndicator}>
                  <span className={styles.replyIcon}>↪</span>
                  <span className={styles.replyLabel}>Replying to {messageInfo.replyTo}</span>
                </div>
                {/* Reply content */}
                {messageInfo.replyContent && (
                  <p className={styles.reasonText}>
                    {messageInfo.replyContent}
                  </p>
                )}
                {/* Quoted content */}
                {messageInfo.quotedContent && (
                  <div className={styles.quotedContent}>
                    <p className={styles.quotedText}>
                      {messageInfo.quotedContent}
                    </p>
                  </div>
                )}
              </>
            ) : messageInfo.isRepost ? (
              <>
                {/* Content before repost (if any) */}
                {messageInfo.replyContent && (
                  <p className={styles.reasonText}>
                    {messageInfo.replyContent}
                  </p>
                )}
                {/* Repost indicator */}
                <div className={styles.repostIndicator}>
                  <span className={styles.repostIcon}>↻</span>
                  <span className={styles.repostLabel}>Reposted</span>
                </div>
                {/* Quoted content */}
                {messageInfo.quotedContent && (
                  <div className={styles.quotedContent}>
                    <p className={styles.quotedText}>
                      {messageInfo.quotedContent}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className={styles.reasonText}>
                {activity.reason}
              </p>
            )}
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

