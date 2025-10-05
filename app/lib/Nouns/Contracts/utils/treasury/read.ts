/**
 * Treasury Timelock - Read Functions
 * Pure functions and utilities for reading treasury timelock data
 */

import { Address } from 'viem';
import { NOUNS_CONTRACTS } from '../../addresses';
import { TreasuryTimelockABI } from '../../abis';

/**
 * Calculate transaction hash for queued transaction
 * This is how the timelock identifies transactions
 * @param target - Target contract address
 * @param value - ETH value to send
 * @param signature - Function signature
 * @param data - Encoded function data
 * @param eta - Execution timestamp
 * @returns Transaction hash
 */
export function calculateTransactionHash(
  target: Address,
  value: bigint,
  signature: string,
  data: string,
  eta: bigint
): string {
  // Hash: keccak256(abi.encode(target, value, signature, data, eta))
  // This matches the Solidity implementation
  const { keccak256, encodePacked } = require('viem');
  return keccak256(
    encodePacked(
      ['address', 'uint256', 'string', 'bytes', 'uint256'],
      [target, value, signature, data as `0x${string}`, eta]
    )
  );
}

/**
 * Check if a transaction is queued
 * @param txHash - Transaction hash from calculateTransactionHash
 * @param queuedTransactions - Mapping from contract read
 * @returns True if transaction is queued
 */
export function isTransactionQueued(txHash: string, isQueued: boolean): boolean {
  return isQueued;
}

/**
 * Check if a transaction can be executed
 * @param eta - Execution timestamp from when transaction was queued
 * @param gracePeriod - Grace period in seconds (typically 14 days)
 * @returns True if transaction is ready to execute
 */
export function canExecuteTransaction(eta: bigint, gracePeriod: bigint): boolean {
  const now = BigInt(Math.floor(Date.now() / 1000));
  const deadline = eta + gracePeriod;
  
  // Must be after ETA but before deadline
  return now >= eta && now <= deadline;
}

/**
 * Check if a transaction has expired
 * @param eta - Execution timestamp
 * @param gracePeriod - Grace period in seconds
 * @returns True if transaction is past deadline
 */
export function isTransactionExpired(eta: bigint, gracePeriod: bigint): boolean {
  const now = BigInt(Math.floor(Date.now() / 1000));
  const deadline = eta + gracePeriod;
  return now > deadline;
}

/**
 * Calculate when a transaction can be executed
 * @param delay - Timelock delay in seconds
 * @returns Timestamp when transaction can be executed
 */
export function calculateETA(delay: bigint): bigint {
  return BigInt(Math.floor(Date.now() / 1000)) + delay;
}

/**
 * Format time remaining until execution
 * @param eta - Execution timestamp
 * @returns Human-readable time remaining
 */
export function formatTimeUntilExecution(eta: bigint): string {
  const now = Math.floor(Date.now() / 1000);
  const etaNum = Number(eta);
  const remaining = etaNum - now;
  
  if (remaining <= 0) return 'Ready to execute';
  
  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/**
 * Format time remaining in grace period
 * @param eta - Execution timestamp
 * @param gracePeriod - Grace period in seconds
 * @returns Human-readable time remaining before expiration
 */
export function formatTimeUntilExpiration(eta: bigint, gracePeriod: bigint): string {
  const now = BigInt(Math.floor(Date.now() / 1000));
  const deadline = eta + gracePeriod;
  const remaining = Number(deadline - now);
  
  if (remaining <= 0) return 'Expired';
  
  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  
  if (days > 0) return `${days}d ${hours}h until expiration`;
  return `${hours}h until expiration`;
}

/**
 * Validate transaction parameters
 * @param target - Target contract address
 * @param signature - Function signature
 * @param data - Encoded function data
 * @returns Validation result
 */
export function validateTransactionParams(
  target: Address,
  signature: string,
  data: string
): { valid: boolean; error?: string } {
  // Check target is valid address
  if (!target || target === '0x0000000000000000000000000000000000000000') {
    return { valid: false, error: 'Invalid target address' };
  }
  
  // Check signature format (can be empty for direct calls)
  if (signature && !signature.includes('(')) {
    return { valid: false, error: 'Invalid function signature format' };
  }
  
  // Check data is valid hex
  if (!data.startsWith('0x')) {
    return { valid: false, error: 'Data must be hex string starting with 0x' };
  }
  
  return { valid: true };
}

/**
 * Get treasury contract address
 * @returns Treasury timelock proxy address
 */
export function getTreasuryAddress(): Address {
  return NOUNS_CONTRACTS.NounsTreasury.proxy as Address;
}

/**
 * Check if address is treasury admin
 * @param address - Address to check
 * @param adminAddress - Current admin from contract
 * @returns True if address is admin
 */
export function isTreasuryAdmin(address: Address, adminAddress: Address): boolean {
  return address.toLowerCase() === adminAddress.toLowerCase();
}

/**
 * Parse delay value to human readable format
 * @param delay - Delay in seconds
 * @returns Human-readable delay
 */
export function formatDelay(delay: bigint): string {
  const seconds = Number(delay);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''}${hours > 0 ? ` ${hours}h` : ''}`;
  }
  return `${hours} hour${hours > 1 ? 's' : ''}`;
}

/**
 * Timelock constants
 */
export const TIMELOCK_CONSTANTS = {
  MINIMUM_DELAY: 2 * 24 * 60 * 60, // 2 days
  MAXIMUM_DELAY: 30 * 24 * 60 * 60, // 30 days
  GRACE_PERIOD: 14 * 24 * 60 * 60, // 14 days
} as const;

// ============================================================================
// CONTRACT READ FUNCTIONS (for useReadContract)
// ============================================================================

/**
 * Get timelock delay
 */
export function getDelay() {
  return {
    address: NOUNS_CONTRACTS.NounsTreasury.proxy as Address,
    abi: TreasuryTimelockABI,
    functionName: 'delay'
  } as const;
}

/**
 * Get grace period
 */
export function getGracePeriod() {
  return {
    address: NOUNS_CONTRACTS.NounsTreasury.proxy as Address,
    abi: TreasuryTimelockABI,
    functionName: 'GRACE_PERIOD'
  } as const;
}

/**
 * Get admin address
 */
export function getAdmin() {
  return {
    address: NOUNS_CONTRACTS.NounsTreasury.proxy as Address,
    abi: TreasuryTimelockABI,
    functionName: 'admin'
  } as const;
}

/**
 * Get pending admin address
 */
export function getPendingAdmin() {
  return {
    address: NOUNS_CONTRACTS.NounsTreasury.proxy as Address,
    abi: TreasuryTimelockABI,
    functionName: 'pendingAdmin'
  } as const;
}

/**
 * Check if transaction is queued
 * @param txHash Transaction hash
 */
export function getQueuedTransaction(txHash: `0x${string}`) {
  return {
    address: NOUNS_CONTRACTS.NounsTreasury.proxy as Address,
    abi: TreasuryTimelockABI,
    functionName: 'queuedTransactions',
    args: [txHash]
  } as const;
}

