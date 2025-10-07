/**
 * Nouns Contracts Utilities
 * Pure TypeScript utilities for Nouns DAO contracts
 */

// Contract addresses
export * from './addresses';

// Constants (excluding duplicates from addresses and calculations)
export {
  BERRY_OS_CLIENT_ID,
  PROPOSAL_STATES,
  VOTE_SUPPORT,
  AUCTION_DURATION,
  MIN_BID_INCREMENT_PERCENTAGE,
  CONTRACTS,
} from './constants';

// Types
export * from './types';

// Formatting utilities
export * from './formatting';

// Calculation utilities (excluding duplicates from constants)
export {
  calculateMinBid,
  isAuctionActive,
  hasAuctionEnded,
  getTimeRemaining,
  isValidBid,
  calculateVotePercentages,
  calculateQuorumProgress,
  hasReachedQuorum,
  hasProposalPassed,
  canPropose,
  getBlocksUntilVoting,
  getBlocksRemaining,
  estimateTimeFromBlocks,
  hasNouns,
  hasVotingPower,
  isDelegatedToSelf,
  calculateBaseVotingPower,
  BPS_DENOMINATOR,
  bpsToPercentage,
  percentageToBps,
  SECONDS_PER_BLOCK,
  blocksToSeconds,
  secondsToBlocks,
} from './calculations';
