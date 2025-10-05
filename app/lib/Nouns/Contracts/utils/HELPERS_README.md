# Nouns DAO Contract Helpers

Comprehensive helper functions for interacting with all Nouns DAO smart contracts in NounsOS.

## Overview

This directory contains pure TypeScript helper functions organized by contract functionality. All helpers are designed to work seamlessly with **wagmi/viem** for Web3 interactions.

## Directory Structure

```
utils/
├── constants.ts              # Shared constants (Client ID, states, etc.)
├── types.ts                  # TypeScript types
├── formatting.ts             # Display formatting utilities
├── index.ts                  # Main export (use this!)
│
├── token/                    # Nouns Token helpers
│   ├── read.ts              # Reading token data
│   ├── write.ts             # Token transactions
│   └── index.ts
│
├── auction/                  # Auction House helpers
│   ├── read.ts              # Reading auction data
│   ├── write.ts             # Bidding transactions
│   └── index.ts
│
├── governance/               # DAO Governance helpers
│   ├── read.ts              # Reading proposals & votes
│   ├── write.ts             # Voting & proposing
│   └── index.ts
│
└── dataproxy/                # Candidates & Feedback helpers
    ├── read.ts              # Reading candidates/feedback
    ├── write.ts             # Creating candidates/feedback
    └── index.ts
```

## Quick Start

### Import Everything

```typescript
import {
  // Constants
  BERRY_OS_CLIENT_ID,
  VOTE_SUPPORT,
  PROPOSAL_STATES,
  CONTRACTS,
  
  // Helpers
  TokenHelpers,
  AuctionHelpers,
  GovernanceHelpers,
  DataProxyHelpers,
  
  // Formatting
  formatEth,
  formatAddress,
  formatTimeRemaining,
  
  // ABIs
  NounsTokenABI,
  NounsAuctionHouseABI,
  NounsDAOLogicV3ABI,
} from '@/app/lib/Nouns/Contracts/utils';
```

## Usage Examples

### 1. Token Operations

#### Reading Token Data

```typescript
import { TokenHelpers, formatVotes } from '@/app/lib/Nouns/Contracts/utils';
import { useReadContract } from 'wagmi';

function MyComponent({ address }: { address: Address }) {
  // Get balance
  const { data: balance } = useReadContract({
    address: TokenHelpers.CONTRACTS.NounsToken.address,
    abi: TokenHelpers.NounsTokenABI,
    functionName: 'balanceOf',
    args: [address],
  });
  
  // Check if user has Nouns
  const hasNouns = balance ? TokenHelpers.hasNouns(balance) : false;
  
  // Get voting power
  const { data: votes } = useReadContract({
    address: TokenHelpers.CONTRACTS.NounsToken.address,
    abi: TokenHelpers.NounsTokenABI,
    functionName: 'getCurrentVotes',
    args: [address],
  });
  
  // Check if user has voting power
  const canVote = votes ? TokenHelpers.hasVotingPower(votes) : false;
  
  return (
    <div>
      <p>Nouns owned: {balance?.toString()}</p>
      <p>Voting power: {votes ? formatVotes(votes) : 0}</p>
      <p>Can vote: {canVote ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

#### Delegating Voting Power

```typescript
import { TokenHelpers } from '@/app/lib/Nouns/Contracts/utils';
import { useWriteContract, useAccount } from 'wagmi';

function DelegateButton({ delegatee }: { delegatee: Address }) {
  const { address } = useAccount();
  const { writeContract } = useWriteContract();
  
  const handleDelegate = () => {
    if (!delegatee || !TokenHelpers.isValidDelegatee(delegatee)) {
      alert('Invalid delegate address');
      return;
    }
    
    const tx = TokenHelpers.prepareDelegateTransaction(delegatee);
    writeContract(tx);
  };
  
  // Delegate to self
  const handleDelegateToSelf = () => {
    if (!address) return;
    const tx = TokenHelpers.prepareDelegateToSelfTransaction(address);
    writeContract(tx);
  };
  
  return (
    <>
      <button onClick={handleDelegate}>Delegate</button>
      <button onClick={handleDelegateToSelf}>Delegate to Self</button>
    </>
  );
}
```

### 2. Auction Operations

#### Reading Auction State

```typescript
import { AuctionHelpers, formatEth, formatTimeRemaining } from '@/app/lib/Nouns/Contracts/utils';
import { useReadContract } from 'wagmi';

