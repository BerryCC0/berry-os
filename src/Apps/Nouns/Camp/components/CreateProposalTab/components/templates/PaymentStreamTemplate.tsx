/**
 * PaymentStreamTemplate
 * Form for creating payment streams via StreamFactory
 * 
 * Stream creation requires two transactions:
 * 1. createStream() - creates the stream contract at a predicted address
 * 2. sendERC20() - funds the stream by transferring tokens to it
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ActionTemplate, TemplateFieldValues, TokenInfo, COMMON_TOKENS, parseUnits } from '@/src/Apps/Nouns/Camp/utils/actionTemplates';
import Select from '@/src/OS/components/UI/Select/Select';
import DatePicker from '@/src/OS/components/UI/DatePicker/DatePicker';
import styles from './TreasuryTransferTemplate.module.css'; // Reuse styles

// Contract addresses
const NOUNS_TREASURY_ADDRESS = '0xb1a32FC9F9D8b2cf86C068Cae13108809547ef71';

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
  const [isComputingAddress, setIsComputingAddress] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  
  // Track the last computed input hash to prevent duplicate calls
  const lastComputedHashRef = useRef<string>('');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Compute predicted stream address when all required fields are filled
  const computePredictedAddress = useCallback(async () => {
    const { recipient, tokenAddress, amount, startDate, endDate } = fieldValues;
    
    // Check if all required fields are filled
    if (!recipient || !tokenAddress || !amount || !startDate || !endDate) {
      return;
    }

    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
      return;
    }

    // Create a hash of the input fields to prevent duplicate calls
    const inputHash = `${recipient}-${tokenAddress}-${amount}-${startDate}-${endDate}`;
    if (inputHash === lastComputedHashRef.current) {
      return; // Same inputs, don't recompute
    }

    setIsComputingAddress(true);
    setAddressError(null);

    try {
      // Get token decimals
      const token = COMMON_TOKENS.find(t => t.address.toLowerCase() === tokenAddress.toLowerCase());
      const decimals = token?.decimals || 18;
      const tokenAmount = parseUnits(amount, decimals);

      // Convert dates to timestamps
      const startTime = Math.floor(new Date(startDate).getTime() / 1000);
      const stopTime = Math.floor(new Date(endDate).getTime() / 1000);

      // Call our API endpoint (avoids CORS issues with direct RPC calls)
      const response = await fetch('/api/stream/predict-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          msgSender: NOUNS_TREASURY_ADDRESS,
          payer: NOUNS_TREASURY_ADDRESS,
          recipient,
          tokenAmount: tokenAmount.toString(),
          tokenAddress,
          startTime: startTime.toString(),
          stopTime: stopTime.toString()
        })
      });

      const result = await response.json();
      
      if (!response.ok || result.error) {
        throw new Error(result.error || 'Failed to predict stream address');
      }

      if (result.predictedAddress) {
        // Store the hash so we don't recompute for the same inputs
        lastComputedHashRef.current = inputHash;
        onUpdateField('streamAddress', result.predictedAddress);
      } else {
        throw new Error('Empty result from predictStreamAddress');
      }
    } catch (error) {
      console.error('Failed to compute predicted stream address:', error);
      setAddressError('Failed to compute stream address. You can enter it manually.');
    } finally {
      setIsComputingAddress(false);
    }
  }, [fieldValues.recipient, fieldValues.tokenAddress, fieldValues.amount, fieldValues.startDate, fieldValues.endDate, onUpdateField]);

  // Auto-compute when fields change (with debounce)
  useEffect(() => {
    const { recipient, tokenAddress, amount, startDate, endDate } = fieldValues;
    
    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    if (recipient && tokenAddress && amount && startDate && endDate) {
      // Debounce the computation by 500ms
      debounceTimerRef.current = setTimeout(() => {
        computePredictedAddress();
      }, 500);
    }
    
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [fieldValues.recipient, fieldValues.tokenAddress, fieldValues.amount, fieldValues.startDate, fieldValues.endDate, computePredictedAddress]);

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

      <div className={styles.inputGroup}>
        <label className={styles.label}>
          Predicted Stream Address <span className={styles.required}>*</span>
        </label>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className={styles.input}
            value={fieldValues.streamAddress || ''}
            onChange={(e) => onUpdateField('streamAddress', e.target.value)}
            placeholder={isComputingAddress ? 'Computing...' : '0x... (auto-computed when all fields are filled)'}
            disabled={disabled || isComputingAddress}
            style={{ fontFamily: 'monospace' }}
          />
          {isComputingAddress && (
            <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px' }}>⏳</span>
          )}
        </div>
        <div className={styles.helpText}>
          The deterministic address where the stream contract will be created.
        </div>
        {addressError && (
          <div className={styles.warning}>⚠️ {addressError}</div>
        )}
        {fieldValues.streamAddress && (
          <button
            type="button"
            onClick={computePredictedAddress}
            disabled={disabled || isComputingAddress}
            style={{ fontSize: '11px', marginTop: '4px', padding: '4px 8px', cursor: 'pointer' }}
          >
            🔄 Recompute
          </button>
        )}
        {validationErrors.find(err => err.field === 'streamAddress') && (
          <div className={styles.error}>
            {validationErrors.find(err => err.field === 'streamAddress')?.message}
          </div>
        )}
      </div>

      <div className={styles.helpText} style={{ marginTop: '16px', padding: '12px', background: '#f5f5f5', border: '1px solid #ccc' }}>
        <strong>ℹ️ How Payment Streams Work:</strong>
        <ol style={{ margin: '8px 0', paddingLeft: '20px', fontSize: '12px' }}>
          <li>The StreamFactory creates a stream contract at the predicted address</li>
          <li>Treasury transfers tokens to fund the stream</li>
          <li>Recipient withdraws tokens as they vest over time</li>
        </ol>
      </div>
    </div>
  );
}

