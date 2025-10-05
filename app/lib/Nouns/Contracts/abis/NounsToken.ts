/**
 * Nouns Token ABI
 * 
 * Contract: NounsToken
 * Address: 0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03
 * 
 * The Nouns Token contract is the core ERC-721 NFT contract for Nouns DAO.
 * Each Noun is a unique, on-chain generated artwork with voting power in the DAO.
 * Nouns are auctioned daily, with all proceeds going to the treasury.
 * 
 * Key features:
 * - ERC-721 compliant with delegation functionality
 * - On-chain artwork generation from trait seeds
 * - Built-in vote delegation for governance
 * - No minting by users - only auction house can mint
 * 
 * Key functions:
 * - balanceOf/ownerOf: Standard ERC-721 ownership queries
 * - seeds: Get the trait seed for generating Noun artwork
 * - delegate: Delegate voting power to another address
 * - getCurrentVotes/getPriorVotes: Check voting power
 * - dataURI: Get complete on-chain metadata and SVG
 */

export const NounsTokenABI = [
  // ERC-721 Standard
  {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "ownerOf",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  
  // Nouns Specific
  {
    "inputs": [{"internalType": "uint256", "name": "nounId", "type": "uint256"}],
    "name": "seeds",
    "outputs": [
      {
        "components": [
          {"internalType": "uint48", "name": "background", "type": "uint48"},
          {"internalType": "uint48", "name": "body", "type": "uint48"},
          {"internalType": "uint48", "name": "accessory", "type": "uint48"},
          {"internalType": "uint48", "name": "head", "type": "uint48"},
          {"internalType": "uint48", "name": "glasses", "type": "uint48"}
        ],
        "internalType": "struct INounsSeeder.Seed",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "dataURI",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  
  // Delegation
  {
    "inputs": [{"internalType": "address", "name": "delegatee", "type": "address"}],
    "name": "delegate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "delegates",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "getCurrentVotes",
    "outputs": [{"internalType": "uint96", "name": "", "type": "uint96"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "account", "type": "address"},
      {"internalType": "uint256", "name": "blockNumber", "type": "uint256"}
    ],
    "name": "getPriorVotes",
    "outputs": [{"internalType": "uint96", "name": "", "type": "uint96"}],
    "stateMutability": "view",
    "type": "function"
  },
  
  // Events
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "from", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "to", "type": "address"},
      {"indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256"}
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "delegator", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "fromDelegate", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "toDelegate", "type": "address"}
    ],
    "name": "DelegateChanged",
    "type": "event"
  },
] as const;

