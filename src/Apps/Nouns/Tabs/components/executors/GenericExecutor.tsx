/**
 * Generic Executor
 * Handles any contract with a config lookup system
 * Used for simpler contracts that don't need custom logic
 */

'use client';

import { useExecutorState, FunctionConfig } from './BaseExecutor';
import ExecutorUI from './ExecutorUI';
import { getContractFunction } from '../../utils/contractFunctions';
import {
  getTokenConfig,
  getAuctionConfig,
  getAdminConfig,
  getDataProxyConfig,
  getTokenBuyerConfig,
  getPayerConfig,
  getDescriptorConfig,
  getSeederConfig,
  getStreamingConfig,
  getRewardsConfig,
  getForkConfig,
} from './configs';

interface GenericExecutorProps {
  contractName: string;
  functionName: string;
  contractAddress: string;
  functionType: 'read' | 'write';
  onClose: () => void;
}

export default function GenericExecutor({
  contractName,
  functionName,
  contractAddress,
  functionType,
  onClose,
}: GenericExecutorProps) {
  const mainName = contractName.split('[')[0].trim();
  const config = getConfigForContract(mainName, functionName);
  const executorState = useExecutorState(config);

  const handleExecute = async () => {
    if (!executorState.validateInputs()) return;

    executorState.clearError();
    executorState.clearResult();

    try {
      const contractFunction = getContractFunction(contractName, functionName);
      
      if (!contractFunction) {
        executorState.setError('Function not implemented yet');
        return;
      }

      const functionCall = contractFunction(executorState.inputs);

      if (functionType === 'read') {
        executorState.setResult({
          message: 'Read function prepared',
          config: functionCall,
        });
      } else {
        if (!functionCall.address || !functionCall.abi || !functionCall.functionName) {
          executorState.setError('Invalid function configuration');
          return;
        }
        executorState.writeContract(functionCall as any);
      }
    } catch (err: any) {
      executorState.setError(err.message || 'Execution failed');
    }
  };

  return (
    <ExecutorUI
      functionName={functionName}
      functionType={functionType}
      config={config}
      inputs={executorState.inputs}
      result={executorState.result}
      error={executorState.error}
      hash={executorState.hash}
      isWritePending={executorState.isWritePending}
      isConfirming={executorState.isConfirming}
      isConfirmed={executorState.isConfirmed}
      onInputChange={executorState.handleInputChange}
      onExecute={handleExecute}
      onClose={onClose}
    />
  );
}

/**
 * Route to correct config function based on contract name
 */
function getConfigForContract(contractName: string, functionName: string): FunctionConfig {
  switch (contractName) {
    case 'Nouns Token':
      return getTokenConfig(functionName);
    case 'Auction House':
    case 'Auction House Proxy':
      return getAuctionConfig(functionName);
    case 'DAO Admin':
      return getAdminConfig(functionName);
    case 'Data Proxy':
      return getDataProxyConfig(functionName);
    case 'Token Buyer':
      return getTokenBuyerConfig(functionName);
    case 'Payer':
      return getPayerConfig(functionName);
    case 'Descriptor':
      return getDescriptorConfig(functionName);
    case 'Seeder':
      return getSeederConfig(functionName);
    case 'Stream Factory':
      return getStreamingConfig(functionName);
    case 'Client Rewards':
    case 'Client Rewards Proxy':
      return getRewardsConfig(functionName);
    case 'Fork Escrow':
    case 'Fork DAO Deployer':
      return getForkConfig(functionName);
    default:
      return {
        description: `Execute ${functionName}`,
        params: []
      };
  }
}

