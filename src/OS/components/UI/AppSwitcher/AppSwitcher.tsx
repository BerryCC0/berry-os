/**
 * AppSwitcher Component
 * Keyboard-driven app switching (Command+Tab)
 * Mac OS 8 Style: Classic Command+Tab interface
 */

import { useState, useEffect } from 'react';
import { useSystemStore } from '../../../store/systemStore';
import styles from './AppSwitcher.module.css';

export interface AppSwitcherProps {
  onClose: () => void;
  onSelect: (appId: string) => void;
}

export default function AppSwitcher({ onClose, onSelect }: AppSwitcherProps) {
  const runningApps = useSystemStore((state) => state.runningApps);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const apps = Object.values(runningApps);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Tab (with Cmd held) - move forward
      if (e.key === 'Tab' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        
        if (e.shiftKey) {
          // Shift+Tab - move backward
          setSelectedIndex((prev) => (prev - 1 + apps.length) % apps.length);
        } else {
          // Tab - move forward
          setSelectedIndex((prev) => (prev + 1) % apps.length);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Release Cmd - select app and close
      if (e.key === 'Meta' || e.key === 'Control') {
        e.preventDefault();
        if (apps[selectedIndex]) {
          onSelect(apps[selectedIndex].id);
        }
        onClose();
      }

      // Escape - cancel
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [apps, selectedIndex, onClose, onSelect]);

  if (apps.length === 0) {
    onClose();
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.appSwitcher}>
        <div className={styles.title}>Switch Applications</div>
        <div className={styles.apps}>
          {apps.map((app, index) => (
            <div
              key={app.id}
              className={`${styles.app} ${index === selectedIndex ? styles.selected : ''}`}
            >
              <img
                src={app.config.icon}
                alt={app.config.name}
                className={styles.icon}
                onError={(e) => {
                  e.currentTarget.src = '/icons/system/placeholder.svg';
                }}
              />
              <div className={styles.appName}>{app.config.name}</div>
            </div>
          ))}
        </div>
        <div className={styles.hint}>
          Hold ⌘, press Tab to cycle. Release ⌘ to select.
        </div>
      </div>
    </div>
  );
}

