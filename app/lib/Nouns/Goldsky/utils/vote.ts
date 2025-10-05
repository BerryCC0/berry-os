/**
 * Nouns DAO - Vote Utilities
 * 
 * Pure business logic for vote operations
 */

import type { Vote, Proposal } from './types';
import { VoteSupport } from './types';

// ============================================================================
// Validation
// ============================================================================

/**
 * Checks if object is a valid Vote
 */
export function isValidVote(vote: any): vote is Vote {
  return Boolean(
    vote &&
    typeof vote.id === 'string' &&
    vote.voter &&
    typeof vote.support === 'number' &&
    typeof vote.votes === 'string'
  );
}

// ============================================================================
// Vote Support
// ============================================================================

/**
 * Checks if vote is FOR
 */
export function isFor(vote: Vote): boolean {
  return vote.support === VoteSupport.FOR;
}

/**
 * Checks if vote is AGAINST
 */
export function isAgainst(vote: Vote): boolean {
  return vote.support === VoteSupport.AGAINST;
}

/**
 * Checks if vote is ABSTAIN
 */
export function isAbstain(vote: Vote): boolean {
  return vote.support === VoteSupport.ABSTAIN;
}

/**
 * Gets vote support as string
 */
export function getSupportString(vote: Vote): string {
  switch (vote.support) {
    case VoteSupport.FOR:
      return 'For';
    case VoteSupport.AGAINST:
      return 'Against';
    case VoteSupport.ABSTAIN:
      return 'Abstain';
    default:
      return 'Unknown';
  }
}

// ============================================================================
// Vote Weight
// ============================================================================

/**
 * Gets voting power used
 */
export function getVotingPower(vote: Vote): bigint {
  return BigInt(vote.votes);
}

/**
 * Formats voting power for display
 */
