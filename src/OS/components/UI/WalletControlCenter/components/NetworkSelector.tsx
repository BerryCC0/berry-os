/**
 * NetworkSelector Component
 * Multi-chain network switching interface (EVM, Solana, Bitcoin)
 */

'use client';

import { useState } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { useAppKitMultichain } from '@/app/lib/Appkit/utils/hooks';
import { evmNetworks, solanaNetworks, bitcoinNetworks } from '@/app/lib/Appkit/config';
import styles from './NetworkSelector.module.css';

export default function NetworkSelector() {
  const { chain } = useAccount();
  const { chains, switchChain, isPending: isEVMSwitching } = useSwitchChain();
  const { open } = useAppKit();
  const { evm, solana, bitcoin } = useAppKitMultichain();
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine current active chain type
  const activeChainType = evm.isConnected ? 'evm' : solana.isConnected ? 'solana' : bitcoin.isConnected ? 'bitcoin' : null;

  // Handle EVM network switch
  const handleEVMNetworkSwitch = (chainId: number) => {
    if (switchChain) {
      switchChain({ chainId });
      setIsExpanded(false);
    }
  };

  // Handle cross-chain switch (EVM <-> Solana <-> Bitcoin)
  const handleCrossChainSwitch = () => {
    open({ view: 'Networks' });
    setIsExpanded(false);
  };

  // Get network icon
  const getNetworkIcon = (chainId?: number, type?: string) => {
    if (type === 'solana') return '🟣';
    if (type === 'bitcoin') return '🟠';
    
    switch (chainId) {
      case 1: // Ethereum Mainnet
        return '🔷';
      case 8453: // Base
        return '🔵';
      case 56: // BSC
        return '🟡';
      case 999: // Hyperliquid
        return '⚡';
      case 998: // Hyperliquid Testnet
        return '⚡';
      case 11155111: // Sepolia
        return '🔷';
      case 84532: // Base Sepolia
        return '🔵';
      default:
        return '🌐';
    }
  };

  // Get current network display
  const getCurrentNetworkDisplay = () => {
    if (evm.isConnected && chain) {
      return { icon: getNetworkIcon(chain.id), name: chain.name };
    }
    if (solana.isConnected) {
      return { icon: getNetworkIcon(undefined, 'solana'), name: 'Solana' };
    }
    if (bitcoin.isConnected) {
      return { icon: getNetworkIcon(undefined, 'bitcoin'), name: 'Bitcoin' };
    }
    return { icon: '🌐', name: 'No Network' };
  };

  const currentNetwork = getCurrentNetworkDisplay();

  return (
    <div className={styles.networkSelector}>
      <div className={styles.label}>Network</div>
      
      <button
        className={styles.currentNetwork}
        onClick={() => setIsExpanded(!isExpanded)}
        disabled={isEVMSwitching}
      >
        <span className={styles.networkIcon}>{currentNetwork.icon}</span>
        <span className={styles.networkName}>{currentNetwork.name}</span>
        <span className={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</span>
      </button>

      {/* Network list */}
      {isExpanded && (
        <div className={styles.networkList}>
          {/* EVM Networks */}
          {activeChainType === 'evm' && chains.map((network) => (
            <button
              key={network.id}
              className={`${styles.networkItem} ${chain?.id === network.id ? styles.active : ''}`}
              onClick={() => handleEVMNetworkSwitch(network.id)}
              disabled={chain?.id === network.id || isEVMSwitching}
            >
              <span className={styles.networkIcon}>{getNetworkIcon(network.id)}</span>
              <span className={styles.networkName}>{network.name}</span>
              {chain?.id === network.id && (
                <span className={styles.checkmark}>✓</span>
              )}
            </button>
          ))}

          {/* Divider if showing cross-chain options */}
          {(solana.isConnected || bitcoin.isConnected || chains.length > 0) && (
            <div className={styles.divider} />
          )}

          {/* Cross-chain switcher button */}
          <button
            className={styles.networkItem}
            onClick={handleCrossChainSwitch}
          >
            <span className={styles.networkIcon}>🔄</span>
            <span className={styles.networkName}>
              {activeChainType === 'evm' ? 'Switch to Solana/Bitcoin' : 
               activeChainType === 'solana' ? 'Switch to EVM/Bitcoin' : 
               activeChainType === 'bitcoin' ? 'Switch to EVM/Solana' : 
               'Switch Network Type'}
            </span>
          </button>
        </div>
      )}

      {isEVMSwitching && (
        <div className={styles.pending}>Switching network...</div>
      )}
    </div>
  );
}

