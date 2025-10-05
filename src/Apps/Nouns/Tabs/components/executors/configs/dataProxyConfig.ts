/**
 * Data Proxy Function Configurations
 */

import { FunctionConfig } from '../BaseExecutor';

export function getDataProxyConfig(functionName: string): FunctionConfig {
  switch (functionName) {
    // READ FUNCTIONS
    case 'Get proposal candidates':
      return {
        description: 'Get list of proposal candidates',
        params: []
      };

    case 'Get create candidate cost':
      return {
        description: 'Get the ETH cost to create a proposal candidate',
        params: []
      };

    case 'Get update candidate cost':
      return {
        description: 'Get the ETH cost to update a proposal candidate',
        params: []
      };

    case 'Get fee recipient':
      return {
        description: 'Get the address receiving candidate creation fees',
        params: []
      };

    case 'Get Duna admin':
      return {
        description: 'Get the Duna admin address',
        params: []
      };

    case 'Get Nouns DAO address':
      return {
        description: 'Get the Nouns DAO Governor address',
        params: []
      };

    case 'Get Nouns Token address':
      return {
        description: 'Get the Nouns Token contract address',
        params: []
      };

    // WRITE FUNCTIONS
    case 'Create proposal candidate':
      return {
        description: 'Create a new proposal candidate (requires fee payment)',
        params: [
          { name: 'description', type: 'string', required: true, hint: 'Markdown description', placeholder: '# Proposal Title\n\nDescription...' },
          { name: 'slug', type: 'string', required: true, hint: 'URL-friendly identifier', placeholder: 'my-proposal' }
        ]
      };

    case 'Update proposal candidate':
      return {
        description: 'Update an existing proposal candidate',
        params: [
          { name: 'slug', type: 'string', required: true, placeholder: 'my-proposal' },
          { name: 'description', type: 'string', required: true, placeholder: 'Updated description...' }
        ]
      };

    case 'Cancel proposal candidate':
      return {
        description: 'Cancel your proposal candidate',
        params: [
          { name: 'slug', type: 'string', required: true, placeholder: 'my-proposal' }
        ]
      };

    case 'Add signature':
      return {
        description: 'Add your signature to support a candidate',
        params: [
          { name: 'slug', type: 'string', required: true, placeholder: 'my-proposal' },
          { name: 'sig', type: 'bytes', required: true, hint: 'EIP-712 signature', placeholder: '0x...' },
          { name: 'expirationTimestamp', type: 'uint256', required: true, hint: 'Unix timestamp', placeholder: '1700000000' }
        ]
      };

    case 'Send feedback':
      return {
        description: 'Send feedback on a proposal',
        params: [
          { name: 'proposalId', type: 'uint256', required: true, placeholder: '123' },
          { name: 'support', type: 'uint8', required: true, hint: '0=Against, 1=For, 2=Abstain', placeholder: '1' },
          { name: 'reason', type: 'string', required: false, placeholder: 'Feedback comment...' }
        ]
      };

    case 'Send candidate feedback':
      return {
        description: 'Send feedback on a proposal candidate',
        params: [
          { name: 'slug', type: 'string', required: true, placeholder: 'my-proposal' },
          { name: 'support', type: 'uint8', required: true, placeholder: '1' },
          { name: 'reason', type: 'string', required: false, placeholder: 'Feedback...' }
        ]
      };

    case 'Signal compliance':
      return {
        description: 'Signal intent to comply with proposal outcome',
        params: [
          { name: 'proposalId', type: 'uint256', required: true, placeholder: '123' }
        ]
      };

    case 'Post Duna admin message':
      return {
        description: 'Post a message as Duna admin',
        params: [
          { name: 'message', type: 'string', required: true, placeholder: 'Admin announcement...' }
        ],
        requiresProposal: true
      };

    case 'Post voter message':
      return {
        description: 'Post a message as a voter',
        params: [
          { name: 'proposalId', type: 'uint256', required: true, placeholder: '123' },
          { name: 'message', type: 'string', required: true, placeholder: 'Message...' }
        ]
      };

    case 'Set create cost':
      return {
        description: 'Update the candidate creation cost',
        params: [
          { name: 'newCreateCost', type: 'uint256', required: true, hint: 'ETH in wei', placeholder: '100000000000000000' }
        ],
        requiresProposal: true
      };

    case 'Set update cost':
      return {
        description: 'Update the candidate update cost',
        params: [
          { name: 'newUpdateCost', type: 'uint256', required: true, hint: 'ETH in wei', placeholder: '50000000000000000' }
        ],
        requiresProposal: true
      };

    case 'Set fee recipient':
      return {
        description: 'Update the fee recipient address',
        params: [
          { name: 'newFeeRecipient', type: 'address', required: true, placeholder: '0x...' }
        ],
        requiresProposal: true
      };

    case 'Set Duna admin':
      return {
        description: 'Update the Duna admin address',
        params: [
          { name: 'newAdmin', type: 'address', required: true, placeholder: '0x...' }
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
