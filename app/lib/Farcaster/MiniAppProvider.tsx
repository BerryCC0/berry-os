/**
 * Farcaster Mini App Provider
 * Uses @neynar/react for Mini App SDK with built-in analytics
 * Based on: https://docs.neynar.com/docs/convert-web-app-to-mini-app
 */

'use client';

import { MiniAppProvider as NeynarMiniAppProvider, useMiniApp as useNeynarMiniApp } from '@neynar/react';
import type { ReactNode } from 'react';

interface MiniAppProviderProps {
  children: ReactNode;
}

export function MiniAppProvider({ children }: MiniAppProviderProps) {
  return (
    <NeynarMiniAppProvider analyticsEnabled={true}>
      {children}
    </NeynarMiniAppProvider>
  );
}

/**
 * Hook to access Mini App context
 * Re-exported from @neynar/react
 */
export function useMiniApp() {
  return useNeynarMiniApp();
}

/**
 * Check if running inside Farcaster
 */
export function isInFarcaster(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check if we're in a Farcaster iframe or Mini App context
  return window.self !== window.top || 
         navigator.userAgent.includes('Farcaster') ||
         !!document.referrer.match(/warpcast|farcaster/i);
}
