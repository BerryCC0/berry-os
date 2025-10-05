/**
 * Nouns DAO - Noun Entity Utilities
 * 
 * Pure business logic for Noun NFT operations
 */

import type { Noun, NounSeed, Account } from './types';

// ============================================================================
// Validation
// ============================================================================

/**
 * Checks if object is a valid Noun
 */
export function isValidNoun(noun: any): noun is Noun {
  return Boolean(
    noun &&
    typeof noun.id === 'string' &&
    noun.seed &&
    noun.owner &&
    typeof noun.background === 'number' &&
    typeof noun.body === 'number' &&
    typeof noun.accessory === 'number' &&
    typeof noun.head === 'number' &&
    typeof noun.glasses === 'number'
  );
}

/**
 * Checks if seed is valid
 */
export function isValidSeed(seed: any): seed is NounSeed {
  return Boolean(
    seed &&
    typeof seed.background === 'number' &&
    typeof seed.body === 'number' &&
    typeof seed.accessory === 'number' &&
    typeof seed.head === 'number' &&
    typeof seed.glasses === 'number'
  );
}

// ============================================================================
// Noun Properties
// ============================================================================

/**
 * Gets Noun ID as number
 */
export function getNounIdAsNumber(noun: Noun): number {
  return parseInt(noun.id, 10);
}

/**
 * Gets Noun owner address
 */
export function getNounOwner(noun: Noun): string {
  return noun.owner.id;
}

/**
 * Checks if Noun is owned by address
 */
export function isOwnedBy(noun: Noun, address: string): boolean {
  return noun.owner.id.toLowerCase() === address.toLowerCase();
}

/**
 * Gets Noun traits as object
 */
export function getNounTraits(noun: Noun): {
  background: number;
  body: number;
  accessory: number;
  head: number;
  glasses: number;
} {
  return {
    background: noun.background,
    body: noun.body,
    accessory: noun.accessory,
    head: noun.head,
    glasses: noun.glasses,
  };
}

/**
 * Gets Noun seed
 */
export function getNounSeed(noun: Noun): NounSeed {
  return noun.seed;
}

// ============================================================================
// Seed Operations
// ============================================================================

/**
 * Compares two seeds for equality
 */
export function seedsAreEqual(seed1: NounSeed, seed2: NounSeed): boolean {
  return (
    seed1.background === seed2.background &&
    seed1.body === seed2.body &&
    seed1.accessory === seed2.accessory &&
    seed1.head === seed2.head &&
    seed1.glasses === seed2.glasses
  );
}

/**
 * Finds Nouns with matching trait
 */
export function filterByTrait(
  nouns: Noun[],
  trait: keyof Pick<Noun, 'background' | 'body' | 'accessory' | 'head' | 'glasses'>,
  value: number
): Noun[] {
  return nouns.filter(noun => noun[trait] === value);
}

/**
 * Finds Nouns with matching background
 */
export function filterByBackground(nouns: Noun[], background: number): Noun[] {
  return filterByTrait(nouns, 'background', background);
}

/**
 * Finds Nouns with matching body
 */
export function filterByBody(nouns: Noun[], body: number): Noun[] {
  return filterByTrait(nouns, 'body', body);
}

/**
 * Finds Nouns with matching accessory
 */
export function filterByAccessory(nouns: Noun[], accessory: number): Noun[] {
  return filterByTrait(nouns, 'accessory', accessory);
}

/**
 * Finds Nouns with matching head
 */
export function filterByHead(nouns: Noun[], head: number): Noun[] {
  return filterByTrait(nouns, 'head', head);
}

/**
 * Finds Nouns with matching glasses
 */
export function filterByGlasses(nouns: Noun[], glasses: number): Noun[] {
  return filterByTrait(nouns, 'glasses', glasses);
}

// ============================================================================
// Timestamps & Blocks
// ============================================================================

/**
 * Gets Noun creation timestamp as Date
 */
export function getCreatedDate(noun: Noun): Date {
  return new Date(parseInt(noun.createdAtTimestamp, 10) * 1000);
}

/**
 * Gets Noun creation block number
 */
export function getCreatedBlock(noun: Noun): number {
  return parseInt(noun.createdAtBlockNumber, 10);
}

/**
 * Formats creation date
 */
export function formatCreatedDate(noun: Noun): string {
  return getCreatedDate(noun).toLocaleDateString();
}

/**
 * Gets Noun age in days
 */
