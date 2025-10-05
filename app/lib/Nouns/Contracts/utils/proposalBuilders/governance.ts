/**
 * Proposal Transaction Builders - Governance Operations
 * Build proposal actions for DAO governance parameter changes
 */

import { Address } from 'viem';
import { CONTRACTS } from '../constants';
import type { ProposalActions } from '../types';
import { createProposalAction, combineProposalActions } from '../governance';

/**
 * Build proposal action to set voting delay
 * @param newVotingDelay - New voting delay in blocks
 * @returns Proposal action for setting voting delay
 */
export function buildSetVotingDelayAction(
  newVotingDelay: bigint
): ProposalActions {
  return createProposalAction(
    CONTRACTS.NounsDAOProxy.proxy as Address,
    BigInt(0),
    '_setVotingDelay(uint256)',
    [newVotingDelay]
  );
}

/**
 * Build proposal action to set voting period
 * @param newVotingPeriod - New voting period in blocks
 * @returns Proposal action for setting voting period
 */
export function buildSetVotingPeriodAction(
  newVotingPeriod: bigint
): ProposalActions {
  return createProposalAction(
    CONTRACTS.NounsDAOProxy.proxy as Address,
    BigInt(0),
    '_setVotingPeriod(uint256)',
    [newVotingPeriod]
  );
}

/**
 * Build proposal action to set proposal threshold (BPS)
 * @param newProposalThresholdBPS - New threshold in basis points
 * @returns Proposal action for setting proposal threshold
 */
export function buildSetProposalThresholdBPSAction(
  newProposalThresholdBPS: bigint
): ProposalActions {
  return createProposalAction(
    CONTRACTS.NounsDAOProxy.proxy as Address,
    BigInt(0),
    '_setProposalThresholdBPS(uint256)',
    [newProposalThresholdBPS]
  );
}

/**
 * Build proposal action to set minimum quorum votes (BPS)
 * @param newMinQuorumVotesBPS - New minimum quorum in basis points
 * @returns Proposal action for setting min quorum
 */
export function buildSetMinQuorumVotesBPSAction(
  newMinQuorumVotesBPS: bigint
): ProposalActions {
  return createProposalAction(
    CONTRACTS.NounsDAOProxy.proxy as Address,
    BigInt(0),
    '_setMinQuorumVotesBPS(uint256)',
    [newMinQuorumVotesBPS]
  );
}

/**
 * Build proposal action to set maximum quorum votes (BPS)
 * @param newMaxQuorumVotesBPS - New maximum quorum in basis points
 * @returns Proposal action for setting max quorum
 */
export function buildSetMaxQuorumVotesBPSAction(
  newMaxQuorumVotesBPS: bigint
): ProposalActions {
  return createProposalAction(
    CONTRACTS.NounsDAOProxy.proxy as Address,
    BigInt(0),
    '_setMaxQuorumVotesBPS(uint256)',
    [newMaxQuorumVotesBPS]
  );
}

/**
 * Build proposal action to set quorum coefficient
 * @param newQuorumCoefficient - New quorum coefficient (in 1e6 precision)
 * @returns Proposal action for setting quorum coefficient
 */
export function buildSetQuorumCoefficientAction(
  newQuorumCoefficient: bigint
): ProposalActions {
  return createProposalAction(
    CONTRACTS.NounsDAOProxy.proxy as Address,
    BigInt(0),
    '_setQuorumCoefficient(uint32)',
    [newQuorumCoefficient]
  );
}

/**
 * Build proposal action to set dynamic quorum parameters
 * @param minQuorumVotesBPS - Minimum quorum in BPS
 * @param maxQuorumVotesBPS - Maximum quorum in BPS
 * @param quorumCoefficient - Quorum coefficient
 * @returns Proposal action for setting all dynamic quorum params
 */
export function buildSetDynamicQuorumParamsAction(
  minQuorumVotesBPS: number,
  maxQuorumVotesBPS: number,
  quorumCoefficient: bigint
): ProposalActions {
  return createProposalAction(
    CONTRACTS.NounsDAOProxy.proxy as Address,
    BigInt(0),
    '_setDynamicQuorumParams(uint16,uint16,uint32)',
    [minQuorumVotesBPS, maxQuorumVotesBPS, quorumCoefficient]
  );
}

/**
 * Build proposal action to set objection period duration in blocks
 * @param newObjectionPeriodDurationInBlocks - Duration in blocks
 * @returns Proposal action for setting objection period
 */
export function buildSetObjectionPeriodDurationAction(
  newObjectionPeriodDurationInBlocks: bigint
): ProposalActions {
  return createProposalAction(
    CONTRACTS.NounsDAOProxy.proxy as Address,
    BigInt(0),
    '_setObjectionPeriodDurationInBlocks(uint32)',
    [newObjectionPeriodDurationInBlocks]
  );
}

/**
 * Build proposal action to set proposal updatable period in blocks
 * @param newProposalUpdatablePeriodInBlocks - Duration in blocks
 * @returns Proposal action for setting updatable period
 */
export function buildSetProposalUpdatablePeriodAction(
  newProposalUpdatablePeriodInBlocks: bigint
): ProposalActions {
  return createProposalAction(
    CONTRACTS.NounsDAOProxy.proxy as Address,
    BigInt(0),
    '_setProposalUpdatablePeriodInBlocks(uint32)',
    [newProposalUpdatablePeriodInBlocks]
  );
}

/**
 * Build proposal action to withdraw DAO funds from escrow
 * @param tokenIds - Array of Noun token IDs to withdraw
 * @param to - Address to send Nouns to
 * @returns Proposal action for withdrawing from escrow
 */
export function buildWithdrawFromEscrowAction(
  tokenIds: bigint[],
  to: Address
): ProposalActions {
  return createProposalAction(
    CONTRACTS.ForkEscrow.address as Address,
    BigInt(0),
    'withdrawTokens(uint256[],address)',
    [tokenIds, to]
  );
}

/**
 * Build comprehensive governance update (multiple parameters)
 * @param params - Object with governance parameters to update
 * @returns Combined proposal actions for all updates
 */
export function buildGovernanceUpdateAction(params: {
  votingDelay?: bigint;
  votingPeriod?: bigint;
  proposalThresholdBPS?: bigint;
  minQuorumVotesBPS?: bigint;
  maxQuorumVotesBPS?: bigint;
  quorumCoefficient?: bigint;
  objectionPeriodDuration?: bigint;
}): ProposalActions {
  const actions: ProposalActions[] = [];
  
  if (params.votingDelay !== undefined) {
    actions.push(buildSetVotingDelayAction(params.votingDelay));
  }
  if (params.votingPeriod !== undefined) {
    actions.push(buildSetVotingPeriodAction(params.votingPeriod));
  }
  if (params.proposalThresholdBPS !== undefined) {
    actions.push(buildSetProposalThresholdBPSAction(params.proposalThresholdBPS));
  }
  if (params.minQuorumVotesBPS !== undefined) {
    actions.push(buildSetMinQuorumVotesBPSAction(params.minQuorumVotesBPS));
  }
  if (params.maxQuorumVotesBPS !== undefined) {
    actions.push(buildSetMaxQuorumVotesBPSAction(params.maxQuorumVotesBPS));
  }
  if (params.quorumCoefficient !== undefined) {
    actions.push(buildSetQuorumCoefficientAction(params.quorumCoefficient));
  }
  if (params.objectionPeriodDuration !== undefined) {
    actions.push(buildSetObjectionPeriodDurationAction(params.objectionPeriodDuration));
  }
  
  return combineProposalActions(actions);
}

