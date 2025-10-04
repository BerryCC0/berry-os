'use client';

/**
 * AppSwitcher Component
 * Mobile app switcher (swipe up from bottom)
 */

import { useSystemStore } from '../../store/systemStore';
import TouchTarget from '../UI/TouchTarget/TouchTarget';
import styles from './AppSwitcher.module.css';

interface AppSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AppSwitcher({ isOpen, onClose }: AppSwitcherProps) {
  const runningApps = useSystemStore((state) => state.runningApps);
  const focusWindow = useSystemStore((state) => state.focusWindow);
  const terminateApp = useSystemStore((state) => state.terminateApp);

  if (!isOpen) return null;

  const handleSwitchToApp = (windowId: string) => {
    focusWindow(windowId);
    onClose();
  };

  const handleCloseApp = (e: React.MouseEvent, appId: string) => {
    e.stopPropagation();
    terminateApp(appId);
    
    // Close switcher if no apps left
    if (Object.keys(runningApps).length === 1) {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.title}>Running Apps</div>
          <TouchTarget onTap={onClose} className={styles.closeButton}>
            <span>✕</span>
          </TouchTarget>
        </div>

        {/* App Cards */}
        <div className={styles.appGrid}>
          {Object.values(runningApps).length === 0 ? (
            <div className={styles.emptyState}>
              <p>No apps running</p>
            </div>
          ) : (
            Object.values(runningApps).map((app) => {
              const windowId = app.windows[0];
              if (!windowId) return null;

              return (
                <TouchTarget
                  key={app.id}
                  onTap={() => handleSwitchToApp(windowId)}
                  className={styles.appCard}
                >
                  {/* Close button */}
                  <button
                    className={styles.appCloseButton}
                    onClick={(e) => handleCloseApp(e, app.id)}
                    aria-label={`Close ${app.config.name}`}
                  >
                    ✕
                  </button>

                  {/* App icon */}
                  <div className={styles.appIconContainer}>
                    <img
                      src={app.config.icon}
                      alt=""
                      className={styles.appIcon}
                    />
                  </div>

                  {/* App name */}
                  <div className={styles.appName}>{app.config.name}</div>

                  {/* Window count badge */}
                  {app.windows.length > 1 && (
                    <div className={styles.windowBadge}>{app.windows.length}</div>
                  )}
                </TouchTarget>
              );
            })
          )}
        </div>

        {/* Swipe indicator */}
        <div className={styles.swipeIndicator}>
          <div className={styles.swipeBar} />
        </div>
      </div>
    </div>
  );
}

