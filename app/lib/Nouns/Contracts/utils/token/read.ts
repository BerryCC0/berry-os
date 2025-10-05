/**
 * Nouns Token - Read Functions
 * Pure functions and utilities for reading Nouns Token data
 */

import { Address } from 'viem';
import type { NounSeed, VotingPower } from '../types';
import { formatVotes } from '../formatting';

/**
 * Parse seed tuple from contract to NounSeed object
 * @param seedTuple - Seed tuple from contract
 * @returns Parsed NounSeed object
 */
export function parseSeed(seedTuple: readonly [bigint, bigint, bigint, bigint, bigint]): NounSeed {
  return {
    background: Number(seedTuple[0]),
    body: Number(seedTuple[1]),
    accessory: Number(seedTuple[2]),
    head: Number(seedTuple[3]),
    glasses: Number(seedTuple[4]),
  };
}

/**
 * Check if address has any Nouns
 * @param balance - Balance from balanceOf call
 * @returns True if user has at least one Noun
 */
export function hasNouns(balance: bigint): boolean {
  return balance > BigInt(0);
}

/**
 * Check if address is delegated to self
 * @param account - User address
 * @param delegate - Current delegate address
 * @returns True if delegated to self
 */
export function isDelegatedToSelf(account: Address, delegate: Address): boolean {
  return account.toLowerCase() === delegate.toLowerCase();
}

/**
 * Format voting power info
 * @param currentVotes - Current vote count
 * @param account - User address
 * @param delegate - Delegate address
 * @returns Formatted voting power information
 */
export function formatVotingPower(
  currentVotes: bigint,
  account: Address,
  delegate: Address
): VotingPower {
  return {
    currentVotes,
    delegate,
    isDelegatedToSelf: isDelegatedToSelf(account, delegate),
    formattedVotes: formatVotes(currentVotes),
  };
}

/**
 * Check if user has voting power
 * @param votes - Current vote count
 * @returns True if user has at least 1 vote
 */
export function hasVotingPower(votes: bigint): boolean {
  return votes > BigInt(0);
}

/**
 * Calculate voting power from Noun count
 * Note: Each Noun = 1 vote (assuming no delegation received from others)
 * @param nounCount - Number of Nouns owned
 * @returns Voting power (same as Noun count)
 */
export function calculateBaseVotingPower(nounCount: bigint): bigint {
  return nounCount;
}

