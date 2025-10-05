/**
 * Nouns DAO Admin - Write Functions
 * Contract: 0xd7c7c3c447Df757a77C81FcFf07f10bB22d98f4a
 * 
 * Admin functions to configure DAO parameters. Requires admin privileges.
 */

import { Address } from 'viem';

const DAO_ADMIN_ADDRESS = '0xd7c7c3c447Df757a77C81FcFf07f10bB22d98f4a' as const;

// ============================================================================
// Admin Management
// ============================================================================

/**
 * Set a new admin address
 * @param newAdmin Address of the new admin
 * 
 * Access: Admin only
 * Effects: Changes admin address immediately
 */
export function prepareSetAdmin(newAdmin: Address) {
  return {
    address: DAO_ADMIN_ADDRESS,
    abi: [{
      inputs: [{ name: 'newAdmin', type: 'address' }],
      name: 'setAdmin',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    }],
    functionName: 'setAdmin',
    args: [newAdmin]
  } as const;
}

/**
 * Set a pending admin (two-step transfer pattern)
 * @param newPendingAdmin Address of the pending admin
 * 
 * Access: Admin only
 * Effects: Sets pending admin, who must accept to become admin
 */
export function prepareSetPendingAdmin(newPendingAdmin: Address) {
  return {
    address: DAO_ADMIN_ADDRESS,
    abi: [{
      inputs: [{ name: 'newPendingAdmin', type: 'address' }],
      name: 'setPendingAdmin',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    }],
    functionName: 'setPendingAdmin',
    args: [newPendingAdmin]
  } as const;
}

/**
 * Accept admin role (called by pending admin)
 * 
 * Access: Pending admin only
 * Effects: Caller becomes the new admin
 */
export function prepareAcceptAdmin() {
  return {
    address: DAO_ADMIN_ADDRESS,
    abi: [{
      inputs: [],
      name: 'acceptAdmin',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    }],
    functionName: 'acceptAdmin'
  } as const;
}

// ============================================================================
// Vetoer Management
// ============================================================================

/**
 * Set a new vetoer address
 * @param newVetoer Address of the new vetoer
 * 
 * Access: Vetoer only
 * Effects: Changes vetoer address immediately
 */
export function prepareSetVetoer(newVetoer: Address) {
  return {
    address: DAO_ADMIN_ADDRESS,
    abi: [{
      inputs: [{ name: 'newVetoer', type: 'address' }],
      name: 'setVetoer',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    }],
    functionName: 'setVetoer',
    args: [newVetoer]
  } as const;
}

/**
 * Set a pending vetoer (two-step transfer pattern)
 * @param newPendingVetoer Address of the pending vetoer
 * 
 * Access: Vetoer only
 * Effects: Sets pending vetoer, who must accept to become vetoer
 */
export function prepareSetPendingVetoer(newPendingVetoer: Address) {
  return {
    address: DAO_ADMIN_ADDRESS,
    abi: [{
      inputs: [{ name: 'newPendingVetoer', type: 'address' }],
      name: 'setPendingVetoer',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    }],
    functionName: 'setPendingVetoer',
    args: [newPendingVetoer]
  } as const;
}

/**
 * Accept vetoer role (called by pending vetoer)
 * 
 * Access: Pending vetoer only
 * Effects: Caller becomes the new vetoer
 */
export function prepareAcceptVetoer() {
  return {
    address: DAO_ADMIN_ADDRESS,
    abi: [{
      inputs: [],
      name: 'acceptVetoer',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    }],
    functionName: 'acceptVetoer'
  } as const;
}

// ============================================================================
// Voting Configuration
// ============================================================================

/**
 * Set voting delay (blocks before voting starts after proposal creation)
 * @param newVotingDelay Delay in blocks
 * 
 * Access: Admin only
 * Constraints: MIN_VOTING_DELAY_BLOCKS <= newVotingDelay <= MAX_VOTING_DELAY_BLOCKS
 */
export function prepareSetVotingDelay(newVotingDelay: bigint) {
  return {
    address: DAO_ADMIN_ADDRESS,
    abi: [{
      inputs: [{ name: 'newVotingDelay', type: 'uint256' }],
      name: 'setVotingDelay',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    }],
    functionName: 'setVotingDelay',
    args: [newVotingDelay]
  } as const;
}

/**
 * Set voting period (blocks for voting)
 * @param newVotingPeriod Period in blocks
 * 
 * Access: Admin only
 * Constraints: MIN_VOTING_PERIOD_BLOCKS <= newVotingPeriod <= MAX_VOTING_PERIOD_BLOCKS
 */
export function prepareSetVotingPeriod(newVotingPeriod: bigint) {
  return {
    address: DAO_ADMIN_ADDRESS,
    abi: [{
      inputs: [{ name: 'newVotingPeriod', type: 'uint256' }],
      name: 'setVotingPeriod',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    }],
    functionName: 'setVotingPeriod',
    args: [newVotingPeriod]
  } as const;
}

