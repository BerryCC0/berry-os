/**
 * useTreasuryBalances Hook
 * Fetches and caches Nouns DAO treasury balances for ETH and ERC20 tokens
 */

import { useState, useEffect, useCallback } from 'react';
import { Address } from 'viem';
import { usePublicClient } from 'wagmi';
import { TREASURY_ADDRESS, COMMON_TOKENS, TokenInfo } from '../actionTemplates';

interface TreasuryBalances {
  eth: bigint | null;
  tokens: TokenInfo[];
  isLoading: boolean;
  error: string | null;
}

// ERC20 ABI for balanceOf
const ERC20_BALANCE_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'symbol',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
] as const;

/**
 * Hook to fetch treasury balances for common tokens
 */
export function useTreasuryBalances() {
  const publicClient = usePublicClient();
  const [balances, setBalances] = useState<TreasuryBalances>({
    eth: null,
    tokens: [],
    isLoading: true,
    error: null,
  });

  const fetchBalances = useCallback(async () => {
    if (!publicClient) return;

    setBalances(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Fetch ETH balance
      const ethBalance = await publicClient.getBalance({
        address: TREASURY_ADDRESS,
      });

      // Fetch ERC20 balances for common tokens
      const tokenBalancePromises = COMMON_TOKENS.map(async (token) => {
        try {
          const balance = await publicClient.readContract({
            address: token.address,
            abi: ERC20_BALANCE_ABI,
            functionName: 'balanceOf',
            args: [TREASURY_ADDRESS],
          });

          return {
            ...token,
            balance: balance as bigint,
          };
        } catch (error) {
          console.error(`Failed to fetch balance for ${token.symbol}:`, error);
          return {
            ...token,
            balance: BigInt(0),
          };
        }
      });

      const tokensWithBalances = await Promise.all(tokenBalancePromises);

      // Filter out tokens with zero balance (optional: keep all for transparency)
      const nonZeroTokens = tokensWithBalances.filter(token => token.balance && token.balance > BigInt(0));

      setBalances({
        eth: ethBalance,
        tokens: nonZeroTokens.length > 0 ? nonZeroTokens : tokensWithBalances, // Show all if none have balance
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Failed to fetch treasury balances:', error);
      setBalances(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch balances',
      }));
    }
  }, [publicClient]);

  // Fetch balances on mount
  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  return {
    ...balances,
    refetch: fetchBalances,
  };
}

/**
 * Hook to fetch balance for a custom token address
 */
export function useCustomTokenBalance(tokenAddress: Address | null) {
  const publicClient = usePublicClient();
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tokenAddress || !publicClient) {
      setTokenInfo(null);
      return;
    }

    const fetchTokenInfo = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch token metadata and balance in parallel
        const [symbol, decimals, balance] = await Promise.all([
          publicClient.readContract({
            address: tokenAddress,
            abi: ERC20_BALANCE_ABI,
            functionName: 'symbol',
          }),
          publicClient.readContract({
            address: tokenAddress,
            abi: ERC20_BALANCE_ABI,
            functionName: 'decimals',
          }),
          publicClient.readContract({
            address: tokenAddress,
            abi: ERC20_BALANCE_ABI,
            functionName: 'balanceOf',
            args: [TREASURY_ADDRESS],
          }),
        ]);

        setTokenInfo({
          symbol: symbol as string,
          address: tokenAddress,
          decimals: Number(decimals),
          balance: balance as bigint,
        });
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch custom token info:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch token info');
        setIsLoading(false);
      }
    };

    fetchTokenInfo();
  }, [tokenAddress, publicClient]);

  return {
    tokenInfo,
    isLoading,
    error,
  };
}

