/**
 * Contract Helper Utilities
 * 
 * Utility functions for interacting with Nouns contracts
 */

import { NOUNS_CONTRACTS, getContractAddress } from '../addresses';
import type { Address } from 'viem';

/**
 * Contract configuration type
 */
export interface ContractConfig {
  address: Address;
  abi: any;
  chainId: number;
}

/**
 * Get contract configuration
 */
export function getContractConfig(
  contractName: keyof typeof NOUNS_CONTRACTS,
  abi: any
): ContractConfig {
  return {
    address: getContractAddress(contractName) as Address,
    abi,
    chainId: 1, // Ethereum Mainnet
  };
}

/**
 * Format contract address for display
 */
export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Check if address is valid Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Get Etherscan link for address
 */
export function getEtherscanAddressLink(address: string): string {
  return `https://etherscan.io/address/${address}`;
}

/**
 * Get Etherscan link for transaction
 */
export function getEtherscanTxLink(txHash: string): string {
  return `https://etherscan.io/tx/${txHash}`;
}

/**
 * Get Etherscan link for token
 */
export function getEtherscanTokenLink(address: string, tokenId: string): string {
  return `https://etherscan.io/token/${address}?a=${tokenId}`;
}

/**
 * Format wei to ETH
 */
export function formatEth(wei: bigint | string): string {
  const weiValue = typeof wei === 'string' ? BigInt(wei) : wei;
  const eth = Number(weiValue) / 1e18;
  return eth.toFixed(4);
}

/**
 * Parse ETH to wei
 */
export function parseEth(eth: string): bigint {
  const value = parseFloat(eth);
  return BigInt(Math.floor(value * 1e18));
}

/**
 * Format large numbers with commas
 */
export function formatNumber(num: number | string): string {
  const value = typeof num === 'string' ? parseFloat(num) : num;
  return value.toLocaleString('en-US');
}

/**
 * Calculate percentage
 */
export function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0;
  return (part / total) * 100;
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

