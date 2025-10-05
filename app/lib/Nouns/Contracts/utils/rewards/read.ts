/**
 * Client Rewards - Read Functions
 * Pure functions and utilities for reading client rewards data
 */

import { Address, formatUnits } from 'viem';
import { NOUNS_CONTRACTS } from '../../addresses';
import { ClientRewardsABI } from '../../abis';

/**
 * Get Client Rewards contract address
 * @returns Client Rewards proxy address
 */
export function getClientRewardsAddress(): Address {
  return NOUNS_CONTRACTS.ClientRewardsProxy.proxy as Address;
}

/**
 * Format reward amount (ETH)
 * @param amount - Amount in wei
 * @returns Formatted string
 */
export function formatRewardAmount(amount: bigint): string {
  return Number(formatUnits(amount, 18)).toFixed(4) + ' ETH';
}

/**
 * Calculate total claimable rewards
 * @param proposalRewards - Rewards from proposals
 * @param auctionRewards - Rewards from auctions
 * @returns Total claimable amount
 */
export function calculateTotalClaimable(
  proposalRewards: bigint,
  auctionRewards: bigint
): bigint {
  return proposalRewards + auctionRewards;
}

/**
 * Check if client is registered
 * @param clientId - Client ID to check
 * @param registeredClients - List of registered client IDs
 * @returns True if client is registered
 */
export function isClientRegistered(clientId: number, registeredClients: readonly bigint[]): boolean {
  return registeredClients.some(id => Number(id) === clientId);
}

/**
 * Calculate reward percentage
 * @param rewardAmount - Reward amount received
 * @param totalAmount - Total amount (proposal value, auction price, etc.)
 * @returns Percentage as number (e.g., 2.5 for 2.5%)
 */
export function calculateRewardPercentage(rewardAmount: bigint, totalAmount: bigint): number {
  if (totalAmount === BigInt(0)) return 0;
  return Number((rewardAmount * BigInt(10000)) / totalAmount) / 100;
}

/**
 * Format client ID for display
 * @param clientId - Client ID number
 * @returns Formatted string
 */
export function formatClientId(clientId: number): string {
  return `Client #${clientId}`;
}

/**
 * Validate client description
 * @param description - Client description string
 * @returns Validation result
 */
export function validateClientDescription(description: string): { valid: boolean; error?: string } {
  if (!description || description.trim().length === 0) {
    return { valid: false, error: 'Description cannot be empty' };
  }
  if (description.length > 256) {
    return { valid: false, error: 'Description too long (max 256 characters)' };
  }
  return { valid: true };
}

/**
 * Parse reward stats
 * @param stats - Raw stats from contract
 * @returns Formatted stats object
 */
export function parseRewardStats(stats: {
  totalRewards: bigint;
  claimedRewards: bigint;
  pendingRewards: bigint;
}): {
  total: string;
  claimed: string;
  pending: string;
  claimedPercentage: number;
} {
  const claimedPercentage = stats.totalRewards > BigInt(0)
    ? Number((stats.claimedRewards * BigInt(100)) / stats.totalRewards)
    : 0;
    
  return {
    total: formatRewardAmount(stats.totalRewards),
    claimed: formatRewardAmount(stats.claimedRewards),
    pending: formatRewardAmount(stats.pendingRewards),
    claimedPercentage,
  };
}

// ============================================================================
// CONTRACT READ FUNCTIONS (for wagmi)
// ============================================================================

/**
 * Get client balance (rewards earned)
 * @param clientId - Client ID
 * @returns Wagmi read config
 */
export function getClientBalance(clientId: bigint) {
  return {
    address: NOUNS_CONTRACTS.ClientRewardsProxy.proxy as Address,
    abi: ClientRewardsABI,
    functionName: 'clientBalance',
    args: [clientId],
  } as const;
}

/**
 * Get client metadata (name, description)
 * @param clientId - Client ID
 * @returns Wagmi read config
 */
export function getClientMetadata(clientId: bigint) {
  return {
    address: NOUNS_CONTRACTS.ClientRewardsProxy.proxy as Address,
    abi: ClientRewardsABI,
    functionName: 'getClient',
    args: [clientId],
  } as const;
}

/**
 * Check if client is registered
 * @param clientId - Client ID
 * @returns Wagmi read config
 */
export function checkClientRegistered(clientId: bigint) {
  return {
    address: NOUNS_CONTRACTS.ClientRewardsProxy.proxy as Address,
    abi: ClientRewardsABI,
    functionName: 'isClientRegistered',
    args: [clientId],
  } as const;
}

/**
 * Get client rewards from a proposal
 * @param clientId - Client ID
 * @param proposalId - Proposal ID
 * @returns Wagmi read config
 */
export function getProposalClientRewards(clientId: bigint, proposalId: bigint) {
  return {
    address: NOUNS_CONTRACTS.ClientRewardsProxy.proxy as Address,
    abi: ClientRewardsABI,
    functionName: 'proposalRewards',
    args: [clientId, proposalId],
  } as const;
}

/**
 * Get client rewards from an auction
 * @param clientId - Client ID
 * @param auctionId - Auction ID (Noun ID)
 * @returns Wagmi read config
 */
export function getAuctionClientRewards(clientId: bigint, auctionId: bigint) {
  return {
    address: NOUNS_CONTRACTS.ClientRewardsProxy.proxy as Address,
    abi: ClientRewardsABI,
    functionName: 'auctionRewards',
    args: [clientId, auctionId],
  } as const;
}

/**
 * Get total client count
 * @returns Wagmi read config
 */
export function getClientCount() {
  return {
    address: NOUNS_CONTRACTS.ClientRewardsProxy.proxy as Address,
    abi: ClientRewardsABI,
    functionName: 'clientCount',
  } as const;
}

