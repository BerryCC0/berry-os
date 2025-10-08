/**
 * Font Manager - Business Logic
 * Handles font loading, validation, and management
 * NO React dependencies - pure TypeScript
 */

export interface FontDefinition {
  id: string;
  name: string;
  family: string;  // CSS font-family value
  category: 'system' | 'interface' | 'monospace';
  isWebFont: boolean;
  url?: string;  // For web fonts
  fallbacks: string[];
  preview?: string;  // Sample text
}

// Built-in Mac OS fonts
export const BUILT_IN_FONTS: Record<string, FontDefinition> = {
  chicago: {
    id: 'chicago',
    name: 'Chicago',
    family: 'Chicago',
    category: 'system',
    isWebFont: false,
    fallbacks: ['Courier New', 'monospace'],
    preview: 'The quick brown fox jumps',
  },
  geneva: {
    id: 'geneva',
    name: 'Geneva',
    family: 'Geneva',
    category: 'interface',
    isWebFont: false,
    fallbacks: ['Helvetica', 'Arial', 'sans-serif'],
    preview: 'The quick brown fox jumps',
  },
  monaco: {
    id: 'monaco',
    name: 'Monaco',
    family: 'Monaco',
    category: 'system',
    isWebFont: false,
    fallbacks: ['Courier New', 'monospace'],
    preview: 'The quick brown fox jumps',
  },
  charcoal: {
    id: 'charcoal',
    name: 'Charcoal',
    family: 'Charcoal',
    category: 'interface',
    isWebFont: false,
    fallbacks: ['Arial Black', 'sans-serif'],
    preview: 'The quick brown fox jumps',
  },
  courier: {
    id: 'courier',
    name: 'Courier',
    family: 'Courier New',
    category: 'monospace',
    isWebFont: false,
    fallbacks: ['Courier', 'monospace'],
    preview: 'The quick brown fox jumps',
  },
  helvetica: {
    id: 'helvetica',
    name: 'Helvetica',
    family: 'Helvetica',
    category: 'interface',
    isWebFont: false,
    fallbacks: ['Arial', 'sans-serif'],
    preview: 'The quick brown fox jumps',
  },
  arial: {
    id: 'arial',
    name: 'Arial',
    family: 'Arial',
    category: 'interface',
    isWebFont: false,
    fallbacks: ['Helvetica', 'sans-serif'],
    preview: 'The quick brown fox jumps',
  },
};

// Web font options (Google Fonts, modern alternatives)
export const WEB_FONTS: Record<string, FontDefinition> = {
  inter: {
    id: 'inter',
    name: 'Inter',
    family: 'Inter',
    category: 'interface',
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap',
    fallbacks: ['sans-serif'],
    preview: 'The quick brown fox jumps',
  },
  roboto: {
    id: 'roboto',
    name: 'Roboto',
    family: 'Roboto',
    category: 'interface',
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
    fallbacks: ['sans-serif'],
    preview: 'The quick brown fox jumps',
  },
  robotoMono: {
    id: 'robotoMono',
    name: 'Roboto Mono',
    family: 'Roboto Mono',
    category: 'monospace',
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;700&display=swap',
    fallbacks: ['monospace'],
    preview: 'The quick brown fox jumps',
  },
  sourceCodePro: {
    id: 'sourceCodePro',
    name: 'Source Code Pro',
    family: 'Source Code Pro',
    category: 'monospace',
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;500;700&display=swap',
    fallbacks: ['monospace'],
    preview: 'The quick brown fox jumps',
  },
  ibmPlexSans: {
    id: 'ibmPlexSans',
    name: 'IBM Plex Sans',
    family: 'IBM Plex Sans',
    category: 'interface',
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;700&display=swap',
    fallbacks: ['sans-serif'],
    preview: 'The quick brown fox jumps',
  },
  ibmPlexMono: {
    id: 'ibmPlexMono',
    name: 'IBM Plex Mono',
    family: 'IBM Plex Mono',
    category: 'monospace',
    isWebFont: true,
    url: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&display=swap',
    fallbacks: ['monospace'],
    preview: 'The quick brown fox jumps',
  },
};

// Track loaded web fonts to avoid duplicates
const loadedFonts = new Set<string>();

/**
 * Load a web font dynamically
 */
export async function loadWebFont(font: FontDefinition): Promise<void> {
  if (!font.isWebFont || !font.url) {
    throw new Error('Not a web font');
  }

  // Check if already loaded
  if (loadedFonts.has(font.url)) {
    return;
  }

  // Check if link element already exists
  if (typeof document !== 'undefined' && document.querySelector(`link[href="${font.url}"]`)) {
    loadedFonts.add(font.url);
    return;
  }

  if (typeof document === 'undefined') {
    return; // Server-side rendering
  }

  // Create link element
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = font.url;
  
  return new Promise((resolve, reject) => {
    link.onload = () => {
      loadedFonts.add(font.url!);
      resolve();
    };
    link.onerror = () => reject(new Error(`Failed to load font: ${font.name}`));
    document.head.appendChild(link);
  });
}

/**
 * Get CSS font stack with fallbacks
 */
export function getFontStack(font: FontDefinition): string {
  return [font.family, ...font.fallbacks].map(f => 
    f.includes(' ') ? `'${f}'` : f
  ).join(', ');
}

/**
 * Validate custom font URL
 */
export function isValidFontUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && 
           (parsed.hostname.includes('fonts.googleapis.com') || 
            parsed.hostname.includes('fonts.gstatic.com') ||
            parsed.hostname.includes('cdn.jsdelivr.net') ||
            parsed.hostname.includes('use.typekit.net'));
  } catch {
    return false;
  }
}

/**
 * Get all available fonts
 */
export function getAllFonts(): FontDefinition[] {
  return [
    ...Object.values(BUILT_IN_FONTS),
    ...Object.values(WEB_FONTS),
  ];
}

/**
 * Get fonts by category
 */
export function getFontsByCategory(category: FontDefinition['category']): FontDefinition[] {
  return getAllFonts().filter(f => f.category === category);
}

/**
 * Get font by ID
 */
export function getFontById(id: string): FontDefinition | null {
  return BUILT_IN_FONTS[id] || WEB_FONTS[id] || null;
}

/**
 * Preload commonly used web fonts
 */
export async function preloadCommonFonts(): Promise<void> {
  const commonFonts = [WEB_FONTS.inter, WEB_FONTS.robotoMono];
  
  await Promise.allSettled(
    commonFonts.map(font => loadWebFont(font))
  );
}

