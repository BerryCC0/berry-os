/**
 * Nouns DAO Smart Contract Addresses
 * 
 * All contract addresses for the Nouns DAO ecosystem on Ethereum Mainnet
 * Chain ID: 1
 * 
 * Source: https://nouns.wtf
 */

export const NOUNS_CONTRACTS = {
  // Core Protocol
  NounsToken: {
    address: '0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03',
    description: 'ERC-721 token contract for Nouns NFTs with delegation',
    etherscan: 'https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03',
  },
  
  NounsAuctionHouse: {
    proxy: '0x830BD73E4184ceF73443C15111a1DF14e495C706',
    implementation: '0x1D835808ddCa38fbE14e560D8e25b3D256810aF0',
    description: 'Daily auction house for Nouns',
    etherscan: 'https://etherscan.io/address/0x830BD73E4184ceF73443C15111a1DF14e495C706',
  },
  
  // Governance (Priority 1-3)
  NounsTreasury: {
    proxy: '0xb1a32FC9F9D8b2cf86C068Cae13108809547ef71',
    implementation: '0x0FB7CF84F171154cBC3F553aA9Df9b0e9076649D',
    description: 'Main treasury (Executor/Timelock)',
    etherscan: 'https://etherscan.io/address/0xb1a32FC9F9D8b2cf86C068Cae13108809547ef71',
  },
  
  NounsDAOProxy: {
    proxy: '0x6f3E6272A167e8AcCb32072d08E0957F9c79223d',
    implementation: '0xA23e8A919D29d74Ee24d909D80f4bC8778d656d1',
    description: 'DAO Governor for proposing and voting',
    etherscan: 'https://etherscan.io/address/0x6f3E6272A167e8AcCb32072d08E0957F9c79223d',
  },
  
  NounsDAODataProxy: {
    proxy: '0xf790A5f59678dd733fb3De93493A91f472ca1365',
    implementation: '0x513e9277192767eb4dc044A08da8228862828150',
    description: 'Data proxy for candidates and feedback',
    etherscan: 'https://etherscan.io/address/0xf790A5f59678dd733fb3De93493A91f472ca1365',
  },
  
  // Art & Descriptor
  NounsDescriptorV3: {
    address: '0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac',
    description: 'Descriptor V3 for traits and artwork generation',
    etherscan: 'https://etherscan.io/address/0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac',
  },
  
  NounsSeeder: {
    address: '0xCC8a0FB5ab3C7132c1b2A0109142Fb112c4Ce515',
    description: 'Generates pseudorandom trait seeds for Nouns',
    etherscan: 'https://etherscan.io/address/0xCC8a0FB5ab3C7132c1b2A0109142Fb112c4Ce515',
  },
  
  // Client Rewards
  ClientRewardsProxy: {
    proxy: '0x883860178F95d0C82413eDc1D6De530cB4771d55',
    implementation: '0xaaF173E6b65aa4473C830EDB402D26B7A33c5E94',
    description: 'Client rewards for proposal creation and voting',
    etherscan: 'https://etherscan.io/address/0x883860178F95d0C82413eDc1D6De530cB4771d55',
  },
  
  // Treasury & Financial
  TokenBuyer: {
    address: '0x4f2acdc74f6941390d9b1804fabc3e780388cfe5',
    description: 'Converts ETH to USDC for payments',
    etherscan: 'https://etherscan.io/address/0x4f2acdc74f6941390d9b1804fabc3e780388cfe5',
  },
  
  Payer: {
    address: '0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D',
    description: 'Handles USDC payments from treasury',
    etherscan: 'https://etherscan.io/address/0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D',
  },
  
  StreamFactory: {
    address: '0x0fd206FC7A7dBcD5661157eDCb1FFDD0D02A61ff',
    description: 'Factory for creating payment streams',
    etherscan: 'https://etherscan.io/address/0x0fd206FC7A7dBcD5661157eDCb1FFDD0D02A61ff',
  },
  
  NounsTreasuryV1: {
    address: '0x0BC3807Ec262cB779b38D65b38158acC3bfedE10',
    description: 'Legacy treasury V1',
    etherscan: 'https://etherscan.io/address/0x0BC3807Ec262cB779b38D65b38158acC3bfedE10',
  },
  
  // Fork Mechanism
  ForkEscrow: {
    address: '0x44d97D22B3d37d837cE4b22773aAd9d1566055D9',
    description: 'Escrow for DAO fork mechanism',
    etherscan: 'https://etherscan.io/address/0x44d97D22B3d37d837cE4b22773aAd9d1566055D9',
  },
  
  ForkDAODeployer: {
    address: '0xcD65e61f70e0b1Aa433ca1d9A6FC2332e9e73cE3',
    description: 'Deploys new DAO instances for forks',
    etherscan: 'https://etherscan.io/address/0xcD65e61f70e0b1Aa433ca1d9A6FC2332e9e73cE3',
  },
} as const;

