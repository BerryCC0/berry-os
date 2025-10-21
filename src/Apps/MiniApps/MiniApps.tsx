/**
 * Mini Apps - Main Component
 * Browse and launch Farcaster Mini Apps from Neynar catalog
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useSystemStore } from '../../OS/store/systemStore';
import { useFarcasterAuth } from './utils/hooks/useFarcasterAuth';
import { useMiniAppCatalog } from './utils/hooks/useMiniAppCatalog';
import { DEFAULT_FILTERS } from './utils/types/miniAppTypes';
import type { MiniAppFilters as MiniAppFiltersType, MiniAppCatalogItem } from './utils/types/miniAppTypes';
import { buildLaunchData } from './utils/helpers/launchHelpers';
import AuthPrompt from './components/AuthPrompt/AuthPrompt';
import MiniAppFilters from './components/MiniAppFilters/MiniAppFilters';
import MiniAppGrid from './components/MiniAppGrid/MiniAppGrid';
import styles from './MiniApps.module.css';

interface MiniAppsProps {
  windowId: string;
}

export default function MiniApps({ windowId }: MiniAppsProps) {
  const authState = useFarcasterAuth();
  const { isAuthenticated, isConfigured, signout, username, displayName, fid, pfpUrl } = authState;
  const [filters, setFilters] = useState<MiniAppFiltersType>(DEFAULT_FILTERS);
  const { items, loading, error, hasMore, loadMore, refresh } = useMiniAppCatalog(filters);
  const launchMiniApp = useSystemStore((state) => state.launchMiniApp);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Debug: Log auth state
  useEffect(() => {
    console.log('MiniApps auth state:', authState);
  }, [authState]);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showUserMenu]);

  // Handle Mini App launch
  const handleLaunchMiniApp = (miniApp: MiniAppCatalogItem) => {
    console.log('Launching Mini App:', miniApp);
    
    // Pass authenticated user data to Mini App
    const userData = {
      fid,
      username,
      displayName,
      pfpUrl,
    };
    
    const launchData = buildLaunchData(miniApp, userData);
    console.log('Launch data:', launchData);
    
    // Launch Mini App in new window using system store
    if (launchMiniApp) {
      launchMiniApp(miniApp, launchData);
    } else {
      console.error('launchMiniApp function not available in system store');
    }
  };

  // Show auth prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className={styles.miniApps}>
        <AuthPrompt />
      </div>
    );
  }

  return (
    <div className={styles.miniApps}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          {isAuthenticated && (
            <div className={styles.userAccount} ref={userMenuRef}>
              <button 
                className={styles.userButton}
                onClick={() => setShowUserMenu(!showUserMenu)}
                title={`${displayName || username || 'User'} (FID: ${fid || 'N/A'})`}
              >
                {pfpUrl ? (
                  <img 
                    src={pfpUrl} 
                    alt={username || 'User'}
                    className={styles.userAvatar}
                  />
                ) : (
                  <div className={styles.userAvatarPlaceholder}>👤</div>
                )}
                <span className={styles.userName}>
                  {displayName || username || 'User'}
                </span>
                <span className={styles.dropdownArrow}>
                  {showUserMenu ? '▲' : '▼'}
                </span>
              </button>
              
              {showUserMenu && (
                <div className={styles.userMenu}>
                  <div className={styles.userMenuHeader}>
                    <div className={styles.userMenuInfo}>
                      <strong>{displayName || username || 'User'}</strong>
                      {username && <span className={styles.userMenuUsername}>@{username}</span>}
                      {fid && <span className={styles.userMenuFid}>FID: {fid}</span>}
                    </div>
                  </div>
                  <div className={styles.userMenuDivider} />
                  <button 
                    className={styles.userMenuItem}
                    onClick={() => {
                      setShowUserMenu(false);
                      signout();
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <MiniAppFilters filters={filters} onChange={setFilters} />

      {/* Results Count */}
      {!loading && items.length > 0 && (
        <div className={styles.resultsInfo}>
          <span className={styles.resultsCount}>
            {items.length} Mini App{items.length !== 1 ? 's' : ''} found
          </span>
          <button className={styles.refreshButton} onClick={refresh}>
            Refresh
          </button>
        </div>
      )}

      {/* Grid */}
      <MiniAppGrid
        items={items}
        loading={loading}
        error={error}
        hasMore={hasMore}
        onLaunch={handleLaunchMiniApp}
        onLoadMore={loadMore}
      />
    </div>
  );
}

