-- Migration 003: Update Theme Sharing Schema for Phase 8C
-- Date: 2025-10-08
-- Description: Updates shared_themes schema to support direct theme_id references

-- ==================== 3.1: Update shared_themes table ====================

-- Drop the old shared_themes table if it exists (we're changing the schema)
DROP TABLE IF EXISTS shared_themes CASCADE;

-- Recreate shared_themes with better schema for Phase 8C
CREATE TABLE shared_themes (
  id SERIAL PRIMARY KEY,
  theme_id VARCHAR(50) NOT NULL,            -- References custom_themes.theme_id
  wallet_address VARCHAR(66) NOT NULL,      -- Owner's wallet
  share_code VARCHAR(8) UNIQUE NOT NULL,    -- Short shareable code (8 chars)
  view_count INTEGER DEFAULT 0,
  install_count INTEGER DEFAULT 0,          -- Track installs (renamed from clone_count)
  shared_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (wallet_address, theme_id) REFERENCES custom_themes(wallet_address, theme_id) ON DELETE CASCADE
);

-- Add is_public and share_code columns to custom_themes
ALTER TABLE custom_themes
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS share_code VARCHAR(8);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_shared_themes_code ON shared_themes(share_code);
CREATE INDEX IF NOT EXISTS idx_shared_themes_wallet ON shared_themes(wallet_address);
CREATE INDEX IF NOT EXISTS idx_custom_themes_public ON custom_themes(is_public) WHERE is_public = true;

-- ==================== Helpful Queries ====================

-- Example: Get all public themes for discovery
-- SELECT 
--   ct.id,
--   ct.wallet_address,
--   ct.theme_id,
--   ct.theme_name,
--   ct.theme_description,
--   ct.theme_data,
--   ct.created_at,
--   ct.updated_at,
--   st.share_code,
--   st.view_count,
--   st.install_count
-- FROM custom_themes ct
-- INNER JOIN shared_themes st ON ct.theme_id = st.theme_id AND ct.wallet_address = st.wallet_address
-- WHERE ct.is_public = true
-- ORDER BY st.install_count DESC, ct.created_at DESC;

-- Example: Share a theme
-- INSERT INTO shared_themes (theme_id, wallet_address, share_code)
-- VALUES ('custom-abc123-mytheme', '0x...', 'AB12CD34')
-- ON CONFLICT (share_code) DO NOTHING;
-- 
-- UPDATE custom_themes
-- SET is_public = true, share_code = 'AB12CD34'
-- WHERE theme_id = 'custom-abc123-mytheme' AND wallet_address = '0x...';

