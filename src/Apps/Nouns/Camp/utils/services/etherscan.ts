/**
 * Etherscan Service
 * 
 * Fetches contract information from Etherscan via our server-side API route
 * Keeps API key secure by proxying through Next.js API
 */

import { registerABI } from '../helpers/abiRegistry';

export interface ContractInfo {
  name: string;
  abi: any[] | null;
  isVerified: boolean;
}

// Client-side cache
const contractCache = new Map<string, ContractInfo>();

// In-flight requests to prevent duplicate fetches
const pendingRequests = new Map<string, Promise<ContractInfo | null>>();

/**
 * Fetch contract information from Etherscan via our API route
 */
export async function fetchContractInfo(address: string): Promise<ContractInfo | null> {
  const lowerAddress = address.toLowerCase();
  
  // Check cache first
  if (contractCache.has(lowerAddress)) {
    return contractCache.get(lowerAddress)!;
  }
  
  // Check if already fetching
  if (pendingRequests.has(lowerAddress)) {
    return pendingRequests.get(lowerAddress)!;
  }
  
  // Start fetching
  const fetchPromise = (async () => {
    try {
      const response = await fetch(`/api/etherscan/contract?address=${address}`);
      
      if (!response.ok) {
        console.error(`Etherscan API error: ${response.status}`);
        return null;
      }
      
      const data: ContractInfo = await response.json();
      
      // Cache the result
      contractCache.set(lowerAddress, data);
      
      // If we got an ABI, register it in the ABI registry
      if (data.abi && data.isVerified) {
        registerABI(address, data.name, `Verified contract: ${data.name}`, data.abi, 'external');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching contract info:', error);
      return null;
    } finally {
      // Clean up pending request
      pendingRequests.delete(lowerAddress);
    }
  })();
  
  pendingRequests.set(lowerAddress, fetchPromise);
  return fetchPromise;
}

/**
 * Batch fetch multiple contracts
 */
export async function fetchMultipleContracts(addresses: string[]): Promise<Map<string, ContractInfo | null>> {
  const results = new Map<string, ContractInfo | null>();
  
  // Fetch all contracts in parallel
  const promises = addresses.map(async (address) => {
    const info = await fetchContractInfo(address);
    results.set(address.toLowerCase(), info);
  });
  
  await Promise.all(promises);
  
  return results;
}

/**
 * Check if contract is verified on Etherscan
 */
export async function isContractVerified(address: string): Promise<boolean> {
  const info = await fetchContractInfo(address);
  return info?.isVerified || false;
}

/**
 * Get contract name from Etherscan
 */
export async function getContractName(address: string): Promise<string> {
  const info = await fetchContractInfo(address);
  return info?.name || 'Unknown';
}

/**
 * Clear cache
 */
export function clearCache(): void {
  contractCache.clear();
  pendingRequests.clear();
}

/**
 * Get cache size
 */
export function getCacheSize(): number {
  return contractCache.size;
}

/**
 * Get cached contract info (without fetching)
 */
export function getCachedContractInfo(address: string): ContractInfo | null {
  return contractCache.get(address.toLowerCase()) || null;
}



