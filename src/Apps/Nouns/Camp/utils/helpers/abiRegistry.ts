/**
 * ABI Registry
 * 
 * Central registry of all Nouns contract ABIs with ethers Interface
 * for complete ABI decoding support
 */

import { Interface, type Fragment } from 'ethers';
import {
  NounsTokenABI,
  NounsDAOLogicV3ABI,
  DataProxyABI,
  ClientRewardsABI,
  TreasuryTimelockABI,
  PayerABI,
  TokenBuyerABI,
  StreamFactoryABI,
  NounsAuctionHouseABI,
  NounsDescriptorV3ABI,
  NounsSeederABI,
  ForkEscrowABI,
  ForkDAODeployerABI,
  NounsTreasuryV1ABI,
} from '@/app/lib/Nouns/Contracts/abis';
import { NOUNS_CONTRACTS, EXTERNAL_CONTRACTS } from '@/app/lib/Nouns/Contracts/utils/addresses';

export interface ABIEntry {
  address: string;
  name: string;
  description: string;
  interface: Interface;
  category: 'nouns' | 'external' | 'unknown';
}

/**
 * Global ABI registry
 */
export const ABI_REGISTRY = new Map<string, ABIEntry>();

/**
 * Map contract keys to their ABIs
 */
const NOUNS_ABI_MAP: Record<string, any> = {
  NounsToken: NounsTokenABI,
  NounsDAOProxy: NounsDAOLogicV3ABI,
  NounsDAODataProxy: DataProxyABI,
  ClientRewardsProxy: ClientRewardsABI,
  NounsTreasury: TreasuryTimelockABI,
  Payer: PayerABI,
  TokenBuyer: TokenBuyerABI,
  StreamFactory: StreamFactoryABI,
  NounsAuctionHouse: NounsAuctionHouseABI,
  NounsDescriptorV3: NounsDescriptorV3ABI,
  NounsSeeder: NounsSeederABI,
  ForkEscrow: ForkEscrowABI,
  ForkDAODeployer: ForkDAODeployerABI,
  NounsTreasuryV1: NounsTreasuryV1ABI,
};

/**
 * Initialize the ABI registry with all Nouns contracts
 */
function initializeRegistry() {
  // Register all Nouns contracts
  Object.entries(NOUNS_ABI_MAP).forEach(([contractKey, abi]) => {
    const config = NOUNS_CONTRACTS[contractKey as keyof typeof NOUNS_CONTRACTS];
    if (!config) {
      console.warn(`No config found for contract: ${contractKey}`);
      return;
    }
    
    const address = ('proxy' in config ? config.proxy : config.address).toLowerCase();
    
    try {
      ABI_REGISTRY.set(address, {
        address,
        name: contractKey.replace(/([A-Z])/g, ' $1').trim(),
        description: config.description,
        interface: new Interface(abi),
        category: 'nouns',
      });
    } catch (error) {
      console.error(`Error creating Interface for ${contractKey}:`, error);
    }
  });
  
  // Add external contracts (without ABIs for now - can be fetched via Etherscan)
  Object.entries(EXTERNAL_CONTRACTS).forEach(([key, config]) => {
    const address = config.address.toLowerCase();
    
    // For common ERC20s, we can add basic ABI
    if (key === 'USDC' || key === 'WETH') {
      const erc20ABI = [
        'function transfer(address to, uint256 amount) returns (bool)',
        'function approve(address spender, uint256 amount) returns (bool)',
        'function balanceOf(address account) view returns (uint256)',
        'function allowance(address owner, address spender) view returns (uint256)',
      ];
      
      try {
        ABI_REGISTRY.set(address, {
          address,
          name: key,
          description: config.description,
          interface: new Interface(erc20ABI),
          category: 'external',
        });
      } catch (error) {
        console.error(`Error creating Interface for ${key}:`, error);
      }
    }
  });
}

// Initialize on module load
initializeRegistry();

/**
 * Get ABI entry for a contract address
 */
export function getABIForAddress(address: string): ABIEntry | null {
  return ABI_REGISTRY.get(address.toLowerCase()) || null;
}

/**
 * Get function fragment from ABI by signature
 */
export function getFunctionFragment(address: string, signature: string): Fragment | null {
  const abiEntry = getABIForAddress(address);
  if (!abiEntry) return null;
  
  try {
    // Try to get function by signature (e.g., "transfer(address,uint256)")
    const fragment = abiEntry.interface.getFunction(signature);
    return fragment;
  } catch (error) {
    // Function not found in ABI
    return null;
  }
}

/**
 * Register a new ABI entry (for dynamically loaded ABIs from Etherscan)
 */
export function registerABI(
  address: string,
  name: string,
  description: string,
  abi: any[],
  category: 'external' | 'unknown' = 'external'
): void {
  const lowerAddress = address.toLowerCase();
  
  try {
    ABI_REGISTRY.set(lowerAddress, {
      address: lowerAddress,
      name,
      description,
      interface: new Interface(abi),
      category,
    });
  } catch (error) {
    console.error(`Error registering ABI for ${address}:`, error);
  }
}

/**
 * Check if address has ABI registered
 */
export function hasABI(address: string): boolean {
  return ABI_REGISTRY.has(address.toLowerCase());
}

/**
 * Get all registered contract addresses
 */
export function getAllRegisteredAddresses(): string[] {
  return Array.from(ABI_REGISTRY.keys());
}

/**
 * Get registry size
 */
export function getRegistrySize(): number {
  return ABI_REGISTRY.size;
}

/**
 * Clear external/unknown ABIs (keeps Nouns ABIs)
 */
export function clearExternalABIs(): void {
  const toRemove: string[] = [];
  
  ABI_REGISTRY.forEach((entry, address) => {
    if (entry.category !== 'nouns') {
      toRemove.push(address);
    }
  });
  
  toRemove.forEach(address => ABI_REGISTRY.delete(address));
}



