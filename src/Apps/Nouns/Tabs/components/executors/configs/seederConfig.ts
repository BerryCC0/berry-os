/**
 * Seeder Function Configurations
 */

import { FunctionConfig } from '../BaseExecutor';

export function getSeederConfig(functionName: string): FunctionConfig {
  switch (functionName) {
    case 'Generate seed (view function)':
      return {
        description: 'Generate a pseudorandom seed for a Noun (determines traits)',
        params: [
          { name: 'nounId', type: 'uint256', required: true, hint: 'Noun token ID', placeholder: '123' }
        ]
      };

    default:
      return {
        description: `Execute ${functionName}`,
        params: []
      };
  }
}
