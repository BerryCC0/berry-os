/**
 * Nouns DAO Admin - Read Functions
 * Contract: 0xd7c7c3c447Df757a77C81FcFf07f10bB22d98f4a
 * 
 * Manages DAO configuration parameters, thresholds, and admin controls.
 */

import { Address } from 'viem';

const DAO_ADMIN_ADDRESS = '0xd7c7c3c447Df757a77C81FcFf07f10bB22d98f4a' as const;

// ============================================================================
// Constants & Configuration Limits
// ============================================================================

/**
 * Get maximum allowed fork period (in seconds)
 */
export function getMaxForkPeriod() {
  return {
    address: DAO_ADMIN_ADDRESS,
    abi: [{
      inputs: [],
      name: 'MAX_FORK_PERIOD',
      outputs: [{ type: 'uint256' }],
      stateMutability: 'view',
      type: 'function'
    }],
    functionName: 'MAX_FORK_PERIOD'
  } as const;
}

/**
 * Get minimum allowed fork period (in seconds)
 */
export function getMinForkPeriod() {
  return {
    address: DAO_ADMIN_ADDRESS,
    abi: [{
      inputs: [],
      name: 'MIN_FORK_PERIOD',
      outputs: [{ type: 'uint256' }],
      stateMutability: 'view',
      type: 'function'
    }],
    functionName: 'MIN_FORK_PERIOD'
  } as const;
}

/**
 * Get maximum objection period in blocks
 */
export function getMaxObjectionPeriodBlocks() {
  return {
    address: DAO_ADMIN_ADDRESS,
    abi: [{
      inputs: [],
      name: 'MAX_OBJECTION_PERIOD_BLOCKS',
      outputs: [{ type: 'uint256' }],
      stateMutability: 'view',
      type: 'function'
    }],
    functionName: 'MAX_OBJECTION_PERIOD_BLOCKS'
  } as const;
}

/**
 * Get maximum proposal updatable period in blocks
 */
export function getMaxUpdatablePeriodBlocks() {
  return {
    address: DAO_ADMIN_ADDRESS,
    abi: [{
      inputs: [],
      name: 'MAX_UPDATABLE_PERIOD_BLOCKS',
      outputs: [{ type: 'uint256' }],
      stateMutability: 'view',
      type: 'function'
    }],
    functionName: 'MAX_UPDATABLE_PERIOD_BLOCKS'
  } as const;
}

/**
 * Get maximum voting delay in blocks
 */
export function getMaxVotingDelayBlocks() {
  return {
    address: DAO_ADMIN_ADDRESS,
    abi: [{
      inputs: [],
      name: 'MAX_VOTING_DELAY_BLOCKS',
      outputs: [{ type: 'uint256' }],
      stateMutability: 'view',
      type: 'function'
    }],
    functionName: 'MAX_VOTING_DELAY_BLOCKS'
  } as const;
}

/**
 * Get minimum voting delay in blocks
 */
export function getMinVotingDelayBlocks() {
  return {
    address: DAO_ADMIN_ADDRESS,
    abi: [{
      inputs: [],
      name: 'MIN_VOTING_DELAY_BLOCKS',
      outputs: [{ type: 'uint256' }],
      stateMutability: 'view',
      type: 'function'
    }],
    functionName: 'MIN_VOTING_DELAY_BLOCKS'
  } as const;
}

/**
 * Get maximum voting period in blocks
 */
export function getMaxVotingPeriodBlocks() {
  return {
    address: DAO_ADMIN_ADDRESS,
    abi: [{
      inputs: [],
      name: 'MAX_VOTING_PERIOD_BLOCKS',
      outputs: [{ type: 'uint256' }],
      stateMutability: 'view',
      type: 'function'
    }],
    functionName: 'MAX_VOTING_PERIOD_BLOCKS'
  } as const;
}

/**
 * Get minimum voting period in blocks
 */
export function getMinVotingPeriodBlocks() {
  return {
    address: DAO_ADMIN_ADDRESS,
    abi: [{
      inputs: [],
      name: 'MIN_VOTING_PERIOD_BLOCKS',
      outputs: [{ type: 'uint256' }],
      stateMutability: 'view',
      type: 'function'
    }],
    functionName: 'MIN_VOTING_PERIOD_BLOCKS'
  } as const;
}

/**
 * Get maximum proposal threshold BPS
 */
export function getMaxProposalThresholdBPS() {
  return {
    address: DAO_ADMIN_ADDRESS,
    abi: [{
      inputs: [],
      name: 'MAX_PROPOSAL_THRESHOLD_BPS',
      outputs: [{ type: 'uint256' }],
      stateMutability: 'view',
      type: 'function'
    }],
    functionName: 'MAX_PROPOSAL_THRESHOLD_BPS'
  } as const;
}

/**
 * Get minimum proposal threshold BPS
 */
export function getMinProposalThresholdBPS() {
  return {
    address: DAO_ADMIN_ADDRESS,
    abi: [{
      inputs: [],
      name: 'MIN_PROPOSAL_THRESHOLD_BPS',
      outputs: [{ type: 'uint256' }],
      stateMutability: 'view',
      type: 'function'
    }],
    functionName: 'MIN_PROPOSAL_THRESHOLD_BPS'
  } as const;
}

/**
 * Get maximum quorum votes BPS upper bound
 */
