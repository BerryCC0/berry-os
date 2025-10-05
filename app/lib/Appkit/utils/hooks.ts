/**
 * Reown AppKit - React Hooks
 * Presentation layer hooks that use business logic
 */

'use client';

import { useMemo } from 'react';
import {
  useAppKit,
  useAppKitAccount,
  useAppKitNetwork,
  useAppKitState,
  useDisconnect,
  useAppKitProvider,
} from '@reown/appkit/react';

// Business logic imports
import {
  formatAddress,
  getAccountDisplayName,
  isConnected,
  isConnecting,
  getAccountSummary,
  getNamespaceFromCAIP,
} from './account';

import {
  getChainName,
  getExplorerUrl,
  getNetworkCurrency,
  getNetworkSummary,
  isTestnet,
  getNamespace,
} from './network';

import type {
  NetworkNamespace,
  OpenModalOptions,
} from './types';

/**
 * Enhanced useAppKitAccount with utility methods
 */
export function useEnhancedAccount(options?: { namespace?: NetworkNamespace }) {
  const account = useAppKitAccount(options);
  
  const computed = useMemo(() => {
    if (!account.address) return null;
    
    return {
      formattedAddress: formatAddress(account.address, 4),
      displayName: account.address ? formatAddress(account.address, 4) : '',
      summary: account.isConnected ? `Connected: ${formatAddress(account.address, 4)}` : 'Not connected',
      namespace: account.caipAddress ? getNamespaceFromCAIP(account.caipAddress) : null,
    };
  }, [account.address, account.caipAddress, account.isConnected]);
  
  return {
    ...account,
    ...computed,
    isConnected: isConnected(account as never),
    isConnecting: account.status ? isConnecting(account.status) : false,
  };
}

/**
 * Enhanced useAppKitNetwork with utility methods
 */
export function useEnhancedNetwork() {
  const network = useAppKitNetwork();
  
  const computed = useMemo(() => {
    if (!network.chainId) return null;
    
    return {
      chainName: getChainName(network.chainId),
      explorerUrl: getExplorerUrl(network.chainId),
      currency: getNetworkCurrency(network.chainId),
      summary: getNetworkSummary(network.chainId),
      isTestnet: isTestnet(network.chainId),
      namespace: getNamespace(network.chainId),
    };
  }, [network.chainId]);
  
  return {
    ...network,
    ...computed,
  };
}

/**
 * Enhanced useAppKit with typed options
 */
export function useEnhancedAppKit() {
  const { open, close } = useAppKit();
  
  const openModal = useMemo(() => {
    return (options?: OpenModalOptions) => {
      open(options);
    };
  }, [open]);
  
  const openConnect = useMemo(() => {
    return (namespace?: NetworkNamespace) => {
      open({ view: 'Connect', namespace });
    };
  }, [open]);
  
  const openAccount = useMemo(() => {
    return () => {
      open({ view: 'Account' });
    };
  }, [open]);
  
  const openNetworks = useMemo(() => {
    return () => {
      open({ view: 'Networks' });
    };
  }, [open]);
  
  const openSwap = useMemo(() => {
    return (fromToken?: string, toToken?: string, amount?: string) => {
      open({ 
        view: 'Swap',
        arguments: { fromToken, toToken, amount }
      });
    };
  }, [open]);
  
  return {
    open: openModal,
    close,
    openConnect,
    openAccount,
    openNetworks,
    openSwap,
  };
}

/**
 * Enhanced useDisconnect with logging
 */
export function useEnhancedDisconnect() {
  const { disconnect } = useDisconnect();
  
  const disconnectWallet = useMemo(() => {
    return async () => {
      try {
        await disconnect();
        console.log('Wallet disconnected');
      } catch (error) {
        console.error('Failed to disconnect:', error);
        throw error;
      }
    };
  }, [disconnect]);
  
  return {
    disconnect: disconnectWallet,
  };
}

/**
 * useAppKitConnection - Get connection state
 */
export function useAppKitConnection() {
  const account = useAppKitAccount();
  const network = useAppKitNetwork();
  const state = useAppKitState();
  
  return {
    isConnected: account.isConnected,
    address: account.address,
    chainId: network.chainId,
    isOpen: state.open,
    status: account.status,
  };
}

/**
 * useAppKitMultichain - Get all chain accounts
 */
export function useAppKitMultichain() {
  const evm = useAppKitAccount({ namespace: 'eip155' });
  const solana = useAppKitAccount({ namespace: 'solana' });
  const bitcoin = useAppKitAccount({ namespace: 'bip122' });
  
  return {
    evm: {
      ...evm,
      isConnected: isConnected(evm as never),
      formatted: evm.address ? formatAddress(evm.address) : '',
    },
    solana: {
      ...solana,
      isConnected: isConnected(solana as never),
      formatted: solana.address ? formatAddress(solana.address) : '',
    },
    bitcoin: {
      ...bitcoin,
      isConnected: isConnected(bitcoin as never),
      formatted: bitcoin.address ? formatAddress(bitcoin.address) : '',
    },
    anyConnected: evm.isConnected || solana.isConnected || bitcoin.isConnected,
  };
}

/**
 * useAppKitProvider - Get provider with type safety
 */
export function useEnhancedProvider(namespace: NetworkNamespace) {
  const { walletProvider } = useAppKitProvider(namespace);
  
  return {
    provider: walletProvider,
    isReady: !!walletProvider,
  };
}

/**
 * useAppKitModal - Control modal state
 */
export function useAppKitModal() {
  const state = useAppKitState();
  const { open, close } = useAppKit();
  
  return {
    isOpen: state.open,
    open,
    close,
    toggle: () => state.open ? close() : open(),
  };
}

/**
 * useAppKitReady - Check if AppKit is ready
 */
export function useAppKitReady() {
  const account = useAppKitAccount();
  const network = useAppKitNetwork();
  
  return {
    isReady: !!account && !!network,
    hasAccount: !!account.address,
    hasNetwork: !!network.chainId,
  };
}

