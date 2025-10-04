/**
 * Farcaster Mini App Hooks
 * Convenient hooks for using Mini App features
 * Based on: https://docs.neynar.com/docs/convert-web-app-to-mini-app
 */

'use client';

import { useMiniApp, isInFarcaster } from './MiniAppProvider';

/**
 * Hook to get Farcaster user context
 */
export function useFarcasterUser() {
  const { context, isSDKLoaded } = useMiniApp();
  
  return {
    user: context?.user,
    fid: context?.user?.fid,
    username: context?.user?.username,
    displayName: context?.user?.displayName,
    pfpUrl: context?.user?.pfpUrl,
    isLoaded: isSDKLoaded,
    isInFarcaster: isInFarcaster(),
  };
}

/**
 * Hook to get Mini App location context
 */
export function useFarcasterLocation() {
  const { context, isSDKLoaded } = useMiniApp();
  
  return {
    location: context?.location,
    isLoaded: isSDKLoaded,
  };
}

/**
 * Combined hook for all Farcaster Mini App features
 */
export function useFarcasterMiniApp() {
  const miniApp = useMiniApp();
  const user = useFarcasterUser();
  const location = useFarcasterLocation();
  
  return {
    ...miniApp,
    user,
    location,
  };
}
