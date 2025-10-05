/**
 * AppGrid Component
 * Grid layout for displaying app icons (Launchpad-style)
 */

import type { AppConfig } from '../../../AppConfig';
import styles from './AppGrid.module.css';

interface AppGridProps {
  apps: AppConfig[];
  onAppClick: (app: AppConfig) => void;
}

export default function AppGrid({ apps, onAppClick }: AppGridProps) {
  if (apps.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No apps found</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {apps.map((app) => (
        <button
          key={app.id}
          className={styles.appCard}
          onClick={() => onAppClick(app)}
          title={app.description}
        >
          <div className={styles.iconWrapper}>
            <img
              src={app.icon}
              alt=""
              className={styles.appIcon}
              draggable={false}
            />
          </div>
          <span className={styles.appName}>{app.name}</span>
        </button>
      ))}
    </div>
  );
}

