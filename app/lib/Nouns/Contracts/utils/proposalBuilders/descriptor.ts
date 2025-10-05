/**
 * Proposal Transaction Builders - Descriptor Operations
 * Build proposal actions for Nouns artwork and trait management
 */

import { Address } from 'viem';
import { CONTRACTS } from '../constants';
import type { ProposalActions } from '../types';
import { createProposalAction } from '../governance';

/**
 * Build proposal action to set descriptor renderer
 * @param newRenderer - Address of new SVG renderer
 * @returns Proposal action for setting renderer
 */
export function buildSetRendererAction(
  newRenderer: Address
): ProposalActions {
  return createProposalAction(
    CONTRACTS.NounsDescriptorV3.address as Address,
    BigInt(0),
    'setRenderer(address)',
    [newRenderer]
  );
}

/**
 * Build proposal action to set descriptor art contract
 * @param newArt - Address of new art contract
 * @returns Proposal action for setting art
 */
export function buildSetArtAction(
  newArt: Address
): ProposalActions {
  return createProposalAction(
    CONTRACTS.NounsDescriptorV3.address as Address,
    BigInt(0),
    'setArt(address)',
    [newArt]
  );
}

/**
 * Build proposal action to set art descriptor
 * @param newArtDescriptor - Address of new art descriptor
 * @returns Proposal action for setting art descriptor
 */
export function buildSetArtDescriptorAction(
  newArtDescriptor: Address
): ProposalActions {
  return createProposalAction(
    CONTRACTS.NounsDescriptorV3.address as Address,
    BigInt(0),
    'setArtDescriptor(address)',
    [newArtDescriptor]
  );
}

/**
 * Build proposal action to set art inflator
 * @param newInflator - Address of new inflator
 * @returns Proposal action for setting inflator
 */
export function buildSetArtInflatorAction(
  newInflator: Address
): ProposalActions {
  return createProposalAction(
    CONTRACTS.NounsDescriptorV3.address as Address,
    BigInt(0),
    'setArtInflator(address)',
    [newInflator]
  );
}

/**
 * Build proposal action to add background
 * @param background - Background color/value
 * @returns Proposal action for adding background
 */
export function buildAddBackgroundAction(
  background: string
): ProposalActions {
  return createProposalAction(
    CONTRACTS.NounsDescriptorV3.address as Address,
    BigInt(0),
    'addBackground(string)',
    [background]
  );
}

/**
 * Build proposal action to add multiple backgrounds
 * @param backgrounds - Array of background values
 * @returns Proposal action for adding backgrounds
 */
export function buildAddManyBackgroundsAction(
  backgrounds: string[]
): ProposalActions {
  return createProposalAction(
    CONTRACTS.NounsDescriptorV3.address as Address,
    BigInt(0),
    'addManyBackgrounds(string[])',
    [backgrounds]
  );
}

/**
 * Build proposal action to add bodies from pointer
 * @param pointer - Address of storage pointer
 * @param decompressedLength - Decompressed data length
 * @param imageCount - Number of images
 * @returns Proposal action for adding bodies
 */
export function buildAddBodiesFromPointerAction(
  pointer: Address,
  decompressedLength: bigint,
  imageCount: number
): ProposalActions {
  return createProposalAction(
    CONTRACTS.NounsDescriptorV3.address as Address,
    BigInt(0),
    'addBodiesFromPointer(address,uint80,uint16)',
    [pointer, decompressedLength, imageCount]
  );
}

/**
 * Build proposal action to add accessories from pointer
 * @param pointer - Address of storage pointer
 * @param decompressedLength - Decompressed data length
 * @param imageCount - Number of images
 * @returns Proposal action for adding accessories
 */
export function buildAddAccessoriesFromPointerAction(
  pointer: Address,
  decompressedLength: bigint,
  imageCount: number
): ProposalActions {
  return createProposalAction(
    CONTRACTS.NounsDescriptorV3.address as Address,
    BigInt(0),
    'addAccessoriesFromPointer(address,uint80,uint16)',
    [pointer, decompressedLength, imageCount]
  );
}

/**
 * Build proposal action to add heads from pointer
 * @param pointer - Address of storage pointer
 * @param decompressedLength - Decompressed data length
 * @param imageCount - Number of images
 * @returns Proposal action for adding heads
 */
export function buildAddHeadsFromPointerAction(
  pointer: Address,
  decompressedLength: bigint,
  imageCount: number
): ProposalActions {
  return createProposalAction(
    CONTRACTS.NounsDescriptorV3.address as Address,
    BigInt(0),
    'addHeadsFromPointer(address,uint80,uint16)',
    [pointer, decompressedLength, imageCount]
  );
}

/**
 * Build proposal action to add glasses from pointer
 * @param pointer - Address of storage pointer
 * @param decompressedLength - Decompressed data length
 * @param imageCount - Number of images
 * @returns Proposal action for adding glasses
 */
export function buildAddGlassesFromPointerAction(
  pointer: Address,
  decompressedLength: bigint,
  imageCount: number
): ProposalActions {
  return createProposalAction(
    CONTRACTS.NounsDescriptorV3.address as Address,
    BigInt(0),
    'addGlassesFromPointer(address,uint80,uint16)',
    [pointer, decompressedLength, imageCount]
  );
}

/**
 * Build proposal action to set palette
 * @param paletteIndex - Index of palette (0-based)
 * @param palette - Palette data as bytes
 * @returns Proposal action for setting palette
 */
export function buildSetPaletteAction(
  paletteIndex: number,
  palette: `0x${string}`
): ProposalActions {
  return createProposalAction(
    CONTRACTS.NounsDescriptorV3.address as Address,
    BigInt(0),
    'setPalette(uint8,bytes)',
    [paletteIndex, palette]
  );
}

/**
 * Build proposal action to set palette pointer
 * @param paletteIndex - Index of palette
 * @param pointer - Address of palette storage pointer
 * @returns Proposal action for setting palette pointer
 */
export function buildSetPalettePointerAction(
  paletteIndex: number,
  pointer: Address
): ProposalActions {
  return createProposalAction(
    CONTRACTS.NounsDescriptorV3.address as Address,
    BigInt(0),
    'setPalettePointer(uint8,address)',
    [paletteIndex, pointer]
  );
}

/**
 * Build proposal action to lock parts (irreversible!)
 * @returns Proposal action to lock all trait parts
 */
export function buildLockPartsAction(): ProposalActions {
  return createProposalAction(
    CONTRACTS.NounsDescriptorV3.address as Address,
    BigInt(0),
    'lockParts()',
    []
  );
}

/**
 * Build proposal action to toggle data URI enabled
 * @returns Proposal action to toggle data URI
 */
export function buildToggleDataURIAction(): ProposalActions {
  return createProposalAction(
    CONTRACTS.NounsDescriptorV3.address as Address,
    BigInt(0),
    'toggleDataURIEnabled()',
    []
  );
}

/**
 * Build proposal action to set base URI
 * @param baseURI - New base URI for metadata
 * @returns Proposal action for setting base URI
 */
export function buildSetBaseURIAction(
  baseURI: string
): ProposalActions {
  return createProposalAction(
    CONTRACTS.NounsDescriptorV3.address as Address,
    BigInt(0),
    'setBaseURI(string)',
    [baseURI]
  );
}

