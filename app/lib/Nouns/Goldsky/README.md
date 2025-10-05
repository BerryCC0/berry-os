# Nouns DAO Goldsky Subgraph Integration

Complete integration with the **Nouns DAO subgraph** hosted on Goldsky for querying on-chain data.

## Overview

This directory contains everything needed to interact with the Nouns DAO subgraph:
- GraphQL queries
- TypeScript types matching the subgraph schema
- Business logic utilities for data manipulation
- Apollo Client configuration

## Endpoint

```
https://api.goldsky.com/api/public/project_cldf2o9pqagp43svvbk5u3kmo/subgraphs/nouns/prod/gn
```

## Quick Start

```typescript
import { 
  useQuery 
} from '@apollo/client';
import { 
  GET_CURRENT_AUCTION,
  GET_PROPOSALS,
  auction,
  proposal
} from '@/app/lib/Nouns/Goldsky';

function MyComponent() {
  const { data } = useQuery(GET_CURRENT_AUCTION);
  
  const currentAuction = data?.auctions[0];
  if (currentAuction) {
    console.log('Active:', auction.isActive(currentAuction));
    console.log('Time left:', auction.getTimeRemaining(currentAuction));
  }
}
```

## Directory Structure

```
Goldsky/
├── index.ts                    # Main export
├── apolloClient.ts             # Apollo Client instance (deprecated - use wrapper)
├── NounsApolloWrapper.tsx      # Client-side Apollo Provider
├── queries.ts                  # All GraphQL queries
├── README.md                   # This file
└── utils/                      # Business logic utilities
    ├── index.ts                # Utils export
    ├── types.ts                # TypeScript types
    ├── noun.ts                 # Noun utilities
    ├── auction.ts              # Auction utilities
    ├── proposal.ts             # Proposal utilities
    ├── vote.ts                 # Vote utilities
    ├── delegate.ts             # Delegate utilities
    └── account.ts              # Account utilities
```

## Available Queries

### Nouns
- `GET_NOUN` - Single noun by ID
- `GET_NOUNS` - Paginated nouns with filters
- `GET_NOUNS_BY_OWNER` - Nouns owned by address

### Auctions
- `GET_AUCTION` - Single auction with bids
- `GET_AUCTIONS` - Paginated auctions
- `GET_CURRENT_AUCTION` - Active auction
- `GET_AUCTION_BIDS` - Bids for an auction

### Proposals
- `GET_PROPOSAL` - Single proposal with votes
- `GET_PROPOSALS` - Paginated proposals
- `GET_ACTIVE_PROPOSALS` - Currently active proposals
- `GET_PROPOSALS_BY_PROPOSER` - Proposals by address

### Votes
- `GET_VOTE` - Single vote
- `GET_VOTES` - Paginated votes
- `GET_VOTES_BY_VOTER` - Votes by address
- `GET_VOTES_BY_PROPOSAL` - All votes on a proposal

### Delegates
- `GET_DELEGATE` - Single delegate with stats
- `GET_DELEGATES` - Paginated delegates
- `GET_TOP_DELEGATES` - Top delegates by voting power

### Accounts
- `GET_ACCOUNT` - Account with nouns and activity
- `GET_ACCOUNTS` - Paginated accounts

### Governance
- `GET_GOVERNANCE` - DAO governance parameters
- `GET_DYNAMIC_QUORUM_PARAMS` - Dynamic quorum config
- `GET_DAO_STATS` - DAO-wide statistics

### Governance V3 (Prop House)
- `GET_PROPOSAL_CANDIDATE` - Proposal candidate
- `GET_PROPOSAL_CANDIDATES` - All candidates
- `GET_PROPOSAL_FEEDBACK` - Feedback on proposals

### Events
- `GET_RECENT_ACTIVITY` - Recent bids, votes, proposals
- `GET_DELEGATION_EVENTS` - Delegation changes
- `GET_TRANSFER_EVENTS` - Noun transfers

## Utility Functions

Each entity has a dedicated utility module:

### noun.ts
```typescript
import { noun } from '@/app/lib/Nouns/Goldsky';

noun.isValidNoun(data);
noun.getNounIdAsNumber(nounData);
noun.isOwnedBy(nounData, address);
noun.getNounDisplayName(nounData);
```

### auction.ts
```typescript
import { auction } from '@/app/lib/Nouns/Goldsky';

auction.isActive(auctionData);
auction.hasEnded(auctionData);
auction.getTimeRemaining(auctionData);
auction.formatBidAmount(bidData);
```

### proposal.ts
```typescript
import { proposal } from '@/app/lib/Nouns/Goldsky';

proposal.isActive(proposalData);
proposal.isPassed(proposalData);
proposal.hasReachedQuorum(proposalData);
proposal.getTitle(proposalData);
```

### vote.ts
```typescript
import { vote } from '@/app/lib/Nouns/Goldsky';

vote.isFor(voteData);
vote.isAgainst(voteData);
vote.getSupportString(voteData);
vote.formatVotingPower(voteData);
```

### display.ts (New!)
```typescript
import { display } from '@/app/lib/Nouns/Goldsky';

// Ready-to-render data for Berry OS UI components
const auctionCard = display.auctionForCard(auctionData);
const auctionDetail = display.auctionForDetail(auctionData);
const proposalCard = display.proposalForCard(proposalData);
const nounCard = display.nounForCard(nounData);
```

## TypeScript Types

All subgraph entities are fully typed:

```typescript
import type { 
  Noun,
  Auction,
  Proposal,
  Vote,
  Delegate,
  Account 
} from '@/app/lib/Nouns/Goldsky';
```

## Reference

- **Official Subgraph**: [Nouns Monorepo](https://github.com/nounsDAO/nouns-monorepo/tree/master/packages/nouns-subgraph)
- **Goldsky Dashboard**: [Goldsky](https://goldsky.com)
- **Nouns DAO**: [nouns.wtf](https://nouns.wtf)

