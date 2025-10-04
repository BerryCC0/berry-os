'use client';

/**
 * Desktop Component
 * Main container for the Mac OS 8 desktop experience
 */

import { useEffect, useRef, useState } from 'react';
import { useSystemStore } from '../../store/systemStore';
import { getAppsFromURL } from '../../../app/lib/utils/stateUtils';
import { getAppById, REGISTERED_APPS } from '../../../apps/AppConfig';
import { gestureHandler } from '../../lib/gestureHandler';
import { eventBus } from '../../lib/eventBus';
import { setupKeyboardShortcuts } from '../../lib/menuActions';
import MenuBar from '../MenuBar/MenuBar';
import MobileNav from '../MobileNav/MobileNav';
import AppSwitcher from '../AppSwitcher/AppSwitcher';
import Window from '../Window/Window';
import Dock from '../Dock/Dock';
import styles from './Desktop.module.css';

export default function Desktop() {
  const wallpaper = useSystemStore((state) => state.wallpaper);
  const desktopIcons = useSystemStore((state) => state.desktopIcons);
  const windows = useSystemStore((state) => state.windows);
  const launchApp = useSystemStore((state) => state.launchApp);
  const closeWindow = useSystemStore((state) => state.closeWindow);
  const activeWindowId = useSystemStore((state) => state.activeWindowId);
  const moveDesktopIcon = useSystemStore((state) => state.moveDesktopIcon);
  const initializeDesktopIcons = useSystemStore((state) => state.initializeDesktopIcons);
  
  const hasLaunchedFromURL = useRef(false);
  const hasInitializedIcons = useRef(false);
  const [showAppSwitcher, setShowAppSwitcher] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
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

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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

  // Initialize gesture handler
  useEffect(() => {
    gestureHandler.enable();

    // Subscribe to gesture events
    const subscription = eventBus.subscribe('GESTURE', (payload: any) => {
      const gestureType = payload.gestureType;

      switch (gestureType) {
        case 'swipeUp':
          // Open app switcher on swipe up from bottom
          if (payload.startPosition && payload.startPosition.y > window.innerHeight - 100) {
            setShowAppSwitcher(true);
          }
          break;

        case 'swipeDown':
          // Close active window on swipe down
          if (activeWindowId && isMobile) {
            closeWindow(activeWindowId);
          }
          break;

        case 'swipeLeft':
        case 'swipeRight':
          // Could implement app navigation here
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
  }, [draggingIconId, dragOffset, isDragging, desktopIcons, moveDesktopIcon, handleIconClick, isMobile]);

  return (
    <div className={styles.desktop}>
      {/* Menu Bar (Desktop only) */}
      {!isMobile && <MenuBar />}

      {/* Mobile Navigation (Mobile only) */}
      {isMobile && (
        <MobileNav onAppSwitcherToggle={() => setShowAppSwitcher(true)} />
      )}

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

      {/* Dock for minimized windows (Desktop only) */}
      {!isMobile && <Dock />}

      {/* App Switcher (Mobile only) */}
      {isMobile && (
        <AppSwitcher
          isOpen={showAppSwitcher}
          onClose={() => setShowAppSwitcher(false)}
        />
      )}
    </div>
  );
}

