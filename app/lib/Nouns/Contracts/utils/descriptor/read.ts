/**
 * Nouns Descriptor V3 - Read Functions
 * Pure functions and utilities for reading descriptor data
 */

import { Address } from 'viem';
import { NOUNS_CONTRACTS } from '../../addresses';
import { NounsDescriptorV3ABI } from '../../abis';

/**
 * Get descriptor contract address
 * @returns Descriptor V3 address
 */
export function getDescriptorAddress(): Address {
  return NOUNS_CONTRACTS.NounsDescriptorV3.address as Address;
}

/**
 * Parse trait data from contract
 * Trait data is stored as compressed bytes
 * @param traitData - Raw bytes from contract
 * @returns Parsed trait information
 */
export function parseTraitData(traitData: string): {
  raw: string;
  length: number;
} {
  return {
    raw: traitData,
    length: (traitData.length - 2) / 2, // Remove 0x and divide by 2
  };
}

/**
 * Validate trait index
 * @param index - Trait index to check
 * @param count - Total trait count from contract
 * @returns True if index is valid
 */
export function isValidTraitIndex(index: number, count: bigint): boolean {
  return index >= 0 && BigInt(index) < count;
}

/**
 * Get trait type name
 * @param traitType - Trait type number (0-4)
 * @returns Human-readable trait type
 */
export function getTraitTypeName(traitType: number): string {
  const types = ['Background', 'Body', 'Accessory', 'Head', 'Glasses'];
  return types[traitType] || 'Unknown';
}

/**
 * Format palette colors
 * @param palette - Palette string from contract
 * @returns Array of color values
 */
export function parsePalette(palette: string): string[] {
  // Palette is stored as concatenated hex colors
  // Each color is 3 bytes (RGB)
  const colors: string[] = [];
  for (let i = 2; i < palette.length; i += 6) {
    colors.push('#' + palette.slice(i, i + 6));
  }
  return colors;
}

/**
 * Check if data URI is enabled
 * @param isEnabled - Boolean from contract
 * @returns True if data URI mode is enabled
 */
export function isDataURIEnabled(isEnabled: boolean): boolean {
  return isEnabled;
}

/**
 * Parse SVG from data URI
 * @param dataURI - Data URI from contract
 * @returns Extracted SVG string
 */
export function extractSVGFromDataURI(dataURI: string): string | null {
  try {
    // Data URI format: data:application/json;base64,{base64 encoded JSON}
    const base64Data = dataURI.split(',')[1];
    const jsonString = Buffer.from(base64Data, 'base64').toString('utf-8');
    const json = JSON.parse(jsonString);
    return json.image; // SVG is in the image field
  } catch (error) {
    console.error('Failed to parse data URI:', error);
    return null;
  }
}

/**
 * Calculate total traits across all types
 * @param counts - Object with trait counts
 * @returns Total number of traits
 */
export function calculateTotalTraits(counts: {
  backgrounds: bigint;
  bodies: bigint;
  accessories: bigint;
  heads: bigint;
  glasses: bigint;
}): bigint {
  return counts.backgrounds + counts.bodies + counts.accessories + counts.heads + counts.glasses;
}

/**
 * Format trait counts for display
 * @param counts - Trait counts from contract
 * @returns Formatted string
 */
export function formatTraitCounts(counts: {
  backgrounds: bigint;
  bodies: bigint;
  accessories: bigint;
  heads: bigint;
  glasses: bigint;
}): string {
  return `BG: ${counts.backgrounds}, Body: ${counts.bodies}, Acc: ${counts.accessories}, Head: ${counts.heads}, Glasses: ${counts.glasses}`;
}

/**
 * Validate base URI format
 * @param baseURI - Base URI string
 * @returns True if valid format
 */
export function isValidBaseURI(baseURI: string): boolean {
  try {
    // Check if it's a valid URL or IPFS path
    return baseURI.startsWith('http://') || 
           baseURI.startsWith('https://') || 
           baseURI.startsWith('ipfs://') ||
           baseURI.startsWith('ar://'); // Arweave
  } catch {
    return false;
  }
}

// ============================================================================
// CONTRACT READ FUNCTIONS (for wagmi)
// ============================================================================

/**
 * Get background count
 * @returns Wagmi read config
 */
export function getBackgroundCount() {
  return {
    address: NOUNS_CONTRACTS.NounsDescriptorV3.address as Address,
    abi: NounsDescriptorV3ABI,
    functionName: 'backgroundCount',
  } as const;
}

/**
 * Get body count
 * @returns Wagmi read config
 */
export function getBodyCount() {
  return {
    address: NOUNS_CONTRACTS.NounsDescriptorV3.address as Address,
    abi: NounsDescriptorV3ABI,
    functionName: 'bodyCount',
  } as const;
}

/**
 * Get accessory count
 * @returns Wagmi read config
 */
export function getAccessoryCount() {
  return {
    address: NOUNS_CONTRACTS.NounsDescriptorV3.address as Address,
    abi: NounsDescriptorV3ABI,
    functionName: 'accessoryCount',
  } as const;
}

/**
 * Get head count
 * @returns Wagmi read config
 */
export function getHeadCount() {
  return {
    address: NOUNS_CONTRACTS.NounsDescriptorV3.address as Address,
    abi: NounsDescriptorV3ABI,
    functionName: 'headCount',
  } as const;
}

/**
 * Get glasses count
 * @returns Wagmi read config
 */
export function getGlassesCount() {
  return {
    address: NOUNS_CONTRACTS.NounsDescriptorV3.address as Address,
    abi: NounsDescriptorV3ABI,
    functionName: 'glassesCount',
  } as const;
}

/**
 * Get palette
 * @param index - Palette index
 * @returns Wagmi read config
 */
export function getPalette(index: number) {
  return {
    address: NOUNS_CONTRACTS.NounsDescriptorV3.address as Address,
    abi: NounsDescriptorV3ABI,
    functionName: 'palettes',
    args: [index],
  } as const;
}

/**
 * Check if data URI is enabled
 * @returns Wagmi read config
 */
export function checkDataURIEnabled() {
  return {
    address: NOUNS_CONTRACTS.NounsDescriptorV3.address as Address,
    abi: NounsDescriptorV3ABI,
    functionName: 'isDataURIEnabled',
  } as const;
}

/**
 * Get token URI
 * @param tokenId - Noun token ID
 * @param seed - Noun seed
 * @returns Wagmi read config
 */
export function getTokenURI(tokenId: bigint, seed: { background: bigint; body: bigint; accessory: bigint; head: bigint; glasses: bigint }) {
  return {
    address: NOUNS_CONTRACTS.NounsDescriptorV3.address as Address,
    abi: NounsDescriptorV3ABI,
    functionName: 'tokenURI',
    args: [tokenId, seed],
  } as const;
}

/**
 * Generate SVG from seed
 * @param seed - Noun seed
 * @returns Wagmi read config
 */
export function generateSVG(seed: { background: bigint; body: bigint; accessory: bigint; head: bigint; glasses: bigint }) {
  return {
    address: NOUNS_CONTRACTS.NounsDescriptorV3.address as Address,
    abi: NounsDescriptorV3ABI,
    functionName: 'generateSVGImage',
    args: [seed],
  } as const;
}

