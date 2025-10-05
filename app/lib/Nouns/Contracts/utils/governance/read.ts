/**
 * Nouns DAO Governance - Read Functions
 * Pure functions and utilities for reading governance data
 */

import { Address } from 'viem';
import type { ProposalData, ProposalInfo, VoteReceipt } from '../types';
import { PROPOSAL_STATES } from '../constants';
import { formatPercentage } from '../formatting';
import { NOUNS_CONTRACTS } from '../../addresses';
import { NounsDAOLogicV3ABI } from '../../abis';

/**
 * Get proposal state name from state number
 * @param state - Proposal state number
 * @returns Human-readable state name
 */
export function getProposalStateName(state: number): string {
  const stateNames: Record<number, string> = {
    [PROPOSAL_STATES.PENDING]: 'Pending',
    [PROPOSAL_STATES.ACTIVE]: 'Active',
    [PROPOSAL_STATES.CANCELED]: 'Canceled',
    [PROPOSAL_STATES.DEFEATED]: 'Defeated',
    [PROPOSAL_STATES.SUCCEEDED]: 'Succeeded',
    [PROPOSAL_STATES.QUEUED]: 'Queued',
    [PROPOSAL_STATES.EXPIRED]: 'Expired',
    [PROPOSAL_STATES.EXECUTED]: 'Executed',
    [PROPOSAL_STATES.VETOED]: 'Vetoed',
    [PROPOSAL_STATES.OBJECTION_PERIOD]: 'Objection Period',
    [PROPOSAL_STATES.UPDATABLE]: 'Updatable',
  };
  
  return stateNames[state] || 'Unknown';
}

/**
 * Check if proposal is active (can be voted on)
 * @param state - Proposal state number
 * @returns True if proposal is active
 */
export function isProposalActive(state: number): boolean {
  return state === PROPOSAL_STATES.ACTIVE || state === PROPOSAL_STATES.OBJECTION_PERIOD;
}

/**
 * Check if proposal has succeeded
 * @param state - Proposal state number
 * @returns True if proposal succeeded
 */
export function hasProposalSucceeded(state: number): boolean {
  return state === PROPOSAL_STATES.SUCCEEDED || state === PROPOSAL_STATES.QUEUED || state === PROPOSAL_STATES.EXECUTED;
}

/**
 * Check if proposal is executable
 * @param state - Proposal state number
 * @returns True if proposal can be executed
 */
export function isProposalExecutable(state: number): boolean {
  return state === PROPOSAL_STATES.QUEUED;
}

/**
 * Check if proposal is finalized (cannot change state)
 * @param state - Proposal state number
 * @returns True if proposal is in final state
 */
export function isProposalFinalized(state: number): boolean {
  return state === PROPOSAL_STATES.EXECUTED 
    || state === PROPOSAL_STATES.DEFEATED 
    || state === PROPOSAL_STATES.CANCELED 
    || state === PROPOSAL_STATES.VETOED 
    || state === PROPOSAL_STATES.EXPIRED;
}

/**
 * Calculate quorum progress percentage
 * @param forVotes - Votes in favor
 * @param quorumVotes - Required quorum
 * @returns Progress as percentage (0-100+)
 */
export function calculateQuorumProgress(forVotes: bigint, quorumVotes: bigint): number {
  if (quorumVotes === BigInt(0)) return 0;
  return Number((forVotes * BigInt(100)) / quorumVotes);
}

/**
 * Check if proposal has reached quorum
 * @param forVotes - Votes in favor
 * @param quorumVotes - Required quorum
 * @returns True if quorum reached
 */
export function hasReachedQuorum(forVotes: bigint, quorumVotes: bigint): boolean {
  return forVotes >= quorumVotes;
}

/**
 * Calculate vote percentages
 * @param forVotes - Votes in favor
 * @param againstVotes - Votes against
 * @param abstainVotes - Abstain votes
 * @returns Vote percentages for each option
 */
export function calculateVotePercentages(
  forVotes: bigint,
  againstVotes: bigint,
  abstainVotes: bigint
): { for: number; against: number; abstain: number } {
  const totalVotes = forVotes + againstVotes + abstainVotes;
  
  if (totalVotes === BigInt(0)) {
    return { for: 0, against: 0, abstain: 0 };
  }
  
  return {
    for: Number((forVotes * BigInt(10000)) / totalVotes) / 100,
    against: Number((againstVotes * BigInt(10000)) / totalVotes) / 100,
    abstain: Number((abstainVotes * BigInt(10000)) / totalVotes) / 100,
  };
}

