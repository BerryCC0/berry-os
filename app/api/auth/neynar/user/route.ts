/**
 * Neynar User Profile API Route
 * Fetches user profile data from a signer UUID
 */

import { NextRequest } from 'next/server';
import { neynarClient, isNeynarConfigured } from '@/app/lib/Neynar/neynarClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    if (!isNeynarConfigured() || !neynarClient) {
      return Response.json(
        { error: 'Neynar API is not configured' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const signerUuid = searchParams.get('signer_uuid');

    if (!signerUuid) {
      return Response.json(
        { error: 'signer_uuid parameter is required' },
        { status: 400 }
      );
    }

    // Fetch signer details from Neynar
    const signer = await neynarClient.lookupSigner({ signerUuid });

    if (!signer || !signer.fid) {
      return Response.json(
        { error: 'Signer not found or invalid' },
        { status: 404 }
      );
    }

    // Fetch user profile by FID
    const userResponse = await neynarClient.fetchBulkUsers({ fids: [signer.fid] });
    const user = userResponse.users[0];

    if (!user) {
      return Response.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Return user profile
    return Response.json({
      fid: user.fid,
      username: user.username,
      display_name: user.display_name,
      pfp_url: user.pfp_url,
      signer_uuid: signerUuid,
    });
  } catch (error: unknown) {
    console.error('Error fetching user profile:', error);
    
    return Response.json(
      { 
        error: 'Failed to fetch user profile',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

