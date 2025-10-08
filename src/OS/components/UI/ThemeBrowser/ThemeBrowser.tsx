/**
 * Theme Browser Component
 * Discover and install themes shared by other users
 * Phase 8C: Public theme discovery
 */

'use client';

import { useState, useEffect } from 'react';
import { Theme } from '../../../types/theme';
import { installSharedTheme, discoverPublicThemes } from '../../../lib/themeManager';
import Button from '../Button/Button';
import Spinner from '../Spinner/Spinner';
import TextInput from '../TextInput/TextInput';
import styles from './ThemeBrowser.module.css';

export interface PublicThemeData {
  id: number;
  walletAddress: string;
  themeId: string;
  themeName: string;
  themeDescription: string;
  themeData: Theme;
  shareCode: string;
  viewCount: number;
  installCount: number;
  createdAt: string;
  updatedAt: string;
  author: string;
}

export interface ThemeBrowserProps {
  walletAddress: string | null;
  onInstallComplete?: () => void;
}

export default function ThemeBrowser({
  walletAddress,
  onInstallComplete,
}: ThemeBrowserProps) {
  const [publicThemes, setPublicThemes] = useState<PublicThemeData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [shareCodeInput, setShareCodeInput] = useState('');
  const [installingThemes, setInstallingThemes] = useState<Set<string>>(new Set());

  // Load public themes
  useEffect(() => {
    loadPublicThemes();
  }, [walletAddress]);

  const loadPublicThemes = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const themes = await discoverPublicThemes(walletAddress || undefined);
      setPublicThemes(themes);
    } catch (err) {
      console.error('Error loading public themes:', err);
      setError(err instanceof Error ? err.message : 'Failed to load themes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstall = async (shareCode: string, themeName: string) => {
    if (!walletAddress) {
      alert('Please connect your wallet to install themes');
      return;
    }

    setInstallingThemes(prev => new Set(prev).add(shareCode));

    try {
      const result = await installSharedTheme(walletAddress, shareCode);

      if (!result.success) {
        alert(result.error || 'Failed to install theme');
        return;
      }

      alert(`✅ "${themeName}" installed successfully!`);
      
      // Trigger reload of custom themes
      if (onInstallComplete) {
        onInstallComplete();
      }
    } catch (err) {
      console.error('Error installing theme:', err);
      alert('Failed to install theme. Please try again.');
    } finally {
      setInstallingThemes(prev => {
        const next = new Set(prev);
        next.delete(shareCode);
        return next;
      });
    }
  };

  const handleInstallByCode = async () => {
    if (!shareCodeInput.trim()) {
      alert('Please enter a share code');
      return;
    }

    await handleInstall(shareCodeInput.trim().toUpperCase(), 'theme');
    setShareCodeInput('');
  };

  // Filter themes by search query
  const filteredThemes = publicThemes.filter((theme) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      theme.themeName.toLowerCase().includes(query) ||
      theme.themeDescription.toLowerCase().includes(query) ||
      theme.author.toLowerCase().includes(query)
    );
  });

  // No wallet connected
  if (!walletAddress) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>🔌</div>
        <h3 className={styles.emptyTitle}>Connect Wallet</h3>
        <p className={styles.emptyDescription}>
          Connect your wallet to browse and install community themes
        </p>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.loadingState}>
        <Spinner size="large" />
        <p className={styles.loadingText}>Loading community themes...</p>
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
        <Button onClick={loadPublicThemes}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className={styles.browser}>
      {/* Header with search and share code input */}
      <div className={styles.header}>
        <div className={styles.stats}>
          <span className={styles.count}>
            {publicThemes.length} public theme{publicThemes.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className={styles.searchRow}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search themes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className={styles.shareCodeInput}>
            <TextInput
              value={shareCodeInput}
              onChange={(value) => setShareCodeInput(value.toUpperCase())}
              placeholder="Enter share code"
              maxLength={8}
            />
            <Button onClick={handleInstallByCode} disabled={!shareCodeInput.trim()}>
              Install
            </Button>
          </div>
        </div>
      </div>

      {/* Theme grid */}
      {filteredThemes.length > 0 ? (
        <div className={styles.grid}>
          {filteredThemes.map((publicTheme) => {
            const theme = publicTheme.themeData;
            const isInstalling = installingThemes.has(publicTheme.shareCode);

            return (
              <div key={publicTheme.shareCode} className={styles.themeCard}>
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
                </div>

                {/* Theme info */}
                <div className={styles.info}>
                  <h3 className={styles.themeName}>{publicTheme.themeName}</h3>
                  {publicTheme.themeDescription && (
                    <p className={styles.themeDescription}>{publicTheme.themeDescription}</p>
                  )}
                  <div className={styles.metadata}>
                    <span className={styles.author}>by {publicTheme.author}</span>
                    <span className={styles.installs}>
                      {publicTheme.installCount} install{publicTheme.installCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className={styles.shareCode}>
                    Code: <strong>{publicTheme.shareCode}</strong>
                  </div>
                </div>

                {/* Install button */}
                <div className={styles.actions}>
                  <Button
                    onClick={() => handleInstall(publicTheme.shareCode, publicTheme.themeName)}
                    disabled={isInstalling}
                    fullWidth
                  >
                    {isInstalling ? 'Installing...' : 'Install Theme'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.noResults}>
          {searchQuery ? (
            <>
              <p>No themes found matching "{searchQuery}"</p>
              <Button onClick={() => setSearchQuery('')}>Clear Search</Button>
            </>
          ) : (
            <>
              <div className={styles.emptyIcon}>🎨</div>
              <h3 className={styles.emptyTitle}>No Public Themes Yet</h3>
              <p className={styles.emptyDescription}>
                Be the first to share a theme with the community!
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

