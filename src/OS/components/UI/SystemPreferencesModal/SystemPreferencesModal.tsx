/**
 * SystemPreferencesModal Component
 * Contemporary macOS-style System Settings with Mac OS 8 aesthetics
 * Sidebar navigation with category icons
 */

import { useState } from 'react';
import { useSystemStore } from '../../../store/systemStore';
import { usePreferencesStore } from '../../../store/preferencesStore';
import AppearanceTab from './components/AppearanceTab';
import DesktopAndDockTab from './components/DesktopAndDockTab';
import styles from './SystemPreferencesModal.module.css';

export interface SystemPreferencesModalProps {
  onClose: () => void;
}

type SettingsCategory = 'appearance' | 'desktop-dock' | 'system' | 'about';

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
    icon: '/icons/preferences/appearance.svg',
    description: 'Themes, colors, fonts, and visual customization',
  },
  {
    id: 'desktop-dock',
    label: 'Desktop & Dock',
    icon: '/icons/preferences/desktop.svg',
    description: 'Desktop icons, Dock position, and window behavior',
  },
  {
    id: 'system',
    label: 'System',
    icon: '/icons/preferences/system.svg',
    description: 'General system settings and preferences',
  },
  {
    id: 'about',
    label: 'About',
    icon: '/icons/preferences/info.svg',
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
  
  // Desktop & Dock state from stores
  const desktopPreferences = useSystemStore((state) => state.desktopPreferences);
  const dockPreferences = useSystemStore((state) => state.dockPreferences);
  const restoreWindowsOnStartup = useSystemStore((state) => state.restoreWindowsOnStartup);
  
  const connectedWallet = usePreferencesStore((state) => state.connectedWallet);
  
  // Theme Actions
  const updateThemePreference = usePreferencesStore((state) => state.updateThemePreference);
  const setWallpaper = useSystemStore((state) => state.setWallpaper);
  const setAccentColor = useSystemStore((state) => state.setAccentColor);
  const updateThemeCustomization = useSystemStore((state) => state.updateThemeCustomization);
  
  // Desktop & Dock Actions
  const updateDesktopPreferences = useSystemStore((state) => state.updateDesktopPreferences);
  const updateDockPreferences = useSystemStore((state) => state.updateDockPreferences);
  const setRestoreWindowsOnStartup = useSystemStore((state) => state.setRestoreWindowsOnStartup);

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

  // Handle desktop preferences change
  const handleDesktopChange = (prefs: Partial<typeof desktopPreferences>) => {
    updateDesktopPreferences(prefs);
  };

  // Handle dock preferences change
  const handleDockChange = (prefs: Partial<typeof dockPreferences>) => {
    updateDockPreferences(prefs);
  };

  // Handle restore windows change
  const handleRestoreWindowsChange = (enabled: boolean) => {
    setRestoreWindowsOnStartup(enabled);
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
      
      case 'desktop-dock':
        return (
          <DesktopAndDockTab
            desktopPreferences={desktopPreferences}
            dockPreferences={dockPreferences}
            restoreWindowsOnStartup={restoreWindowsOnStartup}
            connectedWallet={connectedWallet}
            onDesktopChange={handleDesktopChange}
            onDockChange={handleDockChange}
            onRestoreWindowsChange={handleRestoreWindowsChange}
          />
        );
      
      case 'system':
        return (
          <div className={styles.placeholder}>
            <img src="/icons/preferences/system.svg" alt="" className={styles.placeholderIcon} />
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
                <img src={category.icon} alt="" className={styles.categoryIcon} />
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

