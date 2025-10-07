/**
 * Auction Actions Hook
 * React hook for interacting with Nouns Auction House
 */

'use client';

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import * as AuctionActions from '../actions/auction';

/**
 * Hook for bidding and settling auctions
 * 
 * @example
 * function BidButton() {
 *   const { createBid, currentAuction, isPending, isConfirming, isConfirmed } = useAuctionActions();
 *   
 *   const handleBid = async () => {
 *     try {
 *       await createBid(currentAuction.nounId, "1.5");
 *       alert('Bid placed!');
 *     } catch (err) {
 *       alert('Bid failed');
 *     }
 *   };
 *   
 *   return (
 *     <button onClick={handleBid} disabled={isPending || isConfirming}>
 *       {isPending ? 'Sending...' : isConfirming ? 'Confirming...' : 'Bid 1.5 ETH'}
 *     </button>
 *   );
 * }
 */
export function useAuctionActions() {
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
  
  // Read current auction
  const { 
    data: currentAuction, 
    refetch: refetchAuction,
    isLoading: isLoadingAuction
  } = useReadContract(AuctionActions.auction());
  
  // Read auction config
  const { data: auctionDuration } = useReadContract(AuctionActions.duration());
  const { data: minReservePrice } = useReadContract(AuctionActions.reservePrice());
  const { data: minBidIncrement } = useReadContract(AuctionActions.minBidIncrementPercentage());
  const { data: auctionTimeBuffer } = useReadContract(AuctionActions.timeBuffer());
  
  // ============================================================================
  // WRITE ACTIONS
  // ============================================================================
  
  /**
   * Place a bid on the current Noun
   * Automatically includes Berry OS Client ID (11)
   */
  const createBid = async (nounId: bigint, bidAmountETH: string) => {
    const config = AuctionActions.createBid(nounId, bidAmountETH);
    return await writeContractAsync(config as any);
  };
  
  /**
   * Settle current auction and start new one
   */
  const settleCurrentAndCreateNewAuction = async () => {
    const config = AuctionActions.settleCurrentAndCreateNewAuction();
    return await writeContractAsync(config as any);
  };
  
  /**
   * Settle current auction
   */
  const settleAuction = async () => {
    const config = AuctionActions.settleAuction();
    return await writeContractAsync(config as any);
  };
  
  return {
    // Data
    currentAuction,
    auctionDuration,
    minReservePrice,
    minBidIncrement,
    auctionTimeBuffer,
    isLoadingAuction,
    
    // Actions
    createBid,
    settleCurrentAndCreateNewAuction,
    settleAuction,
    
    // Status
    isPending,        // Transaction being sent
    isConfirming,     // Waiting for block confirmation
    isConfirmed,      // Transaction confirmed!
    hash,            // Transaction hash
    error: writeError,
    
    // Utils
    refetchAuction,
    resetWrite,
  };
}
