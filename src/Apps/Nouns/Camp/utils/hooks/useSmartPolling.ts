/**
 * Smart Polling Hook
 * 
 * Manages polling lifecycle based on:
 * - Tab visibility (stops when tab is inactive)
 * - Component mounting/unmounting
 * - User activity
 * 
 * No manual refresh buttons or banners - just works seamlessly.
 */

import { useEffect, useRef } from 'react';

export interface UseSmartPollingOptions {
  /**
   * Polling interval in milliseconds when tab is active
   */
  interval: number;
  
  /**
   * Start polling function
   */
  startPolling: (interval: number) => void;
  
  /**
   * Stop polling function
   */
  stopPolling: () => void;
  
  /**
   * Whether polling is enabled
   * @default true
   */
  enabled?: boolean;
}

/**
 * Hook that manages smart polling with visibility detection
 * 
 * Automatically:
 * - Starts polling when component mounts (if tab is active)
 * - Stops polling when tab becomes inactive
 * - Resumes polling when tab becomes active again
 * - Stops polling when component unmounts
 * 
 * @example
 * ```typescript
 * const { data, startPolling, stopPolling } = useQuery(GET_PROPOSALS);
 * 
 * useSmartPolling({
 *   interval: 30000, // 30 seconds
 *   startPolling,
 *   stopPolling,
 * });
 * ```
 */
export function useSmartPolling({
  interval,
  startPolling,
  stopPolling,
  enabled = true,
}: UseSmartPollingOptions): void {
  const isPollingRef = useRef(false);
  const intervalRef = useRef(interval);
  
  // Update interval ref when it changes
  useEffect(() => {
    intervalRef.current = interval;
  }, [interval]);
  
  useEffect(() => {
    if (!enabled) {
      stopPolling();
      isPollingRef.current = false;
      return;
    }
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab became inactive - stop polling to save resources
        if (isPollingRef.current) {
          stopPolling();
          isPollingRef.current = false;
        }
      } else {
        // Tab became active - resume polling
        if (!isPollingRef.current) {
          startPolling(intervalRef.current);
          isPollingRef.current = true;
        }
      }
    };
    
    // Start polling if tab is currently visible
    if (!document.hidden) {
      startPolling(intervalRef.current);
      isPollingRef.current = true;
    }
    
    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup: stop polling when component unmounts
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (isPollingRef.current) {
        stopPolling();
        isPollingRef.current = false;
      }
    };
  }, [enabled, startPolling, stopPolling]);
}

