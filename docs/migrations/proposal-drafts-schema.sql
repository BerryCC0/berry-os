-- Proposal drafts table for saving work-in-progress proposals
-- This allows users to save, edit, and manage proposal drafts before submission

CREATE TABLE IF NOT EXISTS proposal_drafts (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(66) REFERENCES users(wallet_address) ON DELETE CASCADE,
  draft_name VARCHAR(200) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  actions JSONB NOT NULL DEFAULT '[]',  -- Array of {target, value, signature, calldata}
  proposal_type VARCHAR(50) DEFAULT 'standard', -- 'standard' or 'timelock_v1'
  kyc_verified BOOLEAN DEFAULT FALSE,
  kyc_inquiry_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(wallet_address, draft_name)
);

-- Index for faster queries by wallet address
CREATE INDEX IF NOT EXISTS idx_proposal_drafts_wallet ON proposal_drafts(wallet_address);

-- Index for sorting by most recently updated
CREATE INDEX IF NOT EXISTS idx_proposal_drafts_updated ON proposal_drafts(updated_at DESC);

-- Comments for documentation
COMMENT ON TABLE proposal_drafts IS 'Stores draft proposals for Nouns DAO governance, allowing users to save work-in-progress before submission';
COMMENT ON COLUMN proposal_drafts.wallet_address IS 'Ethereum wallet address of the draft owner';
COMMENT ON COLUMN proposal_drafts.draft_name IS 'User-friendly name for the draft (unique per wallet)';
COMMENT ON COLUMN proposal_drafts.title IS 'Proposal title';
COMMENT ON COLUMN proposal_drafts.description IS 'Full proposal description (markdown supported)';
COMMENT ON COLUMN proposal_drafts.actions IS 'JSON array of proposal actions [{target, value, signature, calldata}]';
COMMENT ON COLUMN proposal_drafts.proposal_type IS 'Type of proposal: standard or timelock_v1';
COMMENT ON COLUMN proposal_drafts.kyc_verified IS 'Whether the user has completed KYC verification';
COMMENT ON COLUMN proposal_drafts.kyc_inquiry_id IS 'Persona KYC inquiry ID if verification was completed';

