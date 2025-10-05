/**
 * useGestureHandling Hook
 * Business logic for gesture event handling and app switching
 */

import { useEffect } from 'react';
import { gestureHandler } from '../gestureHandler';
import { eventBus } from '../eventBus';
import type { RunningApp } from '../../types/system';

export interface GestureHandlingOptions {
  activeWindowId: string | null;
  isMobile: boolean;
  runningApps: Record<string, RunningApp>;
  onCloseWindow: (windowId: string) => void;
  onFocusWindow: (windowId: string) => void;
}

/**
 * Hook to handle gesture events for mobile navigation
 * Manages swipe gestures for app switching and window closing
 */
export function useGestureHandling({
  activeWindowId,
  isMobile,
  runningApps,
  onCloseWindow,
  onFocusWindow,
}: GestureHandlingOptions): void {
  useEffect(() => {
    // Enable gesture handler
    gestureHandler.enable();

    // Subscribe to gesture events
    const subscription = eventBus.subscribe('GESTURE', (payload: any) => {
      const gestureType = payload.gestureType;

      switch (gestureType) {
        case 'swipeUp':
          // Reserved for future features (could open app overview)
          break;

        case 'swipeDown':
          // Close active window on swipe down from title bar area
          if (activeWindowId && isMobile) {
            const swipeStartY = payload.startPosition?.y || 0;
            // Only close if swiping from top 100px (title bar area)
            if (swipeStartY < 100) {
              onCloseWindow(activeWindowId);
            }
          }
          break;

        case 'swipeLeft':
        case 'swipeRight':
          // Switch between running apps on mobile
          if (isMobile && Object.keys(runningApps).length > 1) {
            const runningAppIds = Object.keys(runningApps);
            const currentIndex = runningAppIds.findIndex((id) => {
              const app = runningApps[id];
              return app.windows.some((winId: string) => winId === activeWindowId);
            });

            if (currentIndex !== -1) {
              const direction = gestureType === 'swipeLeft' ? 1 : -1;
              const nextIndex =
                (currentIndex + direction + runningAppIds.length) % runningAppIds.length;
              const nextAppId = runningAppIds[nextIndex];
              const nextApp = runningApps[nextAppId];

              if (nextApp && nextApp.windows[0]) {
                onFocusWindow(nextApp.windows[0]);
              }
            }
          }
          break;

        case 'edgeSwipeLeft':
        case 'edgeSwipeRight':
          // Edge swipes could trigger system actions
          // For now, just log them for potential future use
          console.log('Edge swipe detected:', gestureType);
          break;
      }
    });

    return () => {
      subscription.unsubscribe();
      gestureHandler.disable();
    };
  }, [activeWindowId, isMobile, runningApps, onCloseWindow, onFocusWindow]);
}