/**
 * Contract addresses by category
 */
export const CONTRACTS_BY_CATEGORY = {
  core: [
    NOUNS_CONTRACTS.NounsToken,
    NOUNS_CONTRACTS.NounsAuctionHouse,
  ],
  governance: [
    NOUNS_CONTRACTS.NounsDAOProxy,
    NOUNS_CONTRACTS.NounsDAODataProxy,
    NOUNS_CONTRACTS.ClientRewardsProxy,
  ],
  treasury: [
    NOUNS_CONTRACTS.NounsTreasury,
    NOUNS_CONTRACTS.NounsTreasuryV1,
    NOUNS_CONTRACTS.TokenBuyer,
    NOUNS_CONTRACTS.Payer,
    NOUNS_CONTRACTS.StreamFactory,
  ],
  art: [
    NOUNS_CONTRACTS.NounsDescriptorV3,
  ],
  fork: [
    NOUNS_CONTRACTS.ForkEscrow,
    NOUNS_CONTRACTS.ForkDAODeployer,
  ],
} as const;

/**
 * Get contract address by name
 * Returns proxy address if available, otherwise returns main address
 */
export function getContractAddress(contractName: keyof typeof NOUNS_CONTRACTS): string {
  const contract = NOUNS_CONTRACTS[contractName];
  return 'proxy' in contract ? contract.proxy : contract.address;
}

/**
 * Get implementation address for proxy contracts
 */
export function getImplementationAddress(contractName: keyof typeof NOUNS_CONTRACTS): string | null {
  const contract = NOUNS_CONTRACTS[contractName];
  return 'implementation' in contract ? contract.implementation : null;
}

/**
 * Get all contract addresses as a flat object
 */
export function getAllAddresses(): Record<string, string> {
  const addresses: Record<string, string> = {};
  
  Object.entries(NOUNS_CONTRACTS).forEach(([name, config]) => {
    addresses[name] = getContractAddress(name as keyof typeof NOUNS_CONTRACTS);
  });
  
  return addresses;
}

/**
 * Check if address is a known Nouns contract
 */
export function isNounsContract(address: string): boolean {
  const lowerAddress = address.toLowerCase();
  return Object.values(NOUNS_CONTRACTS).some(contract => {
    const contractAddress = ('proxy' in contract ? contract.proxy : contract.address).toLowerCase();
    return contractAddress === lowerAddress;
  });
}

/**
 * Get contract name from address
 */
export function getContractName(address: string): string | null {
  const lowerAddress = address.toLowerCase();
  
  for (const [name, contract] of Object.entries(NOUNS_CONTRACTS)) {
    const contractAddress = ('proxy' in contract ? contract.proxy : contract.address).toLowerCase();
    if (contractAddress === lowerAddress) {
      return name;
    }
  }
  
  return null;
}

/**
 * Chain ID for Nouns contracts
 */
export const NOUNS_CHAIN_ID = 1; // Ethereum Mainnet

/**
 * Block when Nouns DAO was deployed
 */
export const NOUNS_DEPLOY_BLOCK = 12985438;

/**
 * Useful external contracts
 */
export const EXTERNAL_CONTRACTS = {
  WETH: {
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    description: 'Wrapped Ether (used in auctions)',
    etherscan: 'https://etherscan.io/address/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  },
  USDC: {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    description: 'USD Coin (used for payments)',
    etherscan: 'https://etherscan.io/address/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  },
  ENS: {
    address: '0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85',
    description: 'Ethereum Name Service',
    etherscan: 'https://etherscan.io/address/0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85',
  },
} as const;
