/**
 * Tabs Component
 * Reusable tab interface for multi-section panels
 * Used in System Preferences and other apps
 */

import { useState } from 'react';
import ScrollBar from '@/src/OS/components/UI/ScrollBar/ScrollBar';
import styles from './Tabs.module.css';

export interface Tab {
  id: string;
  label: string;
  icon?: string;
  content: React.ReactNode;
  disabled?: boolean;
  renderLabel?: () => React.ReactNode; // Custom label renderer
}

export interface TabsProps {
  tabs: Tab[];
  pinnedTabs?: Tab[]; // Tabs pinned to the right
  activeTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
  lazy?: boolean; // Only render active tab content
  leftContent?: React.ReactNode; // Content to display left of tabs
  wrapContentInScrollBar?: boolean; // Wrap tab content in ScrollBar component
}

export default function Tabs({
  tabs,
  pinnedTabs = [],
  activeTab: controlledActiveTab,
  onChange,
  className = '',
  lazy = false,
  leftContent,
  wrapContentInScrollBar = false,
}: TabsProps) {
  const allTabs = [...tabs, ...pinnedTabs];
  const [internalActiveTab, setInternalActiveTab] = useState(allTabs[0]?.id || '');
  
  // Use controlled or uncontrolled state
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;
  
  const handleTabClick = (tabId: string) => {
    if (controlledActiveTab === undefined) {
      setInternalActiveTab(tabId);
    }
    onChange?.(tabId);
  };

  const activeTabData = allTabs.find(tab => tab.id === activeTab);

  return (
    <div className={`${styles.tabsContainer} ${className}`}>
      {/* Tab Headers - Fixed at top, outside scroll area */}
      <div className={styles.tabHeaders} role="tablist">
        {leftContent && <div className={styles.leftContent}>{leftContent}</div>}
        
        {/* Regular tabs */}
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
            {tab.renderLabel ? (
              tab.renderLabel()
            ) : (
              <>
                {tab.icon && (
                  <img src={tab.icon} alt="" className={styles.tabIcon} />
                )}
                <span className={styles.tabLabel}>{tab.label}</span>
              </>
            )}
          </button>
        ))}
        
        {/* Pinned tabs */}
        {pinnedTabs.length > 0 && (
          <div className={styles.pinnedTabsContainer}>
            {pinnedTabs.map((tab) => (
              <button
                key={tab.id}
                className={`${styles.tabHeader} ${styles.pinnedTab} ${tab.id === activeTab ? styles.active : ''} ${tab.disabled ? styles.disabled : ''}`}
                onClick={() => !tab.disabled && handleTabClick(tab.id)}
                disabled={tab.disabled}
                role="tab"
                aria-selected={tab.id === activeTab}
                aria-controls={`tabpanel-${tab.id}`}
                id={`tab-${tab.id}`}
              >
                {tab.renderLabel ? (
                  tab.renderLabel()
                ) : (
                  <>
                    {tab.icon && (
                      <img src={tab.icon} alt="" className={styles.tabIcon} />
                    )}
                    <span className={styles.tabLabel}>{tab.label}</span>
                  </>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tab Content - Scrollable area */}
      {wrapContentInScrollBar ? (
        <ScrollBar direction="vertical" className={styles.tabContentScrollWrapper}>
          <div className={styles.tabContentInner}>
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
              allTabs.map(tab => (
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
        </ScrollBar>
      ) : (
        // Without ScrollBar wrapper (original behavior)
        <div className={styles.tabContentInner}>
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
            allTabs.map(tab => (
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
      )}
    </div>
  );
}

