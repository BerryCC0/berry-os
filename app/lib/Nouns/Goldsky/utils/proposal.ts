/**
 * Nouns DAO - Proposal Utilities
 * 
 * Pure business logic for governance proposal operations
 */

import type { Proposal, Vote } from './types';
import { ProposalStatus, VoteSupport } from './types';
// ============================================================================
// Validation
// ============================================================================

/**
 * Checks if object is a valid Proposal
 */
export function isValidProposal(proposal: any): proposal is Proposal {
  return Boolean(
    proposal &&
    typeof proposal.id === 'string' &&
    proposal.proposer &&
    typeof proposal.status === 'string' &&
    typeof proposal.forVotes === 'string' &&
    typeof proposal.againstVotes === 'string'
  );
}

// ============================================================================
// Proposal Status
// ============================================================================

/**
 * Checks if proposal is pending
 */
export function isPending(proposal: Proposal): boolean {
  return proposal.status === ProposalStatus.PENDING;
}

/**
 * Checks if proposal is active (can be voted on)
 */
export function isActive(proposal: Proposal): boolean {
  return proposal.status === ProposalStatus.ACTIVE;
}

/**
 * Checks if proposal was cancelled
 */
export function isCancelled(proposal: Proposal): boolean {
  return proposal.status === ProposalStatus.CANCELLED;
}

/**
 * Checks if proposal was defeated
 */
export function isDefeated(proposal: Proposal): boolean {
  return proposal.status === ProposalStatus.DEFEATED;
}

/**
 * Checks if proposal succeeded
 */
export function isSucceeded(proposal: Proposal): boolean {
  return proposal.status === ProposalStatus.SUCCEEDED;
}

/**
 * Checks if proposal is queued for execution
 */
export function isQueued(proposal: Proposal): boolean {
  return proposal.status === ProposalStatus.QUEUED;
}

/**
 * Checks if proposal expired
 */
export function isExpired(proposal: Proposal): boolean {
  return proposal.status === ProposalStatus.EXPIRED;
}

/**
 * Checks if proposal was executed
 */
export function isExecuted(proposal: Proposal): boolean {
  return proposal.status === ProposalStatus.EXECUTED;
}

/**
 * Checks if proposal was vetoed
 */
export function isVetoed(proposal: Proposal): boolean {
  return proposal.status === ProposalStatus.VETOED;
}

/**
 * Checks if proposal can be voted on
 */
export function canBeVotedOn(proposal: Proposal): boolean {
  return isActive(proposal);
}

/**
 * Checks if proposal is finalized (cannot change)
 */
export function isFinalized(proposal: Proposal): boolean {
  return (
    isExecuted(proposal) ||
    isDefeated(proposal) ||
    isCancelled(proposal) ||
    isVetoed(proposal) ||
    isExpired(proposal)
  );
}

// ============================================================================
// Vote Counting
// ============================================================================

/**
 * Gets total FOR votes
 */
export function getForVotes(proposal: Proposal): bigint {
  return BigInt(proposal.forVotes);
}

/**
 * Gets total AGAINST votes
 */
export function getAgainstVotes(proposal: Proposal): bigint {
  return BigInt(proposal.againstVotes);
}

/**
 * Gets total ABSTAIN votes
 */
export function getAbstainVotes(proposal: Proposal): bigint {
  return BigInt(proposal.abstainVotes);
}

/**
 * Gets total votes cast
 */
export function getTotalVotes(proposal: Proposal): bigint {
  return getForVotes(proposal) + getAgainstVotes(proposal) + getAbstainVotes(proposal);
}

/**
 * Gets quorum threshold
 */
export function getQuorumThreshold(proposal: Proposal): bigint {
  return BigInt(proposal.quorumVotes);
}

/**
 * Gets proposal threshold
 */
export function getProposalThreshold(proposal: Proposal): bigint {
  return BigInt(proposal.proposalThreshold);
}

/**
 * Checks if proposal has reached quorum
 */
export function hasReachedQuorum(proposal: Proposal): boolean {
  // Quorum is calculated from FOR + ABSTAIN votes
  const quorumVotes = getForVotes(proposal) + getAbstainVotes(proposal);
  return quorumVotes >= getQuorumThreshold(proposal);
}

/**
 * Checks if FOR votes exceed AGAINST votes
 */
export function hasMoreForThanAgainst(proposal: Proposal): boolean {
  return getForVotes(proposal) > getAgainstVotes(proposal);
}

/**
 * Gets vote percentage for a support type
 */
