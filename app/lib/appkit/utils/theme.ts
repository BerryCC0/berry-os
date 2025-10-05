/**
 * Reown AppKit - Theme Business Logic
 * Pure functions for theme management (no React dependencies)
 */

import type { ThemeMode, ThemeConfig, ThemeVariables } from './types';

/**
 * Get theme mode from system preference
 */
export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches 
    ? 'dark' 
    : 'light';
}

/**
 * Resolve theme mode (handle 'system')
 */
export function resolveThemeMode(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    return getSystemTheme();
  }
  return mode;
}

/**
 * Check if theme is dark
 */
export function isDarkTheme(mode: ThemeMode): boolean {
  return resolveThemeMode(mode) === 'dark';
}

/**
 * Check if theme is light
 */
export function isLightTheme(mode: ThemeMode): boolean {
  return resolveThemeMode(mode) === 'light';
}

/**
 * Toggle theme mode
 */
export function toggleThemeMode(currentMode: 'light' | 'dark'): 'light' | 'dark' {
  return currentMode === 'light' ? 'dark' : 'light';
}

/**
 * Create theme config
 */
export function createThemeConfig(
  mode: ThemeMode,
  variables?: ThemeVariables
): ThemeConfig {
  return {
    themeMode: mode,
    themeVariables: variables,
  };
}

/**
 * Merge theme variables
 */
export function mergeThemeVariables(
  base: ThemeVariables,
  override: ThemeVariables
): ThemeVariables {
  return {
    ...base,
    ...override,
  };
}

/**
 * Get default theme variables for Mac OS 8
 */
export function getMacOS8ThemeVariables(): ThemeVariables {
  return {
    '--w3m-font-family': "'Geneva', 'Helvetica', sans-serif",
    '--w3m-accent': '#000000',
    '--w3m-color-mix': '#DDDDDD',
    '--w3m-color-mix-strength': 20,
    '--w3m-border-radius-master': '0px', // Sharp corners
  };
}

/**
 * Get default theme variables for light mode
 */
export function getLightThemeVariables(): ThemeVariables {
  return {
    '--w3m-accent': '#3396FF',
    '--w3m-color-mix': '#FFFFFF',
    '--w3m-color-mix-strength': 0,
    '--w3m-border-radius-master': '8px',
  };
}

/**
 * Get default theme variables for dark mode
 */
export function getDarkThemeVariables(): ThemeVariables {
  return {
    '--w3m-accent': '#3396FF',
    '--w3m-color-mix': '#000000',
    '--w3m-color-mix-strength': 0,
    '--w3m-border-radius-master': '8px',
  };
}

/**
 * Apply theme variables to CSS
 */
export function applyThemeVariables(variables: ThemeVariables): void {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  Object.entries(variables).forEach(([key, value]) => {
    if (value !== undefined) {
      root.style.setProperty(key, String(value));
    }
  });
}

/**
 * Remove theme variables from CSS
 */
export function removeThemeVariables(variables: ThemeVariables): void {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  Object.keys(variables).forEach(key => {
    root.style.removeProperty(key);
  });
}

/**
 * Parse hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
}

/**
 * Parse RGB to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Lighten color
 */
export function lightenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const amount = Math.round(2.55 * percent);
  const r = Math.min(255, rgb.r + amount);
  const g = Math.min(255, rgb.g + amount);
  const b = Math.min(255, rgb.b + amount);
  
  return rgbToHex(r, g, b);
}

/**
 * Darken color
 */
export function darkenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const amount = Math.round(2.55 * percent);
  const r = Math.max(0, rgb.r - amount);
  const g = Math.max(0, rgb.g - amount);
  const b = Math.max(0, rgb.b - amount);
  
  return rgbToHex(r, g, b);
}

/**
 * Get contrast color (black or white)
 */
