/**
 * Neynar Configuration Status Check
 * Returns configuration status for debugging
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = process.env.NEYNAR_API_KEY;
  const clientId = process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID;

  return Response.json({
    configured: {
      apiKey: !!apiKey,
      clientId: !!clientId,
    },
    details: {
      apiKeyLength: apiKey ? apiKey.length : 0,
      clientIdLength: clientId ? clientId.length : 0,
      hasApiKey: !!apiKey,
      hasClientId: !!clientId,
    },
    // Don't expose actual keys, just first/last few chars for verification
    preview: {
      apiKey: apiKey ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}` : 'Not set',
      clientId: clientId ? `${clientId.substring(0, 8)}...${clientId.substring(clientId.length - 4)}` : 'Not set',
    },
  });
}

