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

/**
 * Application Registry
 * All apps must be registered in this array
 */
export const REGISTERED_APPS: AppConfig[] = [
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
];

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

