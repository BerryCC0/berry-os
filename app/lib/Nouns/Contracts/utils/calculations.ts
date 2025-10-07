/**
 * Calculation Utilities
 * Pure business logic functions for Nouns DAO calculations
 */

import { Address } from 'viem';
import { AuctionState, ProposalData } from './types';

// ============================================================================
// AUCTION CALCULATIONS
// ============================================================================

/**
 * Calculate minimum bid amount for an auction
 * @param currentBid - Current highest bid in wei
 * @param minBidIncrementPercentage - Minimum bid increment percentage (e.g., 5 = 5%)
 * @param reservePrice - Reserve price in wei
 * @returns Minimum valid bid amount in wei
 */
export function calculateMinBid(
  currentBid: bigint,
  minBidIncrementPercentage: bigint,
  reservePrice: bigint
): bigint {
  if (currentBid === BigInt(0)) {
    return reservePrice;
  }
  
  const increment = (currentBid * minBidIncrementPercentage) / BigInt(100);
  return currentBid + increment;
}

/**
 * Check if auction is currently active
 * @param auction - Auction state
 * @returns True if auction is active
 */
export function isAuctionActive(auction: AuctionState): boolean {
  const now = BigInt(Math.floor(Date.now() / 1000));
  return !auction.settled && now < auction.endTime;
}

/**
 * Check if auction has ended
 * @param auction - Auction state
 * @returns True if auction has ended
 */
export function hasAuctionEnded(auction: AuctionState): boolean {
  const now = BigInt(Math.floor(Date.now() / 1000));
  return now >= auction.endTime;
}

/**
 * Get time remaining in auction
 * @param auction - Auction state
 * @returns Seconds remaining (0 if ended)
 */
export function getTimeRemaining(auction: AuctionState): number {
  const now = BigInt(Math.floor(Date.now() / 1000));
  if (now >= auction.endTime) return 0;
  return Number(auction.endTime - now);
}

/**
 * Check if bid amount is valid
 * @param bidAmount - Proposed bid in wei
 * @param minBidAmount - Minimum required bid in wei
 * @returns True if bid is valid
 */
export function isValidBid(bidAmount: bigint, minBidAmount: bigint): boolean {
  return bidAmount >= minBidAmount;
}

// ============================================================================
// GOVERNANCE CALCULATIONS
// ============================================================================

/**
 * Calculate vote percentages for a proposal
 * @param proposal - Proposal data
 * @returns Vote percentages (for, against, abstain)
 */
export function calculateVotePercentages(proposal: ProposalData): {
  for: number;
  against: number;
  abstain: number;
} {
  const total = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
  
  if (total === BigInt(0)) {
    return { for: 0, against: 0, abstain: 0 };
  }
  
  return {
    for: Number((proposal.forVotes * BigInt(10000)) / total) / 100,
    against: Number((proposal.againstVotes * BigInt(10000)) / total) / 100,
    abstain: Number((proposal.abstainVotes * BigInt(10000)) / total) / 100,
  };
}

/**
 * Calculate quorum progress for a proposal
 * @param proposal - Proposal data
 * @returns Quorum progress as percentage (0-100+)
 */
export function calculateQuorumProgress(proposal: ProposalData): number {
  if (proposal.quorumVotes === BigInt(0)) return 0;
  
  const totalVotes = proposal.forVotes + proposal.abstainVotes;
  return Number((totalVotes * BigInt(10000)) / proposal.quorumVotes) / 100;
}

/**
 * Check if proposal has reached quorum
 * @param proposal - Proposal data
 * @returns True if quorum reached
 */
export function hasReachedQuorum(proposal: ProposalData): boolean {
  const totalVotes = proposal.forVotes + proposal.abstainVotes;
  return totalVotes >= proposal.quorumVotes;
}

/**
 * Check if proposal has passed
 * @param proposal - Proposal data
 * @returns True if proposal passed (more FOR than AGAINST and reached quorum)
 */
export function hasProposalPassed(proposal: ProposalData): boolean {
  return (
    proposal.forVotes > proposal.againstVotes &&
    hasReachedQuorum(proposal)
  );
}

/**
 * Check if address can propose
 * @param votes - Current votes of address
 * @param proposalThreshold - Minimum votes required to propose
 * @returns True if can propose
 */
export function canPropose(votes: bigint, proposalThreshold: bigint): boolean {
  return votes >= proposalThreshold;
}

/**
 * Get blocks until voting starts
 * @param currentBlock - Current block number
 * @param startBlock - Proposal start block
 * @returns Blocks remaining (0 if started)
 */
export function getBlocksUntilVoting(currentBlock: bigint, startBlock: bigint): number {
  if (currentBlock >= startBlock) return 0;
  return Number(startBlock - currentBlock);
}

/**
 * Get blocks remaining in voting period
 * @param currentBlock - Current block number
 * @param endBlock - Proposal end block
 * @returns Blocks remaining (0 if ended)
 */
export function getBlocksRemaining(currentBlock: bigint, endBlock: bigint): number {
  if (currentBlock >= endBlock) return 0;
  return Number(endBlock - currentBlock);
}

/**
 * Estimate time from blocks (approximate)
 * @param blocks - Number of blocks
 * @param secondsPerBlock - Seconds per block (default: 12 for Ethereum)
 * @returns Estimated seconds
 */
export function estimateTimeFromBlocks(blocks: number, secondsPerBlock: number = 12): number {
  return blocks * secondsPerBlock;
}

// ============================================================================
// TOKEN CALCULATIONS
// ============================================================================

/**
 * Check if address has any Nouns
 * @param balance - Noun balance
 * @returns True if has Nouns
 */
export function hasNouns(balance: bigint): boolean {
  return balance > BigInt(0);
}

/**
 * Check if address has voting power
 * @param votes - Current votes
 * @returns True if has voting power
 */
export function hasVotingPower(votes: bigint): boolean {
  return votes > BigInt(0);
}

/**
 * Check if delegated to self
 * @param account - Account address
 * @param delegate - Delegate address
 * @returns True if delegated to self
 */
export function isDelegatedToSelf(account: Address, delegate: Address): boolean {
  return account.toLowerCase() === delegate.toLowerCase();
}

/**
 * Calculate base voting power (1 Noun = 1 vote)
 * @param balance - Noun balance
 * @returns Voting power
 */
export function calculateBaseVotingPower(balance: bigint): bigint {
  return balance;
}

// ============================================================================
// BASIS POINTS (BPS) CALCULATIONS
// ============================================================================

export const BPS_DENOMINATOR = 10000;

/**
 * Convert basis points to percentage
 * @param bps - Basis points (1 BPS = 0.01%)
 * @returns Percentage (0-100)
 */
export function bpsToPercentage(bps: number): number {
  return (bps / BPS_DENOMINATOR) * 100;
}

/**
 * Convert percentage to basis points
 * @param percentage - Percentage (0-100)
 * @returns Basis points
 */
export function percentageToBps(percentage: number): number {
  return Math.round(percentage * 100);
}

// ============================================================================
// TIME CALCULATIONS
// ============================================================================

export const SECONDS_PER_BLOCK = 12; // Approximate Ethereum block time

/**
 * Convert blocks to seconds
 * @param blocks - Number of blocks
 * @returns Seconds
 */
export function blocksToSeconds(blocks: number): number {
  return blocks * SECONDS_PER_BLOCK;
}

/**
 * Convert seconds to blocks
 * @param seconds - Number of seconds
 * @returns Blocks (rounded up)
 */
export function secondsToBlocks(seconds: number): number {
  return Math.ceil(seconds / SECONDS_PER_BLOCK);
}
