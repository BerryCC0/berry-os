/**
 * Theme Discovery API Route
 * GET: Browse publicly shared themes from other users
 * Phase 8C: Theme discovery functionality
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const walletAddress = searchParams.get('walletAddress'); // Optional: filter out own themes
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch public themes
    const publicThemes = await sql`
      SELECT 
        ct.id,
        ct.wallet_address,
        ct.theme_id,
        ct.theme_name,
        ct.theme_description,
        ct.theme_data,
        ct.created_at,
        ct.updated_at,
        st.share_code,
        st.view_count,
        st.install_count
      FROM custom_themes ct
      INNER JOIN shared_themes st ON ct.theme_id = st.theme_id AND ct.wallet_address = st.wallet_address
      WHERE ct.is_public = true
      ${walletAddress ? sql`AND ct.wallet_address != ${walletAddress}` : sql``}
      ORDER BY st.install_count DESC, ct.created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    // Transform to more readable format
    const themes = publicThemes.map((row: any) => ({
      id: row.id,
      walletAddress: row.wallet_address,
      themeId: row.theme_id,
      themeName: row.theme_name,
      themeDescription: row.theme_description,
      themeData: row.theme_data,
      shareCode: row.share_code,
      viewCount: row.view_count,
      installCount: row.install_count,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      author: `${row.wallet_address.slice(0, 6)}...${row.wallet_address.slice(-4)}`,
    }));

    return NextResponse.json(themes);
  } catch (error) {
    console.error('Error fetching public themes:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch public themes',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

