/**
 * Tabs Component
 * Reusable tab interface for multi-section panels
 * Used in System Preferences and other apps
 */

import { useState } from 'react';
import styles from './Tabs.module.css';

export interface Tab {
  id: string;
  label: string;
  icon?: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
  lazy?: boolean; // Only render active tab content
  leftContent?: React.ReactNode; // Content to display left of tabs
}

export default function Tabs({
  tabs,
  activeTab: controlledActiveTab,
  onChange,
  className = '',
  lazy = false,
  leftContent,
}: TabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(tabs[0]?.id || '');
  
  // Use controlled or uncontrolled state
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;
  
  const handleTabClick = (tabId: string) => {
    if (controlledActiveTab === undefined) {
      setInternalActiveTab(tabId);
    }
    onChange?.(tabId);
  };

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className={`${styles.tabsContainer} ${className}`}>
      {/* Tab Headers */}
      <div className={styles.tabHeaders} role="tablist">
        {leftContent && <div className={styles.leftContent}>{leftContent}</div>}
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tabHeader} ${tab.id === activeTab ? styles.active : ''} ${tab.disabled ? styles.disabled : ''}`}
            onClick={() => !tab.disabled && handleTabClick(tab.id)}
            disabled={tab.disabled}
            role="tab"
            aria-selected={tab.id === activeTab}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
          >
            {tab.icon && (
              <img src={tab.icon} alt="" className={styles.tabIcon} />
            )}
            <span className={styles.tabLabel}>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {lazy ? (
        // Lazy mode: Only render active tab
        <div
          className={styles.tabContent}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          id={`tabpanel-${activeTab}`}
        >
          {activeTabData?.content}
        </div>
      ) : (
        // Eager mode: Render all tabs but hide inactive ones
        tabs.map(tab => (
          <div
            key={tab.id}
            className={styles.tabContent}
            style={{ display: tab.id === activeTab ? 'block' : 'none' }}
            role="tabpanel"
            aria-labelledby={`tab-${tab.id}`}
            id={`tabpanel-${tab.id}`}
          >
            {tab.content}
          </div>
        ))
      )}
    </div>
  );
}

