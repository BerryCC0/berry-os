/**
 * Stream Factory - Read Functions
 * Pure functions and utilities for reading stream data
 */

import { Address, formatUnits } from 'viem';
import { NOUNS_CONTRACTS } from '../../addresses';

/**
 * Get Stream Factory contract address
 * @returns Stream Factory address
 */
export function getStreamFactoryAddress(): Address {
  return NOUNS_CONTRACTS.StreamFactory.address as Address;
}

/**
 * Check if stream is active
 * @param streamData - Stream data from contract
 * @returns True if stream is currently active
 */
export function isStreamActive(streamData: {
  isActive: boolean;
  startTime: bigint;
  stopTime: bigint;
}): boolean {
  if (!streamData.isActive) return false;
  
  const now = BigInt(Math.floor(Date.now() / 1000));
  return now >= streamData.startTime && now < streamData.stopTime;
}

/**
 * Calculate stream progress percentage
 * @param startTime - Stream start timestamp
 * @param stopTime - Stream stop timestamp
 * @returns Progress percentage (0-100)
 */
export function calculateStreamProgress(startTime: bigint, stopTime: bigint): number {
  const now = BigInt(Math.floor(Date.now() / 1000));
  
  if (now < startTime) return 0;
  if (now >= stopTime) return 100;
  
  const elapsed = Number(now - startTime);
  const duration = Number(stopTime - startTime);
  
  return (elapsed / duration) * 100;
}

/**
 * Calculate remaining stream amount
 * @param totalAmount - Total stream amount
 * @param withdrawnAmount - Amount already withdrawn
 * @returns Remaining amount
 */
export function calculateRemainingAmount(totalAmount: bigint, withdrawnAmount: bigint): bigint {
  return totalAmount - withdrawnAmount;
}

/**
 * Calculate available to withdraw at current time
 * @param totalAmount - Total stream amount
 * @param startTime - Stream start timestamp
 * @param stopTime - Stream stop timestamp
 * @param withdrawnAmount - Amount already withdrawn
 * @returns Amount available to withdraw now
 */
export function calculateAvailableAmount(
  totalAmount: bigint,
  startTime: bigint,
  stopTime: bigint,
  withdrawnAmount: bigint
): bigint {
  const now = BigInt(Math.floor(Date.now() / 1000));
  
  if (now < startTime) return BigInt(0);
  if (now >= stopTime) return totalAmount - withdrawnAmount;
  
  const elapsed = now - startTime;
  const duration = stopTime - startTime;
  const earned = (totalAmount * elapsed) / duration;
  
  return earned > withdrawnAmount ? earned - withdrawnAmount : BigInt(0);
}

/**
 * Format stream amount (USDC)
 * @param amount - Amount in USDC's smallest unit
 * @returns Formatted string
 */
export function formatStreamAmount(amount: bigint): string {
  return '$' + Number(formatUnits(amount, 6)).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Calculate stream rate per second
 * @param totalAmount - Total stream amount
 * @param startTime - Stream start timestamp
 * @param stopTime - Stream stop timestamp
 * @returns Rate per second
 */
export function calculateStreamRate(
  totalAmount: bigint,
  startTime: bigint,
  stopTime: bigint
): bigint {
  const duration = stopTime - startTime;
  if (duration === BigInt(0)) return BigInt(0);
  return totalAmount / duration;
}

/**
 * Format stream rate
 * @param ratePerSecond - Rate per second in USDC's smallest unit
 * @param unit - Time unit to display ('second' | 'minute' | 'hour' | 'day')
 * @returns Formatted rate string
 */
export function formatStreamRate(
  ratePerSecond: bigint,
  unit: 'second' | 'minute' | 'hour' | 'day' = 'day'
): string {
  const multipliers = {
    second: 1,
    minute: 60,
    hour: 3600,
    day: 86400,
  };
  
  const rate = ratePerSecond * BigInt(multipliers[unit]);
  return formatStreamAmount(rate) + `/${unit}`;
}

/**
 * Validate stream parameters
 * @param recipient - Stream recipient
 * @param amount - Stream amount
 * @param startTime - Start timestamp
 * @param stopTime - Stop timestamp
 * @returns Validation result
 */
export function validateStreamParams(
  recipient: Address,
  amount: bigint,
  startTime: bigint,
  stopTime: bigint
): { valid: boolean; error?: string } {
  if (!recipient || recipient === '0x0000000000000000000000000000000000000000') {
    return { valid: false, error: 'Invalid recipient address' };
  }
  if (amount <= BigInt(0)) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }
  if (stopTime <= startTime) {
    return { valid: false, error: 'Stop time must be after start time' };
  }
  const minDuration = BigInt(3600); // 1 hour
  if (stopTime - startTime < minDuration) {
    return { valid: false, error: 'Stream duration too short (minimum 1 hour)' };
  }
  return { valid: true };
}

/**
 * Format time remaining in stream
 * @param stopTime - Stream stop timestamp
 * @returns Human-readable time remaining
 */
export function formatTimeRemaining(stopTime: bigint): string {
  const now = Math.floor(Date.now() / 1000);
  const stopNum = Number(stopTime);
  const remaining = stopNum - now;
  
  if (remaining <= 0) return 'Ended';
  
  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  
  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}


// ============================================================================
// CONTRACT READ FUNCTIONS (for wagmi)
// ============================================================================

import { StreamFactoryABI } from '../../abis';

/**
 * Get stream data
 * @param streamId - Stream ID
 * @returns Wagmi read config
 */
export function getStream(streamId: bigint) {
  return {
    address: NOUNS_CONTRACTS.StreamFactory.address as Address,
    abi: StreamFactoryABI,
    functionName: 'getStream',
    args: [streamId],
  } as const;
}

/**
 * Get stream balance
 * @param streamId - Stream ID
 * @returns Wagmi read config
 */
export function getStreamBalance(streamId: bigint) {
  return {
    address: NOUNS_CONTRACTS.StreamFactory.address as Address,
    abi: StreamFactoryABI,
    functionName: 'balanceOf',
    args: [streamId],
  } as const;
}
