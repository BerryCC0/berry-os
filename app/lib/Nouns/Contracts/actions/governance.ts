/**
 * Governance Actions
 * User-facing actions for Nouns DAO governance
 * All write actions automatically include Berry OS Client ID (11) where applicable
 */

import { Address } from 'viem';
import { NOUNS_CONTRACTS } from '../utils/addresses';
import { NounsDAOLogicV3ABI } from '../abis';
import { BERRY_OS_CLIENT_ID, VOTE_SUPPORT } from '../utils/constants';
import { ProposerSignature } from '../utils/types';
import {
  validateProposalId,
  validateVoteSupport,
  validateVoteReason,
  validateProposalActions,
  validateProposalDescription,
} from './validation';

// ============================================================================
// VOTING ACTIONS (All with Berry OS Client ID 11)
// ============================================================================

/**
 * Cast a refundable vote (gas refund for voting)
 * Automatically includes Berry OS Client ID (11)
 * 
 * @param proposalId - Proposal ID
 * @param support - Vote support (0=Against, 1=For, 2=Abstain)
 * @param reason - Optional reason for vote (max 1000 chars)
 * @returns Transaction config for wagmi useWriteContract
 * @throws Error if validation fails
 * 
 * @example
 * const config = castRefundableVote(BigInt(123), 1, "This is important!");
 * await writeContractAsync(config);
 */
export function castRefundableVote(
  proposalId: bigint,
  support: number,
  reason?: string
) {
  validateProposalId(proposalId);
  validateVoteSupport(support);
  if (reason) validateVoteReason(reason);
  
  if (reason) {
    return {
      address: NOUNS_CONTRACTS.NounsDAOProxy.proxy as Address,
      abi: NounsDAOLogicV3ABI,
      functionName: 'castRefundableVoteWithReason' as const,
      args: [proposalId, support, reason, BERRY_OS_CLIENT_ID] as const,
    };
  }
  
  return {
    address: NOUNS_CONTRACTS.NounsDAOProxy.proxy as Address,
    abi: NounsDAOLogicV3ABI,
    functionName: 'castRefundableVote' as const,
    args: [proposalId, support, BERRY_OS_CLIENT_ID] as const,
  };
}

/**
 * Vote FOR a proposal (with optional reason)
 * Uses refundable vote with Berry OS Client ID (11)
 * 
 * @param proposalId - Proposal ID
 * @param reason - Optional reason for vote
 * @returns Transaction config for wagmi useWriteContract
 * 
 * @example
 * const config = voteFor(BigInt(123), "Great proposal!");
 * await writeContractAsync(config);
 */
export function voteFor(proposalId: bigint, reason?: string) {
  return castRefundableVote(proposalId, VOTE_SUPPORT.FOR, reason);
}

/**
 * Vote AGAINST a proposal (with optional reason)
 * Uses refundable vote with Berry OS Client ID (11)
 * 
 * @param proposalId - Proposal ID
 * @param reason - Optional reason for vote
 * @returns Transaction config for wagmi useWriteContract
 * 
 * @example
 * const config = voteAgainst(BigInt(123), "Needs more work");
 * await writeContractAsync(config);
 */
export function voteAgainst(proposalId: bigint, reason?: string) {
  return castRefundableVote(proposalId, VOTE_SUPPORT.AGAINST, reason);
}

/**
 * Vote ABSTAIN on a proposal (with optional reason)
 * Uses refundable vote with Berry OS Client ID (11)
 * 
 * @param proposalId - Proposal ID
 * @param reason - Optional reason for vote
 * @returns Transaction config for wagmi useWriteContract
 * 
 * @example
 * const config = voteAbstain(BigInt(123), "Neutral on this");
 * await writeContractAsync(config);
 */
export function voteAbstain(proposalId: bigint, reason?: string) {
  return castRefundableVote(proposalId, VOTE_SUPPORT.ABSTAIN, reason);
}

// ============================================================================
// PROPOSAL LIFECYCLE ACTIONS
// ============================================================================

