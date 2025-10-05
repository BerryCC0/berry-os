/**
 * Preferences Store
 * Manages all user preferences, customization, and persistence
 * 
 * Separated from systemStore to allow independent scaling of
 * customization features (Dock, Finder, Accessibility, etc.)
 */

import { create } from 'zustand';
import type { UserPreferences } from '../../../app/lib/Persistence/persistence';
import type { SystemState } from '../types/system';

// Import from systemStore for cross-store access
import { useSystemStore } from './systemStore';

interface PreferencesState {
  connectedWallet: string | null;
  userPreferences: UserPreferences | null;
  isPreferencesLoaded: boolean;
  isPreferencesSaving: boolean;
  lastSavedAt: number | null;
}

interface PreferencesActions {
  // Connection
  setConnectedWallet: (address: string | null) => void;
  
  // Loading & Saving
  loadUserPreferences: (walletAddress: string) => Promise<void>;
  saveUserPreferences: () => void;
  saveDesktopIconPositions: () => void;
  
  // Theme Customization
  updateThemePreference: (themeId: string, wallpaperUrl?: string) => Promise<void>;
  setAccentColor: (color: string | null) => void;
  updateThemeCustomization: (customization: Partial<SystemState['themeCustomization']>) => void;
  
  // Window Position Persistence
  saveWindowPosition: (windowId: string) => void;
  restoreWindowPosition: (appId: string) => { x: number; y: number; width: number; height: number } | null;
  
  // Reset
  resetToDefaults: () => void;
}

type PreferencesStore = PreferencesState & PreferencesActions;

// Debounce helpers
let saveTimeout: NodeJS.Timeout | null = null;
let iconSaveTimeout: NodeJS.Timeout | null = null;
const SAVE_DEBOUNCE_MS = 1000; // 1 second debounce for general preferences
const ICON_SAVE_DEBOUNCE_MS = 300; // 300ms debounce for icon positions (fast but prevents spam)

