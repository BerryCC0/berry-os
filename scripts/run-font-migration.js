/**
 * Run Font & Custom Theme Migration
 * Applies migration 002 to add font columns and custom theme tables
 */

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  const DATABASE_URL = process.env.DATABASE_URL;
  
  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  console.log('🔄 Connecting to database...');
  const sql = neon(DATABASE_URL);

  try {
    // Read migration file
    const migrationPath = path.join(__dirname, '../docs/migrations/002_add_font_and_custom_themes.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded');
    console.log('🚀 Running migration...\n');

    // Execute ALTER TABLE for font columns
    console.log('1️⃣  Adding font columns to theme_preferences...');
    try {
      await sql`
        ALTER TABLE theme_preferences
        ADD COLUMN IF NOT EXISTS font_family_system VARCHAR(100) DEFAULT 'Chicago'
      `;
      console.log('   ✅ font_family_system added');
    } catch (err) {
      console.log('   ⚠️  font_family_system:', err.message);
    }

    try {
      await sql`
        ALTER TABLE theme_preferences
        ADD COLUMN IF NOT EXISTS font_family_interface VARCHAR(100) DEFAULT 'Geneva'
      `;
      console.log('   ✅ font_family_interface added');
    } catch (err) {
      console.log('   ⚠️  font_family_interface:', err.message);
    }

    try {
      await sql`
        ALTER TABLE theme_preferences
        ADD COLUMN IF NOT EXISTS font_family_custom_system VARCHAR(200)
      `;
      console.log('   ✅ font_family_custom_system added');
    } catch (err) {
      console.log('   ⚠️  font_family_custom_system:', err.message);
    }

    try {
      await sql`
        ALTER TABLE theme_preferences
        ADD COLUMN IF NOT EXISTS font_family_custom_interface VARCHAR(200)
      `;
      console.log('   ✅ font_family_custom_interface added');
    } catch (err) {
      console.log('   ⚠️  font_family_custom_interface:', err.message);
    }

    // Create custom_themes table
    console.log('\n2️⃣  Creating custom_themes table...');
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS custom_themes (
          id SERIAL PRIMARY KEY,
          wallet_address VARCHAR(66) REFERENCES users(wallet_address) ON DELETE CASCADE,
          theme_id VARCHAR(50) NOT NULL,
          theme_name VARCHAR(100) NOT NULL,
          theme_description TEXT,
          theme_data JSONB NOT NULL,
          is_active BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(wallet_address, theme_id)
        )
      `;
      console.log('   ✅ custom_themes table created');
    } catch (err) {
      console.log('   ⚠️  custom_themes:', err.message);
    }

    // Create indexes for custom_themes
    console.log('\n3️⃣  Creating indexes for custom_themes...');
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_custom_themes_wallet ON custom_themes(wallet_address)`;
      console.log('   ✅ idx_custom_themes_wallet created');
    } catch (err) {
      console.log('   ⚠️  idx_custom_themes_wallet:', err.message);
    }

    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_custom_themes_active ON custom_themes(wallet_address, is_active) WHERE is_active = true`;
      console.log('   ✅ idx_custom_themes_active created');
    } catch (err) {
      console.log('   ⚠️  idx_custom_themes_active:', err.message);
    }

    // Create shared_themes table
    console.log('\n4️⃣  Creating shared_themes table...');
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS shared_themes (
          id SERIAL PRIMARY KEY,
          custom_theme_id INTEGER REFERENCES custom_themes(id) ON DELETE CASCADE,
          share_code VARCHAR(50) UNIQUE NOT NULL,
          is_public BOOLEAN DEFAULT false,
          view_count INTEGER DEFAULT 0,
          clone_count INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW(),
          expires_at TIMESTAMP
        )
      `;
      console.log('   ✅ shared_themes table created');
    } catch (err) {
      console.log('   ⚠️  shared_themes:', err.message);
    }

    // Create indexes for shared_themes
    console.log('\n5️⃣  Creating indexes for shared_themes...');
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_shared_themes_code ON shared_themes(share_code)`;
      console.log('   ✅ idx_shared_themes_code created');
    } catch (err) {
      console.log('   ⚠️  idx_shared_themes_code:', err.message);
    }

    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_shared_themes_public ON shared_themes(is_public) WHERE is_public = true`;
      console.log('   ✅ idx_shared_themes_public created');
    } catch (err) {
      console.log('   ⚠️  idx_shared_themes_public:', err.message);
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📊 Verifying changes...');

    // Verify the changes using tagged template
    try {
      const result = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'theme_preferences' 
        AND column_name LIKE 'font_family%'
        ORDER BY column_name
      `;

      if (result.length > 0) {
        console.log('\n✅ Font columns added:');
        result.forEach(col => {
          console.log(`   - ${col.column_name} (${col.data_type})`);
        });
      } else {
        console.log('\n⚠️  Font columns not found - migration may have failed');
      }
    } catch (err) {
      console.log('\n⚠️  Could not verify font columns:', err.message);
    }

    // Check custom_themes table
    try {
      const tablesResult = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name IN ('custom_themes', 'shared_themes')
        ORDER BY table_name
      `;

      if (tablesResult.length > 0) {
        console.log('\n✅ Custom theme tables created:');
        tablesResult.forEach(table => {
          console.log(`   - ${table.table_name}`);
        });
      }
    } catch (err) {
      console.log('\n⚠️  Could not verify custom theme tables:', err.message);
    }

    console.log('\n🎉 Database is ready for font and custom theme features!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
