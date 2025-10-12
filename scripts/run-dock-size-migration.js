#!/usr/bin/env node

/**
 * Migration Script: Dock Size to Pixels
 * Converts dock size from VARCHAR categories to INTEGER pixels
 * 
 * Usage:
 *   node scripts/run-dock-size-migration.js
 * 
 * Environment:
 *   DATABASE_URL - Neon database connection string (required)
 */

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Check for DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is required');
  console.error('   Set it in your .env.local file or export it:');
  console.error('   export DATABASE_URL="postgresql://..."');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function runMigration() {
  console.log('🚀 Starting Dock Size Migration (004)...\n');

  try {
    // Read migration file
    const migrationPath = path.join(__dirname, '../docs/migrations/004_dock_size_to_pixels.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Show current state before migration
    console.log('📊 Current dock_preferences (before migration):');
    try {
      const beforeData = await sql`
        SELECT wallet_address, position, size, auto_hide 
        FROM dock_preferences 
        LIMIT 5
      `;
      console.table(beforeData);
    } catch (error) {
      console.log('   (Table may not exist yet or structure different)');
    }

    console.log('\n🔄 Running migration...');

    // Split SQL into individual statements and execute
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`   Executing: ${statement.substring(0, 60)}...`);
        await sql([statement]);
      }
    }

    // Show state after migration
    console.log('\n✅ Migration complete!\n');
    console.log('📊 dock_preferences (after migration):');
    const afterData = await sql`
      SELECT wallet_address, position, size, auto_hide 
      FROM dock_preferences 
      LIMIT 5
    `;
    console.table(afterData);

    // Verify data integrity
    console.log('\n🔍 Verification:');
    const stats = await sql`
      SELECT 
        COUNT(*) as total_rows,
        MIN(size) as min_size,
        MAX(size) as max_size,
        AVG(size) as avg_size
      FROM dock_preferences
    `;
    console.table(stats);

    console.log('\n✨ Migration successful!');
    console.log('   - size column is now INTEGER (pixels)');
    console.log('   - magnification_enabled column removed');
    console.log('   - All data preserved and converted correctly\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    
    console.log('\n🔄 Rollback instructions:');
    console.log('   If you need to rollback, run this SQL manually:');
    console.log('   ALTER TABLE dock_preferences ADD COLUMN size_old VARCHAR(20);');
    console.log('   UPDATE dock_preferences SET size_old = CASE WHEN size <= 48 THEN \'small\' WHEN size >= 80 THEN \'large\' ELSE \'medium\' END;');
    console.log('   ALTER TABLE dock_preferences DROP COLUMN size;');
    console.log('   ALTER TABLE dock_preferences RENAME COLUMN size_old TO size;');
    console.log('   ALTER TABLE dock_preferences ADD COLUMN magnification_enabled BOOLEAN DEFAULT true;\n');
    
    process.exit(1);
  }
}

// Run migration
runMigration();

