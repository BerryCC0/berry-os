/**
 * POST /api/nouns/sync
 * Trigger synchronization of new Nouns from subgraph to database
 * 
 * This endpoint is designed to be called by a cron job for automated syncing
 */

import { NextRequest, NextResponse } from 'next/server';
import { ApolloClient, InMemoryCache, HttpLink, gql } from '@apollo/client';
import { shouldSync } from '@/app/lib/Nouns/Database';

// Apollo Client for fetching from Goldsky
const GOLDSKY_ENDPOINT = 'https://api.goldsky.com/api/public/project_cldf2o9pqagp43svvbk5u3kmo/subgraphs/nouns/prod/gn';

const client = new ApolloClient({
  link: new HttpLink({
    uri: GOLDSKY_ENDPOINT,
    fetch: fetch as any,
  }),
  cache: new InMemoryCache(),
});

// GraphQL Queries
const NOUNS_SINCE_BLOCK_QUERY = gql`
  query GetNounsSinceBlock($blockNumber: BigInt!) {
    nouns(
      where: { createdAtBlockNumber_gt: $blockNumber }
      orderBy: createdAtBlockNumber
      orderDirection: asc
      first: 100
    ) {
      id
      seed {
        background
        body
        accessory
        head
        glasses
      }
      owner {
        id
      }
      createdAtTimestamp
      createdAtBlockNumber
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
      bidder {
        amount
        blockNumber
        blockTimestamp
        txHash
        clientId
        bidder {
          id
        }
      }
    }
  }
`;

export async function POST(request: NextRequest) {
  try {
    // Optional: Verify authorization (e.g., cron secret)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if sync is needed
    const needsSync = await shouldSync('nouns', 30); // 30 minute interval

    if (!needsSync) {
      return NextResponse.json({
        message: 'Sync not needed yet',
        synced: false,
      });
    }

    // Perform sync
    const { syncNewNouns } = await import('@/app/lib/Nouns/Database');

    // Fetch functions for sync
    const fetchNounsSince = async (blockNumber: string) => {
      const { data } = await client.query({
        query: NOUNS_SINCE_BLOCK_QUERY,
        variables: { blockNumber },
        fetchPolicy: 'network-only',
      });
      return (data as any).nouns;
    };

    const fetchAuction = async (nounId: string) => {
      try {
        const { data } = await client.query({
          query: AUCTION_QUERY,
          variables: { nounId },
          fetchPolicy: 'network-only',
        });
        return (data as any).auction;
      } catch (error) {
        console.error(`Error fetching auction for Noun ${nounId}:`, error);
        return null;
      }
    };

    // Run sync
    const result = await syncNewNouns(fetchNounsSince, fetchAuction);

    return NextResponse.json({
      message: 'Sync completed',
      synced: true,
      result,
    });
  } catch (error) {
    console.error('Error during sync:', error);
    return NextResponse.json(
      { 
        error: 'Sync failed',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// Allow GET for health check
export async function GET() {
  const needsSync = await shouldSync('nouns', 30);
  
  return NextResponse.json({
    status: 'ok',
    needsSync,
  });
}

