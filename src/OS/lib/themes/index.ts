/**
 * Theme System - Central Export
 * Phase 8A: Modular theme architecture
 * 
 * All built-in themes exported from individual files for better maintainability
 */

import type { Theme } from '../../types/theme';

// Import built-in themes
import { CLASSIC_THEME } from './built-in/classic';
import { PLATINUM_THEME } from './built-in/platinum';
import { DARK_THEME } from './built-in/dark';
import { NOUNISH_THEME } from './built-in/nounish';
import { TANGERINE_THEME } from './built-in/tangerine';
import { BERRY_THEME } from './built-in/berry';
import { MIDNIGHT_THEME } from './built-in/midnight';
import { JADE_THEME } from './built-in/jade';
import { SUNSET_THEME } from './built-in/sunset';

// Export individual themes
export { CLASSIC_THEME, PLATINUM_THEME, DARK_THEME, NOUNISH_THEME, TANGERINE_THEME };
export { BERRY_THEME, MIDNIGHT_THEME, JADE_THEME, SUNSET_THEME };

// Theme Registry - All built-in themes (9 total)
export const BUILT_IN_THEMES: Record<string, Theme> = {
  classic: CLASSIC_THEME,
  platinum: PLATINUM_THEME,
  dark: DARK_THEME,
  nounish: NOUNISH_THEME,
  tangerine: TANGERINE_THEME,
  berry: BERRY_THEME,
  midnight: MIDNIGHT_THEME,
  jade: JADE_THEME,
  sunset: SUNSET_THEME,
} as const;

// Default theme
export const DEFAULT_THEME = CLASSIC_THEME;

// Helper function to get theme by ID
export function getThemeById(id: string): Theme {
  return BUILT_IN_THEMES[id] || DEFAULT_THEME;
}

// Helper function to get all theme IDs
export function getAllThemeIds(): string[] {
  return Object.keys(BUILT_IN_THEMES);
}

// Helper function to get all themes as array
export function getAllThemes(): Theme[] {
  return Object.values(BUILT_IN_THEMES);
}

