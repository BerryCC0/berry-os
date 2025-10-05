/**
 * Reown AppKit - Network Business Logic
 * Pure functions for network/chain management (no React dependencies)
 */

import type {
  NetworkInfo,
  NetworkNamespace,
} from './types';

import {
  CHAIN_IDS,
  CHAIN_NAMES,
  EXPLORER_URLS,
} from './types';

/**
 * Get chain name from chain ID
 */
export function getChainName(chainId: number | string): string {
  return CHAIN_NAMES[chainId] || `Chain ${chainId}`;
}

/**
 * Get explorer URL for chain
 */
export function getExplorerUrl(chainId: number | string): string {
  return EXPLORER_URLS[chainId] || '';
}

/**
 * Check if chain is testnet
 */
export function isTestnet(chainId: number | string): boolean {
  const testnets = [
    CHAIN_IDS.ETHEREUM_SEPOLIA,
    CHAIN_IDS.BASE_SEPOLIA,
    CHAIN_IDS.SOLANA_TESTNET,
    CHAIN_IDS.SOLANA_DEVNET,
    CHAIN_IDS.BITCOIN_TESTNET,
  ];
  
  return testnets.includes(chainId as never);
}

/**
 * Check if chain is mainnet
 */
export function isMainnet(chainId: number | string): boolean {
  return !isTestnet(chainId);
}

/**
 * Get namespace from chain ID
 */
export function getNamespace(chainId: number | string): NetworkNamespace {
  if (typeof chainId === 'number') {
    return 'eip155'; // EVM chains use numeric IDs
  }
  
  const chainIdStr = chainId.toString();
  
  if (chainIdStr.startsWith('solana:')) {
    return 'solana';
  }
  
  if (chainIdStr.startsWith('bip122:')) {
    return 'bip122';
  }
  
  // Default to EVM
  return 'eip155';
}

/**
 * Check if chain is EVM
 */
export function isEVMChain(chainId: number | string): boolean {
  return getNamespace(chainId) === 'eip155';
}

/**
 * Check if chain is Solana
 */
export function isSolanaChain(chainId: number | string): boolean {
  return getNamespace(chainId) === 'solana';
}

/**
 * Check if chain is Bitcoin
 */
export function isBitcoinChain(chainId: number | string): boolean {
  return getNamespace(chainId) === 'bip122';
}

/**
 * Convert chain ID to hex (for EVM)
 */
export function chainIdToHex(chainId: number): string {
  return `0x${chainId.toString(16)}`;
}

/**
 * Convert hex to chain ID
 */
export function hexToChainId(hex: string): number {
  return parseInt(hex, 16);
}

/**
 * Parse CAIP-2 chain identifier
 */
export function parseCAIP2(chainId: string): {
  namespace: string;
  reference: string;
} | null {
  const parts = chainId.split(':');
  if (parts.length !== 2) return null;
  
  const [namespace, reference] = parts;
  return { namespace, reference };
}

/**
 * Build CAIP-2 chain identifier
 */
export function buildCAIP2(namespace: NetworkNamespace, reference: string): string {
  return `${namespace}:${reference}`;
}

/**
 * Get transaction explorer URL
 */
export function getTransactionUrl(
  chainId: number | string,
  txHash: string
): string {
  const explorerBase = getExplorerUrl(chainId);
  if (!explorerBase) return '';
  
  if (isSolanaChain(chainId)) {
    return `${explorerBase}/tx/${txHash}`;
  } else if (isBitcoinChain(chainId)) {
    return `${explorerBase}/tx/${txHash}`;
  } else {
    // EVM
    return `${explorerBase}/tx/${txHash}`;
  }
}

/**
 * Get address explorer URL
 */
export function getAddressUrl(
  chainId: number | string,
  address: string
): string {
  const explorerBase = getExplorerUrl(chainId);
  if (!explorerBase) return '';
  
  return `${explorerBase}/address/${address}`;
}

/**
 * Get block explorer URL
 */
export function getBlockUrl(
  chainId: number | string,
  blockNumber: number | string
): string {
  const explorerBase = getExplorerUrl(chainId);
  if (!explorerBase) return '';
  
  return `${explorerBase}/block/${blockNumber}`;
}

/**
 * Get token explorer URL (EVM only)
 */
export function getTokenUrl(
  chainId: number | string,
  tokenAddress: string
): string {
  const explorerBase = getExplorerUrl(chainId);
  if (!explorerBase || !isEVMChain(chainId)) return '';
  
  return `${explorerBase}/token/${tokenAddress}`;
}

/**
 * Validate chain ID format
 */
export function isValidChainId(chainId: unknown): boolean {
  if (typeof chainId === 'number') {
    return chainId > 0;
  }
  
  if (typeof chainId === 'string') {
    // Check CAIP-2 format
    return /^[a-z]+:[a-zA-Z0-9-_.]+$/.test(chainId);
  }
  
  return false;
}

/**
 * Get network currency symbol
 */
