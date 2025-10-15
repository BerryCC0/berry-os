/**
 * Voter/Delegate Helper Functions
 * Business logic for voter and delegate display
 * Leverages existing Goldsky delegate utilities
 */

import * as delegateUtils from '@/app/lib/Nouns/Goldsky/utils/delegate';
import * as voteUtils from '@/app/lib/Nouns/Goldsky/utils/vote';
import type { Delegate, Vote, VoteSupport } from '@/app/lib/Nouns/Goldsky/utils/types';
import type { VoterFilter, VoterSort } from '../types/camp';

// ============================================================================
// Formatting
// ============================================================================

/**
 * Format voting power with commas
 */
export function formatVotingPower(votes: number | string): string {
  const num = typeof votes === 'string' ? parseInt(votes) : votes;
  return num.toLocaleString();
}

/**
 * Format address (0x1234...5678)
 */
export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

/**
 * Get display name for delegate (ENS or truncated address)
 */
export function getDelegateDisplayName(delegate: Delegate, ensName?: string): string {
  if (ensName) return ensName;
  return delegateUtils.getDelegateDisplayName(delegate);
}

// ============================================================================
// Vote Formatting
// ============================================================================

/**
 * Format voter from vote (ENS or truncated address)
 */
export function formatVoter(vote: Vote): { address: string; ens?: string; truncated: string } {
  const address = vote.voter.id;
  // Account type may have ENS in future - for now just truncate
  const truncated = formatAddress(address);
  
  return {
    address,
    truncated,
  };
}

/**
 * Get support color for vote type
 */
export function getSupportColor(support: VoteSupport | number): string {
  const supportNum = typeof support === 'number' ? support : Number(support);
  
  switch (supportNum) {
    case 0: // Against
      return '#CC0000';
    case 1: // For
      return '#00AA00';
    case 2: // Abstain
      return '#888888';
    default:
      return '#000000';
  }
}

/**
 * Get support icon for vote type
 */
export function getSupportIcon(support: VoteSupport | number): string {
  const supportNum = typeof support === 'number' ? support : Number(support);
  
  switch (supportNum) {
    case 0: // Against
      return '✗';
    case 1: // For
      return '✓';
    case 2: // Abstain
      return '−';
    default:
      return '?';
  }
}

/**
 * Get support label for vote type
 */
export function getSupportLabel(support: VoteSupport | number): string {
  const supportNum = typeof support === 'number' ? support : Number(support);
  
  switch (supportNum) {
    case 0:
      return 'Against';
    case 1:
      return 'For';
    case 2:
      return 'Abstain';
    default:
      return 'Unknown';
  }
}

/**
 * Format vote reason (truncate if too long)
 */
export function formatVoteReason(reason?: string, maxLength: number = 280): { full: string; truncated: string; isTruncated: boolean } {
  if (!reason) {
    return {
      full: '',
      truncated: '',
      isTruncated: false,
    };
  }

  if (reason.length <= maxLength) {
    return {
      full: reason,
      truncated: reason,
      isTruncated: false,
    };
  }

  return {
    full: reason,
    truncated: `${reason.substring(0, maxLength)}...`,
    isTruncated: true,
  };
}

/**
 * Format timestamp to relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(timestamp: string): string {
  const now = Date.now();
  const then = parseInt(timestamp) * 1000; // Convert to milliseconds
  const diffMs = now - then;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
}

// ============================================================================
// Calculations
// ============================================================================

/**
 * Calculate voting power percentage of total
 */
export function getVotingPowerPercentage(
  delegate: Delegate,
  totalVotingPower: number
): number {
  const delegateVotes = Number(delegateUtils.getDelegatedVotes(delegate));
  if (totalVotingPower === 0) return 0;
  return (delegateVotes / totalVotingPower) * 100;
}

/**
 * Calculate participation rate (votes cast / total proposals)
 */
export function getParticipationRate(
  voteCount: number,
  totalProposals: number
): number {
  if (totalProposals === 0) return 0;
  return (voteCount / totalProposals) * 100;
}

/**
 * Format participation rate as string
 */
