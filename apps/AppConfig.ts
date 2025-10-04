/**
 * App Configuration & Registry
 * THE interface between System 7 Toolbox and all applications
 * 
 * Every app must be registered here to be accessible in the system.
 */

import { lazy } from 'react';
import type { AppConfig } from '../system/types/system';
import { getAppIconPath } from '../app/lib/utils/iconUtils';

/**
 * Registered Applications
 * Add your app here to make it available in the system
 */

// Lazy imports for code splitting
const Berry = lazy(() => import('./Berry/Berry'));
const Calculator = lazy(() => import('./Calculator/Calculator'));
const Finder = lazy(() => import('./Finder/Finder'));
const MediaViewer = lazy(() => import('./MediaViewer/MediaViewer'));
const TextEditor = lazy(() => import('./TextEditor/TextEditor'));
const Debug = lazy(() => import('./Debug/Debug'));

/**
 * Application Registry
 * All apps must be registered in this array
 */
const BASE_APPS: AppConfig[] = [
  {
    id: 'berry',
    name: 'Berry',
    component: Berry,
    icon: getAppIconPath('berry', 'svg'),
    defaultWindowSize: { width: 400, height: 300 },
    minWindowSize: { width: 400, height: 300 },
    maxWindowSize: { width: 400, height: 300 },
    resizable: false,
    web3Required: false,
    mobileSupport: 'full',
    mobileLayout: 'modal',
    category: 'system',
    description: 'Information about Nouns OS',
    version: '1.0.0',
  },
  {
    id: 'calculator',
    name: 'Calculator',
    component: Calculator,
    icon: getAppIconPath('calculator', 'svg'),
    defaultWindowSize: { width: 280, height: 420 },
    minWindowSize: { width: 280, height: 420 },
    maxWindowSize: { width: 280, height: 420 },
    resizable: false,
    web3Required: false,
    mobileSupport: 'full',
    mobileLayout: 'fullscreen',
    category: 'utility',
    description: 'Simple calculator with shareable state',
    version: '1.0.0',
    showOnDesktop: true,
    menus: {
      Edit: [
        { label: 'Copy Result', action: 'calc:copy-result', shortcut: '⌘C' },
        { label: 'Paste', action: 'calc:paste', shortcut: '⌘V' },
        { divider: true },
        { label: 'Clear', action: 'calc:clear', shortcut: '⌘⌫' },
      ],
      View: [
        { label: 'Share Calculator State', action: 'calc:share' },
      ],
    },
  },
  {
    id: 'finder',
    name: 'Finder',
    component: Finder,
    icon: getAppIconPath('finder', 'svg'),
    defaultWindowSize: { width: 600, height: 450 },
    minWindowSize: { width: 400, height: 300 },
    maxWindowSize: { width: 1200, height: 900 },
    resizable: true,
    web3Required: false,
    mobileSupport: 'full',
    mobileLayout: 'fullscreen',
    category: 'system',
    description: 'Browse files and folders',
    version: '8.0.0',
    showOnDesktop: true,
    menus: {
      File: [
        { label: 'New Folder', action: 'file:new-folder', shortcut: '⌘N' },
        { divider: true },
        { label: 'Open', shortcut: '⌘O' },
        { divider: true },
        { label: 'Close Window', action: 'file:close-window', shortcut: '⌘W' },
        { label: 'Get Info', shortcut: '⌘I' },
      ],
      Edit: [
        { label: 'Undo', shortcut: '⌘Z', disabled: true },
        { divider: true },
        { label: 'Cut', action: 'edit:cut', shortcut: '⌘X' },
        { label: 'Copy', action: 'edit:copy', shortcut: '⌘C' },
        { label: 'Paste', action: 'edit:paste', shortcut: '⌘V' },
        { label: 'Clear' },
        { divider: true },
        { label: 'Select All', action: 'edit:select-all', shortcut: '⌘A' },
      ],
      View: [
        { label: 'as Icons', action: 'view:as-icons', shortcut: '⌘1' },
        { label: 'as List', action: 'view:as-list', shortcut: '⌘2' },
        { divider: true },
        { label: 'Clean Up' },
        { label: 'Arrange' },
      ],
    },
  },
  {
    id: 'media-viewer',
    name: 'Media Viewer',
    component: MediaViewer,
    icon: getAppIconPath('media-viewer', 'svg'),
    defaultWindowSize: { width: 800, height: 600 },
    minWindowSize: { width: 400, height: 300 },
    maxWindowSize: { width: 1920, height: 1080 },
    resizable: true,
    web3Required: false,
    mobileSupport: 'full',
    mobileLayout: 'fullscreen',
    category: 'media',
    description: 'View images, videos, and audio files',
    version: '1.0.0',
  },
  {
    id: 'text-editor',
    name: 'Text Editor',
    component: TextEditor,
    icon: '/icons/system/file-text.svg',
    defaultWindowSize: { width: 600, height: 500 },
    minWindowSize: { width: 400, height: 300 },
    maxWindowSize: { width: 1200, height: 900 },
    resizable: true,
    web3Required: false,
    mobileSupport: 'full',
    mobileLayout: 'fullscreen',
    category: 'productivity',
    description: 'Simple text editor for viewing and editing text files',
    version: '1.0.0',
    menus: {
      File: [
        { label: 'New', action: 'file:new', shortcut: '⌘N' },
        { divider: true },
        { label: 'Close', action: 'file:close-window', shortcut: '⌘W' },
      ],
      Edit: [
        { label: 'Undo', shortcut: '⌘Z', disabled: true },
        { divider: true },
        { label: 'Cut', action: 'edit:cut', shortcut: '⌘X' },
        { label: 'Copy', action: 'edit:copy', shortcut: '⌘C' },
        { label: 'Paste', action: 'edit:paste', shortcut: '⌘V' },
        { divider: true },
        { label: 'Select All', action: 'edit:select-all', shortcut: '⌘A' },
      ],
    },
  },
];

// Debug app - only available in development
const DEBUG_APP: AppConfig = {
  id: 'debug',
  name: 'Debug',
  component: Debug,
  icon: getAppIconPath('debug', 'svg'),
  defaultWindowSize: { width: 600, height: 700 },
  minWindowSize: { width: 400, height: 500 },
  maxWindowSize: { width: 800, height: 900 },
  resizable: true,
  web3Required: false,
  mobileSupport: 'full',
  mobileLayout: 'fullscreen',
  category: 'utility',
  description: 'Testing and debugging tools for Nouns OS',
  version: '1.0.0',
};

// Conditionally include Debug app in development only
export const REGISTERED_APPS: AppConfig[] = 
  process.env.NODE_ENV === 'development' 
    ? [...BASE_APPS, DEBUG_APP]
    : BASE_APPS;

/**
 * Get app configuration by ID
 */
export function getAppById(appId: string): AppConfig | undefined {
  return REGISTERED_APPS.find((app) => app.id === appId);
}

/**
 * Get apps by category
 */
export function getAppsByCategory(category: AppConfig['category']): AppConfig[] {
  return REGISTERED_APPS.filter((app) => app.category === category);
}

/**
 * Get all system apps
 */
export function getSystemApps(): AppConfig[] {
  return getAppsByCategory('system');
}

