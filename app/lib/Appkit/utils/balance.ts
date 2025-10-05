/**
 * Reown AppKit - Balance Business Logic
 * Pure functions for balance formatting and calculations (no React dependencies)
 */

import type { BalanceInfo } from './types';

/**
 * Format Wei to Ether (for EVM chains)
 */
export function formatWeiToEther(wei: bigint | string, decimals: number = 4): string {
  const weiValue = typeof wei === 'string' ? BigInt(wei) : wei;
  const ether = Number(weiValue) / 1e18;
  return ether.toFixed(decimals);
}

/**
 * Format Lamports to SOL (for Solana)
 */
export function formatLamportsToSol(lamports: bigint | number, decimals: number = 4): string {
  const value = typeof lamports === 'bigint' ? Number(lamports) : lamports;
  const sol = value / 1e9;
  return sol.toFixed(decimals);
}

/**
 * Format Satoshis to BTC (for Bitcoin)
 */
export function formatSatoshisToBtc(satoshis: bigint | number, decimals: number = 8): string {
  const value = typeof satoshis === 'bigint' ? Number(satoshis) : satoshis;
  const btc = value / 1e8;
  return btc.toFixed(decimals);
}

/**
 * Format token amount based on decimals
 */
export function formatTokenAmount(
  amount: bigint | string | number,
  decimals: number,
  displayDecimals: number = 4
): string {
  const value = typeof amount === 'bigint' ? Number(amount) : 
                typeof amount === 'string' ? parseFloat(amount) : amount;
  
  const formatted = value / Math.pow(10, decimals);
  return formatted.toFixed(displayDecimals);
}

/**
 * Parse Ether to Wei
 */
export function parseEtherToWei(ether: string | number): bigint {
  const value = typeof ether === 'string' ? parseFloat(ether) : ether;
  if (isNaN(value)) throw new Error('Invalid ether value');
  return BigInt(Math.floor(value * 1e18));
}

/**
 * Parse SOL to Lamports
 */
export function parseSolToLamports(sol: string | number): number {
  const value = typeof sol === 'string' ? parseFloat(sol) : sol;
  if (isNaN(value)) throw new Error('Invalid SOL value');
  return Math.floor(value * 1e9);
}

/**
 * Parse BTC to Satoshis
 */
export function parseBtcToSatoshis(btc: string | number): number {
  const value = typeof btc === 'string' ? parseFloat(btc) : btc;
  if (isNaN(value)) throw new Error('Invalid BTC value');
  return Math.floor(value * 1e8);
}

/**
 * Format balance for display
 */
export function formatBalance(balance: BalanceInfo, includeSymbol: boolean = true): string {
  if (includeSymbol) {
    return `${balance.formatted} ${balance.symbol}`;
  }
  return balance.formatted;
}

/**
 * Format balance with USD value
 */
export function formatBalanceWithUSD(balance: BalanceInfo): string {
  if (!balance.usdValue) {
    return formatBalance(balance);
  }
  return `${formatBalance(balance)} ($${balance.usdValue})`;
}

/**
 * Format large numbers with K/M/B suffixes
 */
export function formatCompact(value: number, decimals: number = 2): string {
  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(decimals)}B`;
  } else if (value >= 1e6) {
    return `${(value / 1e6).toFixed(decimals)}M`;
  } else if (value >= 1e3) {
    return `${(value / 1e3).toFixed(decimals)}K`;
  }
  return value.toFixed(decimals);
}

/**
 * Format USD value
 */
export function formatUSD(value: number | string, decimals: number = 2): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return `$${num.toFixed(decimals)}`;
}

/**
 * Calculate USD value from amount and price
 */
export function calculateUSDValue(amount: number, pricePerUnit: number): string {
  const usd = amount * pricePerUnit;
  return formatUSD(usd);
}

/**
 * Check if balance is sufficient
 */
export function hasSufficientBalance(
  balance: string | number,
  required: string | number
): boolean {
  const balanceNum = typeof balance === 'string' ? parseFloat(balance) : balance;
  const requiredNum = typeof required === 'string' ? parseFloat(required) : required;
  
  return balanceNum >= requiredNum;
}

/**
 * Check if balance is zero
 */
export function isZeroBalance(balance: string | number): boolean {
  const value = typeof balance === 'string' ? parseFloat(balance) : balance;
  return value === 0;
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Format balance with appropriate precision based on value
 */
export function formatBalanceSmartPrecision(value: number, symbol: string): string {
  let decimals = 4;
  
  if (value === 0) {
    decimals = 2;
  } else if (value < 0.0001) {
    decimals = 8;
  } else if (value < 0.01) {
    decimals = 6;
  } else if (value < 1) {
    decimals = 4;
  } else if (value < 1000) {
    decimals = 2;
  } else {
    decimals = 0;
  }
  
  return `${value.toFixed(decimals)} ${symbol}`;
}

/**
 * Validate numeric input for amounts
 */
export function isValidAmount(amount: string): boolean {
  if (!amount || amount.trim() === '') return false;
  
  // Allow numbers and decimals
  const regex = /^[0-9]*\.?[0-9]+$/;
  return regex.test(amount);
}

/**
 * Parse amount string to number
 */
export function parseAmount(amount: string): number | null {
  if (!isValidAmount(amount)) return null;
  
  const parsed = parseFloat(amount);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Truncate decimals without rounding
 */
export function truncateDecimals(value: number, decimals: number): string {
  const str = value.toString();
  const decimalIndex = str.indexOf('.');
  
  if (decimalIndex === -1) return str;
  
  return str.substring(0, decimalIndex + decimals + 1);
}

/**
 * Format balance for input field
 */
export function formatBalanceForInput(value: number): string {
  // Remove trailing zeros after decimal
  return value.toString().replace(/\.?0+$/, '');
}

/**
 * Calculate gas cost in native currency
 */
export function calculateGasCost(
  gasLimit: number,
  gasPrice: bigint | string,
  decimals: number = 18
): string {
  const price = typeof gasPrice === 'string' ? BigInt(gasPrice) : gasPrice;
  const totalWei = BigInt(gasLimit) * price;
  return formatTokenAmount(totalWei, decimals, 6);
}

/**
 * Estimate total cost (amount + gas)
 */
export function calculateTotalCost(
  amount: string,
  gasCost: string
): string {
  const amountNum = parseFloat(amount);
  const gasNum = parseFloat(gasCost);
  
  return (amountNum + gasNum).toString();
}

/**
 * Check if amount exceeds balance (accounting for gas)
 */
export function exceedsBalanceWithGas(
  amount: string,
  balance: string,
  estimatedGas: string
): boolean {
  const total = calculateTotalCost(amount, estimatedGas);
  return !hasSufficientBalance(balance, total);
}

/**
 * Get max sendable amount (balance - gas)
 */
export function getMaxSendableAmount(
  balance: string,
  estimatedGas: string
): string {
  const balanceNum = parseFloat(balance);
  const gasNum = parseFloat(estimatedGas);
  
  const max = balanceNum - gasNum;
  return max > 0 ? max.toString() : '0';
}

/**
 * Format number with thousands separators
 */
export function formatWithSeparators(value: number, decimals: number = 2): string {
  const parts = value.toFixed(decimals).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

/**
 * Create balance info object
 */
export function createBalanceInfo(
  value: string,
  symbol: string,
  decimals: number,
  usdValue?: string
): BalanceInfo {
  return {
    value,
    symbol,
    decimals,
    formatted: formatTokenAmount(value, decimals),
    usdValue,
  };
}

