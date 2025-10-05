/**
 * Data Proxy (Candidates/Feedback) - Write Functions
 * Helper functions for creating candidates and providing feedback
 */

import { Address, encodeAbiParameters, keccak256 } from 'viem';
import { CONTRACTS } from '../constants';
import { DataProxyABI } from '../../abis';
import type { ProposalActions } from '../types';

/**
 * Prepare create proposal candidate transaction
 * @param slug - URL-friendly slug for candidate
 * @param actions - Proposal actions
 * @param description - Proposal description
 * @returns Transaction config for wagmi useWriteContract
 */
export function prepareCreateCandidateTransaction(
  slug: string,
  actions: ProposalActions,
  description: string
) {
  return {
    address: CONTRACTS.NounsDAODataProxy.proxy as Address,
    abi: DataProxyABI,
    functionName: 'createProposalCandidate' as const,
    args: [
      actions.targets,
      actions.values,
      actions.signatures,
      actions.calldatas,
      description,
      slug,
    ],
  };
}

/**
 * Prepare update proposal candidate transaction
 * @param slug - URL-friendly slug for candidate
 * @param proposalIdToUpdate - Existing proposal ID to update
 * @param actions - Proposal actions
 * @param description - Proposal description
 * @returns Transaction config for wagmi useWriteContract
 */
export function prepareUpdateCandidateTransaction(
  slug: string,
  proposalIdToUpdate: bigint,
  actions: ProposalActions,
  description: string
) {
  return {
    address: CONTRACTS.NounsDAODataProxy.proxy as Address,
    abi: DataProxyABI,
    functionName: 'updateProposalCandidate' as const,
    args: [
      actions.targets,
      actions.values,
      actions.signatures,
      actions.calldatas,
      description,
      slug,
      proposalIdToUpdate,
    ],
  };
}

/**
 * Prepare cancel proposal candidate transaction
 * @param slug - Slug of candidate to cancel
 * @returns Transaction config for wagmi useWriteContract
 */
export function prepareCancelCandidateTransaction(slug: string) {
  return {
    address: CONTRACTS.NounsDAODataProxy.proxy as Address,
    abi: DataProxyABI,
    functionName: 'cancelProposalCandidate' as const,
    args: [slug],
  };
}

/**
 * Prepare add signature transaction
 * (For co-signing/supporting a candidate)
 * @param slug - Slug of candidate
 * @param sig - Signature data
 * @param expirationTimestamp - When signature expires
 * @param proposalIdToUpdate - Proposal ID if update
 * @param encodedPropHash - Encoded proposal hash
 * @param reason - Optional reason for signature
 * @returns Transaction config for wagmi useWriteContract
 */
export function prepareAddSignatureTransaction(
  slug: string,
  sig: `0x${string}`,
  expirationTimestamp: bigint,
  proposalIdToUpdate: bigint,
  encodedPropHash: `0x${string}`,
  reason: string = ''
) {
  return {
    address: CONTRACTS.NounsDAODataProxy.proxy as Address,
    abi: DataProxyABI,
    functionName: 'addSignature' as const,
    args: [
      sig,
      expirationTimestamp,
      proposalIdToUpdate,
      encodedPropHash,
      reason,
      slug,
    ],
  };
}

/**
 * Prepare send feedback transaction
 * @param proposalId - Proposal ID
 * @param support - Support value (0=Against, 1=For, 2=Abstain)
 * @param reason - Feedback reason
 * @returns Transaction config for wagmi useWriteContract
 */
export function prepareSendFeedbackTransaction(
  proposalId: bigint,
  support: number,
  reason: string
) {
  return {
    address: CONTRACTS.NounsDAODataProxy.proxy as Address,
    abi: DataProxyABI,
    functionName: 'sendFeedback' as const,
    args: [proposalId, support, reason],
  };
}

/**
 * Prepare send feedback transaction for multiple proposals
 * @param proposalIds - Array of proposal IDs
 * @param support - Support value
 * @param reasons - Array of reasons (one per proposal)
 * @returns Transaction config for wagmi useWriteContract
 */
export function prepareSendFeedbackBatchTransaction(
  proposalIds: bigint[],
  support: number,
  reasons: string[]
) {
  return {
    address: CONTRACTS.NounsDAODataProxy.proxy as Address,
    abi: DataProxyABI,
    functionName: 'sendFeedbackBatch' as const,
    args: [proposalIds, support, reasons],
  };
}

/**
 * Validate candidate creation parameters
 * @param slug - Slug to validate
 * @param actions - Actions to validate
 * @param description - Description to validate
 * @returns Error message or null if valid
 */
export function validateCandidateParams(
  slug: string,
  actions: ProposalActions,
  description: string
): string | null {
  // Validate slug
  if (!slug || slug.length === 0) {
    return 'Slug is required';
  }
  
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return 'Slug must be lowercase alphanumeric with hyphens only';
  }
  
  // Validate actions
  if (actions.targets.length === 0) {
    return 'At least one action is required';
  }
  
  if (
    actions.targets.length !== actions.values.length ||
    actions.targets.length !== actions.signatures.length ||
    actions.targets.length !== actions.calldatas.length
  ) {
    return 'All action arrays must have the same length';
  }
  
  // Validate description
  if (!description || description.trim().length === 0) {
    return 'Description is required';
  }
  
  return null;
}

/**
 * Validate feedback parameters
 * @param support - Support value
 * @param reason - Reason text
 * @returns Error message or null if valid
 */
export function validateFeedbackParams(
  support: number,
  reason: string
): string | null {
  // Validate support
  if (support !== 0 && support !== 1 && support !== 2) {
    return 'Support must be 0 (Against), 1 (For), or 2 (Abstain)';
  }
  
  // Reason is optional, but if provided should not be empty
  if (reason && reason.trim().length === 0) {
    return 'Reason cannot be empty if provided';
  }
  
  return null;
}

// ============================================================================
// STANDARDIZED FUNCTION NAMES (for consistent API)
// ============================================================================

/**
 * Create proposal candidate (simple interface)
 * @param description Proposal description
 * @param slug URL slug
 */
export function prepareCreateProposalCandidate(description: string, slug: string) {
  // For simple interface, create minimal proposal actions
  const emptyActions: ProposalActions = {
    targets: [],
    values: [],
    signatures: [],
    calldatas: []
  };
  
  return prepareCreateCandidateTransaction(slug, emptyActions, description);
}

