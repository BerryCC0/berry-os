// Quick test script to verify database connection
require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function testConnection() {
  try {
    const sql = neon(process.env.DATABASE_URL);
    
    console.log('🔍 Testing database connection...\n');
    
    // Test connection
    const result = await sql`SELECT current_database(), current_user`;
    console.log('✅ Database connected successfully!');
    console.log('   Database:', result[0].current_database);
    console.log('   User:', result[0].current_user);
    console.log('');
    
    // Check if tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    console.log('📊 Tables in database:');
    if (tables.length === 0) {
      console.log('   ⚠️  NO TABLES FOUND!');
      console.log('   ➡️  Run: npm run db:init');
    } else {
      tables.forEach(t => console.log('   ✅', t.table_name));
    }
    
    console.log('');
    console.log('Expected tables for Phase 6:');
    const expectedTables = [
      'users',
      'desktop_icons',
      'theme_preferences',
      'window_states',
      'dock_preferences',
      'system_preferences',
      'app_states'
    ];
    
    expectedTables.forEach(table => {
      const exists = tables.some(t => t.table_name === table);
      console.log(`   ${exists ? '✅' : '❌'}`, table);
    });
    
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error('Error:', error.message);
    console.error('\nCheck:');
    console.error('1. DATABASE_URL is correct in .env.local');
    console.error('2. Neon database is running');
    console.error('3. Network connection is active');
  }
}

testConnection();

