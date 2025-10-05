/**
 * Nouns Token Function Configurations
 */

import { FunctionConfig } from '../BaseExecutor';

export function getTokenConfig(functionName: string): FunctionConfig {
  switch (functionName) {
    // READ FUNCTIONS
    case 'Get balance':
      return {
        description: 'Get Noun balance of an address',
        params: [
          { name: 'owner', type: 'address', required: true, placeholder: '0x...' }
        ]
      };

    case 'Get owner of Noun':
      return {
        description: 'Get the owner address of a specific Noun token',
        params: [
          { name: 'tokenId', type: 'uint256', required: true, placeholder: '123' }
        ]
      };

    case 'Get voting power':
      return {
        description: 'Get current voting power (number of votes) for an address',
        params: [
          { name: 'account', type: 'address', required: true, placeholder: '0x...' }
        ]
      };

    case 'Get delegate':
      return {
        description: 'Get the address that this account has delegated votes to',
        params: [
          { name: 'account', type: 'address', required: true, placeholder: '0x...' }
        ]
      };

    case 'Get prior votes':
      return {
        description: 'Get voting power at a specific block number (for proposals)',
        params: [
          { name: 'account', type: 'address', required: true, placeholder: '0x...' },
          { name: 'blockNumber', type: 'uint256', required: true, hint: 'Historical block number', placeholder: '18000000' }
        ]
      };

    case 'Get total supply':
      return {
        description: 'Get total number of Nouns minted',
        params: []
      };

    case 'Get seed':
      return {
        description: 'Get the seed (trait data) for a specific Noun',
        params: [
          { name: 'tokenId', type: 'uint256', required: true, placeholder: '123' }
        ]
      };

    case 'Get data URI':
      return {
        description: 'Get the on-chain data URI for a Noun (includes SVG)',
        params: [
          { name: 'tokenId', type: 'uint256', required: true, placeholder: '123' }
        ]
      };

    case 'Token URI':
      return {
        description: 'Get the metadata URI for a Noun token',
        params: [
          { name: 'tokenId', type: 'uint256', required: true, placeholder: '123' }
        ]
      };

    case 'Has Nouns':
      return {
        description: 'Check if an address owns any Nouns',
        params: [
          { name: 'owner', type: 'address', required: true, placeholder: '0x...' }
        ]
      };

    case 'Has voting power':
      return {
        description: 'Check if an address has voting power (either owned or delegated)',
        params: [
          { name: 'account', type: 'address', required: true, placeholder: '0x...' }
        ]
      };

    // WRITE FUNCTIONS
    case 'Delegate votes':
      return {
        description: 'Delegate your voting power to another address (or yourself)',
        params: [
          { name: 'delegatee', type: 'address', required: true, hint: 'Address to delegate to', placeholder: '0x...' }
        ]
      };

    case 'Delegate by signature':
      return {
        description: 'Delegate votes using an EIP-712 signature (gasless)',
        params: [
          { name: 'delegatee', type: 'address', required: true, placeholder: '0x...' },
          { name: 'nonce', type: 'uint256', required: true, placeholder: '0' },
          { name: 'expiry', type: 'uint256', required: true, hint: 'Unix timestamp', placeholder: '1700000000' },
          { name: 'v', type: 'uint8', required: true, hint: 'Signature v', placeholder: '27' },
          { name: 'r', type: 'bytes32', required: true, hint: 'Signature r', placeholder: '0x...' },
          { name: 's', type: 'bytes32', required: true, hint: 'Signature s', placeholder: '0x...' }
        ]
      };

    case 'Delegate to self':
      return {
        description: 'Delegate voting power to yourself (enables voting)',
        params: []
      };

    case 'Transfer token':
      return {
        description: 'Transfer a Noun to another address',
        params: [
          { name: 'to', type: 'address', required: true, placeholder: '0x...' },
          { name: 'tokenId', type: 'uint256', required: true, placeholder: '123' }
        ]
      };

    case 'Safe transfer':
      return {
        description: 'Safely transfer a Noun (checks if recipient can receive NFTs)',
        params: [
          { name: 'from', type: 'address', required: true, placeholder: '0x...' },
          { name: 'to', type: 'address', required: true, placeholder: '0x...' },
          { name: 'tokenId', type: 'uint256', required: true, placeholder: '123' }
        ]
      };

    case 'Approve':
      return {
        description: 'Approve an address to transfer a specific Noun on your behalf',
        params: [
          { name: 'to', type: 'address', required: true, placeholder: '0x...' },
          { name: 'tokenId', type: 'uint256', required: true, placeholder: '123' }
        ]
      };

    case 'Set approval for all':
      return {
        description: 'Approve/revoke an operator to manage all your Nouns',
        params: [
          { name: 'operator', type: 'address', required: true, placeholder: '0x...' },
          { name: 'approved', type: 'bool', required: true, hint: 'true to approve, false to revoke', placeholder: 'true' }
        ]
      };

    default:
      return {
        description: `Execute ${functionName}`,
        params: []
      };
  }
}
