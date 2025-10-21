/**
 * Mini Apps Catalog API Route
 * Fetches Farcaster Mini Apps from Neynar's Frame Catalog API
 * 
 * Reference: https://docs.neynar.com/reference/fetch-frame-catalog
 */

import { NextRequest } from 'next/server';
import { neynarClient, isNeynarConfigured } from '@/app/lib/Neynar/neynarClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check if Neynar is configured
    if (!isNeynarConfigured() || !neynarClient) {
      return Response.json(
        { error: 'Neynar API is not configured' },
        { status: 503 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 100);
    const cursor = searchParams.get('cursor') || undefined;
    const timeWindow = (searchParams.get('time_window') || '7d') as '1h' | '6h' | '12h' | '24h' | '7d';
    
    // Parse categories (comma-separated or multiple params)
    const categoriesParam = searchParams.get('categories');
    const categories = categoriesParam ? categoriesParam.split(',').filter(Boolean) as any : undefined;
    
    // Parse networks (comma-separated or multiple params)
    const networksParam = searchParams.get('networks');
    const networks = networksParam ? networksParam.split(',').filter(Boolean) as any : undefined;

    // Fetch from Neynar API
    const response = await neynarClient.fetchFrameCatalog({
      limit,
      cursor,
      timeWindow: timeWindow as any,
      ...(categories && categories.length > 0 && { categories }),
      ...(networks && networks.length > 0 && { networks }),
    });

    return Response.json({
      frames: response.frames || [],
      next: response.next || null,
    });
  } catch (error: unknown) {
    console.error('Error fetching Mini Apps catalog:', error);
    
    return Response.json(
      {
        error: 'Failed to fetch Mini Apps catalog',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

