/**
 * Neynar Provider Component
 * Wraps the app with Neynar React SDK authentication
 * 
 * Uses Neynar's official React SDK for authentication:
 * - Sign In With Neynar (SIWN)
 * - useNeynarContext hook for auth state
 * - Automatic session management
 */

'use client';

import { NeynarContextProvider, Theme } from '@neynar/react';
import type { ReactNode } from 'react';

interface NeynarProviderProps {
  children: ReactNode;
}

export function NeynarProvider({ children }: NeynarProviderProps) {
  const clientId = process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID;

  if (!clientId) {
    console.warn('NEXT_PUBLIC_NEYNAR_CLIENT_ID not configured - Neynar features will be unavailable');
    return <>{children}</>;
  }

  return (
    <NeynarContextProvider
      settings={{
        clientId,
        defaultTheme: Theme.Light,
      }}
    >
      {children}
    </NeynarContextProvider>
  );
}

// Re-export the hook from @neynar/react for convenience
export { useNeynarContext } from '@neynar/react';