export function getContrastColor(hex: string): '#000000' | '#FFFFFF' {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#000000';
  
  // Calculate relative luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Validate hex color
 */
export function isValidHexColor(hex: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}

/**
 * Validate theme variable name
 */
export function isValidThemeVariable(name: string): boolean {
  return name.startsWith('--w3m-') || name.startsWith('--');
}

/**
 * Get all theme variable names
 */
export function getThemeVariableNames(): string[] {
  return [
    '--w3m-font-family',
    '--w3m-accent',
    '--w3m-color-mix',
    '--w3m-color-mix-strength',
    '--w3m-border-radius-master',
  ];
}

/**
 * Extract theme variables from element
 */
export function extractThemeVariables(element?: HTMLElement): ThemeVariables {
  if (typeof document === 'undefined') return {};
  
  const root = element || document.documentElement;
  const computed = getComputedStyle(root);
  const variables: ThemeVariables = {};
  
  getThemeVariableNames().forEach(name => {
    const value = computed.getPropertyValue(name).trim();
    if (value) {
      const numValue = parseFloat(value);
      variables[name] = isNaN(numValue) ? value : numValue;
    }
  });
  
  return variables;
}

/**
 * Serialize theme config for storage
 */
export function serializeThemeConfig(config: ThemeConfig): string {
  return JSON.stringify(config);
}

/**
 * Deserialize theme config from storage
 */
export function deserializeThemeConfig(serialized: string): ThemeConfig | null {
  try {
    const config = JSON.parse(serialized);
    if (!config.themeMode) return null;
    return config;
  } catch {
    return null;
  }
}

/**
 * Save theme config to localStorage
 */
export function saveThemeConfig(config: ThemeConfig): void {
  if (typeof localStorage === 'undefined') return;
  
  try {
    localStorage.setItem('appkit-theme', serializeThemeConfig(config));
  } catch (error) {
    console.error('Failed to save theme config:', error);
  }
}

/**
 * Load theme config from localStorage
 */
export function loadThemeConfig(): ThemeConfig | null {
  if (typeof localStorage === 'undefined') return null;
  
  try {
    const serialized = localStorage.getItem('appkit-theme');
    if (!serialized) return null;
    return deserializeThemeConfig(serialized);
  } catch (error) {
    console.error('Failed to load theme config:', error);
    return null;
  }
}

/**
 * Clear saved theme config
 */
export function clearThemeConfig(): void {
  if (typeof localStorage === 'undefined') return;
  
  try {
    localStorage.removeItem('appkit-theme');
  } catch (error) {
    console.error('Failed to clear theme config:', error);
  }
}

/**
 * Listen to system theme changes
 */
export function watchSystemTheme(callback: (theme: 'light' | 'dark') => void): () => void {
  if (typeof window === 'undefined') return () => {};
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handler = (e: MediaQueryListEvent) => {
    callback(e.matches ? 'dark' : 'light');
  };
  
  mediaQuery.addEventListener('change', handler);
  
  return () => mediaQuery.removeEventListener('change', handler);
}

/**
 * Create theme preset
 */
export interface ThemePreset {
  name: string;
  mode: ThemeMode;
  variables: ThemeVariables;
}

/**
 * Get Mac OS 8 theme preset
 */
export function getMacOS8Preset(): ThemePreset {
  return {
    name: 'Mac OS 8',
    mode: 'light',
    variables: getMacOS8ThemeVariables(),
  };
}

/**
 * Get modern light theme preset
 */
export function getModernLightPreset(): ThemePreset {
  return {
    name: 'Modern Light',
    mode: 'light',
    variables: getLightThemeVariables(),
  };
}

/**
 * Get modern dark theme preset
 */
export function getModernDarkPreset(): ThemePreset {
  return {
    name: 'Modern Dark',
    mode: 'dark',
    variables: getDarkThemeVariables(),
  };
}

/**
 * Get all theme presets
 */
export function getAllThemePresets(): ThemePreset[] {
  return [
    getMacOS8Preset(),
    getModernLightPreset(),
    getModernDarkPreset(),
  ];
}

/**
 * Apply theme preset
 */
export function applyThemePreset(preset: ThemePreset): void {
  applyThemeVariables(preset.variables);
}

