/**
 * Proposal Transaction Builders - Auction House Operations
 * Build proposal actions for auction house contract interactions
 */

import { Address } from 'viem';
import { CONTRACTS } from '../constants';
import type { ProposalActions } from '../types';
import { createProposalAction } from '../governance';

/**
 * Build proposal action to pause auction house
 * @returns Proposal action to pause auctions
 */
export function buildPauseAuctionHouseAction(): ProposalActions {
  return createProposalAction(
    CONTRACTS.NounsAuctionHouse.proxy as Address,
    BigInt(0),
    'pause()',
    []
  );
}

/**
 * Build proposal action to unpause auction house
 * @returns Proposal action to unpause auctions
 */
export function buildUnpauseAuctionHouseAction(): ProposalActions {
  return createProposalAction(
    CONTRACTS.NounsAuctionHouse.proxy as Address,
    BigInt(0),
    'unpause()',
    []
  );
}

/**
 * Build proposal action to set auction reserve price
 * @param reservePrice - New reserve price in wei
 * @returns Proposal action for setting reserve price
 */
export function buildSetReservePriceAction(
  reservePrice: bigint
): ProposalActions {
  return createProposalAction(
    CONTRACTS.NounsAuctionHouse.proxy as Address,
    BigInt(0),
    'setReservePrice(uint256)',
    [reservePrice]
  );
}

/**
 * Build proposal action to set auction time buffer
 * @param timeBuffer - New time buffer in seconds
 * @returns Proposal action for setting time buffer
 */
export function buildSetTimeBufferAction(
  timeBuffer: bigint
): ProposalActions {
  return createProposalAction(
    CONTRACTS.NounsAuctionHouse.proxy as Address,
    BigInt(0),
    'setTimeBuffer(uint256)',
    [timeBuffer]
  );
}

/**
 * Build proposal action to set minimum bid increment percentage
 * @param minBidIncrementPercentage - New percentage (e.g., 5 for 5%)
 * @returns Proposal action for setting min bid increment
 */
export function buildSetMinBidIncrementPercentageAction(
  minBidIncrementPercentage: number
): ProposalActions {
  return createProposalAction(
    CONTRACTS.NounsAuctionHouse.proxy as Address,
    BigInt(0),
    'setMinBidIncrementPercentage(uint8)',
    [minBidIncrementPercentage]
  );
}

/**
 * Build proposal action to set auction duration
 * @param duration - New duration in seconds
 * @returns Proposal action for setting duration
 */
export function buildSetAuctionDurationAction(
  duration: bigint
): ProposalActions {
  return createProposalAction(
    CONTRACTS.NounsAuctionHouse.proxy as Address,
    BigInt(0),
    'setDuration(uint256)',
    [duration]
  );
}

/**
 * Build proposal action to settle current auction
 * Note: This is rarely needed as a proposal since anyone can call it
 * @returns Proposal action to settle auction
 */
export function buildSettleAuctionAction(): ProposalActions {
  return createProposalAction(
    CONTRACTS.NounsAuctionHouse.proxy as Address,
    BigInt(0),
    'settleCurrentAndCreateNewAuction()',
    []
  );
}

/**
 * Build comprehensive auction configuration update
 * @param params - Object with auction parameters to update
 * @returns Combined proposal actions for all updates
 */
export function buildAuctionConfigUpdateAction(params: {
  reservePrice?: bigint;
  timeBuffer?: bigint;
  minBidIncrementPercentage?: number;
  duration?: bigint;
}): ProposalActions {
  const actions: ProposalActions[] = [];
  
  if (params.reservePrice !== undefined) {
    actions.push(buildSetReservePriceAction(params.reservePrice));
  }
  if (params.timeBuffer !== undefined) {
    actions.push(buildSetTimeBufferAction(params.timeBuffer));
  }
  if (params.minBidIncrementPercentage !== undefined) {
    actions.push(buildSetMinBidIncrementPercentageAction(params.minBidIncrementPercentage));
  }
  if (params.duration !== undefined) {
    actions.push(buildSetAuctionDurationAction(params.duration));
  }
  
  if (actions.length === 0) {
    throw new Error('At least one parameter must be provided');
  }
  
  // Combine all actions
  return actions.reduce((combined, action) => ({
    targets: [...combined.targets, ...action.targets],
    values: [...combined.values, ...action.values],
    signatures: [...combined.signatures, ...action.signatures],
    calldatas: [...combined.calldatas, ...action.calldatas],
  }));
}

