/**
 * Nouns DAO Subgraph - Type Definitions
 * 
 * Complete TypeScript interfaces for all Nouns DAO entities
 * Based on: https://github.com/nounsDAO/nouns-monorepo/tree/master/packages/nouns-subgraph
 */

// ============================================================================
// Core Entities
// ============================================================================

/**
 * A Noun NFT
 */
export interface Noun {
  id: string; // Token ID (ERC721 token id)
  seed: NounSeed; // The seed used to determine the Noun's traits
  owner: Account; // The owner of the Noun
  
  // Timestamps and blocks
  createdAtTimestamp?: string; // Creation timestamp (from subgraph)
  createdAtBlockNumber?: string; // Block number when created (from subgraph)
  
  // Relationships
  auction?: Auction;
  votes?: Vote[]; // Historical votes for the Noun
  delegatedVotes?: Vote[];
}

/**
 * Noun seed - deterministic traits
 */
export interface NounSeed {
  id: string; // The Noun's ERC721 token id
  background: number; // The background index (BigInt in schema)
  body: number; // The body index (BigInt in schema)
  accessory: number; // The accessory index (BigInt in schema)
  head: number; // The head index (BigInt in schema)
  glasses: number; // The glasses index (BigInt in schema)
}

/**
 * Account (wallet address)
 */
export interface Account {
  id: string; // Address
  
  // Nouns ownership
  nouns?: Noun[];
  tokenBalance: string; // Number of Nouns owned
  
  // Delegation
  delegate?: Delegate;
  delegatedFrom?: Account; // Who this account delegates to
  
  // Voting power
  tokenBalanceRaw: string;
  
  // Activity
  votes?: Vote[];
  proposals?: Proposal[];
}

/**
 * Delegate (account with voting power)
 */
export interface Delegate {
  id: string; // Address
  
  // Voting power
  delegatedVotesRaw: string; // Raw vote count
  delegatedVotes: string; // Human-readable votes
  tokenHoldersRepresentedAmount: number;
  
  // Activity
  votes?: Vote[];
  proposals?: Proposal[];
  nounsRepresented?: Noun[];
  
  // Relationships
  tokenHoldersRepresented?: Account[];
}

// ============================================================================
// Auction System
// ============================================================================

/**
 * Auction for a single Noun
 */
export interface Auction {
  id: string; // Noun ID
  noun: Noun;
  
  // Auction details
  amount: string; // Winning bid amount (ETH)
  startTime: string;
  endTime: string;
  
  // Winner
  bidder?: Bid; // Winning bidder
  settled: boolean;
  
  // Bids
  bids: Bid[];
}

/**
 * Individual bid on a Noun auction
 */
export interface Bid {
  id: string;
  
  // Bid details
  noun: Noun;
  amount: string; // ETH amount
  bidder: Account;
  
  // Context
  blockNumber: string;
  blockTimestamp: string;
  txIndex: string;
  txHash?: string; // Transaction hash
  
  // Client tracking
  clientId?: number; // The ID of the client that facilitated this bid
  
  // Auction relationship
  auction: Auction;
}

// ============================================================================
// Governance
// ============================================================================

/**
 * Governance proposal
 */
export interface Proposal {
  id: string; // Proposal ID
  
  // Proposal content
  title?: string;
  description?: string;
  targets: string[]; // Contract addresses to call
  values: string[]; // ETH values to send
  signatures: string[]; // Function signatures
  calldatas: string[]; // Encoded calldata
  
  // Proposer
  proposer: Delegate;
  proposalThreshold: string;
  quorumVotes: string;
  
  // Status
  status: ProposalStatus;
  executionETA?: string; // When proposal can be executed
  
  // Voting
  forVotes: string; // Votes in favor
  againstVotes: string; // Votes against
  abstainVotes: string; // Abstain votes
  votes: Vote[];
  totalSupply: string;
  
  // Lifecycle
  createdBlock: string;
  createdTimestamp: string;
  createdTransactionHash: string;
  startBlock: string;
  endBlock: string;
  updatePeriodEndBlock: string;
  objectionPeriodEndBlock: string;
  canceledBlock?: string;
  canceledTimestamp?: string;
  queuedBlock?: string;
  queuedTimestamp?: string;
  executedBlock?: string;
  executedTimestamp?: string;
}

/**
 * Proposal status enum
 */
export enum ProposalStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  DEFEATED = 'DEFEATED',
  SUCCEEDED = 'SUCCEEDED',
  QUEUED = 'QUEUED',
  EXPIRED = 'EXPIRED',
  EXECUTED = 'EXECUTED',
  VETOED = 'VETOED',
}

/**
 * Vote on a proposal
 */
export interface Vote {
  id: string;
  
  // Vote details
  support: VoteSupport; // 0 = against, 1 = for, 2 = abstain
  supportDetailed: number;
  votes: string; // Voting power used (normalized)
  votesRaw: string; // Voting power used (raw)
  reason?: string; // Optional vote reason
  
  // Voter
  voter: Delegate; // Changed from Account to Delegate (consistent with schema)
  nouns: Noun[]; // Nouns used to vote
  
  // Proposal
  proposal: Proposal;
  
  // Context
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
  clientId: number;
}

/**
 * Vote support enum
 */
export enum VoteSupport {
  AGAINST = 0,
  FOR = 1,
  ABSTAIN = 2,
}

