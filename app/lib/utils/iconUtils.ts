/**
 * Icon Utilities
 * Standardized system for app icons
 */

/**
 * Icon format types supported
 */
export type IconFormat = 'png' | 'svg' | 'ico';

/**
 * Icon size presets (for PNG/ICO)
 */
export type IconSize = '16' | '32' | '48' | '64' | '128' | '256';

/**
 * Get the path to an app icon
 * Icons should be stored in /public/icons/apps/
 * 
 * Naming convention:
 * - PNG/ICO: {appId}-{size}.{ext} (e.g., "calculator-32.png")
 * - SVG: {appId}.svg (e.g., "calculator.svg")
 * 
 * @param appId - The unique app identifier
 * @param format - Icon format (png, svg, ico)
 * @param size - Icon size (only for png/ico)
 * @returns Path to the icon file
 */
export function getAppIconPath(
  appId: string,
  format: IconFormat = 'svg',
  size: IconSize = '32'
): string {
  const basePath = '/icons/apps';
  
  if (format === 'svg') {
    return `${basePath}/${appId}.svg`;
  }
  
  return `${basePath}/${appId}-${size}.${format}`;
}

/**
 * Get icon path with fallback logic
 * Tries SVG first, then PNG, then returns placeholder
 * 
 * @param appId - The unique app identifier
 * @returns Icon path with fallback
 */
export function getAppIconWithFallback(appId: string): string {
  // In production, you might want to check if files exist
  // For now, we'll standardize on SVG as primary format
  return getAppIconPath(appId, 'svg');
}

/**
 * System icon paths (non-app icons)
 */
export const SYSTEM_ICONS = {
  folder: '/icons/system/folder.svg',
  file: '/icons/system/file.svg',
  trash: '/icons/system/trash.svg',
  trashFull: '/icons/system/trash-full.svg',
  computer: '/icons/system/computer.svg',
  disk: '/icons/system/disk.svg',
  network: '/icons/system/network.svg',
} as const;

/**
 * Placeholder icon for missing app icons
 */
export const PLACEHOLDER_ICON = '/icons/system/placeholder.svg';

/**
 * Validate icon exists (client-side check)
 * Returns true if icon loads successfully
 */
export async function validateIcon(iconPath: string): Promise<boolean> {
  try {
    const response = await fetch(iconPath, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get dynamic app icon from system store, with fallback to static icon
 * Used by UI components to access live-updating icons
 * 
 * @param appId - The unique app identifier
 * @param dynamicIcons - Dynamic icon map from system store
 * @param staticIcon - Fallback static icon path
 * @returns Icon path or data URL
 */
export function getAppIcon(
  appId: string,
  dynamicIcons: Record<string, string>,
  staticIcon: string
): string {
  // Check for dynamic icon first
  const dynamicIcon = dynamicIcons[appId];
  if (dynamicIcon) {
    return dynamicIcon;
  }
  
  // Fallback to static icon
  return staticIcon;
}

