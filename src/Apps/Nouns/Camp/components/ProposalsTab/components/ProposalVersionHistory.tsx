'use client';

import { useState } from 'react';
import type { ProposalVersion } from '@/app/lib/Nouns/Goldsky/utils/types';
import MarkdownRenderer from './MarkdownRenderer';
import ScrollBar from '@/src/OS/components/UI/ScrollBar/ScrollBar';
import styles from './ProposalVersionHistory.module.css';

interface ProposalVersionHistoryProps {
  versions: ProposalVersion[];
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function ProposalVersionHistory({
  versions,
  isCollapsed,
  onToggle,
}: ProposalVersionHistoryProps) {
  const [expandedVersionId, setExpandedVersionId] = useState<string | null>(null);

  if (versions.length === 0) {
    return null;
  }

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatBlockNumber = (block: string): string => {
    return `Block ${parseInt(block).toLocaleString()}`;
  };

  return (
    <div className={styles.versionHistory}>
      {/* Header */}
      <button
        className={styles.header}
        onClick={onToggle}
        aria-expanded={!isCollapsed}
      >
        <div className={styles.headerLeft}>
          <span className={styles.title}>Proposal Updates</span>
          <span className={styles.badge}>{versions.length}</span>
        </div>
        <span className={styles.arrow}>{isCollapsed ? '▶' : '▼'}</span>
      </button>

      {/* Version List */}
      {!isCollapsed && (
        <div className={styles.versionList}>
          {versions.map((version, index) => {
            const isExpanded = expandedVersionId === version.id;
            const versionNumber = versions.length - index; // Reverse chronological numbering
            
            return (
              <div key={version.id} className={styles.versionItem}>
                {/* Version Header */}
                <button
                  className={styles.versionHeader}
                  onClick={() => setExpandedVersionId(isExpanded ? null : version.id)}
                >
                  <div className={styles.versionHeaderLeft}>
                    <span className={styles.versionNumber}>v{versionNumber}</span>
                    <span className={styles.versionTitle}>{version.title}</span>
                  </div>
                  <div className={styles.versionHeaderRight}>
                    <span className={styles.versionDate}>
                      {formatTimestamp(version.createdAt)}
                    </span>
                    <span className={styles.expandIcon}>{isExpanded ? '−' : '+'}</span>
                  </div>
                </button>

                {/* Version Details */}
                {isExpanded && (
                  <div className={styles.versionDetails}>
                    {/* Metadata */}
                    <div className={styles.versionMetadata}>
                      <div className={styles.metadataRow}>
                        <span className={styles.metadataLabel}>Block:</span>
                        <span className={styles.metadataValue}>
                          {formatBlockNumber(version.createdBlock)}
                        </span>
                      </div>
                      <div className={styles.metadataRow}>
                        <span className={styles.metadataLabel}>Tx Hash:</span>
                        <span className={styles.metadataValue}>
                          <a
                            href={`https://etherscan.io/tx/${version.createdTransactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.txLink}
                          >
                            {version.createdTransactionHash.substring(0, 10)}...
                            {version.createdTransactionHash.substring(
                              version.createdTransactionHash.length - 8
                            )}
                          </a>
                        </span>
                      </div>
                      <div className={styles.metadataRow}>
                        <span className={styles.metadataLabel}>Actions:</span>
                        <span className={styles.metadataValue}>
                          {version.targets?.length || 0}
                        </span>
                      </div>
                    </div>

                    {/* Update Message */}
                    {version.updateMessage && (
                      <div className={styles.updateMessage}>
                        <h4 className={styles.updateMessageTitle}>Update Message</h4>
                        <p className={styles.updateMessageText}>{version.updateMessage}</p>
                      </div>
                    )}

                    {/* Description */}
                    <div className={styles.versionDescription}>
                      <h4 className={styles.descriptionTitle}>Description</h4>
                      <ScrollBar direction="vertical" showArrows={false}>
                        <div className={styles.descriptionContent}>
                          <MarkdownRenderer content={version.description || ''} />
                        </div>
                      </ScrollBar>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

