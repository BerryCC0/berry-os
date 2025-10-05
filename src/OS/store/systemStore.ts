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
import type { UserPreferences } from '../../../app/lib/Persistence/persistence';

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
  
  // User Preferences (Phase 6)
  loadUserPreferences: (walletAddress: string) => Promise<void>;
  saveUserPreferences: () => void;
  saveDesktopIconPositions: () => void;
  updateThemePreference: (themeId: string, wallpaperUrl?: string) => Promise<void>;
  resetToDefaults: () => void;
  setConnectedWallet: (address: string | null) => void;
  
  // Theme Customization (Phase 7.1)
  setAccentColor: (color: string | null) => void;
  updateThemeCustomization: (customization: Partial<SystemState['themeCustomization']>) => void;
  
  // Window Position Persistence (Phase 7)
  saveWindowPosition: (windowId: string) => void;
  restoreWindowPosition: (appId: string) => { x: number; y: number; width: number; height: number } | null;
  
  // System Actions (QoL)
  sleep: () => void;
  restart: () => void;
  shutdown: () => void;
  wakeFromSleep: () => void;
}

type SystemStore = SystemState & UserPreferencesState & SystemActions;

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
  wallpaper: '/filesystem/System/Desktop Pictures/Classic.svg',
  pinnedApps: ['finder', 'calculator', 'text-editor'], // Finder always first
  activeMenu: null,
  mobile: INITIAL_MOBILE_STATE,
  bootTime: Date.now(),
  systemVersion: '8.0.0',
  activeTheme: 'classic', // Direct theme ID for immediate UI updates
  accentColor: null, // No custom accent by default (use theme default)
  themeCustomization: {}, // No customizations by default
  isScreensaverActive: false, // Screensaver state
};

// Extended state for user preferences (Phase 6)
interface UserPreferencesState {
  connectedWallet: string | null;
  userPreferences: UserPreferences | null;
  isPreferencesLoaded: boolean;
  isPreferencesSaving: boolean;
  lastSavedAt: number | null;
}

let nextWindowId = 1;
let nextZIndex = 1;

const Z_INDEX_NORMALIZE_THRESHOLD = 1000;

// Debounce helpers
let saveTimeout: NodeJS.Timeout | null = null;
let iconSaveTimeout: NodeJS.Timeout | null = null;
const SAVE_DEBOUNCE_MS = 1000; // 1 second debounce for general preferences
const ICON_SAVE_DEBOUNCE_MS = 300; // 300ms debounce for icon positions (fast but prevents spam)

