/**
 * Payer Function Configurations
 */

import { FunctionConfig } from '../BaseExecutor';

export function getPayerConfig(functionName: string): FunctionConfig {
  switch (functionName) {
    // READ FUNCTIONS
    case 'Is authorized payer':
      return {
        description: 'Check if an address is authorized to trigger payments',
        params: [
          { name: 'address', type: 'address', required: true, placeholder: '0x...' }
        ]
      };

    case 'Is admin':
      return {
        description: 'Check if an address is the admin',
        params: [
          { name: 'address', type: 'address', required: true, placeholder: '0x...' }
        ]
      };

    case 'Get treasury':
      return {
        description: 'Get the treasury address',
        params: []
      };

    case 'Format payment amount':
      return {
        description: 'Format USDC amount for display',
        params: [
          { name: 'amount', type: 'uint256', required: true, hint: 'USDC amount (6 decimals)', placeholder: '1000000000' }
        ]
      };

    case 'Calculate total with fees':
      return {
        description: 'Calculate total payment including fees',
        params: [
          { name: 'baseAmount', type: 'uint256', required: true, placeholder: '1000000000' },
          { name: 'feePercentage', type: 'uint256', required: true, hint: 'Fee % (e.g., 2.5)', placeholder: '2.5' }
        ]
      };

    case 'Validate payment':
      return {
        description: 'Validate payment parameters',
        params: [
          { name: 'amount', type: 'uint256', required: true, placeholder: '1000000' }
        ]
      };

    // WRITE FUNCTIONS
    case 'Pay (send USDC)':
      return {
        description: 'Send USDC payment to recipient',
        params: [
          { name: 'recipient', type: 'address', required: true, placeholder: '0x...' },
          { name: 'amount', type: 'uint256', required: true, hint: 'USDC amount (6 decimals)', placeholder: '1000000000' },
          { name: 'reason', type: 'string', required: false, placeholder: 'Payment for services...' }
        ]
      };

    case 'Send or register debt':
      return {
        description: 'Attempt payment, or register as debt if insufficient balance',
        params: [
          { name: 'recipient', type: 'address', required: true, placeholder: '0x...' },
          { name: 'amount', type: 'uint256', required: true, placeholder: '1000000000' },
          { name: 'reason', type: 'string', required: false, placeholder: 'Payment reason...' }
        ]
      };

    case 'Withdraw token':
      return {
        description: 'Withdraw ERC20 tokens from payer',
        params: [
          { name: 'token', type: 'address', required: true, placeholder: '0x...' },
          { name: 'to', type: 'address', required: true, placeholder: '0x...' },
          { name: 'amount', type: 'uint256', required: true, placeholder: '1000000' }
        ],
        requiresProposal: true
      };

    case 'Set admin':
      return {
        description: 'Update the admin address',
        params: [
          { name: 'newAdmin', type: 'address', required: true, placeholder: '0x...' }
        ],
        requiresProposal: true
      };

    case 'Set treasury':
      return {
        description: 'Update the treasury address',
        params: [
          { name: 'newTreasury', type: 'address', required: true, placeholder: '0x...' }
        ],
        requiresProposal: true
      };

    case 'Authorize payer':
      return {
        description: 'Authorize an address to trigger payments',
        params: [
          { name: 'payer', type: 'address', required: true, placeholder: '0x...' }
        ],
        requiresProposal: true
      };

    case 'Revoke payer':
      return {
        description: 'Revoke payment authorization',
        params: [
          { name: 'payer', type: 'address', required: true, placeholder: '0x...' }
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
