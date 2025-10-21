/**
 * CandidateDetails Component
 * Full candidate view with feedback, signatures, and interaction buttons
 */

'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import type { Candidate } from '../../../utils/types/camp';
import {
  getCandidateTitle,
  getCandidateStatus,
  getStatusColor,
  formatStatus,
  formatAbsoluteTime,
  isProposer,
  canPromoteToProposal,
} from '../../../utils/helpers/candidateHelpers';
import { useCandidateFeedback } from '../../../utils/hooks/useCandidateFeedback';
import { useCandidateSignatures } from '../../../utils/hooks/useCandidateSignatures';
import { useCandidateActions } from '../../../utils/hooks/useCandidateActions';
import { useENS, formatAddressWithENS } from '../../../utils/hooks/useENS';
import { getFeedbackPercentages } from '../../../utils/helpers/candidateHelpers';
import CandidateFeedbackList from './CandidateFeedbackList';
import CandidateSignaturesList from './CandidateSignaturesList';
import CandidateActions from './CandidateActions';
import MarkdownRenderer from '../../ProposalsTab/components/MarkdownRenderer';
import ScrollBar from '@/src/OS/components/UI/ScrollBar/ScrollBar';
import styles from './CandidateDetails.module.css';

interface CandidateDetailsProps {
  candidate: Candidate;
  onClose?: () => void;
}

