/**
 * Proposal Transaction Builders - Client Rewards Operations
 * Build proposal actions for client rewards contract interactions
 */

import { Address } from 'viem';
import { CONTRACTS } from '../constants';
import type { ProposalActions } from '../types';
import { createProposalAction } from '../governance';

/**
 * Build proposal action to set client approval
 * @param clientId - Client ID to approve/disapprove
 * @param approved - Whether to approve or disapprove
 * @returns Proposal action for setting client approval
 */
export function buildSetClientApprovalAction(
  clientId: number,
  approved: boolean
): ProposalActions {
  return createProposalAction(
    CONTRACTS.ClientRewardsProxy.proxy as Address,
    BigInt(0),
    'setClientApproval(uint32,bool)',
    [clientId, approved]
  );
}

/**
 * Build proposal action to approve Berry OS client (Client ID 11)
 * @returns Proposal action to approve Berry OS
 */
export function buildApproveBerryOSClientAction(): ProposalActions {
  return buildSetClientApprovalAction(11, true);
}

/**
 * Build proposal action to set auction reward parameters
 * @param auctionRewardBps - Reward in basis points
 * @param minimumAuctionsBetweenUpdates - Minimum auctions between updates
 * @returns Proposal action for setting auction reward params
 */
export function buildSetAuctionRewardParamsAction(
  auctionRewardBps: number,
  minimumAuctionsBetweenUpdates: number
): ProposalActions {
  return createProposalAction(
    CONTRACTS.ClientRewardsProxy.proxy as Address,
    BigInt(0),
    'setAuctionRewardParams((uint16,uint8))',
    [[auctionRewardBps, minimumAuctionsBetweenUpdates]]
  );
}

/**
 * Build proposal action to set proposal reward parameters
 * @param params - Proposal reward parameters
 * @returns Proposal action for setting proposal reward params
 */
export function buildSetProposalRewardParamsAction(params: {
  minimumRewardPeriod: number;
  numProposalsEnoughForReward: number;
  proposalRewardBps: number;
  votingRewardBps: number;
  proposalEligibilityQuorumBps: number;
}): ProposalActions {
  return createProposalAction(
    CONTRACTS.ClientRewardsProxy.proxy as Address,
    BigInt(0),
    'setProposalRewardParams((uint32,uint8,uint16,uint16,uint16))',
    [[
      params.minimumRewardPeriod,
      params.numProposalsEnoughForReward,
      params.proposalRewardBps,
      params.votingRewardBps,
      params.proposalEligibilityQuorumBps,
    ]]
  );
}

/**
 * Build proposal action to enable auction rewards
 * @returns Proposal action to enable auction rewards
 */
export function buildEnableAuctionRewardsAction(): ProposalActions {
  return createProposalAction(
    CONTRACTS.ClientRewardsProxy.proxy as Address,
    BigInt(0),
    'enableAuctionRewards()',
    []
  );
}

/**
 * Build proposal action to disable auction rewards
 * @returns Proposal action to disable auction rewards
 */
export function buildDisableAuctionRewardsAction(): ProposalActions {
  return createProposalAction(
    CONTRACTS.ClientRewardsProxy.proxy as Address,
    BigInt(0),
    'disableAuctionRewards()',
    []
  );
}

/**
 * Build proposal action to enable proposal rewards
 * @returns Proposal action to enable proposal rewards
 */
export function buildEnableProposalRewardsAction(): ProposalActions {
  return createProposalAction(
    CONTRACTS.ClientRewardsProxy.proxy as Address,
    BigInt(0),
    'enableProposalRewards()',
    []
  );
}

/**
 * Build proposal action to disable proposal rewards
 * @returns Proposal action to disable proposal rewards
 */
export function buildDisableProposalRewardsAction(): ProposalActions {
  return createProposalAction(
    CONTRACTS.ClientRewardsProxy.proxy as Address,
    BigInt(0),
    'disableProposalRewards()',
    []
  );
}

/**
 * Build proposal action to set descriptor for client NFTs
 * @param newDescriptor - Address of new descriptor
 * @returns Proposal action for setting descriptor
 */
export function buildSetClientRewardsDescriptorAction(
  newDescriptor: Address
): ProposalActions {
  return createProposalAction(
    CONTRACTS.ClientRewardsProxy.proxy as Address,
    BigInt(0),
    'setDescriptor(address)',
    [newDescriptor]
  );
}

/**
 * Build proposal action to withdraw token from client rewards
 * @param token - Token address
 * @param to - Recipient address
 * @param amount - Amount to withdraw
 * @returns Proposal action for withdrawing token
 */
export function buildWithdrawTokenFromRewardsAction(
  token: Address,
  to: Address,
  amount: bigint
): ProposalActions {
  return createProposalAction(
    CONTRACTS.ClientRewardsProxy.proxy as Address,
    BigInt(0),
    'withdrawToken(address,address,uint256)',
    [token, to, amount]
  );
}

