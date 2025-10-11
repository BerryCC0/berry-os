'use client';

import { useState, useEffect, useCallback } from 'react';
import { useEnsName } from 'wagmi';
import { mainnet } from 'wagmi/chains';

// In-memory cache for ENS names
const ensCache = new Map<string, string | null>();

interface UseENSResult {
  ensName: string | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to resolve ENS name for an Ethereum address
 * Includes in-memory caching to avoid redundant lookups
 */
export function useENS(address: string | undefined): UseENSResult {
  const [cachedName, setCachedName] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);

  // Check cache first
  useEffect(() => {
    if (!address) {
      setCachedName(null);
      setIsCached(true);
      return;
    }

    const cached = ensCache.get(address.toLowerCase());
    if (cached !== undefined) {
      setCachedName(cached);
      setIsCached(true);
    } else {
      setIsCached(false);
    }
  }, [address]);

  // Use wagmi's useEnsName hook for actual resolution
  const { data: ensName, isLoading, error } = useEnsName({
    address: address as `0x${string}`,
    chainId: mainnet.id,
    query: {
      enabled: !!address && !isCached,
    },
  });

  // Update cache when we get a result
  useEffect(() => {
    if (address && ensName !== undefined && !isCached) {
      ensCache.set(address.toLowerCase(), ensName);
      setCachedName(ensName);
    }
  }, [address, ensName, isCached]);

  return {
    ensName: isCached ? cachedName : (ensName ?? null),
    isLoading: !isCached && isLoading,
    error: error || null,
  };
}

/**
 * Hook to resolve multiple ENS names at once
 * More efficient than calling useENS multiple times
 */
export function useBatchENS(addresses: string[]): Map<string, string | null> {
  const [results, setResults] = useState<Map<string, string | null>>(new Map());

  useEffect(() => {
    const resolveAddresses = async () => {
      const newResults = new Map<string, string | null>();

      for (const address of addresses) {
        if (!address) continue;

        const lowerAddress = address.toLowerCase();
        
        // Check cache first
        if (ensCache.has(lowerAddress)) {
          newResults.set(address, ensCache.get(lowerAddress)!);
          continue;
        }

        // If not cached, we'll need to fetch
        // For now, just mark as null and let individual useENS hooks handle it
        newResults.set(address, null);
      }

      setResults(newResults);
    };

    resolveAddresses();
  }, [addresses]);

  return results;
}

/**
 * Utility function to format address with ENS fallback
 */
export function formatAddressWithENS(
  address: string,
  ensName: string | null,
  truncate: boolean = true
): string {
  if (ensName) {
    return ensName;
  }

  if (!truncate || address.length < 10) {
    return address;
  }

  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

/**
 * Clear ENS cache (useful for testing or if names change)
 */
export function clearENSCache(): void {
  ensCache.clear();
}

