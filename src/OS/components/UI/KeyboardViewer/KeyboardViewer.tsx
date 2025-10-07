/**
 * KeyboardViewer Component
 * Visual overlay showing keyboard shortcuts
 */

import { useState } from 'react';
import styles from './KeyboardViewer.module.css';

export interface ShortcutCategory {
  name: string;
  shortcuts: Array<{
    keys: string;
    description: string;
  }>;
}

export interface KeyboardViewerProps {
  categories: ShortcutCategory[];
  onClose: () => void;
}

export default function KeyboardViewer({
  categories,
  onClose,
}: KeyboardViewerProps) {
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.viewer} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Keyboard Shortcuts</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        {/* Categories */}
        <div className={styles.categories}>
          {categories.map((category, index) => (
            <button
              key={index}
              className={`${styles.categoryButton} ${index === activeCategory ? styles.active : ''}`}
              onClick={() => setActiveCategory(index)}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Shortcuts */}
        <div className={styles.shortcuts}>
          {categories[activeCategory]?.shortcuts.map((shortcut, index) => (
            <div key={index} className={styles.shortcut}>
              <kbd className={styles.keys}>{shortcut.keys}</kbd>
              <span className={styles.description}>{shortcut.description}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <p className={styles.hint}>
            Press <kbd>?</kbd> to show/hide this panel
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Default keyboard shortcuts for Berry OS
 */
export const DEFAULT_SHORTCUTS: ShortcutCategory[] = [
  {
    name: 'General',
    shortcuts: [
      { keys: '⌘ N', description: 'New file/folder' },
      { keys: '⌘ O', description: 'Open' },
      { keys: '⌘ S', description: 'Save' },
      { keys: '⌘ W', description: 'Close window' },
      { keys: '⌘ Q', description: 'Quit application' },
      { keys: '⌘ ,', description: 'Preferences' },
    ],
  },
  {
    name: 'Edit',
    shortcuts: [
      { keys: '⌘ Z', description: 'Undo' },
      { keys: '⌘ ⇧ Z', description: 'Redo' },
      { keys: '⌘ X', description: 'Cut' },
      { keys: '⌘ C', description: 'Copy' },
      { keys: '⌘ V', description: 'Paste' },
      { keys: '⌘ A', description: 'Select all' },
    ],
  },
  {
    name: 'View',
    shortcuts: [
      { keys: '⌘ +', description: 'Zoom in' },
      { keys: '⌘ -', description: 'Zoom out' },
      { keys: '⌘ 0', description: 'Reset zoom' },
      { keys: '⌘ 1', description: 'Icon view' },
      { keys: '⌘ 2', description: 'List view' },
    ],
  },
  {
    name: 'Window',
    shortcuts: [
      { keys: '⌘ M', description: 'Minimize window' },
      { keys: '⌘ Tab', description: 'Switch applications' },
      { keys: '⌘ `', description: 'Cycle windows' },
      { keys: '⌘ ⇧ `', description: 'Cycle windows backward' },
    ],
  },
  {
    name: 'System',
    shortcuts: [
      { keys: '⌘ Space', description: 'Spotlight search' },
      { keys: '⌘ ⌥ Esc', description: 'Force quit' },
      { keys: '⌘ ⇧ 3', description: 'Screenshot' },
      { keys: '?', description: 'Show keyboard shortcuts' },
    ],
  },
];

