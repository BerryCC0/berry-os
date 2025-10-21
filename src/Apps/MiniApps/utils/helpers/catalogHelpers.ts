/**
 * Mini Apps - Catalog Helpers
 * Pure business logic for catalog operations
 */

import type { MiniAppCatalogItem, MiniAppManifest, MiniAppAuthor } from '../types/miniAppTypes';

/**
 * Get Mini App manifest (prefer miniapp over frame)
 */
export function getMiniAppManifest(item: MiniAppCatalogItem): MiniAppManifest | null {
  return item.manifest.miniapp || item.manifest.frame || null;
}

/**
 * Get Mini App home URL
 */
export function getMiniAppUrl(item: MiniAppCatalogItem): string {
  const manifest = getMiniAppManifest(item);
  return manifest?.home_url || item.frames_url;
}

/**
 * Get Mini App name
 */
export function getMiniAppName(item: MiniAppCatalogItem): string {
  const manifest = getMiniAppManifest(item);
  return manifest?.name || item.title;
}

/**
 * Get Mini App description
 */
export function getMiniAppDescription(item: MiniAppCatalogItem): string {
  const manifest = getMiniAppManifest(item);
  return manifest?.description || manifest?.subtitle || '';
}

/**
 * Get Mini App icon URL
 */
export function getMiniAppIcon(item: MiniAppCatalogItem): string {
  const manifest = getMiniAppManifest(item);
  return manifest?.icon_url || manifest?.image_url || item.image;
}

/**
 * Get Mini App category
 */
export function getMiniAppCategory(item: MiniAppCatalogItem): string | null {
  const manifest = getMiniAppManifest(item);
  return manifest?.primary_category || null;
}

/**
 * Get Mini App tags
 */
export function getMiniAppTags(item: MiniAppCatalogItem): string[] {
  const manifest = getMiniAppManifest(item);
  return manifest?.tags || [];
}

/**
 * Get Mini App splash image
 */
export function getMiniAppSplashImage(item: MiniAppCatalogItem): string | null {
  const manifest = getMiniAppManifest(item);
  return manifest?.splash_image_url || manifest?.hero_image_url || null;
}

/**
 * Get Mini App splash background color
 */
export function getMiniAppSplashColor(item: MiniAppCatalogItem): string {
  const manifest = getMiniAppManifest(item);
  return manifest?.splash_background_color || '#DDDDDD';
}

/**
 * Format Mini App author display
 */
export function formatMiniAppAuthor(author: MiniAppAuthor): string {
  return author.display_name || author.username || `FID ${author.fid}`;
}

/**
 * Get Mini App author username
 */
export function getMiniAppAuthorUsername(author: MiniAppAuthor): string {
  return author.username || `fid:${author.fid}`;
}

/**
 * Check if Mini App has verification badge
 */
export function hasVerificationBadge(author: MiniAppAuthor): boolean {
  return author.power_badge || false;
}

/**
 * Extract networks from Mini App manifest
 * This is a heuristic based on common patterns
 */
export function getMiniAppNetworks(item: MiniAppCatalogItem): string[] {
  const manifest = getMiniAppManifest(item);
  const tags = manifest?.tags || [];
  const description = (manifest?.description || '').toLowerCase();
  const title = (manifest?.name || '').toLowerCase();
  
  const networks: string[] = [];
  const searchText = `${title} ${description} ${tags.join(' ')}`.toLowerCase();
  
  // Check for network mentions
  if (searchText.includes('ethereum') || searchText.includes('eth')) {
    networks.push('ethereum');
  }
  if (searchText.includes('base')) {
    networks.push('base');
  }
  if (searchText.includes('optimism') || searchText.includes('op ')) {
    networks.push('optimism');
  }
  if (searchText.includes('arbitrum') || searchText.includes('arb')) {
    networks.push('arbitrum');
  }
  if (searchText.includes('polygon') || searchText.includes('matic')) {
    networks.push('polygon');
  }
  if (searchText.includes('solana') || searchText.includes('sol')) {
    networks.push('solana');
  }
  if (searchText.includes('bitcoin') || searchText.includes('btc')) {
    networks.push('bitcoin');
  }
  
  return networks;
}

/**
 * Check if Mini App is valid
 */
export function isValidMiniApp(item: MiniAppCatalogItem): boolean {
  const manifest = getMiniAppManifest(item);
  if (!manifest) return false;
  
  const url = getMiniAppUrl(item);
  return !!url && url.startsWith('https://');
}

/**
 * Get Mini App display title
 */
export function getMiniAppDisplayTitle(item: MiniAppCatalogItem): string {
  const name = getMiniAppName(item);
  const author = formatMiniAppAuthor(item.author);
  return `${name} by ${author}`;
}

