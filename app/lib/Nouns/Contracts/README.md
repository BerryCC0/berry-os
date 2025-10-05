# Nouns DAO Smart Contracts Integration

Complete integration with the **Nouns DAO smart contracts** on Ethereum Mainnet for direct blockchain interactions.

## Overview

This directory contains:
- Contract addresses for all Nouns protocol contracts
- ABIs (Application Binary Interfaces) for contract interactions
- Helper utilities for read and write operations
- TypeScript types for type-safe contract interactions

## Directory Structure

```
Contracts/
├── index.ts                    # Main export
├── addresses.ts                # All contract addresses (13 contracts)
├── README.md                   # This file
├── TODO.md                     # Implementation status
├── abis/                       # Contract ABIs (13 ABIs)
│   ├── index.ts
│   ├── NounsToken.ts
│   ├── NounsAuctionHouse.ts
│   ├── NounsDAOLogicV3.ts
│   ├── TreasuryTimelock.ts
│   ├── DataProxy.ts
│   ├── NounsDescriptorV3.ts
│   ├── ClientRewards.ts
│   ├── TokenBuyer.ts
│   ├── Payer.ts
│   ├── StreamFactory.ts
│   ├── NounsTreasuryV1.ts
│   ├── ForkEscrow.ts
│   └── ForkDAODeployer.ts
└── utils/                      # Helper functions ✓ COMPLETE
    ├── index.ts                # Main export
    ├── constants.ts            # Shared constants (Client ID, states)
    ├── types.ts                # TypeScript types
    ├── formatting.ts           # Display formatting
    ├── HELPERS_README.md       # Detailed usage guide
    ├── token/                  # Token helpers
    │   ├── read.ts
    │   ├── write.ts
    │   └── index.ts
    ├── auction/                # Auction helpers
    │   ├── read.ts
    │   ├── write.ts
    │   └── index.ts
    ├── governance/             # Governance helpers
    │   ├── read.ts
    │   ├── write.ts
    │   └── index.ts
    └── dataproxy/              # Candidates & Feedback helpers
        ├── read.ts
        ├── write.ts
        └── index.ts
```

## Quick Start

**See `utils/HELPERS_README.md` for comprehensive usage examples!**

### Reading Contract Data

```typescript
import { useReadContract } from 'wagmi';
import { TokenHelpers, NounsTokenABI } from '@/app/lib/Nouns/Contracts/utils';

function MyComponent({ address }: { address: Address }) {
  // Get Noun balance
  const { data: balance } = useReadContract({
    address: TokenHelpers.CONTRACTS.NounsToken.address,
    abi: NounsTokenABI,
    functionName: 'balanceOf',
    args: [address],
  });
  
  // Check if user has Nouns
  const hasNouns = balance ? TokenHelpers.hasNouns(balance) : false;
  
  // Get voting power
  const { data: votes } = useReadContract({
    address: TokenHelpers.CONTRACTS.NounsToken.address,
    abi: NounsTokenABI,
    functionName: 'getCurrentVotes',
    args: [address],
  });
  
  return <div>Balance: {balance?.toString()}</div>;
}
```

### Writing Contract Data (with NounsOS Client ID = 11)

```typescript
import { useWriteContract } from 'wagmi';
import { TokenHelpers, AuctionHelpers } from '@/app/lib/Nouns/Contracts/utils';

function ActionButtons({ delegatee, nounId }: { delegatee: Address; nounId: bigint }) {
  const { writeContract } = useWriteContract();
  
  // Delegate voting power
  const handleDelegate = () => {
    const tx = TokenHelpers.prepareDelegateTransaction(delegatee);
    writeContract(tx);
  };
  
  // Place bid (automatically uses NOUNSOS_CLIENT_ID = 11)
  const handleBid = () => {
    const tx = AuctionHelpers.prepareCreateBidTransaction(nounId, '1.5');
    writeContract(tx);
  };
  
  return (
    <>
      <button onClick={handleDelegate}>Delegate</button>
      <button onClick={handleBid}>Bid 1.5 ETH</button>
    </>
  );
}
```

## Contract Addresses

### Core Protocol

| Contract | Address | Description |
|----------|---------|-------------|
| **Nouns Token** | `0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03` | ERC-721 NFTs with delegation |
| **Auction House** | `0x830BD73E4184ceF73443C15111a1DF14e495C706` | Daily auctions |

### Governance

| Contract | Address | Description |
|----------|---------|-------------|
| **DAO Governor** | `0x6f3E6272A167e8AcCb32072d08E0957F9c79223d` | Proposing & voting |
| **Data Proxy** | `0xf790A5f59678dd733fb3De93493A91f472ca1365` | Candidates & feedback |
| **Client Rewards** | `0x883860178F95d0C82413eDc1D6De530cB4771d55` | Proposal rewards |