/**
 * Set proposal threshold (BPS of total supply needed to propose)
 * @param newProposalThresholdBPS Threshold in basis points
 * 
 * Access: Admin only
 * Constraints: MIN_PROPOSAL_THRESHOLD_BPS <= newProposalThresholdBPS <= MAX_PROPOSAL_THRESHOLD_BPS
 */
export function prepareSetProposalThresholdBPS(newProposalThresholdBPS: bigint) {
  return {
    address: DAO_ADMIN_ADDRESS,
    abi: [{
      inputs: [{ name: 'newProposalThresholdBPS', type: 'uint256' }],
      name: 'setProposalThresholdBPS',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    }],
    functionName: 'setProposalThresholdBPS',
    args: [newProposalThresholdBPS]
  } as const;
}

/**
 * Set objection period duration (blocks for objections after proposal succeeds)
 * @param newObjectionPeriodDurationInBlocks Duration in blocks
 * 
 * Access: Admin only
 * Constraints: newObjectionPeriodDurationInBlocks <= MAX_OBJECTION_PERIOD_BLOCKS
 */
export function prepareSetObjectionPeriodDuration(newObjectionPeriodDurationInBlocks: number) {
  return {
    address: DAO_ADMIN_ADDRESS,
    abi: [{
      inputs: [{ name: 'newObjectionPeriodDurationInBlocks', type: 'uint32' }],
      name: 'setObjectionPeriodDuration',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    }],
    functionName: 'setObjectionPeriodDuration',
    args: [newObjectionPeriodDurationInBlocks]
  } as const;
}

/**
 * Set proposal updatable period (blocks during which proposer can update)
 * @param newProposalUpdatablePeriodInBlocks Period in blocks
 * 
 * Access: Admin only
 * Constraints: newProposalUpdatablePeriodInBlocks <= MAX_UPDATABLE_PERIOD_BLOCKS
 */
export function prepareSetProposalUpdatablePeriod(newProposalUpdatablePeriodInBlocks: number) {
  return {
    address: DAO_ADMIN_ADDRESS,
    abi: [{
      inputs: [{ name: 'newProposalUpdatablePeriodInBlocks', type: 'uint32' }],
      name: 'setProposalUpdatablePeriod',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    }],
    functionName: 'setProposalUpdatablePeriod',
    args: [newProposalUpdatablePeriodInBlocks]
  } as const;
}

/**
 * Set last minute window (blocks at end of voting where vote extension can trigger)
 * @param newLastMinuteWindowInBlocks Window in blocks
 * 
 * Access: Admin only
 */
export function prepareSetLastMinuteWindow(newLastMinuteWindowInBlocks: number) {
  return {
    address: DAO_ADMIN_ADDRESS,
    abi: [{
      inputs: [{ name: 'newLastMinuteWindowInBlocks', type: 'uint32' }],
      name: 'setLastMinuteWindow',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    }],
    functionName: 'setLastMinuteWindow',
    args: [newLastMinuteWindowInBlocks]
  } as const;
}

// ============================================================================
// Quorum Configuration (Dynamic Quorum)
// ============================================================================

/**
 * Set minimum quorum votes BPS
 * @param newMinQuorumVotesBPS Minimum quorum in basis points
 * 
 * Access: Admin only
 * Constraints: Must be less than maxQuorumVotesBPS and within bounds
 */
export function prepareSetMinQuorumVotesBPS(newMinQuorumVotesBPS: number) {
  return {
    address: DAO_ADMIN_ADDRESS,
    abi: [{
      inputs: [{ name: 'newMinQuorumVotesBPS', type: 'uint16' }],
      name: 'setMinQuorumVotesBPS',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    }],
    functionName: 'setMinQuorumVotesBPS',
    args: [newMinQuorumVotesBPS]
  } as const;
}

/**
 * Set maximum quorum votes BPS
 * @param newMaxQuorumVotesBPS Maximum quorum in basis points
 * 
 * Access: Admin only
 * Constraints: Must be greater than minQuorumVotesBPS and within bounds
 */
export function prepareSetMaxQuorumVotesBPS(newMaxQuorumVotesBPS: number) {
  return {
    address: DAO_ADMIN_ADDRESS,
    abi: [{
      inputs: [{ name: 'newMaxQuorumVotesBPS', type: 'uint16' }],
      name: 'setMaxQuorumVotesBPS',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    }],
    functionName: 'setMaxQuorumVotesBPS',
    args: [newMaxQuorumVotesBPS]
  } as const;
}

/**
 * Set quorum coefficient (affects dynamic quorum calculation)
 * @param newQuorumCoefficient Coefficient value
 * 
 * Access: Admin only
 */
export function prepareSetQuorumCoefficient(newQuorumCoefficient: number) {
  return {
    address: DAO_ADMIN_ADDRESS,
    abi: [{
      inputs: [{ name: 'newQuorumCoefficient', type: 'uint32' }],
      name: 'setQuorumCoefficient',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    }],
    functionName: 'setQuorumCoefficient',
    args: [newQuorumCoefficient]
  } as const;
}

// ============================================================================
// Fork Configuration
// ============================================================================

