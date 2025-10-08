/**
 * Tangerine Theme
 * Vibrant and playful with oranges and yellows
 * Phase 8A: Extracted from monolithic themes.ts
 */

import type { Theme, ThemeColors, ThemePatterns } from '../../../types/theme';

const tangerineColors: ThemeColors = {
  // Windows
  windowBackground: '#FFF5E6',
  windowBorder: '#FF6B35',
  windowBorderInactive: '#FFAA80',
  windowShadow: 'rgba(255, 107, 53, 0.3)',
  
  // Title Bars
  titleBarActive: '#FF6B35',
  titleBarInactive: '#FFE0CC',
  titleBarText: '#FFFFFF',
  titleBarTextInactive: '#996644',
  titleBarShadow: '#CC5528',
  
  // Text
  textPrimary: '#4A2C1A',
  textSecondary: '#996644',
  textTertiary: '#BF9977',
  textDisabled: '#D9BFA8',
  textInverted: '#FFFFFF',
  
  // Highlights & Selection
  highlight: '#FF8C00',
  highlightText: '#FFFFFF',
  highlightHover: '#FFA500',
  selectionBackground: 'rgba(255, 140, 0, 0.3)',
  selectionText: '#4A2C1A',
  
  // Buttons
  buttonBackground: '#FFF5E6',
  buttonBackgroundHover: '#FFFBF2',
  buttonBackgroundActive: '#FFE9CC',
  buttonBackgroundDisabled: '#FFF5E6',
  buttonBorder: '#FF6B35',
  buttonBorderHover: '#FF8C00',
  buttonText: '#4A2C1A',
  buttonTextDisabled: '#D9BFA8',
  buttonShadow: '#FFE0CC',
  buttonHighlight: '#FFFBF2',
  
  // Primary Buttons
  buttonPrimaryBackground: '#FF8C00',
  buttonPrimaryBackgroundHover: '#FFA500',
  buttonPrimaryBackgroundActive: '#E67E00',
  buttonPrimaryText: '#FFFFFF',
  buttonPrimaryBorder: '#E67E00',
  
  // Cancel Buttons
  buttonCancelBackground: '#FFF5E6',
  buttonCancelBackgroundHover: '#FFE9CC',
  buttonCancelText: '#4A2C1A',
  
  // Inputs
  inputBackground: '#FFFFFF',
  inputBackgroundFocused: '#FFFFFF',
  inputBackgroundDisabled: '#FFF5E6',
  inputBorder: '#FF6B35',
  inputBorderFocused: '#FF8C00',
  inputBorderDisabled: '#FFAA80',
  inputText: '#4A2C1A',
  inputTextDisabled: '#996644',
  inputPlaceholder: '#BF9977',
  inputShadow: '#FFE0CC',
  
  // Menus
  menuBackground: '#FFFBF2',
  menuBorder: '#FF6B35',
  menuText: '#4A2C1A',
  menuTextDisabled: '#D9BFA8',
  menuHighlight: '#FF8C00',
  menuHighlightText: '#FFFFFF',
  menuSeparator: '#FF6B35',
  menuShadow: 'rgba(255, 107, 53, 0.3)',
  
  // Menu Bar
  menuBarBackground: '#FFFBF2',
  menuBarBorder: '#FF6B35',
  menuBarText: '#4A2C1A',
  menuBarHighlight: '#FF8C00',
  
  // Scrollbars
  scrollbarBackground: '#FFF5E6',
  scrollbarBorder: '#FF6B35',
  scrollbarThumb: '#FFFBF2',
  scrollbarThumbHover: '#FFF8ED',
  scrollbarThumbActive: '#FFE9CC',
  scrollbarArrowBackground: '#FFFBF2',
  scrollbarArrowBackgroundHover: '#FFF8ED',
  scrollbarArrowBackgroundActive: '#FFE9CC',
  scrollbarArrowIcon: '#FF6B35',
  
  // Checkboxes & Radios
  checkboxBackground: '#FFFFFF',
  checkboxBackgroundChecked: '#FF8C00',
  checkboxBackgroundDisabled: '#FFF5E6',
  checkboxBorder: '#FF6B35',
  checkboxBorderChecked: '#FF8C00',
  checkboxBorderFocused: '#FF8C00',
  checkboxCheck: '#FFFFFF',
  
  radioBackground: '#FFFFFF',
  radioBackgroundChecked: '#FF8C00',
  radioBackgroundDisabled: '#FFF5E6',
  radioBorder: '#FF6B35',
  radioBorderChecked: '#FF8C00',
  radioBorderFocused: '#FF8C00',
  radioDot: '#FFFFFF',
  
  // Sliders
  sliderTrack: '#FFE9CC',
  sliderTrackFilled: '#FF8C00',
  sliderThumb: '#FFFBF2',
  sliderThumbHover: '#FFF8ED',
  sliderThumbActive: '#FFE9CC',
  sliderBorder: '#FF6B35',
  
  // Progress Bars
  progressBackground: '#FFE9CC',
  progressFill: '#FF8C00',
  progressBorder: '#FF6B35',
  progressStripe: 'rgba(255, 255, 255, 0.3)',
  
  // Dialogs & Alerts
  dialogBackground: '#FFF5E6',
  dialogBorder: '#FF6B35',
  dialogShadow: 'rgba(255, 107, 53, 0.3)',
  dialogHeaderBackground: '#FFFBF2',
  dialogHeaderText: '#4A2C1A',
  
  alertInfoBackground: '#E6F5FF',
  alertInfoBorder: '#4A9EFF',
  alertInfoText: '#1A4D80',
  
  alertWarningBackground: '#FFF9E6',
  alertWarningBorder: '#FFCC00',
  alertWarningText: '#806600',
  
  alertErrorBackground: '#FFE6E6',
  alertErrorBorder: '#FF4444',
  alertErrorText: '#802222',
  
  alertSuccessBackground: '#E6FFE6',
  alertSuccessBorder: '#44FF44',
  alertSuccessText: '#228022',
  
  // Tooltips
  tooltipBackground: '#4A2C1A',
  tooltipBorder: '#FF8C00',
  tooltipText: '#FFFFFF',
  tooltipShadow: 'rgba(255, 107, 53, 0.5)',
  
  // Badges & Notifications
  badgeBackground: '#FF6B35',
  badgeBorder: '#CC5528',
  badgeText: '#FFFFFF',
  
  notificationBackground: '#FFFBF2',
  notificationBorder: '#FF6B35',
  notificationText: '#4A2C1A',
  notificationIconInfo: '#4A9EFF',
  notificationIconWarning: '#FFCC00',
  notificationIconError: '#FF4444',
  notificationIconSuccess: '#44FF44',
  
  // Context Menus
  contextMenuBackground: '#FFFBF2',
  contextMenuBorder: '#FF6B35',
  contextMenuText: '#4A2C1A',
  contextMenuTextDisabled: '#D9BFA8',
  contextMenuHighlight: '#FF8C00',
  contextMenuHighlightText: '#FFFFFF',
  contextMenuSeparator: '#FF6B35',
  
  // Status Bar
  statusBarBackground: '#FFF5E6',
  statusBarBorder: '#FF6B35',
  statusBarText: '#4A2C1A',
  statusBarIconDefault: '#996644',
  statusBarIconActive: '#FF8C00',
  
  // Dock
  dockBackground: 'rgba(255, 245, 230, 0.95)',
  dockBorder: '#FF6B35',
  dockShadow: 'rgba(255, 107, 53, 0.3)',
  dockIconBorder: 'transparent',
  dockIconBorderHover: '#FFE0CC',
  dockIconBorderActive: '#FF8C00',
  dockIndicator: '#FF8C00',
  
  // Desktop
  desktopBackground: '#FF8C00',
  desktopPattern: 'rgba(255, 255, 255, 0.1)',
  desktopIconText: '#FFFFFF',
  desktopIconTextBackground: 'rgba(74, 44, 26, 0.7)',
  desktopIconTextBackgroundSelected: '#4A2C1A',
  desktopIconBorder: 'transparent',
  desktopIconBorderSelected: '#4A2C1A',
  
  // Tabs
  tabBackground: '#FFE9CC',
  tabBackgroundHover: '#FFF5E6',
  tabBackgroundActive: '#FFFBF2',
  tabBorder: '#FF6B35',
  tabText: '#996644',
  tabTextActive: '#4A2C1A',
  
  // Dividers
  dividerColor: '#FFE0CC',
  
  // Focus States
  focusOutline: '#FF8C00',
  focusOutlineOffset: '2px',
  
  // Shadows
  shadowLight: 'rgba(255, 107, 53, 0.1)',
  shadowMedium: 'rgba(255, 107, 53, 0.3)',
  shadowHeavy: 'rgba(255, 107, 53, 0.5)',
  
  // Miscellaneous
  overlayBackground: 'rgba(74, 44, 26, 0.7)',
  loadingSpinnerPrimary: '#FF8C00',
  loadingSpinnerSecondary: '#FF6B35',
  errorColor: '#FF4444',
  warningColor: '#FFCC00',
  successColor: '#44FF44',
  infoColor: '#4A9EFF',
};

const tangerinePatterns: ThemePatterns = {
  titleBarActive: 'solid',
  titleBarInactive: 'solid',
  windowTexture: 'subtle',
  desktopPattern: 'stippled',
  scrollbarStyle: 'classic',
};

export const TANGERINE_THEME: Theme = {
  id: 'tangerine',
  name: 'Tangerine',
  description: 'Vibrant and playful with oranges and yellows',
  colors: tangerineColors,
  patterns: tangerinePatterns,
  defaultCustomization: {
    cornerStyle: 'rounded',
    windowOpacity: 1.0,
    menuBarStyle: 'opaque',
    fontSize: 'medium',
    scrollbarWidth: 'normal',
    scrollbarArrowStyle: 'classic',
    scrollbarAutoHide: false,
  },
};

