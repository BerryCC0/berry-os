/**
 * Nouns Seeder Helpers
 * Complete utilities for interacting with the Nouns Seeder
 */

export * from './contract-reads';

export { NounsSeederABI } from '../../abis';
export { NOUNS_CONTRACTS } from '../../addresses';

import { Address } from 'viem';
import { NOUNS_CONTRACTS as CONTRACTS } from '../../addresses';

export function getSeederAddress(): Address {
  return CONTRACTS.NounsSeeder.address as Address;
}

