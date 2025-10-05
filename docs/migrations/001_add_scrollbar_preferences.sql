-- Migration: Add scrollbar preferences to theme_preferences table
-- Date: 2025-01-05
-- Description: Adds scrollbar customization columns for Phase 7.2

-- Add scrollbar preference columns to theme_preferences table
ALTER TABLE theme_preferences 
ADD COLUMN IF NOT EXISTS scrollbar_width VARCHAR(20) DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS scrollbar_arrow_style VARCHAR(20) DEFAULT 'classic',
ADD COLUMN IF NOT EXISTS scrollbar_auto_hide BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN theme_preferences.scrollbar_width IS 'Scrollbar thickness: thin (12px), normal (15px), thick (18px)';
COMMENT ON COLUMN theme_preferences.scrollbar_arrow_style IS 'Scrollbar arrow buttons: classic, modern, none';
COMMENT ON COLUMN theme_preferences.scrollbar_auto_hide IS 'Auto-hide scrollbars when not scrolling';

-- Update existing rows to have default values (if any exist)
UPDATE theme_preferences 
SET 
  scrollbar_width = COALESCE(scrollbar_width, 'normal'),
  scrollbar_arrow_style = COALESCE(scrollbar_arrow_style, 'classic'),
  scrollbar_auto_hide = COALESCE(scrollbar_auto_hide, false)
WHERE scrollbar_width IS NULL 
   OR scrollbar_arrow_style IS NULL 
   OR scrollbar_auto_hide IS NULL;
