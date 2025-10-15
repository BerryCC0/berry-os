/**
 * useVoterDetails Hook
 * Fetches comprehensive delegate and account information for a voter
 * Supports automatic pagination for votes, proposals, and nouns that exceed 1000 items
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_DELEGATE_DETAILS, nounsApolloClient } from '@/app/lib/Nouns/Goldsky';
import type { Delegate, Account } from '@/app/lib/Nouns/Goldsky/utils/types';

interface DelegateDetails extends Delegate {
  votes?: any[];
  proposals?: any[];
}

interface UseVoterDetailsReturn {
  delegate: DelegateDetails | null;
  account: Account | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  // Pagination support (automatic)
  hasMoreVotes: boolean;
  hasMoreProposals: boolean;
  hasMoreNouns: boolean;
  loadMoreVotes: () => Promise<void>;
  loadMoreProposals: () => Promise<void>;
  loadMoreNouns: () => Promise<void>;
  isLoadingMoreVotes: boolean;
  isLoadingMoreProposals: boolean;
  isLoadingMoreNouns: boolean;
}

/**
 * Hook to fetch detailed information about a voter/delegate with automatic pagination
 * 
 * @param address - Ethereum address of the voter
 * @returns Delegate and account data with loading/error states and automatic pagination
 * 
 * @example
 * const { 
 *   delegate, 
 *   account, 
 *   loading,
 *   hasMoreVotes,
 *   loadMoreVotes,
 *   isLoadingMoreVotes
 * } = useVoterDetails('0x1234...');
 */
export function useVoterDetails(address?: string): UseVoterDetailsReturn {
  const [allVotes, setAllVotes] = useState<any[]>([]);
  const [allProposals, setAllProposals] = useState<any[]>([]);
  const [allNouns, setAllNouns] = useState<any[]>([]);
  const [isLoadingMoreVotes, setIsLoadingMoreVotes] = useState(false);
  const [isLoadingMoreProposals, setIsLoadingMoreProposals] = useState(false);
  const [isLoadingMoreNouns, setIsLoadingMoreNouns] = useState(false);
  
  // Track if we've hit the end of pagination
  const hasMoreVotesRef = useRef(true);
  const hasMoreProposalsRef = useRef(true);
  const hasMoreNounsRef = useRef(true);

  const { data, loading, error, refetch, fetchMore } = useQuery<{
    delegate: DelegateDetails | null;
    account: Account | null;
  }>(GET_DELEGATE_DETAILS, {
    variables: { 
      id: address?.toLowerCase() 
    },
    client: nounsApolloClient,
    skip: !address,
    fetchPolicy: 'cache-and-network',
  });

  // Initialize data when first loaded
  useEffect(() => {
    if (data?.delegate) {
      const votes = (data.delegate as any).votes || [];
      const proposals = (data.delegate as any).proposals || [];
      const nouns = data.delegate.nounsRepresented || [];
      
      setAllVotes(votes);
      setAllProposals(proposals);
      setAllNouns(nouns);
      
      // Check if we got a full page (meaning there might be more)
      hasMoreVotesRef.current = votes.length === 1000;
      hasMoreProposalsRef.current = proposals.length === 100;
      hasMoreNounsRef.current = nouns.length === 1000;
    }
  }, [data]);

  // Reset state when address changes
  useEffect(() => {
    setAllVotes([]);
    setAllProposals([]);
    setAllNouns([]);
    hasMoreVotesRef.current = true;
    hasMoreProposalsRef.current = true;
    hasMoreNounsRef.current = true;
  }, [address]);

  // Load more votes
  const loadMoreVotes = useCallback(async () => {
    if (!address || isLoadingMoreVotes || !hasMoreVotesRef.current) return;
    
    setIsLoadingMoreVotes(true);
    const currentLength = allVotes.length;
    
    try {
      const result = await fetchMore({
        variables: {
          id: address.toLowerCase(),
          votesSkip: currentLength,
        },
      });
      
      const newVotes = (result.data?.delegate as any)?.votes || [];
      if (newVotes.length > 0) {
        setAllVotes(prev => [...prev, ...newVotes]);
        hasMoreVotesRef.current = newVotes.length === 1000;
      } else {
        hasMoreVotesRef.current = false;
      }
    } catch (err) {
      console.error('Error loading more votes:', err);
      hasMoreVotesRef.current = false;
    } finally {
      setIsLoadingMoreVotes(false);
    }
  }, [address, allVotes.length, fetchMore, isLoadingMoreVotes]);

  // Load more proposals
  const loadMoreProposals = useCallback(async () => {
    if (!address || isLoadingMoreProposals || !hasMoreProposalsRef.current) return;
    
    setIsLoadingMoreProposals(true);
    const currentLength = allProposals.length;
    
    try {
      const result = await fetchMore({
        variables: {
          id: address.toLowerCase(),
          proposalsSkip: currentLength,
        },
      });
      
      const newProposals = (result.data?.delegate as any)?.proposals || [];
      if (newProposals.length > 0) {
        setAllProposals(prev => [...prev, ...newProposals]);
        hasMoreProposalsRef.current = newProposals.length === 100;
      } else {
        hasMoreProposalsRef.current = false;
      }
    } catch (err) {
      console.error('Error loading more proposals:', err);
      hasMoreProposalsRef.current = false;
    } finally {
      setIsLoadingMoreProposals(false);
    }
  }, [address, allProposals.length, fetchMore, isLoadingMoreProposals]);

  // Load more nouns
  const loadMoreNouns = useCallback(async () => {
    if (!address || isLoadingMoreNouns || !hasMoreNounsRef.current) return;
    
    setIsLoadingMoreNouns(true);
    const currentLength = allNouns.length;
    
    try {
      const result = await fetchMore({
        variables: {
          id: address.toLowerCase(),
          nounsSkip: currentLength,
        },
      });
      
      const newNouns = result.data?.delegate?.nounsRepresented || [];
      if (newNouns.length > 0) {
        setAllNouns(prev => [...prev, ...newNouns]);
        hasMoreNounsRef.current = newNouns.length === 1000;
      } else {
        hasMoreNounsRef.current = false;
      }
    } catch (err) {
      console.error('Error loading more nouns:', err);
      hasMoreNounsRef.current = false;
    } finally {
      setIsLoadingMoreNouns(false);
    }
  }, [address, allNouns.length, fetchMore, isLoadingMoreNouns]);

  // Merge paginated data with delegate
  const enrichedDelegate = data?.delegate ? {
    ...data.delegate,
    votes: allVotes,
    proposals: allProposals,
    nounsRepresented: allNouns,
  } : null;

  return {
    delegate: enrichedDelegate,
    account: data?.account || null,
    loading,
    error: error || null,
    refetch,
    hasMoreVotes: hasMoreVotesRef.current,
    hasMoreProposals: hasMoreProposalsRef.current,
    hasMoreNouns: hasMoreNounsRef.current,
    loadMoreVotes,
    loadMoreProposals,
    loadMoreNouns,
    isLoadingMoreVotes,
    isLoadingMoreProposals,
    isLoadingMoreNouns,
  };
}

