/**
 * Mini Apps - Filter Helpers
 * Pure business logic for filtering and sorting
 */

import type { MiniAppCatalogItem, MiniAppFilters } from '../types/miniAppTypes';
import {
  getMiniAppName,
  getMiniAppDescription,
  getMiniAppCategory,
  getMiniAppNetworks,
  getMiniAppTags,
} from './catalogHelpers';

/**
 * Filter by category
 */
export function filterByCategory(
  items: MiniAppCatalogItem[],
  categories: string[]
): MiniAppCatalogItem[] {
  if (categories.length === 0) return items;
  
  return items.filter((item) => {
    const category = getMiniAppCategory(item);
    if (!category) return false;
    return categories.includes(category.toLowerCase());
  });
}

/**
 * Filter by network
 */
export function filterByNetwork(
  items: MiniAppCatalogItem[],
  networks: string[]
): MiniAppCatalogItem[] {
  if (networks.length === 0) return items;
  
  return items.filter((item) => {
    const itemNetworks = getMiniAppNetworks(item);
    return networks.some((network) =>
      itemNetworks.includes(network.toLowerCase())
    );
  });
}

/**
 * Filter by search query
 */
export function filterBySearch(
  items: MiniAppCatalogItem[],
  query: string
): MiniAppCatalogItem[] {
  if (!query || query.trim() === '') return items;
  
  const searchLower = query.toLowerCase().trim();
  
  return items.filter((item) => {
    const name = getMiniAppName(item).toLowerCase();
    const description = getMiniAppDescription(item).toLowerCase();
    const tags = getMiniAppTags(item).map(t => t.toLowerCase());
    const authorUsername = item.author.username.toLowerCase();
    const authorDisplayName = item.author.display_name.toLowerCase();
    
    return (
      name.includes(searchLower) ||
      description.includes(searchLower) ||
      tags.some(tag => tag.includes(searchLower)) ||
      authorUsername.includes(searchLower) ||
      authorDisplayName.includes(searchLower)
    );
  });
}

/**
 * Apply all filters
 */
export function applyFilters(
  items: MiniAppCatalogItem[],
  filters: MiniAppFilters
): MiniAppCatalogItem[] {
  let filtered = items;
  
  // Apply category filter
  filtered = filterByCategory(filtered, filters.categories);
  
  // Apply network filter
  filtered = filterByNetwork(filtered, filters.networks);
  
  // Apply search filter
  filtered = filterBySearch(filtered, filters.searchQuery);
  
  return filtered;
}

/**
 * Get available categories from items
 */
export function getAvailableCategories(items: MiniAppCatalogItem[]): string[] {
  const categories = new Set<string>();
  
  items.forEach((item) => {
    const category = getMiniAppCategory(item);
    if (category) {
      categories.add(category.toLowerCase());
    }
  });
  
  return Array.from(categories).sort();
}

/**
 * Get available networks from items
 */
export function getAvailableNetworks(items: MiniAppCatalogItem[]): string[] {
  const networks = new Set<string>();
  
  items.forEach((item) => {
    const itemNetworks = getMiniAppNetworks(item);
    itemNetworks.forEach((network) => networks.add(network));
  });
  
  return Array.from(networks).sort();
}

/**
 * Sort by trending (placeholder - API provides pre-sorted)
 */
export function sortByTrending(items: MiniAppCatalogItem[]): MiniAppCatalogItem[] {
  // API already sorts by trending based on time_window
  // This is a placeholder for any additional client-side sorting
  return items;
}

/**
 * Sort alphabetically by name
 */
export function sortByName(items: MiniAppCatalogItem[]): MiniAppCatalogItem[] {
  return [...items].sort((a, b) => {
    const nameA = getMiniAppName(a).toLowerCase();
    const nameB = getMiniAppName(b).toLowerCase();
    return nameA.localeCompare(nameB);
  });
}

/**
 * Count filtered results
 */
export function getFilteredCount(
  items: MiniAppCatalogItem[],
  filters: MiniAppFilters
): number {
  return applyFilters(items, filters).length;
}

/**
 * Check if any filters are active
 */
export function hasActiveFilters(filters: MiniAppFilters): boolean {
  return (
    filters.categories.length > 0 ||
    filters.networks.length > 0 ||
    filters.searchQuery.trim() !== ''
  );
}

/**
 * Clear all filters
 */
export function clearFilters(): MiniAppFilters {
  return {
    categories: [],
    networks: [],
    searchQuery: '',
    timeWindow: '7d',
  };
}

