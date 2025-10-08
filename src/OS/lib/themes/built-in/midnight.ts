/**
 * Midnight Theme
 * OLED-friendly with pure blacks and subtle highlights
 * Phase 8D: New theme
 */

import type { Theme, ThemeColors, ThemePatterns } from '../../../types/theme';

const midnightColors: ThemeColors = {
  // Windows
  windowBackground: '#000000',
  windowBorder: '#1C1C1C',
  windowBorderInactive: '#0A0A0A',
  windowShadow: 'rgba(0, 0, 0, 0.9)',
  
  // Title Bars
  titleBarActive: '#0A0A0A',
  titleBarInactive: '#050505',
  titleBarText: '#E0E0E0',
  titleBarTextInactive: '#666666',
  titleBarShadow: '#000000',
  
  // Text
  textPrimary: '#E0E0E0',
  textSecondary: '#999999',
  textTertiary: '#666666',
  textDisabled: '#444444',
  textInverted: '#000000',
  
  // Highlights & Selection
  highlight: '#00A8FF',
  highlightText: '#FFFFFF',
  highlightHover: '#33B8FF',
  selectionBackground: 'rgba(0, 168, 255, 0.25)',
  selectionText: '#FFFFFF',
  
  // Buttons
  buttonBackground: '#0A0A0A',
  buttonBackgroundHover: '#1C1C1C',
  buttonBackgroundActive: '#050505',
  buttonBackgroundDisabled: '#0A0A0A',
  buttonBorder: '#1C1C1C',
  buttonBorderHover: '#00A8FF',
  buttonText: '#E0E0E0',
  buttonTextDisabled: '#444444',
  buttonShadow: '#000000',
  buttonHighlight: '#1C1C1C',
  
  // Primary Buttons
  buttonPrimaryBackground: '#00A8FF',
  buttonPrimaryBackgroundHover: '#33B8FF',
  buttonPrimaryBackgroundActive: '#0090DD',
  buttonPrimaryText: '#FFFFFF',
  buttonPrimaryBorder: '#0090DD',
  
  // Cancel Buttons
  buttonCancelBackground: '#1C1C1C',
  buttonCancelBackgroundHover: '#2A2A2A',
  buttonCancelText: '#E0E0E0',
  
  // Inputs
  inputBackground: '#000000',
  inputBackgroundFocused: '#0A0A0A',
  inputBackgroundDisabled: '#050505',
  inputBorder: '#1C1C1C',
  inputBorderFocused: '#00A8FF',
  inputBorderDisabled: '#0A0A0A',
  inputText: '#E0E0E0',
  inputTextDisabled: '#444444',
  inputPlaceholder: '#666666',
  inputShadow: '#000000',
  
  // Menus
  menuBackground: '#000000',
  menuBorder: '#1C1C1C',
  menuText: '#E0E0E0',
  menuTextDisabled: '#444444',
  menuHighlight: '#00A8FF',
  menuHighlightText: '#FFFFFF',
  menuSeparator: '#1C1C1C',
  menuShadow: 'rgba(0, 0, 0, 0.9)',
  
  // Menu Bar
  menuBarBackground: '#000000',
  menuBarBorder: '#1C1C1C',
  menuBarText: '#E0E0E0',
  menuBarHighlight: '#00A8FF',
  
  // Scrollbars
  scrollbarBackground: '#000000',
  scrollbarBorder: '#1C1C1C',
  scrollbarThumb: '#1C1C1C',
  scrollbarThumbHover: '#2A2A2A',
  scrollbarThumbActive: '#333333',
  scrollbarArrowBackground: '#1C1C1C',
  scrollbarArrowBackgroundHover: '#2A2A2A',
  scrollbarArrowBackgroundActive: '#333333',
  scrollbarArrowIcon: '#999999',
  
  // Checkboxes & Radios
  checkboxBackground: '#000000',
  checkboxBackgroundChecked: '#00A8FF',
  checkboxBackgroundDisabled: '#0A0A0A',
  checkboxBorder: '#1C1C1C',
  checkboxBorderChecked: '#00A8FF',
  checkboxBorderFocused: '#00A8FF',
  checkboxCheck: '#000000',
  
  radioBackground: '#000000',
  radioBackgroundChecked: '#00A8FF',
  radioBackgroundDisabled: '#0A0A0A',
  radioBorder: '#1C1C1C',
  radioBorderChecked: '#00A8FF',
  radioBorderFocused: '#00A8FF',
  radioDot: '#000000',
  
  // Sliders
  sliderTrack: '#1C1C1C',
  sliderTrackFilled: '#00A8FF',
  sliderThumb: '#E0E0E0',
  sliderThumbHover: '#FFFFFF',
  sliderThumbActive: '#CCCCCC',
  sliderBorder: '#1C1C1C',
  
  // Progress Bars
  progressBackground: '#1C1C1C',
  progressFill: '#00A8FF',
  progressBorder: '#1C1C1C',
  progressStripe: 'rgba(255, 255, 255, 0.15)',
  
  // Dialogs & Alerts
  dialogBackground: '#000000',
  dialogBorder: '#1C1C1C',
  dialogShadow: 'rgba(0, 0, 0, 0.9)',
  dialogHeaderBackground: '#0A0A0A',
  dialogHeaderText: '#E0E0E0',
  
  alertInfoBackground: '#001A33',
  alertInfoBorder: '#00A8FF',
  alertInfoText: '#66D4FF',
  
  alertWarningBackground: '#332200',
  alertWarningBorder: '#FFAA00',
  alertWarningText: '#FFCC66',
  
  alertErrorBackground: '#330000',
  alertErrorBorder: '#FF3333',
  alertErrorText: '#FF6666',
  
  alertSuccessBackground: '#003300',
  alertSuccessBorder: '#00CC00',
  alertSuccessText: '#66FF66',
  
  // Tooltips
  tooltipBackground: '#1C1C1C',
  tooltipBorder: '#00A8FF',
  tooltipText: '#FFFFFF',
  tooltipShadow: 'rgba(0, 168, 255, 0.3)',
  
  // Badges & Notifications
  badgeBackground: '#FF3333',
  badgeBorder: '#CC0000',
  badgeText: '#FFFFFF',
  
  notificationBackground: '#0A0A0A',
  notificationBorder: '#1C1C1C',
  notificationText: '#E0E0E0',
  notificationIconInfo: '#00A8FF',
  notificationIconWarning: '#FFAA00',
  notificationIconError: '#FF3333',
  notificationIconSuccess: '#00CC00',
  
  // Context Menus
  contextMenuBackground: '#000000',
  contextMenuBorder: '#1C1C1C',
  contextMenuText: '#E0E0E0',
  contextMenuTextDisabled: '#444444',
  contextMenuHighlight: '#00A8FF',
  contextMenuHighlightText: '#FFFFFF',
  contextMenuSeparator: '#1C1C1C',
  
  // Status Bar
  statusBarBackground: '#000000',
  statusBarBorder: '#1C1C1C',
  statusBarText: '#E0E0E0',
  statusBarIconDefault: '#666666',
  statusBarIconActive: '#00A8FF',
  
  // Dock
  dockBackground: 'rgba(0, 0, 0, 0.98)',
  dockBorder: '#1C1C1C',
  dockShadow: 'rgba(0, 168, 255, 0.1)',
  dockIconBorder: 'transparent',
  dockIconBorderHover: '#1C1C1C',
  dockIconBorderActive: '#00A8FF',
  dockIndicator: '#00A8FF',
  
  // Desktop
  desktopBackground: '#000000',
  desktopPattern: 'rgba(0, 168, 255, 0.02)',
  desktopIconText: '#E0E0E0',
  desktopIconTextBackground: 'rgba(0, 0, 0, 0.8)',
  desktopIconTextBackgroundSelected: '#00A8FF',
  desktopIconBorder: 'transparent',
  desktopIconBorderSelected: '#00A8FF',
  
  // Tabs
  tabBackground: '#0A0A0A',
  tabBackgroundHover: '#1C1C1C',
  tabBackgroundActive: '#000000',
  tabBorder: '#1C1C1C',
  tabText: '#999999',
  tabTextActive: '#E0E0E0',
  
  // Dividers
  dividerColor: '#1C1C1C',
  
  // Focus States
  focusOutline: '#00A8FF',
  focusOutlineOffset: '2px',
  
  // Shadows
  shadowLight: 'rgba(0, 0, 0, 0.5)',
  shadowMedium: 'rgba(0, 0, 0, 0.7)',
  shadowHeavy: 'rgba(0, 0, 0, 0.9)',
  
  // Miscellaneous
  overlayBackground: 'rgba(0, 0, 0, 0.85)',
  loadingSpinnerPrimary: '#00A8FF',
  loadingSpinnerSecondary: '#1C1C1C',
  errorColor: '#FF3333',
  warningColor: '#FFAA00',
  successColor: '#00CC00',
  infoColor: '#00A8FF',
};

const midnightPatterns: ThemePatterns = {
  titleBarActive: 'solid',
  titleBarInactive: 'solid',
  windowTexture: 'none',
  desktopPattern: 'none',
  scrollbarStyle: 'modern',
};

export const MIDNIGHT_THEME: Theme = {
  id: 'midnight',
  name: 'Midnight',
  description: 'OLED-friendly pure black with cyan accents for deep dark mode',
  colors: midnightColors,
  patterns: midnightPatterns,
  defaultCustomization: {
    cornerStyle: 'rounded',
    windowOpacity: 1.0,
    menuBarStyle: 'translucent',
    fontSize: 'medium',
    scrollbarWidth: 'thin',
    scrollbarArrowStyle: 'none',
    scrollbarAutoHide: true,
  },
};

