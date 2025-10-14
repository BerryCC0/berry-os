/**
 * Window Manager Utilities
 * Helper functions for Mac OS 8 window management
 * Business logic for window operations
 */

import type { Window, WindowPosition, WindowSize } from '../types/window';

/**
 * Calculate smart zoom size for a window
 * Mac OS 8 behavior: Zoom to fit content or toggle between preset sizes
 */
export function calculateSmartZoomSize(
  window: Window,
  viewportWidth: number,
  viewportHeight: number,
  menuBarHeight: number = 20,
  dockHeight: number = 80
): { width: number; height: number; x: number; y: number } {
  // If window is already maximized, restore to default size
  if (window.state === 'maximized') {
    return {
      width: window.metadata?.originalSize?.width || window.size.width,
      height: window.metadata?.originalSize?.height || window.size.height,
      x: window.metadata?.originalPosition?.x || window.position.x,
      y: window.metadata?.originalPosition?.y || window.position.y,
    };
  }

  // Windows are positioned relative to Desktop container (top: 20px)
  // Available height accounting for dock at bottom
  const availableHeight = viewportHeight - menuBarHeight - dockHeight;
  
  // Calculate optimal size based on max constraints
  const maxWidth = window.maxSize?.width || viewportWidth * 0.9;
  const maxHeight = window.maxSize?.height || availableHeight * 0.9;

  // Center the window within the desktop area
  const width = Math.min(maxWidth, viewportWidth - 40);
  const height = Math.min(maxHeight, availableHeight - 40);
  const x = (viewportWidth - width) / 2;
  // Y position relative to desktop container (not viewport)
  const y = (availableHeight - height) / 2;

  return { width, height, x, y };
}

/**
 * Check if window position is within valid bounds
 * Ensures at least part of window is visible for dragging
 */
export function isWindowPositionValid(
  position: WindowPosition,
  size: WindowSize,
  viewportWidth: number,
  viewportHeight: number,
  menuBarHeight: number = 20
): boolean {
  const minVisibleWidth = Math.min(100, size.width * 0.3);
  const minVisibleHeight = 40; // Title bar must be visible

  // Check if any part of the window is visible
  const isVisible =
    position.x + size.width > minVisibleWidth &&
    position.x < viewportWidth - minVisibleWidth &&
    position.y + minVisibleHeight > menuBarHeight &&
    position.y < viewportHeight;

  return isVisible;
}

/**
 * Clamp window position to valid bounds
 * Ensures window remains accessible and doesn't overlap dock
 */
export function clampWindowPosition(
  position: WindowPosition,
  size: WindowSize,
  viewportWidth: number,
  viewportHeight: number,
  menuBarHeight: number = 20,
  dockHeight: number = 80
): WindowPosition {
  // Minimum visible area requirements
  const minVisibleWidth = Math.min(200, size.width);
  const minVisibleHeight = 40; // Title bar + some content

  // Available height accounting for dock
  const availableHeight = viewportHeight - menuBarHeight - dockHeight;

  // Calculate bounds
  const minX = -(size.width - minVisibleWidth);
  const maxX = viewportWidth - minVisibleWidth;
  // Windows are positioned relative to the Desktop container which already has top: 20px
  // So minY should be 0 to allow windows to touch the top of the desktop area (menubar edge)
  const minY = 0;
  const maxY = availableHeight - minVisibleHeight;

  return {
    x: Math.max(minX, Math.min(maxX, position.x)),
    y: Math.max(minY, Math.min(maxY, position.y)),
  };
}

/**
 * Calculate cascade position for new window
 * Mac OS 8 behavior: Offset each new window by 30px x and y
 */
export function calculateCascadePosition(
  existingWindows: Record<string, Window>,
  viewportWidth: number,
  viewportHeight: number,
  menuBarHeight: number = 20,
  dockHeight: number = 80
): WindowPosition {
  const windowCount = Object.keys(existingWindows).length;
  const cascadeOffset = 30;
  const baseX = 100;
  // Windows are relative to Desktop container (which has top: 20px)
  // So baseY should be relative to that container, not viewport
  const baseY = 60; // Nice padding from top of desktop area

  let x = baseX + windowCount * cascadeOffset;
  let y = baseY + windowCount * cascadeOffset;

  // Available height accounting for dock
  const availableHeight = viewportHeight - menuBarHeight - dockHeight;

  // Reset cascade if we're getting too far to bottom-right
  if (x > viewportWidth * 0.5 || y > availableHeight * 0.5) {
    x = baseX;
    y = baseY;
  }

  return { x, y };
}

/**
 * Check if window should snap to edge
 * Mac OS 8 inspired: Hold Option key for snapping
 */
