/**
 * Nouns Auction House Helpers
 * Read and write utilities for auction contract
 */

// Read functions
export {
  isAuctionActive,
  hasAuctionEnded,
  isAuctionSettled,
  getTimeRemaining,
  calculateMinBid,
  isValidBid,
  getBidError,
  formatAuctionInfo,
  parseSettlement,
  calculateTotalVolume,
  calculateAveragePrice,
  findHighestPrice,
  findLowestPrice,
} from './read';

// Write functions
export {
  prepareCreateBidTransaction,
  prepareCreateBidWithClientTransaction,
  prepareCreateBidWithWeiTransaction,
  prepareSettleAuctionTransaction,
  validateBidParams,
  isSufficientBid,
} from './write';

// Contract reference
export { CONTRACTS, BERRY_OS_CLIENT_ID } from '../constants';
export { NounsAuctionHouseABI } from '../../abis';

