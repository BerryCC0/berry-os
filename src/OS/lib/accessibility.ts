/**
 * Accessibility System
 * Complete a11y framework for Berry OS
 */

import { announce } from './screenReader';
import { eventBus } from './eventBus';

export interface AccessibilitySettings {
  screenReaderEnabled: boolean;
  highContrast: boolean;
  largeText: boolean;
  reduceMotion: boolean;
  keyboardNavigation: boolean;
  focusIndicators: boolean;
  audioDescriptions: boolean;
}

class AccessibilityManager {
  private settings: AccessibilitySettings = {
    screenReaderEnabled: false,
    highContrast: false,
    largeText: false,
    reduceMotion: false,
    keyboardNavigation: true,
    focusIndicators: true,
    audioDescriptions: false,
  };

  private focusTrapStack: HTMLElement[] = [];
  private lastFocusedElement: HTMLElement | null = null;

  constructor() {
    // Detect user preferences from system
    this.detectSystemPreferences();
    
    // Apply initial settings
    this.applySettings();

    // Listen for events to announce
    this.setupEventListeners();
  }

  /**
   * Detect system accessibility preferences
   */
  private detectSystemPreferences(): void {
    if (typeof window === 'undefined') return;

    // Detect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      this.settings.reduceMotion = true;
    }

    // Detect high contrast preference
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    if (prefersHighContrast) {
      this.settings.highContrast = true;
    }

    // Listen for changes
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.updateSetting('reduceMotion', e.matches);
    });

    window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
      this.updateSetting('highContrast', e.matches);
    });
  }

  /**
   * Setup event listeners for announcements
   */
  private setupEventListeners(): void {
    // Window events
    eventBus.subscribe('WINDOW_OPEN', (payload: any) => {
      if (this.settings.screenReaderEnabled) {
        announce(`Window opened`, 'polite');
      }
    });

    eventBus.subscribe('WINDOW_CLOSE', () => {
      if (this.settings.screenReaderEnabled) {
        announce('Window closed', 'polite');
      }
    });

    eventBus.subscribe('WINDOW_MINIMIZE', () => {
      if (this.settings.screenReaderEnabled) {
        announce('Window minimized', 'polite');
      }
    });

    // App events
    eventBus.subscribe('APP_LAUNCH', (payload: any) => {
      if (this.settings.screenReaderEnabled) {
        announce(`Application launched`, 'polite');
      }
    });

    eventBus.subscribe('APP_ERROR', (payload: any) => {
      if (this.settings.screenReaderEnabled) {
        announce('Application error occurred', 'assertive');
      }
    });

    // Menu events
    eventBus.subscribe('MENU_OPEN', (payload: any) => {
      if (this.settings.screenReaderEnabled) {
        announce('Menu opened', 'polite');
      }
    });

    eventBus.subscribe('MENU_ACTION', (payload: any) => {
      if (this.settings.screenReaderEnabled) {
        announce(`Action: ${payload.action}`, 'polite');
      }
    });
  }

  /**
   * Update a single setting
   */
  updateSetting<K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ): void {
    this.settings[key] = value;
    this.applySettings();

    // Announce change
    if (this.settings.screenReaderEnabled) {
      announce(`${key} ${value ? 'enabled' : 'disabled'}`, 'polite');
    }
  }

  /**
   * Update multiple settings
   */
  updateSettings(settings: Partial<AccessibilitySettings>): void {
    this.settings = { ...this.settings, ...settings };
    this.applySettings();
  }

  /**
   * Get current settings
   */
  getSettings(): AccessibilitySettings {
    return { ...this.settings };
  }

  /**
   * Apply settings to DOM
   */
  private applySettings(): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    // High contrast
    if (this.settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Large text
    if (this.settings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    // Reduce motion
    if (this.settings.reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Focus indicators
    if (this.settings.focusIndicators) {
      root.classList.add('focus-indicators');
    } else {
      root.classList.remove('focus-indicators');
    }

    // Keyboard navigation
    if (this.settings.keyboardNavigation) {
      root.classList.add('keyboard-navigation');
    } else {
      root.classList.remove('keyboard-navigation');
    }
  }

  /**
   * Focus trap (for modals/dialogs)
   */
  trapFocus(element: HTMLElement): void {
    // Save last focused element
    this.lastFocusedElement = document.activeElement as HTMLElement;

    // Add to stack
    this.focusTrapStack.push(element);

    // Get all focusable elements
    const focusableElements = this.getFocusableElements(element);
    if (focusableElements.length === 0) return;

    // Focus first element
    focusableElements[0].focus();

    // Handle Tab key
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    element.addEventListener('keydown', handleTab);
    element.dataset.focusTrap = 'true';
  }

  /**
   * Release focus trap
   */
  releaseFocus(element?: HTMLElement): void {
    const trapped = element || this.focusTrapStack.pop();
    if (!trapped) return;

    delete trapped.dataset.focusTrap;

    // Restore focus to last focused element
    if (this.lastFocusedElement) {
      this.lastFocusedElement.focus();
      this.lastFocusedElement = null;
    }
  }

  /**
   * Get all focusable elements in a container
   */
  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    const selector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const elements = container.querySelectorAll(selector);
    return Array.from(elements).filter(
      (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true'
    ) as HTMLElement[];
  }

  /**
   * Skip to content (skip navigation)
   */
  skipToContent(): void {
    const main = document.querySelector('main');
    if (main) {
      (main as HTMLElement).focus();
      main.scrollIntoView();
    }
  }

  /**
   * Announce to screen reader
   */
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (this.settings.screenReaderEnabled) {
      announce(message, priority);
    }
  }
}

// Singleton instance
export const accessibilityManager = new AccessibilityManager();

/**
 * React hook for accessibility settings
 */
export function useAccessibility() {
  const settings = accessibilityManager.getSettings();

  return {
    settings,
    updateSetting: (key: keyof AccessibilitySettings, value: boolean) =>
      accessibilityManager.updateSetting(key, value),
    updateSettings: (settings: Partial<AccessibilitySettings>) =>
      accessibilityManager.updateSettings(settings),
    trapFocus: (element: HTMLElement) => accessibilityManager.trapFocus(element),
    releaseFocus: (element?: HTMLElement) => accessibilityManager.releaseFocus(element),
    announce: (message: string, priority?: 'polite' | 'assertive') =>
      accessibilityManager.announce(message, priority),
    skipToContent: () => accessibilityManager.skipToContent(),
  };
}

/**
 * Accessibility CSS to add to globals.css
 */
export const ACCESSIBILITY_CSS = `
/* High Contrast Mode */
.high-contrast {
  --mac-gray-1: #FFFFFF;
  --mac-gray-2: #CCCCCC;
  --mac-gray-3: #000000;
  --mac-black: #000000;
  --mac-white: #FFFFFF;
}

.high-contrast * {
  border-color: var(--mac-black) !important;
}

/* Large Text Mode */
.large-text {
  font-size: 16px;
}

.large-text .window {
  font-size: 16px;
}

/* Reduce Motion */
.reduce-motion *,
.reduce-motion *::before,
.reduce-motion *::after {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
}

/* Focus Indicators */
.focus-indicators *:focus {
  outline: 3px solid #4A90E2 !important;
  outline-offset: 2px !important;
}

/* Keyboard Navigation */
.keyboard-navigation *:focus-visible {
  outline: 3px solid #4A90E2;
  outline-offset: 2px;
}

/* Screen Reader Only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
`;

