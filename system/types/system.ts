/**
 * System-level Types
 * Core System 7 Toolbox types
 */

import type { Window } from './window';

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

export interface SystemState {
  // Window Management
  windows: Record<string, Window>;
  activeWindowId: string | null;
  
  // Process Management
  runningApps: Record<string, RunningApp>;
  
  // Desktop Management
  desktopIcons: DesktopIcon[];
  wallpaper: string;
  
  // Dock
  pinnedApps: string[]; // App IDs pinned to dock
  
  // Menu Bar
  activeMenu: string | null;
  
  // Mobile State
  mobile: MobileState;
  
  // System Info
  bootTime: number;
  systemVersion: string;
}

