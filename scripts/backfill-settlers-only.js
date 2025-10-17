#!/usr/bin/env node

/**
 * Backfill Settler Addresses Only
 * 
 * Updates existing Nouns in the database with settler addresses from Etherscan.
 * Much faster than re-running the full backfill.
 * 
 * Usage:
 *   node scripts/backfill-settlers-only.js [options]
 * 
 * Options:
 *   --limit=<n>   Number of Nouns to process (default: all)
 *   --batch=<n>   Batch size (default: 5, slower due to Etherscan rate limits)
 *   --start=<id>  Start from Noun ID (default: 0)
 */

require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const fetch = require('cross-fetch');

// Configuration
const sql = neon(process.env.DATABASE_URL);
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const LIMIT = process.argv.find(arg => arg.startsWith('--limit='))?.split('=')[1];
const BATCH_SIZE = parseInt(process.argv.find(arg => arg.startsWith('--batch='))?.split('=')[1] || '5');
const START_ID = parseInt(process.argv.find(arg => arg.startsWith('--start='))?.split('=')[1] || '0');

// Rate limiting - increased to be more conservative
let lastEtherscanCall = 0;
const ETHERSCAN_RATE_LIMIT_MS = 500; // 2 req/sec (was 250ms = 4 req/sec)

// Cache for AuctionCreated events (fetch once, reuse for all Nouns)
let auctionCreatedEventsCache = null;
let cacheInitPromise = null; // Promise for initializing cache (prevent duplicate fetches)

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
 * Initialize the AuctionCreated events cache
 * Fetches ALL AuctionCreated events with pagination if needed
 */