export function getNetworkCurrency(chainId: number | string): string {
  if (isSolanaChain(chainId)) return 'SOL';
  if (isBitcoinChain(chainId)) return 'BTC';
  
  // EVM chains
  const evmCurrencies: Record<number, string> = {
    [CHAIN_IDS.ETHEREUM_MAINNET]: 'ETH',
    [CHAIN_IDS.ETHEREUM_SEPOLIA]: 'ETH',
    [CHAIN_IDS.BASE_MAINNET]: 'ETH',
    [CHAIN_IDS.BASE_SEPOLIA]: 'ETH',
    [CHAIN_IDS.OPTIMISM]: 'ETH',
    [CHAIN_IDS.ARBITRUM]: 'ETH',
    [CHAIN_IDS.POLYGON]: 'MATIC',
  };
  
  return evmCurrencies[chainId as number] || 'ETH';
}

/**
 * Get network icon URL
 */
export function getNetworkIconUrl(chainId: number | string): string {
  // Return placeholder or actual icon URLs
  const icons: Record<string, string> = {
    [CHAIN_IDS.ETHEREUM_MAINNET]: '/icons/chains/ethereum.svg',
    [CHAIN_IDS.BASE_MAINNET]: '/icons/chains/base.svg',
    [CHAIN_IDS.OPTIMISM]: '/icons/chains/optimism.svg',
    [CHAIN_IDS.ARBITRUM]: '/icons/chains/arbitrum.svg',
    [CHAIN_IDS.POLYGON]: '/icons/chains/polygon.svg',
    [CHAIN_IDS.SOLANA_MAINNET]: '/icons/chains/solana.svg',
    [CHAIN_IDS.BITCOIN_MAINNET]: '/icons/chains/bitcoin.svg',
  };
  
  return icons[chainId.toString()] || '/icons/chains/default.svg';
}

/**
 * Compare chain IDs
 */
export function isSameChain(
  chainId1: number | string,
  chainId2: number | string
): boolean {
  return chainId1.toString() === chainId2.toString();
}

/**
 * Check if network switch is needed
 */
export function needsNetworkSwitch(
  currentChainId: number | string | undefined,
  targetChainId: number | string
): boolean {
  if (!currentChainId) return true;
  return !isSameChain(currentChainId, targetChainId);
}

/**
 * Get RPC URL for chain (placeholder - would be from config)
 */
export function getRPCUrl(chainId: number | string): string {
  // In production, this would come from configuration
  // Placeholder for now
  return '';
}

/**
 * Validate network configuration
 */
export function isValidNetwork(network: unknown): network is NetworkInfo {
  if (!network || typeof network !== 'object') return false;
  
  const net = network as Record<string, unknown>;
  
  return (
    (typeof net.chainId === 'number' || typeof net.chainId === 'string') &&
    typeof net.name === 'string' &&
    typeof net.currency === 'string' &&
    typeof net.rpcUrl === 'string' &&
    typeof net.namespace === 'string'
  );
}

/**
 * Create network info object
 */
export function createNetworkInfo(
  chainId: number | string,
  name: string,
  currency: string,
  rpcUrl: string,
  namespace: NetworkNamespace,
  options?: {
    explorerUrl?: string;
    testnet?: boolean;
    iconUrl?: string;
  }
): NetworkInfo {
  return {
    chainId,
    name,
    currency,
    rpcUrl,
    namespace,
    explorerUrl: options?.explorerUrl,
    testnet: options?.testnet,
    iconUrl: options?.iconUrl,
  };
}

/**
 * Get popular EVM chains
 */
export function getPopularEVMChains(): number[] {
  return [
    CHAIN_IDS.ETHEREUM_MAINNET,
    CHAIN_IDS.BASE_MAINNET,
    CHAIN_IDS.OPTIMISM,
    CHAIN_IDS.ARBITRUM,
    CHAIN_IDS.POLYGON,
  ];
}

/**
 * Get all supported chains by namespace
 */
export function getChainsByNamespace(namespace: NetworkNamespace): (number | string)[] {
  switch (namespace) {
    case 'eip155':
      return [
        CHAIN_IDS.ETHEREUM_MAINNET,
        CHAIN_IDS.ETHEREUM_SEPOLIA,
        CHAIN_IDS.BASE_MAINNET,
        CHAIN_IDS.BASE_SEPOLIA,
        CHAIN_IDS.OPTIMISM,
        CHAIN_IDS.ARBITRUM,
        CHAIN_IDS.POLYGON,
      ];
    case 'solana':
      return [
        CHAIN_IDS.SOLANA_MAINNET,
        CHAIN_IDS.SOLANA_TESTNET,
        CHAIN_IDS.SOLANA_DEVNET,
      ];
    case 'bip122':
      return [
        CHAIN_IDS.BITCOIN_MAINNET,
        CHAIN_IDS.BITCOIN_TESTNET,
      ];
    default:
      return [];
  }
}

/**
 * Format chain ID for display
 */