### Treasury

| Contract | Address | Description |
|----------|---------|-------------|
| **Treasury** | `0xb1a32FC9F9D8b2cf86C068Cae13108809547ef71` | Main treasury (Executor) |
| **Treasury V1** | `0x0BC3807Ec262cB779b38D65b38158acC3bfedE10` | Legacy treasury |
| **Token Buyer** | `0x4f2acdc74f6941390d9b1804fabc3e780388cfe5` | ETH → USDC |
| **Payer** | `0xd97Bcd9f47cEe35c0a9ec1dc40C1269afc9E8E1D` | USDC payments |
| **Stream Factory** | `0x0fd206FC7A7dBcD5661157eDCb1FFDD0D02A61ff` | Payment streams |

### Art & Descriptor

| Contract | Address | Description |
|----------|---------|-------------|
| **Descriptor V3** | `0x33a9c445fb4fb21f2c030a6b2d3e2f12d017bfac` | Traits & artwork |

### Fork Mechanism

| Contract | Address | Description |
|----------|---------|-------------|
| **Fork Escrow** | `0x44d97D22B3d37d837cE4b22773aAd9d1566055D9` | Fork escrow |
| **Fork Deployer** | `0xcD65e61f70e0b1Aa433ca1d9A6FC2332e9e73cE3` | Deploy forks |

## Available Contracts

### Nouns Token

**Read Functions:**
- `balanceOf(address)` - Get Noun balance
- `ownerOf(tokenId)` - Get Noun owner
- `totalSupply()` - Total Nouns minted
- `seeds(tokenId)` - Get Noun traits
- `dataURI(tokenId)` - Get on-chain SVG
- `delegates(account)` - Get delegate
- `getCurrentVotes(account)` - Get voting power
- `getPriorVotes(account, block)` - Historical votes

**Write Functions:**
- `delegate(delegatee)` - Delegate votes
- `transferFrom(from, to, tokenId)` - Transfer Noun
- `approve(to, tokenId)` - Approve transfer

**Example:**
```typescript
import { token } from '@/app/lib/Nouns/Contracts';

// Read
const balanceConfig = token.balanceOf('0xAddress');
const ownerConfig = token.ownerOf(BigInt(1));
const seedConfig = token.seeds(BigInt(1));

// Write
const delegateConfig = token.delegate('0xDelegatee');
```

### Auction House

**Read Functions:**
- `auction()` - Current auction state
- `duration()` - Auction duration
- `reservePrice()` - Minimum bid
- `minBidIncrementPercentage()` - Min bid increase

**Write Functions:**
- `createBid(nounId)` - Place bid (with ETH value)
- `settleCurrentAndCreateNewAuction()` - Settle & start new
- `settleAuction()` - Settle current

**Example:**
```typescript
import { auctionHouse } from '@/app/lib/Nouns/Contracts';

// Read auction state
const auctionConfig = auctionHouse.auction();

// Helper functions
const isActive = auctionHouse.isAuctionActive(auctionData);
const timeLeft = auctionHouse.getTimeRemaining(auctionData);
const formatted = auctionHouse.formatTimeRemaining(timeLeft);

// Place bid
const bidConfig = auctionHouse.createBid(BigInt(123));
// Pass value separately: { ...bidConfig, value: parseEther('1.5') }
```

### Governance (DAO)

**Read Functions:**
- `state(proposalId)` - Proposal state
- `proposals(proposalId)` - Proposal data
- `proposalThreshold()` - Min votes to propose
- `quorumVotes()` - Quorum required
- `votingDelay()` - Delay before voting
- `votingPeriod()` - Voting duration

**Write Functions:**
- `propose(targets, values, signatures, calldatas, description)` - Create proposal
- `castVote(proposalId, support)` - Vote (0=Against, 1=For, 2=Abstain)
- `castVoteWithReason(proposalId, support, reason)` - Vote with reason
- `queue(proposalId)` - Queue succeeded proposal
- `execute(proposalId)` - Execute queued proposal
- `cancel(proposalId)` - Cancel proposal

**Example:**
```typescript
import { governance, VoteSupport } from '@/app/lib/Nouns/Contracts';

// Read proposal
const stateConfig = governance.state(BigInt(123));
const proposalConfig = governance.proposals(BigInt(123));

// Helper functions
const stateName = governance.getStateName(ProposalState.ACTIVE);
const percentages = governance.calculateVotePercentages(proposalData);
const quorumProgress = governance.calculateQuorumProgress(proposalData);

// Vote
const voteConfig = governance.castVoteWithReason(
  BigInt(123),
  VoteSupport.FOR,
  'This is important!'
);
```

