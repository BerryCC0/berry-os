/**
 * Nouns Seeder - Contract Read Functions
 * Direct contract read functions for useReadContract
 */

import { Address } from 'viem';
import { NOUNS_CONTRACTS } from '../../addresses';
import { NounsSeederABI } from '../../abis';

export function generateSeed(nounId: bigint, descriptor: Address) {
  return {
    address: NOUNS_CONTRACTS.NounsSeeder.address as Address,
    abi: NounsSeederABI,
    functionName: 'generateSeed',
    args: [nounId, descriptor]
  } as const;
}

