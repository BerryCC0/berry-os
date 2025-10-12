/**
 * Wallet Control Center Component
 * macOS Control Center-inspired wallet modal with Mac OS 8 aesthetics
 * Displays wallet info, balance, and provides quick actions
 */

'use client';

import { useEffect } from 'react';
import { useAccount, useEnsName, useBalance, useEnsAvatar, useDisconnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import type { Address } from 'viem';
import WalletInfo from './components/WalletInfo';
import BalanceCard from './components/BalanceCard';
import QuickActions from './components/QuickActions';
import NetworkSelector from './components/NetworkSelector';
import styles from './WalletControlCenter.module.css';

export interface WalletControlCenterProps {
  onClose: () => void;
}

export default function WalletControlCenter({ onClose }: WalletControlCenterProps) {
  const { address, chain } = useAccount();
  const { open } = useAppKit();
  const { disconnect } = useDisconnect();
  
  // Wallet data
  const { data: ensName } = useEnsName({
    address: address as Address,
    chainId: 1,
  });
  
  const { data: ensAvatar } = useEnsAvatar({
    name: ensName ? ensName : undefined,
    chainId: 1,
  });
  
  const { data: balance } = useBalance({
    address: address as Address,
  });

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle disconnect
  const handleDisconnect = () => {
    disconnect();
    onClose();
  };

  if (!address) return null;

  return (
    <div 
      className={styles.overlay} 
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Wallet Control Center"
    >
      <div className={styles.controlCenter}>
        {/* Wallet Info Section */}
        <WalletInfo
          address={address}
          ensName={ensName || undefined}
          ensAvatar={ensAvatar || undefined}
          chainName={chain?.name || 'Unknown Network'}
        />

        {/* Balance Section */}
        <BalanceCard
          balance={balance?.formatted}
          symbol={balance?.symbol}
          decimals={balance?.decimals}
        />

        {/* Quick Actions */}
        <QuickActions onClose={onClose} />

        {/* Network Selector */}
        <NetworkSelector />

        {/* Footer - Disconnect */}
        <div className={styles.footer}>
          <button
            className={styles.disconnectButton}
            onClick={handleDisconnect}
          >
            Disconnect Wallet
          </button>
        </div>
      </div>
    </div>
  );
}

