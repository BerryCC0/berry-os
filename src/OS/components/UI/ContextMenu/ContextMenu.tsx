/**
 * ContextMenu Component
 * Right-click context menus for Berry OS
 * 
 * Usage:
 * - Desktop right-click (New Folder, Arrange Icons, etc.)
 * - File/folder right-click (Open, Get Info, Move to Trash, etc.)
 * - Window title bar right-click (Minimize, Zoom, etc.)
 * - Text selection right-click (Cut, Copy, Paste, etc.)
 */

import { useEffect, useRef } from 'react';
import styles from './ContextMenu.module.css';

export interface ContextMenuItem {
  label?: string;
  action?: string;
  icon?: string;
  shortcut?: string;
  divider?: boolean;
  disabled?: boolean;
  danger?: boolean; // Red text for destructive actions
  submenu?: ContextMenuItem[];
}

export interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
  onAction: (action: string) => void;
}

export default function ContextMenu({
  x,
  y,
  items,
  onClose,
  onAction,
}: ContextMenuProps) {
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

  // Position adjustment to keep menu on screen
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let adjustedX = x;
      let adjustedY = y;

      // Adjust horizontal position
      if (x + rect.width > viewportWidth) {
        adjustedX = viewportWidth - rect.width - 4;
      }

      // Adjust vertical position
      if (y + rect.height > viewportHeight) {
        adjustedY = viewportHeight - rect.height - 4;
      }

      menuRef.current.style.left = `${adjustedX}px`;
      menuRef.current.style.top = `${adjustedY}px`;
    }
  }, [x, y]);

  const handleItemClick = (item: ContextMenuItem) => {
    if (item.disabled || item.divider) return;
    
    if (item.action) {
      onAction(item.action);
      onClose();
    }
  };

  const renderMenuItem = (item: ContextMenuItem, index: number) => {
    if (item.divider) {
      return <div key={`divider-${index}`} className={styles.divider} />;
    }

    return (
      <div
        key={`item-${index}`}
        className={`${styles.menuItem} ${item.disabled ? styles.disabled : ''} ${item.danger ? styles.danger : ''}`}
        onClick={() => handleItemClick(item)}
      >
        {item.icon && (
          <img src={item.icon} alt="" className={styles.icon} />
        )}
        <span className={styles.label}>{item.label}</span>
        {item.shortcut && (
          <span className={styles.shortcut}>{item.shortcut}</span>
        )}
        {item.submenu && (
          <span className={styles.submenuArrow}>▶</span>
        )}
      </div>
    );
  };

  return (
    <div
      ref={menuRef}
      className={styles.contextMenu}
      style={{ left: x, top: y }}
    >
      {items.map((item, index) => renderMenuItem(item, index))}
    </div>
  );
}

