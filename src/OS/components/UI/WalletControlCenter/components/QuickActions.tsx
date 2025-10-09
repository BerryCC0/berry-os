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

  // Handle Send - Opens Appkit account view
  const handleSend = () => {
    open({ view: 'Account' });
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
          <span className={styles.actionIcon}>📤</span>
          <span className={styles.actionLabel}>Send</span>
        </button>

        <button className={styles.actionButton} onClick={handleReceive}>
          <span className={styles.actionIcon}>📥</span>
          <span className={styles.actionLabel}>Receive</span>
        </button>

        <button className={styles.actionButton} onClick={handleBuy}>
          <span className={styles.actionIcon}>💳</span>
          <span className={styles.actionLabel}>Buy</span>
        </button>

        <button className={styles.actionButton} onClick={handleSwap}>
          <span className={styles.actionIcon}>🔄</span>
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
            {copied ? '✓ Copied!' : '📋 Copy Address'}
          </button>
        </div>
      )}
    </div>
  );
}

