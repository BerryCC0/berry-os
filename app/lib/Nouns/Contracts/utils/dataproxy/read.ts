/**
 * Data Proxy (Candidates/Feedback) - Read Functions
 * Pure functions and utilities for reading proposal candidates and feedback
 */

import { Address } from 'viem';
import type { ProposalCandidate } from '../types';
import { NOUNS_CONTRACTS } from '../../addresses';
import { DataProxyABI } from '../../abis';

/**
 * Parse proposal candidate from contract data
 * @param candidateData - Raw candidate data from contract
 * @returns Parsed proposal candidate
 */
export function parseProposalCandidate(
  candidateData: readonly [Address, string, bigint, `0x${string}`, string, readonly Address[], readonly bigint[], readonly string[], readonly `0x${string}`[]]
): ProposalCandidate {
  return {
    proposer: candidateData[0],
    slug: candidateData[1],
    proposalIdToUpdate: candidateData[2],
    encodedProposalHash: candidateData[3],
    description: candidateData[4],
    actions: {
      targets: [...candidateData[5]],
      values: [...candidateData[6]],
      signatures: [...candidateData[7]],
      calldatas: [...candidateData[8]],
    },
  };
}

/**
 * Generate slug from proposal title
 * Converts title to URL-friendly slug
 * @param title - Proposal title
 * @returns URL-friendly slug
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Trim hyphens from start/end
}

/**
 * Validate slug format
 * @param slug - Slug to validate
 * @returns True if valid slug
 */
export function isValidSlug(slug: string): boolean {
  // Slug should be lowercase alphanumeric with hyphens
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}

/**
 * Parse feedback data from contract
 * @param feedbackData - Raw feedback data
 * @returns Parsed feedback with support and reason
 */
export function parseFeedback(
  feedbackData: readonly [number, string]
): { support: number; reason: string } {
  return {
    support: feedbackData[0],
    reason: feedbackData[1],
  };
}

/**
 * Check if candidate is update (updating existing proposal)
 * @param proposalIdToUpdate - Proposal ID to update
 * @returns True if candidate is an update
 */
export function isUpdateCandidate(proposalIdToUpdate: bigint): boolean {
  return proposalIdToUpdate > BigInt(0);
}

/**
 * Format feedback support as text
 * @param support - Support value (0=Against, 1=For, 2=Abstain)
 * @returns Human-readable support
 */
export function formatFeedbackSupport(support: number): string {
  const supportNames: Record<number, string> = {
    0: 'Against',
    1: 'For',
    2: 'Abstain',
  };
  return supportNames[support] || 'Unknown';
}

/**
 * Calculate feedback summary
 * @param feedbacks - Array of feedback entries
 * @returns Summary with counts for each support type
 */
export function calculateFeedbackSummary(
  feedbacks: Array<{ support: number; reason: string }>
): { for: number; against: number; abstain: number; total: number } {
  const summary = { for: 0, against: 0, abstain: 0, total: 0 };
  
  for (const feedback of feedbacks) {
    summary.total++;
    if (feedback.support === 1) summary.for++;
    else if (feedback.support === 0) summary.against++;
    else if (feedback.support === 2) summary.abstain++;
  }
  
  return summary;
}

// ============================================================================
// CONTRACT READ FUNCTIONS (for useReadContract)
// ============================================================================

/**
 * Get cost to create a candidate
 */
export function getCreateCandidateCost() {
  return {
    address: NOUNS_CONTRACTS.NounsDAODataProxy.proxy as Address,
    abi: DataProxyABI,
    functionName: 'createCandidateCost'
  } as const;
}

/**
 * Get cost to update a candidate
 */
export function getUpdateCandidateCost() {
  return {
    address: NOUNS_CONTRACTS.NounsDAODataProxy.proxy as Address,
    abi: DataProxyABI,
    functionName: 'updateCandidateCost'
  } as const;
}

/**
 * Get proposal candidate by slug
 * @param slug Candidate slug
 */
export function getCandidate(slug: string) {
  return {
    address: NOUNS_CONTRACTS.NounsDAODataProxy.proxy as Address,
    abi: DataProxyABI,
    functionName: 'getCandidate',
    args: [slug]
  } as const;
}

/**
 * Get fee recipient address
 */
export function getFeeRecipient() {
  return {
    address: NOUNS_CONTRACTS.NounsDAODataProxy.proxy as Address,
    abi: DataProxyABI,
    functionName: 'feeRecipient'
  } as const;
}

/**
 * Get Nouns DAO address
 */
export function getNounsDAOAddress() {
  return {
    address: NOUNS_CONTRACTS.NounsDAODataProxy.proxy as Address,
    abi: DataProxyABI,
    functionName: 'nounsDAO'
  } as const;
}

/**
 * Get Nouns Token address
 */
export function getNounsTokenAddress() {
  return {
    address: NOUNS_CONTRACTS.NounsDAODataProxy.proxy as Address,
    abi: DataProxyABI,
    functionName: 'nounsToken'
  } as const;
}

