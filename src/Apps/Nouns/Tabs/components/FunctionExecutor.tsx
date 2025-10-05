/**
 * Function Executor Component
 * Routes to appropriate contract-specific executor
 */

'use client';

import {
  GovernanceExecutor,
  TreasuryExecutor,
  GenericExecutor,
} from './executors';

interface FunctionExecutorProps {
  contractName: string;
  contractAddress: string;
  functionName: string;
  functionType: 'read' | 'write';
  onClose: () => void;
}

export default function FunctionExecutor({
  contractName,
  contractAddress,
  functionName,
  functionType,
  onClose
}: FunctionExecutorProps) {
  const mainName = contractName.split('[')[0].trim();

  // Route to appropriate executor
  switch (mainName) {
    case 'DAO Governor':
      return (
        <GovernanceExecutor
          functionName={functionName}
          contractAddress={contractAddress}
          functionType={functionType}
          onClose={onClose}
        />
      );

    case 'Treasury':
    case 'Treasury V1':
      return (
        <TreasuryExecutor
          functionName={functionName}
          contractAddress={contractAddress}
          functionType={functionType}
          onClose={onClose}
        />
      );

    default:
      // Use generic executor for all other contracts
      return (
        <GenericExecutor
          contractName={contractName}
          functionName={functionName}
          contractAddress={contractAddress}
          functionType={functionType}
          onClose={onClose}
        />
      );
  }
}
