/**
 * Apps Application
 * Launchpad-style app launcher with categorization
 */

'use client';

import { useState, useMemo } from 'react';
import { useSystemStore } from '../../../OS/store/systemStore';
import { REGISTERED_APPS } from '../../AppConfig';
import type { AppConfig } from '../../AppConfig';
import { categorizeApps, getAllApps, searchApps, sortAppsByName } from './utils/categorizeApps';
import AppCategory from './components/AppCategory';
import AppGrid from './components/AppGrid';
import styles from './Apps.module.css';

interface AppsProps {
  windowId: string;
}

type ViewMode = 'categories' | 'all';

export default function Apps({ windowId }: AppsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('categories');
  
  const launchApp = useSystemStore((state) => state.launchApp);

  // Get all apps except the Apps app itself
  const availableApps = useMemo(
    () => REGISTERED_APPS.filter((app) => app.id !== 'apps'),
    []
  );

  // Categorize apps
  const categories = useMemo(
    () => categorizeApps(availableApps),
    [availableApps]
  );

  // Get all apps as flat list
  const allApps = useMemo(
    () => sortAppsByName(getAllApps(REGISTERED_APPS)),
    []
  );

  // Search/filter
  const filteredApps = useMemo(() => {
    if (!searchQuery.trim()) {
      return viewMode === 'all' ? allApps : null;
    }
    return sortAppsByName(searchApps(availableApps, searchQuery));
  }, [searchQuery, availableApps, allApps, viewMode]);

  const handleAppClick = (app: AppConfig) => {
    launchApp(app);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const isSearching = searchQuery.trim().length > 0;
  const showCategories = viewMode === 'categories' && !isSearching;
  const showGrid = viewMode === 'all' || isSearching;

  return (
    <div className={styles.apps}>
      {/* Search Bar */}
      <div className={styles.searchBar}>
        <div className={styles.searchInputWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searchQuery && (
            <button
              className={styles.clearButton}
              onClick={handleClearSearch}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* View Mode Toggle */}
      {!isSearching && (
        <div className={styles.viewModeToggle}>
          <button
            className={`${styles.viewModeButton} ${viewMode === 'categories' ? styles.active : ''}`}
            onClick={() => setViewMode('categories')}
          >
            Categories
          </button>
          <button
            className={`${styles.viewModeButton} ${viewMode === 'all' ? styles.active : ''}`}
            onClick={() => setViewMode('all')}
          >
            All Apps ({allApps.length})
          </button>
        </div>
      )}

      {/* Content */}
      <div className={styles.content}>
        {isSearching && filteredApps ? (
          // Search Results
          <div className={styles.searchResults}>
            <div className={styles.searchResultsHeader}>
              <span className={styles.searchResultsCount}>
                {filteredApps.length} {filteredApps.length === 1 ? 'app' : 'apps'} found
              </span>
            </div>
            <AppGrid apps={filteredApps} onAppClick={handleAppClick} />
          </div>
        ) : showCategories ? (
          // Categories View
          <div className={styles.categories}>
            {categories.map((category) => (
              <AppCategory
                key={category.id}
                category={category}
                onAppClick={handleAppClick}
                defaultExpanded={true}
              />
            ))}
          </div>
        ) : showGrid ? (
          // All Apps Grid
          <div className={styles.allAppsGrid}>
            <AppGrid apps={allApps} onAppClick={handleAppClick} />
          </div>
        ) : null}
      </div>

      {/* Stats Footer */}
      <div className={styles.footer}>
        <span className={styles.footerText}>
          {availableApps.length} apps installed • {categories.length} categories
        </span>
      </div>
    </div>
  );
}

