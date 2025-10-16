/**
 * BidderDisplay Component
 * Displays bidder address with ENS name and avatar
 */

'use client';

import { useENS } from '../../Camp/utils/hooks/useENS';
import styles from './BidderDisplay.module.css';

interface BidderDisplayProps {
  address: string;
}

export default function BidderDisplay({ address }: BidderDisplayProps) {
  const { ensName, ensAvatar } = useENS(address);

  return (
    <div className={styles.bidderDisplay}>
      {ensAvatar ? (
        <img
          src={ensAvatar}
          alt={ensName || address}
          className={styles.avatar}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <div className={styles.avatarPlaceholder}></div>
      )}
      <span className={styles.name}>
        {ensName || `${address.slice(0, 6)}...${address.slice(-4)}`}
      </span>
    </div>
  );
}

