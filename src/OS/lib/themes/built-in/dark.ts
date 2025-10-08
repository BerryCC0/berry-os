/**
 * Dark Mode Theme
 * Easy on the eyes with dark grays and blue accents
 * Phase 8A: Extracted from monolithic themes.ts
 */

import type { Theme, ThemeColors, ThemePatterns } from '../../../types/theme';

const darkColors: ThemeColors = {
  // Windows
  windowBackground: '#2A2A2A',
  windowBorder: '#1A1A1A',
  windowBorderInactive: '#3A3A3A',
  windowShadow: 'rgba(0, 0, 0, 0.5)',
  
  // Title Bars
  titleBarActive: '#1A1A1A',
  titleBarInactive: '#3A3A3A',
  titleBarText: '#FFFFFF',
  titleBarTextInactive: '#888888',
  titleBarShadow: '#0A0A0A',
  
  // Text
  textPrimary: '#EEEEEE',
  textSecondary: '#AAAAAA',
  textTertiary: '#888888',
  textDisabled: '#666666',
  textInverted: '#000000',
  
  // Highlights & Selection
  highlight: '#4A9EFF',
  highlightText: '#FFFFFF',
  highlightHover: '#5AAFFF',
  selectionBackground: 'rgba(74, 158, 255, 0.3)',
  selectionText: '#FFFFFF',
  
  // Buttons
  buttonBackground: '#3A3A3A',
  buttonBackgroundHover: '#4A4A4A',
  buttonBackgroundActive: '#2A2A2A',
  buttonBackgroundDisabled: '#3A3A3A',
  buttonBorder: '#1A1A1A',
  buttonBorderHover: '#4A9EFF',
  buttonText: '#EEEEEE',
  buttonTextDisabled: '#666666',
  buttonShadow: '#0A0A0A',
  buttonHighlight: '#4A4A4A',
  
  // Primary Buttons
  buttonPrimaryBackground: '#4A9EFF',
  buttonPrimaryBackgroundHover: '#5AAFFF',
  buttonPrimaryBackgroundActive: '#3A8EEF',
  buttonPrimaryText: '#FFFFFF',
  buttonPrimaryBorder: '#3A8EEF',
  
  // Cancel Buttons
  buttonCancelBackground: '#3A3A3A',
  buttonCancelBackgroundHover: '#4A4A4A',
  buttonCancelText: '#EEEEEE',
  
  // Inputs
  inputBackground: '#1A1A1A',
  inputBackgroundFocused: '#252525',
  inputBackgroundDisabled: '#3A3A3A',
  inputBorder: '#0A0A0A',
  inputBorderFocused: '#4A9EFF',
  inputBorderDisabled: '#2A2A2A',
  inputText: '#EEEEEE',
  inputTextDisabled: '#666666',
  inputPlaceholder: '#888888',
  inputShadow: '#0A0A0A',
  
  // Menus
  menuBackground: '#2A2A2A',
  menuBorder: '#1A1A1A',
  menuText: '#EEEEEE',
  menuTextDisabled: '#666666',
  menuHighlight: '#4A9EFF',
  menuHighlightText: '#FFFFFF',
  menuSeparator: '#1A1A1A',
  menuShadow: 'rgba(0, 0, 0, 0.5)',
  
  // Menu Bar
  menuBarBackground: '#2A2A2A',
  menuBarBorder: '#1A1A1A',
  menuBarText: '#EEEEEE',
  menuBarHighlight: '#4A9EFF',
  
  // Scrollbars
  scrollbarBackground: '#2A2A2A',
  scrollbarBorder: '#1A1A1A',
  scrollbarThumb: '#3A3A3A',
  scrollbarThumbHover: '#4A4A4A',
  scrollbarThumbActive: '#5A5A5A',
  scrollbarArrowBackground: '#3A3A3A',
  scrollbarArrowBackgroundHover: '#4A4A4A',
  scrollbarArrowBackgroundActive: '#5A5A5A',
  scrollbarArrowIcon: '#EEEEEE',
  
  // Checkboxes & Radios
  checkboxBackground: '#1A1A1A',
  checkboxBackgroundChecked: '#4A9EFF',
  checkboxBackgroundDisabled: '#3A3A3A',
  checkboxBorder: '#0A0A0A',
  checkboxBorderChecked: '#4A9EFF',
  checkboxBorderFocused: '#4A9EFF',
  checkboxCheck: '#FFFFFF',
  
  radioBackground: '#1A1A1A',
  radioBackgroundChecked: '#4A9EFF',
  radioBackgroundDisabled: '#3A3A3A',
  radioBorder: '#0A0A0A',
  radioBorderChecked: '#4A9EFF',
  radioBorderFocused: '#4A9EFF',
  radioDot: '#FFFFFF',
  
  // Sliders
  sliderTrack: '#1A1A1A',
  sliderTrackFilled: '#4A9EFF',
  sliderThumb: '#EEEEEE',
  sliderThumbHover: '#FFFFFF',
  sliderThumbActive: '#DDDDDD',
  sliderBorder: '#0A0A0A',
  
  // Progress Bars
  progressBackground: '#1A1A1A',
  progressFill: '#4A9EFF',
  progressBorder: '#0A0A0A',
  progressStripe: 'rgba(255, 255, 255, 0.2)',
  
  // Dialogs & Alerts
  dialogBackground: '#2A2A2A',
  dialogBorder: '#1A1A1A',
  dialogShadow: 'rgba(0, 0, 0, 0.7)',
  dialogHeaderBackground: '#3A3A3A',
  dialogHeaderText: '#EEEEEE',
  
  alertInfoBackground: '#1A3A5A',
  alertInfoBorder: '#4A9EFF',
  alertInfoText: '#A0D0FF',
  
  alertWarningBackground: '#5A4A1A',
  alertWarningBorder: '#FFAA00',
  alertWarningText: '#FFD080',
  
  alertErrorBackground: '#5A1A1A',
  alertErrorBorder: '#FF4444',
  alertErrorText: '#FFA0A0',
  
  alertSuccessBackground: '#1A5A1A',
  alertSuccessBorder: '#44FF44',
  alertSuccessText: '#A0FFA0',
  
  // Tooltips
  tooltipBackground: '#3A3A3A',
  tooltipBorder: '#1A1A1A',
  tooltipText: '#EEEEEE',
  tooltipShadow: 'rgba(0, 0, 0, 0.7)',
  
  // Badges & Notifications
  badgeBackground: '#FF4444',
  badgeBorder: '#CC0000',
  badgeText: '#FFFFFF',
  
  notificationBackground: '#2A2A2A',
  notificationBorder: '#1A1A1A',
  notificationText: '#EEEEEE',
  notificationIconInfo: '#4A9EFF',
  notificationIconWarning: '#FFAA00',
  notificationIconError: '#FF4444',
  notificationIconSuccess: '#44FF44',
  
  // Context Menus
  contextMenuBackground: '#2A2A2A',
  contextMenuBorder: '#1A1A1A',
  contextMenuText: '#EEEEEE',
  contextMenuTextDisabled: '#666666',
  contextMenuHighlight: '#4A9EFF',
  contextMenuHighlightText: '#FFFFFF',
  contextMenuSeparator: '#1A1A1A',
  
  // Status Bar
  statusBarBackground: '#2A2A2A',
  statusBarBorder: '#1A1A1A',
  statusBarText: '#EEEEEE',
  statusBarIconDefault: '#888888',
  statusBarIconActive: '#EEEEEE',
  
  // Dock
  dockBackground: 'rgba(26, 26, 26, 0.95)',
  dockBorder: '#000000',
  dockShadow: 'rgba(0, 0, 0, 0.7)',
  dockIconBorder: 'transparent',
  dockIconBorderHover: '#4A4A4A',
  dockIconBorderActive: '#4A9EFF',
  dockIndicator: '#4A9EFF',
  
  // Desktop
  desktopBackground: '#1A1A1A',
  desktopPattern: 'rgba(255, 255, 255, 0.02)',
  desktopIconText: '#EEEEEE',
  desktopIconTextBackground: '#2A2A2A',
  desktopIconTextBackgroundSelected: '#4A9EFF',
  desktopIconBorder: 'transparent',
  desktopIconBorderSelected: '#4A9EFF',
  
  // Tabs
  tabBackground: '#3A3A3A',
  tabBackgroundHover: '#4A4A4A',
  tabBackgroundActive: '#2A2A2A',
  tabBorder: '#1A1A1A',
  tabText: '#AAAAAA',
  tabTextActive: '#EEEEEE',
  
  // Dividers
  dividerColor: '#3A3A3A',
  
  // Focus States
  focusOutline: '#4A9EFF',
  focusOutlineOffset: '2px',
  
  // Shadows
  shadowLight: 'rgba(0, 0, 0, 0.3)',
  shadowMedium: 'rgba(0, 0, 0, 0.5)',
  shadowHeavy: 'rgba(0, 0, 0, 0.7)',
  
  // Miscellaneous
  overlayBackground: 'rgba(0, 0, 0, 0.7)',
  loadingSpinnerPrimary: '#EEEEEE',
  loadingSpinnerSecondary: '#4A9EFF',
  errorColor: '#FF4444',
  warningColor: '#FFAA00',
  successColor: '#44FF44',
  infoColor: '#4A9EFF',
};

const darkPatterns: ThemePatterns = {
  titleBarActive: 'solid',
  titleBarInactive: 'solid',
  windowTexture: 'none',
  desktopPattern: 'none',
  scrollbarStyle: 'modern',
};

export const DARK_THEME: Theme = {
  id: 'dark',
  name: 'Dark Mode',
  description: 'Easy on the eyes with dark grays and blue accents',
  colors: darkColors,
  patterns: darkPatterns,
  defaultCustomization: {
    cornerStyle: 'rounded',
    windowOpacity: 1.0,
    menuBarStyle: 'translucent',
    fontSize: 'medium',
    scrollbarWidth: 'normal',
    scrollbarArrowStyle: 'modern',
    scrollbarAutoHide: false,
  },
};

