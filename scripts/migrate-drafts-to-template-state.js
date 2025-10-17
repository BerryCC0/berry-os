/**
 * Migration Script: Convert existing drafts to new template state format
 * 
 * This script:
 * 1. Renames draft_name to draft_slug
 * 2. Adds draft_title (initially same as title)
 * 3. Converts actions to action_templates with 'custom' template
 * 
 * Run with: node scripts/migrate-drafts-to-template-state.js
 */

const { neon } = require('@neondatabase/serverless');

async function migrateDrafts() {
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('Starting draft migration...\n');
  
  try {
    // Step 1: Check if migration is needed
    console.log('Checking if migration is needed...');
    const columnsCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'proposal_drafts' 
      AND column_name IN ('draft_name', 'draft_slug', 'draft_title', 'action_templates')
    `;
    
    const columnNames = columnsCheck.map(c => c.column_name);
    console.log('Existing columns:', columnNames);
    
    if (!columnNames.includes('draft_name') && columnNames.includes('draft_slug')) {
      console.log('\n✓ Migration already completed!');
      return;
    }
    
    // Step 2: Get all existing drafts
    console.log('\nFetching existing drafts...');
    const existingDrafts = await sql`SELECT * FROM proposal_drafts`;
    console.log(`Found ${existingDrafts.length} drafts to migrate`);
    
    if (existingDrafts.length === 0) {
      console.log('No drafts to migrate.');
      return;
    }
    
    // Step 3: Run schema migration
    console.log('\nRunning schema migration...');
    
    // Add new columns
    await sql`
      ALTER TABLE proposal_drafts 
      ADD COLUMN IF NOT EXISTS draft_title VARCHAR(200),
      ADD COLUMN IF NOT EXISTS action_templates JSONB DEFAULT '[]'
    `;
    console.log('✓ Added draft_title and action_templates columns');
    
    // Step 4: Migrate data for each draft
    console.log('\nMigrating draft data...');
    for (const draft of existingDrafts) {
      try {
        // Parse actions from JSONB
        const actions = typeof draft.actions === 'string' 
          ? JSON.parse(draft.actions) 
          : draft.actions;
        
        // Convert each action to a custom template
        const actionTemplates = actions.map(action => ({
          templateId: 'custom',
          fieldValues: {},
          generatedActions: [action]
        }));
        
        // Update draft with new fields
        await sql`
          UPDATE proposal_drafts
          SET 
            draft_title = ${draft.title},
            action_templates = ${JSON.stringify(actionTemplates)}
          WHERE id = ${draft.id}
        `;
        
        console.log(`✓ Migrated draft ${draft.id}: "${draft.title}"`);
      } catch (error) {
        console.error(`✗ Failed to migrate draft ${draft.id}:`, error.message);
      }
    }
    
    // Step 5: Rename column and update constraints
    console.log('\nRenaming draft_name to draft_slug...');
    
    // Drop old constraint
    await sql`
      ALTER TABLE proposal_drafts 
      DROP CONSTRAINT IF EXISTS proposal_drafts_wallet_address_draft_name_key
    `;
    
    // Rename column
    await sql`
      ALTER TABLE proposal_drafts 
      RENAME COLUMN draft_name TO draft_slug
    `;
    
    // Add new constraint
    await sql`
      ALTER TABLE proposal_drafts 
      ADD CONSTRAINT proposal_drafts_wallet_address_draft_slug_key 
      UNIQUE(wallet_address, draft_slug)
    `;
    
    console.log('✓ Renamed draft_name to draft_slug');
    
    // Step 6: Make draft_title NOT NULL
    console.log('\nSetting draft_title as NOT NULL...');
    await sql`
      ALTER TABLE proposal_drafts 
      ALTER COLUMN draft_title SET NOT NULL
    `;
    console.log('✓ Set draft_title as NOT NULL');
    
    // Step 7: Update column comments (run separately)
    await sql`COMMENT ON COLUMN proposal_drafts.draft_slug IS 'Auto-generated internal identifier (slug) for the draft'`;
    await sql`COMMENT ON COLUMN proposal_drafts.draft_title IS 'User-editable draft name (separate from proposal title)'`;
    await sql`COMMENT ON COLUMN proposal_drafts.action_templates IS 'JSON array of template states [{templateId, fieldValues, generatedActions}] for re-editing'`;
    
    console.log('\n✅ Migration completed successfully!');
    console.log(`\nMigrated ${existingDrafts.length} drafts to new format.`);
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  }
}

// Run migration
migrateDrafts()
  .then(() => {
    console.log('\nDone!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nFatal error:', error);
    process.exit(1);
  });

