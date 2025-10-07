/**
 * Auto-Save System
 * Automatic periodic state saves with debouncing
 */

import { saveStateToLocalStorage, serializeSystemState } from './stateSerialization';
import { eventBus } from './eventBus';

interface AutoSaveOptions {
  interval: number; // Interval in ms (default: 5 minutes)
  debounce: number; // Debounce time in ms (default: 2 seconds)
  saveToLocalStorage: boolean; // Save to localStorage
  saveToServer?: boolean; // Save to server (if wallet connected)
  onSave?: (state: any) => void; // Callback after save
  onError?: (error: Error) => void; // Error callback
}

class AutoSaveManager {
  private options: AutoSaveOptions = {
    interval: 5 * 60 * 1000, // 5 minutes
    debounce: 2000, // 2 seconds
    saveToLocalStorage: true,
    saveToServer: false,
  };

  private intervalTimer: NodeJS.Timeout | null = null;
  private debounceTimer: NodeJS.Timeout | null = null;
  private isEnabled: boolean = false;
  private isSaving: boolean = false;
  private lastSaveTime: number = 0;
  private pendingSave: boolean = false;

  /**
   * Enable auto-save with options
   */
  enable(options?: Partial<AutoSaveOptions>): void {
    if (this.isEnabled) {
      this.disable();
    }

    this.options = { ...this.options, ...options };
    this.isEnabled = true;

    // Start periodic saves
    this.startPeriodicSave();

    // Listen for events that should trigger saves
    this.listenForChanges();

    console.log('Auto-save enabled:', this.options);
  }

  /**
   * Disable auto-save
   */
  disable(): void {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    this.isEnabled = false;
    console.log('Auto-save disabled');
  }

  /**
   * Manually trigger a save
   */
  async saveNow(): Promise<void> {
    if (this.isSaving) {
      this.pendingSave = true;
      return;
    }

    this.isSaving = true;

    try {
      const state = serializeSystemState();

      // Save to localStorage
      if (this.options.saveToLocalStorage) {
        saveStateToLocalStorage();
      }

      // Save to server (if enabled and wallet connected)
      if (this.options.saveToServer) {
        await this.saveToServer(state);
      }

      this.lastSaveTime = Date.now();
      
      // Publish save event
      eventBus.publish('AUTOSAVE_COMPLETE', {
        timestamp: this.lastSaveTime,
        destination: this.options.saveToLocalStorage ? 'localStorage' : 'server',
      });

      // Callback
      this.options.onSave?.(state);

      console.log('Auto-save complete:', new Date(this.lastSaveTime).toLocaleTimeString());
    } catch (error) {
      console.error('Auto-save failed:', error);
      this.options.onError?.(error as Error);
      
      // Publish error event
      eventBus.publish('AUTOSAVE_ERROR', {
        error: (error as Error).message,
        timestamp: Date.now(),
      });
    } finally {
      this.isSaving = false;

      // If a save was requested while saving, trigger it now
      if (this.pendingSave) {
        this.pendingSave = false;
        this.saveNow();
      }
    }
  }

  /**
   * Debounced save (triggered by user actions)
   */
  private debouncedSave(): void {
    if (!this.isEnabled) return;

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.saveNow();
    }, this.options.debounce);
  }

  /**
   * Start periodic saves
   */
  private startPeriodicSave(): void {
    this.intervalTimer = setInterval(() => {
      this.saveNow();
    }, this.options.interval);
  }

  /**
   * Listen for system changes that should trigger saves
   */
  private listenForChanges(): void {
    // Window changes
    eventBus.subscribe('WINDOW_OPEN', () => this.debouncedSave());
    eventBus.subscribe('WINDOW_CLOSE', () => this.debouncedSave());
    eventBus.subscribe('WINDOW_MOVE', () => this.debouncedSave());
    eventBus.subscribe('WINDOW_RESIZE', () => this.debouncedSave());

    // App changes
    eventBus.subscribe('APP_LAUNCH', () => this.debouncedSave());
    eventBus.subscribe('APP_TERMINATE', () => this.debouncedSave());

    // Desktop changes
    eventBus.subscribe('DESKTOP_ICON_MOVE', () => this.debouncedSave());
    eventBus.subscribe('WALLPAPER_CHANGE', () => this.debouncedSave());

    // Theme changes (already debounced in preferencesStore)
    // No need to listen here
  }

  /**
   * Save to server (requires wallet connection)
   */
  private async saveToServer(state: any): Promise<void> {
    // Get wallet address from system store
    // const walletAddress = useSystemStore.getState().connectedWallet;
    // if (!walletAddress) return;

    // Send to API
    const response = await fetch('/api/preferences/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // walletAddress,
        state,
        timestamp: Date.now(),
      }),
    });

    if (!response.ok) {
      throw new Error('Server save failed');
    }
  }

  /**
   * Get last save time
   */
  getLastSaveTime(): number {
    return this.lastSaveTime;
  }

  /**
   * Get time since last save
   */
  getTimeSinceLastSave(): number {
    return Date.now() - this.lastSaveTime;
  }

  /**
   * Check if currently saving
   */
  getIsSaving(): boolean {
    return this.isSaving;
  }

  /**
   * Check if enabled
   */
  getIsEnabled(): boolean {
    return this.isEnabled;
  }
}

// Singleton instance
export const autoSaveManager = new AutoSaveManager();

/**
 * React hook for auto-save
 */
export function useAutoSave(options?: Partial<AutoSaveOptions>) {
  const enable = () => autoSaveManager.enable(options);
  const disable = () => autoSaveManager.disable();
  const saveNow = () => autoSaveManager.saveNow();

  return {
    enable,
    disable,
    saveNow,
    isEnabled: autoSaveManager.getIsEnabled(),
    isSaving: autoSaveManager.getIsSaving(),
    lastSaveTime: autoSaveManager.getLastSaveTime(),
  };
}

