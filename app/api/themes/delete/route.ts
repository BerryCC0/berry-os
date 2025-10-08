/**
 * DELETE /api/themes/delete
 * Delete a custom theme
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

export async function DELETE(request: NextRequest) {
  try {
    if (!sql) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { walletAddress, themeId } = body as {
      walletAddress: string;
      themeId: string;
    };

    if (!walletAddress || !themeId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Delete theme
    const result = await sql`
      DELETE FROM custom_themes
      WHERE wallet_address = ${walletAddress}
        AND theme_id = ${themeId}
      RETURNING theme_id
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Theme not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Theme deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting custom theme:', error);
    return NextResponse.json(
      { error: 'Failed to delete theme', details: String(error) },
      { status: 500 }
    );
  }
}

