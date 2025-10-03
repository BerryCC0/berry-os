'use client';

/**
 * Desktop Component
 * Main container for the Mac OS 8 desktop experience
 */

import { useEffect, useRef } from 'react';
import { useSystemStore } from '../../store/systemStore';
import { getAppsFromURL } from '../../../app/lib/utils/stateUtils';
import { getAppById } from '../../../apps/AppConfig';
import MenuBar from '../MenuBar/MenuBar';
import Window from '../Window/Window';
import styles from './Desktop.module.css';

export default function Desktop() {
  const wallpaper = useSystemStore((state) => state.wallpaper);
  const desktopIcons = useSystemStore((state) => state.desktopIcons);
  const windows = useSystemStore((state) => state.windows);
  const launchApp = useSystemStore((state) => state.launchApp);
  const hasLaunchedFromURL = useRef(false);

  // Launch apps from URL on mount (only once)
  useEffect(() => {
    if (hasLaunchedFromURL.current) return;
    hasLaunchedFromURL.current = true;
    
    const appsToOpen = getAppsFromURL();
    
    if (appsToOpen.length > 0) {
      appsToOpen.forEach((appId: string) => {
        const appConfig = getAppById(appId);
        if (appConfig) {
          launchApp(appConfig);
        }
      });
    }
  }, [launchApp]);

  return (
    <div className={styles.desktop}>
      {/* Menu Bar */}
      <MenuBar />

      {/* Desktop Background */}
      <div 
        className={styles.background}
        style={{ 
          backgroundImage: wallpaper ? `url(${wallpaper})` : undefined 
        }}
      />

      {/* Desktop Icons */}
      <div className={styles.iconContainer}>
        {desktopIcons.map((icon) => (
          <div
            key={icon.id}
            className={styles.icon}
            style={{
              left: icon.position.x,
              top: icon.position.y,
            }}
          >
            <img 
              src={icon.icon} 
              alt={icon.name}
              className={styles.iconImage}
            />
            <span className={styles.iconLabel}>{icon.name}</span>
          </div>
        ))}
      </div>

      {/* Windows */}
      <div className={styles.windowContainer}>
        {Object.keys(windows).map((windowId) => (
          <Window key={windowId} windowId={windowId} />
        ))}
      </div>
    </div>
  );
}

