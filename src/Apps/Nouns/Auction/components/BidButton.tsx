/**
 * BidButton Component
 * Button to place bids on the current auction with wallet integration
 */

'use client';

import { useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { parseEther } from 'viem';
import { AuctionActions } from '@/app/lib/Nouns/Contracts';
import Button from '@/src/OS/components/UI/Button/Button';
import styles from './BidButton.module.css';

interface BidButtonProps {
  nounId: string;
  currentBidETH: string;
  minBidETH?: string;
  disabled?: boolean;
}

export default function BidButton({ 
  nounId, 
  currentBidETH, 
  minBidETH,
  disabled = false 
}: BidButtonProps) {
  const { address, isConnected } = useAccount();
  const { writeContractAsync, isPending, error } = useWriteContract();
  const [bidAmount, setBidAmount] = useState('');
  const [txError, setTxError] = useState<string | null>(null);
  const [txSuccess, setTxSuccess] = useState(false);

  const handleBid = async () => {
    if (!isConnected || !address) {
      setTxError('Please connect your wallet');
      return;
    }

    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      setTxError('Please enter a valid bid amount');
      return;
    }

    // Validate minimum bid
    if (minBidETH && parseFloat(bidAmount) < parseFloat(minBidETH)) {
      setTxError(`Minimum bid is Ξ ${minBidETH}`);
      return;
    }

    try {
      setTxError(null);
      setTxSuccess(false);

      const bidConfig = AuctionActions.createBid(BigInt(nounId), bidAmount);
      await writeContractAsync(bidConfig);

      setTxSuccess(true);
      setBidAmount('');
      
      // Clear success message after 3 seconds
      setTimeout(() => setTxSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error placing bid:', err);
      setTxError(err.message || 'Failed to place bid');
    }
  };

  if (!isConnected) {
    return (
      <div className={styles.bidButton}>
        <p className={styles.connectMessage}>
          Connect your wallet to place a bid
        </p>
      </div>
    );
  }

  return (
    <div className={styles.bidButton}>
      <div className={styles.bidInputGroup}>
        <label htmlFor="bid-amount" className={styles.label}>
          Bid Amount (ETH)
        </label>
        <div className={styles.inputRow}>
          <input
            id="bid-amount"
            type="number"
            step="0.01"
            min="0"
            placeholder={`Min: ${minBidETH || currentBidETH}`}
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            disabled={isPending || disabled}
            className={styles.input}
          />
          <Button
            onClick={handleBid}
            disabled={isPending || disabled || !bidAmount}
            className={styles.button}
          >
            {isPending ? 'Bidding...' : 'Place Bid'}
          </Button>
        </div>
      </div>

      {txError && (
        <div className={styles.error}>
          {txError}
        </div>
      )}

      {txSuccess && (
        <div className={styles.success}>
          Bid placed successfully!
        </div>
      )}

      {error && (
        <div className={styles.error}>
          Transaction failed. Please try again.
        </div>
      )}
    </div>
  );
}

