/**
 * Persistence Layer - Pure TypeScript Business Logic
 * Handles loading/saving user preferences from Neon Postgres
 * 
 * NO React dependencies - just pure TypeScript functions
 */

import { neon } from '@neondatabase/serverless';

// Only run on server-side
const sql = process.env.DATABASE_URL 
  ? neon(process.env.DATABASE_URL) 
  : null;

// ==================== Types ====================

export interface DesktopIconPosition {
  icon_id: string;
  position_x: number;
  position_y: number;
  grid_snap: boolean;
}

export interface ThemePreferences {
  theme_id: string;
  wallpaper_url: string;
  accent_color?: string;
  title_bar_style?: string; // 'pinstripe', 'gradient', 'solid'
  window_opacity?: number;  // 0.85 - 1.0
  corner_style?: string;    // 'sharp', 'rounded'
  menu_bar_style?: string;  // 'opaque', 'translucent'
  font_size: string;
  scrollbar_width?: string; // 'thin', 'normal', 'thick'
  scrollbar_arrow_style?: string; // 'classic', 'modern', 'none'
  scrollbar_auto_hide?: boolean; // Auto-hide scrollbars
  // Font preferences (Phase 8)
  font_family_system?: string;
  font_family_interface?: string;
  font_family_custom_system?: string;
  font_family_custom_interface?: string;
  sound_enabled: boolean;
  animations_enabled: boolean;
}

export interface WindowState {
  app_id: string;
  position_x?: number;
  position_y?: number;
  width?: number;
  height?: number;
  is_minimized: boolean;
  is_maximized: boolean;
  z_index?: number;
}

export interface DockPreferences {
  position: string;
  size: number;
  pinned_apps: string[];
  auto_hide: boolean;
}

export interface SystemPreferences {
  double_click_speed: string;
  scroll_speed: string;
  menu_blink_enabled: boolean;
  show_hidden_files: boolean;
  grid_spacing: number;
  snap_to_grid: boolean;
}

export interface UserPreferences {
  desktopIcons: DesktopIconPosition[];
  theme: ThemePreferences;
  windowStates: WindowState[];
  dockPreferences: DockPreferences;
  systemPreferences: SystemPreferences;
}

// ==================== User Management ====================

/**
 * Create or update user record
 */
export async function upsertUser(
  walletAddress: string,
  chainId: number
): Promise<void> {
  if (!sql) throw new Error('Database not configured');

  await sql`
    INSERT INTO users (wallet_address, chain_id, last_login, last_chain_id)
    VALUES (${walletAddress}, ${chainId}, NOW(), ${chainId})
    ON CONFLICT (wallet_address)
    DO UPDATE SET 
      last_login = NOW(),
      last_chain_id = ${chainId}
  `;
}

/**
 * Update last login timestamp
 */
export async function updateLastLogin(
  walletAddress: string,
  chainId: number
): Promise<void> {
  if (!sql) throw new Error('Database not configured');

  await sql`
    UPDATE users 
    SET last_login = NOW(), last_chain_id = ${chainId}
    WHERE wallet_address = ${walletAddress}
  `;
}

// ==================== Load Preferences ====================

/**
 * Load all preferences for a wallet
 * Returns null if user doesn't exist (first-time user)
 */
