/**
 * Run Database Migration
 * Executes the scrollbar preferences migration on Neon database
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  // Check for DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL environment variable not set');
    console.log('\nPlease add DATABASE_URL to your .env.local file');
    console.log('or set it manually:');
    console.log('export DATABASE_URL="your-neon-connection-string"');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  console.log('🚀 Starting migration: Add scrollbar preferences...\n');

  try {
    // Read migration file
    const migrationPath = path.join(__dirname, '../docs/migrations/001_add_scrollbar_preferences.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded');
    console.log('📝 Executing SQL...\n');

    // Execute ALTER TABLE statement
    console.log('  ✓ Adding columns to theme_preferences table...');
    await sql`
      ALTER TABLE theme_preferences 
      ADD COLUMN IF NOT EXISTS scrollbar_width VARCHAR(20) DEFAULT 'normal',
      ADD COLUMN IF NOT EXISTS scrollbar_arrow_style VARCHAR(20) DEFAULT 'classic',
      ADD COLUMN IF NOT EXISTS scrollbar_auto_hide BOOLEAN DEFAULT false
    `;

    // Update existing rows
    console.log('  ✓ Updating existing rows with defaults...');
    await sql`
      UPDATE theme_preferences 
      SET 
        scrollbar_width = COALESCE(scrollbar_width, 'normal'),
        scrollbar_arrow_style = COALESCE(scrollbar_arrow_style, 'classic'),
        scrollbar_auto_hide = COALESCE(scrollbar_auto_hide, false)
      WHERE scrollbar_width IS NULL 
         OR scrollbar_arrow_style IS NULL 
         OR scrollbar_auto_hide IS NULL
    `;

    console.log('\n✅ Migration completed successfully!');
    console.log('\nNew columns added:');
    console.log('  • scrollbar_width (default: normal)');
    console.log('  • scrollbar_arrow_style (default: classic)');
    console.log('  • scrollbar_auto_hide (default: false)');
    console.log('\n🎉 Scrollbar preferences are now ready to save!');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

// Run migration
runMigration();
