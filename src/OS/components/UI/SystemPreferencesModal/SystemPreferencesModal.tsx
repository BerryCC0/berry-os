/**
 * SystemPreferencesModal Component
 * Contemporary macOS-style System Settings with Mac OS 8 aesthetics
 * Sidebar navigation with category icons
 */

import { useState } from 'react';
import { useSystemStore } from '../../../store/systemStore';
import { usePreferencesStore } from '../../../store/preferencesStore';
import AppearanceTab from './components/AppearanceTab';
import styles from './SystemPreferencesModal.module.css';

export interface SystemPreferencesModalProps {
  onClose: () => void;
}

type SettingsCategory = 'appearance' | 'desktop' | 'system' | 'about';

interface CategoryItem {
  id: SettingsCategory;
  label: string;
  icon: string;
  description: string;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: 'appearance',
    label: 'Appearance',
    icon: '🎨',
    description: 'Themes, colors, fonts, and visual customization',
  },
  {
    id: 'desktop',
    label: 'Desktop',
    icon: '🖥️',
    description: 'Wallpaper, icons, and desktop behavior',
  },
  {
    id: 'system',
    label: 'System',
    icon: '⚙️',
    description: 'General system settings and preferences',
  },
  {
    id: 'about',
    label: 'About',
    icon: 'ℹ️',
    description: 'System information and version',
  },
];

export default function SystemPreferencesModal({ onClose }: SystemPreferencesModalProps) {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('appearance');
  
  // Theme state from stores
  const activeTheme = useSystemStore((state) => state.activeTheme);
  const wallpaper = useSystemStore((state) => state.wallpaper);
  const accentColor = useSystemStore((state) => state.accentColor);
  const themeCustomization = useSystemStore((state) => state.themeCustomization);
  const systemVersion = useSystemStore((state) => state.systemVersion);
  
  const connectedWallet = usePreferencesStore((state) => state.connectedWallet);
  
  // Actions
  const updateThemePreference = usePreferencesStore((state) => state.updateThemePreference);
  const setWallpaper = useSystemStore((state) => state.setWallpaper);
  const setAccentColor = useSystemStore((state) => state.setAccentColor);
  const updateThemeCustomization = useSystemStore((state) => state.updateThemeCustomization);

  // Handle theme change
  const handleThemeChange = (themeId: string) => {
    updateThemePreference(themeId);
  };

  // Handle wallpaper change
  const handleWallpaperChange = (wallpaperPath: string) => {
    setWallpaper(wallpaperPath);
  };

  // Handle accent color change
  const handleAccentColorChange = (color: string | null) => {
    setAccentColor(color);
  };

  // Handle customization change
  const handleCustomizationChange = (customization: any) => {
    updateThemeCustomization(customization);
  };

  // Close on Escape
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  // Render active category content
  const renderContent = () => {
    switch (activeCategory) {
      case 'appearance':
        return (
          <AppearanceTab
            activeTheme={activeTheme}
            wallpaper={wallpaper}
            accentColor={accentColor}
            themeCustomization={themeCustomization}
            connectedWallet={connectedWallet}
            onThemeChange={handleThemeChange}
            onWallpaperChange={handleWallpaperChange}
            onAccentColorChange={handleAccentColorChange}
            onCustomizationChange={handleCustomizationChange}
          />
        );
      
      case 'desktop':
        return (
          <div className={styles.placeholder}>
            <div className={styles.placeholderIcon}>🖥️</div>
            <h3>Desktop Settings</h3>
            <p>Desktop customization options coming soon</p>
          </div>
        );
      
      case 'system':
        return (
          <div className={styles.placeholder}>
            <div className={styles.placeholderIcon}>⚙️</div>
            <h3>System Settings</h3>
            <p>System preferences coming soon</p>
          </div>
        );
      
      case 'about':
        return (
          <div className={styles.aboutContent}>
            <div className={styles.aboutLogo}>
              <img src="/icons/apps/berry.svg" alt="Berry OS" />
            </div>
            <h2>Berry OS</h2>
            <div className={styles.aboutVersion}>Version {systemVersion}</div>
            <div className={styles.aboutDescription}>
              A Mac OS 8 emulator built with modern web technologies
            </div>
            {connectedWallet && (
              <div className={styles.aboutWallet}>
                <strong>Connected Wallet:</strong>
                <div className={styles.walletAddress}>
                  {connectedWallet.slice(0, 6)}...{connectedWallet.slice(-4)}
                </div>
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose} onKeyDown={handleKeyDown}>
      <div 
        className={styles.modal} 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="settings-title"
      >
        {/* Title Bar */}
        <div className={styles.titleBar}>
          <span className={styles.title} id="settings-title">System Settings</span>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Main Content */}
        <div className={styles.mainContent}>
          {/* Sidebar */}
          <div className={styles.sidebar}>
            <div className={styles.sidebarHeader}>Categories</div>
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                className={`${styles.categoryButton} ${
                  activeCategory === category.id ? styles.active : ''
                }`}
                onClick={() => setActiveCategory(category.id)}
              >
                <span className={styles.categoryIcon}>{category.icon}</span>
                <div className={styles.categoryInfo}>
                  <div className={styles.categoryLabel}>{category.label}</div>
                  <div className={styles.categoryDescription}>{category.description}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className={styles.contentArea}>
            <div className={styles.contentScroll}>
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

