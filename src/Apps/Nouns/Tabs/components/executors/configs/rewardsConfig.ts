/**
 * Client Rewards Function Configurations
 */

import { FunctionConfig } from '../BaseExecutor';

export function getRewardsConfig(functionName: string): FunctionConfig {
  switch (functionName) {
    // READ FUNCTIONS
    case 'Get client balance':
      return {
        description: 'Get ETH reward balance for a client',
        params: [
          { name: 'clientId', type: 'uint256', required: true, placeholder: '1' }
        ]
      };

    case 'Calculate total claimable':
      return {
        description: 'Calculate total claimable rewards',
        params: [
          { name: 'proposalRewards', type: 'uint256', required: true, hint: 'ETH from proposals (wei)', placeholder: '0' },
          { name: 'auctionRewards', type: 'uint256', required: true, hint: 'ETH from auctions (wei)', placeholder: '0' }
        ]
      };

    case 'Is client registered':
      return {
        description: 'Check if a client ID is registered',
        params: [
          { name: 'clientId', type: 'uint256', required: true, placeholder: '1' }
        ]
      };

    case 'Calculate reward percentage':
      return {
        description: 'Calculate reward percentage earned',
        params: [
          { name: 'rewardAmount', type: 'uint256', required: true, hint: 'ETH rewards (wei)', placeholder: '10000000000000000' },
          { name: 'totalAmount', type: 'uint256', required: true, hint: 'Total value (wei)', placeholder: '1000000000000000000' }
        ]
      };

    case 'Get reward stats':
      return {
        description: 'Get detailed reward statistics for a client',
        params: [
          { name: 'clientId', type: 'uint256', required: true, placeholder: '1' }
        ]
      };

    case 'Parse reward stats':
      return {
        description: 'Parse raw reward stats into readable format',
        params: [
          { name: 'rawStats', type: 'bytes', required: true, placeholder: '0x...' }
        ]
      };

    // WRITE FUNCTIONS
    case 'Register client':
      return {
        description: 'Register a new client to earn rewards',
        params: [
          { name: 'name', type: 'string', required: true, placeholder: 'My Client Name' },
          { name: 'description', type: 'string', required: true, placeholder: 'Description of my client application...' }
        ]
      };

    case 'Update client description':
      return {
        description: 'Update your client description',
        params: [
          { name: 'clientId', type: 'uint256', required: true, placeholder: '1' },
          { name: 'description', type: 'string', required: true, placeholder: 'Updated description...' }
        ]
      };

    case 'Update client metadata':
      return {
        description: 'Update client name and description',
        params: [
          { name: 'clientId', type: 'uint256', required: true, placeholder: '1' },
          { name: 'name', type: 'string', required: true, placeholder: 'New Name' },
          { name: 'description', type: 'string', required: true, placeholder: 'New description...' }
        ]
      };

    case 'Claim rewards':
      return {
        description: 'Claim accumulated ETH rewards for your client',
        params: [
          { name: 'clientId', type: 'uint256', required: true, placeholder: '1' }
        ]
      };

    case 'Update rewards for proposal':
      return {
        description: 'Update reward allocation for a proposal',
        params: [
          { name: 'proposalId', type: 'uint256', required: true, placeholder: '123' }
        ]
      };

    case 'Update rewards for auction':
      return {
        description: 'Update reward allocation for an auction',
        params: [
          { name: 'auctionId', type: 'uint256', required: true, placeholder: '123' }
        ]
      };

    default:
      return {
        description: `Execute ${functionName}`,
        params: []
      };
  }
}
