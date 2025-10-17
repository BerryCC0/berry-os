/**
 * Nouns Database - Type Definitions
 * TypeScript interfaces matching the database schema
 */

// ============================================================================
// Core Database Types
// ============================================================================

/**
 * Noun NFT record from database
 */
export interface NounRecord {
  noun_id: number;
  
  // Traits
  background: number;
  body: number;
  accessory: number;
  head: number;
  glasses: number;
  
  // SVG data
  svg_data: string;
  
  // Creation metadata
  created_timestamp: string; // bigint as string
  created_block: string; // bigint as string
  
  // Current state
  current_owner: string;
  current_delegate: string | null;
  
  // Metadata
  created_at: Date;
  updated_at: Date;
}

/**
 * Auction history record
 */
export interface AuctionHistoryRecord {
  id: number;
  noun_id: number;
  
  // Auction details
  winner_address: string;
  winning_bid_eth: string; // numeric as string
  
  // Settler information
  settler_address: string | null;
  
  // Timing
  start_time: string; // bigint as string
  end_time: string; // bigint as string
  settled_timestamp: string; // bigint as string
  
  // Blockchain metadata
  tx_hash: string;
  block_number: string; // bigint as string
  
  // Client tracking
  client_id: number | null;
  
  // Metadata
  created_at: Date;
}

/**
 * Ownership transfer record
 */
export interface OwnershipHistoryRecord {
  id: number;
  noun_id: number;
  
  // Transfer details
  from_address: string;
  to_address: string;
  
  // Blockchain metadata
  timestamp: string; // bigint as string
  block_number: string; // bigint as string
  tx_hash: string;
  
  // Metadata
  created_at: Date;
}

/**
 * Delegation history record
 */
export interface DelegationHistoryRecord {
  id: number;
  noun_id: number;
  
  // Delegation details
  delegator: string;
  from_delegate: string | null;
  to_delegate: string;
  
  // Blockchain metadata
  timestamp: string; // bigint as string
  block_number: string; // bigint as string
  tx_hash: string;
  
  // Metadata
  created_at: Date;
}

/**
 * Vote history record
 */
export interface VoteHistoryRecord {
  id: number;
  noun_id: number;
  
  // Vote details
  proposal_id: string;
  support: number; // 0 = against, 1 = for, 2 = abstain
  voter_address: string;
  votes_cast: string; // Can be large number
  reason: string | null;
  
  // Blockchain metadata
  timestamp: string; // bigint as string
  block_number: string; // bigint as string
  tx_hash: string;
  
  // Metadata
  created_at: Date;
}

/**
 * Sync state record
 */
export interface SyncStateRecord {
  id: number;
  entity_type: string;
  last_synced_block: string; // bigint as string
  last_synced_timestamp: string; // bigint as string
  last_synced_noun_id: number | null;
  updated_at: Date;
}

// ============================================================================
// Complete Noun with Related Data
// ============================================================================

/**
 * Complete Noun data with all related records
 */
export interface CompleteNoun {
  noun: NounRecord;
  auction?: AuctionHistoryRecord;
  transfers: OwnershipHistoryRecord[];
  delegations: DelegationHistoryRecord[];
  votes: VoteHistoryRecord[];
}

// ============================================================================
// Query Parameters
// ============================================================================

/**
 * Pagination parameters
 */
export interface PaginationParams {
  limit: number;
  offset: number;
}

/**
 * Noun query filters
 */
export interface NounQueryFilters {
  owner?: string;
  delegate?: string;
  minId?: number;
  maxId?: number;
  createdAfter?: string; // timestamp
  createdBefore?: string; // timestamp
}

/**
 * Auction query filters
 */
export interface AuctionQueryFilters {
  winner?: string;
  settler?: string;
  minBid?: string;
  maxBid?: string;
  settledAfter?: string; // timestamp
  settledBefore?: string; // timestamp
}

/**
 * Vote query filters
 */
export interface VoteQueryFilters {
  proposalId?: string;
  voter?: string;
  support?: number; // 0, 1, or 2
  nounId?: number;
}

// ============================================================================
// Insert/Update Types (without auto-generated fields)
// ============================================================================

/**
 * Data for inserting a new Noun
 */
export interface InsertNounData {
  noun_id: number;
  background: number;
  body: number;
  accessory: number;
  head: number;
  glasses: number;
  svg_data: string;
  created_timestamp: string;
  created_block: string;
  current_owner: string;
  current_delegate: string | null;
}

/**
 * Data for inserting auction history
 */
export interface InsertAuctionHistoryData {
  noun_id: number;
  winner_address: string;
  winning_bid_eth: string;
  settler_address: string | null;
  start_time: string;
  end_time: string;
  settled_timestamp: string;
  tx_hash: string;
  block_number: string;
  client_id: number | null;
}

/**
 * Data for inserting ownership history
 */
export interface InsertOwnershipHistoryData {
  noun_id: number;
  from_address: string;
  to_address: string;
  timestamp: string;
  block_number: string;
  tx_hash: string;
}

/**
 * Data for inserting delegation history
 */
export interface InsertDelegationHistoryData {
  noun_id: number;
  delegator: string;
  from_delegate: string | null;
  to_delegate: string;
  timestamp: string;
  block_number: string;
  tx_hash: string;
}

/**
 * Data for inserting vote history
 */
export interface InsertVoteHistoryData {
  noun_id: number;
  proposal_id: string;
  support: number;
  voter_address: string;
  votes_cast: string;
  reason: string | null;
  timestamp: string;
  block_number: string;
  tx_hash: string;
}

/**
 * Data for updating sync state
 */
export interface UpdateSyncStateData {
  entity_type: string;
  last_synced_block: string;
  last_synced_timestamp: string;
  last_synced_noun_id: number | null;
}

// ============================================================================
// Response Types
// ============================================================================

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

/**
 * Statistics response
 */
export interface NounsStatistics {
  totalNouns: number;
  totalAuctions: number;
  avgBidEth: string;
  maxBidEth: string;
  minBidEth: string;
  totalVolume: string;
}

