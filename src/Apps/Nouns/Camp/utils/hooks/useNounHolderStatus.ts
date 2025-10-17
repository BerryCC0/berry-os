/**
 * useNounHolderStatus Hook
 * Check if user owns Nouns or has delegated voting power
 * 
 * Note: The Data Proxy contract checks prior votes (not current votes)
 * to prevent flash loan attacks. We check current votes here as an approximation,
 * but the actual check happens on-chain using getPriorVotes().
 */

'use client';

import { useAccount, useReadContract, useBlockNumber } from 'wagmi';
import { NOUNS_CONTRACTS } from '@/app/lib/Nouns/Contracts/utils/addresses';
import { NounsTokenABI, DataProxyABI } from '@/app/lib/Nouns/Contracts/abis';

export function useNounHolderStatus() {
  const { address } = useAccount();
  
  // Get current block number
  const { data: currentBlock } = useBlockNumber();
  
  // Get PRIOR_VOTES_BLOCKS_AGO from Data Proxy
  const { data: priorBlocksAgo } = useReadContract({
    address: NOUNS_CONTRACTS.NounsDAODataProxy.proxy as `0x${string}`,
    abi: DataProxyABI,
    functionName: 'PRIOR_VOTES_BLOCKS_AGO',
  });
  
  // Calculate the block to check (same as contract does)
  const checkBlock = currentBlock && priorBlocksAgo 
    ? currentBlock - priorBlocksAgo 
    : undefined;
  
  // Check prior votes (what the contract actually checks)
  const { data: priorVotes } = useReadContract({
    address: NOUNS_CONTRACTS.NounsToken.address as `0x${string}`,
    abi: NounsTokenABI,
    functionName: 'getPriorVotes',
    args: address && checkBlock ? [address, checkBlock] : undefined,
  });
  
  // Also check current balance as backup
  const { data: nounBalance } = useReadContract({
    address: NOUNS_CONTRACTS.NounsToken.address as `0x${string}`,
    abi: NounsTokenABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });
  
  // User has voting power if they had votes at the prior block
  const hasVotingPower = priorVotes ? priorVotes > BigInt(0) : false;
  const ownsNouns = nounBalance ? nounBalance > BigInt(0) : false;
  
  return {
    hasVotingPower,
    ownsNouns,
    nounBalance: nounBalance || BigInt(0),
    votes: priorVotes || BigInt(0),
    priorBlocksAgo: priorBlocksAgo ? Number(priorBlocksAgo) : undefined,
  };
}