/**
 * Create a new proposal
 * Automatically includes Berry OS Client ID (11)
 * 
 * @param targets - Target contract addresses
 * @param values - ETH values to send (in wei)
 * @param signatures - Function signatures
 * @param calldatas - Encoded function call data
 * @param description - Proposal description
 * @returns Transaction config for wagmi useWriteContract
 * @throws Error if validation fails
 * 
 * @example
 * const config = propose(
 *   ['0x...'],
 *   [BigInt(0)],
 *   ['transfer(address,uint256)'],
 *   ['0x...'],
 *   '# My Proposal\n\nThis proposal does...'
 * );
 * await writeContractAsync(config);
 */
export function propose(
  targets: Address[],
  values: bigint[],
  signatures: string[],
  calldatas: `0x${string}`[],
  description: string
) {
  validateProposalActions(targets, values, signatures, calldatas);
  validateProposalDescription(description);
  
  return {
    address: NOUNS_CONTRACTS.NounsDAOProxy.proxy as Address,
    abi: NounsDAOLogicV3ABI,
    functionName: 'propose' as const,
    args: [targets, values, signatures, calldatas, description, BERRY_OS_CLIENT_ID] as const,
  };
}

/**
 * Create a proposal to be executed on TimelockV1
 * Automatically includes Berry OS Client ID (11)
 * 
 * @param targets - Target contract addresses
 * @param values - ETH values to send (in wei)
 * @param signatures - Function signatures
 * @param calldatas - Encoded function call data
 * @param description - Proposal description
 * @returns Transaction config for wagmi useWriteContract
 * @throws Error if validation fails
 * 
 * @example
 * const config = proposeOnTimelockV1(
 *   ['0x...'],
 *   [BigInt(0)],
 *   ['transfer(address,uint256)'],
 *   ['0x...'],
 *   '# My TimelockV1 Proposal\n\nThis proposal executes on TimelockV1...'
 * );
 * await writeContractAsync(config);
 */
export function proposeOnTimelockV1(
  targets: Address[],
  values: bigint[],
  signatures: string[],
  calldatas: `0x${string}`[],
  description: string
) {
  validateProposalActions(targets, values, signatures, calldatas);
  validateProposalDescription(description);
  
  return {
    address: NOUNS_CONTRACTS.NounsDAOProxy.proxy as Address,
    abi: NounsDAOLogicV3ABI,
    functionName: 'proposeOnTimelockV1' as const,
    args: [targets, values, signatures, calldatas, description, BERRY_OS_CLIENT_ID] as const,
  };
}

/**
 * Propose by signatures (multi-signer proposal)
 * Automatically includes Berry OS Client ID (11)
 * Allows multiple Noun holders to co-sign a proposal before submission
 * 
 * @param proposerSignatures - Array of proposer signatures (EIP-712)
 * @param targets - Target contract addresses
 * @param values - ETH values to send (in wei)
 * @param signatures - Function signatures
 * @param calldatas - Encoded function call data
 * @param description - Proposal description
 * @returns Transaction config for wagmi useWriteContract
 * @throws Error if validation fails
 * 
 * @example
 * const config = proposeBySigs(
 *   [
 *     { sig: '0x...', signer: '0x...', expirationTimestamp: BigInt(timestamp) },
 *     // ... more signatures
 *   ],
 *   ['0x...'],
 *   [BigInt(0)],
 *   ['transfer(address,uint256)'],
 *   ['0x...'],
 *   '# Multi-signer Proposal\n\nThis proposal is co-signed by...'
 * );
 * await writeContractAsync(config);
 */
export function proposeBySigs(
  proposerSignatures: ProposerSignature[],
  targets: Address[],
  values: bigint[],
  signatures: string[],
  calldatas: `0x${string}`[],
  description: string
) {
  if (!proposerSignatures || proposerSignatures.length === 0) {
    throw new Error('At least one proposer signature is required');
  }
  
  validateProposalActions(targets, values, signatures, calldatas);
  validateProposalDescription(description);
  
  // Convert signatures to tuple format expected by contract
  const sigTuples = proposerSignatures.map(ps => [ps.sig, ps.signer, ps.expirationTimestamp]);
  
  return {
    address: NOUNS_CONTRACTS.NounsDAOProxy.proxy as Address,
    abi: NounsDAOLogicV3ABI,
    functionName: 'proposeBySigs' as const,
    args: [sigTuples, targets, values, signatures, calldatas, description, BERRY_OS_CLIENT_ID] as const,
  };
}

