/**
 * CandidateActions Component
 * 
 * Display actions for a proposal candidate
 */

'use client';

import { useMemo, memo } from 'react';
import type { Candidate } from '../../../utils/types/camp';
import { interpreterRegistry, type InterpretedTransaction } from '../../../utils/helpers/transactionInterpreter';
import { useBatchENS } from '../../../utils/hooks/useBatchENS';
import { ActionDisplay } from '../../ProposalsTab/components/ActionDisplay';
import styles from './CandidateActions.module.css';

interface CandidateActionsProps {
  candidate: Candidate;
}

/**
 * Convert candidate actions to transaction contexts
 */
function convertCandidateToContexts(candidate: Candidate): Array<{
  target: string;
  value: string;
  signature: string;
  calldata: string;
}> {
  const { targets, values, signatures, calldatas } = candidate;
  
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

function CandidateActions({ candidate }: CandidateActionsProps) {
  // Convert candidate actions to transaction contexts
  const contexts = useMemo(() => convertCandidateToContexts(candidate), [candidate]);
  
  // Interpret all transactions
  const interpretedActions: InterpretedTransaction[] = useMemo(() => {
    const actions = contexts.map(context => interpreterRegistry.interpret(context));
    
    // Cross-reference: Find stream creations and mark related WETH transfers
    const streamAddresses = new Map<string, number>();
    
    actions.forEach((action, index) => {
      if (action.category === 'stream' && action.functionName === 'createStream') {
        const predictedParam = action.parameters.find(p => p.name === 'predictedStreamAddress');
        if (predictedParam && typeof predictedParam.value === 'string') {
          streamAddresses.set(predictedParam.value.toLowerCase(), index);
        }
      }
    });
    
    // Update transfers/payments that are funding streams
    actions.forEach((action, index) => {
      const isPayment = 
        (action.functionName === 'transfer' && action.category === 'payment') ||
        (action.functionName === 'sendOrRegisterDebt');
      
      if (isPayment) {
        const recipientParam = action.parameters.find(p => 
          p.name === 'recipient' || p.name === 'account'
        );
        
        if (recipientParam && typeof recipientParam.value === 'string') {
          const recipientAddr = recipientParam.value.toLowerCase();
          const streamIndex = streamAddresses.get(recipientAddr);
          
          if (streamIndex !== undefined) {
            action.category = 'stream';
            action.functionDescription = 'Fund payment stream';
            recipientParam.recipientRole = `Stream Contract (funding action #${streamIndex + 1})`;
            
            const amountParam = action.parameters.find(p => p.name === 'amount');
            if (amountParam) {
              let displayAmount = amountParam.displayValue || '';
              const match = displayAmount.match(/\(([^)]+)\)/);
              if (match) {
                displayAmount = match[1];
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
          <h3 className={styles.title}>Candidate Actions</h3>
          <span className={styles.count}>0</span>
        </div>
        <div className={styles.empty}>
          <p>This candidate contains no on-chain actions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.actionsContainer}>
      <div className={styles.header}>
        <h3 className={styles.title}>Candidate Actions</h3>
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
          These actions will be executed if the candidate becomes a proposal and passes.
        </p>
      </div>
    </div>
  );
}

export default memo(CandidateActions);

