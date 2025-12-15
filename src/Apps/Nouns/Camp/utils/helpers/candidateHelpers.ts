/**
 * Candidate Helper Functions
 * Business logic for proposal candidates from Data Proxy
 */

import type { Candidate, CandidateFilter, CandidateSort } from '../types/camp';

// ============================================================================
// Formatting
// ============================================================================

/**
 * Format address (0x1234...5678)
 */
export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

/**
 * Get candidate title from description
 */
export function getCandidateTitle(candidate: Candidate): string {
  const lines = candidate.description.split('\n');
  
  // Check first few lines for a title
  for (const line of lines.slice(0, 3)) {
    const trimmed = line.trim();
    
    // Remove markdown heading symbols
    const withoutHash = trimmed.replace(/^#+\s*/, '');
    
    if (withoutHash.length > 0) {
      // Truncate if too long
      if (withoutHash.length > 100) {
        return withoutHash.substring(0, 97) + '...';
      }
      return withoutHash;
    }
  }
  
  return `Candidate: ${candidate.slug}`;
}

/**
 * Get candidate summary (first paragraph)
 */
export function getCandidateSummary(candidate: Candidate): string {
  const description = candidate.description;
  
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
 * Format timestamp as relative time
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now() / 1000;
  const diff = now - timestamp;
  
  if (diff < 60) {
    return 'just now';
  }
  
  if (diff < 3600) {
    const minutes = Math.floor(diff / 60);
    return `${minutes}m ago`;
  }
  
  if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours}h ago`;
  }
  
  const days = Math.floor(diff / 86400);
  if (days < 30) {
    return `${days}d ago`;
  }
  
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

/**
 * Format absolute timestamp
 */
export function formatAbsoluteTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ============================================================================
// Status
// ============================================================================

/**
 * Get candidate status
 */
export function getCandidateStatus(candidate: Candidate): 'active' | 'canceled' | 'updated' {
  if (candidate.canceled) {
    return 'canceled';
  }
  
  if (candidate.lastUpdatedTimestamp > candidate.createdTimestamp) {
    return 'updated';
  }
  
  return 'active';
}

/**
 * Get status color
 */
export function getStatusColor(status: 'active' | 'canceled' | 'updated'): string {
  switch (status) {
    case 'active':
      return '#00AA00'; // Green
    case 'canceled':
      return '#AA0000'; // Red
    case 'updated':
      return '#0000AA'; // Blue
  }
}

/**
 * Format status for display
 */
export function formatStatus(status: 'active' | 'canceled' | 'updated'): string {
  switch (status) {
    case 'active':
      return 'Active';
    case 'canceled':
      return 'Canceled';
    case 'updated':
      return 'Updated';
  }
}

// ============================================================================
// Filtering
// ============================================================================

/**
 * Filter candidates
 */
export function filterCandidates(
  candidates: Candidate[],
  filter: CandidateFilter
): Candidate[] {
  switch (filter) {
    case 'all':
      return candidates;
    case 'active':
      return candidates.filter(c => !c.canceled);
    case 'canceled':
      return candidates.filter(c => c.canceled);
    default:
      return candidates;
  }
}

// ============================================================================
// Sorting
// ============================================================================

/**
 * Sort candidates
 */
export function sortCandidates(
  candidates: Candidate[],
  sort: CandidateSort
): Candidate[] {
  const sorted = [...candidates];
  
  switch (sort) {
    case 'newest':
      return sorted.sort((a, b) => b.createdTimestamp - a.createdTimestamp);
    case 'oldest':
      return sorted.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
    case 'most_feedback':
      return sorted.sort((a, b) => (b.feedbackCount || 0) - (a.feedbackCount || 0));
    default:
      return sorted;
  }
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate candidate slug format
 */
export function isValidSlug(slug: string): boolean {
  // Slug should be URL-safe: lowercase alphanumeric and hyphens
  const slugRegex = /^[a-z0-9-]+$/;
  return slugRegex.test(slug) && slug.length > 0 && slug.length <= 100;
}

/**
 * Validate candidate description
 * Note: No max length limit - on-chain proposals can be arbitrarily long
 */
export function isValidDescription(description: string): boolean {
  return description.trim().length > 0;
}


// ============================================================================
// Actions Count
// ============================================================================

/**
 * Get number of actions in candidate
 */
export function getActionsCount(candidate: Candidate): number {
  return candidate.targets.length;
}

/**
 * Format actions count
 */
export function formatActionsCount(count: number): string {
  if (count === 0) return 'No actions';
  if (count === 1) return '1 action';
  return `${count} actions`;
}

// ============================================================================
// Feedback
// ============================================================================

/**
 * Calculate feedback sentiment
 */
export function getFeedbackSentiment(candidate: Candidate): {
  positive: number;
  negative: number;
  neutral: number;
  total: number;
} {
  // Placeholder - would need actual feedback data
  const total = candidate.feedbackCount || 0;
  
  return {
    positive: 0,
    negative: 0,
    neutral: 0,
    total,
  };
}

/**
 * Get feedback percentages from feedback array
 */
export function getFeedbackPercentages(feedbackList: any[]): {
  for: number;
  against: number;
  abstain: number;
  forFormatted: string;
  againstFormatted: string;
  abstainFormatted: string;
} {
  if (!feedbackList || feedbackList.length === 0) {
    return {
      for: 0,
      against: 0,
      abstain: 0,
      forFormatted: '0%',
      againstFormatted: '0%',
      abstainFormatted: '0%',
    };
  }

  const forCount = feedbackList.filter(f => f.supportDetailed === 1).length;
  const againstCount = feedbackList.filter(f => f.supportDetailed === 0).length;
  const abstainCount = feedbackList.filter(f => f.supportDetailed === 2).length;
  const total = feedbackList.length;

  const forPct = (forCount / total) * 100;
  const againstPct = (againstCount / total) * 100;
  const abstainPct = (abstainCount / total) * 100;

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
 * Format feedback sentiment for display
 */
export function formatFeedbackSentiment(feedbackList: any[]): string {
  if (!feedbackList || feedbackList.length === 0) {
    return 'No feedback yet';
  }

  const forCount = feedbackList.filter(f => f.supportDetailed === 1).length;
  const againstCount = feedbackList.filter(f => f.supportDetailed === 0).length;
  const abstainCount = feedbackList.filter(f => f.supportDetailed === 2).length;

  const parts = [];
  if (forCount > 0) parts.push(`${forCount} for`);
  if (againstCount > 0) parts.push(`${againstCount} against`);
  if (abstainCount > 0) parts.push(`${abstainCount} abstain`);

  return parts.join(', ');
}

/**
 * Format feedback count
 */
export function formatFeedbackCount(count: number): string {
  if (count === 0) return 'No feedback';
  if (count === 1) return '1 comment';
  return `${count} comments`;
}

/**
 * Check if address is the proposer
 */
export function isProposer(candidate: Candidate, address?: string): boolean {
  if (!address) return false;
  return candidate.proposer.toLowerCase() === address.toLowerCase();
}

/**
 * Check if candidate can be promoted to proposal
 * Enhanced version with signatures check
 */
export function canPromoteToProposal(candidate: Candidate, signatures?: any[]): boolean {
  if (candidate.canceled) return false;
  
  // Check if we have enough signatures (placeholder - would need actual threshold)
  const requiredSignatures = candidate.requiredSignatures || 0;
  const signatureCount = signatures?.length || 0;
  
  return signatureCount >= requiredSignatures;
}

