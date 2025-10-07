/**
 * Client Rewards Actions
 * User-facing actions for claiming client rewards
 * Berry OS is Client ID 11
 */

import { Address } from 'viem';
import { NOUNS_CONTRACTS } from '../utils/addresses';
import { ClientRewardsABI } from '../abis';
import { BERRY_OS_CLIENT_ID } from '../utils/constants';
import { validateClientId } from './validation';

// ============================================================================
// WRITE ACTIONS
// ============================================================================

/**
 * Withdraw client balance
 * Only the client owner can withdraw
 * 
 * @param clientId - Client ID to withdraw for
 * @param to - Address to send rewards to
 * @returns Transaction config for wagmi useWriteContract
 * @throws Error if validation fails
 * 
 * @example
 * const config = withdrawClientBalance(11, '0x...');
 * await writeContractAsync(config);
 */
export function withdrawClientBalance(clientId: number, to: Address) {
  validateClientId(clientId);
  
  return {
    address: NOUNS_CONTRACTS.ClientRewardsProxy.proxy as Address,
    abi: ClientRewardsABI,
    functionName: 'withdrawClientBalance' as const,
    args: [clientId, to],
  };
}

/**
 * Withdraw Berry OS rewards (Client ID 11)
 * Convenience function for Berry OS
 * 
 * @param to - Address to send rewards to
 * @returns Transaction config for wagmi useWriteContract
 * 
 * @example
 * const config = withdrawBerryOSRewards('0x...');
 * await writeContractAsync(config);
 */
export function withdrawBerryOSRewards(to: Address) {
  return withdrawClientBalance(BERRY_OS_CLIENT_ID, to);
}

/**
 * Register a new client for rewards
 * Anyone can register as a client to earn rewards from auctions, votes, and proposals
 * 
 * @param name - Client name (e.g., "My App")
 * @param description - Client description
 * @returns Transaction config for wagmi useWriteContract
 * @throws Error if validation fails
 * 
 * @example
 * const config = registerClient('My Nouns App', 'A cool app for Nouns DAO');
 * await writeContractAsync(config);
 */
export function registerClient(name: string, description: string) {
  if (!name || name.trim().length === 0) {
    throw new Error('Client name cannot be empty');
  }
  if (name.length > 100) {
    throw new Error('Client name too long (max 100 characters)');
  }
  if (!description || description.trim().length === 0) {
    throw new Error('Client description cannot be empty');
  }
  if (description.length > 500) {
    throw new Error('Client description too long (max 500 characters)');
  }
  
  return {
    address: NOUNS_CONTRACTS.ClientRewardsProxy.proxy as Address,
    abi: ClientRewardsABI,
    functionName: 'registerClient' as const,
    args: [name, description],
  };
}

/**
 * Update rewards for proposal creation and voting
 * Distributes rewards to clients based on proposal activity
 * Anyone can call this, but can only be updated every 30 days or 10 qualified proposals (whichever is sooner)
 * 
 * IMPORTANT: Use `getVotingClientIds(lastProposalId)` to get the correct client IDs to pass here
 * 
 * @param lastProposalId - Last proposal ID to process (use most recently ended proposal)
 * @param votingClientIds - Array of client IDs (get from `getVotingClientIds(lastProposalId)`)
 * @returns Transaction config for wagmi useWriteContract
 * @throws Error if validation fails
 * 
 * @example
 * // Step 1: Get the voting client IDs for the most recent proposal
 * const { data: clientIds } = useReadContract(getVotingClientIds(BigInt(150)));
 * 
 * // Step 2: Use the same proposal ID and client IDs to update rewards
 * const config = updateRewardsForProposalWritingAndVoting(BigInt(150), clientIds);
 * await writeContractAsync(config);
 */
export function updateRewardsForProposalWritingAndVoting(
  lastProposalId: bigint,
  votingClientIds: number[]
) {
  if (lastProposalId < BigInt(0)) {
    throw new Error('Invalid proposal ID');
  }
  if (!votingClientIds || votingClientIds.length === 0) {
    throw new Error('At least one voting client ID required');
  }
  
  // Convert to uint32 array as expected by contract
  const clientIds = votingClientIds.map(id => {
    validateClientId(id);
    return id;
  });
  
  return {
    address: NOUNS_CONTRACTS.ClientRewardsProxy.proxy as Address,
    abi: ClientRewardsABI,
    functionName: 'updateRewardsForProposalWritingAndVoting' as const,
    args: [lastProposalId, clientIds],
  };
}

/**
 * Update rewards for auctions
 * Distributes rewards to clients based on auction bidding activity
 * Anyone can call this to trigger reward distribution
 * 
 * @param lastNounId - Last Noun ID (auction) to process
 * @returns Transaction config for wagmi useWriteContract
 * @throws Error if validation fails
 * 
 * @example
 * const config = updateRewardsForAuctions(BigInt(1000));
 * await writeContractAsync(config);
 */
