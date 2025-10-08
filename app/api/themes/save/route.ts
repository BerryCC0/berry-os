/**
 * POST /api/themes/save
 * Save custom theme to database
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

export async function POST(request: NextRequest) {
  try {
    if (!sql) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { walletAddress, theme } = body as {
      walletAddress: string;
      theme: any;
    };

    if (!walletAddress || !theme) {
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

    // Ensure user exists
    await sql`
      INSERT INTO users (wallet_address, chain_id, last_login)
      VALUES (${walletAddress}, 1, NOW())
      ON CONFLICT (wallet_address) DO NOTHING
    `;

    // Save custom theme
    await sql`
      INSERT INTO custom_themes (
        wallet_address, theme_id, theme_name, theme_description, theme_data
      )
      VALUES (
        ${walletAddress},
        ${theme.id},
        ${theme.name},
        ${theme.description || ''},
        ${JSON.stringify(theme)}
      )
      ON CONFLICT (wallet_address, theme_id)
      DO UPDATE SET
        theme_name = EXCLUDED.theme_name,
        theme_description = EXCLUDED.theme_description,
        theme_data = EXCLUDED.theme_data,
        updated_at = NOW()
    `;

    return NextResponse.json({
      success: true,
      message: 'Theme saved successfully',
      theme_id: theme.id,
    });
  } catch (error) {
    console.error('Error saving custom theme:', error);
    return NextResponse.json(
      { error: 'Failed to save theme', details: String(error) },
      { status: 500 }
    );
  }
}

