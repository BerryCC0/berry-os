/**
 * Migration script for proposal_drafts table
 * Run with: node scripts/migrate-proposal-drafts.js
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in environment variables');
    console.error('Please set DATABASE_URL in .env.local');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  console.log('🔄 Running migration for proposal_drafts table...\n');

  try {
    // Create the table
    await sql`
      CREATE TABLE IF NOT EXISTS proposal_drafts (
        id SERIAL PRIMARY KEY,
        wallet_address VARCHAR(66) REFERENCES users(wallet_address) ON DELETE CASCADE,
        draft_name VARCHAR(200) NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        actions JSONB NOT NULL DEFAULT '[]',
        proposal_type VARCHAR(50) DEFAULT 'standard',
        kyc_verified BOOLEAN DEFAULT FALSE,
        kyc_inquiry_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(wallet_address, draft_name)
      )
    `;
    console.log('✅ Created proposal_drafts table');

    // Create indexes
    await sql`
      CREATE INDEX IF NOT EXISTS idx_proposal_drafts_wallet 
      ON proposal_drafts(wallet_address)
    `;
    console.log('✅ Created index: idx_proposal_drafts_wallet');

    await sql`
      CREATE INDEX IF NOT EXISTS idx_proposal_drafts_updated 
      ON proposal_drafts(updated_at DESC)
    `;
    console.log('✅ Created index: idx_proposal_drafts_updated');

    // Add comments (optional, may not work on all Postgres versions)
    try {
      await sql`
        COMMENT ON TABLE proposal_drafts IS 
        'Stores draft proposals for Nouns DAO governance, allowing users to save work-in-progress before submission'
      `;
      console.log('✅ Added table comment');
    } catch (err) {
      console.log('⚠️  Could not add table comment (non-critical)');
    }

    console.log('\n✅ Migration completed successfully!\n');
    console.log('You can now use the Create Proposal feature in Camp.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:');
    console.error(error);
    process.exit(1);
  }
}

migrate();

