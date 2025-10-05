'use client';

/**
 * Dock Component
 * Modern Mac OS style dock with pinned apps and running indicators
 */

import { useSystemStore } from '../../store/systemStore';
import { REGISTERED_APPS, getAppById } from '../../../Apps/AppConfig';
import styles from './Dock.module.css';

export default function Dock() {
  const pinnedApps = useSystemStore((state) => state.pinnedApps);
  const runningApps = useSystemStore((state) => state.runningApps);
  const windows = useSystemStore((state) => state.windows);
  const launchApp = useSystemStore((state) => state.launchApp);
  const focusWindow = useSystemStore((state) => state.focusWindow);

  // Get all dock items (pinned apps + running non-pinned apps)
  const dockItems = [
    // Pinned apps (Finder always first)
    ...pinnedApps.map(appId => {
      const appConfig = REGISTERED_APPS.find(app => app.id === appId);
      return appConfig ? { appId, config: appConfig, isPinned: true } : null;
    }).filter(Boolean),
    
    // Running apps not in pinned list
    ...Object.values(runningApps)
      .filter(app => !pinnedApps.includes(app.id))
      .map(app => ({ appId: app.id, config: app.config, isPinned: false }))
  ];

  const handleDockItemClick = (appId: string) => {
    const app = runningApps[appId];
    
    if (!app) {
      // App not running - launch it
      const appConfig = REGISTERED_APPS.find(a => a.id === appId);
      if (appConfig) {
        launchApp(appConfig);
      }
    } else {
      // App is running - find its window
      const appWindows = Object.values(windows).filter(w => w.appId === appId);
      
      if (appWindows.length > 0) {
        // Focus the first window (or most recent)
        const sortedWindows = appWindows.sort((a, b) => b.zIndex - a.zIndex);
        focusWindow(sortedWindows[0].id);
      }
    }
  };

  const isAppRunning = (appId: string) => {
    return appId in runningApps;
  };

  const hasMinimizedWindow = (appId: string) => {
    return Object.values(windows).some(
      w => w.appId === appId && w.state === 'minimized'
    );
  };

  // Handler for Apps folder button
  const handleAppsClick = () => {
    const finderApp = getAppById('finder');
    if (!finderApp) return;

    // Check if Finder is already running
    const finderRunningApp = runningApps['finder'];
    
    if (finderRunningApp && finderRunningApp.windows.length > 0) {
      // Finder is already running - focus it and navigate to Applications
      const finderWindowId = finderRunningApp.windows[0];
      focusWindow(finderWindowId);
      
      // Publish event to navigate Finder to Applications folder
      // The Finder component will listen for this event
      import('../../lib/eventBus').then(({ eventBus }) => {
        eventBus.publish('FINDER_NAVIGATE', { path: '/Applications' });
      });
    } else {
      // Launch Finder with Applications path in state
      // This will open Finder directly to the Applications folder
      const params = new URLSearchParams(window.location.search);
      params.set('apps', 'finder');
      params.set('state', btoa(JSON.stringify({ initialPath: '/Applications' })));
      window.history.pushState({}, '', `?${params.toString()}`);
      
      launchApp(finderApp);
    }
  };

  return (
    <div className={styles.dock}>
      <div className={styles.dockContainer}>
        {dockItems.map((item) => {
          if (!item) return null;
          
          const running = isAppRunning(item.appId);
          const minimized = hasMinimizedWindow(item.appId);

          return (
            <button
              key={item.appId}
              className={`${styles.dockItem} ${running ? styles.running : ''}`}
              onClick={() => handleDockItemClick(item.appId)}
              title={item.config.name}
              aria-label={`${running ? 'Switch to' : 'Launch'} ${item.config.name}`}
            >
              <div className={styles.iconWrapper}>
                <img
                  src={item.config.icon}
                  alt=""
                  className={styles.dockIcon}
                  aria-hidden="true"
                />
                {minimized && (
                  <div 
                    className={styles.minimizedIndicator}
                    aria-label="Window minimized"
                  />
                )}
              </div>
              
              {/* Running indicator (dot below icon) */}
              {running && (
                <div 
                  className={styles.runningIndicator}
                  aria-label="Application running"
                />
              )}
            </button>
          );
        })}
        
        {/* Divider before Apps button */}
        <div className={styles.dockDivider} aria-hidden="true" />
        
        {/* Apps Folder Button (always on far right) */}
        <button
          className={styles.appsButton}
          onClick={handleAppsClick}
          title="Applications"
          aria-label="Open Applications folder"
        >
          <div className={styles.iconWrapper}>
            <img
              src="/icons/system/folder-applications.svg"
              alt=""
              className={styles.dockIcon}
              aria-hidden="true"
            />
          </div>
        </button>
      </div>
    </div>
  );
}
