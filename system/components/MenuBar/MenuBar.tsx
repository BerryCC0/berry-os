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
          aria-label="Apple menu"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.5 7c0-.8.4-1.5 1-2-.6-.7-1.4-1.1-2.3-1.1-.5 0-1 .2-1.4.4-.3.2-.6.3-.8.3-.3 0-.6-.1-.9-.3-.4-.2-.8-.4-1.3-.4C4.6 3.9 3.5 5 3.5 6.5c0 1 .4 2 1 2.8.5.7 1.1 1.2 1.8 1.2.4 0 .7-.1 1-.3.3-.2.5-.3.8-.3.2 0 .5.1.8.3.3.2.6.3 1 .3.8 0 1.5-.6 2-1.4.3-.4.5-.9.6-1.4-.7-.3-1-1-1-1.7zM9.5 1c.4 0 .8.2 1.1.5.3.3.5.8.5 1.3 0 .1 0 .1-.1.1-.5 0-.9-.2-1.2-.5-.3-.3-.5-.7-.5-1.2 0-.1 0-.2.1-.2h.1z"/>
          </svg>
        </button>
        
        {activeMenu === 'apple' && (
          <div className={styles.dropdown} style={{ left: 0 }}>
            <div
              className={styles.dropdownItem}
              onClick={() => handleAppLaunch('about-this-mac')}
            >
              About This Mac
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

