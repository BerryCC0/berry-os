/**
 * POST /api/proposals/drafts/save
 * Save or update a proposal draft
 */

import { NextRequest, NextResponse } from 'next/server';
import { saveDraft, type ProposalDraft } from '@/app/lib/Persistence/proposalDrafts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const draft = body as ProposalDraft;

    // Validation
    if (!draft.wallet_address) {
      return NextResponse.json(
        { error: 'Missing wallet address' },
        { status: 400 }
      );
    }

    if (!draft.draft_name) {
      return NextResponse.json(
        { error: 'Missing draft name' },
        { status: 400 }
      );
    }

    if (!draft.title) {
      return NextResponse.json(
        { error: 'Missing title' },
        { status: 400 }
      );
    }

    // Validate wallet address format (Ethereum or Solana)
    if (!/^(0x)?[0-9a-fA-F]{40,66}$/.test(draft.wallet_address)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    // TODO: Add wallet signature validation for security
    // For now, we trust the wallet address from the client
    // In production, you should verify the signature

    // Save draft
    const id = await saveDraft(draft);

    return NextResponse.json({
      success: true,
      id,
      message: 'Draft saved successfully',
    });
  } catch (error) {
    console.error('Error saving draft:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save draft',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

