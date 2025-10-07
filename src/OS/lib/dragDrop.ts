/**
 * Drag & Drop System
 * Universal drag-drop framework
 * 
 * Use Cases:
 * - Drag file to app icon to open
 * - Drag file to folder to move
 * - Drag text to text field
 * - Drag window to edge to snap (bonus)
 */

import { eventBus } from './eventBus';

export type DragDataType = 'file' | 'text' | 'icon' | 'window' | 'custom';

export interface DragData {
  type: DragDataType;
  data: any;
  source: string;
  preview?: string; // Image URL for drag preview
}

export interface DropTarget {
  id: string;
  accepts: DragDataType[]; // ['file', 'text']
  onDrop: (data: DragData) => boolean; // Return true if drop was successful
  onDragOver?: (data: DragData) => boolean; // Return true if can accept
  onDragEnter?: (data: DragData) => void;
  onDragLeave?: () => void;
}

class DragDropManager {
  private dragData: DragData | null = null;
  private dropTargets: Map<string, DropTarget> = new Map();
  private currentTarget: string | null = null;
  private isDragging: boolean = false;

  /**
   * Start a drag operation
   */
  startDrag(data: DragData): void {
    this.dragData = data;
    this.isDragging = true;
    
    // Publish drag start event
    eventBus.publish('DRAG_START', {
      type: data.type,
      source: data.source,
    });

    // Set up global mouse move and mouse up handlers
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);

    // Add dragging cursor
    document.body.style.cursor = 'grabbing';
  }

  /**
   * Register a drop target
   */
  registerDropTarget(target: DropTarget): () => void {
    this.dropTargets.set(target.id, target);

    // Return unregister function
    return () => {
      this.dropTargets.delete(target.id);
    };
  }

  /**
   * Get current drag data
   */
  getDragData(): DragData | null {
    return this.dragData;
  }

  /**
   * Check if currently dragging
   */
  getIsDragging(): boolean {
    return this.isDragging;
  }

  /**
   * Handle mouse move during drag
   */
  private handleMouseMove = (e: MouseEvent): void => {
    if (!this.dragData) return;

    // Check if mouse is over a valid drop target
    const element = document.elementFromPoint(e.clientX, e.clientY);
    const targetId = element?.getAttribute('data-drop-target-id');

    if (targetId && this.dropTargets.has(targetId)) {
      const target = this.dropTargets.get(targetId)!;

      // Check if target accepts this drag type
      if (target.accepts.includes(this.dragData.type)) {
        // Check if target can accept drop
        const canAccept = target.onDragOver?.(this.dragData) ?? true;

        if (canAccept) {
          // Entering new target
          if (this.currentTarget !== targetId) {
            // Leave previous target
            if (this.currentTarget) {
              const prevTarget = this.dropTargets.get(this.currentTarget);
              prevTarget?.onDragLeave?.();
            }

            // Enter new target
            target.onDragEnter?.(this.dragData);
            this.currentTarget = targetId;
            document.body.style.cursor = 'copy';
          }
        } else {
          // Can't accept
          if (this.currentTarget === targetId) {
            target.onDragLeave?.();
            this.currentTarget = null;
          }
          document.body.style.cursor = 'no-drop';
        }
      }
    } else {
      // Not over a target
      if (this.currentTarget) {
        const prevTarget = this.dropTargets.get(this.currentTarget);
        prevTarget?.onDragLeave?.();
        this.currentTarget = null;
      }
      document.body.style.cursor = 'grabbing';
    }
  };

  /**
   * Handle mouse up (end drag)
   */
  private handleMouseUp = (e: MouseEvent): void => {
    if (!this.dragData) return;

    // Check if dropping on a valid target
    if (this.currentTarget) {
      const target = this.dropTargets.get(this.currentTarget);
      if (target) {
        const success = target.onDrop(this.dragData);
        
        // Publish drop event
        eventBus.publish('DROP', {
          type: this.dragData.type,
          source: this.dragData.source,
          target: this.currentTarget,
          success,
        });

        target.onDragLeave?.();
      }
    }

    // Clean up
    this.endDrag();
  };

  /**
   * End drag operation
   */
  private endDrag(): void {
    // Publish drag end event
    if (this.dragData) {
      eventBus.publish('DRAG_END', {
        type: this.dragData.type,
        source: this.dragData.source,
      });
    }

    this.dragData = null;
    this.currentTarget = null;
    this.isDragging = false;

    // Remove global handlers
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);

    // Reset cursor
    document.body.style.cursor = '';
  }

  /**
   * Cancel drag operation
   */
  cancelDrag(): void {
    this.endDrag();
  }
}

// Singleton instance
export const dragDropManager = new DragDropManager();

/**
 * React hook for drag source
 */
export function useDragSource(data: DragData) {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragDropManager.startDrag(data);
  };

  return {
    onMouseDown: handleMouseDown,
    draggable: true,
  };
}

/**
 * React hook for drop target
 */
export function useDropTarget(target: Omit<DropTarget, 'id'>) {
  const targetId = `drop-target-${Math.random().toString(36).substr(2, 9)}`;

  // Register on mount, unregister on unmount
  if (typeof window !== 'undefined') {
    const unregister = dragDropManager.registerDropTarget({
      id: targetId,
      ...target,
    });

    // Clean up on unmount
    return () => {
      unregister();
    };
  }

  return {
    'data-drop-target-id': targetId,
  };
}

