/**
 * QuickActions Component
 * Quick action buttons for wallet operations
 */

'use client';

import { useState } from 'react';
import { useAppKit } from '@reown/appkit/react';
import { useAccount } from 'wagmi';
import styles from './QuickActions.module.css';

interface QuickActionsProps {
  onClose: () => void;
}

export default function QuickActions({ onClose }: QuickActionsProps) {
  const { open } = useAppKit();
  const { address } = useAccount();
  const [showReceive, setShowReceive] = useState(false);
  const [copied, setCopied] = useState(false);

  // Handle Send - Opens Appkit wallet send view
  const handleSend = () => {
    open({ view: 'WalletSend' });
    onClose();
  };

  // Handle Receive - Show address/QR
  const handleReceive = () => {
    setShowReceive(!showReceive);
  };

  // Handle Buy - Opens Appkit onramp
  const handleBuy = () => {
    open({ view: 'OnRampProviders' });
    onClose();
  };

  // Handle Swap - Opens Appkit swap
  const handleSwap = () => {
    open({ view: 'Swap' });
    onClose();
  };

  // Copy address
  const handleCopy = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={styles.quickActions}>
      <div className={styles.label}>Quick Actions</div>
      
      <div className={styles.actions}>
        <button className={styles.actionButton} onClick={handleSend}>
          <img src="/icons/actions/send.svg" alt="" className={styles.actionIcon} />
          <span className={styles.actionLabel}>Send</span>
        </button>

        <button className={styles.actionButton} onClick={handleReceive}>
          <img src="/icons/actions/receive.svg" alt="" className={styles.actionIcon} />
          <span className={styles.actionLabel}>Receive</span>
        </button>

        <button className={styles.actionButton} onClick={handleBuy}>
          <img src="/icons/actions/buy.svg" alt="" className={styles.actionIcon} />
          <span className={styles.actionLabel}>Buy</span>
        </button>

        <button className={styles.actionButton} onClick={handleSwap}>
          <img src="/icons/actions/swap.svg" alt="" className={styles.actionIcon} />
          <span className={styles.actionLabel}>Swap</span>
        </button>
      </div>

      {/* Receive panel */}
      {showReceive && address && (
        <div className={styles.receivePanel}>
          <div className={styles.receiveTitle}>Your Wallet Address</div>
          <div className={styles.addressBox}>
            <code className={styles.addressCode}>{address}</code>
          </div>
          <button
            className={styles.copyAddressButton}
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <img src="/icons/actions/check.svg" alt="" style={{ width: '14px', height: '14px', display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }} />
                Copied!
              </>
            ) : (
              <>
                <img src="/icons/actions/copy.svg" alt="" style={{ width: '14px', height: '14px', display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }} />
                Copy Address
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

