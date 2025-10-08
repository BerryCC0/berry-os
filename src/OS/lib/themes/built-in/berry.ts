/**
 * Berry Theme
 * Brand colors - blues and purples with Berry's signature aesthetic
 * Phase 8D: New theme
 */

import type { Theme, ThemeColors, ThemePatterns } from '../../../types/theme';

const berryColors: ThemeColors = {
  // Windows
  windowBackground: '#F8F9FF',
  windowBorder: '#5B4FE5',
  windowBorderInactive: '#A39BE5',
  windowShadow: 'rgba(91, 79, 229, 0.3)',
  
  // Title Bars
  titleBarActive: '#5B4FE5',
  titleBarInactive: '#E5E3FF',
  titleBarText: '#FFFFFF',
  titleBarTextInactive: '#8880CC',
  titleBarShadow: '#4A3DD4',
  
  // Text
  textPrimary: '#1A1333',
  textSecondary: '#6B5FB3',
  textTertiary: '#9B8FCC',
  textDisabled: '#C5BFEE',
  textInverted: '#FFFFFF',
  
  // Highlights & Selection
  highlight: '#5B4FE5',
  highlightText: '#FFFFFF',
  highlightHover: '#6D5FF7',
  selectionBackground: 'rgba(91, 79, 229, 0.2)',
  selectionText: '#1A1333',
  
  // Buttons
  buttonBackground: '#F8F9FF',
  buttonBackgroundHover: '#FFFFFF',
  buttonBackgroundActive: '#E5E3FF',
  buttonBackgroundDisabled: '#F8F9FF',
  buttonBorder: '#5B4FE5',
  buttonBorderHover: '#6D5FF7',
  buttonText: '#1A1333',
  buttonTextDisabled: '#C5BFEE',
  buttonShadow: '#E5E3FF',
  buttonHighlight: '#FFFFFF',
  
  // Primary Buttons
  buttonPrimaryBackground: '#5B4FE5',
  buttonPrimaryBackgroundHover: '#6D5FF7',
  buttonPrimaryBackgroundActive: '#4A3DD4',
  buttonPrimaryText: '#FFFFFF',
  buttonPrimaryBorder: '#4A3DD4',
  
  // Cancel Buttons
  buttonCancelBackground: '#F8F9FF',
  buttonCancelBackgroundHover: '#E5E3FF',
  buttonCancelText: '#6B5FB3',
  
  // Inputs
  inputBackground: '#FFFFFF',
  inputBackgroundFocused: '#FFFFFF',
  inputBackgroundDisabled: '#F8F9FF',
  inputBorder: '#A39BE5',
  inputBorderFocused: '#5B4FE5',
  inputBorderDisabled: '#C5BFEE',
  inputText: '#1A1333',
  inputTextDisabled: '#9B8FCC',
  inputPlaceholder: '#C5BFEE',
  inputShadow: '#E5E3FF',
  
  // Menus
  menuBackground: '#FFFFFF',
  menuBorder: '#5B4FE5',
  menuText: '#1A1333',
  menuTextDisabled: '#C5BFEE',
  menuHighlight: '#5B4FE5',
  menuHighlightText: '#FFFFFF',
  menuSeparator: '#E5E3FF',
  menuShadow: 'rgba(91, 79, 229, 0.2)',
  
  // Menu Bar
  menuBarBackground: '#FFFFFF',
  menuBarBorder: '#E5E3FF',
  menuBarText: '#1A1333',
  menuBarHighlight: '#5B4FE5',
  
  // Scrollbars
  scrollbarBackground: '#F8F9FF',
  scrollbarBorder: '#E5E3FF',
  scrollbarThumb: '#FFFFFF',
  scrollbarThumbHover: '#F0EFFF',
  scrollbarThumbActive: '#E5E3FF',
  scrollbarArrowBackground: '#FFFFFF',
  scrollbarArrowBackgroundHover: '#F0EFFF',
  scrollbarArrowBackgroundActive: '#E5E3FF',
  scrollbarArrowIcon: '#5B4FE5',
  
  // Checkboxes & Radios
  checkboxBackground: '#FFFFFF',
  checkboxBackgroundChecked: '#5B4FE5',
  checkboxBackgroundDisabled: '#F8F9FF',
  checkboxBorder: '#A39BE5',
  checkboxBorderChecked: '#5B4FE5',
  checkboxBorderFocused: '#5B4FE5',
  checkboxCheck: '#FFFFFF',
  
  radioBackground: '#FFFFFF',
  radioBackgroundChecked: '#5B4FE5',
  radioBackgroundDisabled: '#F8F9FF',
  radioBorder: '#A39BE5',
  radioBorderChecked: '#5B4FE5',
  radioBorderFocused: '#5B4FE5',
  radioDot: '#FFFFFF',
  
  // Sliders
  sliderTrack: '#E5E3FF',
  sliderTrackFilled: '#5B4FE5',
  sliderThumb: '#FFFFFF',
  sliderThumbHover: '#F0EFFF',
  sliderThumbActive: '#E5E3FF',
  sliderBorder: '#A39BE5',
  
  // Progress Bars
  progressBackground: '#E5E3FF',
  progressFill: '#5B4FE5',
  progressBorder: '#A39BE5',
  progressStripe: 'rgba(255, 255, 255, 0.3)',
  
  // Dialogs & Alerts
  dialogBackground: '#F8F9FF',
  dialogBorder: '#5B4FE5',
  dialogShadow: 'rgba(91, 79, 229, 0.3)',
  dialogHeaderBackground: '#FFFFFF',
  dialogHeaderText: '#1A1333',
  
  alertInfoBackground: '#E3F2FF',
  alertInfoBorder: '#2196F3',
  alertInfoText: '#0D47A1',
  
  alertWarningBackground: '#FFF8E1',
  alertWarningBorder: '#FFC107',
  alertWarningText: '#F57F17',
  
  alertErrorBackground: '#FFEBEE',
  alertErrorBorder: '#F44336',
  alertErrorText: '#C62828',
  
  alertSuccessBackground: '#E8F5E9',
  alertSuccessBorder: '#4CAF50',
  alertSuccessText: '#2E7D32',
  
  // Tooltips
  tooltipBackground: '#1A1333',
  tooltipBorder: '#5B4FE5',
  tooltipText: '#FFFFFF',
  tooltipShadow: 'rgba(91, 79, 229, 0.4)',
  
  // Badges & Notifications
  badgeBackground: '#5B4FE5',
  badgeBorder: '#4A3DD4',
  badgeText: '#FFFFFF',
  
  notificationBackground: '#FFFFFF',
  notificationBorder: '#E5E3FF',
  notificationText: '#1A1333',
  notificationIconInfo: '#2196F3',
  notificationIconWarning: '#FFC107',
  notificationIconError: '#F44336',
  notificationIconSuccess: '#4CAF50',
  
  // Context Menus
  contextMenuBackground: '#FFFFFF',
  contextMenuBorder: '#E5E3FF',
  contextMenuText: '#1A1333',
  contextMenuTextDisabled: '#C5BFEE',
  contextMenuHighlight: '#5B4FE5',
  contextMenuHighlightText: '#FFFFFF',
  contextMenuSeparator: '#E5E3FF',
  
  // Status Bar
  statusBarBackground: '#F8F9FF',
  statusBarBorder: '#E5E3FF',
  statusBarText: '#1A1333',
  statusBarIconDefault: '#9B8FCC',
  statusBarIconActive: '#5B4FE5',
  
  // Dock
  dockBackground: 'rgba(248, 249, 255, 0.95)',
  dockBorder: '#E5E3FF',
  dockShadow: 'rgba(91, 79, 229, 0.2)',
  dockIconBorder: 'transparent',
  dockIconBorderHover: '#E5E3FF',
  dockIconBorderActive: '#5B4FE5',
  dockIndicator: '#5B4FE5',
  
  // Desktop
  desktopBackground: '#6D5FF7',
  desktopPattern: 'rgba(255, 255, 255, 0.05)',
  desktopIconText: '#FFFFFF',
  desktopIconTextBackground: 'rgba(26, 19, 51, 0.6)',
  desktopIconTextBackgroundSelected: '#1A1333',
  desktopIconBorder: 'transparent',
  desktopIconBorderSelected: '#FFFFFF',
  
  // Tabs
  tabBackground: '#E5E3FF',
  tabBackgroundHover: '#F8F9FF',
  tabBackgroundActive: '#FFFFFF',
  tabBorder: '#A39BE5',
  tabText: '#6B5FB3',
  tabTextActive: '#1A1333',
  
  // Dividers
  dividerColor: '#E5E3FF',
  
  // Focus States
  focusOutline: '#5B4FE5',
  focusOutlineOffset: '2px',
  
  // Shadows
  shadowLight: 'rgba(91, 79, 229, 0.1)',
  shadowMedium: 'rgba(91, 79, 229, 0.2)',
  shadowHeavy: 'rgba(91, 79, 229, 0.4)',
  
  // Miscellaneous
  overlayBackground: 'rgba(26, 19, 51, 0.6)',
  loadingSpinnerPrimary: '#5B4FE5',
  loadingSpinnerSecondary: '#6D5FF7',
  errorColor: '#F44336',
  warningColor: '#FFC107',
  successColor: '#4CAF50',
  infoColor: '#2196F3',
};

const berryPatterns: ThemePatterns = {
  titleBarActive: 'gradient',
  titleBarInactive: 'solid',
  windowTexture: 'subtle',
  desktopPattern: 'stippled',
  scrollbarStyle: 'modern',
};

export const BERRY_THEME: Theme = {
  id: 'berry',
  name: 'Berry',
  description: 'Berry brand colors - blues and purples with modern elegance',
  colors: berryColors,
  patterns: berryPatterns,
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

