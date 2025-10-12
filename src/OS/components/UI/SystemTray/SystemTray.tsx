/**
 * System Tray Component
 * Right side of menu bar with wallet connection, time, etc.
 */

'use client';

import { useEffect, useState } from 'react';
import { useAppKit } from '@reown/appkit/react';
import { useAccount, useDisconnect, useEnsName } from 'wagmi';
import type { Address } from 'viem';
import WalletControlCenter from '../WalletControlCenter/WalletControlCenter';
import styles from './SystemTray.module.css';

export default function SystemTray() {
  const [time, setTime] = useState<string>('');
  const [showWalletControl, setShowWalletControl] = useState(false);
  
  const { open } = useAppKit();
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  
  // Resolve ENS name (always check mainnet)
  const { data: ensName, isLoading: ensLoading } = useEnsName({
    address: address as Address,
    chainId: 1, // Mainnet for ENS
  });

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      setTime(`${displayHours}:${minutes} ${ampm}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Format wallet address
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Get display name (ENS or formatted address)
  const getDisplayName = () => {
    if (ensLoading) return formatAddress(address!);
    return ensName || formatAddress(address!);
  };

  // Handle wallet button click
  const handleWalletClick = () => {
    if (isConnected) {
      // Connected: Toggle Control Center
      setShowWalletControl(!showWalletControl);
    } else {
      // Not connected: Open Appkit
      open();
    }
  };

  return (
    <>
      <div className={styles.systemTray}>
        {/* Wallet Status */}
        {isConnected && address ? (
          <button
            className={styles.walletButton}
            onClick={handleWalletClick}
            title={`${ensName ? `${ensName}\n` : ''}${address}\nChain: ${chain?.name || 'Unknown'}\n\nClick to open Wallet Control Center`}
          >
            <img src="/icons/system/wallet-connection.svg" alt="" className={styles.walletIcon} />
            <span className={styles.walletAddress}>{getDisplayName()}</span>
          </button>
        ) : (
          <button
            className={styles.walletButton}
            onClick={handleWalletClick}
            title="Connect Wallet"
          >
            <img src="/icons/system/wallet-connection.svg" alt="" className={styles.walletIcon} />
            <span className={styles.walletText}>Connect</span>
          </button>
        )}

        {/* Time */}
        <div className={styles.time}>{time}</div>
      </div>

      {/* Wallet Control Center Modal */}
      {showWalletControl && isConnected && (
        <WalletControlCenter onClose={() => setShowWalletControl(false)} />
      )}
    </>
  );
}

