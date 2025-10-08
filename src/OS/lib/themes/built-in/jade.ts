/**
 * Jade Theme
 * Calming greens inspired by nature - peaceful and easy on the eyes
 * Phase 8D: New theme
 */

import type { Theme, ThemeColors, ThemePatterns } from '../../../types/theme';

const jadeColors: ThemeColors = {
  // Windows
  windowBackground: '#F5FBF7',
  windowBorder: '#2D7A4F',
  windowBorderInactive: '#8BC9A8',
  windowShadow: 'rgba(45, 122, 79, 0.3)',
  
  // Title Bars
  titleBarActive: '#2D7A4F',
  titleBarInactive: '#D8F3E3',
  titleBarText: '#FFFFFF',
  titleBarTextInactive: '#6B8E7A',
  titleBarShadow: '#1F5A39',
  
  // Text
  textPrimary: '#1A3A2B',
  textSecondary: '#4A6B56',
  textTertiary: '#7A9B88',
  textDisabled: '#B8D4C5',
  textInverted: '#FFFFFF',
  
  // Highlights & Selection
  highlight: '#3DA86B',
  highlightText: '#FFFFFF',
  highlightHover: '#4DBB7C',
  selectionBackground: 'rgba(61, 168, 107, 0.25)',
  selectionText: '#1A3A2B',
  
  // Buttons
  buttonBackground: '#F5FBF7',
  buttonBackgroundHover: '#FFFFFF',
  buttonBackgroundActive: '#E5F5EB',
  buttonBackgroundDisabled: '#F5FBF7',
  buttonBorder: '#2D7A4F',
  buttonBorderHover: '#3DA86B',
  buttonText: '#1A3A2B',
  buttonTextDisabled: '#B8D4C5',
  buttonShadow: '#D8F3E3',
  buttonHighlight: '#FFFFFF',
  
  // Primary Buttons
  buttonPrimaryBackground: '#3DA86B',
  buttonPrimaryBackgroundHover: '#4DBB7C',
  buttonPrimaryBackgroundActive: '#2D965A',
  buttonPrimaryText: '#FFFFFF',
  buttonPrimaryBorder: '#2D965A',
  
  // Cancel Buttons
  buttonCancelBackground: '#F5FBF7',
  buttonCancelBackgroundHover: '#E5F5EB',
  buttonCancelText: '#4A6B56',
  
  // Inputs
  inputBackground: '#FFFFFF',
  inputBackgroundFocused: '#FFFFFF',
  inputBackgroundDisabled: '#F5FBF7',
  inputBorder: '#8BC9A8',
  inputBorderFocused: '#3DA86B',
  inputBorderDisabled: '#B8D4C5',
  inputText: '#1A3A2B',
  inputTextDisabled: '#7A9B88',
  inputPlaceholder: '#B8D4C5',
  inputShadow: '#D8F3E3',
  
  // Menus
  menuBackground: '#FFFFFF',
  menuBorder: '#2D7A4F',
  menuText: '#1A3A2B',
  menuTextDisabled: '#B8D4C5',
  menuHighlight: '#3DA86B',
  menuHighlightText: '#FFFFFF',
  menuSeparator: '#D8F3E3',
  menuShadow: 'rgba(45, 122, 79, 0.2)',
  
  // Menu Bar
  menuBarBackground: '#FFFFFF',
  menuBarBorder: '#D8F3E3',
  menuBarText: '#1A3A2B',
  menuBarHighlight: '#3DA86B',
  
  // Scrollbars
  scrollbarBackground: '#F5FBF7',
  scrollbarBorder: '#D8F3E3',
  scrollbarThumb: '#FFFFFF',
  scrollbarThumbHover: '#FAFEFB',
  scrollbarThumbActive: '#E5F5EB',
  scrollbarArrowBackground: '#FFFFFF',
  scrollbarArrowBackgroundHover: '#FAFEFB',
  scrollbarArrowBackgroundActive: '#E5F5EB',
  scrollbarArrowIcon: '#3DA86B',
  
  // Checkboxes & Radios
  checkboxBackground: '#FFFFFF',
  checkboxBackgroundChecked: '#3DA86B',
  checkboxBackgroundDisabled: '#F5FBF7',
  checkboxBorder: '#8BC9A8',
  checkboxBorderChecked: '#3DA86B',
  checkboxBorderFocused: '#3DA86B',
  checkboxCheck: '#FFFFFF',
  
  radioBackground: '#FFFFFF',
  radioBackgroundChecked: '#3DA86B',
  radioBackgroundDisabled: '#F5FBF7',
  radioBorder: '#8BC9A8',
  radioBorderChecked: '#3DA86B',
  radioBorderFocused: '#3DA86B',
  radioDot: '#FFFFFF',
  
  // Sliders
  sliderTrack: '#D8F3E3',
  sliderTrackFilled: '#3DA86B',
  sliderThumb: '#FFFFFF',
  sliderThumbHover: '#FAFEFB',
  sliderThumbActive: '#E5F5EB',
  sliderBorder: '#8BC9A8',
  
  // Progress Bars
  progressBackground: '#D8F3E3',
  progressFill: '#3DA86B',
  progressBorder: '#8BC9A8',
  progressStripe: 'rgba(255, 255, 255, 0.3)',
  
  // Dialogs & Alerts
  dialogBackground: '#F5FBF7',
  dialogBorder: '#2D7A4F',
  dialogShadow: 'rgba(45, 122, 79, 0.3)',
  dialogHeaderBackground: '#FFFFFF',
  dialogHeaderText: '#1A3A2B',
  
  alertInfoBackground: '#E3F2FD',
  alertInfoBorder: '#2196F3',
  alertInfoText: '#0D47A1',
  
  alertWarningBackground: '#FFF8E1',
  alertWarningBorder: '#FFC107',
  alertWarningText: '#F57F17',
  
  alertErrorBackground: '#FFEBEE',
  alertErrorBorder: '#F44336',
  alertErrorText: '#C62828',
  
  alertSuccessBackground: '#E8F5E9',
  alertSuccessBorder: '#3DA86B',
  alertSuccessText: '#1B5E20',
  
  // Tooltips
  tooltipBackground: '#1A3A2B',
  tooltipBorder: '#3DA86B',
  tooltipText: '#FFFFFF',
  tooltipShadow: 'rgba(61, 168, 107, 0.4)',
  
  // Badges & Notifications
  badgeBackground: '#3DA86B',
  badgeBorder: '#2D965A',
  badgeText: '#FFFFFF',
  
  notificationBackground: '#FFFFFF',
  notificationBorder: '#D8F3E3',
  notificationText: '#1A3A2B',
  notificationIconInfo: '#2196F3',
  notificationIconWarning: '#FFC107',
  notificationIconError: '#F44336',
  notificationIconSuccess: '#3DA86B',
  
  // Context Menus
  contextMenuBackground: '#FFFFFF',
  contextMenuBorder: '#D8F3E3',
  contextMenuText: '#1A3A2B',
  contextMenuTextDisabled: '#B8D4C5',
  contextMenuHighlight: '#3DA86B',
  contextMenuHighlightText: '#FFFFFF',
  contextMenuSeparator: '#D8F3E3',
  
  // Status Bar
  statusBarBackground: '#F5FBF7',
  statusBarBorder: '#D8F3E3',
  statusBarText: '#1A3A2B',
  statusBarIconDefault: '#7A9B88',
  statusBarIconActive: '#3DA86B',
  
  // Dock
  dockBackground: 'rgba(245, 251, 247, 0.95)',
  dockBorder: '#D8F3E3',
  dockShadow: 'rgba(45, 122, 79, 0.2)',
  dockIconBorder: 'transparent',
  dockIconBorderHover: '#D8F3E3',
  dockIconBorderActive: '#3DA86B',
  dockIndicator: '#3DA86B',
  
  // Desktop
  desktopBackground: '#2D7A4F',
  desktopPattern: 'rgba(255, 255, 255, 0.05)',
  desktopIconText: '#FFFFFF',
  desktopIconTextBackground: 'rgba(26, 58, 43, 0.6)',
  desktopIconTextBackgroundSelected: '#1A3A2B',
  desktopIconBorder: 'transparent',
  desktopIconBorderSelected: '#FFFFFF',
  
  // Tabs
  tabBackground: '#E5F5EB',
  tabBackgroundHover: '#F5FBF7',
  tabBackgroundActive: '#FFFFFF',
  tabBorder: '#8BC9A8',
  tabText: '#4A6B56',
  tabTextActive: '#1A3A2B',
  
  // Dividers
  dividerColor: '#D8F3E3',
  
  // Focus States
  focusOutline: '#3DA86B',
  focusOutlineOffset: '2px',
  
  // Shadows
  shadowLight: 'rgba(45, 122, 79, 0.1)',
  shadowMedium: 'rgba(45, 122, 79, 0.2)',
  shadowHeavy: 'rgba(45, 122, 79, 0.4)',
  
  // Miscellaneous
  overlayBackground: 'rgba(26, 58, 43, 0.6)',
  loadingSpinnerPrimary: '#3DA86B',
  loadingSpinnerSecondary: '#2D7A4F',
  errorColor: '#F44336',
  warningColor: '#FFC107',
  successColor: '#3DA86B',
  infoColor: '#2196F3',
};

const jadePatterns: ThemePatterns = {
  titleBarActive: 'solid',
  titleBarInactive: 'solid',
  windowTexture: 'subtle',
  desktopPattern: 'stippled',
  scrollbarStyle: 'classic',
};

export const JADE_THEME: Theme = {
  id: 'jade',
  name: 'Jade',
  description: 'Calming greens inspired by nature - peaceful and rejuvenating',
  colors: jadeColors,
  patterns: jadePatterns,
  defaultCustomization: {
    cornerStyle: 'rounded',
    windowOpacity: 0.98,
    menuBarStyle: 'opaque',
    fontSize: 'medium',
    scrollbarWidth: 'normal',
    scrollbarArrowStyle: 'classic',
    scrollbarAutoHide: false,
  },
};

