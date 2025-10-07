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

  // ==================== Preferences Store ====================
  const saveDesktopIconPositions = usePreferencesStore((state) => state.saveDesktopIconPositions);
  const connectedWallet = usePreferencesStore((state) => state.connectedWallet);
  const isPreferencesLoaded = usePreferencesStore((state) => state.isPreferencesLoaded);

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

  const { draggingIconId, isDragging, handleIconDragStart } = useDesktopIconInteraction({
    icons: desktopIcons,
    isMobile,
    connectedWallet,
    onIconClick: handleIconClick,
    onIconMove: moveDesktopIcon,
    onIconPositionsSave: saveDesktopIconPositions,
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
        {desktopIcons.map((icon) => (
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

