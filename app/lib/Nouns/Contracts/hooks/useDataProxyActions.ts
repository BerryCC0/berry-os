/**
 * Data Proxy Actions Hook
 * React hook for proposal candidates and feedback
 */

'use client';

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { Address } from 'viem';
import * as DataProxyActions from '../actions/dataproxy';

/**
 * Hook for data proxy actions (candidates, feedback)
 * 
 * @example
 * function FeedbackButton({ proposalId }: { proposalId: bigint }) {
 *   const { sendFeedback, isPending, isConfirming, isConfirmed } = useDataProxyActions();
 *   
 *   const handleFeedback = async () => {
 *     try {
 *       await sendFeedback(proposalId, 1, "Great proposal!");
 *       alert('Feedback sent!');
 *     } catch (err) {
 *       alert('Feedback failed');
 *     }
 *   };
 *   
 *   return (
 *     <button onClick={handleFeedback} disabled={isPending || isConfirming}>
 *       {isPending ? 'Sending...' : isConfirming ? 'Confirming...' : 'Send Feedback'}
 *     </button>
 *   );
 * }
 */
export function useDataProxyActions() {
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
  
  // Read costs
  const { data: createCandidateCost } = useReadContract(DataProxyActions.createCandidateCost());
  const { data: updateCandidateCost } = useReadContract(DataProxyActions.updateCandidateCost());
  
  // ============================================================================
  // CANDIDATE ACTIONS
  // ============================================================================
  
  /**
   * Create a proposal candidate
   */
  const createProposalCandidate = async (
    targets: Address[],
    values: bigint[],
    signatures: string[],
    calldatas: `0x${string}`[],
    description: string,
    slug: string,
    proposalIdToUpdate: bigint
  ) => {
    const config = DataProxyActions.createProposalCandidate(
      targets,
      values,
      signatures,
      calldatas,
      description,
      slug,
      proposalIdToUpdate
    );
    return await writeContractAsync(config as any);
  };
  
  /**
   * Update a proposal candidate
   */
  const updateProposalCandidate = async (
    targets: Address[],
    values: bigint[],
    signatures: string[],
    calldatas: `0x${string}`[],
    description: string,
    slug: string,
    proposalIdToUpdate: bigint,
    reason: string
  ) => {
    const config = DataProxyActions.updateProposalCandidate(
      targets,
      values,
      signatures,
      calldatas,
      description,
      slug,
      proposalIdToUpdate,
      reason
    );
    return await writeContractAsync(config as any);
  };
  
  /**
   * Cancel a proposal candidate
   */
  const cancelProposalCandidate = async (slug: string) => {
    const config = DataProxyActions.cancelProposalCandidate(slug);
    return await writeContractAsync(config as any);
  };
  
  /**
   * Add EIP-712 signature to a proposal candidate
   */
  const addSignature = async (
    sig: `0x${string}`,
    expirationTimestamp: bigint,
    proposer: Address,
    slug: string,
    proposalIdToUpdate: bigint,
    encodedProp: `0x${string}`,
    reason: string
  ) => {
    const config = DataProxyActions.addSignature(
      sig,
      expirationTimestamp,
      proposer,
      slug,
      proposalIdToUpdate,
      encodedProp,
      reason
    );
    return await writeContractAsync(config as any);
  };
  
  // ============================================================================
  // FEEDBACK ACTIONS
  // ============================================================================
  
  /**
   * Send feedback on a proposal
   */
  const sendFeedback = async (proposalId: bigint, support: number, reason: string) => {
    const config = DataProxyActions.sendFeedback(proposalId, support, reason);
    return await writeContractAsync(config as any);
  };
  
  /**
   * Send feedback on a candidate
   */
  const sendCandidateFeedback = async (
    proposer: Address,
    slug: string,
    support: number,
    reason: string
  ) => {
    const config = DataProxyActions.sendCandidateFeedback(proposer, slug, support, reason);
    return await writeContractAsync(config as any);
  };
  
  /**
   * Post public message from Duna admin
   */
  const postDunaAdminMessage = async (message: string, relatedProposals: bigint[]) => {
    const config = DataProxyActions.postDunaAdminMessage(message, relatedProposals);
    return await writeContractAsync(config as any);
  };
  
  /**
   * Send message to Duna admin
   */
  const postVoterMessageToDunaAdmin = async (message: string, relatedProposals: bigint[]) => {
    const config = DataProxyActions.postVoterMessageToDunaAdmin(message, relatedProposals);
    return await writeContractAsync(config as any);
  };
  
  /**
   * Signal proposal compliance
   */
  const signalProposalCompliance = async (proposalId: bigint, signal: number, reason: string) => {
    const config = DataProxyActions.signalProposalCompliance(proposalId, signal, reason);
    return await writeContractAsync(config as any);
  };
  
  return {
    // Data
    createCandidateCost,
    updateCandidateCost,
    
    // Candidate Actions
    createProposalCandidate,
    updateProposalCandidate,
    cancelProposalCandidate,
    addSignature,
    
    // Feedback Actions
    sendFeedback,
    sendCandidateFeedback,
    postDunaAdminMessage,
    postVoterMessageToDunaAdmin,
    signalProposalCompliance,
    
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