async function initializeCache() {
  if (auctionCreatedEventsCache) {
    return; // Already initialized
  }

  if (cacheInitPromise) {
    // Already initializing, wait for it
    await cacheInitPromise;
    return;
  }

  cacheInitPromise = (async () => {
    try {
      const AUCTION_HOUSE = '0x830BD73E4184ceF73443C15111a1DF14e495C706';
      const AUCTION_CREATED_TOPIC = '0xd6eddd1118d71820909c1197aa966dbc15ed6f508554252169cc3d5ccac756ca';
      const fromBlock = 12985000;
      const toBlock = 'latest'; // Use 'latest' to get all Nouns including recent ones

      console.log('📥 Fetching ALL AuctionCreated events from Etherscan...');
      
      let allEvents = [];
      let page = 1;
      const offset = 1000; // Max per page
      
      while (true) {
        // Rate limiting
        const now = Date.now();
        const timeSinceLastCall = now - lastEtherscanCall;
        if (timeSinceLastCall < ETHERSCAN_RATE_LIMIT_MS) {
          await new Promise(resolve => 
            setTimeout(resolve, ETHERSCAN_RATE_LIMIT_MS - timeSinceLastCall)
          );
        }
        lastEtherscanCall = Date.now();

        const url = `https://api.etherscan.io/v2/api` +
          `?chainid=1` +
          `&module=logs` +
          `&action=getLogs` +
          `&address=${AUCTION_HOUSE}` +
          `&topic0=${AUCTION_CREATED_TOPIC}` +
          `&fromBlock=${fromBlock}` +
          `&toBlock=${toBlock}` +
          `&page=${page}` +
          `&offset=${offset}` +
          `&apikey=${ETHERSCAN_API_KEY}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== '1') {
          console.error(`❌ Failed to fetch page ${page}: ${data.message || 'Unknown error'}`);
          break;
        }

        const results = data.result || [];
        if (results.length === 0) {
          break; // No more results
        }

        allEvents.push(...results);
        console.log(`   Page ${page}: ${results.length} events (total: ${allEvents.length})`);

        if (results.length < offset) {
          break; // Last page
        }

        page++;
      }

      auctionCreatedEventsCache = allEvents;
      console.log(`✅ Cached ${allEvents.length} AuctionCreated events\n`);
    } catch (error) {
      console.error(`❌ Error initializing cache: ${error.message}\n`);
      cacheInitPromise = null; // Allow retry
    }
  })();

  await cacheInitPromise;
}

/**
 * Fetch settler address from Etherscan using Logs API
 * 
 * The settler is the address that calls settleCurrentAndCreateNewAuction(),
 * which creates the NEXT auction. We find this by looking for the AuctionCreated
 * event with the given Noun ID and getting the transaction sender.
 * 
 * IMPORTANT: 
 * - Noun 1 has NO settler (created at contract deployment)
 * - Nounder Nouns (0, 10, 20...) DO have settlers (they get AuctionCreated events)
 * - The settler is the `from` address of the transaction containing AuctionCreated
 */
async function getSettlerAddress(nounId) {
  if (!ETHERSCAN_API_KEY) {
    return null;
  }

  // Special case: Noun 1 has no settler (created at deployment)
  if (parseInt(nounId) === 1) {
    return null;
  }

  try {
    // Ensure cache is initialized
    await initializeCache();
    
    if (!auctionCreatedEventsCache || auctionCreatedEventsCache.length === 0) {
      return null;
    }

    // Encode nounId as topic1 for client-side filtering
    const nounIdHex = '0x' + parseInt(nounId).toString(16).padStart(64, '0');

    // Filter cached events for the specific Noun ID
    const matchingEvent = auctionCreatedEventsCache.find(event => 
      event.topics[1] === nounIdHex
    );
    
    if (!matchingEvent) {
      return null;
    }

    const settlementTxHash = matchingEvent.transactionHash;
    
    // Now get the transaction to find who sent it (the settler)
    // Rate limit this call
    const now = Date.now();
    const timeSinceLastCall = now - lastEtherscanCall;
    if (timeSinceLastCall < ETHERSCAN_RATE_LIMIT_MS) {
      await new Promise(resolve => 
        setTimeout(resolve, ETHERSCAN_RATE_LIMIT_MS - timeSinceLastCall)
      );
    }
    lastEtherscanCall = Date.now();
    
    const txUrl = `https://api.etherscan.io/v2/api` +
      `?chainid=1` +
      `&module=proxy` +
      `&action=eth_getTransactionByHash` +
      `&txhash=${settlementTxHash}` +
      `&apikey=${ETHERSCAN_API_KEY}`;
    
    const txResponse = await fetch(txUrl);
    const txData = await txResponse.json();

    if (txData.result && txData.result.from) {
      return txData.result.from.toLowerCase();
    }

    return null;
  } catch (error) {
    // Log ALL errors for debugging
    console.error(`\n   ❌ Error fetching settler for Noun ${nounId}: ${error.message}`);
    return null;
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
 * Main backfill function
 */
async function main() {
  console.log('=== Backfill Settler Addresses ===\n');
  console.log(`🗄️  Database: ${process.env.DATABASE_URL.split('@')[1]?.split('/')[0] || 'Connected'}`);
  console.log(`📊 Limit: ${LIMIT || 'ALL Nouns'}`);
  console.log(`🔢 Batch Size: ${BATCH_SIZE}`);
  console.log(`🎯 Starting from: Noun ${START_ID}`);
  console.log('');

  if (!ETHERSCAN_API_KEY) {
    console.error('❌ ETHERSCAN_API_KEY not found in .env.local');
    process.exit(1);
  }

  try {
    // Fetch Nouns with auction data but no settler
    console.log('📡 Fetching Nouns without settler data...');
    
    let query;
    if (LIMIT) {
      query = sql`
        SELECT a.noun_id
        FROM auction_history a
        WHERE a.settler_address IS NULL 
          AND a.noun_id >= ${START_ID}
        ORDER BY a.noun_id ASC
        LIMIT ${parseInt(LIMIT)}
      `;
    } else {
      query = sql`
        SELECT a.noun_id
        FROM auction_history a
        WHERE a.settler_address IS NULL 
          AND a.noun_id >= ${START_ID}
        ORDER BY a.noun_id ASC
      `;
    }

    const nounsToUpdate = await query;
    stats.total = nounsToUpdate.length;

    console.log(`✅ Found ${stats.total} Nouns to update\n`);

    if (stats.total === 0) {
      console.log('✨ All Nouns already have settler data!');
      return;
    }

    console.log('🔍 Fetching settler addresses from Etherscan...');
    console.log('⚠️  This will take a while due to rate limiting (~4 req/sec)\n');

    // Process in small batches
    for (let i = 0; i < nounsToUpdate.length; i += BATCH_SIZE) {
      const batch = nounsToUpdate.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (row) => {
          try {
            const settlerAddress = await getSettlerAddress(row.noun_id);

            if (settlerAddress) {
              await sql`
                UPDATE auction_history
                SET settler_address = ${settlerAddress}
                WHERE noun_id = ${row.noun_id}
              `;
              stats.successful++;
            } else {
              stats.skipped++;
            }
          } catch (error) {
            stats.failed++;
          }

          stats.processed++;
        })
      );

      printProgress();
    }

    // Final stats
    console.log('\n\n=== Backfill Complete ===');
    console.log(`✅ Successful: ${stats.successful}`);
    console.log(`❌ Failed: ${stats.failed}`);
    console.log(`⏭️  Skipped (not found): ${stats.skipped}`);
    console.log(`📊 Total Processed: ${stats.processed}`);
    console.log(`💯 Success Rate: ${((stats.successful / stats.processed) * 100).toFixed(1)}%`);
    console.log(`⏱️  Duration: ${((Date.now() - stats.startTime) / 1000 / 60).toFixed(2)} minutes\n`);

    // Verify
    const result = await sql`SELECT COUNT(*) as count FROM auction_history WHERE settler_address IS NOT NULL`;
    console.log(`🔍 Total auctions with settlers: ${result[0].count}\n`);

    // Sample
    const sample = await sql`
      SELECT noun_id, LEFT(winner_address, 10) as winner, LEFT(settler_address, 10) as settler
      FROM auction_history
      WHERE settler_address IS NOT NULL
      ORDER BY noun_id DESC
      LIMIT 5
    `;

    console.log('📋 Recent settlers:');
    sample.forEach(row => {
      console.log(`   Noun ${row.noun_id}: Winner ${row.winner}... | Settler ${row.settler}...`);
    });

    console.log('\n✅ Settler backfill complete!\n');

  } catch (error) {
    console.error('\n❌ Backfill failed!');
    console.error('Error:', error.message);
    console.error('\nStack:', error.stack);
    process.exit(1);
  }
}

main();

