/**
 * Event System Types
 * Simple pub/sub pattern for System 7 event handling
 */

export type EventType =
  | 'WINDOW_OPEN'
  | 'WINDOW_CLOSE'
  | 'WINDOW_FOCUS'
  | 'WINDOW_MINIMIZE'
  | 'WINDOW_ZOOM'
  | 'WINDOW_MOVE'
  | 'WINDOW_RESIZE'
  | 'APP_LAUNCH'
  | 'APP_TERMINATE'
  | 'APP_ERROR'
  | 'MENU_OPEN'
  | 'MENU_CLOSE'
  | 'MENU_SELECT'
  | 'MENU_ACTION'
  | 'DESKTOP_ICON_MOVE'
  | 'DESKTOP_ICON_SELECT'
  | 'KEYBOARD_SHORTCUT'
  | 'GESTURE'
  | 'GESTURE_TAP'
  | 'GESTURE_LONG_PRESS'
  | 'GESTURE_SWIPE_LEFT'
  | 'GESTURE_SWIPE_RIGHT'
  | 'GESTURE_SWIPE_UP'
  | 'GESTURE_SWIPE_DOWN';

export interface BaseEventPayload {
  timestamp: number;
}

export interface WindowEventPayload extends BaseEventPayload {
  windowId: string;
}

export interface WindowMovePayload extends WindowEventPayload {
  x: number;
  y: number;
}

export interface WindowResizePayload extends WindowEventPayload {
  width: number;
  height: number;
}

export interface AppEventPayload extends BaseEventPayload {
  appId: string;
}

export interface AppErrorPayload extends AppEventPayload {
  error: Error;
  windowId?: string;
}

export interface MenuEventPayload extends BaseEventPayload {
  menuId: string;
  itemId?: string;
}

export interface MenuActionPayload extends BaseEventPayload {
  action: string;
  context?: any;
}

export interface DesktopIconEventPayload extends BaseEventPayload {
  iconId: string;
  x?: number;
  y?: number;
}

export interface KeyboardEventPayload extends BaseEventPayload {
  key: string;
  modifiers: {
    command?: boolean;
    shift?: boolean;
    option?: boolean;
    control?: boolean;
  };
}

export interface GestureEventPayload extends BaseEventPayload {
  gestureType?: string;
  target?: string;
  targetId?: string;
  position?: { x: number; y: number };
  startPosition?: { x: number; y: number };
  velocity?: number;
  distance?: number;
}

export type EventPayload =
  | WindowEventPayload
  | WindowMovePayload
  | WindowResizePayload
  | AppEventPayload
  | AppErrorPayload
  | MenuEventPayload
  | MenuActionPayload
  | DesktopIconEventPayload
  | KeyboardEventPayload
  | GestureEventPayload
  | BaseEventPayload;

export type EventHandler<T extends EventPayload = EventPayload> = (payload: T) => void;

export interface EventSubscription {
  unsubscribe: () => void;
}

