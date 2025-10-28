/**
 * GIF Helper
 * Detect and extract GIF links from text content
 */

/**
 * Detect if text contains a GIF URL
 * Matches common image hosting services and direct GIF links
 */
const GIF_URL_PATTERNS = [
  // Direct GIF links
  /https?:\/\/[^\s]+\.gif(\?[^\s]*)?/gi,
  // Tenor
  /https?:\/\/(tenor\.com|media\.tenor\.com)\/[^\s]+/gi,
  // Giphy
  /https?:\/\/(giphy\.com|media\.giphy\.com|i\.giphy\.com)\/[^\s]+/gi,
  // Imgur
  /https?:\/\/(imgur\.com|i\.imgur\.com)\/[^\s]+/gi,
  // Cloudinary
  /https?:\/\/[^\s]*cloudinary\.com\/[^\s]+/gi,
  // IPFS gateways
  /https?:\/\/[^\s]*\.ipfs\.[^\s]+/gi,
  /https?:\/\/ipfs\.io\/ipfs\/[^\s]+/gi,
  // Generic image links that might be gifs
  /https?:\/\/[^\s]+\.(gif|gifv|webp)(\?[^\s]*)?/gi,
];

export interface ParsedContent {
  type: 'text' | 'gif';
  content: string;
  gifUrl?: string;
}

/**
 * Parse text content to extract GIF URLs and regular text
 * Returns an array of content blocks (text or gif)
 */
export function parseTextForGifs(text: string): ParsedContent[] {
  if (!text) return [];

  const result: ParsedContent[] = [];
  let remainingText = text;
  const foundUrls: { url: string; index: number }[] = [];

  // Find all GIF URLs
  for (const pattern of GIF_URL_PATTERNS) {
    const matches = remainingText.matchAll(pattern);
    for (const match of matches) {
      if (match.index !== undefined) {
        foundUrls.push({
          url: match[0],
          index: match.index,
        });
      }
    }
  }

  // Sort by index
  foundUrls.sort((a, b) => a.index - b.index);

  // Remove duplicates (same URL might match multiple patterns)
  const uniqueUrls = foundUrls.filter(
    (item, index, self) => 
      index === self.findIndex(t => t.url === item.url)
  );

  if (uniqueUrls.length === 0) {
    // No GIFs found, return as text
    return [{ type: 'text', content: text }];
  }

  // Split text into blocks
  let lastIndex = 0;
  for (const { url, index } of uniqueUrls) {
    // Add text before the URL
    if (index > lastIndex) {
      const textBefore = remainingText.substring(lastIndex, index).trim();
      if (textBefore) {
        result.push({ type: 'text', content: textBefore });
      }
    }

    // Add the GIF URL
    result.push({ type: 'gif', content: url, gifUrl: normalizeGifUrl(url) });
    lastIndex = index + url.length;
  }

  // Add remaining text after last URL
  if (lastIndex < remainingText.length) {
    const textAfter = remainingText.substring(lastIndex).trim();
    if (textAfter) {
      result.push({ type: 'text', content: textAfter });
    }
  }

  return result;
}

/**
 * Normalize GIF URL to get the actual image URL
 * Converts page URLs to direct image URLs when possible
 */
export function normalizeGifUrl(url: string): string {
  // Tenor: Convert page URL to media URL
  // https://tenor.com/view/... -> get GIF from media URL
  if (url.includes('tenor.com') && !url.includes('media.tenor.com')) {
    // Try to extract ID and construct media URL
    // Note: This is a best-effort approach; may need API for accurate conversion
    const match = url.match(/tenor\.com\/view\/[^/]+-(\d+)/);
    if (match) {
      const id = match[1];
      // Return the page URL as-is; browser can handle it
      // In production, you might want to use Tenor API to get direct URL
      return url;
    }
  }

  // Giphy: Convert page URL to direct media URL
  // https://giphy.com/gifs/... -> https://media.giphy.com/media/.../giphy.gif
  if (url.includes('giphy.com/gifs/') && !url.includes('media.giphy.com')) {
    const match = url.match(/gifs\/(?:[^/]+-)?([a-zA-Z0-9]+)$/);
    if (match) {
      const id = match[1];
      return `https://media.giphy.com/media/${id}/giphy.gif`;
    }
  }

  // Imgur: Ensure we're using i.imgur.com
  if (url.includes('imgur.com') && !url.includes('i.imgur.com')) {
    const match = url.match(/imgur\.com\/([a-zA-Z0-9]+)/);
    if (match) {
      const id = match[1];
      // Check if extension is already present
      if (id.includes('.')) {
        return `https://i.imgur.com/${id}`;
      }
      return `https://i.imgur.com/${id}.gif`;
    }
  }

  // GIFV (Imgur) -> GIF
  if (url.endsWith('.gifv')) {
    return url.replace('.gifv', '.gif');
  }

  // Default: return as-is
  return url;
}

/**
 * Check if a string contains any GIF URLs
 */
export function containsGif(text: string): boolean {
  if (!text) return false;
  return GIF_URL_PATTERNS.some(pattern => {
    pattern.lastIndex = 0; // Reset regex state
    return pattern.test(text);
  });
}

/**
 * Extract all GIF URLs from text
 */
export function extractGifUrls(text: string): string[] {
  if (!text) return [];
  
  const urls: string[] = [];
  for (const pattern of GIF_URL_PATTERNS) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      urls.push(normalizeGifUrl(match[0]));
    }
  }
  
  // Remove duplicates
  return Array.from(new Set(urls));
}

