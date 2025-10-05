/**
 * Farcaster Mini App SDK - Wallet Business Logic
 * Pure functions for wallet interactions (no React dependencies)
 */

import type {
  EthereumProvider,
  SolanaProvider,
  SupportedChain,
} from './types';

/**
 * Parse CAIP-2 chain identifier
 * https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-2.md
 */
export function parseChainId(chainId: SupportedChain): {
  namespace: string;
  reference: string;
} {
  const [namespace, reference] = chainId.split(':');
  return { namespace, reference };
}

/**
 * Check if chain is EVM-compatible
 */
export function isEVMChain(chainId: SupportedChain): boolean {
  return chainId.startsWith('eip155:');
}

/**
 * Check if chain is Solana
 */
export function isSolanaChain(chainId: SupportedChain): boolean {
  return chainId.startsWith('solana:');
}

/**
 * Convert EVM chain ID to hex format
 */
export function chainIdToHex(chainId: number): string {
  return `0x${chainId.toString(16)}`;
}

/**
 * Convert hex chain ID to decimal
 */
export function hexToChainId(hex: string): number {
  return parseInt(hex, 16);
}

/**
 * Get chain name from CAIP-2 identifier
 */
export function getChainName(chainId: SupportedChain): string {
  const chainNames: Record<string, string> = {
    'eip155:1': 'Ethereum Mainnet',
    'eip155:8453': 'Base',
    'eip155:10': 'Optimism',
    'eip155:137': 'Polygon',
    'eip155:42161': 'Arbitrum One',
    'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp': 'Solana Mainnet',
  };
  
  return chainNames[chainId] || chainId;
}

/**
 * Get chain explorer URL
 */
export function getChainExplorer(chainId: SupportedChain): string {
  const explorers: Record<string, string> = {
    'eip155:1': 'https://etherscan.io',
    'eip155:8453': 'https://basescan.org',
    'eip155:10': 'https://optimistic.etherscan.io',
    'eip155:137': 'https://polygonscan.com',
    'eip155:42161': 'https://arbiscan.io',
    'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp': 'https://explorer.solana.com',
  };
  
  return explorers[chainId] || '';
}

/**
 * Format Ethereum address for display (0x1234...5678)
 */
export function formatAddress(address: string, chars: number = 4): string {
  if (!address || address.length < chars * 2 + 2) return address;
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

/**
 * Validate Ethereum address format
 */
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate Solana address format (base58, 32-44 chars)
 */
export function isValidSolanaAddress(address: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

/**
 * Check if provider is connected
 */
export function isEthereumProviderConnected(provider: EthereumProvider): boolean {
  return provider.accounts && provider.accounts.length > 0;
}

/**
 * Check if Solana provider is connected
 */
export function isSolanaProviderConnected(provider: SolanaProvider): boolean {
  return provider.publicKey !== null;
}

/**
 * Get primary account from Ethereum provider
 */
export function getPrimaryAccount(provider: EthereumProvider): string | null {
  return provider.accounts && provider.accounts.length > 0 
    ? provider.accounts[0] 
    : null;
}

/**
 * Get Solana public key as string
 */
export function getSolanaPublicKey(provider: SolanaProvider): string | null {
  return provider.publicKey ? provider.publicKey.toBase58() : null;
}

/**
 * Request accounts from Ethereum provider
 */
export async function requestEthereumAccounts(
  provider: EthereumProvider
): Promise<string[]> {
  try {
    const accounts = await provider.request({
      method: 'eth_requestAccounts',
    }) as string[];
    return accounts;
  } catch (error) {
    throw new Error(`Failed to request accounts: ${error}`);
  }
}

/**
 * Switch Ethereum chain
 */
export async function switchEthereumChain(
  provider: EthereumProvider,
  chainId: number
): Promise<void> {
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdToHex(chainId) }],
    });
  } catch (error: unknown) {
    // Chain not added to wallet, try adding it
    if ((error as { code?: number }).code === 4902) {
      throw new Error('Chain not added to wallet. Please add it first.');
    }
    throw error;
  }
}

/**
 * Get current chain ID from Ethereum provider
 */
export async function getCurrentChainId(
  provider: EthereumProvider
): Promise<number> {
  try {
    const chainId = await provider.request({
      method: 'eth_chainId',
    }) as string;
    return hexToChainId(chainId);
  } catch (error) {
    throw new Error(`Failed to get chain ID: ${error}`);
  }
}

/**
 * Get account balance (Ethereum)
 */
export async function getEthereumBalance(
  provider: EthereumProvider,
  address: string
): Promise<bigint> {
  try {
    const balance = await provider.request({
      method: 'eth_getBalance',
      params: [address, 'latest'],
    }) as string;
    return BigInt(balance);
  } catch (error) {
    throw new Error(`Failed to get balance: ${error}`);
  }
}

