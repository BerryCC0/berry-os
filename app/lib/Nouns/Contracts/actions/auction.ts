/**
 * Auction House Actions
 * User-facing actions for interacting with Nouns Auction House
 * All write actions automatically include Berry OS Client ID (11)
 */

import { Address, parseEther } from 'viem';
import { NOUNS_CONTRACTS } from '../utils/addresses';
import { NounsAuctionHouseABI } from '../abis';
import { BERRY_OS_CLIENT_ID } from '../utils/constants';
import { validateNounId, validateBidAmount } from './validation';

// ============================================================================
// WRITE ACTIONS
// ============================================================================

/**
 * Create a bid on the current Noun auction
 * Automatically includes Berry OS Client ID (11) for rewards tracking
 * 
 * @param nounId - The Noun being auctioned
 * @param bidAmountETH - Bid amount in ETH (e.g., "1.5")
 * @returns Transaction config for wagmi useWriteContract
 * @throws Error if validation fails
 * 
 * @example
 * const config = createBid(BigInt(123), "1.5");
 * await writeContractAsync(config);
 */
export function createBid(nounId: bigint, bidAmountETH: string) {
  validateNounId(nounId);
  validateBidAmount(bidAmountETH);
  
  return {
    address: NOUNS_CONTRACTS.NounsAuctionHouse.proxy as Address,
    abi: NounsAuctionHouseABI,
    functionName: 'createBid' as const,
    args: [nounId, BERRY_OS_CLIENT_ID],
    value: parseEther(bidAmountETH),
  };
}

/**
 * Settle the current auction and create a new one
 * Can be called by anyone after an auction ends
 * 
 * @returns Transaction config for wagmi useWriteContract
 * 
 * @example
 * const config = settleCurrentAndCreateNewAuction();
 * await writeContractAsync(config);
 */
export function settleCurrentAndCreateNewAuction() {
  return {
    address: NOUNS_CONTRACTS.NounsAuctionHouse.proxy as Address,
    abi: NounsAuctionHouseABI,
    functionName: 'settleCurrentAndCreateNewAuction' as const,
    args: [],
  };
}

/**
 * Settle the current auction (without creating a new one)
 * Typically used by admin/owner only
 * 
 * @returns Transaction config for wagmi useWriteContract
 * 
 * @example
 * const config = settleAuction();
 * await writeContractAsync(config);
 */
export function settleAuction() {
  return {
    address: NOUNS_CONTRACTS.NounsAuctionHouse.proxy as Address,
    abi: NounsAuctionHouseABI,
    functionName: 'settleAuction' as const,
    args: [],
  };
}

// ============================================================================
// READ QUERIES
// ============================================================================

/**
 * Get current auction state
 * 
 * @returns Query config for wagmi useReadContract
 * 
 * @example
 * const { data: auction } = useReadContract(auction());
 * // auction = { nounId, amount, startTime, endTime, bidder, settled }
 */
export function auction() {
  return {
    address: NOUNS_CONTRACTS.NounsAuctionHouse.proxy as Address,
    abi: NounsAuctionHouseABI,
    functionName: 'auction' as const,
  };
}

/**
 * Get auction duration in seconds
 * 
 * @returns Query config for wagmi useReadContract
 * 
 * @example
 * const { data: duration } = useReadContract(duration());
 * // duration = 86400n (24 hours in seconds)
 */
export function duration() {
  return {
    address: NOUNS_CONTRACTS.NounsAuctionHouse.proxy as Address,
    abi: NounsAuctionHouseABI,
    functionName: 'duration' as const,
  };
}

/**
 * Get reserve price (minimum starting bid)
 * 
 * @returns Query config for wagmi useReadContract
 * 
 * @example
 * const { data: reservePrice } = useReadContract(reservePrice());
 * // reservePrice in wei
 */
