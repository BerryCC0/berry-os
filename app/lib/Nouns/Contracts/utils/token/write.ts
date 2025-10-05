/**
 * Nouns Token - Write Functions
 * Helper functions for preparing token write transactions
 */

import { Address } from 'viem';
import { CONTRACTS } from '../constants';
import { NounsTokenABI } from '../../abis';

/**
 * Prepare delegate transaction
 * @param delegatee - Address to delegate voting power to
 * @returns Transaction config for wagmi useWriteContract
 */
export function prepareDelegateTransaction(delegatee: Address) {
  return {
    address: CONTRACTS.NounsToken.address as Address,
    abi: NounsTokenABI,
    functionName: 'delegate' as const,
    args: [delegatee],
  };
}

/**
 * Prepare delegate to self transaction (reclaim voting power)
 * @param account - User's address
 * @returns Transaction config for wagmi useWriteContract
 */
export function prepareDelegateToSelfTransaction(account: Address) {
  return prepareDelegateTransaction(account);
}

/**
 * Prepare transfer transaction
 * @param from - Sender address
 * @param to - Recipient address
 * @param tokenId - Noun token ID
 * @returns Transaction config for wagmi useWriteContract
 */
export function prepareTransferTransaction(
  from: Address,
  to: Address,
  tokenId: bigint
) {
  return {
    address: CONTRACTS.NounsToken.address as Address,
    abi: NounsTokenABI,
    functionName: 'transferFrom' as const,
    args: [from, to, tokenId],
  };
}

/**
 * Prepare approve transaction
 * @param to - Address to approve
 * @param tokenId - Noun token ID
 * @returns Transaction config for wagmi useWriteContract
 */
export function prepareApproveTransaction(
  to: Address,
  tokenId: bigint
) {
  return {
    address: CONTRACTS.NounsToken.address as Address,
    abi: NounsTokenABI,
    functionName: 'approve' as const,
    args: [to, tokenId],
  };
}

/**
 * Validate delegation target
 * @param delegatee - Address to validate
 * @returns True if valid delegation target
 */
export function isValidDelegatee(delegatee: Address): boolean {
  // Check if address is valid (not zero address)
  return delegatee !== '0x0000000000000000000000000000000000000000';
}

/**
 * Validate token ID
 * @param tokenId - Token ID to validate
 * @returns True if valid token ID
 */
export function isValidTokenId(tokenId: bigint): boolean {
  return tokenId >= BigInt(0);
}

// ============================================================================
// STANDARDIZED FUNCTION NAMES (for consistent API)
// ============================================================================

/**
 * Delegate votes
 * @param delegatee Address to delegate to
 */
export function prepareDelegateVotes(delegatee: Address) {
  return prepareDelegateTransaction(delegatee);
}

/**
 * Transfer token (simple interface)
 * @param to Recipient address
 * @param tokenId Token ID
 */
export function prepareTransferToken(to: Address, tokenId: bigint) {
  // Note: 'from' will be msg.sender in the contract
  return {
    address: CONTRACTS.NounsToken.address as Address,
    abi: NounsTokenABI,
    functionName: 'safeTransferFrom' as const,
    args: [to, tokenId],
  };
}

