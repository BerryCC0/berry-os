/**
 * Nouns-Themed Customization System
 * Uses official Nouns color palette for authentic themes
 * Phase 7: Power User Features
 */

import { ImageData } from '../../../app/lib/Nouns/utils/image-data';

// Extract Nouns official colors
const NOUNS_PALETTE = ImageData.palette;
const NOUNS_BG_COLORS = ImageData.bgcolors;

/**
 * Nouns Accent Colors
 * Hand-picked from the official Nouns palette for UI accents
 */
export const NOUNS_ACCENT_COLORS = {
  // Primary Nouns colors
  nounsRed: '#d22209',        // Classic Nouns red
  nounsBlue: '#2a86fd',       // Nouns blue
  nounsYellow: '#ffc110',     // Nouns yellow
  nounsPink: '#ff638d',       // Nouns pink
  nounsGreen: '#4bea69',      // Nouns green
  nounsPurple: '#9f21a0',     // Nouns purple
  nounsOrange: '#f98f30',     // Nouns orange
  nounsCyan: '#45faff',       // Nouns cyan
  
  // Additional vibrant options
  nounsDeepRed: '#c5030e',
  nounsElectricBlue: '#5a65fa',
  nounsLime: '#c4da53',
  nounsMagenta: '#f938d8',
} as const;

export type NounsAccentColor = keyof typeof NOUNS_ACCENT_COLORS;

/**
 * Convert hex to RGB for opacity calculations
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : { r: 0, g: 0, b: 0 };
}

/**
 * Generate color variations from a base color
 */
function generateColorVariations(baseHex: string) {
  const rgb = hexToRgb(baseHex);
  
  return {
    base: baseHex,
    light: `rgb(${Math.min(255, rgb.r + 40)}, ${Math.min(255, rgb.g + 40)}, ${Math.min(255, rgb.b + 40)})`,
    lighter: `rgb(${Math.min(255, rgb.r + 80)}, ${Math.min(255, rgb.g + 80)}, ${Math.min(255, rgb.b + 80)})`,
    dark: `rgb(${Math.max(0, rgb.r - 30)}, ${Math.max(0, rgb.g - 30)}, ${Math.max(0, rgb.b - 30)})`,
    darker: `rgb(${Math.max(0, rgb.r - 60)}, ${Math.max(0, rgb.g - 60)}, ${Math.max(0, rgb.b - 60)})`,
    transparent: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`,
    semiTransparent: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`,
  };
}

/**
 * Advanced Theme Customization Options
 */
export interface ThemeCustomization {
  // Base theme
  baseTheme: 'classic' | 'platinum' | 'dark';
  
  // Accent color (from Nouns palette)
  accentColor?: NounsAccentColor;
  customAccent?: string; // For custom color picker
  
  // Title bar style
  titleBarStyle?: 'pinstripe' | 'gradient' | 'solid';
  
  // Window appearance
  windowOpacity?: number; // 0.85 - 1.0
  cornerStyle?: 'sharp' | 'rounded'; // Mac OS 8 = sharp, modern = rounded
  
  // Menu bar
  menuBarStyle?: 'opaque' | 'translucent';
  
  // Typography
  fontSize?: 'small' | 'medium' | 'large';
  fontFamily?: 'chicago' | 'geneva' | 'system';
  
  // Effects
  windowShadow?: boolean;
  animations?: boolean;
  transitionSpeed?: 'slow' | 'normal' | 'fast';
}

export const DEFAULT_CUSTOMIZATION: ThemeCustomization = {
  baseTheme: 'classic',
  accentColor: 'nounsRed',
  titleBarStyle: 'pinstripe',
  windowOpacity: 1.0,
  cornerStyle: 'sharp',
  menuBarStyle: 'opaque',
  fontSize: 'medium',
  fontFamily: 'geneva',
  windowShadow: true,
  animations: true,
  transitionSpeed: 'normal',
};

/**
 * Apply theme customization and generate CSS custom properties
 */
