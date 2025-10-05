/**
 * Governance Executor
 * Handles all DAO Governor contract functions
 */

'use client';

import { useExecutorState, FunctionConfig } from './BaseExecutor';
import ExecutorUI from './ExecutorUI';
import { getContractFunction } from '../../utils/contractFunctions';

interface GovernanceExecutorProps {
  functionName: string;
  contractAddress: string;
  functionType: 'read' | 'write';
  onClose: () => void;
}

export default function GovernanceExecutor({
  functionName,
  contractAddress,
  functionType,
  onClose,
}: GovernanceExecutorProps) {
  const config = getGovernanceFunctionConfig(functionName);
  const executorState = useExecutorState(config);

  const handleExecute = async () => {
    if (!executorState.validateInputs()) return;

    executorState.clearError();
    executorState.clearResult();

    try {
      const contractFunction = getContractFunction('DAO Governor', functionName);
      
      if (!contractFunction) {
        executorState.setError('Function not implemented yet');
        return;
      }

      const functionCall = contractFunction(executorState.inputs);

      if (functionType === 'read') {
        executorState.setResult({
          message: 'Read function prepared',
          config: functionCall,
          note: 'Connect wallet and use contract read hooks for live data'
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
 * Function configurations for DAO Governor
 */
function getGovernanceFunctionConfig(functionName: string): FunctionConfig {
  switch (functionName) {
    // READ FUNCTIONS
    case 'Get proposal state':
      return {
        description: 'Get the current state of a proposal (Pending, Active, Canceled, Defeated, Succeeded, Queued, Expired, Executed)',
        params: [
          { name: 'proposalId', type: 'uint256', required: true, placeholder: '123' }
        ]
      };

    case 'Get proposal details':
      return {
        description: 'Get complete details of a proposal including proposer, targets, values, and signatures',
        params: [
          { name: 'proposalId', type: 'uint256', required: true, placeholder: '123' }
        ]
      };

    case 'Get proposal votes':
      return {
        description: 'Get vote counts (for, against, abstain) for a proposal',
        params: [
          { name: 'proposalId', type: 'uint256', required: true, placeholder: '123' }
        ]
      };

    case 'Get voting power':
      return {
        description: 'Get current voting power (Nouns owned) for an address',
        params: [
          { name: 'account', type: 'address', required: true, placeholder: '0x...' }
        ]
      };

    case 'Get quorum votes':
      return {
        description: 'Get the quorum threshold for a specific proposal',
        params: [
          { name: 'proposalId', type: 'uint256', required: true, placeholder: '123' }
        ]
      };

    case 'Has voted':
      return {
        description: 'Check if an address has voted on a proposal',
        params: [
          { name: 'proposalId', type: 'uint256', required: true, placeholder: '123' },
          { name: 'voter', type: 'address', required: true, placeholder: '0x...' }
        ]
      };

    case 'Get proposal threshold':
      return {
        description: 'Get minimum Nouns required to create a proposal',
        params: []
      };

    case 'Get fork threshold':
      return {
        description: 'Get minimum Nouns required to initiate a fork',
        params: []
      };

    case 'Get fork end timestamp':
      return {
        description: 'Get the timestamp when the current fork period ends',
        params: []
      };

    case 'Get dynamic quorum params':
      return {
        description: 'Get dynamic quorum configuration parameters',
        params: [
          { name: 'blockNumber', type: 'uint256', required: false, hint: 'Block number (optional, defaults to current)', placeholder: '' }
        ]
      };

    // WRITE FUNCTIONS
    case 'Create proposal':
      return {
        description: 'Create a new governance proposal (requires proposal threshold)',
        params: [
          { name: 'targets', type: 'address[]', required: true, hint: 'Array of target addresses', placeholder: '["0x..."]' },
          { name: 'values', type: 'uint256[]', required: true, hint: 'Array of ETH values in wei', placeholder: '[0]' },
          { name: 'signatures', type: 'string[]', required: true, hint: 'Array of function signatures', placeholder: '["transfer(address,uint256)"]' },
          { name: 'calldatas', type: 'bytes[]', required: true, hint: 'Array of encoded calldata', placeholder: '["0x..."]' },
          { name: 'description', type: 'string', required: true, hint: 'Markdown proposal description', placeholder: '# Title\n\nDescription...' }
        ]
      };

    case 'Propose by signatures':
      return {
        description: 'Create proposal with collected signatures (prop house style)',
        params: [
          { name: 'proposerSignatures', type: 'bytes[]', required: true, hint: 'Array of proposer signatures', placeholder: '["0x..."]' },
          { name: 'targets', type: 'address[]', required: true, placeholder: '["0x..."]' },
          { name: 'values', type: 'uint256[]', required: true, placeholder: '[0]' },
          { name: 'signatures', type: 'string[]', required: true, placeholder: '["transfer(address,uint256)"]' },
          { name: 'calldatas', type: 'bytes[]', required: true, placeholder: '["0x..."]' },
          { name: 'description', type: 'string', required: true, placeholder: '# Proposal Title...' }
        ]
      };

    case 'Cast vote with Berry OS':
      return {
        description: 'Cast a vote with gas refund using Berry OS (Client ID 11)',
        params: [
          { name: 'proposalId', type: 'uint256', required: true, placeholder: '123' },
          { name: 'support', type: 'uint8', required: true, hint: '0 = Against, 1 = For, 2 = Abstain', placeholder: '1' }
        ]
      };

    case 'Cast vote with reason (Berry OS)':
      return {
        description: 'Cast a vote with explanation and gas refund using Berry OS (Client ID 11)',
        params: [
          { name: 'proposalId', type: 'uint256', required: true, placeholder: '123' },
          { name: 'support', type: 'uint8', required: true, hint: '0 = Against, 1 = For, 2 = Abstain', placeholder: '1' },
          { name: 'reason', type: 'string', required: true, placeholder: 'I support this proposal because...' }
        ]
      };

    case 'Queue proposal':
      return {
        description: 'Queue a succeeded proposal for execution (after voting ends)',
        params: [
          { name: 'proposalId', type: 'uint256', required: true, placeholder: '123' }
        ]
      };

    case 'Execute proposal':
      return {
        description: 'Execute a queued proposal (after timelock delay)',
        params: [
          { name: 'proposalId', type: 'uint256', required: true, placeholder: '123' }
        ]
      };

    case 'Cancel proposal':
      return {
        description: 'Cancel a proposal (proposer only, or if proposer drops below threshold)',
        params: [
          { name: 'proposalId', type: 'uint256', required: true, placeholder: '123' }
        ]
      };

    case 'Veto proposal':
      return {
        description: 'Veto a proposal (vetoer only)',
        params: [
          { name: 'proposalId', type: 'uint256', required: true, placeholder: '123' }
        ],
        requiresProposal: false // Vetoer can call directly
      };

    case 'Update proposal':
      return {
        description: 'Update proposal during updatable period',
        params: [
          { name: 'proposalId', type: 'uint256', required: true, placeholder: '123' },
          { name: 'targets', type: 'address[]', required: true, placeholder: '["0x..."]' },
          { name: 'values', type: 'uint256[]', required: true, placeholder: '[0]' },
          { name: 'signatures', type: 'string[]', required: true, placeholder: '["transfer(address,uint256)"]' },
          { name: 'calldatas', type: 'bytes[]', required: true, placeholder: '["0x..."]' },
          { name: 'description', type: 'string', required: true, placeholder: 'Updated description...' },
          { name: 'updateMessage', type: 'string', required: true, placeholder: 'Reason for update...' }
        ]
      };

    case 'Escrow to fork':
      return {
        description: 'Escrow your Nouns to join/initiate a fork',
        params: [
          { name: 'tokenIds', type: 'uint256[]', required: true, hint: 'Array of Noun IDs you own', placeholder: '[1, 2, 3]' },
          { name: 'proposalIds', type: 'uint256[]', required: true, hint: 'Proposals to bring to fork', placeholder: '[123, 456]' },
          { name: 'reason', type: 'string', required: true, placeholder: 'Reason for forking...' }
        ]
      };

    case 'Execute fork':
      return {
        description: 'Execute the fork once threshold is reached',
        params: []
      };

    case 'Join fork':
      return {
        description: 'Join an existing fork during fork period',
        params: [
          { name: 'tokenIds', type: 'uint256[]', required: true, placeholder: '[1, 2, 3]' },
          { name: 'proposalIds', type: 'uint256[]', required: true, placeholder: '[123, 456]' },
          { name: 'reason', type: 'string', required: true, placeholder: 'Joining fork...' }
        ]
      };

    case 'Withdraw from fork':
      return {
        description: 'Withdraw your Nouns from fork escrow',
        params: [
          { name: 'tokenIds', type: 'uint256[]', required: true, placeholder: '[1, 2, 3]' }
        ]
      };

    default:
      return {
        description: `Execute ${functionName}`,
        params: []
      };
  }
}

