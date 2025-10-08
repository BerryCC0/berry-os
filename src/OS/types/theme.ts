/**
 * Theme Types - Comprehensive Theme System
 * Defines 150+ themeable properties for complete UI customization
 * Phase 1 of Comprehensive Theming System
 */

export interface ThemeColors {
  // ==================== Windows ====================
  windowBackground: string;
  windowBorder: string;
  windowBorderInactive: string;
  windowShadow: string;
  
  // ==================== Title Bars ====================
  titleBarActive: string;
  titleBarInactive: string;
  titleBarText: string;
  titleBarTextInactive: string;
  titleBarShadow: string;
  
  // ==================== Text ====================
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textDisabled: string;
  textInverted: string; // For dark backgrounds
  
  // ==================== Highlights & Selection ====================
  highlight: string;
  highlightText: string;
  highlightHover: string;
  selectionBackground: string;
  selectionText: string;
  
  // ==================== Buttons ====================
  buttonBackground: string;
  buttonBackgroundHover: string;
  buttonBackgroundActive: string;
  buttonBackgroundDisabled: string;
  buttonBorder: string;
  buttonBorderHover: string;
  buttonText: string;
  buttonTextDisabled: string;
  buttonShadow: string;
  buttonHighlight: string; // For 3D effect
  
  // Primary buttons (OK, Save, etc.)
  buttonPrimaryBackground: string;
  buttonPrimaryBackgroundHover: string;
  buttonPrimaryBackgroundActive: string;
  buttonPrimaryText: string;
  buttonPrimaryBorder: string;
  
  // Cancel buttons
  buttonCancelBackground: string;
  buttonCancelBackgroundHover: string;
  buttonCancelText: string;
  
  // ==================== Inputs ====================
  inputBackground: string;
  inputBackgroundFocused: string;
  inputBackgroundDisabled: string;
  inputBorder: string;
  inputBorderFocused: string;
  inputBorderDisabled: string;
  inputText: string;
  inputTextDisabled: string;
  inputPlaceholder: string;
  inputShadow: string; // Inset shadow for depth
  
  // ==================== Menus ====================
  menuBackground: string;
  menuBorder: string;
  menuText: string;
  menuTextDisabled: string;
  menuHighlight: string;
  menuHighlightText: string;
  menuSeparator: string;
  menuShadow: string;
  
  // Menu bar specific
  menuBarBackground: string;
  menuBarBorder: string;
  menuBarText: string;
  menuBarHighlight: string;
  
  // ==================== Scrollbars ====================
  scrollbarBackground: string;
  scrollbarBorder: string;
  scrollbarThumb: string;
  scrollbarThumbHover: string;
  scrollbarThumbActive: string;
  scrollbarArrowBackground: string;
  scrollbarArrowBackgroundHover: string;
  scrollbarArrowBackgroundActive: string;
  scrollbarArrowIcon: string;
  
  // ==================== Checkboxes & Radios ====================
  checkboxBackground: string;
  checkboxBackgroundChecked: string;
  checkboxBackgroundDisabled: string;
  checkboxBorder: string;
  checkboxBorderChecked: string;
  checkboxBorderFocused: string;
  checkboxCheck: string; // Checkmark color
  
  radioBackground: string;
  radioBackgroundChecked: string;
  radioBackgroundDisabled: string;
  radioBorder: string;
  radioBorderChecked: string;
  radioBorderFocused: string;
  radioDot: string; // Inner dot color
  
  // ==================== Sliders ====================
  sliderTrack: string;
  sliderTrackFilled: string;
  sliderThumb: string;
  sliderThumbHover: string;
  sliderThumbActive: string;
  sliderBorder: string;
  
  // ==================== Progress Bars ====================
  progressBackground: string;
  progressFill: string;
  progressBorder: string;
  progressStripe: string; // For striped pattern
  
  // ==================== Dialogs & Alerts ====================
  dialogBackground: string;
  dialogBorder: string;
  dialogShadow: string;
  dialogHeaderBackground: string;
  dialogHeaderText: string;
  
  alertInfoBackground: string;
  alertInfoBorder: string;
  alertInfoText: string;
  
  alertWarningBackground: string;
  alertWarningBorder: string;
  alertWarningText: string;
  
  alertErrorBackground: string;
  alertErrorBorder: string;
  alertErrorText: string;
  
  alertSuccessBackground: string;
  alertSuccessBorder: string;
  alertSuccessText: string;
  
  // ==================== Tooltips ====================
  tooltipBackground: string;
  tooltipBorder: string;
  tooltipText: string;
  tooltipShadow: string;
  
