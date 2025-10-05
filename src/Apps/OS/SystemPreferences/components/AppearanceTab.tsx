/**
 * Appearance Tab Component
 * Organized theme and appearance settings with collapsible sections
 */

'use client';

import CollapsibleSection from './CollapsibleSection';
import AccentColorPicker from './AccentColorPicker';
import AdvancedOptions from './AdvancedOptions';
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
  
  // Organize themes by category
  const classicThemes = [
    { id: 'classic', name: 'Classic', description: 'Original Mac OS 8 look' },
    { id: 'platinum', name: 'Platinum', description: 'Mac OS 8.5+ modern appearance' },
    { id: 'dark', name: 'Dark Mode', description: 'Easy on the eyes' },
    { id: 'graphite', name: 'Graphite', description: 'Professional grayscale' },
  ];

  const nounsThemes = [
    { id: 'nounish', name: 'Nounish', description: 'Official Nouns DAO colors' },
    { id: 'tangerine', name: 'Tangerine', description: 'Warm Nouns vibes' },
    { id: 'midnight', name: 'Midnight Nouns', description: 'Dark with Nouns accent' },
    { id: 'cottonCandy', name: 'Cotton Candy', description: 'Soft Nouns pastels' },
    { id: 'retroTerminal', name: 'Retro Terminal', description: 'Green phosphor Nouns' },
    { id: 'bondiBlue', name: 'Bondi Blue', description: 'iMac G3 meets Nouns' },
    { id: 'tokyoNight', name: 'Tokyo Night', description: 'Cyberpunk Nouns' },
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
            {classicThemes.map((theme) => (
              <button
                key={theme.id}
                className={`${styles.themeCard} ${activeTheme === theme.id ? styles.selected : ''}`}
                onClick={() => onThemeChange(theme.id)}
              >
                <div className={styles.themePreview}>
                  <div className={`${styles.previewWindow} ${styles[`theme-${theme.id}`]}`}>
                    <div className={styles.previewTitleBar} />
                    <div className={styles.previewContent} />
                  </div>
                </div>
                <div className={styles.themeName}>{theme.name}</div>
                <div className={styles.themeDescription}>{theme.description}</div>
                {activeTheme === theme.id && (
                  <div className={styles.checkmark}>✓</div>
                )}
              </button>
            ))}
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
                className={`${styles.themeCard} ${activeTheme === theme.id ? styles.selected : ''}`}
                onClick={() => onThemeChange(theme.id)}
              >
                <div className={styles.themePreview}>
                  <div className={`${styles.previewWindow} ${styles[`theme-${theme.id}`]}`}>
                    <div className={styles.previewTitleBar} />
                    <div className={styles.previewContent} />
                  </div>
                </div>
                <div className={styles.themeName}>{theme.name}</div>
                <div className={styles.themeDescription}>{theme.description}</div>
                {activeTheme === theme.id && (
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
        description="Customize highlight colors from the Nouns palette"
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
    </div>
  );
}
