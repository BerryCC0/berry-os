/**
 * Selection System
 * Universal selection framework
 * 
 * Features:
 * - Rubber-band selection
 * - Multi-select with Cmd+Click
 * - Range select with Shift+Click
 * - Select all
 * - Clear selection
 */

import { eventBus } from './eventBus';

export interface SelectionItem {
  id: string;
  element?: HTMLElement;
  bounds?: DOMRect;
}

export interface SelectionOptions {
  multiSelect?: boolean; // Allow multiple selection
  rangeSelect?: boolean; // Allow shift-click range selection
  rubberBand?: boolean; // Allow rubber-band selection
}

class SelectionManager {
  private selectedItems: Set<string> = new Set();
  private lastSelectedId: string | null = null;
  private isRubberBanding: boolean = false;
  private rubberBandStart: { x: number; y: number } | null = null;

  /**
   * Select an item
   */
  select(itemId: string, options: { multi?: boolean; range?: boolean } = {}): void {
    if (options.range && this.lastSelectedId) {
      // Range selection (Shift+Click)
      // Note: Implementing range requires knowing the order of items
      // This is a simplified version
      this.selectedItems.add(itemId);
    } else if (options.multi) {
      // Multi-select (Cmd+Click)
      if (this.selectedItems.has(itemId)) {
        this.selectedItems.delete(itemId);
      } else {
        this.selectedItems.add(itemId);
      }
    } else {
      // Single select
      this.selectedItems.clear();
      this.selectedItems.add(itemId);
    }

    this.lastSelectedId = itemId;
    this.notifySelectionChange();
  }

  /**
   * Deselect an item
   */
  deselect(itemId: string): void {
    this.selectedItems.delete(itemId);
    this.notifySelectionChange();
  }

  /**
   * Clear all selections
   */
  clearSelection(): void {
    this.selectedItems.clear();
    this.lastSelectedId = null;
    this.notifySelectionChange();
  }

  /**
   * Select all items
   */
  selectAll(itemIds: string[]): void {
    this.selectedItems = new Set(itemIds);
    this.notifySelectionChange();
  }

  /**
   * Get selected items
   */
  getSelection(): string[] {
    return Array.from(this.selectedItems);
  }

  /**
   * Check if item is selected
   */
  isSelected(itemId: string): boolean {
    return this.selectedItems.has(itemId);
  }

  /**
   * Get selection count
   */
  getSelectionCount(): number {
    return this.selectedItems.size;
  }

  /**
   * Start rubber-band selection
   */
  startRubberBand(x: number, y: number): void {
    this.isRubberBanding = true;
    this.rubberBandStart = { x, y };
  }

  /**
   * Update rubber-band selection
   */
  updateRubberBand(
    x: number,
    y: number,
    items: SelectionItem[]
  ): void {
    if (!this.isRubberBanding || !this.rubberBandStart) return;

    // Calculate rubber-band rectangle
    const rect = {
      left: Math.min(this.rubberBandStart.x, x),
      top: Math.min(this.rubberBandStart.y, y),
      right: Math.max(this.rubberBandStart.x, x),
      bottom: Math.max(this.rubberBandStart.y, y),
    };

    // Find items within rubber-band
    const selected = items.filter((item) => {
      if (!item.bounds) return false;

      return (
        item.bounds.left < rect.right &&
        item.bounds.right > rect.left &&
        item.bounds.top < rect.bottom &&
        item.bounds.bottom > rect.top
      );
    });

    // Update selection
    this.selectedItems = new Set(selected.map((item) => item.id));
    this.notifySelectionChange();
  }

  /**
   * End rubber-band selection
   */
  endRubberBand(): void {
    this.isRubberBanding = false;
    this.rubberBandStart = null;
  }

  /**
   * Check if rubber-banding
   */
  getIsRubberBanding(): boolean {
    return this.isRubberBanding;
  }

  /**
   * Get rubber-band rectangle
   */
  getRubberBandRect(): { x: number; y: number; width: number; height: number } | null {
    if (!this.rubberBandStart) return null;

    // This would be updated during mouse move
    // For now, return null
    return null;
  }

  /**
   * Notify selection change
   */
  private notifySelectionChange(): void {
    eventBus.publish('SELECTION_CHANGE', {
      selected: Array.from(this.selectedItems),
      count: this.selectedItems.size,
    });
  }
}

// Singleton instance
export const selectionManager = new SelectionManager();

/**
 * React hook for selectable items
 */
export function useSelectable(
  itemId: string,
  options: SelectionOptions = {}
) {
  const handleClick = (e: React.MouseEvent) => {
    const multi = options.multiSelect && (e.metaKey || e.ctrlKey);
    const range = options.rangeSelect && e.shiftKey;

    selectionManager.select(itemId, { multi, range });
  };

  const isSelected = selectionManager.isSelected(itemId);

  return {
    onClick: handleClick,
    'data-selected': isSelected,
    'aria-selected': isSelected,
  };
}

/**
 * React hook for selection container (rubber-band)
 */
export function useSelectionContainer(items: SelectionItem[]) {
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start rubber-band on left mouse button and no modifiers
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;

    const rect = e.currentTarget.getBoundingClientRect();
    selectionManager.startRubberBand(
      e.clientX - rect.left,
      e.clientY - rect.top
    );

    const handleMouseMove = (moveEvent: MouseEvent) => {
      selectionManager.updateRubberBand(
        moveEvent.clientX - rect.left,
        moveEvent.clientY - rect.top,
        items
      );
    };

    const handleMouseUp = () => {
      selectionManager.endRubberBand();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return {
    onMouseDown: handleMouseDown,
  };
}

