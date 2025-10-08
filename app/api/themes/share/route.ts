/**
 * Theme Sharing API Route
 * POST: Toggle theme public/private status
 * Phase 8C: Theme sharing functionality
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(req: NextRequest) {
  try {
    const { walletAddress, themeId, isPublic, shareCode } = await req.json();

    // Validation
    if (!walletAddress || typeof walletAddress !== 'string') {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    if (!themeId || typeof themeId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid theme ID' },
        { status: 400 }
      );
    }

    if (typeof isPublic !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid isPublic value' },
        { status: 400 }
      );
    }

    // Update theme sharing status
    await sql`
      UPDATE custom_themes
      SET 
        is_public = ${isPublic},
        share_code = ${shareCode || null},
        updated_at = NOW()
      WHERE wallet_address = ${walletAddress}
      AND theme_id = ${themeId}
    `;

    // If making public, also insert/update in shared_themes table
    if (isPublic && shareCode) {
      await sql`
        INSERT INTO shared_themes (
          theme_id,
          share_code,
          wallet_address
        )
        VALUES (
          ${themeId},
          ${shareCode},
          ${walletAddress}
        )
        ON CONFLICT (theme_id)
        DO UPDATE SET
          share_code = EXCLUDED.share_code,
          shared_at = NOW()
      `;
    } else if (!isPublic) {
      // If making private, remove from shared_themes
      await sql`
        DELETE FROM shared_themes
        WHERE theme_id = ${themeId}
        AND wallet_address = ${walletAddress}
      `;
    }

    return NextResponse.json({
      success: true,
      message: isPublic ? 'Theme is now public' : 'Theme is now private',
    });
  } catch (error) {
    console.error('Error updating theme sharing status:', error);
    return NextResponse.json(
      {
        error: 'Failed to update theme sharing status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

