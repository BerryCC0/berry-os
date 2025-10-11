/**
 * Proposal Helper Functions
 * Business logic for proposal display and formatting
 * Leverages existing Goldsky utilities
 */

import * as proposalUtils from '@/app/lib/Nouns/Goldsky/utils/proposal';
import type { Proposal } from '@/app/lib/Nouns/Goldsky/utils/types';
import { ProposalStatus } from '@/app/lib/Nouns/Goldsky/utils/types';
import type { UIProposal, ProposalFilter, ProposalSort } from '../types/camp';

// ============================================================================
// Status & Color Mapping
// ============================================================================

/**
 * Get color for proposal status
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case ProposalStatus.ACTIVE:
      return '#00AA00'; // Green
    case ProposalStatus.SUCCEEDED:
      return '#00AA00'; // Green
    case ProposalStatus.QUEUED:
      return '#0000AA'; // Blue
    case ProposalStatus.EXECUTED:
      return '#888888'; // Gray
    case ProposalStatus.DEFEATED:
      return '#AA0000'; // Red
    case ProposalStatus.VETOED:
      return '#880000'; // Dark red
    case ProposalStatus.CANCELLED:
      return '#666666'; // Dark gray
    case ProposalStatus.EXPIRED:
      return '#AA5500'; // Orange
    case ProposalStatus.PENDING:
      return '#AAAA00'; // Yellow
    default:
      return '#000000'; // Black
  }
}

/**
 * Get vote bar color
 */
export function getVoteColor(support: 'for' | 'against' | 'abstain'): string {
  switch (support) {
    case 'for':
      return '#00AA00'; // Green
    case 'against':
      return '#AA0000'; // Red
    case 'abstain':
      return '#888888'; // Gray
  }
}

// ============================================================================
// Formatting
// ============================================================================

/**
 * Get proposal title from description
 * Extracts first line or heading
 */
export function getProposalTitle(proposal: Proposal): string {
  const title = proposalUtils.getTitle(proposal);
  
  // If title is too long, truncate
  if (title.length > 100) {
    return title.substring(0, 97) + '...';
  }
  
  return title || `Proposal ${proposal.id}`;
}

/**
 * Get short proposal description (first paragraph)
 */
