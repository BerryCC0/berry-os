/**
 * ClipboardViewer Component
 * UI to view clipboard history
 */

import { useState } from 'react';
import Button from '../Button/Button';
import styles from './ClipboardViewer.module.css';

export interface ClipboardEntry {
  id: string;
  type: 'text' | 'image' | 'file';
  content: string;
  preview?: string;
  timestamp: number;
}

export interface ClipboardViewerProps {
  entries: ClipboardEntry[];
  onSelect: (entry: ClipboardEntry) => void;
  onClear: () => void;
  onClose: () => void;
  maxEntries?: number;
}

export default function ClipboardViewer({
  entries,
  onSelect,
  onClear,
  onClose,
  maxEntries = 10,
}: ClipboardViewerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const displayedEntries = entries.slice(0, maxEntries);

  const handleSelect = (entry: ClipboardEntry) => {
    setSelectedId(entry.id);
    onSelect(entry);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getIcon = (type: ClipboardEntry['type']) => {
    switch (type) {
      case 'text':
        return '📄';
      case 'image':
        return '🖼️';
      case 'file':
        return '📁';
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.viewer} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Clipboard History</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        {/* Entries */}
        <div className={styles.entries}>
          {displayedEntries.length === 0 ? (
            <div className={styles.empty}>Clipboard is empty</div>
          ) : (
            displayedEntries.map((entry) => (
              <div
                key={entry.id}
                className={`${styles.entry} ${entry.id === selectedId ? styles.selected : ''}`}
                onClick={() => handleSelect(entry)}
              >
                <div className={styles.entryIcon}>{getIcon(entry.type)}</div>
                <div className={styles.entryContent}>
                  <div className={styles.entryPreview}>
                    {entry.preview || entry.content}
                  </div>
                  <div className={styles.entryMeta}>
                    {formatTime(entry.timestamp)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <Button onClick={onClear} variant="default">
            Clear All
          </Button>
          <Button onClick={onClose} variant="primary">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

