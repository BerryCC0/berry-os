/**
 * System 7 Toolbox - Zustand Store
 * The heart of Nouns OS - manages all system-level state
 */

import { create } from 'zustand';
import type {
  SystemState,
  RunningApp,
  AppConfig,
  DesktopIcon,
  MobileState,
} from '../types/system';
import type { Window, WindowConfig } from '../types/window';
import { eventBus } from '../lib/eventBus';
import { addAppToURL, removeAppFromURL } from '../../../app/lib/utils/stateUtils';
import * as screenReader from '../lib/screenReader';
import * as windowManager from '../lib/windowManager';
import type { UserPreferences } from '../../../app/lib/Persistence/persistence';
import { initializeApplicationsFolder } from '../lib/filesystem';

interface SystemActions {
  // Window Management
  openWindow: (config: WindowConfig) => string;
  closeWindow: (windowId: string) => void;
  focusWindow: (windowId: string) => void;
  minimizeWindow: (windowId: string) => void;
  zoomWindow: (windowId: string) => void;
  moveWindow: (windowId: string, x: number, y: number) => void;
  resizeWindow: (windowId: string, width: number, height: number) => void;
  normalizeZIndices: () => void;
  
  // Process Management
  launchApp: (appConfig: AppConfig) => void;
  terminateApp: (appId: string) => void;
  suspendApp: (appId: string) => void;
  resumeApp: (appId: string) => void;
  
  // Desktop Management
  addDesktopIcon: (icon: DesktopIcon) => void;
  removeDesktopIcon: (iconId: string) => void;
  moveDesktopIcon: (iconId: string, x: number, y: number) => void;
  setWallpaper: (wallpaper: string) => void;
  initializeDesktopIcons: (apps: AppConfig[]) => void;
  updateDesktopPreferences: (prefs: Partial<SystemState['desktopPreferences']>) => void;
  
  // Dock Management
  updateDockPreferences: (prefs: Partial<SystemState['dockPreferences']>) => void;
  toggleDockPin: (appId: string) => void;
  
  // Theme Management
  setCustomTheme: (theme: import('../types/theme').Theme | null) => void;
  clearCustomTheme: () => void;
  setAccentColor: (color: string | null) => void;
  updateThemeCustomization: (customization: Partial<import('../types/theme').ThemeCustomization>) => void;
  
  // Window Restoration
  setRestoreWindowsOnStartup: (enabled: boolean) => void;
  
  // Menu Bar
  openMenu: (menuId: string) => void;
  closeMenu: () => void;
  
  // Mobile Actions
  openAppMobile: (appId: string) => void;
  closeAppMobile: () => void;
  goBack: () => void;
  toggleDock: () => void;
  toggleMenu: () => void;
  
  // System Actions (QoL)
  sleep: () => void;
  restart: () => void;
  shutdown: () => void;
  wakeFromSleep: () => void;
}

type SystemStore = SystemState & SystemActions;

const INITIAL_MOBILE_STATE: MobileState = {
  activeAppId: null,
  appHistory: [],
  dockApps: [],
  isDockVisible: false,
  isMenuOpen: false,
};

// Detect system color scheme for initial theme
function getInitialTheme(): string {
  if (typeof window === 'undefined') return 'classic';
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'darkMode' : 'classic';
}

const INITIAL_STATE: SystemState = {
  windows: {},
  activeWindowId: null,
  runningApps: {},
  desktopIcons: [],
  wallpaper: '/filesystem/System/Desktop Pictures/Classic.svg',
  desktopPreferences: {
    gridSpacing: 80,
    snapToGrid: false, // Free-form by default
    showHiddenFiles: false,
    doubleClickSpeed: 'medium',
  },
  pinnedApps: ['finder', 'calculator', 'text-editor'], // Finder always first (deprecated)
  dockPreferences: {
    position: 'bottom',
    size: 64,
    pinnedApps: ['finder', 'calculator', 'text-editor'],
    autoHide: false,
  },
  activeMenu: null,
  mobile: INITIAL_MOBILE_STATE,
  bootTime: Date.now(),
  systemVersion: '8.0.0',
  activeTheme: getInitialTheme(), // Auto-detect system color scheme
  customTheme: null, // Custom theme being edited (overrides activeTheme when set)
  accentColor: null, // No custom accent by default (use theme default)
  themeCustomization: {}, // No customizations by default
  restoreWindowsOnStartup: false,
  isScreensaverActive: false, // Screensaver state
};

