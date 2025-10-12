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

  // Get network icon path
  const getNetworkIcon = (chainId?: number, type?: string): string => {
    if (type === 'solana') return '/icons/networks/solana.svg';
    if (type === 'bitcoin') return '/icons/networks/bitcoin.svg';
    
    switch (chainId) {
      case 1: // Ethereum Mainnet
      case 11155111: // Sepolia
        return '/icons/networks/ethereum.svg';
      case 8453: // Base
      case 84532: // Base Sepolia
        return '/icons/networks/base.svg';
      case 56: // BSC
        return '/icons/networks/bsc.svg';
      case 999: // Hyperliquid
      case 998: // Hyperliquid Testnet
        return '/icons/networks/hyperliquid.svg';
      default:
        return '/icons/networks/default.svg';
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
    return { icon: '/icons/networks/default.svg', name: 'No Network' };
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
        <img src={currentNetwork.icon} alt={currentNetwork.name} className={styles.networkIconImg} />
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
              <img src={getNetworkIcon(network.id)} alt={network.name} className={styles.networkIconImg} />
              <span className={styles.networkName}>{network.name}</span>
              {chain?.id === network.id && (
                <img src="/icons/actions/check.svg" alt="Active" className={styles.checkmark} />
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
            <img src="/icons/actions/swap.svg" alt="" className={styles.networkIconImg} />
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

