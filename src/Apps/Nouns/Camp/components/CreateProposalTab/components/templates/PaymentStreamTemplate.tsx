/**
 * PaymentStreamTemplate
 * Form for creating payment streams via StreamFactory
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ActionTemplate, TemplateFieldValues, TokenInfo } from '@/src/Apps/Nouns/Camp/utils/actionTemplates';
import Select from '@/src/OS/components/UI/Select/Select';
import DatePicker from '@/src/OS/components/UI/DatePicker/DatePicker';
import styles from './TreasuryTransferTemplate.module.css'; // Reuse styles

interface ValidationError {
  field: string;
  message: string;
}

interface PaymentStreamTemplateProps {
  template: ActionTemplate;
  fieldValues: TemplateFieldValues;
  onUpdateField: (fieldName: string, value: string) => void;
  validationErrors: ValidationError[];
  disabled?: boolean;
}

export function PaymentStreamTemplate({
  template,
  fieldValues,
  onUpdateField,
  validationErrors,
  disabled = false,
}: PaymentStreamTemplateProps) {
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);

  // Fetch Nouns Treasury tokens
  useEffect(() => {
    async function fetchTokens() {
      setIsLoadingTokens(true);
      try {
        const response = await fetch('/api/treasury/tokens');
        const data = await response.json();
        if (data.tokens) {
          setTokens(data.tokens);
        }
      } catch (error) {
        console.error('Failed to fetch treasury tokens:', error);
      } finally {
        setIsLoadingTokens(false);
      }
    }
    fetchTokens();
  }, []);

  const tokenOptions = tokens.map(token => ({
    value: token.address,
    label: `${token.symbol} (${token.name || 'Unknown'})`,
  }));

  // Validation: start date must be before end date
  const startDate = fieldValues.startDate;
  const endDate = fieldValues.endDate;
  const hasDateError = startDate && endDate && new Date(startDate) >= new Date(endDate);

  // Validation: dates should be in the future
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const todayString = now.toISOString().split('T')[0];
  const startInPast = startDate && startDate < todayString;
  const endInPast = endDate && endDate < todayString;

  return (
    <div className={styles.container}>
      <div className={styles.inputGroup}>
        <label className={styles.label}>
          Recipient Address <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          className={styles.input}
          value={fieldValues.recipient || ''}
          onChange={(e) => onUpdateField('recipient', e.target.value)}
          placeholder="0x..."
          disabled={disabled}
        />
        {validationErrors.find(err => err.field === 'recipient') && (
          <div className={styles.error}>
            {validationErrors.find(err => err.field === 'recipient')?.message}
          </div>
        )}
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label}>
          Token <span className={styles.required}>*</span>
        </label>
        {isLoadingTokens ? (
          <div className={styles.helpText}>Loading Nouns Treasury tokens...</div>
        ) : (
          <Select
            options={tokenOptions}
            value={fieldValues.tokenAddress || ''}
            onChange={(value) => onUpdateField('tokenAddress', value)}
            placeholder="Select token..."
            disabled={disabled}
          />
        )}
        <div className={styles.helpText}>
          Select from tokens held by Nouns DAO Treasury
        </div>
        {validationErrors.find(err => err.field === 'tokenAddress') && (
          <div className={styles.error}>
            {validationErrors.find(err => err.field === 'tokenAddress')?.message}
          </div>
        )}
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label}>
          Total Amount <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          className={styles.input}
          value={fieldValues.amount || ''}
          onChange={(e) => onUpdateField('amount', e.target.value)}
          placeholder="1000"
          disabled={disabled}
        />
        <div className={styles.helpText}>
          Total amount to stream (will be paid out gradually over the period)
        </div>
        {validationErrors.find(err => err.field === 'amount') && (
          <div className={styles.error}>
            {validationErrors.find(err => err.field === 'amount')?.message}
          </div>
        )}
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label}>
          Start Date <span className={styles.required}>*</span>
        </label>
        <DatePicker
          value={fieldValues.startDate || ''}
          onChange={(value) => onUpdateField('startDate', value)}
          placeholder="Select start date..."
          minDate={todayString}
          disabled={disabled}
        />
        {startInPast && (
          <div className={styles.warning}>
            ⚠️ Warning: Start date is in the past
          </div>
        )}
        {validationErrors.find(err => err.field === 'startDate') && (
          <div className={styles.error}>
            {validationErrors.find(err => err.field === 'startDate')?.message}
          </div>
        )}
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label}>
          End Date <span className={styles.required}>*</span>
        </label>
        <DatePicker
          value={fieldValues.endDate || ''}
          onChange={(value) => onUpdateField('endDate', value)}
          placeholder="Select end date..."
          minDate={startDate || todayString}
          disabled={disabled}
        />
        {endInPast && (
          <div className={styles.warning}>
            ⚠️ Warning: End date is in the past
          </div>
        )}
        {hasDateError && (
          <div className={styles.error}>
            End date must be after start date
          </div>
        )}
        {validationErrors.find(err => err.field === 'endDate') && (
          <div className={styles.error}>
            {validationErrors.find(err => err.field === 'endDate')?.message}
          </div>
        )}
      </div>
    </div>
  );
}

