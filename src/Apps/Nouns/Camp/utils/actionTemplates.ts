/**
 * Action Templates for Nouns Proposal Creation
 * Business logic for generating proposal actions from user-friendly inputs
 */

import { Address } from 'viem';
import { NOUNS_CONTRACTS, EXTERNAL_CONTRACTS } from '@/app/lib/Nouns/Contracts/utils/addresses';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ActionTemplateType =
  | 'treasury-eth'
  | 'treasury-usdc'
  | 'treasury-weth'
  | 'treasury-erc20-custom'
  | 'swap-buy-eth'
  | 'swap-sell-eth'
  | 'noun-transfer'
  | 'noun-swap'
  | 'noun-delegate'
  | 'payment-stream'
  | 'payment-once'
  | 'admin-voting-delay'
  | 'admin-voting-period'
  | 'admin-proposal-threshold'
  | 'admin-last-minute-window'
  | 'admin-objection-period'
  | 'admin-updatable-period'
  | 'admin-min-quorum'
  | 'admin-max-quorum'
  | 'admin-quorum-coefficient'
  | 'admin-dynamic-quorum'
  | 'admin-fork-period'
  | 'admin-fork-threshold'
  | 'admin-fork-deployer'
  | 'admin-fork-escrow'
  | 'admin-fork-tokens'
  | 'admin-pending-admin'
  | 'admin-vetoer'
  | 'admin-pending-vetoer'
  | 'admin-burn-vetoer'
  | 'admin-timelock-delay'
  | 'admin-timelock-admin'
  | 'custom';

export interface ProposalAction {
  target: string;
  value: string;
  signature: string;
  calldata: string;
  // Multi-action metadata
  isPartOfMultiAction?: boolean;
  multiActionGroupId?: string;
  multiActionIndex?: number;
}

export interface ActionTemplate {
  id: ActionTemplateType;
  category: 'treasury' | 'swaps' | 'nouns' | 'payments' | 'admin' | 'custom';
  name: string;
  description: string;
  isMultiAction: boolean; // Returns multiple actions
  fields: ActionField[];
}

export interface ActionField {
  name: string;
  label: string;
  type: 'address' | 'amount' | 'number' | 'select' | 'date' | 'text' | 'token-select';
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  validation?: {
    min?: number;
    max?: number;
    decimals?: number;
  };
  helpText?: string;
}

