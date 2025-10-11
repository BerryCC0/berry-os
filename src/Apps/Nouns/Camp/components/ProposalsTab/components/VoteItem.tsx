/**
 * VoteItem Component
 * Rich display of a single vote with Noun images, voter info, and reason
 */

'use client';

import { memo } from 'react';
import type { Vote } from '@/app/lib/Nouns/Goldsky/utils/types';
import {
  formatVoter,
  formatVotingPower,
  getSupportColor,
  getSupportIcon,
  getSupportLabel,
  formatRelativeTime,
} from '../../../utils/helpers/voterHelpers';
import { getNounThumbnails } from '../../../utils/helpers/nounImageHelper';
import { useENS, formatAddressWithENS } from '../../../utils/hooks/useENS';
import styles from './VoteItem.module.css';

interface VoteItemProps {
  vote: Vote;
}

function VoteItem({ vote }: VoteItemProps) {
  const voter = formatVoter(vote);
  const { ensName, isLoading: ensLoading } = useENS(voter.address);
  const displayName = formatAddressWithENS(voter.address, ensName);
  
  const votingPower = formatVotingPower(vote.votes);
  const supportColor = getSupportColor(vote.support);
  const supportIcon = getSupportIcon(vote.support);
  const supportLabel = getSupportLabel(vote.support);
  const timestamp = formatRelativeTime(vote.blockTimestamp);
  const { thumbnails, additionalCount } = getNounThumbnails(vote, 3);

  return (
    <div className={styles.voteItem}>
      {/* Left: Noun Thumbnails */}
      {thumbnails.length > 0 && (
        <div className={styles.nouns}>
          {thumbnails.map((thumbnail) => (
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
          {additionalCount > 0 && (
            <div className={styles.additionalCount}>
              +{additionalCount}
            </div>
          )}
        </div>
      )}

      {/* Center: Voter Info & Reason */}
      <div className={styles.info}>
        <div className={styles.voter}>
          <span 
            className={`${styles.voterAddress} ${ensLoading ? styles.loading : ''}`} 
            title={voter.address}
          >
            {displayName}
          </span>
          <span className={styles.timestamp} title={`Block ${vote.blockNumber}`}>
            {timestamp}
          </span>
          {vote.transactionHash && (
            <a
              href={`https://etherscan.io/tx/${vote.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.txLink}
              title="View transaction on Etherscan"
            >
              ⚡
            </a>
          )}
        </div>

        {vote.reason && (
          <div className={styles.reason}>
            <p className={styles.reasonText}>
              {vote.reason}
            </p>
          </div>
        )}
      </div>

      {/* Right: Support Badge & Voting Power */}
      <div className={styles.voteDetails}>
        <div
          className={styles.supportBadge}
          style={{ backgroundColor: supportColor }}
        >
          <span className={styles.supportIcon}>{supportIcon}</span>
          <span className={styles.supportLabel}>{supportLabel}</span>
        </div>
        <div className={styles.votingPower}>
          {votingPower} votes
        </div>
      </div>
    </div>
  );
}

export default memo(VoteItem);

