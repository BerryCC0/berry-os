/**
 * Data Proxy Actions
 * User-facing actions for proposal candidates and feedback
 */

import { Address } from 'viem';
import { NOUNS_CONTRACTS } from '../utils/addresses';
import { DataProxyABI } from '../abis';
import {
  validateProposalId,
  validateCandidateSlug,
  validateProposalActions,
  validateProposalDescription,
  validateVoteSupport,
  validateVoteReason,
} from './validation';

// ============================================================================
// CANDIDATE ACTIONS
// ============================================================================

/**
 * Create a proposal candidate (draft proposal)
 * Requires payment if not a Noun holder
 * 
 * @param targets - Target contract addresses
 * @param values - ETH values to send (in wei)
 * @param signatures - Function signatures
 * @param calldatas - Encoded function call data
 * @param description - Proposal description
 * @param slug - Unique URL-safe slug for the candidate
 * @param proposalIdToUpdate - Proposal ID to update (0 for new proposal)
 * @returns Transaction config for wagmi useWriteContract
 * @throws Error if validation fails
 * 
 * @example
 * const config = createProposalCandidate(
 *   ['0x...'],
 *   [BigInt(0)],
 *   ['transfer(address,uint256)'],
 *   ['0x...'],
 *   '# My Proposal\n\nThis proposal does...',
 *   'my-proposal-slug',
 *   BigInt(0)
 * );
 * await writeContractAsync(config);
 */
export function createProposalCandidate(
  targets: Address[],
  values: bigint[],
  signatures: string[],
  calldatas: `0x${string}`[],
  description: string,
  slug: string,
  proposalIdToUpdate: bigint
) {
  validateProposalActions(targets, values, signatures, calldatas);
  validateProposalDescription(description);
  validateCandidateSlug(slug);
  
  return {
    address: NOUNS_CONTRACTS.NounsDAODataProxy.proxy as Address,
    abi: DataProxyABI,
    functionName: 'createProposalCandidate' as const,
    args: [targets, values, signatures, calldatas, description, slug, proposalIdToUpdate] as const,
  };
}

/**
 * Update an existing proposal candidate
 * Requires payment if not a Noun holder
 * 
 * @param targets - Target contract addresses
 * @param values - ETH values to send (in wei)
 * @param signatures - Function signatures
 * @param calldatas - Encoded function call data
 * @param description - Proposal description
 * @param slug - Candidate slug
 * @param proposalIdToUpdate - Proposal ID to update (0 for new proposal)
 * @param reason - Reason for update
 * @returns Transaction config for wagmi useWriteContract
 * @throws Error if validation fails
 * 
 * @example
 * const config = updateProposalCandidate(
 *   ['0x...'],
 *   [BigInt(0)],
 *   ['transfer(address,uint256)'],
 *   ['0x...'],
 *   '# My Updated Proposal\n\n...',
 *   'my-proposal-slug',
 *   BigInt(0),
 *   'Updated based on feedback'
 * );
 * await writeContractAsync(config);
 */
export function updateProposalCandidate(
  targets: Address[],
  values: bigint[],
  signatures: string[],
  calldatas: `0x${string}`[],
  description: string,
  slug: string,
  proposalIdToUpdate: bigint,
  reason: string
) {
  validateProposalActions(targets, values, signatures, calldatas);
  validateProposalDescription(description);
  validateCandidateSlug(slug);
  
  return {
    address: NOUNS_CONTRACTS.NounsDAODataProxy.proxy as Address,
    abi: DataProxyABI,
    functionName: 'updateProposalCandidate' as const,
    args: [targets, values, signatures, calldatas, description, slug, proposalIdToUpdate, reason] as const,
  };
}

/**
 * Cancel a proposal candidate
 * Only the proposer can cancel
 * 
 * @param slug - Candidate slug
 * @returns Transaction config for wagmi useWriteContract
 * @throws Error if validation fails
 * 
 * @example
 * const config = cancelProposalCandidate('my-proposal-slug');
 * await writeContractAsync(config);
 */
export function cancelProposalCandidate(slug: string) {
  validateCandidateSlug(slug);
  
  return {
    address: NOUNS_CONTRACTS.NounsDAODataProxy.proxy as Address,
    abi: DataProxyABI,
    functionName: 'cancelProposalCandidate' as const,
    args: [slug] as const,
  };
}