function AuctionDisplay() {
  // Get current auction
  const { data: auction } = useReadContract({
    address: AuctionHelpers.CONTRACTS.NounsAuctionHouse.proxy,
    abi: AuctionHelpers.NounsAuctionHouseABI,
    functionName: 'auction',
  });
  
  // Get reserve price
  const { data: reservePrice } = useReadContract({
    address: AuctionHelpers.CONTRACTS.NounsAuctionHouse.proxy,
    abi: AuctionHelpers.NounsAuctionHouseABI,
    functionName: 'reservePrice',
  });
  
  // Get min bid increment
  const { data: minBidIncrementPercentage } = useReadContract({
    address: AuctionHelpers.CONTRACTS.NounsAuctionHouse.proxy,
    abi: AuctionHelpers.NounsAuctionHouseABI,
    functionName: 'minBidIncrementPercentage',
  });
  
  if (!auction || !reservePrice || !minBidIncrementPercentage) {
    return <div>Loading...</div>;
  }
  
  // Format auction info
  const auctionInfo = AuctionHelpers.formatAuctionInfo(
    auction,
    Number(minBidIncrementPercentage),
    reservePrice
  );
  
  return (
    <div>
      <h2>Noun {auctionInfo.nounId.toString()}</h2>
      <p>Current bid: {formatEth(auctionInfo.amount)} ETH</p>
      <p>Min next bid: {formatEth(auctionInfo.minBidAmount)} ETH</p>
      <p>Time left: {formatTimeRemaining(auctionInfo.timeRemaining)}</p>
      <p>Active: {auctionInfo.isActive ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

#### Placing a Bid (with Berry OS Client ID)

```typescript
import { AuctionHelpers } from '@/app/lib/Nouns/Contracts/utils';
import { useWriteContract } from 'wagmi';
import { useState } from 'react';

function BidForm({ nounId, minBid }: { nounId: bigint; minBid: bigint }) {
  const [bidAmount, setBidAmount] = useState('');
  const { writeContract } = useWriteContract();
  
  const handleBid = () => {
    // Validate bid
    const error = AuctionHelpers.validateBidParams(nounId, bidAmount);
    if (error) {
      alert(error);
      return;
    }
    
    // Check if sufficient
    const bidWei = parseEther(bidAmount);
    if (!AuctionHelpers.isSufficientBid(bidWei, minBid)) {
      alert(`Bid must be at least ${formatEth(minBid)} ETH`);
      return;
    }
    
    // Prepare transaction (automatically uses BERRY_OS_CLIENT_ID = 11)
    const tx = AuctionHelpers.prepareCreateBidTransaction(nounId, bidAmount);
    writeContract(tx);
  };
  
  return (
    <form onSubmit={(e) => { e.preventDefault(); handleBid(); }}>
      <input
        type="text"
        value={bidAmount}
        onChange={(e) => setBidAmount(e.target.value)}
        placeholder="Bid amount in ETH"
      />
      <button type="submit">Place Bid</button>
    </form>
  );
}
```

### 3. Governance Operations

#### Reading Proposal Data

```typescript
import { GovernanceHelpers } from '@/app/lib/Nouns/Contracts/utils';
import { useReadContract } from 'wagmi';

function ProposalCard({ proposalId }: { proposalId: bigint }) {
  // Get proposal data
  const { data: proposalData } = useReadContract({
    address: GovernanceHelpers.CONTRACTS.NounsDAOProxy.proxy,
    abi: GovernanceHelpers.NounsDAOLogicV3ABI,
    functionName: 'proposalsV3',
    args: [proposalId],
  });
  
  // Get proposal state
  const { data: state } = useReadContract({
    address: GovernanceHelpers.CONTRACTS.NounsDAOProxy.proxy,
    abi: GovernanceHelpers.NounsDAOLogicV3ABI,
    functionName: 'state',
    args: [proposalId],
  });
  
  if (!proposalData || state === undefined) {
    return <div>Loading...</div>;
  }
  
  // Format proposal info
  const proposalInfo = GovernanceHelpers.formatProposalInfo(proposalData, state);
  
  return (
    <div>
      <h3>Proposal {proposalId.toString()}</h3>
      <p>State: {proposalInfo.stateName}</p>
      <p>For: {proposalInfo.votePercentages.for.toFixed(2)}%</p>
      <p>Against: {proposalInfo.votePercentages.against.toFixed(2)}%</p>
      <p>Abstain: {proposalInfo.votePercentages.abstain.toFixed(2)}%</p>
      <p>Quorum progress: {proposalInfo.quorumProgress.toFixed(2)}%</p>
      {proposalInfo.isActive && <p>✓ Voting is open</p>}
      {proposalInfo.hasSucceeded && <p>✓ Proposal succeeded</p>}
    </div>
  );
}
```

#### Voting on Proposals (with Berry OS Client ID)

```typescript
import { GovernanceHelpers, VOTE_SUPPORT } from '@/app/lib/Nouns/Contracts/utils';
import { useWriteContract } from 'wagmi';

function VoteButtons({ proposalId }: { proposalId: bigint }) {
  const { writeContract } = useWriteContract();
  
  const handleVoteFor = () => {
    const tx = GovernanceHelpers.prepareVoteForTransaction(
      proposalId,
      'I support this proposal because...'
    );
    writeContract(tx);
  };
  
  const handleVoteAgainst = () => {
    const tx = GovernanceHelpers.prepareVoteAgainstTransaction(
      proposalId,
      'I oppose this proposal because...'
    );
    writeContract(tx);
  };
  
  const handleAbstain = () => {
    const tx = GovernanceHelpers.prepareAbstainTransaction(proposalId);
    writeContract(tx);
  };
  
  return (
    <div>
      <button onClick={handleVoteFor}>Vote For</button>
      <button onClick={handleVoteAgainst}>Vote Against</button>
      <button onClick={handleAbstain}>Abstain</button>
    </div>
  );
}
```

#### Creating Proposals

```typescript
import { GovernanceHelpers } from '@/app/lib/Nouns/Contracts/utils';
import { useWriteContract } from 'wagmi';

function ProposeButton() {
  const { writeContract } = useWriteContract();
  
  const handlePropose = () => {
    // Example: Propose sending 10 ETH to an address
    const action = GovernanceHelpers.createProposalAction(
      '0x...' as Address, // Target address
      parseEther('10'),   // 10 ETH
      '',                 // No function call, just ETH transfer
      []                  // No params
    );
    
    // Validate
    const error = GovernanceHelpers.validateProposalActions(action);
    if (error) {
      alert(error);
      return;
    }
    
    // Prepare transaction
    const tx = GovernanceHelpers.prepareProposeTransaction(
      action,
      '# My Proposal\n\nThis proposal will...'
    );
    
    writeContract(tx);
  };
  
  return <button onClick={handlePropose}>Create Proposal</button>;
}
```

### 4. Data Proxy Operations

#### Creating Proposal Candidates

```typescript
import { DataProxyHelpers, GovernanceHelpers } from '@/app/lib/Nouns/Contracts/utils';
import { useWriteContract } from 'wagmi';

function CreateCandidateForm() {
  const { writeContract } = useWriteContract();
  
  const handleCreate = (title: string, description: string) => {
    // Generate slug from title
    const slug = DataProxyHelpers.generateSlug(title);
    
    // Create action
    const action = GovernanceHelpers.createProposalAction(
      '0x...' as Address,
      BigInt(0),
      'transfer(address,uint256)',
      ['0x...', BigInt(1000)]
    );
    
    // Validate
    const error = DataProxyHelpers.validateCandidateParams(slug, action, description);
    if (error) {
      alert(error);
      return;
    }
    
    // Prepare transaction
    const tx = DataProxyHelpers.prepareCreateCandidateTransaction(
      slug,
      action,
      description
    );
    
    writeContract(tx);
  };
  
  return <button onClick={() => handleCreate('My Idea', 'Description...')}>
    Create Candidate
  </button>;
}
```

#### Sending Feedback

```typescript
import { DataProxyHelpers, VOTE_SUPPORT } from '@/app/lib/Nouns/Contracts/utils';
import { useWriteContract } from 'wagmi';

function FeedbackForm({ proposalId }: { proposalId: bigint }) {
  const { writeContract } = useWriteContract();
  
  const handleFeedback = (support: number, reason: string) => {
    // Validate
    const error = DataProxyHelpers.validateFeedbackParams(support, reason);
    if (error) {
      alert(error);
      return;
    }
    
    // Prepare transaction
    const tx = DataProxyHelpers.prepareSendFeedbackTransaction(
      proposalId,
      support,
      reason
    );
    
    writeContract(tx);
  };
  
  return (
    <>
      <button onClick={() => handleFeedback(VOTE_SUPPORT.FOR, 'Great idea!')}>
        👍 Support
      </button>
      <button onClick={() => handleFeedback(VOTE_SUPPORT.AGAINST, 'Concerns...')}>
        👎 Oppose
      </button>
    </>
  );
}
```

## Key Constants

### Berry OS Client ID

```typescript
import { BERRY_OS_CLIENT_ID } from '@/app/lib/Nouns/Contracts/utils';

// Always use this when placing bids or voting
// It's automatically included in:
// - prepareCreateBidTransaction()
// - prepareVoteTransaction()
// Value: 11
```

### Vote Support

```typescript
import { VOTE_SUPPORT } from '@/app/lib/Nouns/Contracts/utils';

VOTE_SUPPORT.AGAINST  // 0
VOTE_SUPPORT.FOR      // 1
VOTE_SUPPORT.ABSTAIN  // 2
```

### Proposal States

```typescript
import { PROPOSAL_STATES } from '@/app/lib/Nouns/Contracts/utils';

PROPOSAL_STATES.PENDING
PROPOSAL_STATES.ACTIVE
PROPOSAL_STATES.CANCELED
PROPOSAL_STATES.DEFEATED
PROPOSAL_STATES.SUCCEEDED
PROPOSAL_STATES.QUEUED
PROPOSAL_STATES.EXPIRED
PROPOSAL_STATES.EXECUTED
PROPOSAL_STATES.VETOED
PROPOSAL_STATES.OBJECTION_PERIOD
PROPOSAL_STATES.UPDATABLE
```

## Formatting Utilities

```typescript
import {
  formatEth,           // Format wei to ETH
  formatAddress,       // Shorten address (0x1234...5678)
  formatTimeRemaining, // Format seconds (1d 5h 30m)
  formatVotes,         // Format vote count (1,234)
  formatPercentage,    // Calculate and format %
  formatDate,          // Unix timestamp to date
  formatDateTime,      // Unix timestamp to date + time
} from '@/app/lib/Nouns/Contracts/utils';
```

## Helper Organization

- **Read Helpers**: Pure functions for parsing and formatting contract data
- **Write Helpers**: Functions that return transaction configs for `useWriteContract`
- **Validation Helpers**: Functions for validating user input before transactions

## Type Safety

All helpers are fully typed with TypeScript. Import types as needed:

```typescript
import type {
  AuctionState,
  AuctionInfo,
  ProposalData,
  ProposalInfo,
  VotingPower,
  NounSeed,
  // ... etc
} from '@/app/lib/Nouns/Contracts/utils';
```

## Notes

1. **Client ID**: All bid and vote transactions automatically use `BERRY_OS_CLIENT_ID = 11`
2. **Gas Optimization**: Read helpers are pure functions (no gas cost)
3. **Error Handling**: Validation helpers return `string | null` for error messages
4. **wagmi Compatible**: All write helpers return configs for `useWriteContract`

## Next Steps

See the main `README.md` for information about:
- Custom React hooks (coming soon)
- Advanced features (batching, multicall, etc.)
- Integration examples with the System 7 Toolbox

