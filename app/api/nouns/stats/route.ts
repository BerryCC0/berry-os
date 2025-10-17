/**
 * GET /api/nouns/stats
 * Get statistics about Nouns and auctions
 */

import { NextResponse } from 'next/server';
import { getNounsStatistics } from '@/app/lib/Nouns/Database';

export async function GET() {
  try {
    const stats = await getNounsStatistics();

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching Nouns statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}

