/**
 * Appearance Tab Component
 * Organized theme and appearance settings with collapsible sections
 * Phase 6: Integrated comprehensive ThemeBuilder
 */

'use client';

import { useState } from 'react';
import CollapsibleSection from './CollapsibleSection';
import AccentColorPicker from './AccentColorPicker';
import AdvancedOptions from './AdvancedOptions';
import ThemeBuilder from '../../../../OS/components/Theme/ThemeBuilder/ThemeBuilder';
import Dialog from '../../../../OS/components/UI/Dialog/Dialog';
import Button from '../../../../OS/components/UI/Button/Button';
import { getThemeById } from '../../../../OS/lib/themes';
import { useSystemStore } from '../../../../OS/store/systemStore';
import { Theme } from '../../../../OS/types/theme';
import styles from './AppearanceTab.module.css';

interface AppearanceTabProps {
  // Theme state
  activeTheme: string;
  wallpaper: string;
  accentColor: string | null;
  themeCustomization: any;
  connectedWallet: string | null;
  
  // Actions
  onThemeChange: (themeId: string) => void;
  onWallpaperChange: (wallpaperPath: string) => void;
  onAccentColorChange: (color: string | null) => void;
  onCustomizationChange: (customization: any) => void;
}

export default function AppearanceTab({
  activeTheme,
  wallpaper,
  accentColor,
  themeCustomization,
  connectedWallet,
  onThemeChange,
  onWallpaperChange,
  onAccentColorChange,
  onCustomizationChange,
}: AppearanceTabProps) {
  // Get theme management actions from system store
  const setCustomTheme = useSystemStore((state) => state.setCustomTheme);
  const clearCustomTheme = useSystemStore((state) => state.clearCustomTheme);
  const customTheme = useSystemStore((state) => state.customTheme);

  // ThemeBuilder dialog state
  const [isThemeBuilderOpen, setIsThemeBuilderOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
  const [themeBeforeEdit, setThemeBeforeEdit] = useState<Theme | null>(null);

  // Check if theme has custom colors (for status display)
  const isThemeCustomized = customTheme !== null;

  // Open ThemeBuilder with current theme (custom or preset)
  const handleOpenThemeBuilder = () => {
    const currentTheme = customTheme || getThemeById(activeTheme);
    setEditingTheme(currentTheme);
    setThemeBeforeEdit(customTheme); // Remember the state before editing
    setIsThemeBuilderOpen(true);
  };

  // Handle theme changes from ThemeBuilder - LIVE PREVIEW
  const handleThemeChange = (updatedTheme: Theme) => {
    setEditingTheme(updatedTheme);
    // Apply theme immediately to system store for LIVE preview
    setCustomTheme(updatedTheme);
  };

  // Save custom theme
  const handleSaveCustomTheme = () => {
    if (editingTheme) {
      // Apply the final custom theme
      setCustomTheme(editingTheme);
      // TODO Phase 5: Save to database via preferences store
      console.log('✅ Custom theme applied:', editingTheme.name);
    }
    setIsThemeBuilderOpen(false);
    setThemeBeforeEdit(null);
  };

  // Cancel theme editing - restore previous state
  const handleCancelThemeBuilder = () => {
    // Restore the theme state from before editing
    if (themeBeforeEdit === null) {
      // No custom theme was active, clear it
      clearCustomTheme();
      console.log('🔄 Cancelled editing, cleared custom theme');
    } else {
      // Restore the previous custom theme
      setCustomTheme(themeBeforeEdit);
      console.log('🔄 Cancelled editing, restored previous custom theme');
    }
    setIsThemeBuilderOpen(false);
    setEditingTheme(null);
    setThemeBeforeEdit(null);
  };
  
  // Handle preset theme selection - CLEARS custom theme
  const handlePresetThemeSelect = (themeId: string) => {
    console.log(`🎨 Switching to preset theme: ${themeId}`);
    // Clear any custom theme first
    clearCustomTheme();
    // Then switch to the preset theme
    onThemeChange(themeId);
  };

  // Organize themes by category (matches themes.ts BUILT_IN_THEMES)
  const classicThemes = [
    { id: 'classic', name: 'Classic', description: 'Authentic Mac OS 8 look with black & white pinstripes' },
    { id: 'platinum', name: 'Platinum', description: 'Mac OS 8.5+ modern appearance with gradient blues' },
    { id: 'dark', name: 'Dark Mode', description: 'Easy on the eyes with dark grays and blue accents' },
    { id: 'custom', name: 'Custom', description: 'Create your own theme with 150+ color controls', isCustom: true },
  ];

  const nounsThemes = [
    { id: 'nounish', name: 'Nounish', description: 'Nouns DAO colors - Nouns red, black, and cream' },
    { id: 'tangerine', name: 'Tangerine', description: 'Vibrant and playful with oranges and yellows' },
  ];

  const wallpapers = [
    { id: 'classic', name: 'Classic', path: '/filesystem/System/Desktop Pictures/Classic.svg' },
    { id: 'clouds', name: 'Clouds', path: '/filesystem/System/Desktop Pictures/Clouds.svg' },
    { id: 'abstract', name: 'Abstract', path: '/filesystem/System/Desktop Pictures/Abstract.svg' },
    { id: 'gradient', name: 'Gradient', path: '/filesystem/System/Desktop Pictures/Gradient.svg' },
  ];

  return (
    <div className={styles.appearanceTab}>
      {/* Wallet notice */}
      {!connectedWallet && (
        <div className={styles.notice}>
          <strong>💡 Tip:</strong> Connect your wallet to save preferences across sessions.
          Changes will persist for this session only.
        </div>
      )}

      {/* All Themes Section */}
      <CollapsibleSection
        title="Themes"
        description="Choose your Berry OS appearance"
        icon="🎨"
        defaultExpanded={true}
      >
        {/* Classic Themes Subcategory */}
        <div className={styles.themeSubcategory}>
          <h4 className={styles.subcategoryTitle}>
            <span className={styles.subcategoryIcon}>🖥️</span>
            Classic
          </h4>
          <div className={styles.themeGrid}>
            {classicThemes.map((theme) => {
              const isCustomCard = theme.id === 'custom';
              const isSelected = isCustomCard ? isThemeCustomized : (activeTheme === theme.id && !customTheme);
              
              return (
                <button
                  key={theme.id}
                  className={`${styles.themeCard} ${isSelected ? styles.selected : ''} ${isCustomCard ? styles.customCard : ''}`}
                  onClick={() => isCustomCard ? handleOpenThemeBuilder() : handlePresetThemeSelect(theme.id)}
                >
                  <div className={styles.themePreview}>
                    {isCustomCard ? (
                      <div className={styles.customPreview}>
                        <div className={styles.customIcon}>🎨</div>
                        <div className={styles.customLabel}>
                          {isThemeCustomized ? 'Edit' : 'Create'}
                        </div>
                      </div>
                    ) : (
                      <div className={`${styles.previewWindow} ${styles[`theme-${theme.id}`]}`}>
                        <div className={styles.previewTitleBar} />
                        <div className={styles.previewContent} />
                      </div>
                    )}
                  </div>
                  <div className={styles.themeName}>{theme.name}</div>
                  <div className={styles.themeDescription}>{theme.description}</div>
                  {isSelected && (
                    <div className={styles.checkmark}>✓</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Nouns Themes Subcategory */}
        <div className={styles.themeSubcategory}>
          <h4 className={styles.subcategoryTitle}>
            <span className={styles.subcategoryIcon}>⌐◨-◨</span>
            Nouns
          </h4>
          <div className={styles.themeGrid}>
            {nounsThemes.map((theme) => (
              <button
                key={theme.id}
                className={`${styles.themeCard} ${activeTheme === theme.id && !customTheme ? styles.selected : ''}`}
                onClick={() => handlePresetThemeSelect(theme.id)}
              >
                <div className={styles.themePreview}>
                  <div className={`${styles.previewWindow} ${styles[`theme-${theme.id}`]}`}>
                    <div className={styles.previewTitleBar} />
                    <div className={styles.previewContent} />
                  </div>
                </div>
                <div className={styles.themeName}>{theme.name}</div>
                <div className={styles.themeDescription}>{theme.description}</div>
                {activeTheme === theme.id && !customTheme && (
                  <div className={styles.checkmark}>✓</div>
                )}
              </button>
            ))}
          </div>
        </div>
      </CollapsibleSection>

      {/* Accent Color Section */}
      <CollapsibleSection
        title="Accent Color"
        description="Quick accent color from the Nouns palette"
        icon="🎨"
        defaultExpanded={false}
      >
        <AccentColorPicker
          currentAccent={accentColor}
          onAccentChange={onAccentColorChange}
        />
      </CollapsibleSection>

      {/* Desktop Wallpaper Section */}
      <CollapsibleSection
        title="Desktop Wallpaper"
        description="Choose a background for your desktop"
        icon="🖼️"
        defaultExpanded={false}
      >
        <div className={styles.wallpaperGrid}>
          {wallpapers.map((wp) => (
            <button
              key={wp.id}
              className={`${styles.wallpaperCard} ${wallpaper === wp.path ? styles.selected : ''}`}
              onClick={() => onWallpaperChange(wp.path)}
            >
              <div 
                className={styles.wallpaperPreview}
                style={{ backgroundImage: `url(${wp.path})` }}
              >
                {wallpaper === wp.path && (
                  <div className={styles.checkmark}>✓</div>
                )}
              </div>
              <div className={styles.wallpaperName}>{wp.name}</div>
            </button>
          ))}
        </div>
      </CollapsibleSection>

      {/* Advanced Customization Section */}
      <CollapsibleSection
        title="Advanced Options"
        description="Fine-tune window appearance, scrollbars, and typography"
        icon="⚙️"
        defaultExpanded={false}
      >
        <AdvancedOptions
          customization={themeCustomization}
          onCustomizationChange={onCustomizationChange}
        />
      </CollapsibleSection>

      {/* Coming Soon Section - Hidden for now, kept for dev reference */}
      {/* 
      <CollapsibleSection
        title="Coming Soon"
        description="Future customization features"
        icon="🚀"
        defaultExpanded={false}
      >
        <div className={styles.comingSoon}>
          <div className={styles.comingSoonItem}>
            <span className={styles.comingSoonIcon}>🖼️</span>
            <div>
              <strong>Custom Wallpapers</strong>
              <p>Upload your own wallpapers via IPFS</p>
            </div>
          </div>
          <div className={styles.comingSoonItem}>
            <span className={styles.comingSoonIcon}>💾</span>
            <div>
              <strong>Theme Import/Export</strong>
              <p>Share your custom themes with others</p>
            </div>
          </div>
          <div className={styles.comingSoonItem}>
            <span className={styles.comingSoonIcon}>🏪</span>
            <div>
              <strong>Theme Marketplace</strong>
              <p>Browse and install community themes</p>
            </div>
          </div>
          <div className={styles.comingSoonItem}>
            <span className={styles.comingSoonIcon}>🎭</span>
            <div>
              <strong>Dynamic Themes</strong>
              <p>Themes that change based on time of day</p>
            </div>
          </div>
          <p className={styles.comingSoonHint}>Phase 8+</p>
        </div>
      </CollapsibleSection>
      */}

      {/* ThemeBuilder Dialog - Phase 6 */}
      {editingTheme && (
        <Dialog
          isOpen={isThemeBuilderOpen}
          title="Advanced Theme Customization"
          onClose={handleCancelThemeBuilder}
          width={800}
          height={700}
        >
          <ThemeBuilder
            theme={editingTheme}
            onChange={handleThemeChange}
            onSave={handleSaveCustomTheme}
            onCancel={handleCancelThemeBuilder}
          />
        </Dialog>
      )}
    </div>
  );
}
