/**
 * ProposalsTab Component
 * Main container for proposals list with filtering and sorting
 */

'use client';

import { useState } from 'react';
import { useProposals } from '../../utils/hooks/useProposals';
import { ProposalFilter, ProposalSort } from '../../utils/types/camp';
import ProposalCard from './components/ProposalCard';
import ProposalDetails from './components/ProposalDetails';
import styles from './ProposalsTab.module.css';

interface ProposalsTabProps {
  onVote?: (proposalId: string, support: number, reason?: string) => void;
  onEditProposal?: (proposalId: string) => void;
}

export default function ProposalsTab({ onVote, onEditProposal }: ProposalsTabProps) {
  const [filter, setFilter] = useState<ProposalFilter>(ProposalFilter.ALL);
  const [sort, setSort] = useState<ProposalSort>(ProposalSort.NEWEST);
  const [expandedProposalId, setExpandedProposalId] = useState<string | null>(null);

  const { proposals, loading, error, hasMore, loadMore } = useProposals({
    first: 20,
    filter,
    sort,
  });

  const handleVote = (proposalId: string, support: number, reason?: string) => {
    if (onVote) {
      onVote(proposalId, support, reason);
    }
  };

  if (error) {
    return (
      <div className={styles.error}>
        <p>Error loading proposals:</p>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Filters and Sort */}
      <div className={styles.controls}>
        <div className={styles.filterGroup}>
          <label className={styles.label}>Filter:</label>
          <select 
            className={styles.select}
            value={filter}
            onChange={(e) => setFilter(e.target.value as ProposalFilter)}
          >
            <option value="all">All Proposals</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="succeeded">Succeeded</option>
            <option value="defeated">Defeated</option>
            <option value="queued">Queued</option>
            <option value="executed">Executed</option>
            <option value="cancelled">Cancelled</option>
            <option value="vetoed">Vetoed</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.label}>Sort:</label>
          <select 
            className={styles.select}
            value={sort}
            onChange={(e) => setSort(e.target.value as ProposalSort)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="most_votes">Most Votes</option>
            <option value="ending_soon">Ending Soon</option>
          </select>
        </div>
      </div>

      {/* Proposals List */}
      <div className={styles.list}>
        {loading && proposals.length === 0 ? (
          <div className={styles.loading}>
            <p>Loading proposals...</p>
          </div>
        ) : proposals.length === 0 ? (
          <div className={styles.empty}>
            <p>No proposals found</p>
            <p className={styles.emptyHint}>
              Try adjusting your filters
            </p>
          </div>
        ) : (
          <>
            {proposals.map(proposal => (
              <div key={proposal.id} className={styles.proposalContainer}>
                <ProposalCard
                  proposal={proposal}
                  isExpanded={expandedProposalId === proposal.id}
                  onClick={() => setExpandedProposalId(
                    expandedProposalId === proposal.id ? null : proposal.id
                  )}
                />
                {expandedProposalId === proposal.id && (
                  <ProposalDetails 
                    proposal={proposal}
                    onClose={() => setExpandedProposalId(null)}
                    onVote={(support, reason) => handleVote(proposal.id, support, reason)}
                    onEdit={onEditProposal}
                  />
                )}
              </div>
            ))}

            {/* Load More */}
            {hasMore && (
              <button 
                className={styles.loadMoreButton}
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

