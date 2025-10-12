const { neon } = require('@neondatabase/serverless');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function checkYourDockSize() {
  console.log('🔍 Checking your dock size...\n');
  
  const data = await sql`
    SELECT 
      wallet_address, 
      size,
      pg_typeof(size) as size_type,
      size::text as size_as_text
    FROM dock_preferences 
    ORDER BY updated_at DESC
    LIMIT 10
  `;
  
  console.log('All dock_preferences records:');
  console.table(data);
}

checkYourDockSize().catch(console.error);
