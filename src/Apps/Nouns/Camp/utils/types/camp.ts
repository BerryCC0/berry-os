/**
 * Camp Type Definitions
 * Extends Goldsky types with UI-specific fields
 */

import type { Proposal, Vote, Delegate, Account } from '@/app/lib/Nouns/Goldsky/utils/types';

// ============================================================================
// UI-Enhanced Types
// ============================================================================

/**
 * Proposal with UI state
 */
export interface UIProposal extends Proposal {
  isExpanded?: boolean;
  isLoading?: boolean;
  realTimeState?: number; // From contract read
  hasUserVoted?: boolean;
  userVote?: Vote;
}

/**
 * Delegate/Voter with UI state
 */
export interface UIDelegate extends Delegate {
  isExpanded?: boolean;
  ensName?: string;
  isCurrentUser?: boolean;
}

/**
 * Account with UI enhancements
 */
export interface UIAccount extends Account {
  ensName?: string;
  isCurrentUser?: boolean;
}

// ============================================================================
// Candidate Types (Data Proxy)
// ============================================================================

/**
 * Proposal Candidate from Data Proxy
 * Note: These are draft proposals, not yet on-chain as full proposals
 */
export interface Candidate {
  proposer: string;
  slug: string;
  description: string;
  targets: string[];
  values: string[];
  signatures: string[];
  calldatas: string[];
  proposalIdToUpdate: string;
  createdTimestamp: number;
  lastUpdatedTimestamp: number;
  canceled: boolean;
  requiredSignatures?: number;
  // UI state
  isExpanded?: boolean;
  isLoading?: boolean;
  feedbackCount?: number;
  feedbackSentiment?: {
    for: number;
    against: number;
    abstain: number;
  };
  signaturesList?: CandidateSignature[];
  canPromote?: boolean;
}

/**
 * Candidate Signature
 */
export interface CandidateSignature {
  id: string;
  signer: string;
  sig: string;
  reason: string;
  expirationTimestamp: number;
  createdTimestamp: number;
}

/**
 * Candidate Feedback
 */
export interface CandidateFeedback {
  msgSender: string;
  support: number; // 0=Against, 1=For, 2=Abstain
  reason: string;
  timestamp: number;
}

// ============================================================================
// Filter & Sort Options
// ============================================================================

/**
 * Proposal filter options
 */
export enum ProposalFilter {
  ALL = 'all',
  ACTIVE = 'active',
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  DEFEATED = 'defeated',
  QUEUED = 'queued',
  EXECUTED = 'executed',
  CANCELLED = 'cancelled',
  VETOED = 'vetoed',
}

/**
 * Proposal sort options
 */
export enum ProposalSort {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  MOST_VOTES = 'most_votes',
  ENDING_SOON = 'ending_soon',
}

/**
 * Voter/Delegate filter options
 */
export enum VoterFilter {
  ALL = 'all',
  ACTIVE_DELEGATES = 'active_delegates',
  TOKEN_HOLDERS = 'token_holders',
  WITH_VOTES = 'with_votes',
}

/**
 * Voter/Delegate sort options
 */
export enum VoterSort {
  MOST_POWER = 'most_power',
  MOST_REPRESENTED = 'most_represented',
  MOST_VOTES = 'most_votes',
  ALPHABETICAL = 'alphabetical',
}

/**
 * Candidate filter options
 */
export enum CandidateFilter {
  ALL = 'all',
  ACTIVE = 'active',
  CANCELED = 'canceled',
}

/**
 * Candidate sort options
 */
export enum CandidateSort {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  MOST_FEEDBACK = 'most_feedback',
}

// ============================================================================
// Component Props
// ============================================================================

/**
 * Voting action type
 */
export interface VoteAction {
  proposalId: string;
  support: number; // 0=Against, 1=For, 2=Abstain
  reason?: string;
}

/**
 * Delegation action
 */
export interface DelegationAction {
  delegatee: string;
}

/**
 * Transaction status
 */
export enum TransactionStatus {
  IDLE = 'idle',
  PREPARING = 'preparing',
  WAITING_SIGNATURE = 'waiting_signature',
  PENDING = 'pending',
  SUCCESS = 'success',
  ERROR = 'error',
}

/**
 * Transaction state
 */
export interface TransactionState {
  status: TransactionStatus;
  hash?: string;
  error?: string;
}

// ============================================================================
// Activity Feed Types
// ============================================================================

/**
 * Unified activity feed item type
 */
export enum ActivityItemType {
  PROPOSAL_VOTE = 'proposal_vote',
  PROPOSAL_FEEDBACK = 'proposal_feedback',
  CANDIDATE_SIGNATURE = 'candidate_signature',
  CANDIDATE_FEEDBACK = 'candidate_feedback',
  
  // Lifecycle events
  PROPOSAL_CREATED = 'proposal_created',
  PROPOSAL_UPDATED = 'proposal_updated',
  PROPOSAL_ENDED = 'proposal_ended',
  PROPOSAL_QUEUED = 'proposal_queued',
  PROPOSAL_EXECUTED = 'proposal_executed',
  CANDIDATE_CREATED = 'candidate_created',
  CANDIDATE_UPDATED = 'candidate_updated',
}

/**
 * Base activity item
 */
export interface BaseActivityItem {
  id: string;
  type: ActivityItemType;
  timestamp: number; // Unix timestamp for sorting
  voter: string; // Voter/signer address
  reason?: string;
  supportDetailed: number; // 0=Against, 1=For, 2=Abstain
  
  // Context
  contextId: string; // Proposal ID or Candidate ID
  contextTitle?: string; // Proposal title or Candidate slug
  contextType: 'proposal' | 'candidate';
  
  // Original data (for rendering)
  originalData: any;
  
  // Lifecycle event specific fields
  statusInfo?: string; // For proposal status changes (SUCCEEDED, DEFEATED, etc.)
  updateMessage?: string; // For proposal/candidate updates
  
  // Consolidation support
  consolidatedEvents?: BaseActivityItem[]; // Multiple events within time window
  consolidatedCount?: number; // Number of consolidated events
}

/**
 * Activity feed item with UI state
 */
export interface UIActivityItem extends BaseActivityItem {
  ensName?: string;
  isLoading?: boolean;
}

