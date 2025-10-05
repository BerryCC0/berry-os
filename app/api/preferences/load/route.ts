/**
 * GET /api/preferences/load
 * Load user preferences from database
 */

import { NextRequest, NextResponse } from 'next/server';
import { loadUserPreferences, getDefaultUserPreferences } from '@/lib/persistence';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Missing wallet address' },
        { status: 400 }
      );
    }

    // Validate wallet address format (basic check)
    if (!/^(0x)?[0-9a-fA-F]{40,66}$/.test(walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    // Load preferences
    const preferences = await loadUserPreferences(walletAddress);

    // If no preferences found, return defaults (first-time user)
    if (!preferences) {
      return NextResponse.json({
        preferences: getDefaultUserPreferences(),
        isFirstTime: true,
      });
    }

    return NextResponse.json({
      preferences,
      isFirstTime: false,
    });
  } catch (error) {
    console.error('Error loading preferences:', error);
    return NextResponse.json(
      { error: 'Failed to load preferences' },
      { status: 500 }
    );
  }
}
