'use client';

/**
 * Dock Component
 * Mac OS 8 style dock for minimized windows
 */

import { useSystemStore } from '../../store/systemStore';
import styles from './Dock.module.css';

export default function Dock() {
  const windows = useSystemStore((state) => state.windows);
  const runningApps = useSystemStore((state) => state.runningApps);
  const focusWindow = useSystemStore((state) => state.focusWindow);

  // Get minimized windows
  const minimizedWindows = Object.values(windows).filter(
    (window) => window.state === 'minimized'
  );

  // Don't render dock if no minimized windows
  if (minimizedWindows.length === 0) {
    return null;
  }

  // Restore window when clicked
  const handleRestore = (windowId: string) => {
    focusWindow(windowId); // This will also set state back to 'normal' via the store
  };

  return (
    <div className={styles.dock}>
      <div className={styles.dockContainer}>
        {minimizedWindows.map((window) => {
          const app = runningApps[window.appId];
          if (!app) return null;

          return (
            <button
              key={window.id}
              className={styles.dockItem}
              onClick={() => handleRestore(window.id)}
              title={`Restore ${window.title}`}
              aria-label={`Restore ${window.title}`}
            >
              <img
                src={app.config.icon}
                alt=""
                className={styles.dockIcon}
              />
              <div className={styles.dockLabel}>{window.title}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

