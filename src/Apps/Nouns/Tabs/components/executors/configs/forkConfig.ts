/**
 * Fork Mechanism Function Configurations
 */

import { FunctionConfig } from '../BaseExecutor';

export function getForkConfig(functionName: string): FunctionConfig {
  switch (functionName) {
    // READ FUNCTIONS
    case 'Is fork active':
      return {
        description: 'Check if fork period is currently active',
        params: [
          { name: 'forkEndTimestamp', type: 'uint256', required: true, hint: 'Unix timestamp', placeholder: '1700000000' }
        ]
      };

    case 'Get fork time remaining':
      return {
        description: 'Get seconds remaining in fork period',
        params: [
          { name: 'forkEndTimestamp', type: 'uint256', required: true, placeholder: '1700000000' }
        ]
      };

    case 'Can execute fork':
      return {
        description: 'Check if fork threshold has been reached',
        params: [
          { name: 'userTokens', type: 'uint256', required: true, hint: 'Nouns escrowed', placeholder: '20' },
          { name: 'forkThreshold', type: 'uint256', required: true, hint: 'Required threshold', placeholder: '20' }
        ]
      };

    case 'Calculate fork progress':
      return {
        description: 'Calculate fork progress percentage (0-100)',
        params: [
          { name: 'escrowedTokens', type: 'uint256', required: true, placeholder: '10' },
          { name: 'forkThreshold', type: 'uint256', required: true, placeholder: '20' }
        ]
      };

    case 'Get num tokens in escrow':
      return {
        description: 'Get number of tokens currently escrowed',
        params: []
      };

    case 'Validate token IDs':
      return {
        description: 'Validate that token IDs are valid for forking',
        params: [
          { name: 'tokenIds', type: 'uint256[]', required: true, hint: 'JSON array of Noun IDs', placeholder: '[1, 2, 3]' }
        ]
      };

    // WRITE FUNCTIONS
    case 'Escrow to fork':
      return {
        description: 'Escrow your Nouns to join or initiate a fork',
        params: [
          { name: 'tokenIds', type: 'uint256[]', required: true, hint: 'Your Noun IDs (JSON array)', placeholder: '[1, 2, 3]' },
          { name: 'proposalIds', type: 'uint256[]', required: true, hint: 'Proposals to bring to fork', placeholder: '[123, 456, 789]' },
          { name: 'reason', type: 'string', required: true, placeholder: 'Reason for forking...' }
        ]
      };

    case 'Withdraw from fork escrow':
      return {
        description: 'Withdraw your Nouns from fork escrow (if fork not executed)',
        params: [
          { name: 'tokenIds', type: 'uint256[]', required: true, placeholder: '[1, 2, 3]' }
        ]
      };

    case 'Return tokens to owner':
      return {
        description: 'Return escrowed tokens (DAO only)',
        params: [
          { name: 'tokenIds', type: 'uint256[]', required: true, placeholder: '[1, 2, 3]' }
        ],
        requiresProposal: true
      };

    case 'Deploy fork DAO':
      return {
        description: 'Deploy the new fork DAO (after threshold reached)',
        params: [
          { name: 'forkingPeriodEndTimestamp', type: 'uint256', required: true, hint: 'Fork end time', placeholder: '1700000000' },
          { name: 'forkEscrow', type: 'address', required: true, hint: 'Fork escrow address', placeholder: '0x...' }
        ]
      };

    default:
      return {
        description: `Execute ${functionName}`,
        params: []
      };
  }
}
