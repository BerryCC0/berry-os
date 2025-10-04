/**
 * Nouns Auction
 * Participate in the daily Nouns auction
 */

'use client';

import styles from './Auction.module.css';

interface AuctionProps {
  windowId: string;
}

export default function Auction({ windowId }: AuctionProps) {
  return (
    <div className={styles.auction}>
      <div className={styles.content}>
        <h1>⌐◨-◨ Nouns Auction</h1>
        <p>Participate in the daily Nouns auction.</p>
        <p className={styles.comingSoon}>Coming Soon</p>
        <div className={styles.features}>
          <h2>Features:</h2>
          <ul>
            <li>Live auction countdown</li>
            <li>Current Noun display</li>
            <li>Bid history</li>
            <li>Place bids directly</li>
            <li>Auction statistics</li>
            <li>Past Nouns gallery</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

