/**
 * Data Proxy (Candidates/Feedback) Helpers
 * Read and write utilities for proposal candidates and feedback
 */

// Read functions
export {
  parseProposalCandidate,
  generateSlug,
  isValidSlug,
  parseFeedback,
  isUpdateCandidate,
  formatFeedbackSupport,
  calculateFeedbackSummary,
} from './read';

// Write functions
export {
  prepareCreateCandidateTransaction,
  prepareUpdateCandidateTransaction,
  prepareCancelCandidateTransaction,
  prepareAddSignatureTransaction,
  prepareSendFeedbackTransaction,
  prepareSendFeedbackBatchTransaction,
  validateCandidateParams,
  validateFeedbackParams,
} from './write';

// Contract reference
export { CONTRACTS } from '../constants';
export { DataProxyABI } from '../../abis';

