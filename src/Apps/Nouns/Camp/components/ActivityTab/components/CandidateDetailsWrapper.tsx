/**
 * CandidateDetailsWrapper Component
 * Fetches candidate data and renders CandidateDetails for Activity items
 */

'use client';

import { useCandidate } from '../../../utils/hooks/useCandidates';
import CandidateDetails from '../../CandidatesTab/components/CandidateDetails';
import styles from './ProposalDetailsWrapper.module.css';

interface CandidateDetailsWrapperProps {
  proposer: string;
  slug: string;
  onClose: () => void;
}

export default function CandidateDetailsWrapper({ 
  proposer, 
  slug, 
  onClose 
}: CandidateDetailsWrapperProps) {
  const { candidate, loading, error } = useCandidate(proposer, slug);

  if (loading) {
    return (
      <div className={styles.loading}>
        <p>Loading candidate details...</p>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className={styles.error}>
        <p>Error loading candidate</p>
        {error && <p className={styles.errorDetails}>{error.message}</p>}
        <button className={styles.closeButton} onClick={onClose}>
          Close
        </button>
      </div>
    );
  }

  return (
    <CandidateDetails 
      candidate={candidate} 
      onClose={onClose}
    />
  );
}

