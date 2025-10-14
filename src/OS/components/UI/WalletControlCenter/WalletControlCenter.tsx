/**
 * Wallet Control Center Component
 * macOS Control Center-inspired wallet modal with Mac OS 8 aesthetics
 * Displays wallet info, balance, and provides quick actions
 * Supports EVM, Solana, and Bitcoin chains
 */

'use client';

import { useEffect, useState } from 'react';
import { useAccount, useEnsName, useBalance, useEnsAvatar, useDisconnect } from 'wagmi';
import { useAppKit, useAppKitProvider } from '@reown/appkit/react';
import { useAppKitMultichain } from '@/app/lib/Appkit/utils/hooks';
import { formatLamportsToSol, formatSatoshisToBtc } from '@/app/lib/Appkit/utils/balance';
import type { Address } from 'viem';
import WalletInfo from './components/WalletInfo';
import BalanceCard from './components/BalanceCard';
import QuickActions from './components/QuickActions';
import NetworkSelector from './components/NetworkSelector';
import styles from './WalletControlCenter.module.css';

export interface WalletControlCenterProps {
  onClose: () => void;
}

type ChainType = 'evm' | 'solana' | 'bitcoin';

export default function WalletControlCenter({ onClose }: WalletControlCenterProps) {
  // Multi-chain support
  const { evm, solana, bitcoin } = useAppKitMultichain();
  const { address: evmAddress, chain } = useAccount();
  const { disconnect } = useDisconnect();
  
  // Determine active chain type
  const activeChainType: ChainType | null = evm.isConnected ? 'evm' : 
                                            solana.isConnected ? 'solana' : 
                                            bitcoin.isConnected ? 'bitcoin' : null;
  
  // Get active address based on chain type
  const activeAddress = activeChainType === 'evm' ? evm.address :
                       activeChainType === 'solana' ? solana.address :
                       activeChainType === 'bitcoin' ? bitcoin.address : null;
  
  // Solana and Bitcoin balance state
  const [solanaBalance, setSolanaBalance] = useState<{ formatted: string; symbol: string } | null>(null);
  const [bitcoinBalance, setBitcoinBalance] = useState<{ formatted: string; symbol: string } | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  
  // Providers for non-EVM chains
  const { walletProvider: solanaProvider } = useAppKitProvider('solana');
  const { walletProvider: bitcoinProvider } = useAppKitProvider('bip122');
  
  // EVM-specific data (only fetch when on EVM)
  const { data: ensName } = useEnsName({
    address: evmAddress as Address,
    chainId: 1,
    query: {
      enabled: activeChainType === 'evm' && !!evmAddress,
    },
  });
  
  const { data: ensAvatar } = useEnsAvatar({
    name: ensName ? ensName : undefined,
    chainId: 1,
    query: {
      enabled: activeChainType === 'evm' && !!ensName,
    },
  });
  
  const { data: evmBalance } = useBalance({
    address: evmAddress as Address,
    query: {
      enabled: activeChainType === 'evm' && !!evmAddress,
    },
  });

  // Fetch Solana balance
  useEffect(() => {
    if (activeChainType === 'solana' && solana.address && solanaProvider) {
      setIsLoadingBalance(true);
      
      // Fetch Solana balance using provider
      const provider = solanaProvider as any;
      provider.request({ method: 'getBalance' })
        .then((result: any) => {
          const lamports = typeof result === 'object' ? result.value : result;
          const formatted = formatLamportsToSol(lamports, 4);
          setSolanaBalance({ formatted, symbol: 'SOL' });
        })
        .catch((error: Error) => {
          console.error('Failed to fetch Solana balance:', error);
          setSolanaBalance({ formatted: '0.0000', symbol: 'SOL' });
        })
        .finally(() => setIsLoadingBalance(false));
    }
  }, [activeChainType, solana.address, solanaProvider]);
  
  // Fetch Bitcoin balance
  useEffect(() => {
    if (activeChainType === 'bitcoin' && bitcoin.address && bitcoinProvider) {
      setIsLoadingBalance(true);
      
      // Fetch Bitcoin balance using provider
      const provider = bitcoinProvider as any;
      provider.request({ method: 'getBalance' })
        .then((result: any) => {
          const satoshis = typeof result === 'object' ? result.value : result;
          const formatted = formatSatoshisToBtc(satoshis, 8);
          setBitcoinBalance({ formatted, symbol: 'BTC' });
        })
        .catch((error: Error) => {
          console.error('Failed to fetch Bitcoin balance:', error);
          setBitcoinBalance({ formatted: '0.00000000', symbol: 'BTC' });
        })
        .finally(() => setIsLoadingBalance(false));
    }
  }, [activeChainType, bitcoin.address, bitcoinProvider]);

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

  // Determine which balance to show
  const getBalanceData = () => {
    if (activeChainType === 'evm') {
      return {
        balance: evmBalance?.formatted,
        symbol: evmBalance?.symbol,
        decimals: evmBalance?.decimals,
        isLoading: false,
      };
    } else if (activeChainType === 'solana') {
      return {
        balance: solanaBalance?.formatted,
        symbol: solanaBalance?.symbol || 'SOL',
        decimals: 9,
        isLoading: isLoadingBalance,
      };
    } else if (activeChainType === 'bitcoin') {
      return {
        balance: bitcoinBalance?.formatted,
        symbol: bitcoinBalance?.symbol || 'BTC',
        decimals: 8,
        isLoading: isLoadingBalance,
      };
    }
    return { balance: undefined, symbol: undefined, decimals: undefined, isLoading: false };
  };
  
  // Determine chain name
  const getChainName = () => {
    if (activeChainType === 'evm') {
      return chain?.name || 'Unknown Network';
    } else if (activeChainType === 'solana') {
      return 'Solana';
    } else if (activeChainType === 'bitcoin') {
      return 'Bitcoin';
    }
    return 'Unknown Network';
  };

  if (!activeAddress) return null;

  const balanceData = getBalanceData();

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
          address={activeAddress}
          ensName={activeChainType === 'evm' ? (ensName || undefined) : undefined}
          ensAvatar={activeChainType === 'evm' ? (ensAvatar || undefined) : undefined}
          chainName={getChainName()}
          chainType={activeChainType}
        />

        {/* Balance Section */}
        <BalanceCard
          balance={balanceData.balance}
          symbol={balanceData.symbol}
          decimals={balanceData.decimals}
          isLoading={balanceData.isLoading}
          chainType={activeChainType}
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