export function getProposalSummary(proposal: Proposal): string {
  const description = proposalUtils.getDescription(proposal);
  
  // Remove markdown heading if present
  const withoutHeading = description.replace(/^#.*\n/, '');
  
  // Get first paragraph
  const firstParagraph = withoutHeading.split('\n\n')[0];
  
  // Truncate if too long
  if (firstParagraph.length > 200) {
    return firstParagraph.substring(0, 197) + '...';
  }
  
  return firstParagraph;
}

/**
 * Format proposer address
 */
export function formatProposer(proposal: Proposal): string {
  try {
    const proposer = proposalUtils.getProposer(proposal);
    if (!proposer || proposer === '' || proposer === '0x' || proposer === '0x0000000000000000000000000000000000000000') {
      return 'Unknown';
    }
    return formatAddress(proposer);
  } catch (error) {
    console.error('Error formatting proposer:', error);
    return 'Unknown';
  }
}

/**
 * Format Ethereum address (0x1234...5678)
 */
export function formatAddress(address: string): string {
  if (!address || address.length < 10) return 'Unknown';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

/**
 * Format vote count with commas
 */
export function formatVoteCount(votes: string | number): string {
  const num = typeof votes === 'string' ? parseInt(votes) : votes;
  return num.toLocaleString();
}

// ============================================================================
// Time Calculations
// ============================================================================

/**
 * Get time remaining for proposal
 * Returns human-readable string
 */
export function getTimeRemaining(proposal: Proposal): string {
  if (!proposalUtils.isActive(proposal)) {
    return '';
  }
  
  const endBlock = parseInt(proposal.endBlock);
  const currentBlock = Math.floor(Date.now() / 1000 / 12); // Rough estimate
  const blocksRemaining = endBlock - currentBlock;
  
  if (blocksRemaining <= 0) {
    return 'Ended';
  }
  
  // Convert blocks to hours (12s per block)
  const hoursRemaining = Math.floor((blocksRemaining * 12) / 3600);
  
  if (hoursRemaining < 1) {
    const minutesRemaining = Math.floor((blocksRemaining * 12) / 60);
    return `${minutesRemaining}m remaining`;
  }
  
  if (hoursRemaining < 24) {
    return `${hoursRemaining}h remaining`;
  }
  
  const daysRemaining = Math.floor(hoursRemaining / 24);
  return `${daysRemaining}d remaining`;
}

/**
 * Check if proposal is ending soon (< 24 hours)
 */
export function isEndingSoon(proposal: Proposal): boolean {
  if (!proposalUtils.isActive(proposal)) {
    return false;
  }
  
  const endBlock = parseInt(proposal.endBlock);
  const currentBlock = Math.floor(Date.now() / 1000 / 12);
  const blocksRemaining = endBlock - currentBlock;
  const hoursRemaining = (blocksRemaining * 12) / 3600;
  
  return hoursRemaining < 24 && hoursRemaining > 0;
}

// ============================================================================
// Filtering
// ============================================================================

/**
 * Filter proposals by status
 */
export function filterProposals(
  proposals: Proposal[],
  filter: ProposalFilter
): Proposal[] {
  switch (filter) {
    case 'all':
      return proposals;
    case 'active':
      return proposalUtils.getActiveProposals(proposals);
    case 'pending':
      return proposalUtils.filterByStatus(proposals, ProposalStatus.PENDING);
    case 'succeeded':
      return proposalUtils.filterByStatus(proposals, ProposalStatus.SUCCEEDED);
    case 'defeated':
      return proposalUtils.filterByStatus(proposals, ProposalStatus.DEFEATED);
    case 'queued':
      return proposalUtils.filterByStatus(proposals, ProposalStatus.QUEUED);
    case 'executed':
      return proposalUtils.getExecutedProposals(proposals);
    case 'cancelled':
      return proposalUtils.filterByStatus(proposals, ProposalStatus.CANCELLED);
    case 'vetoed':
      return proposalUtils.filterByStatus(proposals, ProposalStatus.VETOED);
    default:
      return proposals;
  }
}

// ============================================================================
// Sorting
// ============================================================================

/**
 * Sort proposals
 */
export function sortProposals(
  proposals: Proposal[],
  sort: ProposalSort
): Proposal[] {
  const sorted = [...proposals];
  
  switch (sort) {
    case 'newest':
      return proposalUtils.sortByNewest(sorted);
    case 'oldest':
      return proposalUtils.sortByNewest(sorted).reverse();
    case 'most_votes':
      return proposalUtils.sortByMostVotes(sorted);
    case 'ending_soon':
      // Sort active proposals by end block (ascending)
      return sorted.sort((a, b) => {
        const aActive = proposalUtils.isActive(a);
        const bActive = proposalUtils.isActive(b);
        
        if (aActive && !bActive) return -1;
        if (!aActive && bActive) return 1;
        if (!aActive && !bActive) return 0;
        
        return parseInt(a.endBlock) - parseInt(b.endBlock);
      });
    default:
      return sorted;
  }
}

// ============================================================================
// Vote Calculations (Re-export from Goldsky with enhancements)
// ============================================================================

/**
 * Get vote percentages with formatted strings
 */
export function getVotePercentages(proposal: Proposal): {
  for: number;
  against: number;
  abstain: number;
  forFormatted: string;
  againstFormatted: string;
  abstainFormatted: string;
} {
  const forPct = proposalUtils.getForPercentage(proposal);
  const againstPct = proposalUtils.getAgainstPercentage(proposal);
  const abstainPct = proposalUtils.getAbstainPercentage(proposal);
  
  return {
    for: forPct,
    against: againstPct,
    abstain: abstainPct,
    forFormatted: `${forPct.toFixed(1)}%`,
    againstFormatted: `${againstPct.toFixed(1)}%`,
    abstainFormatted: `${abstainPct.toFixed(1)}%`,
  };
}

/**
 * Check if proposal has quorum with formatted status
 */
export function getQuorumStatus(proposal: Proposal): {
  hasQuorum: boolean;
  currentVotes: number;
  requiredVotes: number;
  percentage: number;
  formatted: string;
} {
  const hasQuorum = proposalUtils.hasReachedQuorum(proposal);
  const totalVotes = Number(proposalUtils.getTotalVotes(proposal));
  const quorumVotes = Number(proposal.quorumVotes);
  const percentage = quorumVotes > 0 ? (totalVotes / quorumVotes) * 100 : 0;
  
  return {
    hasQuorum,
    currentVotes: totalVotes,
    requiredVotes: quorumVotes,
    percentage,
    formatted: `${totalVotes.toLocaleString()} / ${quorumVotes.toLocaleString()} votes (${percentage.toFixed(1)}%)`,
  };
}

// ============================================================================
// Re-export useful Goldsky utilities
// ============================================================================

export {
  // Status checks
  isActive,
  isPending,
  isSucceeded,
  isDefeated,
  isQueued,
  isExecuted,
  isCancelled,
  isVetoed,
  canBeVotedOn,
  
  // Vote counts
  getForVotes,
  getAgainstVotes,
  getAbstainVotes,
  getTotalVotes,
  
  // Other
  getProposer,
  getActionCount,
  formatStatus,
} from '@/app/lib/Nouns/Goldsky/utils/proposal';

