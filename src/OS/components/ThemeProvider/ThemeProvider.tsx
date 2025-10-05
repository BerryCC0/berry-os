'use client';

/**
 * Theme Provider
 * Applies theme CSS custom properties to the entire application
 * Phase 6.5: Dynamic theme switching
 * Phase 7: Nouns-themed customization
 */

import { useEffect } from 'react';
import { useSystemStore } from '../../store/systemStore';
import { NOUNS_THEMES, applyThemeCustomization } from '../../lib/nounsThemes';

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: Record<string, string>;
  patterns: {
    titleBarActive: string;
    titleBarInactive: string;
    windowTexture: string;
  };
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

// Built-in themes (Classic Mac OS 8 + Nouns-themed)
export const THEMES: Record<string, Theme> = {
  // Original Mac OS 8 themes
  classic: {
    id: 'classic',
    name: 'Classic',
    description: 'Original Mac OS 8 look',
    colors: {
      windowBackground: '#DDDDDD',
      windowBorder: '#000000',
      windowBorderInactive: '#888888',
      titleBarActive: '#000000',
      titleBarInactive: '#CCCCCC',
      titleBarText: '#FFFFFF',
      titleBarTextInactive: '#666666',
      text: '#000000',
      textSecondary: '#666666',
      highlight: '#000080',
      highlightText: '#FFFFFF',
      shadow: '#888888',
      buttonFace: '#DDDDDD',
      buttonHighlight: '#FFFFFF',
      buttonShadow: '#888888',
      menuBackground: '#FFFFFF',
      menuText: '#000000',
      menuHighlight: '#000080',
      desktopBackground: '#008080',
    },
    patterns: {
      titleBarActive: 'pinstripe',
      titleBarInactive: 'solid',
      windowTexture: 'none',
    },
  },
  
  platinum: {
    id: 'platinum',
    name: 'Platinum',
    description: 'Mac OS 8.5+ modern appearance',
    colors: {
      windowBackground: '#E8E8E8',
      windowBorder: '#666666',
      windowBorderInactive: '#AAAAAA',
      titleBarActive: '#8899BB',
      titleBarInactive: '#DDDDDD',
      titleBarText: '#FFFFFF',
      titleBarTextInactive: '#999999',
      text: '#000000',
      textSecondary: '#666666',
      highlight: '#3366CC',
      highlightText: '#FFFFFF',
      shadow: '#999999',
      buttonFace: '#E8E8E8',
      buttonHighlight: '#FFFFFF',
      buttonShadow: '#999999',
      menuBackground: '#F5F5F5',
      menuText: '#000000',
      menuHighlight: '#3366CC',
      desktopBackground: '#5F9EA0',
    },
    patterns: {
      titleBarActive: 'gradient',
      titleBarInactive: 'gradient-light',
      windowTexture: 'subtle',
    },
  },
  
  dark: {
    id: 'dark',
    name: 'Dark Mode',
    description: 'Easy on the eyes',
    colors: {
      windowBackground: '#2A2A2A',
      windowBorder: '#1A1A1A',
      windowBorderInactive: '#3A3A3A',
      titleBarActive: '#1A1A1A',
      titleBarInactive: '#3A3A3A',
      titleBarText: '#FFFFFF',
      titleBarTextInactive: '#888888',
      text: '#EEEEEE',
      textSecondary: '#AAAAAA',
      highlight: '#4A9EFF',
      highlightText: '#FFFFFF',
      shadow: '#0A0A0A',
      buttonFace: '#3A3A3A',
      buttonHighlight: '#4A4A4A',
      buttonShadow: '#1A1A1A',
      menuBackground: '#2A2A2A',
      menuText: '#EEEEEE',
      menuHighlight: '#4A9EFF',
      desktopBackground: '#1A1A1A',
    },
    patterns: {
      titleBarActive: 'solid',
      titleBarInactive: 'solid',
      windowTexture: 'none',
    },
  },
  
  // Nouns-themed additions (Phase 7)
  ...NOUNS_THEMES,
};

export default function ThemeProvider({ children }: ThemeProviderProps) {
  // Read directly from activeTheme for IMMEDIATE synchronous updates
  const activeTheme = useSystemStore((state) => state.activeTheme);
  const accentColor = useSystemStore((state) => state.accentColor);
  const themeCustomization = useSystemStore((state) => state.themeCustomization);
  
  // Get current theme
  const theme = THEMES[activeTheme] || THEMES.classic;

  useEffect(() => {
    // Apply theme to CSS custom properties
    const root = document.documentElement;
    
    // Apply base theme colors
    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssVarName = `--theme-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVarName, String(value));
    });
    
    // Apply accent color override if set
    if (accentColor) {
      root.style.setProperty('--theme-highlight', accentColor);
      root.style.setProperty('--theme-menu-highlight', accentColor);
      root.style.setProperty('--theme-button-highlight', accentColor);
      
      // Generate lighter/darker variations for hover states
      const rgb = hexToRgb(accentColor);
      const lighter = `rgb(${Math.min(255, rgb.r + 40)}, ${Math.min(255, rgb.g + 40)}, ${Math.min(255, rgb.b + 40)})`;
      const transparent = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`;
      
      root.style.setProperty('--theme-highlight-hover', lighter);
      root.style.setProperty('--theme-selection-background', transparent);
    }
    
    // Apply theme customizations
    if (themeCustomization.cornerStyle) {
      const radius = themeCustomization.cornerStyle === 'rounded' ? '4px' : '0px';
      root.style.setProperty('--theme-corner-radius', radius);
      root.style.setProperty('--theme-window-corner-radius', themeCustomization.cornerStyle === 'rounded' ? '6px' : '0px');
    }
    
    if (themeCustomization.windowOpacity !== undefined) {
      root.style.setProperty('--theme-window-opacity', String(themeCustomization.windowOpacity));
    }
    
    if (themeCustomization.fontSize) {
      const fontSize = themeCustomization.fontSize === 'small' ? '10px' : 
                      themeCustomization.fontSize === 'large' ? '14px' : '12px';
      root.style.setProperty('--theme-font-size', fontSize);
    }
    
    if (themeCustomization.menuBarStyle) {
      const opacity = themeCustomization.menuBarStyle === 'translucent' ? '0.95' : '1.0';
      root.style.setProperty('--theme-menu-opacity', opacity);
    }
    
    // Apply patterns (stored as data attributes for CSS to use)
    root.setAttribute('data-theme', theme.id);
    root.setAttribute('data-titlebar-pattern', themeCustomization.titleBarStyle || theme.patterns.titleBarActive);
    root.setAttribute('data-window-texture', theme.patterns.windowTexture);
    
    // Also set legacy variables for backward compatibility
    root.style.setProperty('--mac-black', theme.colors.windowBorder);
    root.style.setProperty('--mac-white', theme.colors.windowBackground);
    root.style.setProperty('--mac-gray-1', theme.colors.windowBackground);
    root.style.setProperty('--mac-gray-2', theme.colors.shadow);
    root.style.setProperty('--mac-gray-3', theme.colors.windowBorder);
    
    console.log(`Theme applied: ${theme.name}${accentColor ? ` with accent: ${accentColor}` : ''}`);
  }, [theme, accentColor, themeCustomization]);

  return <>{children}</>;
}

// Helper function to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : { r: 0, g: 0, b: 0 };
}

