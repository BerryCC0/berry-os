/**
 * SmartActionEditor Component
 * ABI-powered action editor with fallback to manual entry
 * Adapted from Nouns95 for Berry OS
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  const [showAdvanced, setShowAdvanced] = useState(false);

  const fetchContractABI = useCallback(async (address: string) => {
    setIsLoadingABI(true);
    setAbiError(null);

    try {
      // Fetch main contract ABI from Etherscan
      const response = await fetch(`/api/etherscan/contract?address=${address}`);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.status === '0') {
        throw new Error(data.message || 'Contract not verified on Etherscan');
      }

      const mainAbi = JSON.parse(data.result);

      // Check if this is a proxy contract
      const proxyInfo = await detectProxyImplementation(address, mainAbi);

      let allFunctions = mainAbi.filter((item: ABIItem) => item.type === 'function');
      let contractName = '';

      // Get contract name
      try {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting delay
        const nameResponse = await fetch(`/api/etherscan/contract?address=${address}&action=getsourcecode`);
        const nameData = await nameResponse.json();
        if (nameData.status === '1' && nameData.result?.[0]?.ContractName) {
          contractName = nameData.result[0].ContractName;
        }
      } catch {
        // Could not fetch contract name
      }

      // If proxy, fetch implementation ABI
      if (proxyInfo.isProxy && proxyInfo.implementationAddress) {
        try {
          await new Promise(resolve => setTimeout(resolve, 1500));
          const implResponse = await fetch(`/api/etherscan/contract?address=${proxyInfo.implementationAddress}`);
          const implData = await implResponse.json();

          if (implData.status === '1') {
            const implAbi = JSON.parse(implData.result);
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

            // Get implementation name
            try {
              await new Promise(resolve => setTimeout(resolve, 1000));
              const implNameResponse = await fetch(`/api/etherscan/contract?address=${proxyInfo.implementationAddress}&action=getsourcecode`);
              const implNameData = await implNameResponse.json();
              if (implNameData.status === '1' && implNameData.result?.[0]?.ContractName) {
                contractName = contractName
                  ? `${contractName} (Proxy → ${implNameData.result[0].ContractName})`
                  : `Proxy → ${implNameData.result[0].ContractName}`;
              }
            } catch {
              // Could not fetch implementation name
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

      // For Nouns governance, encode only parameters, not function selector
      const types = func.inputs.map(input => input.type);
      const values = func.inputs.map(input => {
        if (!input || !input.name || !input.type) {
          return '';
        }
        const value = inputs[input.name] || '';
        return parseInputValue(value, input.type);
      });

      if (types.length === 0) {
        return '0x';
      }

      // Use basic encoding without ethers - manual encoding
      // For now, return empty calldata and let user fill manually in advanced mode
      return '0x';
    } catch {
      return '0x';
    }
  };

  const parseInputValue = (value: string, type: string): unknown => {
    if (!value) return getDefaultValueForType(type);

    try {
      if (type === 'bool') {
        return value.toLowerCase() === 'true';
      }
      if (type.startsWith('uint') || type.startsWith('int')) {
        return BigInt(value);
      }
      if (type === 'address') {
        // Basic address validation
        if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
          throw new Error('Invalid address');
        }
        return value.toLowerCase();
      }
      if (type.includes('[]')) {
        return JSON.parse(value);
      }
      return value;
    } catch {
      return getDefaultValueForType(type);
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
        <button
          type="button"
          className={styles.toggleButton}
          onClick={() => setShowAdvanced(!showAdvanced)}
          disabled={disabled}
        >
          {showAdvanced ? 'Simple' : 'Advanced'}
        </button>
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

      {!showAdvanced ? (
        // SIMPLE MODE - ABI-based function selection
        contractABI && contractABI.functions.length > 0 ? (
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
                  <strong>Calldata:</strong> {calldata.slice(0, 20)}...
                </div>
              </div>
            )}
          </>
        ) : contractABI ? (
          <div className={styles.noFunctionsMessage}>
            <div className={styles.modeIndicator}>
              <span className={styles.modeLabel}>No state-changing functions available</span>
            </div>
            <p>
              This contract only has view/pure functions. Switch to Advanced mode to manually specify the function call.
            </p>
          </div>
        ) : target && !isLoadingABI ? (
          <div className={styles.noAbiMessage}>
            <div className={styles.modeIndicator}>
              <span className={styles.modeLabel}>Contract not verified or invalid address</span>
            </div>
            <p>Unable to fetch ABI. Switch to Advanced mode for manual input.</p>
          </div>
        ) : null
      ) : (
        // ADVANCED MODE - Manual input
        <>
          <div className={styles.modeIndicator}>
            <span className={styles.modeLabel}>Advanced Mode: Manual input</span>
          </div>
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

