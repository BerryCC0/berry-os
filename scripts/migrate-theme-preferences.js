/**
 * Migration Script: Add Theme Customization Columns
 * 
 * This script adds the new theme customization columns to the theme_preferences table
 * to support advanced customization options (title bar style, opacity, corners, etc.)
 * 
 * Run this script once to update your existing Neon database:
 * node scripts/migrate-theme-preferences.js
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log('🔄 Starting migration: Adding theme customization columns...\n');

    // Check if columns already exist
    const checkColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'theme_preferences' 
        AND column_name IN ('title_bar_style', 'window_opacity', 'corner_style', 'menu_bar_style')
    `;

    if (checkColumns.length > 0) {
      console.log('⚠️  Some columns already exist. Checking which ones need to be added...\n');
      const existingColumns = checkColumns.map(row => row.column_name);
      console.log('Existing columns:', existingColumns);
    }

    // Add title_bar_style column
    try {
      await sql`
        ALTER TABLE theme_preferences 
        ADD COLUMN IF NOT EXISTS title_bar_style VARCHAR(20) DEFAULT 'pinstripe'
      `;
      console.log('✅ Added column: title_bar_style');
    } catch (error) {
      console.log('⚠️  title_bar_style column might already exist');
    }

    // Add window_opacity column
    try {
      await sql`
        ALTER TABLE theme_preferences 
        ADD COLUMN IF NOT EXISTS window_opacity NUMERIC(3,2) DEFAULT 1.0
      `;
      console.log('✅ Added column: window_opacity');
    } catch (error) {
      console.log('⚠️  window_opacity column might already exist');
    }

    // Add corner_style column
    try {
      await sql`
        ALTER TABLE theme_preferences 
        ADD COLUMN IF NOT EXISTS corner_style VARCHAR(20) DEFAULT 'sharp'
      `;
      console.log('✅ Added column: corner_style');
    } catch (error) {
      console.log('⚠️  corner_style column might already exist');
    }

    // Add menu_bar_style column
    try {
      await sql`
        ALTER TABLE theme_preferences 
        ADD COLUMN IF NOT EXISTS menu_bar_style VARCHAR(20) DEFAULT 'opaque'
      `;
      console.log('✅ Added column: menu_bar_style');
    } catch (error) {
      console.log('⚠️  menu_bar_style column might already exist');
    }

    // Drop old window_pattern column if it exists (no longer used)
    try {
      await sql`
        ALTER TABLE theme_preferences 
        DROP COLUMN IF EXISTS window_pattern
      `;
      console.log('✅ Removed deprecated column: window_pattern');
    } catch (error) {
      console.log('⚠️  window_pattern column might not exist');
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\nNew schema for theme_preferences:');
    console.log('  - theme_id (VARCHAR)');
    console.log('  - wallpaper_url (VARCHAR)');
    console.log('  - accent_color (VARCHAR) - hex color like #d22209');
    console.log('  - title_bar_style (VARCHAR) - pinstripe/gradient/solid');
    console.log('  - window_opacity (NUMERIC) - 0.85 to 1.0');
    console.log('  - corner_style (VARCHAR) - sharp/rounded');
    console.log('  - menu_bar_style (VARCHAR) - opaque/translucent');
    console.log('  - font_size (VARCHAR) - small/medium/large');
    console.log('  - sound_enabled (BOOLEAN)');
    console.log('  - animations_enabled (BOOLEAN)');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();

