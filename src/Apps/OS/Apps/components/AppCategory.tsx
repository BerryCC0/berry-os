/**
 * AppCategory Component
 * Collapsible category section with apps
 */

import { useState } from 'react';
import type { AppConfig } from '../../../AppConfig';
import type { AppCategory as AppCategoryType } from '../utils/categorizeApps';
import AppGrid from './AppGrid';
import styles from './AppCategory.module.css';

interface AppCategoryProps {
  category: AppCategoryType;
  onAppClick: (app: AppConfig) => void;
  defaultExpanded?: boolean;
}

export default function AppCategory({ category, onAppClick, defaultExpanded = true }: AppCategoryProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={styles.category}>
      <button
        className={styles.categoryHeader}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <div className={styles.categoryInfo}>
          <img
            src={category.icon}
            alt=""
            className={styles.categoryIcon}
          />
          <div className={styles.categoryText}>
            <span className={styles.categoryName}>{category.name}</span>
            <span className={styles.categoryCount}>({category.apps.length})</span>
          </div>
        </div>
        <span className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ''}`}>
          ▸
        </span>
      </button>

      {isExpanded && (
        <div className={styles.categoryContent}>
          <AppGrid apps={category.apps} onAppClick={onAppClick} />
        </div>
      )}
    </div>
  );
}