/**
 * Queue a succeeded proposal for execution
 * 
 * @param proposalId - Proposal ID
 * @returns Transaction config for wagmi useWriteContract
 * @throws Error if validation fails
 * 
 * @example
 * const config = queue(BigInt(123));
 * await writeContractAsync(config);
 */
export function queue(proposalId: bigint) {
  validateProposalId(proposalId);
  
  return {
    address: NOUNS_CONTRACTS.NounsDAOProxy.proxy as Address,
    abi: NounsDAOLogicV3ABI,
    functionName: 'queue' as const,
    args: [proposalId] as const,
  };
}

/**
 * Execute a queued proposal
 * 
 * @param proposalId - Proposal ID
 * @returns Transaction config for wagmi useWriteContract
 * @throws Error if validation fails
 * 
 * @example
 * const config = execute(BigInt(123));
 * await writeContractAsync(config);
 */
export function execute(proposalId: bigint) {
  validateProposalId(proposalId);
  
  return {
    address: NOUNS_CONTRACTS.NounsDAOProxy.proxy as Address,
    abi: NounsDAOLogicV3ABI,
    functionName: 'execute' as const,
    args: [proposalId] as const,
  };
}

/**
 * Cancel a proposal
 * Only proposer or admin can cancel
 * 
 * @param proposalId - Proposal ID
 * @returns Transaction config for wagmi useWriteContract
 * @throws Error if validation fails
 * 
 * @example
 * const config = cancel(BigInt(123));
 * await writeContractAsync(config);
 */
export function cancel(proposalId: bigint) {
  validateProposalId(proposalId);
  
  return {
    address: NOUNS_CONTRACTS.NounsDAOProxy.proxy as Address,
    abi: NounsDAOLogicV3ABI,
    functionName: 'cancel' as const,
    args: [proposalId] as const,
  };
}

/**
 * Veto a proposal
 * Only vetoer can veto
 * 
 * @param proposalId - Proposal ID
 * @returns Transaction config for wagmi useWriteContract
 * @throws Error if validation fails
 * 
 * @example
 * const config = veto(BigInt(123));
 * await writeContractAsync(config);
 */
export function veto(proposalId: bigint) {
  validateProposalId(proposalId);
  
  return {
    address: NOUNS_CONTRACTS.NounsDAOProxy.proxy as Address,
    abi: NounsDAOLogicV3ABI,
    functionName: 'veto' as const,
    args: [proposalId] as const,
  };
}

/**
 * Cancel your own signature
 * Useful for revoking support for a proposal before it's submitted
 * 
 * @param sig - Signature bytes to cancel
 * @returns Transaction config for wagmi useWriteContract
 * @throws Error if validation fails
 * 
 * @example
 * const config = cancelSig('0x...');
 * await writeContractAsync(config);
 */
export function cancelSig(sig: `0x${string}`) {
  if (!sig || sig.length < 10) {
    throw new Error('Invalid signature');
  }
  
  return {
    address: NOUNS_CONTRACTS.NounsDAOProxy.proxy as Address,
    abi: NounsDAOLogicV3ABI,
    functionName: 'cancelSig' as const,
    args: [sig] as const,
  };
}

// ============================================================================
// UPDATABLE PROPOSALS
// ============================================================================

/**
 * Update proposal transactions during updatable period
 * 
 * @param proposalId - Proposal ID
 * @param targets - New target addresses
 * @param values - New ETH values
 * @param signatures - New function signatures
 * @param calldatas - New calldata
 * @param description - New description
 * @param updateMessage - Message explaining the update
 * @returns Transaction config for wagmi useWriteContract
 * @throws Error if validation fails
 */