export function formatParticipationRate(
  voteCount: number,
  totalProposals: number
): string {
  const rate = getParticipationRate(voteCount, totalProposals);
  return `${rate.toFixed(1)}%`;
}

// ============================================================================
// Filtering
// ============================================================================

/**
 * Filter delegates by criteria
 */
export function filterDelegates(
  delegates: Delegate[],
  filter: VoterFilter
): Delegate[] {
  switch (filter) {
    case 'all':
      return delegates;
    case 'active_delegates':
      return delegateUtils.filterActive(delegates);
    case 'token_holders':
      // Token holders are delegates with voting power from owned tokens
      return delegates.filter(d => {
        const votes = Number(delegateUtils.getDelegatedVotes(d));
        const holders = delegateUtils.getTokenHoldersCount(d);
        // If they have votes and represent themselves or others
        return votes > 0;
      });
    case 'with_votes':
      return delegateUtils.filterWithVotes(delegates);
    default:
      return delegates;
  }
}

// ============================================================================
// Sorting
// ============================================================================

/**
 * Sort delegates
 */
export function sortDelegates(
  delegates: Delegate[],
  sort: VoterSort
): Delegate[] {
  const sorted = [...delegates];
  
  switch (sort) {
    case 'most_power':
      return delegateUtils.sortByMostPower(sorted);
    case 'most_represented':
      return delegateUtils.sortByMostRepresented(sorted);
    case 'most_votes':
      return delegateUtils.sortByMostVotes(sorted);
    case 'alphabetical':
      return sorted.sort((a, b) => {
        return a.id.toLowerCase().localeCompare(b.id.toLowerCase());
      });
    default:
      return sorted;
  }
}

// ============================================================================
// Vote Organization
// ============================================================================

/**
 * Group votes by support type
 */
export function groupVotesBySupport(votes: Vote[]): {
  for: Vote[];
  against: Vote[];
  abstain: Vote[];
} {
  const grouped = {
    for: [] as Vote[],
    against: [] as Vote[],
    abstain: [] as Vote[],
  };

  votes.forEach(vote => {
    const supportNum = Number(vote.support);
    switch (supportNum) {
      case 1: // For
        grouped.for.push(vote);
        break;
      case 0: // Against
        grouped.against.push(vote);
        break;
      case 2: // Abstain
        grouped.abstain.push(vote);
        break;
    }
  });

  return grouped;
}

/**
 * Get top voters by voting power
 */
export function getTopVoters(votes: Vote[], count: number): Vote[] {
  return [...votes]
    .sort((a, b) => {
      const votesA = BigInt(a.votes);
      const votesB = BigInt(b.votes);
      return votesB > votesA ? 1 : votesB < votesA ? -1 : 0;
    })
    .slice(0, count);
}

/**
 * Filter votes by support type
 */
export function filterVotesBySupport(votes: Vote[], support: 'all' | 'for' | 'against' | 'abstain'): Vote[] {
  if (support === 'all') {
    return votes;
  }

  const supportNum = support === 'for' ? 1 : support === 'against' ? 0 : 2;
  return votes.filter(vote => Number(vote.support) === supportNum);
}

// ============================================================================
// Ranking
// ============================================================================

/**
 * Get delegate rank by voting power
 */
export function getDelegateRank(
  delegate: Delegate,
  allDelegates: Delegate[]
): number {
  const sorted = delegateUtils.sortByMostPower([...allDelegates]);
  return sorted.findIndex(d => d.id === delegate.id) + 1;
}

/**
 * Format rank display (e.g., "#1", "#23")
 */
export function formatRank(rank: number): string {
  return `#${rank}`;
}

// ============================================================================
// Statistics
// ============================================================================

/**
 * Calculate total voting power across delegates
 */
export function getTotalVotingPower(delegates: Delegate[]): number {
  const total = delegateUtils.getTotalVotingPower(delegates);
  return typeof total === 'bigint' ? Number(total) : total;
}

/**
 * Calculate average voting power
 */
