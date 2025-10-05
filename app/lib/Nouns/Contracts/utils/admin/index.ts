/**
 * Nouns DAO Admin Contract Helpers
 * Contract: 0xd7c7c3c447Df757a77C81FcFf07f10bB22d98f4a
 * 
 * Manages DAO configuration parameters including:
 * - Voting parameters (delay, period, thresholds)
 * - Quorum settings (min/max BPS, coefficients)
 * - Fork mechanism (periods, thresholds, escrow)
 * - Admin and vetoer management
 * - Timelock configuration
 * 
 * @see https://nouns.wtf
 */

// Read functions (view/pure)
export {
  // Configuration Limits
  getMaxForkPeriod,
  getMinForkPeriod,
  getMaxObjectionPeriodBlocks,
  getMaxUpdatablePeriodBlocks,
  getMaxVotingDelayBlocks,
  getMinVotingDelayBlocks,
  getMaxVotingPeriodBlocks,
  getMinVotingPeriodBlocks,
  getMaxProposalThresholdBPS,
  getMinProposalThresholdBPS,
  getMaxQuorumVotesBPSUpperBound,
  getMinQuorumVotesBPSLowerBound,
  getMinQuorumVotesBPSUpperBound,
  
  // Validation Helpers
  isValidForkPeriod,
  isValidVotingDelay,
  isValidVotingPeriod,
  isValidProposalThresholdBPS,
  isValidQuorumBPS,
  
  // Formatting Helpers
  formatBPS,
  formatBlocksAsTime,
  formatForkPeriod,
  
  // Batch Queries
  getAllConfigLimitsQueries,
  
  // Types
  type DAOConfigLimits
} from './read';

// Write functions (transactions)
export {
  // Admin Management
  prepareSetAdmin,
  prepareSetPendingAdmin,
  prepareAcceptAdmin,
  
  // Vetoer Management
  prepareSetVetoer,
  prepareSetPendingVetoer,
  prepareAcceptVetoer,
  
  // Voting Configuration
  prepareSetVotingDelay,
  prepareSetVotingPeriod,
  prepareSetProposalThresholdBPS,
  prepareSetObjectionPeriodDuration,
  prepareSetProposalUpdatablePeriod,
  prepareSetLastMinuteWindow,
  
  // Quorum Configuration
  prepareSetMinQuorumVotesBPS,
  prepareSetMaxQuorumVotesBPS,
  prepareSetQuorumCoefficient,
  
  // Fork Configuration
  prepareSetForkPeriod,
  prepareSetForkThreshold,
  prepareSetForkEscrow,
  prepareSetForkDAODeployer,
  prepareSetERC20TokensToIncludeInFork,
  
  // Timelock Configuration
  prepareSetTimelocksAndAdmin,
  
  // Treasury Management
  prepareWithdraw,
  
  // Types
  type VotingConfig,
  type QuorumConfig,
  type ForkConfig
} from './write';

/**
 * DAO Admin Contract Address
 */
export const DAO_ADMIN_ADDRESS = '0xd7c7c3c447Df757a77C81FcFf07f10bB22d98f4a' as const;

/**
 * Usage Examples:
 * 
 * ```typescript
 * import { useReadContract, useWriteContract } from 'wagmi';
 * import { AdminHelpers } from '@/app/lib/Nouns/Contracts/utils';
 * 
 * // Read max fork period
 * const { data: maxPeriod } = useReadContract(
 *   AdminHelpers.getMaxForkPeriod()
 * );
 * 
 * // Set voting delay (admin only)
 * const { writeContract } = useWriteContract();
 * writeContract(
 *   AdminHelpers.prepareSetVotingDelay(7200n) // ~1 day at 12s/block
 * );
 * 
 * // Set quorum parameters (admin only)
 * writeContract(
 *   AdminHelpers.prepareSetMinQuorumVotesBPS(1000) // 10%
 * );
 * 
 * // Configure fork settings (admin only)
 * writeContract(
 *   AdminHelpers.prepareSetForkPeriod(604800n) // 7 days
 * );
 * 
 * // Format values for display
 * const formatted = AdminHelpers.formatBPS(1000n); // "10.00%"
 * const timeEstimate = AdminHelpers.formatBlocksAsTime(7200n); // "~1d 0h"
 * ```
 */

