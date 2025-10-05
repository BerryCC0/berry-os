/**
 * Database Initialization Script
 * Automatically creates all required tables for Phase 6
 */

require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function initDatabase() {
  try {
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL not found in .env.local');
      console.error('Please add DATABASE_URL to .env.local first.');
      process.exit(1);
    }

    const sql = neon(process.env.DATABASE_URL);
    
    console.log('🚀 Initializing Nouns OS database...\n');

    // Create users table
    console.log('📊 Creating users table...');
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        wallet_address VARCHAR(66) PRIMARY KEY,
        chain_id INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        last_login TIMESTAMP DEFAULT NOW(),
        last_chain_id INTEGER
      )
    `;
    console.log('   ✅ users table created');

    // Create desktop_icons table
    console.log('📊 Creating desktop_icons table...');
    await sql`
      CREATE TABLE IF NOT EXISTS desktop_icons (
        id SERIAL PRIMARY KEY,
        wallet_address VARCHAR(66) REFERENCES users(wallet_address) ON DELETE CASCADE,
        icon_id VARCHAR(100) NOT NULL,
        position_x INTEGER NOT NULL,
        position_y INTEGER NOT NULL,
        grid_snap BOOLEAN DEFAULT false,
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(wallet_address, icon_id)
      )
    `;
    console.log('   ✅ desktop_icons table created');

    // Create theme_preferences table
    console.log('📊 Creating theme_preferences table...');
    await sql`
      CREATE TABLE IF NOT EXISTS theme_preferences (
        wallet_address VARCHAR(66) PRIMARY KEY REFERENCES users(wallet_address) ON DELETE CASCADE,
        theme_id VARCHAR(50) DEFAULT 'classic',
        wallpaper_url VARCHAR(500) DEFAULT '/filesystem/System/Desktop Pictures/Classic.png',
        accent_color VARCHAR(7),
        window_pattern VARCHAR(50),
        font_size VARCHAR(20) DEFAULT 'medium',
        sound_enabled BOOLEAN DEFAULT true,
        animations_enabled BOOLEAN DEFAULT true,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('   ✅ theme_preferences table created');

    // Create window_states table
    console.log('📊 Creating window_states table...');
    await sql`
      CREATE TABLE IF NOT EXISTS window_states (
        id SERIAL PRIMARY KEY,
        wallet_address VARCHAR(66) REFERENCES users(wallet_address) ON DELETE CASCADE,
        app_id VARCHAR(50) NOT NULL,
        position_x INTEGER,
        position_y INTEGER,
        width INTEGER,
        height INTEGER,
        is_minimized BOOLEAN DEFAULT false,
        is_maximized BOOLEAN DEFAULT false,
        z_index INTEGER,
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(wallet_address, app_id)
      )
    `;
    console.log('   ✅ window_states table created');

    // Create dock_preferences table
    console.log('📊 Creating dock_preferences table...');
    await sql`
      CREATE TABLE IF NOT EXISTS dock_preferences (
        wallet_address VARCHAR(66) PRIMARY KEY REFERENCES users(wallet_address) ON DELETE CASCADE,
        position VARCHAR(20) DEFAULT 'bottom',
        size VARCHAR(20) DEFAULT 'medium',
        pinned_apps TEXT[] DEFAULT ARRAY['finder', 'calculator', 'text-editor']::TEXT[],
        auto_hide BOOLEAN DEFAULT false,
        magnification_enabled BOOLEAN DEFAULT true,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('   ✅ dock_preferences table created');

    // Create system_preferences table
    console.log('📊 Creating system_preferences table...');
    await sql`
      CREATE TABLE IF NOT EXISTS system_preferences (
        wallet_address VARCHAR(66) PRIMARY KEY REFERENCES users(wallet_address) ON DELETE CASCADE,
        double_click_speed VARCHAR(20) DEFAULT 'medium',
        scroll_speed VARCHAR(20) DEFAULT 'medium',
        menu_blink_enabled BOOLEAN DEFAULT true,
        show_hidden_files BOOLEAN DEFAULT false,
        grid_spacing INTEGER DEFAULT 80,
        snap_to_grid BOOLEAN DEFAULT false,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('   ✅ system_preferences table created');

    // Create app_states table
    console.log('📊 Creating app_states table...');
    await sql`
      CREATE TABLE IF NOT EXISTS app_states (
        id SERIAL PRIMARY KEY,
        wallet_address VARCHAR(66) REFERENCES users(wallet_address) ON DELETE CASCADE,
        app_id VARCHAR(50) NOT NULL,
        state_data JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(wallet_address, app_id)
      )
    `;
    console.log('   ✅ app_states table created');

    // Create indexes
    console.log('\n📊 Creating indexes for performance...');
    await sql`CREATE INDEX IF NOT EXISTS idx_desktop_icons_wallet ON desktop_icons(wallet_address)`;
    console.log('   ✅ idx_desktop_icons_wallet created');
    
    await sql`CREATE INDEX IF NOT EXISTS idx_window_states_wallet ON window_states(wallet_address)`;
    console.log('   ✅ idx_window_states_wallet created');
    
    await sql`CREATE INDEX IF NOT EXISTS idx_app_states_wallet ON app_states(wallet_address)`;
    console.log('   ✅ idx_app_states_wallet created');
    
    await sql`CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login)`;
    console.log('   ✅ idx_users_last_login created');

    console.log('\n✅ Database initialization complete!');
    console.log('\n📋 Summary:');
    console.log('   • 7 tables created');
    console.log('   • 4 indexes created');
    console.log('   • Ready for user customization & persistence');
    console.log('\n🚀 Phase 6 is now fully operational!');
    console.log('   Start your dev server: npm run dev');
    console.log('   Connect wallet → drag icons → preferences persist!\n');

  } catch (error) {
    console.error('\n❌ Database initialization failed!');
    console.error('Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check DATABASE_URL is correct in .env.local');
    console.error('2. Verify Neon database is accessible');
    console.error('3. Check your network connection');
    process.exit(1);
  }
}

initDatabase();