/**
 * Set fork period (seconds users have to join a fork)
 * @param newForkPeriod Period in seconds
 * 
 * Access: Admin only
 * Constraints: MIN_FORK_PERIOD <= newForkPeriod <= MAX_FORK_PERIOD
 */
export function prepareSetForkPeriod(newForkPeriod: bigint) {
  return {
    address: DAO_ADMIN_ADDRESS,
    abi: [{
      inputs: [{ name: 'newForkPeriod', type: 'uint256' }],
      name: 'setForkPeriod',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    }],
    functionName: 'setForkPeriod',
    args: [newForkPeriod]
  } as const;
}

/**
 * Set fork threshold (number of tokens needed to trigger a fork)
 * @param newForkThreshold Threshold in tokens
 * 
 * Access: Admin only
 */
export function prepareSetForkThreshold(newForkThreshold: bigint) {
  return {
    address: DAO_ADMIN_ADDRESS,
    abi: [{
      inputs: [{ name: 'newForkThreshold', type: 'uint256' }],
      name: 'setForkThreshold',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    }],
    functionName: 'setForkThreshold',
    args: [newForkThreshold]
  } as const;
}

/**
 * Set fork escrow address
 * @param newForkEscrow Address of the fork escrow contract
 * 
 * Access: Admin only
 */
export function prepareSetForkEscrow(newForkEscrow: Address) {
  return {
    address: DAO_ADMIN_ADDRESS,
    abi: [{
      inputs: [{ name: 'newForkEscrow', type: 'address' }],
      name: 'setForkEscrow',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    }],
    functionName: 'setForkEscrow',
    args: [newForkEscrow]
  } as const;
}

/**
 * Set fork DAO deployer address
 * @param newForkDAODeployer Address of the fork DAO deployer contract
 * 
 * Access: Admin only
 */
export function prepareSetForkDAODeployer(newForkDAODeployer: Address) {
  return {
    address: DAO_ADMIN_ADDRESS,
    abi: [{
      inputs: [{ name: 'newForkDAODeployer', type: 'address' }],
      name: 'setForkDAODeployer',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    }],
    functionName: 'setForkDAODeployer',
    args: [newForkDAODeployer]
  } as const;
}

/**
 * Set ERC20 tokens to include in fork
 * @param newErc20Tokens Array of token addresses to include
 * 
 * Access: Admin only
 * Effects: Sets which ERC20 tokens are transferred when a fork occurs
 */
export function prepareSetERC20TokensToIncludeInFork(newErc20Tokens: Address[]) {
  return {
    address: DAO_ADMIN_ADDRESS,
    abi: [{
      inputs: [{ name: 'newErc20Tokens', type: 'address[]' }],
      name: 'setERC20TokensToIncludeInFork',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    }],
    functionName: 'setERC20TokensToIncludeInFork',
    args: [newErc20Tokens]
  } as const;
}

// ============================================================================
// Timelock Configuration
// ============================================================================

/**
 * Set timelock addresses and admin
 * @param timelock Address of the main timelock
 * @param timelockV1 Address of the V1 timelock (for backwards compatibility)
 * @param admin Address of the admin
 * 
 * Access: Admin only
 */
export function prepareSetTimelocksAndAdmin(
  timelock: Address,
  timelockV1: Address,
  admin: Address
) {
  return {
    address: DAO_ADMIN_ADDRESS,
    abi: [{
      inputs: [
        { name: 'timelock', type: 'address' },
        { name: 'timelockV1', type: 'address' },
        { name: 'admin', type: 'address' }
      ],
      name: 'setTimelocksAndAdmin',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    }],
    functionName: 'setTimelocksAndAdmin',
    args: [timelock, timelockV1, admin]
  } as const;
}

// ============================================================================
// Treasury Management
// ============================================================================

/**
 * Withdraw ETH from the admin contract
 * 
 * Access: Admin only
 * Effects: Sends all ETH balance to admin
 */
export function prepareWithdraw() {
  return {
    address: DAO_ADMIN_ADDRESS,
    abi: [{
      inputs: [],
      name: 'withdraw',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    }],
    functionName: 'withdraw'
  } as const;
}

// ============================================================================
// Parameter Validation Helpers
// ============================================================================

/**
 * Validate voting configuration parameters
 */
export interface VotingConfig {
  votingDelay?: bigint;
  votingPeriod?: bigint;
  proposalThresholdBPS?: bigint;
  objectionPeriodBlocks?: number;
  updatablePeriodBlocks?: number;
  lastMinuteWindowBlocks?: number;
}

/**
 * Validate quorum configuration parameters
 */
export interface QuorumConfig {
  minQuorumVotesBPS: number;
  maxQuorumVotesBPS: number;
  quorumCoefficient?: number;
}

/**
 * Validate fork configuration parameters
 */
export interface ForkConfig {
  forkPeriod?: bigint;
  forkThreshold?: bigint;
  forkEscrow?: Address;
  forkDAODeployer?: Address;
  erc20TokensToInclude?: Address[];
}

