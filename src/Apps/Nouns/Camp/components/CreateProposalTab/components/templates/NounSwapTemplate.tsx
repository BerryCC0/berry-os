/**
 * NounSwapTemplate
 * Multi-action form for swapping Nouns with treasury
 * Features: Auto-detect wallet, visual Noun selection, multiple tip currencies
 */

'use client';

import React, { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ActionTemplate, TemplateFieldValues, ProposalAction, TREASURY_ADDRESS } from '@/src/Apps/Nouns/Camp/utils/actionTemplates';
import { useNounSelector } from '@/src/Apps/Nouns/Camp/utils/hooks/useNounSelector';
import { NounSelector } from './NounSelector';
import { Select } from '@/src/OS/components/UI';
import styles from './NounSwapTemplate.module.css';

interface ValidationError {
  field: string;
  message: string;
}

interface NounSwapTemplateProps {
  template: ActionTemplate;
  fieldValues: TemplateFieldValues;
  onUpdateField: (fieldName: string, value: string) => void;
  validationErrors: ValidationError[];
  generatedActions: ProposalAction[];
  disabled?: boolean;
}

export function NounSwapTemplate({
  template,
  fieldValues,
  onUpdateField,
  validationErrors,
  generatedActions,
  disabled = false,
}: NounSwapTemplateProps) {
  // Auto-detect connected wallet
  const { address, isConnected } = useAccount();

  // Fetch user's Nouns
  const { 
    nouns: userNouns, 
    loading: userNounsLoading 
  } = useNounSelector(address);

  // Fetch treasury Nouns
  const { 
    nouns: treasuryNouns, 
    loading: treasuryNounsLoading 
  } = useNounSelector(TREASURY_ADDRESS);

  // Auto-fill user address when wallet connects
  useEffect(() => {
    if (isConnected && address && !fieldValues.userAddress) {
      onUpdateField('userAddress', address);
    }
  }, [isConnected, address, fieldValues.userAddress, onUpdateField]);

  // Handle Noun selection
  const handleUserNounSelect = (nounId: string) => {
    onUpdateField('userNounId', nounId);
  };

  const handleTreasuryNounSelect = (nounId: string) => {
    onUpdateField('treasuryNounId', nounId);
  };

  // Tip currency options
  const tipCurrencyOptions = [
    { value: '', label: 'No Tip' },
    { value: 'eth', label: 'ETH' },
    { value: 'weth', label: 'WETH' },
    { value: 'usdc', label: 'USDC' },
  ];

  return (
    <div className={styles.container}>
      {/* User Address (auto-filled) */}
      <div className={styles.inputGroup}>
        <label className={styles.label}>
          Your Address
          <span className={styles.required}> *</span>
        </label>
        <input
          type="text"
          className={styles.input}
          value={fieldValues.userAddress || ''}
          onChange={(e) => onUpdateField('userAddress', e.target.value)}
          placeholder="0x... or ENS name"
          disabled={disabled}
        />
        <div className={styles.helpText}>
          {isConnected ? 'Auto-detected from connected wallet' : 'Your wallet address (must own the Noun)'}
        </div>
        {validationErrors.find(err => err.field === 'userAddress') && (
          <div className={styles.error}>
            {validationErrors.find(err => err.field === 'userAddress')?.message}
          </div>
        )}
      </div>

      {/* User Noun Selector */}
      <NounSelector
        nouns={userNouns}
        selectedId={fieldValues.userNounId || null}
        onSelect={handleUserNounSelect}
        label="Your Noun *"
        loading={userNounsLoading}
        disabled={disabled}
      />
      {validationErrors.find(err => err.field === 'userNounId') && (
        <div className={styles.error}>
          {validationErrors.find(err => err.field === 'userNounId')?.message}
        </div>
      )}

      {/* Treasury Noun Selector */}
      <NounSelector
        nouns={treasuryNouns}
        selectedId={fieldValues.treasuryNounId || null}
        onSelect={handleTreasuryNounSelect}
        label="Treasury Noun *"
        loading={treasuryNounsLoading}
        disabled={disabled}
      />
      {validationErrors.find(err => err.field === 'treasuryNounId') && (
        <div className={styles.error}>
          {validationErrors.find(err => err.field === 'treasuryNounId')?.message}
        </div>
      )}

      {/* Tip Section */}
      <div className={styles.tipSection}>
        <div className={styles.tipHeader}>Optional Tip</div>
        <div className={styles.tipDescription}>
          Add a tip to sweeten the deal
        </div>

        <div className={styles.tipFields}>
          {/* Tip Currency */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Currency</label>
            <Select
              options={tipCurrencyOptions}
              value={fieldValues.tipCurrency || ''}
              onChange={(value) => onUpdateField('tipCurrency', value)}
              disabled={disabled}
              placeholder="No Tip"
            />
          </div>

          {/* Tip Amount */}
          {fieldValues.tipCurrency && (
            <div className={styles.inputGroup}>
              <label className={styles.label}>Amount</label>
              <input
                type="text"
                className={styles.input}
                value={fieldValues.tipAmount || ''}
                onChange={(e) => onUpdateField('tipAmount', e.target.value)}
                placeholder="0.0"
                disabled={disabled}
              />
              <div className={styles.helpText}>
                Amount of {fieldValues.tipCurrency.toUpperCase()} to include
              </div>
              {validationErrors.find(err => err.field === 'tipAmount') && (
                <div className={styles.error}>
                  {validationErrors.find(err => err.field === 'tipAmount')?.message}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Preview of generated actions */}
      {generatedActions.length > 0 && (
        <div className={styles.previewSection}>
          <div className={styles.previewHeader}>Transaction Preview:</div>
          <div className={styles.previewList}>
            {generatedActions.map((action, idx) => (
              <div key={idx} className={styles.previewItem}>
                {idx + 1}. {action.signature || `Send ${action.value} ETH`}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
