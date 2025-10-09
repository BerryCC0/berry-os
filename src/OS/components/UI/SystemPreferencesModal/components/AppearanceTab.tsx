/**
 * Appearance Tab Component
 * Organized theme and appearance settings with collapsible sections
 * Phase 6: Integrated comprehensive ThemeBuilder
 * Phase 8D: Integrated saved themes into Custom Themes category
 */

'use client';

import { useState, useEffect } from 'react';
import CollapsibleSection from './CollapsibleSection';
import AccentColorPicker from './AccentColorPicker';
import AdvancedOptions from './AdvancedOptions';
import ThemeBuilder from '../../../../../OS/components/Theme/ThemeBuilder/ThemeBuilder';
import Dialog from '../../../../../OS/components/UI/Dialog/Dialog';
import ThemeNameDialog from '../../../../../OS/components/UI/ThemeNameDialog/ThemeNameDialog';
import ThemeBrowser from '../../../../../OS/components/UI/ThemeBrowser/ThemeBrowser';
import Button from '../../../../../OS/components/UI/Button/Button';
import Spinner from '../../../../../OS/components/UI/Spinner/Spinner';
import { getThemeById } from '../../../../../OS/lib/themes';
import { generateThemeId, isValidThemeName, shareTheme, cloneTheme, exportTheme } from '../../../../../OS/lib/themeManager';
import { useSystemStore } from '../../../../../OS/store/systemStore';
import { Theme } from '../../../../../OS/types/theme';
import styles from './AppearanceTab.module.css';

