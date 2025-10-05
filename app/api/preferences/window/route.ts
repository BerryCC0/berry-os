/**
 * POST /api/preferences/window
 * Save individual window position/size/state
 * Phase 7: Window Position Persistence
 */

import { NextRequest, NextResponse } from 'next/server';
import { saveWindowState } from '@/app/lib/Persistence/persistence';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, appId, position, size, state } = body;

    if (!walletAddress || !appId) {
      return NextResponse.json(
        { error: 'Missing wallet address or app ID' },
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

    // Save window state
    await saveWindowState(walletAddress, {
      app_id: appId,
      position_x: position?.x,
      position_y: position?.y,
      width: size?.width,
      height: size?.height,
      is_minimized: state === 'minimized',
      is_maximized: state === 'maximized',
    });

    return NextResponse.json({
      success: true,
      message: 'Window state saved',
    });
  } catch (error) {
    console.error('Error saving window state:', error);
    return NextResponse.json(
      { error: 'Failed to save window state' },
      { status: 500 }
    );
  }
}

