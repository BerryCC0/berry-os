/**
 * DraftSelector Component
 * UI for loading and managing saved proposal drafts
 */

'use client';

import React, { useState } from 'react';
import { ProposalDraft } from '@/app/lib/Persistence/proposalDrafts';
import styles from './DraftSelector.module.css';

interface DraftSelectorProps {
  drafts: ProposalDraft[];
  onLoad: (draft: ProposalDraft) => void;
  onDelete: (draftName: string) => void;
  onNew: () => void;
  disabled?: boolean;
  currentDraftName?: string;
}

export function DraftSelector({
  drafts,
  onLoad,
  onDelete,
  onNew,
  disabled = false,
  currentDraftName
}: DraftSelectorProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const currentDraft = drafts.find(d => d.draft_name === currentDraftName);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <label className={styles.label}>
          {drafts.length === 0 ? 'No Drafts Yet' : 'Saved Drafts'}
          {drafts.length > 0 && <span className={styles.count}> ({drafts.length})</span>}
        </label>
        <button
          type="button"
          className={styles.newButton}
          onClick={onNew}
          disabled={disabled}
        >
          + New Proposal
        </button>
      </div>

      {drafts.length === 0 ? (
        <div className={styles.noDrafts}>
          Start typing a proposal title to create your first draft. It will auto-save as you type!
        </div>
      ) : (
        <div className={styles.draftsList}>
          <div className={styles.dropdown}>
            <button
              type="button"
              className={styles.dropdownButton}
              onClick={() => setShowDropdown(!showDropdown)}
              disabled={disabled}
            >
              <span className={styles.dropdownLabel}>
                {currentDraft ? (
                  <>
                    <span className={styles.dropdownTitle}>
                      {currentDraft.title || 'Untitled'}
                    </span>
                    {currentDraft.kyc_verified && <span className={styles.kycBadge}>✓ KYC</span>}
                    <span className={styles.dropdownDate}>
                      · {formatDate(currentDraft.updated_at)}
                    </span>
                  </>
                ) : (
                  'Select a draft...'
                )}
              </span>
              <span className={styles.dropdownArrow}>▼</span>
            </button>

            {showDropdown && (
              <div className={styles.dropdownMenu}>
                {drafts.map((draft) => (
                  <div key={draft.draft_name} className={styles.draftItem}>
                    <div 
                      className={`${styles.draftInfo} ${draft.draft_name === currentDraftName ? styles.active : ''}`}
                      onClick={() => {
                        onLoad(draft);
                        setShowDropdown(false);
                      }}
                    >
                      <div className={styles.draftName}>
                        {draft.title || 'Untitled'}
                        {draft.kyc_verified && <span className={styles.kycBadge}>✓ KYC</span>}
                      </div>
                      <div className={styles.draftMeta}>
                        <span className={styles.draftDate}>
                          {formatDate(draft.updated_at)}
                        </span>
                        <span className={styles.draftType}>
                          {draft.proposal_type === 'timelock_v1' ? 'TimelockV1' : 'Standard'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className={styles.deleteButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete this draft: "${draft.title || 'Untitled'}"?`)) {
                          onDelete(draft.draft_name);
                        }
                      }}
                      disabled={disabled}
                      title="Delete draft"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {currentDraft && (
            <div className={styles.autoSaveIndicator}>
              💾 Auto-saving as you type...
            </div>
          )}
        </div>
      )}
    </div>
  );
}

