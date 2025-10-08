/**
 * Nounish Theme
 * Nouns DAO colors - red, black, cream
 * Phase 8A: Extracted from monolithic themes.ts
 */

import type { Theme, ThemeColors, ThemePatterns } from '../../../types/theme';

const nounishColors: ThemeColors = {
  // Windows
  windowBackground: '#F5E6D3',
  windowBorder: '#1A1A1A',
  windowBorderInactive: '#888888',
  windowShadow: 'rgba(210, 34, 9, 0.3)',
  
  // Title Bars
  titleBarActive: '#D22209',
  titleBarInactive: '#E8D5C3',
  titleBarText: '#FFFFFF',
  titleBarTextInactive: '#888888',
  titleBarShadow: '#991806',
  
  // Text
  textPrimary: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textDisabled: '#AAAAAA',
  textInverted: '#FFFFFF',
  
  // Highlights & Selection
  highlight: '#D22209',
  highlightText: '#FFFFFF',
  highlightHover: '#E6350D',
  selectionBackground: 'rgba(210, 34, 9, 0.2)',
  selectionText: '#1A1A1A',
  
  // Buttons
  buttonBackground: '#F5E6D3',
  buttonBackgroundHover: '#FFF0DD',
  buttonBackgroundActive: '#E5D6C3',
  buttonBackgroundDisabled: '#F5E6D3',
  buttonBorder: '#1A1A1A',
  buttonBorderHover: '#D22209',
  buttonText: '#1A1A1A',
  buttonTextDisabled: '#AAAAAA',
  buttonShadow: '#D5C3B0',
  buttonHighlight: '#FFFAF5',
  
  // Primary Buttons
  buttonPrimaryBackground: '#D22209',
  buttonPrimaryBackgroundHover: '#E6350D',
  buttonPrimaryBackgroundActive: '#991806',
  buttonPrimaryText: '#FFFFFF',
  buttonPrimaryBorder: '#991806',
  
  // Cancel Buttons
  buttonCancelBackground: '#1A1A1A',
  buttonCancelBackgroundHover: '#333333',
  buttonCancelText: '#FFFFFF',
  
  // Inputs
  inputBackground: '#FFFFFF',
  inputBackgroundFocused: '#FFFFFF',
  inputBackgroundDisabled: '#F5E6D3',
  inputBorder: '#1A1A1A',
  inputBorderFocused: '#D22209',
  inputBorderDisabled: '#888888',
  inputText: '#1A1A1A',
  inputTextDisabled: '#888888',
  inputPlaceholder: '#999999',
  inputShadow: '#D5C3B0',
  
  // Menus
  menuBackground: '#FFFAF5',
  menuBorder: '#1A1A1A',
  menuText: '#1A1A1A',
  menuTextDisabled: '#888888',
  menuHighlight: '#D22209',
  menuHighlightText: '#FFFFFF',
  menuSeparator: '#1A1A1A',
  menuShadow: 'rgba(210, 34, 9, 0.3)',
  
  // Menu Bar
  menuBarBackground: '#FFFAF5',
  menuBarBorder: '#1A1A1A',
  menuBarText: '#1A1A1A',
  menuBarHighlight: '#D22209',
  
  // Scrollbars
  scrollbarBackground: '#F5E6D3',
  scrollbarBorder: '#1A1A1A',
  scrollbarThumb: '#FFFAF5',
  scrollbarThumbHover: '#FFF5E6',
  scrollbarThumbActive: '#E5D6C3',
  scrollbarArrowBackground: '#FFFAF5',
  scrollbarArrowBackgroundHover: '#FFF5E6',
  scrollbarArrowBackgroundActive: '#E5D6C3',
  scrollbarArrowIcon: '#1A1A1A',
  
  // Checkboxes & Radios
  checkboxBackground: '#FFFFFF',
  checkboxBackgroundChecked: '#D22209',
  checkboxBackgroundDisabled: '#F5E6D3',
  checkboxBorder: '#1A1A1A',
  checkboxBorderChecked: '#D22209',
  checkboxBorderFocused: '#D22209',
  checkboxCheck: '#FFFFFF',
  
  radioBackground: '#FFFFFF',
  radioBackgroundChecked: '#D22209',
  radioBackgroundDisabled: '#F5E6D3',
  radioBorder: '#1A1A1A',
  radioBorderChecked: '#D22209',
  radioBorderFocused: '#D22209',
  radioDot: '#FFFFFF',
  
  // Sliders
  sliderTrack: '#E5D6C3',
  sliderTrackFilled: '#D22209',
  sliderThumb: '#FFFAF5',
  sliderThumbHover: '#FFF5E6',
  sliderThumbActive: '#E5D6C3',
  sliderBorder: '#1A1A1A',
  
  // Progress Bars
  progressBackground: '#E5D6C3',
  progressFill: '#D22209',
  progressBorder: '#1A1A1A',
  progressStripe: 'rgba(255, 255, 255, 0.3)',
  
  // Dialogs & Alerts
  dialogBackground: '#F5E6D3',
  dialogBorder: '#1A1A1A',
  dialogShadow: 'rgba(210, 34, 9, 0.3)',
  dialogHeaderBackground: '#FFFAF5',
  dialogHeaderText: '#1A1A1A',
  
  alertInfoBackground: '#D0E8FF',
  alertInfoBorder: '#0066CC',
  alertInfoText: '#003366',
  
  alertWarningBackground: '#FFF4CC',
  alertWarningBorder: '#CC9900',
  alertWarningText: '#664400',
  
  alertErrorBackground: '#FFE0E0',
  alertErrorBorder: '#D22209',
  alertErrorText: '#991806',
  
  alertSuccessBackground: '#D0FFD0',
  alertSuccessBorder: '#00CC00',
  alertSuccessText: '#006600',
  
  // Tooltips
  tooltipBackground: '#1A1A1A',
  tooltipBorder: '#D22209',
  tooltipText: '#FFFFFF',
  tooltipShadow: 'rgba(210, 34, 9, 0.5)',
  
  // Badges & Notifications
  badgeBackground: '#D22209',
  badgeBorder: '#991806',
  badgeText: '#FFFFFF',
  
  notificationBackground: '#FFFAF5',
  notificationBorder: '#1A1A1A',
  notificationText: '#1A1A1A',
  notificationIconInfo: '#0066CC',
  notificationIconWarning: '#CC9900',
  notificationIconError: '#D22209',
  notificationIconSuccess: '#00CC00',
  
  // Context Menus
  contextMenuBackground: '#FFFAF5',
  contextMenuBorder: '#1A1A1A',
  contextMenuText: '#1A1A1A',
  contextMenuTextDisabled: '#888888',
  contextMenuHighlight: '#D22209',
  contextMenuHighlightText: '#FFFFFF',
  contextMenuSeparator: '#1A1A1A',
  
  // Status Bar
  statusBarBackground: '#F5E6D3',
  statusBarBorder: '#1A1A1A',
  statusBarText: '#1A1A1A',
  statusBarIconDefault: '#666666',
  statusBarIconActive: '#D22209',
  
  // Dock
  dockBackground: 'rgba(245, 230, 211, 0.95)',
  dockBorder: '#1A1A1A',
  dockShadow: 'rgba(210, 34, 9, 0.3)',
  dockIconBorder: 'transparent',
  dockIconBorderHover: '#D5C3B0',
  dockIconBorderActive: '#D22209',
  dockIndicator: '#D22209',
  
  // Desktop
  desktopBackground: '#1A1A1A',
  desktopPattern: 'rgba(210, 34, 9, 0.05)',
  desktopIconText: '#FFFFFF',
  desktopIconTextBackground: 'rgba(26, 26, 26, 0.7)',
  desktopIconTextBackgroundSelected: '#D22209',
  desktopIconBorder: 'transparent',
  desktopIconBorderSelected: '#D22209',
  
  // Tabs
  tabBackground: '#E5D6C3',
  tabBackgroundHover: '#F5E6D3',
  tabBackgroundActive: '#FFFAF5',
  tabBorder: '#1A1A1A',
  tabText: '#666666',
  tabTextActive: '#1A1A1A',
  
  // Dividers
  dividerColor: '#D5C3B0',
  
  // Focus States
  focusOutline: '#D22209',
  focusOutlineOffset: '2px',
  
  // Shadows
  shadowLight: 'rgba(210, 34, 9, 0.1)',
  shadowMedium: 'rgba(210, 34, 9, 0.3)',
  shadowHeavy: 'rgba(210, 34, 9, 0.5)',
  
  // Miscellaneous
  overlayBackground: 'rgba(26, 26, 26, 0.7)',
  loadingSpinnerPrimary: '#D22209',
  loadingSpinnerSecondary: '#1A1A1A',
  errorColor: '#D22209',
  warningColor: '#CC9900',
  successColor: '#00CC00',
  infoColor: '#0066CC',
};

const nounishPatterns: ThemePatterns = {
  titleBarActive: 'solid',
  titleBarInactive: 'solid',
  windowTexture: 'subtle',
  desktopPattern: 'stippled',
  scrollbarStyle: 'classic',
};

export const NOUNISH_THEME: Theme = {
  id: 'nounish',
  name: 'Nounish',
  description: 'Nouns DAO colors - Nouns red, black, and cream',
  colors: nounishColors,
  patterns: nounishPatterns,
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

