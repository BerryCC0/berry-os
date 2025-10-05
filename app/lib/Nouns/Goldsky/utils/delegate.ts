/**
 * Nouns DAO - Delegate Utilities
 * 
 * Pure business logic for delegate operations
 */

import type { Delegate, Account, Noun } from './types';

// ============================================================================
// Validation
// ============================================================================

/**
 * Checks if object is a valid Delegate
 */
export function isValidDelegate(delegate: any): delegate is Delegate {
  return Boolean(
    delegate &&
    typeof delegate.id === 'string' &&
    typeof delegate.delegatedVotesRaw === 'string' &&
    typeof delegate.tokenHoldersRepresentedAmount === 'number'
  );
}

// ============================================================================
// Voting Power
// ============================================================================

/**
 * Gets delegated voting power (raw)
 */
export function getDelegatedVotesRaw(delegate: Delegate): bigint {
  return BigInt(delegate.delegatedVotesRaw);
}

/**
 * Gets delegated voting power (human-readable)
 */
export function getDelegatedVotes(delegate: Delegate): string {
  return delegate.delegatedVotes;
}

/**
 * Formats delegated votes for display
 */
export function formatDelegatedVotes(delegate: Delegate): string {
  const votes = getDelegatedVotesRaw(delegate);
  return votes.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Gets number of token holders represented
 */
export function getTokenHoldersCount(delegate: Delegate): number {
  return delegate.tokenHoldersRepresentedAmount;
}

/**
 * Checks if delegate has voting power
 */
export function hasVotingPower(delegate: Delegate): boolean {
  return getDelegatedVotesRaw(delegate) > BigInt(0);
}

/**
 * Checks if delegate is active (has voting power)
 */
export function isActive(delegate: Delegate): boolean {
  return hasVotingPower(delegate);
}

// ============================================================================
// Representation
// ============================================================================

/**
 * Gets Nouns represented by delegate
 */
export function getNounsRepresented(delegate: Delegate): Noun[] {
  return delegate.nounsRepresented || [];
}

/**
 * Gets count of Nouns represented
 */
export function getNounsCount(delegate: Delegate): number {
  return getNounsRepresented(delegate).length;
}

/**
 * Gets token holders represented
 */
export function getTokenHoldersRepresented(delegate: Delegate): Account[] {
  return delegate.tokenHoldersRepresented || [];
}

/**
 * Checks if delegate represents a specific Noun
 */
export function representsNoun(delegate: Delegate, nounId: string): boolean {
  return getNounsRepresented(delegate).some(noun => noun.id === nounId);
}

/**
 * Checks if delegate represents a specific token holder
 */
export function representsTokenHolder(delegate: Delegate, address: string): boolean {
  const lowerAddress = address.toLowerCase();
  return getTokenHoldersRepresented(delegate).some(
    account => account.id.toLowerCase() === lowerAddress
  );
}

// ============================================================================
// Activity
// ============================================================================

/**
 * Gets delegate's vote count
 */
export function getVoteCount(delegate: Delegate): number {
  return delegate.votes?.length || 0;
}

/**
 * Gets delegate's proposal count
 */
export function getProposalCount(delegate: Delegate): number {
  return delegate.proposals?.length || 0;
}

/**
 * Checks if delegate has voted
 */
export function hasVoted(delegate: Delegate): boolean {
  return getVoteCount(delegate) > 0;
}

/**
 * Checks if delegate has proposed
 */
export function hasProposed(delegate: Delegate): boolean {
  return getProposalCount(delegate) > 0;
}

/**
 * Checks if delegate is active (has voted or proposed)
 */
export function isActiveDelegate(delegate: Delegate): boolean {
  return hasVoted(delegate) || hasProposed(delegate);
}

// ============================================================================
// Comparisons
// ============================================================================

/**
 * Compares delegates by voting power
 */
export function compareByVotingPower(delegate1: Delegate, delegate2: Delegate): number {
  const power1 = getDelegatedVotesRaw(delegate1);
  const power2 = getDelegatedVotesRaw(delegate2);
  
  if (power1 < power2) return -1;
  if (power1 > power2) return 1;
  return 0;
}

// ============================================================================
// Filtering
// ============================================================================

/**
 * Filters delegates with minimum voting power
 */
export function filterByMinimumVotingPower(
  delegates: Delegate[],
  minimumVotes: bigint
): Delegate[] {
  return delegates.filter(delegate => {
    return getDelegatedVotesRaw(delegate) >= minimumVotes;
  });
}

/**
 * Filters active delegates
 */
export function filterActive(delegates: Delegate[]): Delegate[] {
  return delegates.filter(delegate => isActive(delegate));
}

/**
 * Filters inactive delegates
 */
export function filterInactive(delegates: Delegate[]): Delegate[] {
  return delegates.filter(delegate => !isActive(delegate));
}

/**
 * Filters delegates who have voted
 */
export function filterWithVotes(delegates: Delegate[]): Delegate[] {
  return delegates.filter(delegate => hasVoted(delegate));
}

/**
 * Filters delegates who have proposed
 */
export function filterWithProposals(delegates: Delegate[]): Delegate[] {
  return delegates.filter(delegate => hasProposed(delegate));
}

// ============================================================================
// Sorting
// ============================================================================

/**
 * Sorts delegates by voting power (highest first)
 */
export function sortByMostPower(delegates: Delegate[]): Delegate[] {
  return [...delegates].sort((a, b) => compareByVotingPower(b, a));
}

/**
 * Sorts delegates by voting power (lowest first)
 */
export function sortByLeastPower(delegates: Delegate[]): Delegate[] {
  return [...delegates].sort((a, b) => compareByVotingPower(a, b));
}

/**
 * Sorts delegates by token holders represented (most first)
 */
export function sortByMostRepresented(delegates: Delegate[]): Delegate[] {
  return [...delegates].sort((a, b) => {
    return b.tokenHoldersRepresentedAmount - a.tokenHoldersRepresentedAmount;
  });
}

/**
 * Sorts delegates by vote count (most first)
 */
export function sortByMostVotes(delegates: Delegate[]): Delegate[] {
  return [...delegates].sort((a, b) => {
    return getVoteCount(b) - getVoteCount(a);
  });
}

/**
 * Sorts delegates by proposal count (most first)
 */
export function sortByMostProposals(delegates: Delegate[]): Delegate[] {
  return [...delegates].sort((a, b) => {
    return getProposalCount(b) - getProposalCount(a);
  });
}

// ============================================================================
// Statistics
// ============================================================================

/**
 * Gets total voting power across delegates
 */
export function getTotalVotingPower(delegates: Delegate[]): bigint {
  return delegates.reduce((total, delegate) => {
    return total + getDelegatedVotesRaw(delegate);
  }, BigInt(0));
}

/**
 * Gets average voting power per delegate
 */
export function getAverageVotingPower(delegates: Delegate[]): bigint {
  if (delegates.length === 0) return BigInt(0);
  return getTotalVotingPower(delegates) / BigInt(delegates.length);
}

/**
 * Gets total token holders represented
 */
export function getTotalTokenHolders(delegates: Delegate[]): number {
  return delegates.reduce((total, delegate) => {
    return total + delegate.tokenHoldersRepresentedAmount;
  }, 0);
}

/**
 * Gets voting power concentration (top N delegates)
 */
export function getVotingPowerConcentration(
  delegates: Delegate[],
  topN: number = 10
): number {
  const sorted = sortByMostPower(delegates);
  const top = sorted.slice(0, topN);
  
  const topPower = getTotalVotingPower(top);
  const totalPower = getTotalVotingPower(delegates);
  
  if (totalPower === BigInt(0)) return 0;
  
  return Number((topPower * BigInt(10000)) / totalPower) / 100;
}

// ============================================================================
// Search
// ============================================================================

/**
 * Finds delegate by address
 */
export function findDelegate(delegates: Delegate[], address: string): Delegate | undefined {
  const lowerAddress = address.toLowerCase();
  return delegates.find(delegate => delegate.id.toLowerCase() === lowerAddress);
}

/**
 * Checks if address is a delegate
 */
export function isDelegate(delegates: Delegate[], address: string): boolean {
  return findDelegate(delegates, address) !== undefined;
}

// ============================================================================
// Display & Formatting
// ============================================================================

/**
 * Gets delegate display name (address with ellipsis)
 */
export function getDelegateDisplayName(delegate: Delegate): string {
  const address = delegate.id;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Gets delegate summary
 */
export function getDelegateSummary(delegate: Delegate): string {
  const name = getDelegateDisplayName(delegate);
  const votes = formatDelegatedVotes(delegate);
  const holders = getTokenHoldersCount(delegate);
  
  return `${name} - ${votes} votes representing ${holders} token holders`;
}

/**
 * Gets Nouns.wtf delegate URL
 */
export function getDelegateUrl(delegate: Delegate): string {
  return `https://nouns.wtf/vote#delegate-${delegate.id}`;
}

