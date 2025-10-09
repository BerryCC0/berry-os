'use client';

/**
 * Desktop Component
 * Main container for the Mac OS 8 desktop experience
 * 
 * Pure presentation layer - renders UI and delegates logic to hooks
 */

import { useEffect, useRef } from 'react';
import { useSystemStore } from '../../store/systemStore';
import { usePreferencesStore } from '../../store/preferencesStore';
import { getAppsFromURL } from '../../../../app/lib/utils/stateUtils';
import { getAppById, REGISTERED_APPS } from '../../../Apps/AppConfig';
import { setupKeyboardShortcuts } from '../../lib/menuActions';
import {
  useBootSequence,
  useDeviceDetection,
  useDesktopIconInteraction,
  useGestureHandling,
  useWalletSync,
  useFarcasterSync,
} from '../../lib/hooks';
import MenuBar from '../UI/MenuBar/MenuBar';
import Window from '../Window/Window';
import Dock from '../UI/Dock/Dock';
import Screensaver from '../UI/Screensaver/Screensaver';
import LoadingScreen from '../UI/LoadingScreen/LoadingScreen';
import styles from './Desktop.module.css';

export default function Desktop() {
  // ==================== System Store ====================
  const wallpaper = useSystemStore((state) => state.wallpaper);
  const desktopIcons = useSystemStore((state) => state.desktopIcons);
  const windows = useSystemStore((state) => state.windows);
  const runningApps = useSystemStore((state) => state.runningApps);
  const launchApp = useSystemStore((state) => state.launchApp);
  const closeWindow = useSystemStore((state) => state.closeWindow);
  const focusWindow = useSystemStore((state) => state.focusWindow);
  const activeWindowId = useSystemStore((state) => state.activeWindowId);
  const moveDesktopIcon = useSystemStore((state) => state.moveDesktopIcon);
  const initializeDesktopIcons = useSystemStore((state) => state.initializeDesktopIcons);
  const isScreensaverActive = useSystemStore((state) => state.isScreensaverActive);
  const wakeFromSleep = useSystemStore((state) => state.wakeFromSleep);
  
  // Desktop preferences (Phase 7)
  const desktopPreferences = useSystemStore((state) => state.desktopPreferences);
  
  // Window restoration preference (Phase 9)
  const restoreWindowsOnStartup = useSystemStore((state) => state.restoreWindowsOnStartup);

  // ==================== Preferences Store ====================
  const saveDesktopIconPositions = usePreferencesStore((state) => state.saveDesktopIconPositions);
  const connectedWallet = usePreferencesStore((state) => state.connectedWallet);
  const isPreferencesLoaded = usePreferencesStore((state) => state.isPreferencesLoaded);
  const userPreferences = usePreferencesStore((state) => state.userPreferences);

  // ==================== Custom Hooks (Business Logic) ====================
  
  // Wallet sync - loads/saves preferences automatically
  useWalletSync();

  // Farcaster Mini App sync - wait for SDK to be ready
  const { isFarcasterReady, isInFarcaster } = useFarcasterSync();

  // Boot sequence - manages OS boot timing
  const isBooting = useBootSequence({
    connectedWallet,
    isPreferencesLoaded,
    isFarcasterReady,
    isInFarcaster,
  });

  // Device detection - mobile/tablet/orientation/keyboard
  const { isMobile, isTablet, orientation, isKeyboardVisible } = useDeviceDetection();

  // Desktop icon interaction - drag/drop/click
  const handleIconClick = (icon: typeof desktopIcons[0]) => {
    if (icon.type === 'app' && icon.appId) {
      const appConfig = getAppById(icon.appId);
      if (appConfig) {
        launchApp(appConfig);
      }
    }
  };

  // Filter desktop icons based on showHiddenFiles preference (Phase 7)
  const visibleDesktopIcons = desktopIcons.filter((icon) => {
    // If showHiddenFiles is true, show all icons
    if (desktopPreferences.showHiddenFiles) return true;
    
    // Otherwise, hide icons that start with "." (hidden files convention)
    return !icon.name.startsWith('.');
  });

  const { draggingIconId, isDragging, handleIconDragStart } = useDesktopIconInteraction({
    icons: visibleDesktopIcons,
    isMobile,
    connectedWallet,
    onIconClick: handleIconClick,
    onIconMove: moveDesktopIcon,
    onIconPositionsSave: saveDesktopIconPositions,
    // Phase 7: Pass desktop preferences
    snapToGrid: desktopPreferences.snapToGrid,
    gridSpacing: desktopPreferences.gridSpacing,
    doubleClickSpeed: desktopPreferences.doubleClickSpeed,
  });

  // Gesture handling - swipes and mobile navigation
  useGestureHandling({
    activeWindowId,
    isMobile,
    runningApps,
    onCloseWindow: closeWindow,
    onFocusWindow: focusWindow,
  });

  // ==================== Initialization (run once) ====================
  
  const hasLaunchedFromURL = useRef(false);
  const hasInitializedIcons = useRef(false);

  // Initialize desktop icons (only once)
  useEffect(() => {
    if (hasInitializedIcons.current) return;
    hasInitializedIcons.current = true;
    initializeDesktopIcons(REGISTERED_APPS);
  }, [initializeDesktopIcons]);

  // Setup global keyboard shortcuts
  useEffect(() => {
    const cleanup = setupKeyboardShortcuts();
    return cleanup;
  }, []);

  // Launch apps from URL on mount (only once)
  useEffect(() => {
    if (hasLaunchedFromURL.current) return;
    hasLaunchedFromURL.current = true;

    const appsToOpen = getAppsFromURL();

    if (appsToOpen.length > 0) {
      appsToOpen.forEach((appId: string) => {
        const appConfig = getAppById(appId);
        if (appConfig) {
          launchApp(appConfig);
        }
      });
    }
  }, [launchApp]);

  // ==================== Window Restoration (Phase 9) ====================
  
  const hasRestoredWindows = useRef(false);

  useEffect(() => {
    // Only restore once, after preferences are loaded
    if (hasRestoredWindows.current) return;
    if (!isPreferencesLoaded) return;
    if (!restoreWindowsOnStartup) return;
    if (!connectedWallet) return;
    if (!userPreferences) return;

    hasRestoredWindows.current = true;

    // Restore windows from saved window states
    const windowStates = userPreferences.windowStates;
    if (!windowStates || windowStates.length === 0) return;

    console.log('🪟 Restoring windows from last session...');

    // Group window states by app
    const appWindows = windowStates.reduce((acc, ws) => {
      if (!acc[ws.app_id]) {
        acc[ws.app_id] = [];
      }
      acc[ws.app_id].push(ws);
      return acc;
    }, {} as Record<string, typeof windowStates>);

    // Launch each app and let the system restore window positions
    // Wait a bit to ensure desktop is fully initialized
    setTimeout(() => {
      Object.keys(appWindows).forEach((appId) => {
        const appConfig = getAppById(appId);
        if (appConfig) {
          launchApp(appConfig);
          console.log(`  ↪ Restored: ${appConfig.name}`);
        }
      });
    }, 500);
  }, [
    isPreferencesLoaded,
    restoreWindowsOnStartup,
    connectedWallet,
    userPreferences,
    launchApp,
  ]);

  // ==================== Render ====================

  return (
    <>
      {/* Loading Screen - show during boot sequence */}
      <LoadingScreen isLoading={isBooting} />

      <div className={styles.desktop}>
        {/* Menu Bar - works on both desktop and mobile */}
        <MenuBar />

        {/* Desktop Background */}
        <div 
          className={styles.background}
          style={{ 
            backgroundImage: wallpaper ? `url(${wallpaper})` : undefined 
          }}
        />

      {/* Desktop Icons (works on both desktop and mobile) */}
      <div className={styles.iconContainer}>
        {visibleDesktopIcons.map((icon) => (
          <div
            key={icon.id}
            className={`${styles.icon} ${draggingIconId === icon.id ? styles.dragging : ''}`}
            style={{
              left: icon.position.x,
              top: icon.position.y,
              cursor: draggingIconId === icon.id ? 'grabbing' : 'pointer',
            }}
            onMouseDown={(e) => handleIconDragStart(e, icon.id)}
            onTouchStart={(e) => handleIconDragStart(e, icon.id)}
          >
            <img 
              src={icon.icon} 
              alt={icon.name}
              className={styles.iconImage}
              draggable={false}
            />
            <span className={styles.iconLabel}>{icon.name}</span>
          </div>
        ))}
      </div>

      {/* Windows */}
      <div className={styles.windowContainer}>
        {Object.keys(windows)
          .filter((windowId) => {
            const window = windows[windowId];
            // On mobile, only show active window
            if (isMobile) {
              return windowId === activeWindowId;
            }
            return true;
          })
          .map((windowId) => (
            <Window key={windowId} windowId={windowId} />
          ))}
      </div>

      {/* Dock - visible on both desktop and mobile */}
      <Dock />

      {/* Screensaver */}
      {isScreensaverActive && <Screensaver onClose={wakeFromSleep} />}
      </div>
    </>
  );
}