export function formatChainId(chainId: number | string): string {
  if (typeof chainId === 'number') {
    return chainId.toString();
  }
  
  // For CAIP-2, show just the reference part
  const parsed = parseCAIP2(chainId);
  return parsed ? parsed.reference : chainId;
}

/**
 * Get chain environment (mainnet/testnet/devnet)
 */
export function getChainEnvironment(chainId: number | string): 'mainnet' | 'testnet' | 'devnet' | 'unknown' {
  const devnets = [CHAIN_IDS.SOLANA_DEVNET];
  const testnets = [
    CHAIN_IDS.ETHEREUM_SEPOLIA,
    CHAIN_IDS.BASE_SEPOLIA,
    CHAIN_IDS.SOLANA_TESTNET,
    CHAIN_IDS.BITCOIN_TESTNET,
  ];
  
  if (devnets.includes(chainId as never)) return 'devnet';
  if (testnets.includes(chainId as never)) return 'testnet';
  if (isMainnet(chainId)) return 'mainnet';
  
  return 'unknown';
}

/**
 * Check if chain supports smart contracts
 */
export function supportsSmartContracts(chainId: number | string): boolean {
  const namespace = getNamespace(chainId);
  // EVM and Solana support smart contracts, Bitcoin doesn't (generally)
  return namespace === 'eip155' || namespace === 'solana';
}

/**
 * Check if chain supports tokens
 */
export function supportsTokens(chainId: number | string): boolean {
  const namespace = getNamespace(chainId);
  // EVM (ERC-20) and Solana (SPL) support tokens
  return namespace === 'eip155' || namespace === 'solana';
}

/**
 * Check if chain supports NFTs
 */
export function supportsNFTs(chainId: number | string): boolean {
  const namespace = getNamespace(chainId);
  // EVM (ERC-721/1155) and Solana support NFTs
  return namespace === 'eip155' || namespace === 'solana';
}

/**
 * Get chain layer (L1/L2)
 */
export function getChainLayer(chainId: number | string): 'L1' | 'L2' | 'unknown' {
  const l1Chains = [
    CHAIN_IDS.ETHEREUM_MAINNET,
    CHAIN_IDS.ETHEREUM_SEPOLIA,
    CHAIN_IDS.SOLANA_MAINNET,
    CHAIN_IDS.BITCOIN_MAINNET,
  ];
  
  const l2Chains = [
    CHAIN_IDS.BASE_MAINNET,
    CHAIN_IDS.BASE_SEPOLIA,
    CHAIN_IDS.OPTIMISM,
    CHAIN_IDS.ARBITRUM,
    CHAIN_IDS.POLYGON,
  ];
  
  if (l1Chains.includes(chainId as never)) return 'L1';
  if (l2Chains.includes(chainId as never)) return 'L2';
  
  return 'unknown';
}

/**
 * Get network summary for display
 */
export function getNetworkSummary(chainId: number | string): string {
  const name = getChainName(chainId);
  const currency = getNetworkCurrency(chainId);
  const environment = getChainEnvironment(chainId);
  const layer = getChainLayer(chainId);
  
  let summary = name;
  if (environment !== 'mainnet') {
    summary += ` (${environment})`;
  }
  if (layer !== 'unknown') {
    summary += ` [${layer}]`;
  }
  summary += ` • ${currency}`;
  
  return summary;
}

/**
 * Check if chains are compatible (same namespace)
 */
export function areChainsCompatible(
  chainId1: number | string,
  chainId2: number | string
): boolean {
  return getNamespace(chainId1) === getNamespace(chainId2);
}

/**
 * Sort chains by popularity/importance
 */
export function sortChainsByPopularity(chainIds: (number | string)[]): (number | string)[] {
  const priority: Record<string, number> = {
    [CHAIN_IDS.ETHEREUM_MAINNET]: 1,
    [CHAIN_IDS.BASE_MAINNET]: 2,
    [CHAIN_IDS.OPTIMISM]: 3,
    [CHAIN_IDS.ARBITRUM]: 4,
    [CHAIN_IDS.POLYGON]: 5,
    [CHAIN_IDS.SOLANA_MAINNET]: 6,
    [CHAIN_IDS.BITCOIN_MAINNET]: 7,
  };
  
  return [...chainIds].sort((a, b) => {
    const aPriority = priority[a.toString()] || 999;
    const bPriority = priority[b.toString()] || 999;
    return aPriority - bPriority;
  });
}

/**
 * Filter chains by criteria
 */
export function filterChains(
  chainIds: (number | string)[],
  options: {
    mainnetOnly?: boolean;
    testnetOnly?: boolean;
    namespace?: NetworkNamespace;
    supportsSmartContracts?: boolean;
  }
): (number | string)[] {
  return chainIds.filter(chainId => {
    if (options.mainnetOnly && !isMainnet(chainId)) return false;
    if (options.testnetOnly && !isTestnet(chainId)) return false;
    if (options.namespace && getNamespace(chainId) !== options.namespace) return false;
    if (options.supportsSmartContracts && !supportsSmartContracts(chainId)) return false;
    
    return true;
  });
}