export function reservePrice() {
  return {
    address: NOUNS_CONTRACTS.NounsAuctionHouse.proxy as Address,
    abi: NounsAuctionHouseABI,
    functionName: 'reservePrice' as const,
  };
}

/**
 * Get minimum bid increment percentage
 * 
 * @returns Query config for wagmi useReadContract
 * 
 * @example
 * const { data: minIncrement } = useReadContract(minBidIncrementPercentage());
 * // minIncrement = 5 (5%)
 */
export function minBidIncrementPercentage() {
  return {
    address: NOUNS_CONTRACTS.NounsAuctionHouse.proxy as Address,
    abi: NounsAuctionHouseABI,
    functionName: 'minBidIncrementPercentage' as const,
  };
}

/**
 * Get time buffer (extends auction if bid placed near end)
 * 
 * @returns Query config for wagmi useReadContract
 * 
 * @example
 * const { data: timeBuffer } = useReadContract(timeBuffer());
 * // timeBuffer in seconds
 */
export function timeBuffer() {
  return {
    address: NOUNS_CONTRACTS.NounsAuctionHouse.proxy as Address,
    abi: NounsAuctionHouseABI,
    functionName: 'timeBuffer' as const,
  };
}

/**
 * Get client ID that placed winning bid for a Noun
 * 
 * @param nounId - Noun ID to check
 * @returns Query config for wagmi useReadContract
 * 
 * @example
 * const { data: clientId } = useReadContract(biddingClient(BigInt(123)));
 * // clientId = 11 (Berry OS)
 */
export function biddingClient(nounId: bigint) {
  validateNounId(nounId);
  
  return {
    address: NOUNS_CONTRACTS.NounsAuctionHouse.proxy as Address,
    abi: NounsAuctionHouseABI,
    functionName: 'biddingClient' as const,
    args: [nounId],
  };
}

/**
 * Get historical settlement data
 * 
 * @param auctionCount - Number of auctions to fetch
 * @param skipEmptyValues - Skip auctions with no bids
 * @returns Query config for wagmi useReadContract
 * 
 * @example
 * const { data: settlements } = useReadContract(getSettlements(10, true));
 * // settlements = [{ blockTimestamp, amount, winner, nounId, clientId }, ...]
 */
export function getSettlements(auctionCount: bigint, skipEmptyValues: boolean = true) {
  return {
    address: NOUNS_CONTRACTS.NounsAuctionHouse.proxy as Address,
    abi: NounsAuctionHouseABI,
    functionName: 'getSettlements' as const,
    args: [auctionCount, skipEmptyValues],
  };
}

/**
 * Get settlement data for a range of Noun IDs
 * 
 * @param startId - Starting Noun ID
 * @param endId - Ending Noun ID
 * @param skipEmptyValues - Skip auctions with no bids
 * @returns Query config for wagmi useReadContract
 * 
 * @example
 * const { data: settlements } = useReadContract(getSettlementsRange(BigInt(100), BigInt(110), true));
 */
export function getSettlementsRange(startId: bigint, endId: bigint, skipEmptyValues: boolean = true) {
  validateNounId(startId);
  validateNounId(endId);
  
  return {
    address: NOUNS_CONTRACTS.NounsAuctionHouse.proxy as Address,
    abi: NounsAuctionHouseABI,
    functionName: 'getSettlements' as const,
    args: [startId, endId, skipEmptyValues],
  };
}

/**
 * Get historical prices for recent auctions
 * 
 * @param auctionCount - Number of auctions to fetch prices for
 * @returns Query config for wagmi useReadContract
 * 
 * @example
 * const { data: prices } = useReadContract(getPrices(BigInt(10)));
 * // prices = [amount1, amount2, ...] in wei
 */
export function getPrices(auctionCount: bigint) {
  return {
    address: NOUNS_CONTRACTS.NounsAuctionHouse.proxy as Address,
    abi: NounsAuctionHouseABI,
    functionName: 'getPrices' as const,
    args: [auctionCount],
  };
}