export async function loadUserPreferences(
  walletAddress: string
): Promise<UserPreferences | null> {
  if (!sql) throw new Error('Database not configured');

  // Check if user exists
  const userResult = await sql`
    SELECT * FROM users WHERE wallet_address = ${walletAddress}
  `;

  if (userResult.length === 0) {
    return null; // First-time user
  }

  // Load desktop icons
  const desktopIconsResult = await sql`
    SELECT icon_id, position_x, position_y, grid_snap
    FROM desktop_icons
    WHERE wallet_address = ${walletAddress}
    ORDER BY updated_at ASC
  `;

  // Load theme preferences
  const themeResult = await sql`
    SELECT theme_id, wallpaper_url, accent_color, title_bar_style, window_opacity, 
           corner_style, menu_bar_style, font_size, scrollbar_width, scrollbar_arrow_style, scrollbar_auto_hide,
           font_family_system, font_family_interface, font_family_custom_system, font_family_custom_interface,
           sound_enabled, animations_enabled
    FROM theme_preferences
    WHERE wallet_address = ${walletAddress}
  `;

  // Load window states
  const windowStatesResult = await sql`
    SELECT app_id, position_x, position_y, width, height, is_minimized, is_maximized, z_index
    FROM window_states
    WHERE wallet_address = ${walletAddress}
  `;

  // Load dock preferences
  const dockResult = await sql`
    SELECT position, size, pinned_apps, auto_hide
    FROM dock_preferences
    WHERE wallet_address = ${walletAddress}
  `;

  // Load system preferences
  const systemResult = await sql`
    SELECT double_click_speed, scroll_speed, menu_blink_enabled, show_hidden_files, grid_spacing, snap_to_grid
    FROM system_preferences
    WHERE wallet_address = ${walletAddress}
  `;

  // Helper to convert DB row to ThemePreferences
  const parseTheme = (row: any): ThemePreferences => ({
    theme_id: row.theme_id,
    wallpaper_url: row.wallpaper_url,
    accent_color: row.accent_color,
    title_bar_style: row.title_bar_style,
    window_opacity: row.window_opacity ? parseFloat(row.window_opacity) : undefined,
    corner_style: row.corner_style,
    menu_bar_style: row.menu_bar_style,
    font_size: row.font_size,
    scrollbar_width: row.scrollbar_width,
    scrollbar_arrow_style: row.scrollbar_arrow_style,
    scrollbar_auto_hide: row.scrollbar_auto_hide,
    font_family_system: row.font_family_system,
    font_family_interface: row.font_family_interface,
    font_family_custom_system: row.font_family_custom_system,
    font_family_custom_interface: row.font_family_custom_interface,
    sound_enabled: row.sound_enabled,
    animations_enabled: row.animations_enabled,
  });

  // Helper to convert DB row to DockPreferences
  const parseDock = (row: any): DockPreferences => ({
    position: row.position,
    size: row.size,
    pinned_apps: row.pinned_apps,
    auto_hide: row.auto_hide,
  });

  // Helper to convert DB row to SystemPreferences
  const parseSystem = (row: any): SystemPreferences => ({
    double_click_speed: row.double_click_speed,
    scroll_speed: row.scroll_speed,
    menu_blink_enabled: row.menu_blink_enabled,
    show_hidden_files: row.show_hidden_files,
    grid_spacing: row.grid_spacing,
    snap_to_grid: row.snap_to_grid,
  });

  // Return combined preferences (with defaults if not set)
  return {
    desktopIcons: desktopIconsResult.map((row: any) => ({
      icon_id: row.icon_id,
      position_x: row.position_x,
      position_y: row.position_y,
      grid_snap: row.grid_snap,
    })),
    theme: themeResult[0] ? parseTheme(themeResult[0]) : getDefaultThemePreferences(),
    windowStates: windowStatesResult.map((row: any) => ({
      app_id: row.app_id,
      position_x: row.position_x,
      position_y: row.position_y,
      width: row.width,
      height: row.height,
      is_minimized: row.is_minimized,
      is_maximized: row.is_maximized,
      z_index: row.z_index,
    })),
    dockPreferences: dockResult[0] ? parseDock(dockResult[0]) : getDefaultDockPreferences(),
    systemPreferences: systemResult[0] ? parseSystem(systemResult[0]) : getDefaultSystemPreferences(),
  };
}

// ==================== Save Preferences ====================

/**
 * Save desktop icon positions (upsert)
 */
export async function saveDesktopIcons(
  walletAddress: string,
  icons: DesktopIconPosition[]
): Promise<void> {
  if (!sql) throw new Error('Database not configured');

  // Ensure user exists
  await upsertUser(walletAddress, 1); // Default chain ID

  // Upsert icon positions (insert or update on conflict)
  if (icons.length > 0) {
    for (const icon of icons) {
      await sql`
        INSERT INTO desktop_icons (wallet_address, icon_id, position_x, position_y, grid_snap)
        VALUES (${walletAddress}, ${icon.icon_id}, ${icon.position_x}, ${icon.position_y}, ${icon.grid_snap})
        ON CONFLICT (wallet_address, icon_id)
        DO UPDATE SET
          position_x = EXCLUDED.position_x,
          position_y = EXCLUDED.position_y,
          grid_snap = EXCLUDED.grid_snap,
          updated_at = NOW()
      `;
    }
  }
}