// ============================================================================
// FEEDBACK ACTIONS
// ============================================================================

/**
 * Send feedback on an active proposal
 * 
 * @param proposalId - Proposal ID
 * @param support - Support value (0=Against, 1=For, 2=Abstain)
 * @param reason - Feedback reason
 * @returns Transaction config for wagmi useWriteContract
 * @throws Error if validation fails
 * 
 * @example
 * const config = sendFeedback(BigInt(123), 1, "Great proposal!");
 * await writeContractAsync(config);
 */
export function sendFeedback(proposalId: bigint, support: number, reason: string) {
  validateProposalId(proposalId);
  validateVoteSupport(support);
  validateVoteReason(reason);
  
  return {
    address: NOUNS_CONTRACTS.NounsDAODataProxy.proxy as Address,
    abi: DataProxyABI,
    functionName: 'sendFeedback' as const,
    args: [proposalId, support, reason] as const,
  };
}

/**
 * Send feedback on a proposal candidate
 * 
 * @param proposer - Proposer address
 * @param slug - Candidate slug
 * @param support - Support value (0=Against, 1=For, 2=Abstain)
 * @param reason - Feedback reason
 * @returns Transaction config for wagmi useWriteContract
 * @throws Error if validation fails
 * 
 * @example
 * const config = sendCandidateFeedback('0x...', 'my-proposal-slug', 1, "Looks good!");
 * await writeContractAsync(config);
 */
export function sendCandidateFeedback(
  proposer: Address,
  slug: string,
  support: number,
  reason: string
) {
  validateCandidateSlug(slug);
  validateVoteSupport(support);
  validateVoteReason(reason);
  
  return {
    address: NOUNS_CONTRACTS.NounsDAODataProxy.proxy as Address,
    abi: DataProxyABI,
    functionName: 'sendCandidateFeedback' as const,
    args: [proposer, slug, support, reason] as const,
  };
}

/**
 * Add EIP-712 signature to a proposal candidate
 * Allows co-signing a candidate before it becomes an official proposal
 * 
 * @param sig - EIP-712 signature bytes
 * @param expirationTimestamp - Signature expiration timestamp
 * @param proposer - Original proposer address
 * @param slug - Candidate slug
 * @param proposalIdToUpdate - Proposal ID to update (0 for new)
 * @param encodedProp - Encoded proposal data
 * @param reason - Reason for signing
 * @returns Transaction config for wagmi useWriteContract
 * @throws Error if validation fails
 * 
 * @example
 * const config = addSignature(
 *   '0x...',
 *   BigInt(Date.now() + 86400000),
 *   '0x...',
 *   'my-proposal',
 *   BigInt(0),
 *   '0x...',
 *   'I support this proposal'
 * );
 * await writeContractAsync(config);
 */
export function addSignature(
  sig: `0x${string}`,
  expirationTimestamp: bigint,
  proposer: Address,
  slug: string,
  proposalIdToUpdate: bigint,
  encodedProp: `0x${string}`,
  reason: string
) {
  if (!sig || sig.length < 10) {
    throw new Error('Invalid signature');
  }
  if (expirationTimestamp <= BigInt(Date.now())) {
    throw new Error('Signature already expired');
  }
  validateCandidateSlug(slug);
  if (reason) validateVoteReason(reason);
  
  return {
    address: NOUNS_CONTRACTS.NounsDAODataProxy.proxy as Address,
    abi: DataProxyABI,
    functionName: 'addSignature' as const,
    args: [sig, expirationTimestamp, proposer, slug, proposalIdToUpdate, encodedProp, reason] as const,
  };
}

/**
 * Post public message from Duna admin
 * Allows Duna admin to post public messages about proposals
 * 
 * @param message - Message text
 * @param relatedProposals - Array of related proposal IDs
 * @returns Transaction config for wagmi useWriteContract
 * @throws Error if validation fails
 * 
 * @example
 * const config = postDunaAdminMessage(
 *   'Update on proposal 123 compliance review',
 *   [BigInt(123)]
 * );
 * await writeContractAsync(config);
 */
