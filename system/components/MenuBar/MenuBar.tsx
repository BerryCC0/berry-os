'use client';

/**
 * Menu Bar Component
 * Mac OS 8 menu bar with Apple menu and app menus
 */

import { useState, useRef, useEffect } from 'react';
import { useSystemStore } from '../../store/systemStore';
import { REGISTERED_APPS, getSystemApps } from '../../../apps/AppConfig';
import SystemTray from '../SystemTray/SystemTray';
import styles from './MenuBar.module.css';

export default function MenuBar() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuBarRef = useRef<HTMLDivElement>(null);
  
  const launchApp = useSystemStore((state) => state.launchApp);
  const runningApps = useSystemStore((state) => state.runningApps);

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

      {/* File Menu */}
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
            <div className={styles.divider} />
            <div className={styles.dropdownItem} onClick={() => setActiveMenu(null)}>
              New Folder
              <span className={styles.shortcut}>⌘N</span>
            </div>
            <div className={styles.dropdownItem} onClick={() => setActiveMenu(null)}>
              Open...
              <span className={styles.shortcut}>⌘O</span>
            </div>
            <div className={styles.divider} />
            <div className={styles.dropdownItem} onClick={() => setActiveMenu(null)}>
              Close Window
              <span className={styles.shortcut}>⌘W</span>
            </div>
            <div className={styles.dropdownItem} onClick={() => setActiveMenu(null)}>
              Get Info
              <span className={styles.shortcut}>⌘I</span>
            </div>
          </div>
        )}
      </div>

      {/* Edit Menu */}
      <div className={styles.menuSection}>
        <button
          className={`${styles.menuItem} ${activeMenu === 'edit' ? styles.active : ''}`}
          onClick={() => toggleMenu('edit')}
        >
          Edit
        </button>
        
        {activeMenu === 'edit' && (
          <div className={styles.dropdown}>
            <div className={styles.dropdownItem} onClick={() => setActiveMenu(null)}>
              Undo
              <span className={styles.shortcut}>⌘Z</span>
            </div>
            <div className={styles.divider} />
            <div className={styles.dropdownItem} onClick={() => setActiveMenu(null)}>
              Cut
              <span className={styles.shortcut}>⌘X</span>
            </div>
            <div className={styles.dropdownItem} onClick={() => setActiveMenu(null)}>
              Copy
              <span className={styles.shortcut}>⌘C</span>
            </div>
            <div className={styles.dropdownItem} onClick={() => setActiveMenu(null)}>
              Paste
              <span className={styles.shortcut}>⌘V</span>
            </div>
            <div className={styles.dropdownItem} onClick={() => setActiveMenu(null)}>
              Clear
            </div>
            <div className={styles.divider} />
            <div className={styles.dropdownItem} onClick={() => setActiveMenu(null)}>
              Select All
              <span className={styles.shortcut}>⌘A</span>
            </div>
          </div>
        )}
      </div>

      {/* View Menu */}
      <div className={styles.menuSection}>
        <button
          className={`${styles.menuItem} ${activeMenu === 'view' ? styles.active : ''}`}
          onClick={() => toggleMenu('view')}
        >
          View
        </button>
        
        {activeMenu === 'view' && (
          <div className={styles.dropdown}>
            <div className={styles.dropdownItem} onClick={() => setActiveMenu(null)}>
              as Icons
            </div>
            <div className={styles.dropdownItem} onClick={() => setActiveMenu(null)}>
              as List
            </div>
            <div className={styles.divider} />
            <div className={styles.dropdownItem} onClick={() => setActiveMenu(null)}>
              Clean Up
            </div>
            <div className={styles.dropdownItem} onClick={() => setActiveMenu(null)}>
              Arrange
            </div>
          </div>
        )}
      </div>

      {/* Special Menu */}
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
            <div className={styles.dropdownItem} onClick={() => setActiveMenu(null)}>
              Empty Trash...
            </div>
            <div className={styles.divider} />
            <div className={styles.dropdownItem} onClick={() => setActiveMenu(null)}>
              Eject
              <span className={styles.shortcut}>⌘E</span>
            </div>
          </div>
        )}
      </div>

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

