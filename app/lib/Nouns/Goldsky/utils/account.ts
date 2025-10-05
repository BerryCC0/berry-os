/**
 * Nouns DAO - Account Utilities
 * 
 * Pure business logic for account operations
 */

import type { Account, Delegate, Noun } from './types';

// ============================================================================
// Validation
// ============================================================================

/**
 * Checks if object is a valid Account
 */
export function isValidAccount(account: any): account is Account {
  return Boolean(
    account &&
    typeof account.id === 'string' &&
    typeof account.tokenBalance === 'string' &&
    typeof account.tokenBalanceRaw === 'string'
  );
}

/**
 * Checks if address is valid Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// ============================================================================
// Balance
// ============================================================================

/**
 * Gets token balance (raw)
 */
export function getTokenBalanceRaw(account: Account): bigint {
  return BigInt(account.tokenBalanceRaw);
}

/**
 * Gets token balance (human-readable)
 */
export function getTokenBalance(account: Account): number {
  return parseInt(account.tokenBalance, 10);
}

/**
 * Checks if account owns any Nouns
 */
export function ownsNouns(account: Account): boolean {
  return getTokenBalance(account) > 0;
}

/**
 * Gets number of Nouns owned
 */
export function getNounsOwnedCount(account: Account): number {
  return account.nouns?.length || 0;
}

// ============================================================================
// Delegation
// ============================================================================

/**
 * Checks if account has a delegate
 */
export function hasDelegate(account: Account): boolean {
  return account.delegate !== null && account.delegate !== undefined;
}

/**
 * Gets delegate
 */
export function getDelegate(account: Account): Delegate | null {
  return account.delegate || null;
}

/**
 * Gets delegate address
 */
export function getDelegateAddress(account: Account): string | null {
  const delegate = getDelegate(account);
  return delegate ? delegate.id : null;
}

/**
 * Checks if account delegates to address
 */
export function delegatesTo(account: Account, address: string): boolean {
  const delegateAddr = getDelegateAddress(account);
  if (!delegateAddr) return false;
  return delegateAddr.toLowerCase() === address.toLowerCase();
}

/**
 * Checks if account is self-delegated
 */
export function isSelfDelegated(account: Account): boolean {
  return delegatesTo(account, account.id);
}

// ============================================================================
// Activity
// ============================================================================

/**
 * Gets vote count
 */
export function getVoteCount(account: Account): number {
  return account.votes?.length || 0;
}

/**
 * Gets proposal count
 */
export function getProposalCount(account: Account): number {
  return account.proposals?.length || 0;
}

/**
 * Checks if account has voted
 */
export function hasVoted(account: Account): boolean {
  return getVoteCount(account) > 0;
}

/**
 * Checks if account has proposed
 */
export function hasProposed(account: Account): boolean {
  return getProposalCount(account) > 0;
}

/**
 * Checks if account is active (owns Nouns or has voted/proposed)
 */
export function isActive(account: Account): boolean {
  return ownsNouns(account) || hasVoted(account) || hasProposed(account);
}

// ============================================================================
// Nouns Owned
// ============================================================================

/**
 * Gets Nouns owned by account
 */
export function getNounsOwned(account: Account): Noun[] {
  return account.nouns || [];
}

/**
 * Gets Noun IDs owned
 */
export function getNounIds(account: Account): string[] {
  return getNounsOwned(account).map(noun => noun.id);
}

/**
 * Checks if account owns specific Noun
 */
export function ownsNoun(account: Account, nounId: string): boolean {
  return getNounIds(account).includes(nounId);
}

// ============================================================================
// Filtering
// ============================================================================

/**
 * Filters accounts that own Nouns
 */
export function filterOwners(accounts: Account[]): Account[] {
  return accounts.filter(account => ownsNouns(account));
}

/**
 * Filters accounts with minimum balance
 */
export function filterByMinimumBalance(
  accounts: Account[],
  minimumBalance: number
): Account[] {
  return accounts.filter(account => getTokenBalance(account) >= minimumBalance);
}

/**
 * Filters accounts that have voted
 */
