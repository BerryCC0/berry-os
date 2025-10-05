/**
 * Auction House Function Configurations
 */

import { FunctionConfig } from '../BaseExecutor';

export function getAuctionConfig(functionName: string): FunctionConfig {
  switch (functionName) {
    // READ FUNCTIONS
    case 'Get current auction':
      return {
        description: 'Get details of the current live auction',
        params: []
      };

    case 'Get auction storage':
      return {
        description: 'Get complete auction configuration and state',
        params: []
      };

    case 'Get bidding client':
      return {
        description: 'Get the client ID associated with a bid',
        params: [
          { name: 'nounId', type: 'uint256', required: true, placeholder: '123' },
          { name: 'bidder', type: 'address', required: true, placeholder: '0x...' }
        ]
      };

    case 'Get settlements':
      return {
        description: 'Get historical auction settlement data',
        params: [
          { name: 'startId', type: 'uint256', required: true, placeholder: '100' },
          { name: 'count', type: 'uint256', required: true, hint: 'Number of auctions', placeholder: '10' }
        ]
      };

    case 'Get prices':
      return {
        description: 'Get winning prices for specific Noun IDs',
        params: [
          { name: 'nounIds', type: 'uint256[]', required: true, hint: 'JSON array', placeholder: '[100, 101, 102]' }
        ]
      };

    case 'Get reserve price':
      return {
        description: 'Get the minimum starting bid amount',
        params: []
      };

    case 'Get time buffer':
      return {
        description: 'Get the time extension when late bids occur (in seconds)',
        params: []
      };

    case 'Get min bid increment':
      return {
        description: 'Get the minimum bid increment percentage',
        params: []
      };

    case 'Get duration':
      return {
        description: 'Get the standard auction duration in seconds',
        params: []
      };

    case 'Is paused':
      return {
        description: 'Check if auctions are currently paused',
        params: []
      };

    case 'Check if auction active':
      return {
        description: 'Check if there is currently an active auction',
        params: []
      };

    case 'Calculate min bid':
      return {
        description: 'Calculate the minimum valid bid for current auction',
        params: []
      };

    // WRITE FUNCTIONS
    case 'Create bid with Berry OS':
      return {
        description: 'Place a bid using Berry OS for client rewards (Client ID 11)',
        params: [
          { name: 'nounId', type: 'uint256', required: true, hint: 'ID of Noun being auctioned', placeholder: '123' }
        ]
      };

    case 'Settle auction':
      return {
        description: 'Settle the current auction (anyone can call after time ends)',
        params: []
      };

    case 'Settle current & create new':
      return {
        description: 'Settle current auction and immediately start next one',
        params: []
      };

    case 'Pause':
      return {
        description: 'Pause auction creation (owner only)',
        params: [],
        requiresProposal: true
      };

    case 'Unpause':
      return {
        description: 'Resume auction creation (owner only)',
        params: [],
        requiresProposal: true
      };

    case 'Set reserve price':
      return {
        description: 'Update the minimum starting bid',
        params: [
          { name: 'newReservePrice', type: 'uint256', required: true, hint: 'ETH in wei', placeholder: '100000000000000000' }
        ],
        requiresProposal: true
      };

    case 'Set time buffer':
      return {
        description: 'Update the auction extension time for late bids',
        params: [
          { name: 'newTimeBuffer', type: 'uint256', required: true, hint: 'Seconds', placeholder: '300' }
        ],
        requiresProposal: true
      };

    case 'Set min bid increment':
      return {
        description: 'Update the minimum bid increment percentage',
        params: [
          { name: 'newMinBidIncrementPercentage', type: 'uint8', required: true, hint: 'Percentage (e.g., 5 for 5%)', placeholder: '5' }
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
