/**
 * AppsLaunchpad Component
 * Full-screen modal displaying all installed applications in a grid
 * Replaces the window-based Apps application with a Launchpad-style interface
 */

'use client';

import { useEffect } from 'react';
import { useSystemStore } from '../../../store/systemStore';
import { REGISTERED_APPS } from '../../../../Apps/AppConfig';
import type { AppConfig } from '../../../../Apps/AppConfig';
import { getAppIcon } from '../../../../../app/lib/utils/iconUtils';
import styles from './AppsLaunchpad.module.css';

export interface AppsLaunchpadProps {
  onClose: () => void;
}

export default function AppsLaunchpad({ onClose }: AppsLaunchpadProps) {
  const launchApp = useSystemStore((state) => state.launchApp);
  const dynamicAppIcons = useSystemStore((state) => state.dynamicAppIcons);

  // Get all apps except the 'apps' app itself (which is now removed)
  const availableApps = REGISTERED_APPS.filter((app) => app.id !== 'apps');

  // Handle ESC key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Handle app launch
  const handleAppClick = (app: AppConfig) => {
    launchApp(app);
    onClose(); // Close launchpad after launching app
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking the backdrop itself, not the content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className={styles.overlay} 
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Applications Launchpad"
    >
      <div className={styles.launchpad}>
        <div className={styles.header}>
          <h1 className={styles.title}>Applications</h1>
        </div>
        
        <div className={styles.iconGrid}>
          {availableApps.map((app) => (
            <button
              key={app.id}
              className={styles.appButton}
              onClick={() => handleAppClick(app)}
              aria-label={`Launch ${app.name}`}
              title={app.description}
            >
              <div className={styles.iconWrapper}>
                <img
                  src={getAppIcon(app.id, dynamicAppIcons, app.icon)}
                  alt=""
                  className={styles.appIcon}
                  aria-hidden="true"
                />
              </div>
              <span className={styles.appLabel}>{app.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

