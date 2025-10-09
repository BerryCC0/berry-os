/**
 * NetworkSelector Component
 * Network switching interface
 */

'use client';

import { useState } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import styles from './NetworkSelector.module.css';

export default function NetworkSelector() {
  const { chain } = useAccount();
  const { chains, switchChain, isPending } = useSwitchChain();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleNetworkSwitch = (chainId: number) => {
    if (switchChain) {
      switchChain({ chainId });
      setIsExpanded(false);
    }
  };

  // Get network icon
  const getNetworkIcon = (chainId?: number) => {
    switch (chainId) {
      case 1: // Ethereum Mainnet
        return '🔷';
      case 8453: // Base
        return '🔵';
      case 11155111: // Sepolia
        return '🔷';
      case 84532: // Base Sepolia
        return '🔵';
      default:
        return '🌐';
    }
  };

  return (
    <div className={styles.networkSelector}>
      <div className={styles.label}>Network</div>
      
      <button
        className={styles.currentNetwork}
        onClick={() => setIsExpanded(!isExpanded)}
        disabled={isPending}
      >
        <span className={styles.networkIcon}>{getNetworkIcon(chain?.id)}</span>
        <span className={styles.networkName}>{chain?.name || 'Unknown Network'}</span>
        <span className={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</span>
      </button>

      {/* Network list */}
      {isExpanded && (
        <div className={styles.networkList}>
          {chains.map((network) => (
            <button
              key={network.id}
              className={`${styles.networkItem} ${chain?.id === network.id ? styles.active : ''}`}
              onClick={() => handleNetworkSwitch(network.id)}
              disabled={chain?.id === network.id || isPending}
            >
              <span className={styles.networkIcon}>{getNetworkIcon(network.id)}</span>
              <span className={styles.networkName}>{network.name}</span>
              {chain?.id === network.id && (
                <span className={styles.checkmark}>✓</span>
              )}
            </button>
          ))}
        </div>
      )}

      {isPending && (
        <div className={styles.pending}>Switching network...</div>
      )}
    </div>
  );
}

