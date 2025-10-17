/**
 * Nouns Token Actions
 * User-facing actions for Nouns NFT operations
 */

import { Address } from 'viem';
import { NOUNS_CONTRACTS } from '../utils/addresses';
import { NounsTokenABI } from '../abis';

// ============================================================================
// APPROVAL ACTIONS
// ============================================================================

/**
 * Approve an address to transfer a specific Noun
 * 
 * @param spender - Address to approve
 * @param tokenId - Noun ID to approve transfer for
 * @returns Transaction config for wagmi useWriteContract
 * 
 * @example
 * const config = approve(treasuryAddress, BigInt(123));
 * await writeContractAsync(config);
 */
export function approve(spender: Address, tokenId: bigint) {
  return {
    address: NOUNS_CONTRACTS.NounsToken.address as Address,
    abi: NounsTokenABI,
    functionName: 'approve' as const,
    args: [spender, tokenId] as const,
  };
}

/**
 * Set approval for an operator to manage all caller's Nouns
 * 
 * @param operator - Address to grant/revoke operator status
 * @param approved - True to approve, false to revoke
 * @returns Transaction config for wagmi useWriteContract
 * 
 * @example
 * const config = setApprovalForAll(treasuryAddress, true);
 * await writeContractAsync(config);
 */
export function setApprovalForAll(operator: Address, approved: boolean) {
  return {
    address: NOUNS_CONTRACTS.NounsToken.address as Address,
    abi: NounsTokenABI,
    functionName: 'setApprovalForAll' as const,
    args: [operator, approved] as const,
  };
}

// ============================================================================
// READ QUERIES
// ============================================================================

/**
 * Get approved address for a specific Noun
 * 
 * @param tokenId - Noun ID to check
 * @returns Query config for wagmi useReadContract
 * 
 * @example
 * const { data: approvedAddress } = useReadContract(getApproved(BigInt(123)));
 */
export function getApproved(tokenId: bigint) {
  return {
    address: NOUNS_CONTRACTS.NounsToken.address as Address,
    abi: NounsTokenABI,
    functionName: 'getApproved' as const,
    args: [tokenId] as const,
  };
}

/**
 * Check if operator is approved to manage all of owner's Nouns
 * 
 * @param owner - Owner address
 * @param operator - Operator address to check
 * @returns Query config for wagmi useReadContract
 * 
 * @example
 * const { data: isApproved } = useReadContract(
 *   isApprovedForAll(userAddress, treasuryAddress)
 * );
 */
export function isApprovedForAll(owner: Address, operator: Address) {
  return {
    address: NOUNS_CONTRACTS.NounsToken.address as Address,
    abi: NounsTokenABI,
    functionName: 'isApprovedForAll' as const,
    args: [owner, operator] as const,
  };
}

/**
 * Get owner of a Noun
 * 
 * @param tokenId - Noun ID
 * @returns Query config for wagmi useReadContract
 * 
 * @example
 * const { data: owner } = useReadContract(ownerOf(BigInt(123)));
 */
export function ownerOf(tokenId: bigint) {
  return {
    address: NOUNS_CONTRACTS.NounsToken.address as Address,
    abi: NounsTokenABI,
    functionName: 'ownerOf' as const,
    args: [tokenId] as const,
  };
}

