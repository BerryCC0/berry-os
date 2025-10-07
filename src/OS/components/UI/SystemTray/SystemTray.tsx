/**
 * System Tray Component
 * Right side of menu bar with wallet connection, time, etc.
 */

'use client';

import { useEffect, useState } from 'react';
import { useAppKit } from '@reown/appkit/react';
import { useAccount, useDisconnect } from 'wagmi';
import styles from './SystemTray.module.css';

export default function SystemTray() {
  const [time, setTime] = useState<string>('');
  const { open } = useAppKit();
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();

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

  return (
    <div className={styles.systemTray}>
      {/* Wallet Status */}
      {isConnected && address ? (
        <button
          className={styles.walletButton}
          onClick={() => open()}
          title={`Connected: ${address}\nChain: ${chain?.name || 'Unknown'}`}
        >
          <span className={styles.walletIcon}>💼</span>
          <span className={styles.walletAddress}>{formatAddress(address)}</span>
        </button>
      ) : (
        <button
          className={styles.walletButton}
          onClick={() => open()}
          title="Connect Wallet"
        >
          <span className={styles.walletIcon}>🔌</span>
          <span className={styles.walletText}>Connect</span>
        </button>
      )}

      {/* Time */}
      <div className={styles.time}>{time}</div>
    </div>
  );
}

