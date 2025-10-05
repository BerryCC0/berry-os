/**
 * Nouns DAO - Auction Utilities
 * 
 * Pure business logic for Noun auction operations
 */

import type { Auction, Bid, Noun } from './types';
import { formatEther, parseEther } from 'viem';

// ============================================================================
// Validation
// ============================================================================

/**
 * Checks if object is a valid Auction
 */
export function isValidAuction(auction: any): auction is Auction {
  return Boolean(
    auction &&
    typeof auction.id === 'string' &&
    auction.noun &&
    typeof auction.amount === 'string' &&
    typeof auction.startTime === 'string' &&
    typeof auction.endTime === 'string' &&
    typeof auction.settled === 'boolean'
  );
}

/**
 * Checks if object is a valid Bid
 */
export function isValidBid(bid: any): bid is Bid {
  return Boolean(
    bid &&
    typeof bid.id === 'string' &&
    typeof bid.amount === 'string' &&
    bid.bidder &&
    bid.noun
  );
}

// ============================================================================
// Auction Status
// ============================================================================

/**
 * Checks if auction is active
 */
export function isActive(auction: Auction): boolean {
  if (auction.settled) return false;
  
  const now = Math.floor(Date.now() / 1000);
  const endTime = parseInt(auction.endTime, 10);
  
  return now < endTime;
}

/**
 * Checks if auction has ended
 */
export function hasEnded(auction: Auction): boolean {
  const now = Math.floor(Date.now() / 1000);
  const endTime = parseInt(auction.endTime, 10);
  
  return now >= endTime;
}

/**
 * Checks if auction is settled
 */
export function isSettled(auction: Auction): boolean {
  return auction.settled;
}

/**
 * Gets time remaining in seconds
 */
export function getTimeRemaining(auction: Auction): number {
  if (auction.settled) return 0;
  
  const now = Math.floor(Date.now() / 1000);
  const endTime = parseInt(auction.endTime, 10);
  
  return Math.max(0, endTime - now);
}

/**
 * Gets time until auction starts (if not started)
 */
export function getTimeUntilStart(auction: Auction): number {
  const now = Math.floor(Date.now() / 1000);
  const startTime = parseInt(auction.startTime, 10);
  
  return Math.max(0, startTime - now);
}

/**
 * Gets auction duration in seconds
 */
export function getAuctionDuration(auction: Auction): number {
  const startTime = parseInt(auction.startTime, 10);
  const endTime = parseInt(auction.endTime, 10);
  
  return endTime - startTime;
}

// ============================================================================
// Time Formatting
// ============================================================================

/**
 * Formats time remaining as string
 */
