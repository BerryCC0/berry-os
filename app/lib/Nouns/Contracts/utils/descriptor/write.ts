/**
 * Nouns Descriptor V3 - Write Functions
 * Transaction builders for descriptor operations
 */

import { Address } from 'viem';
import { NounsDescriptorV3ABI } from '../../abis';
import { NOUNS_CONTRACTS } from '../../addresses';

/**
 * Prepare add many backgrounds transaction
 * @param backgrounds - Array of background trait data (compressed bytes)
 * @returns Transaction config for wagmi
 */
export function prepareAddManyBackgrounds(backgrounds: readonly string[]) {
  return {
    address: NOUNS_CONTRACTS.NounsDescriptorV3.address as Address,
    abi: NounsDescriptorV3ABI,
    functionName: 'addManyBackgrounds',
    args: [backgrounds.map(bg => bg as `0x${string}`)],
  } as const;
}

/**
 * Prepare add many bodies transaction
 * @param bodies - Array of body trait data (compressed bytes)
 * @returns Transaction config for wagmi
 */
export function prepareAddManyBodies(bodies: readonly string[]) {
  return {
    address: NOUNS_CONTRACTS.NounsDescriptorV3.address as Address,
    abi: NounsDescriptorV3ABI,
    functionName: 'addManyBodies',
    args: [bodies.map(body => body as `0x${string}`)],
  } as const;
}

/**
 * Prepare add many accessories transaction
 * @param accessories - Array of accessory trait data (compressed bytes)
 * @returns Transaction config for wagmi
 */
export function prepareAddManyAccessories(accessories: readonly string[]) {
  return {
    address: NOUNS_CONTRACTS.NounsDescriptorV3.address as Address,
    abi: NounsDescriptorV3ABI,
    functionName: 'addManyAccessories',
    args: [accessories.map(acc => acc as `0x${string}`)],
  } as const;
}

/**
 * Prepare add many heads transaction
 * @param heads - Array of head trait data (compressed bytes)
 * @returns Transaction config for wagmi
 */
export function prepareAddManyHeads(heads: readonly string[]) {
  return {
    address: NOUNS_CONTRACTS.NounsDescriptorV3.address as Address,
    abi: NounsDescriptorV3ABI,
    functionName: 'addManyHeads',
    args: [heads.map(head => head as `0x${string}`)],
  } as const;
}

/**
 * Prepare add many glasses transaction
 * @param glasses - Array of glasses trait data (compressed bytes)
 * @returns Transaction config for wagmi
 */
export function prepareAddManyGlasses(glasses: readonly string[]) {
  return {
    address: NOUNS_CONTRACTS.NounsDescriptorV3.address as Address,
    abi: NounsDescriptorV3ABI,
    functionName: 'addManyGlasses',
    args: [glasses.map(g => g as `0x${string}`)],
  } as const;
}

/**
 * Prepare set palette transaction
 * @param paletteIndex - Index of palette to set (0-based)
 * @param palette - Palette data as hex string
 * @returns Transaction config for wagmi
 */
export function prepareSetPalette(paletteIndex: number, palette: string) {
  return {
    address: NOUNS_CONTRACTS.NounsDescriptorV3.address as Address,
    abi: NounsDescriptorV3ABI,
    functionName: 'setPalette',
    args: [paletteIndex, palette as `0x${string}`],
  } as const;
}

/**
 * Prepare add color to palette transaction
 * @param paletteIndex - Index of palette
 * @param color - Color as hex string (e.g., "0xFF0000" for red)
 * @returns Transaction config for wagmi
 */
export function prepareAddColorToPalette(paletteIndex: number, color: string) {
  return {
    address: NOUNS_CONTRACTS.NounsDescriptorV3.address as Address,
    abi: NounsDescriptorV3ABI,
    functionName: 'addColorToPalette',
    args: [paletteIndex, color],
  } as const;
}

/**
 * Prepare set base URI transaction
 * @param newBaseURI - New base URI for token metadata
 * @returns Transaction config for wagmi
 */
export function prepareSetBaseURI(newBaseURI: string) {
  return {
    address: NOUNS_CONTRACTS.NounsDescriptorV3.address as Address,
    abi: NounsDescriptorV3ABI,
    functionName: 'setBaseURI',
    args: [newBaseURI],
  } as const;
}

