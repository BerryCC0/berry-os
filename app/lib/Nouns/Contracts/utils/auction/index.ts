/**
 * Nouns Auction House Helpers
 * Read and write utilities for auction contract
 */

// Read functions
export {
  // Utility functions
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
  // Contract read functions
  getCurrentAuction,
  getReservePrice,
  getTimeBuffer,
  getMinBidIncrement,
  getDuration,
  isPaused,
  getSettlement,
  getSettlements,
  getPrices,
} from './read';

// Write functions
export {
  prepareCreateBidTransaction,
  prepareCreateBidWithClientTransaction,
  prepareCreateBidWithWeiTransaction,
  prepareSettleAuctionTransaction,
  // Standardized wrappers
  prepareCreateBid,
  prepareSettleAuction,
  // Utilities
  validateBidParams,
  isSufficientBid,
} from './write';

// Contract reference
export { CONTRACTS, BERRY_OS_CLIENT_ID } from '../constants';
export { NounsAuctionHouseABI } from '../../abis';

