/**
 * All Contract Function Configurations
 * Centralized config for all contracts
 */

import { FunctionConfig } from '../BaseExecutor';

// Export individual config functions
export * from './tokenConfig';
export * from './auctionConfig';
export * from './adminConfig';
export * from './dataProxyConfig';
export * from './tokenBuyerConfig';
export * from './payerConfig';
export * from './descriptorConfig';
export * from './seederConfig';
export * from './streamingConfig';
export * from './rewardsConfig';
export * from './forkConfig';

/**
 * Fallback for any unmatched function
 */
export function getDefaultConfig(functionName: string): FunctionConfig {
  return {
    description: `Execute ${functionName}`,
    params: []
  };
}