interface SavedTheme extends Theme {
  isPublic?: boolean;
  shareCode?: string;
}

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
  
  // Theme naming dialog state
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Saved themes state
  const [savedThemes, setSavedThemes] = useState<SavedTheme[]>([]);
  const [isLoadingThemes, setIsLoadingThemes] = useState(false);

  // Check if theme has custom colors (for status display)
  const isThemeCustomized = customTheme !== null;

  // Load user's saved themes
  useEffect(() => {
    if (connectedWallet) {
      loadSavedThemes();
    } else {
      setSavedThemes([]);
    }
  }, [connectedWallet]);

  const loadSavedThemes = async () => {
    if (!connectedWallet) return;

    setIsLoadingThemes(true);
    try {
      const response = await fetch(`/api/themes/list?walletAddress=${connectedWallet}`);
      if (response.ok) {
        const themes = await response.json();
        setSavedThemes(themes);
      }
    } catch (error) {
      console.error('Error loading saved themes:', error);
    } finally {
      setIsLoadingThemes(false);
    }
  };

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

  // Open theme naming dialog
  const handleSaveCustomTheme = () => {
    if (!editingTheme) return;
    
    // If user is not connected, warn them
    if (!connectedWallet) {
      alert('Please connect your wallet to save custom themes');
      return;
    }
    
    // Open naming dialog
    setIsNameDialogOpen(true);
  };

  // Actually save the theme after naming
  const handleSaveThemeWithName = async (themeName: string, themeDescription: string) => {
    if (!editingTheme || !connectedWallet) return;
    
    setIsSaving(true);
    
    try {
      // Generate unique theme ID
      const themeId = generateThemeId(connectedWallet, themeName);
      
      // Create the custom theme object
      const customThemeToSave: Theme = {
        ...editingTheme,
        id: themeId,
        name: themeName,
        description: themeDescription || `Custom theme created by ${connectedWallet.slice(0, 6)}...${connectedWallet.slice(-4)}`,
        metadata: {
          author: connectedWallet,
          version: '1.0.0',
          createdAt: Date.now(),
          isCustom: true,
        },
      };
      
      // Save to database via API
      const response = await fetch('/api/themes/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: connectedWallet,
          theme: customThemeToSave,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save theme');
      }
      
      // Apply the theme to system store
      setCustomTheme(customThemeToSave);
      
      // Close dialogs
      setIsNameDialogOpen(false);
      setIsThemeBuilderOpen(false);
      setThemeBeforeEdit(null);

      // Reload saved themes to show the new theme
      await loadSavedThemes();

      console.log(`✅ Custom theme "${themeName}" saved successfully!`, customThemeToSave);
      
    } catch (error) {
      console.error('Error saving custom theme:', error);
      alert(`Failed to save theme: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
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

  // ==================== Saved Theme Handlers (Phase 8D Inline) ====================

  // Select a saved theme
  const handleSelectSavedTheme = (theme: SavedTheme) => {
    console.log(`🎨 Applying saved theme: ${theme.name}`);
    setCustomTheme(theme);
  };

  // Edit a saved theme
  const handleEditSavedTheme = (theme: SavedTheme) => {
    console.log(`✏️ Editing saved theme: ${theme.name}`);
    setEditingTheme(theme);
    setThemeBeforeEdit(customTheme);
    setIsThemeBuilderOpen(true);
  };

  // Duplicate a saved theme
  const handleDuplicateSavedTheme = (theme: SavedTheme) => {
    if (!connectedWallet) {
      alert('Please connect your wallet to duplicate themes');
      return;
    }

    const duplicatedTheme = cloneTheme(theme, `${theme.name} (Copy)`, connectedWallet);
    console.log(`📋 Duplicated theme: ${theme.name} → ${duplicatedTheme.name}`);

    // Open in ThemeBuilder
    setEditingTheme(duplicatedTheme);
    setThemeBeforeEdit(customTheme);
    setIsThemeBuilderOpen(true);
  };

  // Delete a saved theme
  const handleDeleteSavedTheme = async (theme: SavedTheme) => {
    if (!connectedWallet) {
      alert('Please connect your wallet to delete themes');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${theme.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch('/api/themes/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: connectedWallet,
          themeId: theme.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete theme');
      }

      console.log(`🗑️ Theme deleted: ${theme.id}`);

      // Reload themes
      await loadSavedThemes();

      // If the deleted theme is currently active, switch to default
      if (customTheme && customTheme.id === theme.id) {
        clearCustomTheme();
        onThemeChange('classic');
      }
    } catch (error) {
      console.error('Error deleting theme:', error);
      alert(`Failed to delete theme: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Export a saved theme as JSON
  const handleExportSavedTheme = (theme: SavedTheme) => {
    const json = exportTheme(theme);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${theme.name.toLowerCase().replace(/\s+/g, '-')}-theme.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log(`💾 Theme exported: ${theme.name}`);
  };

  // Share a saved theme publicly or make private
  const handleShareSavedTheme = async (theme: SavedTheme) => {
    if (!connectedWallet) {
      alert('Please connect your wallet to share themes');
      return;
    }

    const action = theme.isPublic ? 'make private' : 'share publicly';
    const message = theme.isPublic
      ? `Make "${theme.name}" private? It will no longer be visible to other users.`
      : `Share "${theme.name}" publicly? Other users will be able to discover and use your theme.`;

    if (!confirm(message)) {
      return;
    }

    try {
      const result = await shareTheme(connectedWallet, theme.id, !theme.isPublic);

      if (!result.success) {
        throw new Error(result.error || 'Failed to share theme');
      }

      // Reload themes to show updated share status
      await loadSavedThemes();

      if (!theme.isPublic && result.shareCode) {
        console.log(`🌍 Theme shared publicly with code: ${result.shareCode}`);
        alert(`Theme is now public! Share code: ${result.shareCode}`);
      } else {
        console.log(`🔒 Theme is now private`);
      }
    } catch (error) {
      console.error('Error sharing theme:', error);
      alert(`Failed to ${action}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Organize themes by category - Phase 8D: Consolidated structure
  const builtInThemes = [
    { id: 'classic', name: 'Classic', description: 'Authentic Mac OS 8 black & white' },
    { id: 'platinum', name: 'Platinum', description: 'Mac OS 8.5+ with gradient blues' },
    { id: 'dark', name: 'Dark Mode', description: 'Easy on the eyes dark theme' },
    { id: 'nounish', name: 'Nounish', description: 'Nouns DAO red, black, and cream' },
    { id: 'tangerine', name: 'Tangerine', description: 'Vibrant oranges and yellows' },
    { id: 'berry', name: 'Berry', description: 'Berry brand blues and purples' },
    { id: 'midnight', name: 'Midnight', description: 'OLED-friendly pure black' },
    { id: 'jade', name: 'Jade', description: 'Calming nature greens' },
    { id: 'sunset', name: 'Sunset', description: 'Warm twilight purples and pinks' },
  ];

  const customThemes = [
    { id: 'custom', name: 'Theme Builder', description: 'Create your own theme with 150+ color controls', isCustom: true },
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
        defaultExpanded={false}
      >
        {/* Built-In Themes - Phase 8D: All 9 themes consolidated */}
        <div className={styles.themeSubcategory}>
          <h4 className={styles.subcategoryTitle}>
            <span className={styles.subcategoryIcon}>💎</span>
            Built-In Themes
          </h4>
          <div className={styles.themeGrid}>
            {builtInThemes.map((theme) => (
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

        {/* Custom Themes: Create + Saved Themes (Inline) */}
        <div className={styles.themeSubcategory}>
          <h4 className={styles.subcategoryTitle}>
            <span className={styles.subcategoryIcon}>🎨</span>
            Custom Themes
          </h4>
          
          {/* Loading state for saved themes */}
          {isLoadingThemes && connectedWallet && (
            <div className={styles.loadingThemes}>
              <Spinner size="small" />
              <span className={styles.loadingText}>Loading your themes...</span>
            </div>
          )}
          
          <div className={styles.themeGrid}>
            {/* Create Theme Button (always first) */}
            <button
              className={`${styles.themeCard} ${isThemeCustomized ? styles.selected : ''} ${styles.customCard}`}
              onClick={handleOpenThemeBuilder}
            >
              <div className={styles.themePreview}>
                <div className={styles.customPreview}>
                  <div className={styles.customIcon}>🎨</div>
                  <div className={styles.customLabel}>
                    {isThemeCustomized ? 'Edit Theme' : 'Create Theme'}
                  </div>
                </div>
              </div>
              <div className={styles.themeName}>Theme Builder</div>
              <div className={styles.themeDescription}>Create your own theme with 150+ color controls</div>
              {isThemeCustomized && (
                <div className={styles.checkmark}>✓</div>
              )}
            </button>
            
            {/* User's Saved Themes */}
            {!isLoadingThemes && savedThemes.map((theme) => {
              const isSelected = customTheme?.id === theme.id;
              
              return (
                <div key={theme.id} className={styles.savedThemeCard}>
                  <button
                    className={`${styles.themeCard} ${isSelected ? styles.selected : ''}`}
                    onClick={() => handleSelectSavedTheme(theme)}
                  >
                    <div className={styles.themePreview}>
                      <div className={`${styles.previewWindow} ${styles['theme-custom']}`}
                        style={{
                          backgroundColor: theme.colors.windowBackground,
                          borderColor: theme.colors.windowBorder,
                        }}
                      >
                        <div 
                          className={styles.previewTitleBar}
                          style={{
                            backgroundColor: theme.colors.titleBarActive,
                          }}
                        />
                        <div 
                          className={styles.previewContent}
                          style={{
                            backgroundColor: theme.colors.windowBackground,
                          }}
                        />
                      </div>
                    </div>
                    <div className={styles.themeName}>{theme.name}</div>
                    <div className={styles.themeDescription}>{theme.description || 'Custom theme'}</div>
                    {isSelected && (
                      <div className={styles.checkmark}>✓</div>
                    )}
                    {theme.isPublic && (
                      <div className={styles.publicBadge} title="Shared publicly">🌍</div>
                    )}
                  </button>
                  
                  {/* Quick actions for saved themes */}
                  <div className={styles.themeActions}>
                    <button 
                      className={styles.actionButton}
                      onClick={() => handleEditSavedTheme(theme)}
                      title="Edit theme"
                    >
                      ✏️
                    </button>
                    <button 
                      className={styles.actionButton}
                      onClick={() => handleDuplicateSavedTheme(theme)}
                      title="Duplicate theme"
                    >
                      📋
                    </button>
                    <button 
                      className={styles.actionButton}
                      onClick={() => handleExportSavedTheme(theme)}
                      title="Export as JSON"
                    >
                      💾
                    </button>
                    <button 
                      className={styles.actionButton}
                      onClick={() => handleShareSavedTheme(theme)}
                      title={theme.isPublic ? 'Make private' : 'Share publicly'}
                    >
                      {theme.isPublic ? '🔒' : '🌍'}
                    </button>
                    <button 
                      className={styles.actionButton}
                      onClick={() => handleDeleteSavedTheme(theme)}
                      title="Delete theme"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Empty state when no saved themes and wallet is connected */}
          {!isLoadingThemes && connectedWallet && savedThemes.length === 0 && (
            <p className={styles.emptyHint}>
              💡 Create and save your first custom theme using the Theme Builder above!
            </p>
          )}
          
          {/* Prompt to connect wallet */}
          {!connectedWallet && (
            <p className={styles.emptyHint}>
              🔌 Connect your wallet to save and manage custom themes
            </p>
          )}
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

      {/* Community Themes Section - Phase 8C */}
      <CollapsibleSection
        title="Community Themes"
        description="Discover and install themes shared by others"
        icon="🌍"
        defaultExpanded={false}
      >
        <ThemeBrowser
          walletAddress={connectedWallet}
          onInstallComplete={() => {
            // Trigger reload - ThemeLibrary will refresh automatically on next expand
            console.log('✅ Theme installed - library will refresh on next view');
          }}
        />
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

      {/* Theme Naming Dialog - Phase 8B */}
      <ThemeNameDialog
        isOpen={isNameDialogOpen}
        initialName={editingTheme?.name || ''}
        title="Save Custom Theme"
        onSave={handleSaveThemeWithName}
        onCancel={() => setIsNameDialogOpen(false)}
      />
    </div>
  );
}
