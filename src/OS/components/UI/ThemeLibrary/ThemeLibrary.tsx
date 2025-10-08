/**
 * Theme Library Component
 * Manages user's custom themes with full CRUD operations
 * Phase 8C: Custom theme management + sharing
 */

'use client';

import { useState, useEffect } from 'react';
import { Theme } from '../../../types/theme';
import Button from '../Button/Button';
import Spinner from '../Spinner/Spinner';
import styles from './ThemeLibrary.module.css';

export interface CustomThemeData {
  id: number;
  wallet_address: string;
  theme_id: string;
  theme_name: string;
  theme_description: string;
  theme_data: Theme;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  is_public?: boolean;
  share_code?: string;
}

export interface ThemeLibraryProps {
  walletAddress: string | null;
  activeThemeId: string;
  onSelectTheme: (theme: Theme) => void;
  onEditTheme: (theme: Theme) => void;
  onDuplicateTheme: (theme: Theme) => void;
  onDeleteTheme: (themeId: string) => void;
  onExportTheme: (theme: Theme) => void;
  onShareTheme: (themeId: string, isPublic: boolean) => void;
}

export default function ThemeLibrary({
  walletAddress,
  activeThemeId,
  onSelectTheme,
  onEditTheme,
  onDuplicateTheme,
  onDeleteTheme,
  onExportTheme,
  onShareTheme,
}: ThemeLibraryProps) {
  const [customThemes, setCustomThemes] = useState<CustomThemeData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load custom themes
  useEffect(() => {
    if (walletAddress) {
      loadCustomThemes();
    }
  }, [walletAddress]);

  const loadCustomThemes = async () => {
    if (!walletAddress) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/themes/list?walletAddress=${walletAddress}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to load custom themes');
      }

      const themes = await response.json();
      setCustomThemes(themes);
    } catch (err) {
      console.error('Error loading custom themes:', err);
      setError(err instanceof Error ? err.message : 'Failed to load themes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (themeId: string, themeName: string) => {
    if (!confirm(`Are you sure you want to delete "${themeName}"? This cannot be undone.`)) {
      return;
    }

    try {
      await onDeleteTheme(themeId);
      // Reload themes after deletion
      await loadCustomThemes();
    } catch (err) {
      console.error('Error deleting theme:', err);
      alert('Failed to delete theme. Please try again.');
    }
  };

  const handleToggleShare = async (themeId: string, currentIsPublic: boolean, themeName: string) => {
    const action = currentIsPublic ? 'make private' : 'share publicly';
    const message = currentIsPublic
      ? `Make "${themeName}" private? It will no longer be visible to other users.`
      : `Share "${themeName}" publicly? Other users will be able to discover and use your theme.`;

    if (!confirm(message)) {
      return;
    }

    try {
      await onShareTheme(themeId, !currentIsPublic);
      // Reload themes to show updated share status
      await loadCustomThemes();
    } catch (err) {
      console.error('Error toggling theme sharing:', err);
      alert(`Failed to ${action}. Please try again.`);
    }
  };

  // Filter themes by search query
  const filteredThemes = customThemes.filter((theme) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      theme.theme_name.toLowerCase().includes(query) ||
      theme.theme_description.toLowerCase().includes(query)
    );
  });

  // No wallet connected
  if (!walletAddress) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>🔌</div>
        <h3 className={styles.emptyTitle}>Connect Wallet</h3>
        <p className={styles.emptyDescription}>
          Connect your wallet to save and manage custom themes
        </p>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.loadingState}>
        <Spinner size="large" />
        <p className={styles.loadingText}>Loading your themes...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.errorState}>
        <div className={styles.errorIcon}>⚠️</div>
        <h3 className={styles.errorTitle}>Error Loading Themes</h3>
        <p className={styles.errorDescription}>{error}</p>
        <Button onClick={loadCustomThemes}>Try Again</Button>
      </div>
    );
  }

  // Empty state (no custom themes yet)
  if (customThemes.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>🎨</div>
        <h3 className={styles.emptyTitle}>No Custom Themes Yet</h3>
        <p className={styles.emptyDescription}>
          Create your first custom theme by clicking "Customize" on any preset theme
        </p>
      </div>
    );
  }

  return (
    <div className={styles.library}>
      {/* Header with search */}
      <div className={styles.header}>
        <div className={styles.stats}>
          <span className={styles.count}>{customThemes.length} custom theme{customThemes.length !== 1 ? 's' : ''}</span>
          {customThemes.filter(t => t.is_public).length > 0 && (
            <span className={styles.sharedBadge}>
              {customThemes.filter(t => t.is_public).length} shared publicly
            </span>
          )}
        </div>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search themes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Theme grid */}
      <div className={styles.grid}>
        {filteredThemes.map((customTheme) => {
          const theme = customTheme.theme_data;
          const isActive = theme.id === activeThemeId;

          return (
            <div
              key={customTheme.theme_id}
              className={`${styles.themeCard} ${isActive ? styles.active : ''}`}
            >
              {/* Theme preview */}
              <div
                className={styles.preview}
                style={{
                  background: theme.colors.windowBackground,
                  borderColor: theme.colors.windowBorder,
                }}
              >
                {/* Mini window preview */}
                <div
                  className={styles.miniWindow}
                  style={{
                    background: theme.colors.windowBackground,
                    borderColor: theme.colors.windowBorder,
                  }}
                >
                  <div
                    className={styles.miniTitleBar}
                    style={{
                      background: theme.colors.titleBarActive,
                      color: theme.colors.titleBarText,
                    }}
                  />
                  <div className={styles.miniContent}>
                    <div
                      className={styles.miniButton}
                      style={{
                        background: theme.colors.buttonPrimaryBackground,
                      }}
                    />
                  </div>
                </div>

                {/* Active indicator */}
                {isActive && (
                  <div className={styles.activeIndicator}>
                    <span className={styles.activeIcon}>✓</span>
                    Active
                  </div>
                )}

                {/* Public indicator */}
                {customTheme.is_public && (
                  <div className={styles.publicBadge} title="Shared publicly">
                    🌍
                  </div>
                )}
              </div>

              {/* Theme info */}
              <div className={styles.info}>
                <h3 className={styles.themeName}>{customTheme.theme_name}</h3>
                {customTheme.theme_description && (
                  <p className={styles.themeDescription}>{customTheme.theme_description}</p>
                )}
                <div className={styles.metadata}>
                  <span className={styles.date}>
                    {new Date(customTheme.created_at).toLocaleDateString()}
                  </span>
                  {customTheme.share_code && (
                    <span className={styles.shareCode} title="Share code">
                      {customTheme.share_code}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className={styles.actions}>
                {!isActive && (
                  <button
                    className={styles.actionButton}
                    onClick={() => onSelectTheme(theme)}
                    title="Apply this theme"
                  >
                    Apply
                  </button>
                )}
                <button
                  className={styles.actionButton}
                  onClick={() => onEditTheme(theme)}
                  title="Edit theme"
                >
                  ✏️
                </button>
                <button
                  className={styles.actionButton}
                  onClick={() => onDuplicateTheme(theme)}
                  title="Duplicate theme"
                >
                  📋
                </button>
                <button
                  className={styles.actionButton}
                  onClick={() => onExportTheme(theme)}
                  title="Export theme as JSON"
                >
                  💾
                </button>
                <button
                  className={`${styles.actionButton} ${customTheme.is_public ? styles.sharing : ''}`}
                  onClick={() => handleToggleShare(customTheme.theme_id, customTheme.is_public || false, customTheme.theme_name)}
                  title={customTheme.is_public ? 'Make private' : 'Share publicly'}
                >
                  {customTheme.is_public ? '🌍' : '🔒'}
                </button>
                <button
                  className={`${styles.actionButton} ${styles.delete}`}
                  onClick={() => handleDelete(customTheme.theme_id, customTheme.theme_name)}
                  title="Delete theme"
                >
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* No results from search */}
      {filteredThemes.length === 0 && searchQuery && (
        <div className={styles.noResults}>
          <p>No themes found matching "{searchQuery}"</p>
          <Button onClick={() => setSearchQuery('')}>Clear Search</Button>
        </div>
      )}
    </div>
  );
}

