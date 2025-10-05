/**
 * Executor UI - Shared UI component for rendering contract function forms
 */

'use client';

import styles from '../FunctionExecutor.module.css';
import { FunctionConfig, ParamConfig } from './BaseExecutor';

interface ExecutorUIProps {
  functionName: string;
  functionType: 'read' | 'write';
  config: FunctionConfig;
  inputs: Record<string, string>;
  result: any;
  error: string | null;
  hash?: `0x${string}`;
  isWritePending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  onInputChange: (paramName: string, value: string) => void;
  onExecute: () => void;
  onClose: () => void;
}

export default function ExecutorUI({
  functionName,
  functionType,
  config,
  inputs,
  result,
  error,
  hash,
  isWritePending,
  isConfirming,
  isConfirmed,
  onInputChange,
  onExecute,
  onClose,
}: ExecutorUIProps) {
  return (
    <div className={styles.executor}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span className={styles.icon}>{functionType === 'read' ? '📖' : '✍️'}</span>
          <span>{functionName}</span>
        </div>
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>
      </div>

      <div className={styles.body}>
        {config.description && (
          <p className={styles.description}>{config.description}</p>
        )}

        {/* Custom component if provided */}
        {config.customComponent && (
          <config.customComponent
            inputs={inputs}
            onInputChange={onInputChange}
          />
        )}

        {/* Standard parameter inputs */}
        {!config.customComponent && config.params.length > 0 ? (
          <div className={styles.inputs}>
            {config.params.map((param) => (
              <ParamInput
                key={param.name}
                param={param}
                value={inputs[param.name] || ''}
                onChange={(value) => onInputChange(param.name, value)}
              />
            ))}
          </div>
        ) : !config.customComponent && (
          <p className={styles.noParams}>No parameters required</p>
        )}

        {/* Proposal warning */}
        {functionType === 'write' && config.requiresProposal && (
          <div className={styles.warning}>
            ⚠️ This function can only be executed via DAO proposal
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className={styles.error}>
            ❌ {error}
          </div>
        )}

        {/* Result display */}
        {result && (
          <div className={styles.result}>
            <h4>Result:</h4>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}

        {/* Transaction status */}
        {isConfirming && (
          <div className={styles.loading}>
            ⏳ Waiting for confirmation...
          </div>
        )}

        {isConfirmed && (
          <div className={styles.success}>
            ✅ Transaction confirmed!
            {hash && (
              <a
                href={`https://etherscan.io/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                View on Etherscan ↗
              </a>
            )}
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <button className={styles.cancelButton} onClick={onClose}>
          Cancel
        </button>
        <button
          className={styles.executeButton}
          onClick={onExecute}
          disabled={isWritePending || isConfirming}
        >
          {isWritePending || isConfirming ? 'Processing...' : 'Execute'}
        </button>
      </div>
    </div>
  );
}

/**
 * Parameter Input Component
 */
function ParamInput({
  param,
  value,
  onChange,
}: {
  param: ParamConfig;
  value: string;
  onChange: (value: string) => void;
}) {
  // Determine input type
  const isTextarea = param.type.includes('[]') || param.type === 'string' && param.name.includes('description');

  return (
    <div className={styles.inputGroup}>
      <label className={styles.label}>
        {param.name}
        {param.required && <span className={styles.required}>*</span>}
        {param.type && <span className={styles.type}>({param.type})</span>}
      </label>
      {param.hint && <p className={styles.hint}>{param.hint}</p>}
      
      {isTextarea ? (
        <textarea
          className={styles.input}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={param.placeholder || `Enter ${param.name}`}
          rows={4}
        />
      ) : (
        <input
          type="text"
          className={styles.input}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={param.placeholder || `Enter ${param.name}`}
        />
      )}
    </div>
  );
}