export function getAverageVotingPower(delegates: Delegate[]): number {
  const average = delegateUtils.getAverageVotingPower(delegates);
  return typeof average === 'bigint' ? Number(average) : average;
}

/**
 * Calculate voting power concentration (top N delegates)
 */
export function getVotingPowerConcentration(
  delegates: Delegate[],
  topN: number = 10
): {
  percentage: number;
  formatted: string;
} {
  const concentration = delegateUtils.getVotingPowerConcentration(delegates, topN);
  return {
    percentage: concentration,
    formatted: `${concentration.toFixed(1)}%`,
  };
}

/**
 * Get delegation statistics
 */
export function getDelegationStats(delegates: Delegate[]): {
  totalDelegates: number;
  activeDelegates: number;
  totalVotingPower: number;
  averageVotingPower: number;
  medianVotingPower: number;
  topDelegateConcentration: number;
} {
  const totalDelegates = delegates.length;
  const activeDelegates = delegateUtils.filterActive(delegates).length;
  const totalVotingPower = getTotalVotingPower(delegates);
  const averageVotingPower = getAverageVotingPower(delegates);
  
  // Calculate median
  const sorted = delegateUtils.sortByMostPower([...delegates]);
  const mid = Math.floor(sorted.length / 2);
  const medianVotingPower = sorted.length % 2 === 0
    ? (Number(delegateUtils.getDelegatedVotes(sorted[mid - 1])) + Number(delegateUtils.getDelegatedVotes(sorted[mid]))) / 2
    : Number(delegateUtils.getDelegatedVotes(sorted[mid]));
  
  const topDelegateConcentration = getVotingPowerConcentration(delegates, 10).percentage;
  
  return {
    totalDelegates,
    activeDelegates,
    totalVotingPower,
    averageVotingPower,
    medianVotingPower,
    topDelegateConcentration,
  };
}

// ============================================================================
// Voter Detail Helpers
// ============================================================================

/**
 * Get voter statistics for display
 * Uses active token holders count (filters out 0 balance holders from dirty Goldsky data)
 */
export function getVoterStats(delegate: Delegate, account?: any): {
  votingPower: number;
  nounsOwned: number;
  tokenHoldersRepresented: number;
  proposalsCreated: number;
  votescast: number;
  participationRate: number;
} {
  const votingPower = Number(delegateUtils.getDelegatedVotes(delegate));
  
  // Nouns Owned = actual tokens in their wallet (from account.tokenBalance)
  // This is NOT the same as nounsRepresented (which includes delegations)
  const nounsOwned = account?.tokenBalance ? Number(account.tokenBalance) : 0;
  
  const tokenHoldersRepresented = delegateUtils.getActiveTokenHoldersCount(delegate);
  const proposalsCreated = delegateUtils.getProposalCount(delegate);
  const votesCast = delegateUtils.getVoteCount(delegate);
  
  // Estimate participation rate (we'd need total proposals count for accuracy)
  // For now, if they have votes, assume some participation
  const participationRate = votesCast > 0 ? Math.min((votesCast / 100) * 100, 100) : 0;
  
  return {
    votingPower,
    nounsOwned,
    tokenHoldersRepresented,
    proposalsCreated,
    votescast: votesCast,
    participationRate,
  };
}

/**
 * Format delegation status for display
 * Shows both who is delegating TO this delegate AND who the account delegates to
 */
