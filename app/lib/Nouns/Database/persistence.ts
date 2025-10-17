/**
 * Nouns Database - Persistence Layer
 * CRUD operations for all Nouns data tables
 */

import { neon } from '@neondatabase/serverless';
import type {
  NounRecord,
  AuctionHistoryRecord,
  OwnershipHistoryRecord,
  DelegationHistoryRecord,
  VoteHistoryRecord,
  SyncStateRecord,
  CompleteNoun,
  InsertNounData,
  InsertAuctionHistoryData,
  InsertOwnershipHistoryData,
  InsertDelegationHistoryData,
  InsertVoteHistoryData,
  UpdateSyncStateData,
  PaginationParams,
  NounQueryFilters,
  AuctionQueryFilters,
  VoteQueryFilters,
  PaginatedResponse,
  NounsStatistics,
} from './types';

const sql = neon(process.env.DATABASE_URL!);

// ============================================================================
// Nouns Table Operations
// ============================================================================

/**
 * Insert a new Noun into the database
 */
export async function insertNoun(data: InsertNounData): Promise<void> {
  await sql`
    INSERT INTO nouns (
      noun_id, background, body, accessory, head, glasses,
      svg_data, created_timestamp, created_block,
      current_owner, current_delegate
    ) VALUES (
      ${data.noun_id}, ${data.background}, ${data.body}, ${data.accessory},
      ${data.head}, ${data.glasses}, ${data.svg_data},
      ${data.created_timestamp}, ${data.created_block},
      ${data.current_owner}, ${data.current_delegate}
    )
    ON CONFLICT (noun_id) DO UPDATE SET
      current_owner = EXCLUDED.current_owner,
      current_delegate = EXCLUDED.current_delegate,
      updated_at = NOW()
  `;
}

/**
 * Get a single Noun by ID
 */
export async function getNoun(nounId: number): Promise<NounRecord | null> {
  const results = await sql`
    SELECT * FROM nouns WHERE noun_id = ${nounId}
  `;
  
  return (results[0] as NounRecord) || null;
}

/**
 * Get multiple Nouns by IDs (batch fetch)
 */
export async function getNounsByIds(nounIds: number[]): Promise<NounRecord[]> {
  if (nounIds.length === 0) {
    return [];
  }
  
  const results = await sql`
    SELECT * FROM nouns 
    WHERE noun_id = ANY(${nounIds})
    ORDER BY noun_id ASC
  `;
  
  return results as NounRecord[];
}

/**
 * Get multiple Nouns with pagination and filters
 */
