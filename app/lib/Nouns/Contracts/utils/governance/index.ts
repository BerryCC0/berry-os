/**
 * Nouns DAO Governance Helpers
 * Read and write utilities for governance contract
 */

// Read functions
export {
  // Utility functions
  getProposalStateName,
  isProposalActive,
  hasProposalSucceeded,
  isProposalExecutable,
  isProposalFinalized,
  calculateQuorumProgress,
  hasReachedQuorum,
  calculateVotePercentages,
  canVoteOnProposal,
  formatProposalInfo,
  calculateProposalThreshold,
  canPropose,
  calculateDynamicQuorum,
  isInObjectionPeriod,
  parseVoteReceipt,
  getVoteSupportName,
  // Contract read functions
  getProposalState,
  getProposalDetails,
  getProposalVotes,
  getVotingPower,
  getQuorumVotes,
  hasVoted,
  getProposalThreshold,
  getForkThreshold,
  getForkEndTimestamp,
  getDynamicQuorumParams,
  getVotingDelay,
  getVotingPeriod,
  getProposalCount,
} from './read';

// Write functions
export {
  prepareVoteTransaction,
  prepareVoteForTransaction,
  prepareVoteAgainstTransaction,
  prepareAbstainTransaction,
  prepareProposeTransaction,
  prepareCancelTransaction,
  prepareQueueTransaction,
  prepareExecuteTransaction,
  // Standardized wrappers
  prepareCastVote,
  prepareCastVoteWithReason,
  prepareQueueProposal,
  prepareExecuteProposal,
  // Utilities
  isValidVoteSupport,
  validateProposalActions,
  encodeFunctionCall,
  createProposalAction,
  combineProposalActions,
} from './write';

// Contract reference
export { CONTRACTS, BERRY_OS_CLIENT_ID, VOTE_SUPPORT, PROPOSAL_STATES } from '../constants';
export { NounsDAOLogicV3ABI } from '../../abis';