export function applyThemeCustomization(
  baseTheme: any,
  customization: Partial<ThemeCustomization>
): Record<string, string> {
  const accent = customization.customAccent || 
                 (customization.accentColor ? NOUNS_ACCENT_COLORS[customization.accentColor] : baseTheme.colors.highlight);
  
  const accentVariations = generateColorVariations(accent);
  
  const customProperties: Record<string, string> = {
    // Base theme colors (from selected theme)
    ...Object.entries(baseTheme.colors).reduce((acc, [key, value]) => {
      const cssVarName = `--theme-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      acc[cssVarName] = value as string;
      return acc;
    }, {} as Record<string, string>),
    
    // Override with accent color variations
    '--theme-highlight': accentVariations.base,
    '--theme-button-highlight': accentVariations.light,
    '--theme-menu-highlight': accentVariations.base,
    '--theme-link-color': accentVariations.dark,
    '--theme-selection-background': accentVariations.transparent,
    '--theme-selection-border': accentVariations.base,
    
    // Typography
    '--theme-font-size-small': '10px',
    '--theme-font-size-medium': '12px',
    '--theme-font-size-large': '14px',
    '--theme-font-size': customization.fontSize === 'small' ? '10px' : 
                         customization.fontSize === 'large' ? '14px' : '12px',
    
    // Corner radius
    '--theme-corner-radius': customization.cornerStyle === 'rounded' ? '4px' : '0px',
    '--theme-window-corner-radius': customization.cornerStyle === 'rounded' ? '6px' : '0px',
    
    // Opacity
    '--theme-window-opacity': (customization.windowOpacity || 1.0).toString(),
    '--theme-menu-opacity': customization.menuBarStyle === 'translucent' ? '0.95' : '1.0',
    
    // Shadows
    '--theme-window-shadow': customization.windowShadow 
      ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
      : 'none',
    
    // Transitions
    '--theme-transition-speed': customization.transitionSpeed === 'slow' ? '0.3s' :
                               customization.transitionSpeed === 'fast' ? '0.1s' : '0.2s',
  };
  
  return customProperties;
}

/**
 * Nouns-Themed Built-in Themes (Phase 7.3)
 * All using official Nouns color palette
 */
export const NOUNS_THEMES = {
  nounish: {
    id: 'nounish',
    name: 'Nounish',
    description: 'Official Nouns DAO colors',
    colors: {
      windowBackground: '#ffffff',
      windowBorder: '#000000',
      windowBorderInactive: '#808080',
      titleBarActive: `#${NOUNS_PALETTE[24]}`, // Nouns blue
      titleBarInactive: '#CCCCCC',
      titleBarText: '#FFFFFF',
      titleBarTextInactive: '#666666',
      text: '#000000',
      textSecondary: '#666666',
      highlight: `#${NOUNS_PALETTE[25]}`, // Nouns red
      highlightText: '#FFFFFF',
      shadow: '#888888',
      buttonFace: '#F0F0F0',
      buttonHighlight: '#FFFFFF',
      buttonShadow: '#888888',
      menuBackground: '#FFFFFF',
      menuText: '#000000',
      menuHighlight: `#${NOUNS_PALETTE[25]}`, // Nouns red
      desktopBackground: `#${NOUNS_BG_COLORS[0]}`, // Cool background
    },
    patterns: {
      titleBarActive: 'solid',
      titleBarInactive: 'solid',
      windowTexture: 'none',
    },
  },
  
  tangerine: {
    id: 'tangerine',
    name: 'Tangerine',
    description: 'Warm and welcoming Nouns vibes',
    colors: {
      windowBackground: '#FFF5E6',
      windowBorder: `#${NOUNS_PALETTE[20]}`, // Nouns orange
      windowBorderInactive: '#CCAA88',
      titleBarActive: `#${NOUNS_PALETTE[38]}`, // Nouns yellow-orange
      titleBarInactive: '#F5DCC0',
      titleBarText: '#4A2C00',
      titleBarTextInactive: '#999999',
      text: '#4A2C00',
      textSecondary: '#886644',
      highlight: `#${NOUNS_PALETTE[20]}`, // Nouns orange
      highlightText: '#FFFFFF',
      shadow: '#DDAA88',
      buttonFace: '#FFF8F0',
      buttonHighlight: '#FFFFFF',
      buttonShadow: '#DDAA88',
      menuBackground: '#FFF8F0',
      menuText: '#4A2C00',
      menuHighlight: `#${NOUNS_PALETTE[20]}`,
      desktopBackground: `#${NOUNS_BG_COLORS[1]}`, // Warm background
    },
    patterns: {
      titleBarActive: 'gradient',
      titleBarInactive: 'gradient-light',
      windowTexture: 'subtle',
    },
  },
  
  midnight: {
    id: 'midnight',
    name: 'Midnight Nouns',
    description: 'Dark mode with Nouns accent',
    colors: {
      windowBackground: '#000000',
      windowBorder: '#111111',
      windowBorderInactive: '#333333',
      titleBarActive: '#000000',
      titleBarInactive: '#1A1A1A',
      titleBarText: '#FFFFFF',
      titleBarTextInactive: '#888888',
      text: '#EEEEEE',
      textSecondary: '#AAAAAA',
      highlight: `#${NOUNS_PALETTE[48]}`, // Nouns cyan
      highlightText: '#000000',
      shadow: '#000000',
      buttonFace: '#1A1A1A',
      buttonHighlight: '#333333',
      buttonShadow: '#000000',
      menuBackground: '#000000',
      menuText: '#EEEEEE',
      menuHighlight: `#${NOUNS_PALETTE[48]}`,
      desktopBackground: '#000000',
    },
    patterns: {
      titleBarActive: 'solid',
      titleBarInactive: 'solid',
      windowTexture: 'none',
    },
  },
  
  cottonCandy: {
    id: 'cottonCandy',
    name: 'Cotton Candy',
    description: 'Soft pastels from Nouns palette',
    colors: {
      windowBackground: '#FFF0F5',
      windowBorder: `#${NOUNS_PALETTE[33]}`, // Nouns pink
      windowBorderInactive: '#FFBBDD',
      titleBarActive: `#${NOUNS_PALETTE[46]}`, // Nouns magenta
      titleBarInactive: '#FFD0E8',
      titleBarText: '#8B4789',
      titleBarTextInactive: '#AA88AA',
      text: '#4A4A4A',
      textSecondary: '#888888',
      highlight: `#${NOUNS_PALETTE[19]}`, // Nouns purple
      highlightText: '#FFFFFF',
      shadow: '#DDBBDD',
      buttonFace: '#FFF8FC',
      buttonHighlight: '#FFFFFF',
      buttonShadow: '#FFBBDD',
      menuBackground: '#FFF8FC',
      menuText: '#4A4A4A',
      menuHighlight: `#${NOUNS_PALETTE[46]}`,
      desktopBackground: '#FFE8F0',
    },
    patterns: {
      titleBarActive: 'gradient',
      titleBarInactive: 'gradient-light',
      windowTexture: 'subtle',
    },
  },
  
  retroTerminal: {
    id: 'retroTerminal',
    name: 'Retro Terminal',
    description: 'Green phosphor with Nouns twist',
    colors: {
      windowBackground: '#000000',
      windowBorder: `#${NOUNS_PALETTE[49]}`, // Nouns green
      windowBorderInactive: '#002200',
      titleBarActive: '#001100',
      titleBarInactive: '#000800',
      titleBarText: `#${NOUNS_PALETTE[49]}`,
      titleBarTextInactive: '#004400',
      text: `#${NOUNS_PALETTE[49]}`,
      textSecondary: '#006600',
      highlight: `#${NOUNS_PALETTE[49]}`,
      highlightText: '#000000',
      shadow: '#001100',
      buttonFace: '#000000',
      buttonHighlight: '#002200',
      buttonShadow: '#000000',
      menuBackground: '#000000',
      menuText: `#${NOUNS_PALETTE[49]}`,
      menuHighlight: `#${NOUNS_PALETTE[49]}`,
      desktopBackground: '#000000',
    },
    patterns: {
      titleBarActive: 'solid',
      titleBarInactive: 'solid',
      windowTexture: 'scanlines',
    },
  },
  
  bondiBl: {
    id: 'bondiBlue',
    name: 'Bondi Blue',
    description: 'iMac G3 meets Nouns',
    colors: {
      windowBackground: 'rgba(200, 230, 255, 0.9)',
      windowBorder: `#${NOUNS_PALETTE[47]}`, // Nouns blue
      windowBorderInactive: '#88CCFF',
      titleBarActive: `#${NOUNS_PALETTE[72]}`, // Nouns light blue
      titleBarInactive: '#AAD DFF',
      titleBarText: '#FFFFFF',
      titleBarTextInactive: '#668899',
      text: '#003366',
      textSecondary: '#0066AA',
      highlight: `#${NOUNS_PALETTE[47]}`,
      highlightText: '#FFFFFF',
      shadow: '#88CCFF',
      buttonFace: 'rgba(220, 240, 255, 0.9)',
      buttonHighlight: 'rgba(255, 255, 255, 0.9)',
      buttonShadow: '#88CCFF',
      menuBackground: 'rgba(240, 250, 255, 0.95)',
      menuText: '#003366',
      menuHighlight: `#${NOUNS_PALETTE[47]}`,
      desktopBackground: '#B0D0E0',
    },
    patterns: {
      titleBarActive: 'gradient',
      titleBarInactive: 'gradient-light',
      windowTexture: 'subtle',
    },
  },
  
  graphite: {
    id: 'graphite',
    name: 'Graphite',
    description: 'Professional grayscale',
    colors: {
      windowBackground: '#D0D0D0',
      windowBorder: '#666666',
      windowBorderInactive: '#AAAAAA',
      titleBarActive: '#888888',
      titleBarInactive: '#CCCCCC',
      titleBarText: '#FFFFFF',
      titleBarTextInactive: '#888888',
      text: '#000000',
      textSecondary: '#666666',
      highlight: '#666666',
      highlightText: '#FFFFFF',
      shadow: '#888888',
      buttonFace: '#CCCCCC',
      buttonHighlight: '#EEEEEE',
      buttonShadow: '#888888',
      menuBackground: '#E0E0E0',
      menuText: '#000000',
      menuHighlight: '#999999',
      desktopBackground: '#A0A0A0',
    },
    patterns: {
      titleBarActive: 'gradient',
      titleBarInactive: 'solid',
      windowTexture: 'none',
    },
  },
  
  tokyoNight: {
    id: 'tokyoNight',
    name: 'Tokyo Night',
    description: 'Cyberpunk with Nouns accents',
    colors: {
      windowBackground: '#1A1B26',
      windowBorder: `#${NOUNS_PALETTE[47]}`, // Nouns blue
      windowBorderInactive: '#2A2B36',
      titleBarActive: `#${NOUNS_PALETTE[24]}`, // Nouns blue
      titleBarInactive: '#2A2B36',
      titleBarText: '#C0CAF5',
      titleBarTextInactive: '#565f89',
      text: '#C0CAF5',
      textSecondary: '#565f89',
      highlight: `#${NOUNS_PALETTE[46]}`, // Nouns magenta
      highlightText: '#FFFFFF',
      shadow: '#16161E',
      buttonFace: '#24283B',
      buttonHighlight: '#414868',
      buttonShadow: '#16161E',
      menuBackground: '#1F2335',
      menuText: '#C0CAF5',
      menuHighlight: `#${NOUNS_PALETTE[46]}`,
      desktopBackground: '#1A1B26',
    },
    patterns: {
      titleBarActive: 'gradient',
      titleBarInactive: 'solid',
      windowTexture: 'none',
    },
  },
};

/**
 * Get accent color hex value
 */
export function getAccentColorHex(accentColor?: NounsAccentColor, customAccent?: string): string {
  if (customAccent) return customAccent;
  if (accentColor) return NOUNS_ACCENT_COLORS[accentColor];
  return NOUNS_ACCENT_COLORS.nounsRed; // Default
}

/**
 * Get all available accent colors for picker
 */
export function getAccentColorOptions() {
  return Object.entries(NOUNS_ACCENT_COLORS).map(([key, hex]) => ({
    id: key as NounsAccentColor,
    name: key.replace('nouns', '').replace(/([A-Z])/g, ' $1').trim(),
    hex,
  }));
}

