-- Nouns Database Schema
-- Complete database for all Nouns NFTs with historical data
-- 
-- This schema stores:
-- - Core Noun data (traits, SVG, ownership)
-- - Auction history with settler addresses
-- - Ownership transfer history
-- - Delegation history
-- - Voting history

-- ==================== Core Tables ====================

-- Core Nouns NFT data
CREATE TABLE IF NOT EXISTS nouns (
  noun_id INTEGER PRIMARY KEY,
  
  -- Traits (indices into image data arrays)
  background SMALLINT NOT NULL,
  body SMALLINT NOT NULL,
  accessory SMALLINT NOT NULL,
  head SMALLINT NOT NULL,
  glasses SMALLINT NOT NULL,
  
  -- Generated SVG data (for fast rendering)
  svg_data TEXT NOT NULL,
  
  -- Creation metadata
  created_timestamp BIGINT NOT NULL,
  created_block BIGINT NOT NULL,
  
  -- Current state
  current_owner VARCHAR(66) NOT NULL,
  current_delegate VARCHAR(66),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Auction history for each Noun
CREATE TABLE IF NOT EXISTS auction_history (
  id SERIAL PRIMARY KEY,
  noun_id INTEGER NOT NULL REFERENCES nouns(noun_id) ON DELETE CASCADE,
  
  -- Auction details
  winner_address VARCHAR(66) NOT NULL,
  winning_bid_eth NUMERIC(20, 18) NOT NULL,
  
  -- Settler information (from Etherscan)
  settler_address VARCHAR(66),
  
  -- Timing
  start_time BIGINT NOT NULL,
  end_time BIGINT NOT NULL,
  settled_timestamp BIGINT NOT NULL,
  
  -- Blockchain metadata
  tx_hash VARCHAR(66) NOT NULL,
  block_number BIGINT NOT NULL,
  
  -- Client tracking
  client_id INTEGER,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure one auction per Noun
  UNIQUE(noun_id)
);

-- Ownership transfer history
CREATE TABLE IF NOT EXISTS ownership_history (
  id SERIAL PRIMARY KEY,
  noun_id INTEGER NOT NULL REFERENCES nouns(noun_id) ON DELETE CASCADE,
  
  -- Transfer details
  from_address VARCHAR(66) NOT NULL,
  to_address VARCHAR(66) NOT NULL,
  
  -- Blockchain metadata
  timestamp BIGINT NOT NULL,
  block_number BIGINT NOT NULL,
  tx_hash VARCHAR(66) NOT NULL,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW()
);

-- Delegation history
CREATE TABLE IF NOT EXISTS delegation_history (
  id SERIAL PRIMARY KEY,
  noun_id INTEGER NOT NULL REFERENCES nouns(noun_id) ON DELETE CASCADE,
  
  -- Delegation details
  delegator VARCHAR(66) NOT NULL,
  from_delegate VARCHAR(66),
  to_delegate VARCHAR(66) NOT NULL,
  
  -- Blockchain metadata
  timestamp BIGINT NOT NULL,
  block_number BIGINT NOT NULL,
  tx_hash VARCHAR(66) NOT NULL,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW()
);

-- Vote history
CREATE TABLE IF NOT EXISTS vote_history (
  id SERIAL PRIMARY KEY,
  noun_id INTEGER NOT NULL REFERENCES nouns(noun_id) ON DELETE CASCADE,
  
  -- Vote details
  proposal_id VARCHAR(100) NOT NULL,
  support SMALLINT NOT NULL, -- 0 = against, 1 = for, 2 = abstain
  voter_address VARCHAR(66) NOT NULL,
  votes_cast VARCHAR(100) NOT NULL, -- Can be large number
  reason TEXT,
  
  -- Blockchain metadata
  timestamp BIGINT NOT NULL,
  block_number BIGINT NOT NULL,
  tx_hash VARCHAR(66) NOT NULL,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sync tracking (for incremental updates)
CREATE TABLE IF NOT EXISTS sync_state (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL UNIQUE, -- 'nouns', 'auctions', 'transfers', etc.
  last_synced_block BIGINT NOT NULL,
  last_synced_timestamp BIGINT NOT NULL,
  last_synced_noun_id INTEGER,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ==================== Indexes for Performance ====================

-- Nouns table indexes
CREATE INDEX IF NOT EXISTS idx_nouns_owner ON nouns(current_owner);
CREATE INDEX IF NOT EXISTS idx_nouns_delegate ON nouns(current_delegate);
CREATE INDEX IF NOT EXISTS idx_nouns_created_block ON nouns(created_block);
CREATE INDEX IF NOT EXISTS idx_nouns_created_timestamp ON nouns(created_timestamp);

-- Auction history indexes
CREATE INDEX IF NOT EXISTS idx_auction_noun_id ON auction_history(noun_id);
CREATE INDEX IF NOT EXISTS idx_auction_winner ON auction_history(winner_address);
CREATE INDEX IF NOT EXISTS idx_auction_settler ON auction_history(settler_address);
CREATE INDEX IF NOT EXISTS idx_auction_timestamp ON auction_history(settled_timestamp);
CREATE INDEX IF NOT EXISTS idx_auction_block ON auction_history(block_number);

-- Ownership history indexes
CREATE INDEX IF NOT EXISTS idx_ownership_noun_id ON ownership_history(noun_id);
CREATE INDEX IF NOT EXISTS idx_ownership_from ON ownership_history(from_address);
CREATE INDEX IF NOT EXISTS idx_ownership_to ON ownership_history(to_address);
CREATE INDEX IF NOT EXISTS idx_ownership_timestamp ON ownership_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_ownership_block ON ownership_history(block_number);

-- Delegation history indexes
CREATE INDEX IF NOT EXISTS idx_delegation_noun_id ON delegation_history(noun_id);
CREATE INDEX IF NOT EXISTS idx_delegation_delegator ON delegation_history(delegator);
CREATE INDEX IF NOT EXISTS idx_delegation_to_delegate ON delegation_history(to_delegate);
CREATE INDEX IF NOT EXISTS idx_delegation_timestamp ON delegation_history(timestamp);

-- Vote history indexes
CREATE INDEX IF NOT EXISTS idx_vote_noun_id ON vote_history(noun_id);
CREATE INDEX IF NOT EXISTS idx_vote_proposal ON vote_history(proposal_id);
CREATE INDEX IF NOT EXISTS idx_vote_voter ON vote_history(voter_address);
CREATE INDEX IF NOT EXISTS idx_vote_timestamp ON vote_history(timestamp);

-- ==================== Helpful Queries ====================

-- Get a Noun with all its data
-- SELECT * FROM nouns WHERE noun_id = 1;

-- Get auction history for a Noun
-- SELECT * FROM auction_history WHERE noun_id = 1;

-- Get all transfers for a Noun (chronological)
-- SELECT * FROM ownership_history WHERE noun_id = 1 ORDER BY timestamp ASC;

-- Get all Nouns owned by an address
-- SELECT * FROM nouns WHERE current_owner = '0x...' ORDER BY noun_id;

-- Get all Nouns delegated to an address
-- SELECT * FROM nouns WHERE current_delegate = '0x...' ORDER BY noun_id;

-- Get vote history for a Noun
-- SELECT * FROM vote_history WHERE noun_id = 1 ORDER BY timestamp DESC;

-- Get auction statistics
-- SELECT 
--   COUNT(*) as total_auctions,
--   AVG(winning_bid_eth) as avg_bid,
--   MAX(winning_bid_eth) as max_bid,
--   MIN(winning_bid_eth) as min_bid
-- FROM auction_history;

-- Get most active settlers
-- SELECT 
--   settler_address,
--   COUNT(*) as settlements
-- FROM auction_history
-- WHERE settler_address IS NOT NULL
-- GROUP BY settler_address
-- ORDER BY settlements DESC
-- LIMIT 10;

