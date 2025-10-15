/**
 * VoterCard Component
 * Displays a single voter/delegate card with Nouns thumbnails
 * Inspired by ActivityItem styling
 */

'use client';

import { memo, useMemo } from 'react';
import type { UIDelegate } from '../../../utils/types/camp';
import {
  formatVotingPower,
  formatAddress,
} from '../../../utils/helpers/voterHelpers';
import { getNounThumbnails } from '../../../utils/helpers/nounImageHelper';
import { useENS, formatAddressWithENS } from '../../../utils/hooks/useENS';
import ScrollBar from '@/src/OS/components/UI/ScrollBar/ScrollBar';
import styles from './VoterCard.module.css';

interface VoterCardProps {
  voter: UIDelegate;
  rank: number;
  onClick?: () => void;
}

function VoterCard({ voter, rank, onClick }: VoterCardProps) {
  const { ensName, ensAvatar, isLoading: ensLoading } = useENS(voter.id);
  const displayName = formatAddressWithENS(voter.id, ensName);
  
  // Determine avatar to show
  const avatarUrl = ensAvatar || '/icons/apps/berry.svg';

  // Get Noun thumbnails
  const nounsRepresented = voter.nounsRepresented || [];
  const allThumbnails = nounsRepresented.length > 0
    ? getNounThumbnails({ nouns: nounsRepresented } as any, nounsRepresented.length).thumbnails
    : [];

  const votingPower = Number(voter.delegatedVotes || 0);
  
  // Filter out holders with 0 balance (dirty Goldsky data)
  const tokenHoldersCount = useMemo(() => {
    const holders = voter.tokenHoldersRepresented || [];
    return holders.filter(holder => {
      const balance = Number(holder.tokenBalance || 0);
      return balance > 0;
    }).length;
  }, [voter.tokenHoldersRepresented]);

  return (
    <div 
      className={`${styles.voterCard} ${onClick ? styles.clickable : ''} ${voter.isCurrentUser ? styles.currentUser : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Left: Noun Thumbnails - Fixed width container */}
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

      {/* Center: Voter Info */}
      <div className={styles.info}>
        <div className={styles.header}>
          {/* Rank */}
          <span className={styles.rank}>#{rank}</span>
          
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
            title={voter.id}
          >
            {displayName}
          </span>
          
          {voter.isCurrentUser && (
            <span className={styles.youBadge}>YOU</span>
          )}
          
          <span className={styles.votingPower}>
            {formatVotingPower(votingPower)} votes
          </span>
          
          <span className={styles.holders}>
            {tokenHoldersCount} holder{tokenHoldersCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
}

export default memo(VoterCard);

