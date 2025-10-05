'use client';

/**
 * Window Component
 * Mac OS 8 window chrome with draggable title bar and controls
 */

import { useRef, useState, useEffect, Suspense } from 'react';
import { useSystemStore } from '../../store/systemStore';
import { usePreferencesStore } from '../../store/preferencesStore';
import type { Window as WindowType } from '../../types/window';
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';
import ScrollBar from '../ScrollBar/ScrollBar';
import styles from './Window.module.css';

interface WindowProps {
  windowId: string;
}

export default function Window({ windowId }: WindowProps) {
  const window = useSystemStore((state) => state.windows[windowId]);
  const activeWindowId = useSystemStore((state) => state.activeWindowId);
  const runningApps = useSystemStore((state) => state.runningApps);
  const themeCustomization = useSystemStore((state) => state.themeCustomization);
  
  const closeWindow = useSystemStore((state) => state.closeWindow);
  const focusWindow = useSystemStore((state) => state.focusWindow);
  const minimizeWindow = useSystemStore((state) => state.minimizeWindow);
  const zoomWindow = useSystemStore((state) => state.zoomWindow);
  const moveWindow = useSystemStore((state) => state.moveWindow);
  const resizeWindow = useSystemStore((state) => state.resizeWindow);
  const launchApp = useSystemStore((state) => state.launchApp);
  const saveWindowPosition = usePreferencesStore((state) => state.saveWindowPosition);

  const windowRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  if (!window) return null;

  const app = runningApps[window.appId];
  const isActive = activeWindowId === windowId;

  // Handle window focus
  const handleMouseDown = () => {
    if (!isActive) {
      focusWindow(windowId);
    }
  };

  // Handle title bar drag start
  const handleTitleBarMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    
    e.preventDefault();
    e.stopPropagation();
    
    focusWindow(windowId);
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - window.position.x,
      y: e.clientY - window.position.y,
    });
  };

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    
    e.preventDefault();
    e.stopPropagation();
    
    focusWindow(windowId);
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: window.size.width,
      height: window.size.height,
    });
  };

  // Handle dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Keep window within viewport bounds
      const viewportWidth = typeof globalThis.window !== 'undefined' ? globalThis.window.innerWidth : 1920;
      const viewportHeight = typeof globalThis.window !== 'undefined' ? globalThis.window.innerHeight : 1080;
      
      // Menu bar height (20px on desktop, 44px on mobile)
      const menuBarHeight = viewportWidth <= 768 ? 44 : 20;
      
      // Minimum visible area - keep title bar and edge visible for dragging
      const minVisibleWidth = Math.min(200, window.size.width); // At least 200px of window visible
      const minVisibleHeight = 40; // At least title bar + some content visible
      
      // Calculate bounds
      // Left: Don't let window go more than (width - minVisible) off the left edge
      const minX = -(window.size.width - minVisibleWidth);
      // Right: Don't let window go more than minVisible off the right edge
      const maxX = viewportWidth - minVisibleWidth;
      // Top: Keep below menu bar
      const minY = menuBarHeight;
      // Bottom: Don't let window go more than (height - minVisible) off the bottom
      const maxY = viewportHeight - minVisibleHeight;

      const clampedX = Math.max(minX, Math.min(maxX, newX));
      const clampedY = Math.max(minY, Math.min(maxY, newY));

      moveWindow(windowId, clampedX, clampedY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      // Save window position after drag ends
      saveWindowPosition(windowId);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, windowId, window.size, moveWindow]);

  // Handle resizing
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      const newWidth = resizeStart.width + deltaX;
      const newHeight = resizeStart.height + deltaY;

      resizeWindow(windowId, newWidth, newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      // Save window position after resize ends
      saveWindowPosition(windowId);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeStart, windowId, resizeWindow]);

  // Get window style based on state
  const getWindowStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      left: window.position.x,
      top: window.position.y,
      zIndex: window.zIndex,
    };

    if (window.state === 'minimized') {
      return { ...baseStyle, display: 'none' };
    }

    if (window.state === 'maximized') {
      return {
        ...baseStyle,
        left: 0,
        top: 20, // Below menu bar
        width: '100vw',
        height: 'calc(100vh - 20px)',
      };
    }

    return {
      ...baseStyle,
      width: window.size.width,
      height: window.size.height,
    };
  };

  // Render app component with error boundary
  const renderAppContent = () => {
    if (!app) return null;

    const AppComponent = app.config.component;
    
    return (
      <ErrorBoundary
        appId={app.id}
        appName={app.config.name}
        onReset={() => {
          // Relaunch app by closing and reopening
          closeWindow(windowId);
          setTimeout(() => {
            launchApp(app.config);
          }, 100);
        }}
      >
        <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
          <AppComponent windowId={windowId} />
        </Suspense>
      </ErrorBoundary>
    );
  };

  return (
    <div
      ref={windowRef}
      className={`${styles.window} ${isActive ? styles.active : styles.inactive}`}
      style={getWindowStyle()}
      onMouseDown={handleMouseDown}
      role="dialog"
      aria-label={`${window.title} window`}
      aria-modal={false}
      tabIndex={-1}
    >
      {/* Title Bar */}
      <div
        className={`${styles.titleBar} ${isActive ? styles.titleBarActive : styles.titleBarInactive}`}
        onMouseDown={handleTitleBarMouseDown}
        role="banner"
        aria-label="Window title bar"
      >
        {/* Close Button */}
        <button
          className={styles.closeButton}
          onClick={(e) => {
            e.stopPropagation();
            closeWindow(windowId);
          }}
          aria-label={`Close ${window.title}`}
          title="Close"
        >
          <div className={styles.closeButtonInner} />
        </button>

        {/* Title */}
        <h2 className={styles.title} id={`window-title-${windowId}`}>
          {window.title}
        </h2>

        {/* Minimize Button (Collapse Box) */}
        <button
          className={styles.minimizeButton}
          onClick={(e) => {
            e.stopPropagation();
            minimizeWindow(windowId);
          }}
          aria-label={`Minimize ${window.title}`}
          title="Minimize"
        >
          <div className={styles.minimizeButtonInner} />
        </button>

        {/* Zoom Button (Maximize) */}
        <button
          className={styles.zoomButton}
          onClick={(e) => {
            e.stopPropagation();
            zoomWindow(windowId);
          }}
          aria-label={window.state === 'maximized' ? `Restore ${window.title}` : `Maximize ${window.title}`}
          title={window.state === 'maximized' ? 'Restore' : 'Maximize'}
        >
          <div className={styles.zoomButtonInner} />
        </button>
      </div>

      {/* Content Area with ScrollBar */}
      <main 
        className={styles.content}
        role="main"
        aria-labelledby={`window-title-${windowId}`}
      >
        <ScrollBar
          showArrows={themeCustomization?.scrollbarArrowStyle !== 'none'}
          direction="both"
          autoHide={themeCustomization?.scrollbarAutoHide || false}
        >
          {renderAppContent()}
        </ScrollBar>
      </main>

      {/* Resize Handle (if resizable) */}
      {window.isResizable && window.state === 'normal' && (
        <button
          className={styles.resizeHandle}
          onMouseDown={handleResizeStart}
          aria-label={`Resize ${window.title}`}
          title="Resize"
          tabIndex={0}
        />
      )}
    </div>
  );
}