export interface TokenInfo {
  symbol: string;
  address: Address;
  decimals: number;
  balance?: bigint;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const COMMON_TOKENS: TokenInfo[] = [
  { symbol: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6 },
  { symbol: 'WETH', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', decimals: 18 },
  { symbol: 'DAI', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18 },
  { symbol: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 },
  { symbol: 'stETH', address: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84', decimals: 18 },
];

export const TREASURY_ADDRESS = NOUNS_CONTRACTS.NounsTreasury.proxy as Address;
export const NOUNS_TOKEN_ADDRESS = NOUNS_CONTRACTS.NounsToken.address as Address;
export const DAO_PROXY_ADDRESS = NOUNS_CONTRACTS.NounsDAOProxy.proxy as Address;

// ============================================================================
// ACTION TEMPLATE REGISTRY
// ============================================================================

export const ACTION_TEMPLATES: Record<ActionTemplateType, ActionTemplate> = {
  // Treasury Transfers
  'treasury-eth': {
    id: 'treasury-eth',
    category: 'treasury',
    name: 'Send ETH from Treasury',
    description: 'Transfer ETH from the Nouns DAO treasury to a recipient',
    isMultiAction: false,
    fields: [
      {
        name: 'recipient',
        label: 'Recipient Address',
        type: 'address',
        placeholder: '0x... or ENS name',
        required: true,
        helpText: 'Address that will receive the ETH'
      },
      {
        name: 'amount',
        label: 'Amount (ETH)',
        type: 'amount',
        placeholder: '0.0',
        required: true,
        validation: { min: 0, decimals: 18 },
        helpText: 'Amount of ETH to send'
      }
    ]
  },

  'treasury-usdc': {
    id: 'treasury-usdc',
    category: 'treasury',
    name: 'Send USDC from Treasury',
    description: 'Transfer USDC from the treasury to a recipient',
    isMultiAction: false,
    fields: [
      {
        name: 'recipient',
        label: 'Recipient Address',
        type: 'address',
        placeholder: '0x... or ENS name',
        required: true
      },
      {
        name: 'amount',
        label: 'Amount (USDC)',
        type: 'amount',
        placeholder: '0.0',
        required: true,
        validation: { min: 0, decimals: 6 }
      }
    ]
  },

  'treasury-weth': {
    id: 'treasury-weth',
    category: 'treasury',
    name: 'Send WETH from Treasury',
    description: 'Transfer WETH from the treasury to a recipient',
    isMultiAction: false,
    fields: [
      {
        name: 'recipient',
        label: 'Recipient Address',
        type: 'address',
        placeholder: '0x... or ENS name',
        required: true
      },
      {
        name: 'amount',
        label: 'Amount (WETH)',
        type: 'amount',
        placeholder: '0.0',
        required: true,
        validation: { min: 0, decimals: 18 }
      }
    ]
  },

  'treasury-erc20-custom': {
    id: 'treasury-erc20-custom',
    category: 'treasury',
    name: 'Send ERC20 Token from Treasury',
    description: 'Transfer any ERC20 token from treasury (shows actual balances)',
    isMultiAction: false,
    fields: [
      {
        name: 'token',
        label: 'Token',
        type: 'token-select',
        required: true,
        helpText: 'Select token or enter custom address'
      },
      {
        name: 'recipient',
        label: 'Recipient Address',
        type: 'address',
        placeholder: '0x... or ENS name',
        required: true
      },
      {
        name: 'amount',
        label: 'Amount',
        type: 'amount',
        placeholder: '0.0',
        required: true,
        validation: { min: 0 }
      }
    ]
  },

  // Treasury Swaps
  'swap-buy-eth': {
    id: 'swap-buy-eth',
    category: 'swaps',
    name: 'Buy ETH with USDC',
    description: 'Use TokenBuyer to swap treasury USDC for ETH',
    isMultiAction: false,
    fields: [
      {
        name: 'ethAmount',
        label: 'ETH Amount to Buy',
        type: 'amount',
        placeholder: '0.0',
        required: true,
        validation: { min: 0, decimals: 18 },
        helpText: 'Amount of ETH the treasury will receive'
      }
    ]
  },

  'swap-sell-eth': {
    id: 'swap-sell-eth',
    category: 'swaps',
    name: 'Sell ETH for USDC',
    description: 'Use TokenBuyer to sell treasury ETH for USDC',
    isMultiAction: false,
    fields: [
      {
        name: 'ethAmount',
        label: 'ETH Amount to Sell',
        type: 'amount',
        placeholder: '0.0',
        required: true,
        validation: { min: 0, decimals: 18 }
      }
    ]
  },

  // Nouns Operations
  'noun-transfer': {
    id: 'noun-transfer',
    category: 'nouns',
    name: 'Transfer Noun from Treasury',
    description: 'Transfer a Noun NFT from treasury to recipient',
    isMultiAction: false,
    fields: [
      {
        name: 'nounId',
        label: 'Noun ID',
        type: 'number',
        placeholder: '123',
        required: true,
        validation: { min: 0 },
        helpText: 'ID of the Noun to transfer'
      },
      {
        name: 'recipient',
        label: 'Recipient Address',
        type: 'address',
        placeholder: '0x... or ENS name',
        required: true
      }
    ]
  },

  'noun-swap': {
    id: 'noun-swap',
    category: 'nouns',
    name: 'Swap Nouns with Treasury',
    description: 'Multi-step: Your Noun + optional tip → Treasury Noun',
    isMultiAction: true,
    fields: [
      {
        name: 'userAddress',
        label: 'Your Address',
        type: 'address',
        placeholder: '0x... or ENS name',
        required: true,
        helpText: 'Your wallet address (auto-detected)'
      },
      {
        name: 'userNounId',
        label: 'Your Noun',
        type: 'number',
        placeholder: 'Select from your Nouns',
        required: true,
        validation: { min: 0 },
        helpText: 'Noun you are offering'
      },
      {
        name: 'treasuryNounId',
        label: 'Treasury Noun',
        type: 'number',
        placeholder: 'Select from treasury Nouns',
        required: true,
        validation: { min: 0 },
        helpText: 'Noun you want from treasury'
      },
      {
        name: 'tipCurrency',
        label: 'Tip Currency',
        type: 'select',
        required: false,
        helpText: 'Optional currency for tip',
        options: [
          { label: 'No Tip', value: '' },
          { label: 'ETH', value: 'eth' },
          { label: 'WETH', value: 'weth' },
          { label: 'USDC', value: 'usdc' }
        ]
      },
      {
        name: 'tipAmount',
        label: 'Tip Amount',
        type: 'amount',
        placeholder: '0.0',
        required: false,
        validation: { min: 0 },
        helpText: 'Optional amount to tip'
      }
    ]
  },

  'noun-delegate': {
    id: 'noun-delegate',
    category: 'nouns',
    name: 'Delegate Treasury Nouns',
    description: 'Delegate voting power of treasury-owned Nouns',
    isMultiAction: false,
    fields: [
      {
        name: 'delegatee',
        label: 'Delegate To',
        type: 'address',
        placeholder: '0x... or ENS name',
        required: true,
        helpText: 'Address that will receive voting power'
      }
    ]
  },

  // Payment Streams
  'payment-stream': {
    id: 'payment-stream',
    category: 'payments',
    name: 'Create Payment Stream',
    description: 'Set up a streaming payment via StreamFactory',
    isMultiAction: false,
    fields: [
      {
        name: 'recipient',
        label: 'Recipient Address',
        type: 'address',
        placeholder: '0x... or ENS name',
        required: true
      },
      {
        name: 'amount',
        label: 'Total Amount (USDC)',
        type: 'amount',
        placeholder: '0.0',
        required: true,
        validation: { min: 0, decimals: 6 }
      },
      {
        name: 'startDate',
        label: 'Start Date',
        type: 'date',
        required: true
      },
      {
        name: 'endDate',
        label: 'End Date',
        type: 'date',
        required: true
      }
    ]
  },

  'payment-once': {
    id: 'payment-once',
    category: 'payments',
    name: 'One-time Payment',
    description: 'Send USDC payment via Payer contract',
    isMultiAction: false,
    fields: [
      {
        name: 'recipient',
        label: 'Recipient Address',
        type: 'address',
        placeholder: '0x... or ENS name',
        required: true
      },
      {
        name: 'amount',
        label: 'Amount (USDC)',
        type: 'amount',
        placeholder: '0.0',
        required: true,
        validation: { min: 0, decimals: 6 }
      }
    ]
  },

  // Admin Functions - Voting Parameters
  'admin-voting-delay': {
    id: 'admin-voting-delay',
    category: 'admin',
    name: 'Set Voting Delay',
    description: 'Adjust blocks between proposal creation and voting start',
    isMultiAction: false,
    fields: [
      {
        name: 'blocks',
        label: 'Voting Delay (blocks)',
        type: 'number',
        placeholder: '14400',
        required: true,
        validation: { min: 0 },
        helpText: '~1 day = 7200 blocks'
      }
    ]
  },

  'admin-voting-period': {
    id: 'admin-voting-period',
    category: 'admin',
    name: 'Set Voting Period',
    description: 'Adjust voting period duration in blocks',
    isMultiAction: false,
    fields: [
      {
        name: 'blocks',
        label: 'Voting Period (blocks)',
        type: 'number',
        placeholder: '50400',
        required: true,
        validation: { min: 1 },
        helpText: '~7 days = 50400 blocks'
      }
    ]
  },

  'admin-proposal-threshold': {
    id: 'admin-proposal-threshold',
    category: 'admin',
    name: 'Set Proposal Threshold BPS',
    description: 'Adjust minimum Nouns needed to propose (basis points)',
    isMultiAction: false,
    fields: [
      {
        name: 'bps',
        label: 'Threshold (BPS)',
        type: 'number',
        placeholder: '25',
        required: true,
        validation: { min: 0, max: 1000 },
        helpText: '100 BPS = 1%, max 1000 BPS = 10%'
      }
    ]
  },

  'admin-last-minute-window': {
    id: 'admin-last-minute-window',
    category: 'admin',
    name: 'Set Last Minute Window',
    description: 'Adjust last-minute voting extension window',
    isMultiAction: false,
    fields: [
      {
        name: 'blocks',
        label: 'Window (blocks)',
        type: 'number',
        placeholder: '7200',
        required: true,
        validation: { min: 0 }
      }
    ]
  },

  'admin-objection-period': {
    id: 'admin-objection-period',
    category: 'admin',
    name: 'Set Objection Period',
    description: 'Adjust objection period after voting ends',
    isMultiAction: false,
    fields: [
      {
        name: 'blocks',
        label: 'Objection Period (blocks)',
        type: 'number',
        placeholder: '7200',
        required: true,
        validation: { min: 0 }
      }
    ]
  },

  'admin-updatable-period': {
    id: 'admin-updatable-period',
    category: 'admin',
    name: 'Set Updatable Period',
    description: 'Adjust period proposals can be updated',
    isMultiAction: false,
    fields: [
      {
        name: 'blocks',
        label: 'Updatable Period (blocks)',
        type: 'number',
        placeholder: '7200',
        required: true,
        validation: { min: 0 }
      }
    ]
  },

  // Admin Functions - Quorum Parameters
  'admin-min-quorum': {
    id: 'admin-min-quorum',
    category: 'admin',
    name: 'Set Min Quorum BPS',
    description: 'Adjust minimum quorum (basis points)',
    isMultiAction: false,
    fields: [
      {
        name: 'bps',
        label: 'Min Quorum (BPS)',
        type: 'number',
        placeholder: '1000',
        required: true,
        validation: { min: 0, max: 2000 },
        helpText: '1000 BPS = 10%, max 2000 BPS = 20%'
      }
    ]
  },

  'admin-max-quorum': {
    id: 'admin-max-quorum',
    category: 'admin',
    name: 'Set Max Quorum BPS',
    description: 'Adjust maximum quorum (basis points)',
    isMultiAction: false,
    fields: [
      {
        name: 'bps',
        label: 'Max Quorum (BPS)',
        type: 'number',
        placeholder: '2000',
        required: true,
        validation: { min: 0, max: 6000 },
        helpText: '2000 BPS = 20%, max 6000 BPS = 60%'
      }
    ]
  },

  'admin-quorum-coefficient': {
    id: 'admin-quorum-coefficient',
    category: 'admin',
    name: 'Set Quorum Coefficient',
    description: 'Adjust dynamic quorum calculation coefficient',
    isMultiAction: false,
    fields: [
      {
        name: 'coefficient',
        label: 'Quorum Coefficient',
        type: 'number',
        placeholder: '1000000',
        required: true,
        validation: { min: 0 }
      }
    ]
  },

  'admin-dynamic-quorum': {
    id: 'admin-dynamic-quorum',
    category: 'admin',
    name: 'Set Dynamic Quorum Params',
    description: 'Update all quorum parameters at once',
    isMultiAction: false,
    fields: [
      {
        name: 'minBps',
        label: 'Min Quorum (BPS)',
        type: 'number',
        placeholder: '1000',
        required: true,
        validation: { min: 0, max: 2000 }
      },
      {
        name: 'maxBps',
        label: 'Max Quorum (BPS)',
        type: 'number',
        placeholder: '2000',
        required: true,
        validation: { min: 0, max: 6000 }
      },
      {
        name: 'coefficient',
        label: 'Coefficient',
        type: 'number',
        placeholder: '1000000',
        required: true,
        validation: { min: 0 }
      }
    ]
  },

  // Admin Functions - Fork Mechanism
  'admin-fork-period': {
    id: 'admin-fork-period',
    category: 'admin',
    name: 'Set Fork Period',
    description: 'Adjust fork escrow period duration',
    isMultiAction: false,
    fields: [
      {
        name: 'seconds',
        label: 'Fork Period (seconds)',
        type: 'number',
        placeholder: '1209600',
        required: true,
        validation: { min: 0 },
        helpText: '14 days = 1209600 seconds'
      }
    ]
  },

  'admin-fork-threshold': {
    id: 'admin-fork-threshold',
    category: 'admin',
    name: 'Set Fork Threshold BPS',
    description: 'Adjust Nouns needed to trigger fork (basis points)',
    isMultiAction: false,
    fields: [
      {
        name: 'bps',
        label: 'Fork Threshold (BPS)',
        type: 'number',
        placeholder: '2000',
        required: true,
        validation: { min: 0, max: 10000 },
        helpText: '2000 BPS = 20%'
      }
    ]
  },

  'admin-fork-deployer': {
    id: 'admin-fork-deployer',
    category: 'admin',
    name: 'Set Fork DAO Deployer',
    description: 'Update fork deployer contract address',
    isMultiAction: false,
    fields: [
      {
        name: 'address',
        label: 'Fork Deployer Address',
        type: 'address',
        placeholder: '0x...',
        required: true
      }
    ]
  },

  'admin-fork-escrow': {
    id: 'admin-fork-escrow',
    category: 'admin',
    name: 'Set Fork Escrow',
    description: 'Update fork escrow contract address',
    isMultiAction: false,
    fields: [
      {
        name: 'address',
        label: 'Fork Escrow Address',
        type: 'address',
        placeholder: '0x...',
        required: true
      }
    ]
  },

  'admin-fork-tokens': {
    id: 'admin-fork-tokens',
    category: 'admin',
    name: 'Set Fork ERC20 Tokens',
    description: 'Configure which tokens are included in forks',
    isMultiAction: false,
    fields: [
      {
        name: 'tokens',
        label: 'Token Addresses (comma-separated)',
        type: 'text',
        placeholder: '0x..., 0x...',
        required: true,
        helpText: 'List of ERC20 token addresses to include'
      }
    ]
  },

  // Admin Functions - Admin & Governance
  'admin-pending-admin': {
    id: 'admin-pending-admin',
    category: 'admin',
    name: 'Set Pending Admin',
    description: 'Propose new admin address',
    isMultiAction: false,
    fields: [
      {
        name: 'address',
        label: 'Pending Admin Address',
        type: 'address',
        placeholder: '0x...',
        required: true
      }
    ]
  },

  'admin-vetoer': {
    id: 'admin-vetoer',
    category: 'admin',
    name: 'Set Vetoer',
    description: 'Update vetoer address',
    isMultiAction: false,
    fields: [
      {
        name: 'address',
        label: 'Vetoer Address',
        type: 'address',
        placeholder: '0x...',
        required: true
      }
    ]
  },

  'admin-pending-vetoer': {
    id: 'admin-pending-vetoer',
    category: 'admin',
    name: 'Set Pending Vetoer',
    description: 'Propose new vetoer address',
    isMultiAction: false,
    fields: [
      {
        name: 'address',
        label: 'Pending Vetoer Address',
        type: 'address',
        placeholder: '0x...',
        required: true
      }
    ]
  },

  'admin-burn-vetoer': {
    id: 'admin-burn-vetoer',
    category: 'admin',
    name: 'Burn Veto Power',
    description: '⚠️ IRREVERSIBLE: Permanently remove veto power',
    isMultiAction: false,
    fields: []
  },

  'admin-timelock-delay': {
    id: 'admin-timelock-delay',
    category: 'admin',
    name: 'Set Timelock Delay',
    description: 'Adjust timelock delay period',
    isMultiAction: false,
    fields: [
      {
        name: 'seconds',
        label: 'Delay (seconds)',
        type: 'number',
        placeholder: '172800',
        required: true,
        validation: { min: 0 },
        helpText: '2 days = 172800 seconds'
      }
    ]
  },

  'admin-timelock-admin': {
    id: 'admin-timelock-admin',
    category: 'admin',
    name: 'Set Timelock Pending Admin',
    description: 'Propose new timelock admin',
    isMultiAction: false,
    fields: [
      {
        name: 'address',
        label: 'Pending Admin Address',
        type: 'address',
        placeholder: '0x...',
        required: true
      }
    ]
  },

  // Custom Transaction
  'custom': {
    id: 'custom',
    category: 'custom',
    name: 'Custom Transaction',
    description: 'Manual entry for advanced users',
    isMultiAction: false,
    fields: []
  }
};

// Get templates by category
export function getTemplatesByCategory(category: ActionTemplate['category']): ActionTemplate[] {
  return Object.values(ACTION_TEMPLATES).filter(template => template.category === category);
}

// Get template by ID
export function getTemplate(id: ActionTemplateType): ActionTemplate | undefined {
  return ACTION_TEMPLATES[id];
}

// ============================================================================
// CALLDATA ENCODING HELPERS
// ============================================================================

/**
 * Encode ERC20 transfer function calldata
 * Function: transfer(address recipient, uint256 amount)
 */
function encodeERC20Transfer(recipient: Address, amount: bigint): `0x${string}` {
  // Function selector for transfer(address,uint256) = 0xa9059cbb
  const selector = 'a9059cbb';
  
  // Pad recipient address to 32 bytes
  const recipientPadded = recipient.slice(2).padStart(64, '0');
  
  // Convert amount to hex and pad to 32 bytes
  const amountHex = amount.toString(16).padStart(64, '0');
  
  return `0x${selector}${recipientPadded}${amountHex}`;
}

/**
 * Encode transferFrom function calldata for ERC20/ERC721
 * Function: transferFrom(address from, address to, uint256 tokenIdOrAmount)
 */
function encodeTransferFrom(from: Address, to: Address, tokenIdOrAmount: bigint): `0x${string}` {
  // Function selector for transferFrom(address,address,uint256) = 0x23b872dd
  const selector = '23b872dd';
  
  const fromPadded = from.slice(2).padStart(64, '0');
  const toPadded = to.slice(2).padStart(64, '0');
  const valuePadded = tokenIdOrAmount.toString(16).padStart(64, '0');
  
  return `0x${selector}${fromPadded}${toPadded}${valuePadded}`;
}

/**
 * Encode safeTransferFrom function calldata for ERC721
 * Function: safeTransferFrom(address from, address to, uint256 tokenId)
 */
function encodeSafeTransferFrom(from: Address, to: Address, tokenId: bigint): `0x${string}` {
  // Function selector for safeTransferFrom(address,address,uint256) = 0x42842e0e
  const selector = '42842e0e';
  
  const fromPadded = from.slice(2).padStart(64, '0');
  const toPadded = to.slice(2).padStart(64, '0');
  const tokenIdPadded = tokenId.toString(16).padStart(64, '0');
  
  return `0x${selector}${fromPadded}${toPadded}${tokenIdPadded}`;
}

/**
 * Encode delegate function calldata
 * Function: delegate(address delegatee)
 */
function encodeDelegate(delegatee: Address): `0x${string}` {
  // Function selector for delegate(address) = 0x5c19a95c
  const selector = '5c19a95c';
  const delegateePadded = delegatee.slice(2).padStart(64, '0');
  
  return `0x${selector}${delegateePadded}`;
}

/**
 * Encode sendETH function calldata for Treasury
 * Function: sendETH(address recipient, uint256 ethToSend)
 */
function encodeSendETH(recipient: Address, amount: bigint): `0x${string}` {
  // Function selector for sendETH(address,uint256) = 0x7b34c7b6
  const selector = '7b34c7b6';
  
  const recipientPadded = recipient.slice(2).padStart(64, '0');
  const amountHex = amount.toString(16).padStart(64, '0');
  
  return `0x${selector}${recipientPadded}${amountHex}`;
}

/**
 * Encode sendERC20 function calldata for Treasury
 * Function: sendERC20(address recipient, address erc20Token, uint256 tokensToSend)
 */
function encodeSendERC20(recipient: Address, token: Address, amount: bigint): `0x${string}` {
  // Function selector for sendERC20(address,address,uint256) = 0xa4a1e3e7
  const selector = 'a4a1e3e7';
  
  const recipientPadded = recipient.slice(2).padStart(64, '0');
  const tokenPadded = token.slice(2).padStart(64, '0');
  const amountHex = amount.toString(16).padStart(64, '0');
  
  return `0x${selector}${recipientPadded}${tokenPadded}${amountHex}`;
}

/**
 * Encode admin function calldata with single uint256 parameter
 */
function encodeAdminUint256(functionSignature: string, value: bigint): `0x${string}` {
  // Calculate function selector (first 4 bytes of keccak256)
  // For simplicity, we'll use known selectors
  const selectors: Record<string, string> = {
    '_setVotingDelay(uint256)': '70b0f660',
    '_setVotingPeriod(uint256)': 'c4d252f5',
    '_setProposalThresholdBPS(uint256)': '7d42e4e3',
    '_setForkPeriod(uint256)': 'be8e3542',
    '_setForkThresholdBPS(uint256)': '4be52e07',
    '_setDelay(uint256)': 'e177246e'
  };
  
  const selector = selectors[functionSignature];
  if (!selector) {
    throw new Error(`Unknown function signature: ${functionSignature}`);
  }
  
  const valuePadded = value.toString(16).padStart(64, '0');
  return `0x${selector}${valuePadded}`;
}

/**
 * Encode admin function calldata with single uint32 parameter
 */
function encodeAdminUint32(functionSignature: string, value: number): `0x${string}` {
  const selectors: Record<string, string> = {
    '_setLastMinuteWindowInBlocks(uint32)': 'a5c79db9',
    '_setObjectionPeriodDurationInBlocks(uint32)': '9d6f12cf',
    '_setProposalUpdatablePeriodInBlocks(uint32)': 'c9d2c8b6',
    '_setQuorumCoefficient(uint32)': 'b0c60035'
  };
  
  const selector = selectors[functionSignature];
  if (!selector) {
    throw new Error(`Unknown function signature: ${functionSignature}`);
  }
  
  const valuePadded = value.toString(16).padStart(64, '0');
  return `0x${selector}${valuePadded}`;
}

/**
 * Encode admin function calldata with single uint16 parameter
 */
function encodeAdminUint16(functionSignature: string, value: number): `0x${string}` {
  const selectors: Record<string, string> = {
    '_setMinQuorumVotesBPS(uint16)': '638d9861',
    '_setMaxQuorumVotesBPS(uint16)': '15b96f74'
  };
  
  const selector = selectors[functionSignature];
  if (!selector) {
    throw new Error(`Unknown function signature: ${functionSignature}`);
  }
  
  const valuePadded = value.toString(16).padStart(64, '0');
  return `0x${selector}${valuePadded}`;
}

/**
 * Encode admin function calldata with single address parameter
 */
function encodeAdminAddress(functionSignature: string, address: Address): `0x${string}` {
  const selectors: Record<string, string> = {
    '_setPendingAdmin(address)': '4dd18bf5',
    '_setVetoer(address)': '64c40d0d',
    '_setPendingVetoer(address)': '0dc3cdd5',
    '_setForkDAODeployer(address)': '6b88e9c8',
    '_setForkEscrow(address)': 'c92b2cf3'
  };
  
  const selector = selectors[functionSignature];
  if (!selector) {
    throw new Error(`Unknown function signature: ${functionSignature}`);
  }
  
  const addressPadded = address.slice(2).padStart(64, '0');
  return `0x${selector}${addressPadded}`;
}

/**
 * Encode _setDynamicQuorumParams function
 */
function encodeDynamicQuorumParams(minBps: number, maxBps: number, coefficient: number): `0x${string}` {
  // Function selector for _setDynamicQuorumParams(uint16,uint16,uint32) = 0x07d1e0cf
  const selector = '07d1e0cf';
  
  const minBpsPadded = minBps.toString(16).padStart(64, '0');
  const maxBpsPadded = maxBps.toString(16).padStart(64, '0');
  const coefficientPadded = coefficient.toString(16).padStart(64, '0');
  
  return `0x${selector}${minBpsPadded}${maxBpsPadded}${coefficientPadded}`;
}

/**
 * Encode _burnVetoPower function (no parameters)
 */
function encodeBurnVetoPower(): `0x${string}` {
  // Function selector for _burnVetoPower() = 0x79f70d18
  return '0x79f70d18';
}

// ============================================================================
// ACTION GENERATION FUNCTIONS
// ============================================================================

export interface TemplateFieldValues {
  [key: string]: string | undefined;
}

/**
 * Generate proposal action(s) from template and field values
 */
export function generateActionsFromTemplate(
  templateId: ActionTemplateType,
  fieldValues: TemplateFieldValues
): ProposalAction[] {
  const template = getTemplate(templateId);
  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }

  switch (templateId) {
    // Treasury Transfers
    case 'treasury-eth':
      return [{
        target: TREASURY_ADDRESS,
        value: '0',
        signature: 'sendETH(address,uint256)',
        calldata: encodeSendETH(
          fieldValues.recipient as Address,
          parseEther(fieldValues.amount || '0')
        )
      }];

    case 'treasury-usdc':
      return [{
        target: TREASURY_ADDRESS,
        value: '0',
        signature: 'sendERC20(address,address,uint256)',
        calldata: encodeSendERC20(
          fieldValues.recipient as Address,
          EXTERNAL_CONTRACTS.USDC.address as Address,
          parseUnits(fieldValues.amount || '0', 6)
        )
      }];

    case 'treasury-weth':
      return [{
        target: TREASURY_ADDRESS,
        value: '0',
        signature: 'sendERC20(address,address,uint256)',
        calldata: encodeSendERC20(
          fieldValues.recipient as Address,
          EXTERNAL_CONTRACTS.WETH.address as Address,
          parseEther(fieldValues.amount || '0')
        )
      }];

    case 'treasury-erc20-custom': {
      const parsed = JSON.parse(fieldValues.token || '{}');
      const tokenInfo: TokenInfo = {
        symbol: parsed.symbol,
        address: parsed.address,
        decimals: parsed.decimals,
        balance: parsed.balance ? BigInt(parsed.balance) : undefined
      };
      return [{
        target: TREASURY_ADDRESS,
        value: '0',
        signature: 'sendERC20(address,address,uint256)',
        calldata: encodeSendERC20(
          fieldValues.recipient as Address,
          tokenInfo.address,
          parseUnits(fieldValues.amount || '0', tokenInfo.decimals)
        )
      }];
    }

    // Nouns Operations
    case 'noun-transfer':
      return [{
        target: NOUNS_TOKEN_ADDRESS,
        value: '0',
        signature: 'safeTransferFrom(address,address,uint256)',
        calldata: encodeSafeTransferFrom(
          TREASURY_ADDRESS,
          fieldValues.recipient as Address,
          BigInt(fieldValues.nounId || '0')
        )
      }];

    case 'noun-swap': {
      const actions: ProposalAction[] = [];
      const groupId = `noun-swap-${Date.now()}`;
      
      // Action 1: User's Noun → Treasury
      actions.push({
        target: NOUNS_TOKEN_ADDRESS,
        value: '0',
        signature: 'transferFrom(address,address,uint256)',
        calldata: encodeTransferFrom(
          fieldValues.userAddress as Address,
          TREASURY_ADDRESS,
          BigInt(fieldValues.userNounId || '0')
        ),
        isPartOfMultiAction: true,
        multiActionGroupId: groupId,
        multiActionIndex: 0
      });
      
      // Action 2: Optional Tip → Treasury (supports ETH/WETH/USDC)
      if (fieldValues.tipAmount && parseFloat(fieldValues.tipAmount) > 0) {
        const tipCurrency = fieldValues.tipCurrency || 'weth';
        
        if (tipCurrency === 'eth') {
          // ETH tip: Plain ETH transfer
          actions.push({
            target: TREASURY_ADDRESS,
            value: parseEther(fieldValues.tipAmount).toString(),
            signature: '',
            calldata: '0x',
            isPartOfMultiAction: true,
            multiActionGroupId: groupId,
            multiActionIndex: actions.length
          });
        } else if (tipCurrency === 'weth') {
          // WETH tip
          actions.push({
            target: EXTERNAL_CONTRACTS.WETH.address,
            value: '0',
            signature: 'transferFrom(address,address,uint256)',
            calldata: encodeTransferFrom(
              fieldValues.userAddress as Address,
              TREASURY_ADDRESS,
              parseEther(fieldValues.tipAmount)
            ),
            isPartOfMultiAction: true,
            multiActionGroupId: groupId,
            multiActionIndex: actions.length
          });
        } else if (tipCurrency === 'usdc') {
          // USDC tip
          actions.push({
            target: EXTERNAL_CONTRACTS.USDC.address,
            value: '0',
            signature: 'transferFrom(address,address,uint256)',
            calldata: encodeTransferFrom(
              fieldValues.userAddress as Address,
              TREASURY_ADDRESS,
              parseUnits(fieldValues.tipAmount, 6)
            ),
            isPartOfMultiAction: true,
            multiActionGroupId: groupId,
            multiActionIndex: actions.length
          });
        }
      }
      
      // Action 3: Treasury's Noun → User
      actions.push({
        target: NOUNS_TOKEN_ADDRESS,
        value: '0',
        signature: 'safeTransferFrom(address,address,uint256)',
        calldata: encodeSafeTransferFrom(
          TREASURY_ADDRESS,
          fieldValues.userAddress as Address,
          BigInt(fieldValues.treasuryNounId || '0')
        ),
        isPartOfMultiAction: true,
        multiActionGroupId: groupId,
        multiActionIndex: actions.length
      });
      
      return actions;
    }

    case 'noun-delegate':
      return [{
        target: NOUNS_TOKEN_ADDRESS,
        value: '0',
        signature: 'delegate(address)',
        calldata: encodeDelegate(fieldValues.delegatee as Address)
      }];

    // Admin Functions - Voting
    case 'admin-voting-delay':
      return [{
        target: DAO_PROXY_ADDRESS,
        value: '0',
        signature: '_setVotingDelay(uint256)',
        calldata: encodeAdminUint256('_setVotingDelay(uint256)', BigInt(fieldValues.blocks || '0'))
      }];

    case 'admin-voting-period':
      return [{
        target: DAO_PROXY_ADDRESS,
        value: '0',
        signature: '_setVotingPeriod(uint256)',
        calldata: encodeAdminUint256('_setVotingPeriod(uint256)', BigInt(fieldValues.blocks || '0'))
      }];

    case 'admin-proposal-threshold':
      return [{
        target: DAO_PROXY_ADDRESS,
        value: '0',
        signature: '_setProposalThresholdBPS(uint256)',
        calldata: encodeAdminUint256('_setProposalThresholdBPS(uint256)', BigInt(fieldValues.bps || '0'))
      }];

    case 'admin-last-minute-window':
      return [{
        target: DAO_PROXY_ADDRESS,
        value: '0',
        signature: '_setLastMinuteWindowInBlocks(uint32)',
        calldata: encodeAdminUint32('_setLastMinuteWindowInBlocks(uint32)', Number(fieldValues.blocks || '0'))
      }];

    case 'admin-objection-period':
      return [{
        target: DAO_PROXY_ADDRESS,
        value: '0',
        signature: '_setObjectionPeriodDurationInBlocks(uint32)',
        calldata: encodeAdminUint32('_setObjectionPeriodDurationInBlocks(uint32)', Number(fieldValues.blocks || '0'))
      }];

    case 'admin-updatable-period':
      return [{
        target: DAO_PROXY_ADDRESS,
        value: '0',
        signature: '_setProposalUpdatablePeriodInBlocks(uint32)',
        calldata: encodeAdminUint32('_setProposalUpdatablePeriodInBlocks(uint32)', Number(fieldValues.blocks || '0'))
      }];

    // Admin Functions - Quorum
    case 'admin-min-quorum':
      return [{
        target: DAO_PROXY_ADDRESS,
        value: '0',
        signature: '_setMinQuorumVotesBPS(uint16)',
        calldata: encodeAdminUint16('_setMinQuorumVotesBPS(uint16)', Number(fieldValues.bps || '0'))
      }];

    case 'admin-max-quorum':
      return [{
        target: DAO_PROXY_ADDRESS,
        value: '0',
        signature: '_setMaxQuorumVotesBPS(uint16)',
        calldata: encodeAdminUint16('_setMaxQuorumVotesBPS(uint16)', Number(fieldValues.bps || '0'))
      }];

    case 'admin-quorum-coefficient':
      return [{
        target: DAO_PROXY_ADDRESS,
        value: '0',
        signature: '_setQuorumCoefficient(uint32)',
        calldata: encodeAdminUint32('_setQuorumCoefficient(uint32)', Number(fieldValues.coefficient || '0'))
      }];

    case 'admin-dynamic-quorum':
      return [{
        target: DAO_PROXY_ADDRESS,
        value: '0',
        signature: '_setDynamicQuorumParams(uint16,uint16,uint32)',
        calldata: encodeDynamicQuorumParams(
          Number(fieldValues.minBps || '0'),
          Number(fieldValues.maxBps || '0'),
          Number(fieldValues.coefficient || '0')
        )
      }];

    // Admin Functions - Fork
    case 'admin-fork-period':
      return [{
        target: DAO_PROXY_ADDRESS,
        value: '0',
        signature: '_setForkPeriod(uint256)',
        calldata: encodeAdminUint256('_setForkPeriod(uint256)', BigInt(fieldValues.seconds || '0'))
      }];

    case 'admin-fork-threshold':
      return [{
        target: DAO_PROXY_ADDRESS,
        value: '0',
        signature: '_setForkThresholdBPS(uint256)',
        calldata: encodeAdminUint256('_setForkThresholdBPS(uint256)', BigInt(fieldValues.bps || '0'))
      }];

    case 'admin-fork-deployer':
      return [{
        target: DAO_PROXY_ADDRESS,
        value: '0',
        signature: '_setForkDAODeployer(address)',
        calldata: encodeAdminAddress('_setForkDAODeployer(address)', fieldValues.address as Address)
      }];

    case 'admin-fork-escrow':
      return [{
        target: DAO_PROXY_ADDRESS,
        value: '0',
        signature: '_setForkEscrow(address)',
        calldata: encodeAdminAddress('_setForkEscrow(address)', fieldValues.address as Address)
      }];

    // Admin Functions - Admin
    case 'admin-pending-admin':
      return [{
        target: DAO_PROXY_ADDRESS,
        value: '0',
        signature: '_setPendingAdmin(address)',
        calldata: encodeAdminAddress('_setPendingAdmin(address)', fieldValues.address as Address)
      }];

    case 'admin-vetoer':
      return [{
        target: DAO_PROXY_ADDRESS,
        value: '0',
        signature: '_setVetoer(address)',
        calldata: encodeAdminAddress('_setVetoer(address)', fieldValues.address as Address)
      }];

    case 'admin-pending-vetoer':
      return [{
        target: DAO_PROXY_ADDRESS,
        value: '0',
        signature: '_setPendingVetoer(address)',
        calldata: encodeAdminAddress('_setPendingVetoer(address)', fieldValues.address as Address)
      }];

    case 'admin-burn-vetoer':
      return [{
        target: DAO_PROXY_ADDRESS,
        value: '0',
        signature: '_burnVetoPower()',
        calldata: encodeBurnVetoPower()
      }];

    case 'admin-timelock-delay':
      return [{
        target: TREASURY_ADDRESS,
        value: '0',
        signature: '_setDelay(uint256)',
        calldata: encodeAdminUint256('_setDelay(uint256)', BigInt(fieldValues.seconds || '0'))
      }];

    case 'admin-timelock-admin':
      return [{
        target: TREASURY_ADDRESS,
        value: '0',
        signature: '_setPendingAdmin(address)',
        calldata: encodeAdminAddress('_setPendingAdmin(address)', fieldValues.address as Address)
      }];

    default:
      throw new Error(`Template not implemented: ${templateId}`);
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Parse ETH amount string to wei (18 decimals)
 */
export function parseEther(amount: string): bigint {
  const trimmed = amount.trim();
  if (!trimmed || trimmed === '0') return BigInt(0);
  
  const [whole, decimal = ''] = trimmed.split('.');
  const paddedDecimal = decimal.padEnd(18, '0').slice(0, 18);
  
  return BigInt(whole + paddedDecimal);
}

/**
 * Parse token amount string to smallest unit
 */
export function parseUnits(amount: string, decimals: number): bigint {
  const trimmed = amount.trim();
  if (!trimmed || trimmed === '0') return BigInt(0);
  
  const [whole, decimal = ''] = trimmed.split('.');
  const paddedDecimal = decimal.padEnd(decimals, '0').slice(0, decimals);
  
  return BigInt(whole + paddedDecimal);
}

/**
 * Format bigint to readable string with decimals
 */
export function formatUnits(value: bigint, decimals: number): string {
  const str = value.toString().padStart(decimals + 1, '0');
  const whole = str.slice(0, -decimals) || '0';
  const decimal = str.slice(-decimals).replace(/0+$/, '');
  
  return decimal ? `${whole}.${decimal}` : whole;
}

