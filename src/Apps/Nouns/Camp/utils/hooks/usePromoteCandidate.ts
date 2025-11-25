/**
 * usePromoteCandidate Hook
 * React hook for promoting a candidate to a full proposal
 */

'use client';

import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Address } from 'viem';
import * as GovernanceActions from '@/app/lib/Nouns/Contracts/actions/governance';
import { ProposerSignature } from '@/app/lib/Nouns/Contracts/utils/types';

interface UsePromoteCandidateReturn {
  promoteCandidate: (
    proposer: Address,
    targets: Address[],
    values: bigint[],
    signatures: string[],
    calldatas: `0x${string}`[],
    description: string,
    slug: string,
    proposalIdToUpdate: number,
    proposerSignatures: ProposerSignature[]
  ) => Promise<void>;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  proposalId: string | null;
}

/**
 * Hook for promoting a candidate to a proposal with signatures
 * 
 * @example
 * const { promoteCandidate, isLoading } = usePromoteCandidate();
 * 
 * await promoteCandidate(
 *   proposer,
 *   targets,
 *   values,
 *   signatures,
 *   calldatas,
 *   description,
 *   slug,
 *   proposalIdToUpdate,
 *   formattedSignatures
 * );
 */
export function usePromoteCandidate(): UsePromoteCandidateReturn {
  const [proposalId, setProposalId] = useState<string | null>(null);
  
  const { 
    writeContractAsync, 
    data: hash, 
    isPending,
    error: writeError,
    reset: resetWrite
  } = useWriteContract();
  
  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed,
    error: confirmError
  } = useWaitForTransactionReceipt({ hash });

  // Extract proposal ID from transaction receipt
  useEffect(() => {
    if (isConfirmed && hash) {
      // The proposalId will be emitted in the ProposalCreatedWithRequirements event
      // For now, we'll set a success message - can be enhanced to parse logs
      setProposalId('Success'); // TODO: Parse proposalId from transaction logs
    }
  }, [isConfirmed, hash]);

  const promoteCandidate = async (
    proposer: Address,
    targets: Address[],
    values: bigint[],
    signatures: string[],
    calldatas: `0x${string}`[],
    description: string,
    slug: string,
    proposalIdToUpdate: number,
    proposerSignatures: ProposerSignature[]
  ) => {
    try {
      resetWrite();
      setProposalId(null);
      
      // Use proposeBySigs to promote with collected signatures
      const config = GovernanceActions.proposeBySigs(
        proposerSignatures,
        targets,
        values,
        signatures,
        calldatas,
        description
      );
      
      await writeContractAsync(config as any);
    } catch (error) {
      console.error('Failed to promote candidate:', error);
      throw error;
    }
  };

  return {
    promoteCandidate,
    isLoading: isPending || isConfirming,
    isSuccess: isConfirmed,
    isError: !!writeError || !!confirmError,
    error: writeError || confirmError || null,
    proposalId,
  };
}
