/**
 * Gesture Handler
 * Mobile gesture system for Mac OS 8 touch interface
 * Integrates with eventBus for system-wide gesture events
 */

import { eventBus } from './eventBus';

export type GestureType = 
  | 'tap'
  | 'longPress'
  | 'swipeLeft'
  | 'swipeRight'
  | 'swipeUp'
  | 'swipeDown'
  | 'edgeSwipeLeft'
  | 'edgeSwipeRight';

export interface GestureEvent {
  type: GestureType;
  target: HTMLElement;
  position: { x: number; y: number };
  startPosition?: { x: number; y: number };
  velocity?: number;
  distance?: number;
}

interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
  element: HTMLElement;
  longPressTimer?: NodeJS.Timeout;
  hasMoved: boolean;
}

// Gesture thresholds
const LONG_PRESS_DURATION = 500; // ms
const SWIPE_THRESHOLD = 50; // pixels
const SWIPE_VELOCITY_THRESHOLD = 0.3; // pixels per ms
const EDGE_SWIPE_THRESHOLD = 20; // pixels from edge
const TAP_MAX_DURATION = 300; // ms
const TAP_MAX_MOVEMENT = 10; // pixels

class GestureHandler {
  private touchState: TouchState | null = null;
  private isEnabled = false;

  constructor() {
    // Only enable on touch devices
    if (typeof window !== 'undefined' && 'ontouchstart' in window) {
      this.enable();
    }
  }

  /**
   * Enable gesture detection
   */
  enable(): void {
    if (this.isEnabled) return;
    
    this.isEnabled = true;
    document.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    document.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    document.addEventListener('touchend', this.handleTouchEnd, { passive: false });
    document.addEventListener('touchcancel', this.handleTouchCancel);
  }

  /**
   * Disable gesture detection
   */
  disable(): void {
    if (!this.isEnabled) return;
    
    this.isEnabled = false;
    document.removeEventListener('touchstart', this.handleTouchStart);
    document.removeEventListener('touchmove', this.handleTouchMove);
    document.removeEventListener('touchend', this.handleTouchEnd);
    document.removeEventListener('touchcancel', this.handleTouchCancel);
    
    this.clearTouchState();
  }

  /**
   * Handle touch start
   */
  private handleTouchStart = (e: TouchEvent): void => {
    if (e.touches.length !== 1) {
      this.clearTouchState();
      return;
    }

    const touch = e.touches[0];
    const target = e.target as HTMLElement;

    this.touchState = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      element: target,
      hasMoved: false,
    };

    // Start long press timer
    this.touchState.longPressTimer = setTimeout(() => {
      if (this.touchState && !this.touchState.hasMoved) {
        this.triggerGesture({
          type: 'longPress',
          target: this.touchState.element,
          position: { x: this.touchState.startX, y: this.touchState.startY },
        });
        
        // Prevent default to stop context menu on mobile
        e.preventDefault();
      }
    }, LONG_PRESS_DURATION);
  };

  /**
   * Handle touch move
   */
  private handleTouchMove = (e: TouchEvent): void => {
    if (!this.touchState || e.touches.length !== 1) {
      this.clearTouchState();
      return;
    }

    const touch = e.touches[0];
    const deltaX = touch.clientX - this.touchState.startX;
    const deltaY = touch.clientY - this.touchState.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Mark as moved if beyond tap threshold
    if (distance > TAP_MAX_MOVEMENT) {
      this.touchState.hasMoved = true;
      
      // Clear long press timer if moved
      if (this.touchState.longPressTimer) {
        clearTimeout(this.touchState.longPressTimer);
        this.touchState.longPressTimer = undefined;
      }
    }
  };

  /**
   * Handle touch end
   */
  private handleTouchEnd = (e: TouchEvent): void => {
    if (!this.touchState) return;

    const touch = e.changedTouches[0];
    const endX = touch.clientX;
    const endY = touch.clientY;
    const deltaX = endX - this.touchState.startX;
    const deltaY = endY - this.touchState.startY;
    const duration = Date.now() - this.touchState.startTime;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = distance / duration;

    // Clear long press timer
    if (this.touchState.longPressTimer) {
      clearTimeout(this.touchState.longPressTimer);
    }

    // Determine gesture type
    if (!this.touchState.hasMoved && duration < TAP_MAX_DURATION) {
      // Tap
      this.triggerGesture({
        type: 'tap',
        target: this.touchState.element,
        position: { x: endX, y: endY },
      });
    } else if (distance > SWIPE_THRESHOLD || velocity > SWIPE_VELOCITY_THRESHOLD) {
      // Swipe - determine direction
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (absX > absY) {
        // Horizontal swipe
        const isEdgeSwipe = this.touchState.startX < EDGE_SWIPE_THRESHOLD || 
                           this.touchState.startX > window.innerWidth - EDGE_SWIPE_THRESHOLD;
        
        if (deltaX > 0) {
          this.triggerGesture({
            type: isEdgeSwipe ? 'edgeSwipeRight' : 'swipeRight',
            target: this.touchState.element,
            position: { x: endX, y: endY },
            startPosition: { x: this.touchState.startX, y: this.touchState.startY },
            velocity,
            distance: absX,
          });
        } else {
          this.triggerGesture({
            type: isEdgeSwipe ? 'edgeSwipeLeft' : 'swipeLeft',
            target: this.touchState.element,
            position: { x: endX, y: endY },
            startPosition: { x: this.touchState.startX, y: this.touchState.startY },
            velocity,
            distance: absX,
          });
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          this.triggerGesture({
            type: 'swipeDown',
            target: this.touchState.element,
            position: { x: endX, y: endY },
            startPosition: { x: this.touchState.startX, y: this.touchState.startY },
            velocity,
            distance: absY,
          });
        } else {
          this.triggerGesture({
            type: 'swipeUp',
            target: this.touchState.element,
            position: { x: endX, y: endY },
            startPosition: { x: this.touchState.startX, y: this.touchState.startY },
            velocity,
            distance: absY,
          });
        }
      }
    }

    this.clearTouchState();
  };

  /**
   * Handle touch cancel
   */
  private handleTouchCancel = (): void => {
    this.clearTouchState();
  };

  /**
   * Clear touch state
   */
  private clearTouchState(): void {
    if (this.touchState?.longPressTimer) {
      clearTimeout(this.touchState.longPressTimer);
    }
    this.touchState = null;
  }

  /**
   * Trigger gesture event
   */
  private triggerGesture(gesture: GestureEvent): void {
    // Publish to event bus
    eventBus.publish('GESTURE', {
      gestureType: gesture.type,
      target: gesture.target.tagName,
      targetId: gesture.target.id || undefined,
      position: gesture.position,
      startPosition: gesture.startPosition,
      velocity: gesture.velocity,
      distance: gesture.distance,
    });

    // Also dispatch custom DOM event for local handling
    const customEvent = new CustomEvent('macosgesture', {
      detail: gesture,
      bubbles: true,
    });
    gesture.target.dispatchEvent(customEvent);
  }

  /**
   * Check if device is touch-enabled
   */
  static isTouchDevice(): boolean {
    return typeof window !== 'undefined' && 'ontouchstart' in window;
  }
}

// Singleton instance
export const gestureHandler = new GestureHandler();

// Export type for testing/mocking
export type { GestureHandler };

