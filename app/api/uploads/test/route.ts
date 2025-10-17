/**
 * Test endpoint to verify Pinata IPFS upload is working
 * Visit: /api/uploads/test
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const pinataJWT = process.env.PINATA_JWT;
  
  if (!pinataJWT) {
    return NextResponse.json({
      status: 'error',
      message: 'PINATA_JWT not found in environment variables',
      instructions: 'Add PINATA_JWT to your .env.local file and restart the dev server',
    });
  }

  // Test Pinata connection
  try {
    const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${pinataJWT}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        status: 'success',
        message: 'Pinata connection successful!',
        pinata: data,
      });
    } else {
      const error = await response.json();
      return NextResponse.json({
        status: 'error',
        message: 'Pinata authentication failed',
        error,
      });
    }
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to connect to Pinata',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

