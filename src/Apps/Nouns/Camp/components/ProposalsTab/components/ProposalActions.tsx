/**
 * ProposalActions Component
 * 
 * Orchestrates proposal action interpretation and display
 * Uses the new interpreter system with batch ENS resolution
 */

'use client';

import { useMemo, memo } from 'react';
import type { Proposal } from '@/app/lib/Nouns/Goldsky/utils/types';
import { interpreterRegistry, type InterpretedTransaction } from '../../../utils/helpers/transactionInterpreter';
import { useBatchENS } from '../../../utils/hooks/useBatchENS';
import { ActionDisplay } from './ActionDisplay';
import styles from './ProposalActions.module.css';

interface ProposalActionsProps {
  proposal: Proposal;
}

/**
 * Convert proposal actions to transaction contexts
 */
function convertProposalToContexts(proposal: Proposal): Array<{
  target: string;
  value: string;
  signature: string;
  calldata: string;
}> {
  const { targets, values, signatures, calldatas } = proposal;
  
  if (!targets || !values || !signatures || !calldatas) {
    return [];
  }
  
  const length = Math.min(
    targets.length,
    values.length,
    signatures.length,
    calldatas.length
  );
  
  return Array.from({ length }, (_, i) => ({
    target: targets[i],
    value: values[i],
    signature: signatures[i],
    calldata: calldatas[i],
  }));
}

function ProposalActions({ proposal }: ProposalActionsProps) {
  // Convert proposal actions to transaction contexts
  const contexts = useMemo(() => convertProposalToContexts(proposal), [proposal]);
  
  // Interpret all transactions
  const interpretedActions: InterpretedTransaction[] = useMemo(() => {
    const actions = contexts.map(context => interpreterRegistry.interpret(context));
    
    // Cross-reference: Find stream creations and mark related WETH transfers
    const streamAddresses = new Map<string, number>(); // address -> action index
    
    actions.forEach((action, index) => {
      // Track predicted stream addresses
      if (action.category === 'stream' && action.functionName === 'createStream') {
        const predictedParam = action.parameters.find(p => p.name === 'predictedStreamAddress');
        if (predictedParam && typeof predictedParam.value === 'string') {
          streamAddresses.set(predictedParam.value.toLowerCase(), index);
        }
      }
    });
    
    // Update transfers/payments that are funding streams
    actions.forEach((action, index) => {
      // Check both ERC20 transfers and Payer sendOrRegisterDebt
      const isPayment = 
        (action.functionName === 'transfer' && action.category === 'payment') ||
        (action.functionName === 'sendOrRegisterDebt');
      
      if (isPayment) {
        // Find recipient parameter (could be 'recipient' or 'account' for Payer)
        const recipientParam = action.parameters.find(p => 
          p.name === 'recipient' || p.name === 'account'
        );
        
        if (recipientParam && typeof recipientParam.value === 'string') {
          const recipientAddr = recipientParam.value.toLowerCase();
          const streamIndex = streamAddresses.get(recipientAddr);
          
          if (streamIndex !== undefined) {
            // This payment is funding a stream!
            action.category = 'stream';
            action.functionDescription = 'Fund payment stream';
            recipientParam.recipientRole = `Stream Contract (funding action #${streamIndex + 1})`;
            
            // Update summary to reference the stream
            const amountParam = action.parameters.find(p => p.name === 'amount');
            if (amountParam) {
              // Extract just the formatted amount (e.g., "$9,000.00" from "9,000,000,000 ($9,000.00)")
              let displayAmount = amountParam.displayValue || '';
              const match = displayAmount.match(/\(([^)]+)\)/);
              if (match) {
                displayAmount = match[1]; // Get the value inside parentheses
              }
              action.summary = `Fund stream with ${displayAmount}`;
            }
          }
        }
      }
    });
    
    return actions;
  }, [contexts]);
  
  // Extract all addresses that need ENS resolution
  const addressesToResolve = useMemo(() => {
    const allAddresses = interpretedActions.flatMap(action => action.addressesToResolve);
    // Deduplicate
    return [...new Set(allAddresses.map(a => a.toLowerCase()))];
  }, [interpretedActions]);
  
  // Batch resolve ENS for all addresses
  const { ensMap, isLoading: ensLoading, progress } = useBatchENS(addressesToResolve, {
    enabled: addressesToResolve.length > 0,
    batchSize: 5,
    delayMs: 100,
  });
  
  if (interpretedActions.length === 0) {
    return (
      <div className={styles.actionsContainer}>
        <div className={styles.header}>
          <h3 className={styles.title}>Proposal Actions</h3>
          <span className={styles.count}>0</span>
        </div>
        <div className={styles.empty}>
          <p>This proposal contains no on-chain actions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.actionsContainer}>
      <div className={styles.header}>
        <h3 className={styles.title}>Proposal Actions</h3>
        <span className={styles.count}>{interpretedActions.length}</span>
        {ensLoading && addressesToResolve.length > 0 && (
          <span className={styles.ensProgress}>
            Resolving ENS names... {Math.round(progress * 100)}%
          </span>
        )}
      </div>

      <div className={styles.actionsList}>
        {interpretedActions.map((action, index) => (
          <ActionDisplay key={index} action={action} index={index} ensMap={ensMap} />
        ))}
      </div>

      <div className={styles.footer}>
        <p className={styles.footerText}>
          These actions will be executed if the proposal passes and is queued.
        </p>
      </div>
    </div>
  );
}

export default memo(ProposalActions);

