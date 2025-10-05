/**
 * POST /api/preferences/save
 * Save user preferences to database
 */

import { NextRequest, NextResponse } from 'next/server';
import { saveAllPreferences, type UserPreferences } from '@/lib/persistence';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, preferences } = body as {
      walletAddress: string;
      preferences: UserPreferences;
    };

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Missing wallet address' },
        { status: 400 }
      );
    }

    if (!preferences) {
      return NextResponse.json(
        { error: 'Missing preferences data' },
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

    // TODO: Add wallet signature validation for security
    // For now, we trust the wallet address from the client
    // In production, you should verify the signature

    // Save preferences
    await saveAllPreferences(walletAddress, preferences);

    return NextResponse.json({
      success: true,
      message: 'Preferences saved successfully',
    });
  } catch (error) {
    console.error('Error saving preferences:', error);
    return NextResponse.json(
      { error: 'Failed to save preferences' },
      { status: 500 }
    );
  }
}
