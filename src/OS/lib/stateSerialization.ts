/**
 * State Serialization System
 * Complete state save/restore for deep linking and session recovery
 */

import { useSystemStore } from '../store/systemStore';
import type { Window as SystemWindow } from '../types/window';

export interface SerializedWindow {
  id: string;
  appId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

export interface SerializedApp {
  id: string;
  state?: any; // App-specific state
  windows: string[]; // Window IDs
}

export interface SerializedDesktop {
  wallpaper: string;
  theme: string;
  accentColor: string | null;
  iconPositions: Record<string, { x: number; y: number }>;
}

export interface SerializedState {
  version: string; // For migration
  timestamp: number;
  windows: SerializedWindow[];
  apps: SerializedApp[];
  desktop: SerializedDesktop;
  activeWindowId: string | null;
  pinnedApps: string[];
}

/**
 * Serialize the current system state
 */
export function serializeSystemState(): SerializedState {
  const store = useSystemStore.getState();

  const windows: SerializedWindow[] = Object.values(store.windows).map((win: SystemWindow) => ({
    id: win.id,
    appId: win.appId,
    x: win.position.x,
    y: win.position.y,
    width: win.size.width,
    height: win.size.height,
    isMinimized: win.state === 'minimized',
    isMaximized: win.state === 'maximized',
    zIndex: win.zIndex,
  }));

  const apps: SerializedApp[] = Object.values(store.runningApps).map((app) => ({
    id: app.id,
    windows: app.windows,
    // App-specific state would be added by apps themselves
    state: undefined,
  }));

  const desktop: SerializedDesktop = {
    wallpaper: store.wallpaper,
    theme: store.activeTheme,
    accentColor: store.accentColor,
    iconPositions: store.desktopIcons.reduce((acc, icon) => {
      acc[icon.id] = { x: icon.position.x, y: icon.position.y };
      return acc;
    }, {} as Record<string, { x: number; y: number }>),
  };

  return {
    version: '1.0.0',
    timestamp: Date.now(),
    windows,
    apps,
    desktop,
    activeWindowId: store.activeWindowId,
    pinnedApps: store.pinnedApps,
  };
}

/**
 * Restore system state from serialized data
 */
export function restoreSystemState(state: SerializedState): void {
  const store = useSystemStore.getState();

  // Restore wallpaper
  if (state.desktop.wallpaper !== store.wallpaper) {
    store.setWallpaper(state.desktop.wallpaper);
  }

  // Restore icon positions
  Object.entries(state.desktop.iconPositions).forEach(([iconId, position]) => {
    store.moveDesktopIcon(iconId, position.x, position.y);
  });

  // Note: Theme and accent color restoration would require additional store methods
  // Note: Pinned apps restoration would require additional store methods
  // Note: Apps and windows restoration is complex and requires relaunching apps
  
  console.log('State restoration:', {
    windowsToRestore: state.windows.length,
    appsToRestore: state.apps.length,
    desktop: state.desktop,
  });
}

/**
 * Create a shareable URL with current state
 */
export function createShareableURL(): string {
  const state = serializeSystemState();
  const compressed = compressState(state);
  const encoded = btoa(compressed);
  
  const url = new URL(window.location.href);
  url.searchParams.set('state', encoded);
  
  return url.toString();
}

/**
 * Load state from URL
 */
export function loadStateFromURL(): SerializedState | null {
  const url = new URL(window.location.href);
  const encoded = url.searchParams.get('state');
  
  if (!encoded) return null;
  
  try {
    const compressed = atob(encoded);
    const state = decompressState(compressed);
    return state;
  } catch (error) {
    console.error('Failed to load state from URL:', error);
    return null;
  }
}

/**
 * Compress state for URL (simple JSON stringify for now)
 * In production, use LZ-string or similar for better compression
 */
function compressState(state: SerializedState): string {
  // Remove unnecessary data for URL sharing
  const minimal = {
    v: state.version,
    t: state.timestamp,
    w: state.windows.map((w) => ({
      i: w.id,
      a: w.appId,
      x: w.x,
      y: w.y,
      w: w.width,
      h: w.height,
      m: w.isMinimized,
      z: w.isMaximized,
      zi: w.zIndex,
    })),
    a: state.apps.map((a) => ({
      i: a.id,
      w: a.windows,
      s: a.state,
    })),
    d: {
      w: state.desktop.wallpaper,
      t: state.desktop.theme,
      ac: state.desktop.accentColor,
      ip: state.desktop.iconPositions,
    },
    aw: state.activeWindowId,
    pa: state.pinnedApps,
  };
  
  return JSON.stringify(minimal);
}

/**
 * Decompress state from URL
 */
function decompressState(compressed: string): SerializedState {
  const minimal = JSON.parse(compressed);
  
  return {
    version: minimal.v,
    timestamp: minimal.t,
    windows: minimal.w.map((w: any) => ({
      id: w.i,
      appId: w.a,
      x: w.x,
      y: w.y,
      width: w.w,
      height: w.h,
      isMinimized: w.m,
      isMaximized: w.z,
      zIndex: w.zi,
    })),
    apps: minimal.a.map((a: any) => ({
      id: a.i,
      windows: a.w,
      state: a.s,
    })),
    desktop: {
      wallpaper: minimal.d.w,
      theme: minimal.d.t,
      accentColor: minimal.d.ac,
      iconPositions: minimal.d.ip,
    },
    activeWindowId: minimal.aw,
    pinnedApps: minimal.pa,
  };
}

/**
 * Save state to localStorage (for session recovery)
 */
export function saveStateToLocalStorage(): void {
  try {
    const state = serializeSystemState();
    localStorage.setItem('berryos-state', JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save state to localStorage:', error);
  }
}

/**
 * Load state from localStorage
 */
export function loadStateFromLocalStorage(): SerializedState | null {
  try {
    const stored = localStorage.getItem('berryos-state');
    if (!stored) return null;
    
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load state from localStorage:', error);
    return null;
  }
}

/**
 * Clear saved state
 */
export function clearSavedState(): void {
  localStorage.removeItem('berryos-state');
}

/**
 * Check if state is valid and can be restored
 */
export function isValidState(state: any): state is SerializedState {
  return (
    state &&
    typeof state === 'object' &&
    typeof state.version === 'string' &&
    typeof state.timestamp === 'number' &&
    Array.isArray(state.windows) &&
    Array.isArray(state.apps) &&
    typeof state.desktop === 'object'
  );
}

