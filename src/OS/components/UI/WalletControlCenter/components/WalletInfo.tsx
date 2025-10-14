/**
 * WalletInfo Component
 * Displays wallet address, ENS name, and connection status
 * Supports EVM, Solana, and Bitcoin chains
 */

'use client';

import { useState } from 'react';
import { useAppKit } from '@reown/appkit/react';
import styles from './WalletInfo.module.css';

type ChainType = 'evm' | 'solana' | 'bitcoin';

interface WalletInfoProps {
  address: string;
  ensName?: string;
  ensAvatar?: string;
  chainName: string;
  chainType: ChainType | null;
}

export default function WalletInfo({ address, ensName, ensAvatar, chainName, chainType }: WalletInfoProps) {
  const [copied, setCopied] = useState(false);
  const { open } = useAppKit();

  // Format address based on chain type
  const formatAddress = (addr: string, type: ChainType | null) => {
    // Different chains have different address formats
    if (type === 'solana') {
      // Solana addresses are longer (base58, ~44 chars)
      return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
    } else if (type === 'bitcoin') {
      // Bitcoin addresses vary in length
      return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    } else {
      // EVM addresses (0x + 40 hex chars)
      return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    }
  };

  // Copy address to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Open manage wallets view
  const handleManageWallets = () => {
    open({ view: 'Account' });
  };

  return (
    <div className={styles.walletInfo}>
      <div className={styles.header}>
        {/* Avatar or icon */}
        <div className={styles.avatar}>
          {ensAvatar ? (
            <img src={ensAvatar} alt="" className={styles.avatarImage} />
          ) : (
            <img src="/icons/actions/wallet.svg" alt="" className={styles.avatarIcon} />
          )}
        </div>

        {/* Identity */}
        <div className={styles.identity}>
          {ensName ? (
            <>
              <div className={styles.ensName}>{ensName}</div>
              <div className={styles.address}>{formatAddress(address, chainType)}</div>
            </>
          ) : (
            <div className={styles.addressOnly}>{formatAddress(address, chainType)}</div>
          )}
        </div>

        {/* Copy button */}
        <button
          className={styles.copyButton}
          onClick={handleCopy}
          title={copied ? 'Copied!' : 'Copy address'}
        >
          {copied ? (
            <img src="/icons/actions/check.svg" alt="Copied" className={styles.copyIcon} />
          ) : (
            <img src="/icons/actions/copy.svg" alt="Copy" className={styles.copyIcon} />
          )}
        </button>
      </div>

      {/* Network indicator */}
      <div className={styles.network}>
        <span className={styles.networkDot}></span>
        <span className={styles.networkText}>Connected to {chainName}</span>
      </div>

      {/* Manage Wallets Button */}
      <button
        className={styles.manageWalletsButton}
        onClick={handleManageWallets}
      >
        Manage Wallets
      </button>
    </div>
  );
}