/**
 * Check if address can vote on proposal
 * @param hasVoted - Whether address has already voted
 * @param votingPower - Address's voting power
 * @param isActive - Whether proposal is active
 * @returns True if address can vote
 */
export function canVoteOnProposal(
  hasVoted: boolean,
  votingPower: bigint,
  isActive: boolean
): boolean {
  return !hasVoted && votingPower > BigInt(0) && isActive;
}

/**
 * Format proposal info for display
 * @param proposal - Raw proposal data
 * @param state - Current proposal state
 * @returns Formatted proposal information
 */
export function formatProposalInfo(
  proposal: ProposalData,
  state: number
): ProposalInfo {
  const votePercentages = calculateVotePercentages(
    proposal.forVotes,
    proposal.againstVotes,
    proposal.abstainVotes
  );
  
  const quorumProgress = calculateQuorumProgress(
    proposal.forVotes,
    proposal.quorumVotes
  );
  
  return {
    ...proposal,
    state,
    stateName: getProposalStateName(state),
    isActive: isProposalActive(state),
    hasSucceeded: hasProposalSucceeded(state),
    quorumProgress,
    votePercentages,
  };
}

/**
 * Calculate proposal threshold from BPS
 * @param totalSupply - Total Noun supply
 * @param proposalThresholdBPS - Threshold in basis points
 * @returns Proposal threshold in votes
 */
export function calculateProposalThreshold(
  totalSupply: bigint,
  proposalThresholdBPS: number
): bigint {
  return (totalSupply * BigInt(proposalThresholdBPS)) / BigInt(10000);
}

/**
 * Check if address can propose
 * @param votingPower - Address's voting power
 * @param proposalThreshold - Required voting power to propose
 * @returns True if address can propose
 */
export function canPropose(
  votingPower: bigint,
  proposalThreshold: bigint
): boolean {
  return votingPower >= proposalThreshold;
}

/**
 * Calculate dynamic quorum from parameters
 * @param againstVotes - Votes against
 * @param totalSupply - Total Noun supply
 * @param params - Dynamic quorum parameters
 * @returns Required quorum votes
 */
export function calculateDynamicQuorum(
  againstVotes: bigint,
  totalSupply: bigint,
  params: {
    minQuorumVotesBPS: number;
    maxQuorumVotesBPS: number;
    quorumCoefficient: number;
  }
): bigint {
  const againstVotesBPS = (againstVotes * BigInt(10000)) / totalSupply;
  const quorumAdjustmentBPS = (againstVotesBPS * BigInt(params.quorumCoefficient)) / BigInt(1000000);
  
  const minQuorum = BigInt(params.minQuorumVotesBPS);
  const maxQuorum = BigInt(params.maxQuorumVotesBPS);
  
  let quorumBPS = minQuorum + quorumAdjustmentBPS;
  
  if (quorumBPS > maxQuorum) {
    quorumBPS = maxQuorum;
  }
  
  return (totalSupply * quorumBPS) / BigInt(10000);
}

/**
 * Check if proposal is in objection period
 * @param state - Proposal state
 * @returns True if in objection period
 */
export function isInObjectionPeriod(state: number): boolean {
  return state === PROPOSAL_STATES.OBJECTION_PERIOD;
}

/**
 * Parse vote receipt
 * @param receipt - Raw receipt from contract
 * @returns Parsed vote receipt
 */
export function parseVoteReceipt(
  receipt: readonly [boolean, number, bigint]
): VoteReceipt {
  return {
    hasVoted: receipt[0],
    support: receipt[1],
    votes: receipt[2],
  };
}

/**
 * Get vote support name
 * @param support - Vote support number (0=Against, 1=For, 2=Abstain)
 * @returns Human-readable support name
 */
export function getVoteSupportName(support: number): string {
  const supportNames: Record<number, string> = {
    0: 'Against',
    1: 'For',
    2: 'Abstain',
  };
  
  return supportNames[support] || 'Unknown';
}

// ============================================================================
// CONTRACT READ FUNCTIONS (for useReadContract)
// ============================================================================

/**
 * Get proposal state
 * @param proposalId Proposal ID
 */
