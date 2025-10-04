'use client';

/**
 * Dock Component
 * Modern Mac OS style dock with pinned apps and running indicators
 */

import { useSystemStore } from '../../store/systemStore';
import { REGISTERED_APPS } from '../../../apps/AppConfig';
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
      </div>
    </div>
  );
}
