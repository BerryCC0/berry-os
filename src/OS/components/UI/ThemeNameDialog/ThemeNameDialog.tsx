/**
 * Theme Name Dialog
 * Simple dialog for naming/renaming custom themes
 * Phase 8B: Custom theme persistence
 */

'use client';

import { useState } from 'react';
import Button from '../Button/Button';
import TextInput from '../TextInput/TextInput';
import styles from './ThemeNameDialog.module.css';

export interface ThemeNameDialogProps {
  isOpen: boolean;
  initialName?: string;
  title?: string;
  onSave: (name: string, description: string) => void;
  onCancel: () => void;
}

export default function ThemeNameDialog({
  isOpen,
  initialName = '',
  title = 'Save Custom Theme',
  onSave,
  onCancel,
}: ThemeNameDialogProps) {
  const [themeName, setThemeName] = useState(initialName);
  const [themeDescription, setThemeDescription] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    // Validate theme name
    if (!themeName.trim()) {
      setError('Theme name is required');
      return;
    }

    if (themeName.trim().length < 3) {
      setError('Theme name must be at least 3 characters');
      return;
    }

    if (themeName.trim().length > 50) {
      setError('Theme name must be less than 50 characters');
      return;
    }

    if (!/^[a-zA-Z0-9\s\-_]+$/.test(themeName.trim())) {
      setError('Theme name can only contain letters, numbers, spaces, hyphens, and underscores');
      return;
    }

    onSave(themeName.trim(), themeDescription.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div
        className={styles.dialog}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-labelledby="theme-name-dialog-title"
      >
        {/* Title Bar */}
        <div className={styles.titleBar}>
          <span className={styles.title} id="theme-name-dialog-title">
            {title}
          </span>
        </div>

        {/* Content */}
        <div className={styles.content}>
          <div className={styles.field}>
            <label className={styles.label}>
              Theme Name *
            </label>
            <TextInput
              value={themeName}
              onChange={(value) => {
                setThemeName(value);
                setError('');
              }}
              placeholder="My Awesome Theme"
              autoFocus
            />
            {error && <div className={styles.error}>{error}</div>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              Description (optional)
            </label>
            <TextInput
              value={themeDescription}
              onChange={(value) => setThemeDescription(value)}
              placeholder="A beautiful custom theme"
            />
          </div>

          <div className={styles.hint}>
            Your custom theme will be saved to your wallet and available across devices.
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <Button onClick={onCancel} variant="cancel">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="primary">
            Save Theme
          </Button>
        </div>
      </div>
    </div>
  );
}

