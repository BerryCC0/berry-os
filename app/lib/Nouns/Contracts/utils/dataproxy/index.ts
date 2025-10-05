/**
 * Data Proxy (Candidates/Feedback) Helpers
 * Read and write utilities for proposal candidates and feedback
 */

// Read functions
export {
  // Utility functions
  parseProposalCandidate,
  generateSlug,
  isValidSlug,
  parseFeedback,
  isUpdateCandidate,
  formatFeedbackSupport,
  calculateFeedbackSummary,
  // Contract read functions
  getCreateCandidateCost,
  getUpdateCandidateCost,
  getCandidate,
  getFeeRecipient,
  getNounsDAOAddress,
  getNounsTokenAddress,
} from './read';

// Write functions
export {
  prepareCreateCandidateTransaction,
  prepareUpdateCandidateTransaction,
  prepareCancelCandidateTransaction,
  prepareAddSignatureTransaction,
  prepareSendFeedbackTransaction,
  prepareSendFeedbackBatchTransaction,
  // Standardized wrapper
  prepareCreateProposalCandidate,
  // Utilities
  validateCandidateParams,
  validateFeedbackParams,
} from './write';

// Contract reference
export { CONTRACTS } from '../constants';
export { DataProxyABI } from '../../abis';

