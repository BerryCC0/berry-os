/**
 * Nouns DAO Integration - Main Export
 * 
 * Complete integration with Nouns DAO:
 * - Goldsky: Subgraph queries for historical data
 * - Contracts: Smart contract interactions for live data & transactions
 */

// Goldsky Subgraph Integration
export * as Goldsky from './Goldsky';

// Smart Contracts Integration
export * as Contracts from './Contracts';

// Convenience re-exports for common use
export {
  // Goldsky
  NounsApolloWrapper,
  GET_CURRENT_AUCTION,
  GET_PROPOSALS,
  GET_NOUNS,
} from './Goldsky';

export {
  // Contracts
  NOUNS_CONTRACTS,
  getContractAddress,
} from './Contracts';

/**
 * @example
 * // Subgraph queries (Goldsky)
 * import { Goldsky } from '@/app/lib/Nouns';
 * const { data } = useQuery(Goldsky.GET_CURRENT_AUCTION);
 * 
 * // Contract interactions (ABIs available, helpers coming soon)
 * import { Contracts } from '@/app/lib/Nouns';
 * import { useReadContract } from 'wagmi';
 * 
 * const { data } = useReadContract({
 *   address: Contracts.getContractAddress('NounsToken'),
 *   abi: Contracts.NounsTokenABI,
 *   functionName: 'ownerOf',
 *   args: [BigInt(1)],
 * });
 */
