/**
 * Fork Mechanism - Write Functions
 * Transaction builders for fork escrow and deployer operations
 */

import { Address } from 'viem';
import { ForkEscrowABI, ForkDAODeployerABI } from '../../abis';
import { NOUNS_CONTRACTS } from '../../addresses';

/**
 * Prepare escrow to fork transaction
 * @param tokenIds - Array of Noun token IDs to escrow
 * @param proposalIds - Array of proposal IDs to bring to fork
 * @param reason - Reason for forking
 * @returns Transaction config for wagmi
 */
export function prepareEscrowToFork(
  tokenIds: readonly bigint[],
  proposalIds: readonly bigint[],
  reason: string
) {
  return {
    address: NOUNS_CONTRACTS.ForkEscrow.address as Address,
    abi: ForkEscrowABI,
    functionName: 'escrowToFork',
    args: [tokenIds, proposalIds, reason],
  } as const;
}

/**
 * Prepare withdraw from fork escrow transaction
 * @param tokenIds - Array of token IDs to withdraw
 * @returns Transaction config for wagmi
 */
export function prepareWithdrawFromForkEscrow(tokenIds: readonly bigint[]) {
  return {
    address: NOUNS_CONTRACTS.ForkEscrow.address as Address,
    abi: ForkEscrowABI,
    functionName: 'withdrawFromForkEscrow',
    args: [tokenIds],
  } as const;
}

/**
 * Prepare return tokens to owner transaction
 * Only callable by DAO
 * @param tokenIds - Array of token IDs to return
 * @returns Transaction config for wagmi
 */
export function prepareReturnTokensToOwner(tokenIds: readonly bigint[]) {
  return {
    address: NOUNS_CONTRACTS.ForkEscrow.address as Address,
    abi: ForkEscrowABI,
    functionName: 'returnTokensToOwner',
    args: [tokenIds],
  } as const;
}

/**
 * Prepare deploy fork DAO transaction
 * @param forkingPeriodEndTimestamp - When fork period ends
 * @param forkEscrow - Address of fork escrow contract
 * @returns Transaction config for wagmi
 */
export function prepareDeployForkDAO(
  forkingPeriodEndTimestamp: bigint,
  forkEscrow: Address
) {
  return {
    address: NOUNS_CONTRACTS.ForkDAODeployer.address as Address,
    abi: ForkDAODeployerABI,
    functionName: 'deployForkDAO',
    args: [forkingPeriodEndTimestamp, forkEscrow],
  } as const;
}

/**
 * Validate escrow to fork parameters
 */
export function validateEscrowToFork(
  tokenIds: readonly bigint[],
  reason: string
): { valid: boolean; error?: string } {
  if (!tokenIds || tokenIds.length === 0) {
    return { valid: false, error: 'Must escrow at least one token' };
  }
  if (!reason || reason.trim().length === 0) {
    return { valid: false, error: 'Fork reason is required' };
  }
  if (reason.length > 512) {
    return { valid: false, error: 'Reason too long (max 512 characters)' };
  }
  return { valid: true };
}

/**
 * Validate withdraw from escrow parameters
 */
export function validateWithdrawFromEscrow(
  tokenIds: readonly bigint[]
): { valid: boolean; error?: string } {
  if (!tokenIds || tokenIds.length === 0) {
    return { valid: false, error: 'Must specify at least one token to withdraw' };
  }
  return { valid: true };
}