export function updateRewardsForAuctions(lastNounId: bigint) {
  if (lastNounId < BigInt(0)) {
    throw new Error('Invalid Noun ID');
  }
  
  return {
    address: NOUNS_CONTRACTS.ClientRewardsProxy.proxy as Address,
    abi: ClientRewardsABI,
    functionName: 'updateRewardsForAuctions' as const,
    args: [lastNounId],
  };
}

// ============================================================================
// READ QUERIES
// ============================================================================

/**
 * Get client balance (unclaimed rewards)
 * 
 * @param clientId - Client ID
 * @returns Query config for wagmi useReadContract
 * 
 * @example
 * const { data: balance } = useReadContract(clientBalance(11));
 * // balance in wei
 */
export function clientBalance(clientId: number) {
  validateClientId(clientId);
  
  return {
    address: NOUNS_CONTRACTS.ClientRewardsProxy.proxy as Address,
    abi: ClientRewardsABI,
    functionName: 'clientBalance' as const,
    args: [clientId],
  };
}

/**
 * Get Berry OS balance (Client ID 11)
 * Convenience function for Berry OS
 * 
 * @returns Query config for wagmi useReadContract
 * 
 * @example
 * const { data: balance } = useReadContract(berryOSBalance());
 */
export function berryOSBalance() {
  return clientBalance(BERRY_OS_CLIENT_ID);
}

/**
 * Get client metadata
 * 
 * @param clientId - Client ID
 * @returns Query config for wagmi useReadContract
 * 
 * @example
 * const { data: metadata } = useReadContract(getClient(11));
 * // metadata = { approved, rewarded, withdrawn, name, description }
 */
export function getClient(clientId: number) {
  validateClientId(clientId);
  
  return {
    address: NOUNS_CONTRACTS.ClientRewardsProxy.proxy as Address,
    abi: ClientRewardsABI,
    functionName: 'getClient' as const,
    args: [clientId],
  };
}

/**
 * Get Berry OS metadata (Client ID 11)
 * Convenience function for Berry OS
 * 
 * @returns Query config for wagmi useReadContract
 */
export function getBerryOSClient() {
  return getClient(BERRY_OS_CLIENT_ID);
}

/**
 * Get next available client ID
 * 
 * @returns Query config for wagmi useReadContract
 */
export function nextTokenId() {
  return {
    address: NOUNS_CONTRACTS.ClientRewardsProxy.proxy as Address,
    abi: ClientRewardsABI,
    functionName: 'nextTokenId' as const,
  };
}

/**
 * Get auction house address
 * 
 * @returns Query config for wagmi useReadContract
 */
export function auctionHouse() {
  return {
    address: NOUNS_CONTRACTS.ClientRewardsProxy.proxy as Address,
    abi: ClientRewardsABI,
    functionName: 'auctionHouse' as const,
  };
}

/**
 * Get Nouns DAO address
 * 
 * @returns Query config for wagmi useReadContract
 */
export function nounsDAO() {
  return {
    address: NOUNS_CONTRACTS.ClientRewardsProxy.proxy as Address,
    abi: ClientRewardsABI,
    functionName: 'nounsDAO' as const,
  };
}

/**
 * Get voting client IDs for a proposal
 * Returns the client IDs that should be passed to `updateRewardsForProposalWritingAndVoting()`
 * 
 * NOTE: This can be gas-intensive, not meant to be called on-chain
 * 
 * @param lastProposalId - Last proposal ID to process (use most recently ended proposal)
 * @returns Query config for wagmi useReadContract
 * 
 * @example
 * // Get client IDs for proposal 150
 * const { data: clientIds } = useReadContract(getVotingClientIds(BigInt(150)));
 * // clientIds = [11, 5, 8] (example)
 * 
 * // Then use these IDs in the update function
 * await updateRewardsForProposalWritingAndVoting(BigInt(150), clientIds);
 */
export function getVotingClientIds(lastProposalId: bigint) {
  if (lastProposalId < BigInt(0)) {
    throw new Error('Invalid proposal ID');
  }
  
  return {
    address: NOUNS_CONTRACTS.ClientRewardsProxy.proxy as Address,
    abi: ClientRewardsABI,
    functionName: 'getVotingClientIds' as const,
    args: [lastProposalId],
  };
}

/**
 * Get next auction ID to reward
 * Shows the next auction that needs rewards processing
 * 
 * @returns Query config for wagmi useReadContract
 */
export function nextAuctionIdToReward() {
  return {
    address: NOUNS_CONTRACTS.ClientRewardsProxy.proxy as Address,
    abi: ClientRewardsABI,
    functionName: 'nextAuctionIdToReward' as const,
  };
}

/**
 * Get next proposal ID to reward
 * Shows the next proposal that needs rewards processing
 * 
 * @returns Query config for wagmi useReadContract
 */
export function nextProposalIdToReward() {
  return {
    address: NOUNS_CONTRACTS.ClientRewardsProxy.proxy as Address,
    abi: ClientRewardsABI,
    functionName: 'nextProposalIdToReward' as const,
  };
}
