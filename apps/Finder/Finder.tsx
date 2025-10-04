'use client';

/**
 * Finder
 * Mac OS 8 Finder - The heart of the operating system
 */

import { useState, useEffect, useCallback } from 'react';
import type { FileSystemItem, ViewMode, SortField, SortDirection } from '../../system/types/filesystem';
import {
  getItemByPath,
  getChildren,
  getParentPath,
  getBreadcrumbs,
  sortItems,
} from '../../system/lib/filesystem';
import { getAppById } from '../AppConfig';
import { useSystemStore } from '../../system/store/systemStore';
import { getAppForFileType, createFileOpenData } from '../../system/lib/fileOpener';
import { serializeState } from '../../app/lib/utils/stateUtils';
import { eventBus } from '../../system/lib/eventBus';
import { clipboard } from '../../system/lib/clipboard';
import styles from './Finder.module.css';

interface FinderProps {
  windowId: string;
}

export default function Finder({ windowId }: FinderProps) {
  const [currentPath, setCurrentPath] = useState('/');
  const [viewMode, setViewMode] = useState<ViewMode>('icon');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [navigationHistory, setNavigationHistory] = useState<string[]>(['/']);
  const [historyIndex, setHistoryIndex] = useState(0);

  const launchApp = useSystemStore((state) => state.launchApp);

  // Get current folder and its contents
  const currentFolder = getItemByPath(currentPath);
  const items = currentFolder ? sortItems(getChildren(currentPath), sortField, sortDirection) : [];
  const breadcrumbs = getBreadcrumbs(currentPath);

  // Navigate to path
  const navigateTo = useCallback((path: string) => {
    if (path === currentPath) return;

    // Add to history
    const newHistory = navigationHistory.slice(0, historyIndex + 1);
    newHistory.push(path);
    setNavigationHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentPath(path);
    setSelectedItems([]);
  }, [currentPath, navigationHistory, historyIndex]);

  // Navigation controls
  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < navigationHistory.length - 1;

  const goBack = () => {
    if (canGoBack) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentPath(navigationHistory[newIndex]);
      setSelectedItems([]);
    }
  };

  const goForward = () => {
    if (canGoForward) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentPath(navigationHistory[newIndex]);
      setSelectedItems([]);
    }
  };

  const goUp = () => {
    if (currentPath !== '/') {
      navigateTo(getParentPath(currentPath));
    }
  };

  // Open item (double-click or Enter)
  const openItem = (item: FileSystemItem) => {
    if (item.type === 'folder') {
      navigateTo(item.path);
    } else if (item.type === 'application' && item.appId) {
      const appConfig = getAppById(item.appId);
      if (appConfig) {
        launchApp(appConfig);
      }
    } else {
      // Open file with appropriate app
      const appId = getAppForFileType(item);
      if (appId) {
        const appConfig = getAppById(appId);
        if (appConfig) {
          // Create file open data with navigation context
          const fileData = createFileOpenData(item, currentPath, items);
          
          // Encode file data into URL state
          const encodedState = serializeState(fileData);
          
          // Update URL with file state
          const params = new URLSearchParams(window.location.search);
          params.set('apps', appId);
          params.set('state', encodedState);
          window.history.pushState({}, '', `?${params.toString()}`);
          
          // Launch the app
          launchApp(appConfig);
        }
      } else {
        console.log('No app available to open:', item.name);
      }
    }
  };

  // Selection handling
  const toggleSelection = (itemId: string, multiSelect: boolean = false) => {
    if (multiSelect) {
      setSelectedItems((prev) =>
        prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
      );
    } else {
      setSelectedItems([itemId]);
    }
  };

  const selectAll = () => {
    setSelectedItems(items.map((item) => item.id));
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  // Sorting
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Menu action handlers
  useEffect(() => {
    const subscription = eventBus.subscribe('MENU_ACTION', (payload) => {
      const { action } = payload as any;
      
      switch (action) {
        case 'new-folder':
          alert('New Folder: This would create a new folder (read-only filesystem)');
          break;
        
        case 'cut':
          if (selectedItems.length > 0) {
            const items = selectedItems.map(id => {
              const item = getItemByPath(currentPath)?.children?.find(i => i.id === id);
              return item;
            }).filter(Boolean);
            clipboard.cut('file', items);
          }
          break;
        
        case 'copy':
          if (selectedItems.length > 0) {
            const items = selectedItems.map(id => {
              const item = getItemByPath(currentPath)?.children?.find(i => i.id === id);
              return item;
            }).filter(Boolean);
            clipboard.copy('file', items);
          }
          break;
        
        case 'paste':
          const clipboardData = clipboard.paste();
          if (clipboardData) {
            alert(`Paste: Would paste ${clipboardData.data.length} item(s) (read-only filesystem)`);
          }
          break;
        
        case 'select-all':
          selectAll();
          break;
        
        case 'view-as-icons':
          setViewMode('icon');
          break;
        
        case 'view-as-list':
          setViewMode('list');
          break;
        
        case 'empty-trash':
          alert('Empty Trash: This would empty the trash');
          break;
      }
    });

    return () => subscription.unsubscribe();
  }, [selectedItems, currentPath]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command+A: Select all
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault();
        selectAll();
      }
      // Escape: Clear selection
      else if (e.key === 'Escape') {
        clearSelection();
      }
      // Backspace/Delete: Go up
      else if (e.key === 'Backspace' && currentPath !== '/') {
        e.preventDefault();
        goUp();
      }
      // Enter: Open selected item
      else if (e.key === 'Enter' && selectedItems.length === 1) {
        const item = items.find((i) => i.id === selectedItems[0]);
        if (item) openItem(item);
      }
      // Arrow keys: Navigate selection
      else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        handleArrowNavigation(e.key as 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPath, selectedItems, items]);

  const handleArrowNavigation = (key: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight') => {
    if (items.length === 0) return;

    const currentIndex = selectedItems.length > 0
      ? items.findIndex((i) => i.id === selectedItems[0])
      : -1;

    let newIndex = currentIndex;

    if (viewMode === 'list') {
      if (key === 'ArrowUp') newIndex = Math.max(0, currentIndex - 1);
      if (key === 'ArrowDown') newIndex = Math.min(items.length - 1, currentIndex + 1);
    } else {
      // Icon view - grid navigation
      const cols = 4; // We'll make this dynamic later
      if (key === 'ArrowLeft') newIndex = Math.max(0, currentIndex - 1);
      if (key === 'ArrowRight') newIndex = Math.min(items.length - 1, currentIndex + 1);
      if (key === 'ArrowUp') newIndex = Math.max(0, currentIndex - cols);
      if (key === 'ArrowDown') newIndex = Math.min(items.length - 1, currentIndex + cols);
    }

    if (newIndex !== currentIndex && newIndex >= 0) {
      setSelectedItems([items[newIndex].id]);
    }
  };

  return (
    <div className={styles.finder}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        {/* Navigation buttons */}
        <div className={styles.navButtons}>
          <button
            className={styles.navButton}
            onClick={goBack}
            disabled={!canGoBack}
            title="Back"
          >
            ◀
          </button>
          <button
            className={styles.navButton}
            onClick={goForward}
            disabled={!canGoForward}
            title="Forward"
          >
            ▶
          </button>
          <button
            className={styles.navButton}
            onClick={goUp}
            disabled={currentPath === '/'}
            title="Up"
          >
            ▲
          </button>
        </div>

        {/* Breadcrumbs */}
        <div className={styles.breadcrumbs}>
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.path}>
              <button
                className={styles.breadcrumb}
                onClick={() => navigateTo(crumb.path)}
              >
                {crumb.name}
              </button>
              {index < breadcrumbs.length - 1 && (
                <span className={styles.breadcrumbSeparator}>▸</span>
              )}
            </span>
          ))}
        </div>

        {/* View controls */}
        <div className={styles.viewControls}>
          <button
            className={`${styles.viewButton} ${viewMode === 'icon' ? styles.active : ''}`}
            onClick={() => setViewMode('icon')}
            title="Icon View"
          >
            ▦
          </button>
          <button
            className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
            onClick={() => setViewMode('list')}
            title="List View"
          >
            ≡
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className={styles.content}>
        {viewMode === 'icon' ? (
          // Icon View
          <div className={styles.iconView}>
            {items.map((item) => (
              <div
                key={item.id}
                className={`${styles.iconItem} ${
                  selectedItems.includes(item.id) ? styles.selected : ''
                }`}
                onClick={(e) => toggleSelection(item.id, e.metaKey || e.ctrlKey)}
                onDoubleClick={() => openItem(item)}
              >
                <img src={item.icon} alt={item.name} className={styles.iconImage} />
                <div className={styles.iconLabel}>{item.name}</div>
              </div>
            ))}
          </div>
        ) : (
          // List View
          <div className={styles.listView}>
            <div className={styles.listHeader}>
              <div className={styles.listHeaderCell} onClick={() => handleSort('name')}>
                Name {sortField === 'name' && (sortDirection === 'asc' ? '▲' : '▼')}
              </div>
              <div className={styles.listHeaderCell} onClick={() => handleSort('dateModified')}>
                Date Modified {sortField === 'dateModified' && (sortDirection === 'asc' ? '▲' : '▼')}
              </div>
              <div className={styles.listHeaderCell} onClick={() => handleSort('size')}>
                Size {sortField === 'size' && (sortDirection === 'asc' ? '▲' : '▼')}
              </div>
              <div className={styles.listHeaderCell} onClick={() => handleSort('type')}>
                Kind {sortField === 'type' && (sortDirection === 'asc' ? '▲' : '▼')}
              </div>
            </div>
            <div className={styles.listBody}>
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`${styles.listRow} ${
                    selectedItems.includes(item.id) ? styles.selected : ''
                  }`}
                  onClick={(e) => toggleSelection(item.id, e.metaKey || e.ctrlKey)}
                  onDoubleClick={() => openItem(item)}
                >
                  <div className={styles.listCell}>
                    <img src={item.icon} alt="" className={styles.listIcon} />
                    {item.name}
                  </div>
                  <div className={styles.listCell}>
                    {item.dateModified.toLocaleDateString()}
                  </div>
                  <div className={styles.listCell}>
                    {item.type === 'folder' ? '--' : `${Math.round((item.size || 0) / 1024)} KB`}
                  </div>
                  <div className={styles.listCell}>
                    {item.type === 'folder' ? 'Folder' : 'Document'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {items.length === 0 && (
          <div className={styles.emptyState}>
            <p>This folder is empty</p>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className={styles.statusBar}>
        <span>{items.length} item{items.length !== 1 ? 's' : ''}</span>
        {selectedItems.length > 0 && (
          <span>, {selectedItems.length} selected</span>
        )}
      </div>
    </div>
  );
}

