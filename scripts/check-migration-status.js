const { neon } = require('@neondatabase/serverless');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function checkMigration() {
  console.log('🔍 Checking migration status...\n');
  
  // Check column type
  const columnInfo = await sql`
    SELECT column_name, data_type, column_default
    FROM information_schema.columns
    WHERE table_name = 'dock_preferences' AND column_name = 'size'
  `;
  
  console.log('📊 Column Type:');
  console.table(columnInfo);
  
  // Check actual data with explicit cast to show it's integer
  const data = await sql`
    SELECT 
      wallet_address, 
      position, 
      size,
      size::text as size_as_text,
      auto_hide 
    FROM dock_preferences 
    LIMIT 5
  `;
  
  console.log('\n📊 Current Data:');
  console.table(data);
  
  // Check all columns
  const allColumns = await sql`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'dock_preferences'
    ORDER BY ordinal_position
  `;
  
  console.log('\n📋 All Columns in dock_preferences:');
  console.table(allColumns);
}

checkMigration().catch(console.error);