let nextWindowId = 1;
let nextZIndex = 1;

const Z_INDEX_NORMALIZE_THRESHOLD = 1000;

export const useSystemStore = create<SystemStore>((set, get) => ({
  ...INITIAL_STATE,

  // ==================== Window Management ====================
  
  openWindow: (config: WindowConfig) => {
    const windowId = `window-${nextWindowId++}`;
    const zIndex = nextZIndex++;
    
    // Try to restore saved window position (Phase 7)
    // Import dynamically to avoid circular dependency
    const { usePreferencesStore } = require('./preferencesStore');
    const savedPosition = usePreferencesStore.getState().restoreWindowPosition(config.appId);
    
    // Calculate viewport dimensions for smart positioning
    const viewportWidth = typeof globalThis.window !== 'undefined' ? globalThis.window.innerWidth : 1920;
    const viewportHeight = typeof globalThis.window !== 'undefined' ? globalThis.window.innerHeight : 1080;
    const menuBarHeight = 20;
    
    // Get dock height - ensure element exists and has been rendered
    const dockElement = typeof document !== 'undefined' ? document.querySelector('[class*="dock"]') : null;
    const dockHeight = dockElement?.getBoundingClientRect().height || 80;
    
    // CRITICAL: Ensure dock height is reasonable (between 60-120px typical range)
    const validatedDockHeight = Math.max(60, Math.min(120, dockHeight));
    
    // Calculate available height for windows
    const availableHeight = viewportHeight - menuBarHeight - validatedDockHeight;
    
    // Smart positioning: center large windows, cascade smaller ones
    const isLargeWindow = config.defaultSize.height > availableHeight * 0.6;
    
    const defaultPosition = config.initialPosition ?? (isLargeWindow
      ? {
          // Center large windows to ensure resize corner is visible
          x: Math.max(20, (viewportWidth - config.defaultSize.width) / 2),
          y: Math.max(20, (availableHeight - config.defaultSize.height) / 2)
        }
      : {
          // Cascade smaller windows with better starting position
          x: 100 + (Object.keys(get().windows).length * 30),
          y: 60 + (Object.keys(get().windows).length * 30)
        });
    
    const window: Window = {
      id: windowId,
      appId: config.appId,
      title: config.title,
      position: savedPosition 
        ? { x: savedPosition.x, y: savedPosition.y }
        : defaultPosition,
      size: savedPosition
        ? { width: savedPosition.width, height: savedPosition.height }
        : config.defaultSize,
      state: 'normal',
      zIndex,
      isActive: true,
      isResizable: config.resizable,
      minSize: config.minSize,
      maxSize: config.maxSize,
    };

    // Clamp window position to viewport bounds to prevent windows opening off-screen
    const clampedPosition = windowManager.clampWindowPosition(
      window.position,
      window.size,
      viewportWidth,
      viewportHeight,
      menuBarHeight,
      validatedDockHeight
    );
    
    window.position = clampedPosition;

    set((state) => ({
      windows: { ...state.windows, [windowId]: window },
      activeWindowId: windowId,
    }));

    // Announce to screen readers
    screenReader.announceWindowOpen(config.title);

    // Publish event
    eventBus.publish('WINDOW_OPEN', { windowId });

    // Check if we need to normalize z-indices
    if (zIndex > Z_INDEX_NORMALIZE_THRESHOLD) {
      get().normalizeZIndices();
    }

    return windowId;
  },

  closeWindow: (windowId: string) => {
    const state = get();
    const window = state.windows[windowId];
    if (!window) return;

    // Announce to screen readers
    screenReader.announceWindowClosed(window.title);

    // Remove window
    const newWindows = { ...state.windows };
    delete newWindows[windowId];

    // Update active window
    let newActiveWindowId = state.activeWindowId;
    if (state.activeWindowId === windowId) {
      // Find next highest z-index window
      const sortedWindows = Object.values(newWindows).sort((a, b) => b.zIndex - a.zIndex);
      newActiveWindowId = sortedWindows[0]?.id ?? null;
    }

    set({
      windows: newWindows,
      activeWindowId: newActiveWindowId,
    });

    // Publish event
    eventBus.publish('WINDOW_CLOSE', { windowId });

    // Check if app has no more windows and terminate
    const app = state.runningApps[window.appId];
    if (app && app.windows.length === 1 && app.windows[0] === windowId) {
      get().terminateApp(window.appId);
    }
  },

  focusWindow: (windowId: string) => {
    const state = get();
    const window = state.windows[windowId];
    if (!window) return;

    // If already active, do nothing
    if (state.activeWindowId === windowId && window.state !== 'minimized') {
      return;
    }

    const newZIndex = nextZIndex++;
    
    // If window is minimized, restore it to normal state
    const wasMinimized = window.state === 'minimized';
    const newState: Window['state'] = wasMinimized ? 'normal' : window.state;
    
    // Announce if restoring from minimized
    if (wasMinimized) {
      screenReader.announceWindowRestored(window.title);
    }
    
    // Update all windows: deactivate others, activate this one
    const updatedWindows: Record<string, Window> = {};
    Object.keys(state.windows).forEach((id) => {
      const win = state.windows[id];
      if (id === windowId) {
        updatedWindows[id] = { ...win, zIndex: newZIndex, isActive: true, state: newState };
      } else {
        updatedWindows[id] = { ...win, isActive: false };
      }
    });
    
    set({
      windows: updatedWindows,
      activeWindowId: windowId,
    });

    // Publish event
    eventBus.publish('WINDOW_FOCUS', { windowId });

    // Check if we need to normalize z-indices
    if (newZIndex > Z_INDEX_NORMALIZE_THRESHOLD) {
      get().normalizeZIndices();
    }
  },

  minimizeWindow: (windowId: string) => {
    const window = get().windows[windowId];
    if (!window) return;

    // Announce to screen readers
    screenReader.announceWindowMinimized(window.title);

    set((state) => ({
      windows: {
        ...state.windows,
        [windowId]: { ...window, state: 'minimized', isActive: false },
      },
      activeWindowId: state.activeWindowId === windowId ? null : state.activeWindowId,
    }));

    eventBus.publish('WINDOW_MINIMIZE', { windowId });
  },

  zoomWindow: (windowId: string) => {
    const window = get().windows[windowId];
    if (!window) return;

    const isCurrentlyMaximized = window.state === 'maximized';
    const newState: Window['state'] = isCurrentlyMaximized ? 'normal' : 'maximized';

    // Store or restore original size/position for smart zoom
    let updatedWindow = { ...window, state: newState };

    if (!isCurrentlyMaximized) {
      // Going to maximized - store current position and size
      updatedWindow.metadata = {
        ...window.metadata,
        originalPosition: { ...window.position },
        originalSize: { ...window.size },
      };

      // Calculate dock height from DOM for accurate sizing
      const dockElement = typeof document !== 'undefined' 
        ? document.querySelector('[class*="dock"]') 
        : null;
      const dockHeight = dockElement ? dockElement.getBoundingClientRect().height : 80;
      
      const viewportWidth = typeof globalThis.window !== 'undefined' ? globalThis.window.innerWidth : 1920;
      const viewportHeight = typeof globalThis.window !== 'undefined' ? globalThis.window.innerHeight : 1080;
      const menuBarHeight = 20;
      
      // Available desktop space between menubar and dock
      const availableHeight = viewportHeight - menuBarHeight - dockHeight;

      // Calculate optimal size (respecting max size constraints and dock)
      const maxWidth = window.maxSize?.width || viewportWidth - 40;
      const maxHeight = window.maxSize?.height || availableHeight - 40;
      
      updatedWindow.size = {
        width: Math.min(maxWidth, viewportWidth - 40),
        height: Math.min(maxHeight, availableHeight - 40),
      };
      
      // Center window in available space (between menubar and dock)
      updatedWindow.position = {
        x: (viewportWidth - updatedWindow.size.width) / 2,
        y: (availableHeight - updatedWindow.size.height) / 2,
      };
    } else {
      // Restore original position and size
      if (window.metadata?.originalPosition && window.metadata?.originalSize) {
        updatedWindow.position = { ...window.metadata.originalPosition };
        updatedWindow.size = { ...window.metadata.originalSize };
      }
    }

    // Announce to screen readers
    if (newState === 'maximized') {
      screenReader.announceWindowMaximized(window.title);
    } else {
      screenReader.announceWindowRestored(window.title);
    }

    set((state) => ({
      windows: {
        ...state.windows,
        [windowId]: updatedWindow,
      },
    }));

    eventBus.publish('WINDOW_ZOOM', { windowId });
  },

  moveWindow: (windowId: string, x: number, y: number) => {
    const window = get().windows[windowId];
    if (!window) return;

    set((state) => ({
      windows: {
        ...state.windows,
        [windowId]: { ...window, position: { x, y } },
      },
    }));

    eventBus.publish('WINDOW_MOVE', { windowId, x, y });
  },

  resizeWindow: (windowId: string, width: number, height: number) => {
    const window = get().windows[windowId];
    if (!window || !window.isResizable) return;

    // Enforce min/max constraints
    let finalWidth = width;
    let finalHeight = height;

    // Get viewport dimensions and dock height for max constraints
    const viewportWidth = typeof globalThis.window !== 'undefined' ? globalThis.window.innerWidth : 1920;
    const viewportHeight = typeof globalThis.window !== 'undefined' ? globalThis.window.innerHeight : 1080;
    const menuBarHeight = 20;
    
    // Get dock height from DOM
    const dockElement = typeof document !== 'undefined' ? document.querySelector('[class*="dock"]') : null;
    const dockHeight = dockElement ? dockElement.getBoundingClientRect().height : 80;
    
    // Available height accounting for dock
    const availableHeight = viewportHeight - menuBarHeight - dockHeight;

    // Enforce minimum size
    if (window.minSize) {
      finalWidth = Math.max(finalWidth, window.minSize.width);
      finalHeight = Math.max(finalHeight, window.minSize.height);
    }

    // Enforce maximum size (accounting for dock)
    if (window.maxSize) {
      finalWidth = Math.min(finalWidth, window.maxSize.width);
      finalHeight = Math.min(finalHeight, window.maxSize.height);
    } else {
      // No maxSize set - allow resizing up to available space (above dock)
      finalWidth = Math.min(finalWidth, viewportWidth);
      finalHeight = Math.min(finalHeight, availableHeight);
    }

    // Ensure minimum practical size (50x50)
    finalWidth = Math.max(finalWidth, 50);
    finalHeight = Math.max(finalHeight, 50);
    
    // Clamp window position if it would extend below dock
    if (window.position.y + finalHeight > availableHeight) {
      // Adjust height to fit above dock
      const adjustedHeight = Math.min(finalHeight, availableHeight - window.position.y);
      finalHeight = Math.max(adjustedHeight, window.minSize?.height || 50);
    }

    set((state) => ({
      windows: {
        ...state.windows,
        [windowId]: { ...window, size: { width: finalWidth, height: finalHeight } },
      },
    }));

    eventBus.publish('WINDOW_RESIZE', { windowId, width: finalWidth, height: finalHeight });
  },

  normalizeZIndices: () => {
    const windows = get().windows;
    const sortedWindows = Object.values(windows).sort((a, b) => a.zIndex - b.zIndex);

    const normalizedWindows: Record<string, Window> = {};
    sortedWindows.forEach((window, index) => {
      normalizedWindows[window.id] = { ...window, zIndex: index + 1 };
    });

    nextZIndex = sortedWindows.length + 1;

    set({ windows: normalizedWindows });
  },

  // ==================== Process Management ====================
  
  launchApp: (appConfig: AppConfig) => {
    const state = get();
    
    // Check if app is already running
    if (state.runningApps[appConfig.id]) {
      // Focus existing app window
      const app = state.runningApps[appConfig.id];
      if (app.windows[0]) {
        get().focusWindow(app.windows[0]);
      }
      return;
    }

    // Create running app entry
    const runningApp: RunningApp = {
      id: appConfig.id,
      config: appConfig,
      windows: [],
      state: 'running',
      launchedAt: Date.now(),
    };

    set((state) => ({
      runningApps: { ...state.runningApps, [appConfig.id]: runningApp },
    }));

    // Open app window
    const windowId = get().openWindow({
      appId: appConfig.id,
      title: appConfig.name,
      defaultSize: appConfig.defaultWindowSize,
      minSize: appConfig.minWindowSize,
      maxSize: appConfig.maxWindowSize,
      resizable: appConfig.resizable,
    });

    // Add window to app
    set((state) => ({
      runningApps: {
        ...state.runningApps,
        [appConfig.id]: {
          ...state.runningApps[appConfig.id],
          windows: [windowId],
        },
      },
    }));

    // Update URL to reflect app launch
    addAppToURL(appConfig.id);

    eventBus.publish('APP_LAUNCH', { appId: appConfig.id });
  },

  terminateApp: (appId: string) => {
    const state = get();
    const app = state.runningApps[appId];
    if (!app) return;

    // Close all app windows
    app.windows.forEach((windowId) => {
      const newWindows = { ...state.windows };
      delete newWindows[windowId];
      set({ windows: newWindows });
    });

    // Remove app
    const newRunningApps = { ...state.runningApps };
    delete newRunningApps[appId];

    set({ runningApps: newRunningApps });

    // Update URL to reflect app termination
    removeAppFromURL(appId);

    eventBus.publish('APP_TERMINATE', { appId });
  },

  suspendApp: (appId: string) => {
    const app = get().runningApps[appId];
    if (!app) return;

    set((state) => ({
      runningApps: {
        ...state.runningApps,
        [appId]: { ...app, state: 'suspended' },
      },
    }));
  },

  resumeApp: (appId: string) => {
    const app = get().runningApps[appId];
    if (!app) return;

    set((state) => ({
      runningApps: {
        ...state.runningApps,
        [appId]: { ...app, state: 'running' },
      },
    }));
  },

  // ==================== Desktop Management ====================
  
  addDesktopIcon: (icon: DesktopIcon) => {
    set((state) => ({
      desktopIcons: [...state.desktopIcons, icon],
    }));
  },

  removeDesktopIcon: (iconId: string) => {
    set((state) => ({
      desktopIcons: state.desktopIcons.filter((icon) => icon.id !== iconId),
    }));
  },

  moveDesktopIcon: (iconId: string, x: number, y: number) => {
    set((state) => ({
      desktopIcons: state.desktopIcons.map((icon) =>
        icon.id === iconId ? { ...icon, position: { x, y } } : icon
      ),
    }));

    eventBus.publish('DESKTOP_ICON_MOVE', { iconId, x, y });
  },

  setWallpaper: (wallpaper: string) => {
    // IMMEDIATE update for instant UI feedback
    set({ wallpaper });
    
    // Announce change for accessibility
    eventBus.publish('WALLPAPER_CHANGE', { wallpaper });
  },

  // ==================== Theme Management ====================
  
  setCustomTheme: (theme) => {
    set({ customTheme: theme });
    if (theme) {
      console.log(`✨ Custom theme applied: ${theme.name}`);
    }
  },

  clearCustomTheme: () => {
    set({ customTheme: null });
    console.log(`✨ Custom theme cleared, reverting to preset`);
  },

  setAccentColor: (color) => {
    set({ accentColor: color });
    console.log(`🎨 Accent color ${color ? `set to ${color}` : 'cleared'}`);
  },

  updateThemeCustomization: (customization) => {
    set((state) => ({
      themeCustomization: {
        ...state.themeCustomization,
        ...customization,
      },
    }));
    console.log(`⚙️ Theme customization updated`, customization);
  },

  initializeDesktopIcons: (apps: AppConfig[]) => {
    const icons: DesktopIcon[] = [];
    const gridSize = 80; // Space between icons
    const startX = 20;
    const startY = 30; // Just below menu bar (20px menu bar + 10px padding)
    
    let row = 0;
    let col = 0;
    
    apps.forEach((app) => {
      if (app.showOnDesktop) {
        icons.push({
          id: `desktop-${app.id}`,
          name: app.name,
          icon: app.icon,
          type: 'app',
          position: {
            x: startX + (col * gridSize),
            y: startY + (row * gridSize),
          },
          appId: app.id,
        });
        
        // Grid layout: 1 column on right side of screen
        row++;
      }
    });
    
    set({ desktopIcons: icons });
    
    // Initialize Applications folder with all registered apps
    // This keeps the filesystem in sync with the app registry
    initializeApplicationsFolder(
      apps.map(app => ({
        id: app.id,
        name: app.name,
        icon: app.icon,
        description: app.description,
        version: app.version,
      }))
    );
  },

  updateDesktopPreferences: (prefs: Partial<SystemState['desktopPreferences']>) => {
    set((state) => ({
      desktopPreferences: {
        ...state.desktopPreferences,
        ...prefs,
      },
    }));
    
    console.log(`🖥️ Desktop preferences updated`, prefs);
    
    // Trigger save via preferences store
    const { usePreferencesStore } = require('./preferencesStore');
    usePreferencesStore.getState().saveUserPreferences();
  },

  // ==================== Dock Management ====================

  updateDockPreferences: (prefs: Partial<SystemState['dockPreferences']>) => {
    set((state) => ({
      dockPreferences: {
        ...state.dockPreferences,
        ...prefs,
      },
    }));
    
    console.log(`📍 Dock preferences updated`, prefs);
    
    // Trigger save via preferences store
    const { usePreferencesStore } = require('./preferencesStore');
    usePreferencesStore.getState().saveUserPreferences();
  },

  toggleDockPin: (appId: string) => {
    set((state) => {
      const { pinnedApps } = state.dockPreferences;
      const isPinned = pinnedApps.includes(appId);
      
      const newPinnedApps = isPinned
        ? pinnedApps.filter(id => id !== appId)
        : [...pinnedApps, appId];
      
      console.log(`📌 ${isPinned ? 'Unpinned' : 'Pinned'} app: ${appId}`);
      
      // Trigger save
      const { usePreferencesStore } = require('./preferencesStore');
      usePreferencesStore.getState().saveUserPreferences();
      
      return {
        dockPreferences: {
          ...state.dockPreferences,
          pinnedApps: newPinnedApps,
        },
      };
    });
  },

  // ==================== Window Restoration ====================

  setRestoreWindowsOnStartup: (enabled: boolean) => {
    set({ restoreWindowsOnStartup: enabled });
    console.log(`🪟 Restore windows on startup: ${enabled ? 'enabled' : 'disabled'}`);
    
    // Trigger save via preferences store
    const { usePreferencesStore } = require('./preferencesStore');
    usePreferencesStore.getState().saveUserPreferences();
  },

  // ==================== Menu Bar ====================
  
  openMenu: (menuId: string) => {
    set({ activeMenu: menuId });
    eventBus.publish('MENU_OPEN', { menuId });
  },

  closeMenu: () => {
    const menuId = get().activeMenu;
    set({ activeMenu: null });
    if (menuId) {
      eventBus.publish('MENU_CLOSE', { menuId });
    }
  },

  // ==================== Mobile Actions ====================
  
  openAppMobile: (appId: string) => {
    set((state) => ({
      mobile: {
        ...state.mobile,
        activeAppId: appId,
        appHistory: [...state.mobile.appHistory, appId],
      },
    }));
  },

  closeAppMobile: () => {
    set((state) => ({
      mobile: {
        ...state.mobile,
        activeAppId: null,
      },
    }));
  },

  goBack: () => {
    set((state) => {
      const newHistory = [...state.mobile.appHistory];
      newHistory.pop(); // Remove current
      const previousApp = newHistory[newHistory.length - 1] ?? null;

      return {
        mobile: {
          ...state.mobile,
          activeAppId: previousApp,
          appHistory: newHistory,
        },
      };
    });
  },

  toggleDock: () => {
    set((state) => ({
      mobile: {
        ...state.mobile,
        isDockVisible: !state.mobile.isDockVisible,
      },
    }));
  },

  toggleMenu: () => {
    set((state) => ({
      mobile: {
        ...state.mobile,
        isMenuOpen: !state.mobile.isMenuOpen,
      },
    }));
  },

  // ==================== System Actions (QoL) ====================

  sleep: () => {
    set({ isScreensaverActive: true });
  },

  restart: () => {
    // Reload the page at root domain
    window.location.href = window.location.origin;
  },

  shutdown: () => {
    // Close the browser tab
    window.close();
    // Fallback if window.close() doesn't work (some browsers block it)
    setTimeout(() => {
      // Show a message if we couldn't close
      alert('Please close this tab manually.');
    }, 100);
  },

  wakeFromSleep: () => {
    set({ isScreensaverActive: false });
  },
}));

