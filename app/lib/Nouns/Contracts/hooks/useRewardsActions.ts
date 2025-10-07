/**
 * Rewards Actions Hook
 * React hook for claiming client rewards
 * Berry OS is Client ID 11
 */

'use client';

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { Address } from 'viem';
import * as RewardsActions from '../actions/rewards';

/**
 * Hook for client rewards actions
 * 
 * @example
 * function WithdrawButton({ to }: { to: Address }) {
 *   const { withdrawBerryOSRewards, berryOSBalance, isPending, isConfirming } = useRewardsActions();
 *   
 *   const handleWithdraw = async () => {
 *     try {
 *       await withdrawBerryOSRewards(to);
 *       alert('Rewards withdrawn!');
 *     } catch (err) {
 *       alert('Withdrawal failed');
 *     }
 *   };
 *   
 *   return (
 *     <div>
 *       <p>Balance: {berryOSBalance?.toString()} wei</p>
 *       <button onClick={handleWithdraw} disabled={isPending || isConfirming}>
 *         {isPending ? 'Withdrawing...' : isConfirming ? 'Confirming...' : 'Withdraw'}
 *       </button>
 *     </div>
 *   );
 * }
 */
export function useRewardsActions() {
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
  
  // Read Berry OS data (Client ID 11)
  const { 
    data: berryOSBalance, 
    refetch: refetchBalance 
  } = useReadContract(RewardsActions.berryOSBalance() as any);
  
  const { data: berryOSClient } = useReadContract(RewardsActions.getBerryOSClient() as any);
  
  // Read reward status
  const { data: nextAuctionIdToReward } = useReadContract(RewardsActions.nextAuctionIdToReward() as any);
  const { data: nextProposalIdToReward } = useReadContract(RewardsActions.nextProposalIdToReward() as any);
  
  // ============================================================================
  // WRITE ACTIONS
  // ============================================================================
  
  /**
   * Withdraw client balance
   */
  const withdrawClientBalance = async (clientId: number, to: Address) => {
    const config = RewardsActions.withdrawClientBalance(clientId, to);
    return await writeContractAsync(config as any);
  };
  
  /**
   * Withdraw Berry OS rewards (Client ID 11)
   */
  const withdrawBerryOSRewards = async (to: Address) => {
    const config = RewardsActions.withdrawBerryOSRewards(to);
    return await writeContractAsync(config as any);
  };
  
  /**
   * Register a new client for rewards
   */
  const registerClient = async (name: string, description: string) => {
    const config = RewardsActions.registerClient(name, description);
    return await writeContractAsync(config as any);
  };
  
  /**
   * Update rewards for proposal creation and voting
   * Can only be called every 30 days or 10 qualified proposals (whichever is sooner)
   * 
   * IMPORTANT: Use getVotingClientIds(lastProposalId) to get the correct client IDs
   * 
   * @example
   * // Step 1: Get voting client IDs
   * const { data: clientIds } = useReadContract(RewardsActions.getVotingClientIds(BigInt(150)));
   * 
   * // Step 2: Update rewards with same proposal ID
   * await updateRewardsForProposalWritingAndVoting(BigInt(150), clientIds);
   */
  const updateRewardsForProposalWritingAndVoting = async (
    lastProposalId: bigint,
    votingClientIds: number[]
  ) => {
    const config = RewardsActions.updateRewardsForProposalWritingAndVoting(
      lastProposalId,
      votingClientIds
    );
    return await writeContractAsync(config as any);
  };
  
  /**
   * Update rewards for auctions
   * Anyone can call this to trigger reward distribution
   */
  const updateRewardsForAuctions = async (lastNounId: bigint) => {
    const config = RewardsActions.updateRewardsForAuctions(lastNounId);
    return await writeContractAsync(config as any);
  };
  
  return {
    // Data
    berryOSBalance,
    berryOSClient,
    nextAuctionIdToReward,
    nextProposalIdToReward,
    
    // Actions
    withdrawClientBalance,
    withdrawBerryOSRewards,
    registerClient,
    updateRewardsForProposalWritingAndVoting,
    updateRewardsForAuctions,
    
    // Status
    isPending,
    isConfirming,
    isConfirmed,
    hash,
    error: writeError,
    
    // Utils
    refetchBalance,
    resetWrite,
  };
}
