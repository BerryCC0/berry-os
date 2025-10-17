/**
 * GET /api/proposals/drafts/load
 * Load all proposal drafts for a wallet address
 */

import { NextRequest, NextResponse } from 'next/server';
import { loadDrafts } from '@/app/lib/Persistence/proposalDrafts';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Missing wallet address' },
        { status: 400 }
      );
    }

    // Validate wallet address format
    if (!/^(0x)?[0-9a-fA-F]{40,66}$/.test(walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    // Load drafts
    const drafts = await loadDrafts(walletAddress);

    return NextResponse.json({
      success: true,
      drafts,
      count: drafts.length,
    });
  } catch (error) {
    console.error('Error loading drafts:', error);
    return NextResponse.json(
      { 
        error: 'Failed to load drafts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

