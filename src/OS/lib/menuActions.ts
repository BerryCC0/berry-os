/**
 * Menu Actions
 * Handlers for menu bar actions that integrate with active app context
 */

import { eventBus } from './eventBus';
import { clipboard } from './clipboard';

export type MenuAction = 
  | 'file:new'
  | 'file:new-folder'
  | 'file:close-window'
  | 'edit:cut'
  | 'edit:copy'
  | 'edit:paste'
  | 'edit:select-all'
  | 'view:as-icons'
  | 'view:as-list'
  | 'special:empty-trash';

/**
 * Execute a menu action
 * Publishes events that the active app can respond to
 */
export function executeMenuAction(action: MenuAction, context?: any): void {
  switch (action) {
    // File menu actions
    case 'file:new':
      eventBus.publish('MENU_ACTION', { action: 'new', context });
      break;
    
    case 'file:new-folder':
      eventBus.publish('MENU_ACTION', { action: 'new-folder', context });
      break;
    
    case 'file:close-window':
      eventBus.publish('MENU_ACTION', { action: 'close-window', context });
      break;

    // Edit menu actions
    case 'edit:cut':
      eventBus.publish('MENU_ACTION', { action: 'cut', context });
      break;

    case 'edit:copy':
      eventBus.publish('MENU_ACTION', { action: 'copy', context });
      break;

    case 'edit:paste':
      eventBus.publish('MENU_ACTION', { action: 'paste', context });
      break;

    case 'edit:select-all':
      eventBus.publish('MENU_ACTION', { action: 'select-all', context });
      break;

    // View menu actions
    case 'view:as-icons':
      eventBus.publish('MENU_ACTION', { action: 'view-as-icons', context });
      break;

    case 'view:as-list':
      eventBus.publish('MENU_ACTION', { action: 'view-as-list', context });
      break;

    // Special menu actions
    case 'special:empty-trash':
      eventBus.publish('MENU_ACTION', { action: 'empty-trash', context });
      break;

    default:
      console.warn('Unknown menu action:', action);
  }
}

/**
 * Keyboard shortcuts
 */
export const KEYBOARD_SHORTCUTS: Record<string, MenuAction> = {
  'cmd+n': 'file:new-folder',
  'cmd+w': 'file:close-window',
  'cmd+x': 'edit:cut',
  'cmd+c': 'edit:copy',
  'cmd+v': 'edit:paste',
  'cmd+a': 'edit:select-all',
  'cmd+1': 'view:as-icons',
  'cmd+2': 'view:as-list',
};

/**
 * Setup global keyboard shortcuts
 */
export function setupKeyboardShortcuts(): () => void {
  const handleKeyDown = (e: KeyboardEvent) => {
    const cmd = e.metaKey || e.ctrlKey;
    const key = e.key.toLowerCase();
    
    if (!cmd) return;

    // Check if we're in a text input
    const target = e.target as HTMLElement;
    const isInput =
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable;

    const shortcut = `cmd+${key}`;
    const action = KEYBOARD_SHORTCUTS[shortcut];

    if (action) {
      // For edit actions (copy/paste/cut/select-all), allow native browser behavior in inputs
      const isEditAction = [
        'edit:copy',
        'edit:paste',
        'edit:cut',
        'edit:select-all'
      ].includes(action);

      // If it's an edit action and we're in an input, let browser handle it
      if (isEditAction && isInput) {
        return; // Don't prevent default, let native clipboard work
      }

      // For all other actions, or edit actions outside inputs, use custom behavior
      e.preventDefault();
      executeMenuAction(action);
    }
  };

  document.addEventListener('keydown', handleKeyDown);

  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
}

