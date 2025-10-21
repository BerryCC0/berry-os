/**
 * CandidatesTab Component
 * Proposal candidates list with card/details view
 */

'use client';

import { useState } from 'react';
import { useCandidates } from '../../utils/hooks/useCandidates';
import { CandidateFilter, CandidateSort } from '../../utils/types/camp';
import CandidateCard from './components/CandidateCard';
import CandidateDetails from './components/CandidateDetails';
import InfiniteScroll from '@/src/OS/components/UI/InfiniteScroll/InfiniteScroll';
import styles from './CandidatesTab.module.css';

export default function CandidatesTab() {
  const [filter, setFilter] = useState<CandidateFilter>(CandidateFilter.ACTIVE);
  const [sort, setSort] = useState<CandidateSort>(CandidateSort.NEWEST);
  const [expandedCandidateSlug, setExpandedCandidateSlug] = useState<string | null>(null);

  const { candidates, loading, error, hasMore, loadMore } = useCandidates({ 
    first: 20,
    filter, 
    sort 
  });

  if (error) {
    return (
      <div className={styles.error}>
        <p>Error loading candidates:</p>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.filterGroup}>
          <label className={styles.label}>Filter:</label>
          <select 
            className={styles.select}
            value={filter}
            onChange={(e) => setFilter(e.target.value as CandidateFilter)}
          >
            <option value="all">All Candidates</option>
            <option value="active">Active</option>
            <option value="canceled">Canceled</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.label}>Sort:</label>
          <select 
            className={styles.select}
            value={sort}
            onChange={(e) => setSort(e.target.value as CandidateSort)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="most_feedback">Most Feedback</option>
          </select>
        </div>
      </div>

      {/* Candidates List */}
      <div className={styles.list}>
        {loading && candidates.length === 0 ? (
          <div className={styles.loading}>
            <p>Loading candidates...</p>
          </div>
        ) : candidates.length === 0 ? (
          <div className={styles.empty}>
            <h3>⌐◨-◨ Proposal Candidates</h3>
            <p>No proposal candidates found.</p>
            <p className={styles.emptyHint}>
              Proposal candidates are draft proposals that can be discussed and refined before formal submission.
            </p>
          </div>
        ) : (
          <InfiniteScroll
            onLoadMore={loadMore}
            hasMore={hasMore}
            loading={loading}
            threshold={300}
          >
            {candidates.map((candidate, index) => {
              const isExpanded = expandedCandidateSlug === candidate.slug;
              // Use index as fallback if slug is missing to prevent duplicate keys
              const uniqueKey = candidate.slug 
                ? `${candidate.proposer}-${candidate.slug}` 
                : `${candidate.proposer}-${index}`;
              
              return (
                <div key={uniqueKey} className={styles.candidateContainer}>
                  <CandidateCard
                    candidate={candidate}
                    isExpanded={isExpanded}
                    onClick={() => setExpandedCandidateSlug(
                      isExpanded ? null : candidate.slug
                    )}
                  />
                  {isExpanded && (
                    <CandidateDetails 
                      candidate={candidate}
                      onClose={() => setExpandedCandidateSlug(null)}
                    />
                  )}
                </div>
              );
            })}
          </InfiniteScroll>
        )}
      </div>
    </div>
  );
}

