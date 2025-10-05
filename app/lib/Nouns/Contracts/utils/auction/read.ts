/**
 * Nouns Auction House - Read Functions
 * Pure functions and utilities for reading auction data
 */

import { Address } from 'viem';
import type { AuctionState, AuctionInfo, AuctionSettlement } from '../types';
import { formatTimeRemaining } from '../formatting';

/**
 * Check if auction is active
 * @param auction - Auction state
 * @returns True if auction is currently active
 */
export function isAuctionActive(auction: AuctionState): boolean {
  const now = Math.floor(Date.now() / 1000);
  return !auction.settled && Number(auction.endTime) > now;
}

/**
 * Check if auction has ended
 * @param auction - Auction state
 * @returns True if auction end time has passed
 */
export function hasAuctionEnded(auction: AuctionState): boolean {
  const now = Math.floor(Date.now() / 1000);
  return Number(auction.endTime) <= now;
}

/**
 * Check if auction is settled
 * @param auction - Auction state
 * @returns True if auction is settled
 */
export function isAuctionSettled(auction: AuctionState): boolean {
  return auction.settled;
}

/**
 * Get time remaining in auction
 * @param auction - Auction state
 * @returns Seconds remaining (0 if ended)
 */
export function getTimeRemaining(auction: AuctionState): number {
  const now = Math.floor(Date.now() / 1000);
  const remaining = Number(auction.endTime) - now;
  return Math.max(0, remaining);
}

/**
 * Calculate minimum bid for auction
 * @param currentAmount - Current bid amount
 * @param minBidIncrementPercentage - Minimum bid increment percentage
 * @param reservePrice - Reserve price
 * @returns Minimum valid bid amount
 */
export function calculateMinBid(
  currentAmount: bigint,
  minBidIncrementPercentage: number,
  reservePrice: bigint
): bigint {
  // If no bids yet, return reserve price
  if (currentAmount === BigInt(0)) {
    return reservePrice;
  }
  
  // Calculate minimum increment
  const increment = (currentAmount * BigInt(minBidIncrementPercentage)) / BigInt(100);
  return currentAmount + increment;
}

/**
 * Check if bid amount is valid
 * @param bidAmount - Proposed bid amount
 * @param currentAmount - Current bid amount
 * @param minBidIncrementPercentage - Minimum bid increment percentage
 * @param reservePrice - Reserve price
 * @returns True if bid is valid
 */
export function isValidBid(
  bidAmount: bigint,
  currentAmount: bigint,
  minBidIncrementPercentage: number,
  reservePrice: bigint
): boolean {
  const minBid = calculateMinBid(currentAmount, minBidIncrementPercentage, reservePrice);
  return bidAmount >= minBid;
}

/**
 * Get error message for invalid bid
 * @param bidAmount - Proposed bid amount
 * @param currentAmount - Current bid amount
 * @param minBidIncrementPercentage - Minimum bid increment percentage
 * @param reservePrice - Reserve price
 * @returns Error message or null if valid
 */
export function getBidError(
  bidAmount: bigint,
  currentAmount: bigint,
  minBidIncrementPercentage: number,
  reservePrice: bigint
): string | null {
  const minBid = calculateMinBid(currentAmount, minBidIncrementPercentage, reservePrice);
  
  if (bidAmount < minBid) {
    return `Bid must be at least ${minBid} wei`;
  }
  
  return null;
}

/**
 * Format auction info for display
 * @param auction - Auction state
 * @param minBidIncrementPercentage - Minimum bid increment percentage
 * @param reservePrice - Reserve price
 * @returns Formatted auction information
 */
export function formatAuctionInfo(
  auction: AuctionState,
  minBidIncrementPercentage: number,
  reservePrice: bigint
): AuctionInfo {
  const timeRemaining = getTimeRemaining(auction);
  const minBidAmount = calculateMinBid(auction.amount, minBidIncrementPercentage, reservePrice);
  
  return {
    ...auction,
    isActive: isAuctionActive(auction),
    hasEnded: hasAuctionEnded(auction),
    timeRemaining,
    minBidAmount,
  };
}

/**
 * Parse auction settlement data
 * @param settlement - Raw settlement data from contract
 * @returns Parsed settlement object
 */
export function parseSettlement(settlement: readonly [number, bigint, Address, bigint, number]): AuctionSettlement {
  return {
    blockTimestamp: settlement[0],
    amount: settlement[1],
    winner: settlement[2],
    nounId: settlement[3],
    clientId: settlement[4],
  };
}

/**
 * Calculate total auction volume
 * @param settlements - Array of settlements
 * @returns Total ETH volume
 */
export function calculateTotalVolume(settlements: AuctionSettlement[]): bigint {
  return settlements.reduce((total, settlement) => total + settlement.amount, BigInt(0));
}

/**
 * Calculate average auction price
 * @param settlements - Array of settlements
 * @returns Average price or BigInt(0) if no settlements
 */
export function calculateAveragePrice(settlements: AuctionSettlement[]): bigint {
  if (settlements.length === 0) return BigInt(0);
  const total = calculateTotalVolume(settlements);
  return total / BigInt(settlements.length);
}

/**
 * Find highest auction price
 * @param settlements - Array of settlements
 * @returns Highest price or BigInt(0) if no settlements
 */
export function findHighestPrice(settlements: AuctionSettlement[]): bigint {
  if (settlements.length === 0) return BigInt(0);
  return settlements.reduce((max, settlement) => 
    settlement.amount > max ? settlement.amount : max, BigInt(0)
  );
}

/**
 * Find lowest auction price
 * @param settlements - Array of settlements
 * @returns Lowest price or BigInt(0) if no settlements
 */
export function findLowestPrice(settlements: AuctionSettlement[]): bigint {
  if (settlements.length === 0) return BigInt(0);
  return settlements.reduce((min, settlement) => 
    settlement.amount < min || min === BigInt(0) ? settlement.amount : min, BigInt(0)
  );
}

