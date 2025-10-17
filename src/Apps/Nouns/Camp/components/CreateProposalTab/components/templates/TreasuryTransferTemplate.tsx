/**
 * TreasuryTransferTemplate
 * Form for treasury transfer actions (ETH and ERC20 tokens)
 */

'use client';

import React, { useState } from 'react';
import { ActionTemplate, TemplateFieldValues, TokenInfo, formatUnits } from '@/src/Apps/Nouns/Camp/utils/actionTemplates';
import { useTreasuryBalances, useCustomTokenBalance } from '@/src/Apps/Nouns/Camp/utils/hooks/useTreasuryBalances';
import { Address } from 'viem';
import styles from './TreasuryTransferTemplate.module.css';

interface ValidationError {
  field: string;
  message: string;
}

interface TreasuryTransferTemplateProps {
  template: ActionTemplate;
  fieldValues: TemplateFieldValues;
  onUpdateField: (fieldName: string, value: string) => void;
  validationErrors: ValidationError[];
  disabled?: boolean;
}

export function TreasuryTransferTemplate({
  template,
  fieldValues,
  onUpdateField,
  validationErrors,
  disabled = false,
}: TreasuryTransferTemplateProps) {
  const { eth, tokens, isLoading } = useTreasuryBalances();
  const [customTokenAddress, setCustomTokenAddress] = useState<Address | null>(null);
  const { tokenInfo: customToken, isLoading: isLoadingCustom } = useCustomTokenBalance(customTokenAddress);

  const isCustomERC20 = template.id === 'treasury-erc20-custom';

  // Serialize token info without BigInt (convert to string)
  const serializeToken = (token: TokenInfo): string => {
    return JSON.stringify({
      symbol: token.symbol,
      address: token.address,
      decimals: token.decimals,
      balance: token.balance?.toString() // Convert BigInt to string
    });
  };

  // Deserialize token info (convert balance string back to BigInt)
  const deserializeToken = (tokenStr: string): TokenInfo => {
    const parsed = JSON.parse(tokenStr);
    return {
      ...parsed,
      balance: parsed.balance ? BigInt(parsed.balance) : undefined
    };
  };

  // Handle token selection for custom ERC20
  const handleTokenSelect = (value: string) => {
    if (value === 'custom') {
      // User wants to enter custom address
      setCustomTokenAddress(null);
      onUpdateField('token', '');
    } else {
      // Selected from common tokens
      onUpdateField('token', value);
    }
  };

  // Handle custom token address input
  const handleCustomTokenAddress = (address: string) => {
    if (address.length === 42 && address.startsWith('0x')) {
      setCustomTokenAddress(address as Address);
    } else {
      setCustomTokenAddress(null);
    }
  };

  // Get balance display for selected token
  const getBalanceDisplay = () => {
    if (template.id === 'treasury-eth') {
      if (isLoading) return 'Loading...';
      if (eth === null) return 'Unknown';
      return `${formatUnits(eth, 18)} ETH`;
    }

    if (template.id === 'treasury-usdc') {
      if (isLoading) return 'Loading...';
      const usdc = tokens.find(t => t.symbol === 'USDC');
      if (!usdc || !usdc.balance) return 'Unknown';
      return `${formatUnits(usdc.balance, 6)} USDC`;
    }

    if (template.id === 'treasury-weth') {
      if (isLoading) return 'Loading...';
      const weth = tokens.find(t => t.symbol === 'WETH');
      if (!weth || !weth.balance) return 'Unknown';
      return `${formatUnits(weth.balance, 18)} WETH`;
    }

    if (isCustomERC20 && fieldValues.token) {
      try {
        const tokenData = deserializeToken(fieldValues.token);
        if (tokenData.balance) {
          return `${formatUnits(tokenData.balance, tokenData.decimals)} ${tokenData.symbol}`;
        }
      } catch {
        // Ignore parse errors
      }
    }

    return null;
  };

  const balance = getBalanceDisplay();

  return (
    <div className={styles.container}>
      {/* Custom ERC20 Token Selector */}
      {isCustomERC20 && (
        <div className={styles.inputGroup}>
          <label className={styles.label}>
            Token
            <span className={styles.required}> *</span>
          </label>
          <select
            className={styles.select}
            value={fieldValues.token ? 'selected' : ''}
            onChange={(e) => handleTokenSelect(e.target.value)}
            disabled={disabled}
          >
            <option value="">Select token...</option>
            <optgroup label="Treasury Holdings">
              {tokens.map(token => (
                <option key={token.address} value={serializeToken(token)}>
                  {token.symbol} ({formatUnits(token.balance || BigInt(0), token.decimals)})
                </option>
              ))}
            </optgroup>
            <option value="custom">Custom Token Address...</option>
          </select>

          {/* Custom token address input */}
          {fieldValues.token === '' && (
            <input
              type="text"
              className={styles.input}
              placeholder="0x... (token contract address)"
              onChange={(e) => {
                handleCustomTokenAddress(e.target.value);
                onUpdateField('token', e.target.value);
              }}
              disabled={disabled}
            />
          )}

          {isLoadingCustom && (
            <div className={styles.loading}>Loading token info...</div>
          )}

          {customToken && (
            <div className={styles.tokenInfo}>
              {customToken.symbol} • {customToken.decimals} decimals • 
              Balance: {formatUnits(customToken.balance || BigInt(0), customToken.decimals)}
            </div>
          )}
        </div>
      )}

      {/* Recipient Address */}
      <div className={styles.inputGroup}>
        <label className={styles.label}>
          Recipient Address
          <span className={styles.required}> *</span>
        </label>
        <input
          type="text"
          className={styles.input}
          value={fieldValues.recipient || ''}
          onChange={(e) => onUpdateField('recipient', e.target.value)}
          placeholder="0x... or ENS name"
          disabled={disabled}
        />
        <div className={styles.helpText}>
          Address that will receive the funds
        </div>
        {validationErrors.find(err => err.field === 'recipient') && (
          <div className={styles.error}>
            {validationErrors.find(err => err.field === 'recipient')?.message}
          </div>
        )}
      </div>

      {/* Amount */}
      <div className={styles.inputGroup}>
        <label className={styles.label}>
          Amount
          <span className={styles.required}> *</span>
        </label>
        <input
          type="text"
          className={styles.input}
          value={fieldValues.amount || ''}
          onChange={(e) => onUpdateField('amount', e.target.value)}
          placeholder="0.0"
          disabled={disabled}
        />
        {balance && (
          <div className={styles.balanceDisplay}>
            Treasury Balance: <span className={styles.balanceAmount}>{balance}</span>
          </div>
        )}
        <div className={styles.helpText}>
          Amount to send from treasury
        </div>
        {validationErrors.find(err => err.field === 'amount') && (
          <div className={styles.error}>
            {validationErrors.find(err => err.field === 'amount')?.message}
          </div>
        )}
      </div>
    </div>
  );
}