/**
 * Save theme preferences (upsert)
 */
export async function saveThemePreferences(
  walletAddress: string,
  theme: ThemePreferences
): Promise<void> {
  if (!sql) throw new Error('Database not configured');

  // Ensure user exists
  await upsertUser(walletAddress, 1);

  await sql`
    INSERT INTO theme_preferences (
      wallet_address, theme_id, wallpaper_url, accent_color, title_bar_style,
      window_opacity, corner_style, menu_bar_style, font_size,
      scrollbar_width, scrollbar_arrow_style, scrollbar_auto_hide,
      font_family_system, font_family_interface, font_family_custom_system, font_family_custom_interface,
      sound_enabled, animations_enabled
    )
    VALUES (
      ${walletAddress}, ${theme.theme_id}, ${theme.wallpaper_url}, ${theme.accent_color || null},
      ${theme.title_bar_style || 'pinstripe'}, ${theme.window_opacity || 1.0}, 
      ${theme.corner_style || 'sharp'}, ${theme.menu_bar_style || 'opaque'},
      ${theme.font_size},
      ${theme.scrollbar_width || 'normal'}, ${theme.scrollbar_arrow_style || 'classic'}, ${theme.scrollbar_auto_hide || false},
      ${theme.font_family_system || 'Chicago'}, ${theme.font_family_interface || 'Geneva'}, 
      ${theme.font_family_custom_system || null}, ${theme.font_family_custom_interface || null},
      ${theme.sound_enabled}, ${theme.animations_enabled}
    )
    ON CONFLICT (wallet_address)
    DO UPDATE SET
      theme_id = EXCLUDED.theme_id,
      wallpaper_url = EXCLUDED.wallpaper_url,
      accent_color = EXCLUDED.accent_color,
      title_bar_style = EXCLUDED.title_bar_style,
      window_opacity = EXCLUDED.window_opacity,
      corner_style = EXCLUDED.corner_style,
      menu_bar_style = EXCLUDED.menu_bar_style,
      font_size = EXCLUDED.font_size,
      scrollbar_width = EXCLUDED.scrollbar_width,
      scrollbar_arrow_style = EXCLUDED.scrollbar_arrow_style,
      scrollbar_auto_hide = EXCLUDED.scrollbar_auto_hide,
      font_family_system = EXCLUDED.font_family_system,
      font_family_interface = EXCLUDED.font_family_interface,
      font_family_custom_system = EXCLUDED.font_family_custom_system,
      font_family_custom_interface = EXCLUDED.font_family_custom_interface,
      sound_enabled = EXCLUDED.sound_enabled,
      animations_enabled = EXCLUDED.animations_enabled,
      updated_at = NOW()
  `;
}

/**
 * Save window state for an app (upsert)
 */
export async function saveWindowState(
  walletAddress: string,
  windowState: WindowState
): Promise<void> {
  if (!sql) throw new Error('Database not configured');

  // Ensure user exists
  await upsertUser(walletAddress, 1);

  await sql`
    INSERT INTO window_states (
      wallet_address, app_id, position_x, position_y, width, height,
      is_minimized, is_maximized, z_index
    )
    VALUES (
      ${walletAddress}, ${windowState.app_id}, ${windowState.position_x || null},
      ${windowState.position_y || null}, ${windowState.width || null}, ${windowState.height || null},
      ${windowState.is_minimized}, ${windowState.is_maximized}, ${windowState.z_index || null}
    )
    ON CONFLICT (wallet_address, app_id)
    DO UPDATE SET
      position_x = EXCLUDED.position_x,
      position_y = EXCLUDED.position_y,
      width = EXCLUDED.width,
      height = EXCLUDED.height,
      is_minimized = EXCLUDED.is_minimized,
      is_maximized = EXCLUDED.is_maximized,
      z_index = EXCLUDED.z_index,
      updated_at = NOW()
  `;
}

/**
 * Save dock preferences (upsert)
 */
