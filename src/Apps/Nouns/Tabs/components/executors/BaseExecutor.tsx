/**
 * Base Executor - Shared logic for all contract executors
 * Handles validation, state management, and transaction execution
 */

'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { isAddress } from 'viem';

export interface ParamConfig {
  name: string;
  type: string;
  required: boolean;
  hint?: string;
  placeholder?: string;
}

export interface FunctionConfig {
  description?: string;
  params: ParamConfig[];
  requiresProposal?: boolean;
  customComponent?: React.ComponentType<any>;
}

export interface BaseExecutorProps {
  functionName: string;
  contractAddress: string;
  onClose: () => void;
  config: FunctionConfig;
  onExecute: (inputs: Record<string, string>) => any;
}

export interface ExecutorState {
  inputs: Record<string, string>;
  result: any;
  error: string | null;
}

/**
 * Hook for managing executor state and validation
 */
export function useExecutorState(config: FunctionConfig) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const { writeContract, data: hash, isPending: isWritePending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });

  const handleInputChange = (paramName: string, value: string) => {
    setInputs(prev => ({ ...prev, [paramName]: value }));
    setError(null);
  };

  const validateInputs = (): boolean => {
    for (const param of config.params) {
      const value = inputs[param.name] || '';
      
      if (param.required && !value) {
        setError(`${param.name} is required`);
        return false;
      }

      // Validate address
      if (param.type === 'address' && value && !isAddress(value)) {
        setError(`${param.name} must be a valid Ethereum address`);
        return false;
      }

      // Validate number types
      if ((param.type.includes('uint') || param.type.includes('int')) && value) {
        if (isNaN(Number(value)) || Number(value) < 0) {
          setError(`${param.name} must be a positive number`);
          return false;
        }
      }

      // Validate array types
      if (param.type.includes('[]') && value) {
        try {
          JSON.parse(value);
        } catch {
          setError(`${param.name} must be a valid JSON array`);
          return false;
        }
      }
    }

    return true;
  };

  const clearError = () => setError(null);
  const clearResult = () => setResult(null);

  return {
    inputs,
    result,
    error,
    hash,
    isWritePending,
    isConfirming,
    isConfirmed,
    handleInputChange,
    validateInputs,
    setResult,
    setError,
    clearError,
    clearResult,
    writeContract,
  };
}

/**
 * Validation utilities
 */
export const ValidationUtils = {
  isValidAddress: (value: string): boolean => {
    return value ? isAddress(value) : true;
  },

  isValidNumber: (value: string): boolean => {
    return value ? !isNaN(Number(value)) && Number(value) >= 0 : true;
  },

  isValidArray: (value: string): boolean => {
    if (!value) return true;
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed);
    } catch {
      return false;
    }
  },

  isValidJSON: (value: string): boolean => {
    if (!value) return true;
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  },

  parseArray: (value: string): any[] => {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  },
};

