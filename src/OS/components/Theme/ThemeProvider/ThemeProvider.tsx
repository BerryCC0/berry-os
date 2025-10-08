'use client';

/**
 * Theme Provider - Phase 2 Update
 * Applies comprehensive theme CSS custom properties to the entire application
 * Now supports 150+ themeable properties
 */

import { useEffect } from 'react';
import { useSystemStore } from '../../../store/systemStore';
import { BUILT_IN_THEMES, getThemeById } from '../../../lib/themes';
import { camelToKebab, hexToRgba, lighten, darken } from '../../../lib/colorUtils';
import { getFontById, getFontStack, loadWebFont } from '../../../lib/fontManager';
import type { Theme } from '../../../types/theme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

// Re-export for backward compatibility
export const THEMES = BUILT_IN_THEMES;

export default function ThemeProvider({ children }: ThemeProviderProps) {
  // Read directly from activeTheme for IMMEDIATE synchronous updates
  const activeTheme = useSystemStore((state) => state.activeTheme);
  const customTheme = useSystemStore((state) => state.customTheme);
  const accentColor = useSystemStore((state) => state.accentColor);
  const themeCustomization = useSystemStore((state) => state.themeCustomization);
  
  // Use custom theme if being edited, otherwise use preset theme
  const theme = customTheme || getThemeById(activeTheme);

  useEffect(() => {
    // Apply theme to CSS custom properties
    const root = document.documentElement;
    
    // ==================== Apply ALL Theme Colors ====================
    // Iterate through all 150+ color properties and apply them
    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssVarName = `--theme-${camelToKebab(key)}`;
      root.style.setProperty(cssVarName, String(value));
    });
    
    // ==================== Apply Accent Color Overrides ====================
    if (accentColor) {
      // Override highlight colors with accent
      root.style.setProperty('--theme-highlight', accentColor);
      root.style.setProperty('--theme-menu-highlight', accentColor);
      root.style.setProperty('--theme-menu-bar-highlight', accentColor);
      root.style.setProperty('--theme-context-menu-highlight', accentColor);
      root.style.setProperty('--theme-button-primary-background', accentColor);
      root.style.setProperty('--theme-dock-indicator', accentColor);
      root.style.setProperty('--theme-focus-outline', accentColor);
      
      // Generate hover/active variations
      try {
        const lighterAccent = lighten(accentColor, 10);
        const darkerAccent = darken(accentColor, 10);
        const transparentAccent = hexToRgba(accentColor, 0.2);
        
        root.style.setProperty('--theme-highlight-hover', lighterAccent);
        root.style.setProperty('--theme-button-primary-background-hover', lighterAccent);
        root.style.setProperty('--theme-button-primary-background-active', darkerAccent);
        root.style.setProperty('--theme-selection-background', transparentAccent);
      } catch (error) {
        console.warn('Failed to generate accent color variations:', error);
      }
    }
    
    // ==================== Apply Theme Customizations ====================
    
    // Corner Style
    if (themeCustomization.cornerStyle) {
      const radius = themeCustomization.cornerStyle === 'rounded' ? '4px' : '0px';
      const windowRadius = themeCustomization.cornerStyle === 'rounded' ? '6px' : '0px';
      root.style.setProperty('--theme-corner-radius', radius);
      root.style.setProperty('--theme-window-corner-radius', windowRadius);
    }
    
    // Window Opacity
    if (themeCustomization.windowOpacity !== undefined) {
      root.style.setProperty('--theme-window-opacity', String(themeCustomization.windowOpacity));
    }
    
    // Font Size
    if (themeCustomization.fontSize) {
      const fontSizeMap = {
        small: '10px',
        medium: '12px',
        large: '14px',
      };
      const fontSize = fontSizeMap[themeCustomization.fontSize] || '12px';
      root.style.setProperty('--theme-font-size', fontSize);
    }
    
    // Menu Bar Style
    if (themeCustomization.menuBarStyle) {
      const opacity = themeCustomization.menuBarStyle === 'translucent' ? '0.95' : '1.0';
      root.style.setProperty('--theme-menu-opacity', opacity);
    }
    
    // Scrollbar Width
    if (themeCustomization.scrollbarWidth) {
      const scrollbarWidthMap = {
        thin: '12px',
        normal: '15px',
        thick: '18px',
      };
      const width = scrollbarWidthMap[themeCustomization.scrollbarWidth] || '15px';
      root.style.setProperty('--scrollbar-width', width);
    }
    
    // ==================== Apply Font Customizations ====================
    if (themeCustomization.fonts) {
      const { systemFont, interfaceFont, customSystemFont, customInterfaceFont } = themeCustomization.fonts;
      
      // System font (Chicago by default)
      if (systemFont) {
        const font = getFontById(systemFont);
        if (font) {
          root.style.setProperty('--font-chicago', getFontStack(font));
          
          // Load web font if needed
          if (font.isWebFont) {
            loadWebFont(font).catch(err => {
              console.warn(`Failed to load system font ${font.name}:`, err);
            });
          }
        }
      }
      
      // Interface font (Geneva by default)
      if (interfaceFont) {
        const font = getFontById(interfaceFont);
        if (font) {
          root.style.setProperty('--font-geneva', getFontStack(font));
          
          // Load web font if needed
          if (font.isWebFont) {
            loadWebFont(font).catch(err => {
              console.warn(`Failed to load interface font ${font.name}:`, err);
            });
          }
        }
      }
      
      // Custom font URLs (advanced)
      if (customSystemFont) {
        root.style.setProperty('--font-chicago', customSystemFont);
      }
      if (customInterfaceFont) {
        root.style.setProperty('--font-geneva', customInterfaceFont);
      }
    } else if (theme.fonts) {
      // Apply theme-level font configuration if no customization
      if (theme.fonts.systemFont) {
        const font = getFontById(theme.fonts.systemFont);
        if (font) {
          root.style.setProperty('--font-chicago', getFontStack(font));
          if (font.isWebFont) {
            loadWebFont(font).catch(err => {
              console.warn(`Failed to load theme system font:`, err);
            });
          }
        }
      }
      if (theme.fonts.interfaceFont) {
        const font = getFontById(theme.fonts.interfaceFont);
        if (font) {
          root.style.setProperty('--font-geneva', getFontStack(font));
          if (font.isWebFont) {
            loadWebFont(font).catch(err => {
              console.warn(`Failed to load theme interface font:`, err);
            });
          }
        }
      }
    }
    
    // ==================== Apply Pattern Data Attributes ====================
    root.setAttribute('data-theme', theme.id);
    root.setAttribute('data-titlebar-pattern', 
      themeCustomization.titleBarStyle || theme.patterns.titleBarActive
    );
    root.setAttribute('data-window-texture', theme.patterns.windowTexture);
    root.setAttribute('data-desktop-pattern', theme.patterns.desktopPattern);
    root.setAttribute('data-scrollbar-style', theme.patterns.scrollbarStyle);
    
    // Scrollbar customization attributes
    if (themeCustomization.scrollbarWidth) {
      root.setAttribute('data-scrollbar-width', themeCustomization.scrollbarWidth);
    }
    if (themeCustomization.scrollbarArrowStyle) {
      root.setAttribute('data-arrow-style', themeCustomization.scrollbarArrowStyle);
    }
    
    console.log(`✅ Theme applied: ${theme.name}${accentColor ? ` (accent: ${accentColor})` : ''}`);
  }, [theme, accentColor, themeCustomization]);

  return <>{children}</>;
}