export const usePreferencesStore = create<PreferencesStore>((set, get) => ({
  // ==================== Initial State ====================
  
  connectedWallet: null,
  userPreferences: null,
  isPreferencesLoaded: false,
  isPreferencesSaving: false,
  lastSavedAt: null,

  // ==================== Actions ====================

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

      // Apply preferences to preferences store
      set({
        userPreferences: preferences,
        isPreferencesLoaded: true,
        connectedWallet: walletAddress,
      });

      // Apply preferences to system store (cross-store update)
      const systemStore = useSystemStore.getState();
      
      // Update theme in system store
      systemStore.activeTheme = preferences.theme?.theme_id || 'classic';
      systemStore.accentColor = preferences.theme?.accent_color || null;
      systemStore.themeCustomization = {
        titleBarStyle: preferences.theme?.title_bar_style as any,
        windowOpacity: preferences.theme?.window_opacity,
        cornerStyle: preferences.theme?.corner_style as any,
        menuBarStyle: preferences.theme?.menu_bar_style as any,
        fontSize: preferences.theme?.font_size as any,
      };

      // Apply desktop icon positions if they exist
      if (preferences.desktopIcons && preferences.desktopIcons.length > 0) {
        const currentIcons = systemStore.desktopIcons;
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
        useSystemStore.setState({ desktopIcons: updatedIcons });
      }

      // Apply wallpaper
      if (preferences.theme?.wallpaper_url) {
        useSystemStore.setState({ wallpaper: preferences.theme.wallpaper_url });
      }

      // Apply pinned apps
      if (preferences.dockPreferences?.pinned_apps) {
        useSystemStore.setState({ pinnedApps: preferences.dockPreferences.pinned_apps });
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
      const prefsState = get();
      const { connectedWallet, userPreferences } = prefsState;
      
      // Get system state
      const systemState = useSystemStore.getState();
      const { desktopIcons, wallpaper, pinnedApps, windows } = systemState;

      if (!connectedWallet) {
        console.log('No wallet connected - skipping save');
        return;
      }

      try {
        set({ isPreferencesSaving: true });

        // Construct preferences object
        const windowStatesArray = Object.entries(windows || {}).map(([windowId, window]) => ({
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
          windowCount: Object.keys(windows || {}).length,
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
          theme: {
            theme_id: systemState.activeTheme,
            wallpaper_url: wallpaper,
            accent_color: systemState.accentColor || undefined,
            title_bar_style: systemState.themeCustomization.titleBarStyle,
            window_opacity: systemState.themeCustomization.windowOpacity,
            corner_style: systemState.themeCustomization.cornerStyle,
            menu_bar_style: systemState.themeCustomization.menuBarStyle,
            font_size: systemState.themeCustomization.fontSize || 'medium',
            sound_enabled: userPreferences?.theme?.sound_enabled ?? true,
            animations_enabled: userPreferences?.theme?.animations_enabled ?? true,
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
      const { connectedWallet } = get();
      const { desktopIcons } = useSystemStore.getState();

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
    const prefsState = get();
    const systemState = useSystemStore.getState();
    const currentTheme = prefsState.userPreferences?.theme;

    const newTheme = {
      ...currentTheme,
      theme_id: themeId,
      wallpaper_url: wallpaperUrl || currentTheme?.wallpaper_url || systemState.wallpaper,
      accent_color: systemState.accentColor || currentTheme?.accent_color || undefined,
      title_bar_style: systemState.themeCustomization.titleBarStyle || currentTheme?.title_bar_style,
      window_opacity: systemState.themeCustomization.windowOpacity || currentTheme?.window_opacity || 1.0,
      corner_style: systemState.themeCustomization.cornerStyle || currentTheme?.corner_style,
      menu_bar_style: systemState.themeCustomization.menuBarStyle || currentTheme?.menu_bar_style,
      font_size: systemState.themeCustomization.fontSize || currentTheme?.font_size || 'medium',
      sound_enabled: currentTheme?.sound_enabled ?? true,
      animations_enabled: currentTheme?.animations_enabled ?? true,
    };

    // Update preferences store
    set((state) => ({
      userPreferences: state.userPreferences
        ? { ...state.userPreferences, theme: newTheme }
        : null,
    }));

    // Update system store SYNCHRONOUSLY for immediate UI response
    useSystemStore.setState({
      activeTheme: themeId, // IMMEDIATE update - no waiting for DB
      wallpaper: newTheme.wallpaper_url,
    });

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
              desktopIcons: systemState.desktopIcons.map((icon) => ({
                icon_id: icon.id,
                position_x: icon.position.x,
                position_y: icon.position.y,
                grid_snap: false,
              })),
              windowStates: Object.entries(systemState.windows || {}).map(([windowId, window]) => ({
                app_id: window.appId,
                position_x: window.position.x,
                position_y: window.position.y,
                width: window.size.width,
                height: window.size.height,
                is_minimized: window.state === 'minimized',
                is_maximized: window.state === 'maximized',
                z_index: window.zIndex,
              })),
              dockPreferences: prefsState.userPreferences?.dockPreferences,
              systemPreferences: prefsState.userPreferences?.systemPreferences,
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

  setAccentColor: (color: string | null) => {
    // Update system store IMMEDIATELY for instant visual feedback
    useSystemStore.setState({ accentColor: color });
    
    // Save to database immediately (no debounce for accent color)
    const { connectedWallet } = get();
    if (connectedWallet) {
      // Trigger immediate save with all current theme settings
      get().saveUserPreferences();
    }
  },
  
  updateThemeCustomization: (customization: Partial<SystemState['themeCustomization']>) => {
    const systemState = useSystemStore.getState();
    
    // Merge with existing customization in system store
    useSystemStore.setState({
      themeCustomization: {
        ...systemState.themeCustomization,
        ...customization,
      },
    });
    
    // Save to database
    const { connectedWallet } = get();
    if (connectedWallet) {
      get().saveUserPreferences();
    }
  },

  saveWindowPosition: (windowId: string) => {
    const { connectedWallet } = get();
    const { windows } = useSystemStore.getState();
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
    const { userPreferences } = get();
    
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

  resetToDefaults: () => {
    // Reset preferences store
    set({
      connectedWallet: null,
      userPreferences: null,
      isPreferencesLoaded: false,
      isPreferencesSaving: false,
      lastSavedAt: null,
    });
    
    // Reset system store to defaults
    useSystemStore.setState({
      wallpaper: '/filesystem/System/Desktop Pictures/Classic.png',
      pinnedApps: ['finder', 'calculator', 'text-editor'],
      activeTheme: 'classic',
      accentColor: null,
      themeCustomization: {},
    });
  },
}));