/**
 * Format Wei to Ether (for display)
 */
export function formatEther(wei: bigint, decimals: number = 4): string {
  const ether = Number(wei) / 1e18;
  return ether.toFixed(decimals);
}

/**
 * Parse Ether to Wei
 */
export function parseEther(ether: string): bigint {
  const value = parseFloat(ether);
  if (isNaN(value)) throw new Error('Invalid ether value');
  return BigInt(Math.floor(value * 1e18));
}

/**
 * Sign message with Ethereum provider
 */
export async function signEthereumMessage(
  provider: EthereumProvider,
  address: string,
  message: string
): Promise<string> {
  try {
    const signature = await provider.request({
      method: 'personal_sign',
      params: [message, address],
    }) as string;
    return signature;
  } catch (error) {
    throw new Error(`Failed to sign message: ${error}`);
  }
}

/**
 * Sign message with Solana provider
 */
export async function signSolanaMessage(
  provider: SolanaProvider,
  message: string
): Promise<string> {
  try {
    const encodedMessage = new TextEncoder().encode(message);
    const { signature } = await provider.signMessage(encodedMessage);
    return Buffer.from(signature).toString('hex');
  } catch (error) {
    throw new Error(`Failed to sign message: ${error}`);
  }
}

/**
 * Estimate gas for Ethereum transaction
 */
export async function estimateGas(
  provider: EthereumProvider,
  transaction: {
    from: string;
    to: string;
    value?: string;
    data?: string;
  }
): Promise<bigint> {
  try {
    const gas = await provider.request({
      method: 'eth_estimateGas',
      params: [transaction],
    }) as string;
    return BigInt(gas);
  } catch (error) {
    throw new Error(`Failed to estimate gas: ${error}`);
  }
}

/**
 * Send Ethereum transaction
 */
export async function sendEthereumTransaction(
  provider: EthereumProvider,
  transaction: {
    from: string;
    to: string;
    value?: string;
    data?: string;
    gas?: string;
    gasPrice?: string;
  }
): Promise<string> {
  try {
    const txHash = await provider.request({
      method: 'eth_sendTransaction',
      params: [transaction],
    }) as string;
    return txHash;
  } catch (error) {
    throw new Error(`Failed to send transaction: ${error}`);
  }
}

/**
 * Get transaction receipt
 */
export async function getTransactionReceipt(
  provider: EthereumProvider,
  txHash: string
): Promise<{
  status: string;
  blockNumber: string;
  gasUsed: string;
}> {
  try {
    const receipt = await provider.request({
      method: 'eth_getTransactionReceipt',
      params: [txHash],
    }) as {
      status: string;
      blockNumber: string;
      gasUsed: string;
    };
    return receipt;
  } catch (error) {
    throw new Error(`Failed to get transaction receipt: ${error}`);
  }
}

/**
 * Wait for transaction confirmation
 */
export async function waitForTransaction(
  provider: EthereumProvider,
  txHash: string,
  confirmations: number = 1,
  timeout: number = 60000
): Promise<{
  status: string;
  blockNumber: string;
  gasUsed: string;
}> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    try {
      const receipt = await getTransactionReceipt(provider, txHash);
      
      if (receipt && receipt.blockNumber) {
        // Transaction mined, check confirmations
        const currentBlock = await provider.request({
          method: 'eth_blockNumber',
        }) as string;
        
        const currentBlockNum = hexToChainId(currentBlock);
        const txBlockNum = hexToChainId(receipt.blockNumber);
        
        if (currentBlockNum - txBlockNum >= confirmations - 1) {
          return receipt;
        }
      }
    } catch {
      // Receipt not available yet, continue polling
    }
    
    // Wait 2 seconds before next poll
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  throw new Error('Transaction confirmation timeout');
}

/**
 * Check if wallet supports specific method
 */
export function supportsMethod(
  provider: EthereumProvider,
  method: string
): boolean {
  // Common methods all EIP-1193 providers should support
  const standardMethods = [
    'eth_requestAccounts',
    'eth_accounts',
    'eth_chainId',
    'eth_sendTransaction',
    'personal_sign',
    'eth_getBalance',
  ];
  
  return standardMethods.includes(method);
}

/**
 * Create wallet connection error message
 */
export function getWalletErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    const err = error as { code?: number; message?: string };
    
    // Handle common error codes
    switch (err.code) {
      case 4001:
        return 'User rejected the request';
      case 4100:
        return 'The requested method and/or account has not been authorized';
      case 4200:
        return 'The provider does not support the requested method';
      case 4900:
        return 'The provider is disconnected from all chains';
      case 4901:
        return 'The provider is disconnected from the specified chain';
      default:
        return err.message || 'Unknown wallet error';
    }
  }
  
  return String(error);
}

