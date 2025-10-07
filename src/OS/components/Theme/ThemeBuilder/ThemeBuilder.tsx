/**
 * ThemeBuilder Component
 * Comprehensive theme customization UI - Phase 4
 * 8 tabs with 150+ color controls for complete UI theming
 */

import { useState } from 'react';
import ColorPicker from '../../UI/ColorPicker/ColorPicker';
import Select from '../../UI/Select/Select';
import Slider from '../../UI/Slider/Slider';
import Checkbox from '../../UI/Checkbox/Checkbox';
import Button from '../../UI/Button/Button';
import Divider from '../../UI/Divider/Divider';
import Tabs from '../../UI/Tabs/Tabs';
import { Theme, ThemeColors, ThemePatterns, ThemeCustomization } from '../../../types/theme';
import { NOUNS_ACCENT_COLORS } from '../../../lib/nounsThemes';
import styles from './ThemeBuilder.module.css';

export interface ThemeBuilderProps {
  theme: Theme;
  onChange: (theme: Theme) => void;
  onSave?: () => void;
  onCancel?: () => void;
  className?: string;
}

export default function ThemeBuilder({
  theme,
  onChange,
  onSave,
  onCancel,
  className = '',
}: ThemeBuilderProps) {
  const [activeTab, setActiveTab] = useState<string>('windows');

  // Helper to update theme colors
  const updateColor = (key: keyof ThemeColors, value: string) => {
    onChange({
      ...theme,
      colors: { ...theme.colors, [key]: value },
    });
  };

  // Helper to update theme patterns
  const updatePattern = <K extends keyof ThemePatterns>(key: K, value: ThemePatterns[K]) => {
    onChange({
      ...theme,
      patterns: { ...theme.patterns, [key]: value },
    });
  };

  // Helper to update theme customization (via defaultCustomization)
  const updateCustomization = <K extends keyof ThemeCustomization>(key: K, value: ThemeCustomization[K]) => {
    onChange({
      ...theme,
      defaultCustomization: { ...theme.defaultCustomization, [key]: value },
    });
  };

  // Nouns color presets for ColorPicker
  const nounsPresets = Object.values(NOUNS_ACCENT_COLORS);

  // Helper to create a color field
  const ColorField = ({ label, colorKey }: { label: string; colorKey: keyof ThemeColors }) => (
    <div className={styles.field}>
      <label className={styles.label}>{label}:</label>
      <ColorPicker
        value={theme.colors[colorKey]}
        onChange={(color) => updateColor(colorKey, color)}
        presets={nounsPresets}
      />
    </div>
  );

  return (
    <div className={`${styles.themeBuilder} ${className}`}>
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          // ==================== Tab 1: Windows & Chrome ====================
          {
            id: 'windows',
            label: 'Windows & Chrome',
            content: (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Window Properties</h3>
                <ColorField label="Window Background" colorKey="windowBackground" />
                <Divider />
                <ColorField label="Window Border" colorKey="windowBorder" />
                <Divider />
                <ColorField label="Window Border (Inactive)" colorKey="windowBorderInactive" />
                <Divider />
                <ColorField label="Window Shadow" colorKey="windowShadow" />
                
                <h3 className={styles.sectionTitle}>Title Bars</h3>
                <ColorField label="Title Bar (Active)" colorKey="titleBarActive" />
                <Divider />
                <ColorField label="Title Bar (Inactive)" colorKey="titleBarInactive" />
                <Divider />
                <ColorField label="Title Bar Text" colorKey="titleBarText" />
                <Divider />
                <ColorField label="Title Bar Text (Inactive)" colorKey="titleBarTextInactive" />
                <Divider />
                <ColorField label="Title Bar Shadow" colorKey="titleBarShadow" />
              </div>
            ),
          },

          // ==================== Tab 2: Text & Selection ====================
          {
            id: 'text',
            label: 'Text & Selection',
            content: (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Text Colors</h3>
                <ColorField label="Primary Text" colorKey="textPrimary" />
                <Divider />
                <ColorField label="Secondary Text" colorKey="textSecondary" />
                <Divider />
                <ColorField label="Tertiary Text" colorKey="textTertiary" />
                <Divider />
                <ColorField label="Disabled Text" colorKey="textDisabled" />
                <Divider />
                <ColorField label="Inverted Text" colorKey="textInverted" />
                
                <h3 className={styles.sectionTitle}>Highlights & Selection</h3>
                <ColorField label="Highlight" colorKey="highlight" />
                <Divider />
                <ColorField label="Highlight Text" colorKey="highlightText" />
                <Divider />
                <ColorField label="Highlight (Hover)" colorKey="highlightHover" />
                <Divider />
                <ColorField label="Selection Background" colorKey="selectionBackground" />
                <Divider />
                <ColorField label="Selection Text" colorKey="selectionText" />
              </div>
            ),
          },

          // ==================== Tab 3: Buttons & Inputs ====================
          {
            id: 'controls',
            label: 'Buttons & Inputs',
            content: (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Buttons</h3>
                <ColorField label="Button Background" colorKey="buttonBackground" />
                <Divider />
                <ColorField label="Button Background (Hover)" colorKey="buttonBackgroundHover" />
                <Divider />
                <ColorField label="Button Background (Active)" colorKey="buttonBackgroundActive" />
                <Divider />
                <ColorField label="Button Background (Disabled)" colorKey="buttonBackgroundDisabled" />
                <Divider />
                <ColorField label="Button Border" colorKey="buttonBorder" />
                <Divider />
                <ColorField label="Button Border (Hover)" colorKey="buttonBorderHover" />
                <Divider />
                <ColorField label="Button Text" colorKey="buttonText" />
                <Divider />
                <ColorField label="Button Text (Disabled)" colorKey="buttonTextDisabled" />
                <Divider />
                <ColorField label="Button Shadow" colorKey="buttonShadow" />
                <Divider />
                <ColorField label="Button Highlight" colorKey="buttonHighlight" />

                <h3 className={styles.sectionTitle}>Primary Buttons</h3>
                <ColorField label="Primary Background" colorKey="buttonPrimaryBackground" />
                <Divider />
                <ColorField label="Primary Background (Hover)" colorKey="buttonPrimaryBackgroundHover" />
                <Divider />
                <ColorField label="Primary Background (Active)" colorKey="buttonPrimaryBackgroundActive" />
                <Divider />
                <ColorField label="Primary Text" colorKey="buttonPrimaryText" />
                <Divider />
                <ColorField label="Primary Border" colorKey="buttonPrimaryBorder" />

                <h3 className={styles.sectionTitle}>Cancel Buttons</h3>
                <ColorField label="Cancel Background" colorKey="buttonCancelBackground" />
                <Divider />
                <ColorField label="Cancel Background (Hover)" colorKey="buttonCancelBackgroundHover" />
                <Divider />
                <ColorField label="Cancel Text" colorKey="buttonCancelText" />

                <h3 className={styles.sectionTitle}>Inputs</h3>
                <ColorField label="Input Background" colorKey="inputBackground" />
                <Divider />
                <ColorField label="Input Background (Focused)" colorKey="inputBackgroundFocused" />
                <Divider />
                <ColorField label="Input Background (Disabled)" colorKey="inputBackgroundDisabled" />
                <Divider />
                <ColorField label="Input Border" colorKey="inputBorder" />
                <Divider />
                <ColorField label="Input Border (Focused)" colorKey="inputBorderFocused" />
                <Divider />
                <ColorField label="Input Border (Disabled)" colorKey="inputBorderDisabled" />
                <Divider />
                <ColorField label="Input Text" colorKey="inputText" />
                <Divider />
                <ColorField label="Input Text (Disabled)" colorKey="inputTextDisabled" />
                <Divider />
                <ColorField label="Input Placeholder" colorKey="inputPlaceholder" />
                <Divider />
                <ColorField label="Input Shadow" colorKey="inputShadow" />
              </div>
            ),
          },

          // ==================== Tab 4: Menus & Dropdowns ====================
          {
            id: 'menus',
            label: 'Menus',
            content: (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Menus</h3>
                <ColorField label="Menu Background" colorKey="menuBackground" />
                <Divider />
                <ColorField label="Menu Border" colorKey="menuBorder" />
                <Divider />
                <ColorField label="Menu Text" colorKey="menuText" />
                <Divider />
                <ColorField label="Menu Text (Disabled)" colorKey="menuTextDisabled" />
                <Divider />
                <ColorField label="Menu Highlight" colorKey="menuHighlight" />
                <Divider />
                <ColorField label="Menu Highlight Text" colorKey="menuHighlightText" />
                <Divider />
                <ColorField label="Menu Separator" colorKey="menuSeparator" />
                <Divider />
                <ColorField label="Menu Shadow" colorKey="menuShadow" />

                <h3 className={styles.sectionTitle}>Menu Bar</h3>
                <ColorField label="Menu Bar Background" colorKey="menuBarBackground" />
                <Divider />
                <ColorField label="Menu Bar Border" colorKey="menuBarBorder" />
                <Divider />
                <ColorField label="Menu Bar Text" colorKey="menuBarText" />
                <Divider />
                <ColorField label="Menu Bar Highlight" colorKey="menuBarHighlight" />

                <h3 className={styles.sectionTitle}>Context Menus</h3>
                <ColorField label="Context Menu Background" colorKey="contextMenuBackground" />
                <Divider />
                <ColorField label="Context Menu Border" colorKey="contextMenuBorder" />
                <Divider />
                <ColorField label="Context Menu Text" colorKey="contextMenuText" />
                <Divider />
                <ColorField label="Context Menu Text (Disabled)" colorKey="contextMenuTextDisabled" />
                <Divider />
                <ColorField label="Context Menu Highlight" colorKey="contextMenuHighlight" />
                <Divider />
                <ColorField label="Context Menu Highlight Text" colorKey="contextMenuHighlightText" />
                <Divider />
                <ColorField label="Context Menu Separator" colorKey="contextMenuSeparator" />
              </div>
            ),
          },

          // ==================== Tab 5: Scrollbars & Form Controls ====================
          {
            id: 'scrollbars',
            label: 'Scrollbars & Forms',
            content: (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Scrollbars</h3>
                <ColorField label="Scrollbar Background" colorKey="scrollbarBackground" />
                <Divider />
                <ColorField label="Scrollbar Border" colorKey="scrollbarBorder" />
                <Divider />
                <ColorField label="Scrollbar Thumb" colorKey="scrollbarThumb" />
                <Divider />
                <ColorField label="Scrollbar Thumb (Hover)" colorKey="scrollbarThumbHover" />
                <Divider />
                <ColorField label="Scrollbar Thumb (Active)" colorKey="scrollbarThumbActive" />
                <Divider />
                <ColorField label="Scrollbar Arrow Background" colorKey="scrollbarArrowBackground" />
                <Divider />
                <ColorField label="Scrollbar Arrow Background (Hover)" colorKey="scrollbarArrowBackgroundHover" />
                <Divider />
                <ColorField label="Scrollbar Arrow Background (Active)" colorKey="scrollbarArrowBackgroundActive" />
                <Divider />
                <ColorField label="Scrollbar Arrow Icon" colorKey="scrollbarArrowIcon" />

                <h3 className={styles.sectionTitle}>Checkboxes</h3>
                <ColorField label="Checkbox Background" colorKey="checkboxBackground" />
                <Divider />
                <ColorField label="Checkbox Background (Checked)" colorKey="checkboxBackgroundChecked" />
                <Divider />
                <ColorField label="Checkbox Background (Disabled)" colorKey="checkboxBackgroundDisabled" />
                <Divider />
                <ColorField label="Checkbox Border" colorKey="checkboxBorder" />
                <Divider />
                <ColorField label="Checkbox Border (Checked)" colorKey="checkboxBorderChecked" />
                <Divider />
                <ColorField label="Checkbox Border (Focused)" colorKey="checkboxBorderFocused" />
                <Divider />
                <ColorField label="Checkbox Check" colorKey="checkboxCheck" />

                <h3 className={styles.sectionTitle}>Radio Buttons</h3>
                <ColorField label="Radio Background" colorKey="radioBackground" />
                <Divider />
                <ColorField label="Radio Background (Checked)" colorKey="radioBackgroundChecked" />
                <Divider />
                <ColorField label="Radio Background (Disabled)" colorKey="radioBackgroundDisabled" />
                <Divider />
                <ColorField label="Radio Border" colorKey="radioBorder" />
                <Divider />
                <ColorField label="Radio Border (Checked)" colorKey="radioBorderChecked" />
                <Divider />
                <ColorField label="Radio Border (Focused)" colorKey="radioBorderFocused" />
                <Divider />
                <ColorField label="Radio Dot" colorKey="radioDot" />

                <h3 className={styles.sectionTitle}>Sliders</h3>
                <ColorField label="Slider Track" colorKey="sliderTrack" />
                <Divider />
                <ColorField label="Slider Track (Filled)" colorKey="sliderTrackFilled" />
                <Divider />
                <ColorField label="Slider Thumb" colorKey="sliderThumb" />
                <Divider />
                <ColorField label="Slider Thumb (Hover)" colorKey="sliderThumbHover" />
                <Divider />
                <ColorField label="Slider Thumb (Active)" colorKey="sliderThumbActive" />
                <Divider />
                <ColorField label="Slider Border" colorKey="sliderBorder" />

                <h3 className={styles.sectionTitle}>Progress Bars</h3>
                <ColorField label="Progress Background" colorKey="progressBackground" />
                <Divider />
                <ColorField label="Progress Fill" colorKey="progressFill" />
                <Divider />
                <ColorField label="Progress Border" colorKey="progressBorder" />
                <Divider />
                <ColorField label="Progress Stripe" colorKey="progressStripe" />
              </div>
            ),
          },

          // ==================== Tab 6: Dialogs & Notifications ====================
          {
            id: 'dialogs',
            label: 'Dialogs & Alerts',
            content: (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Dialogs</h3>
                <ColorField label="Dialog Background" colorKey="dialogBackground" />
                <Divider />
                <ColorField label="Dialog Border" colorKey="dialogBorder" />
                <Divider />
                <ColorField label="Dialog Shadow" colorKey="dialogShadow" />
                <Divider />
                <ColorField label="Dialog Header Background" colorKey="dialogHeaderBackground" />
                <Divider />
                <ColorField label="Dialog Header Text" colorKey="dialogHeaderText" />

                <h3 className={styles.sectionTitle}>Alert - Info</h3>
                <ColorField label="Info Background" colorKey="alertInfoBackground" />
                <Divider />
                <ColorField label="Info Border" colorKey="alertInfoBorder" />
                <Divider />
                <ColorField label="Info Text" colorKey="alertInfoText" />

                <h3 className={styles.sectionTitle}>Alert - Warning</h3>
                <ColorField label="Warning Background" colorKey="alertWarningBackground" />
                <Divider />
                <ColorField label="Warning Border" colorKey="alertWarningBorder" />
                <Divider />
                <ColorField label="Warning Text" colorKey="alertWarningText" />

                <h3 className={styles.sectionTitle}>Alert - Error</h3>
                <ColorField label="Error Background" colorKey="alertErrorBackground" />
                <Divider />
                <ColorField label="Error Border" colorKey="alertErrorBorder" />
                <Divider />
                <ColorField label="Error Text" colorKey="alertErrorText" />

                <h3 className={styles.sectionTitle}>Alert - Success</h3>
                <ColorField label="Success Background" colorKey="alertSuccessBackground" />
                <Divider />
                <ColorField label="Success Border" colorKey="alertSuccessBorder" />
                <Divider />
                <ColorField label="Success Text" colorKey="alertSuccessText" />

                <h3 className={styles.sectionTitle}>Tooltips</h3>
                <ColorField label="Tooltip Background" colorKey="tooltipBackground" />
                <Divider />
                <ColorField label="Tooltip Border" colorKey="tooltipBorder" />
                <Divider />
                <ColorField label="Tooltip Text" colorKey="tooltipText" />
                <Divider />
                <ColorField label="Tooltip Shadow" colorKey="tooltipShadow" />

                <h3 className={styles.sectionTitle}>Badges & Notifications</h3>
                <ColorField label="Badge Background" colorKey="badgeBackground" />
                <Divider />
                <ColorField label="Badge Border" colorKey="badgeBorder" />
                <Divider />
                <ColorField label="Badge Text" colorKey="badgeText" />
                <Divider />
                <ColorField label="Notification Background" colorKey="notificationBackground" />
                <Divider />
                <ColorField label="Notification Border" colorKey="notificationBorder" />
                <Divider />
                <ColorField label="Notification Text" colorKey="notificationText" />
                <Divider />
                <ColorField label="Notification Icon (Info)" colorKey="notificationIconInfo" />
                <Divider />
                <ColorField label="Notification Icon (Warning)" colorKey="notificationIconWarning" />
                <Divider />
                <ColorField label="Notification Icon (Error)" colorKey="notificationIconError" />
                <Divider />
                <ColorField label="Notification Icon (Success)" colorKey="notificationIconSuccess" />
              </div>
            ),
          },

          // ==================== Tab 7: Desktop & System UI ====================
          {
            id: 'desktop',
            label: 'Desktop & System',
            content: (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Desktop</h3>
                <ColorField label="Desktop Background" colorKey="desktopBackground" />
                <Divider />
                <ColorField label="Desktop Pattern" colorKey="desktopPattern" />
                <Divider />
                <ColorField label="Desktop Icon Text" colorKey="desktopIconText" />
                <Divider />
                <ColorField label="Desktop Icon Text Background" colorKey="desktopIconTextBackground" />
                <Divider />
                <ColorField label="Desktop Icon Text Background (Selected)" colorKey="desktopIconTextBackgroundSelected" />
                <Divider />
                <ColorField label="Desktop Icon Border" colorKey="desktopIconBorder" />
                <Divider />
                <ColorField label="Desktop Icon Border (Selected)" colorKey="desktopIconBorderSelected" />

                <h3 className={styles.sectionTitle}>Status Bar</h3>
                <ColorField label="Status Bar Background" colorKey="statusBarBackground" />
                <Divider />
                <ColorField label="Status Bar Border" colorKey="statusBarBorder" />
                <Divider />
                <ColorField label="Status Bar Text" colorKey="statusBarText" />
                <Divider />
                <ColorField label="Status Bar Icon (Default)" colorKey="statusBarIconDefault" />
                <Divider />
                <ColorField label="Status Bar Icon (Active)" colorKey="statusBarIconActive" />

                <h3 className={styles.sectionTitle}>Dock</h3>
                <ColorField label="Dock Background" colorKey="dockBackground" />
                <Divider />
                <ColorField label="Dock Border" colorKey="dockBorder" />
                <Divider />
                <ColorField label="Dock Shadow" colorKey="dockShadow" />
                <Divider />
                <ColorField label="Dock Icon Border" colorKey="dockIconBorder" />
                <Divider />
                <ColorField label="Dock Icon Border (Hover)" colorKey="dockIconBorderHover" />
                <Divider />
                <ColorField label="Dock Icon Border (Active)" colorKey="dockIconBorderActive" />
                <Divider />
                <ColorField label="Dock Indicator" colorKey="dockIndicator" />

                <h3 className={styles.sectionTitle}>Tabs</h3>
                <ColorField label="Tab Background" colorKey="tabBackground" />
                <Divider />
                <ColorField label="Tab Background (Hover)" colorKey="tabBackgroundHover" />
                <Divider />
                <ColorField label="Tab Background (Active)" colorKey="tabBackgroundActive" />
                <Divider />
                <ColorField label="Tab Border" colorKey="tabBorder" />
                <Divider />
                <ColorField label="Tab Text" colorKey="tabText" />
                <Divider />
                <ColorField label="Tab Text (Active)" colorKey="tabTextActive" />

                <h3 className={styles.sectionTitle}>Miscellaneous</h3>
                <ColorField label="Divider" colorKey="dividerColor" />
                <Divider />
                <ColorField label="Focus Outline" colorKey="focusOutline" />
                <Divider />
                <ColorField label="Focus Outline Offset" colorKey="focusOutlineOffset" />
                <Divider />
                <ColorField label="Shadow (Light)" colorKey="shadowLight" />
                <Divider />
                <ColorField label="Shadow (Medium)" colorKey="shadowMedium" />
                <Divider />
                <ColorField label="Shadow (Heavy)" colorKey="shadowHeavy" />
                <Divider />
                <ColorField label="Overlay Background" colorKey="overlayBackground" />
                <Divider />
                <ColorField label="Loading Spinner (Primary)" colorKey="loadingSpinnerPrimary" />
                <Divider />
                <ColorField label="Loading Spinner (Secondary)" colorKey="loadingSpinnerSecondary" />
                <Divider />
                <ColorField label="Error Color" colorKey="errorColor" />
                <Divider />
                <ColorField label="Warning Color" colorKey="warningColor" />
                <Divider />
                <ColorField label="Success Color" colorKey="successColor" />
                <Divider />
                <ColorField label="Info Color" colorKey="infoColor" />
              </div>
            ),
          },

          // ==================== Tab 8: Patterns & Effects ====================
          {
            id: 'patterns',
            label: 'Patterns & Effects',
            content: (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Title Bar Patterns</h3>
                <div className={styles.field}>
                  <label className={styles.label}>Active Title Bar Style:</label>
                  <Select
                    options={[
                      { value: 'pinstripe', label: 'Pinstripe (Classic)' },
                      { value: 'gradient', label: 'Gradient' },
                      { value: 'solid', label: 'Solid' },
                      { value: 'gradient-light', label: 'Gradient (Light)' },
                    ]}
                    value={theme.patterns.titleBarActive}
                    onChange={(value) => updatePattern('titleBarActive', value as ThemePatterns['titleBarActive'])}
                  />
                </div>
                <Divider />
                <div className={styles.field}>
                  <label className={styles.label}>Inactive Title Bar Style:</label>
                  <Select
                    options={[
                      { value: 'pinstripe', label: 'Pinstripe (Classic)' },
                      { value: 'gradient', label: 'Gradient' },
                      { value: 'solid', label: 'Solid' },
                      { value: 'gradient-light', label: 'Gradient (Light)' },
                    ]}
                    value={theme.patterns.titleBarInactive}
                    onChange={(value) => updatePattern('titleBarInactive', value as ThemePatterns['titleBarInactive'])}
                  />
                </div>

                <h3 className={styles.sectionTitle}>Window Patterns</h3>
                <div className={styles.field}>
                  <label className={styles.label}>Window Texture:</label>
                  <Select
                    options={[
                      { value: 'none', label: 'None (Flat)' },
                      { value: 'subtle', label: 'Subtle' },
                      { value: 'strong', label: 'Strong' },
                    ]}
                    value={theme.patterns.windowTexture}
                    onChange={(value) => updatePattern('windowTexture', value as ThemePatterns['windowTexture'])}
                  />
                </div>

                <h3 className={styles.sectionTitle}>Desktop Patterns</h3>
                <div className={styles.field}>
                  <label className={styles.label}>Desktop Pattern:</label>
                  <Select
                    options={[
                      { value: 'stippled', label: 'Stippled (Classic)' },
                      { value: 'none', label: 'None (Solid)' },
                      { value: 'custom', label: 'Custom' },
                    ]}
                    value={theme.patterns.desktopPattern}
                    onChange={(value) => updatePattern('desktopPattern', value as ThemePatterns['desktopPattern'])}
                  />
                </div>

                <h3 className={styles.sectionTitle}>Scrollbar Style</h3>
                <div className={styles.field}>
                  <label className={styles.label}>Scrollbar Style:</label>
                  <Select
                    options={[
                      { value: 'classic', label: 'Classic (Mac OS 8)' },
                      { value: 'modern', label: 'Modern' },
                      { value: 'minimal', label: 'Minimal' },
                    ]}
                    value={theme.patterns.scrollbarStyle}
                    onChange={(value) => updatePattern('scrollbarStyle', value as ThemePatterns['scrollbarStyle'])}
                  />
                </div>

                <h3 className={styles.sectionTitle}>Customization Options</h3>
                <div className={styles.field}>
                  <label className={styles.label}>Corner Style:</label>
                  <Select
                    options={[
                      { value: 'sharp', label: 'Sharp (Classic)' },
                      { value: 'rounded', label: 'Rounded' },
                    ]}
                    value={theme.defaultCustomization?.cornerStyle || 'sharp'}
                    onChange={(value) => updateCustomization('cornerStyle', value as 'sharp' | 'rounded')}
                  />
                </div>
                <Divider />
                <div className={styles.field}>
                  <Slider
                    label="Window Opacity:"
                    value={(theme.defaultCustomization?.windowOpacity || 1.0) * 100}
                    min={85}
                    max={100}
                    onChange={(value) => updateCustomization('windowOpacity', value / 100)}
                    showValue
                  />
                </div>
                <Divider />
                <div className={styles.field}>
                  <label className={styles.label}>Menu Bar Style:</label>
                  <Select
                    options={[
                      { value: 'opaque', label: 'Opaque (Solid)' },
                      { value: 'translucent', label: 'Translucent' },
                    ]}
                    value={theme.defaultCustomization?.menuBarStyle || 'opaque'}
                    onChange={(value) => updateCustomization('menuBarStyle', value as 'opaque' | 'translucent')}
                  />
                </div>
                <Divider />
                <div className={styles.field}>
                  <label className={styles.label}>Font Size:</label>
                  <Select
                    options={[
                      { value: 'small', label: 'Small' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'large', label: 'Large' },
                    ]}
                    value={theme.defaultCustomization?.fontSize || 'medium'}
                    onChange={(value) => updateCustomization('fontSize', value as 'small' | 'medium' | 'large')}
                  />
                </div>
                <Divider />
                <div className={styles.field}>
                  <label className={styles.label}>Scrollbar Width:</label>
                  <Select
                    options={[
                      { value: 'thin', label: 'Thin' },
                      { value: 'normal', label: 'Normal' },
                      { value: 'thick', label: 'Thick' },
                    ]}
                    value={theme.defaultCustomization?.scrollbarWidth || 'normal'}
                    onChange={(value) => updateCustomization('scrollbarWidth', value as 'thin' | 'normal' | 'thick')}
                  />
                </div>
                <Divider />
                <div className={styles.field}>
                  <label className={styles.label}>Scrollbar Arrow Style:</label>
                  <Select
                    options={[
                      { value: 'classic', label: 'Classic' },
                      { value: 'modern', label: 'Modern' },
                      { value: 'none', label: 'None' },
                    ]}
                    value={theme.defaultCustomization?.scrollbarArrowStyle || 'classic'}
                    onChange={(value) => updateCustomization('scrollbarArrowStyle', value as 'classic' | 'modern' | 'none')}
                  />
                </div>
                <Divider />
                <div className={styles.field}>
                  <Checkbox
                    checked={theme.defaultCustomization?.scrollbarAutoHide || false}
                    onChange={(checked) => updateCustomization('scrollbarAutoHide', checked)}
                    label="Auto-hide Scrollbars"
                  />
                </div>
              </div>
            ),
          },
        ]}
      />

      {/* Actions */}
      {(onSave || onCancel) && (
        <div className={styles.actions}>
          {onCancel && (
            <Button onClick={onCancel} variant="cancel">
              Cancel
            </Button>
          )}
          {onSave && (
            <Button onClick={onSave} variant="primary">
              Save Custom Theme
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
