/**
 * DockContextMenu Component
 * Right-click context menu for dock items
 */

'use client';

import { useEffect, useRef } from 'react';
import styles from './DockContextMenu.module.css';

export interface DockContextMenuProps {
  appId: string;
  appName: string;
  isPinned: boolean;
  isRunning: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onTogglePin: () => void;
  onQuit: () => void;
}

export default function DockContextMenu({
  appId,
  appName,
  isPinned,
  isRunning,
  position,
  onClose,
  onTogglePin,
  onQuit,
}: DockContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    // Close on Escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Position menu above dock
  const menuStyle = {
    left: position.x,
    bottom: position.y,
  };

  return (
    <div
      ref={menuRef}
      className={styles.contextMenu}
      style={menuStyle}
      role="menu"
      aria-label={`${appName} options`}
    >
      <button
        className={styles.menuItem}
        onClick={() => {
          onTogglePin();
          onClose();
        }}
        role="menuitem"
      >
        {isPinned ? '📌 Remove from Dock' : '📍 Keep in Dock'}
      </button>

      {isRunning && (
        <>
          <div className={styles.menuDivider} role="separator" />
          <button
            className={styles.menuItem}
            onClick={() => {
              onQuit();
              onClose();
            }}
            role="menuitem"
          >
            ❌ Quit
          </button>
        </>
      )}

      {/* Future: App-specific menu items from appConfig.dockMenu */}
    </div>
  );
}

