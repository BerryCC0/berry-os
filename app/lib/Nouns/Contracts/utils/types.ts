/**
 * Nouns DAO Contract Types
 * Shared TypeScript types for helper functions
 */

import { Address } from 'viem';

/**
 * Noun Seed - trait indices for generating artwork
 */
export interface NounSeed {
  background: number;
  body: number;
  accessory: number;
  head: number;
  glasses: number;
}

/**
 * Auction State
 */
export interface AuctionState {
  nounId: bigint;
  amount: bigint;
  startTime: bigint;
  endTime: bigint;
  bidder: Address;
  settled: boolean;
}

/**
 * Auction Settlement Data
 */
export interface AuctionSettlement {
  blockTimestamp: number;
  amount: bigint;
  winner: Address;
  nounId: bigint;
  clientId: number;
}

/**
 * Proposal State
 */
export interface ProposalData {
  id: bigint;
  proposer: Address;
  proposalThreshold: bigint;
  quorumVotes: bigint;
  eta: bigint;
  startBlock: bigint;
  endBlock: bigint;
  forVotes: bigint;
  againstVotes: bigint;
  abstainVotes: bigint;
  canceled: boolean;
  vetoed: boolean;
  executed: boolean;
  totalSupply: bigint;
  creationBlock: bigint;
}

/**
 * Vote Receipt
 */
export interface VoteReceipt {
  hasVoted: boolean;
  support: number;
  votes: bigint;
}

/**
 * Proposal Actions
 */
export interface ProposalActions {
  targets: Address[];
  values: bigint[];
  signatures: string[];
  calldatas: `0x${string}`[];
}

/**
 * Proposal with Actions
 */
export interface ProposalWithActions extends ProposalData {
  description: string;
  actions: ProposalActions;
}

/**
 * Dynamic Quorum Parameters
 */
export interface DynamicQuorumParams {
  minQuorumVotesBPS: number;
  maxQuorumVotesBPS: number;
  quorumCoefficient: number;
}

/**
 * Proposal Candidate Metadata
 */
export interface ProposalCandidate {
  proposer: Address;
  slug: string;
  proposalIdToUpdate: bigint;
  encodedProposalHash: `0x${string}`;
  description: string;
  actions: ProposalActions;
}

/**
 * Client Metadata (for rewards)
 */
export interface ClientMetadata {
  approved: boolean;
  rewarded: bigint;
  withdrawn: bigint;
  name: string;
  description: string;
}

/**
 * Helper function return types
 */

export interface AuctionInfo extends AuctionState {
  isActive: boolean;
  hasEnded: boolean;
  timeRemaining: number;
  minBidAmount: bigint;
}

export interface ProposalInfo extends ProposalData {
  state: number;
  stateName: string;
  isActive: boolean;
  hasSucceeded: boolean;
  quorumProgress: number;
  votePercentages: {
    for: number;
    against: number;
    abstain: number;
  };
}

export interface VotingPower {
  currentVotes: bigint;
  delegate: Address;
  isDelegatedToSelf: boolean;
  formattedVotes: string;
}

