/**
 * Theme Manager - Business Logic
 * Handles custom theme CRUD operations
 * NO React dependencies - pure TypeScript
 */

import type { Theme, CustomTheme } from '../types/theme';

/**
 * Generate unique theme ID
 */
export function generateThemeId(userId: string, themeName: string): string {
  const timestamp = Date.now();
  const sanitized = themeName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const userShort = userId.slice(0, 6).toLowerCase();
  return `custom-${userShort}-${sanitized}-${timestamp}`;
}

/**
 * Validate theme object
 */
export function isValidTheme(theme: any): theme is Theme {
  return (
    typeof theme === 'object' &&
    typeof theme.id === 'string' &&
    typeof theme.name === 'string' &&
    typeof theme.colors === 'object' &&
    typeof theme.patterns === 'object'
  );
}

/**
 * Clone a theme (for creating variations)
 */
export function cloneTheme(baseTheme: Theme, newName: string, userId: string): Theme {
  return {
    ...JSON.parse(JSON.stringify(baseTheme)), // Deep clone
    id: generateThemeId(userId, newName),
    name: newName,
    description: `Based on ${baseTheme.name}`,
    metadata: {
      author: userId,
      version: '1.0.0',
      createdAt: Date.now(),
      isCustom: true,
    },
  };
}

/**
 * Export theme as JSON
 */
export function exportTheme(theme: Theme): string {
  return JSON.stringify(theme, null, 2);
}

/**
 * Import theme from JSON
 */
export function importTheme(json: string, userId: string): Theme | null {
  try {
    const parsed = JSON.parse(json);
    if (!isValidTheme(parsed)) {
      throw new Error('Invalid theme format');
    }
    
    // Regenerate ID to avoid conflicts
    return {
      ...parsed,
      id: generateThemeId(userId, parsed.name),
      metadata: {
        ...parsed.metadata,
        author: userId,
        isCustom: true,
        createdAt: Date.now(),
      },
    };
  } catch (error) {
    console.error('Failed to import theme:', error);
    return null;
  }
}

/**
 * Generate shareable theme code
 */
export function generateShareCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing characters
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Validate theme name
 */
export function isValidThemeName(name: string): boolean {
  return name.length >= 3 && name.length <= 50 && /^[a-zA-Z0-9\s\-_]+$/.test(name);
}

/**
 * Get theme display name (with fallback)
 */
export function getThemeDisplayName(theme: Theme): string {
  return theme.name || theme.id || 'Untitled Theme';
}

/**
 * Get theme author display name
 */
export function getThemeAuthor(theme: Theme): string {
  if (!theme.metadata?.author) return 'Unknown';
  
  // Show shortened wallet address
  const address = theme.metadata.author;
  if (address.startsWith('0x')) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
  
  return address;
}

/**
 * Compare two themes for equality
 */
export function areThemesEqual(theme1: Theme, theme2: Theme): boolean {
  // Simple comparison based on serialization
  try {
    const json1 = JSON.stringify(theme1.colors) + JSON.stringify(theme1.patterns);
    const json2 = JSON.stringify(theme2.colors) + JSON.stringify(theme2.patterns);
    return json1 === json2;
  } catch {
    return false;
  }
}

/**
 * Get theme modification date
 */
export function getThemeModifiedDate(theme: Theme): Date | null {
  if (!theme.metadata?.createdAt) return null;
  return new Date(theme.metadata.createdAt);
}

/**
 * Format theme for API request
 */
export function formatThemeForAPI(theme: Theme, userId: string): any {
  return {
    theme_id: theme.id,
    theme_name: theme.name,
    theme_description: theme.description || '',
    theme_data: JSON.stringify(theme),
    wallet_address: userId,
  };
}

/**
 * Parse theme from API response
 */
export function parseThemeFromAPI(apiData: any): Theme | null {
  try {
    if (typeof apiData.theme_data === 'string') {
      return JSON.parse(apiData.theme_data);
    } else if (typeof apiData.theme_data === 'object') {
      return apiData.theme_data;
    }
    return null;
  } catch (error) {
    console.error('Failed to parse theme from API:', error);
    return null;
  }
}

/**
 * Share theme publicly - returns share code
 */
export async function shareTheme(
  walletAddress: string,
  themeId: string,
  isPublic: boolean
): Promise<{ success: boolean; shareCode?: string; error?: string }> {
  try {
    const shareCode = isPublic ? generateShareCode() : undefined;

    const response = await fetch('/api/themes/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress,
        themeId,
        isPublic,
        shareCode,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || 'Failed to share theme' };
    }

    return { success: true, shareCode };
  } catch (error) {
    console.error('Error sharing theme:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Install a shared theme from another user
 */
export async function installSharedTheme(
  walletAddress: string,
  shareCode: string
): Promise<{ success: boolean; themeId?: string; themeName?: string; error?: string }> {
  try {
    const response = await fetch('/api/themes/install', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress,
        shareCode,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error || 'Failed to install theme' };
    }

    const data = await response.json();
    return {
      success: true,
      themeId: data.themeId,
      themeName: data.themeName,
    };
  } catch (error) {
    console.error('Error installing theme:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Discover public themes (browse themes shared by others)
 */
export async function discoverPublicThemes(
  walletAddress?: string,
  limit: number = 50,
  offset: number = 0
): Promise<any[]> {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    if (walletAddress) {
      params.append('walletAddress', walletAddress);
    }

    const response = await fetch(`/api/themes/discover?${params.toString()}`);

    if (!response.ok) {
      throw new Error('Failed to fetch public themes');
    }

    return await response.json();
  } catch (error) {
    console.error('Error discovering public themes:', error);
    return [];
  }
}

