/**
 * Auction Helper Functions
 * Business logic for auction operations (pure TypeScript)
 */

import type { Auction, Bid } from '@/app/lib/Nouns/Goldsky/utils/types';
import { formatEther } from 'viem';

/**
 * Format countdown timer
 */
export function formatCountdown(secondsRemaining: number): string {
  if (secondsRemaining <= 0) return 'Ended';
  
  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = Math.floor(secondsRemaining % 60);
  
  return `${hours}h ${minutes}m ${seconds}s`;
}

/**
 * Format timestamp to readable date
 */
export function formatTimestamp(timestamp: string): string {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

/**
 * Format current date
 */
export function formatCurrentDate(): string {
  return new Date().toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

/**
 * Calculate time remaining in seconds
 */
export function getTimeRemaining(endTime: string): number {
  const now = Math.floor(Date.now() / 1000);
  const end = Number(endTime);
  return Math.max(0, end - now);
}

/**
 * Check if viewing a Nounder Noun (every 10th Noun)
 */
export function isNounderNoun(nounId: string): boolean {
  return Number(nounId) % 10 === 0;
}

/**
 * Format bid amount from wei to ETH
 */
export function formatBidAmount(amountWei: string): string {
  return formatEther(BigInt(amountWei));
}

/**
 * Get minimum next bid based on current bid and increment percentage
 */
export function getMinimumNextBid(
  currentBidWei: string, 
  incrementPercentage: number = 5
): bigint {
  const current = BigInt(currentBidWei);
  const increment = (current * BigInt(incrementPercentage)) / BigInt(100);
  return current + increment;
}

/**
 * Check if auction is active
 */
export function isAuctionActive(auction: Auction): boolean {
  if (auction.settled) return false;
  return getTimeRemaining(auction.endTime) > 0;
}

/**
 * Get winning bidder from auction
 */
export function getWinningBidder(auction: Auction): string | null {
  if (!auction.bids || auction.bids.length === 0) {
    return null;
  }
  
  // Bids should be ordered by amount desc, get the first one
  return auction.bids[0].bidder.id;
}

/**
 * Sort bids by timestamp descending (most recent first)
 */
export function sortBidsByTime(bids: Bid[]): Bid[] {
  return [...bids].sort((a, b) => 
    Number(b.blockTimestamp) - Number(a.blockTimestamp)
  );
}

/**
 * Check if address is the winning bidder
 */
export function isWinningBidder(auction: Auction, address: string): boolean {
  const winner = getWinningBidder(auction);
  return winner?.toLowerCase() === address?.toLowerCase();
}

