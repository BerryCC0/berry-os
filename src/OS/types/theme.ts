/**
 * Theme Types
 * Defines the structure for Berry OS themes
 */

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    // Window colors
    windowBackground: string;
    windowBorder: string;
    windowBorderInactive: string;
    
    // Title bar colors
    titleBarActive: string;
    titleBarInactive: string;
    titleBarText: string;
    titleBarTextInactive: string;
    
    // Text colors
    text: string;
    textSecondary: string;
    
    // Highlight colors
    highlight: string;
    highlightText: string;
    
    // UI element colors
    shadow: string;
    buttonFace: string;
    buttonHighlight: string;
    buttonShadow: string;
    
    // Menu colors
    menuBackground: string;
    menuText: string;
    menuHighlight: string;
    
    // Desktop
    desktopBackground: string;
  };
  patterns: {
    titleBarActive: 'pinstripe' | 'gradient' | 'solid' | 'gradient-light';
    titleBarInactive: 'pinstripe' | 'gradient' | 'solid' | 'gradient-light';
    windowTexture: 'none' | 'subtle' | 'strong';
  };
}

export type ThemeId = 'classic' | 'platinum' | 'dark' | string;