export async function getNouns(
  pagination: PaginationParams,
  filters?: NounQueryFilters
): Promise<PaginatedResponse<NounRecord>> {
  const { limit, offset } = pagination;
  
  // Build WHERE clause
  let whereConditions: string[] = [];
  let params: any = { limit, offset };
  
  if (filters?.owner) {
    whereConditions.push('current_owner = ${owner}');
    params.owner = filters.owner;
  }
  
  if (filters?.delegate) {
    whereConditions.push('current_delegate = ${delegate}');
    params.delegate = filters.delegate;
  }
  
  if (filters?.minId !== undefined) {
    whereConditions.push('noun_id >= ${minId}');
    params.minId = filters.minId;
  }
  
  if (filters?.maxId !== undefined) {
    whereConditions.push('noun_id <= ${maxId}');
    params.maxId = filters.maxId;
  }
  
  if (filters?.createdAfter) {
    whereConditions.push('created_timestamp >= ${createdAfter}');
    params.createdAfter = filters.createdAfter;
  }
  
  if (filters?.createdBefore) {
    whereConditions.push('created_timestamp <= ${createdBefore}');
    params.createdBefore = filters.createdBefore;
  }
  
  const whereClause = whereConditions.length > 0
    ? `WHERE ${whereConditions.join(' AND ')}`
    : '';
  
  // Get total count
  const countResult = await sql`
    SELECT COUNT(*) as total FROM nouns ${sql.unsafe(whereClause)}
  `;
  const total = parseInt(countResult[0].total as string);
  
  // Get paginated results
  const results = await sql`
    SELECT * FROM nouns
    ${sql.unsafe(whereClause)}
    ORDER BY noun_id DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;
  
  return {
    data: results as NounRecord[],
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + results.length < total,
    },
  };
}

/**
 * Update Noun's current owner
 */
export async function updateNounOwner(
  nounId: number,
  owner: string
): Promise<void> {
  await sql`
    UPDATE nouns
    SET current_owner = ${owner}, updated_at = NOW()
    WHERE noun_id = ${nounId}
  `;
}

/**
 * Update Noun's current delegate
 */
export async function updateNounDelegate(
  nounId: number,
  delegate: string | null
): Promise<void> {
  await sql`
    UPDATE nouns
    SET current_delegate = ${delegate}, updated_at = NOW()
    WHERE noun_id = ${nounId}
  `;
}

// ============================================================================
// Auction History Operations
// ============================================================================

/**
 * Insert auction history record
 */
export async function insertAuctionHistory(
  data: InsertAuctionHistoryData
): Promise<void> {
  await sql`
    INSERT INTO auction_history (
      noun_id, winner_address, winning_bid_eth, settler_address,
      start_time, end_time, settled_timestamp,
      tx_hash, block_number, client_id
    ) VALUES (
      ${data.noun_id}, ${data.winner_address}, ${data.winning_bid_eth},
      ${data.settler_address}, ${data.start_time}, ${data.end_time},
      ${data.settled_timestamp}, ${data.tx_hash}, ${data.block_number},
      ${data.client_id}
    )
    ON CONFLICT (noun_id) DO UPDATE SET
      settler_address = EXCLUDED.settler_address
  `;
}

/**
 * Get auction history for a Noun
 */
export async function getAuctionHistory(
  nounId: number
): Promise<AuctionHistoryRecord | null> {
  const results = await sql`
    SELECT * FROM auction_history WHERE noun_id = ${nounId}
  `;
  
  return (results[0] as AuctionHistoryRecord) || null;
}

/**
 * Get multiple auction records with filters
 */
export async function getAuctions(
  pagination: PaginationParams,
  filters?: AuctionQueryFilters
): Promise<PaginatedResponse<AuctionHistoryRecord>> {
  const { limit, offset } = pagination;
  
  let whereConditions: string[] = [];
  
  if (filters?.winner) {
    whereConditions.push(`winner_address = '${filters.winner}'`);
  }
  
  if (filters?.settler) {
    whereConditions.push(`settler_address = '${filters.settler}'`);
  }
  
  if (filters?.minBid) {
    whereConditions.push(`winning_bid_eth >= ${filters.minBid}`);
  }
  
  if (filters?.maxBid) {
    whereConditions.push(`winning_bid_eth <= ${filters.maxBid}`);
  }
  
  if (filters?.settledAfter) {
    whereConditions.push(`settled_timestamp >= ${filters.settledAfter}`);
  }
  
  if (filters?.settledBefore) {
    whereConditions.push(`settled_timestamp <= ${filters.settledBefore}`);
  }
  
  const whereClause = whereConditions.length > 0
    ? `WHERE ${whereConditions.join(' AND ')}`
    : '';
  
  const countResult = await sql`
    SELECT COUNT(*) as total FROM auction_history ${sql.unsafe(whereClause)}
  `;
  const total = parseInt(countResult[0].total as string);
  
  const results = await sql`
    SELECT * FROM auction_history
    ${sql.unsafe(whereClause)}
    ORDER BY settled_timestamp DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;
  
  return {
    data: results as AuctionHistoryRecord[],
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + results.length < total,
    },
  };
}

/**
 * Update settler address for an auction
 */
export async function updateAuctionSettler(
  nounId: number,
  settlerAddress: string
): Promise<void> {
  await sql`
    UPDATE auction_history
    SET settler_address = ${settlerAddress}
    WHERE noun_id = ${nounId}
  `;
}

// ============================================================================
// Ownership History Operations
// ============================================================================

/**
 * Insert ownership transfer record
 */
export async function insertOwnershipHistory(
  data: InsertOwnershipHistoryData
): Promise<void> {
  await sql`
    INSERT INTO ownership_history (
      noun_id, from_address, to_address,
      timestamp, block_number, tx_hash
    ) VALUES (
      ${data.noun_id}, ${data.from_address}, ${data.to_address},
      ${data.timestamp}, ${data.block_number}, ${data.tx_hash}
    )
  `;
}

/**
 * Get ownership history for a Noun
 */
export async function getOwnershipHistory(
  nounId: number
): Promise<OwnershipHistoryRecord[]> {
  const results = await sql`
    SELECT * FROM ownership_history
    WHERE noun_id = ${nounId}
    ORDER BY timestamp ASC
  `;
  
  return results as OwnershipHistoryRecord[];
}

// ============================================================================
// Delegation History Operations
// ============================================================================

/**
 * Insert delegation history record
 */
export async function insertDelegationHistory(
  data: InsertDelegationHistoryData
): Promise<void> {
  await sql`
    INSERT INTO delegation_history (
      noun_id, delegator, from_delegate, to_delegate,
      timestamp, block_number, tx_hash
    ) VALUES (
      ${data.noun_id}, ${data.delegator}, ${data.from_delegate},
      ${data.to_delegate}, ${data.timestamp}, ${data.block_number},
      ${data.tx_hash}
    )
  `;
}

/**
 * Get delegation history for a Noun
 */
export async function getDelegationHistory(
  nounId: number
): Promise<DelegationHistoryRecord[]> {
  const results = await sql`
    SELECT * FROM delegation_history
    WHERE noun_id = ${nounId}
    ORDER BY timestamp ASC
  `;
  
  return results as DelegationHistoryRecord[];
}

// ============================================================================
// Vote History Operations
// ============================================================================

/**
 * Insert vote history record
 */
