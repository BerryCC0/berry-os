/**
 * GET /api/nouns/list
 * Fetch paginated list of Nouns with optional filters
 * 
 * Query Parameters:
 * - limit: Number of results per page (default: 20, max: 100)
 * - offset: Offset for pagination (default: 0)
 * - owner: Filter by owner address
 * - delegate: Filter by delegate address
 * - minId: Minimum Noun ID
 * - maxId: Maximum Noun ID
 * - createdAfter: Filter by creation timestamp (after)
 * - createdBefore: Filter by creation timestamp (before)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getNouns } from '@/app/lib/Nouns/Database';
import type { NounQueryFilters } from '@/app/lib/Nouns/Database/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse pagination parameters
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '20'),
      100
    );
    const offset = parseInt(searchParams.get('offset') || '0');

    // Parse filter parameters
    const filters: NounQueryFilters = {};

    const owner = searchParams.get('owner');
    if (owner) filters.owner = owner;

    const delegate = searchParams.get('delegate');
    if (delegate) filters.delegate = delegate;

    const minId = searchParams.get('minId');
    if (minId) filters.minId = parseInt(minId);

    const maxId = searchParams.get('maxId');
    if (maxId) filters.maxId = parseInt(maxId);

    const createdAfter = searchParams.get('createdAfter');
    if (createdAfter) filters.createdAfter = createdAfter;

    const createdBefore = searchParams.get('createdBefore');
    if (createdBefore) filters.createdBefore = createdBefore;

    // Fetch Nouns from database
    const result = await getNouns({ limit, offset }, filters);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching Nouns list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Nouns list' },
      { status: 500 }
    );
  }
}