export function getMaxQuorumVotesBPSUpperBound() {
  return {
    address: DAO_ADMIN_ADDRESS,
    abi: [{
      inputs: [],
      name: 'MAX_QUORUM_VOTES_BPS_UPPER_BOUND',
      outputs: [{ type: 'uint256' }],
      stateMutability: 'view',
      type: 'function'
    }],
    functionName: 'MAX_QUORUM_VOTES_BPS_UPPER_BOUND'
  } as const;
}

/**
 * Get minimum quorum votes BPS lower bound
 */
export function getMinQuorumVotesBPSLowerBound() {
  return {
    address: DAO_ADMIN_ADDRESS,
    abi: [{
      inputs: [],
      name: 'MIN_QUORUM_VOTES_BPS_LOWER_BOUND',
      outputs: [{ type: 'uint256' }],
      stateMutability: 'view',
      type: 'function'
    }],
    functionName: 'MIN_QUORUM_VOTES_BPS_LOWER_BOUND'
  } as const;
}

/**
 * Get minimum quorum votes BPS upper bound
 */
export function getMinQuorumVotesBPSUpperBound() {
  return {
    address: DAO_ADMIN_ADDRESS,
    abi: [{
      inputs: [],
      name: 'MIN_QUORUM_VOTES_BPS_UPPER_BOUND',
      outputs: [{ type: 'uint256' }],
      stateMutability: 'view',
      type: 'function'
    }],
    functionName: 'MIN_QUORUM_VOTES_BPS_UPPER_BOUND'
  } as const;
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Check if a fork period value is valid
 */
export function isValidForkPeriod(period: bigint, maxPeriod: bigint, minPeriod: bigint): boolean {
  return period >= minPeriod && period <= maxPeriod;
}

/**
 * Check if a voting delay value is valid
 */
export function isValidVotingDelay(delay: bigint, maxDelay: bigint, minDelay: bigint): boolean {
  return delay >= minDelay && delay <= maxDelay;
}

/**
 * Check if a voting period value is valid
 */
export function isValidVotingPeriod(period: bigint, maxPeriod: bigint, minPeriod: bigint): boolean {
  return period >= minPeriod && period <= maxPeriod;
}

/**
 * Check if a proposal threshold BPS is valid
 */
export function isValidProposalThresholdBPS(bps: bigint, maxBPS: bigint, minBPS: bigint): boolean {
  return bps >= minBPS && bps <= maxBPS;
}

/**
 * Check if quorum votes BPS values are valid (min < max)
 */
export function isValidQuorumBPS(
  minBPS: number,
  maxBPS: number,
  lowerBound: bigint,
  upperBound: bigint
): boolean {
  if (minBPS >= maxBPS) return false;
  const minBPSBigInt = BigInt(minBPS);
  const maxBPSBigInt = BigInt(maxBPS);
  return minBPSBigInt >= lowerBound && maxBPSBigInt <= upperBound;
}

// ============================================================================
// Formatting Helpers
// ============================================================================

/**
 * Format BPS (basis points) as percentage
 * @example formatBPS(100) => "1.00%"
 */
export function formatBPS(bps: bigint): string {
  const percentage = Number(bps) / 100;
  return `${percentage.toFixed(2)}%`;
}

/**
 * Format blocks as approximate time
 * @param blocks Number of blocks
 * @param secondsPerBlock Average seconds per block (default 12 for Ethereum)
 */
export function formatBlocksAsTime(blocks: bigint, secondsPerBlock: number = 12): string {
  const totalSeconds = Number(blocks) * secondsPerBlock;
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (days > 0) {
    return `~${days}d ${hours}h`;
  } else if (hours > 0) {
    return `~${hours}h ${minutes}m`;
  } else {
    return `~${minutes}m`;
  }
}

/**
 * Format fork period (seconds) as readable duration
 */
export function formatForkPeriod(seconds: bigint): string {
  const totalSeconds = Number(seconds);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);

  if (days > 0) {
    return `${days} days ${hours} hours`;
  } else {
    return `${hours} hours`;
  }
}

// ============================================================================
// Configuration Summary
// ============================================================================

/**
 * Helper to fetch and format all configuration limits
 */
export interface DAOConfigLimits {
  forkPeriod: { min: bigint; max: bigint };
  votingDelay: { min: bigint; max: bigint };
  votingPeriod: { min: bigint; max: bigint };
  proposalThresholdBPS: { min: bigint; max: bigint };
  quorumVotesBPS: { lowerBound: bigint; upperBound: bigint };
  objectionPeriodBlocks: { max: bigint };
  updatablePeriodBlocks: { max: bigint };
}

/**
 * Get all DAO configuration limits at once
 * (Call this with multicall for efficiency)
 */
export function getAllConfigLimitsQueries() {
  return {
    minForkPeriod: getMinForkPeriod(),
    maxForkPeriod: getMaxForkPeriod(),
    minVotingDelay: getMinVotingDelayBlocks(),
    maxVotingDelay: getMaxVotingDelayBlocks(),
    minVotingPeriod: getMinVotingPeriodBlocks(),
    maxVotingPeriod: getMaxVotingPeriodBlocks(),
    minProposalThresholdBPS: getMinProposalThresholdBPS(),
    maxProposalThresholdBPS: getMaxProposalThresholdBPS(),
    minQuorumBPSLower: getMinQuorumVotesBPSLowerBound(),
    minQuorumBPSUpper: getMinQuorumVotesBPSUpperBound(),
    maxQuorumBPSUpper: getMaxQuorumVotesBPSUpperBound(),
    maxObjectionPeriod: getMaxObjectionPeriodBlocks(),
    maxUpdatablePeriod: getMaxUpdatablePeriodBlocks()
  };
}

