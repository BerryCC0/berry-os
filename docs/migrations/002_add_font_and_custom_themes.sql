-- Migration 002: Add Font Preferences and Custom Themes
-- Date: 2025-10-08
-- Description: Adds font customization and custom theme management to Berry OS

-- ==================== 2.1: Add Font Preferences ====================

-- Add font columns to theme_preferences table
ALTER TABLE theme_preferences
ADD COLUMN IF NOT EXISTS font_family_system VARCHAR(100) DEFAULT 'Chicago',
ADD COLUMN IF NOT EXISTS font_family_interface VARCHAR(100) DEFAULT 'Geneva',
ADD COLUMN IF NOT EXISTS font_family_custom_system VARCHAR(200),
ADD COLUMN IF NOT EXISTS font_family_custom_interface VARCHAR(200);

-- ==================== 2.2: Add Custom Themes Table ====================

-- Custom themes table (user-created themes)
CREATE TABLE IF NOT EXISTS custom_themes (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(66) REFERENCES users(wallet_address) ON DELETE CASCADE,
  theme_id VARCHAR(50) NOT NULL,
  theme_name VARCHAR(100) NOT NULL,
  theme_description TEXT,
  theme_data JSONB NOT NULL,  -- Full Theme object as JSON
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(wallet_address, theme_id)
);

CREATE INDEX IF NOT EXISTS idx_custom_themes_wallet ON custom_themes(wallet_address);
CREATE INDEX IF NOT EXISTS idx_custom_themes_active ON custom_themes(wallet_address, is_active) WHERE is_active = true;

-- ==================== 2.3: Add Theme Sharing (Optional) ====================

-- Theme sharing table (allow users to share themes)
CREATE TABLE IF NOT EXISTS shared_themes (
  id SERIAL PRIMARY KEY,
  custom_theme_id INTEGER REFERENCES custom_themes(id) ON DELETE CASCADE,
  share_code VARCHAR(50) UNIQUE NOT NULL,
  is_public BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  clone_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shared_themes_code ON shared_themes(share_code);
CREATE INDEX IF NOT EXISTS idx_shared_themes_public ON shared_themes(is_public) WHERE is_public = true;

-- ==================== Helpful Queries ====================

-- Example: Load custom themes for a user
-- SELECT theme_id, theme_name, theme_description, theme_data, is_active, created_at
-- FROM custom_themes
-- WHERE wallet_address = '0x...'
-- ORDER BY updated_at DESC;

-- Example: Get shared theme by code
-- SELECT ct.*, st.share_code, st.view_count, st.clone_count
-- FROM custom_themes ct
-- JOIN shared_themes st ON st.custom_theme_id = ct.id
-- WHERE st.share_code = 'ABC123XYZ';

-- Example: Save custom theme
-- INSERT INTO custom_themes (wallet_address, theme_id, theme_name, theme_description, theme_data)
-- VALUES ('0x...', 'custom-123-mytheme', 'My Theme', 'A cool theme', '{"id":"custom-123-mytheme",...}')
-- ON CONFLICT (wallet_address, theme_id)
-- DO UPDATE SET
--   theme_name = EXCLUDED.theme_name,
--   theme_description = EXCLUDED.theme_description,
--   theme_data = EXCLUDED.theme_data,
--   updated_at = NOW();