## Helper Functions

### Contract Helpers

```typescript
import { 
  formatAddress,
  formatEth,
  parseEth,
  getEtherscanAddressLink,
  getEtherscanTxLink
} from '@/app/lib/Nouns/Contracts';

// Format addresses
formatAddress('0x1234...5678'); // '0x1234...5678'

// Format ETH
formatEth(BigInt('1500000000000000000')); // '1.5000'
parseEth('1.5'); // 1500000000000000000n

// Get Etherscan links
getEtherscanAddressLink('0x...');
getEtherscanTxLink('0x...');
```

### Token Helpers

```typescript
import { token } from '@/app/lib/Nouns/Contracts';

// Parse seed
const seed = token.parseSeed(seedTuple);

// Format
token.formatNounId(BigInt(1)); // 'Noun 1'
token.formatVotes(BigInt(5)); // '5'

// Check
token.hasNouns(balance);
token.isDelegatedToSelf(account, delegate);
```

### Auction Helpers

```typescript
import { auctionHouse } from '@/app/lib/Nouns/Contracts';

// State checks
auctionHouse.isAuctionActive(auction);
auctionHouse.hasAuctionEnded(auction);
auctionHouse.isAuctionSettled(auction);

// Time
const remaining = auctionHouse.getTimeRemaining(auction);
const formatted = auctionHouse.formatTimeRemaining(remaining);

// Bidding
const minBid = auctionHouse.calculateMinBid(current, percentage, reserve);
const isValid = auctionHouse.isValidBid(bid, current, percentage, reserve);
const error = auctionHouse.getBidError(bid, current, percentage, reserve);
```

### Governance Helpers

```typescript
import { governance } from '@/app/lib/Nouns/Contracts';

// State
governance.getStateName(state);
governance.getSupportName(support);
governance.isProposalActive(state);
governance.hasProposalPassed(proposal);

// Calculations
governance.calculateVotePercentages(proposal);
governance.calculateQuorumProgress(proposal);
governance.getBlocksUntilVoting(current, start);
governance.getBlocksRemaining(current, end);
governance.estimateTimeFromBlocks(blocks);

// Checks
governance.canPropose(votes, threshold);
```

## Integration with wagmi/viem

This package is designed to work seamlessly with [wagmi](https://wagmi.sh/) and [viem](https://viem.sh/):

```typescript
import { useReadContract, useWriteContract } from 'wagmi';
import { TOKEN_CONTRACT, token } from '@/app/lib/Nouns/Contracts';

function NounInfo({ tokenId }: { tokenId: bigint }) {
  // Read owner
  const { data: owner } = useReadContract({
    ...TOKEN_CONTRACT,
    ...token.ownerOf(tokenId),
  });
  
  // Read seed
  const { data: seedData } = useReadContract({
    ...TOKEN_CONTRACT,
    ...token.seeds(tokenId),
  });
  
  const seed = seedData ? token.parseSeed(seedData) : null;
  
  // Write function
  const { writeContract } = useWriteContract();
  
  const handleDelegate = (delegatee: string) => {
    writeContract({
      ...TOKEN_CONTRACT,
      ...token.delegate(delegatee as Address),
    });
  };
  
  return (
    <div>
      <h2>{token.formatNounId(tokenId)}</h2>
      <p>Owner: {owner ? formatAddress(owner) : 'Loading...'}</p>
      {seed && (
        <p>Traits: BG:{seed.background} Body:{seed.body}</p>
      )}
    </div>
  );
}
```

## Type Safety

All functions are fully typed for TypeScript safety:

```typescript
// ✅ Type-safe
const config = token.ownerOf(BigInt(1));

// ❌ TypeScript error
const config = token.ownerOf('1'); // Error: Expected bigint
```

## Constants

```typescript
import { 
  NOUNS_CHAIN_ID,
  NOUNS_DEPLOY_BLOCK 
} from '@/app/lib/Nouns/Contracts';

console.log(NOUNS_CHAIN_ID); // 1 (Mainnet)
console.log(NOUNS_DEPLOY_BLOCK); // 12985438
```

## Reference

- **Nouns DAO**: [nouns.wtf](https://nouns.wtf)
- **Etherscan**: [Contract addresses](https://nouns.wtf)
- **Nouns Monorepo**: [GitHub](https://github.com/nounsDAO/nouns-monorepo)
- **wagmi Docs**: [wagmi.sh](https://wagmi.sh/)
- **viem Docs**: [viem.sh](https://viem.sh/)

