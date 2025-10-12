/**
 * Collapsible Section Component
 * Expandable/collapsible section for organizing System Preferences
 */

'use client';

import { useState } from 'react';
import styles from './CollapsibleSection.module.css';

interface CollapsibleSectionProps {
  title: string;
  description?: string;
  icon?: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

export default function CollapsibleSection({
  title,
  description,
  icon,
  defaultExpanded = true,
  children,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={styles.section}>
      <button
        className={styles.header}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <div className={styles.headerLeft}>
          {icon && <img src={icon} alt="" className={styles.icon} />}
          <div className={styles.headerText}>
            <h3 className={styles.title}>{title}</h3>
            {description && <p className={styles.description}>{description}</p>}
          </div>
        </div>
        <span className={`${styles.arrow} ${isExpanded ? styles.expanded : ''}`}>
          ▸
        </span>
      </button>

      {isExpanded && (
        <div className={styles.content}>
          {children}
        </div>
      )}
    </div>
  );
}
