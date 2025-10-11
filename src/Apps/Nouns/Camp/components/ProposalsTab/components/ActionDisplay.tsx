/**
 * ActionDisplay Component
 * 
 * Generic, reusable component for displaying interpreted transactions
 * Adapts display based on transaction context and category
 */

'use client';

import { useState, useMemo } from 'react';
import type { InterpretedTransaction } from '../../../utils/helpers/transactionInterpreter';
import styles from './ProposalActions.module.css';

interface ActionDisplayProps {
  action: InterpretedTransaction;
  index: number;
  ensMap: Map<string, string | null>;
}

/**
 * Format parameter value with ENS if applicable
 */
function ParameterValue({ param, ensName }: { param: any; ensName?: string | null }) {
  // Address with ENS
  if (param.format === 'address' && param.isRecipient) {
    return (
      <div className={styles.paramValueWithENS}>
        {ensName ? (
          <>
            <span className={styles.ensName}>{ensName}</span>
            <span className={styles.addressSecondary} title={param.value}>
              {param.value}
            </span>
          </>
        ) : (
          <span className={styles.addressValue} title={param.value}>
            {param.value}
          </span>
        )}
        {param.recipientRole && (
          <span className={styles.recipientRole}>({param.recipientRole})</span>
        )}
      </div>
    );
  }
  
  // Regular parameter
  return <code className={styles.paramValue}>{param.displayValue}</code>;
}

export function ActionDisplay({ action, index, ensMap }: ActionDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Get severity styling
  const severityClass = useMemo(() => {
    if (action.severity === 'critical') return styles.severityCritical;
    if (action.severity === 'elevated') return styles.severityElevated;
    return '';
  }, [action.severity]);
  
  // Check if this is an ETH transfer (no function, has value)
  const isEthTransfer = !action.functionName && action.value && action.value !== '0';
  
  // Get ENS for target (if ETH transfer)
  const targetEnsName = isEthTransfer ? ensMap.get(action.target.toLowerCase()) : null;
  
  // Enhanced summary with ENS
  const displaySummary = useMemo(() => {
    let summary = action.summary;
    
    // Replace ETH transfer target with ENS
    if (isEthTransfer && targetEnsName) {
      const truncatedAddress = `${action.target.substring(0, 6)}...${action.target.substring(38)}`;
      summary = summary.replace(truncatedAddress, targetEnsName);
    }
    
    // Replace recipient addresses in parameters with ENS
    action.parameters.forEach(param => {
      if (param.isRecipient && typeof param.value === 'string') {
        const address = param.value;
        const ensName = ensMap.get(address.toLowerCase());
        if (ensName) {
          const truncatedAddress = `${address.substring(0, 6)}...${address.substring(38)}`;
          summary = summary.replace(truncatedAddress, ensName);
        }
      }
    });
    
    return summary;
  }, [action.summary, action.parameters, action.target, isEthTransfer, targetEnsName, ensMap]);
  
  return (
    <div className={`${styles.actionItem} ${severityClass}`}>
      {/* Action Header */}
      <button
        className={styles.actionHeader}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <div className={styles.actionHeaderLeft}>
          <span className={styles.actionNumber}>#{index + 1}</span>
          <span className={styles.actionDescription}>{displaySummary}</span>
        </div>
        <span className={styles.expandIcon}>{isExpanded ? '−' : '+'}</span>
      </button>

      {/* Action Details (Expanded) */}
      {isExpanded && (
        <div className={styles.actionDetails}>
          {/* Contract Info */}
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Contract:</span>
            <div className={styles.detailValue}>
              {isEthTransfer ? (
                // ETH Transfer recipient
                <>
                  {targetEnsName ? (
                    <>
                      <span className={styles.contractName} style={{ color: 'var(--theme-highlight, #000080)' }}>
                        {targetEnsName}
                        <span className={styles.badge}>Recipient</span>
                      </span>
                      <span className={styles.address} title={action.target}>
                        {action.target}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className={styles.contractName}>Recipient</span>
                      <span className={styles.address} title={action.target}>
                        {action.target}
                      </span>
                    </>
                  )}
                </>
              ) : (
                // Contract call
                <>
                  <span className={styles.contractName}>
                    {action.contractName}
                    {action.isKnownContract && <span className={styles.badge}>Nouns Contract</span>}
                  </span>
                  {action.contractDescription && (
                    <span className={styles.contractDescription}>{action.contractDescription}</span>
                  )}
                  <span className={styles.address} title={action.target}>
                    {action.target}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* ETH Value (if present) */}
          {action.valueFormatted !== '0 ETH' && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Value:</span>
              <span className={styles.detailValue}>{action.valueFormatted}</span>
            </div>
          )}

          {/* Function Info */}
          {action.functionName && (
            <>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Function:</span>
                <div className={styles.detailValue}>
                  <code className={styles.code}>{action.functionSignature || action.functionName}</code>
                  {action.functionDescription && (
                    <span className={styles.functionDescription}>{action.functionDescription}</span>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Parameters */}
          {action.parameters.length > 0 && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Parameters:</span>
              <div className={styles.parameters}>
                {action.parameters.map((param, idx) => {
                  const ensName = param.isRecipient && typeof param.value === 'string'
                    ? ensMap.get(param.value.toLowerCase())
                    : null;
                  
                  return (
                    <div key={idx} className={styles.parameter}>
                      <div className={styles.paramHeader}>
                        <span className={styles.paramName}>{param.name}:</span>
                        <span className={styles.paramType}>{param.type}</span>
                        {param.isRecipient && <span className={styles.recipientBadge}>Recipient</span>}
                      </div>
                      <ParameterValue param={param} ensName={ensName} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Category Info */}
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Category:</span>
            <span className={styles.detailValue}>
              <span className={styles.categoryBadge} data-category={action.category}>
                {action.category}
              </span>
            </span>
          </div>

          {/* Calldata */}
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Calldata:</span>
            <div className={styles.calldataWrapper}>
              <code className={styles.calldata}>{action.calldata || '0x'}</code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

