/**
 * Client Rewards - Write Functions
 * Transaction builders for client rewards operations
 */

import { Address } from 'viem';
import { ClientRewardsABI } from '../../abis';
import { NOUNS_CONTRACTS } from '../../addresses';

/**
 * Prepare register client transaction
 * @param name - Client name
 * @param description - Client description
 * @returns Transaction config for wagmi
 */
export function prepareRegisterClient(name: string, description: string) {
  return {
    address: NOUNS_CONTRACTS.ClientRewardsProxy.proxy as Address,
    abi: ClientRewardsABI,
    functionName: 'registerClient',
    args: [name, description],
  } as const;
}

/**
 * Prepare update client description transaction
 * @param clientId - Client ID to update
 * @param description - New description
 * @returns Transaction config for wagmi
 */
export function prepareUpdateClientDescription(clientId: number, description: string) {
  return {
    address: NOUNS_CONTRACTS.ClientRewardsProxy.proxy as Address,
    abi: ClientRewardsABI,
    functionName: 'updateClientDescription',
    args: [clientId, description],
  } as const;
}

/**
 * Prepare update client metadata transaction
 * @param clientId - Client ID to update
 * @param name - New name
 * @param description - New description
 * @returns Transaction config for wagmi
 */
export function prepareUpdateClientMetadata(clientId: number, name: string, description: string) {
  return {
    address: NOUNS_CONTRACTS.ClientRewardsProxy.proxy as Address,
    abi: ClientRewardsABI,
    functionName: 'updateClientMetadata',
    args: [clientId, name, description],
  } as const;
}

/**
 * Prepare claim rewards transaction
 * @param clientId - Client ID claiming rewards
 * @returns Transaction config for wagmi
 */
export function prepareClaimRewards(clientId: number) {
  return {
    address: NOUNS_CONTRACTS.ClientRewardsProxy.proxy as Address,
    abi: ClientRewardsABI,
    functionName: 'claimRewards',
    args: [clientId],
  } as const;
}

/**
 * Prepare update rewards for proposal transaction
 * @param proposalId - Proposal ID to update rewards for
 * @returns Transaction config for wagmi
 */
export function prepareUpdateRewardsForProposal(proposalId: bigint) {
  return {
    address: NOUNS_CONTRACTS.ClientRewardsProxy.proxy as Address,
    abi: ClientRewardsABI,
    functionName: 'updateRewardsForProposalWritingAndVoting',
    args: [proposalId],
  } as const;
}

/**
 * Prepare update rewards for auction transaction
 * @param auctionId - Auction ID to update rewards for
 * @returns Transaction config for wagmi
 */
export function prepareUpdateRewardsForAuction(auctionId: bigint) {
  return {
    address: NOUNS_CONTRACTS.ClientRewardsProxy.proxy as Address,
    abi: ClientRewardsABI,
    functionName: 'updateRewardsForAuction',
    args: [auctionId],
  } as const;
}

/**
 * Validate register client parameters
 */
export function validateRegisterClient(
  name: string,
  description: string
): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Name cannot be empty' };
  }
  if (name.length > 64) {
    return { valid: false, error: 'Name too long (max 64 characters)' };
  }
  if (!description || description.trim().length === 0) {
    return { valid: false, error: 'Description cannot be empty' };
  }
  if (description.length > 256) {
    return { valid: false, error: 'Description too long (max 256 characters)' };
  }
  return { valid: true };
}

