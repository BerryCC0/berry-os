/**
 * Batch ENS Resolution Hook
 * 
 * Efficiently resolves ENS names for multiple addresses in parallel
 * with caching and error handling
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { usePublicClient } from 'wagmi';
import { normalize } from 'viem/ens';

export interface ENSResult {
  address: string;
  ensName: string | null;
  isLoading: boolean;
  error: Error | null;
}

export interface BatchENSResult {
  ensMap: Map<string, string | null>;
  isLoading: boolean;
  progress: number; // 0-1
  errors: Map<string, Error>;
}

/**
 * In-memory cache for ENS names
 * Shared across all component instances
 */
const ensCache = new Map<string, string | null>();
const pendingResolutions = new Map<string, Promise<string | null>>();

/**
 * Resolve ENS name for a single address with caching
 */
async function resolveENS(
  address: string,
  publicClient: any
): Promise<string | null> {
  const lowerAddress = address.toLowerCase();
  
  // Check cache first
  if (ensCache.has(lowerAddress)) {
    return ensCache.get(lowerAddress)!;
  }
  
  // Check if already resolving
  if (pendingResolutions.has(lowerAddress)) {
    return pendingResolutions.get(lowerAddress)!;
  }
  
  // Start new resolution
  const promise = (async () => {
    try {
      const ensName = await publicClient.getEnsName({
        address: address as `0x${string}`,
      });
      
      // Cache the result (including null)
      ensCache.set(lowerAddress, ensName);
      return ensName;
    } catch (error) {
      // Cache null on error
      ensCache.set(lowerAddress, null);
      return null;
    } finally {
      // Clean up pending resolution
      pendingResolutions.delete(lowerAddress);
    }
  })();
  
  pendingResolutions.set(lowerAddress, promise);
  return promise;
}

/**
 * Hook to batch resolve ENS names for multiple addresses
 * 
 * @param addresses - Array of Ethereum addresses to resolve
 * @param options - Configuration options
 * @returns ENS resolution results with loading state
 * 
 * @example
 * const addresses = ['0x1234...', '0x5678...'];
 * const { ensMap, isLoading, progress } = useBatchENS(addresses);
 * 
 * // Access resolved names
 * const name = ensMap.get('0x1234...'.toLowerCase());
 */
export function useBatchENS(
  addresses: string[],
  options: {
    enabled?: boolean;
    batchSize?: number;
    delayMs?: number;
  } = {}
): BatchENSResult {
  const {
    enabled = true,
    batchSize = 5, // Resolve 5 at a time
    delayMs = 100, // 100ms delay between batches
  } = options;
  
  const publicClient = usePublicClient();
  const [ensMap, setEnsMap] = useState<Map<string, string | null>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<Map<string, Error>>(new Map());
  
  // Track which addresses we've started resolving
  const resolvedAddresses = useRef<Set<string>>(new Set());
  
  // Track previous addresses to detect changes
  const prevAddressesRef = useRef<string>('');
  const addressesKey = JSON.stringify([...new Set(addresses.map(a => a.toLowerCase()))].sort());
  
  // Only trigger effect if addresses actually changed
  const addressesChanged = prevAddressesRef.current !== addressesKey;
  if (addressesChanged) {
    prevAddressesRef.current = addressesKey;
  }
  
  useEffect(() => {
    if (!addressesChanged) {
      return;
    }
    if (!enabled || !publicClient || addresses.length === 0) {
      setIsLoading(false);
      setProgress(1);
      return;
    }
    
    // Filter out addresses we've already resolved
    const uniqueAddresses = [...new Set(addresses.map(a => a.toLowerCase()))];
    const newAddresses = uniqueAddresses.filter(
      addr => !resolvedAddresses.current.has(addr)
    );
    
    if (newAddresses.length === 0) {
      // All addresses already resolved, just populate map from cache
      setEnsMap(prev => {
        // Only update if there are changes
        let hasChanges = false;
        const newMap = new Map(prev);
        
        uniqueAddresses.forEach(addr => {
          if (ensCache.has(addr)) {
            const cachedValue = ensCache.get(addr)!;
            if (newMap.get(addr) !== cachedValue) {
              newMap.set(addr, cachedValue);
              hasChanges = true;
            }
          }
        });
        
        return hasChanges ? newMap : prev;
      });
      setIsLoading(false);
      setProgress(1);
      return;
    }
    
    // Start resolving
    setIsLoading(true);
    
    let resolved = 0;
    const total = newAddresses.length;
    
    // Process in batches
    const processBatch = async (batch: string[]) => {
      const results = await Promise.allSettled(
        batch.map(addr => resolveENS(addr, publicClient))
      );
      
      // Update map and errors
      setEnsMap(prev => {
        const newMap = new Map(prev);
        batch.forEach((addr, idx) => {
          const result = results[idx];
          if (result.status === 'fulfilled') {
            newMap.set(addr, result.value);
            resolvedAddresses.current.add(addr);
          } else {
            newMap.set(addr, null);
            setErrors(prevErrors => {
              const newErrors = new Map(prevErrors);
              newErrors.set(addr, result.reason);
              return newErrors;
            });
          }
        });
        return newMap;
      });
      
      resolved += batch.length;
      setProgress(resolved / total);
    };
    
    // Process all batches sequentially with delay
    (async () => {
      for (let i = 0; i < newAddresses.length; i += batchSize) {
        const batch = newAddresses.slice(i, i + batchSize);
        await processBatch(batch);
        
        // Delay between batches (except for last batch)
        if (i + batchSize < newAddresses.length) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
      
      setIsLoading(false);
      setProgress(1);
    })();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressesKey, enabled, publicClient, batchSize, delayMs]);
  
  return {
    ensMap,
    isLoading,
    progress,
    errors,
  };
}

/**
 * Clear ENS cache (useful for testing or forced refresh)
 */
export function clearENSCache(): void {
  ensCache.clear();
  pendingResolutions.clear();
}

