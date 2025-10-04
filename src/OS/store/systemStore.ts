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
  
  // Menu Bar
  openMenu: (menuId: string) => void;
  closeMenu: () => void;
  
  // Mobile Actions
  openAppMobile: (appId: string) => void;
  closeAppMobile: () => void;
  goBack: () => void;
  toggleDock: () => void;
  toggleMenu: () => void;
}

type SystemStore = SystemState & SystemActions;

const INITIAL_MOBILE_STATE: MobileState = {
  activeAppId: null,
  appHistory: [],
  dockApps: [],
  isDockVisible: false,
  isMenuOpen: false,
};

const INITIAL_STATE: SystemState = {
  windows: {},
  activeWindowId: null,
  runningApps: {},
  desktopIcons: [],
  wallpaper: '/filesystem/System/Desktop Pictures/Classic.png',
  pinnedApps: ['finder', 'calculator', 'text-editor'], // Finder always first
  activeMenu: null,
  mobile: INITIAL_MOBILE_STATE,
  bootTime: Date.now(),
  systemVersion: '8.0.0',
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
    
    const window: Window = {
      id: windowId,
      appId: config.appId,
      title: config.title,
      position: config.initialPosition ?? {
        x: 100 + (Object.keys(get().windows).length * 30), // Cascade windows
        y: 100 + (Object.keys(get().windows).length * 30),
      },
      size: config.defaultSize,
      state: 'normal',
      zIndex,
      isActive: true,
      isResizable: config.resizable,
      minSize: config.minSize,
      maxSize: config.maxSize,
    };

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

    const newZIndex = nextZIndex++;
    
    // If window is minimized, restore it to normal state
    const wasMinimized = window.state === 'minimized';
    const newState: Window['state'] = wasMinimized ? 'normal' : window.state;
    
    // Announce if restoring from minimized
    if (wasMinimized) {
      screenReader.announceWindowRestored(window.title);
    }
    
    set((state) => ({
      windows: {
        ...state.windows,
        [windowId]: { ...window, zIndex: newZIndex, isActive: true, state: newState },
      },
      activeWindowId: windowId,
    }));

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

    const newState: Window['state'] = window.state === 'maximized' ? 'normal' : 'maximized';

    // Announce to screen readers
    if (newState === 'maximized') {
      screenReader.announceWindowMaximized(window.title);
    } else {
      screenReader.announceWindowRestored(window.title);
    }

    set((state) => ({
      windows: {
        ...state.windows,
        [windowId]: { ...window, state: newState },
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

    if (window.minSize) {
      finalWidth = Math.max(finalWidth, window.minSize.width);
      finalHeight = Math.max(finalHeight, window.minSize.height);
    }

    if (window.maxSize) {
      finalWidth = Math.min(finalWidth, window.maxSize.width);
      finalHeight = Math.min(finalHeight, window.maxSize.height);
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
    set({ wallpaper });
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
}));

