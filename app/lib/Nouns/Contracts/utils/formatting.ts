/**
 * Formatting Utilities
 * Pure functions for formatting blockchain data for display
 */

import { Address, formatEther, parseEther } from 'viem';

/**
 * Format an Ethereum address for display
 * @param address - Full Ethereum address
 * @param chars - Number of characters to show on each side (default: 4)
 * @returns Shortened address (e.g., "0x1234...5678")
 */
export function formatAddress(address: Address, chars: number = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Format ETH amount for display
 * @param wei - Amount in wei
 * @param decimals - Number of decimal places (default: 4)
 * @returns Formatted ETH string (e.g., "1.5000")
 */
export function formatEth(wei: bigint, decimals: number = 4): string {
  const eth = formatEther(wei);
  const num = parseFloat(eth);
  return num.toFixed(decimals);
}

/**
 * Parse ETH string to wei
 * @param eth - ETH amount as string (e.g., "1.5")
 * @returns Amount in wei
 */
export function parseEth(eth: string): bigint {
  return parseEther(eth);
}

/**
 * Format Noun ID for display
 * @param tokenId - Noun token ID
 * @returns Formatted string (e.g., "Noun 1")
 */
export function formatNounId(tokenId: bigint | number): string {
  return `Noun ${tokenId}`;
}

/**
 * Format voting power for display
 * @param votes - Vote count
 * @returns Formatted string (e.g., "5" or "1,234")
 */
export function formatVotes(votes: bigint): string {
  return votes.toLocaleString();
}

/**
 * Format proposal ID for display
 * @param proposalId - Proposal ID
 * @returns Formatted string (e.g., "Proposal 123")
 */
export function formatProposalId(proposalId: bigint | number): string {
  return `Proposal ${proposalId}`;
}

/**
 * Format time remaining for display
 * @param seconds - Seconds remaining
 * @returns Formatted string (e.g., "1d 5h 30m" or "5h 30m" or "30m")
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return 'Ended';
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  const parts: string[] = [];
  
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);
  
  return parts.join(' ');
}

/**
 * Format timestamp to date string
 * @param timestamp - Unix timestamp in seconds
 * @returns Formatted date string
 */
export function formatDate(timestamp: number | bigint): string {
  const ts = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
  return new Date(ts * 1000).toLocaleDateString();
}

/**
 * Format timestamp to date and time string
 * @param timestamp - Unix timestamp in seconds
 * @returns Formatted date and time string
 */
export function formatDateTime(timestamp: number | bigint): string {
  const ts = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
  return new Date(ts * 1000).toLocaleString();
}

/**
 * Format percentage for display
 * @param numerator - Numerator value
 * @param denominator - Denominator value
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string (e.g., "45.67%")
 */
export function formatPercentage(
  numerator: bigint | number,
  denominator: bigint | number,
  decimals: number = 2
): string {
  if (denominator === BigInt(0) || denominator === 0) return '0%';
  
  const num = typeof numerator === 'bigint' ? Number(numerator) : numerator;
  const den = typeof denominator === 'bigint' ? Number(denominator) : denominator;
  
  const percentage = (num / den) * 100;
  return `${percentage.toFixed(decimals)}%`;
}

/**
 * Format BPS (basis points) to percentage
 * @param bps - Basis points (1 BPS = 0.01%)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string (e.g., "5.00%")
 */
export function formatBpsToPercentage(bps: number, decimals: number = 2): string {
  const percentage = (bps / 10000) * 100;
  return `${percentage.toFixed(decimals)}%`;
}

/**
 * Get Etherscan link for address
 * @param address - Ethereum address
 * @param chainId - Chain ID (default: 1 for mainnet)
 * @returns Etherscan URL
 */
export function getEtherscanAddressLink(address: Address, chainId: number = 1): string {
  const baseUrl = chainId === 1 ? 'https://etherscan.io' : `https://sepolia.etherscan.io`;
  return `${baseUrl}/address/${address}`;
}

/**
 * Get Etherscan link for transaction
 * @param txHash - Transaction hash
 * @param chainId - Chain ID (default: 1 for mainnet)
 * @returns Etherscan URL
 */
export function getEtherscanTxLink(txHash: string, chainId: number = 1): string {
  const baseUrl = chainId === 1 ? 'https://etherscan.io' : `https://sepolia.etherscan.io`;
  return `${baseUrl}/tx/${txHash}`;
}

/**
 * Truncate text to maximum length
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix to append (default: "...")
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
}

