/**
 * Farcaster Mini App Sync Hook
 * Detects if we're in a Farcaster Mini App and waits for SDK to be ready
 */

'use client';

import { useEffect, useState } from 'react';

export function useFarcasterSync() {
  const [isFarcasterReady, setIsFarcasterReady] = useState(false);
  const [isInFarcaster, setIsInFarcaster] = useState(false);

  useEffect(() => {
    async function checkFarcaster() {
      try {
        // Dynamic import to avoid SSR issues
        const { sdk } = await import('@farcaster/miniapp-sdk');
        
        // Check if we're in a Mini App
        const inMiniApp = await sdk.isInMiniApp();
        setIsInFarcaster(inMiniApp);
        
        if (inMiniApp) {
          // We're in a Mini App - call ready() to signal we're loaded
          await sdk.actions.ready();
          console.log('Farcaster Mini App SDK ready');
        }
        
        // Either way, mark as ready (not in Farcaster or Farcaster is ready)
        setIsFarcasterReady(true);
      } catch (error) {
        console.error('Failed to initialize Farcaster SDK:', error);
        // If SDK fails, assume we're not in Farcaster and continue
        setIsInFarcaster(false);
        setIsFarcasterReady(true);
      }
    }

    checkFarcaster();
  }, []);

  return {
    isFarcasterReady,
    isInFarcaster,
  };
}

