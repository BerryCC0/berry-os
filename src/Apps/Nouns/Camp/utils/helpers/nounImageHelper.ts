/**
 * Noun Image Helper
 * Generate Noun SVG thumbnails for vote displays
 */

import { buildSVG } from '@/app/lib/Nouns/utils/svg-builder';
import { ImageData } from '@/app/lib/Nouns/utils/image-data';
import type { Noun, Vote } from '@/app/lib/Nouns/Goldsky/utils/types';

interface NounTraits {
  background: number;
  body: number;
  accessory: number;
  head: number;
  glasses: number;
}

/**
 * Generate Noun SVG from traits
 */
export function generateNounSVG(traits: NounTraits): string {
  try {
    const { background, body, accessory, head, glasses } = traits;
    
    // Get background color
    const bgColor = ImageData.bgcolors[background];
    
    // Get image parts
    const parts = [
      { data: ImageData.images.bodies[body].data },
      { data: ImageData.images.accessories[accessory].data },
      { data: ImageData.images.heads[head].data },
      { data: ImageData.images.glasses[glasses].data },
    ];
    
    // Build SVG
    const svg = buildSVG(parts, ImageData.palette, bgColor);
    
    return svg;
  } catch (error) {
    console.error('Error generating Noun SVG:', error);
    return generatePlaceholderSVG();
  }
}

/**
 * Generate placeholder SVG when Noun data is unavailable
 */
export function generatePlaceholderSVG(): string {
  return `<svg width="320" height="320" viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#D5D7E1"/>
    <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#000000" font-family="Chicago, monospace" font-size="48">⌐◨-◨</text>
  </svg>`;
}

/**
 * Get Nouns used in a vote
 */
export function getNounsForVote(vote: Vote): Noun[] {
  return vote.nouns || [];
}

/**
 * Get Noun traits from Noun object
 * Traits are stored in the seed object
 */
export function getNounTraits(noun: Noun): NounTraits | null {
  try {
    if (!noun.seed) {
      console.warn('Noun has no seed data:', noun.id);
      return null;
    }
    
    return {
      background: noun.seed.background ? parseInt(noun.seed.background.toString()) : 0,
      body: noun.seed.body ? parseInt(noun.seed.body.toString()) : 0,
      accessory: noun.seed.accessory ? parseInt(noun.seed.accessory.toString()) : 0,
      head: noun.seed.head ? parseInt(noun.seed.head.toString()) : 0,
      glasses: noun.seed.glasses ? parseInt(noun.seed.glasses.toString()) : 0,
    };
  } catch (error) {
    console.error('Error extracting Noun traits:', error, noun);
    return null;
  }
}

/**
 * Generate SVG data URL for use in img src
 */
export function generateNounDataURL(traits: NounTraits): string {
  const svg = generateNounSVG(traits);
  const encoded = encodeURIComponent(svg);
  return `data:image/svg+xml,${encoded}`;
}

/**
 * Get Noun thumbnail data for vote display
 */
export interface NounThumbnail {
  id: string;
  svg: string;
  dataURL: string;
}

export function getNounThumbnails(vote: Vote, maxCount: number = 3): {
  thumbnails: NounThumbnail[];
  additionalCount: number;
} {
  const nouns = getNounsForVote(vote);
  const displayNouns = nouns.slice(0, maxCount);
  const additionalCount = Math.max(0, nouns.length - maxCount);
  
  const thumbnails = displayNouns.map(noun => {
    const traits = getNounTraits(noun);
    if (!traits) {
      return {
        id: noun.id,
        svg: generatePlaceholderSVG(),
        dataURL: `data:image/svg+xml,${encodeURIComponent(generatePlaceholderSVG())}`,
      };
    }
    
    const svg = generateNounSVG(traits);
    return {
      id: noun.id,
      svg,
      dataURL: generateNounDataURL(traits),
    };
  });
  
  return {
    thumbnails,
    additionalCount,
  };
}

