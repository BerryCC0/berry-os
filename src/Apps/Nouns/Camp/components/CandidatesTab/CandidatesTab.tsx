/**
 * CandidatesTab Component
 * Proposal candidates list (placeholder implementation)
 */

'use client';

import { useState } from 'react';
import { useCandidates } from '../../utils/hooks/useCandidates';
import { CandidateFilter, CandidateSort } from '../../utils/types/camp';
import styles from './CandidatesTab.module.css';

export default function CandidatesTab() {
  const [filter, setFilter] = useState<CandidateFilter>(CandidateFilter.ALL);
  const [sort, setSort] = useState<CandidateSort>(CandidateSort.NEWEST);

  const { candidates, loading, error } = useCandidates({ filter, sort });

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

      {/* Content */}
      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>
            <p>Loading candidates...</p>
          </div>
        ) : candidates.length === 0 ? (
          <div className={styles.empty}>
            <h3>⌐◨-◨ Proposal Candidates</h3>
            <p>Proposal candidates are draft proposals that haven't been officially submitted yet.</p>
            <p className={styles.emptyHint}>
              Candidates require parsing contract events from the Data Proxy contract.
            </p>
            <p className={styles.emptyHint}>
              Full implementation coming soon!
            </p>
          </div>
        ) : (
          <div className={styles.list}>
            {candidates.map((candidate, index) => (
              <div key={index} className={styles.candidateCard}>
                {/* Candidate content would go here */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

