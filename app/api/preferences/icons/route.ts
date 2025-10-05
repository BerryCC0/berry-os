/**
 * POST /api/preferences/icons
 * Save desktop icon positions (fast endpoint for frequent updates)
 */

import { NextRequest, NextResponse } from 'next/server';
import { saveDesktopIcons, type DesktopIconPosition } from '@/lib/persistence';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, icons } = body as {
      walletAddress: string;
      icons: DesktopIconPosition[];
    };

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Missing wallet address' },
        { status: 400 }
      );
    }

    if (!icons || !Array.isArray(icons)) {
      return NextResponse.json(
        { error: 'Missing or invalid icons data' },
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

    // Save icon positions (fast operation)
    await saveDesktopIcons(walletAddress, icons);

    return NextResponse.json({
      success: true,
      message: 'Icon positions saved',
    });
  } catch (error) {
    console.error('Error saving icon positions:', error);
    return NextResponse.json(
      { error: 'Failed to save icon positions' },
      { status: 500 }
    );
  }
}
