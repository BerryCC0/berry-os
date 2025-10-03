'use client';

/**
 * Window Component
 * Mac OS 8 window chrome with draggable title bar and controls
 */

import { useRef, useState, useEffect, Suspense } from 'react';
import { useSystemStore } from '../../store/systemStore';
import type { Window as WindowType } from '../../types/window';
import styles from './Window.module.css';

interface WindowProps {
  windowId: string;
}

export default function Window({ windowId }: WindowProps) {
  const window = useSystemStore((state) => state.windows[windowId]);
  const activeWindowId = useSystemStore((state) => state.activeWindowId);
  const runningApps = useSystemStore((state) => state.runningApps);
  
  const closeWindow = useSystemStore((state) => state.closeWindow);
  const focusWindow = useSystemStore((state) => state.focusWindow);
  const minimizeWindow = useSystemStore((state) => state.minimizeWindow);
  const zoomWindow = useSystemStore((state) => state.zoomWindow);
  const moveWindow = useSystemStore((state) => state.moveWindow);
  const resizeWindow = useSystemStore((state) => state.resizeWindow);

  const windowRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

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

  // Handle dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Keep window within viewport bounds
      const viewportWidth = typeof globalThis.window !== 'undefined' ? globalThis.window.innerWidth : 1920;
      const viewportHeight = typeof globalThis.window !== 'undefined' ? globalThis.window.innerHeight : 1080;
      const maxX = viewportWidth - 100; // Keep at least 100px visible
      const maxY = viewportHeight - 50;
      const minX = -window.size.width + 100;
      const minY = 20; // Below menu bar

      const clampedX = Math.max(minX, Math.min(maxX, newX));
      const clampedY = Math.max(minY, Math.min(maxY, newY));

      moveWindow(windowId, clampedX, clampedY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, windowId, window.size, moveWindow]);

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

  // Render app component
  const renderAppContent = () => {
    if (!app) return null;

    const AppComponent = app.config.component;
    
    return (
      <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
        <AppComponent windowId={windowId} />
      </Suspense>
    );
  };

  return (
    <div
      ref={windowRef}
      className={`${styles.window} ${isActive ? styles.active : styles.inactive}`}
      style={getWindowStyle()}
      onMouseDown={handleMouseDown}
    >
      {/* Title Bar */}
      <div
        className={`${styles.titleBar} ${isActive ? styles.titleBarActive : styles.titleBarInactive}`}
        onMouseDown={handleTitleBarMouseDown}
      >
        {/* Close Button */}
        <button
          className={styles.closeButton}
          onClick={(e) => {
            e.stopPropagation();
            closeWindow(windowId);
          }}
          aria-label="Close window"
        >
          <div className={styles.closeButtonInner} />
        </button>

        {/* Title */}
        <div className={styles.title}>{window.title}</div>

        {/* Zoom Button (Maximize) */}
        <button
          className={styles.zoomButton}
          onClick={(e) => {
            e.stopPropagation();
            zoomWindow(windowId);
          }}
          aria-label={window.state === 'maximized' ? 'Restore window' : 'Maximize window'}
        >
          <div className={styles.zoomButtonInner} />
        </button>
      </div>

      {/* Content Area */}
      <div className={styles.content}>
        {renderAppContent()}
      </div>

      {/* Resize Handle (if resizable) */}
      {window.isResizable && window.state === 'normal' && (
        <div
          className={styles.resizeHandle}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsResizing(true);
          }}
        />
      )}
    </div>
  );
}

