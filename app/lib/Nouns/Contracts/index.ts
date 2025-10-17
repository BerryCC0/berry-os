/**
 * Nouns DAO Smart Contracts Integration
 * Complete user-facing API for interacting with all Nouns contracts
 * 
 * @example
 * // Using actions directly
 * import { AuctionActions } from '@/app/lib/Nouns/Contracts';
 * const config = AuctionActions.createBid(BigInt(123), "1.5");
 * await writeContractAsync(config);
 * 
 * @example
 * // Using hooks
 * import { useAuctionActions } from '@/app/lib/Nouns/Contracts';
 * const { createBid, currentAuction, isPending } = useAuctionActions();
 * await createBid(currentAuction.nounId, "1.5");
 */

// ============================================================================
// ACTIONS (Transaction Builders)
// ============================================================================

export {
  AuctionActions,
  GovernanceActions,
  TokenActions,
  DataProxyActions,
  RewardsActions,
  NounsTokenActions,
} from './actions';

// ============================================================================
// HOOKS (React Hooks)
// ============================================================================

export {
  useAuctionActions,
  useGovernanceActions,
  useTokenActions,
  useDataProxyActions,
  useRewardsActions,
} from './hooks';

// ============================================================================
// UTILITIES
// ============================================================================

export {
  // Contract addresses
  NOUNS_CONTRACTS,
  CONTRACTS_BY_CATEGORY,
  getContractAddress,
  getImplementationAddress,
  getAllAddresses,
  isNounsContract,
  getContractName,
  EXTERNAL_CONTRACTS,
  
  // Constants
  BERRY_OS_CLIENT_ID,
  NOUNS_CHAIN_ID,
  NOUNS_DEPLOY_BLOCK,
  PROPOSAL_STATES,
  VOTE_SUPPORT,
  BPS_DENOMINATOR,
  SECONDS_PER_BLOCK,
  
  // Formatting
  formatAddress,
  formatEth,
  parseEth,
  formatNounId,
  formatVotes,
  formatProposalId,
  formatTimeRemaining,
  formatDate,
  formatDateTime,
  formatPercentage,
  formatBpsToPercentage,
  getEtherscanAddressLink,
  getEtherscanTxLink,
  truncateText,
  
  // Calculations
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
  bpsToPercentage,
  percentageToBps,
  blocksToSeconds,
  secondsToBlocks,
  
  // Types
  type NounSeed,
  type AuctionState,
  type AuctionSettlement,
  type ProposalData,
  type VoteReceipt,
  type ProposalActions,
  type ProposalWithActions,
  type DynamicQuorumParams,
  type ProposalCandidate,
  type ClientMetadata,
  type AuctionInfo,
  type ProposalInfo,
  type VotingPower,
} from './utils';

// ============================================================================
// ABIs
// ============================================================================

export {
  NounsTokenABI,
  NounsAuctionHouseABI,
  NounsDAOLogicV3ABI,
  NounsDAOAdminABI,
  TreasuryTimelockABI,
  DataProxyABI,
  NounsDescriptorV3ABI,
  ClientRewardsABI,
  TokenBuyerABI,
  PayerABI,
  StreamFactoryABI,
  NounsTreasuryV1ABI,
  ForkEscrowABI,
  ForkDAODeployerABI,
  NounsSeederABI,
} from './abis';