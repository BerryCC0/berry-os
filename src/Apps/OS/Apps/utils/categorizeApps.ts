/**
 * App Categorization Logic
 * Business logic for organizing apps into categories
 */

import type { AppConfig } from '../../../AppConfig';

export interface AppCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  apps: AppConfig[];
  color?: string; // Optional accent color for category
}

/**
 * Categorize apps based on their category field and metadata
 */
export function categorizeApps(apps: AppConfig[]): AppCategory[] {
  const categories: Record<string, AppCategory> = {
    os: {
      id: 'os',
      name: 'OS Apps',
      description: 'Built-in Berry OS applications',
      icon: '/icons/system/folder-system.svg',
      apps: [],
      color: '#0066cc',
    },
    nouns: {
      id: 'nouns',
      name: 'Nouns',
      description: 'Nouns DAO ecosystem apps',
      icon: '/icons/apps/berry.svg', // Using berry as Nouns icon
      apps: [],
      color: '#d22209', // Nouns red
    },
    utilities: {
      id: 'utilities',
      name: 'Utilities',
      description: 'System utilities and tools',
      icon: '/icons/system/folder.svg',
      apps: [],
      color: '#666666',
    },
    media: {
      id: 'media',
      name: 'Media',
      description: 'Photos, videos, and audio',
      icon: '/icons/system/folder-pictures.svg',
      apps: [],
      color: '#cc00cc',
    },
    productivity: {
      id: 'productivity',
      name: 'Productivity',
      description: 'Documents and productivity tools',
      icon: '/icons/system/folder-documents.svg',
      apps: [],
      color: '#00aa00',
    },
    web3: {
      id: 'web3',
      name: 'Web3',
      description: 'Blockchain and crypto apps',
      icon: '/icons/apps/wallet.svg',
      apps: [],
      color: '#ff9500',
    },
  };

  // Categorize each app
  apps.forEach((app) => {
    // Special handling for Nouns apps (by id prefix or explicit category)
    if (app.id.startsWith('nouns-') || app.id === 'camp' || app.id === 'auction') {
      categories.nouns.apps.push(app);
    }
    // System apps
    else if (app.category === 'system') {
      categories.os.apps.push(app);
    }
    // Other categories based on AppConfig.category
    else if (app.category && categories[app.category]) {
      categories[app.category].apps.push(app);
    }
    // Default to utilities
    else {
      categories.utilities.apps.push(app);
    }
  });

  // Filter out empty categories and return as array
  return Object.values(categories).filter((cat) => cat.apps.length > 0);
}

/**
 * Get all apps as a flat list (for "All Apps" view)
 */
export function getAllApps(apps: AppConfig[]): AppConfig[] {
  return apps.filter((app) => app.id !== 'apps'); // Exclude the Apps app itself
}

/**
 * Search/filter apps by name or description
 */
export function searchApps(apps: AppConfig[], query: string): AppConfig[] {
  if (!query.trim()) return apps;

  const lowerQuery = query.toLowerCase();
  return apps.filter(
    (app) =>
      app.name.toLowerCase().includes(lowerQuery) ||
      app.description.toLowerCase().includes(lowerQuery) ||
      app.id.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Sort apps alphabetically by name
 */
export function sortAppsByName(apps: AppConfig[]): AppConfig[] {
  return [...apps].sort((a, b) => a.name.localeCompare(b.name));
}

