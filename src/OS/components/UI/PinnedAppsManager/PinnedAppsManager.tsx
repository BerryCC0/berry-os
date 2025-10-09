/**
 * PinnedAppsManager Component
 * Drag-and-drop interface for managing pinned dock applications
 */

'use client';

import { useState, useRef } from 'react';
import { REGISTERED_APPS } from '../../../../Apps/AppConfig';
import styles from './PinnedAppsManager.module.css';

export interface PinnedAppsManagerProps {
  pinnedApps: string[];
  onChange: (pinnedApps: string[]) => void;
}

export default function PinnedAppsManager({
  pinnedApps,
  onChange,
}: PinnedAppsManagerProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragStartY = useRef<number>(0);

  // Get available apps that aren't pinned
  const availableApps = REGISTERED_APPS.filter(app => !pinnedApps.includes(app.id));

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    dragStartY.current = e.clientY;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedIndex === null) return;
    if (index === draggedIndex) return;
    
    setDragOverIndex(index);
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null) return;
    
    const newPinnedApps = [...pinnedApps];
    const [draggedApp] = newPinnedApps.splice(draggedIndex, 1);
    newPinnedApps.splice(dropIndex, 0, draggedApp);
    
    onChange(newPinnedApps);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Remove app from pinned list
  const handleRemove = (appId: string) => {
    onChange(pinnedApps.filter(id => id !== appId));
  };

  // Add app to pinned list
  const handleAdd = (appId: string) => {
    onChange([...pinnedApps, appId]);
  };

  // Get app config
  const getAppConfig = (appId: string) => {
    return REGISTERED_APPS.find(app => app.id === appId);
  };

  return (
    <div className={styles.manager}>
      {/* Pinned Apps Section */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Pinned Applications</h4>
        <div className={styles.pinnedList}>
          {pinnedApps.length === 0 ? (
            <div className={styles.emptyState}>
              No pinned applications. Add some from below.
            </div>
          ) : (
            pinnedApps.map((appId, index) => {
              const app = getAppConfig(appId);
              if (!app) return null;

              const isDragging = draggedIndex === index;
              const isDragOver = dragOverIndex === index;

              return (
                <div
                  key={appId}
                  className={`${styles.pinnedItem} ${isDragging ? styles.dragging : ''} ${isDragOver ? styles.dragOver : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  <div className={styles.dragHandle}>⋮⋮</div>
                  <img
                    src={app.icon}
                    alt=""
                    className={styles.appIcon}
                  />
                  <span className={styles.appName}>{app.name}</span>
                  <button
                    className={styles.removeButton}
                    onClick={() => handleRemove(appId)}
                    title={`Remove ${app.name} from Dock`}
                    aria-label={`Remove ${app.name} from Dock`}
                  >
                    ×
                  </button>
                </div>
              );
            })
          )}
        </div>
        {pinnedApps.length > 0 && (
          <p className={styles.hint}>
            💡 Drag to reorder
          </p>
        )}
      </div>

      {/* Available Apps Section */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Available Applications</h4>
        <div className={styles.availableGrid}>
          {availableApps.length === 0 ? (
            <div className={styles.emptyState}>
              All applications are pinned
            </div>
          ) : (
            availableApps.map((app) => (
              <button
                key={app.id}
                className={styles.availableItem}
                onClick={() => handleAdd(app.id)}
                title={`Add ${app.name} to Dock`}
                aria-label={`Add ${app.name} to Dock`}
              >
                <img
                  src={app.icon}
                  alt=""
                  className={styles.appIconSmall}
                />
                <span className={styles.appNameSmall}>{app.name}</span>
                <span className={styles.addIcon}>+</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