export function formatVotingPower(vote: Vote): string {
  const power = getVotingPower(vote);
  return power.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Gets number of Nouns used to vote
 */
export function getNounCount(vote: Vote): number {
  return vote.nouns?.length || 0;
}

// ============================================================================
// Voter Info
// ============================================================================

/**
 * Gets voter address
 */
export function getVoter(vote: Vote): string {
  return vote.voter.id;
}

/**
 * Checks if address is the voter
 */
export function isVoter(vote: Vote, address: string): boolean {
  return vote.voter.id.toLowerCase() === address.toLowerCase();
}

/**
 * Checks if vote has a reason
 */
export function hasReason(vote: Vote): boolean {
  return Boolean(vote.reason && vote.reason.trim().length > 0);
}

/**
 * Gets vote reason
 */
export function getReason(vote: Vote): string | null {
  return vote.reason || null;
}

// ============================================================================
// Timestamps
// ============================================================================

/**
 * Gets vote timestamp as Date
 */
export function getVoteDate(vote: Vote): Date {
  return new Date(parseInt(vote.blockTimestamp, 10) * 1000);
}

/**
 * Formats vote date
 */
export function formatVoteDate(vote: Vote): string {
  return getVoteDate(vote).toLocaleString();
}

/**
 * Gets vote age in days
 */
export function getVoteAge(vote: Vote): number {
  const voteDate = getVoteDate(vote);
  const now = new Date();
  const diff = now.getTime() - voteDate.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Gets vote block number
 */
export function getVoteBlock(vote: Vote): number {
  return parseInt(vote.blockNumber, 10);
}

// ============================================================================
// Filtering
// ============================================================================

/**
 * Filters votes by support type
 */
export function filterBySupport(votes: Vote[], support: VoteSupport): Vote[] {
  return votes.filter(vote => vote.support === support);
}

/**
 * Gets FOR votes
 */
export function getForVotes(votes: Vote[]): Vote[] {
  return filterBySupport(votes, VoteSupport.FOR);
}

/**
 * Gets AGAINST votes
 */
export function getAgainstVotes(votes: Vote[]): Vote[] {
  return filterBySupport(votes, VoteSupport.AGAINST);
}

/**
 * Gets ABSTAIN votes
 */
export function getAbstainVotes(votes: Vote[]): Vote[] {
  return filterBySupport(votes, VoteSupport.ABSTAIN);
}

/**
 * Filters votes by voter
 */
export function filterByVoter(votes: Vote[], voter: string): Vote[] {
  const lowerVoter = voter.toLowerCase();
  return votes.filter(vote => vote.voter.id.toLowerCase() === lowerVoter);
}

/**
 * Filters votes by proposal
 */
export function filterByProposal(votes: Vote[], proposalId: string): Vote[] {
  return votes.filter(vote => vote.proposal.id === proposalId);
}

/**
 * Filters votes with reasons
 */
export function filterWithReasons(votes: Vote[]): Vote[] {
  return votes.filter(vote => hasReason(vote));
}

/**
 * Filters votes without reasons
 */
export function filterWithoutReasons(votes: Vote[]): Vote[] {
  return votes.filter(vote => !hasReason(vote));
}

// ============================================================================
// Sorting
// ============================================================================

/**
 * Sorts votes by voting power (highest first)
 */
export function sortByMostPower(votes: Vote[]): Vote[] {
  return [...votes].sort((a, b) => {
    const powerA = getVotingPower(a);
    const powerB = getVotingPower(b);
    if (powerA < powerB) return 1;
    if (powerA > powerB) return -1;
    return 0;
  });
}

/**
 * Sorts votes by voting power (lowest first)
 */
export function sortByLeastPower(votes: Vote[]): Vote[] {
  return [...votes].sort((a, b) => {
    const powerA = getVotingPower(a);
    const powerB = getVotingPower(b);
    if (powerA < powerB) return -1;
    if (powerA > powerB) return 1;
    return 0;
  });
}

/**
 * Sorts votes by time (newest first)
 */
export function sortByNewest(votes: Vote[]): Vote[] {
  return [...votes].sort((a, b) => {
    const timeA = parseInt(a.blockTimestamp, 10);
    const timeB = parseInt(b.blockTimestamp, 10);
    return timeB - timeA;
  });
}

/**
 * Sorts votes by time (oldest first)
 */
export function sortByOldest(votes: Vote[]): Vote[] {
  return [...votes].sort((a, b) => {
    const timeA = parseInt(a.blockTimestamp, 10);
    const timeB = parseInt(b.blockTimestamp, 10);
    return timeA - timeB;
  });
}

// ============================================================================
// Statistics
// ============================================================================

/**
 * Gets total voting power used across votes
 */
export function getTotalVotingPower(votes: Vote[]): bigint {
  return votes.reduce((total, vote) => {
    return total + getVotingPower(vote);
  }, BigInt(0));
}

/**
 * Gets average voting power per vote
 */
export function getAverageVotingPower(votes: Vote[]): bigint {
  if (votes.length === 0) return BigInt(0);
  return getTotalVotingPower(votes) / BigInt(votes.length);
}

/**
 * Gets vote distribution
 */
export function getVoteDistribution(votes: Vote[]): {
  for: number;
  against: number;
  abstain: number;
} {
  const forVotes = getForVotes(votes).length;
  const againstVotes = getAgainstVotes(votes).length;
  const abstainVotes = getAbstainVotes(votes).length;
  
  return {
    for: forVotes,
    against: againstVotes,
    abstain: abstainVotes,
  };
}

/**
 * Gets vote participation rate (votes with reasons)
 */
export function getReasonRate(votes: Vote[]): number {
  if (votes.length === 0) return 0;
  const withReasons = filterWithReasons(votes).length;
  return (withReasons / votes.length) * 100;
}

// ============================================================================
// Search
// ============================================================================

/**
 * Finds vote by voter and proposal
 */
export function findVote(
  votes: Vote[],
  voter: string,
  proposalId: string
): Vote | undefined {
  const lowerVoter = voter.toLowerCase();
  return votes.find(
    vote =>
      vote.voter.id.toLowerCase() === lowerVoter &&
      vote.proposal.id === proposalId
  );
}

/**
 * Checks if voter has voted on proposal
 */
export function hasVoted(votes: Vote[], voter: string, proposalId: string): boolean {
  return findVote(votes, voter, proposalId) !== undefined;
}

/**
 * Gets all votes by a voter
 */
export function getVotesByVoter(votes: Vote[], voter: string): Vote[] {
  return filterByVoter(votes, voter);
}

/**
 * Searches votes by reason
 */
export function searchByReason(votes: Vote[], query: string): Vote[] {
  const lowerQuery = query.toLowerCase();
  
  return votes.filter(vote => {
    const reason = getReason(vote);
    if (!reason) return false;
    return reason.toLowerCase().includes(lowerQuery);
  });
}

// ============================================================================
// Display & Formatting
// ============================================================================

/**
 * Gets vote summary
 */
export function getVoteSummary(vote: Vote): string {
  const support = getSupportString(vote);
  const power = formatVotingPower(vote);
  const voter = vote.voter.id.slice(0, 6) + '...' + vote.voter.id.slice(-4);
  
  return `${voter} voted ${support} with ${power} votes`;
}

/**
 * Gets support color for UI
 */
export function getSupportColor(vote: Vote): string {
  switch (vote.support) {
    case VoteSupport.FOR:
      return 'green';
    case VoteSupport.AGAINST:
      return 'red';
    case VoteSupport.ABSTAIN:
      return 'gray';
    default:
      return 'gray';
  }
}

/**
 * Gets support emoji
 */
export function getSupportEmoji(vote: Vote): string {
  switch (vote.support) {
    case VoteSupport.FOR:
      return '✅';
    case VoteSupport.AGAINST:
      return '❌';
    case VoteSupport.ABSTAIN:
      return '⚪';
    default:
      return '❓';
  }
}

