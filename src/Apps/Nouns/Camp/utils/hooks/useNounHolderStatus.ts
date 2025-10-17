/**
 * useNounHolderStatus Hook
 * Check if user has Nouns or delegated voting power
 */

'use client';

import { useAccount, useReadContract } from 'wagmi';
import { NOUNS_CONTRACTS } from '@/app/lib/Nouns/Contracts/utils/addresses';
import { NounsTokenABI } from '@/app/lib/Nouns/Contracts/abis';

export function useNounHolderStatus() {
  const { address } = useAccount();
  
  // Check if user has any Nouns or delegated votes
  const { data: votes } = useReadContract({
    address: NOUNS_CONTRACTS.NounsToken.address as `0x${string}`,
    abi: NounsTokenABI,
    functionName: 'getCurrentVotes',
    args: address ? [address] : undefined,
  });
  
  const hasVotingPower = votes ? votes > BigInt(0) : false;
  
  return {
    hasVotingPower,
    votes: votes || BigInt(0),
  };
}

