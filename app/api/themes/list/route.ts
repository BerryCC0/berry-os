/**
 * GET /api/themes/list
 * List all custom themes for a wallet
 * Phase 8C: Theme Library
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const walletAddress = searchParams.get('walletAddress');

    // Validation
    if (!walletAddress || typeof walletAddress !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing wallet address' },
        { status: 400 }
      );
    }

    // Fetch all custom themes for this wallet
    const themes = await sql`
      SELECT 
        id,
        wallet_address,
        theme_id,
        theme_name,
        theme_description,
        theme_data,
        is_active,
        is_public,
        share_code,
        created_at,
        updated_at
      FROM custom_themes
      WHERE wallet_address = ${walletAddress}
      ORDER BY updated_at DESC
    `;

    return NextResponse.json(themes);
  } catch (error) {
    console.error('Error fetching custom themes:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch custom themes',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
