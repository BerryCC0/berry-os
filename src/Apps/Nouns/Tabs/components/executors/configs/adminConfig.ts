/**
 * DAO Admin Function Configurations
 */

import { FunctionConfig } from '../BaseExecutor';

export function getAdminConfig(functionName: string): FunctionConfig {
  switch (functionName) {
    // READ FUNCTIONS
    case 'Get max fork period':
    case 'Get min fork period':
      return {
        description: 'Get fork period configuration limits',
        params: []
      };

    case 'Get max objection period':
      return {
        description: 'Get maximum allowed objection period',
        params: []
      };

    case 'Get max updatable period':
      return {
        description: 'Get maximum period during which proposals can be updated',
        params: []
      };

    case 'Get max voting delay':
    case 'Get min voting delay':
      return {
        description: 'Get voting delay limits (blocks between proposal and voting start)',
        params: []
      };

    case 'Get max voting period':
    case 'Get min voting period':
      return {
        description: 'Get voting period limits (how long voting lasts)',
        params: []
      };

    case 'Get max proposal threshold BPS':
    case 'Get min proposal threshold BPS':
      return {
        description: 'Get proposal threshold limits in basis points',
        params: []
      };

    case 'Get max quorum votes BPS':
    case 'Get min quorum votes BPS bounds':
      return {
        description: 'Get quorum configuration limits',
        params: []
      };

    case 'Validate fork period':
      return {
        description: 'Check if a fork period value is valid',
        params: [
          { name: 'forkPeriod', type: 'uint256', required: true, hint: 'Fork period in seconds', placeholder: '604800' }
        ]
      };

    case 'Validate voting config':
      return {
        description: 'Validate proposed voting configuration changes',
        params: [
          { name: 'votingDelay', type: 'uint256', required: true, placeholder: '7200' },
          { name: 'votingPeriod', type: 'uint256', required: true, placeholder: '50400' },
          { name: 'proposalThresholdBPS', type: 'uint256', required: true, placeholder: '25' }
        ]
      };

    case 'Format BPS as percentage':
      return {
        description: 'Convert basis points to percentage',
        params: [
          { name: 'bps', type: 'uint256', required: true, hint: 'Basis points (100 = 1%)', placeholder: '100' }
        ]
      };

    case 'Format blocks as time':
      return {
        description: 'Estimate time duration from block count',
        params: [
          { name: 'blocks', type: 'uint256', required: true, placeholder: '7200' }
        ]
      };

    // WRITE FUNCTIONS  
    case 'Set admin':
    case 'Set pending admin':
    case 'Accept admin':
      return {
        description: 'Admin transfer functions (DAO governance only)',
        params: functionName === 'Accept admin' ? [] : [
          { name: 'newAdmin', type: 'address', required: true, placeholder: '0x...' }
        ],
        requiresProposal: true
      };

    case 'Set vetoer':
    case 'Set pending vetoer':
    case 'Accept vetoer':
      return {
        description: 'Vetoer role management',
        params: functionName === 'Accept vetoer' ? [] : [
          { name: 'newVetoer', type: 'address', required: true, placeholder: '0x...' }
        ],
        requiresProposal: true
      };

    case 'Set voting delay':
      return {
        description: 'Set blocks between proposal creation and voting start',
        params: [
          { name: 'newVotingDelay', type: 'uint256', required: true, hint: 'Blocks (~12s each)', placeholder: '7200' }
        ],
        requiresProposal: true
      };

    case 'Set voting period':
      return {
        description: 'Set how long voting lasts',
        params: [
          { name: 'newVotingPeriod', type: 'uint256', required: true, hint: 'Blocks (~12s each)', placeholder: '50400' }
        ],
        requiresProposal: true
      };

    case 'Set proposal threshold BPS':
      return {
        description: 'Set minimum Nouns required to propose (in basis points of supply)',
        params: [
          { name: 'newProposalThresholdBPS', type: 'uint256', required: true, hint: 'Basis points (100 = 1%)', placeholder: '25' }
        ],
        requiresProposal: true
      };

    case 'Set objection period':
      return {
        description: 'Set last-minute objection period duration',
        params: [
          { name: 'newObjectionPeriodDurationInBlocks', type: 'uint256', required: true, placeholder: '7200' }
        ],
        requiresProposal: true
      };

    case 'Set updatable period':
      return {
        description: 'Set period during which proposals can be updated',
        params: [
          { name: 'newUpdatablePeriodInBlocks', type: 'uint256', required: true, placeholder: '7200' }
        ],
        requiresProposal: true
      };

    case 'Set last minute window':
      return {
        description: 'Set the window for last-minute votes that trigger objection period',
        params: [
          { name: 'newLastMinuteWindowInBlocks', type: 'uint256', required: true, placeholder: '7200' }
        ],
        requiresProposal: true
      };

    case 'Set min quorum BPS':
    case 'Set max quorum BPS':
      return {
        description: 'Set dynamic quorum bounds',
        params: [
          { name: 'newQuorumBPS', type: 'uint256', required: true, hint: 'Basis points', placeholder: '1000' }
        ],
        requiresProposal: true
      };

    case 'Set quorum coefficient':
      return {
        description: 'Set the coefficient for dynamic quorum calculation',
        params: [
          { name: 'newQuorumCoefficient', type: 'uint256', required: true, placeholder: '1000000' }
        ],
        requiresProposal: true
      };

    case 'Set fork period':
      return {
        description: 'Set the duration of the fork escrow period',
        params: [
          { name: 'newForkPeriod', type: 'uint256', required: true, hint: 'Seconds', placeholder: '604800' }
        ],
        requiresProposal: true
      };

    case 'Set fork threshold':
      return {
        description: 'Set minimum Nouns required to execute a fork',
        params: [
          { name: 'newForkThresholdBPS', type: 'uint256', required: true, hint: 'Basis points of supply', placeholder: '2000' }
        ],
        requiresProposal: true
      };

    case 'Set fork escrow':
      return {
        description: 'Set the fork escrow contract address',
        params: [
          { name: 'newForkEscrow', type: 'address', required: true, placeholder: '0x...' }
        ],
        requiresProposal: true
      };

    case 'Set fork DAO deployer':
      return {
        description: 'Set the fork DAO deployer contract',
        params: [
          { name: 'newForkDAODeployer', type: 'address', required: true, placeholder: '0x...' }
        ],
        requiresProposal: true
      };

    case 'Set ERC20 tokens in fork':
      return {
        description: 'Set which ERC20 tokens to include in forks',
        params: [
          { name: 'erc20tokens', type: 'address[]', required: true, hint: 'JSON array of token addresses', placeholder: '["0x..."]' }
        ],
        requiresProposal: true
      };

    case 'Set timelocks and admin':
      return {
        description: 'Update timelock and admin addresses',
        params: [
          { name: 'newTimelock', type: 'address', required: true, placeholder: '0x...' },
          { name: 'newTimelockV1', type: 'address', required: true, placeholder: '0x...' },
          { name: 'newAdmin', type: 'address', required: true, placeholder: '0x...' }
        ],
        requiresProposal: true
      };

    case 'Withdraw ETH':
      return {
        description: 'Withdraw ETH from DAO admin contract',
        params: [
          { name: 'recipient', type: 'address', required: true, placeholder: '0x...' },
          { name: 'amount', type: 'uint256', required: true, hint: 'ETH in wei', placeholder: '1000000000000000000' }
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
