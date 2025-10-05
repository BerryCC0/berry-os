/**
 * Fork Mechanism - Read Functions
 * Pure functions and utilities for reading fork escrow and deployer data
 */

import { Address } from 'viem';
import { NOUNS_CONTRACTS } from '../../addresses';

/**
 * Get Fork Escrow contract address
 * @returns Fork Escrow address
 */
export function getForkEscrowAddress(): Address {
  return NOUNS_CONTRACTS.ForkEscrow.address as Address;
}

/**
 * Get Fork DAO Deployer contract address
 * @returns Fork DAO Deployer address
 */
export function getForkDeployerAddress(): Address {
  return NOUNS_CONTRACTS.ForkDAODeployer.address as Address;
}

/**
 * Check if fork is active
 * @param forkEndTimestamp - Fork end timestamp from contract
 * @returns True if fork period is active
 */
export function isForkActive(forkEndTimestamp: bigint): boolean {
  const now = BigInt(Math.floor(Date.now() / 1000));
  return forkEndTimestamp > now;
}

/**
 * Calculate time remaining in fork period
 * @param forkEndTimestamp - Fork end timestamp
 * @returns Seconds remaining
 */
export function getForkTimeRemaining(forkEndTimestamp: bigint): bigint {
  const now = BigInt(Math.floor(Date.now() / 1000));
  const remaining = forkEndTimestamp - now;
  return remaining > BigInt(0) ? remaining : BigInt(0);
}

/**
 * Format fork time remaining
 * @param forkEndTimestamp - Fork end timestamp
 * @returns Human-readable time remaining
 */
export function formatForkTimeRemaining(forkEndTimestamp: bigint): string {
  const remaining = Number(getForkTimeRemaining(forkEndTimestamp));
  
  if (remaining === 0) return 'Fork period ended';
  
  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  
  if (days > 0) return `${days}d ${hours}h remaining`;
  return `${hours}h remaining`;
}

/**
 * Check if user has enough tokens to fork
 * @param userTokens - Number of tokens user has escrowed
 * @param forkThreshold - Required threshold from contract
 * @returns True if user can execute fork
 */
export function canExecuteFork(userTokens: bigint, forkThreshold: bigint): boolean {
  return userTokens >= forkThreshold;
}

/**
 * Calculate fork progress
 * @param escrowed Tokens - Current escrowed tokens
 * @param forkThreshold - Required threshold
 * @returns Progress percentage (0-100)
 */
export function calculateForkProgress(escrowedTokens: bigint, forkThreshold: bigint): number {
  if (forkThreshold === BigInt(0)) return 0;
  const progress = Number((escrowedTokens * BigInt(100)) / forkThreshold);
  return Math.min(progress, 100);
}

/**
 * Validate token IDs for escrow
 * @param tokenIds - Array of token IDs
 * @returns Validation result
 */
export function validateTokenIds(tokenIds: readonly bigint[]): { valid: boolean; error?: string } {
  if (!tokenIds || tokenIds.length === 0) {
    return { valid: false, error: 'Must provide at least one token ID' };
  }
  // Check for duplicates
  const uniqueIds = new Set(tokenIds.map(id => id.toString()));
  if (uniqueIds.size !== tokenIds.length) {
    return { valid: false, error: 'Duplicate token IDs not allowed' };
  }
  return { valid: true };
}

/**
 * Format fork ID
 * @param forkId - Fork ID from contract
 * @returns Formatted string
 */
export function formatForkId(forkId: number): string {
  return `Fork #${forkId}`;
}


// ============================================================================
// CONTRACT READ FUNCTIONS (for wagmi)
// ============================================================================

import { ForkEscrowABI } from '../../abis';

/**
 * Get fork end timestamp
 * @returns Wagmi read config
 */
export function getForkEndTimestamp() {
  return {
    address: NOUNS_CONTRACTS.ForkEscrow.address as Address,
    abi: ForkEscrowABI,
    functionName: 'forkEndTimestamp',
  } as const;
}

/**
 * Get number of tokens in escrow
 * @param account - Account address
 * @returns Wagmi read config
 */
export function getNumTokensInEscrow(account: Address) {
  return {
    address: NOUNS_CONTRACTS.ForkEscrow.address as Address,
    abi: ForkEscrowABI,
    functionName: 'numTokensInEscrow',
    args: [account],
  } as const;
}

/**
 * Get fork threshold
 * @returns Wagmi read config
 */
export function getForkThreshold() {
  return {
    address: NOUNS_CONTRACTS.ForkEscrow.address as Address,
    abi: ForkEscrowABI,
    functionName: 'forkThreshold',
  } as const;
}