export function postDunaAdminMessage(
  message: string,
  relatedProposals: bigint[]
) {
  if (!message || message.trim().length === 0) {
    throw new Error('Message cannot be empty');
  }
  if (message.length > 1000) {
    throw new Error('Message too long (max 1000 characters)');
  }
  
  return {
    address: NOUNS_CONTRACTS.NounsDAODataProxy.proxy as Address,
    abi: DataProxyABI,
    functionName: 'postDunaAdminMessage' as const,
    args: [message, relatedProposals] as const,
  };
}

/**
 * Send message to Duna admin
 * Allows voters to communicate with admin about proposals
 * 
 * @param message - Message text
 * @param relatedProposals - Array of related proposal IDs
 * @returns Transaction config for wagmi useWriteContract
 * @throws Error if validation fails
 * 
 * @example
 * const config = postVoterMessageToDunaAdmin(
 *   'Question about proposal 123',
 *   [BigInt(123)]
 * );
 * await writeContractAsync(config);
 */
export function postVoterMessageToDunaAdmin(
  message: string,
  relatedProposals: bigint[]
) {
  if (!message || message.trim().length === 0) {
    throw new Error('Message cannot be empty');
  }
  if (message.length > 1000) {
    throw new Error('Message too long (max 1000 characters)');
  }
  
  return {
    address: NOUNS_CONTRACTS.NounsDAODataProxy.proxy as Address,
    abi: DataProxyABI,
    functionName: 'postVoterMessageToDunaAdmin' as const,
    args: [message, relatedProposals] as const,
  };
}

/**
 * Signal proposal compliance
 * Signal whether a proposal complies with DAO guidelines
 * 
 * @param proposalId - Proposal ID
 * @param signal - Compliance signal (0-255)
 * @param reason - Reason for signal
 * @returns Transaction config for wagmi useWriteContract
 * @throws Error if validation fails
 * 
 * @example
 * const config = signalProposalCompliance(
 *   BigInt(123),
 *   1, // 1 = compliant
 *   'Meets all guidelines'
 * );
 * await writeContractAsync(config);
 */
export function signalProposalCompliance(
  proposalId: bigint,
  signal: number,
  reason: string
) {
  validateProposalId(proposalId);
  if (signal < 0 || signal > 255) {
    throw new Error('Signal must be between 0 and 255');
  }
  if (reason) validateVoteReason(reason);
  
  return {
    address: NOUNS_CONTRACTS.NounsDAODataProxy.proxy as Address,
    abi: DataProxyABI,
    functionName: 'signalProposalCompliance' as const,
    args: [proposalId, signal, reason] as const,
  };
}

// ============================================================================
// READ QUERIES
// ============================================================================

/**
 * Get cost to create a candidate
 * 
 * @returns Query config for wagmi useReadContract
 * 
 * @example
 * const { data: cost } = useReadContract(createCandidateCost());
 * // cost in wei
 */
export function createCandidateCost() {
  return {
    address: NOUNS_CONTRACTS.NounsDAODataProxy.proxy as Address,
    abi: DataProxyABI,
    functionName: 'createCandidateCost' as const,
  };
}

/**
 * Get cost to update a candidate
 * 
 * @returns Query config for wagmi useReadContract
 * 
 * @example
 * const { data: cost } = useReadContract(updateCandidateCost());
 * // cost in wei
 */
export function updateCandidateCost() {
  return {
    address: NOUNS_CONTRACTS.NounsDAODataProxy.proxy as Address,
    abi: DataProxyABI,
    functionName: 'updateCandidateCost' as const,
  };
}

/**
 * Get fee recipient address
 * 
 * @returns Query config for wagmi useReadContract
 */
export function feeRecipient() {
  return {
    address: NOUNS_CONTRACTS.NounsDAODataProxy.proxy as Address,
    abi: DataProxyABI,
    functionName: 'feeRecipient' as const,
  };
}

/**
 * Get Duna admin address
 * 
 * @returns Query config for wagmi useReadContract
 */
export function dunaAdmin() {
  return {
    address: NOUNS_CONTRACTS.NounsDAODataProxy.proxy as Address,
    abi: DataProxyABI,
    functionName: 'dunaAdmin' as const,
  };
}
