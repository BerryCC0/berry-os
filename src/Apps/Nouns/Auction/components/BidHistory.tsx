/**
 * BidHistory Component
 * Displays list of bids for an auction
 */

'use client';

import type { Bid } from '@/app/lib/Nouns/Goldsky/utils/types';
import { formatBidAmount } from '../utils/helpers/auctionHelpers';
import { getClientName, isBerryOSBid } from '../utils/helpers/clientNames';
import BidderDisplay from './BidderDisplay';
import ScrollBar from '@/src/OS/components/UI/ScrollBar/ScrollBar';
import styles from './BidHistory.module.css';

interface BidHistoryProps {
  bids: Bid[];
  isNounderNoun?: boolean;
  loading?: boolean;
}

export default function BidHistory({ bids, isNounderNoun = false, loading = false }: BidHistoryProps) {
  if (loading) {
    return (
      <div className={styles.bidHistory}>
        <h2 className={styles.title}>Bid History</h2>
        <div className={styles.bidsList}>
          <div className={styles.bidItem}>
            <div className={styles.bidderInfo}>
              <div className={styles.bidderPfp}></div>
              <div className={styles.loadingText}>Loading...</div>
            </div>
            <div className={styles.bidDetails}>
              <div className={styles.loadingText}>...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Nounder Nouns display nounders.eth
  if (isNounderNoun) {
    return (
      <div className={styles.bidHistory}>
        <h2 className={styles.title}>Bid History</h2>
        <div className={styles.bidsList}>
          <div className={styles.bidItem}>
            <BidderDisplay address="0x2573C60a6D127755aA2DC85e342F7da2378a0Cc5" />
            <div className={styles.bidDetails}>
              <div className={styles.bidAmount}>nounders.eth</div>
              <a
                href="https://etherscan.io/address/0x2573C60a6D127755aA2DC85e342F7da2378a0Cc5"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.viewTx}
                aria-label="View on Etherscan"
              >
                ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No bids yet
  if (!bids || bids.length === 0) {
    return (
      <div className={styles.bidHistory}>
        <h2 className={styles.title}>Bid History</h2>
        <div className={styles.bidsList}>
          <p className={styles.noBids}>No bids yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.bidHistory}>
      <h2 className={styles.title}>Bid History</h2>
      <div className={styles.scrollContainer}>
        <ScrollBar>
          <div className={styles.bidsList}>
            {bids.map((bid) => {
              const clientName = getClientName(bid.clientId);
              const isBerryBid = isBerryOSBid(bid.clientId);
              
              return (
                <div key={bid.id} className={styles.bidItem}>
                  <div className={styles.bidderSection}>
                    <BidderDisplay address={bid.bidder.id} />
                    {clientName && (
                      <div className={`${styles.clientBadge} ${isBerryBid ? styles.berryBadge : ''}`}>
                        {clientName}
                      </div>
                    )}
                  </div>
                  <div className={styles.bidDetails}>
                    <div className={styles.bidAmount}>
                      Ξ {formatBidAmount(bid.amount)}
                    </div>
                    <a
                      href={`https://etherscan.io/tx/${bid.txHash || '#'}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.viewTx}
                      aria-label="View transaction"
                    >
                      ↗
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollBar>
      </div>
    </div>
  );
}

