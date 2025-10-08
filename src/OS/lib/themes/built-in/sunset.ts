/**
 * Sunset Theme
 * Warm purples and pinks inspired by twilight skies
 * Phase 8D: New theme
 */

import type { Theme, ThemeColors, ThemePatterns } from '../../../types/theme';

const sunsetColors: ThemeColors = {
  // Windows
  windowBackground: '#FFF5F9',
  windowBorder: '#B74A8D',
  windowBorderInactive: '#D99FC5',
  windowShadow: 'rgba(183, 74, 141, 0.3)',
  
  // Title Bars
  titleBarActive: '#B74A8D',
  titleBarInactive: '#F5E0ED',
  titleBarText: '#FFFFFF',
  titleBarTextInactive: '#9D7B8F',
  titleBarShadow: '#8D3A6D',
  
  // Text
  textPrimary: '#3D1B2E',
  textSecondary: '#7A4D65',
  textTertiary: '#A87E96',
  textDisabled: '#D9BECF',
  textInverted: '#FFFFFF',
  
  // Highlights & Selection
  highlight: '#D96AA3',
  highlightText: '#FFFFFF',
  highlightHover: '#E37FB5',
  selectionBackground: 'rgba(217, 106, 163, 0.25)',
  selectionText: '#3D1B2E',
  
  // Buttons
  buttonBackground: '#FFF5F9',
  buttonBackgroundHover: '#FFFFFF',
  buttonBackgroundActive: '#FFEAF4',
  buttonBackgroundDisabled: '#FFF5F9',
  buttonBorder: '#B74A8D',
  buttonBorderHover: '#D96AA3',
  buttonText: '#3D1B2E',
  buttonTextDisabled: '#D9BECF',
  buttonShadow: '#F5E0ED',
  buttonHighlight: '#FFFFFF',
  
  // Primary Buttons
  buttonPrimaryBackground: '#D96AA3',
  buttonPrimaryBackgroundHover: '#E37FB5',
  buttonPrimaryBackgroundActive: '#C55892',
  buttonPrimaryText: '#FFFFFF',
  buttonPrimaryBorder: '#C55892',
  
  // Cancel Buttons
  buttonCancelBackground: '#FFF5F9',
  buttonCancelBackgroundHover: '#FFEAF4',
  buttonCancelText: '#7A4D65',
  
  // Inputs
  inputBackground: '#FFFFFF',
  inputBackgroundFocused: '#FFFFFF',
  inputBackgroundDisabled: '#FFF5F9',
  inputBorder: '#D99FC5',
  inputBorderFocused: '#D96AA3',
  inputBorderDisabled: '#E5C9DB',
  inputText: '#3D1B2E',
  inputTextDisabled: '#A87E96',
  inputPlaceholder: '#D9BECF',
  inputShadow: '#F5E0ED',
  
  // Menus
  menuBackground: '#FFFFFF',
  menuBorder: '#B74A8D',
  menuText: '#3D1B2E',
  menuTextDisabled: '#D9BECF',
  menuHighlight: '#D96AA3',
  menuHighlightText: '#FFFFFF',
  menuSeparator: '#F5E0ED',
  menuShadow: 'rgba(183, 74, 141, 0.2)',
  
  // Menu Bar
  menuBarBackground: '#FFFFFF',
  menuBarBorder: '#F5E0ED',
  menuBarText: '#3D1B2E',
  menuBarHighlight: '#D96AA3',
  
  // Scrollbars
  scrollbarBackground: '#FFF5F9',
  scrollbarBorder: '#F5E0ED',
  scrollbarThumb: '#FFFFFF',
  scrollbarThumbHover: '#FFFAFD',
  scrollbarThumbActive: '#FFEAF4',
  scrollbarArrowBackground: '#FFFFFF',
  scrollbarArrowBackgroundHover: '#FFFAFD',
  scrollbarArrowBackgroundActive: '#FFEAF4',
  scrollbarArrowIcon: '#D96AA3',
  
  // Checkboxes & Radios
  checkboxBackground: '#FFFFFF',
  checkboxBackgroundChecked: '#D96AA3',
  checkboxBackgroundDisabled: '#FFF5F9',
  checkboxBorder: '#D99FC5',
  checkboxBorderChecked: '#D96AA3',
  checkboxBorderFocused: '#D96AA3',
  checkboxCheck: '#FFFFFF',
  
  radioBackground: '#FFFFFF',
  radioBackgroundChecked: '#D96AA3',
  radioBackgroundDisabled: '#FFF5F9',
  radioBorder: '#D99FC5',
  radioBorderChecked: '#D96AA3',
  radioBorderFocused: '#D96AA3',
  radioDot: '#FFFFFF',
  
  // Sliders
  sliderTrack: '#F5E0ED',
  sliderTrackFilled: '#D96AA3',
  sliderThumb: '#FFFFFF',
  sliderThumbHover: '#FFFAFD',
  sliderThumbActive: '#FFEAF4',
  sliderBorder: '#D99FC5',
  
  // Progress Bars
  progressBackground: '#F5E0ED',
  progressFill: '#D96AA3',
  progressBorder: '#D99FC5',
  progressStripe: 'rgba(255, 255, 255, 0.3)',
  
  // Dialogs & Alerts
  dialogBackground: '#FFF5F9',
  dialogBorder: '#B74A8D',
  dialogShadow: 'rgba(183, 74, 141, 0.3)',
  dialogHeaderBackground: '#FFFFFF',
  dialogHeaderText: '#3D1B2E',
  
  alertInfoBackground: '#E3F2FD',
  alertInfoBorder: '#2196F3',
  alertInfoText: '#0D47A1',
  
  alertWarningBackground: '#FFF8E1',
  alertWarningBorder: '#FFC107',
  alertWarningText: '#F57F17',
  
  alertErrorBackground: '#FFEBEE',
  alertErrorBorder: '#F44336',
  alertErrorText: '#C62828',
  
  alertSuccessBackground: '#F3E5F5',
  alertSuccessBorder: '#AB47BC',
  alertSuccessText: '#6A1B9A',
  
  // Tooltips
  tooltipBackground: '#3D1B2E',
  tooltipBorder: '#D96AA3',
  tooltipText: '#FFFFFF',
  tooltipShadow: 'rgba(217, 106, 163, 0.4)',
  
  // Badges & Notifications
  badgeBackground: '#D96AA3',
  badgeBorder: '#C55892',
  badgeText: '#FFFFFF',
  
  notificationBackground: '#FFFFFF',
  notificationBorder: '#F5E0ED',
  notificationText: '#3D1B2E',
  notificationIconInfo: '#2196F3',
  notificationIconWarning: '#FFC107',
  notificationIconError: '#F44336',
  notificationIconSuccess: '#AB47BC',
  
  // Context Menus
  contextMenuBackground: '#FFFFFF',
  contextMenuBorder: '#F5E0ED',
  contextMenuText: '#3D1B2E',
  contextMenuTextDisabled: '#D9BECF',
  contextMenuHighlight: '#D96AA3',
  contextMenuHighlightText: '#FFFFFF',
  contextMenuSeparator: '#F5E0ED',
  
  // Status Bar
  statusBarBackground: '#FFF5F9',
  statusBarBorder: '#F5E0ED',
  statusBarText: '#3D1B2E',
  statusBarIconDefault: '#A87E96',
  statusBarIconActive: '#D96AA3',
  
  // Dock
  dockBackground: 'rgba(255, 245, 249, 0.95)',
  dockBorder: '#F5E0ED',
  dockShadow: 'rgba(183, 74, 141, 0.2)',
  dockIconBorder: 'transparent',
  dockIconBorderHover: '#F5E0ED',
  dockIconBorderActive: '#D96AA3',
  dockIndicator: '#D96AA3',
  
  // Desktop
  desktopBackground: 'linear-gradient(135deg, #667EEA 0%, #764BA2 50%, #F093FB 100%)',
  desktopPattern: 'rgba(255, 255, 255, 0.05)',
  desktopIconText: '#FFFFFF',
  desktopIconTextBackground: 'rgba(61, 27, 46, 0.6)',
  desktopIconTextBackgroundSelected: '#3D1B2E',
  desktopIconBorder: 'transparent',
  desktopIconBorderSelected: '#FFFFFF',
  
  // Tabs
  tabBackground: '#FFEAF4',
  tabBackgroundHover: '#FFF5F9',
  tabBackgroundActive: '#FFFFFF',
  tabBorder: '#D99FC5',
  tabText: '#7A4D65',
  tabTextActive: '#3D1B2E',
  
  // Dividers
  dividerColor: '#F5E0ED',
  
  // Focus States
  focusOutline: '#D96AA3',
  focusOutlineOffset: '2px',
  
  // Shadows
  shadowLight: 'rgba(183, 74, 141, 0.1)',
  shadowMedium: 'rgba(183, 74, 141, 0.2)',
  shadowHeavy: 'rgba(183, 74, 141, 0.4)',
  
  // Miscellaneous
  overlayBackground: 'rgba(61, 27, 46, 0.6)',
  loadingSpinnerPrimary: '#D96AA3',
  loadingSpinnerSecondary: '#B74A8D',
  errorColor: '#F44336',
  warningColor: '#FFC107',
  successColor: '#AB47BC',
  infoColor: '#2196F3',
};

const sunsetPatterns: ThemePatterns = {
  titleBarActive: 'gradient',
  titleBarInactive: 'solid',
  windowTexture: 'subtle',
  desktopPattern: 'stippled',
  scrollbarStyle: 'modern',
};

export const SUNSET_THEME: Theme = {
  id: 'sunset',
  name: 'Sunset',
  description: 'Warm purples and pinks inspired by twilight - dreamy and romantic',
  colors: sunsetColors,
  patterns: sunsetPatterns,
  defaultCustomization: {
    cornerStyle: 'rounded',
    windowOpacity: 0.98,
    menuBarStyle: 'translucent',
    fontSize: 'medium',
    scrollbarWidth: 'normal',
    scrollbarArrowStyle: 'modern',
    scrollbarAutoHide: false,
  },
};

