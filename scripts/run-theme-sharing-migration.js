require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.error('Please add it to your .env.local file');
    process.exit(1);
  }

  console.log('🚀 Running Phase 8C Theme Sharing Migration...\n');

  const sql = neon(databaseUrl);

  try {
    // Read migration file
    const migrationPath = path.join(__dirname, '../docs/migrations/003_update_theme_sharing.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Execute DROP TABLE
    console.log('Dropping old shared_themes table...');
    await sql`DROP TABLE IF EXISTS shared_themes CASCADE`;

    // Create new shared_themes
    console.log('Creating new shared_themes table...');
    await sql`
      CREATE TABLE shared_themes (
        id SERIAL PRIMARY KEY,
        theme_id VARCHAR(50) NOT NULL,
        wallet_address VARCHAR(66) NOT NULL,
        share_code VARCHAR(8) UNIQUE NOT NULL,
        view_count INTEGER DEFAULT 0,
        install_count INTEGER DEFAULT 0,
        shared_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (wallet_address, theme_id) REFERENCES custom_themes(wallet_address, theme_id) ON DELETE CASCADE
      )
    `;

    // Add columns to custom_themes
    console.log('Adding is_public and share_code columns to custom_themes...');
    await sql`
      ALTER TABLE custom_themes
      ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false
    `;
    await sql`
      ALTER TABLE custom_themes
      ADD COLUMN IF NOT EXISTS share_code VARCHAR(8)
    `;

    // Create indexes
    console.log('Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_shared_themes_code ON shared_themes(share_code)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_shared_themes_wallet ON shared_themes(wallet_address)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_custom_themes_public ON custom_themes(is_public) WHERE is_public = true`;

    console.log('\n✅ Migration completed successfully!');
    console.log('\nVerifying tables...');

    // Verify tables exist
    const tablesCheck = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('custom_themes', 'shared_themes')
      ORDER BY table_name
    `;

    console.log('\n📊 Tables verified:');
    tablesCheck.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });

    // Check custom_themes columns
    const customThemesColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'custom_themes'
      ORDER BY ordinal_position
    `;

    console.log('\n📋 custom_themes columns:');
    customThemesColumns.forEach(col => {
      console.log(`  • ${col.column_name} (${col.data_type})`);
    });

    // Check shared_themes columns
    const sharedThemesColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'shared_themes'
      ORDER BY ordinal_position
    `;

    console.log('\n📋 shared_themes columns:');
    sharedThemesColumns.forEach(col => {
      console.log(`  • ${col.column_name} (${col.data_type})`);
    });

    console.log('\n✨ Phase 8C database schema is ready!');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
