/**
 * useCandidates Hook
 * Fetches proposal candidates from Goldsky GraphQL
 * 
 * Features:
 * - Automatic polling every 45 seconds when tab is active
 * - Stops polling when tab is inactive (battery efficient)
 * - Fresh data on component mount
 * - Seamless background updates
 */

'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { nounsApolloClient } from '@/app/lib/Nouns/Goldsky';
import { gql } from '@apollo/client';
import type { Candidate } from '../types/camp';
import { CandidateFilter, CandidateSort } from '../types/camp';
import { filterCandidates, sortCandidates } from '../helpers/candidateHelpers';
import { useSmartPolling } from './useSmartPolling';

const GET_PROPOSAL_CANDIDATES = gql`
  query GetProposalCandidates(
    $first: Int = 20
    $skip: Int = 0
    $where: ProposalCandidate_filter
  ) {
    proposalCandidates(
      first: $first
      skip: $skip
      orderBy: createdTimestamp
      orderDirection: desc
      where: $where
    ) {
      id
      proposer
      slug
      number
      createdTimestamp
      lastUpdatedTimestamp
      canceled
      canceledTimestamp
      latestVersion {
        id
        content {
          title
          description
          targets
          values
          signatures
          calldatas
          proposalIdToUpdate
          matchingProposalIds
        }
      }
      versions {
        id
      }
    }
  }
`;

interface UseCandidatesOptions {
  first?: number;
  skip?: number;
  filter?: CandidateFilter;
  sort?: CandidateSort;
}