// ============================================================================
// Governance V3 (Latest)
// ============================================================================

/**
 * Proposal candidate (V3 - for proposals with updatable periods)
 */
export interface ProposalCandidate {
  id: string;
  
  // Candidate details
  proposer: Account;
  slug: string;
  
  // Content
  targets: string[];
  values: string[];
  signatures: string[]; // Function signatures
  calldatas: string[];
  description: string;
  encodedProposalHash: string;
  
  // Signers
  signers: Account[];
  candidateSignatures: ProposalCandidateSignature[]; // Renamed to avoid conflict
  requiredSignatures: number;
  
  // Lifecycle
  createdBlock: string;
  createdTimestamp: string;
  createdTransactionHash: string;
  canceledBlock?: string;
  canceledTimestamp?: string;
  
  // Promotion
  proposal?: Proposal;
  latestVersion: ProposalVersion;
  versions: ProposalVersion[];
}

/**
 * Proposal candidate signature
 */
export interface ProposalCandidateSignature {
  id: string;
  signer: Account;
  sig: string; // Signature hex
  expirationTimestamp: string;
  encodedProposalHash: string;
  sigDigest: string;
  reason?: string;
  
  // Candidate
  candidate: ProposalCandidate;
  
  // Context
  createdBlock: string;
  createdTimestamp: string;
}

/**
 * Proposal version (for updateable proposals)
 */
export interface ProposalVersion {
  id: string;
  
  // Version details
  title: string;
  description: string;
  targets: string[];
  values: string[];
  signatures: string[];
  calldatas: string[];
  
  // Update context
  updateMessage: string;
  createdBlock: string;
  createdAt: string; // Block timestamp
  createdTimestamp: string; // Deprecated, use createdAt
  createdTransactionHash: string;
  
  // Relationships
  proposal?: Proposal;
  candidate?: ProposalCandidate;
}

/**
 * Proposal feedback (comments on proposals)
 */
export interface ProposalFeedback {
  id: string;
  
  // Feedback details
  voter: Account;
  supportDetailed: number;
  reason?: string;
  
  // Proposal
  proposal: Proposal;
  
  // Context
  createdBlock: string;
  createdTimestamp: string;
}

// ============================================================================
// DAO Configuration & Events
// ============================================================================

/**
 * Governance contract configuration
 */
export interface Governance {
  id: string;
  
  // Contract addresses
  delegatedVotesRaw: string;
  delegatedVotes: string;
  
  // Settings
  proposals: Proposal[];
  currentTokenHolders: string;
  currentDelegates: string;
  totalTokenHolders: string;
  totalDelegates: string;
  
  // Voting configuration
  proposalThreshold: string;
  quorumVotesBPS: string;
  
  // Dynamic quorum params (V3)
  dynamicQuorumStartBlock?: string;
  dynamicQuorumParams?: DynamicQuorumParams;
}

/**
 * Dynamic quorum parameters
 */
export interface DynamicQuorumParams {
  id: string;
  minQuorumVotesBPS: number;
  maxQuorumVotesBPS: number;
  quorumCoefficient: string;
  
  // Context
  createdBlock: string;
  createdTimestamp: string;
}

/**
 * Delegation event
 */
export interface DelegationEvent {
  id: string;
  delegator: Account;
  fromDelegate: Delegate;
  toDelegate: Delegate;
  blockNumber: string;
  blockTimestamp: string;
}

/**
 * Transfer event
 */
export interface TransferEvent {
  id: string;
  noun: Noun;
  from: Account;
  to: Account;
  blockNumber: string;
  blockTimestamp: string;
}

// ============================================================================
// Query Options & Filters
// ============================================================================

/**
 * Ordering options
 */
export type OrderDirection = 'asc' | 'desc';

/**
 * Proposal filter options
 */
export interface ProposalFilter {
  status?: ProposalStatus;
  proposer?: string; // Address
  createdAfter?: string; // Timestamp
  createdBefore?: string; // Timestamp
}

/**
 * Auction filter options
 */
export interface AuctionFilter {
  settled?: boolean;
  minAmount?: string; // ETH
  startAfter?: string; // Timestamp
  startBefore?: string; // Timestamp
}

/**
 * Vote filter options
 */
export interface VoteFilter {
  support?: VoteSupport;
  voter?: string; // Address
  proposalId?: string;
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  first?: number;
  skip?: number;
  orderBy?: string;
  orderDirection?: OrderDirection;
}

// ============================================================================
// GraphQL Response Types
// ============================================================================

/**
 * Query response wrapper
 */
export interface QueryResponse<T> {
  data: T;
  loading: boolean;
  error?: any;
}

/**
 * Nouns query response
 */
export interface NounsQueryResponse {
  nouns: Noun[];
}

/**
 * Proposals query response
 */
export interface ProposalsQueryResponse {
  proposals: Proposal[];
}

/**
 * Auctions query response
 */
export interface AuctionsQueryResponse {
  auctions: Auction[];
}

/**
 * Votes query response
 */
export interface VotesQueryResponse {
  votes: Vote[];
}

/**
 * Delegates query response
 */
export interface DelegatesQueryResponse {
  delegates: Delegate[];
}

/**
 * Accounts query response
 */
export interface AccountsQueryResponse {
  accounts: Account[];
}

/**
 * Governance query response
 */
export interface GovernanceQueryResponse {
  governance: Governance;
}

