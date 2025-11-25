/**
 * SmartActionEditor Component
 * ABI-powered action editor with fallback to manual entry
 * Adapted from Nouns95 for Berry OS
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { encodeAbiParameters, parseAbiParameters } from 'viem';
import styles from './SmartActionEditor.module.css';

interface ABIInput {
  name: string;
  type: string;
  internalType?: string;
}

interface ABIItem {
  name?: string;
  type: string;
  stateMutability?: string;
  inputs?: ABIInput[];
}

interface ContractFunction {
  name: string;
  type: 'function';
  stateMutability: string;
  inputs: ABIInput[];
}

interface ContractABI {
  contractName?: string;
  functions: ContractFunction[];
  isProxy?: boolean;
  implementationAddress?: string;
  proxyType?: string;
}

interface SmartActionEditorProps {
  index: number;
  target: string;
  value: string;
  signature: string;
  calldata: string;
  onUpdate: (field: string, value: string) => void;
  disabled?: boolean;
}

export function SmartActionEditor({
  index,
  target,
  value,
  signature,
  calldata,
  onUpdate,
  disabled = false
}: SmartActionEditorProps) {
  const [contractABI, setContractABI] = useState<ContractABI | null>(null);
  const [selectedFunction, setSelectedFunction] = useState<ContractFunction | null>(null);
  const [functionInputs, setFunctionInputs] = useState<{ [key: string]: string }>({});
  const [isLoadingABI, setIsLoadingABI] = useState(false);
  const [abiError, setAbiError] = useState<string | null>(null);

  const fetchContractABI = useCallback(async (address: string) => {
    setIsLoadingABI(true);
    setAbiError(null);

    try {
      // Fetch main contract ABI from Etherscan (new API format)
      const response = await fetch(`/api/etherscan/contract?address=${address}`);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Handle new API response format
      if (!data.isVerified || !data.abi) {
        throw new Error('Contract not verified on Etherscan');
      }

      const mainAbi = data.abi;
      let contractName = data.name || '';

      // Check if this is a proxy contract
      const proxyInfo = await detectProxyImplementation(address, mainAbi);

      let allFunctions = mainAbi.filter((item: ABIItem) => item.type === 'function');

      // If proxy, fetch implementation ABI
      if (proxyInfo.isProxy && proxyInfo.implementationAddress) {
        try {
          await new Promise(resolve => setTimeout(resolve, 1500));
          const implResponse = await fetch(`/api/etherscan/contract?address=${proxyInfo.implementationAddress}`);
          const implData = await implResponse.json();

          if (implData.isVerified && implData.abi) {
            const implAbi = implData.abi;
            const implFunctions = implAbi.filter((item: ABIItem) => item.type === 'function');

            // Deduplicate functions
            const existingFunctionSignatures = new Set(
              allFunctions.map((f: ABIItem) => {
                const inputs = f.inputs && Array.isArray(f.inputs)
                  ? f.inputs.map((i: ABIInput) => i.type || '').join(',')
                  : '';
                return `${f.name}(${inputs})`;
              })
            );

            const newFunctions = implFunctions.filter((f: ABIItem) => {
              const inputs = f.inputs && Array.isArray(f.inputs)
                ? f.inputs.map((i: ABIInput) => i.type || '').join(',')
                : '';
              const sig = `${f.name}(${inputs})`;
              return !existingFunctionSignatures.has(sig);
            });

            allFunctions = [...allFunctions, ...newFunctions];

            // Get implementation name from response
            const implName = implData.name;
            if (implName && implName !== 'Unknown') {
              contractName = contractName
                ? `${contractName} (Proxy → ${implName})`
                : `Proxy → ${implName}`;
            }
          }
        } catch {
          // Error fetching implementation ABI
          contractName = contractName
            ? `${contractName} (Proxy → Implementation Error)`
            : `Proxy → Implementation Error`;
        }
      }

      // Filter state-changing functions
      const functions = allFunctions
        .filter((item: ABIItem) => {
          if (!item || typeof item !== 'object' || !item.name || item.type !== 'function') {
            return false;
          }

          const mutability = item.stateMutability;
          return mutability !== 'view' && mutability !== 'pure' && mutability !== 'constant';
        })
        .map((item: ABIItem) => ({
          ...item,
          name: item.name as string,
          type: 'function' as const,
          stateMutability: item.stateMutability || 'nonpayable',
          inputs: Array.isArray(item.inputs) ? item.inputs : []
        }));

      setContractABI({
        contractName,
        functions,
        isProxy: proxyInfo.isProxy,
        implementationAddress: proxyInfo.implementationAddress,
        proxyType: proxyInfo.proxyType
      });
    } catch {
      setAbiError('Failed to fetch contract ABI');
    } finally {
      setIsLoadingABI(false);
    }
  }, []);

  // Fetch ABI when target address changes
  useEffect(() => {
    setContractABI(null);
    setSelectedFunction(null);
    setFunctionInputs({});
    setAbiError(null);

    if (target && target.length === 42 && target.startsWith('0x')) {
      // Basic validation - just fetch the ABI
      fetchContractABI(target);
    }
  }, [target, fetchContractABI]);

  // Update function inputs when selected function changes
  useEffect(() => {
    if (selectedFunction && selectedFunction.inputs) {
      const inputs: { [key: string]: string } = {};
      selectedFunction.inputs.forEach(input => {
        if (input.name && input.type) {
          inputs[input.name] = getDefaultValueForType(input.type);
        }
      });
      setFunctionInputs(inputs);

      // Generate function signature
      const inputTypes = selectedFunction.inputs && Array.isArray(selectedFunction.inputs)
        ? selectedFunction.inputs.filter(i => i && i.type).map(i => i.type)
        : [];
      const sig = `${selectedFunction.name}(${inputTypes.join(',')})`;
      onUpdate('signature', sig);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFunction]);

  // Update calldata when function inputs change
  useEffect(() => {
    if (selectedFunction && Object.keys(functionInputs).length > 0) {
      try {
        const encodedCalldata = encodeCalldata(selectedFunction, functionInputs);
        onUpdate('calldata', encodedCalldata);
      } catch {
        // Error encoding calldata
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFunction, functionInputs]);

  const detectProxyImplementation = async (address: string, abi: ABIItem[]): Promise<{
    isProxy: boolean;
    implementationAddress?: string;
    proxyType?: string;
  }> => {
    try {
      // Check common proxy function signatures
      const hasImplementationFunction = abi.some((item: ABIItem) =>
        item.type === 'function' &&
        item.name === 'implementation' &&
        item.stateMutability === 'view'
      );

      if (hasImplementationFunction) {
        // Try to call implementation() function
        await new Promise(resolve => setTimeout(resolve, 500));
        const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/demo';
        const response = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [{
              to: address,
              data: '0x5c60da1b' // implementation() function signature
            }, 'latest'],
            id: 1
          })
        });

        const result = await response.json();
        if (result.result && result.result !== '0x') {
          const implementationAddress = '0x' + result.result.slice(-40);
          if (implementationAddress !== '0x0000000000000000000000000000000000000000') {
            return {
              isProxy: true,
              implementationAddress,
              proxyType: 'Transparent/UUPS Proxy'
            };
          }
        }
      }

      // Check for EIP-1967 implementation slot
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/demo';
        const response = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getStorageAt',
            params: [
              address,
              '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc', // EIP-1967 slot
              'latest'
            ],
            id: 1
          })
        });

        const result = await response.json();
        if (result.result && result.result !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
          const implementationAddress = '0x' + result.result.slice(-40);
          if (implementationAddress !== '0x0000000000000000000000000000000000000000') {
            return {
              isProxy: true,
              implementationAddress,
              proxyType: 'EIP-1967 Proxy'
            };
          }
        }
      } catch {
        // Could not check EIP-1967 slot
      }

      return { isProxy: false };
    } catch {
      return { isProxy: false };
    }
  };

  const getDefaultValueForType = (type: string): string => {
    if (type.startsWith('uint') || type.startsWith('int')) return '0';
    if (type === 'address') return '0x0000000000000000000000000000000000000000';
    if (type === 'bool') return 'false';
    if (type === 'string' || type === 'bytes') return '';
    if (type.includes('[]')) return '[]';
    return '';
  };

  const encodeCalldata = (func: ContractFunction, inputs: { [key: string]: string }): string => {
    try {
      if (!func || !func.inputs || !Array.isArray(func.inputs)) {
        return '0x';
      }

      // If no inputs, return empty calldata
      if (func.inputs.length === 0) {
        return '0x';
      }

      // Build ABI parameter string for viem
      const abiParamString = func.inputs
        .map(input => `${input.type} ${input.name}`)
        .join(', ');
      
      // Parse values according to their types
      const values = func.inputs.map(input => {
        if (!input || !input.name || !input.type) {
          return '';
        }
        const value = inputs[input.name] || '';
        return parseInputValue(value, input.type);
      });

      // Encode using viem
      const abiParams = parseAbiParameters(abiParamString);
      const encoded = encodeAbiParameters(abiParams, values);
      
      return encoded;
    } catch (error) {
      console.error('Error encoding calldata:', error);
      return '0x';
    }
  };

  const parseInputValue = (value: string, type: string): any => {
    if (!value || value.trim() === '') {
      // Return appropriate default for empty values
      if (type === 'bool') return false;
      if (type.startsWith('uint') || type.startsWith('int')) return BigInt(0);
      if (type === 'address') return '0x0000000000000000000000000000000000000000';
      if (type === 'string') return '';
      if (type.includes('[]')) return [];
      return '0x';
    }

    try {
      if (type === 'bool') {
        return value.toLowerCase() === 'true';
      }
      if (type.startsWith('uint') || type.startsWith('int')) {
        // Handle both decimal and hex input
        const cleanValue = value.trim();
        if (cleanValue.startsWith('0x')) {
          return BigInt(cleanValue);
        }
        return BigInt(cleanValue);
      }
      if (type === 'address') {
        // Basic address validation and checksum
        const addr = value.trim();
        if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) {
          throw new Error('Invalid address format');
        }
        return addr as `0x${string}`;
      }
      if (type === 'bytes' || type.startsWith('bytes')) {
        // Ensure proper hex format
        const hex = value.trim();
        if (!hex.startsWith('0x')) {
          return `0x${hex}` as `0x${string}`;
        }
        return hex as `0x${string}`;
      }
      if (type.includes('[]')) {
        // Parse JSON array
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed)) {
          throw new Error('Array type requires JSON array');
        }
        // Recursively parse array elements
        const elementType = type.replace('[]', '');
        return parsed.map(item => 
          typeof item === 'string' ? parseInputValue(item, elementType) : item
        );
      }
      if (type === 'string') {
        return value;
      }
      // Default: return as-is
      return value;
    } catch (error) {
      console.error(`Error parsing value "${value}" as type "${type}":`, error);
      // Return safe default on error
      if (type === 'bool') return false;
      if (type.startsWith('uint') || type.startsWith('int')) return BigInt(0);
      if (type === 'address') return '0x0000000000000000000000000000000000000000';
      if (type.includes('[]')) return [];
      return '';
    }
  };

  const handleFunctionSelect = (functionSignature: string) => {
    if (!functionSignature) {
      setSelectedFunction(null);
      return;
    }

    if (!functionSignature.includes('(')) {
      const func = contractABI?.functions.find(f => f.name === functionSignature);
      if (func) {
        func.inputs = func.inputs || [];
        func.inputs = func.inputs.filter(input => input.name && input.type);
      }
      setSelectedFunction(func || null);
      return;
    }

    const func = contractABI?.functions.find(f => {
      const inputTypes = f.inputs && Array.isArray(f.inputs)
        ? f.inputs.map((i: ABIInput) => i.type || '').join(',')
        : '';
      const sig = `${f.name}(${inputTypes})`;
      return sig === functionSignature;
    });

    if (func) {
      func.inputs = func.inputs || [];
      func.inputs = func.inputs.filter(input => input.name && input.type);
    }
    setSelectedFunction(func || null);
  };

  const handleInputChange = (inputName: string, value: string) => {
    setFunctionInputs(prev => ({ ...prev, [inputName]: value }));
  };

  const renderParameterInput = (input: { name: string; type: string }) => {
    if (!input || !input.name || !input.type) {
      return null;
    }

    const value = functionInputs[input.name] || '';

    if (input.type === 'bool') {
      return (
        <select
          className={styles.input}
          value={value}
          onChange={(e) => handleInputChange(input.name, e.target.value)}
          disabled={disabled}
        >
          <option value="false">false</option>
          <option value="true">true</option>
        </select>
      );
    }

    return (
      <input
        type="text"
        className={styles.input}
        value={value}
        onChange={(e) => handleInputChange(input.name, e.target.value)}
        placeholder={getPlaceholderForType(input.type)}
        disabled={disabled}
      />
    );
  };

  const getPlaceholderForType = (type: string): string => {
    if (type.startsWith('uint') || type.startsWith('int')) return '0';
    if (type === 'address') return '0x...';
    if (type === 'string') return 'Enter string';
    if (type === 'bytes') return '0x...';
    if (type.includes('[]')) return '["item1", "item2"]';
    return 'Enter value';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.actionLabel}>Action {index + 1}</span>
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label}>Target Contract Address *</label>
        <input
          type="text"
          className={styles.input}
          value={target}
          onChange={(e) => onUpdate('target', e.target.value)}
          placeholder="0x..."
          disabled={disabled}
        />
        {isLoadingABI && <div className={styles.status}>Loading contract info...</div>}
        {contractABI?.contractName && (
          <div className={styles.contractName}>
            Contract: <span className={styles.highlight}>{contractABI.contractName}</span>
            {contractABI.isProxy && (
              <div className={styles.proxyInfo}>
                🔗 {contractABI.proxyType} detected
                {contractABI.implementationAddress && (
                  <div className={styles.implementationInfo}>
                    Implementation: {contractABI.implementationAddress.slice(0, 6)}...{contractABI.implementationAddress.slice(-4)}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {abiError && <div className={styles.error}>{abiError}</div>}
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label}>ETH Value</label>
        <input
          type="text"
          className={styles.input}
          value={value}
          onChange={(e) => onUpdate('value', e.target.value)}
          placeholder="0"
          disabled={disabled}
        />
      </div>

      {/* ABI-based function selection (when available) */}
      {contractABI && contractABI.functions.length > 0 ? (
        <>
          <div className={styles.modeIndicator}>
            <span className={styles.modeLabel}>
              Smart Mode: Using contract ABI
              {contractABI.isProxy && (
                <span className={styles.proxyIndicator}> (Proxy + Implementation)</span>
              )}
            </span>
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Function to call</label>
            <select
              className={styles.select}
              value={selectedFunction ? (() => {
                const inputTypes = selectedFunction.inputs && Array.isArray(selectedFunction.inputs)
                  ? selectedFunction.inputs.map((i: ABIInput) => i.type || '').join(',')
                  : '';
                return `${selectedFunction.name}(${inputTypes})`;
              })() : ''}
              onChange={(e) => handleFunctionSelect(e.target.value)}
              disabled={disabled}
            >
              <option value="">Select function...</option>
              {contractABI.functions.map((func) => {
                if (!func || !func.name) {
                  return null;
                }

                const inputsDisplay = func.inputs && Array.isArray(func.inputs)
                  ? func.inputs
                    .filter(i => i && i.type && i.name)
                    .map(i => `${i.type} ${i.name}`)
                    .join(', ')
                  : '';

                const inputTypes = func.inputs && Array.isArray(func.inputs)
                  ? func.inputs.map((i: ABIInput) => i.type || '').join(',')
                  : '';
                const uniqueKey = `${func.name}(${inputTypes})`;

                return (
                  <option key={uniqueKey} value={uniqueKey}>
                    {func.name}({inputsDisplay})
                  </option>
                );
              }).filter(Boolean)}
            </select>
          </div>

          {selectedFunction && selectedFunction.inputs && selectedFunction.inputs.length > 0 && (
            <div className={styles.parametersSection}>
              <label className={styles.label}>Arguments</label>
              {selectedFunction.inputs
                .filter(input => input && input.name && input.type)
                .map((input, idx) => (
                  <div key={input.name || idx} className={styles.parameterGroup}>
                    <label className={styles.parameterLabel}>
                      {input.type} {input.name}
                    </label>
                    {renderParameterInput(input)}
                  </div>
                ))
              }
            </div>
          )}

          {selectedFunction && (
            <div className={styles.generatedInfo}>
              <div className={styles.generatedLabel}>Generated from ABI:</div>
              <div className={styles.generatedValue}>
                <strong>Signature:</strong> {signature}
              </div>
              <div className={styles.generatedValue}>
                <strong>Calldata:</strong>
                <div className={styles.calldataPreview} title={calldata}>
                  {calldata}
                </div>
              </div>
              <div className={styles.generatedHint}>
                ℹ️ This calldata will be submitted with your proposal. Hover or scroll to see full value.
              </div>
            </div>
          )}
        </>
      ) : (
        /* Manual input fallback (when ABI unavailable or no state-changing functions) */
        <>
          {contractABI && contractABI.functions.length === 0 ? (
            <div className={styles.noFunctionsMessage}>
              <div className={styles.modeIndicator}>
                <span className={styles.modeLabel}>No state-changing functions available</span>
              </div>
              <p>
                This contract only has view/pure functions. Please enter the function signature and calldata manually below.
              </p>
            </div>
          ) : target && !isLoadingABI && abiError ? (
            <div className={styles.noAbiMessage}>
              <div className={styles.modeIndicator}>
                <span className={styles.modeLabel}>Contract not verified or invalid address</span>
              </div>
              <p>Unable to fetch ABI. Please enter the function signature and calldata manually below.</p>
            </div>
          ) : null}

          <div className={styles.inputGroup}>
            <label className={styles.label}>Function Signature</label>
            <input
              type="text"
              className={styles.input}
              value={signature}
              onChange={(e) => onUpdate('signature', e.target.value)}
              placeholder="functionName(uint256,address)"
              disabled={disabled}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Calldata</label>
            <input
              type="text"
              className={styles.input}
              value={calldata}
              onChange={(e) => onUpdate('calldata', e.target.value)}
              placeholder="0x..."
              disabled={disabled}
            />
          </div>
        </>
      )}
    </div>
  );
}