/**
 * Prepare toggle data URI enabled transaction
 * Switches between on-chain SVG and external base URI
 * @returns Transaction config for wagmi
 */
export function prepareToggleDataURIEnabled() {
  return {
    address: NOUNS_CONTRACTS.NounsDescriptorV3.address as Address,
    abi: NounsDescriptorV3ABI,
    functionName: 'toggleDataURIEnabled',
  } as const;
}

/**
 * Prepare set art descriptor transaction
 * @param newArtDescriptor - Address of new art descriptor contract
 * @returns Transaction config for wagmi
 */
export function prepareSetArtDescriptor(newArtDescriptor: Address) {
  return {
    address: NOUNS_CONTRACTS.NounsDescriptorV3.address as Address,
    abi: NounsDescriptorV3ABI,
    functionName: 'setArtDescriptor',
    args: [newArtDescriptor],
  } as const;
}

/**
 * Prepare set art inflator transaction
 * @param newInflator - Address of new art inflator contract
 * @returns Transaction config for wagmi
 */
export function prepareSetArtInflator(newInflator: Address) {
  return {
    address: NOUNS_CONTRACTS.NounsDescriptorV3.address as Address,
    abi: NounsDescriptorV3ABI,
    functionName: 'setArtInflator',
    args: [newInflator],
  } as const;
}

/**
 * Prepare set renderer transaction
 * @param newRenderer - Address of new renderer contract
 * @returns Transaction config for wagmi
 */
export function prepareSetRenderer(newRenderer: Address) {
  return {
    address: NOUNS_CONTRACTS.NounsDescriptorV3.address as Address,
    abi: NounsDescriptorV3ABI,
    functionName: 'setRenderer',
    args: [newRenderer],
  } as const;
}

/**
 * Prepare lock parts transaction
 * Permanently locks trait addition (irreversible)
 * @returns Transaction config for wagmi
 */
export function prepareLockParts() {
  return {
    address: NOUNS_CONTRACTS.NounsDescriptorV3.address as Address,
    abi: NounsDescriptorV3ABI,
    functionName: 'lockParts',
  } as const;
}

/**
 * Validate trait data
 * @param traitData - Hex string of trait data
 * @returns Validation result
 */
export function validateTraitData(traitData: string): { valid: boolean; error?: string } {
  if (!traitData.startsWith('0x')) {
    return { valid: false, error: 'Trait data must start with 0x' };
  }
  if (traitData.length < 4) {
    return { valid: false, error: 'Trait data is too short' };
  }
  return { valid: true };
}

/**
 * Validate palette data
 * @param palette - Palette hex string
 * @returns Validation result
 */
export function validatePalette(palette: string): { valid: boolean; error?: string } {
  if (!palette.startsWith('0x')) {
    return { valid: false, error: 'Palette must start with 0x' };
  }
  // Palette should be divisible by 6 (3 bytes per color)
  const colorBytes = (palette.length - 2) / 2;
  if (colorBytes % 3 !== 0) {
    return { valid: false, error: 'Invalid palette format (must be RGB colors)' };
  }
  return { valid: true };
}

/**
 * Validate base URI
 * @param baseURI - Base URI string
 * @returns Validation result
 */
export function validateBaseURI(baseURI: string): { valid: boolean; error?: string } {
  if (!baseURI) {
    return { valid: false, error: 'Base URI cannot be empty' };
  }
  if (!baseURI.startsWith('http://') && 
      !baseURI.startsWith('https://') && 
      !baseURI.startsWith('ipfs://') &&
      !baseURI.startsWith('ar://')) {
    return { valid: false, error: 'Base URI must be a valid URL or IPFS/Arweave path' };
  }
  return { valid: true };
}

/**
 * Helper: Create RGB color hex string
 * @param r - Red (0-255)
 * @param g - Green (0-255)
 * @param b - Blue (0-255)
 * @returns Hex color string
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return toHex(r) + toHex(g) + toHex(b);
}

/**
 * Helper: Create palette from RGB colors
 * @param colors - Array of RGB color objects
 * @returns Palette hex string
 */
export function createPalette(colors: Array<{ r: number; g: number; b: number }>): string {
  return '0x' + colors.map(c => rgbToHex(c.r, c.g, c.b)).join('');
}