  // ==================== Badges & Notifications ====================
  badgeBackground: string;
  badgeBorder: string;
  badgeText: string;
  
  notificationBackground: string;
  notificationBorder: string;
  notificationText: string;
  notificationIconInfo: string;
  notificationIconWarning: string;
  notificationIconError: string;
  notificationIconSuccess: string;
  
  // ==================== Context Menus ====================
  contextMenuBackground: string;
  contextMenuBorder: string;
  contextMenuText: string;
  contextMenuTextDisabled: string;
  contextMenuHighlight: string;
  contextMenuHighlightText: string;
  contextMenuSeparator: string;
  
  // ==================== Status Bar ====================
  statusBarBackground: string;
  statusBarBorder: string;
  statusBarText: string;
  statusBarIconDefault: string;
  statusBarIconActive: string;
  
  // ==================== Dock ====================
  dockBackground: string;
  dockBorder: string;
  dockShadow: string;
  dockIconBorder: string;
  dockIconBorderHover: string;
  dockIconBorderActive: string;
  dockIndicator: string; // Running app indicator
  
  // ==================== Desktop ====================
  desktopBackground: string;
  desktopPattern: string; // Pattern overlay color
  desktopIconText: string;
  desktopIconTextBackground: string;
  desktopIconTextBackgroundSelected: string;
  desktopIconBorder: string;
  desktopIconBorderSelected: string;
  
  // ==================== Tabs ====================
  tabBackground: string;
  tabBackgroundHover: string;
  tabBackgroundActive: string;
  tabBorder: string;
  tabText: string;
  tabTextActive: string;
  
  // ==================== Dividers ====================
  dividerColor: string;
  
  // ==================== Focus States ====================
  focusOutline: string;
  focusOutlineOffset: string;
  
  // ==================== Shadows ====================
  shadowLight: string;
  shadowMedium: string;
  shadowHeavy: string;
  
  // ==================== Miscellaneous ====================
  overlayBackground: string; // For modals, dropdowns
  loadingSpinnerPrimary: string;
  loadingSpinnerSecondary: string;
  errorColor: string;
  warningColor: string;
  successColor: string;
  infoColor: string;
}

export interface ThemePatterns {
  titleBarActive: 'pinstripe' | 'gradient' | 'solid' | 'gradient-light';
  titleBarInactive: 'pinstripe' | 'gradient' | 'solid' | 'gradient-light';
  windowTexture: 'none' | 'subtle' | 'strong';
  desktopPattern: 'stippled' | 'none' | 'custom';
  scrollbarStyle: 'classic' | 'modern' | 'minimal';
}

export interface ThemeFonts {
  systemFont: string;  // 'chicago' | 'monaco' | 'courier' | custom font ID
  interfaceFont: string;  // 'geneva' | 'helvetica' | 'arial' | custom font ID
  customSystemFont?: string;  // URL to custom web font
  customInterfaceFont?: string;  // URL to custom web font
  systemFontWeight?: 'normal' | 'medium' | 'bold';
  interfaceFontWeight?: 'normal' | 'medium' | 'bold';
  monospacedFont?: string;  // For code/terminal (optional)
}

export interface ThemeCustomization {
  cornerStyle?: 'sharp' | 'rounded';
  windowOpacity?: number; // 0.85 - 1.0
  menuBarStyle?: 'opaque' | 'translucent';
  fontSize?: 'small' | 'medium' | 'large';
  scrollbarWidth?: 'thin' | 'normal' | 'thick';
  scrollbarArrowStyle?: 'classic' | 'modern' | 'none';
  scrollbarAutoHide?: boolean;
  titleBarStyle?: 'pinstripe' | 'gradient' | 'solid' | 'gradient-light';
  fonts?: ThemeFonts;  // Font customization
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
  patterns: ThemePatterns;
  fonts?: ThemeFonts;  // Font configuration (optional, defaults to Chicago/Geneva)
  // Customization defaults (user can override)
  defaultCustomization?: Partial<ThemeCustomization>;
  // Metadata for custom themes
  metadata?: {
    author?: string;
    version?: string;
    createdAt?: number;
    isCustom?: boolean;  // User-created vs built-in
  };
}

export type ThemeId = 'classic' | 'platinum' | 'dark' | 'nounish' | 'tangerine' | 'custom' | string;

// Custom theme extends Theme with user-specific data
export interface CustomTheme extends Theme {
  userId: string;  // Wallet address
  isActive: boolean;
  shareCode?: string;  // If shared
}

