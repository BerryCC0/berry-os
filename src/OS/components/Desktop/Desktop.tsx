'use client';

/**
 * Desktop Component
 * Main container for the Mac OS 8 desktop experience
 */

import { useEffect, useRef, useState } from 'react';
import { useSystemStore } from '../../store/systemStore';
import { getAppsFromURL } from '../../../../app/lib/utils/stateUtils';
import { getAppById, REGISTERED_APPS } from '../../../Apps/AppConfig';
import { gestureHandler } from '../../lib/gestureHandler';
import { eventBus } from '../../lib/eventBus';
import { setupKeyboardShortcuts } from '../../lib/menuActions';
import { useWalletSync } from '../../lib/useWalletSync';
import { 
  isMobileDevice, 
  isTabletDevice, 
  handleVirtualKeyboard,
  handleOrientationChange,
  getOrientation 
} from '../../lib/mobileUtils';
import MenuBar from '../MenuBar/MenuBar';
import Window from '../Window/Window';
import Dock from '../Dock/Dock';
import Screensaver from '../Screensaver/Screensaver';
import LoadingScreen from '../LoadingScreen/LoadingScreen';
import styles from './Desktop.module.css';

export default function Desktop() {
  const wallpaper = useSystemStore((state) => state.wallpaper);
  const desktopIcons = useSystemStore((state) => state.desktopIcons);
  const windows = useSystemStore((state) => state.windows);
  const runningApps = useSystemStore((state) => state.runningApps);
  const launchApp = useSystemStore((state) => state.launchApp);
  const closeWindow = useSystemStore((state) => state.closeWindow);
  const activeWindowId = useSystemStore((state) => state.activeWindowId);
  const moveDesktopIcon = useSystemStore((state) => state.moveDesktopIcon);
  const initializeDesktopIcons = useSystemStore((state) => state.initializeDesktopIcons);
  const saveDesktopIconPositions = useSystemStore((state) => state.saveDesktopIconPositions);
  const connectedWallet = useSystemStore((state) => state.connectedWallet);
  const isScreensaverActive = useSystemStore((state) => state.isScreensaverActive);
  const wakeFromSleep = useSystemStore((state) => state.wakeFromSleep);
  const isPreferencesLoaded = useSystemStore((state) => state.isPreferencesLoaded);
  
  // Boot sequence state - starts true, becomes false after initial setup
  const [isBooting, setIsBooting] = useState(true);
  
  // Wallet sync hook - loads/saves preferences automatically
  useWalletSync();
  
  const hasLaunchedFromURL = useRef(false);
  const hasInitializedIcons = useRef(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [draggingIconId, setDraggingIconId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartTime = useRef<number>(0);

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

  // Boot sequence - fixed to prevent loops
  useEffect(() => {
    // Minimum boot time to prevent flash
    const minBootTime = 800;
    
    const bootTimer = setTimeout(() => {
      // After minimum time, check if we're ready to boot
      if (!connectedWallet || isPreferencesLoaded) {
        // No wallet OR preferences are loaded - finish boot
        setIsBooting(false);
      }
      // If wallet exists but preferences not loaded, keep booting
    }, minBootTime);

    return () => clearTimeout(bootTimer);
  }, [connectedWallet, isPreferencesLoaded]); // Removed isBooting from deps

  // When preferences finish loading (after min boot time), finish boot
  useEffect(() => {
    if (isPreferencesLoaded && isBooting) {
      const timer = setTimeout(() => setIsBooting(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isPreferencesLoaded, isBooting]);

  // Detect device type and orientation
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(isMobileDevice());
      setIsTablet(isTabletDevice());
      setOrientation(getOrientation());
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Handle virtual keyboard
  useEffect(() => {
    const cleanup = handleVirtualKeyboard((isVisible) => {
      setIsKeyboardVisible(isVisible);
      
      // Add class to body when keyboard is visible
      if (isVisible) {
        document.body.classList.add('keyboard-visible');
      } else {
        document.body.classList.remove('keyboard-visible');
      }
    });

    return cleanup;
  }, []);

  // Handle orientation changes
  useEffect(() => {
    const cleanup = handleOrientationChange((newOrientation) => {
      setOrientation(newOrientation);
      
      // Optionally notify user or adjust layout
      if (isMobile) {
        console.log('Orientation changed to:', newOrientation);
      }
    });

    return cleanup;
  }, [isMobile]);

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

  // Initialize gesture handler
  useEffect(() => {
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
            const swipeStartY = (payload as any).startPosition?.y || 0;
            // Only close if swiping from top 100px (title bar area)
            if (swipeStartY < 100) {
              closeWindow(activeWindowId);
            }
          }
          break;

        case 'swipeLeft':
        case 'swipeRight':
          // Switch between running apps on mobile
          if (isMobile && Object.keys(runningApps).length > 1) {
            const runningAppIds = Object.keys(runningApps);
            const currentIndex = runningAppIds.findIndex(id => {
              const app = runningApps[id];
              return app.windows.some((winId: string) => winId === activeWindowId);
            });

            if (currentIndex !== -1) {
              const direction = gestureType === 'swipeLeft' ? 1 : -1;
              const nextIndex = (currentIndex + direction + runningAppIds.length) % runningAppIds.length;
              const nextAppId = runningAppIds[nextIndex];
              const nextApp = runningApps[nextAppId];
              
              if (nextApp && nextApp.windows[0]) {
                const focusWindowFn = useSystemStore.getState().focusWindow;
                focusWindowFn(nextApp.windows[0]);
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
  }, [activeWindowId, isMobile, closeWindow]);

  // Icon interaction handlers
  const handleIconClick = (icon: typeof desktopIcons[0]) => {
    if (icon.type === 'app' && icon.appId) {
      const appConfig = getAppById(icon.appId);
      if (appConfig) {
        launchApp(appConfig);
      }
    }
  };

  const handleIconDragStart = (e: React.MouseEvent | React.TouchEvent, iconId: string) => {
    e.preventDefault();
    const icon = desktopIcons.find(i => i.id === iconId);
    if (!icon) return;

    dragStartTime.current = Date.now();
    setIsDragging(false);
    setDraggingIconId(iconId);
    
    // Handle both mouse and touch events
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setDragOffset({
      x: clientX - icon.position.x,
      y: clientY - icon.position.y,
    });
  };

  // Handle icon dragging (mouse and touch)
  useEffect(() => {
    if (!draggingIconId) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      // If we've moved, consider it a drag
      setIsDragging(true);
      
      // Get client coordinates from mouse or touch event
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      
      const newX = clientX - dragOffset.x;
      const newY = clientY - dragOffset.y;

      // Keep within desktop bounds
      const minX = 0;
      // Account for menu bar (20px desktop) or mobile nav (44px mobile)
      const minY = isMobile ? 44 : 20;
      const maxX = typeof window !== 'undefined' ? window.innerWidth - 80 : 1920;
      const maxY = typeof window !== 'undefined' ? window.innerHeight - 80 : 1080;

      const clampedX = Math.max(minX, Math.min(maxX, newX));
      const clampedY = Math.max(minY, Math.min(maxY, newY));

      // Smooth, free-form positioning (no grid snap)
      moveDesktopIcon(draggingIconId, clampedX, clampedY);
    };

    const handleEnd = () => {
      // If we didn't drag (quick tap/click), open the app
      if (!isDragging) {
        const icon = desktopIcons.find(i => i.id === draggingIconId);
        if (icon) {
          handleIconClick(icon);
        }
      } else if (connectedWallet) {
        // Icon was dragged and wallet is connected - save position IMMEDIATELY (no debounce)
        saveDesktopIconPositions();
      }
      
      setDraggingIconId(null);
      setIsDragging(false);
    };

    // Add both mouse and touch listeners
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove);
    document.addEventListener('touchend', handleEnd);

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [draggingIconId, dragOffset, isDragging, desktopIcons, moveDesktopIcon, handleIconClick, isMobile, connectedWallet, saveDesktopIconPositions]);

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