export function getProposalState(proposalId: bigint) {
  return {
    address: NOUNS_CONTRACTS.NounsDAOProxy.proxy as Address,
    abi: NounsDAOLogicV3ABI,
    functionName: 'state',
    args: [proposalId]
  } as const;
}

/**
 * Get full proposal details
 * @param proposalId Proposal ID
 */
export function getProposalDetails(proposalId: bigint) {
  return {
    address: NOUNS_CONTRACTS.NounsDAOProxy.proxy as Address,
    abi: NounsDAOLogicV3ABI,
    functionName: 'proposals',
    args: [proposalId]
  } as const;
}

/**
 * Get proposal votes
 * @param proposalId Proposal ID
 */
export function getProposalVotes(proposalId: bigint) {
  return {
    address: NOUNS_CONTRACTS.NounsDAOProxy.proxy as Address,
    abi: NounsDAOLogicV3ABI,
    functionName: 'proposalVotes',
    args: [proposalId]
  } as const;
}

/**
 * Get voting power (current votes) for an address
 * @param account Address to check
 */
export function getVotingPower(account: Address) {
  return {
    address: NOUNS_CONTRACTS.NounsToken.address as Address,
    abi: NounsDAOLogicV3ABI,
    functionName: 'getCurrentVotes',
    args: [account]
  } as const;
}

/**
 * Get quorum votes required for a proposal
 * @param proposalId Proposal ID
 */
export function getQuorumVotes(proposalId: bigint) {
  return {
    address: NOUNS_CONTRACTS.NounsDAOProxy.proxy as Address,
    abi: NounsDAOLogicV3ABI,
    functionName: 'quorumVotes',
    args: [proposalId]
  } as const;
}

/**
 * Check if an address has voted on a proposal
 * @param proposalId Proposal ID
 * @param voter Voter address
 */
export function hasVoted(proposalId: bigint, voter: Address) {
  return {
    address: NOUNS_CONTRACTS.NounsDAOProxy.proxy as Address,
    abi: NounsDAOLogicV3ABI,
    functionName: 'getReceipt',
    args: [proposalId, voter]
  } as const;
}

/**
 * Get proposal threshold (votes needed to propose)
 */
export function getProposalThreshold() {
  return {
    address: NOUNS_CONTRACTS.NounsDAOProxy.proxy as Address,
    abi: NounsDAOLogicV3ABI,
    functionName: 'proposalThreshold'
  } as const;
}

/**
 * Get fork threshold (tokens needed to fork)
 */
export function getForkThreshold() {
  return {
    address: NOUNS_CONTRACTS.NounsDAOProxy.proxy as Address,
    abi: NounsDAOLogicV3ABI,
    functionName: 'forkThreshold'
  } as const;
}

/**
 * Get fork end timestamp
 */
export function getForkEndTimestamp() {
  return {
    address: NOUNS_CONTRACTS.NounsDAOProxy.proxy as Address,
    abi: NounsDAOLogicV3ABI,
    functionName: 'forkEndTimestamp'
  } as const;
}

/**
 * Get dynamic quorum parameters
 * @param blockNumber Optional block number
 */
export function getDynamicQuorumParams(blockNumber?: bigint) {
  return {
    address: NOUNS_CONTRACTS.NounsDAOProxy.proxy as Address,
    abi: NounsDAOLogicV3ABI,
    functionName: 'getDynamicQuorumParamsAt',
    args: blockNumber ? [blockNumber] : undefined
  } as const;
}

/**
 * Get voting delay (blocks before voting starts)
 */
export function getVotingDelay() {
  return {
    address: NOUNS_CONTRACTS.NounsDAOProxy.proxy as Address,
    abi: NounsDAOLogicV3ABI,
    functionName: 'votingDelay'
  } as const;
}

/**
 * Get voting period (blocks for voting)
 */
export function getVotingPeriod() {
  return {
    address: NOUNS_CONTRACTS.NounsDAOProxy.proxy as Address,
    abi: NounsDAOLogicV3ABI,
    functionName: 'votingPeriod'
  } as const;
}

/**
 * Get proposal count
 */
export function getProposalCount() {
  return {
    address: NOUNS_CONTRACTS.NounsDAOProxy.proxy as Address,
    abi: NounsDAOLogicV3ABI,
    functionName: 'proposalCount'
  } as const;
}

