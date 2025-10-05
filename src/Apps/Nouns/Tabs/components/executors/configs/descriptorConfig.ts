/**
 * Descriptor Function Configurations
 */

import { FunctionConfig } from '../BaseExecutor';

export function getDescriptorConfig(functionName: string): FunctionConfig {
  switch (functionName) {
    // READ FUNCTIONS
    case 'Get background count':
      return {
        description: 'Get total number of background traits',
        params: []
      };

    case 'Get body count':
      return {
        description: 'Get total number of body traits',
        params: []
      };

    case 'Get accessory count':
      return {
        description: 'Get total number of accessory traits',
        params: []
      };

    case 'Get head count':
      return {
        description: 'Get total number of head traits',
        params: []
      };

    case 'Get glasses count':
      return {
        description: 'Get total number of glasses traits',
        params: []
      };

    case 'Get backgrounds':
    case 'Get bodies':
    case 'Get accessories':
    case 'Get heads':
    case 'Get glasses':
      return {
        description: 'Get trait data',
        params: [
          { name: 'index', type: 'uint256', required: true, placeholder: '0' }
        ]
      };

    case 'Generate SVG':
      return {
        description: 'Generate SVG for a Noun seed',
        params: [
          { name: 'seed', type: 'tuple', required: true, hint: 'Noun seed (background, body, accessory, head, glasses)', placeholder: '{background:0,body:0,accessory:0,head:0,glasses:0}' }
        ]
      };

    case 'Get palette':
      return {
        description: 'Get color palette',
        params: [
          { name: 'index', type: 'uint8', required: true, placeholder: '0' }
        ]
      };

    case 'Is data URI enabled':
      return {
        description: 'Check if data URI mode is enabled',
        params: []
      };

    case 'Token URI':
      return {
        description: 'Get token URI for a Noun',
        params: [
          { name: 'tokenId', type: 'uint256', required: true, placeholder: '123' }
        ]
      };

    case 'Parse trait data':
      return {
        description: 'Parse compressed trait data',
        params: [
          { name: 'traitData', type: 'bytes', required: true, placeholder: '0x...' }
        ]
      };

    case 'Calculate total traits':
      return {
        description: 'Calculate total number of traits across all types',
        params: []
      };

    // WRITE FUNCTIONS
    case 'Add backgrounds':
      return {
        description: 'Add background traits',
        params: [
          { name: 'backgrounds', type: 'bytes[]', required: true, hint: 'Array of compressed trait data', placeholder: '["0x..."]' }
        ],
        requiresProposal: true
      };

    case 'Add bodies':
      return {
        description: 'Add body traits',
        params: [
          { name: 'bodies', type: 'bytes[]', required: true, placeholder: '["0x..."]' }
        ],
        requiresProposal: true
      };

    case 'Add accessories':
      return {
        description: 'Add accessory traits',
        params: [
          { name: 'accessories', type: 'bytes[]', required: true, placeholder: '["0x..."]' }
        ],
        requiresProposal: true
      };

    case 'Add heads':
      return {
        description: 'Add head traits',
        params: [
          { name: 'heads', type: 'bytes[]', required: true, placeholder: '["0x..."]' }
        ],
        requiresProposal: true
      };

    case 'Add glasses':
      return {
        description: 'Add glasses traits',
        params: [
          { name: 'glasses', type: 'bytes[]', required: true, placeholder: '["0x..."]' }
        ],
        requiresProposal: true
      };

    case 'Set palette':
      return {
        description: 'Update color palette',
        params: [
          { name: 'paletteIndex', type: 'uint8', required: true, placeholder: '0' },
          { name: 'colors', type: 'string[]', required: true, hint: 'Array of hex colors', placeholder: '["#FFFFFF", "#000000"]' }
        ],
        requiresProposal: true
      };

    case 'Add color to palette':
      return {
        description: 'Add a color to a palette',
        params: [
          { name: 'paletteIndex', type: 'uint8', required: true, placeholder: '0' },
          { name: 'color', type: 'string', required: true, placeholder: '#FFFFFF' }
        ],
        requiresProposal: true
      };

    case 'Set base URI':
      return {
        description: 'Set base URI for token metadata',
        params: [
          { name: 'baseURI', type: 'string', required: true, placeholder: 'ipfs://...' }
        ],
        requiresProposal: true
      };

    case 'Toggle data URI':
      return {
        description: 'Toggle data URI mode on/off',
        params: [],
        requiresProposal: true
      };

    case 'Set art descriptor':
      return {
        description: 'Update art descriptor contract',
        params: [
          { name: 'descriptor', type: 'address', required: true, placeholder: '0x...' }
        ],
        requiresProposal: true
      };

    case 'Set art inflator':
      return {
        description: 'Update art inflator contract',
        params: [
          { name: 'inflator', type: 'address', required: true, placeholder: '0x...' }
        ],
        requiresProposal: true
      };

    case 'Set renderer':
      return {
        description: 'Update renderer contract',
        params: [
          { name: 'renderer', type: 'address', required: true, placeholder: '0x...' }
        ],
        requiresProposal: true
      };

    case 'Lock parts':
      return {
        description: 'Lock parts to prevent further changes',
        params: [],
        requiresProposal: true
      };

    default:
      return {
        description: `Execute ${functionName}`,
        params: []
      };
  }
}
