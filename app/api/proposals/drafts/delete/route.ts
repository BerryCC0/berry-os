/**
 * DELETE /api/proposals/drafts/delete
 * Delete a proposal draft
 */

import { NextRequest, NextResponse } from 'next/server';
import { deleteDraft } from '@/app/lib/Persistence/proposalDrafts';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');
    const draftName = searchParams.get('name');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Missing wallet address' },
        { status: 400 }
      );
    }

    if (!draftName) {
      return NextResponse.json(
        { error: 'Missing draft name' },
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

    // TODO: Add wallet signature validation for security
    // For now, we trust the wallet address from the client
    // In production, you should verify the signature

    // Delete draft
    await deleteDraft(walletAddress, draftName);

    return NextResponse.json({
      success: true,
      message: 'Draft deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting draft:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete draft',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

