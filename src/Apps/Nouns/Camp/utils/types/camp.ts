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
  // UI state
  isExpanded?: boolean;
  isLoading?: boolean;
  feedbackCount?: number;
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

