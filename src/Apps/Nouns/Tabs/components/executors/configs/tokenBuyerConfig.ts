/**
 * Token Buyer Function Configurations  
 */

import { FunctionConfig } from '../BaseExecutor';

export function getTokenBuyerConfig(functionName: string): FunctionConfig {
  switch (functionName) {
    // READ FUNCTIONS
    case 'Calculate USDC output':
      return {
        description: 'Calculate expected USDC output for a given ETH input',
        params: [
          { name: 'ethAmount', type: 'uint256', required: true, hint: 'ETH in wei', placeholder: '1000000000000000000' },
          { name: 'ethUsdcPrice', type: 'uint256', required: true, hint: 'Price (e.g., 2000 = $2000/ETH)', placeholder: '2000' },
          { name: 'slippage', type: 'uint256', required: false, hint: 'Slippage tolerance in basis points (default 100 = 1%)', placeholder: '100' }
        ]
      };

    case 'Calculate ETH input':
      return {
        description: 'Calculate required ETH input for desired USDC output',
        params: [
          { name: 'usdcAmount', type: 'uint256', required: true, hint: 'USDC amount (6 decimals)', placeholder: '2000000000' },
          { name: 'ethUsdcPrice', type: 'uint256', required: true, placeholder: '2000' },
          { name: 'slippage', type: 'uint256', required: false, placeholder: '100' }
        ]
      };

    case 'Calculate price impact':
      return {
        description: 'Calculate price impact for a swap',
        params: [
          { name: 'inputAmount', type: 'uint256', required: true, hint: 'ETH in wei', placeholder: '1000000000000000000' },
          { name: 'outputAmount', type: 'uint256', required: true, hint: 'USDC out', placeholder: '2000000000' },
          { name: 'marketPrice', type: 'uint256', required: true, hint: 'Current market price', placeholder: '2000' }
        ]
      };

    case 'Get admin':
      return {
        description: 'Get the admin address',
        params: []
      };

    case 'Get payer':
      return {
        description: 'Get the payer contract address',
        params: []
      };

    case 'Get tokens receiver':
      return {
        description: 'Get the address that receives bought USDC',
        params: []
      };

    case 'Get bot discount':
      return {
        description: 'Get the bot discount percentage',
        params: []
      };

    case 'Get base swap fee':
      return {
        description: 'Get the base swap fee percentage',
        params: []
      };

    case 'Validate buy amount':
      return {
        description: 'Check if a buy amount is valid',
        params: [
          { name: 'ethAmount', type: 'uint256', required: true, placeholder: '1000000000000000000' }
        ]
      };

    // WRITE FUNCTIONS
    case 'Buy tokens (ETH → USDC)':
      return {
        description: 'Convert ETH to USDC through Uniswap (must send ETH with transaction)',
        params: [
          { name: 'ethAmount', type: 'uint256', required: true, hint: 'ETH to spend in wei', placeholder: '1000000000000000000' },
          { name: 'minUSDCOut', type: 'uint256', required: true, hint: 'Minimum USDC to receive (slippage protection)', placeholder: '1900000000' }
        ]
      };

    case 'Set admin':
      return {
        description: 'Update the admin address',
        params: [
          { name: 'newAdmin', type: 'address', required: true, placeholder: '0x...' }
        ],
        requiresProposal: true
      };

    case 'Set payer':
      return {
        description: 'Update the payer contract address',
        params: [
          { name: 'newPayer', type: 'address', required: true, placeholder: '0x...' }
        ],
        requiresProposal: true
      };

    case 'Set tokens receiver':
      return {
        description: 'Update the address that receives bought USDC',
        params: [
          { name: 'newTokensReceiver', type: 'address', required: true, placeholder: '0x...' }
        ],
        requiresProposal: true
      };

    case 'Withdraw ETH':
      return {
        description: 'Withdraw ETH from contract',
        params: [
          { name: 'to', type: 'address', required: true, placeholder: '0x...' },
          { name: 'amount', type: 'uint256', required: true, placeholder: '1000000000000000000' }
        ],
        requiresProposal: true
      };

    case 'Withdraw token':
      return {
        description: 'Withdraw ERC20 tokens from contract',
        params: [
          { name: 'token', type: 'address', required: true, placeholder: '0x...' },
          { name: 'to', type: 'address', required: true, placeholder: '0x...' },
          { name: 'amount', type: 'uint256', required: true, placeholder: '1000000' }
        ],
        requiresProposal: true
      };

    case 'Set bot discount':
      return {
        description: 'Update the bot discount percentage',
        params: [
          { name: 'newBotDiscountBPS', type: 'uint256', required: true, hint: 'Basis points', placeholder: '50' }
        ],
        requiresProposal: true
      };

    case 'Set base swap fee':
      return {
        description: 'Update the base swap fee',
        params: [
          { name: 'newBaseSwapFeeBPS', type: 'uint256', required: true, hint: 'Basis points', placeholder: '30' }
        ],
        requiresProposal: true
      };

    case 'Set payment token':
      return {
        description: 'Update the payment token (USDC) address',
        params: [
          { name: 'newPaymentToken', type: 'address', required: true, placeholder: '0x...' }
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