export function filterWithVotes(accounts: Account[]): Account[] {
  return accounts.filter(account => hasVoted(account));
}

/**
 * Filters accounts that have proposed
 */
export function filterWithProposals(accounts: Account[]): Account[] {
  return accounts.filter(account => hasProposed(account));
}

/**
 * Filters self-delegated accounts
 */
export function filterSelfDelegated(accounts: Account[]): Account[] {
  return accounts.filter(account => isSelfDelegated(account));
}

/**
 * Filters accounts delegated to others
 */
export function filterDelegatedToOthers(accounts: Account[]): Account[] {
  return accounts.filter(account => hasDelegate(account) && !isSelfDelegated(account));
}

// ============================================================================
// Sorting
// ============================================================================

/**
 * Sorts accounts by token balance (highest first)
 */
export function sortByMostNouns(accounts: Account[]): Account[] {
  return [...accounts].sort((a, b) => {
    return getTokenBalance(b) - getTokenBalance(a);
  });
}

/**
 * Sorts accounts by token balance (lowest first)
 */
export function sortByLeastNouns(accounts: Account[]): Account[] {
  return [...accounts].sort((a, b) => {
    return getTokenBalance(a) - getTokenBalance(b);
  });
}

/**
 * Sorts accounts by vote count (most first)
 */
export function sortByMostVotes(accounts: Account[]): Account[] {
  return [...accounts].sort((a, b) => {
    return getVoteCount(b) - getVoteCount(a);
  });
}

/**
 * Sorts accounts by proposal count (most first)
 */
export function sortByMostProposals(accounts: Account[]): Account[] {
  return [...accounts].sort((a, b) => {
    return getProposalCount(b) - getProposalCount(a);
  });
}

// ============================================================================
// Statistics
// ============================================================================

/**
 * Gets total Nouns owned across accounts
 */
export function getTotalNounsOwned(accounts: Account[]): number {
  return accounts.reduce((total, account) => {
    return total + getTokenBalance(account);
  }, 0);
}

/**
 * Gets average Nouns per account
 */
export function getAverageNounsPerAccount(accounts: Account[]): number {
  if (accounts.length === 0) return 0;
  return getTotalNounsOwned(accounts) / accounts.length;
}

/**
 * Gets percentage of accounts that are self-delegated
 */
export function getSelfDelegationRate(accounts: Account[]): number {
  if (accounts.length === 0) return 0;
  const selfDelegated = filterSelfDelegated(accounts).length;
  return (selfDelegated / accounts.length) * 100;
}

/**
 * Gets participation rate (accounts that have voted)
 */
export function getVotingParticipationRate(accounts: Account[]): number {
  if (accounts.length === 0) return 0;
  const voted = filterWithVotes(accounts).length;
  return (voted / accounts.length) * 100;
}

// ============================================================================
// Search
// ============================================================================

/**
 * Finds account by address
 */
export function findAccount(accounts: Account[], address: string): Account | undefined {
  const lowerAddress = address.toLowerCase();
  return accounts.find(account => account.id.toLowerCase() === lowerAddress);
}

/**
 * Checks if address exists in accounts
 */
export function accountExists(accounts: Account[], address: string): boolean {
  return findAccount(accounts, address) !== undefined;
}

// ============================================================================
// Display & Formatting
// ============================================================================

/**
 * Formats address with ellipsis
 */
export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Gets account display name
 */
export function getAccountDisplayName(account: Account): string {
  return formatAddress(account.id);
}

/**
 * Gets account summary
 */
export function getAccountSummary(account: Account): string {
  const name = getAccountDisplayName(account);
  const balance = getTokenBalance(account);
  const votes = getVoteCount(account);
  const proposals = getProposalCount(account);
  
  return `${name} - ${balance} Nouns, ${votes} votes, ${proposals} proposals`;
}

/**
 * Gets Etherscan URL
 */
export function getEtherscanUrl(account: Account): string {
  return `https://etherscan.io/address/${account.id}`;
}

/**
 * Gets Nouns.wtf account URL
 */
export function getNounsWtfUrl(account: Account): string {
  return `https://nouns.wtf/vote#delegate-${account.id}`;
}

