/**
 * Governance Actions Hook
 * React hook for voting and proposal management
 */

'use client';

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { Address } from 'viem';
import * as GovernanceActions from '../actions/governance';
import { ProposerSignature } from '../utils/types';

/**
 * Hook for governance actions (voting, proposals, etc.)
 * 
 * @example
 * function VoteButton({ proposalId }: { proposalId: bigint }) {
 *   const { voteFor, isPending, isConfirming, isConfirmed } = useGovernanceActions();
 *   
 *   const handleVote = async () => {
 *     try {
 *       await voteFor(proposalId, "This is important!");
 *       alert('Vote cast!');
 *     } catch (err) {
 *       alert('Vote failed');
 *     }
 *   };
 *   
 *   return (
 *     <button onClick={handleVote} disabled={isPending || isConfirming}>
 *       {isPending ? 'Voting...' : isConfirming ? 'Confirming...' : 'Vote FOR'}
 *     </button>
 *   );
 * }
 */
export function useGovernanceActions() {
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
  
  // Read governance config
  const { data: proposalThreshold } = useReadContract(GovernanceActions.proposalThreshold());
  const { data: votingDelay } = useReadContract(GovernanceActions.votingDelay());
  const { data: votingPeriod } = useReadContract(GovernanceActions.votingPeriod());
  const { data: proposalCount } = useReadContract(GovernanceActions.proposalCount());
  
  // ============================================================================
  // VOTING ACTIONS (All with Berry OS Client ID 11)
  // ============================================================================
  
  /**
   * Vote FOR a proposal (with optional reason)
   * Uses refundable vote with Berry OS Client ID (11)
   */
  const voteFor = async (proposalId: bigint, reason?: string) => {
    const config = GovernanceActions.voteFor(proposalId, reason);
    return await writeContractAsync(config as any);
  };
  
  /**
   * Vote AGAINST a proposal (with optional reason)
   * Uses refundable vote with Berry OS Client ID (11)
   */
  const voteAgainst = async (proposalId: bigint, reason?: string) => {
    const config = GovernanceActions.voteAgainst(proposalId, reason);
    return await writeContractAsync(config as any);
  };
  
  /**
   * Vote ABSTAIN on a proposal (with optional reason)
   * Uses refundable vote with Berry OS Client ID (11)
   */
  const voteAbstain = async (proposalId: bigint, reason?: string) => {
    const config = GovernanceActions.voteAbstain(proposalId, reason);
    return await writeContractAsync(config as any);
  };
  
  /**
   * Cast a refundable vote with specific support value
   * Automatically includes Berry OS Client ID (11)
   */
  const castRefundableVote = async (proposalId: bigint, support: number, reason?: string) => {
    const config = GovernanceActions.castRefundableVote(proposalId, support, reason);
    return await writeContractAsync(config as any);
  };
  
  // ============================================================================
  // PROPOSAL LIFECYCLE ACTIONS
  // ============================================================================
  
  /**
   * Create a new proposal
   * Automatically includes Berry OS Client ID (11)
   */
  const propose = async (
    targets: Address[],
    values: bigint[],
    signatures: string[],
    calldatas: `0x${string}`[],
    description: string
  ) => {
    const config = GovernanceActions.propose(targets, values, signatures, calldatas, description);
    return await writeContractAsync(config as any);
  };
  
  /**
   * Propose by signatures (multi-signer proposal)
   * Automatically includes Berry OS Client ID (11)
   */
  const proposeBySigs = async (
    proposerSignatures: ProposerSignature[],
    targets: Address[],
    values: bigint[],
    signatures: string[],
    calldatas: `0x${string}`[],
    description: string
  ) => {
    const config = GovernanceActions.proposeBySigs(
      proposerSignatures,
      targets,
      values,
      signatures,
      calldatas,
      description
    );
    return await writeContractAsync(config as any);
  };
  
  /**
   * Queue a succeeded proposal
   */
  const queue = async (proposalId: bigint) => {
    const config = GovernanceActions.queue(proposalId);
    return await writeContractAsync(config as any);
  };
  
  /**
   * Execute a queued proposal
   */
  const execute = async (proposalId: bigint) => {
    const config = GovernanceActions.execute(proposalId);
    return await writeContractAsync(config as any);
  };
  
  /**
   * Cancel a proposal
   */
  const cancel = async (proposalId: bigint) => {
    const config = GovernanceActions.cancel(proposalId);
    return await writeContractAsync(config as any);
  };
  
  /**
   * Veto a proposal (vetoer only)
   */
  const veto = async (proposalId: bigint) => {
    const config = GovernanceActions.veto(proposalId);
    return await writeContractAsync(config as any);
  };
  
  /**
   * Cancel your own signature
   * Revoke support for a proposal before it's submitted
   */
  const cancelSig = async (sig: `0x${string}`) => {
    const config = GovernanceActions.cancelSig(sig);
    return await writeContractAsync(config as any);
  };
  
  // ============================================================================
  // UPDATABLE PROPOSALS
  // ============================================================================
  
  /**
   * Update proposal transactions
   */
  const updateProposal = async (
    proposalId: bigint,
    targets: Address[],
    values: bigint[],
    signatures: string[],
    calldatas: `0x${string}`[],
    description: string,
    updateMessage: string
  ) => {
    const config = GovernanceActions.updateProposal(
      proposalId,
      targets,
      values,
      signatures,
      calldatas,
      description,
      updateMessage
    );
    return await writeContractAsync(config as any);
  };
  
  /**
   * Update proposal description only
   */
  const updateProposalDescription = async (
    proposalId: bigint,
    description: string,
    updateMessage: string
  ) => {
    const config = GovernanceActions.updateProposalDescription(proposalId, description, updateMessage);
    return await writeContractAsync(config as any);
  };
  
  /**
   * Update proposal transactions only
   */
  const updateProposalTransactions = async (
    proposalId: bigint,
    targets: Address[],
    values: bigint[],
    signatures: string[],
    calldatas: `0x${string}`[],
    updateMessage: string
  ) => {
    const config = GovernanceActions.updateProposalTransactions(
      proposalId,
      targets,
      values,
      signatures,
      calldatas,
      updateMessage
    );
    return await writeContractAsync(config as any);
  };
  
  return {
    // Data
    proposalThreshold,
    votingDelay,
    votingPeriod,
    proposalCount,
    
    // Voting Actions (all with Berry OS Client ID 11)
    voteFor,
    voteAgainst,
    voteAbstain,
    castRefundableVote,
    
    // Proposal Actions (all with Berry OS Client ID 11)
    propose,
    proposeBySigs,
    queue,
    execute,
    cancel,
    veto,
    cancelSig,
    
    // Update Actions
    updateProposal,
    updateProposalDescription,
    updateProposalTransactions,
    
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
