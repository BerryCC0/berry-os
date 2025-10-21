/**
 * Mini Apps - TypeScript Types
 * Type definitions for Farcaster Mini Apps based on Neynar API
 */

/**
 * Mini App Manifest
 * Metadata for a Mini App from the manifest
 */
export interface MiniAppManifest {
  version: string;
  name: string;
  home_url: string;
  icon_url: string;
  image_url: string;
  button_title: string;
  splash_image_url?: string;
  splash_background_color?: string;
  webhook_url?: string;
  subtitle?: string;
  description?: string;
  screenshot_urls?: string[];
  primary_category?: string;
  tags?: string[];
  hero_image_url?: string;
  tagline?: string;
  og_title?: string;
  og_description?: string;
  og_image_url?: string;
  noindex?: boolean;
}

/**
 * Mini App Author
 * Information about the Mini App creator
 */
export interface MiniAppAuthor {
  object: 'user';
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  custody_address?: string;
  follower_count?: number;
  following_count?: number;
  verifications?: string[];
  power_badge?: boolean;
}

/**
 * Mini App Catalog Item
 * Complete Mini App entry from the catalog
 */
export interface MiniAppCatalogItem {
  version: string;
  image: string;
  frames_url: string;
  title: string;
  manifest: {
    miniapp?: MiniAppManifest;
    frame?: MiniAppManifest;
  };
  author: MiniAppAuthor;
  metadata?: {
    html?: Record<string, unknown>;
  };
}

/**
 * Catalog Response
 * API response structure
 */
export interface CatalogResponse {
  frames: MiniAppCatalogItem[];
  next: {
    cursor?: string;
  } | null;
}

/**
 * Mini App Filters
 * User-selected filters for browsing
 */
export interface MiniAppFilters {
  categories: string[];
  networks: string[];
  searchQuery: string;
  timeWindow: '1h' | '6h' | '12h' | '24h' | '7d';
}

/**
 * Mini App Launch Data
 * Data passed when launching a Mini App
 */
export interface MiniAppLaunchData {
  miniApp: MiniAppCatalogItem;
  authToken?: string;
  walletAddress?: string;
}

/**
 * Available Categories
 * Common Mini App categories
 */
export const MINI_APP_CATEGORIES = [
  'games',
  'social',
  'defi',
  'nft',
  'utility',
  'entertainment',
  'news',
  'education',
  'marketplace',
  'dao',
] as const;

export type MiniAppCategory = typeof MINI_APP_CATEGORIES[number];

/**
 * Available Networks
 * Supported blockchain networks
 */
export const MINI_APP_NETWORKS = [
  'ethereum',
  'base',
  'optimism',
  'arbitrum',
  'polygon',
  'solana',
  'bitcoin',
] as const;

export type MiniAppNetwork = typeof MINI_APP_NETWORKS[number];

/**
 * Time Windows
 * For trending calculation
 */
export const TIME_WINDOWS = [
  { value: '1h', label: '1 Hour' },
  { value: '6h', label: '6 Hours' },
  { value: '12h', label: '12 Hours' },
  { value: '24h', label: '24 Hours' },
  { value: '7d', label: '7 Days' },
] as const;

/**
 * Default Filters
 */
export const DEFAULT_FILTERS: MiniAppFilters = {
  categories: [],
  networks: [],
  searchQuery: '',
  timeWindow: '7d',
};

