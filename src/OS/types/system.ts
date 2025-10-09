/**
 * System-level Types
 * Core System 7 Toolbox types
 */

import type { Window } from './window';
import type { Theme } from './theme';

export type AppCategory = 'system' | 'utility' | 'web3' | 'media' | 'productivity';

export type MobileSupport = 'full' | 'limited' | 'desktop-only';

export type MobileLayout = 'fullscreen' | 'bottom-sheet' | 'modal';

export interface MenuItem {
  label?: string;
  action?: string;
  shortcut?: string;
  divider?: boolean;
  disabled?: boolean;
  submenu?: MenuItem[];
}

export interface AppMenus {
  [menuName: string]: MenuItem[];
}

export interface AppConfig {
  id: string;
  name: string;
  component: React.ComponentType<{ windowId: string }>;
  icon: string;
  defaultWindowSize: { width: number; height: number };
  minWindowSize?: { width: number; height: number };
  maxWindowSize?: { width: number; height: number };
  resizable: boolean;
  web3Required?: boolean;
  mobileSupport: MobileSupport;
  mobileLayout?: MobileLayout;
  category: AppCategory;
  description: string;
  version: string;
  showOnDesktop?: boolean; // Show as desktop icon (default: false)
  menus?: AppMenus; // Custom menus for this app
}

export interface RunningApp {
  id: string;
  config: AppConfig;
  windows: string[]; // Window IDs
  state: 'running' | 'suspended' | 'crashed';
  launchedAt: number;
}

export interface DesktopIcon {
  id: string;
  name: string;
  icon: string;
  type: 'app' | 'folder' | 'file';
  position: { x: number; y: number };
  appId?: string;
  path?: string;
}

export interface SystemPreferences {
  wallpaper: string;
  theme: 'classic' | 'platinum';
  iconArrangement: 'grid' | 'free';
  desktopIcons: DesktopIcon[];
}

export interface MobileState {
  activeAppId: string | null;
  appHistory: string[];
  dockApps: string[];
  isDockVisible: boolean;
  isMenuOpen: boolean;
}

export interface DesktopPreferences {
  gridSpacing: number;         // 60-120px, default 80
  snapToGrid: boolean;         // default false (free-form)
  showHiddenFiles: boolean;    // default false
  doubleClickSpeed: 'slow' | 'medium' | 'fast'; // default 'medium'
}

export interface DockPreferences {
  position: 'bottom' | 'left' | 'right' | 'hidden'; // default 'bottom'
  size: 'small' | 'medium' | 'large';    // default 'medium'
  pinnedApps: string[];                  // default ['finder', ...]
  autoHide: boolean;                     // default false
  magnificationEnabled: boolean;         // default true
  magnificationScale: number;            // 1.0-2.0, default 1.5
}

export interface SystemState {
  // Window Management
  windows: Record<string, Window>;
  activeWindowId: string | null;
  
  // Process Management
  runningApps: Record<string, RunningApp>;
  
  // Desktop Management
  desktopIcons: DesktopIcon[];
  wallpaper: string;
  desktopPreferences: DesktopPreferences; // Desktop behavior preferences
  
  // Dock
  pinnedApps: string[]; // App IDs pinned to dock (deprecated - use dockPreferences.pinnedApps)
  dockPreferences: DockPreferences; // Dock configuration
  
  // Menu Bar
  activeMenu: string | null;
  
  // Mobile State
  mobile: MobileState;
  
  // System Info
  bootTime: number;
  systemVersion: string;
  
  // Theme (Phase 6.5)
  activeTheme: string; // Direct theme ID for immediate synchronous UI updates
  customTheme: Theme | null; // Custom theme being edited (overrides activeTheme when set)
  
  // Theme Customization (Phase 7.1, Phase 8)
  accentColor: string | null; // Current accent color (Nouns palette or custom)
  themeCustomization: import('./theme').ThemeCustomization; // Full theme customization from Phase 8
  
  // Window Restoration
  restoreWindowsOnStartup: boolean; // default false
  
  // System Actions (QoL)
  isScreensaverActive: boolean;
}

