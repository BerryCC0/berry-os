/**
 * GET /api/nouns/settler?nounId={id}
 * Get settler information for a Noun's auction
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuctionHistory } from '@/app/lib/Nouns/Database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nounIdParam = searchParams.get('nounId');

    if (!nounIdParam) {
      return NextResponse.json(
        { error: 'Missing nounId parameter' },
        { status: 400 }
      );
    }

    const nounId = parseInt(nounIdParam);

    if (isNaN(nounId) || nounId < 0) {
      return NextResponse.json(
        { error: 'Invalid noun ID' },
        { status: 400 }
      );
    }

    // Fetch auction history from database
    const auction = await getAuctionHistory(nounId);

    if (!auction) {
      return NextResponse.json(
        { error: 'Auction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      nounId,
      settlerAddress: auction.settler_address,
      winnerAddress: auction.winner_address,
      winningBid: auction.winning_bid_eth,
      txHash: auction.tx_hash,
      settledTimestamp: auction.settled_timestamp,
    });
  } catch (error) {
    console.error('Error fetching settler info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settler information' },
      { status: 500 }
    );
  }
}

