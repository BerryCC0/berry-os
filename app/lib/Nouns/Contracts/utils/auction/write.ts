/**
 * Nouns Auction House - Write Functions
 * Helper functions for preparing auction write transactions
 */

import { Address, parseEther } from 'viem';
import { CONTRACTS, BERRY_OS_CLIENT_ID } from '../constants';
import { NounsAuctionHouseABI } from '../../abis';

/**
 * Prepare create bid transaction with Berry OS client ID
 * @param nounId - Noun being auctioned
 * @param bidAmount - Bid amount in ETH as string (e.g., "1.5")
 * @returns Transaction config for wagmi useWriteContract
 */
export function prepareCreateBidTransaction(nounId: bigint, bidAmount: string) {
  return {
    address: CONTRACTS.NounsAuctionHouse.proxy as Address,
    abi: NounsAuctionHouseABI,
    functionName: 'createBid' as const,
    args: [nounId, BERRY_OS_CLIENT_ID],
    value: parseEther(bidAmount),
  };
}

/**
 * Prepare create bid transaction with custom client ID
 * @param nounId - Noun being auctioned
 * @param bidAmount - Bid amount in ETH as string
 * @param clientId - Custom client ID
 * @returns Transaction config for wagmi useWriteContract
 */
export function prepareCreateBidWithClientTransaction(
  nounId: bigint,
  bidAmount: string,
  clientId: number
) {
  return {
    address: CONTRACTS.NounsAuctionHouse.proxy as Address,
    abi: NounsAuctionHouseABI,
    functionName: 'createBid' as const,
    args: [nounId, clientId],
    value: parseEther(bidAmount),
  };
}

/**
 * Prepare bid transaction with wei amount
 * @param nounId - Noun being auctioned
 * @param bidAmountWei - Bid amount in wei
 * @returns Transaction config for wagmi useWriteContract
 */
export function prepareCreateBidWithWeiTransaction(nounId: bigint, bidAmountWei: bigint) {
  return {
    address: CONTRACTS.NounsAuctionHouse.proxy as Address,
    abi: NounsAuctionHouseABI,
    functionName: 'createBid' as const,
    args: [nounId, BERRY_OS_CLIENT_ID],
    value: bidAmountWei,
  };
}

/**
 * Prepare settle current auction and create new auction transaction
 * Note: Anyone can call this after an auction ends
 * @returns Transaction config for wagmi useWriteContract
 */
export function prepareSettleAuctionTransaction() {
  return {
    address: CONTRACTS.NounsAuctionHouse.proxy as Address,
    abi: NounsAuctionHouseABI,
    functionName: 'settleCurrentAndCreateNewAuction' as const,
    args: [],
  };
}

/**
 * Validate bid parameters
 * @param nounId - Noun being auctioned
 * @param bidAmount - Bid amount in ETH
 * @returns Error message or null if valid
 */
export function validateBidParams(nounId: bigint, bidAmount: string): string | null {
  const zero = BigInt(0);
  
  // Check noun ID
  if (nounId < zero) {
    return 'Invalid Noun ID';
  }
  
  // Check bid amount
  try {
    const bidWei = parseEther(bidAmount);
    if (bidWei <= zero) {
      return 'Bid amount must be greater than 0';
    }
  } catch (error) {
    return 'Invalid bid amount format';
  }
  
  return null;
}

/**
 * Check if bid amount is sufficient
 * @param bidAmount - Proposed bid in wei
 * @param minBidAmount - Minimum required bid in wei
 * @returns True if bid is sufficient
 */
export function isSufficientBid(bidAmount: bigint, minBidAmount: bigint): boolean {
  return bidAmount >= minBidAmount;
}

// ============================================================================
// STANDARDIZED FUNCTION NAMES (for consistent API)
// ============================================================================

/**
 * Create bid (simple interface)
 * @param nounId Noun ID
 */
export function prepareCreateBid(nounId: bigint) {
  return {
    address: CONTRACTS.NounsAuctionHouse.proxy as Address,
    abi: NounsAuctionHouseABI,
    functionName: 'createBid' as const,
    args: [nounId, BERRY_OS_CLIENT_ID]
  };
}

/**
 * Settle auction (simple interface)
 */
export function prepareSettleAuction() {
  return prepareSettleAuctionTransaction();
}

