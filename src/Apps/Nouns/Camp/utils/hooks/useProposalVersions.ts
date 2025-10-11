'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_PROPOSAL_VERSIONS, nounsApolloClient } from '@/app/lib/Nouns/Goldsky';
import type { ProposalVersion } from '@/app/lib/Nouns/Goldsky/utils/types';

interface UseProposalVersionsOptions {
  first?: number;
  skip?: number;
}

interface UseProposalVersionsReturn {
  versions: ProposalVersion[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => void;
  hasVersions: boolean;
  versionCount: number;
}

/**
 * Hook to fetch proposal versions/updates from Goldsky GraphQL (V3 governance)
 * Proposals can be updated during the updatable period
 */
export function useProposalVersions(
  proposalId: string,
  options: UseProposalVersionsOptions = {}
): UseProposalVersionsReturn {
  const { first = 100, skip = 0 } = options;
  const [currentSkip, setCurrentSkip] = useState(skip);
  const [allVersions, setAllVersions] = useState<ProposalVersion[]>([]);

  const { data, loading, error, fetchMore } = useQuery<{
    proposalVersions: ProposalVersion[];
  }>(GET_PROPOSAL_VERSIONS, {
    variables: {
      proposalId,
      first,
      skip: currentSkip,
    },
    client: nounsApolloClient,
    skip: !proposalId,
  });
  
  // Update allVersions when data changes
  useEffect(() => {
    if (data?.proposalVersions) {
      if (currentSkip === 0) {
        // First load - replace all versions
        setAllVersions(data.proposalVersions as ProposalVersion[]);
      } else {
        // Pagination - append new versions
        setAllVersions(prev => [...prev, ...(data.proposalVersions as ProposalVersion[])]);
      }
    }
  }, [data, currentSkip]);

  const loadMore = async () => {
    const newSkip = currentSkip + first;
    setCurrentSkip(newSkip);
    
    await fetchMore({
      variables: {
        proposalId,
        first,
        skip: newSkip,
      },
    });
  };

  const hasMore = useMemo(() => {
    return data?.proposalVersions?.length === first;
  }, [data, first]);

  const versions = useMemo(() => allVersions as ProposalVersion[], [allVersions]);
  const hasVersions = versions.length > 0;
  const versionCount = versions.length;

  return {
    versions,
    loading,
    error: error || null,
    hasMore,
    loadMore,
    hasVersions,
    versionCount,
  };
}

