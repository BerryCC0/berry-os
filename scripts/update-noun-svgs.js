#!/usr/bin/env node

/**
 * Update Noun SVGs Script
 * 
 * Regenerates all SVGs in the database using the generate-svg API endpoint
 * with real Noun image data.
 * 
 * Usage:
 *   node scripts/update-noun-svgs.js [options]
 * 
 * Options:
 *   --limit=<n>        Number of Nouns to update (default: all)
 *   --batch=<n>        Batch size (default: 10)
 *   --start=<n>        Start from Noun ID (default: 0)
 *   --api=<url>        API base URL (default: http://localhost:3000)
 */

require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const fetch = require('cross-fetch');

// Check environment
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env.local');
  process.exit(1);
}

// Configuration
const sql = neon(process.env.DATABASE_URL);
const LIMIT = process.argv.find(arg => arg.startsWith('--limit='))?.split('=')[1];
const BATCH_SIZE = parseInt(process.argv.find(arg => arg.startsWith('--batch='))?.split('=')[1] || '10');
const START_ID = parseInt(process.argv.find(arg => arg.startsWith('--start='))?.split('=')[1] || '0');
const API_BASE = process.argv.find(arg => arg.startsWith('--api='))?.split('=')[1] || 'http://localhost:3000';

// Stats
let stats = {
  total: 0,
  processed: 0,
  successful: 0,
  failed: 0,
  skipped: 0,
  startTime: Date.now(),
};

/**
 * Generate SVG using the API endpoint
 */
async function generateSVG(traits) {
  try {
    const response = await fetch(`${API_BASE}/api/nouns/generate-svg`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(traits),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }

    const data = await response.json();
    return data.svg;
  } catch (error) {
    console.error(`\n   ❌ Error generating SVG for traits:`, traits, error.message);
    return null;
  }
}

/**
 * Update Noun SVG in database
 */
async function updateNounSVG(nounId, svg) {
  try {
    await sql`
      UPDATE nouns
      SET svg_data = ${svg}, updated_at = NOW()
      WHERE noun_id = ${nounId}
    `;
    return true;
  } catch (error) {
    console.error(`\n   ❌ Error updating Noun ${nounId}:`, error.message);
    return false;
  }
}

/**
 * Print progress
 */
function printProgress() {
  const elapsed = (Date.now() - stats.startTime) / 1000;
  const rate = stats.processed / elapsed;
  const remaining = stats.total - stats.processed;
  const eta = remaining / rate;
  const pct = ((stats.processed / stats.total) * 100).toFixed(1);

  process.stdout.write(
    `\r📊 Progress: ${stats.processed}/${stats.total} (${pct}%) | ` +
    `✅ ${stats.successful} | ❌ ${stats.failed} | ⏭️  ${stats.skipped} | ` +
    `⚡ ${rate.toFixed(2)}/s | ` +
    `⏱️  ETA: ${Math.floor(eta / 60)}m ${Math.floor(eta % 60)}s   `
  );
}

/**
 * Main migration function
 */
async function main() {
  console.log('=== Update Noun SVGs with Real Image Data ===\n');
  console.log(`🗄️  Database: ${process.env.DATABASE_URL.split('@')[1]?.split('/')[0] || 'Connected'}`);
  console.log(`🌐 API Endpoint: ${API_BASE}/api/nouns/generate-svg`);
  console.log(`📊 Limit: ${LIMIT || 'ALL Nouns'}`);
  console.log(`🔢 Batch Size: ${BATCH_SIZE}`);
  console.log(`🎯 Starting from: Noun ${START_ID}`);
  console.log('');

  try {
    // Fetch all Nouns from database
    console.log('📡 Fetching Nouns from database...');
    
    let query;
    if (LIMIT) {
      query = sql`
        SELECT noun_id, background, body, accessory, head, glasses
        FROM nouns
        WHERE noun_id >= ${START_ID}
        ORDER BY noun_id
        LIMIT ${parseInt(LIMIT)}
      `;
    } else {
      query = sql`
        SELECT noun_id, background, body, accessory, head, glasses
        FROM nouns
        WHERE noun_id >= ${START_ID}
        ORDER BY noun_id
      `;
    }

    const nouns = await query;
    stats.total = nouns.length;

    console.log(`✅ Found ${stats.total} Nouns to update\n`);

    if (stats.total === 0) {
      console.log('No Nouns to update. Exiting.');
      return;
    }

    // Process in batches
    console.log('🎨 Generating SVGs and updating database...\n');

    for (let i = 0; i < nouns.length; i += BATCH_SIZE) {
      const batch = nouns.slice(i, i + BATCH_SIZE);

      const results = await Promise.all(
        batch.map(async (noun) => {
          // Generate SVG using API
          const svg = await generateSVG({
            background: noun.background,
            body: noun.body,
            accessory: noun.accessory,
            head: noun.head,
            glasses: noun.glasses,
          });

          if (!svg) {
            stats.failed++;
            return false;
          }

          // Check if it's a real SVG (not placeholder)
          if (svg.includes('⌐◨-◨') || svg.length < 500) {
            // This is a placeholder, skip it
            stats.skipped++;
            return false;
          }

          // Update database
          const updated = await updateNounSVG(noun.noun_id, svg);
          
          if (updated) {
            stats.successful++;
            return true;
          } else {
            stats.failed++;
            return false;
          }
        })
      );

      stats.processed += batch.length;
      printProgress();

      // Small delay between batches to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Final stats
    console.log('\n\n=== SVG Update Complete ===');
    console.log(`✅ Successful: ${stats.successful}`);
    console.log(`❌ Failed: ${stats.failed}`);
    console.log(`⏭️  Skipped: ${stats.skipped}`);
    console.log(`📊 Total Processed: ${stats.processed}`);
    console.log(`💯 Success Rate: ${((stats.successful / stats.processed) * 100).toFixed(1)}%`);
    console.log(`⏱️  Duration: ${((Date.now() - stats.startTime) / 1000 / 60).toFixed(2)} minutes\n`);

    // Verify database
    console.log('🔍 Verifying database...');
    const [count] = await sql`
      SELECT COUNT(*) as count 
      FROM nouns 
      WHERE LENGTH(svg_data) > 1000
    `;

    console.log(`   📊 Nouns with real SVGs: ${count.count}\n`);

    // Sample data
    const sample = await sql`
      SELECT noun_id, background, body, head, 
             LEFT(svg_data, 50) as svg_preview,
             LENGTH(svg_data) as svg_length
      FROM nouns
      WHERE LENGTH(svg_data) > 1000
      ORDER BY noun_id
      LIMIT 5
    `;

    console.log('📋 Sample data:');
    sample.forEach(row => {
      console.log(`   Noun ${row.noun_id}: SVG length ${row.svg_length} bytes`);
    });

    console.log('\n✅ SVG update complete!');
    console.log('\n💡 Next steps:');
    console.log('   • Verify SVGs: curl "http://localhost:3000/api/nouns/fetch?id=0"');
    console.log('   • Test in Auction app');
    console.log('   • Compare with client-side generation\n');

  } catch (error) {
    console.error('\n❌ SVG update failed!');
    console.error('Error:', error.message);
    console.error('\nStack:', error.stack);
    process.exit(1);
  }
}

main();