export function formatTimeRemaining(auction: Auction): string {
  const seconds = getTimeRemaining(auction);
  
  if (seconds === 0) return 'Ended';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

/**
 * Gets auction start date
 */
export function getStartDate(auction: Auction): Date {
  return new Date(parseInt(auction.startTime, 10) * 1000);
}

/**
 * Gets auction end date
 */
export function getEndDate(auction: Auction): Date {
  return new Date(parseInt(auction.endTime, 10) * 1000);
}

/**
 * Formats auction start date
 */
export function formatStartDate(auction: Auction): string {
  return getStartDate(auction).toLocaleString();
}

/**
 * Formats auction end date
 */
export function formatEndDate(auction: Auction): string {
  return getEndDate(auction).toLocaleString();
}

// ============================================================================
// Bid Amounts
// ============================================================================

/**
 * Gets current bid amount in ETH
 */
export function getCurrentBidETH(auction: Auction): string {
  return formatEther(BigInt(auction.amount));
}

/**
 * Gets bid amount in ETH
 */
export function getBidAmountETH(bid: Bid): string {
  return formatEther(BigInt(bid.amount));
}

/**
 * Formats bid amount with symbol
 */
export function formatBidAmount(bid: Bid): string {
  return `${getBidAmountETH(bid)} ETH`;
}

/**
 * Formats current auction amount with symbol
 */
export function formatCurrentBid(auction: Auction): string {
  return `${getCurrentBidETH(auction)} ETH`;
}

/**
 * Calculates minimum next bid (current + 5%)
 */
export function getMinimumNextBid(auction: Auction): string {
  const current = BigInt(auction.amount);
  const minimum = (current * BigInt(105)) / BigInt(100); // +5%
  
  return formatEther(minimum);
}

/**
 * Compares two bids
 */
export function compareBids(bid1: Bid, bid2: Bid): number {
  const amount1 = BigInt(bid1.amount);
  const amount2 = BigInt(bid2.amount);
  
  if (amount1 < amount2) return -1;
  if (amount1 > amount2) return 1;
  return 0;
}

// ============================================================================
// Bid Operations
// ============================================================================

/**
 * Gets highest bid from auction
 */
export function getHighestBid(auction: Auction): Bid | undefined {
  if (!auction.bids || auction.bids.length === 0) return undefined;
  
  return auction.bids.reduce((highest, bid) => {
    return compareBids(bid, highest) > 0 ? bid : highest;
  });
}

/**
 * Gets winning bidder
 */
export function getWinningBidder(auction: Auction): string | null {
  if (!auction.settled || !auction.bidder) return null;
  return auction.bidder.bidder.id;
}

/**
 * Checks if address is winning bidder
 */
export function isWinningBidder(auction: Auction, address: string): boolean {
  const winner = getWinningBidder(auction);
  if (!winner) return false;
  return winner.toLowerCase() === address.toLowerCase();
}

/**
 * Gets total number of bids
 */
export function getBidCount(auction: Auction): number {
  return auction.bids?.length || 0;
}

/**
 * Gets unique bidders count
 */
export function getUniqueBiddersCount(auction: Auction): number {
  if (!auction.bids) return 0;
  
  const uniqueBidders = new Set(
    auction.bids.map(bid => bid.bidder.id.toLowerCase())
  );
  
  return uniqueBidders.size;
}

/**
 * Checks if address has bid on auction
 */
export function hasBid(auction: Auction, address: string): boolean {
  if (!auction.bids) return false;
  
  return auction.bids.some(
    bid => bid.bidder.id.toLowerCase() === address.toLowerCase()
  );
}

/**
 * Gets bids by address
 */
export function getBidsByAddress(auction: Auction, address: string): Bid[] {
  if (!auction.bids) return [];
  
  const lowerAddress = address.toLowerCase();
  return auction.bids.filter(
    bid => bid.bidder.id.toLowerCase() === lowerAddress
  );
}

/**
 * Gets latest bid by address
 */
export function getLatestBidByAddress(
  auction: Auction,
  address: string
): Bid | undefined {
  const bids = getBidsByAddress(auction, address);
  if (bids.length === 0) return undefined;
  
  return bids.reduce((latest, bid) => {
    const bidTime = parseInt(bid.blockTimestamp, 10);
    const latestTime = parseInt(latest.blockTimestamp, 10);
    return bidTime > latestTime ? bid : latest;
  });
}

// ============================================================================
// Bid Sorting
// ============================================================================

/**
 * Sorts bids by amount (highest first)
 */
export function sortBidsByAmountDesc(bids: Bid[]): Bid[] {
  return [...bids].sort((a, b) => compareBids(b, a));
}

/**
 * Sorts bids by amount (lowest first)
 */
export function sortBidsByAmountAsc(bids: Bid[]): Bid[] {
  return [...bids].sort((a, b) => compareBids(a, b));
}

/**
 * Sorts bids by time (newest first)
 */
export function sortBidsByTimeDesc(bids: Bid[]): Bid[] {
  return [...bids].sort((a, b) => {
    const timeA = parseInt(a.blockTimestamp, 10);
    const timeB = parseInt(b.blockTimestamp, 10);
    return timeB - timeA;
  });
}

/**
 * Sorts bids by time (oldest first)
 */
export function sortBidsByTimeAsc(bids: Bid[]): Bid[] {
  return [...bids].sort((a, b) => {
    const timeA = parseInt(a.blockTimestamp, 10);
    const timeB = parseInt(b.blockTimestamp, 10);
    return timeA - timeB;
  });
}

// ============================================================================
// Auction Filtering
// ============================================================================

/**
 * Filters auctions by settled status
 */
export function filterBySettled(auctions: Auction[], settled: boolean): Auction[] {
  return auctions.filter(auction => auction.settled === settled);
}

/**
 * Gets active auctions
 */
export function getActiveAuctions(auctions: Auction[]): Auction[] {
  return auctions.filter(auction => isActive(auction));
}

/**
 * Gets settled auctions
 */
export function getSettledAuctions(auctions: Auction[]): Auction[] {
  return filterBySettled(auctions, true);
}

/**
 * Filters auctions by minimum bid amount
 */
export function filterByMinimumBid(auctions: Auction[], minETH: string): Auction[] {
  const minWei = parseEther(minETH);
  
  return auctions.filter(auction => {
    const amount = BigInt(auction.amount);
    return amount >= minWei;
  });
}

/**
 * Filters auctions by date range
 */
export function filterByDateRange(
  auctions: Auction[],
  startDate: Date,
  endDate: Date
): Auction[] {
  const startTime = Math.floor(startDate.getTime() / 1000);
  const endTime = Math.floor(endDate.getTime() / 1000);
  
  return auctions.filter(auction => {
    const auctionStart = parseInt(auction.startTime, 10);
    return auctionStart >= startTime && auctionStart <= endTime;
  });
}

// ============================================================================
// Auction Sorting
// ============================================================================

/**
 * Sorts auctions by start time (newest first)
 */
export function sortByNewest(auctions: Auction[]): Auction[] {
  return [...auctions].sort((a, b) => {
    const timeA = parseInt(a.startTime, 10);
    const timeB = parseInt(b.startTime, 10);
    return timeB - timeA;
  });
}

/**
 * Sorts auctions by start time (oldest first)
 */
export function sortByOldest(auctions: Auction[]): Auction[] {
  return [...auctions].sort((a, b) => {
    const timeA = parseInt(a.startTime, 10);
    const timeB = parseInt(b.startTime, 10);
    return timeA - timeB;
  });
}

/**
 * Sorts auctions by bid amount (highest first)
 */
export function sortByHighestBid(auctions: Auction[]): Auction[] {
  return [...auctions].sort((a, b) => {
    const amountA = BigInt(a.amount);
    const amountB = BigInt(b.amount);
    if (amountA < amountB) return 1;
    if (amountA > amountB) return -1;
    return 0;
  });
}

/**
 * Sorts auctions by bid amount (lowest first)
 */
export function sortByLowestBid(auctions: Auction[]): Auction[] {
  return [...auctions].sort((a, b) => {
    const amountA = BigInt(a.amount);
    const amountB = BigInt(b.amount);
    if (amountA < amountB) return -1;
    if (amountA > amountB) return 1;
    return 0;
  });
}

// ============================================================================
// Statistics
// ============================================================================

/**
 * Gets average auction price in ETH
 */
export function getAverageAuctionPrice(auctions: Auction[]): string {
  if (auctions.length === 0) return '0';
  
  const total = auctions.reduce((sum, auction) => {
    return sum + BigInt(auction.amount);
  }, BigInt(0));
  
  const average = total / BigInt(auctions.length);
  return formatEther(average);
}

/**
 * Gets total volume in ETH
 */
export function getTotalVolume(auctions: Auction[]): string {
  const total = auctions.reduce((sum, auction) => {
    return sum + BigInt(auction.amount);
  }, BigInt(0));
  
  return formatEther(total);
}

/**
 * Gets highest auction price
 */
export function getHighestAuctionPrice(auctions: Auction[]): string {
  if (auctions.length === 0) return '0';
  
  const highest = auctions.reduce((max, auction) => {
    const amount = BigInt(auction.amount);
    return amount > max ? amount : max;
  }, BigInt(0));
  
  return formatEther(highest);
}

/**
 * Gets lowest auction price
 */
export function getLowestAuctionPrice(auctions: Auction[]): string {
  if (auctions.length === 0) return '0';
  
  const lowest = auctions.reduce((min, auction) => {
    const amount = BigInt(auction.amount);
    return amount < min ? amount : min;
  }, BigInt(auctions[0].amount));
  
  return formatEther(lowest);
}

// ============================================================================
// Display & Formatting
// ============================================================================

/**
 * Gets auction display name
 */
export function getAuctionDisplayName(auction: Auction): string {
  return `Noun ${auction.noun.id} Auction`;
}

/**
 * Gets auction summary
 */
export function getAuctionSummary(auction: Auction): string {
  const status = auction.settled
    ? 'Settled'
    : isActive(auction)
    ? 'Active'
    : 'Ended';
  
  return `${getAuctionDisplayName(auction)} - ${formatCurrentBid(auction)} - ${status}`;
}

/**
 * Gets Nouns.wtf auction URL
 */
export function getAuctionUrl(auction: Auction): string {
  return `https://nouns.wtf/noun/${auction.noun.id}`;
}

