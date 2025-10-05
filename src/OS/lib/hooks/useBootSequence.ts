/**
 * useBootSequence Hook
 * Business logic for managing OS boot sequence timing
 */

import { useState, useEffect } from 'react';

export interface BootSequenceOptions {
  connectedWallet: string | null;
  isPreferencesLoaded: boolean;
  isFarcasterReady: boolean;
  isInFarcaster: boolean;
  minBootTime?: number;
}

/**
 * Hook to manage boot sequence timing
 * Ensures minimum boot time and waits for critical services
 */
export function useBootSequence({
  connectedWallet,
  isPreferencesLoaded,
  isFarcasterReady,
  isInFarcaster,
  minBootTime = 800,
}: BootSequenceOptions): boolean {
  const [isBooting, setIsBooting] = useState(true);

  // Boot sequence - wait for Farcaster SDK + preferences
  useEffect(() => {
    // Don't finish boot until Farcaster is ready (if in Farcaster)
    if (!isFarcasterReady) {
      console.log('Waiting for Farcaster SDK...');
      return;
    }

    if (isInFarcaster) {
      console.log('Farcaster Mini App detected and ready');
    }

    const bootTimer = setTimeout(() => {
      // After minimum time, check if we're ready to boot
      if (!connectedWallet || isPreferencesLoaded) {
        // No wallet OR preferences are loaded - finish boot
        setIsBooting(false);
      }
      // If wallet exists but preferences not loaded, keep booting
    }, minBootTime);

    return () => clearTimeout(bootTimer);
  }, [connectedWallet, isPreferencesLoaded, isFarcasterReady, isInFarcaster, minBootTime]);

  // When preferences finish loading (after min boot time), finish boot
  useEffect(() => {
    if (isPreferencesLoaded && isBooting) {
      const timer = setTimeout(() => setIsBooting(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isPreferencesLoaded, isBooting]);

  return isBooting;
}