export function getNounAge(noun: Noun): number {
  const created = getCreatedDate(noun);
  const now = new Date();
  const diff = now.getTime() - created.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// ============================================================================
// Filtering & Sorting
// ============================================================================

/**
 * Filters Nouns by owner
 */
export function filterByOwner(nouns: Noun[], owner: string): Noun[] {
  const lowerOwner = owner.toLowerCase();
  return nouns.filter(noun => noun.owner.id.toLowerCase() === lowerOwner);
}

/**
 * Filters Nouns by ID range
 */
export function filterByIdRange(
  nouns: Noun[],
  minId: number,
  maxId: number
): Noun[] {
  return nouns.filter(noun => {
    const id = getNounIdAsNumber(noun);
    return id >= minId && id <= maxId;
  });
}

/**
 * Sorts Nouns by ID (ascending)
 */
export function sortByIdAsc(nouns: Noun[]): Noun[] {
  return [...nouns].sort((a, b) => getNounIdAsNumber(a) - getNounIdAsNumber(b));
}

/**
 * Sorts Nouns by ID (descending)
 */
export function sortByIdDesc(nouns: Noun[]): Noun[] {
  return [...nouns].sort((a, b) => getNounIdAsNumber(b) - getNounIdAsNumber(a));
}

/**
 * Sorts Nouns by creation date (newest first)
 */
export function sortByNewest(nouns: Noun[]): Noun[] {
  return [...nouns].sort((a, b) => {
    const timeA = parseInt(a.createdAtTimestamp, 10);
    const timeB = parseInt(b.createdAtTimestamp, 10);
    return timeB - timeA;
  });
}

/**
 * Sorts Nouns by creation date (oldest first)
 */
export function sortByOldest(nouns: Noun[]): Noun[] {
  return [...nouns].sort((a, b) => {
    const timeA = parseInt(a.createdAtTimestamp, 10);
    const timeB = parseInt(b.createdAtTimestamp, 10);
    return timeA - timeB;
  });
}

// ============================================================================
// Trait Analysis
// ============================================================================

/**
 * Gets unique trait values
 */
export function getUniqueTraitValues(
  nouns: Noun[],
  trait: keyof Pick<Noun, 'background' | 'body' | 'accessory' | 'head' | 'glasses'>
): number[] {
  const values = new Set(nouns.map(noun => noun[trait]));
  return Array.from(values).sort((a, b) => a - b);
}

/**
 * Gets trait distribution
 */
export function getTraitDistribution(
  nouns: Noun[],
  trait: keyof Pick<Noun, 'background' | 'body' | 'accessory' | 'head' | 'glasses'>
): Map<number, number> {
  const distribution = new Map<number, number>();
  
  nouns.forEach(noun => {
    const value = noun[trait];
    distribution.set(value, (distribution.get(value) || 0) + 1);
  });
  
  return distribution;
}

/**
 * Gets rarest trait value
 */
export function getRarestTraitValue(
  nouns: Noun[],
  trait: keyof Pick<Noun, 'background' | 'body' | 'accessory' | 'head' | 'glasses'>
): number | null {
  const distribution = getTraitDistribution(nouns, trait);
  let rarest: number | null = null;
  let minCount = Infinity;
  
  distribution.forEach((count, value) => {
    if (count < minCount) {
      minCount = count;
      rarest = value;
    }
  });
  
  return rarest;
}

/**
 * Gets most common trait value
 */
export function getMostCommonTraitValue(
  nouns: Noun[],
  trait: keyof Pick<Noun, 'background' | 'body' | 'accessory' | 'head' | 'glasses'>
): number | null {
  const distribution = getTraitDistribution(nouns, trait);
  let mostCommon: number | null = null;
  let maxCount = 0;
  
  distribution.forEach((count, value) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommon = value;
    }
  });
  
  return mostCommon;
}

/**
 * Calculates trait rarity score (0-100, higher = rarer)
 */
export function getTraitRarityScore(
  noun: Noun,
  allNouns: Noun[],
  trait: keyof Pick<Noun, 'background' | 'body' | 'accessory' | 'head' | 'glasses'>
): number {
  const distribution = getTraitDistribution(allNouns, trait);
  const traitValue = noun[trait];
  const count = distribution.get(traitValue) || 0;
  const total = allNouns.length;
  
  if (total === 0) return 0;
  
  const frequency = count / total;
  return Math.round((1 - frequency) * 100);
}

/**
 * Calculates overall rarity score (average of all traits)
 */
export function getOverallRarityScore(noun: Noun, allNouns: Noun[]): number {
  const traits: Array<keyof Pick<Noun, 'background' | 'body' | 'accessory' | 'head' | 'glasses'>> = [
    'background',
    'body',
    'accessory',
    'head',
    'glasses',
  ];
  
  const scores = traits.map(trait => getTraitRarityScore(noun, allNouns, trait));
  const sum = scores.reduce((acc, score) => acc + score, 0);
  
  return Math.round(sum / traits.length);
}

// ============================================================================
// Search & Lookup
// ============================================================================

/**
 * Finds Noun by ID
 */
export function findNounById(nouns: Noun[], id: string | number): Noun | undefined {
  const searchId = typeof id === 'number' ? id.toString() : id;
  return nouns.find(noun => noun.id === searchId);
}

/**
 * Finds Nouns with similar traits (at least N matching traits)
 */
export function findSimilarNouns(
  noun: Noun,
  allNouns: Noun[],
  minMatchingTraits: number = 3
): Noun[] {
  return allNouns.filter(n => {
    if (n.id === noun.id) return false;
    
    let matches = 0;
    if (n.background === noun.background) matches++;
    if (n.body === noun.body) matches++;
    if (n.accessory === noun.accessory) matches++;
    if (n.head === noun.head) matches++;
    if (n.glasses === noun.glasses) matches++;
    
    return matches >= minMatchingTraits;
  });
}

// ============================================================================
// Display & Formatting
// ============================================================================

/**
 * Formats Noun display name
 */
export function getNounDisplayName(noun: Noun): string {
  return `Noun ${noun.id}`;
}

/**
 * Gets Noun image URL (from official CDN)
 */
export function getNounImageUrl(noun: Noun): string {
  return `https://noun.pics/${noun.id}`;
}

/**
 * Gets Noun OpenSea URL
 */
export function getNounOpenSeaUrl(noun: Noun): string {
  return `https://opensea.io/assets/ethereum/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03/${noun.id}`;
}

/**
 * Gets Noun Nouns.wtf URL
 */
export function getNounNounsWtfUrl(noun: Noun): string {
  return `https://nouns.wtf/noun/${noun.id}`;
}

/**
 * Gets Noun summary
 */
export function getNounSummary(noun: Noun): string {
  return `${getNounDisplayName(noun)} - Owned by ${noun.owner.id.slice(0, 6)}...${noun.owner.id.slice(-4)}`;
}