interface UseCandidatesReturn {
  candidates: Candidate[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  hasMore: boolean;
  loadMore: () => void;
}

/**
 * Hook to fetch and manage candidates with polling
 */
export function useCandidates(options: UseCandidatesOptions = {}): UseCandidatesReturn {
  const { 
    first = 20, 
    skip = 0,
    filter = CandidateFilter.ALL, 
    sort = CandidateSort.NEWEST 
  } = options;

  // State for pagination
  const [currentSkip, setCurrentSkip] = useState(skip);
  const [allCandidates, setAllCandidates] = useState<any[]>([]);

  // Build where clause to filter canceled candidates
  const whereClause = filter === CandidateFilter.CANCELED 
    ? { canceled: true }
    : filter === CandidateFilter.ACTIVE 
    ? { canceled: false }
    : undefined; // ALL shows both

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentSkip(0);
    setAllCandidates([]);
  }, [filter, sort]);

  // Fetch candidates from Goldsky with polling
  const { 
    data, 
    loading, 
    error, 
    refetch,
    fetchMore,
    startPolling,
    stopPolling,
  } = useQuery<{
    proposalCandidates: any[];
  }>(GET_PROPOSAL_CANDIDATES, {
    variables: {
      first,
      skip: 0,
      where: whereClause,
    },
    client: nounsApolloClient,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  // Smart polling (45 seconds - moderate updates)
  useSmartPolling({
    interval: 45000,
    startPolling,
    stopPolling,
  });

  // Update accumulated candidates when data changes
  useEffect(() => {
    if (data?.proposalCandidates) {
      if (currentSkip === 0) {
        // First load - replace all
        setAllCandidates(data.proposalCandidates);
      } else {
        // Pagination - append new candidates, deduplicating by ID
        setAllCandidates(prev => {
          const existingIds = new Set(prev.map(c => c.id));
          const newCandidates = data.proposalCandidates.filter(c => !existingIds.has(c.id));
          return [...prev, ...newCandidates];
        });
      }
    }
  }, [data]);

  // Transform GraphQL data to Candidate type
  const candidates = useMemo(() => {
    if (allCandidates.length === 0) return [];
    
    return allCandidates
      // Filter out candidates that have been promoted to proposals
      .filter((candidate: any) => {
        const matchingProposalIds = candidate.latestVersion?.content?.matchingProposalIds || [];
        return matchingProposalIds.length === 0;
      })
      .map((candidate: any) => {
        const content = candidate.latestVersion?.content;
        
        return {
          proposer: candidate.proposer,
          slug: candidate.slug,
          description: content?.description || '',
          createdTimestamp: parseInt(candidate.createdTimestamp),
          lastUpdatedTimestamp: parseInt(candidate.lastUpdatedTimestamp),
          canceled: candidate.canceled,
          feedbackCount: candidate.versions?.length || 0,
          // Get from latestVersion.content
          targets: content?.targets || [],
          values: content?.values?.map((v: string) => v.toString()) || [],
          signatures: content?.signatures || [],
          calldatas: content?.calldatas || [],
          proposalIdToUpdate: content?.proposalIdToUpdate?.toString() || '0',
          requiredSignatures: 0, // Not in schema, default to 0
        };
      });
  }, [allCandidates]);

  // Apply filters and sorting
  const processedCandidates = useMemo(() => {
    let filtered = filterCandidates(candidates, filter);
    return sortCandidates(filtered, sort);
  }, [candidates, filter, sort]);

  // Load more handler
  const loadMore = async () => {
    if (loading || !hasMore) {
      console.log('🔄 LoadMore blocked:', { loading, hasMore });
      return;
    }
    
    const newSkip = allCandidates.length; // Use actual count to avoid gaps
    console.log('🔄 Loading more candidates:', { newSkip, first, currentCount: allCandidates.length });
    setCurrentSkip(newSkip);
    
    try {
      const result = await fetchMore({
        variables: {
          first,
          skip: newSkip,
          where: whereClause,
        },
      });
      
      console.log('✅ Fetched more candidates:', result.data?.proposalCandidates?.length);
      
      // Force update if fetchMore doesn't trigger data change
      if (result.data?.proposalCandidates) {
        setAllCandidates(prev => {
          const existingIds = new Set(prev.map(c => c.id));
          const newCandidates = (result.data?.proposalCandidates || []).filter(c => !existingIds.has(c.id));
          console.log('➕ Adding new candidates:', { new: newCandidates.length, total: prev.length + newCandidates.length });
          return [...prev, ...newCandidates];
        });
      }
    } catch (err) {
      console.error('❌ Error loading more candidates:', err);
    }
  };

  // Check if there are more candidates
  // If the last fetch returned a full page, there might be more
  const hasMore = useMemo(() => {
    return data?.proposalCandidates?.length === first;
  }, [data, first]);

  return {
    candidates: processedCandidates,
    loading,
    error: error || null,
    refetch,
    hasMore,
    loadMore,
  };
}

/**
 * Hook to fetch a single candidate by proposer and slug
 */
export function useCandidate(proposer: string, slug: string) {
  const candidateId = `${proposer.toLowerCase()}-${slug}`;
  
  useEffect(() => {
    console.log('🔍 useCandidate called:', { proposer, slug, candidateId });
  }, [proposer, slug, candidateId]);
  
  const { data, loading, error } = useQuery<{
    proposalCandidate: any;
  }>(gql`
    query GetSingleCandidate($id: ID!) {
      proposalCandidate(id: $id) {
        id
        proposer
        slug
        number
        createdTimestamp
        lastUpdatedTimestamp
        canceled
        canceledTimestamp
        latestVersion {
          id
          content {
            title
            description
            targets
            values
            signatures
            calldatas
            proposalIdToUpdate
            matchingProposalIds
          }
        }
        versions {
          id
        }
      }
    }
  `, {
    variables: { id: candidateId },
    client: nounsApolloClient,
    fetchPolicy: 'cache-and-network',
    skip: !proposer || !slug,
  });

  const candidate = useMemo(() => {
    if (!data?.proposalCandidate) return null;
    
    const rawCandidate = data.proposalCandidate;
    const content = rawCandidate.latestVersion?.content;
    
    return {
      proposer: rawCandidate.proposer,
      slug: rawCandidate.slug,
      description: content?.description || '',
      createdTimestamp: parseInt(rawCandidate.createdTimestamp),
      lastUpdatedTimestamp: parseInt(rawCandidate.lastUpdatedTimestamp),
      canceled: rawCandidate.canceled,
      feedbackCount: rawCandidate.versions?.length || 0,
      targets: content?.targets || [],
      values: content?.values?.map((v: string) => v.toString()) || [],
      signatures: content?.signatures || [],
      calldatas: content?.calldatas || [],
      proposalIdToUpdate: content?.proposalIdToUpdate?.toString() || '0',
      requiredSignatures: 0,
    } as Candidate;
  }, [data]);

  return {
    candidate,
    loading,
    error: error || null,
  };
}

/**
 * Hook to check if user can create candidates (owns Nouns or has paid fee)
 */
export function useCanCreateCandidate(address?: string) {
  // Placeholder - would check:
  // 1. If user owns Nouns (free)
  // 2. Or if user has paid the creation fee
  
  const canCreate = false;
  const requiresFee = true;
  const fee = '0.01'; // ETH

  return {
    canCreate,
    requiresFee,
    fee,
  };
}

