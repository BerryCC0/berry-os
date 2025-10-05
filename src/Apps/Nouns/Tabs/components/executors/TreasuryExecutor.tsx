/**
 * Treasury Executor
 * Handles all Treasury Timelock contract functions
 */

'use client';

import { useExecutorState, FunctionConfig } from './BaseExecutor';
import ExecutorUI from './ExecutorUI';
import { getContractFunction } from '../../utils/contractFunctions';

interface TreasuryExecutorProps {
  functionName: string;
  contractAddress: string;
  functionType: 'read' | 'write';
  onClose: () => void;
}

export default function TreasuryExecutor({
  functionName,
  contractAddress,
  functionType,
  onClose,
}: TreasuryExecutorProps) {
  const config = getTreasuryFunctionConfig(functionName);
  const executorState = useExecutorState(config);

  const handleExecute = async () => {
    if (!executorState.validateInputs()) return;

    executorState.clearError();
    executorState.clearResult();

    try {
      const contractFunction = getContractFunction('Treasury', functionName);
      
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

function getTreasuryFunctionConfig(functionName: string): FunctionConfig {
  switch (functionName) {
    // READ
    case 'Check if transaction queued':
      return {
        description: 'Check if a transaction hash is queued in the timelock',
        params: [
          { name: 'txHash', type: 'bytes32', required: true, placeholder: '0x...' }
        ]
      };

    case 'Can execute transaction':
      return {
        description: 'Check if a queued transaction is ready to execute',
        params: [
          { name: 'txHash', type: 'bytes32', required: true, placeholder: '0x...' },
          { name: 'eta', type: 'uint256', required: true, hint: 'Execution timestamp', placeholder: '1700000000' }
        ]
      };

    case 'Is transaction expired':
      return {
        description: 'Check if a queued transaction has expired (past grace period)',
        params: [
          { name: 'eta', type: 'uint256', required: true, hint: 'Execution timestamp', placeholder: '1700000000' }
        ]
      };

    case 'Get timelock delay':
      return {
        description: 'Get the current timelock delay in seconds',
        params: []
      };

    case 'Get grace period':
      return {
        description: 'Get the grace period duration in seconds',
        params: []
      };

    case 'Check admin':
      return {
        description: 'Get the current admin address (should be DAO Governor)',
        params: []
      };

    case 'Get pending admin':
      return {
        description: 'Get the pending admin address if admin transfer is in progress',
        params: []
      };

    case 'Calculate transaction hash':
      return {
        description: 'Calculate the unique hash for a transaction',
        params: [
          { name: 'target', type: 'address', required: true, placeholder: '0x...' },
          { name: 'value', type: 'uint256', required: true, hint: 'ETH value in wei', placeholder: '0' },
          { name: 'signature', type: 'string', required: true, placeholder: 'transfer(address,uint256)' },
          { name: 'data', type: 'bytes', required: true, placeholder: '0x...' },
          { name: 'eta', type: 'uint256', required: true, hint: 'Execution timestamp', placeholder: '1700000000' }
        ]
      };

    // WRITE
    case 'Queue transaction':
      return {
        description: 'Queue a transaction for execution after delay',
        params: [
          { name: 'target', type: 'address', required: true, placeholder: '0x...' },
          { name: 'value', type: 'uint256', required: true, hint: 'ETH value in wei', placeholder: '0' },
          { name: 'signature', type: 'string', required: true, placeholder: 'transfer(address,uint256)' },
          { name: 'data', type: 'bytes', required: true, placeholder: '0x...' },
          { name: 'eta', type: 'uint256', required: true, hint: 'Unix timestamp', placeholder: '1700000000' }
        ],
        requiresProposal: true
      };

    case 'Execute transaction':
      return {
        description: 'Execute a queued transaction (after delay, before expiry)',
        params: [
          { name: 'target', type: 'address', required: true, placeholder: '0x...' },
          { name: 'value', type: 'uint256', required: true, placeholder: '0' },
          { name: 'signature', type: 'string', required: true, placeholder: 'transfer(address,uint256)' },
          { name: 'data', type: 'bytes', required: true, placeholder: '0x...' },
          { name: 'eta', type: 'uint256', required: true, placeholder: '1700000000' }
        ],
        requiresProposal: true
      };

    case 'Cancel transaction':
      return {
        description: 'Cancel a queued transaction',
        params: [
          { name: 'target', type: 'address', required: true, placeholder: '0x...' },
          { name: 'value', type: 'uint256', required: true, placeholder: '0' },
          { name: 'signature', type: 'string', required: true, placeholder: 'transfer(address,uint256)' },
          { name: 'data', type: 'bytes', required: true, placeholder: '0x...' },
          { name: 'eta', type: 'uint256', required: true, placeholder: '1700000000' }
        ],
        requiresProposal: true
      };

    case 'Send ETH':
      return {
        description: 'Send ETH from treasury to recipient',
        params: [
          { name: 'recipient', type: 'address', required: true, placeholder: '0x...' },
          { name: 'amount', type: 'uint256', required: true, hint: 'Amount in wei', placeholder: '1000000000000000000' }
        ],
        requiresProposal: true
      };

    case 'Send ERC20':
      return {
        description: 'Send ERC20 tokens from treasury',
        params: [
          { name: 'token', type: 'address', required: true, hint: 'Token contract address', placeholder: '0x...' },
          { name: 'recipient', type: 'address', required: true, placeholder: '0x...' },
          { name: 'amount', type: 'uint256', required: true, hint: 'Amount in token units', placeholder: '1000000' }
        ],
        requiresProposal: true
      };

    case 'Accept admin':
      return {
        description: 'Accept admin role (pending admin only)',
        params: [],
        requiresProposal: true
      };

    case 'Set pending admin':
      return {
        description: 'Set a new pending admin address',
        params: [
          { name: 'newPendingAdmin', type: 'address', required: true, placeholder: '0x...' }
        ],
        requiresProposal: true
      };

    case 'Set delay':
      return {
        description: 'Update the timelock delay period',
        params: [
          { name: 'newDelay', type: 'uint256', required: true, hint: 'Delay in seconds', placeholder: '172800' }
        ],
        requiresProposal: true
      };

    default:
      return {
        description: `Execute ${functionName}`,
        params: []
      };
  }
}

