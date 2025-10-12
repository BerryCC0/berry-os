-- Migration 004: Convert Dock Size from Categories to Pixels
-- Converts dock_preferences.size from VARCHAR ('small', 'medium', 'large') to INTEGER (32-80px)
-- Also removes deprecated magnification_enabled field

-- Step 1: Add a temporary column to store the new pixel values
ALTER TABLE dock_preferences ADD COLUMN IF NOT EXISTS size_px INTEGER;

-- Step 2: Migrate existing data, mapping categories to pixel values
UPDATE dock_preferences
SET size_px = CASE 
  WHEN size = 'small' THEN 48
  WHEN size = 'large' THEN 80
  ELSE 64  -- 'medium' or any other value defaults to 64
END;

-- Step 3: Drop the old VARCHAR size column
ALTER TABLE dock_preferences DROP COLUMN IF EXISTS size;

-- Step 4: Rename size_px to size
ALTER TABLE dock_preferences RENAME COLUMN size_px TO size;

-- Step 5: Set default value for new rows
ALTER TABLE dock_preferences ALTER COLUMN size SET DEFAULT 64;

-- Step 6: Make size NOT NULL (all existing rows should have values now)
ALTER TABLE dock_preferences ALTER COLUMN size SET NOT NULL;

-- Step 7: Remove deprecated magnification_enabled column
ALTER TABLE dock_preferences DROP COLUMN IF EXISTS magnification_enabled;

-- Verification query (uncomment to test):
-- SELECT wallet_address, position, size, auto_hide FROM dock_preferences LIMIT 10;

