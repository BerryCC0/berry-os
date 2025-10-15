/**
 * AccountTab Component
 * Displays the connected user's governance profile
 * Shows wallet connection prompt when no wallet is connected
 */

'use client';

import { useAccount } from 'wagmi';
import VoterDetailView from '../VotersTab/components/VoterDetailView';
import styles from './AccountTab.module.css';

export default function AccountTab() {
  const { address, isConnected } = useAccount();

  // Show wallet connection prompt if not connected
  if (!isConnected || !address) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyStateContent}>
          <div className={styles.iconWrapper}>
            <img 
              src="/icons/apps/berry.svg" 
              alt="Wallet Icon" 
              className={styles.icon}
            />
          </div>
          <h2 className={styles.title}>No Wallet Connected</h2>
          <p className={styles.message}>
            Connect your wallet using the Menu Bar to view your governance profile, 
            voting history, and delegation status.
          </p>
          <div className={styles.hint}>
            <span className={styles.hintIcon}>💡</span>
            <span className={styles.hintText}>
              Click the wallet icon in the top menu bar to get started
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Show voter detail view for connected wallet
  return (
    <VoterDetailView 
      address={address} 
      showBackButton={false}
    />
  );
}

