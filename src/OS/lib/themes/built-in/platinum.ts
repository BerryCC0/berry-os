/**
 * Platinum Theme
 * Mac OS 8.5+ modern appearance with gradients and blues
 * Phase 8A: Extracted from monolithic themes.ts
 */

import type { Theme, ThemeColors, ThemePatterns } from '../../../types/theme';
import { CLASSIC_THEME } from './classic';

const platinumColors: ThemeColors = {
  ...CLASSIC_THEME.colors, // Start with classic as base
  
  // Windows
  windowBackground: '#E8E8E8',
  windowBorder: '#666666',
  windowBorderInactive: '#AAAAAA',
  
  // Title Bars
  titleBarActive: '#8899BB',
  titleBarInactive: '#DDDDDD',
  titleBarText: '#FFFFFF',
  titleBarTextInactive: '#999999',
  
  // Highlights
  highlight: '#3366CC',
  highlightHover: '#4477DD',
  menuHighlight: '#3366CC',
  menuBarHighlight: '#3366CC',
  contextMenuHighlight: '#3366CC',
  
  // Buttons
  buttonBackground: '#E8E8E8',
  buttonBackgroundHover: '#F0F0F0',
  buttonBackgroundActive: '#D0D0D0',
  buttonHighlight: '#F8F8F8',
  
  // Primary Buttons
  buttonPrimaryBackground: '#3366CC',
  buttonPrimaryBackgroundHover: '#4477DD',
  buttonPrimaryBackgroundActive: '#2255BB',
  
  // Inputs
  inputBackground: '#FFFFFF',
  inputBorder: '#888888',
  
  // Menus
  menuBackground: '#F5F5F5',
  menuBarBackground: '#F5F5F5',
  
  // Scrollbars
  scrollbarBackground: '#E8E8E8',
  scrollbarThumb: '#F0F0F0',
  
  // Desktop
  desktopBackground: '#5F9EA0',
  desktopIconTextBackgroundSelected: '#3366CC',
  desktopIconBorderSelected: '#3366CC',
  
  // Focus
  focusOutline: '#3366CC',
  
  // Dock
  dockIndicator: '#3366CC',
  
  // Progress
  progressFill: '#3366CC',
  sliderTrackFilled: '#3366CC',
};

const platinumPatterns: ThemePatterns = {
  titleBarActive: 'gradient',
  titleBarInactive: 'gradient-light',
  windowTexture: 'subtle',
  desktopPattern: 'stippled',
  scrollbarStyle: 'classic',
};

export const PLATINUM_THEME: Theme = {
  id: 'platinum',
  name: 'Platinum',
  description: 'Mac OS 8.5+ modern appearance with gradient blues',
  colors: platinumColors,
  patterns: platinumPatterns,
  defaultCustomization: {
    cornerStyle: 'sharp',
    windowOpacity: 1.0,
    menuBarStyle: 'opaque',
    fontSize: 'medium',
    scrollbarWidth: 'normal',
    scrollbarArrowStyle: 'classic',
    scrollbarAutoHide: false,
  },
};