export function getVotePercentage(proposal: Proposal, support: VoteSupport): number {
  const total = getTotalVotes(proposal);
  if (total === BigInt(0)) return 0;
  
  let votes: bigint;
  switch (support) {
    case VoteSupport.FOR:
      votes = getForVotes(proposal);
      break;
    case VoteSupport.AGAINST:
      votes = getAgainstVotes(proposal);
      break;
    case VoteSupport.ABSTAIN:
      votes = getAbstainVotes(proposal);
      break;
    default:
      return 0;
  }
  
  return Number((votes * BigInt(10000)) / total) / 100;
}

/**
 * Gets FOR vote percentage
 */
export function getForPercentage(proposal: Proposal): number {
  return getVotePercentage(proposal, VoteSupport.FOR);
}

/**
 * Gets AGAINST vote percentage
 */
export function getAgainstPercentage(proposal: Proposal): number {
  return getVotePercentage(proposal, VoteSupport.AGAINST);
}

/**
 * Gets ABSTAIN vote percentage
 */
export function getAbstainPercentage(proposal: Proposal): number {
  return getVotePercentage(proposal, VoteSupport.ABSTAIN);
}

// ============================================================================
// Timestamps & Blocks
// ============================================================================

/**
 * Gets proposal creation date
 */
export function getCreatedDate(proposal: Proposal): Date {
  return new Date(parseInt(proposal.createdTimestamp, 10) * 1000);
}

/**
 * Gets proposal start block
 */
export function getStartBlock(proposal: Proposal): number {
  return parseInt(proposal.startBlock, 10);
}

/**
 * Gets proposal end block
 */
export function getEndBlock(proposal: Proposal): number {
  return parseInt(proposal.endBlock, 10);
}

/**
 * Gets execution ETA if queued
 */
export function getExecutionETA(proposal: Proposal): Date | null {
  if (!proposal.executionETA) return null;
  return new Date(parseInt(proposal.executionETA, 10) * 1000);
}

/**
 * Formats execution ETA
 */
export function formatExecutionETA(proposal: Proposal): string | null {
  const eta = getExecutionETA(proposal);
  if (!eta) return null;
  return eta.toLocaleString();
}

/**
 * Gets proposal age in days
 */
