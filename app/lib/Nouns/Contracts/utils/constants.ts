/**
 * Nouns DAO Contract Constants
 * Shared constants used across helper functions
 */

import { NOUNS_CONTRACTS } from './addresses';

/**
 * Berry OS Client ID for rewards tracking
 * Used when placing bids, voting, and creating proposals
 */
export const BERRY_OS_CLIENT_ID = 11 as const;

/**
 * Chain configuration
 */
export const NOUNS_CHAIN_ID = 1; // Ethereum Mainnet
export const NOUNS_DEPLOY_BLOCK = 12985438;

/**
 * Governance constants
 */
export const PROPOSAL_STATES = {
  PENDING: 0,
  ACTIVE: 1,
  CANCELED: 2,
  DEFEATED: 3,
  SUCCEEDED: 4,
  QUEUED: 5,
  EXPIRED: 6,
  EXECUTED: 7,
  VETOED: 8,
  OBJECTION_PERIOD: 9,
  UPDATABLE: 10,
} as const;

export const VOTE_SUPPORT = {
  AGAINST: 0,
  FOR: 1,
  ABSTAIN: 2,
} as const;

/**
 * Auction constants
 */
export const AUCTION_DURATION = 24 * 60 * 60; // 24 hours in seconds
export const MIN_BID_INCREMENT_PERCENTAGE = 5; // 5%

/**
 * Contract addresses (re-export for convenience)
 */
export const CONTRACTS = NOUNS_CONTRACTS;

/**
 * Basis points (BPS) utilities
 */
export const BPS_DENOMINATOR = 10000;

export function bpsToPercentage(bps: number): number {
  return (bps / BPS_DENOMINATOR) * 100;
}

export function percentageToBps(percentage: number): number {
  return Math.round(percentage * 100);
}

/**
 * Time utilities
 */
export const SECONDS_PER_BLOCK = 12; // Approximate Ethereum block time

export function blocksToSeconds(blocks: number): number {
  return blocks * SECONDS_PER_BLOCK;
}

export function secondsToBlocks(seconds: number): number {
  return Math.ceil(seconds / SECONDS_PER_BLOCK);
}

