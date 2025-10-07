/**
 * Token Actions Hook
 * React hook for Nouns Token interactions (delegation, transfers)
 */

'use client';

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { Address } from 'viem';
import * as TokenActions from '../actions/token';

/**
 * Hook for token actions (delegation, transfers)
 * 
 * @example
 * function DelegateButton({ delegatee }: { delegatee: Address }) {
 *   const { delegate, isPending, isConfirming, isConfirmed } = useTokenActions();
 *   
 *   const handleDelegate = async () => {
 *     try {
 *       await delegate(delegatee);
 *       alert('Delegation successful!');
 *     } catch (err) {
 *       alert('Delegation failed');
 *     }
 *   };
 *   
 *   return (
 *     <button onClick={handleDelegate} disabled={isPending || isConfirming}>
 *       {isPending ? 'Delegating...' : isConfirming ? 'Confirming...' : 'Delegate'}
 *     </button>
 *   );
 * }
 */
export function useTokenActions() {
  // Write contract setup
  const { 
    writeContractAsync, 
    data: hash, 
    isPending,
    error: writeError,
    reset: resetWrite
  } = useWriteContract();
  
  // Transaction confirmation
  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed 
  } = useWaitForTransactionReceipt({ hash });
  
  // Read token info
  const { data: totalSupply } = useReadContract(TokenActions.totalSupply());
  
  // ============================================================================
  // DELEGATION ACTIONS
  // ============================================================================
  
  /**
   * Delegate voting power to an address
   */
  const delegate = async (delegatee: Address) => {
    const config = TokenActions.delegate(delegatee);
    return await writeContractAsync(config as any);
  };
  
  // ============================================================================
  // TRANSFER ACTIONS
  // ============================================================================
  
  /**
   * Transfer a Noun
   */
  const transferFrom = async (from: Address, to: Address, tokenId: bigint) => {
    const config = TokenActions.transferFrom(from, to, tokenId);
    return await writeContractAsync(config as any);
  };
  
  /**
   * Safe transfer a Noun
   */
  const safeTransferFrom = async (from: Address, to: Address, tokenId: bigint) => {
    const config = TokenActions.safeTransferFrom(from, to, tokenId);
    return await writeContractAsync(config as any);
  };
  
  /**
   * Approve an address to transfer a Noun
   */
  const approve = async (to: Address, tokenId: bigint) => {
    const config = TokenActions.approve(to, tokenId);
    return await writeContractAsync(config as any);
  };
  
  /**
   * Set approval for all Nouns
   */
  const setApprovalForAll = async (operator: Address, approved: boolean) => {
    const config = TokenActions.setApprovalForAll(operator, approved);
    return await writeContractAsync(config as any);
  };
  
  return {
    // Data
    totalSupply,
    
    // Delegation Actions
    delegate,
    
    // Transfer Actions
    transferFrom,
    safeTransferFrom,
    approve,
    setApprovalForAll,
    
    // Status
    isPending,
    isConfirming,
    isConfirmed,
    hash,
    error: writeError,
    
    // Utils
    resetWrite,
  };
}
