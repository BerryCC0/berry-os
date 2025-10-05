-- Nouns OS - Neon Database Schema
-- Phase 6: User Customization & Persistence
-- 
-- This schema supports wallet-based user identity and persistent customization.
-- Users can customize their desktop, theme, window positions, and more.

-- ==================== Core Tables ====================

-- Users table (wallet-based identity)
CREATE TABLE IF NOT EXISTS users (
  wallet_address VARCHAR(66) PRIMARY KEY,  -- Support longer addresses (Solana, etc.)
  chain_id INTEGER,                        -- Which chain they connected from
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP DEFAULT NOW(),
  last_chain_id INTEGER                    -- Track chain switching
);

-- Desktop icon positions
CREATE TABLE IF NOT EXISTS desktop_icons (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(66) REFERENCES users(wallet_address) ON DELETE CASCADE,
  icon_id VARCHAR(100) NOT NULL,           -- 'desktop-finder', 'desktop-trash', etc.
  position_x INTEGER NOT NULL,
  position_y INTEGER NOT NULL,
  grid_snap BOOLEAN DEFAULT false,         -- Whether icon snaps to grid (false = free-form)
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(wallet_address, icon_id)
);

-- Theme & visual preferences
CREATE TABLE IF NOT EXISTS theme_preferences (
  wallet_address VARCHAR(66) PRIMARY KEY REFERENCES users(wallet_address) ON DELETE CASCADE,
  theme_id VARCHAR(50) DEFAULT 'classic',  -- 'classic', 'platinum', 'darkMode', custom
  wallpaper_url VARCHAR(500) DEFAULT '/filesystem/System/Desktop Pictures/Classic.png',
  accent_color VARCHAR(7),                 -- Hex color for custom themes (e.g., '#d22209')
  title_bar_style VARCHAR(20) DEFAULT 'pinstripe', -- 'pinstripe', 'gradient', 'solid'
  window_opacity NUMERIC(3,2) DEFAULT 1.0, -- 0.85 - 1.0
  corner_style VARCHAR(20) DEFAULT 'sharp', -- 'sharp', 'rounded'
  menu_bar_style VARCHAR(20) DEFAULT 'opaque', -- 'opaque', 'translucent'
  font_size VARCHAR(20) DEFAULT 'medium',  -- 'small', 'medium', 'large'
  sound_enabled BOOLEAN DEFAULT true,
  animations_enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- App window states (remembers last position/size)
CREATE TABLE IF NOT EXISTS window_states (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(66) REFERENCES users(wallet_address) ON DELETE CASCADE,
  app_id VARCHAR(50) NOT NULL,
  position_x INTEGER,
  position_y INTEGER,
  width INTEGER,
  height INTEGER,
  is_minimized BOOLEAN DEFAULT false,
  is_maximized BOOLEAN DEFAULT false,
  z_index INTEGER,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(wallet_address, app_id)
);

-- Dock/taskbar preferences
CREATE TABLE IF NOT EXISTS dock_preferences (
  wallet_address VARCHAR(66) PRIMARY KEY REFERENCES users(wallet_address) ON DELETE CASCADE,
  position VARCHAR(20) DEFAULT 'bottom',   -- 'bottom', 'left', 'right', 'hidden'
  size VARCHAR(20) DEFAULT 'medium',       -- 'small', 'medium', 'large'
  pinned_apps TEXT[] DEFAULT ARRAY['finder', 'calculator', 'text-editor']::TEXT[],
  auto_hide BOOLEAN DEFAULT false,
  magnification_enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- System preferences
CREATE TABLE IF NOT EXISTS system_preferences (
  wallet_address VARCHAR(66) PRIMARY KEY REFERENCES users(wallet_address) ON DELETE CASCADE,
  double_click_speed VARCHAR(20) DEFAULT 'medium',
  scroll_speed VARCHAR(20) DEFAULT 'medium',
  menu_blink_enabled BOOLEAN DEFAULT true,
  show_hidden_files BOOLEAN DEFAULT false,
  grid_spacing INTEGER DEFAULT 80,          -- Desktop icon grid size
  snap_to_grid BOOLEAN DEFAULT false,       -- Free-form positioning by default
  updated_at TIMESTAMP DEFAULT NOW()
);

-- App-specific persistent state (optional, for complex apps)
CREATE TABLE IF NOT EXISTS app_states (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(66) REFERENCES users(wallet_address) ON DELETE CASCADE,
  app_id VARCHAR(50) NOT NULL,
  state_data JSONB NOT NULL,               -- Flexible JSON for app-specific data
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(wallet_address, app_id)
);

-- ==================== Indexes for Performance ====================

CREATE INDEX IF NOT EXISTS idx_desktop_icons_wallet ON desktop_icons(wallet_address);
CREATE INDEX IF NOT EXISTS idx_window_states_wallet ON window_states(wallet_address);
CREATE INDEX IF NOT EXISTS idx_app_states_wallet ON app_states(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);

-- ==================== Helpful Queries ====================

-- Example: Load all preferences for a user
-- SELECT * FROM users WHERE wallet_address = '0x...';
-- SELECT * FROM desktop_icons WHERE wallet_address = '0x...';
-- SELECT * FROM theme_preferences WHERE wallet_address = '0x...';
-- SELECT * FROM window_states WHERE wallet_address = '0x...';
-- SELECT * FROM dock_preferences WHERE wallet_address = '0x...';
-- SELECT * FROM system_preferences WHERE wallet_address = '0x...';

-- Example: Save desktop icon position
-- INSERT INTO desktop_icons (wallet_address, icon_id, position_x, position_y)
-- VALUES ('0x...', 'desktop-finder', 20, 30)
-- ON CONFLICT (wallet_address, icon_id)
-- DO UPDATE SET position_x = EXCLUDED.position_x, position_y = EXCLUDED.position_y, updated_at = NOW();

