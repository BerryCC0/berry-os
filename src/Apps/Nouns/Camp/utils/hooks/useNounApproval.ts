/**
 * useNounApproval Hook
 * Check and manage Noun approval status for swaps
 */

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Address } from 'viem';
import { NounsTokenActions } from '@/app/lib/Nouns/Contracts';
import { TREASURY_ADDRESS } from '../actionTemplates';

interface UseNounApprovalReturn {
  // Approval status
  isApproved: boolean;
  isApprovedForAll: boolean;
  isLoading: boolean;
  
  // Approval actions
  approveNoun: () => void;
  approveAllNouns: () => void;
  
  // Transaction status
  isPending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  error: Error | null;
}

/**
 * Hook to check and manage Noun approval for treasury swaps
 * 
 * @param nounId - The Noun ID to check approval for
 * @returns Approval status and actions
 * 
 * @example
 * const { isApproved, approveNoun, isPending } = useNounApproval("123");
 * if (!isApproved) {
 *   return <button onClick={approveNoun} disabled={isPending}>Approve</button>;
 * }
 */
export function useNounApproval(nounId: string | undefined): UseNounApprovalReturn {
  const { address } = useAccount();
  const nounIdBigInt = nounId ? BigInt(nounId) : undefined;
  
  // Check specific Noun approval
  const { data: approvedAddress, isLoading: isLoadingApproved } = useReadContract(
    nounIdBigInt ? NounsTokenActions.getApproved(nounIdBigInt) : undefined
  );
  
  // Check operator approval (ApprovalForAll)
  const { data: isOperatorApproved, isLoading: isLoadingOperator } = useReadContract(
    address ? NounsTokenActions.isApprovedForAll(address, TREASURY_ADDRESS as Address) : undefined
  );
  
  // Write contract hooks
  const { 
    writeContract, 
    data: hash, 
    isPending,
    error: writeError
  } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
  
  // Approve specific Noun
  const approveNoun = () => {
    if (!nounIdBigInt) return;
    const config = NounsTokenActions.approve(TREASURY_ADDRESS as Address, nounIdBigInt);
    writeContract(config as any);
  };
  
  // Approve all Nouns (operator approval)
  const approveAllNouns = () => {
    const config = NounsTokenActions.setApprovalForAll(TREASURY_ADDRESS as Address, true);
    writeContract(config as any);
  };
  
  // Determine approval status
  const isApproved = approvedAddress?.toLowerCase() === TREASURY_ADDRESS.toLowerCase();
  const isApprovedForAll = isOperatorApproved === true;
  
  return {
    isApproved,
    isApprovedForAll,
    isLoading: isLoadingApproved || isLoadingOperator,
    approveNoun,
    approveAllNouns,
    isPending,
    isConfirming,
    isConfirmed,
    error: writeError,
  };
}

