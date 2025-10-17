/**
 * GET /api/nouns/fetch?id={nounId}
 * Fetch a single Noun from the database
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCompleteNoun } from '@/app/lib/Nouns/Database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nounIdParam = searchParams.get('id');

    if (!nounIdParam) {
      return NextResponse.json(
        { error: 'Missing noun ID parameter' },
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

    // Fetch complete Noun data from database
    const nounData = await getCompleteNoun(nounId);

    if (!nounData) {
      return NextResponse.json(
        { error: 'Noun not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      noun: nounData,
    });
  } catch (error) {
    console.error('Error fetching Noun:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Noun data' },
      { status: 500 }
    );
  }
}

