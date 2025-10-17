/**
 * POST /api/nouns/fetch-batch
 * Fetch multiple Nouns from the database in a single request
 * Body: { ids: number[] }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getNounsByIds } from '@/app/lib/Nouns/Database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json(
        { error: 'Missing or invalid ids array' },
        { status: 400 }
      );
    }

    if (ids.length === 0) {
      return NextResponse.json({
        nouns: {},
      });
    }

    if (ids.length > 1000) {
      return NextResponse.json(
        { error: 'Maximum 1000 IDs allowed per request' },
        { status: 400 }
      );
    }

    // Validate all IDs are numbers
    const nounIds = ids.map(id => {
      const parsed = typeof id === 'number' ? id : parseInt(String(id));
      if (isNaN(parsed) || parsed < 0) {
        throw new Error(`Invalid noun ID: ${id}`);
      }
      return parsed;
    });

    // Fetch all Nouns from database
    const nounsArray = await getNounsByIds(nounIds);

    // Convert array to object keyed by noun_id for easy lookup
    const nounsMap: Record<string, any> = {};
    nounsArray.forEach(noun => {
      nounsMap[noun.noun_id.toString()] = {
        noun_id: noun.noun_id,
        background: noun.background,
        body: noun.body,
        accessory: noun.accessory,
        head: noun.head,
        glasses: noun.glasses,
        svg_data: noun.svg_data,
        current_owner: noun.current_owner,
        current_delegate: noun.current_delegate,
        created_timestamp: noun.created_timestamp,
        created_block: noun.created_block,
      };
    });

    return NextResponse.json({
      nouns: nounsMap,
      count: nounsArray.length,
    });
  } catch (error) {
    console.error('Error fetching Nouns batch:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch Nouns data' },
      { status: 500 }
    );
  }
}