export function updateProposal(
  proposalId: bigint,
  targets: Address[],
  values: bigint[],
  signatures: string[],
  calldatas: `0x${string}`[],
  description: string,
  updateMessage: string
) {
  validateProposalId(proposalId);
  validateProposalActions(targets, values, signatures, calldatas);
  validateProposalDescription(description);
  
  return {
    address: NOUNS_CONTRACTS.NounsDAOProxy.proxy as Address,
    abi: NounsDAOLogicV3ABI,
    functionName: 'updateProposal' as const,
    args: [proposalId, targets, values, signatures, calldatas, description, updateMessage] as const,
  };
}

/**
 * Update proposal description only
 * 
 * @param proposalId - Proposal ID
 * @param description - New description
 * @param updateMessage - Message explaining the update
 * @returns Transaction config for wagmi useWriteContract
 * @throws Error if validation fails
 */
export function updateProposalDescription(
  proposalId: bigint,
  description: string,
  updateMessage: string
) {
  validateProposalId(proposalId);
  validateProposalDescription(description);
  
  return {
    address: NOUNS_CONTRACTS.NounsDAOProxy.proxy as Address,
    abi: NounsDAOLogicV3ABI,
    functionName: 'updateProposalDescription' as const,
    args: [proposalId, description, updateMessage] as const,
  };
}

/**
 * Update proposal transactions only
 * 
 * @param proposalId - Proposal ID
 * @param targets - New target addresses
 * @param values - New ETH values
 * @param signatures - New function signatures
 * @param calldatas - New calldata
 * @param updateMessage - Message explaining the update
 * @returns Transaction config for wagmi useWriteContract
 * @throws Error if validation fails
 */
export function updateProposalTransactions(
  proposalId: bigint,
  targets: Address[],
  values: bigint[],
  signatures: string[],
  calldatas: `0x${string}`[],
  updateMessage: string
) {
  validateProposalId(proposalId);
  validateProposalActions(targets, values, signatures, calldatas);
  
  return {
    address: NOUNS_CONTRACTS.NounsDAOProxy.proxy as Address,
    abi: NounsDAOLogicV3ABI,
    functionName: 'updateProposalTransactions' as const,
    args: [proposalId, targets, values, signatures, calldatas, updateMessage] as const,
  };
}

// ============================================================================
// READ QUERIES
// ============================================================================

/**
 * Get proposal state
 * 
 * @param proposalId - Proposal ID
 * @returns Query config for wagmi useReadContract
 * 
 * @example
 * const { data: state } = useReadContract(state(BigInt(123)));
 * // state = 0-10 (Pending, Active, Canceled, Defeated, Succeeded, Queued, Expired, Executed, Vetoed, ObjectionPeriod, Updatable)
 */
export function state(proposalId: bigint) {
  validateProposalId(proposalId);
  
  return {
    address: NOUNS_CONTRACTS.NounsDAOProxy.proxy as Address,
    abi: NounsDAOLogicV3ABI,
    functionName: 'state' as const,
    args: [proposalId] as const,
  };
}

/**
 * Get proposal details
 * 
 * @param proposalId - Proposal ID
 * @returns Query config for wagmi useReadContract
 * 
 * @example
 * const { data: proposal } = useReadContract(proposals(BigInt(123)));
 * // proposal = { id, proposer, proposalThreshold, quorumVotes, eta, startBlock, endBlock, forVotes, againstVotes, abstainVotes, ... }
 */
export function proposals(proposalId: bigint) {
  validateProposalId(proposalId);
  
  return {
    address: NOUNS_CONTRACTS.NounsDAOProxy.proxy as Address,
    abi: NounsDAOLogicV3ABI,
    functionName: 'proposals' as const,
    args: [proposalId] as const,
  };
}

/**
 * Get proposal details (V3 with additional fields)
 * 
 * @param proposalId - Proposal ID
 * @returns Query config for wagmi useReadContract
 */
export function proposalsV3(proposalId: bigint) {
  validateProposalId(proposalId);
  
  return {
    address: NOUNS_CONTRACTS.NounsDAOProxy.proxy as Address,
    abi: NounsDAOLogicV3ABI,
    functionName: 'proposalsV3' as const,
    args: [proposalId] as const,
  };
}

