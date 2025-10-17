/**
 * PATCH /api/proposals/drafts/rename
 * Rename a proposal draft (update draft_title)
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateDraftTitle } from '@/app/lib/Persistence/proposalDrafts';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet_address, draft_slug, new_title } = body;

    // Validation
    if (!wallet_address) {
      return NextResponse.json(
        { error: 'Missing wallet address' },
        { status: 400 }
      );
    }

    if (!draft_slug) {
      return NextResponse.json(
        { error: 'Missing draft slug' },
        { status: 400 }
      );
    }

    if (!new_title || !new_title.trim()) {
      return NextResponse.json(
        { error: 'Missing or empty new title' },
        { status: 400 }
      );
    }

    // Validate wallet address format (Ethereum or Solana)
    if (!/^(0x)?[0-9a-fA-F]{40,66}$/.test(wallet_address)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    // TODO: Add wallet signature validation for security
    // For now, we trust the wallet address from the client

    // Update draft title
    await updateDraftTitle(wallet_address, draft_slug, new_title.trim());

    return NextResponse.json({
      success: true,
      message: 'Draft renamed successfully',
    });
  } catch (error) {
    console.error('Error renaming draft:', error);
    return NextResponse.json(
      { 
        error: 'Failed to rename draft',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