export async function insertVoteHistory(
  data: InsertVoteHistoryData
): Promise<void> {
  await sql`
    INSERT INTO vote_history (
      noun_id, proposal_id, support, voter_address,
      votes_cast, reason, timestamp, block_number, tx_hash
    ) VALUES (
      ${data.noun_id}, ${data.proposal_id}, ${data.support},
      ${data.voter_address}, ${data.votes_cast}, ${data.reason},
      ${data.timestamp}, ${data.block_number}, ${data.tx_hash}
    )
  `;
}

/**
 * Get vote history for a Noun
 */
export async function getVoteHistory(
  nounId: number
): Promise<VoteHistoryRecord[]> {
  const results = await sql`
    SELECT * FROM vote_history
    WHERE noun_id = ${nounId}
    ORDER BY timestamp DESC
  `;
  
  return results as VoteHistoryRecord[];
}

/**
 * Get votes with filters
 */
export async function getVotes(
  pagination: PaginationParams,
  filters?: VoteQueryFilters
): Promise<PaginatedResponse<VoteHistoryRecord>> {
  const { limit, offset } = pagination;
  
  let whereConditions: string[] = [];
  
  if (filters?.proposalId) {
    whereConditions.push(`proposal_id = '${filters.proposalId}'`);
  }
  
  if (filters?.voter) {
    whereConditions.push(`voter_address = '${filters.voter}'`);
  }
  
  if (filters?.support !== undefined) {
    whereConditions.push(`support = ${filters.support}`);
  }
  
  if (filters?.nounId !== undefined) {
    whereConditions.push(`noun_id = ${filters.nounId}`);
  }
  
  const whereClause = whereConditions.length > 0
    ? `WHERE ${whereConditions.join(' AND ')}`
    : '';
  
  const countResult = await sql`
    SELECT COUNT(*) as total FROM vote_history ${sql.unsafe(whereClause)}
  `;
  const total = parseInt(countResult[0].total as string);
  
  const results = await sql`
    SELECT * FROM vote_history
    ${sql.unsafe(whereClause)}
    ORDER BY timestamp DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;
  
  return {
    data: results as VoteHistoryRecord[],
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + results.length < total,
    },
  };
}

// ============================================================================
// Complete Noun Data
// ============================================================================

/**
 * Get complete Noun data with all related records
 */
export async function getCompleteNoun(nounId: number): Promise<CompleteNoun | null> {
  const noun = await getNoun(nounId);
  
  if (!noun) {
    return null;
  }
  
  const [auction, transfers, delegations, votes] = await Promise.all([
    getAuctionHistory(nounId),
    getOwnershipHistory(nounId),
    getDelegationHistory(nounId),
    getVoteHistory(nounId),
  ]);
  
  return {
    noun,
    auction: auction || undefined,
    transfers,
    delegations,
    votes,
  };
}

// ============================================================================
// Sync State Operations
// ============================================================================

/**
 * Get sync state for an entity type
 */
export async function getSyncState(
  entityType: string
): Promise<SyncStateRecord | null> {
  const results = await sql`
    SELECT * FROM sync_state WHERE entity_type = ${entityType}
  `;
  
  return (results[0] as SyncStateRecord) || null;
}

/**
 * Update sync state
 */
export async function updateSyncState(data: UpdateSyncStateData): Promise<void> {
  await sql`
    INSERT INTO sync_state (
      entity_type, last_synced_block, last_synced_timestamp, last_synced_noun_id
    ) VALUES (
      ${data.entity_type}, ${data.last_synced_block},
      ${data.last_synced_timestamp}, ${data.last_synced_noun_id}
    )
    ON CONFLICT (entity_type) DO UPDATE SET
      last_synced_block = EXCLUDED.last_synced_block,
      last_synced_timestamp = EXCLUDED.last_synced_timestamp,
      last_synced_noun_id = EXCLUDED.last_synced_noun_id,
      updated_at = NOW()
  `;
}

// ============================================================================
// Statistics Operations
// ============================================================================

/**
 * Get Nouns statistics
 */
export async function getNounsStatistics(): Promise<NounsStatistics> {
  const nounCount = await sql`SELECT COUNT(*) as total FROM nouns`;
  const auctionStats = await sql`
    SELECT
      COUNT(*) as total_auctions,
      COALESCE(AVG(winning_bid_eth::numeric), 0) as avg_bid,
      COALESCE(MAX(winning_bid_eth::numeric), 0) as max_bid,
      COALESCE(MIN(winning_bid_eth::numeric), 0) as min_bid,
      COALESCE(SUM(winning_bid_eth::numeric), 0) as total_volume
    FROM auction_history
  `;
  
  const stats = auctionStats[0];
  
  return {
    totalNouns: parseInt(nounCount[0].total as string),
    totalAuctions: parseInt(stats.total_auctions as string),
    avgBidEth: stats.avg_bid?.toString() || '0',
    maxBidEth: stats.max_bid?.toString() || '0',
    minBidEth: stats.min_bid?.toString() || '0',
    totalVolume: stats.total_volume?.toString() || '0',
  };
}