export function getProposalAge(proposal: Proposal): number {
  const created = getCreatedDate(proposal);
  const now = new Date();
  const diff = now.getTime() - created.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// ============================================================================
// Proposal Content
// ============================================================================

/**
 * Gets proposal title (or generates from description)
 */
export function getTitle(proposal: Proposal): string {
  if (proposal.title) return proposal.title;
  
  // Extract first line of description as title
  if (proposal.description) {
    const firstLine = proposal.description.split('\n')[0];
    if (firstLine.length > 100) {
      return firstLine.substring(0, 97) + '...';
    }
    return firstLine;
  }
  
  return `Proposal ${proposal.id}`;
}

/**
 * Gets proposal description
 */
export function getDescription(proposal: Proposal): string {
  return proposal.description || 'No description provided';
}

/**
 * Gets proposal proposer address
 */
export function getProposer(proposal: Proposal): string {
  return proposal.proposer.id;
}

/**
 * Checks if address is the proposer
 */
export function isProposer(proposal: Proposal, address: string): boolean {
  return proposal.proposer.id.toLowerCase() === address.toLowerCase();
}

/**
 * Gets number of actions (transactions) in proposal
 */
export function getActionCount(proposal: Proposal): number {
  return proposal.targets.length;
}

/**
 * Gets proposal actions
 */
export function getActions(proposal: Proposal): Array<{
  target: string;
  value: string;
  signature: string;
  calldata: string;
}> {
  return proposal.targets.map((target, i) => ({
    target,
    value: proposal.values[i],
    signature: proposal.signatures[i],
    calldata: proposal.calldatas[i],
  }));
}

// ============================================================================
// Filtering
// ============================================================================

/**
 * Filters proposals by status
 */
export function filterByStatus(
  proposals: Proposal[],
  status: ProposalStatus
): Proposal[] {
  return proposals.filter(proposal => proposal.status === status);
}

/**
 * Gets active proposals
 */
export function getActiveProposals(proposals: Proposal[]): Proposal[] {
  return filterByStatus(proposals, ProposalStatus.ACTIVE);
}

/**
 * Gets executed proposals
 */
export function getExecutedProposals(proposals: Proposal[]): Proposal[] {
  return filterByStatus(proposals, ProposalStatus.EXECUTED);
}

/**
 * Gets defeated proposals
 */
export function getDefeatedProposals(proposals: Proposal[]): Proposal[] {
  return filterByStatus(proposals, ProposalStatus.DEFEATED);
}

/**
 * Filters proposals by proposer
 */
export function filterByProposer(proposals: Proposal[], proposer: string): Proposal[] {
  const lowerProposer = proposer.toLowerCase();
  return proposals.filter(
    proposal => proposal.proposer.id.toLowerCase() === lowerProposer
  );
}

/**
 * Filters proposals that reached quorum
 */
export function filterByQuorumReached(proposals: Proposal[]): Proposal[] {
  return proposals.filter(proposal => hasReachedQuorum(proposal));
}

/**
 * Filters proposals that did not reach quorum
 */
export function filterByQuorumNotReached(proposals: Proposal[]): Proposal[] {
  return proposals.filter(proposal => !hasReachedQuorum(proposal));
}

// ============================================================================
// Sorting
// ============================================================================

/**
 * Sorts proposals by creation date (newest first)
 */
export function sortByNewest(proposals: Proposal[]): Proposal[] {
  return [...proposals].sort((a, b) => {
    const timeA = parseInt(a.createdTimestamp, 10);
    const timeB = parseInt(b.createdTimestamp, 10);
    return timeB - timeA;
  });
}

/**
 * Sorts proposals by creation date (oldest first)
 */
export function sortByOldest(proposals: Proposal[]): Proposal[] {
  return [...proposals].sort((a, b) => {
    const timeA = parseInt(a.createdTimestamp, 10);
    const timeB = parseInt(b.createdTimestamp, 10);
    return timeA - timeB;
  });
}

/**
 * Sorts proposals by total votes (most first)
 */
export function sortByMostVotes(proposals: Proposal[]): Proposal[] {
  return [...proposals].sort((a, b) => {
    const votesA = getTotalVotes(a);
    const votesB = getTotalVotes(b);
    if (votesA < votesB) return 1;
    if (votesA > votesB) return -1;
    return 0;
  });
}

/**
 * Sorts proposals by FOR votes (most first)
 */
export function sortByMostForVotes(proposals: Proposal[]): Proposal[] {
  return [...proposals].sort((a, b) => {
    const votesA = getForVotes(a);
    const votesB = getForVotes(b);
    if (votesA < votesB) return 1;
    if (votesA > votesB) return -1;
    return 0;
  });
}

// ============================================================================
// Search
// ============================================================================

/**
 * Finds proposal by ID
 */
export function findProposalById(
  proposals: Proposal[],
  id: string | number
): Proposal | undefined {
  const searchId = typeof id === 'number' ? id.toString() : id;
  return proposals.find(proposal => proposal.id === searchId);
}

/**
 * Searches proposals by title/description
 */
export function searchProposals(proposals: Proposal[], query: string): Proposal[] {
  const lowerQuery = query.toLowerCase();
  
  return proposals.filter(proposal => {
    const title = getTitle(proposal).toLowerCase();
    const description = getDescription(proposal).toLowerCase();
    
    return title.includes(lowerQuery) || description.includes(lowerQuery);
  });
}

// ============================================================================
// Display & Formatting
// ============================================================================

/**
 * Formats proposal status for display
 */
export function formatStatus(proposal: Proposal): string {
  return proposal.status;
}

/**
 * Gets status color for UI
 */
export function getStatusColor(proposal: Proposal): string {
  switch (proposal.status) {
    case ProposalStatus.ACTIVE:
      return 'blue';
    case ProposalStatus.SUCCEEDED:
    case ProposalStatus.EXECUTED:
      return 'green';
    case ProposalStatus.DEFEATED:
    case ProposalStatus.CANCELLED:
    case ProposalStatus.VETOED:
      return 'red';
    case ProposalStatus.QUEUED:
      return 'yellow';
    case ProposalStatus.EXPIRED:
      return 'gray';
    default:
      return 'gray';
  }
}

/**
 * Gets proposal summary
 */
export function getProposalSummary(proposal: Proposal): string {
  const title = getTitle(proposal);
  const status = formatStatus(proposal);
  const forVotes = getForVotes(proposal).toString();
  const againstVotes = getAgainstVotes(proposal).toString();
  
  return `${title} - ${status} - For: ${forVotes}, Against: ${againstVotes}`;
}

/**
 * Gets Nouns.wtf proposal URL
 */
export function getProposalUrl(proposal: Proposal): string {
  return `https://nouns.wtf/vote/${proposal.id}`;
}

/**
 * Formats votes with commas
 */
export function formatVotes(votes: bigint): string {
  return votes.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

