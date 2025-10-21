/**
 * useCandidateActions Hook
 * Wrapper around DataProxy contract interactions for candidates
 * 
 * Provides user-friendly API for:
 * - Updating candidates
 * - Canceling candidates
 * - Adding signatures
 * - Sending feedback
 */

'use client';

import { useDataProxyActions } from '@/app/lib/Nouns/Contracts';
import type { Address } from 'viem';

interface CandidateContent {
  targets: Address[];
  values: bigint[];
  signatures: string[];
  calldatas: `0x${string}`[];
  description: string;
  proposalIdToUpdate: bigint;
}

export function useCandidateActions() {
  const {
    updateProposalCandidate,
    cancelProposalCandidate,
    sendCandidateFeedback,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  } = useDataProxyActions();

  /**
   * Update a candidate's content
   */
  const updateCandidate = async (
    slug: string,
    content: CandidateContent,
    reason?: string
  ) => {
    try {
      await updateProposalCandidate(
        content.targets,
        content.values,
        content.signatures,
        content.calldatas,
        content.description,
        slug,
        content.proposalIdToUpdate,
        reason || ''
      );
    } catch (err) {
      console.error('Failed to update candidate:', err);
      throw err;
    }
  };

  /**
   * Cancel a candidate
   */
  const cancelCandidate = async (slug: string) => {
    try {
      await cancelProposalCandidate(slug);
    } catch (err) {
      console.error('Failed to cancel candidate:', err);
      throw err;
    }
  };

  /**
   * Send feedback on a candidate
   */
  const sendFeedback = async (
    proposer: string,
    slug: string,
    support: number,
    reason?: string
  ) => {
    try {
      await sendCandidateFeedback(proposer as Address, slug, support, reason || '');
    } catch (err) {
      console.error('Failed to send feedback:', err);
      throw err;
    }
  };

  return {
    updateCandidate,
    cancelCandidate,
    sendFeedback,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

