/**
 * Clipboard System
 * Mac OS 8 style clipboard for Cut/Copy/Paste
 */

export interface ClipboardData {
  type: 'text' | 'file' | 'folder';
  data: any;
  operation: 'copy' | 'cut';
  timestamp: number;
}

class ClipboardManager {
  private clipboard: ClipboardData | null = null;

  /**
   * Copy data to clipboard
   */
  copy(type: ClipboardData['type'], data: any): void {
    this.clipboard = {
      type,
      data,
      operation: 'copy',
      timestamp: Date.now(),
    };
  }

  /**
   * Cut data to clipboard
   */
  cut(type: ClipboardData['type'], data: any): void {
    this.clipboard = {
      type,
      data,
      operation: 'cut',
      timestamp: Date.now(),
    };
  }

  /**
   * Get clipboard data
   */
  paste(): ClipboardData | null {
    return this.clipboard;
  }

  /**
   * Clear clipboard
   */
  clear(): void {
    this.clipboard = null;
  }

  /**
   * Check if clipboard has data
   */
  hasData(): boolean {
    return this.clipboard !== null;
  }

  /**
   * Get clipboard type
   */
  getType(): ClipboardData['type'] | null {
    return this.clipboard?.type ?? null;
  }
}

// Singleton instance
export const clipboard = new ClipboardManager();