export function formatDelegationStatus(account: any, delegate: Delegate): {
  isSelfDelegated: boolean;
  hasExternalDelegators: boolean;
  externalDelegators: Array<{ address: string; nounCount: number }>;
  totalExternalDelegators: number;
  isDelegatingTo: string | null; // Who the account is delegating to
  isDelegatingToSelf: boolean; // Whether account delegates to themselves
  description: string;
} {
  const delegateAddress = delegate.id.toLowerCase();
  const accountAddress = account?.id?.toLowerCase();
  
  // Check who the account is delegating to
  const isDelegatingTo = account?.delegate?.id || null;
  const isDelegatingToSelf = isDelegatingTo && isDelegatingTo.toLowerCase() === accountAddress;
  
  // Self-delegated means they're delegating to themselves (not delegating to someone else)
  const isSelfDelegated = isDelegatingToSelf && account?.tokenBalance > 0;
  
  // Get all token holders delegating to this delegate (excluding self)
  const tokenHolders = delegate.tokenHoldersRepresented || [];
  const externalDelegators = tokenHolders
    .filter(holder => {
      const holderAddress = holder.id.toLowerCase();
      const balance = Number(holder.tokenBalance || 0);
      // Exclude self-delegation and zero balances
      return holderAddress !== delegateAddress && balance > 0;
    })
    .map(holder => ({
      address: holder.id,
      nounCount: Number(holder.tokenBalance || 0),
    }))
    .sort((a, b) => b.nounCount - a.nounCount); // Sort by noun count descending
  
  const hasExternalDelegators = externalDelegators.length > 0;
  
  // Build description based on delegation direction (mutually exclusive)
  let description = '';
  
  if (isDelegatingTo && !isDelegatingToSelf) {
    // Account is delegating to someone else
    description = `Delegating to ${formatAddress(isDelegatingTo)}`;
  } else if (isSelfDelegated) {
    // Self-delegated (may also have external delegators)
    description = 'Self-delegated';
  } else if (hasExternalDelegators) {
    // Only external delegators (account has no tokens or not delegating)
    const totalNouns = externalDelegators.reduce((sum, d) => sum + d.nounCount, 0);
    description = `${externalDelegators.length} delegator${externalDelegators.length > 1 ? 's' : ''} (${totalNouns} Noun${totalNouns > 1 ? 's' : ''})`;
  } else {
    // No delegations at all
    description = 'No active delegations';
  }
  
  return {
    isSelfDelegated,
    hasExternalDelegators,
    externalDelegators,
    totalExternalDelegators: externalDelegators.length,
    isDelegatingTo,
    isDelegatingToSelf,
    description,
  };
}

/**
 * Group votes by proposal for display
 */
export function groupVotesByProposal(votes: Vote[]): Map<string, Vote[]> {
  const grouped = new Map<string, Vote[]>();
  
  votes.forEach(vote => {
    const proposalId = (vote as any).proposal?.id || 'unknown';
    if (!grouped.has(proposalId)) {
      grouped.set(proposalId, []);
    }
    grouped.get(proposalId)!.push(vote);
  });
  
  return grouped;
}

/**
 * Calculate vote distribution for a voter
 */
export function getVoteDistribution(votes: Vote[]): {
  forCount: number;
  againstCount: number;
  abstainCount: number;
  forPercentage: number;
  againstPercentage: number;
  abstainPercentage: number;
} {
  const grouped = groupVotesBySupport(votes);
  const total = votes.length;
  
  return {
    forCount: grouped.for.length,
    againstCount: grouped.against.length,
    abstainCount: grouped.abstain.length,
    forPercentage: total > 0 ? (grouped.for.length / total) * 100 : 0,
    againstPercentage: total > 0 ? (grouped.against.length / total) * 100 : 0,
    abstainPercentage: total > 0 ? (grouped.abstain.length / total) * 100 : 0,
  };
}

/**
 * Get recent voting activity (last N votes)
 */
export function getRecentVotes(votes: Vote[], count: number = 5): Vote[] {
  return [...votes]
    .sort((a, b) => {
      const blockA = a.blockNumber ? Number(a.blockNumber) : 0;
      const blockB = b.blockNumber ? Number(b.blockNumber) : 0;
      return blockB - blockA;
    })
    .slice(0, count);
}

// ============================================================================
// Re-export useful Goldsky utilities
// ============================================================================

export {
  // Voting power
  getDelegatedVotes,
  getDelegatedVotesRaw,
  formatDelegatedVotes,
  hasVotingPower,
  
  // Representation
  getTokenHoldersCount,
  getNounsRepresented,
  getNounsCount,
  
  // Activity
  getVoteCount,
  getProposalCount,
  hasVoted,
  hasProposed,
  
  // Other
  isValidDelegate,
} from '@/app/lib/Nouns/Goldsky/utils/delegate';