export const useSystemStore = create<SystemStore>((set, get) => ({
  ...INITIAL_STATE,
  
  // User Preferences State (Phase 6)
  connectedWallet: null,
  userPreferences: null,
  isPreferencesLoaded: false,
  isPreferencesSaving: false,
  lastSavedAt: null,

  // ==================== Window Management ====================
  
  openWindow: (config: WindowConfig) => {
    const windowId = `window-${nextWindowId++}`;
    const zIndex = nextZIndex++;
    
    // Try to restore saved window position (Phase 7)
    const savedPosition = get().restoreWindowPosition(config.appId);
    
    const window: Window = {
      id: windowId,
      appId: config.appId,
      title: config.title,
      position: savedPosition 
        ? { x: savedPosition.x, y: savedPosition.y }
        : config.initialPosition ?? {
            x: 100 + (Object.keys(get().windows).length * 30), // Cascade windows
            y: 100 + (Object.keys(get().windows).length * 30),
          },
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
    // IMMEDIATE update for instant UI feedback
    set({ wallpaper });
    
    // Announce change for accessibility
    eventBus.publish('WALLPAPER_CHANGE', { wallpaper });
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

  // ==================== User Preferences (Phase 6) ====================
  
  setConnectedWallet: (address: string | null) => {
    set({ connectedWallet: address });
  },

  loadUserPreferences: async (walletAddress: string) => {
    try {
      // Fetch preferences from API
      const response = await fetch(`/api/preferences/load?wallet=${walletAddress}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load preferences');
      }

      const { preferences, isFirstTime } = data;

      // Apply preferences to store
      set({
        userPreferences: preferences,
        isPreferencesLoaded: true,
        connectedWallet: walletAddress,
        activeTheme: preferences.theme?.theme_id || 'classic', // IMMEDIATE theme update
      });

      // Apply desktop icon positions if they exist
      if (preferences.desktopIcons && preferences.desktopIcons.length > 0) {
        const currentIcons = get().desktopIcons;
        const updatedIcons = currentIcons.map((icon) => {
          const savedPosition = preferences.desktopIcons.find(
            (saved: any) => saved.icon_id === icon.id
          );
          if (savedPosition) {
            return {
              ...icon,
              position: {
                x: savedPosition.position_x,
                y: savedPosition.position_y,
              },
            };
          }
          return icon;
        });
        set({ desktopIcons: updatedIcons });
      }

      // Apply wallpaper
      if (preferences.theme?.wallpaper_url) {
        set({ wallpaper: preferences.theme.wallpaper_url });
      }

      // Apply pinned apps
      if (preferences.dockPreferences?.pinned_apps) {
        set({ pinnedApps: preferences.dockPreferences.pinned_apps });
      }

      console.log(
        isFirstTime ? 'First-time user - using defaults' : 'Preferences loaded successfully'
      );
    } catch (error) {
      console.error('Error loading user preferences:', error);
      set({
        isPreferencesLoaded: true,
        userPreferences: null,
      });
    }
  },

  saveUserPreferences: () => {
    // Debounced save - cancel previous timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    saveTimeout = setTimeout(async () => {
      // Get fresh state at save time, not at debounce trigger time
      const state = get();
      const { connectedWallet, userPreferences, desktopIcons, wallpaper, pinnedApps } = state;

      if (!connectedWallet) {
        console.log('No wallet connected - skipping save');
        return;
      }

      try {
        set({ isPreferencesSaving: true });

        // Construct preferences object
        const windowStatesArray = Object.entries(state.windows || {}).map(([windowId, window]) => ({
          app_id: window.appId,
          position_x: window.position.x,
          position_y: window.position.y,
          width: window.size.width,
          height: window.size.height,
          is_minimized: window.state === 'minimized',
          is_maximized: window.state === 'maximized',
          z_index: window.zIndex,
        }));
        
        console.log('Saving preferences with windowStates:', {
          windowCount: Object.keys(state.windows || {}).length,
          windowStatesArray,
          isArray: Array.isArray(windowStatesArray),
        });
        
        const preferencesToSave: UserPreferences = {
          desktopIcons: desktopIcons.map((icon) => ({
            icon_id: icon.id,
            position_x: icon.position.x,
            position_y: icon.position.y,
            grid_snap: false, // Free-form positioning
          })),
          theme: userPreferences?.theme || {
            theme_id: 'classic',
            wallpaper_url: wallpaper,
            font_size: 'medium',
            sound_enabled: true,
            animations_enabled: true,
          },
          windowStates: windowStatesArray,
          dockPreferences: userPreferences?.dockPreferences || {
            position: 'bottom',
            size: 'medium',
            pinned_apps: pinnedApps,
            auto_hide: false,
            magnification_enabled: true,
          },
          systemPreferences: userPreferences?.systemPreferences || {
            double_click_speed: 'medium',
            scroll_speed: 'medium',
            menu_blink_enabled: true,
            show_hidden_files: false,
            grid_spacing: 80,
            snap_to_grid: false,
          },
        };

        // Save to API
        const response = await fetch('/api/preferences/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            walletAddress: connectedWallet,
            preferences: preferencesToSave,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to save preferences');
        }

        set({
          isPreferencesSaving: false,
          lastSavedAt: Date.now(),
          userPreferences: preferencesToSave,
        });

        console.log('Preferences saved successfully');
      } catch (error) {
        console.error('Error saving preferences:', error);
        set({ isPreferencesSaving: false });
      }
    }, SAVE_DEBOUNCE_MS);
  },

  saveDesktopIconPositions: () => {
    // Smart debounce - prevent spam during active dragging, but fast enough to feel instant
    if (iconSaveTimeout) {
      clearTimeout(iconSaveTimeout);
    }

    iconSaveTimeout = setTimeout(() => {
      const state = get();
      const { connectedWallet, desktopIcons } = state;

      if (!connectedWallet) return;

      // Fire and forget - don't block UI
      fetch('/api/preferences/icons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: connectedWallet,
          icons: desktopIcons.map((icon) => ({
            icon_id: icon.id,
            position_x: icon.position.x,
            position_y: icon.position.y,
            grid_snap: false,
          })),
        }),
      }).catch((error) => {
        console.error('Error saving icon positions:', error);
      });
    }, ICON_SAVE_DEBOUNCE_MS); // 300ms - feels instant but prevents spam
  },

  updateThemePreference: async (themeId: string, wallpaperUrl?: string) => {
    const state = get();
    const currentTheme = state.userPreferences?.theme;

    const newTheme = {
      ...currentTheme,
      theme_id: themeId,
      wallpaper_url: wallpaperUrl || currentTheme?.wallpaper_url || state.wallpaper,
      font_size: currentTheme?.font_size || 'medium',
      sound_enabled: currentTheme?.sound_enabled ?? true,
      animations_enabled: currentTheme?.animations_enabled ?? true,
    };

    // Update state SYNCHRONOUSLY for immediate UI response
    set((state) => ({
      activeTheme: themeId, // IMMEDIATE update - no waiting for DB
      userPreferences: state.userPreferences
        ? { ...state.userPreferences, theme: newTheme }
        : null,
      wallpaper: newTheme.wallpaper_url,
    }));

    // Save immediately for theme changes (no debounce)
    const { connectedWallet } = get();
    if (connectedWallet) {
      try {
        const response = await fetch('/api/preferences/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: connectedWallet,
            preferences: {
              theme: newTheme,
              desktopIcons: state.desktopIcons.map((icon) => ({
                icon_id: icon.id,
                position_x: icon.position.x,
                position_y: icon.position.y,
                grid_snap: false,
              })),
              windowStates: Object.entries(state.windows || {}).map(([windowId, window]) => ({
                app_id: window.appId,
                position_x: window.position.x,
                position_y: window.position.y,
                width: window.size.width,
                height: window.size.height,
                is_minimized: window.state === 'minimized',
                is_maximized: window.state === 'maximized',
                z_index: window.zIndex,
              })),
              dockPreferences: state.userPreferences?.dockPreferences,
              systemPreferences: state.userPreferences?.systemPreferences,
            },
          }),
        });
        
        if (response.ok) {
          console.log('Theme preference saved immediately');
        }
      } catch (error) {
        console.error('Error saving theme preference:', error);
      }
    }
  },

  resetToDefaults: () => {
    set({
      connectedWallet: null,
      userPreferences: null,
      isPreferencesLoaded: false,
      isPreferencesSaving: false,
      lastSavedAt: null,
      wallpaper: '/filesystem/System/Desktop Pictures/Classic.png',
      pinnedApps: ['finder', 'calculator', 'text-editor'],
      activeTheme: 'classic',
      accentColor: null,
      themeCustomization: {},
    });
  },

  // ==================== Theme Customization (Phase 7.1) ====================
  
  setAccentColor: (color: string | null) => {
    // IMMEDIATE update for instant visual feedback
    set({ accentColor: color });
    
    // Save to database immediately (no debounce for accent color)
    const { connectedWallet, activeTheme, wallpaper } = get();
    if (connectedWallet) {
      // Piggyback on theme save with accent color included
      get().updateThemePreference(activeTheme, wallpaper);
    }
  },
  
  updateThemeCustomization: (customization: Partial<SystemState['themeCustomization']>) => {
    // Merge with existing customization
    set((state) => ({
      themeCustomization: {
        ...state.themeCustomization,
        ...customization,
      },
    }));
    
    // Save to database
    const { connectedWallet } = get();
    if (connectedWallet) {
      get().saveUserPreferences();
    }
  },

  // ==================== Window Position Persistence (Phase 7) ====================
  
  saveWindowPosition: (windowId: string) => {
    const state = get();
    const { connectedWallet, windows } = state;
    const window = windows[windowId];
    
    if (!connectedWallet || !window) return;
    
    // Save this specific window's position (fire and forget)
    fetch('/api/preferences/window', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddress: connectedWallet,
        appId: window.appId,
        position: window.position,
        size: window.size,
        state: window.state,
      }),
    }).catch((error) => {
      console.error('Error saving window position:', error);
    });
  },

  restoreWindowPosition: (appId: string) => {
    const state = get();
    const { userPreferences } = state;
    
    if (!userPreferences?.windowStates) return null;
    
    // Find saved window state for this app
    const savedState = userPreferences.windowStates.find(
      (ws: any) => ws.app_id === appId
    );
    
    if (!savedState || !savedState.position_x || savedState.position_y === undefined) return null;
    
    return {
      x: savedState.position_x,
      y: savedState.position_y,
      width: savedState.width || 600,
      height: savedState.height || 400,
    };
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

