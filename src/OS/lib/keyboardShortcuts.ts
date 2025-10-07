/**
 * Keyboard Shortcut Manager
 * Global shortcut registration and handling
 */

import { eventBus } from './eventBus';

export type ModifierKey = 'cmd' | 'shift' | 'option' | 'ctrl' | 'alt';

export interface Shortcut {
  key: string; // 'a', 'Enter', 'Escape', etc.
  modifiers: ModifierKey[];
  action: () => void;
  description?: string;
  global?: boolean; // Works even when input is focused
  preventDefault?: boolean; // Prevent default browser behavior
}

class KeyboardShortcutManager {
  private shortcuts: Map<string, Shortcut> = new Map();
  private isListening: boolean = false;

  /**
   * Register a keyboard shortcut
   */
  register(shortcut: Shortcut): () => void {
    const key = this.getShortcutKey(shortcut.key, shortcut.modifiers);
    this.shortcuts.set(key, shortcut);

    // Start listening if not already
    if (!this.isListening) {
      this.startListening();
    }

    // Return unregister function
    return () => {
      this.shortcuts.delete(key);
    };
  }

  /**
   * Unregister a keyboard shortcut
   */
  unregister(key: string, modifiers: ModifierKey[]): void {
    const shortcutKey = this.getShortcutKey(key, modifiers);
    this.shortcuts.delete(shortcutKey);
  }

  /**
   * Unregister all shortcuts
   */
  unregisterAll(): void {
    this.shortcuts.clear();
  }

  /**
   * Get all registered shortcuts
   */
  getAllShortcuts(): Shortcut[] {
    return Array.from(this.shortcuts.values());
  }

  /**
   * Generate a shortcut key string
   */
  private getShortcutKey(key: string, modifiers: ModifierKey[]): string {
    const sortedModifiers = [...modifiers].sort();
    return `${sortedModifiers.join('+')}+${key.toLowerCase()}`;
  }

  /**
   * Start listening for keyboard events
   */
  private startListening(): void {
    if (this.isListening) return;

    document.addEventListener('keydown', this.handleKeyDown);
    this.isListening = true;
  }

  /**
   * Stop listening for keyboard events
   */
  stopListening(): void {
    document.removeEventListener('keydown', this.handleKeyDown);
    this.isListening = false;
  }

  /**
   * Handle keydown event
   */
  private handleKeyDown = (e: KeyboardEvent): void => {
    // Build modifier array
    const modifiers: ModifierKey[] = [];
    if (e.metaKey || e.key === 'Meta') modifiers.push('cmd');
    if (e.shiftKey) modifiers.push('shift');
    if (e.altKey || e.key === 'Alt') modifiers.push('option');
    if (e.ctrlKey) modifiers.push('ctrl');

    // Get key (normalize)
    let key = e.key;
    if (key === ' ') key = 'Space';

    // Build shortcut key
    const shortcutKey = this.getShortcutKey(key, modifiers);

    // Check if shortcut exists
    const shortcut = this.shortcuts.get(shortcutKey);
    if (!shortcut) return;

    // Check if global or not focused on input
    const target = e.target as HTMLElement;
    const isInput =
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable;

    if (!shortcut.global && isInput) return;

    // Prevent default if needed
    if (shortcut.preventDefault !== false) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Execute action
    shortcut.action();

    // Publish keyboard shortcut event
    eventBus.publish('KEYBOARD_SHORTCUT', {
      key,
      modifiers: {
        command: modifiers.includes('cmd'),
        shift: modifiers.includes('shift'),
        option: modifiers.includes('option'),
        control: modifiers.includes('ctrl'),
      },
    });
  };

  /**
   * Format shortcut for display
   */
  formatShortcut(key: string, modifiers: ModifierKey[]): string {
    const symbols: Record<ModifierKey, string> = {
      cmd: '⌘',
      shift: '⇧',
      option: '⌥',
      ctrl: '⌃',
      alt: '⌥',
    };

    const parts = modifiers.map((mod) => symbols[mod] || mod);
    parts.push(key.toUpperCase());
    return parts.join('');
  }
}

// Singleton instance
export const keyboardShortcutManager = new KeyboardShortcutManager();

/**
 * React hook for keyboard shortcuts
 */
export function useKeyboardShortcut(
  key: string,
  modifiers: ModifierKey[],
  action: () => void,
  options: {
    global?: boolean;
    preventDefault?: boolean;
    description?: string;
    enabled?: boolean;
  } = {}
) {
  const { global = false, preventDefault = true, description, enabled = true } = options;

  if (typeof window !== 'undefined' && enabled) {
    const unregister = keyboardShortcutManager.register({
      key,
      modifiers,
      action,
      description,
      global,
      preventDefault,
    });

    // Clean up on unmount or when disabled
    return () => {
      unregister();
    };
  }
}

/**
 * Common keyboard shortcuts
 */
export const COMMON_SHORTCUTS = {
  // File operations
  NEW: { key: 'n', modifiers: ['cmd'] as ModifierKey[] },
  OPEN: { key: 'o', modifiers: ['cmd'] as ModifierKey[] },
  SAVE: { key: 's', modifiers: ['cmd'] as ModifierKey[] },
  CLOSE: { key: 'w', modifiers: ['cmd'] as ModifierKey[] },
  QUIT: { key: 'q', modifiers: ['cmd'] as ModifierKey[] },

  // Edit operations
  CUT: { key: 'x', modifiers: ['cmd'] as ModifierKey[] },
  COPY: { key: 'c', modifiers: ['cmd'] as ModifierKey[] },
  PASTE: { key: 'v', modifiers: ['cmd'] as ModifierKey[] },
  SELECT_ALL: { key: 'a', modifiers: ['cmd'] as ModifierKey[] },
  UNDO: { key: 'z', modifiers: ['cmd'] as ModifierKey[] },
  REDO: { key: 'z', modifiers: ['cmd', 'shift'] as ModifierKey[] },

  // View operations
  ZOOM_IN: { key: '+', modifiers: ['cmd'] as ModifierKey[] },
  ZOOM_OUT: { key: '-', modifiers: ['cmd'] as ModifierKey[] },
  ZOOM_RESET: { key: '0', modifiers: ['cmd'] as ModifierKey[] },
  FULLSCREEN: { key: 'f', modifiers: ['cmd', 'ctrl'] as ModifierKey[] },

  // Window operations
  MINIMIZE: { key: 'm', modifiers: ['cmd'] as ModifierKey[] },
  CLOSE_WINDOW: { key: 'w', modifiers: ['cmd'] as ModifierKey[] },
  NEXT_WINDOW: { key: '`', modifiers: ['cmd'] as ModifierKey[] },
  PREV_WINDOW: { key: '`', modifiers: ['cmd', 'shift'] as ModifierKey[] },

  // System operations
  SPOTLIGHT: { key: 'Space', modifiers: ['cmd'] as ModifierKey[] },
  APP_SWITCHER: { key: 'Tab', modifiers: ['cmd'] as ModifierKey[] },
  FORCE_QUIT: { key: 'Escape', modifiers: ['cmd', 'option'] as ModifierKey[] },
  SCREENSHOT: { key: '3', modifiers: ['cmd', 'shift'] as ModifierKey[] },

  // Navigation
  ESCAPE: { key: 'Escape', modifiers: [] as ModifierKey[] },
  ENTER: { key: 'Enter', modifiers: [] as ModifierKey[] },
  DELETE: { key: 'Backspace', modifiers: [] as ModifierKey[] },
} as const;

