/**
 * Theme Installation API Route
 * POST: Install a public theme shared by another user
 * Phase 8C: Theme installation functionality
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(req: NextRequest) {
  try {
    const { walletAddress, shareCode } = await req.json();

    // Validation
    if (!walletAddress || typeof walletAddress !== 'string') {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    if (!shareCode || typeof shareCode !== 'string') {
      return NextResponse.json(
        { error: 'Invalid share code' },
        { status: 400 }
      );
    }

    // Find the shared theme
    const sharedThemes = await sql`
      SELECT 
        ct.theme_id,
        ct.theme_name,
        ct.theme_description,
        ct.theme_data,
        ct.wallet_address as original_wallet
      FROM custom_themes ct
      INNER JOIN shared_themes st ON ct.theme_id = st.theme_id
      WHERE st.share_code = ${shareCode}
      AND ct.is_public = true
      LIMIT 1
    `;

    if (sharedThemes.length === 0) {
      return NextResponse.json(
        { error: 'Theme not found or no longer public' },
        { status: 404 }
      );
    }

    const sharedTheme = sharedThemes[0];

    // Check if user already has this theme (by checking theme name)
    const existingThemes = await sql`
      SELECT theme_id FROM custom_themes
      WHERE wallet_address = ${walletAddress}
      AND theme_name = ${sharedTheme.theme_name}
    `;

    let finalThemeName = sharedTheme.theme_name;

    // If theme name exists, append " (Copy)"
    if (existingThemes.length > 0) {
      finalThemeName = `${sharedTheme.theme_name} (Copy)`;
    }

    // Generate new theme ID for the installing user
    const newThemeId = `custom_${walletAddress.slice(0, 6)}_${Date.now()}`;

    // Install theme to user's account
    await sql`
      INSERT INTO custom_themes (
        wallet_address,
        theme_id,
        theme_name,
        theme_description,
        theme_data,
        is_active,
        is_public
      )
      VALUES (
        ${walletAddress},
        ${newThemeId},
        ${finalThemeName},
        ${sharedTheme.theme_description || `Shared by ${sharedTheme.original_wallet.slice(0, 6)}...${sharedTheme.original_wallet.slice(-4)}`},
        ${JSON.stringify(sharedTheme.theme_data)},
        false,
        false
      )
    `;

    // Increment install count in shared_themes
    await sql`
      UPDATE shared_themes
      SET install_count = install_count + 1
      WHERE share_code = ${shareCode}
    `;

    return NextResponse.json({
      success: true,
      message: 'Theme installed successfully',
      themeId: newThemeId,
      themeName: finalThemeName,
    });
  } catch (error) {
    console.error('Error installing theme:', error);
    return NextResponse.json(
      {
        error: 'Failed to install theme',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

