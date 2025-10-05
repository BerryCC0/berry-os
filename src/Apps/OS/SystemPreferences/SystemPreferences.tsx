'use client';

/**
 * System Preferences App
 * Central hub for customizing Berry OS appearance, behavior, and settings
 */

import { useState } from 'react';
import { useSystemStore } from '../../../OS/store/systemStore';
import { usePreferencesStore } from '../../../OS/store/preferencesStore';
import AppearanceTab from './components/AppearanceTab';
import styles from './SystemPreferences.module.css';

interface SystemPreferencesProps {
  windowId: string;
}

type TabId = 'appearance' | 'desktop' | 'dock' | 'system';

export default function SystemPreferences({ windowId }: SystemPreferencesProps) {
  const [activeTab, setActiveTab] = useState<TabId>('appearance');
  
  // Get system state - READ DIRECTLY from activeTheme for instant updates!
  const wallpaper = useSystemStore((state) => state.wallpaper);
  const pinnedApps = useSystemStore((state) => state.pinnedApps);
  const activeTheme = useSystemStore((state) => state.activeTheme);
  const accentColor = useSystemStore((state) => state.accentColor);
  const themeCustomization = useSystemStore((state) => state.themeCustomization);
  
  // Get preferences state
  const connectedWallet = usePreferencesStore((state) => state.connectedWallet);
  
  // Get actions
  const setWallpaper = useSystemStore((state) => state.setWallpaper);
  const updateThemePreference = usePreferencesStore((state) => state.updateThemePreference);
  const setAccentColor = usePreferencesStore((state) => state.setAccentColor);
  const updateThemeCustomization = usePreferencesStore((state) => state.updateThemeCustomization);

  // Handle theme change - now fully synchronous!
  const handleThemeChange = (themeId: string) => {
    console.log(`Switching theme to: ${themeId}`);
    updateThemePreference(themeId, wallpaper);
  };

  // Handle wallpaper change
  const handleWallpaperChange = (wallpaperPath: string) => {
    setWallpaper(wallpaperPath);
    updateThemePreference(activeTheme, wallpaperPath);
    // Theme preference automatically saves to DB immediately
  };

  const tabs = [
    { id: 'appearance' as TabId, name: 'Appearance', icon: '🎨' },
    { id: 'desktop' as TabId, name: 'Desktop', icon: '🖥️' },
    { id: 'dock' as TabId, name: 'Dock', icon: '📌' },
    { id: 'system' as TabId, name: 'System', icon: '⚙️' },
  ];

  return (
    <div className={styles.systemPreferences}>
      {/* Header with tabs */}
      <div className={styles.header}>
        <div className={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              <span className={styles.tabName}>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content area */}
      <div className={styles.content}>
        {/* Wallet status notice */}
        {!connectedWallet && (
          <div className={styles.notice}>
            <strong>Note:</strong> Connect your wallet to save preferences across sessions.
            Changes will persist for this session only.
          </div>
        )}

        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <AppearanceTab
            activeTheme={activeTheme}
            wallpaper={wallpaper}
            accentColor={accentColor}
            themeCustomization={themeCustomization}
            connectedWallet={connectedWallet}
            onThemeChange={handleThemeChange}
            onWallpaperChange={handleWallpaperChange}
            onAccentColorChange={setAccentColor}
            onCustomizationChange={updateThemeCustomization}
          />
        )}

        {/* Desktop Tab */}
        {activeTab === 'desktop' && (
          <div className={styles.tabContent}>
            <h2 className={styles.sectionTitle}>Desktop</h2>
            
            <div className={styles.section}>
              <h3 className={styles.subsectionTitle}>Icon Arrangement</h3>
              <p className={styles.description}>
                Control how desktop icons are positioned
              </p>
              <div className={styles.settingsList}>
                <div className={styles.setting}>
                  <label className={styles.label}>
                    <input type="checkbox" defaultChecked={false} disabled />
                    <span>Snap to grid</span>
                  </label>
                  <p className={styles.hint}>Free-form positioning enabled</p>
                </div>
                <div className={styles.setting}>
                  <label className={styles.label}>
                    <span>Grid spacing:</span>
                    <select disabled className={styles.select}>
                      <option>80px (Default)</option>
                      <option>64px (Tight)</option>
                      <option>96px (Loose)</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.subsectionTitle}>Icon Size</h3>
              <div className={styles.comingSoon}>
                <p>Small • Medium • Large icon sizes</p>
                <p className={styles.hint}>Coming soon</p>
              </div>
            </div>
          </div>
        )}

        {/* Dock Tab */}
        {activeTab === 'dock' && (
          <div className={styles.tabContent}>
            <h2 className={styles.sectionTitle}>Dock</h2>
            
            <div className={styles.section}>
              <h3 className={styles.subsectionTitle}>Pinned Applications</h3>
              <p className={styles.description}>
                Current pinned apps: {pinnedApps.join(', ')}
              </p>
              <div className={styles.comingSoon}>
                <p>📌 Drag to reorder</p>
                <p>➕ Add/remove apps</p>
                <p>📍 Change dock position</p>
                <p className={styles.hint}>Coming in Phase 7</p>
              </div>
            </div>
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <div className={styles.tabContent}>
            <h2 className={styles.sectionTitle}>System</h2>
            
            <div className={styles.section}>
              <h3 className={styles.subsectionTitle}>General</h3>
              <div className={styles.settingsList}>
                <div className={styles.setting}>
                  <label className={styles.label}>
                    <span>Double-click speed:</span>
                    <select disabled className={styles.select}>
                      <option>Slow</option>
                      <option>Medium</option>
                      <option>Fast</option>
                    </select>
                  </label>
                </div>
                <div className={styles.setting}>
                  <label className={styles.label}>
                    <span>Scroll speed:</span>
                    <select disabled className={styles.select}>
                      <option>Slow</option>
                      <option>Medium</option>
                      <option>Fast</option>
                    </select>
                  </label>
                </div>
                <div className={styles.setting}>
                  <label className={styles.label}>
                    <input type="checkbox" defaultChecked={true} disabled />
                    <span>Menu blink</span>
                  </label>
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.subsectionTitle}>About</h3>
              <div className={styles.aboutInfo}>
                <p><strong>Berry OS</strong></p>
                <p>Version 8.0.0</p>
                <p>Build: Phase 6 Complete</p>
                <p className={styles.hint}>
                  {connectedWallet 
                    ? `Connected: ${connectedWallet.slice(0, 6)}...${connectedWallet.slice(-4)}`
                    : 'Not connected'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

