'use client';

/**
 * Menu Bar Component
 * Mac OS 8 menu bar with Apple menu and app menus
 */

import { useState, useRef, useEffect } from 'react';
import { useSystemStore } from '../../store/systemStore';
import { REGISTERED_APPS, getSystemApps } from '../../../apps/AppConfig';
import SystemTray from '../SystemTray/SystemTray';
import { executeMenuAction } from '../../lib/menuActions';
import styles from './MenuBar.module.css';

export default function MenuBar() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuBarRef = useRef<HTMLDivElement>(null);
  
  const launchApp = useSystemStore((state) => state.launchApp);
  const runningApps = useSystemStore((state) => state.runningApps);
  const windows = useSystemStore((state) => state.windows);
  const activeWindowId = useSystemStore((state) => state.activeWindowId);
  
  // Get the active app based on focused window
  const activeApp = activeWindowId && windows[activeWindowId]
    ? runningApps[windows[activeWindowId].appId]
    : null;
  
  const activeAppName = activeApp?.config.name || 'Finder';

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };

    if (activeMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [activeMenu]);

  const toggleMenu = (menuId: string) => {
    setActiveMenu(activeMenu === menuId ? null : menuId);
  };

  const handleAppLaunch = (appId: string) => {
    const appConfig = REGISTERED_APPS.find((app) => app.id === appId);
    if (appConfig) {
      launchApp(appConfig);
      setActiveMenu(null);
    }
  };

  const handleMenuAction = (action: Parameters<typeof executeMenuAction>[0]) => {
    executeMenuAction(action);
    setActiveMenu(null);
  };

  // Get app-specific menus or use default menus
  const appMenus = activeApp?.config.menus || {};
  const hasAppMenus = Object.keys(appMenus).length > 0;

  // Render a menu item
  const renderMenuItem = (item: any, index: number) => {
    if (item.divider) {
      return <div key={`divider-${index}`} className={styles.divider} />;
    }

    return (
      <div
        key={`item-${index}`}
        className={`${styles.dropdownItem} ${item.disabled ? styles.disabled : ''}`}
        onClick={() => {
          if (!item.disabled && item.action) {
            handleMenuAction(item.action as any);
          } else if (!item.disabled) {
            setActiveMenu(null);
          }
        }}
      >
        {item.label}
        {item.shortcut && <span className={styles.shortcut}>{item.shortcut}</span>}
      </div>
    );
  };

  return (
    <div ref={menuBarRef} className={styles.menuBar}>
      {/* Apple Menu */}
      <div className={styles.menuSection}>
        <button
          className={`${styles.menuItem} ${styles.appleMenu} ${activeMenu === 'apple' ? styles.active : ''}`}
          onClick={() => toggleMenu('apple')}
          aria-label="Berry menu"
        >
          <img 
            src="/icons/apps/berry.svg" 
            alt="Berry" 
            width="14" 
            height="14"
            style={{ display: 'block' }}
          />
        </button>
        
        {activeMenu === 'apple' && (
          <div className={styles.dropdown} style={{ left: 0 }}>
            <div
              className={styles.dropdownItem}
              onClick={() => handleAppLaunch('berry')}
            >
              Berry
            </div>
            {/* Debug Console - Development only */}
            {process.env.NODE_ENV === 'development' && (
              <>
                <div className={styles.divider} />
                <div
                  className={styles.dropdownItem}
                  onClick={() => handleAppLaunch('debug')}
                >
                  Debug Console...
                </div>
              </>
            )}
            <div className={styles.divider} />
            <div className={styles.dropdownItem} onClick={() => setActiveMenu(null)}>
              System Preferences...
            </div>
            <div className={styles.divider} />
            <div className={styles.dropdownItem} onClick={() => setActiveMenu(null)}>
              Sleep
            </div>
            <div className={styles.dropdownItem} onClick={() => setActiveMenu(null)}>
              Restart...
            </div>
            <div className={styles.dropdownItem} onClick={() => setActiveMenu(null)}>
              Shut Down...
            </div>
          </div>
        )}
      </div>

      {/* Active App Name */}
      <div className={styles.appName}>
        {activeAppName}
      </div>

      {/* Dynamic App Menus */}
      {hasAppMenus ? (
          // Render app-specific menus
          Object.entries(appMenus).map(([menuName, items]) => (
          <div key={menuName} className={styles.menuSection}>
            <button
              className={`${styles.menuItem} ${activeMenu === menuName.toLowerCase() ? styles.active : ''}`}
              onClick={() => toggleMenu(menuName.toLowerCase())}
            >
              {menuName}
            </button>
            
            {activeMenu === menuName.toLowerCase() && (
              <div className={styles.dropdown}>
                {items.map((item: any, index: number) => renderMenuItem(item, index))}
              </div>
            )}
          </div>
        ))
      ) : (
        // Default menus when no app is focused
        <>
            <div className={styles.menuSection}>
            <button
              className={`${styles.menuItem} ${activeMenu === 'file' ? styles.active : ''}`}
              onClick={() => toggleMenu('file')}
            >
              File
            </button>
            
            {activeMenu === 'file' && (
              <div className={styles.dropdown}>
                <div className={styles.dropdownItem} onClick={() => handleAppLaunch('finder')}>
                  Open Finder
                  <span className={styles.shortcut}>⌘F</span>
                </div>
              </div>
            )}
          </div>

          <div className={styles.menuSection}>
            <button
              className={`${styles.menuItem} ${activeMenu === 'special' ? styles.active : ''}`}
              onClick={() => toggleMenu('special')}
            >
              Special
            </button>
            
            {activeMenu === 'special' && (
              <div className={styles.dropdown}>
                <div className={styles.dropdownItem} onClick={() => handleAppLaunch('calculator')}>
                  Calculator
                </div>
                <div className={styles.divider} />
                <div className={styles.dropdownItem} onClick={() => handleMenuAction('special:empty-trash')}>
                  Empty Trash...
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Spacer */}
      <div className={styles.spacer} />

      {/* System Info */}
      <div className={styles.systemInfo}>
        <span className={styles.infoText}>
          {Object.keys(runningApps).length} app{Object.keys(runningApps).length !== 1 ? 's' : ''} running
        </span>
      </div>

      {/* System Tray (Wallet + Time) */}
      <SystemTray />
    </div>
  );
}