export async function saveDockPreferences(
  walletAddress: string,
  dock: DockPreferences
): Promise<void> {
  if (!sql) throw new Error('Database not configured');

  // Ensure user exists
  await upsertUser(walletAddress, 1);

  await sql`
    INSERT INTO dock_preferences (
      wallet_address, position, size, pinned_apps, auto_hide
    )
    VALUES (
      ${walletAddress}, ${dock.position}, ${dock.size}, ${dock.pinned_apps},
      ${dock.auto_hide}
    )
    ON CONFLICT (wallet_address)
    DO UPDATE SET
      position = EXCLUDED.position,
      size = EXCLUDED.size,
      pinned_apps = EXCLUDED.pinned_apps,
      auto_hide = EXCLUDED.auto_hide,
      updated_at = NOW()
  `;
}

/**
 * Save system preferences (upsert)
 */
export async function saveSystemPreferences(
  walletAddress: string,
  prefs: SystemPreferences
): Promise<void> {
  if (!sql) throw new Error('Database not configured');

  // Ensure user exists
  await upsertUser(walletAddress, 1);

  await sql`
    INSERT INTO system_preferences (
      wallet_address, double_click_speed, scroll_speed, menu_blink_enabled,
      show_hidden_files, grid_spacing, snap_to_grid
    )
    VALUES (
      ${walletAddress}, ${prefs.double_click_speed}, ${prefs.scroll_speed},
      ${prefs.menu_blink_enabled}, ${prefs.show_hidden_files}, ${prefs.grid_spacing}, ${prefs.snap_to_grid}
    )
    ON CONFLICT (wallet_address)
    DO UPDATE SET
      double_click_speed = EXCLUDED.double_click_speed,
      scroll_speed = EXCLUDED.scroll_speed,
      menu_blink_enabled = EXCLUDED.menu_blink_enabled,
      show_hidden_files = EXCLUDED.show_hidden_files,
      grid_spacing = EXCLUDED.grid_spacing,
      snap_to_grid = EXCLUDED.snap_to_grid,
      updated_at = NOW()
  `;
}

/**
 * Batch save all preferences (atomic transaction)
 */
export async function saveAllPreferences(
  walletAddress: string,
  preferences: UserPreferences
): Promise<void> {
  if (!sql) throw new Error('Database not configured');

  // Save each category
  await saveDesktopIcons(walletAddress, preferences.desktopIcons);
  await saveThemePreferences(walletAddress, preferences.theme);
  await saveDockPreferences(walletAddress, preferences.dockPreferences);
  await saveSystemPreferences(walletAddress, preferences.systemPreferences);

  // Save window states (defensive check for array)
  if (Array.isArray(preferences.windowStates)) {
    for (const windowState of preferences.windowStates) {
      await saveWindowState(walletAddress, windowState);
    }
  } else {
    console.warn('windowStates is not an array:', typeof preferences.windowStates, preferences.windowStates);
  }
}

// ==================== Default Preferences ====================

export function getDefaultThemePreferences(): ThemePreferences {
  // Detect system color scheme preference
  // If on server-side, default to 'classic'
  let defaultTheme = 'classic';
  
  if (typeof window !== 'undefined') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    defaultTheme = prefersDark ? 'darkMode' : 'classic';
  }
  
  return {
    theme_id: defaultTheme,
    wallpaper_url: '/filesystem/System/Desktop Pictures/Classic.svg',
    font_size: 'medium',
    sound_enabled: true,
    animations_enabled: true,
  };
}

export function getDefaultDockPreferences(): DockPreferences {
  return {
    position: 'bottom',
    size: 64,
    pinned_apps: ['finder', 'calculator', 'text-editor'],
    auto_hide: false,
  };
}

export function getDefaultSystemPreferences(): SystemPreferences {
  return {
    double_click_speed: 'medium',
    scroll_speed: 'medium',
    menu_blink_enabled: true,
    show_hidden_files: false,
    grid_spacing: 80,
    snap_to_grid: false,
  };
}

export function getDefaultUserPreferences(): UserPreferences {
  return {
    desktopIcons: [],
    theme: getDefaultThemePreferences(),
    windowStates: [],
    dockPreferences: getDefaultDockPreferences(),
    systemPreferences: getDefaultSystemPreferences(),
  };
}

