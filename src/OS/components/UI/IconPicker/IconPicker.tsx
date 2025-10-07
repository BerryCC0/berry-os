/**
 * IconPicker Component
 * Custom icons for files/folders (Phase 7)
 */

import { useState } from 'react';
import styles from './IconPicker.module.css';

export type IconCategory = 'system' | 'apps' | 'custom';

export interface IconPickerProps {
  currentIcon: string;
  onSelect: (iconPath: string) => void;
  category?: IconCategory;
  customIcons?: string[]; // URLs to custom icons
  className?: string;
}

// System icons available
const SYSTEM_ICONS = [
  '/icons/system/folder.svg',
  '/icons/system/file.svg',
  '/icons/system/file-text.svg',
  '/icons/system/file-image.svg',
  '/icons/system/disk.svg',
  '/icons/system/trash.svg',
  '/icons/system/preferences.svg',
];

// App icons available
const APP_ICONS = [
  '/icons/apps/finder.svg',
  '/icons/apps/calculator.svg',
  '/icons/apps/media-viewer.svg',
  '/icons/apps/wallet.svg',
  '/icons/apps/berry.svg',
  '/icons/apps/tabs.svg',
  '/icons/apps/debug.svg',
];

export default function IconPicker({
  currentIcon,
  onSelect,
  category = 'system',
  customIcons = [],
  className = '',
}: IconPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState<IconCategory>(category);

  const getIcons = () => {
    switch (selectedCategory) {
      case 'system':
        return SYSTEM_ICONS;
      case 'apps':
        return APP_ICONS;
      case 'custom':
        return customIcons;
      default:
        return SYSTEM_ICONS;
    }
  };

  const icons = getIcons();

  return (
    <div className={`${styles.iconPicker} ${className}`}>
      {/* Category Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${selectedCategory === 'system' ? styles.active : ''}`}
          onClick={() => setSelectedCategory('system')}
        >
          System
        </button>
        <button
          className={`${styles.tab} ${selectedCategory === 'apps' ? styles.active : ''}`}
          onClick={() => setSelectedCategory('apps')}
        >
          Apps
        </button>
        {customIcons.length > 0 && (
          <button
            className={`${styles.tab} ${selectedCategory === 'custom' ? styles.active : ''}`}
            onClick={() => setSelectedCategory('custom')}
          >
            Custom
          </button>
        )}
      </div>

      {/* Icon Grid */}
      <div className={styles.iconGrid}>
        {icons.map((icon) => (
          <button
            key={icon}
            className={`${styles.iconButton} ${icon === currentIcon ? styles.selected : ''}`}
            onClick={() => onSelect(icon)}
            title={icon}
          >
            <img
              src={icon}
              alt=""
              className={styles.icon}
              onError={(e) => {
                e.currentTarget.src = '/icons/system/placeholder.svg';
              }}
            />
          </button>
        ))}
      </div>

      {icons.length === 0 && (
        <div className={styles.empty}>No icons available in this category.</div>
      )}
    </div>
  );
}

