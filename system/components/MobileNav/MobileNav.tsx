'use client';

/**
 * MobileNav Component
 * Mac OS 8 mobile navigation bar
 * Replaces MenuBar on mobile devices
 */

import { useState } from 'react';
import { useSystemStore } from '../../store/systemStore';
import { REGISTERED_APPS } from '../../../apps/AppConfig';
import SystemTray from '../SystemTray/SystemTray';
import TouchTarget from '../UI/TouchTarget/TouchTarget';
import styles from './MobileNav.module.css';

interface MobileNavProps {
  onMenuToggle?: () => void;
  onAppSwitcherToggle?: () => void;
}

export default function MobileNav({ onMenuToggle, onAppSwitcherToggle }: MobileNavProps) {
  const [showAppMenu, setShowAppMenu] = useState(false);
  const runningApps = useSystemStore((state) => state.runningApps);
  const launchApp = useSystemStore((state) => state.launchApp);

  // Handle hamburger menu
  const handleMenuToggle = () => {
    setShowAppMenu(!showAppMenu);
    onMenuToggle?.();
  };

  // Handle app launch
  const handleAppLaunch = (appId: string) => {
    const appConfig = REGISTERED_APPS.find((app) => app.id === appId);
    if (appConfig) {
      launchApp(appConfig);
      setShowAppMenu(false);
    }
  };

  // Handle app switcher
  const handleAppSwitcher = () => {
    onAppSwitcherToggle?.();
  };

  return (
    <>
      <div className={styles.mobileNav}>
        {/* Left side - Hamburger menu */}
        <TouchTarget
          onTap={handleMenuToggle}
          haptic={true}
          ariaLabel="Open menu"
          className={styles.iconButton}
        >
          <div className={styles.hamburger}>
            <span className={styles.hamburgerLine} />
            <span className={styles.hamburgerLine} />
            <span className={styles.hamburgerLine} />
          </div>
        </TouchTarget>

        {/* Spacer */}
        <div className={styles.spacer} />

        {/* Right side - Controls */}
        <div className={styles.rightControls}>
          {/* App Switcher */}
          {Object.keys(runningApps).length > 0 && (
            <TouchTarget
              onTap={handleAppSwitcher}
              haptic={true}
              ariaLabel="App switcher"
              className={styles.iconButton}
            >
              <div className={styles.appSwitcherIcon}>▦</div>
            </TouchTarget>
          )}

          {/* System Tray */}
          <div className={styles.systemTrayContainer}>
            <SystemTray />
          </div>
        </div>
      </div>

      {/* Dropdown Menu */}
      {showAppMenu && (
        <div className={styles.menuOverlay} onClick={() => setShowAppMenu(false)}>
          <div className={styles.menu} onClick={(e) => e.stopPropagation()}>
            {/* System Section */}
            <div className={styles.menuSection}>
              <div className={styles.menuHeader}>System</div>
              <TouchTarget
                onTap={() => handleAppLaunch('berry')}
                className={styles.menuItem}
              >
                <img
                  src="/icons/apps/berry.svg"
                  alt=""
                  className={styles.menuIcon}
                />
                <span>Berry</span>
              </TouchTarget>
              
              {/* Debug Console - Development only */}
              {process.env.NODE_ENV === 'development' && (
                <TouchTarget
                  onTap={() => handleAppLaunch('debug')}
                  className={styles.menuItem}
                >
                  <img
                    src="/icons/apps/debug.svg"
                    alt=""
                    className={styles.menuIcon}
                  />
                  <span>Debug Console</span>
                </TouchTarget>
              )}
            </div>

            {/* Applications */}
            <div className={styles.menuSection}>
              <div className={styles.menuHeader}>Applications</div>
              {REGISTERED_APPS.filter((app) => app.category !== 'system').map((app) => (
                <TouchTarget
                  key={app.id}
                  onTap={() => handleAppLaunch(app.id)}
                  className={styles.menuItem}
                >
                  <img
                    src={app.icon}
                    alt=""
                    className={styles.menuIcon}
                  />
                  <span>{app.name}</span>
                </TouchTarget>
              ))}
            </div>

            {/* Running Apps */}
            {Object.keys(runningApps).length > 0 && (
              <div className={styles.menuSection}>
                <div className={styles.menuHeader}>Running ({Object.keys(runningApps).length})</div>
                {Object.values(runningApps).map((app) => (
                  <TouchTarget
                    key={app.id}
                    onTap={() => {
                      if (app.windows[0]) {
                        useSystemStore.getState().focusWindow(app.windows[0]);
                        setShowAppMenu(false);
                      }
                    }}
                    className={`${styles.menuItem} ${styles.runningApp}`}
                  >
                    <img
                      src={app.config.icon}
                      alt=""
                      className={styles.menuIcon}
                    />
                    <span>{app.config.name}</span>
                    <span className={styles.runningIndicator}>●</span>
                  </TouchTarget>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

