#!/usr/bin/env ts-node

/**
 * Nouns Database Backfill Script (TypeScript)
 * 
 * Populates the database with all Nouns data including:
 * - Traits and SVG
 * - Auction history
 * - Settler addresses from Etherscan
 * 
 * Usage:
 *   npx ts-node scripts/backfill-nouns-database.ts [options]
 * 
 * Options:
 *   --start=<id>     Start from Noun ID (default: 0)
 *   --end=<id>       End at Noun ID (default: latest)
 *   --batch=<size>   Batch size (default: 10)
 *   --skip-settlers  Skip Etherscan settler fetching
 */

import { ApolloClient, InMemoryCache, HttpLink, gql } from '@apollo/client';
import fetch from 'cross-fetch';
import { processNoun } from '../app/lib/Nouns/Database/backfill';
import type { Noun, Auction } from '../app/lib/Nouns/Goldsky/utils/types';

// Configuration
const GOLDSKY_ENDPOINT = 'https://api.goldsky.com/api/public/project_cldf2o9pqagp43svvbk5u3kmo/subgraphs/nouns/prod/gn';
const BATCH_SIZE = parseInt(process.argv.find(arg => arg.startsWith('--batch='))?.split('=')[1] || '10');
const START_ID = parseInt(process.argv.find(arg => arg.startsWith('--start='))?.split('=')[1] || '0');
const END_ID = process.argv.find(arg => arg.startsWith('--end='))?.split('=')[1];
const SKIP_SETTLERS = process.argv.includes('--skip-settlers');

// Apollo Client
const client = new ApolloClient({
  link: new HttpLink({
    uri: GOLDSKY_ENDPOINT,
    fetch,
  }),
  cache: new InMemoryCache(),
});

// GraphQL Queries
const NOUNS_QUERY = gql`
  query GetNouns($first: Int!, $skip: Int!) {
    nouns(first: $first, skip: $skip, orderBy: id, orderDirection: asc) {
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

const AUCTION_QUERY = gql`
  query GetAuction($nounId: ID!) {
    auction(id: $nounId) {
      id
      amount
      startTime
      endTime
      settled
    }
  }
`;

// Stats
let stats = {
  total: 0,
  processed: 0,
  successful: 0,
  failed: 0,
  startTime: Date.now(),
};

function printProgress() {
  const elapsed = (Date.now() - stats.startTime) / 1000;
  const rate = stats.processed / elapsed;
  const remaining = stats.total - stats.processed;
  const eta = remaining / rate;

  process.stdout.write(`\r${'Progress:'.padEnd(15)}${stats.processed}/${stats.total} ` +
    `(${((stats.processed / stats.total) * 100).toFixed(1)}%) | ` +
    `Success: ${stats.successful} | Failed: ${stats.failed} | ` +
    `Rate: ${rate.toFixed(2)}/s | ETA: ${Math.floor(eta / 60)}m ${Math.floor(eta % 60)}s`);
}

async function fetchAllNouns(): Promise<Noun[]> {
  console.log('Fetching Nouns from subgraph...');
  const allNouns: Noun[] = [];
  let skip = START_ID;
  let hasMore = true;

  while (hasMore) {
    const { data } = await client.query({
      query: NOUNS_QUERY,
      variables: {
        first: 100,
        skip,
      },
    });

    const nouns = (data as any).nouns as Noun[];
    allNouns.push(...nouns);
    skip += nouns.length;
    hasMore = nouns.length === 100;

    if (END_ID && skip >= parseInt(END_ID)) {
      hasMore = false;
    }

    process.stdout.write(`\rFetched ${allNouns.length} Nouns...`);
  }

  console.log(`\nTotal Nouns fetched: ${allNouns.length}`);
  return allNouns;
}

async function fetchAuction(nounId: string): Promise<Auction | null> {
  try {
    const { data } = await client.query({
      query: AUCTION_QUERY,
      variables: { nounId },
    });

    return (data as any).auction as Auction;
  } catch (error) {
    return null;
  }
}

async function main() {
  try {
    console.log('=== Nouns Database Backfill ===\n');
    console.log(`Start ID: ${START_ID}`);
    console.log(`End ID: ${END_ID || 'latest'}`);
    console.log(`Batch Size: ${BATCH_SIZE}`);
    console.log(`Skip Settlers: ${SKIP_SETTLERS}\n`);

    // Fetch all Nouns
    const nouns = await fetchAllNouns();
    stats.total = nouns.length;

    if (stats.total === 0) {
      console.log('No Nouns to process.');
      return;
    }

    console.log(`\nProcessing ${stats.total} Nouns in batches of ${BATCH_SIZE}...\n`);

    // Process in batches
    for (let i = 0; i < nouns.length; i += BATCH_SIZE) {
      const batch = nouns.slice(i, i + BATCH_SIZE);

      const results = await Promise.all(
        batch.map(async (noun) => {
          try {
            const auction = await fetchAuction(noun.id);
            await processNoun(noun, auction || undefined);
            return true;
          } catch (error) {
            console.error(`\nError processing Noun ${noun.id}:`, error);
            return false;
          }
        })
      );

      const batchSuccessful = results.filter(r => r).length;
      const batchFailed = results.filter(r => !r).length;

      stats.processed += batch.length;
      stats.successful += batchSuccessful;
      stats.failed += batchFailed;

      printProgress();
    }

    console.log('\n\n=== Backfill Complete ===');
    console.log(`Total Nouns: ${stats.total}`);
    console.log(`Processed: ${stats.processed}`);
    console.log(`Successful: ${stats.successful}`);
    console.log(`Failed: ${stats.failed}`);
    console.log(`Duration: ${((Date.now() - stats.startTime) / 1000 / 60).toFixed(2)} minutes`);
    console.log(`Success Rate: ${((stats.successful / stats.processed) * 100).toFixed(1)}%`);

    if (!SKIP_SETTLERS) {
      console.log('\n=== Settler Addresses ===');
      console.log('Settler addresses will be fetched during processing.');
      console.log('This is rate-limited by Etherscan (5 req/sec).');
    }

  } catch (error) {
    console.error('\n\nFatal error during backfill:', error);
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log('\n✅ Backfill complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Backfill failed:', error);
    process.exit(1);
  });