/**
 * Get proposal actions (targets, values, signatures, calldatas)
 * 
 * @param proposalId - Proposal ID
 * @returns Query config for wagmi useReadContract
 */
export function getActions(proposalId: bigint) {
  validateProposalId(proposalId);
  
  return {
    address: NOUNS_CONTRACTS.NounsDAOProxy.proxy as Address,
    abi: NounsDAOLogicV3ABI,
    functionName: 'getActions' as const,
    args: [proposalId] as const,
  };
}

/**
 * Get vote receipt for an address on a proposal
 * 
 * @param proposalId - Proposal ID
 * @param voter - Voter address
 * @returns Query config for wagmi useReadContract
 * 
 * @example
 * const { data: receipt } = useReadContract(getReceipt(BigInt(123), '0x...'));
 * // receipt = { hasVoted, support, votes }
 */
export function getReceipt(proposalId: bigint, voter: Address) {
  validateProposalId(proposalId);
  
  return {
    address: NOUNS_CONTRACTS.NounsDAOProxy.proxy as Address,
    abi: NounsDAOLogicV3ABI,
    functionName: 'getReceipt' as const,
    args: [proposalId, voter] as const,
  };
}

/**
 * Get current proposal threshold (minimum votes to propose)
 * 
 * @returns Query config for wagmi useReadContract
 */
export function proposalThreshold() {
  return {
    address: NOUNS_CONTRACTS.NounsDAOProxy.proxy as Address,
    abi: NounsDAOLogicV3ABI,
    functionName: 'proposalThreshold' as const,
  };
}

/**
 * Get quorum votes required for a proposal
 * 
 * @param proposalId - Proposal ID
 * @returns Query config for wagmi useReadContract
 */
export function quorumVotes(proposalId: bigint) {
  validateProposalId(proposalId);
  
  return {
    address: NOUNS_CONTRACTS.NounsDAOProxy.proxy as Address,
    abi: NounsDAOLogicV3ABI,
    functionName: 'quorumVotes' as const,
    args: [proposalId] as const,
  };
}

/**
 * Get voting delay (blocks between proposal creation and voting start)
 * 
 * @returns Query config for wagmi useReadContract
 */
export function votingDelay() {
  return {
    address: NOUNS_CONTRACTS.NounsDAOProxy.proxy as Address,
    abi: NounsDAOLogicV3ABI,
    functionName: 'votingDelay' as const,
  };
}

/**
 * Get voting period (blocks for voting)
 * 
 * @returns Query config for wagmi useReadContract
 */
export function votingPeriod() {
  return {
    address: NOUNS_CONTRACTS.NounsDAOProxy.proxy as Address,
    abi: NounsDAOLogicV3ABI,
    functionName: 'votingPeriod' as const,
  };
}

/**
 * Get total proposal count
 * 
 * @returns Query config for wagmi useReadContract
 */
export function proposalCount() {
  return {
    address: NOUNS_CONTRACTS.NounsDAOProxy.proxy as Address,
    abi: NounsDAOLogicV3ABI,
    functionName: 'proposalCount' as const,
  };
}

/**
 * Get latest proposal ID for an address
 * 
 * @param account - Account address
 * @returns Query config for wagmi useReadContract
 */
export function latestProposalIds(account: Address) {
  return {
    address: NOUNS_CONTRACTS.NounsDAOProxy.proxy as Address,
    abi: NounsDAOLogicV3ABI,
    functionName: 'latestProposalIds' as const,
    args: [account] as const,
  };
}

/**
 * Get dynamic quorum parameters at a specific block
 * 
 * @param blockNumber - Block number
 * @returns Query config for wagmi useReadContract
 */
export function getDynamicQuorumParamsAt(blockNumber: bigint) {
  return {
    address: NOUNS_CONTRACTS.NounsDAOProxy.proxy as Address,
    abi: NounsDAOLogicV3ABI,
    functionName: 'getDynamicQuorumParamsAt' as const,
    args: [blockNumber] as const,
  };
}
