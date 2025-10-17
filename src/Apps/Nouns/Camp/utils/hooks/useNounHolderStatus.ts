/**
 * useNounHolderStatus Hook
 * Check if user owns Nouns or has delegated voting power
 */

'use client';

import { useAccount, useReadContract } from 'wagmi';
import { NOUNS_CONTRACTS } from '@/app/lib/Nouns/Contracts/utils/addresses';
import { NounsTokenABI } from '@/app/lib/Nouns/Contracts/abis';

export function useNounHolderStatus() {
  const { address } = useAccount();
  
  // Check Noun balance (actual ownership)
  const { data: nounBalance } = useReadContract({
    address: NOUNS_CONTRACTS.NounsToken.address as `0x${string}`,
    abi: NounsTokenABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });
  
  // Check voting power (delegated votes at this address)
  const { data: votes } = useReadContract({
    address: NOUNS_CONTRACTS.NounsToken.address as `0x${string}`,
    abi: NounsTokenABI,
    functionName: 'getCurrentVotes',
    args: address ? [address] : undefined,
  });
  
  // User has voting power if they own Nouns OR have delegated votes
  const ownsNouns = nounBalance ? nounBalance > BigInt(0) : false;
  const hasDelegatedVotes = votes ? votes > BigInt(0) : false;
  const hasVotingPower = ownsNouns || hasDelegatedVotes;
  
  return {
    hasVotingPower,
    ownsNouns,
    nounBalance: nounBalance || BigInt(0),
    votes: votes || BigInt(0),
  };
}