export function calculateSnapPosition(
  position: WindowPosition,
  size: WindowSize,
  viewportWidth: number,
  viewportHeight: number,
  menuBarHeight: number = 20,
  snapThreshold: number = 20,
  dockHeight: number = 80
): WindowPosition | null {
  // Windows are positioned relative to Desktop container (top: 20px)
  // Available height accounting for dock
  const availableHeight = viewportHeight - menuBarHeight - dockHeight;
  
  const snapZones = {
    left: position.x < snapThreshold,
    right: position.x + size.width > viewportWidth - snapThreshold,
    top: position.y < snapThreshold, // Top of desktop area
    bottom: position.y + size.height > availableHeight - snapThreshold,
  };

  // Snap to edges (relative to desktop container, respecting dock)
  if (snapZones.left && snapZones.top) {
    // Top-left corner
    return { x: 0, y: 0 };
  } else if (snapZones.right && snapZones.top) {
    // Top-right corner
    return { x: viewportWidth - size.width, y: 0 };
  } else if (snapZones.left && snapZones.bottom) {
    // Bottom-left corner (above dock)
    return { x: 0, y: availableHeight - size.height };
  } else if (snapZones.right && snapZones.bottom) {
    // Bottom-right corner (above dock)
    return { x: viewportWidth - size.width, y: availableHeight - size.height };
  } else if (snapZones.left) {
    // Left edge
    return { x: 0, y: position.y };
  } else if (snapZones.right) {
    // Right edge
    return { x: viewportWidth - size.width, y: position.y };
  } else if (snapZones.top) {
    // Top edge (top of desktop area)
    return { x: position.x, y: 0 };
  } else if (snapZones.bottom) {
    // Bottom edge (above dock)
    return { x: position.x, y: availableHeight - size.height };
  }

  return null; // No snap
}

/**
 * Calculate window size with constraints
 * Enforces min/max size limits
 */
export function constrainWindowSize(
  size: WindowSize,
  minSize?: WindowSize,
  maxSize?: WindowSize
): WindowSize {
  let width = size.width;
  let height = size.height;

  if (minSize) {
    width = Math.max(width, minSize.width);
    height = Math.max(height, minSize.height);
  }

  if (maxSize) {
    width = Math.min(width, maxSize.width);
    height = Math.min(height, maxSize.height);
  }

  return { width, height };
}

/**
 * Get next z-index for window focus
 * Manages z-index stacking order
 */
export function getNextZIndex(windows: Record<string, Window>): number {
  const maxZIndex = Object.values(windows).reduce(
    (max, window) => Math.max(max, window.zIndex),
    0
  );
  return maxZIndex + 1;
}

/**
 * Normalize z-indices when they get too high
 * Prevents overflow and maintains relative order
 */
export function normalizeZIndices(
  windows: Record<string, Window>
): Record<string, Window> {
  const sortedWindows = Object.values(windows).sort((a, b) => a.zIndex - b.zIndex);

  const normalized: Record<string, Window> = {};
  sortedWindows.forEach((window, index) => {
    normalized[window.id] = {
      ...window,
      zIndex: index + 1,
    };
  });

  return normalized;
}

/**
 * Check if point is within window bounds
 * Useful for hit testing
 */
export function isPointInWindow(
  point: { x: number; y: number },
  window: Window
): boolean {
  return (
    point.x >= window.position.x &&
    point.x <= window.position.x + window.size.width &&
    point.y >= window.position.y &&
    point.y <= window.position.y + window.size.height
  );
}

/**
 * Get window at point (top-most window)
 * Returns window ID or null
 */
export function getWindowAtPoint(
  point: { x: number; y: number },
  windows: Record<string, Window>
): string | null {
  // Sort by z-index (highest first)
  const sortedWindows = Object.values(windows)
    .filter((w) => w.state !== 'minimized')
    .sort((a, b) => b.zIndex - a.zIndex);

  for (const window of sortedWindows) {
    if (isPointInWindow(point, window)) {
      return window.id;
    }
  }

  return null;
}

/**
 * Calculate window center point
 */
export function getWindowCenter(window: Window): { x: number; y: number } {
  return {
    x: window.position.x + window.size.width / 2,
    y: window.position.y + window.size.height / 2,
  };
}

/**
 * Check if windows overlap
 */
export function doWindowsOverlap(window1: Window, window2: Window): boolean {
  return !(
    window1.position.x + window1.size.width < window2.position.x ||
    window2.position.x + window2.size.width < window1.position.x ||
    window1.position.y + window1.size.height < window2.position.y ||
    window2.position.y + window2.size.height < window1.position.y
  );
}

/**
 * Find non-overlapping position for new window
 */
export function findNonOverlappingPosition(
  size: WindowSize,
  existingWindows: Record<string, Window>,
  viewportWidth: number,
  viewportHeight: number,
  menuBarHeight: number = 20,
  dockHeight: number = 80
): WindowPosition {
  const testWindow: Window = {
    id: 'test',
    appId: 'test',
    title: 'test',
    position: calculateCascadePosition(existingWindows, viewportWidth, viewportHeight, menuBarHeight, dockHeight),
    size,
    state: 'normal',
    zIndex: 1,
    isActive: false,
    isResizable: true,
  };

  // Check if proposed position overlaps with any existing window
  let overlaps = false;
  for (const window of Object.values(existingWindows)) {
    if (window.state !== 'minimized' && doWindowsOverlap(testWindow, window)) {
      overlaps = true;
      break;
    }
  }

  // If overlaps, use cascade anyway (Mac OS 8 behavior)
  // User can manually reposition if needed
  return testWindow.position;
}

