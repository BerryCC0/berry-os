/**
 * Streaming (Stream Factory) Function Configurations
 */

import { FunctionConfig } from '../BaseExecutor';

export function getStreamingConfig(functionName: string): FunctionConfig {
  switch (functionName) {
    // READ FUNCTIONS
    case 'Is stream active':
      return {
        description: 'Check if a stream is currently active',
        params: [
          { name: 'streamId', type: 'uint256', required: true, placeholder: '1' }
        ]
      };

    case 'Calculate stream progress':
      return {
        description: 'Calculate progress percentage of a stream (0-100)',
        params: [
          { name: 'startTime', type: 'uint256', required: true, hint: 'Unix timestamp', placeholder: '1700000000' },
          { name: 'stopTime', type: 'uint256', required: true, hint: 'Unix timestamp', placeholder: '1710000000' }
        ]
      };

    case 'Calculate remaining amount':
      return {
        description: 'Calculate remaining unstreamed amount',
        params: [
          { name: 'totalAmount', type: 'uint256', required: true, hint: 'Total USDC (6 decimals)', placeholder: '1000000000' },
          { name: 'withdrawnAmount', type: 'uint256', required: true, placeholder: '100000000' }
        ]
      };

    case 'Calculate available amount':
      return {
        description: 'Calculate amount available to withdraw now',
        params: [
          { name: 'totalAmount', type: 'uint256', required: true, placeholder: '1000000000' },
          { name: 'startTime', type: 'uint256', required: true, placeholder: '1700000000' },
          { name: 'stopTime', type: 'uint256', required: true, placeholder: '1710000000' },
          { name: 'withdrawnAmount', type: 'uint256', required: true, placeholder: '0' }
        ]
      };

    case 'Calculate stream rate':
      return {
        description: 'Calculate streaming rate per second',
        params: [
          { name: 'totalAmount', type: 'uint256', required: true, placeholder: '1000000000' },
          { name: 'startTime', type: 'uint256', required: true, placeholder: '1700000000' },
          { name: 'stopTime', type: 'uint256', required: true, placeholder: '1710000000' }
        ]
      };

    case 'Format stream rate':
      return {
        description: 'Format stream rate for display',
        params: [
          { name: 'totalAmount', type: 'uint256', required: true, placeholder: '1000000000' },
          { name: 'startTime', type: 'uint256', required: true, placeholder: '1700000000' },
          { name: 'stopTime', type: 'uint256', required: true, placeholder: '1710000000' }
        ]
      };

    case 'Get time remaining':
      return {
        description: 'Get time remaining in stream',
        params: [
          { name: 'stopTime', type: 'uint256', required: true, placeholder: '1710000000' }
        ]
      };

    case 'Validate stream params':
      return {
        description: 'Validate stream creation parameters',
        params: [
          { name: 'recipient', type: 'address', required: true, placeholder: '0x...' },
          { name: 'amount', type: 'uint256', required: true, placeholder: '1000000000' },
          { name: 'startTime', type: 'uint256', required: true, placeholder: '1700000000' },
          { name: 'stopTime', type: 'uint256', required: true, placeholder: '1710000000' }
        ]
      };

    // WRITE FUNCTIONS
    case 'Create stream':
      return {
        description: 'Create a new payment stream',
        params: [
          { name: 'payer', type: 'address', required: true, hint: 'Address paying for stream', placeholder: '0x...' },
          { name: 'recipient', type: 'address', required: true, hint: 'Stream recipient', placeholder: '0x...' },
          { name: 'amount', type: 'uint256', required: true, hint: 'Total USDC (6 decimals)', placeholder: '1000000000' },
          { name: 'token', type: 'address', required: true, hint: 'Token address (USDC)', placeholder: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
          { name: 'startTime', type: 'uint256', required: true, hint: 'Unix timestamp', placeholder: '1700000000' },
          { name: 'stopTime', type: 'uint256', required: true, hint: 'Unix timestamp', placeholder: '1710000000' },
          { name: 'nonce', type: 'uint256', required: true, hint: 'Unique nonce', placeholder: '1' }
        ],
        requiresProposal: true
      };

    case 'Withdraw from stream':
      return {
        description: 'Withdraw available amount from your stream',
        params: [
          { name: 'streamId', type: 'uint256', required: true, placeholder: '1' },
          { name: 'amount', type: 'uint256', required: true, hint: 'Amount to withdraw', placeholder: '100000000' }
        ]
      };

    case 'Cancel stream':
      return {
        description: 'Cancel a stream and return remaining funds',
        params: [
          { name: 'streamId', type: 'uint256', required: true, placeholder: '1' }
        ]
      };

    case 'Rescue ERC20':
      return {
        description: 'Rescue accidentally sent ERC20 tokens',
        params: [
          { name: 'token', type: 'address', required: true, placeholder: '0x...' },
          { name: 'recipient', type: 'address', required: true, placeholder: '0x...' },
          { name: 'amount', type: 'uint256', required: true, placeholder: '1000000' }
        ],
        requiresProposal: true
      };

    case 'Rescue ETH':
      return {
        description: 'Rescue accidentally sent ETH',
        params: [
          { name: 'recipient', type: 'address', required: true, placeholder: '0x...' },
          { name: 'amount', type: 'uint256', required: true, placeholder: '1000000000000000000' }
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
