/**
 * Classic Theme
 * Authentic Mac OS 8 black & white aesthetic
 * Phase 8A: Extracted from monolithic themes.ts
 */

import type { Theme, ThemeColors, ThemePatterns } from '../../../types/theme';

const classicColors: ThemeColors = {
  // Windows
  windowBackground: '#DDDDDD',
  windowBorder: '#000000',
  windowBorderInactive: '#888888',
  windowShadow: 'rgba(0, 0, 0, 0.3)',
  
  // Title Bars
  titleBarActive: '#000000',
  titleBarInactive: '#CCCCCC',
  titleBarText: '#FFFFFF',
  titleBarTextInactive: '#666666',
  titleBarShadow: '#888888',
  
  // Text
  textPrimary: '#000000',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textDisabled: '#AAAAAA',
  textInverted: '#FFFFFF',
  
  // Highlights & Selection
  highlight: '#000080',
  highlightText: '#FFFFFF',
  highlightHover: '#0000A0',
  selectionBackground: 'rgba(0, 0, 128, 0.2)',
  selectionText: '#000000',
  
  // Buttons
  buttonBackground: '#DDDDDD',
  buttonBackgroundHover: '#EEEEEE',
  buttonBackgroundActive: '#CCCCCC',
  buttonBackgroundDisabled: '#DDDDDD',
  buttonBorder: '#000000',
  buttonBorderHover: '#000000',
  buttonText: '#000000',
  buttonTextDisabled: '#AAAAAA',
  buttonShadow: '#888888',
  buttonHighlight: '#FFFFFF',
  
  // Primary Buttons
  buttonPrimaryBackground: '#000000',
  buttonPrimaryBackgroundHover: '#333333',
  buttonPrimaryBackgroundActive: '#000000',
  buttonPrimaryText: '#FFFFFF',
  buttonPrimaryBorder: '#000000',
  
  // Cancel Buttons
  buttonCancelBackground: '#DDDDDD',
  buttonCancelBackgroundHover: '#CCCCCC',
  buttonCancelText: '#000000',
  
  // Inputs
  inputBackground: '#FFFFFF',
  inputBackgroundFocused: '#FFFFFF',
  inputBackgroundDisabled: '#DDDDDD',
  inputBorder: '#000000',
  inputBorderFocused: '#000000',
  inputBorderDisabled: '#888888',
  inputText: '#000000',
  inputTextDisabled: '#888888',
  inputPlaceholder: '#999999',
  inputShadow: '#888888',
  
  // Menus
  menuBackground: '#FFFFFF',
  menuBorder: '#000000',
  menuText: '#000000',
  menuTextDisabled: '#888888',
  menuHighlight: '#000080',
  menuHighlightText: '#FFFFFF',
  menuSeparator: '#000000',
  menuShadow: 'rgba(0, 0, 0, 0.3)',
  
  // Menu Bar
  menuBarBackground: '#FFFFFF',
  menuBarBorder: '#000000',
  menuBarText: '#000000',
  menuBarHighlight: '#000080',
  
  // Scrollbars
  scrollbarBackground: '#DDDDDD',
  scrollbarBorder: '#000000',
  scrollbarThumb: '#FFFFFF',
  scrollbarThumbHover: '#EEEEEE',
  scrollbarThumbActive: '#CCCCCC',
  scrollbarArrowBackground: '#FFFFFF',
  scrollbarArrowBackgroundHover: '#EEEEEE',
  scrollbarArrowBackgroundActive: '#CCCCCC',
  scrollbarArrowIcon: '#000000',
  
  // Checkboxes & Radios
  checkboxBackground: '#FFFFFF',
  checkboxBackgroundChecked: '#FFFFFF',
  checkboxBackgroundDisabled: '#DDDDDD',
  checkboxBorder: '#000000',
  checkboxBorderChecked: '#000000',
  checkboxBorderFocused: '#000080',
  checkboxCheck: '#000000',
  
  radioBackground: '#FFFFFF',
  radioBackgroundChecked: '#FFFFFF',
  radioBackgroundDisabled: '#DDDDDD',
  radioBorder: '#000000',
  radioBorderChecked: '#000000',
  radioBorderFocused: '#000080',
  radioDot: '#000000',
  
  // Sliders
  sliderTrack: '#DDDDDD',
  sliderTrackFilled: '#000080',
  sliderThumb: '#FFFFFF',
  sliderThumbHover: '#EEEEEE',
  sliderThumbActive: '#CCCCCC',
  sliderBorder: '#000000',
  
  // Progress Bars
  progressBackground: '#DDDDDD',
  progressFill: '#000080',
  progressBorder: '#000000',
  progressStripe: 'rgba(255, 255, 255, 0.3)',
  
  // Dialogs & Alerts
  dialogBackground: '#DDDDDD',
  dialogBorder: '#000000',
  dialogShadow: 'rgba(0, 0, 0, 0.3)',
  dialogHeaderBackground: '#FFFFFF',
  dialogHeaderText: '#000000',
  
  alertInfoBackground: '#D0E8FF',
  alertInfoBorder: '#0066CC',
  alertInfoText: '#003366',
  
  alertWarningBackground: '#FFF4CC',
  alertWarningBorder: '#CC9900',
  alertWarningText: '#664400',
  
  alertErrorBackground: '#FFD0D0',
  alertErrorBorder: '#CC0000',
  alertErrorText: '#660000',
  
  alertSuccessBackground: '#D0FFD0',
  alertSuccessBorder: '#00CC00',
  alertSuccessText: '#006600',
  
  // Tooltips
  tooltipBackground: '#FFFFCC',
  tooltipBorder: '#000000',
  tooltipText: '#000000',
  tooltipShadow: 'rgba(0, 0, 0, 0.3)',
  
  // Badges & Notifications
  badgeBackground: '#CC0000',
  badgeBorder: '#000000',
  badgeText: '#FFFFFF',
  
  notificationBackground: '#FFFFFF',
  notificationBorder: '#000000',
  notificationText: '#000000',
  notificationIconInfo: '#0066CC',
  notificationIconWarning: '#CC9900',
  notificationIconError: '#CC0000',
  notificationIconSuccess: '#00CC00',
  
  // Context Menus
  contextMenuBackground: '#FFFFFF',
  contextMenuBorder: '#000000',
  contextMenuText: '#000000',
  contextMenuTextDisabled: '#888888',
  contextMenuHighlight: '#000080',
  contextMenuHighlightText: '#FFFFFF',
  contextMenuSeparator: '#000000',
  
  // Status Bar
  statusBarBackground: '#DDDDDD',
  statusBarBorder: '#000000',
  statusBarText: '#000000',
  statusBarIconDefault: '#666666',
  statusBarIconActive: '#000000',
  
  // Dock
  dockBackground: 'rgba(221, 221, 221, 0.95)',
  dockBorder: '#000000',
  dockShadow: 'rgba(0, 0, 0, 0.3)',
  dockIconBorder: 'transparent',
  dockIconBorderHover: '#888888',
  dockIconBorderActive: '#000000',
  dockIndicator: '#000080',
  
  // Desktop
  desktopBackground: '#008080',
  desktopPattern: 'rgba(255, 255, 255, 0.03)',
  desktopIconText: '#000000',
  desktopIconTextBackground: '#FFFFFF',
  desktopIconTextBackgroundSelected: '#000080',
  desktopIconBorder: 'transparent',
  desktopIconBorderSelected: '#000080',
  
  // Tabs
  tabBackground: '#CCCCCC',
  tabBackgroundHover: '#DDDDDD',
  tabBackgroundActive: '#FFFFFF',
  tabBorder: '#000000',
  tabText: '#666666',
  tabTextActive: '#000000',
  
  // Dividers
  dividerColor: '#888888',
  
  // Focus States
  focusOutline: '#000080',
  focusOutlineOffset: '2px',
  
  // Shadows
  shadowLight: 'rgba(0, 0, 0, 0.1)',
  shadowMedium: 'rgba(0, 0, 0, 0.3)',
  shadowHeavy: 'rgba(0, 0, 0, 0.5)',
  
  // Miscellaneous
  overlayBackground: 'rgba(0, 0, 0, 0.5)',
  loadingSpinnerPrimary: '#000000',
  loadingSpinnerSecondary: '#888888',
  errorColor: '#CC0000',
  warningColor: '#CC9900',
  successColor: '#00CC00',
  infoColor: '#0066CC',
};

const classicPatterns: ThemePatterns = {
  titleBarActive: 'pinstripe',
  titleBarInactive: 'solid',
  windowTexture: 'none',
  desktopPattern: 'stippled',
  scrollbarStyle: 'classic',
};

export const CLASSIC_THEME: Theme = {
  id: 'classic',
  name: 'Classic',
  description: 'Authentic Mac OS 8 look with black & white pinstripes',
  colors: classicColors,
  patterns: classicPatterns,
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

