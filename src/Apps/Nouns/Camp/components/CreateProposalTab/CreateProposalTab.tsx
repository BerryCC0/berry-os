/**
 * CreateProposalTab Component
 * Main proposal creation interface for Camp
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { GovernanceActions } from '@/app/lib/Nouns/Contracts';
import { useWriteContract } from 'wagmi';
import { ProposalDraft, ProposalAction } from '@/app/lib/Persistence/proposalDrafts';
import { PersonaKYC } from './components/PersonaKYC';
import { ActionTemplateEditor } from './components/ActionTemplateEditor';
import { MarkdownEditor } from './components/MarkdownEditor';
import { DraftSelector } from './components/DraftSelector';
import { eventBus } from '@/src/OS/lib/eventBus';
import styles from './CreateProposalTab.module.css';

interface CreateProposalTabProps {
  onBack?: () => void;
}

type ProposalState = 'idle' | 'confirming' | 'pending' | 'error' | 'success';

export default function CreateProposalTab({ onBack }: CreateProposalTabProps) {
  const { address, isConnected } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();

  // Form state
  const [draftName, setDraftName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [actions, setActions] = useState<ProposalAction[]>([
    { target: '', value: '0', signature: '', calldata: '0x' }
  ]);
  const [proposalType, setProposalType] = useState<'standard' | 'timelock_v1'>('standard');
  
  // UI state
  const [proposalState, setProposalState] = useState<ProposalState>('idle');
  const [timelockV1State, setTimelockV1State] = useState<ProposalState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [kycVerified, setKycVerified] = useState(false);
  const [kycInquiryId, setKycInquiryId] = useState<string | undefined>();
  
  // Draft management
  const [drafts, setDrafts] = useState<ProposalDraft[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load drafts on mount and select the most recent one
  useEffect(() => {
    if (address) {
      loadUserDrafts();
    }
  }, [address]);

  // Auto-load most recent draft when drafts are loaded
  useEffect(() => {
    if (drafts.length > 0 && !draftName && address) {
      // Load the most recent draft (first in list, sorted by updated_at DESC)
      const mostRecent = drafts[0];
      handleLoadDraft(mostRecent);
    }
  }, [drafts.length, address]);

  // Auto-save draft as user types (debounced)
  useEffect(() => {
    if (!address || !title.trim()) {
      // Don't auto-save if no wallet connected or no title
      return;
    }

    // Generate draft name from title (slugified)
    const generatedDraftName = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);

    if (!generatedDraftName) return;

    // Debounce auto-save by 2 seconds
    const timeoutId = setTimeout(() => {
      const draft: ProposalDraft = {
        wallet_address: address,
        draft_name: generatedDraftName,
        title,
        description,
        actions,
        proposal_type: proposalType,
        kyc_verified: kycVerified,
        kyc_inquiry_id: kycInquiryId,
      };

      // Auto-save silently in background
      fetch('/api/proposals/drafts/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })
        .then(() => {
          // Update draft name if it changed
          if (draftName !== generatedDraftName) {
            setDraftName(generatedDraftName);
          }
          // Reload drafts list to show updated timestamp
          loadUserDrafts();
        })
        .catch(err => {
          console.error('Auto-save failed:', err);
        });
    }, 2000); // 2 second debounce

    return () => clearTimeout(timeoutId);
  }, [title, description, actions, proposalType, kycVerified, kycInquiryId, address]);

  // Listen for menu actions
  useEffect(() => {
    const newSub = eventBus.subscribe('CAMP_NEW_PROPOSAL', () => {
      handleNewDraft();
    });

    return () => {
      newSub.unsubscribe();
    };
  }, []);

  const loadUserDrafts = async () => {
    if (!address) return;
    
    try {
      const response = await fetch(`/api/proposals/drafts/load?wallet=${address}`);
      const data = await response.json();
      
      if (data.success && data.drafts) {
        setDrafts(data.drafts);
      }
    } catch (error) {
      console.error('Failed to load drafts:', error);
    }
  };

  const handleSaveDraft = async () => {
    if (!address) {
      setErrorMessage('Please connect your wallet to save drafts');
      return;
    }

    if (!draftName.trim()) {
      setErrorMessage('Please enter a draft name');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const draft: ProposalDraft = {
        wallet_address: address,
        draft_name: draftName.trim(),
        title,
        description,
        actions,
        proposal_type: proposalType,
        kyc_verified: kycVerified,
        kyc_inquiry_id: kycInquiryId,
      };

      const response = await fetch('/api/proposals/drafts/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });

      const data = await response.json();

      if (data.success) {
        await loadUserDrafts();
        setErrorMessage(null);
        // Show success message briefly
        const successMsg = errorMessage;
        setErrorMessage('Draft saved successfully!');
        setTimeout(() => {
          if (errorMessage === 'Draft saved successfully!') {
            setErrorMessage(successMsg);
          }
        }, 3000);
      } else {
        setErrorMessage(data.error || 'Failed to save draft');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      setErrorMessage('Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadDraft = (draft: ProposalDraft) => {
    setDraftName(draft.draft_name);
    setTitle(draft.title);
    setDescription(draft.description);
    setActions(draft.actions.length > 0 ? draft.actions : [{ target: '', value: '0', signature: '', calldata: '0x' }]);
    setProposalType(draft.proposal_type);
    setKycVerified(draft.kyc_verified);
    setKycInquiryId(draft.kyc_inquiry_id);
    setErrorMessage(null);
  };

  const handleDeleteDraft = async (draftNameToDelete: string) => {
    if (!address) return;

    try {
      const response = await fetch(`/api/proposals/drafts/delete?wallet=${address}&name=${encodeURIComponent(draftNameToDelete)}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await loadUserDrafts();
        
        // Clear form if deleting current draft
        if (draftName === draftNameToDelete) {
          handleNewDraft();
        }
      } else {
        setErrorMessage(data.error || 'Failed to delete draft');
      }
    } catch (error) {
      console.error('Error deleting draft:', error);
      setErrorMessage('Failed to delete draft');
    }
  };

  const handleNewDraft = () => {
    // Don't clear draftName - it will be auto-generated from title
    setTitle('');
    setDescription('');
    setActions([{ target: '', value: '0', signature: '', calldata: '0x' }]);
    setProposalType('standard');
    setKycVerified(false);
    setKycInquiryId(undefined);
    setErrorMessage(null);
    setProposalState('idle');
    setTimelockV1State('idle');
  };

  const handleKYCComplete = (data: { inquiryId: string; status: string; fields: Record<string, unknown> }) => {
    setKycVerified(true);
    setKycInquiryId(data.inquiryId);
    setErrorMessage(null);
  };

  const handleKYCError = () => {
    setKycVerified(false);
    setErrorMessage('KYC verification failed. Please try again.');
  };

  const addAction = () => {
    setActions([...actions, { target: '', value: '0', signature: '', calldata: '0x' }]);
  };

  const removeAction = (index: number) => {
    if (actions.length > 1) {
      setActions(actions.filter((_, i) => i !== index));
    }
  };

  const updateAction = (index: number, field: string, value: string) => {
    const updatedActions = [...actions];
    updatedActions[index] = { ...updatedActions[index], [field]: value };
    setActions(updatedActions);
  };

  // Handle multi-action templates (e.g., Noun swap)
  const handleActionsGenerated = React.useCallback((index: number, generatedActions: ProposalAction[]) => {
    if (generatedActions.length <= 1) return;

    setActions(prevActions => {
      // Replace the action at index with multiple actions
      const updatedActions = [...prevActions];
      updatedActions.splice(index, 1, ...generatedActions);
      return updatedActions;
    });
  }, []);

  const validateForm = (requireKYC: boolean = true) => {
    if (!title.trim()) {
      setErrorMessage('Title is required');
      return false;
    }

    if (!description.trim()) {
      setErrorMessage('Description is required');
      return false;
    }

    if (requireKYC && !kycVerified) {
      setErrorMessage('Please complete KYC verification before creating a proposal');
      return false;
    }

    // Validate each action
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      if (!action.target.trim()) {
        setErrorMessage(`Action ${i + 1}: Target address is required`);
        return false;
      }

      // Basic address validation
      if (!/^0x[a-fA-F0-9]{40}$/.test(action.target)) {
        setErrorMessage(`Action ${i + 1}: Invalid target address format`);
        return false;
      }

      // Validate value is a number
      if (isNaN(Number(action.value))) {
        setErrorMessage(`Action ${i + 1}: Value must be a valid number`);
        return false;
      }
    }

    return true;
  };

  const handleSubmitProposal = async (isTimelockV1: boolean = false) => {
    if (!validateForm()) {
      return;
    }

    setErrorMessage(null);
    const setState = isTimelockV1 ? setTimelockV1State : setProposalState;
    setState('confirming');

    try {
      // Prepare proposal data
      const targets = actions.map(action => action.target as `0x${string}`);
      const values = actions.map(action => BigInt(action.value));
      const signatures = actions.map(action => action.signature);
      const calldatas = actions.map(action => {
        const data = action.calldata;
        return (data.startsWith('0x') ? data : `0x${data}`) as `0x${string}`;
      });
      const fullDescription = `# ${title}\n\n${description}`;

      // Create proposal config
      const config = isTimelockV1
        ? GovernanceActions.proposeOnTimelockV1(targets, values, signatures, calldatas, fullDescription)
        : GovernanceActions.propose(targets, values, signatures, calldatas, fullDescription);

      setState('pending');
      await writeContractAsync(config as any);

      setState('success');
      setErrorMessage(null);

      // Clear form on success
      setTimeout(() => {
        handleNewDraft();
      }, 3000);
    } catch (err: unknown) {
      setState('error');

      if (err instanceof Error) {
        if (err.message.includes('user rejected')) {
          setErrorMessage('Transaction was rejected');
        } else if (err.message.includes('insufficient funds')) {
          setErrorMessage('Insufficient funds for transaction');
        } else {
          setErrorMessage(err.message);
        }
      } else {
        setErrorMessage('Failed to create proposal. Please try again.');
      }
    }
  };

  const isCreating = isPending || proposalState === 'pending' || timelockV1State === 'pending';

  return (
    <div className={styles.container}>
      {onBack && (
        <button className={styles.backButton} onClick={onBack}>
          ← Back
        </button>
      )}

      <div className={styles.header}>
        <h2 className={styles.title}>Create Proposal</h2>
      </div>

      {!isConnected && (
        <div className={styles.warning}>
          Please connect your wallet to create a proposal.
        </div>
      )}

      <div className={styles.form}>
        {/* Draft Management */}
        <DraftSelector
          drafts={drafts}
          onLoad={handleLoadDraft}
          onDelete={handleDeleteDraft}
          onNew={handleNewDraft}
          disabled={isCreating}
          currentDraftName={draftName}
        />

        {/* Proposal Type */}
        <div className={styles.section}>
          <label className={styles.label}>Proposal Type *</label>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                value="standard"
                checked={proposalType === 'standard'}
                onChange={(e) => setProposalType(e.target.value as 'standard')}
                disabled={isCreating}
              />
              <span>Standard Proposal</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                value="timelock_v1"
                checked={proposalType === 'timelock_v1'}
                onChange={(e) => setProposalType(e.target.value as 'timelock_v1')}
                disabled={isCreating}
              />
              <span>TimelockV1 Proposal</span>
            </label>
          </div>
        </div>

        {/* Title */}
        <div className={styles.section}>
          <label className={styles.label}>Proposal Title *</label>
          <input
            type="text"
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a clear, descriptive title for your proposal"
            disabled={isCreating}
            maxLength={200}
          />
        </div>

        {/* Two Column Layout */}
        <div className={styles.twoColumnLayout}>
          {/* Left Column: Description */}
          <div className={styles.leftColumn}>
            <div className={styles.section}>
              <label className={styles.label}>Description *</label>
              <MarkdownEditor
                value={description}
                onChange={setDescription}
                disabled={isCreating}
                rows={10}
              />
            </div>
          </div>

          {/* Right Column: Actions + KYC */}
          <div className={styles.rightColumn}>
            {/* Actions */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <label className={styles.label}>Actions</label>
                <button
                  type="button"
                  className={styles.addButton}
                  onClick={addAction}
                  disabled={isCreating}
                >
                  + Add Action
                </button>
              </div>

              {actions.map((action, index) => (
                <div key={index} className={styles.actionContainer}>
                  {actions.length > 1 && (
                    <button
                      type="button"
                      className={styles.removeActionButton}
                      onClick={() => removeAction(index)}
                      disabled={isCreating}
                      title="Remove this action"
                    >
                      ×
                    </button>
                  )}
                  <ActionTemplateEditor
                    index={index}
                    action={action}
                    onUpdate={(field, value) => updateAction(index, field, value)}
                    onActionsGenerated={(generatedActions) => handleActionsGenerated(index, generatedActions)}
                    disabled={isCreating}
                  />
                </div>
              ))}
            </div>

            {/* KYC Verification */}
            {isConnected && (
              <PersonaKYC
                onComplete={handleKYCComplete}
                onError={handleKYCError}
                disabled={isCreating}
                walletAddress={address}
                proposalTitle={title}
              />
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className={styles.submitSection}>
          <button
            className={`${styles.submitButton} ${proposalType === 'timelock_v1' ? styles.primaryButton : ''}`}
            onClick={() => handleSubmitProposal(proposalType === 'timelock_v1')}
            disabled={isCreating || !kycVerified || !isConnected}
            title={!kycVerified ? 'Please complete KYC verification first' : ''}
          >
            {isCreating 
              ? 'Creating...' 
              : proposalType === 'timelock_v1' 
                ? '📜 Propose on TimelockV1' 
                : '📋 Create Proposal'}
          </button>
        </div>

        {/* Error/Success Messages */}
        {errorMessage && (
          <div className={errorMessage.includes('successfully') ? styles.success : styles.error}>
            {errorMessage}
          </div>
        )}

        {proposalState === 'success' && (
          <div className={styles.success}>
            Your proposal has been successfully created! It will appear in the proposals list once confirmed on-chain.
          </div>
        )}

        {timelockV1State === 'success' && (
          <div className={styles.success}>
            Your TimelockV1 proposal has been successfully created! It will appear in the proposals list once confirmed on-chain.
          </div>
        )}
      </div>
    </div>
  );
}

