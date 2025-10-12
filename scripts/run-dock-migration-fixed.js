#!/usr/bin/env node

const { neon } = require('@neondatabase/serverless');

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function runMigration() {
  console.log('🚀 Starting Dock Size Migration (004)...\n');

  try {
    // Show current state
    console.log('📊 BEFORE Migration:');
    const before = await sql`SELECT wallet_address, position, size, auto_hide FROM dock_preferences LIMIT 3`;
    console.table(before);

    // Step 1: Add temporary column
    console.log('\n📝 Step 1: Adding temporary size_px column...');
    await sql`ALTER TABLE dock_preferences ADD COLUMN IF NOT EXISTS size_px INTEGER`;
    
    // Step 2: Migrate data
    console.log('📝 Step 2: Converting VARCHAR sizes to INTEGER pixels...');
    await sql`
      UPDATE dock_preferences
      SET size_px = CASE 
        WHEN size = 'small' THEN 48
        WHEN size = 'large' THEN 80
        ELSE 64
      END
    `;
    
    // Step 3: Drop old column
    console.log('📝 Step 3: Dropping old VARCHAR size column...');
    await sql`ALTER TABLE dock_preferences DROP COLUMN IF EXISTS size`;
    
    // Step 4: Rename new column
    console.log('📝 Step 4: Renaming size_px to size...');
    await sql`ALTER TABLE dock_preferences RENAME COLUMN size_px TO size`;
    
    // Step 5: Set default
    console.log('📝 Step 5: Setting default value...');
    await sql`ALTER TABLE dock_preferences ALTER COLUMN size SET DEFAULT 64`;
    
    // Step 6: Make NOT NULL
    console.log('📝 Step 6: Making size column NOT NULL...');
    await sql`ALTER TABLE dock_preferences ALTER COLUMN size SET NOT NULL`;
    
    // Step 7: Remove magnification_enabled
    console.log('📝 Step 7: Removing deprecated magnification_enabled column...');
    await sql`ALTER TABLE dock_preferences DROP COLUMN IF EXISTS magnification_enabled`;

    // Show final state
    console.log('\n✅ Migration Complete!\n');
    console.log('📊 AFTER Migration:');
    const after = await sql`SELECT wallet_address, position, size, auto_hide FROM dock_preferences LIMIT 3`;
    console.table(after);

    // Verify
    const stats = await sql`
      SELECT 
        COUNT(*) as total_rows,
        MIN(size) as min_size,
        MAX(size) as max_size,
        ROUND(AVG(size)) as avg_size
      FROM dock_preferences
    `;
    console.log('\n🔍 Verification:');
    console.table(stats);

    console.log('\n✨ Success! Dock sizes are now stored as pixels (32-80px range)');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    throw error;
  }
}

runMigration();
