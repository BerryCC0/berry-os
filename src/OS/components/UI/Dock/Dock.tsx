'use client';

/**
 * Dock Component (Phase 8: Enhanced)
 * Contemporary macOS dock with magnification, tooltips, context menus, and dynamic sizing
 */

import { useState, useRef, useEffect } from 'react';
import { useSystemStore } from '../../../store/systemStore';
import { REGISTERED_APPS, getAppById } from '../../../../Apps/AppConfig';
import { getAppIcon } from '../../../../../app/lib/utils/iconUtils';
import DockContextMenu from './DockContextMenu';
import AppsLaunchpad from '../AppsLaunchpad/AppsLaunchpad';
import styles from './Dock.module.css';

export default function Dock() {
  // ==================== Store State ====================
  const dockPreferences = useSystemStore((state) => state.dockPreferences);
  const dynamicAppIcons = useSystemStore((state) => state.dynamicAppIcons);
  const runningApps = useSystemStore((state) => state.runningApps);
  const windows = useSystemStore((state) => state.windows);
  const activeWindowId = useSystemStore((state) => state.activeWindowId);
  const launchApp = useSystemStore((state) => state.launchApp);
  const focusWindow = useSystemStore((state) => state.focusWindow);
  const closeWindow = useSystemStore((state) => state.closeWindow);
  const toggleDockPin = useSystemStore((state) => state.toggleDockPin);
  const updateDockPreferences = useSystemStore((state) => state.updateDockPreferences);

  // ==================== Local State ====================
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    appId: string;
    position: { x: number; y: number };
  } | null>(null);
  const [isDockVisible, setIsDockVisible] = useState(true);
  const [tooltipVisible, setTooltipVisible] = useState<string | null>(null);
  const [isDraggingDivider, setIsDraggingDivider] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartSize, setDragStartSize] = useState(64); // Store initial size when drag starts
  const [showAppsLaunchpad, setShowAppsLaunchpad] = useState(false); // Apps Launchpad modal state
  
  const dockRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dividerRef = useRef<HTMLDivElement>(null);

  // ==================== Dock Items ====================
  // Get all dock items (pinned apps + running non-pinned apps)
  const dockItems = [
    // Pinned apps (from dockPreferences.pinnedApps)
    ...dockPreferences.pinnedApps
      .filter(appId => appId !== 'apps')
      .map(appId => {
        const appConfig = REGISTERED_APPS.find(app => app.id === appId);
        return appConfig ? { appId, config: appConfig, isPinned: true } : null;
      })
      .filter(Boolean),
    
    // Running apps not in pinned list
    ...Object.values(runningApps)
      .filter(app => !dockPreferences.pinnedApps.includes(app.id) && app.id !== 'apps')
      .map(app => ({ appId: app.id, config: app.config, isPinned: false }))
  ];

  // ==================== Event Handlers ====================
  
  const handleDockItemClick = (appId: string) => {
    const app = runningApps[appId];
    
    if (!app) {
      // App not running - launch it
      const appConfig = REGISTERED_APPS.find(a => a.id === appId);
      if (appConfig) {
        launchApp(appConfig);
      }
    } else {
      // App is running - find its window
      const appWindows = Object.values(windows).filter(w => w.appId === appId);
      
      if (appWindows.length > 0) {
        // Focus the first window (or most recent)
        const sortedWindows = appWindows.sort((a, b) => b.zIndex - a.zIndex);
        focusWindow(sortedWindows[0].id);
      }
    }
  };

  const handleDockItemRightClick = (e: React.MouseEvent, appId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenu({
      appId,
      position: {
        x: rect.left + rect.width / 2,
        y: window.innerHeight - rect.bottom + 16,
      },
    });
  };

  const handleTogglePin = (appId: string) => {
    toggleDockPin(appId);
  };

  const handleQuit = (appId: string) => {
    // Close all windows for this app
    const appWindows = Object.values(windows).filter(w => w.appId === appId);
    appWindows.forEach(w => closeWindow(w.id));
  };

  const handleAppsClick = () => {
    // Toggle the Apps Launchpad modal
    setShowAppsLaunchpad(!showAppsLaunchpad);
  };

  // ==================== Tooltip Logic ====================
  
  const handleMouseEnter = (appId: string, appName: string) => {
    setHoveredItem(appId);

    // Show tooltip after 500ms delay
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }

    tooltipTimeoutRef.current = setTimeout(() => {
      setTooltipVisible(appName);
    }, 500);

    // If auto-hide is enabled, keep dock visible
    if (dockPreferences.autoHide) {
      setIsDockVisible(true);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    }
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
    setTooltipVisible(null);

    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }

    // If auto-hide is enabled, start hide timer
    if (dockPreferences.autoHide) {
      hideTimeoutRef.current = setTimeout(() => {
        setIsDockVisible(false);
      }, 500);
    }
  };

  // ==================== Auto-Hide Logic ====================
  
  useEffect(() => {
    if (!dockPreferences.autoHide) {
      setIsDockVisible(true);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!dockRef.current) return;

      const dockRect = dockRef.current.getBoundingClientRect();
      const threshold = 50; // Distance from edge to trigger

      // Check if mouse is near dock edge based on position
      let isNearDock = false;

      switch (dockPreferences.position) {
        case 'bottom':
          isNearDock = e.clientY > window.innerHeight - threshold;
          break;
        case 'left':
          isNearDock = e.clientX < threshold;
          break;
        case 'right':
          isNearDock = e.clientX > window.innerWidth - threshold;
          break;
      }

      if (isNearDock) {
        setIsDockVisible(true);
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }
      } else {
        // Check if mouse is over dock element
        const elementAtPoint = document.elementFromPoint(e.clientX, e.clientY);
        const isOverDock = dockRef.current.contains(elementAtPoint);
        
        if (!isOverDock) {
          // Mouse is not near and not over dock
          if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
          }
          hideTimeoutRef.current = setTimeout(() => {
            setIsDockVisible(false);
          }, 500);
        }
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [dockPreferences.autoHide, dockPreferences.position]);

  // ==================== Divider Drag Handlers (Phase 8.1) ====================
  
  const handleDividerMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDraggingDivider(true);
    setDragStartY(e.clientY);
    setDragStartSize(dockPreferences.size); // Capture initial size
  };

  // Handle divider dragging (continuous sizing)
  useEffect(() => {
    if (!isDraggingDivider) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Dragging UP = larger size, Dragging DOWN = smaller size
      const deltaY = dragStartY - e.clientY; // Inverted for intuitive feel
      const sizeChange = deltaY * 0.8; // Sensitivity for smooth dragging
      
      // Continuous sizing: 32px (tiny) to 80px (large)
      // Use dragStartSize as the base, not current dockPreferences.size
      const newSize = Math.max(32, Math.min(80, dragStartSize + sizeChange));
      
      // Update dock preferences directly with exact pixel value
      updateDockPreferences({ size: Math.round(newSize) });
    };

    const handleMouseUp = () => {
      setIsDraggingDivider(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingDivider, dragStartY, dragStartSize, updateDockPreferences]);

  // ==================== Mobile Dock Height Sync (for Window positioning) ====================
  
  useEffect(() => {
    if (!dockRef.current) return;
    
    const updateDockHeight = () => {
      if (dockRef.current) {
        // Only set on mobile (≤768px), but check on every call
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
          const height = dockRef.current.getBoundingClientRect().height;
          document.documentElement.style.setProperty('--dock-height-mobile', `${height}px`);
        }
      }
    };
    
    // Initial measurement
    updateDockHeight();
    
    // Update on resize (orientation change, keyboard open/close, viewport changes)
    window.addEventListener('resize', updateDockHeight);
    
    return () => {
      window.removeEventListener('resize', updateDockHeight);
    };
  }, []);

  // ==================== Helper Functions ====================
  
  const isAppRunning = (appId: string) => appId in runningApps;

  const hasMinimizedWindow = (appId: string) => {
    return Object.values(windows).some(
      w => w.appId === appId && w.state === 'minimized'
    );
  };

  // Get dock item size directly from preferences
  const getDockItemSize = () => {
    return dockPreferences.size;
  };

  // ==================== Early Return for Hidden Dock ====================
  
  if (dockPreferences.position === 'hidden') {
    return null;
  }

  // ==================== Render ====================
  
  const baseSize = getDockItemSize();
  const dockClasses = `${styles.dock} ${styles[`position-${dockPreferences.position}`]} ${
    dockPreferences.autoHide && !isDockVisible ? styles.hidden : ''
  }`;

  return (
    <div
      ref={dockRef}
      className={dockClasses}
      onMouseEnter={() => {
        if (dockPreferences.autoHide) {
          setIsDockVisible(true);
        }
      }}
      onMouseLeave={() => {
        if (dockPreferences.autoHide) {
          if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
          }
          hideTimeoutRef.current = setTimeout(() => {
            setIsDockVisible(false);
          }, 500);
        }
      }}
    >
      <div 
        className={styles.dockContainer}
        style={{
          borderRadius: Math.max(8, baseSize * 0.15), // Tighter corners: scale at 15% of icon size (8px min)
        }}
      >
        {dockItems.map((item) => {
          if (!item) return null;
          
          const running = isAppRunning(item.appId);
          const minimized = hasMinimizedWindow(item.appId);

          return (
            <div key={item.appId} className={styles.dockItemWrapper}>
              <button
                className={`${styles.dockItem} ${running ? styles.running : ''}`}
                onClick={() => handleDockItemClick(item.appId)}
                onContextMenu={(e) => handleDockItemRightClick(e, item.appId)}
                onMouseEnter={() => handleMouseEnter(item.appId, item.config.name)}
                onMouseLeave={handleMouseLeave}
                style={{
                  width: baseSize,
                  height: baseSize,
                }}
                aria-label={`${running ? 'Switch to' : 'Launch'} ${item.config.name}`}
              >
                <div className={styles.iconWrapper}>
                  <img
                    src={getAppIcon(item.appId, dynamicAppIcons, item.config.icon)}
                    alt=""
                    className={styles.dockIcon}
                    aria-hidden="true"
                  />
                  {minimized && (
                    <div 
                      className={styles.minimizedIndicator}
                      aria-label="Window minimized"
                    />
                  )}
                </div>
                
                {/* Running indicator (dot below icon) */}
                {running && (
                  <div 
                    className={styles.runningIndicator}
                    aria-label="Application running"
                  />
                )}
              </button>

              {/* Tooltip popup label */}
              {tooltipVisible === item.config.name && hoveredItem === item.appId && (
                <div className={styles.tooltip}>
                  {item.config.name}
                </div>
              )}
            </div>
          );
        })}
        
        {/* Divider before Apps button - Draggable to resize dock */}
        <div
          ref={dividerRef}
          className={`${styles.dockDivider} ${isDraggingDivider ? styles.dragging : ''}`}
          onMouseDown={handleDividerMouseDown}
          title="Drag to resize dock"
          aria-label="Drag to resize dock"
          role="separator"
          aria-orientation="vertical"
          style={{
            height: baseSize, // Match icon height
          }}
        />
        
        {/* Apps Folder Button (always on far right) */}
        <div className={styles.dockItemWrapper}>
          <button
            className={styles.appsButton}
            onClick={handleAppsClick}
            onMouseEnter={() => handleMouseEnter('apps', 'Applications')}
            onMouseLeave={handleMouseLeave}
            style={{
              width: baseSize,
              height: baseSize,
            }}
            aria-label="Open Applications folder"
          >
            <div className={styles.iconWrapper}>
              <img
                src="/icons/system/folder-applications.svg"
                alt=""
                className={styles.dockIcon}
                aria-hidden="true"
              />
            </div>
          </button>

          {/* Tooltip for Apps button */}
          {tooltipVisible === 'Applications' && hoveredItem === 'apps' && (
            <div className={styles.tooltip}>
              Applications
            </div>
          )}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <DockContextMenu
          appId={contextMenu.appId}
          appName={dockItems.find(item => item?.appId === contextMenu.appId)?.config.name || ''}
          isPinned={dockPreferences.pinnedApps.includes(contextMenu.appId)}
          isRunning={isAppRunning(contextMenu.appId)}
          position={contextMenu.position}
          onClose={() => setContextMenu(null)}
          onTogglePin={() => handleTogglePin(contextMenu.appId)}
          onQuit={() => handleQuit(contextMenu.appId)}
        />
      )}

      {/* Apps Launchpad Modal */}
      {showAppsLaunchpad && (
        <AppsLaunchpad onClose={() => setShowAppsLaunchpad(false)} />
      )}
    </div>
  );
}
