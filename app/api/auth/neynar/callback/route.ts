/**
 * Neynar SIWN OAuth Callback Handler
 * Handles the OAuth callback from Neynar's authentication flow
 */

import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Authentication Error</title>
          </head>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({
                  type: 'neynar-auth-error',
                  error: 'No authorization code received'
                }, window.location.origin);
                window.close();
              }
            </script>
            <p>Authentication failed. This window should close automatically.</p>
          </body>
        </html>
        `,
        {
          status: 400,
          headers: { 'Content-Type': 'text/html' },
        }
      );
    }

    // Exchange code for token
    const tokenResponse = await fetch('https://api.neynar.com/v2/farcaster/login/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api_key': process.env.NEYNAR_API_KEY || '',
      },
      body: JSON.stringify({
        code,
        client_id: process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to verify authentication');
    }

    const data = await tokenResponse.json();

    // Return success HTML that posts message to opener
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Success</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 50px;
              background: #f5f5f5;
            }
            .container {
              max-width: 400px;
              margin: 0 auto;
              background: white;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            h2 { color: #28a745; margin-bottom: 20px; }
            button {
              background: #7c3aed;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 6px;
              font-size: 16px;
              cursor: pointer;
              margin-top: 20px;
            }
            button:hover { background: #6d28d9; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>✓ Authentication Successful!</h2>
            <p>You've successfully connected your Farcaster account.</p>
            <button onclick="continueToApp()">Continue with Berry OS</button>
          </div>
          
          <script>
            const authData = ${JSON.stringify({
              fid: data.fid,
              username: data.username,
              displayName: data.display_name,
              pfpUrl: data.pfp_url,
              signerUuid: data.signer_uuid,
              token: data.token || data.signer_uuid,
            })};

            function continueToApp() {
              // Try multiple methods to communicate with the opener
              try {
                if (window.opener && !window.opener.closed) {
                  // Send message to opener window
                  window.opener.postMessage({
                    type: 'neynar-auth-success',
                    data: authData
                  }, '*'); // Use '*' to ensure message is sent regardless of origin
                  
                  // Give the message time to be received
                  setTimeout(() => {
                    window.close();
                  }, 500);
                } else {
                  // If opener is not available, try to close and let the parent handle it
                  alert('Please return to the Berry OS window to continue.');
                  window.close();
                }
              } catch (error) {
                console.error('Error communicating with parent window:', error);
                alert('Please return to the Berry OS window to continue.');
                window.close();
              }
            }

            // Also try to send message immediately on load
            if (window.opener && !window.opener.closed) {
              window.opener.postMessage({
                type: 'neynar-auth-success',
                data: authData
              }, '*');
            }
          </script>
        </body>
      </html>
      `,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      }
    );
  } catch (error: unknown) {
    console.error('SIWN callback error:', error);

    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Error</title>
        </head>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'neynar-auth-error',
                error: ${JSON.stringify(error instanceof Error ? error.message : 'Authentication failed')}
              }, window.location.origin);
              setTimeout(() => window.close(), 2000);
            }
          </script>
          <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2>✗ Authentication Failed</h2>
            <p>${error instanceof Error ? error.message : 'An error occurred during authentication'}</p>
            <p>This window will close automatically...</p>
          </div>
        </body>
      </html>
      `,
      {
        status: 500,
        headers: { 'Content-Type': 'text/html' },
      }
    );
  }
}