export default function CandidateDetails({ candidate, onClose }: CandidateDetailsProps) {
  const { address, isConnected } = useAccount();
  
  const [isSummaryCollapsed, setIsSummaryCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'feedback'>('description');
  const [feedbackFilter, setFeedbackFilter] = useState<'all' | 'for' | 'against' | 'abstain'>('all');
  const [selectedSupport, setSelectedSupport] = useState<number | null>(null);
  const [feedbackReason, setFeedbackReason] = useState('');

  // Fetch feedback and signatures
  const { feedback, loading: feedbackLoading, hasFeedback } = useCandidateFeedback(
    candidate.proposer,
    candidate.slug
  );
  const { signatures, loading: signaturesLoading, hasSignatures } = useCandidateSignatures(
    candidate.proposer,
    candidate.slug
  );

  // Contract actions
  const {
    sendFeedback,
    updateCandidate,
    cancelCandidate,
    isPending,
    isConfirming,
    isConfirmed,
  } = useCandidateActions();

  const title = getCandidateTitle(candidate);
  const status = getCandidateStatus(candidate);
  const statusColor = getStatusColor(status);
  const statusLabel = formatStatus(status);
  const { ensName: proposerENS } = useENS(candidate.proposer);
  const proposer = formatAddressWithENS(candidate.proposer, proposerENS);
  const createdTime = formatAbsoluteTime(candidate.createdTimestamp);
  const updatedTime = formatAbsoluteTime(candidate.lastUpdatedTimestamp);
  
  const isOwner = isProposer(candidate, address);
  const canPromote = canPromoteToProposal(candidate, signatures);

  // Feedback percentages
  const feedbackPercentages = getFeedbackPercentages(feedback);

  // Filter feedback
  const filteredFeedback = feedbackFilter === 'all' 
    ? feedback 
    : feedback.filter(f => {
        if (feedbackFilter === 'for') return f.supportDetailed === 1;
        if (feedbackFilter === 'against') return f.supportDetailed === 0;
        if (feedbackFilter === 'abstain') return f.supportDetailed === 2;
        return true;
      });

  const getSupportLabel = (support: number): string => {
    switch (support) {
      case 0: return 'Against';
      case 1: return 'For';
      case 2: return 'Abstain';
      default: return 'Unknown';
    }
  };

  const handleSendFeedback = async () => {
    if (selectedSupport === null) return;
    
    try {
      await sendFeedback(
        candidate.proposer,
        candidate.slug,
        selectedSupport,
        feedbackReason || undefined
      );
      setSelectedSupport(null);
      setFeedbackReason('');
    } catch (error) {
      console.error('Failed to send feedback:', error);
    }
  };

  return (
    <div className={styles.details}>
      {/* Collapsible Summary Section */}
      <div className={styles.summarySection}>
        <button
          className={styles.summaryHeader}
          onClick={() => setIsSummaryCollapsed(!isSummaryCollapsed)}
          aria-expanded={!isSummaryCollapsed}
        >
          <h3 className={styles.summaryTitle}>Candidate Summary & Actions</h3>
          <span className={styles.expandIcon}>{isSummaryCollapsed ? '+' : '−'}</span>
        </button>

        {!isSummaryCollapsed && (
          <div className={styles.summaryContent}>
            {/* Metadata */}
            <div className={styles.metadata}>
              <div className={styles.metadataRow}>
                <span className={styles.metadataLabel}>Proposer:</span>
                <span className={styles.metadataValue} title={candidate.proposer}>
                  {proposer}
                </span>
              </div>
              <div className={styles.metadataRow}>
                <span className={styles.metadataLabel}>Slug:</span>
                <span className={styles.metadataValue}>{candidate.slug}</span>
              </div>
              <div className={styles.metadataRow}>
                <span className={styles.metadataLabel}>Status:</span>
                <span 
                  className={styles.statusBadge}
                  style={{ backgroundColor: statusColor, color: '#FFFFFF' }}
                >
                  {statusLabel}
                </span>
              </div>
              <div className={styles.metadataRow}>
                <span className={styles.metadataLabel}>Created:</span>
                <span className={styles.metadataValue}>{createdTime}</span>
              </div>
              {candidate.lastUpdatedTimestamp > candidate.createdTimestamp && (
                <div className={styles.metadataRow}>
                  <span className={styles.metadataLabel}>Last Updated:</span>
                  <span className={styles.metadataValue}>{updatedTime}</span>
                </div>
              )}
            </div>

            {/* Feedback Summary */}
            {hasFeedback && (
              <div className={styles.feedbackSection}>
                <h3 className={styles.sectionTitle}>Feedback Summary</h3>
                
                <div className={styles.feedbackBarContainer}>
                  <div className={styles.feedbackBarRow}>
                    <span className={styles.feedbackLabel}>For</span>
                    <div className={styles.feedbackBarWrapper}>
                      <div 
                        className={styles.feedbackBarFill}
                        style={{ 
                          width: `${feedbackPercentages.for}%`,
                          backgroundColor: '#00AA00',
                        }}
                      />
                    </div>
                    <span className={styles.feedbackValue}>
                      {feedbackPercentages.forFormatted}
                    </span>
                  </div>

                  <div className={styles.feedbackBarRow}>
                    <span className={styles.feedbackLabel}>Against</span>
                    <div className={styles.feedbackBarWrapper}>
                      <div 
                        className={styles.feedbackBarFill}
                        style={{ 
                          width: `${feedbackPercentages.against}%`,
                          backgroundColor: '#AA0000',
                        }}
                      />
                    </div>
                    <span className={styles.feedbackValue}>
                      {feedbackPercentages.againstFormatted}
                    </span>
                  </div>

                  <div className={styles.feedbackBarRow}>
                    <span className={styles.feedbackLabel}>Abstain</span>
                    <div className={styles.feedbackBarWrapper}>
                      <div 
                        className={styles.feedbackBarFill}
                        style={{ 
                          width: `${feedbackPercentages.abstain}%`,
                          backgroundColor: '#888888',
                        }}
                      />
                    </div>
                    <span className={styles.feedbackValue}>
                      {feedbackPercentages.abstainFormatted}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Signatures */}
            {hasSignatures && (
              <div className={styles.signaturesSection}>
                <h3 className={styles.sectionTitle}>Signatures</h3>
                <CandidateSignaturesList 
                  signatures={signatures}
                  loading={signaturesLoading}
                  requiredSignatures={candidate.requiredSignatures}
                />
              </div>
            )}

            {/* Actions */}
            <CandidateActions candidate={candidate} />
          </div>
        )}
      </div>

      {/* Content Tabs */}
      <div className={styles.contentTabs}>
        <button
          className={`${styles.contentTab} ${activeTab === 'description' ? styles.active : ''}`}
          onClick={() => setActiveTab('description')}
        >
          Description
        </button>
        <button
          className={`${styles.contentTab} ${activeTab === 'feedback' ? styles.active : ''}`}
          onClick={() => setActiveTab('feedback')}
        >
          Feedback & Signatures
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'description' ? (
        <div className={styles.descriptionSection}>
          <ScrollBar direction="vertical" showArrows={false}>
            <div className={styles.descriptionContent}>
              <MarkdownRenderer content={candidate.description || ''} />
            </div>
          </ScrollBar>
        </div>
      ) : (
        <>
          {/* Feedback Interface */}
          {isConnected && !candidate.canceled && (
            <div className={styles.feedbackInterface}>
              <h3 className={styles.sectionTitle}>Provide Feedback</h3>
              
              <div className={styles.feedbackButtons}>
                <button
                  className={`${styles.feedbackButton} ${styles.feedbackFor} ${selectedSupport === 1 ? styles.selected : ''}`}
                  onClick={() => setSelectedSupport(1)}
                  disabled={isPending || isConfirming}
                >
                  Support (For)
                </button>
                <button
                  className={`${styles.feedbackButton} ${styles.feedbackAgainst} ${selectedSupport === 0 ? styles.selected : ''}`}
                  onClick={() => setSelectedSupport(0)}
                  disabled={isPending || isConfirming}
                >
                  Oppose (Against)
                </button>
                <button
                  className={`${styles.feedbackButton} ${styles.feedbackAbstain} ${selectedSupport === 2 ? styles.selected : ''}`}
                  onClick={() => setSelectedSupport(2)}
                  disabled={isPending || isConfirming}
                >
                  Abstain
                </button>
              </div>

              {selectedSupport !== null && (
                <>
                  <textarea
                    className={styles.reasonInput}
                    placeholder="Add your feedback (optional)"
                    value={feedbackReason}
                    onChange={(e) => setFeedbackReason(e.target.value)}
                    maxLength={1000}
                    rows={3}
                    disabled={isPending || isConfirming}
                  />
                  <button
                    className={styles.submitButton}
                    onClick={handleSendFeedback}
                    disabled={isPending || isConfirming}
                  >
                    {isPending ? 'Sending...' : isConfirming ? 'Confirming...' : 'Submit Feedback'}
                  </button>
                  {isConfirmed && (
                    <div className={styles.successMessage}>
                      ✓ Feedback submitted successfully!
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {!isConnected && (
            <div className={styles.connectPrompt}>
              Connect your wallet to provide feedback or signatures
            </div>
          )}

          {/* Feedback List with Filter Tabs */}
          <div className={styles.feedbackListSection}>
            <h3 className={styles.sectionTitle}>Feedback Signals</h3>
            
            <div className={styles.feedbackTabs}>
              <button
                className={`${styles.feedbackTab} ${feedbackFilter === 'all' ? styles.active : ''}`}
                onClick={() => setFeedbackFilter('all')}
              >
                All ({feedback.length})
              </button>
              <button
                className={`${styles.feedbackTab} ${feedbackFilter === 'for' ? styles.active : ''}`}
                onClick={() => setFeedbackFilter('for')}
              >
                For ({feedback.filter(f => f.supportDetailed === 1).length})
              </button>
              <button
                className={`${styles.feedbackTab} ${feedbackFilter === 'against' ? styles.active : ''}`}
                onClick={() => setFeedbackFilter('against')}
              >
                Against ({feedback.filter(f => f.supportDetailed === 0).length})
              </button>
              <button
                className={`${styles.feedbackTab} ${feedbackFilter === 'abstain' ? styles.active : ''}`}
                onClick={() => setFeedbackFilter('abstain')}
              >
                Abstain ({feedback.filter(f => f.supportDetailed === 2).length})
              </button>
            </div>

            <CandidateFeedbackList
              feedback={filteredFeedback}
              loading={feedbackLoading}
            />
          </div>

          {/* Signatures Section */}
          {hasSignatures && (
            <div className={styles.signaturesListSection}>
              <h3 className={styles.sectionTitle}>Support Signatures</h3>
              <CandidateSignaturesList 
                signatures={signatures}
                loading={signaturesLoading}
                requiredSignatures={candidate.requiredSignatures}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

