/**
 * Mini Apps - Launch Helpers
 * Pure business logic for launching Mini Apps
 */

import type { MiniAppCatalogItem } from '../types/miniAppTypes';
import type { AppConfig } from '../../../../OS/types/system';
import {
  getMiniAppUrl,
  getMiniAppName,
  getMiniAppIcon,
  getMiniAppSplashImage,
  getMiniAppSplashColor,
} from './catalogHelpers';

/**
 * Validate Mini App URL
 */
export function validateMiniAppUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Build Mini App window configuration
 */
export function buildMiniAppWindowConfig(
  miniApp: MiniAppCatalogItem
): Partial<AppConfig> {
  const name = getMiniAppName(miniApp);
  const icon = getMiniAppIcon(miniApp);
  
  return {
    id: `miniapp-${miniApp.author.fid}-${Date.now()}`,
    name: name,
    icon: icon,
    defaultWindowSize: { width: 800, height: 700 },
    minWindowSize: { width: 600, height: 500 },
    resizable: true,
    web3Required: false,
    mobileSupport: 'full',
    mobileLayout: 'fullscreen',
    category: 'web3',
    description: `Mini App by ${miniApp.author.username}`,
    version: '1.0.0',
  };
}

/**
 * Build iframe URL with auth token
 */
export function buildIframeUrl(
  miniApp: MiniAppCatalogItem,
  authToken?: string
): string {
  const url = getMiniAppUrl(miniApp);
  
  if (!authToken) {
    return url;
  }
  
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set('auth_token', authToken);
    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Get iframe sandbox attributes
 * Based on Mini App security requirements
 */
export function getIframeSandbox(): string {
  return [
    'allow-scripts',
    'allow-same-origin',
    'allow-forms',
    'allow-popups',
    'allow-popups-to-escape-sandbox',
    'allow-storage-access-by-user-activation',
    'allow-top-navigation-by-user-activation',
  ].join(' ');
}

/**
 * Get iframe allow attributes
 * For accessing device features
 */
export function getIframeAllow(): string {
  return [
    'accelerometer',
    'camera',
    'microphone',
    'geolocation',
    'payment',
    'usb',
    'web-share',
  ].join('; ');
}

/**
 * Build Mini App launch data
 */
export function buildLaunchData(
  miniApp: MiniAppCatalogItem,
  userData?: {
    fid: number | null;
    username: string | null;
    displayName: string | null;
    pfpUrl: string | null;
  }
): {
  url: string;
  name: string;
  icon: string;
  splashImage: string | null;
  splashColor: string;
  userFid?: number | null;
  username?: string | null;
  displayName?: string | null;
  pfpUrl?: string | null;
} {
  return {
    url: getMiniAppUrl(miniApp),
    name: getMiniAppName(miniApp),
    icon: getMiniAppIcon(miniApp),
    splashImage: getMiniAppSplashImage(miniApp),
    splashColor: getMiniAppSplashColor(miniApp),
    userFid: userData?.fid,
    username: userData?.username,
    displayName: userData?.displayName,
    pfpUrl: userData?.pfpUrl,
  };
}

/**
 * Generate unique Mini App window ID
 */
export function generateMiniAppId(miniApp: MiniAppCatalogItem): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `miniapp-${miniApp.author.fid}-${timestamp}-${random}`;
}

