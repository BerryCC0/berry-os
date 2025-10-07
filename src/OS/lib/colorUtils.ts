/**
 * Color Utility Functions
 * Helper functions for color manipulation in theming system
 */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface RGBA extends RGB {
  a: number;
}

/**
 * Convert hex color to RGB object
 */
export function hexToRgb(hex: string): RGB {
  // Remove # if present
  const cleanHex = hex.replace(/^#/, '');
  
  // Handle 3-digit hex
  const fullHex = cleanHex.length === 3
    ? cleanHex.split('').map(char => char + char).join('')
    : cleanHex;
  
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : { r: 0, g: 0, b: 0 };
}

/**
 * Convert RGB to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    const hex = clamped.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Lighten a color by a percentage
 * @param color - Hex color string
 * @param percent - Percentage to lighten (0-100)
 */
export function lighten(color: string, percent: number): string {
  const rgb = hexToRgb(color);
  const amount = (percent / 100) * 255;
  
  return rgbToHex(
    rgb.r + amount,
    rgb.g + amount,
    rgb.b + amount
  );
}

/**
 * Darken a color by a percentage
 * @param color - Hex color string
 * @param percent - Percentage to darken (0-100)
 */
export function darken(color: string, percent: number): string {
  const rgb = hexToRgb(color);
  const amount = (percent / 100) * 255;
  
  return rgbToHex(
    rgb.r - amount,
    rgb.g - amount,
    rgb.b - amount
  );
}

/**
 * Convert hex color to rgba string
 * @param color - Hex color string
 * @param alpha - Alpha value (0-1)
 */
export function hexToRgba(color: string, alpha: number): string {
  const rgb = hexToRgb(color);
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/**
 * Calculate luminance of a color (for contrast checking)
 * Returns value between 0 (black) and 1 (white)
 */
export function getLuminance(color: string): number {
  const rgb = hexToRgb(color);
  
  // Convert to sRGB
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
    const normalized = val / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });
  
  // Calculate luminance
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 * Returns value between 1 (no contrast) and 21 (max contrast)
 * WCAG AA requires 4.5:1 for normal text, 3:1 for large text
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if color combination meets WCAG AA contrast requirements
 */
export function meetsContrastAA(foreground: string, background: string, largeText = false): boolean {
  const ratio = getContrastRatio(foreground, background);
  return largeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Check if color combination meets WCAG AAA contrast requirements
 */
export function meetsContrastAAA(foreground: string, background: string, largeText = false): boolean {
  const ratio = getContrastRatio(foreground, background);
  return largeText ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Get a contrasting text color (black or white) for a given background
 */
export function getContrastingTextColor(backgroundColor: string): string {
  const luminance = getLuminance(backgroundColor);
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Mix two colors together
 * @param color1 - First color (hex)
 * @param color2 - Second color (hex)
 * @param weight - Weight of first color (0-1, default 0.5)
 */
export function mixColors(color1: string, color2: string, weight = 0.5): string {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  return rgbToHex(
    rgb1.r * weight + rgb2.r * (1 - weight),
    rgb1.g * weight + rgb2.g * (1 - weight),
    rgb1.b * weight + rgb2.b * (1 - weight)
  );
}

/**
 * Adjust color saturation
 * @param color - Hex color
 * @param percent - Saturation adjustment (-100 to 100)
 */
export function adjustSaturation(color: string, percent: number): string {
  const rgb = hexToRgb(color);
  
  // Convert to HSL
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  
  if (max === min) {
    // Grayscale - no saturation
    return color;
  }
  
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  
  let h = 0;
  if (max === r) {
    h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  } else if (max === g) {
    h = ((b - r) / d + 2) / 6;
  } else {
    h = ((r - g) / d + 4) / 6;
  }
  
  // Adjust saturation
  const newS = Math.max(0, Math.min(1, s + (percent / 100)));
  
  // Convert back to RGB
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  
  const q = l < 0.5 ? l * (1 + newS) : l + newS - l * newS;
  const p = 2 * l - q;
  
  const newR = hue2rgb(p, q, h + 1/3);
  const newG = hue2rgb(p, q, h);
  const newB = hue2rgb(p, q, h - 1/3);
  
  return rgbToHex(newR * 255, newG * 255, newB * 255);
}

/**
 * Convert camelCase to kebab-case (for CSS variable names)
 */
export function camelToKebab(str: string): string {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

/**
 * Convert kebab-case to camelCase (for parsing CSS variables)
 */
export function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

