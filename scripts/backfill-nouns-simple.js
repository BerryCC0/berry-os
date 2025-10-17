#!/usr/bin/env node

/**
 * Nouns Database Backfill Script (JavaScript + Neon Direct)
 * 
 * This script uses the same approach as init-database.js:
 * - Pure JavaScript (no TypeScript compilation needed)
 * - Direct Neon database access
 * - Loads .env.local automatically
 * 
 * Usage:
 *   node scripts/backfill-nouns-simple.js [--limit=10]
 */

require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const { ApolloClient, InMemoryCache, HttpLink, gql } = require('@apollo/client');
const fetch = require('cross-fetch');

// Check environment
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env.local');
  process.exit(1);
}

if (!process.env.ETHERSCAN_API_KEY) {
  console.warn('⚠️  ETHERSCAN_API_KEY not found - settler addresses will not be fetched');
}

// Configuration
const sql = neon(process.env.DATABASE_URL);
const LIMIT = parseInt(process.argv.find(arg => arg.startsWith('--limit='))?.split('=')[1] || '10');
const GOLDSKY_ENDPOINT = 'https://api.goldsky.com/api/public/project_cldf2o9pqagp43svvbk5u3kmo/subgraphs/nouns/prod/gn';

// Apollo Client
const client = new ApolloClient({
  link: new HttpLink({
    uri: GOLDSKY_ENDPOINT,
    fetch,
  }),
  cache: new InMemoryCache(),
});

// Import the SVG generation (we need to use require for the compiled JS)
// For now, we'll use a placeholder SVG
function generateSimpleSVG(traits) {
  // Simple placeholder - in production, use the real SVG builder
  return `<svg width="320" height="320" xmlns="http://www.w3.org/2000/svg">
    <rect width="320" height="320" fill="#d5d7e1"/>
    <text x="160" y="160" text-anchor="middle" font-size="48">⌐◨-◨</text>
    <text x="160" y="200" text-anchor="middle" font-size="12">Noun ${traits.id}</text>
  </svg>`;
}

// GraphQL Query
const NOUNS_QUERY = gql`
  query GetNouns($first: Int!) {
    nouns(first: $first, orderBy: id, orderDirection: asc) {
      id
      seed {
        id
        background
        body
        accessory
        head
        glasses
      }
      owner {
        id
      }
    }
  }
`;

async function fetchNouns(limit) {
  console.log(`📡 Fetching ${limit} Nouns from Goldsky...`);
  
  const { data } = await client.query({
    query: NOUNS_QUERY,
    variables: { first: limit },
  });
  
  console.log(`✅ Fetched ${data.nouns.length} Nouns\n`);
  return data.nouns;
}

async function insertNoun(noun) {
  try {
    const svg = generateSimpleSVG({ id: noun.id, ...noun.seed });
    
    await sql`
      INSERT INTO nouns (
        noun_id, background, body, accessory, head, glasses,
        svg_data, created_timestamp, created_block,
        current_owner, current_delegate
      ) VALUES (
        ${parseInt(noun.id)},
        ${parseInt(noun.seed.background)},
        ${parseInt(noun.seed.body)},
        ${parseInt(noun.seed.accessory)},
        ${parseInt(noun.seed.head)},
        ${parseInt(noun.seed.glasses)},
        ${svg},
        ${'0'},
        ${'0'},
        ${noun.owner.id},
        ${null}
      )
      ON CONFLICT (noun_id) DO UPDATE SET
        current_owner = EXCLUDED.current_owner,
        updated_at = NOW()
    `;
    
    return true;
  } catch (error) {
    console.error(`   ❌ Error inserting Noun ${noun.id}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('=== Nouns Database Backfill ===\n');
  console.log(`📊 Limit: ${LIMIT} Nouns`);
  console.log(`🗄️  Database: ${process.env.DATABASE_URL.split('@')[1]?.split('/')[0] || 'Connected'}\n`);
  
  try {
    // Fetch Nouns from Goldsky
    const nouns = await fetchNouns(LIMIT);
    
    // Process each Noun
    console.log('💾 Inserting Nouns into database...\n');
    let successful = 0;
    let failed = 0;
    
    for (let i = 0; i < nouns.length; i++) {
      const noun = nouns[i];
      process.stdout.write(`   Processing Noun ${noun.id}... `);
      
      const success = await insertNoun(noun);
      if (success) {
        console.log('✅');
        successful++;
      } else {
        failed++;
      }
    }
    
    // Summary
    console.log('\n=== Backfill Complete ===');
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total: ${nouns.length}`);
    console.log(`💯 Success Rate: ${((successful / nouns.length) * 100).toFixed(1)}%\n`);
    
    // Verify
    console.log('🔍 Verifying data...');
    const count = await sql`SELECT COUNT(*) as count FROM nouns`;
    console.log(`   Database now has ${count[0].count} Nouns\n`);
    
    // Show sample
    const sample = await sql`SELECT noun_id, current_owner FROM nouns ORDER BY noun_id LIMIT 3`;
    console.log('📋 Sample data:');
    sample.forEach(row => {
      console.log(`   Noun ${row.noun_id}: ${row.current_owner.slice(0, 10)}...`);
    });
    
    console.log('\n✅ Backfill complete!');
    console.log('\n💡 Next steps:');
    console.log('   • Test API: curl "http://localhost:3000/api/nouns/fetch?id=0"');
    console.log('   • Run more: node scripts/backfill-nouns-simple.js --limit=100');
    console.log('   • Check data: psql $DATABASE_URL -c "SELECT * FROM nouns LIMIT 5;"\n');
    
  } catch (error) {
    console.error('\n❌ Backfill failed!');
    console.error('Error:', error.message);
    console.error('\nStack:', error.stack);
    process.exit(1);
  }
}

main();

